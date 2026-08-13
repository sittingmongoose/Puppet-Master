"""Authored PM7 T20 Home Workspace source.

This file is the only authored source for the PMConcept7 Home Workspace layer.
The generated Concepts/PMConcept7.html artifact must be produced by
build_pm7.py and must never receive output-only edits.
"""

HOME_TRANSFORM_MARKER = "PM7 T20: Home workspace model-first transform"


HOME_SETTINGS_INSERT_BEFORE = '{"id":"general.startup.onboarding"'
HOME_SETTINGS_RECORD = (
    '{"id":"general.startup.reset-home-layout",'
    '"label":"Reset Home Layout",'
    '"desc":"Returns Home panels, docks, terminal placement, and floating bounds to the safe default without closing editor buffers, terminal sessions, Browser state, or chat history.",'
    '"type":"action","default":"Reset","value":"Reset",'
    '"scope":["project"],"tier":"simple",'
    '"search":["home layout","workspace layout","reset panels","recover docks"],'
    '"src":"FinalGUISpec"},'
)


HOME_MARKUP = r'''<!-- PM7 T20: Home workspace model-first hosts -->
<section id="pm-home-workspace" data-pm-home-model="PM_HOME_WORKSPACE" aria-label="Home workspace">
  <div id="pm-home-host-grid" class="pm-home-host-grid">
    <div class="pm-home-host pm-home-scrollport" data-pm-home-host="dock_top" data-pm-scroll-dissolve="four-edge" role="region" aria-label="Top dock"></div>
    <div class="pm-home-host pm-home-scrollport" data-pm-home-host="dock_left" data-pm-scroll-dissolve="four-edge" role="region" aria-label="Left dock"></div>
    <div class="pm-home-host pm-home-host-main pm-home-scrollport" data-pm-home-host="home_main" data-pm-scroll-dissolve="four-edge" role="region" aria-label="Home main"></div>
    <div class="pm-home-host pm-home-scrollport" data-pm-home-host="dock_right" data-pm-scroll-dissolve="four-edge" role="region" aria-label="Right dock"></div>
    <div class="pm-home-host pm-home-scrollport" data-pm-home-host="dock_bottom" data-pm-scroll-dissolve="four-edge" role="region" aria-label="Bottom dock"></div>
    <div class="pm-home-float-layer" data-pm-home-host="floating" role="region" aria-label="Home floating canvas"></div>
  </div>
  <p id="pm-home-live-region" class="pm-home-live-region" role="status" aria-live="polite"></p>
</section>

<div id="pm-home-more-menu" class="pm-home-portal pm-home-menu-portal" role="menu" aria-label="Home more options" data-portal-display="block" style="display:none">
  <button type="button" class="pm-home-menu-row" role="menuitem" aria-haspopup="menu" aria-expanded="false" data-pm-home-top-action="open-panel-menu" data-pm-home-submenu="pm-home-open-panel-flyout">
    <span>Open Panel</span><svg aria-hidden="true" viewBox="0 0 16 16"><path d="m6 3 5 5-5 5"/></svg>
  </button>
  <button type="button" class="pm-home-menu-row" role="menuitem" aria-haspopup="menu" aria-expanded="false" data-pm-home-top-action="open-browser-menu" data-pm-home-submenu="pm-home-open-browser-flyout">
    <span>Open Browser in Panel</span><svg aria-hidden="true" viewBox="0 0 16 16"><path d="m6 3 5 5-5 5"/></svg>
  </button>
  <div class="pm-home-menu-separator" role="separator"></div>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-top-action="collapse-terminal" data-pm-home-action="collapse-terminal">
    <span>Collapse Bottom Terminal</span>
  </button>
  <div class="pm-home-menu-separator" role="separator"></div>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-top-action="reset-layout" data-pm-home-action="reset-layout">
    <span>Reset Layout</span>
  </button>
</div>

<div id="pm-home-open-panel-flyout" class="pm-home-portal pm-home-flyout-portal" role="menu" aria-label="Open panel" data-portal-display="block" style="display:none">
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-panel" data-pm-home-surface-id="editor_panel_1">Panel 1</button>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-panel" data-pm-home-surface-id="editor_panel_2">Panel 2</button>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-panel" data-pm-home-surface-id="editor_panel_3">Panel 3</button>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-panel" data-pm-home-surface-id="editor_panel_4">Panel 4</button>
</div>

<div id="pm-home-open-browser-flyout" class="pm-home-portal pm-home-flyout-portal" role="menu" aria-label="Open Browser in panel" data-portal-display="block" style="display:none">
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-browser" data-pm-home-surface-id="editor_panel_1">Panel 1</button>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-browser" data-pm-home-surface-id="editor_panel_2">Panel 2</button>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-browser" data-pm-home-surface-id="editor_panel_3">Panel 3</button>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-browser" data-pm-home-surface-id="editor_panel_4">Panel 4</button>
</div>

<div id="pm-home-surface-menu" class="pm-home-portal pm-home-surface-menu" role="menu" aria-label="Surface options" data-portal-display="block" style="display:none"></div>
<div id="pm-home-file-panel-menu" class="pm-home-portal pm-home-flyout-portal" role="menu" aria-label="Open file in panel" data-portal-display="block" style="display:none">
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="file-open-panel" data-pm-home-file-panel="editor_panel_1" data-pm-home-surface-id="editor_panel_1">Panel 1</button>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="file-open-panel" data-pm-home-file-panel="editor_panel_2" data-pm-home-surface-id="editor_panel_2">Panel 2</button>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="file-open-panel" data-pm-home-file-panel="editor_panel_3" data-pm-home-surface-id="editor_panel_3">Panel 3</button>
  <button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="file-open-panel" data-pm-home-file-panel="editor_panel_4" data-pm-home-surface-id="editor_panel_4">Panel 4</button>
</div>'''


HOME_STYLE = r'''
/* PM7 T20: compact, model-owned Home workspace presentation. */
/* Tokens are declared at :root because the lifted drag clone is parented to
   <body>, outside #pm-home-workspace, so it cannot inherit from the root. */
:root {
  --pm-home-collapsed-h: 34px;
  --pm-home-gap: 4px;
  --pm-home-pickup-dur: 120ms;
  --pm-home-pickup-ease: cubic-bezier(.22, 1, .36, 1);
  --pm-home-drop-dur: 220ms;
  --pm-home-drop-ease: cubic-bezier(.2, 0, 0, 1);
  --pm-home-reflow-dur: 240ms;
  --pm-home-reflow-ease: cubic-bezier(.45, 0, .4, 1);
}
#panel-dashboard.pm-home-owned {
  position: relative;
  overflow: hidden;
  min-height: 0;
}
/* Home owns its own gutter (#pm-home-workspace pads by --pm-home-gap); the
   page shell's .primary-content padding would DOUBLE it, so the shell gutter
   is zeroed while the Home tab is the active panel -- and only then. */
.primary-content:has(> #panel-dashboard.pm-home-owned.active) { padding: 0; }
#pm-home-workspace {
  position: absolute;
  inset: 0;
  z-index: 2;
  min-width: 0;
  min-height: 0;
  padding: var(--pm-home-gap);
  box-sizing: border-box;
  color: var(--text-primary);
  font-family: var(--body-font);
}
.pm-home-host-grid {
  --pm-home-left-w: 0px;
  --pm-home-right-w: 0px;
  --pm-home-top-h: 0px;
  --pm-home-bottom-h: 0px;
  position: relative;
  display: grid;
  grid-template-columns: var(--pm-home-left-w) minmax(0, 1fr) var(--pm-home-right-w);
  grid-template-rows: var(--pm-home-top-h) minmax(0, 1fr) var(--pm-home-bottom-h);
  /* the RIGHT column (chat's default dock) spans all three rows so a docked
     chat runs the full workspace height; top/bottom docks span the remaining
     two columns */
  grid-template-areas:
    "top top right"
    "left main right"
    "bottom bottom right";
  /* no grid gap: an EMPTY dock has a 0px track, but grid `gap` would still
     hold a dead strip open beside it -- occupied docks carry their own margin
     toward main instead (see the :not(.pm-home-host-empty) rules below) */
  gap: 0;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
.pm-home-host {
  position: relative;
  display: flex;
  gap: var(--pm-home-gap);
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-color: var(--border-light) transparent;
}
.pm-home-host[data-pm-home-host="dock_top"] { grid-area: top; flex-direction: row; }
.pm-home-host[data-pm-home-host="dock_left"] { grid-area: left; flex-direction: column; }
/* home_main is a FLEX row, not a grid: .pm-home-surface sizes with
   `flex: 1 1 var(--pm-home-basis)`, and flex properties are ignored on grid
   items -- which is why resizing anything parked in home_main used to commit a
   layout revision while moving nothing on screen. */
.pm-home-host[data-pm-home-host="home_main"] {
  grid-area: main;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
}
.pm-home-host[data-pm-home-host="dock_right"] { grid-area: right; flex-direction: column; }
.pm-home-host[data-pm-home-host="dock_bottom"] { grid-area: bottom; flex-direction: row; }
.pm-home-host.pm-home-host-empty { overflow: hidden; pointer-events: none; }
/* The inter-track gap exists only where a dock actually holds (or is about to
   receive) a surface: each occupied or drop-previewed dock margins toward
   main. Empty docks collapse to a true 0px with no dead strip. */
.pm-home-host[data-pm-home-host="dock_top"]:not(.pm-home-host-empty),
.pm-home-host[data-pm-home-host="dock_top"].pm-home-drop-active { margin-bottom: var(--pm-home-gap); }
.pm-home-host[data-pm-home-host="dock_bottom"]:not(.pm-home-host-empty),
.pm-home-host[data-pm-home-host="dock_bottom"].pm-home-drop-active { margin-top: var(--pm-home-gap); }
.pm-home-host[data-pm-home-host="dock_left"]:not(.pm-home-host-empty),
.pm-home-host[data-pm-home-host="dock_left"].pm-home-drop-active { margin-right: var(--pm-home-gap); }
.pm-home-host[data-pm-home-host="dock_right"]:not(.pm-home-host-empty),
.pm-home-host[data-pm-home-host="dock_right"].pm-home-drop-active { margin-left: var(--pm-home-gap); }
.pm-home-float-layer {
  position: absolute;
  inset: 0;
  z-index: 14;
  pointer-events: none;
}
/* Hosts and the float canvas must be hit-testable WHILE a surface is held, or
   elementFromPoint can never resolve an empty dock or the floating canvas and
   the only reachable target is whatever happens to be under the pointer. */
body.pm-home-dragging .pm-home-host,
body.pm-home-dragging .pm-home-float-layer { pointer-events: auto; }
/* A claimed surface keeps its OWN PM6 layout. Only placement-level properties
   are asserted here; the former blanket !important wall (width/height/min-*/
   overflow) is what broke chat sizing, clipped every resizer grab strip, and
   cut the dashboard's container-query scroller. */
.pm-home-surface {
  --pm-home-basis: 360px;
  position: relative;
  inset: auto;
  box-sizing: border-box;
  display: flex;
  flex: 1 1 var(--pm-home-basis);
  margin: 0;
  overflow: visible;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--surface);
  box-shadow: none;
  isolation: isolate;
}
/* Cross-axis fill, scoped per host so it outranks PM6's own responsive
   `!important` width/height rules without clobbering their main-axis sizing. */
.pm-home-host[data-pm-home-host="home_main"] > .pm-home-surface,
.pm-home-host[data-pm-home-host="dock_top"] > .pm-home-surface,
.pm-home-host[data-pm-home-host="dock_bottom"] > .pm-home-surface {
  width: auto !important;
  max-width: none !important;
  height: 100% !important;
  max-height: none !important;
}
.pm-home-host[data-pm-home-host="dock_left"] > .pm-home-surface,
.pm-home-host[data-pm-home-host="dock_right"] > .pm-home-surface {
  width: 100% !important;
  max-width: none !important;
  height: auto !important;
  max-height: none !important;
}
/* Floors the surfaces genuinely need, restated at id specificity because the
   blanket min-width/min-height above is gone. */
#dashboardView.pm-home-surface { min-width: 280px; }
#chatPanel.pm-home-surface { min-width: 0; min-height: 300px; }
#editorPane1.pm-home-surface,
#editorPane2.pm-home-surface,
.pm-home-editor-shell.pm-home-surface { min-width: min(100%, 260px); min-height: 0; }
#bottomPanel.pm-home-surface { min-height: 0; }
.pm-home-surface[data-pm-home-visible="false"] { display: none !important; }
/* Collapse shrinks the surface along its HOST's main axis (a row host sizes by
   width, a column host by height); syncHostGeometry shrinks the dock track to
   match so the collapsed strip does not leave a hole. */
.pm-home-host[data-pm-home-host="dock_left"] > .pm-home-surface[data-pm-home-collapsed="true"],
.pm-home-host[data-pm-home-host="dock_right"] > .pm-home-surface[data-pm-home-collapsed="true"] {
  flex: 0 0 var(--pm-home-collapsed-h, 34px);
  min-height: 0 !important;
  height: var(--pm-home-collapsed-h, 34px) !important;
}
.pm-home-host[data-pm-home-host="home_main"] > .pm-home-surface[data-pm-home-collapsed="true"],
.pm-home-host[data-pm-home-host="dock_top"] > .pm-home-surface[data-pm-home-collapsed="true"],
.pm-home-host[data-pm-home-host="dock_bottom"] > .pm-home-surface[data-pm-home-collapsed="true"] {
  flex: 1 1 auto;
  min-height: 0 !important;
  height: var(--pm-home-collapsed-h, 34px) !important;
  align-self: flex-start;
}
/* The collapsed strip IS the expand affordance: the surface's own head row and
   the collapse arrow stay visible and hit-testable, everything below it hides.
   #bottomPanel already gets this from PM6's `.bottom-panel.collapsed` rules
   once the class is applied (see setSurfaceCollapsed); this covers the
   generated terminal/editor shells, which have no PM6 collapse contract. */
.pm-home-surface[data-pm-home-collapsed="true"] > .pm-home-terminal-body,
.pm-home-surface[data-pm-home-collapsed="true"] > .pm-home-terminal-empty-state,
.pm-home-surface[data-pm-home-collapsed="true"] > .editor-area,
.pm-home-surface[data-pm-home-collapsed="true"] > .pm-home-editor-empty {
  display: none !important;
}
.pm-home-surface[data-pm-home-collapsed="true"] { overflow: hidden; }
.pm-home-float-layer > .pm-home-surface {
  position: absolute !important;
  pointer-events: auto;
  box-shadow: var(--elev-3) !important;
  z-index: var(--pm-home-float-z, 1);
}
.pm-home-editor-shell { flex-direction: column; }
.pm-home-editor-shell .editor-tabs { flex: 0 0 auto; }
.pm-home-editor-shell .editor-area,
.pm-home-editor-shell .browser-tab-content { min-width: 0; min-height: 0; }
.pm-home-editor-shell .editor-code { overflow: auto; }
.pm-home-editor-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
}
.pm-home-browser-tab { cursor: pointer; }
.pm-home-browser-slot-note {
  color: var(--text-muted);
  font-size: 9px;
  margin-left: 4px;
}
.pm-home-terminal-shell {
  flex-direction: column;
  color: var(--text-secondary);
}
/* Generated terminal-shell chrome mirrors the BASE terminal strip: in the
   built base, .bottom-panel paints `background: var(--surface)` and the
   .bottom-tabs strip draws only `border-bottom: var(--border-width) solid
   var(--border)` with no background of its own -- restate exactly those
   tokens here at ~30px so a generated section reads as the same family. */
.pm-home-terminal-head {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  min-height: 30px;
  box-sizing: border-box;
  padding: 3px 7px;
  border-bottom: var(--border-width, 1px) solid var(--border);
  background: var(--surface);
  font-size: 10px;
}
.pm-home-terminal-head strong { color: var(--text-primary); }
.pm-home-terminal-head .pm-home-terminal-spacer { flex: 1; }
/* the workgroup handle reads as the same pill vocabulary as the base's
   center workgroup tabs */
.pm-home-terminal-head button[data-pm-home-workgroup-handle] {
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--surface-elevated);
  color: var(--text-primary);
  padding: 2px 10px;
  cursor: grab;
}
.pm-home-terminal-head button {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xs);
  background: var(--surface);
  color: var(--text-secondary);
  font: inherit;
  padding: 3px 6px;
  cursor: pointer;
}
.pm-home-terminal-head button:hover:not(:disabled) { color: var(--text-primary); border-color: var(--accent-blue); }
.pm-home-terminal-inline-controls { display: inline-flex; align-items: center; gap: 4px; }
/* Collapse chevron: inline SVG (never a glyph), pinned to the right of the
   terminal bar by PM6's own `.bottom-tabs .collapse-btn { margin-left: auto }`,
   and rotated 180deg once collapsed so the strip reads as "expand". */
.pm-home-collapse-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  transition: transform 160ms var(--ease-out), color 120ms var(--ease-out);
}
.pm-home-collapse-toggle svg { width: 14px; height: 14px; }
.pm-home-collapse-toggle[data-pm-home-collapsed="true"] { transform: rotate(180deg); }
.pm-home-collapse-toggle:hover { color: var(--text-primary); }
@media (prefers-reduced-motion: reduce) { .pm-home-collapse-toggle { transition: none; } }
[data-motion="reduced"] .pm-home-collapse-toggle { transition: none; }
.pm-home-terminal-empty-state {
  display: grid;
  place-items: center;
  min-height: 96px;
  padding: 14px;
  color: var(--text-muted);
  font: 600 10px/1.45 var(--body-font);
  text-align: center;
}
/* The base's bottom strip swaps tab panes as SIBLINGS inside
   #bottomTabsContent (.bottom-host-panel.active shows one at a time); the
   empty-section note must obey the same switch, so it only shows while the
   Terminal pane is the active tab -- never underneath Problems/Output. */
#bottomTabsContent > .pm-home-terminal-empty-state { display: none; }
#bottomTerminalHost.active ~ .pm-home-terminal-empty-state { display: block; }
/* contain: layout paint on #chatPanel clips descendant hit-testing to the
   rounded border box; at a 20px radius the top-right corner arc swallowed
   nearly the whole 18px grip triangle. Notch just that corner so the grip
   is clickable; the other three corners keep the chat radius. */
#chatPanel.pm-home-surface { border-top-right-radius: var(--radius-sm, 6px); }
/* the runtime host may have been REPARENTED into a generated section, in
   which case no sibling selector can match it here -- show the guidance
   whenever the terminal host is absent and no other bottom panel is active */
#bottomTabsContent:not(:has(#bottomTerminalHost)):not(:has(.bottom-host-panel.active)) > .pm-home-terminal-empty-state { display: block; }
#bottomPanel.pm-home-surface #pmBottomTermChrome { display: none !important; }
.pm-home-terminal-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 9px 11px;
  font-family: var(--mono-font);
  /* matches the base .terminal-pane type size */
  font-size: var(--terminal-font-size, 11px);
  line-height: 1.55;
}
.pm-home-terminal-empty { color: var(--text-muted); }
/* Lines-only grip in the surface's TOP-RIGHT corner. The clip-path
   participates in hit-testing, so only the upper-right triangle of the 18px
   box steals hits -- the lower-left half falls through to whatever sits
   beneath it. z-index 140 sits above the pinned actions cluster (130), chat's
   stacked header (25) and the surface kebab (26). */
.pm-home-surface-grip {
  position: absolute;
  top: 0;
  right: 0;
  left: auto;
  width: 18px;
  height: 18px;
  /* above the pinned actions cluster (130) and the resize handles (100): a
     dock's full-width ROW handle can span the surface's whole top edge
     including this corner. The triangle clip means only the upper-right half
     steals hits, so everything left of the hypotenuse passes through. */
  z-index: 140;
  display: block;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
  color: color-mix(in srgb, var(--text-secondary) 78%, transparent);
  cursor: grab;
  touch-action: none;
  transition: color 120ms var(--ease-out);
}
[data-theme^="glass"] .pm-home-surface-grip { color: color-mix(in srgb, var(--text-primary) 62%, transparent); }
.pm-home-surface-grip svg { display: block; width: 100%; height: 100%; pointer-events: none; }
.pm-home-surface-grip .pm-home-grip-groove { stroke: currentColor; opacity: 1; }
.pm-home-surface-grip .pm-home-grip-ring { stroke: var(--accent-primary); opacity: 0; }
.pm-home-surface-grip:hover,
.pm-home-surface-grip.pm-home-handle-active,
.pm-home-surface-grip[aria-grabbed="true"] { color: var(--accent-primary); }
/* the outline would be clipped away by clip-path; the focus ring is drawn
   in-glyph instead */
.pm-home-surface-grip:focus-visible { outline: none; color: var(--accent-primary); }
.pm-home-surface-grip:focus-visible .pm-home-grip-ring { opacity: 1; }
.pm-home-surface-grip:active { cursor: grabbing; }
/* clearance so pinned right-edge chrome does not sit under the grip's
   hypotenuse (the 18px triangle in the top-right corner) */
.pm-home-surface .editor-tabs .pane-tabbar-actions { right: 30px; }
.pm-home-surface .pm6-dash-actions { margin-right: 20px; }
.pm-home-surface .pm-home-terminal-head { padding-right: 26px; }
.pm-home-surface .bottom-tabs-right { padding-right: 22px; }
.pm-home-surface .chat-panel-header-stacked > :first-child { padding-right: 26px; }
/* Keyboard-move announcer (the menu Move/Dock rows are retired, so the grip is
   the only movement affordance and must carry a non-pointer path). */
.pm-home-live-region {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
.pm-home-surface-options,
.pm-home-titlebar-more {
  display: inline-grid !important;
  place-items: center;
  box-sizing: border-box;
  width: 28px;
  min-width: 28px;
  height: 28px;
  padding: 0 !important;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}
.pm-home-titlebar-more { width: 28px !important; min-width: 28px !important; max-width: 28px; flex: 0 0 28px; }
.pm-home-surface-options { position: relative; z-index: 26; width: 22px; min-width: 22px; height: 22px; padding: 0 !important; }
#chatPanel .chat-panel-header-stacked { position: relative; z-index: 25; }
.pm-home-surface-options:hover,
.pm-home-titlebar-more:hover,
.pm-home-surface-options[aria-expanded="true"],
.pm-home-titlebar-more[aria-expanded="true"] {
  color: var(--text-primary);
  border-color: var(--border-light);
  background: var(--surface-elevated);
}
.pm-home-surface-options svg,
.pm-home-titlebar-more svg { width: 14px; height: 14px; }
/* The handle sits on the boundary the drag actually moves, not always on the
   surface's own right/bottom edge -- pinning it to the outer window edge of a
   right dock made dragging outward GROW the dock. The surface is
   `overflow: visible`, so the 9px bar's negative margins and its grab-glow
   pseudo-elements are no longer sliced in half. */
.pm-home-resize-handle.resizer-col,
.pm-home-resize-handle.resizer-row {
  position: absolute;
  z-index: 100;
  flex: none;
  touch-action: none;
}
/* starts BELOW the head row: at top:5px the 9px column sat over the pinned
   actions cluster and swallowed clicks on the surface options button; 44px
   also clears the 18px top-right grip with margin to spare */
.pm-home-resize-handle.resizer-col { top: 44px; bottom: 5px; right: 0; height: auto; }
.pm-home-surface .pane-tabbar-actions,
.pm-home-surface .bottom-tabs-right,
.pm-home-surface-options { z-index: 130; }
.pm-home-resize-handle.resizer-row { left: 5px; right: 5px; bottom: 0; width: auto; }
.pm-home-host[data-pm-home-host="dock_right"] > .pm-home-surface > .pm-home-resize-handle.resizer-col {
  right: auto;
  left: 0;
}
.pm-home-host[data-pm-home-host="dock_bottom"] > .pm-home-surface > .pm-home-resize-handle.resizer-row {
  bottom: auto;
  top: 0;
}
.pm-home-surface[data-pm-home-collapsed="true"] > .pm-home-resize-handle { display: none; }
.pm-home-portal {
  position: fixed;
  z-index: 10080;
  box-sizing: border-box;
  padding: 5px 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
  box-shadow: var(--elev-3);
  color: var(--text-primary);
  font-family: var(--body-font);
  --pm6-sprout-ox: 88%;
  --pm6-sprout-oy: 0%;
  --pm6-sprout-tx: 0px;
  --pm6-sprout-ty: -10px;
  --pm6-sprout-sx: .72;
  --pm6-sprout-sy: .48;
  transform-origin: var(--pm6-sprout-ox) var(--pm6-sprout-oy);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate3d(var(--pm6-sprout-tx), var(--pm6-sprout-ty), 0) scale3d(var(--pm6-sprout-sx), var(--pm6-sprout-sy), 1);
  transition: opacity 140ms var(--ease-out), transform 260ms cubic-bezier(.22,1.3,.36,1), visibility 0s linear 260ms;
}
.pm-home-menu-portal,
.pm-home-surface-menu { width: 260px; max-height: min(420px, 70vh); overflow: auto; }
.pm-home-flyout-portal { width: 148px; }
.pm-home-portal.is-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate3d(0,0,0) scale3d(1,1,1);
  transition: opacity 130ms var(--ease-out), transform 260ms cubic-bezier(.22,1.3,.36,1), visibility 0s;
}
.pm-home-portal.is-closing {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.pm-home-menu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 32px;
  padding: 7px 11px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--text-secondary);
  font: 600 11px/1.3 var(--body-font);
  letter-spacing: .01em;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}
.pm-home-menu-row:hover,
.pm-home-menu-row:focus-visible,
.pm-home-menu-row[aria-expanded="true"] { background: var(--surface); color: var(--text-primary); outline: none; }
.pm-home-menu-row:disabled,
.pm-home-menu-row[aria-disabled="true"] { opacity: .45; cursor: not-allowed; }
.pm-home-menu-row svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.6; }
.pm-home-menu-separator { height: 1px; margin: 4px 0; background: var(--border-light); }
.pm-home-menu-danger { color: var(--accent-error); }
/* Direct-manipulation move (u11-prism vocabulary). The held surface is a fixed
   clone tracking the pointer 1:1; the slot it left becomes a real in-flow
   placeholder inside the target host, and every neighbour FLIPs to its new
   position. The old centre-screen "pick a dock" button rail is retired -- it
   sat on top of the canvas and swallowed the very hit-test that positional
   drops need. */
.pm-home-lifted {
  position: fixed;
  z-index: 10060;
  margin: 0;
  pointer-events: none;
  cursor: grabbing;
  transform-origin: top left;
  will-change: left, top, transform;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--surface);
  box-shadow: var(--elev-2);
  transition: transform var(--pm-home-pickup-dur) var(--pm-home-pickup-ease),
              box-shadow var(--pm-home-pickup-dur) var(--pm-home-pickup-ease);
}
.pm-home-lifted.is-lifted {
  transform: scale(1.02) rotate(.35deg);
  box-shadow: 0 20px 44px color-mix(in srgb, var(--accent-primary) 20%, transparent), var(--elev-3);
}
.pm-home-drop-placeholder {
  box-sizing: border-box;
  align-self: stretch;
  pointer-events: none;
  border: 1px dashed var(--accent-blue);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--accent-blue) 9%, transparent);
  animation: pmHomePhBreath 1.8s ease-in-out infinite;
}
.pm-home-drop-placeholder > * { display: none; }
@keyframes pmHomePhBreath {
  0%, 100% { background-color: color-mix(in srgb, var(--accent-blue) 6%, transparent); }
  50% { background-color: color-mix(in srgb, var(--accent-blue) 14%, transparent); }
}
/* keyboard float preview: give the float-layer placeholder real geometry (the
   old geometry-less rule collapsed to nothing, so pressing F previewed
   nothing at all) */
.pm-home-float-layer > .pm-home-drop-placeholder {
  position: absolute;
  left: 24px;
  bottom: 24px;
  width: min(420px, 60%);
  height: min(320px, 60%);
}
.pm-home-host.pm-home-drop-active { outline: 1px solid color-mix(in srgb, var(--accent-blue) 55%, transparent); outline-offset: -1px; }
/* floating-only corner handle: both-axis resize from the bottom-right */
.pm-home-resize-handle.resizer-corner {
  position: absolute;
  right: 0;
  bottom: 0;
  top: auto;
  left: auto;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  z-index: 101;
  background: transparent;
}
.pm-home-resize-handle.resizer-corner::after {
  content: '';
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--text-muted);
  border-bottom: 2px solid var(--text-muted);
  border-radius: 0 0 3px 0;
  opacity: .7;
}
/* pop-out sprout: corner-origin scale+fade consistent with the chat popout
   motion family; applied transiently by popOutPanel, so re-renders that
   merely reparent a float do not replay it */
.pm-home-surface.pm-home-float-enter {
  animation: pmHomeFloatIn 300ms var(--pm-home-pickup-ease);
  transform-origin: top left;
}
@keyframes pmHomeFloatIn {
  from { transform: scale(.9); opacity: 0; }
  to { transform: none; opacity: 1; }
}
/* reset plays a fast fade so the reload reads as a transition, not a crash */
body.pm-home-resetting { opacity: 0; transition: opacity 150ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .pm-home-surface.pm-home-float-enter { animation: none; }
  body.pm-home-resetting { transition: none; }
}
[data-motion="reduced"] .pm-home-surface.pm-home-float-enter { animation: none; }
#pm-home-workspace[data-pm-home-drop-disposition="invalid_target"] { cursor: no-drop; }
body.pm-home-dragging,
body.pm-home-dragging * { cursor: grabbing !important; }
body.pm-home-dragging { -webkit-user-select: none; user-select: none; }
@media (prefers-reduced-motion: reduce) {
  .pm-home-lifted { transition: none; }
  .pm-home-lifted.is-lifted { transform: none; }
  .pm-home-drop-placeholder { animation: none; background-color: color-mix(in srgb, var(--accent-blue) 10%, transparent); }
}
[data-motion="reduced"] .pm-home-lifted { transition: none; }
[data-motion="reduced"] .pm-home-lifted.is-lifted { transform: none; }
[data-motion="reduced"] .pm-home-drop-placeholder { animation: none; }
.pm-home-recovery-toast {
  position: fixed;
  right: 14px;
  bottom: 34px;
  z-index: 10100;
  max-width: 360px;
  padding: 8px 10px;
  border: 1px solid var(--accent-warning);
  border-radius: var(--radius-sm);
  background: var(--surface-elevated);
  box-shadow: var(--elev-3);
  color: var(--text-primary);
  font: 600 10px/1.45 var(--body-font);
}
@media (max-width: 1320px) {
  /* home_main is a flex row with `overflow: auto`; below this width the row
     stops shrinking surfaces past a readable floor and scrolls instead. */
  .pm-home-host[data-pm-home-host="home_main"] > .pm-home-surface {
    flex: 0 0 auto;
    min-width: min(76vw, 260px);
  }
}
@media (max-width: 1080px) {
  /* NOTE: this is a COMPLETE stacked template of its own -- the right dock
     deliberately re-joins the row flow here, so the desktop full-height
     right column above does not (and must not) apply at this width. */
  .pm-home-host-grid {
    grid-template-columns: min(var(--pm-home-left-w), 30vw) minmax(0, 1fr);
    grid-template-rows: var(--pm-home-top-h) minmax(0, 1fr) minmax(0, min(var(--pm-home-right-w), 220px)) var(--pm-home-bottom-h);
    grid-template-areas: "top top" "left main" "right right" "bottom bottom";
  }
  .pm-home-host[data-pm-home-host="dock_right"] { flex-direction: row; }
}
@media (max-width: 760px) {
  /* NOTE: complete stacked restatement, same deal as the 1080px template --
     every host becomes a full-width row; no full-height right column here. */
  .pm-home-host-grid { grid-template-columns: minmax(0,1fr); grid-template-rows: var(--pm-home-top-h) minmax(0, 180px) minmax(0,1fr) minmax(0, 180px) var(--pm-home-bottom-h); grid-template-areas: "top" "left" "main" "right" "bottom"; }
  .pm-home-host[data-pm-home-host="dock_left"],
  .pm-home-host[data-pm-home-host="dock_right"] { position: relative; inset: auto; width: auto; box-shadow: none; }
  .pm-home-host[data-pm-home-host="dock_left"],
  .pm-home-host[data-pm-home-host="dock_right"] { flex-direction: row; }
  .pm-home-host[data-pm-home-host="home_main"] > .pm-home-surface { flex: 0 0 auto; min-width: min(84vw, 250px); }
}
@media (prefers-reduced-motion: reduce) {
  .pm-home-portal { transition-duration: 0s !important; }
}
[data-motion="reduced"] .pm-home-portal { transition-duration: 0s !important; }
'''


HOME_SCRIPT = r'''
/* PM7 T20: Home workspace model-first controller. */
(function () {
  "use strict";
  if (window.PM_HOME_WORKSPACE) return;

  var HOSTS = ["home_main", "dock_left", "dock_right", "dock_top", "dock_bottom", "floating"];
  var EDITOR_IDS = ["editor_panel_1", "editor_panel_2", "editor_panel_3", "editor_panel_4"];
  /* mirrors --pm-home-collapsed-h in HOME_STYLE */
  var COLLAPSED_STRIP_PX = 34;
  var DRAG_EDGE_ZONE_PX = 56;
  /* border strip that resolves to a dock during a drag */
  var DRAG_DOCK_EDGE_PX = 28;
  /* Per-host caps on VISIBLE surfaces: a gesture cannot overfill a dock into
     uselessness. home_main is uncapped -- it is the spill/fallback host. */
  var HOST_CAPS = { dock_left: 3, dock_right: 3, dock_top: 2, dock_bottom: 2, floating: 4 };
  /* Single source for dock-track clamps, consumed by BOTH resizeBandFor and
     syncHostGeometry -- the two used to disagree, so a drag could commit a
     basis the track then silently re-clamped. */
  var HOST_BANDS = {
    dock_left: { min: 220, max: 520 },
    dock_right: { min: 220, max: 520 },
    dock_top: { min: 150, max: 380 },
    dock_bottom: { min: 150, max: 380 }
  };
  /* Nominal per-kind minimum main-axis sizes. The EFFECTIVE minimum degrades
     to the host's fair share under pressure (see effectiveMinPx), so a divider
     can always reach every boundary and a crowded row never wedges. */
  function nominalMinPx(surfaceId) {
    if (surfaceId === "chat") return 260;
    if (surfaceId === "dashboard") return 240;
    if (surfaceId.indexOf("terminal_section") === 0) return 150;
    return 220;
  }
  var PROJECT_ID = (document.body && document.body.getAttribute("data-project-id")) || "tastebook";
  var WORKSPACE_TAB_ID = (document.body && document.body.getAttribute("data-workspace-tab-id")) || "home";
  var STORAGE_KEY = "pm.homeWorkspaceLayout:v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID;
  var LEGACY_STORAGE_KEYS = [
    "home_workspace_layout.v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID,
    "home_workspace_layout:v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID,
    "pm.home_workspace_layout:v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID
  ];
  var QUARANTINE_PREFIX = "pm.homeWorkspaceLayout:quarantine:v1:" + PROJECT_ID + ":" + WORKSPACE_TAB_ID + ":";
  var root = null;
  var grid = null;
  var committed = null;
  var gesture = null;
  var focusSeq = 20;
  var surfaceRegistry = Object.create(null);
  var hostRegistries = Object.create(null);
  var commandLog = [];
  var eventLog = [];
  var receiptLog = [];
  var menuState = { main: null, flyout: null, invoker: null, hoverTimer: null, surfaceId: null };
  var faults = { failNextWrite: false };
  var metrics = {
    commandCount: 0,
    persistCount: 0,
    previewFrameCount: 0,
    cancelledGestureCount: 0,
    recoveredLayoutCount: 0,
    failedPersistenceCount: 0,
    lastCommandId: null,
    lastPersistenceKey: STORAGE_KEY,
    lastRecoveryReason: null
  };
  var editorOwners = {
    editor_panel_1: { editor_panel_id: "editor_panel_1", editor_group_id: "editor_group_1", worktree_id: "worktree:main", active_buffer_id: "buffer:src/main.rs", buffer_ids: ["buffer:src/main.rs", "buffer:src/routes/recipes.rs", "buffer:web/src/routes/+page.svelte", "buffer:Cargo.toml"], dirty_buffer_ids: ["buffer:src/routes/recipes.rs"] },
    editor_panel_2: { editor_panel_id: "editor_panel_2", editor_group_id: "editor_group_2", worktree_id: "worktree:main", active_buffer_id: "buffer:src/models/recipe.rs", buffer_ids: ["buffer:src/models/recipe.rs", "buffer:docker-compose.yml", "buffer:Dockerfile"], dirty_buffer_ids: [] },
    editor_panel_3: { editor_panel_id: "editor_panel_3", editor_group_id: "editor_group_3", worktree_id: "worktree:main", active_buffer_id: "buffer:README.md", buffer_ids: ["buffer:README.md"], dirty_buffer_ids: [] },
    editor_panel_4: { editor_panel_id: "editor_panel_4", editor_group_id: "editor_group_4", worktree_id: "worktree:main", active_buffer_id: "buffer:src/routes/auth.rs", buffer_ids: ["buffer:src/routes/auth.rs"], dirty_buffer_ids: [] }
  };
  var buffersByPath = {
    "src/main.rs": "buffer:src/main.rs",
    "src/routes/recipes.rs": "buffer:src/routes/recipes.rs",
    "web/src/routes/+page.svelte": "buffer:web/src/routes/+page.svelte",
    "Cargo.toml": "buffer:Cargo.toml",
    "src/models/recipe.rs": "buffer:src/models/recipe.rs",
    "docker-compose.yml": "buffer:docker-compose.yml",
    "Dockerfile": "buffer:Dockerfile",
    "README.md": "buffer:README.md",
    "src/routes/auth.rs": "buffer:src/routes/auth.rs"
  };
  var browserOwner = {
    browser_session_id: "br-sess-0472",
    session_class: "workspace_preview",
    target_editor_panel_id: null,
    target_panels: {},
    created_event_emitted: false
  };
  /* Pristine seed for terminal section 1. Kept as a top-level constant so
     defaultLayout can rebuild a WORKING terminal even after the live record
     has been blanked by a workgroup move (makeSurface reads this whenever no
     section anywhere still owns a workgroup). */
  var PRISTINE_TERMINAL_SECTION = {
    terminal_section_id: "terminal_section_1",
    terminal_workgroup_id: "terminal_workgroup_build",
    pane_ids: ["tp-a", "tp-b"],
    terminal_session_ids: ["ts-sess-alpha", "ts-sess-delta"]
  };
  var terminalSections = {
    "terminal_section:terminal_section_1": clone(PRISTINE_TERMINAL_SECTION)
  };
  var activeTerminalSectionId = "terminal_section:terminal_section_1";
  var terminalRuntimeHome = null;
  var terminalRuntimeSignature = null;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function reducedMotion() {
    if (document.documentElement.getAttribute("data-motion") === "reduced") return true;
    if (document.documentElement.getAttribute("data-reduced-motion") === "1") return true;
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  var HOST_LABELS = {
    home_main: "Main", dock_left: "Left dock", dock_right: "Right dock",
    dock_top: "Top dock", dock_bottom: "Bottom dock", floating: "Floating"
  };
  function hostLabel(host) { return HOST_LABELS[host] || host; }
  function surfaceLabel(surfaceId) {
    var index = EDITOR_IDS.indexOf(surfaceId);
    if (index !== -1) return "Panel " + (index + 1);
    if (surfaceId === "dashboard") return "Dashboard";
    if (surfaceId === "chat") return "Chat";
    if (String(surfaceId).indexOf("terminal_section:") === 0) return "Terminal section";
    return surfaceId;
  }
  function announce(message) {
    var region = document.getElementById("pm-home-live-region");
    if (region) region.textContent = message;
  }
  function now() { return new Date().toISOString(); }
  function csv(values) { return (values || []).join(","); }
  function splitCsv(value) { return value ? String(value).split(",").filter(Boolean) : []; }
  function uid(prefix) { return prefix + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8); }
  function versionParts(value) {
    var match = String(value || "").match(/^(\d+)\.(\d+)\.(\d+)$/);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
  }
  function isFutureVersion(value) {
    var parts = versionParts(value);
    if (!parts) return true;
    return parts[0] > 1 || (parts[0] === 1 && (parts[1] > 0 || (parts[1] === 0 && parts[2] > 0)));
  }

  function makeSurface(id, kind, host, slot, visible) {
    var ref = {};
    if (kind === "editor_panel") {
      var owner = editorOwners[id];
      ref.editor_panel_id = id;
      ref.editor_group_id = owner ? owner.editor_group_id : "editor_group_unknown";
      ref.worktree_id = owner ? owner.worktree_id : "worktree:unknown";
      ref.browser_session_id = null;
      ref.browser_active = false;
    }
    if (kind === "dashboard") ref.dashboard_surface_id = "dashboard";
    if (kind === "chat") ref.chat_surface_id = "chat";
    if (kind === "terminal_section") {
      var section = terminalSections[id] || null;
      /* Section 1 must never seed from a live-but-BLANKED record: if no
         section anywhere still owns a workgroup, fall back to the pristine
         literal so defaultLayout/reset always rebuilds a working terminal. */
      if (id === "terminal_section:terminal_section_1") {
        var anyLiveWorkgroup = Object.keys(terminalSections).some(function (key) {
          return Boolean(terminalSections[key] && terminalSections[key].terminal_workgroup_id);
        });
        if (!anyLiveWorkgroup) section = clone(PRISTINE_TERMINAL_SECTION);
      }
      ref.terminal_section_id = id.split(":")[1];
      ref.terminal_workgroup_id = section ? section.terminal_workgroup_id : null;
      ref.pane_ids = section ? csv(section.pane_ids) : "";
      ref.terminal_session_ids = section ? csv(section.terminal_session_ids) : "";
    }
    return {
      surface_instance_id: id,
      surface_kind: kind,
      domain_ref: ref,
      host: host,
      slot_index: slot,
      split_path: "root/" + slot,
      /* basis_px is the MAIN-axis size (width in a row host, dock-track width
         in a column dock); cross_basis_px is the row-dock TRACK size (height
         of dock_top/dock_bottom), driven by the full-width track handle. */
      size: { basis_px: kind === "terminal_section" ? 260 : 360, cross_basis_px: kind === "terminal_section" ? 260 : 360, flex_weight: 1, min_width_px: 220, min_height_px: 120 },
      visible: visible,
      collapsed: false,
      floating_bounds: null,
      last_docked_host: host === "floating" ? "home_main" : host,
      last_docked_slot_index: slot,
      last_focus_seq: slot + 1
    };
  }

  function defaultLayout() {
    return {
      schema_id: "pm.home_workspace_layout.v1",
      schema_version: "1.0.0",
      project_id: PROJECT_ID,
      workspace_tab_id: WORKSPACE_TAB_ID,
      layout_revision: 0,
      surfaces: [
        makeSurface("editor_panel_1", "editor_panel", "home_main", 0, true),
        makeSurface("editor_panel_2", "editor_panel", "home_main", 1, true),
        makeSurface("editor_panel_3", "editor_panel", "home_main", 3, false),
        makeSurface("editor_panel_4", "editor_panel", "home_main", 4, false),
        makeSurface("dashboard", "dashboard", "home_main", 2, true),
        makeSurface("chat", "chat", "dock_right", 0, false),
        makeSurface("terminal_section:terminal_section_1", "terminal_section", "dock_bottom", 0, true)
      ],
      saved_at_utc: now(),
      validation: {
        status: "valid",
        max_editor_panels: 4,
        max_terminal_sections: 4,
        max_visible_terminal_panes: 4,
        fallback_host: "home_main",
        safe_offscreen_fallback: true,
        last_validation_errors: []
      },
      migration: { from_schema_version: null, migrated_at_utc: now(), source_key: null, disposition: "current" }
    };
  }

  function surfaceById(layout, id) {
    if (!layout || !Array.isArray(layout.surfaces)) return null;
    for (var i = 0; i < layout.surfaces.length; i += 1) {
      if (layout.surfaces[i].surface_instance_id === id) return layout.surfaces[i];
    }
    return null;
  }

  function hostIsValid(host) { return HOSTS.indexOf(host) !== -1; }

  function sanitizedDomainRef(surface, fallback) {
    var ref = Object.assign({}, fallback || {}, surface && surface.domain_ref || {});
    if (surface.surface_kind === "editor_panel") {
      var owner = editorOwners[surface.surface_instance_id];
      return {
        editor_panel_id: surface.surface_instance_id,
        editor_group_id: owner ? owner.editor_group_id : ref.editor_group_id,
        worktree_id: ref.worktree_id || owner && owner.worktree_id || "worktree:unknown",
        browser_session_id: typeof ref.browser_session_id === "string" ? ref.browser_session_id : null,
        browser_active: Boolean(ref.browser_active)
      };
    }
    if (surface.surface_kind === "dashboard") return { dashboard_surface_id: "dashboard" };
    if (surface.surface_kind === "chat") return { chat_surface_id: "chat" };
    if (surface.surface_kind === "terminal_section") {
      return {
        terminal_section_id: ref.terminal_section_id || surface.surface_instance_id.split(":")[1],
        terminal_workgroup_id: typeof ref.terminal_workgroup_id === "string" ? ref.terminal_workgroup_id : null,
        pane_ids: typeof ref.pane_ids === "string" ? ref.pane_ids : "",
        terminal_session_ids: typeof ref.terminal_session_ids === "string" ? ref.terminal_session_ids : ""
      };
    }
    return ref;
  }

  function rootBounds() {
    var rect = root && root.getBoundingClientRect ? root.getBoundingClientRect() : null;
    return {
      width: Math.max(320, rect && rect.width || window.innerWidth || 1280),
      height: Math.max(220, rect && rect.height || window.innerHeight - 60 || 720)
    };
  }

  function clampBounds(bounds) {
    var viewport = rootBounds();
    var width = Math.max(240, Math.min(Number(bounds && bounds.width) || 420, viewport.width - 16));
    var height = Math.max(140, Math.min(Number(bounds && bounds.height) || 300, viewport.height - 16));
    var x = Number(bounds && bounds.x);
    var y = Number(bounds && bounds.y);
    if (!isFinite(x)) x = Math.max(8, Math.round((viewport.width - width) / 2));
    if (!isFinite(y)) y = Math.max(8, Math.round((viewport.height - height) / 2));
    x = Math.max(8, Math.min(x, Math.max(8, viewport.width - width - 8)));
    y = Math.max(8, Math.min(y, Math.max(8, viewport.height - height - 8)));
    return { x: x, y: y, width: width, height: height };
  }

  function intersects(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function tiledFloatBounds(layout, surfaceId, seed) {
    var size = clampBounds(seed || { width: 420, height: 300 });
    var viewport = rootBounds();
    var occupied = layout.surfaces.filter(function (surface) {
      return surface.surface_instance_id !== surfaceId && surface.visible && surface.host === "floating" && surface.floating_bounds;
    }).map(function (surface) { return clampBounds(surface.floating_bounds); });
    var candidates = [];
    var gap = 14;
    var columns = Math.max(1, Math.floor((viewport.width - 32 + gap) / (size.width + gap)));
    var rows = Math.max(1, Math.floor((viewport.height - 32 + gap) / (size.height + gap)));
    for (var row = 0; row < rows; row += 1) {
      for (var col = 0; col < columns; col += 1) candidates.push(clampBounds({ x: 16 + col * (size.width + gap), y: 16 + row * (size.height + gap), width: size.width, height: size.height }));
    }
    for (var i = 0; i < candidates.length; i += 1) {
      if (!occupied.some(function (other) { return intersects(candidates[i], other); })) return candidates[i];
    }
    var best = candidates[0] || size;
    var bestArea = Infinity;
    candidates.forEach(function (candidate) {
      var overlapArea = occupied.reduce(function (sum, other) {
        var width = Math.max(0, Math.min(candidate.x + candidate.width, other.x + other.width) - Math.max(candidate.x, other.x));
        var height = Math.max(0, Math.min(candidate.y + candidate.height, other.y + other.height) - Math.max(candidate.y, other.y));
        return sum + width * height;
      }, 0);
      if (overlapArea < bestArea) { bestArea = overlapArea; best = candidate; }
    });
    return best;
  }

  function normalizeSlots(layout) {
    HOSTS.forEach(function (host) {
      layout.surfaces.filter(function (surface) { return surface.host === host; }).sort(function (a, b) {
        return Number(Boolean(b.visible)) - Number(Boolean(a.visible)) || (Number(a.slot_index) || 0) - (Number(b.slot_index) || 0) || a.surface_instance_id.localeCompare(b.surface_instance_id);
      }).forEach(function (surface, index) {
        surface.slot_index = index;
        surface.split_path = "root/" + index;
        if (surface.visible && host !== "floating") {
          surface.last_docked_host = host;
          surface.last_docked_slot_index = index;
        }
      });
    });
    return layout;
  }

  function restoreOwnerRefs(layout) {
    terminalSections = {};
    browserOwner.target_panels = {};
    browserOwner.target_editor_panel_id = null;
    layout.surfaces.forEach(function (surface) {
      if (surface.surface_kind === "editor_panel" && editorOwners[surface.surface_instance_id]) {
        var owner = editorOwners[surface.surface_instance_id];
        surface.domain_ref = surface.domain_ref || {};
        surface.domain_ref.editor_panel_id = surface.surface_instance_id;
        surface.domain_ref.editor_group_id = owner.editor_group_id;
        surface.domain_ref.worktree_id = surface.domain_ref.worktree_id || owner.worktree_id;
        owner.worktree_id = surface.domain_ref.worktree_id;
        if (surface.domain_ref.browser_session_id) {
          browserOwner.target_panels[surface.surface_instance_id] = surface.domain_ref.browser_session_id;
          browserOwner.created_event_emitted = true;
          if (surface.domain_ref.browser_active) browserOwner.target_editor_panel_id = surface.surface_instance_id;
        }
      }
      if (surface.surface_kind === "terminal_section") {
        var ref = surface.domain_ref || {};
        var panes = splitCsv(ref.pane_ids);
        var sessions = splitCsv(ref.terminal_session_ids);
        if (ref.terminal_workgroup_id && !panes.length) return "terminal_workgroup_empty";
        terminalSections[surface.surface_instance_id] = {
          terminal_section_id: ref.terminal_section_id || surface.surface_instance_id.split(":")[1],
          terminal_workgroup_id: ref.terminal_workgroup_id || null,
          pane_ids: panes,
          terminal_session_ids: sessions
        };
      }
    });
    var active = layout.surfaces.filter(function (surface) {
      return surface.surface_kind === "terminal_section" && terminalSections[surface.surface_instance_id] && terminalSections[surface.surface_instance_id].terminal_workgroup_id;
    }).sort(function (a, b) { return (b.last_focus_seq || 0) - (a.last_focus_seq || 0); })[0];
    activeTerminalSectionId = active ? active.surface_instance_id : "terminal_section:terminal_section_1";
  }

  function normalizeLayout(candidate, recoveryReason) {
    var base = defaultLayout();
    if (!candidate || typeof candidate !== "object") {
      if (recoveryReason) {
        base.validation.status = "recovered_defaults";
        base.validation.last_validation_errors = [recoveryReason];
        base.migration.disposition = recoveryReason === "corrupt_json" ? "defaults_after_corruption" : "safe_offscreen_recovery";
      }
      return base;
    }
    var out = clone(candidate);
    var warnings = [];
    out.schema_id = "pm.home_workspace_layout.v1";
    out.schema_version = "1.0.0";
    out.project_id = PROJECT_ID;
    out.workspace_tab_id = WORKSPACE_TAB_ID;
    out.layout_revision = Math.max(0, Number(out.layout_revision) || 0);
    out.surfaces = Array.isArray(out.surfaces) ? out.surfaces : [];
    var seen = Object.create(null);
    out.surfaces = out.surfaces.filter(function (surface) {
      if (!surface || typeof surface.surface_instance_id !== "string") return false;
      if (seen[surface.surface_instance_id]) { warnings.push("duplicate_surface_identity:" + surface.surface_instance_id); return false; }
      seen[surface.surface_instance_id] = true;
      return true;
    }).map(function (surface) {
      var original = surfaceById(base, surface.surface_instance_id);
      var next = Object.assign({}, original || makeSurface(surface.surface_instance_id, surface.surface_kind || "editor_panel", "home_main", 0, false), surface);
      next.domain_ref = sanitizedDomainRef(next, original && original.domain_ref || {});
      next.host = hostIsValid(next.host) ? next.host : "home_main";
      next.last_docked_host = hostIsValid(next.last_docked_host) && next.last_docked_host !== "floating" ? next.last_docked_host : "home_main";
      next.slot_index = Math.max(0, Number(next.slot_index) || 0);
      next.last_docked_slot_index = Math.max(0, Number(next.last_docked_slot_index) || 0);
      next.last_focus_seq = Math.max(0, Number(next.last_focus_seq) || 0);
      next.visible = Boolean(next.visible);
      next.collapsed = Boolean(next.collapsed);
      next.size = Object.assign({ basis_px: 360, flex_weight: 1, min_width_px: 220, min_height_px: 120 }, next.size || {});
      /* migration: layouts persisted before cross_basis_px existed inherit
         their main-axis basis as the row-dock track size */
      next.size.cross_basis_px = Number(next.size.cross_basis_px) || Number(next.size.basis_px) || 360;
      if (next.host === "floating") {
        var raw = next.floating_bounds;
        var clamped = clampBounds(raw);
        var valid = raw && isFinite(Number(raw.x)) && isFinite(Number(raw.y)) && isFinite(Number(raw.width)) && isFinite(Number(raw.height)) && Number(raw.width) > 0 && Number(raw.height) > 0;
        var changed = !valid || Number(raw.x) !== clamped.x || Number(raw.y) !== clamped.y || Number(raw.width) !== clamped.width || Number(raw.height) !== clamped.height;
        if (changed) {
          next.host = next.last_docked_host || "home_main";
          next.floating_bounds = null;
          warnings.push("offscreen_floating_fallback:" + next.surface_instance_id);
        } else next.floating_bounds = clamped;
      }
      return next;
    });
    EDITOR_IDS.forEach(function (id, index) {
      if (!surfaceById(out, id)) out.surfaces.push(makeSurface(id, "editor_panel", "home_main", index, index < 2));
    });
    if (!surfaceById(out, "dashboard")) out.surfaces.push(makeSurface("dashboard", "dashboard", "home_main", 4, true));
    if (!surfaceById(out, "chat")) out.surfaces.push(makeSurface("chat", "chat", "dock_right", 0, false));
    var terminals = out.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section"; });
    if (!terminals.length) out.surfaces.push(makeSurface("terminal_section:terminal_section_1", "terminal_section", "dock_bottom", 0, true));
    terminals = out.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section"; });
    if (terminals.length > 4) {
      var allowed = terminals.slice(0, 4).map(function (surface) { return surface.surface_instance_id; });
      out.surfaces = out.surfaces.filter(function (surface) { return surface.surface_kind !== "terminal_section" || allowed.indexOf(surface.surface_instance_id) !== -1; });
      warnings.push("terminal_section_limit");
    }
    /* Host caps hold on EVERY path (API moves, migrated layouts), not just
       pointer gestures: overflow beyond a cap SPILLS to home_main (the
       uncapped fallback host) with a warning -- old layouts recover, never
       quarantine. Slot order decides who stays. */
    Object.keys(HOST_CAPS).forEach(function (cappedHost) {
      var kept = 0;
      out.surfaces.slice().sort(function (a, b) { return a.slot_index - b.slot_index; }).forEach(function (surface) {
        if (surface.host !== cappedHost || !surface.visible) return;
        kept += 1;
        if (kept > HOST_CAPS[cappedHost]) {
          surface.host = "home_main";
          surface.slot_index = 999;
          warnings.push("host_capacity_spill:" + surface.surface_instance_id);
        }
      });
    });
    out = normalizeSlots(out);
    out.saved_at_utc = out.saved_at_utc || now();
    var errors = recoveryReason ? [recoveryReason] : [];
    warnings.forEach(function (warning) { if (errors.indexOf(warning) === -1) errors.push(warning); });
    out.validation = {
      status: errors.length ? "recovered_defaults" : "valid",
      max_editor_panels: 4,
      max_terminal_sections: 4,
      max_visible_terminal_panes: 4,
      fallback_host: "home_main",
      safe_offscreen_fallback: true,
      last_validation_errors: errors
    };
    out.migration = Object.assign({ from_schema_version: null, migrated_at_utc: now(), source_key: null, disposition: warnings.length ? "safe_offscreen_recovery" : "current" }, out.migration || {});
    if (warnings.length && !recoveryReason) out.migration.disposition = "safe_offscreen_recovery";
    return out;
  }

  function validateLayout(layout) {
    if (!layout || layout.schema_id !== "pm.home_workspace_layout.v1" || layout.schema_version !== "1.0.0") return "schema_mismatch";
    if (layout.project_id !== PROJECT_ID || layout.workspace_tab_id !== WORKSPACE_TAB_ID) return "scope_mismatch";
    if (!Array.isArray(layout.surfaces)) return "surfaces_missing";
    var seen = Object.create(null);
    var visibleSlots = Object.create(null);
    var editorIds = [];
    var terminalCount = 0;
    var dashboardCount = 0;
    var chatCount = 0;
    var paneIds = Object.create(null);
    var sessionIds = Object.create(null);
    var totalPanes = 0;
    for (var i = 0; i < layout.surfaces.length; i += 1) {
      var surface = layout.surfaces[i];
      if (!surface || !surface.surface_instance_id || seen[surface.surface_instance_id]) return "duplicate_surface_identity";
      seen[surface.surface_instance_id] = true;
      if (!hostIsValid(surface.host)) return "invalid_host";
      if (!isFinite(Number(surface.slot_index)) || Number(surface.slot_index) < 0) return "invalid_slot";
      if (surface.visible) {
        var slotKey = surface.host + ":" + Number(surface.slot_index);
        if (visibleSlots[slotKey]) return "duplicate_visible_slot";
        visibleSlots[slotKey] = true;
      }
      if (surface.surface_kind === "editor_panel") {
        if (EDITOR_IDS.indexOf(surface.surface_instance_id) === -1) return "editor_panel_identity_set";
        editorIds.push(surface.surface_instance_id);
        if (!surface.domain_ref || surface.domain_ref.editor_panel_id !== surface.surface_instance_id || !surface.domain_ref.editor_group_id || !surface.domain_ref.worktree_id) return "editor_owner_ref_invalid";
      } else if (surface.surface_kind === "terminal_section") {
        terminalCount += 1;
        if (surface.surface_instance_id.indexOf("terminal_section:") !== 0) return "terminal_section_identity_invalid";
        var ref = surface.domain_ref || {};
        var panes = splitCsv(ref.pane_ids);
        var sessions = splitCsv(ref.terminal_session_ids);
        if (panes.length !== sessions.length) return "terminal_pane_session_mismatch";
        for (var p = 0; p < panes.length; p += 1) {
          if (paneIds[panes[p]]) return "duplicate_terminal_pane_identity";
          if (sessionIds[sessions[p]]) return "duplicate_terminal_session_identity";
          paneIds[panes[p]] = true;
          sessionIds[sessions[p]] = true;
        }
        totalPanes += panes.length;
      } else if (surface.surface_kind === "dashboard") {
        if (surface.surface_instance_id !== "dashboard") return "dashboard_identity_invalid";
        dashboardCount += 1;
      } else if (surface.surface_kind === "chat") {
        if (surface.surface_instance_id !== "chat") return "chat_identity_invalid";
        chatCount += 1;
      } else return "unknown_surface_kind";
      if (surface.host === "floating" && surface.floating_bounds) {
        var clamped = clampBounds(surface.floating_bounds);
        if (clamped.x !== Number(surface.floating_bounds.x) || clamped.y !== Number(surface.floating_bounds.y) || clamped.width !== Number(surface.floating_bounds.width) || clamped.height !== Number(surface.floating_bounds.height)) return "offscreen_or_invalid_bounds";
      }
    }
    editorIds.sort();
    if (JSON.stringify(editorIds) !== JSON.stringify(EDITOR_IDS.slice().sort())) return "editor_panel_identity_set";
    if (dashboardCount !== 1) return "dashboard_identity_set";
    if (chatCount !== 1) return "chat_identity_set";
    if (terminalCount > 4) return "terminal_section_limit";
    if (totalPanes > 4) return "terminal_pane_limit";
    return null;
  }

  function writeAndVerify(layout) {
    var encoded = JSON.stringify(layout);
    var priorRaw = null;
    var hadPrior = false;
    try {
      priorRaw = window.localStorage.getItem(STORAGE_KEY);
      hadPrior = priorRaw !== null;
      if (faults.failNextWrite) { faults.failNextWrite = false; throw new Error("injected_write_failure"); }
      window.localStorage.setItem(STORAGE_KEY, encoded);
      var readback = window.localStorage.getItem(STORAGE_KEY);
      if (readback !== encoded) throw new Error("readback_mismatch");
      metrics.persistCount += 1;
      metrics.lastPersistenceKey = STORAGE_KEY;
      return { ok: true };
    } catch (error) {
      try {
        if (hadPrior) window.localStorage.setItem(STORAGE_KEY, priorRaw);
        else window.localStorage.removeItem(STORAGE_KEY);
      } catch (rollbackError) {}
      metrics.failedPersistenceCount += 1;
      metrics.lastRecoveryReason = "local_storage_write_failed";
      return { ok: false, reason: "local_storage_write_failed", error: String(error && error.message || error) };
    }
  }

  function quarantine(raw, reason) {
    if (raw == null) return null;
    var key = QUARANTINE_PREFIX + Date.now();
    try { window.localStorage.setItem(key, JSON.stringify({ reason: reason, captured_at_utc: now(), raw: raw })); return key; }
    catch (error) { return null; }
  }

  function recoveryToast(reason) {
    var prior = document.getElementById("pm-home-recovery-toast");
    if (prior) prior.remove();
    var toast = document.createElement("div");
    toast.id = "pm-home-recovery-toast";
    toast.className = "pm-home-recovery-toast";
    toast.setAttribute("role", "status");
    toast.textContent = "Home layout recovered safely: " + reason.replace(/_/g, " ") + ".";
    document.body.appendChild(toast);
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 5200);
  }

  function readLayout() {
    var raw = null;
    var sourceKey = STORAGE_KEY;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (var legacyIndex = 0; legacyIndex < LEGACY_STORAGE_KEYS.length; legacyIndex += 1) {
          var legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEYS[legacyIndex]);
          if (legacyRaw) { raw = legacyRaw; sourceKey = LEGACY_STORAGE_KEYS[legacyIndex]; break; }
        }
      }
    } catch (error) { raw = null; }
    if (!raw) return defaultLayout();
    try {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.schema_version && isFutureVersion(parsed.schema_version)) {
        quarantine(raw, "future_schema_version");
        metrics.recoveredLayoutCount += 1;
        metrics.lastRecoveryReason = "future_schema_version";
        var futureRecovered = normalizeLayout(null, "future_schema_version");
        futureRecovered.migration.source_key = sourceKey;
        var futureWrite = writeAndVerify(futureRecovered);
        receipt("storage.recovery", futureWrite.ok ? "applied" : "failed", { reason: futureWrite.ok ? "future_schema_version" : futureWrite.reason, source_key: sourceKey, persisted: futureWrite.ok });
        setTimeout(function () { recoveryToast("future_schema_version"); }, 0);
        return futureRecovered;
      }
      if (parsed && parsed.schema_version && parsed.schema_version !== "1.0.0" && Array.isArray(parsed.surfaces)) {
        var migrated = normalizeLayout(parsed, null);
        migrated.migration = { from_schema_version: String(parsed.schema_version), migrated_at_utc: now(), source_key: sourceKey, disposition: "copy_forward" };
        migrated.validation.status = "migrated";
        migrated.validation.last_validation_errors = [];
        var migrationWrite = writeAndVerify(migrated);
        receipt("storage.migration", migrationWrite.ok ? "applied" : "failed", { reason: migrationWrite.ok ? "copy_forward" : migrationWrite.reason, source_key: sourceKey, persisted: migrationWrite.ok });
        if (migrationWrite.ok && sourceKey !== STORAGE_KEY) try { window.localStorage.removeItem(sourceKey); } catch (ignored) {}
        return migrated;
      }
      var errorCode = validateLayout(parsed);
      var normalized = errorCode ? normalizeLayout(parsed, errorCode) : normalizeLayout(parsed, null);
      if (sourceKey !== STORAGE_KEY && !errorCode) {
        normalized.migration = { from_schema_version: String(parsed.schema_version || "1.0.0"), migrated_at_utc: now(), source_key: sourceKey, disposition: "copy_forward" };
        normalized.validation.status = "migrated";
        var legacyWrite = writeAndVerify(normalized);
        receipt("storage.migration", legacyWrite.ok ? "applied" : "failed", { reason: legacyWrite.ok ? "copy_forward" : legacyWrite.reason, source_key: sourceKey, persisted: legacyWrite.ok });
        if (legacyWrite.ok) try { window.localStorage.removeItem(sourceKey); } catch (ignoredLegacy) {}
        return normalized;
      }
      if (errorCode || normalized.validation.last_validation_errors.length) {
        var reason = errorCode || normalized.validation.last_validation_errors[0];
        quarantine(raw, reason);
        metrics.recoveredLayoutCount += 1;
        metrics.lastRecoveryReason = reason;
        var recoveryWrite = writeAndVerify(normalized);
        receipt("storage.recovery", recoveryWrite.ok ? "applied" : "failed", { reason: reason, source_key: sourceKey, persisted: recoveryWrite.ok });
        setTimeout(function () { recoveryToast(reason); }, 0);
      }
      return normalized;
    } catch (error) {
      quarantine(raw, "corrupt_json");
      metrics.recoveredLayoutCount += 1;
      metrics.lastRecoveryReason = "corrupt_json";
      var recovered = normalizeLayout(null, "corrupt_json");
      var corruptWrite = writeAndVerify(recovered);
      receipt("storage.recovery", corruptWrite.ok ? "applied" : "failed", { reason: "corrupt_json", source_key: sourceKey, persisted: corruptWrite.ok });
      setTimeout(function () { recoveryToast("corrupt_json"); }, 0);
      return recovered;
    }
  }

  function command(commandId, payload) {
    var record = Object.assign({
      command_id: commandId,
      project_id: PROJECT_ID,
      workspace_tab_id: WORKSPACE_TAB_ID,
      origin: "home_workspace",
      correlation_id: uid("pm-home"),
      idempotency_key: uid("pm-home-idem"),
      expected_layout_revision: committed ? committed.layout_revision : 0,
      dispatched_at_utc: now()
    }, payload || {});
    commandLog.push(record);
    metrics.commandCount += 1;
    metrics.lastCommandId = commandId;
    try { window.dispatchEvent(new CustomEvent("pm:command-dispatch", { detail: clone(record) })); } catch (error) {}
    return record;
  }

  function receipt(commandId, outcome, details, commandRecord) {
    var record = {
      receipt_type: commandId + ".dispatch_receipt",
      command_id: commandId,
      correlation_id: commandRecord && commandRecord.correlation_id || uid("pm-home-receipt"),
      origin: "home_workspace",
      outcome: outcome,
      details: clone(details || {}),
      recorded_at_utc: now()
    };
    receiptLog.push(record);
    try { window.dispatchEvent(new CustomEvent("pm:dispatch-receipt", { detail: clone(record) })); } catch (error) {}
    return record;
  }

  function emit(eventType, payload) {
    var record = { event_type: eventType, payload: clone(payload) };
    eventLog.push(record);
    try { window.dispatchEvent(new CustomEvent(eventType, { detail: clone(payload) })); } catch (error) {}
    return record;
  }

  function changedSurfaceIds(before, after) {
    var ids = [];
    after.surfaces.forEach(function (surface) {
      var prior = surfaceById(before, surface.surface_instance_id);
      if (!prior || JSON.stringify(prior) !== JSON.stringify(surface)) ids.push(surface.surface_instance_id);
    });
    before.surfaces.forEach(function (surface) {
      if (!surfaceById(after, surface.surface_instance_id) && ids.indexOf(surface.surface_instance_id) === -1) ids.push(surface.surface_instance_id);
    });
    return ids;
  }

  function commitLayout(next, mutationKind, commandId, details) {
    details = details || {};
    var prior = clone(committed);
    var normalized = normalizeLayout(next, null);
    var errorCode = validateLayout(normalized);
    if (errorCode) { renderLayout(prior); return { ok: false, reason: errorCode }; }
    normalized.layout_revision = prior.layout_revision + 1;
    normalized.saved_at_utc = now();
    normalized.validation.status = "valid";
    normalized.validation.last_validation_errors = [];
    var affected = changedSurfaceIds(prior, normalized);
    if (!affected.length) return { ok: true, no_change: true };
    var commandRecord = command(commandId, Object.assign({
      mutation_kind: mutationKind,
      new_layout_revision: normalized.layout_revision,
      affected_surface_instance_ids: affected.slice()
    }, details.command_payload || {}));
    var persisted = writeAndVerify(normalized);
    if (!persisted.ok) {
      receipt(commandId, "failed", { reason: persisted.reason, layout_revision: prior.layout_revision, rolled_back: true }, commandRecord);
      restoreFocusSequence(prior);
      renderLayout(prior);
      recoveryToast(persisted.reason);
      return { ok: false, reason: persisted.reason, command: commandRecord };
    }
    committed = normalized;
    restoreOwnerRefs(committed);
    var layoutPayload = {
      schema_id: "pm.event.workspace_layout_changed.v1",
      schema_version: "1.0.0",
      project_id: PROJECT_ID,
      workspace_tab_id: WORKSPACE_TAB_ID,
      command_id: commandId,
      origin: "home_workspace",
      correlation_id: commandRecord.correlation_id,
      prior_layout_revision: prior.layout_revision,
      new_layout_revision: normalized.layout_revision,
      mutation_kind: mutationKind,
      affected_surface_instance_ids: affected.slice(),
      source_host: details.source_host !== undefined ? details.source_host : null,
      target_host: details.target_host !== undefined ? details.target_host : null,
      target_slot_index: details.target_slot_index !== undefined ? details.target_slot_index : null,
      target_surface_instance_id: details.target_surface_instance_id || null,
      insertion_edge: details.insertion_edge || null,
      persisted: true
    };
    emit("workspace.layout_changed", layoutPayload);
    if (commandId === "cmd.panel.undock") {
      emit("panel.undocked", {
        project_id: PROJECT_ID,
        workspace_tab_id: WORKSPACE_TAB_ID,
        command_id: commandRecord.command_id,
        correlation_id: commandRecord.correlation_id,
        surface_instance_id: details.command_payload && details.command_payload.surface_instance_id || affected[0],
        source_host: layoutPayload.source_host,
        target_host: "floating",
        layout_revision: normalized.layout_revision
      });
    } else if (commandId === "cmd.panel.redock") {
      emit("panel.redocked", {
        project_id: PROJECT_ID,
        workspace_tab_id: WORKSPACE_TAB_ID,
        command_id: commandRecord.command_id,
        correlation_id: commandRecord.correlation_id,
        surface_instance_id: details.command_payload && details.command_payload.surface_instance_id || affected[0],
        source_host: "floating",
        target_host: layoutPayload.target_host,
        target_slot_index: layoutPayload.target_slot_index,
        layout_revision: normalized.layout_revision
      });
    }
    receipt(commandId, "applied", { layout_revision: normalized.layout_revision, persisted: true, affected_surface_instance_ids: affected }, commandRecord);
    /* Drag and resize commits pre-seat the DOM to equal the committed model,
       so the full render (which reseats chrome on every surface) would be a
       geometric no-op with a visible settle flash. They pass skip_render and
       get the light sync instead. */
    if (details && details.skip_render) {
      syncHostGeometry(committed);
      updateMenuAvailability(committed);
    } else {
      renderLayout(committed);
    }
    return { ok: true, command: commandRecord, event: layoutPayload };
  }

  /* Panels 3 and 4 get the SAME internal ids pm6RenderFile(name, prefix)
     writes into (#<prefix>Gutter / #<prefix>Code / #<prefix>Minimap), so
     "Open in Panel" renders a real buffer there instead of a debug string. */
  function editorPrefixFor(surfaceId) {
    var index = EDITOR_IDS.indexOf(surfaceId);
    return index === -1 ? null : "pane" + (index + 1);
  }

  function makeEditorShell(surfaceId, index) {
    var safe = surfaceId.replace(/[^a-z0-9]+/gi, "_");
    var existing = document.getElementById("pmHomeEditor_" + safe);
    if (existing) return existing;
    var owner = editorOwners[surfaceId];
    var prefix = editorPrefixFor(surfaceId) || ("pane" + index);
    var seed = index === 3 ? "README.md" : "src/routes/auth.rs";
    var panel = document.createElement("section");
    panel.id = "pmHomeEditor_" + safe;
    panel.className = "editor-pane pm-home-editor-shell";
    panel.innerHTML = '<div class="editor-tabs" role="tablist" aria-label="Panel ' + index + ' tabs">' +
      '<span class="tab active" role="tab" tabindex="0" data-file="' + seed + '">' + (index === 3 ? 'README.md' : 'auth.rs') + '</span>' +
      '<span class="pane-tabbar-actions"></span></div>' +
      '<div class="editor-area">' +
      '<div class="editor-gutter" id="' + prefix + 'Gutter"></div>' +
      '<div class="editor-code" id="' + prefix + 'Code" tabindex="0"></div>' +
      '<div class="editor-minimap" id="' + prefix + 'Minimap"><canvas class="minimap-canvas"></canvas><div class="minimap-viewport"></div></div>' +
      '</div>';
    panel.setAttribute("data-editor-panel-id", surfaceId);
    panel.setAttribute("data-editor-group-id", owner.editor_group_id);
    panel.setAttribute("data-pm-home-editor-prefix", prefix);
    if (typeof window.PM6_RENDER_FILE === "function") {
      try { window.PM6_RENDER_FILE(seed, prefix); } catch (error) {}
    }
    return panel;
  }

  function makeTerminalShell(surfaceId) {
    var safe = surfaceId.replace(/[^a-z0-9]+/gi, "_");
    var existing = document.getElementById("pmHomeTerminal_" + safe);
    if (existing) return existing;
    var section = document.createElement("section");
    section.id = "pmHomeTerminal_" + safe;
    section.className = "pm-home-terminal-shell";
    section.innerHTML = '<div class="pm-home-terminal-head"><button type="button" data-pm-home-workgroup-handle>Workgroup</button><strong data-pm-home-terminal-title></strong><span class="pm-home-terminal-spacer"></span><button type="button" data-pm-home-action="split-terminal-pane">Split Pane</button><button type="button" data-pm-home-action="move-workgroup-new-section">New Section</button><span data-pm-home-terminal-counts></span></div><div class="pm-home-terminal-body" data-pm-home-terminal-body></div>';
    return section;
  }

  function surfaceElement(surface) {
    if (surface.surface_instance_id === "editor_panel_1") return document.getElementById("editorPane1");
    if (surface.surface_instance_id === "editor_panel_2") return document.getElementById("editorPane2");
    if (surface.surface_instance_id === "editor_panel_3") return makeEditorShell(surface.surface_instance_id, 3);
    if (surface.surface_instance_id === "editor_panel_4") return makeEditorShell(surface.surface_instance_id, 4);
    if (surface.surface_instance_id === "dashboard") return document.getElementById("dashboardView");
    if (surface.surface_instance_id === "chat") return document.getElementById("chatPanel");
    if (surface.surface_kind === "terminal_section" && surface.surface_instance_id === "terminal_section:terminal_section_1") return document.getElementById("bottomPanel");
    if (surface.surface_kind === "terminal_section") return makeTerminalShell(surface.surface_instance_id);
    return null;
  }

  function ensureBrowserTab(surfaceId, element) {
    if (!element) return null;
    var tabs = element.querySelector(".editor-tabs");
    if (!tabs) return null;
    var existing = tabs.querySelector('[data-pm-home-browser-tab="' + surfaceId + '"]');
    if (existing) return existing;
    if (surfaceId === "editor_panel_2") existing = document.getElementById("browserPreviewTab");
    if (!existing) {
      existing = document.createElement("span");
      existing.className = "tab pm-home-browser-tab";
      existing.setAttribute("role", "tab");
      existing.setAttribute("tabindex", "0");
      existing.innerHTML = '<svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Browser';
      tabs.insertBefore(existing, tabs.querySelector(".pane-tabbar-actions"));
    }
    existing.removeAttribute("onclick");
    existing.setAttribute("data-pm-home-browser-tab", surfaceId);
    existing.setAttribute("aria-label", "Open Browser in Panel " + (EDITOR_IDS.indexOf(surfaceId) + 1));
    return existing;
  }

  function buildSurfaceRegistry(layout) {
    surfaceRegistry = Object.create(null);
    hostRegistries = Object.create(null);
    HOSTS.forEach(function (host) { hostRegistries[host] = []; });
    layout.surfaces.forEach(function (surface) {
      var element = surfaceElement(surface);
      surfaceRegistry[surface.surface_instance_id] = { id: surface.surface_instance_id, kind: surface.surface_kind, element: element };
      hostRegistries[surface.host].push(surface.surface_instance_id);
      if (surface.surface_kind === "editor_panel" && element) {
        var owner = editorOwners[surface.surface_instance_id];
        element.setAttribute("data-editor-panel-id", owner.editor_panel_id);
        element.setAttribute("data-editor-group-id", owner.editor_group_id);
        ensureBrowserTab(surface.surface_instance_id, element);
      }
    });
    HOSTS.forEach(function (host) {
      hostRegistries[host].sort(function (a, b) {
        return surfaceById(layout, a).slot_index - surfaceById(layout, b).slot_index;
      });
    });
  }

  /* Registry refresh WITHOUT re-resolving elements: a live gesture needs the
     draft ordering to reflect the in-flight placement, but re-resolving
     surface elements mid-drag would recreate shells and drop pointer capture. */
  function buildHostRegistriesFrom(layout) {
    hostRegistries = Object.create(null);
    HOSTS.forEach(function (host) { hostRegistries[host] = []; });
    layout.surfaces.forEach(function (surface) {
      if (hostRegistries[surface.host]) hostRegistries[surface.host].push(surface.surface_instance_id);
    });
    HOSTS.forEach(function (host) {
      hostRegistries[host].sort(function (a, b) {
        return surfaceById(layout, a).slot_index - surfaceById(layout, b).slot_index;
      });
    });
  }

  function hostElement(host) { return root.querySelector('[data-pm-home-host="' + host + '"]'); }

  function clearSurfacePosition(element) {
    if (!element) return;
    ["left", "right", "top", "bottom", "width", "height", "max-width", "max-height", "z-index", "order", "flex"].forEach(function (name) { element.style.removeProperty(name); });
    element.style.removeProperty("--pm-home-float-z");
  }

  /* Lines-only grip glyph for the surface's top-right corner: two groove
     strokes for drag affordance (no fill triangle -- the corner stays open)
     and an inset ring path the CSS reveals on :focus-visible (an outline
     would be clipped away by the triangular clip-path). */
  var GRIP_SVG = '<svg aria-hidden="true" viewBox="0 0 20 20">' +
    '<path class="pm-home-grip-groove" d="M9.5 4.5 L15.5 10.5 M4.5 4.5 L15.5 15.5" fill="none" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path class="pm-home-grip-ring" d="M1.5 2 L16 2 Q18 2 18 4 L18 18.5 Z" fill="none" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  /* The grip is the surface element's own absolutely-positioned first child,
     an 18px lines-only triangle in the TOP-RIGHT corner. It sits at z-index
     140 -- above the pinned actions cluster (130), chat's stacked header (25),
     the surface kebab (26) and the resize handles (100). Only the upper-right
     triangle of its box steals hits (clip-path polygon(0 0, 100% 0,
     100% 100%)); everything left of the hypotenuse passes through to the
     chrome beneath.
     (The old in-row grip lived inside `.editor-tabs`, where it fought the tab
     silhouette layer for slot 0 on every chrome reseat.) */

  function attachSurfaceControls(surface) {
    var record = surfaceRegistry[surface.surface_instance_id];
    var element = record && record.element;
    if (!element) return;
    var grip = element.querySelector('[data-pm-home-handle="' + surface.surface_instance_id + '"]');
    if (!grip) {
      grip = document.createElement("button");
      grip.type = "button";
      grip.className = "pm-home-surface-grip";
      grip.setAttribute("data-pm-home-handle", surface.surface_instance_id);
      grip.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
      grip.setAttribute("aria-label", "Move " + surface.surface_instance_id);
      grip.setAttribute("aria-grabbed", "false");
      grip.title = "Drag to move, or press Enter to move with the arrow keys";
      grip.innerHTML = GRIP_SVG;
      element.insertBefore(grip, element.firstChild);
      bindDragHandle(grip, surface.surface_instance_id);
    } else if (grip.parentNode !== element || element.firstElementChild !== grip) {
      /* the chat engine rebuilds #chatPanel with innerHTML -- re-seat rather
         than duplicate. The grip is a child of the SURFACE, not any head row,
         so PM6 tab-strip rebuilds no longer touch it at all. */
      element.insertBefore(grip, element.firstChild);
    }
    var options = element.querySelector('[data-pm-home-surface-options="' + surface.surface_instance_id + '"]');
    if (!options) {
      options = document.createElement("button");
      options.type = "button";
      options.className = "pm-home-surface-options";
      options.setAttribute("data-pm-home-surface-options", surface.surface_instance_id);
      options.setAttribute("data-pm-home-action", "open-surface-menu");
      options.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
      options.setAttribute("aria-haspopup", "menu");
      options.setAttribute("aria-expanded", "false");
      options.setAttribute("aria-label", "Options for " + surface.surface_instance_id);
      options.title = "Surface options";
      options.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
      var optionsHost = element.querySelector(".pane-tabbar-actions, .dashboard-tabs, .panel-actions, .pm-home-terminal-head") || element;
      optionsHost.appendChild(options);
    }
    /* Per-surface divider: ALWAYS a column handle now -- it transfers WIDTH
       between the adjacent pair in every row-axis host. In a row dock
       (dock_top/dock_bottom) the divider is emitted on every visible surface
       EXCEPT the last (a pair transfer needs a right-hand partner; the last
       sibling gets none), and dock HEIGHT moves to the separate full-width
       track handle created below. home_main/dock_left/dock_right keep their
       existing per-surface divider behavior. */
    var resizer = element.querySelector('[data-pm-home-resizer="' + surface.surface_instance_id + '"]:not([data-pm-home-resizer-corner]):not([data-pm-home-resizer-track])');
    var resizeClass = "resizer-col";
    var rowDock = surface.host === "dock_top" || surface.host === "dock_bottom";
    var captured = gesture && gesture.kind === "resize" && gesture.surfaceId === surface.surface_instance_id;
    var wantsDivider = true;
    if (rowDock) {
      var rowRef = (gesture && gesture.draft) || committed;
      var rowVisibleIds = (hostRegistries[surface.host] || []).filter(function (id) {
        var sibling = rowRef && surfaceById(rowRef, id);
        return Boolean(sibling && sibling.visible);
      });
      wantsDivider = rowVisibleIds.length > 0 && rowVisibleIds[rowVisibleIds.length - 1] !== surface.surface_instance_id;
    }
    /* Never destroy the element that currently holds pointer capture: removing
       it mid-drag fires lostpointercapture and the gesture dies on frame one. */
    if (resizer && (resizer.getAttribute("data-pm-home-resize-orientation") !== resizeClass || !wantsDivider) && !captured) {
      resizer.remove();
      resizer = null;
    }
    if (!resizer && wantsDivider) {
      resizer = document.createElement("div");
      resizer.setAttribute("data-pm-home-resizer", surface.surface_instance_id);
      resizer.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
      resizer.setAttribute("data-pm-home-resize-orientation", resizeClass);
      resizer.setAttribute("role", "separator");
      resizer.setAttribute("tabindex", "0");
      resizer.setAttribute("aria-label", "Resize " + surface.surface_instance_id);
      resizer.setAttribute("aria-orientation", "vertical");
      resizer.className = "pm-home-resize-handle " + resizeClass;
      element.appendChild(resizer);
      bindResizer(resizer, surface.surface_instance_id);
    }
    if (resizer) {
      /* Rewrite the orientation class WITHOUT dropping state classes the
         shared resizer controller owns (`.resizing` drives the grab-glow); the
         old unconditional className assignment wiped it on every render
         frame. */
      resizer.classList.add("pm-home-resize-handle");
      resizer.classList.toggle("resizer-col", resizeClass === "resizer-col");
      resizer.classList.toggle("resizer-row", resizeClass === "resizer-row");
      resizer.setAttribute("data-pm-home-resize-orientation", resizeClass);
      resizer.setAttribute("aria-orientation", "vertical");
      if (resizer.parentNode !== element) element.appendChild(resizer);
    }
    /* Row-dock TRACK handle: a full-width row handle on the dock's outer edge
       that drives the dock's cross-axis track (cross_basis_px). Follows the
       floating corner handle's create/remove pattern; surfaces docked
       anywhere else must not carry it. */
    var track = element.querySelector('[data-pm-home-resizer-track="' + surface.surface_instance_id + '"]');
    if (rowDock) {
      if (!track) {
        track = document.createElement("div");
        track.setAttribute("data-pm-home-resizer-track", surface.surface_instance_id);
        track.setAttribute("data-pm-home-resizer", surface.surface_instance_id);
        track.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
        track.setAttribute("data-pm-home-resize-orientation", "resizer-track");
        track.setAttribute("role", "separator");
        track.setAttribute("tabindex", "0");
        track.setAttribute("aria-label", "Resize " + surface.surface_instance_id + " (dock height)");
        track.setAttribute("aria-orientation", "horizontal");
        track.className = "pm-home-resize-handle resizer-row";
        element.appendChild(track);
        bindResizer(track, surface.surface_instance_id, { track: true });
      } else if (track.parentNode !== element) {
        element.appendChild(track);
      }
    } else if (track && !captured) {
      track.remove();
    }
    /* Floating surfaces additionally get a bottom-right corner handle that
       drives BOTH axes; docked surfaces must not carry it. */
    var corner = element.querySelector('[data-pm-home-resizer-corner="' + surface.surface_instance_id + '"]');
    if (surface.host === "floating") {
      if (!corner) {
        corner = document.createElement("div");
        corner.setAttribute("data-pm-home-resizer-corner", surface.surface_instance_id);
        corner.setAttribute("data-pm-home-resizer", surface.surface_instance_id);
        corner.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
        corner.setAttribute("data-pm-home-resize-orientation", "resizer-corner");
        corner.setAttribute("role", "separator");
        corner.setAttribute("tabindex", "0");
        corner.setAttribute("aria-label", "Resize " + surface.surface_instance_id + " (both directions)");
        corner.className = "pm-home-resize-handle resizer-corner";
        element.appendChild(corner);
        bindResizer(corner, surface.surface_instance_id, { corner: true });
      } else if (corner.parentNode !== element) {
        element.appendChild(corner);
      }
    } else if (corner && !(gesture && gesture.kind === "resize" && gesture.surfaceId === surface.surface_instance_id)) {
      corner.remove();
    }
    if (surface.surface_kind === "terminal_section") wireTerminalLocalControls(surface, element);
  }

  function terminalTree(paneIds) {
    function leaf(id) { return { type: "leaf", paneId: id }; }
    if (paneIds.length <= 1) return leaf(paneIds[0]);
    if (paneIds.length === 2) return { type: "row", children: paneIds.map(leaf) };
    if (paneIds.length === 3) return { type: "col", children: [{ type: "row", children: paneIds.slice(0, 2).map(leaf) }, leaf(paneIds[2])] };
    return { type: "col", children: [{ type: "row", children: paneIds.slice(0, 2).map(leaf) }, { type: "row", children: paneIds.slice(2, 4).map(leaf) }] };
  }

  function syncTerminalRuntime(section) {
    var demo = window.PM_TERMINAL_DEMO;
    var state = demo && demo.state;
    if (!state || !Array.isArray(state.terminalGroups) || !section || !section.terminal_workgroup_id) return;
    var signature = JSON.stringify({ workgroup: section.terminal_workgroup_id, panes: section.pane_ids, sessions: section.terminal_session_ids });
    if (terminalRuntimeSignature !== signature) {
      var group = state.terminalGroups.filter(function (candidate) { return candidate.id === "g1"; })[0] || state.terminalGroups[0];
      if (!group) return;
      group.title = "Build";
      for (var i = 0; i < section.pane_ids.length; i += 1) {
        var paneId = section.pane_ids[i];
        var sessionId = section.terminal_session_ids[i];
        if (!state.panes[paneId]) {
          var seed = clone(state.panes[section.pane_ids[0]] || state.panes[Object.keys(state.panes)[0]] || {});
          seed.id = paneId;
          seed.displayName = "shell " + (i + 1);
          seed.lines = [{ t: "line", c: "$ terminal " + sessionId + " ready" }];
          state.panes[paneId] = seed;
        }
        state.panes[paneId].id = paneId;
        state.panes[paneId].sessionId = sessionId;
      }
      group.tree = terminalTree(section.pane_ids.slice());
      state.activeGroupId = group.id;
      if (section.pane_ids.indexOf(state.focusedPaneId) === -1) state.focusedPaneId = section.pane_ids[0];
      terminalRuntimeSignature = signature;
      try { demo.renderAll(); demo.syncTerminalTabBar("terminal"); } catch (error) {}
    }
    section.pane_ids.forEach(function (paneId, index) {
      var pane = document.querySelector('#bottomTerminalHost .terminal-pane[data-pane-id="' + paneId + '"]');
      if (pane) {
        pane.setAttribute("data-terminal-pane-id", paneId);
        pane.setAttribute("data-terminal-session-id", section.terminal_session_ids[index]);
      }
    });
    var activePill = document.querySelector("#pmTerminalCenterWrap .pm-term-wg-tab.pm-term-tab-active");
    if (activePill) {
      activePill.draggable = false;
      activePill.ondragstart = null;
      activePill.setAttribute("data-pm-home-workgroup-handle", "true");
      activePill.setAttribute("data-pm-home-surface-id", activeTerminalSectionId);
      activePill.setAttribute("data-terminal-workgroup-id", section.terminal_workgroup_id);
      bindWorkgroupHandle(activePill, activeTerminalSectionId);
    }
  }

  /* Split/New Section stay in .bottom-tabs-right, before the collapse chevron.
     PM6 pins that chevron with `margin-left: auto`, so it keeps the right edge
     regardless. (#pmBottomTermChrome looked like the natural toolbar slot but
     is not laid out in the Home projection, which made both controls
     invisible.) */
  function ensureBottomTerminalControls(surfaceId, element) {
    var host = element.querySelector(".bottom-tabs-right") || element.querySelector(".bottom-tabs");
    if (!host) return;
    var controls = element.querySelector(".pm-home-terminal-inline-controls");
    if (!controls) {
      controls = document.createElement("span");
      controls.className = "pm-home-terminal-inline-controls";
      controls.innerHTML = '<button type="button" class="pm-tiny-btn" data-pm-home-action="split-terminal-pane">Split Pane</button><button type="button" class="pm-tiny-btn" data-pm-home-action="move-workgroup-new-section">New Section</button>';
    }
    if (controls.parentNode !== host) host.insertBefore(controls, host.firstChild);
    controls.querySelectorAll("[data-pm-home-action]").forEach(function (button) { button.setAttribute("data-pm-home-surface-id", surfaceId); });
  }

  function projectTerminalRuntime(surface, element, section) {
    var runtime = document.getElementById("bottomTerminalHost");
    var originalParent = document.getElementById("bottomTabsContent");
    if (runtime && originalParent && !terminalRuntimeHome) {
      terminalRuntimeHome = document.createElement("span");
      terminalRuntimeHome.hidden = true;
      terminalRuntimeHome.setAttribute("data-pm-home-terminal-runtime-home", "true");
      originalParent.insertBefore(terminalRuntimeHome, runtime);
    }
    if (element.id === "bottomPanel") ensureBottomTerminalControls(surface.surface_instance_id, element);
    var center = document.getElementById("pmTermCenterOuter");
    var chrome = document.getElementById("pmBottomTermChrome");
    if (chrome) chrome.style.setProperty("display", "none", "important");
    var oldEmpty = element.querySelector(":scope > .bottom-tabs-content > .pm-home-terminal-empty-state");
    if (section.terminal_workgroup_id) {
      activeTerminalSectionId = surface.surface_instance_id;
      syncTerminalRuntime(section);
      if (element.id === "bottomPanel") {
        if (runtime && terminalRuntimeHome && terminalRuntimeHome.parentNode && runtime.parentNode !== terminalRuntimeHome.parentNode) terminalRuntimeHome.parentNode.insertBefore(runtime, terminalRuntimeHome.nextSibling);
        if (center) center.style.removeProperty("display");
        if (oldEmpty) oldEmpty.remove();
      } else {
        var body = element.querySelector("[data-pm-home-terminal-body]");
        if (body && runtime && runtime.parentNode !== body) { body.textContent = ""; body.appendChild(runtime); }
        if (center) center.style.setProperty("display", "none", "important");
      }
    } else if (element.id === "bottomPanel") {
      if (center) center.style.setProperty("display", "none", "important");
      if (!oldEmpty) {
        oldEmpty = document.createElement("div");
        oldEmpty.className = "pm-home-terminal-empty-state";
        oldEmpty.textContent = "This terminal section is empty. Drag the workgroup pill here to bring it back, or use Reset Layout in the Home menu.";
        if (originalParent) originalParent.appendChild(oldEmpty);
      }
    }
  }

  function renderTerminal(surface, element) {
    var section = terminalSections[surface.surface_instance_id] || { terminal_section_id: surface.surface_instance_id.split(":")[1], terminal_workgroup_id: null, pane_ids: [], terminal_session_ids: [] };
    var title = element.querySelector("[data-pm-home-terminal-title]");
    var body = element.querySelector("[data-pm-home-terminal-body]");
    var runtime = document.getElementById("bottomTerminalHost");
    var counts = element.querySelector("[data-pm-home-terminal-counts]");
    var workgroupButton = element.querySelector("[data-pm-home-workgroup-handle]");
    if (title) title.textContent = section.terminal_section_id.replace(/_/g, " ");
    if (counts) counts.textContent = section.pane_ids.length + "/4 panes";
    if (body) {
      if (!section.terminal_workgroup_id && runtime && body.contains(runtime) && terminalRuntimeHome && terminalRuntimeHome.parentNode) {
        terminalRuntimeHome.parentNode.insertBefore(runtime, terminalRuntimeHome.nextSibling);
      }
      body.classList.toggle("pm-home-terminal-empty", !section.terminal_workgroup_id);
      if (!runtime || !body.contains(runtime)) {
        body.textContent = section.terminal_workgroup_id ? "Workgroup " + section.terminal_workgroup_id + "\nPanes " + section.pane_ids.join(", ") + "\nSessions " + section.terminal_session_ids.join(", ") : "Empty terminal section. Move a workgroup here to reuse it.";
      }
    }
    if (workgroupButton) {
      workgroupButton.hidden = !section.terminal_workgroup_id;
      workgroupButton.textContent = section.terminal_workgroup_id || "Workgroup";
      bindWorkgroupHandle(workgroupButton, surface.surface_instance_id);
    }
    projectTerminalRuntime(surface, element, section);
    element.querySelectorAll('[data-pm-home-action="split-terminal-pane"]').forEach(function (button) {
      var total = totalTerminalPanes();
      button.disabled = !section.terminal_workgroup_id || total >= 4;
      var reason = !section.terminal_workgroup_id ? "Move a workgroup here first" : (total >= 4 ? "Maximum four visible terminal panes" : "");
      button.setAttribute("aria-disabled", String(button.disabled));
      button.setAttribute("data-disabled-reason", reason);
      button.setAttribute("aria-description", reason || "Split active terminal pane");
      button.title = reason || "Split active terminal pane";
    });
    element.querySelectorAll('[data-pm-home-action="move-workgroup-new-section"]').forEach(function (button) {
      var atLimit = terminalSurfaceCount() >= 4;
      button.disabled = !section.terminal_workgroup_id || atLimit;
      var reason = !section.terminal_workgroup_id ? "Move a workgroup here first" : (atLimit ? "Maximum four terminal sections" : "");
      button.setAttribute("aria-disabled", String(button.disabled));
      button.setAttribute("data-disabled-reason", reason);
      button.setAttribute("aria-description", reason || "Move this workgroup into a new terminal section");
      button.title = reason || "Move this workgroup into a new terminal section";
    });
  }

  function applySurface(surface, element) {
    if (!element) return;
    clearSurfacePosition(element);
    element.classList.add("pm-home-surface");
    element.setAttribute("data-pm-home-surface", surface.surface_instance_id);
    element.setAttribute("data-pm-home-kind", surface.surface_kind);
    element.setAttribute("data-pm-home-visible", String(surface.visible));
    element.setAttribute("data-pm-home-collapsed", String(surface.collapsed));
    element.setAttribute("data-pm-home-slot", String(surface.slot_index));
    element.setAttribute("data-pm-home-current-host", surface.host);
    applySurfaceFlex(surface, element);
    if (surface.surface_kind === "chat") element.classList.toggle("hidden", !surface.visible);
    if (!surface.visible) return;
    var host = hostElement(surface.host);
    if (host && element.parentNode !== host) host.appendChild(element);
    element.style.setProperty("order", String(surface.slot_index));
    if (surface.host === "floating") {
      var bounds = clampBounds(surface.floating_bounds || tiledFloatBounds(committed, surface.surface_instance_id));
      element.style.setProperty("left", bounds.x + "px", "important");
      element.style.setProperty("top", bounds.y + "px", "important");
      element.style.setProperty("width", bounds.width + "px", "important");
      element.style.setProperty("height", bounds.height + "px", "important");
      element.style.setProperty("--pm-home-float-z", String(Math.max(1, surface.last_focus_seq || 1)));
    }
    /* Panels 3/4 hydrate lazily: a generated editor shell whose .editor-code
       has never drawn a buffer (PM6_RENDER_FILE was not up yet when the shell
       was built) renders its owner's active buffer the moment it is seated
       visible in a host. */
    if (element.classList.contains("pm-home-editor-shell")) {
      var shellCode = element.querySelector(".editor-code");
      var shellOwner = editorOwners[surface.surface_instance_id];
      if (shellCode && shellCode.childElementCount === 0 && shellOwner && shellOwner.active_buffer_id) {
        try { renderFileIntoPanel(surface.surface_instance_id, String(shellOwner.active_buffer_id).replace(/^buffer:/, "")); } catch (error) {}
      }
    }
    attachSurfaceControls(surface);
    syncCollapseControl(surface, element);
    if (surface.surface_kind === "terminal_section") renderTerminal(surface, element);
  }

  /* No-dead-space invariant for the main row: re-sum the visible surfaces'
     committed bases to the host's actual width (proportional rescale). A
     persisted degenerate layout (tiny bases, lost grow, stale window size)
     self-heals at render time instead of drawing an unclaimable void, and the
     pair-transfer resize always starts from px-true bases. Projection-layer
     normalization only -- no command, no revision bump; the corrected bases
     ride along with the next real commit. */
  function normalizeMainRowBases(layout) {
    var hostEl = hostElement("home_main");
    if (!hostEl || !hostEl.clientWidth) return;
    var row = layout.surfaces.filter(function (surface) {
      return surface.visible && surface.host === "home_main" && !surface.collapsed;
    });
    if (!row.length) return;
    /* keep in lockstep with --pm-home-gap */
    var gaps = 4 * Math.max(0, row.length - 1);
    var avail = Math.max(120 * row.length, hostEl.clientWidth - gaps);
    var sum = 0;
    row.forEach(function (surface) { sum += Math.max(80, Number(surface.size.basis_px) || 360); });
    if (!sum) return;
    row.forEach(function (surface) {
      var share = Math.max(80, Number(surface.size.basis_px) || 360) / sum;
      surface.size.basis_px = Math.round(avail * share);
      var el = surfaceRegistry[surface.surface_instance_id] && surfaceRegistry[surface.surface_instance_id].element;
      if (el) el.style.setProperty("flex", "1 1 " + surface.size.basis_px + "px", "important");
    });
  }

  function syncHostGeometry(layout) {
    function basis(host, fallback, max) {
      var surfaces = layout.surfaces.filter(function (surface) { return surface.visible && surface.host === host; });
      if (!surfaces.length) return "0px";
      /* A dock whose every visible surface is collapsed shrinks to the strip
         height instead of holding its full track open over empty space. */
      var live = surfaces.filter(function (surface) { return !surface.collapsed; });
      if (!live.length) return COLLAPSED_STRIP_PX + "px";
      /* Row docks (top/bottom) size their TRACK from cross_basis_px -- the
         per-surface basis_px is the surface's main-axis WIDTH there, owned by
         the pair-transfer dividers. Column docks keep basis_px as the track
         width. */
      var rowAxisTrack = host === "dock_top" || host === "dock_bottom";
      var raw = Math.max.apply(null, live.map(function (surface) {
        if (rowAxisTrack) return Number(surface.size.cross_basis_px) || Number(surface.size.basis_px) || fallback;
        return Number(surface.size.basis_px) || fallback;
      }));
      var band = HOST_BANDS[host];
      return Math.max(band.min, Math.min(raw, band.max)) + "px";
    }
    grid.style.setProperty("--pm-home-left-w", basis("dock_left", 300));
    grid.style.setProperty("--pm-home-right-w", basis("dock_right", 300));
    grid.style.setProperty("--pm-home-top-h", basis("dock_top", 210));
    grid.style.setProperty("--pm-home-bottom-h", basis("dock_bottom", 210));
    ["home_main", "dock_left", "dock_right", "dock_top", "dock_bottom"].forEach(function (host) {
      var el = hostElement(host);
      var has = layout.surfaces.some(function (surface) { return surface.visible && surface.host === host; });
      if (el) el.classList.toggle("pm-home-host-empty", !has);
    });
  }

  function mountActiveBrowser() {
    var content = document.getElementById("browserTabContent");
    if (!content || !browserOwner.target_editor_panel_id) return;
    var targetRecord = surfaceRegistry[browserOwner.target_editor_panel_id];
    var target = targetRecord && targetRecord.element;
    if (!target) return;
    EDITOR_IDS.forEach(function (id) {
      var record = surfaceRegistry[id];
      var element = record && record.element;
      if (!element) return;
      var tab = element.querySelector('[data-pm-home-browser-tab="' + id + '"]');
      if (tab) tab.classList.toggle("active", id === browserOwner.target_editor_panel_id);
      element.querySelectorAll(".editor-area").forEach(function (area) { area.style.display = id === browserOwner.target_editor_panel_id ? "none" : "flex"; });
    });
    if (content.parentNode !== target) target.appendChild(content);
    content.style.display = "flex";
    content.setAttribute("data-pm-home-browser-session-id", browserOwner.browser_session_id);
    content.setAttribute("data-pm-home-browser-target-panel", browserOwner.target_editor_panel_id);
  }

  function eligibleBottomTerminal(layout) {
    return layout.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section" && surface.host === "dock_bottom" && surface.visible; }).sort(function (a, b) {
      var aOwner = terminalSections[a.surface_instance_id];
      var bOwner = terminalSections[b.surface_instance_id];
      return Number(Boolean(bOwner && bOwner.terminal_workgroup_id)) - Number(Boolean(aOwner && aOwner.terminal_workgroup_id)) || b.last_focus_seq - a.last_focus_seq || a.slot_index - b.slot_index;
    })[0];
  }

  function updateMenuAvailability(layout) {
    var terminal = eligibleBottomTerminal(layout);
    var collapse = document.querySelector('#pm-home-more-menu [data-pm-home-action="collapse-terminal"]');
    if (collapse) {
      /* The AUTHORED HOME_MARKUP label must stay exactly "Collapse Bottom
         Terminal" -- a T20 build gate asserts that byte string in the menu
         markup. The toggle relabel below is RUNTIME-only, applied to the live
         DOM after the menu is in the document. */
      var disabled = !terminal;
      var disabledReason = disabled ? "No terminal is docked at the bottom" : "";
      var collapseLabel = terminal && terminal.collapsed ? "Expand Bottom Terminal" : "Collapse Bottom Terminal";
      collapse.disabled = disabled;
      collapse.setAttribute("aria-disabled", String(disabled));
      collapse.setAttribute("data-disabled-reason", disabledReason);
      var collapseSpan = collapse.querySelector("span");
      if (collapseSpan) collapseSpan.textContent = collapseLabel;
      collapse.setAttribute("aria-description", disabledReason || collapseLabel);
      collapse.title = disabledReason || collapseLabel;
      collapse.setAttribute("data-pm-home-surface-id", terminal ? terminal.surface_instance_id : "");
    }
  }

  function renderLayout(layout) {
    /* A placeholder can only exist inside a live move gesture. One stranded by
       an interrupted drag is an unclaimable void in the row (it has no handle
       and no chrome), so every render outside a gesture sweeps it. */
    if (!gesture) {
      var strayPlaceholder = document.getElementById("pm-home-drop-placeholder");
      if (strayPlaceholder && strayPlaceholder.parentNode) strayPlaceholder.parentNode.removeChild(strayPlaceholder);
    }
    buildSurfaceRegistry(layout);
    layout.surfaces.slice().sort(function (a, b) {
      return HOSTS.indexOf(a.host) - HOSTS.indexOf(b.host) || a.slot_index - b.slot_index;
    }).forEach(function (surface) { applySurface(surface, surfaceRegistry[surface.surface_instance_id].element); });
    normalizeMainRowBases(layout);
    syncHostGeometry(layout);
    mountActiveBrowser();
    updateMenuAvailability(layout);
    if (window.PM_EDGE && typeof window.PM_EDGE.enroll === "function") {
      root.querySelectorAll(".pm-home-scrollport, .pm-home-terminal-body").forEach(function (scrollport) {
        scrollport.classList.add("pm6-bottom-scroll");
        window.PM_EDGE.enroll(scrollport);
      });
      window.PM_EDGE.refresh();
    }
    watchSurfaceChrome();
  }

  function focusSurface(surfaceId) {
    var surface = surfaceById(committed, surfaceId);
    var record = surfaceRegistry[surfaceId];
    var element = record && record.element;
    if (!surface || !element) return;
    if (surface.host === "floating") element.style.setProperty("--pm-home-float-z", String(surface.last_focus_seq));
    var focusTarget = element.querySelector(".editor-code, button, [tabindex]") || element;
    try { focusTarget.focus({ preventScroll: true }); } catch (error) { try { focusTarget.focus(); } catch (ignored) {} }
  }

  function focusSurfaceModel(layout, surfaceId) {
    var surface = surfaceById(layout, surfaceId);
    if (!surface) return;
    surface.last_focus_seq = ++focusSeq;
  }

  function restoreFocusSequence(layout) {
    focusSeq = Math.max(20, Math.max.apply(null, (layout && layout.surfaces || []).map(function (surface) { return Number(surface.last_focus_seq) || 0; })));
  }

  function noChangeCommand(commandId, payload, reason) {
    var record = command(commandId, payload);
    receipt(commandId, "no_change", { reason: reason }, record);
    return { ok: true, no_change: true, command: record };
  }

  function openPanel(surfaceId) {
    if (EDITOR_IDS.indexOf(surfaceId) === -1) return { ok: false, reason: "not_editor_panel" };
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    if (current.visible) {
      var focused = clone(committed);
      focusSurfaceModel(focused, surfaceId);
      var noChange = commitLayout(focused, "focus", "cmd.editor.open_panel", { affected_surface_instance_ids: [surfaceId], source_host: current.host, target_host: current.host, target_slot_index: current.slot_index, command_payload: { editor_panel_id: surfaceId, target_host: current.host, target_slot_index: current.slot_index, already_open: true } });
      focusSurface(surfaceId);
      return noChange;
    }
    var next = clone(committed);
    var surface = surfaceById(next, surfaceId);
    surface.visible = true;
    surface.host = surface.last_docked_host || "home_main";
    surface.slot_index = surface.last_docked_slot_index || 0;
    focusSurfaceModel(next, surfaceId);
    normalizeSlots(next);
    var result = commitLayout(next, "open", "cmd.editor.open_panel", { affected_surface_instance_ids: [surfaceId], source_host: null, target_host: surface.host, target_slot_index: surface.slot_index, command_payload: { editor_panel_id: surfaceId, target_host: surface.host, target_slot_index: surface.slot_index } });
    if (result.ok) focusSurface(surfaceId);
    return result;
  }

  function closePanel(surfaceId) {
    if (EDITOR_IDS.indexOf(surfaceId) === -1) return { ok: false, reason: "not_editor_panel" };
    var next = clone(committed);
    var surface = surfaceById(next, surfaceId);
    if (!surface) return { ok: false, reason: "unknown_surface" };
    if (!surface.visible) return noChangeCommand("cmd.editor.close_panel", { editor_panel_id: surfaceId }, "already_closed");
    surface.visible = false;
    var closedActiveBrowser = browserOwner.target_editor_panel_id === surfaceId;
    if (closedActiveBrowser) {
      surface.domain_ref.browser_active = false;
    }
    var result = commitLayout(next, "close", "cmd.editor.close_panel", { affected_surface_instance_ids: [surfaceId], source_host: surface.host, target_host: null, command_payload: { editor_panel_id: surfaceId, close_reason: "user" } });
    if (result.ok && closedActiveBrowser) {
      browserOwner.target_editor_panel_id = null;
      var browserContent = document.getElementById("browserTabContent");
      if (browserContent) browserContent.style.display = "none";
    }
    return result;
  }

  function placementFor(layout, surfaceId, host, insertion) {
    var surface = surfaceById(layout, surfaceId);
    if (!surface) return null;
    var candidates = layout.surfaces.filter(function (other) { return other.surface_instance_id !== surfaceId && other.visible && other.host === host; }).sort(function (a, b) { return a.slot_index - b.slot_index; });
    var index = insertion && isFinite(insertion.index) ? Math.max(0, Math.min(insertion.index, candidates.length)) : candidates.length;
    surface.host = host;
    surface.visible = true;
    surface.slot_index = index;
    candidates.splice(index, 0, surface);
    candidates.forEach(function (candidate, slot) {
      candidate.slot_index = slot;
      candidate.split_path = "root/" + slot;
      if (host !== "floating") {
        candidate.last_docked_host = host;
        candidate.last_docked_slot_index = slot;
      }
    });
    if (host === "floating" && !surface.floating_bounds) surface.floating_bounds = tiledFloatBounds(layout, surfaceId, { width: Math.max(300, surface.size.basis_px), height: 300 });
    return surface;
  }

  function moveSurface(surfaceId, host, insertion) {
    if (!hostIsValid(host)) return { ok: false, reason: "invalid_host" };
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    var next = clone(committed);
    var moved = placementFor(next, surfaceId, host, insertion || null);
    focusSurfaceModel(next, surfaceId);
    if (host === "floating" && insertion && insertion.bounds) moved.floating_bounds = clampBounds(insertion.bounds);
    var targetSurfaceId = insertion && insertion.target_surface_instance_id || null;
    var edge = insertion && insertion.insertion_edge || null;
    if (JSON.stringify(current) === JSON.stringify(moved)) return noChangeCommand(host === "floating" ? "cmd.panel.undock" : "cmd.workspace_layout.move_surface", { surface_instance_id: surfaceId, source_host: current.host, target_host: host, target_slot_index: moved.slot_index, target_surface_instance_id: targetSurfaceId, insertion_edge: edge }, "already_placed");
    var affected = changedSurfaceIds(committed, normalizeLayout(next, null));
    var commandId = host === "floating" ? "cmd.panel.undock" : (current.host === "floating" ? "cmd.panel.redock" : "cmd.workspace_layout.move_surface");
    return commitLayout(next, host === "floating" ? "undock" : (current.host === "floating" ? "redock" : "move"), commandId, {
      affected_surface_instance_ids: affected, source_host: current.host, target_host: host, target_slot_index: moved.slot_index, target_surface_instance_id: targetSurfaceId, insertion_edge: edge,
      command_payload: { surface_instance_id: surfaceId, source_host: current.host, target_host: host, target_slot_index: moved.slot_index, target_surface_instance_id: targetSurfaceId, insertion_edge: edge }
    });
  }

  function popOutPanel(surfaceId) {
    var userActivation = !navigator.userActivation || navigator.userActivation.isActive === true;
    var popupAttempted = window.PM_HOME_ENABLE_OPTIONAL_POPUPS === true && userActivation;
    var popupBlocked = false;
    if (popupAttempted) {
      var probe = null;
      try { probe = window.open("about:blank", "pm-home-panel-probe", "popup=yes,width=480,height=360"); } catch (error) { probe = null; }
      popupBlocked = !probe;
      if (probe) {
        try { probe.close(); } catch (ignored) {}
      }
    }
    var result = moveSurface(surfaceId, "floating");
    /* corner-origin sprout on the freshly floated surface (transient class so
       later re-renders do not replay it) */
    var floatedEl = surfaceRegistry[surfaceId] && surfaceRegistry[surfaceId].element;
    if (floatedEl && result && result.ok !== false) {
      floatedEl.classList.add("pm-home-float-enter");
      setTimeout(function () { floatedEl.classList.remove("pm-home-float-enter"); }, 360);
    }
    var disposition = popupAttempted && popupBlocked ? "popup_blocked_in_canvas_fallback" : (popupAttempted ? "popup_capable_in_canvas_prototype" : (userActivation ? "in_canvas_float" : "direct_user_activation_required_in_canvas_fallback"));
    if (root) root.setAttribute("data-pm-home-popup-disposition", disposition);
    if (result) result.web_popup = { attempted: popupAttempted, blocked: popupBlocked, direct_user_activation: userActivation, disposition: disposition };
    return result;
  }

  function setSurfaceCollapsed(surfaceId, collapsed) {
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    if (collapsed === undefined) collapsed = true;
    collapsed = Boolean(collapsed);
    if (current.collapsed === collapsed) return noChangeCommand("cmd.workspace_layout.set_collapsed", { surface_instance_id: surfaceId, collapsed: collapsed }, collapsed ? "already_collapsed" : "already_expanded");
    var next = clone(committed);
    surfaceById(next, surfaceId).collapsed = collapsed;
    return commitLayout(next, collapsed ? "collapse" : "expand", "cmd.workspace_layout.set_collapsed", { affected_surface_instance_ids: [surfaceId], source_host: current.host, target_host: current.host, command_payload: { surface_instance_id: surfaceId, collapsed: collapsed } });
  }

  /* The top-bar menu row is a TOGGLE now: handleAction routes it through
     toggleBottomTerminalCollapsed, and updateMenuAvailability relabels the
     row "Expand Bottom Terminal" at runtime while the terminal is collapsed
     (the authored markup keeps the "Collapse Bottom Terminal" byte string a
     build gate asserts). collapseBottomTerminal stays as the one-way entry
     point for callers that must never expand. */
  function collapseBottomTerminal() {
    var terminal = eligibleBottomTerminal(committed);
    if (!terminal) return { ok: false, reason: "no_bottom_terminal" };
    if (terminal.collapsed) return { ok: false, reason: "already_collapsed" };
    return setSurfaceCollapsed(terminal.surface_instance_id, true);
  }

  function toggleBottomTerminalCollapsed() {
    var terminal = eligibleBottomTerminal(committed);
    if (!terminal) return { ok: false, reason: "no_bottom_terminal" };
    return setSurfaceCollapsed(terminal.surface_instance_id, !terminal.collapsed);
  }

  /* Projects the model's collapse state onto the PM6 bottom-panel contract:
     `.bottom-panel.collapsed` hides `.bottom-tabs-content`, and the chevron
     flips + reports the POST-commit state. */
  var COLLAPSE_CHEVRON_SVG = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

  function syncCollapseControl(surface, element) {
    if (!element) return;
    var collapsed = Boolean(surface && surface.collapsed);
    if (element.id === "bottomPanel") element.classList.toggle("collapsed", collapsed);
    var button = element.querySelector("#collapseBottom, [data-pm-home-collapse-toggle]");
    if (!button) return;
    if (!button.getAttribute("data-pm-home-collapse-toggle")) {
      button.setAttribute("data-pm-home-collapse-toggle", surface.surface_instance_id);
      button.innerHTML = COLLAPSE_CHEVRON_SVG;
      button.classList.add("pm-home-collapse-toggle");
    }
    button.setAttribute("aria-expanded", collapsed ? "false" : "true");
    button.setAttribute("aria-label", collapsed ? "Expand the bottom panel" : "Collapse the bottom panel");
    button.title = collapsed ? "Expand the bottom panel" : "Collapse the bottom panel";
    button.setAttribute("data-pm-home-collapsed", String(collapsed));
  }

  function setSurfaceVisible(surfaceId, visible, commandId) {
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    if (current.visible === Boolean(visible)) {
      focusSurface(surfaceId);
      return noChangeCommand(commandId, { surface_instance_id: surfaceId, visible: Boolean(visible) }, visible ? "already_open" : "already_closed");
    }
    var next = clone(committed);
    var surface = surfaceById(next, surfaceId);
    surface.visible = Boolean(visible);
    if (visible) {
      surface.host = surface.last_docked_host || "home_main";
      surface.slot_index = surface.last_docked_slot_index || 0;
      focusSurfaceModel(next, surfaceId);
    }
    normalizeSlots(next);
    var result = commitLayout(next, visible ? "open" : "close", commandId, {
      affected_surface_instance_ids: [surfaceId], source_host: current.host, target_host: visible ? surface.host : null, target_slot_index: visible ? surface.slot_index : null,
      command_payload: { panel_id: surfaceId, surface_instance_id: surfaceId, visible: Boolean(visible) }
    });
    if (result.ok && visible) focusSurface(surfaceId);
    return result;
  }

  function resetLayout() {
    var next = defaultLayout();
    next.layout_revision = committed.layout_revision;
    EDITOR_IDS.forEach(function (id) {
      var old = surfaceById(committed, id);
      var fresh = surfaceById(next, id);
      if (old && fresh) fresh.domain_ref = clone(old.domain_ref);
    });
    /* Carry the LIVE workgroup into the reset section 1, not blindly the
       first terminal surface: after a workgroup move the first section's ref
       is blanked, and cloning that blank left reset with no terminal. */
    var terminalCarriers = committed.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section"; });
    var liveCarrier = terminalCarriers.filter(function (surface) {
      return surface.domain_ref && surface.domain_ref.terminal_workgroup_id;
    })[0] || terminalCarriers[0];
    if (liveCarrier) {
      var carrierRef = clone(liveCarrier.domain_ref);
      carrierRef.terminal_section_id = "terminal_section_1";
      surfaceById(next, "terminal_section:terminal_section_1").domain_ref = carrierRef;
    }
    return commitLayout(next, "reset", "cmd.workspace_layout.reset", { affected_surface_instance_ids: next.surfaces.map(function (surface) { return surface.surface_instance_id; }), command_payload: {} });
  }

  /* Top-bar "Reset Layout": reset + persist the default layout through the
     normal command path, defensively close the legacy floating chat, then
     reload. PM_DEMO keeps no persistent state and exposes no reset API (its
     state root is closure-private and its beat timers cannot be re-armed
     without double-scheduling), so a reload is the only HONEST demo reset --
     the freshly persisted default layout is exactly what boot then loads. */
  function resetWorkspaceAndDemo() {
    var result = resetLayout();
    var floatingChat = document.getElementById("floatingChat");
    if (floatingChat) floatingChat.style.display = "none";
    document.body.classList.add("pm-home-resetting");
    setTimeout(function () { try { window.location.reload(); } catch (error) {} }, 180);
    return result;
  }

  /* Chat pop-out for the retired base overlay path: the base applyLayout guard
     (installed by the T20 build transform) routes its overlay/detached modes
     here, so the chat floats INSIDE the workspace like every other surface
     instead of covering it with a fixed scrim window. */
  function popOutChat() {
    var surface = surfaceById(committed, "chat");
    if (!surface) return null;
    if (!surface.visible) setSurfaceVisible("chat", true);
    return popOutPanel("chat");
  }

  /* Boot demotion: floating is a within-session state, never a boot state. A
     surface persisted as floating reopens in its last dock (bounds preserved
     so an explicit re-float restores its spot). This, plus drag-to-float
     removal, is what ends "opens popped out by default". */
  function demoteFloatingAtBoot(layout) {
    var demoted = [];
    (layout.surfaces || []).forEach(function (surface) {
      if (surface.host !== "floating") return;
      surface.host = surface.last_docked_host || "home_main";
      surface.slot_index = typeof surface.last_docked_slot_index === "number" ? surface.last_docked_slot_index : 0;
      demoted.push(surface.surface_instance_id);
    });
    if (demoted.length) {
      var normalized = normalizeLayout(layout, null);
      writeAndVerify(normalized);
      receipt("storage.boot_demote_floating", "applied", { demoted_surface_instance_ids: demoted, layout_revision: normalized.layout_revision }, null);
      return normalized;
    }
    return layout;
  }

  function emitBrowserEvents(commandRecord, created) {
    if (created) emit("browser.session.created", { command_id: commandRecord.command_id, origin: "home_workspace", correlation_id: commandRecord.correlation_id, browser_session_id: browserOwner.browser_session_id, session_class: browserOwner.session_class, project_id: PROJECT_ID });
    emit("browser.session.state_changed", { command_id: commandRecord.command_id, origin: "home_workspace", correlation_id: commandRecord.correlation_id, browser_session_id: browserOwner.browser_session_id, session_class: browserOwner.session_class, state: "active", target_editor_panel_id: browserOwner.target_editor_panel_id, target_editor_group_id: editorOwners[browserOwner.target_editor_panel_id].editor_group_id });
  }

  function openBrowser(surfaceId) {
    if (EDITOR_IDS.indexOf(surfaceId) === -1) return { ok: false, reason: "not_editor_panel" };
    var current = surfaceById(committed, surfaceId);
    if (!current) return { ok: false, reason: "unknown_surface" };
    var next = clone(committed);
    var target = surfaceById(next, surfaceId);
    var affected = [];
    next.surfaces.forEach(function (surface) {
      if (surface.surface_kind !== "editor_panel") return;
      var wasActive = Boolean(surface.domain_ref && surface.domain_ref.browser_active);
      surface.domain_ref = surface.domain_ref || {};
      surface.domain_ref.browser_active = surface.surface_instance_id === surfaceId;
      if (wasActive !== surface.domain_ref.browser_active) affected.push(surface.surface_instance_id);
    });
    target.domain_ref.browser_session_id = browserOwner.browser_session_id;
    focusSurfaceModel(next, surfaceId);
    if (!target.visible) {
      target.visible = true;
      target.host = target.last_docked_host || "home_main";
      target.slot_index = target.last_docked_slot_index || 0;
      affected.push(surfaceId);
    }
    normalizeSlots(next);
    var wasCreated = !browserOwner.created_event_emitted;
    var result;
    if (affected.length || browserOwner.target_editor_panel_id !== surfaceId) {
      result = commitLayout(next, "open_browser", "cmd.browser.open_workspace_preview", {
        affected_surface_instance_ids: affected.length ? Array.from(new Set(affected)) : [surfaceId], source_host: current.host, target_host: target.host, target_slot_index: target.slot_index,
        command_payload: { target: { kind: "editor_panel", editor_panel_id: surfaceId, editor_group_id: editorOwners[surfaceId].editor_group_id }, target_editor_panel_id: surfaceId, target_editor_group_id: editorOwners[surfaceId].editor_group_id }
      });
    } else {
      result = noChangeCommand("cmd.browser.open_workspace_preview", { target: { kind: "editor_panel", editor_panel_id: surfaceId, editor_group_id: editorOwners[surfaceId].editor_group_id }, target_editor_panel_id: surfaceId, target_editor_group_id: editorOwners[surfaceId].editor_group_id }, "browser_already_active");
    }
    if (!result.ok) return result;
    browserOwner.target_panels[surfaceId] = browserOwner.browser_session_id;
    browserOwner.target_editor_panel_id = surfaceId;
    browserOwner.created_event_emitted = true;
    mountActiveBrowser();
    emitBrowserEvents(result.command, wasCreated);
    receipt("cmd.browser.open_workspace_preview", "projected", { browser_session_id: browserOwner.browser_session_id, target_editor_panel_id: surfaceId, target_editor_group_id: editorOwners[surfaceId].editor_group_id }, result.command);
    focusSurface(surfaceId);
    return { ok: true, command: result.command, browser_session_id: browserOwner.browser_session_id, target_editor_panel_id: surfaceId, target_editor_group_id: editorOwners[surfaceId].editor_group_id };
  }

  /* Actually open the file. Panel 1 routes through the canonical PM_DEMO open
     path so the tab is added to the open-tab model and the strip re-renders;
     every panel then renders the buffer with PM6_RENDER_FILE against its own
     <prefix>Gutter/<prefix>Code/<prefix>Minimap ids. The previous code called
     switchEditorPane*Tab (which only activates an ALREADY-open tab) for panels
     1-2 and wrote a debug string into .editor-code for panels 3-4, so nothing
     opened anywhere. */
  function ensurePanelTab(element, path, surfaceId) {
    if (!element) return;
    var strip = element.querySelector(".editor-tabs");
    if (!strip) return;
    var tabs = strip.querySelectorAll(".tab");
    var existing = null;
    Array.prototype.forEach.call(tabs, function (tab) {
      tab.classList.remove("active");
      if (tab.getAttribute("data-file") === path) existing = tab;
    });
    if (!existing) {
      existing = document.createElement("span");
      existing.className = "tab";
      existing.setAttribute("role", "tab");
      existing.setAttribute("tabindex", "0");
      existing.setAttribute("data-file", path);
      existing.textContent = String(path).split("/").pop();
      /* Insert at the buffer's model position (buffer_ids order), not always
         at the end: a shell rebuild replays the persisted drag order this
         way. Falls back to before the actions cluster for unknown buffers. */
      var before = strip.querySelector(".pane-tabbar-actions");
      var owner = surfaceId ? editorOwners[surfaceId] : null;
      var bufferId = owner ? buffersByPath[path] : null;
      var want = owner && bufferId ? owner.buffer_ids.indexOf(bufferId) : -1;
      if (want !== -1) {
        var fileTabs = strip.querySelectorAll(".tab[data-file]");
        for (var fi = 0; fi < fileTabs.length; fi++) {
          var otherId = buffersByPath[fileTabs[fi].getAttribute("data-file")];
          var otherIdx = otherId ? owner.buffer_ids.indexOf(otherId) : -1;
          if (otherIdx !== -1 && otherIdx > want) { before = fileTabs[fi]; break; }
        }
      }
      strip.insertBefore(existing, before);
    }
    existing.classList.add("active");
    if (typeof window.PM6_FIT_EDITOR_TABS === "function") {
      try { window.PM6_FIT_EDITOR_TABS(strip); } catch (error) {}
    }
  }

  /* Mirror a drag-reordered strip back into the per-panel buffer model. The
     base dispatches pm6:ed-tab-order with the pane element id and the tab
     keys (data-file paths, or label text for non-buffer tabs, which we skip).
     Pane 1's order lives in the base's own S.files model, not here. */
  document.addEventListener("pm6:ed-tab-order", function (event) {
    var detail = event && event.detail;
    if (!detail || !detail.pane_id || !detail.order) return;
    var surfaceId = null;
    if (detail.pane_id === "editorPane2") surfaceId = "editor_panel_2";
    else {
      var match = /^pmHomeEditor_(editor_panel_\d)$/.exec(detail.pane_id);
      if (match) surfaceId = match[1];
    }
    var owner = surfaceId && editorOwners[surfaceId];
    if (!owner) return;
    var ordered = [];
    detail.order.forEach(function (key) {
      var bufferId = buffersByPath[key];
      if (bufferId && owner.buffer_ids.indexOf(bufferId) !== -1 && ordered.indexOf(bufferId) === -1) {
        ordered.push(bufferId);
      }
    });
    owner.buffer_ids.forEach(function (bufferId) {
      if (ordered.indexOf(bufferId) === -1) ordered.push(bufferId);
    });
    owner.buffer_ids = ordered;
  });

  function renderFileIntoPanel(surfaceId, path) {
    var element = surfaceRegistry[surfaceId] && surfaceRegistry[surfaceId].element;
    var prefix = editorPrefixFor(surfaceId);
    if (surfaceId === "editor_panel_1" && window.PM_DEMO && window.PM_DEMO.files && typeof window.PM_DEMO.files.open === "function") {
      try { window.PM_DEMO.files.open(path); return; } catch (error) {}
    }
    ensurePanelTab(element, path, surfaceId);
    if (surfaceId === "editor_panel_2") {
      var browserContent = document.getElementById("browserTabContent");
      if (browserContent) browserContent.style.display = "none";
      var codeArea = document.getElementById("editorPane2CodeArea");
      if (codeArea) codeArea.style.display = "";
    }
    if (prefix && typeof window.PM6_RENDER_FILE === "function") {
      try { window.PM6_RENDER_FILE(path, prefix); } catch (error) {}
    }
  }

  function openFileInPanel(surfaceId, path) {
    if (EDITOR_IDS.indexOf(surfaceId) === -1) return { ok: false, reason: "unknown_editor_panel" };
    path = path || "src/main.rs";
    var owner = editorOwners[surfaceId];
    var hadBufferIdentity = Object.prototype.hasOwnProperty.call(buffersByPath, path);
    var bufferId = buffersByPath[path] || (buffersByPath[path] = "buffer:" + path);
    var nextBufferIds = owner.buffer_ids.slice();
    if (nextBufferIds.indexOf(bufferId) === -1) nextBufferIds.push(bufferId);
    var next = clone(committed);
    var target = surfaceById(next, surfaceId);
    focusSurfaceModel(next, surfaceId);
    var layoutChanged = false;
    if (!target.visible) {
      target.visible = true;
      target.host = target.last_docked_host || "home_main";
      target.slot_index = target.last_docked_slot_index || 0;
      layoutChanged = true;
    }
    var payload = { path: path, target_editor_panel_id: surfaceId, target_editor_group_id: owner.editor_group_id, target_group: owner.editor_group_id };
    var result;
    result = commitLayout(next, layoutChanged ? "open_file_target" : "focus_file_target", "cmd.file.open", { affected_surface_instance_ids: [surfaceId], source_host: layoutChanged ? null : target.host, target_host: target.host, target_slot_index: target.slot_index, command_payload: payload });
    if (!result.ok) {
      if (!hadBufferIdentity) delete buffersByPath[path];
      return result;
    }
    owner.buffer_ids = nextBufferIds;
    owner.active_buffer_id = bufferId;
    renderFileIntoPanel(surfaceId, path);
    window.PM_HOME_LAST_OPEN_FILE = Object.assign({ buffer_id: bufferId }, payload);
    focusSurface(surfaceId);
    return Object.assign({ ok: true, buffer_id: bufferId }, payload);
  }

  function fileManagerTargetPath() {
    var remembered = window.PM_HOME_FILE_TARGET;
    if (remembered && remembered.getAttribute && remembered.getAttribute("data-path")) return remembered.getAttribute("data-path");
    var active = document.querySelector("#panel-files .fm-row.active-file[data-path], #panel-files .fm-row[data-path], #panel-files .fm-openrow[data-path]");
    return active ? active.getAttribute("data-path") : null;
  }

  function installFileManagerOpenTargets() {
    var panel = document.getElementById("panel-files");
    var contextMenu = document.getElementById("fileContextMenu");
    if (!panel || !contextMenu || contextMenu.getAttribute("data-pm-home-file-targets") === "true") return;
    if (contextMenu.parentNode !== document.body) document.body.appendChild(contextMenu);
    contextMenu.style.setProperty("z-index", "10070", "important");
    contextMenu.setAttribute("data-pm-home-body-portal", "true");
    contextMenu.setAttribute("data-pm-home-file-targets", "true");
    var item = document.createElement("button");
    item.type = "button";
    item.className = "fm-ctx-item";
    item.setAttribute("role", "menuitem");
    item.setAttribute("aria-haspopup", "menu");
    item.setAttribute("aria-expanded", "false");
    item.setAttribute("aria-controls", "pm-home-file-panel-menu");
    item.setAttribute("data-pm-home-file-submenu", "true");
    item.innerHTML = '<span class="fm-ctx-label">Open in Panel</span><span class="fm-ctx-key">&#8250;</span>';
    var firstSeparator = contextMenu.querySelector(".fm-ctx-sep");
    contextMenu.insertBefore(item, firstSeparator || contextMenu.firstChild);
    function remember(event) {
      var row = event.target && event.target.closest ? event.target.closest(".fm-row[data-path], .fm-openrow[data-path]") : null;
      if (row) window.PM_HOME_FILE_TARGET = row;
    }
    panel.addEventListener("contextmenu", remember, true);
    panel.addEventListener("click", remember, true);
    panel.addEventListener("keydown", remember, true);
    item.addEventListener("mouseenter", function () { openFlyout(document.getElementById("pm-home-file-panel-menu"), item); });
    item.addEventListener("click", function (event) { event.preventDefault(); openFlyout(document.getElementById("pm-home-file-panel-menu"), item, true); });
    item.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") { event.preventDefault(); openFlyout(document.getElementById("pm-home-file-panel-menu"), item, true); }
    });
  }

  function terminalSurfaceCount() { return committed.surfaces.filter(function (surface) { return surface.surface_kind === "terminal_section"; }).length; }
  function totalTerminalPanes() { return Object.keys(terminalSections).reduce(function (sum, id) { return sum + (terminalSections[id].pane_ids || []).length; }, 0); }
  function firstEmptyTerminalSection(excludeId) {
    var found = null;
    committed.surfaces.some(function (surface) {
      var section = terminalSections[surface.surface_instance_id];
      if (surface.surface_kind === "terminal_section" && surface.surface_instance_id !== excludeId && section && !section.terminal_workgroup_id) { found = surface.surface_instance_id; return true; }
      return false;
    });
    return found;
  }

  function nextTerminalSectionId() {
    for (var i = 1; i <= 4; i += 1) {
      var id = "terminal_section:terminal_section_" + i;
      if (!surfaceById(committed, id)) return id;
    }
    return null;
  }

  function syncTerminalRef(layout, surfaceId, section) {
    var surface = surfaceById(layout, surfaceId);
    if (!surface) return;
    surface.domain_ref = surface.domain_ref || {};
    surface.domain_ref.terminal_section_id = section.terminal_section_id;
    surface.domain_ref.terminal_workgroup_id = section.terminal_workgroup_id;
    surface.domain_ref.pane_ids = csv(section.pane_ids);
    surface.domain_ref.terminal_session_ids = csv(section.terminal_session_ids);
  }

  function moveWorkgroupToHost(host, targetSectionId, forceCreate) {
    var sourceId = activeTerminalSectionId;
    var workgroup = terminalSections[sourceId];
    if (!workgroup || !workgroup.terminal_workgroup_id) return { ok: false, reason: "terminal_workgroup_missing" };
    var next = clone(committed);
    var sectionCreated = false;
    if (!targetSectionId && !forceCreate) targetSectionId = firstEmptyTerminalSection(sourceId);
    if (!targetSectionId) {
      targetSectionId = nextTerminalSectionId();
      if (!targetSectionId) return { ok: false, reason: "terminal_section_limit" };
      var targetHost = hostIsValid(host) ? host : "home_main";
      var targetSlot = next.surfaces.filter(function (surface) { return surface.visible && surface.host === targetHost; }).length;
      var newSurface = makeSurface(targetSectionId, "terminal_section", targetHost, targetSlot, true);
      next.surfaces.push(newSurface);
      sectionCreated = true;
      terminalSections[targetSectionId] = { terminal_section_id: targetSectionId.split(":")[1], terminal_workgroup_id: null, pane_ids: [], terminal_session_ids: [] };
    }
    var targetOwner = terminalSections[targetSectionId];
    if (!targetOwner || targetOwner.terminal_workgroup_id) return { ok: false, reason: "terminal_target_not_empty" };
    var sourceSnapshot = clone(workgroup);
    terminalSections[targetSectionId] = clone(sourceSnapshot);
    terminalSections[targetSectionId].terminal_section_id = targetSectionId.split(":")[1];
    terminalSections[sourceId] = { terminal_section_id: sourceId.split(":")[1], terminal_workgroup_id: null, pane_ids: [], terminal_session_ids: [] };
    /* Move-and-reseed: "New Section" (forceCreate) should not strand an empty
       source. While the pane budget allows, seed the vacated source with a
       fresh one-pane workgroup IN THE SAME COMMIT, allocating ids with the
       same numbering scan splitTerminalPane uses. At the pane cap the source
       stays empty (today's behavior). */
    var sourceReseeded = false;
    var seededWorkgroup = null;
    if (forceCreate === true && totalTerminalPanes() < 4) {
      var seedPanes = Object.keys(terminalSections).reduce(function (values, id) { return values.concat(terminalSections[id].pane_ids || []); }, []);
      var seedSessions = Object.keys(terminalSections).reduce(function (values, id) { return values.concat(terminalSections[id].terminal_session_ids || []); }, []);
      var seedWorkgroups = Object.keys(terminalSections).map(function (id) { return terminalSections[id].terminal_workgroup_id; });
      var seedNumber = 1;
      while (seedPanes.indexOf("tp-" + seedNumber) !== -1 || seedSessions.indexOf("ts-sess-" + seedNumber) !== -1 || seedWorkgroups.indexOf("terminal_workgroup_" + seedNumber) !== -1) seedNumber += 1;
      seededWorkgroup = {
        terminal_section_id: sourceId.split(":")[1],
        terminal_workgroup_id: "terminal_workgroup_" + seedNumber,
        pane_ids: ["tp-" + seedNumber],
        terminal_session_ids: ["ts-sess-" + seedNumber]
      };
      terminalSections[sourceId] = seededWorkgroup;
      sourceReseeded = true;
    }
    var targetSurface = surfaceById(next, targetSectionId);
    targetSurface.host = hostIsValid(host) ? host : targetSurface.host;
    targetSurface.visible = true;
    targetSurface.last_focus_seq = ++focusSeq;
    syncTerminalRef(next, sourceId, terminalSections[sourceId]);
    syncTerminalRef(next, targetSectionId, terminalSections[targetSectionId]);
    normalizeSlots(next);
    var workgroupAffected = changedSurfaceIds(committed, normalizeLayout(next, null));
    var result = commitLayout(next, "move_workgroup", "cmd.terminal.move_workgroup", {
      affected_surface_instance_ids: workgroupAffected, source_host: surfaceById(committed, sourceId).host, target_host: targetSurface.host, target_slot_index: targetSurface.slot_index,
      command_payload: { terminal_workgroup_id: sourceSnapshot.terminal_workgroup_id, source_terminal_section_id: sourceId.split(":")[1], target_terminal_section_id: targetSectionId.split(":")[1], create_target_section: sectionCreated, target_workspace_host: targetSurface.host, target_slot_index: targetSurface.slot_index, preserve_session_identity: true, source_reseeded: sourceReseeded }
    });
    if (!result.ok) {
      /* rollback restores BOTH sections' prior refs: the source snapshot
         also discards any reseeded workgroup written above */
      terminalSections[sourceId] = sourceSnapshot;
      if (targetOwner) terminalSections[targetSectionId] = targetOwner;
      else delete terminalSections[targetSectionId];
      return result;
    }
    if (sourceReseeded && seededWorkgroup) {
      receipt("cmd.terminal.move_workgroup", "projected", {
        source_reseeded: true,
        source_terminal_section_id: sourceId.split(":")[1],
        seeded_terminal_workgroup_id: seededWorkgroup.terminal_workgroup_id,
        seeded_pane_ids: seededWorkgroup.pane_ids.slice(),
        seeded_session_ids: seededWorkgroup.terminal_session_ids.slice()
      }, result.command);
    }
    activeTerminalSectionId = targetSectionId;
    emit("terminal.workgroup_moved", {
      schema_id: "pm.event.terminal_workgroup_moved.v1", schema_version: "1.0.0", project_id: PROJECT_ID,
      command_id: result.command.command_id, origin: "home_workspace", correlation_id: result.command.correlation_id,
      terminal_workgroup_id: sourceSnapshot.terminal_workgroup_id,
      source_terminal_section_id: sourceId.split(":")[1], target_terminal_section_id: targetSectionId.split(":")[1],
      contained_pane_ids: sourceSnapshot.pane_ids.slice(), contained_session_ids: sourceSnapshot.terminal_session_ids.slice(), section_created: sectionCreated, preserve_session_identity: true
    });
    return result;
  }

  function splitTerminalPane(surfaceId) {
    var section = terminalSections[surfaceId];
    if (!section || !section.terminal_workgroup_id) return { ok: false, reason: "terminal_workgroup_missing" };
    if (totalTerminalPanes() >= 4) return { ok: false, reason: "terminal_pane_limit" };
    var allPanes = Object.keys(terminalSections).reduce(function (values, id) { return values.concat(terminalSections[id].pane_ids || []); }, []);
    var allSessions = Object.keys(terminalSections).reduce(function (values, id) { return values.concat(terminalSections[id].terminal_session_ids || []); }, []);
    var paneNumber = 1;
    while (allPanes.indexOf("tp-" + paneNumber) !== -1 || allSessions.indexOf("ts-sess-" + paneNumber) !== -1) paneNumber += 1;
    var paneId = "tp-" + paneNumber;
    var sessionId = "ts-sess-" + paneNumber;
    var next = clone(committed);
    section.pane_ids.push(paneId);
    section.terminal_session_ids.push(sessionId);
    syncTerminalRef(next, surfaceId, section);
    var result = commitLayout(next, "terminal_split", "cmd.terminal.split_pane", { affected_surface_instance_ids: [surfaceId], source_host: surfaceById(committed, surfaceId).host, target_host: surfaceById(committed, surfaceId).host, command_payload: { terminal_tab_id: section.terminal_workgroup_id, terminal_pane_id: paneId, terminal_session_id: sessionId, direction: "horizontal" } });
    if (!result.ok) { section.pane_ids.pop(); section.terminal_session_ids.pop(); return result; }
    receipt("cmd.terminal.split_pane", "applied", { terminal_pane_id: paneId, terminal_session_id: sessionId, visible_panes: totalTerminalPanes(), max_visible_panes: 4 }, result.command);
    return result;
  }

  function setTerminalPaneCount(count) {
    count = Number(count) || 1;
    if (count > 4) return { ok: false, reason: "terminal_pane_limit", visible_panes: totalTerminalPanes(), max_visible_panes: 4 };
    count = Math.max(1, count);
    var section = terminalSections[activeTerminalSectionId];
    if (!section || !section.terminal_workgroup_id) return { ok: false, reason: "terminal_workgroup_missing" };
    while (totalTerminalPanes() < count) {
      var result = splitTerminalPane(activeTerminalSectionId);
      if (!result.ok) return result;
    }
    return { ok: true, visible_panes: totalTerminalPanes(), max_visible_panes: 4 };
  }

  function wireTerminalLocalControls(surface, element) {
    element.querySelectorAll('[data-pm-home-action="split-terminal-pane"], [data-pm-home-action="move-workgroup-new-section"]').forEach(function (button) {
      button.setAttribute("data-pm-home-surface-id", surface.surface_instance_id);
    });
  }

  var portalClosures = typeof WeakMap === "function" ? new WeakMap() : null;

  function portalOpen(menu, anchor) {
    if (!menu) return;
    var pending = portalClosures && portalClosures.get(menu);
    if (pending) pending.cancel();
    if (window.PM6_SPROUT && typeof window.PM6_SPROUT.open === "function") window.PM6_SPROUT.open(menu, null, anchor);
    else { menu.style.display = "block"; requestAnimationFrame(function () { menu.classList.add("is-open"); }); }
  }

  function portalClose(menu, done) {
    if (!menu) { if (done) done(); return; }
    var previous = portalClosures && portalClosures.get(menu);
    if (previous) previous.cancel();
    var settled = false;
    var timer = null;
    function finish(event) {
      if (settled || (event && event.target !== menu)) return;
      if (event && event.propertyName && event.propertyName !== "opacity" && event.propertyName !== "transform") return;
      settled = true;
      if (timer) clearTimeout(timer);
      menu.removeEventListener("transitionend", finish);
      menu.classList.remove("is-closing");
      menu.style.display = "none";
      if (portalClosures) portalClosures.delete(menu);
      if (done) done();
    }
    function cancel() {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      menu.removeEventListener("transitionend", finish);
      menu.classList.remove("is-closing");
      if (portalClosures) portalClosures.delete(menu);
    }
    menu.classList.remove("is-open", "is-size-bounce");
    menu.classList.add("is-closing");
    menu.addEventListener("transitionend", finish);
    timer = setTimeout(finish, document.documentElement.getAttribute("data-motion") === "reduced" ? 0 : 280);
    if (portalClosures) portalClosures.set(menu, { cancel: cancel });
  }

  function positionMain(menu, anchor) {
    var rect = anchor.getBoundingClientRect();
    var width = menu.offsetWidth || 260;
    var height = menu.offsetHeight || 120;
    var left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    var top = rect.bottom + 6;
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.bottom = "auto";
  }

  function positionFlyout(menu, anchor) {
    var rect = anchor.getBoundingClientRect();
    var width = menu.offsetWidth || 148;
    var height = menu.offsetHeight || 150;
    var left = rect.right + 6;
    if (left + width > window.innerWidth - 8) left = rect.left - width - 6;
    menu.style.left = Math.max(8, left) + "px";
    menu.style.top = Math.max(8, Math.min(rect.top, window.innerHeight - height - 8)) + "px";
    menu.style.bottom = "auto";
  }

  function openMainMenu(menu, anchor) {
    closeAllMenus(false);
    menuState.main = menu;
    menuState.invoker = anchor;
    anchor.setAttribute("aria-expanded", "true");
    menu.style.display = "block";
    positionMain(menu, anchor);
    portalOpen(menu, anchor);
  }

  function openFlyout(menu, anchor, focusFirst) {
    if (!menu || !anchor || anchor.disabled) return;
    if (menuState.flyout && menuState.flyout !== menu) portalClose(menuState.flyout);
    document.querySelectorAll('[data-pm-home-submenu], [data-pm-home-file-submenu]').forEach(function (row) { row.setAttribute("aria-expanded", String(row === anchor)); });
    menuState.flyout = menu;
    menu.style.display = "block";
    positionFlyout(menu, anchor);
    portalOpen(menu, anchor);
    if (focusFirst) setTimeout(function () { focusMenuItem(menu, 0); }, 0);
  }

  function closeFlyout(returnFocus) {
    var flyout = menuState.flyout;
    if (!flyout) return;
    var owner = document.querySelector('[aria-controls="' + flyout.id + '"], [data-pm-home-submenu="' + flyout.id + '"]');
    menuState.flyout = null;
    portalClose(flyout);
    document.querySelectorAll('[data-pm-home-submenu], [data-pm-home-file-submenu]').forEach(function (row) { row.setAttribute("aria-expanded", "false"); });
    if (returnFocus && owner) owner.focus();
  }

  function closeAllMenus(restoreFocus) {
    if (menuState.hoverTimer) { clearTimeout(menuState.hoverTimer); menuState.hoverTimer = null; }
    closeFlyout(false);
    var main = menuState.main;
    var invoker = menuState.invoker;
    menuState.main = null;
    menuState.invoker = null;
    menuState.surfaceId = null;
    document.querySelectorAll("[data-pm-home-surface-options], #pm-home-more-btn").forEach(function (button) { button.setAttribute("aria-expanded", "false"); });
    if (main) portalClose(main);
    if (restoreFocus && invoker && document.contains(invoker)) setTimeout(function () { try { invoker.focus({ preventScroll: true }); } catch (error) { invoker.focus(); } }, 0);
  }

  function enabledMenuItems(menu) {
    return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]')).filter(function (item) { return !item.disabled && item.getAttribute("aria-disabled") !== "true"; });
  }

  function focusMenuItem(menu, index) {
    var items = enabledMenuItems(menu);
    if (!items.length) return;
    index = (index + items.length) % items.length;
    items[index].focus();
  }

  function menuKeydown(event) {
    var menu = event.currentTarget;
    var items = enabledMenuItems(menu);
    var index = items.indexOf(document.activeElement);
    if (event.key === "ArrowDown") { event.preventDefault(); focusMenuItem(menu, index + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); focusMenuItem(menu, index - 1); }
    else if (event.key === "Home") { event.preventDefault(); focusMenuItem(menu, 0); }
    else if (event.key === "End") { event.preventDefault(); focusMenuItem(menu, items.length - 1); }
    else if (event.key === "ArrowRight") {
      var target = event.target.closest("[data-pm-home-submenu]");
      if (target) { event.preventDefault(); openFlyout(document.getElementById(target.getAttribute("data-pm-home-submenu")), target, true); }
    } else if (event.key === "ArrowLeft" && menuState.flyout === menu) { event.preventDefault(); closeFlyout(true); }
    else if (event.key === "Escape") { event.preventDefault(); closeAllMenus(true); }
  }

  function surfaceMenuMarkup(surface) {
    var html = "";
    /* Movement is direct manipulation only (drag the top-right grip, or focus
       it and press Enter for the keyboard path); the menu carries ACTIONS, no
       placement copy. Separators are emitted only between groups that both
       exist, so no menu ever opens on, closes on, or doubles a separator. */
    function separator() {
      if (html) html += '<div class="pm-home-menu-separator" role="separator"></div>';
    }
    if (surface.surface_kind === "editor_panel") html += '<button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="open-browser" data-pm-home-surface-id="' + surface.surface_instance_id + '">Open Browser</button>';
    /* Pop Out is the ONLY route to floating (drag can no longer float), so
       every non-terminal surface offers it; a floating surface offers the
       reverse. Close stays editor-only. */
    var canFloat = surface.surface_kind === "editor_panel" || surface.surface_kind === "chat" || surface.surface_kind === "dashboard";
    if (canFloat && surface.host !== "floating") { separator(); html += '<button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="popout-panel" data-pm-home-surface-id="' + surface.surface_instance_id + '">Pop Out</button>'; }
    if (surface.host === "floating") { separator(); html += '<button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="redock-surface" data-pm-home-surface-id="' + surface.surface_instance_id + '">Dock Back</button>'; }
    if (surface.surface_kind === "editor_panel") html += '<button type="button" class="pm-home-menu-row pm-home-menu-danger" role="menuitem" data-pm-home-action="close-panel" data-pm-home-surface-id="' + surface.surface_instance_id + '">Close Panel</button>';
    if (surface.surface_kind === "terminal_section") {
      var section = terminalSections[surface.surface_instance_id];
      var splitDisabled = !section || !section.terminal_workgroup_id || totalTerminalPanes() >= 4;
      var sectionDisabled = !section || !section.terminal_workgroup_id || terminalSurfaceCount() >= 4;
      var splitReason = !section || !section.terminal_workgroup_id ? "Move a workgroup here first" : "Maximum four visible terminal panes";
      var sectionReason = !section || !section.terminal_workgroup_id ? "Move a workgroup here first" : "Maximum four terminal sections";
      separator();
      html += '<button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="split-terminal-pane" data-pm-home-surface-id="' + surface.surface_instance_id + '"' + (splitDisabled ? ' disabled aria-disabled="true" aria-description="' + splitReason + '" data-disabled-reason="' + splitReason + '" title="' + splitReason + '"' : '') + '>Split Pane</button><button type="button" class="pm-home-menu-row" role="menuitem" data-pm-home-action="move-workgroup-new-section" data-pm-home-surface-id="' + surface.surface_instance_id + '"' + (sectionDisabled ? ' disabled aria-disabled="true" aria-description="' + sectionReason + '" data-disabled-reason="' + sectionReason + '" title="' + sectionReason + '"' : '') + '>Move Workgroup to New Section</button>';
    }
    return html;
  }

  function openSurfaceMenu(anchor, surfaceId) {
    var surface = surfaceById(committed, surfaceId);
    var menu = document.getElementById("pm-home-surface-menu");
    if (!surface || !menu) return;
    menu.innerHTML = surfaceMenuMarkup(surface);
    menu.setAttribute("aria-label", "Options for " + surfaceId);
    menuState.surfaceId = surfaceId;
    openMainMenu(menu, anchor);
  }

  function scheduleFlyout(anchor) {
    if (menuState.hoverTimer) clearTimeout(menuState.hoverTimer);
    menuState.hoverTimer = setTimeout(function () {
      var menu = document.getElementById(anchor.getAttribute("data-pm-home-submenu"));
      openFlyout(menu, anchor, false);
    }, 140);
  }

  function handleAction(button) {
    if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
    var action = button.getAttribute("data-pm-home-action");
    var surfaceId = button.getAttribute("data-pm-home-surface-id");
    var result = null;
    if (action === "open-panel") result = openPanel(surfaceId);
    else if (action === "open-browser") result = openBrowser(surfaceId);
    else if (action === "collapse-terminal") result = toggleBottomTerminalCollapsed();
    else if (action === "close-panel") result = closePanel(surfaceId);
    else if (action === "popout-panel") result = popOutPanel(surfaceId);
    else if (action === "redock-surface") {
      var redockTarget = surfaceById(committed, surfaceId);
      result = moveSurface(surfaceId, (redockTarget && redockTarget.last_docked_host) || "home_main");
    }
    else if (action === "reset-layout") result = resetWorkspaceAndDemo();
    else if (action === "file-open-panel") result = openFileInPanel(surfaceId, fileManagerTargetPath() || "src/main.rs");
    else if (action === "split-terminal-pane") result = splitTerminalPane(surfaceId);
    else if (action === "move-workgroup-new-section") { activeTerminalSectionId = surfaceId; result = moveWorkgroupToHost(surfaceById(committed, surfaceId).host, null, true); }
    if (action && action !== "open-surface-menu") closeAllMenus(true);
    return result;
  }

  /* ------------------------------------------------------------------ *
   * Direct-manipulation move.
   *
   * The held surface becomes a fixed clone tracking the pointer 1:1; the slot
   * it vacated becomes a real in-flow placeholder inside the target host, and
   * every other surface FLIPs to its new position on each slot change. There
   * is no target-picker rail: the drop host comes from hit-testing the live
   * layout, with an edge-zone fallback for docks that are currently empty.
   * ------------------------------------------------------------------ */

  function hostAxisIsVertical(host) { return host === "dock_left" || host === "dock_right"; }

  /* Layout-true midline for an element mid-FLIP: getBoundingClientRect
     includes the FLIP translate, so a reflow-in-progress used to flap the
     resolved index every frame (the "placeholder never follows the pointer"
     defect). Subtract the live transform's translation to measure where the
     element actually LIVES, not where it is currently painted. */
  function layoutRect(element) {
    var rect = element.getBoundingClientRect();
    var transform = window.getComputedStyle(element).transform;
    if (transform && transform !== "none") {
      var match = /matrix\(([^)]+)\)/.exec(transform);
      if (match) {
        var parts = match[1].split(",");
        var tx = parseFloat(parts[4]) || 0;
        var ty = parseFloat(parts[5]) || 0;
        return { left: rect.left - tx, top: rect.top - ty, width: rect.width, height: rect.height };
      }
    }
    return rect;
  }

  function insertionAt(host, clientX, clientY, movingId) {
    var ids = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(gesture.draft, id);
      return id !== movingId && surface && surface.visible;
    });
    var vertical = hostAxisIsVertical(host);
    var index = ids.length;
    var targetId = null;
    var edge = null;
    for (var i = 0; i < ids.length; i += 1) {
      var record = surfaceRegistry[ids[i]];
      var rect = record && record.element && record.element.isConnected && layoutRect(record.element);
      if (!rect || (!rect.width && !rect.height)) continue;
      var midpoint = vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
      var point = vertical ? clientY : clientX;
      if (point < midpoint) { index = i; targetId = ids[i]; edge = "before"; break; }
      if (i === ids.length - 1) { targetId = ids[i]; edge = "after"; }
    }
    return { index: index, target_surface_instance_id: targetId, insertion_edge: edge };
  }

  function hostFull(host, movingId) {
    var cap = HOST_CAPS[host];
    if (!cap || !committed) return false;
    var count = 0;
    (committed.surfaces || []).forEach(function (surface) {
      if (surface.host === host && surface.visible && surface.surface_instance_id !== movingId) count += 1;
    });
    return count >= cap;
  }

  /* Target priority, in order:
       1. a real surface under the pointer  -> that surface's host (precise
          positional insertion; this must beat the edge zones or the first slot
          of home_main is unreachable behind the left dock's hot edge)
       2. an edge zone                      -> that dock (the only way to reach
          a dock that is currently empty and therefore zero-sized)
       3. whatever host is under the pointer
       4. home_main
     Outside the window entirely -> INVALID (never a silent float: an
     accidental pointer exit used to undock the surface and persist it, which
     is why a panel "opened popped-out by default". Floating is an explicit
     action now -- the Pop Out menu row or the keyboard F key). */
  function dropHostAt(clientX, clientY) {
    if (!root) return null;
    if (clientX < 0 || clientX > window.innerWidth || clientY < 0 || clientY > window.innerHeight) return null;
    var bounds = root.getBoundingClientRect();
    if (clientX < bounds.left || clientX > bounds.right || clientY < bounds.top || clientY > bounds.bottom) return null;
    /* While the pointer is still inside the dragged surface's own PICKUP
       rect, the gesture has not really left home -- resolve to the source
       placement. The grip sits on the panel's top corner, which is also the
       workspace's edge band whenever the panel touches that edge; without
       this guard, pickup itself opened a dock preview whose expansion then
       captured every later hit-test. */
    var pickupRect = gesture && gesture.sourceRect;
    if (pickupRect &&
        clientX >= pickupRect.left && clientX <= pickupRect.left + pickupRect.width &&
        clientY >= pickupRect.top && clientY <= pickupRect.top + pickupRect.height) {
      return gesture.sourceHost;
    }
    /* The edge band is deliberately NARROW and is tested FIRST. Wide bands
       swallow ordinary positional drops (you cannot insert before the first
       surface in home_main); testing surfaces first instead makes a dock
       unreachable, because home_main's first surface already covers the edge. */
    var edge = DRAG_DOCK_EDGE_PX;
    /* RIGHT is tested FIRST: the right column (chat's full-height dock) spans
       all three grid rows, so the top-right and bottom-right corners belong
       to dock_right, not to the top/bottom docks. */
    if (clientX >= bounds.right - edge) return "dock_right";
    if (clientY <= bounds.top + edge) return "dock_top";
    if (clientY >= bounds.bottom - edge) return "dock_bottom";
    if (clientX <= bounds.left + edge) return "dock_left";
    var stack = document.elementsFromPoint ? document.elementsFromPoint(clientX, clientY) : [];
    var hostUnderPointer = null;
    for (var i = 0; i < stack.length; i += 1) {
      var node = stack[i];
      if (!node || !node.closest) continue;
      var surfaceEl = node.closest("[data-pm-home-surface]");
      if (surfaceEl && root.contains(surfaceEl) && surfaceEl !== gesture.element) {
        var owningHost = surfaceEl.closest("[data-pm-home-host]");
        var owningName = owningHost && owningHost.getAttribute("data-pm-home-host");
        if (owningName && owningName !== "floating") return owningName;
      }
      if (!hostUnderPointer) {
        var host = node.closest("[data-pm-home-host]");
        var hostName = host && root.contains(host) && host.getAttribute("data-pm-home-host");
        /* the float layer covers the whole workspace, so it sits in EVERY
           elementsFromPoint stack (gaps, the placeholder itself) -- and
           floating is never a pointer-drag target anyway (explicit action
           only). Skipping it here is what keeps a drop into a gap, or onto
           the previewed slot itself, from silently undocking the surface.
           A host that is only under the pointer because its own drop
           preview EXPANDED it (drop-active, no real surface hit above) is
           skipped too: resolving it would make the preview self-sustaining
           -- the expansion moves the boundary under the pointer and the
           target can never change again. Such hosts stay reachable via
           their edge bands and their real surfaces. */
        if (hostName && hostName !== "floating" &&
            !(host.classList && host.classList.contains("pm-home-drop-active"))) {
          hostUnderPointer = hostName;
        }
      }
    }
    return hostUnderPointer || "home_main";
  }

  /* ---- FLIP: neighbours animate from their pre-move rects ---- */
  function captureSurfaceRects() {
    var map = Object.create(null);
    Object.keys(surfaceRegistry).forEach(function (id) {
      var element = surfaceRegistry[id] && surfaceRegistry[id].element;
      if (!element || !element.isConnected) return;
      var rect = element.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      map[id] = rect;
    });
    return map;
  }

  function flipSurfaces(previous) {
    if (reducedMotion()) return;
    /* Staggered wave: neighbours start their reflow 16ms apart in reading
       order, so a slot change reads as one choreographed motion instead of a
       simultaneous jump. (This runs only on target CHANGES now, so the wave
       is legible; per-frame restarts were the old "jumps around" defect.) */
    var moved = [];
    Object.keys(previous).forEach(function (id) {
      var element = surfaceRegistry[id] && surfaceRegistry[id].element;
      if (!element || !element.isConnected) return;
      var before = previous[id];
      var after = element.getBoundingClientRect();
      var dx = before.left - after.left;
      var dy = before.top - after.top;
      if (!dx && !dy) return;
      moved.push({ element: element, dx: dx, dy: dy, order: after.top * 4096 + after.left });
    });
    moved.sort(function (a, b) { return a.order - b.order; });
    moved.forEach(function (entry, index) {
      var element = entry.element;
      element.style.transition = "none";
      element.style.transform = "translate(" + entry.dx + "px," + entry.dy + "px)";
      var settle = function (event) {
        if (event.target !== element || event.propertyName !== "transform") return;
        element.removeEventListener("transitionend", settle);
        if (!element.style.transform) {
          element.style.removeProperty("transition");
          element.style.removeProperty("transition-delay");
          element.style.removeProperty("transform");
        }
      };
      element.addEventListener("transitionend", settle);
      requestAnimationFrame(function () {
        element.style.transition = "transform var(--pm-home-reflow-dur) var(--pm-home-reflow-ease)";
        element.style.transitionDelay = (index * 16) + "ms";
        element.style.removeProperty("transform");
      });
    });
  }

  function clearFlipResidue() {
    Object.keys(surfaceRegistry).forEach(function (id) {
      var element = surfaceRegistry[id] && surfaceRegistry[id].element;
      if (!element) return;
      element.style.removeProperty("transition");
      element.style.removeProperty("transition-delay");
      element.style.removeProperty("transform");
    });
  }

  /* ---- placeholder ---- */
  /* Creation only: the placeholder's SIZE is projected per-target inside
     syncDragPreview (post-drop fair share of the target host), not the
     surface's pickup-time footprint. */
  function ensurePlaceholder() {
    var placeholder = document.getElementById("pm-home-drop-placeholder");
    if (!placeholder) {
      placeholder = document.createElement("div");
      placeholder.id = "pm-home-drop-placeholder";
      placeholder.className = "pm-home-drop-placeholder pm-home-surface";
      placeholder.setAttribute("aria-hidden", "true");
    }
    return placeholder;
  }

  function clearPlaceholder() {
    var placeholder = document.getElementById("pm-home-drop-placeholder");
    if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
    var hosts = root ? root.querySelectorAll("[data-pm-home-host]") : [];
    Array.prototype.forEach.call(hosts, function (host) { host.classList.remove("pm-home-drop-active"); });
    if (gesture && gesture.previewTrack) { gesture.previewTrack = null; if (committed) syncHostGeometry(committed); }
  }

  /* Seat the placeholder at the live insertion point and reflow the rest.
     Nothing here is a re-render: the surfaces keep their DOM subtrees, which
     is what lets terminals, chat and editors survive a drag intact. */
  function syncDragPreview(host, insertion) {
    if (!gesture || !root) return;
    var previous = captureSurfaceRects();
    var placeholder = ensurePlaceholder();
    var hostEl = hostElement(host);
    if (!hostEl) { clearPlaceholder(); return; }
    var siblings = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(gesture.draft, id);
      return id !== gesture.surfaceId && surface && surface.visible;
    });
    /* Track sizing runs FIRST: an EMPTY dock has a zero-size track, so the
       placeholder fair-share math below must read the host's geometry with
       the track already opened to the incoming surface's band-clamped
       footprint. */
    if (gesture.previewTrack) { syncHostGeometry(gesture.draft); gesture.previewTrack = null; }
    var dockBand = HOST_BANDS[host];
    var trackPx = null;
    if (grid && dockBand) {
      var trackVar = host === "dock_left" ? "--pm-home-left-w" : host === "dock_right" ? "--pm-home-right-w" : host === "dock_top" ? "--pm-home-top-h" : "--pm-home-bottom-h";
      var sourceRect = gesture.sourceRect || {};
      var footprint = hostAxisIsVertical(host) ? sourceRect.width : sourceRect.height;
      trackPx = Math.max(dockBand.min, Math.min(dockBand.max, Math.round(footprint || dockBand.min)));
      grid.style.setProperty(trackVar, trackPx + "px");
      gesture.previewTrack = trackVar;
    }
    /* PROJECTED placeholder: preview the surface's POST-DROP footprint (the
       target host's fair share among its future occupants), never its
       pickup-time size -- dropping a wide main panel into a crowded dock now
       previews the sliver it will actually get. */
    var gapPx = 4; /* keep in lockstep with --pm-home-gap */
    if (hostAxisIsVertical(host)) {
      var mainPxV = Math.max(60, Math.round((hostEl.clientHeight - gapPx * siblings.length) / (siblings.length + 1)));
      placeholder.style.setProperty("flex", "0 0 " + mainPxV + "px", "important");
      /* no min-height: the column dock fills the width for it */
      placeholder.style.removeProperty("min-height");
    } else {
      var mainPx = Math.max(120, Math.round((hostEl.clientWidth - gapPx * siblings.length) / (siblings.length + 1)));
      placeholder.style.setProperty("flex", "0 0 " + mainPx + "px", "important");
      placeholder.style.setProperty("min-height", (trackPx !== null ? trackPx : hostEl.clientHeight) + "px");
    }
    var beforeId = insertion && insertion.insertion_edge === "before" ? insertion.target_surface_instance_id : null;
    if (!beforeId && insertion && typeof insertion.index === "number" && insertion.index < siblings.length) {
      beforeId = siblings[insertion.index];
    }
    var beforeEl = beforeId && surfaceRegistry[beforeId] ? surfaceRegistry[beforeId].element : null;
    /* Surfaces are flex-ordered by their committed slot_index (applySurface
       writes inline `order`), so DOM position alone cannot place the
       placeholder -- it must carry a matching order or it always RENDERS
       first regardless of where it was inserted. Equal order + earlier DOM
       position = renders immediately before the target. */
    if (beforeEl && beforeEl.parentNode === hostEl) {
      placeholder.style.order = beforeEl.style.order || "0";
      hostEl.insertBefore(placeholder, beforeEl);
    } else {
      var maxOrder = 0;
      Array.prototype.forEach.call(hostEl.children, function (child) {
        if (child === placeholder) return;
        var value = parseInt(child.style.order || "0", 10);
        if (value >= maxOrder) maxOrder = value + 1;
      });
      placeholder.style.order = String(maxOrder);
      hostEl.appendChild(placeholder);
    }
    var hosts = root.querySelectorAll("[data-pm-home-host]");
    Array.prototype.forEach.call(hosts, function (node) {
      node.classList.toggle("pm-home-drop-active", node.getAttribute("data-pm-home-host") === host);
    });
    flipSurfaces(previous);
  }

  /* ---- lifted clone ---- */
  function makeLiftedClone(element) {
    var clone = element.cloneNode(true);
    /* Duplicate ids would poison every getElementById lookup for the duration
       of the drag, and duplicate hooks would re-bind handles onto the copy. */
    if (clone.removeAttribute) clone.removeAttribute("id");
    var tagged = clone.querySelectorAll("[id], [data-pm-home-handle], [data-pm-home-resizer], [data-pm-home-surface-options], [data-pm-home-surface]");
    Array.prototype.forEach.call(tagged, function (node) {
      node.removeAttribute("id");
      node.removeAttribute("data-pm-home-handle");
      node.removeAttribute("data-pm-home-resizer");
      node.removeAttribute("data-pm-home-surface-options");
      node.removeAttribute("data-pm-home-surface");
      node.removeAttribute("data-pm-home-drag-bound");
      node.removeAttribute("data-pm-home-resize-bound");
    });
    clone.classList.remove("pm-home-surface");
    clone.classList.add("pm-home-lifted");
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("data-pm-home-lifted", "true");
    return clone;
  }

  function moveClone() {
    if (!gesture || !gesture.clone) return;
    gesture.clone.style.left = (gesture.pointerX - gesture.offsetX) + "px";
    gesture.clone.style.top = (gesture.pointerY - gesture.offsetY) + "px";
  }

  function dragAutoScroll() {
    if (!gesture || gesture.kind !== "move" || !gesture.scroller) return;
    var height = window.innerHeight;
    var delta = 0;
    if (gesture.pointerY < DRAG_EDGE_ZONE_PX) delta = -Math.ceil((DRAG_EDGE_ZONE_PX - gesture.pointerY) / 6);
    else if (gesture.pointerY > height - DRAG_EDGE_ZONE_PX) delta = Math.ceil((gesture.pointerY - (height - DRAG_EDGE_ZONE_PX)) / 6);
    if (delta) {
      gesture.scroller.scrollBy(0, delta);
      applyDragPoint(gesture.pointerX, gesture.pointerY);
    }
    gesture.raf = requestAnimationFrame(dragAutoScroll);
  }

  function findDragScroller() {
    var node = root ? root.parentElement : null;
    while (node && node !== document.documentElement) {
      var styles = window.getComputedStyle(node);
      if (/(auto|scroll|overlay)/.test(styles.overflowY) && node.scrollHeight > node.clientHeight) return node;
      node = node.parentElement;
    }
    return window;
  }

  function beginDrag(surfaceId, event) {
    if (gesture || !committed || (event.button !== undefined && event.button !== 0)) return;
    var surface = surfaceById(committed, surfaceId);
    var record = surfaceRegistry[surfaceId];
    if (!surface || !surface.visible || !record || !record.element) return;
    var element = record.element;
    var rect = element.getBoundingClientRect();
    var lifted = makeLiftedClone(element);
    lifted.style.left = rect.left + "px";
    lifted.style.top = rect.top + "px";
    lifted.style.width = rect.width + "px";
    lifted.style.height = rect.height + "px";
    document.body.appendChild(lifted);
    gesture = {
      kind: "move", surfaceId: surfaceId, pointerId: event.pointerId,
      snapshot: clone(committed), draft: clone(committed), sourceHost: surface.host,
      element: element, clone: lifted, sourceParent: element.parentNode, sourceNext: element.nextSibling,
      offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top,
      pointerX: event.clientX, pointerY: event.clientY,
      changed: false, finished: false, insertion: null, handle: event.currentTarget,
      keyboard: false, scroller: findDragScroller(), raf: 0,
      sourceRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    };
    element.style.setProperty("display", "none", "important");
    document.body.classList.add("pm-home-dragging");
    if (event.currentTarget && event.currentTarget.classList) {
      event.currentTarget.classList.add("pm-home-handle-active");
      event.currentTarget.setAttribute("aria-grabbed", "true");
    }
    /* Capture keeps touch/pen streams bound to the grip; the move/up listeners
       still live on window, NOT on the handle, because live reflow reparents
       nodes and a handle-scoped lostpointercapture would cancel the drag on
       frame one. */
    try { if (event.currentTarget && event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId); } catch (error) {}
    window.addEventListener("pointermove", onDragPointerMove, true);
    window.addEventListener("pointerup", onDragPointerUp, true);
    window.addEventListener("pointercancel", onDragPointerCancel, true);
    window.addEventListener("blur", onDragPointerCancel);
    void lifted.offsetWidth;
    lifted.classList.add("is-lifted");
    applyDragPoint(event.clientX, event.clientY);
    gesture.raf = requestAnimationFrame(dragAutoScroll);
    event.preventDefault();
  }

  function applyDragPoint(clientX, clientY) {
    if (!gesture || gesture.kind !== "move") return;
    gesture.pointerX = clientX;
    gesture.pointerY = clientY;
    moveClone();
    var host = dropHostAt(clientX, clientY);
    var disposition = null;
    if (host && host !== "floating" && host !== gesture.sourceHost && hostFull(host, gesture.surfaceId)) {
      disposition = "host_full";
      host = null;
    } else if (!host) {
      disposition = "invalid_target";
    }
    if (!host) {
      gesture.draft = clone(gesture.snapshot);
      gesture.insertion = null;
      gesture.changed = false;
      gesture.lastTargetKey = null;
      metrics.previewFrameCount += 1;
      clearPlaceholder();
      root.setAttribute("data-pm-home-drop-disposition", disposition);
      return;
    }
    root.removeAttribute("data-pm-home-drop-disposition");
    metrics.previewFrameCount += 1;
    var insertion = insertionAt(host, clientX, clientY, gesture.surfaceId);
    /* The draft rebuild, registry rebuild and preview reflow run ONLY when the
       resolved (host, slot) target actually changes. Re-running them per
       pointermove restarted every neighbour's FLIP transition each frame --
       the board "jumped around" and never settled. */
    var targetKey = host + "|" + (insertion.insertion_edge === "before" ? insertion.target_surface_instance_id : "end" + insertion.index);
    if (host !== "floating" && gesture.lastTargetKey === targetKey) return;
    gesture.lastTargetKey = targetKey;
    var draft = clone(gesture.snapshot);
    if (host === "floating") {
      var rootRect = root.getBoundingClientRect();
      var original = surfaceById(draft, gesture.surfaceId);
      insertion.bounds = clampBounds({
        x: clientX - rootRect.left - gesture.offsetX,
        y: clientY - rootRect.top - gesture.offsetY,
        width: (original.floating_bounds && original.floating_bounds.width) || Math.max(300, original.size.basis_px),
        height: (original.floating_bounds && original.floating_bounds.height) || 300
      });
    }
    var moved = placementFor(draft, gesture.surfaceId, host, insertion);
    if (insertion.bounds) moved.floating_bounds = insertion.bounds;
    gesture.draft = draft;
    gesture.insertion = insertion;
    gesture.targetHost = host;
    gesture.changed = JSON.stringify(gesture.snapshot.surfaces) !== JSON.stringify(draft.surfaces);
    buildHostRegistriesFrom(draft);
    syncDragPreview(host, insertion);
  }

  /* Kept as the public/legacy entry point (PM_HOME_WORKSPACE.updateDrag calls
     it with an event). The clone tracks the pointer 1:1 on every event; the
     hit-test/preview pipeline is coalesced to one pass per animation frame. */
  function updateDrag(event) {
    if (!gesture || gesture.kind !== "move") return;
    if (event.pointerId !== undefined && gesture.pointerId !== undefined && event.pointerId !== gesture.pointerId) return;
    gesture.pointerX = event.clientX;
    gesture.pointerY = event.clientY;
    moveClone();
    if (!gesture.frameQueued) {
      gesture.frameQueued = true;
      requestAnimationFrame(function () {
        if (!gesture || gesture.kind !== "move") return;
        gesture.frameQueued = false;
        applyDragPoint(gesture.pointerX, gesture.pointerY);
      });
    }
    if (event.cancelable) event.preventDefault();
  }

  function onDragPointerMove(event) { updateDrag(event); }
  function onDragPointerUp(event) {
    if (!gesture || gesture.kind !== "move") return;
    if (event.pointerId !== undefined && gesture.pointerId !== undefined && event.pointerId !== gesture.pointerId) return;
    finishDrag(true);
  }
  function onDragPointerCancel() { finishDrag(false); }

  function unlistenDrag() {
    window.removeEventListener("pointermove", onDragPointerMove, true);
    window.removeEventListener("pointerup", onDragPointerUp, true);
    window.removeEventListener("pointercancel", onDragPointerCancel, true);
    window.removeEventListener("blur", onDragPointerCancel);
  }

  function settleClone(node, targetRect) {
    if (!node) return;
    var done = false;
    var finish = function () {
      if (done) return;
      done = true;
      if (node.parentNode) node.parentNode.removeChild(node);
    };
    if (reducedMotion() || !targetRect || (!targetRect.width && !targetRect.height)) { finish(); return; }
    node.style.transition = "left var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "top var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "width var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "height var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "opacity var(--pm-home-drop-dur) var(--pm-home-drop-ease)," +
      "transform var(--pm-home-drop-dur) var(--pm-home-drop-ease)";
    void node.offsetWidth;
    node.style.left = targetRect.left + "px";
    node.style.top = targetRect.top + "px";
    node.style.width = targetRect.width + "px";
    node.style.height = targetRect.height + "px";
    node.style.opacity = "0";
    node.classList.remove("is-lifted");
    node.addEventListener("transitionend", finish);
    setTimeout(finish, 420);
  }

  function finishDrag(shouldCommit) {
    if (!gesture || gesture.kind !== "move" || gesture.finished) return;
    gesture.finished = true;
    var active = gesture;
    gesture = null;
    unlistenDrag();
    if (active.raf) cancelAnimationFrame(active.raf);
    document.body.classList.remove("pm-home-dragging");
    if (root) root.removeAttribute("data-pm-home-drop-disposition");
    if (active.handle && active.handle.classList) {
      active.handle.classList.remove("pm-home-handle-active");
      active.handle.setAttribute("aria-grabbed", "false");
    }
    clearFlipResidue();
    /* Pre-seat the real element where the placeholder previewed it BEFORE the
       commit renders: the post-commit layout is then geometrically identical
       to the preview, so the drop lands with zero jump. */
    if (shouldCommit && active.changed) {
      var seatTarget = document.getElementById("pm-home-drop-placeholder");
      if (seatTarget && seatTarget.parentNode && active.element) {
        seatTarget.parentNode.insertBefore(active.element, seatTarget);
        /* surfaces render by flex order, so seat that too */
        active.element.style.order = seatTarget.style.order || "0";
      }
    }
    clearPlaceholder();
    if (active.element) active.element.style.removeProperty("display");
    if (shouldCommit && active.changed) {
      var after = surfaceById(active.draft, active.surfaceId);
      var dragAffected = changedSurfaceIds(active.snapshot, normalizeLayout(active.draft, null));
      var dragCommandId = after.host === "floating" ? "cmd.panel.undock" : (active.sourceHost === "floating" ? "cmd.panel.redock" : "cmd.workspace_layout.move_surface");
      commitLayout(active.draft, after.host === "floating" ? "undock" : (active.sourceHost === "floating" ? "redock" : "move"), dragCommandId, {
        affected_surface_instance_ids: dragAffected, source_host: active.sourceHost, target_host: after.host, target_slot_index: after.slot_index,
        target_surface_instance_id: active.insertion && active.insertion.target_surface_instance_id, insertion_edge: active.insertion && active.insertion.insertion_edge,
        command_payload: { surface_instance_id: active.surfaceId, source_host: active.sourceHost, target_host: after.host, target_slot_index: after.slot_index, target_surface_instance_id: active.insertion && active.insertion.target_surface_instance_id, insertion_edge: active.insertion && active.insertion.insertion_edge }
      });
      announce(surfaceLabel(active.surfaceId) + " moved to " + hostLabel(after.host) + ", position " + (after.slot_index + 1) + ".");
    } else {
      if (!shouldCommit) metrics.cancelledGestureCount += 1;
      renderLayout(active.snapshot);
      announce(shouldCommit ? "Move cancelled, no change." : "Move cancelled.");
    }
    var landed = active.element && active.element.isConnected ? active.element.getBoundingClientRect() : null;
    settleClone(active.clone, landed);
  }

  /* ---- keyboard move: the grip is the only movement affordance now that the
     per-surface Move/Dock menu rows are retired, so it must work without a
     pointer. Enter/Space picks up, arrows move, Enter drops, Escape reverts. */
  var KEY_HOST_STEPS = {
    home_main: { ArrowLeft: "dock_left", ArrowRight: "dock_right", ArrowUp: "dock_top", ArrowDown: "dock_bottom" },
    dock_left: { ArrowRight: "home_main" },
    dock_right: { ArrowLeft: "home_main" },
    dock_top: { ArrowDown: "home_main" },
    dock_bottom: { ArrowUp: "home_main" },
    floating: { ArrowLeft: "home_main", ArrowRight: "home_main", ArrowUp: "home_main", ArrowDown: "home_main" }
  };

  function beginKeyboardMove(surfaceId, handle) {
    if (gesture || !committed) return false;
    var surface = surfaceById(committed, surfaceId);
    var record = surfaceRegistry[surfaceId];
    if (!surface || !surface.visible || !record || !record.element) return false;
    gesture = {
      kind: "move", surfaceId: surfaceId, pointerId: undefined,
      snapshot: clone(committed), draft: clone(committed), sourceHost: surface.host,
      element: record.element, clone: null, offsetX: 0, offsetY: 0,
      pointerX: 0, pointerY: 0, changed: false, finished: false, insertion: null,
      handle: handle, keyboard: true, targetHost: surface.host, scroller: null, raf: 0
    };
    document.body.classList.add("pm-home-dragging");
    if (handle) { handle.classList.add("pm-home-handle-active"); handle.setAttribute("aria-grabbed", "true"); }
    announce("Moving " + surfaceLabel(surfaceId) + " from " + hostLabel(surface.host) +
      ". Use the arrow keys to choose a place, F to float, Enter to drop, Escape to cancel.");
    return true;
  }

  function keyboardPlace(host, index) {
    if (!gesture || !gesture.keyboard) return;
    var draft = clone(gesture.snapshot);
    var siblings = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(draft, id);
      return id !== gesture.surfaceId && surface && surface.visible;
    });
    var bounded = Math.max(0, Math.min(index, siblings.length));
    var insertion = {
      index: bounded,
      target_surface_instance_id: siblings[bounded] || siblings[siblings.length - 1] || null,
      insertion_edge: siblings[bounded] ? "before" : "after"
    };
    if (host === "floating") {
      var original = surfaceById(draft, gesture.surfaceId);
      insertion.bounds = clampBounds(original.floating_bounds || tiledFloatBounds(draft, gesture.surfaceId));
    }
    var moved = placementFor(draft, gesture.surfaceId, host, insertion);
    if (insertion.bounds) moved.floating_bounds = insertion.bounds;
    gesture.draft = draft;
    gesture.insertion = insertion;
    gesture.targetHost = host;
    gesture.changed = JSON.stringify(gesture.snapshot.surfaces) !== JSON.stringify(draft.surfaces);
    metrics.previewFrameCount += 1;
    buildHostRegistriesFrom(draft);
    if (host !== "floating") syncDragPreview(host, insertion);
    else clearPlaceholder();
    announce(surfaceLabel(gesture.surfaceId) + " over " + hostLabel(host) + ", position " + (bounded + 1) + ".");
  }

  function keyboardStep(key) {
    if (!gesture || !gesture.keyboard) return false;
    var host = gesture.targetHost || gesture.sourceHost;
    var current = surfaceById(gesture.draft, gesture.surfaceId);
    var vertical = hostAxisIsVertical(host);
    var along = vertical ? (key === "ArrowUp" || key === "ArrowDown") : (key === "ArrowLeft" || key === "ArrowRight");
    var siblings = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(gesture.draft, id);
      return id !== gesture.surfaceId && surface && surface.visible;
    });
    var index = Math.max(0, Math.min(current ? current.slot_index : 0, siblings.length));
    if (along && host !== "floating") {
      var next = (key === "ArrowUp" || key === "ArrowLeft") ? index - 1 : index + 1;
      if (next >= 0 && next <= siblings.length) { keyboardPlace(host, next); return true; }
    }
    var stepHost = KEY_HOST_STEPS[host] && KEY_HOST_STEPS[host][key];
    if (stepHost) {
      /* caps hold on the keyboard path too: announce and stay */
      if (stepHost !== gesture.sourceHost && hostFull(stepHost, gesture.surfaceId)) {
        announce(hostLabel(stepHost) + " is full.");
        return true;
      }
      keyboardPlace(stepHost, (hostRegistries[stepHost] || []).length);
      return true;
    }
    return false;
  }

  function bindDragHandle(handle, surfaceId) {
    if (handle.getAttribute("data-pm-home-drag-bound") === "true") return;
    handle.setAttribute("data-pm-home-drag-bound", "true");
    handle.draggable = false;
    handle.addEventListener("dragstart", function (event) { event.preventDefault(); });
    handle.addEventListener("pointerdown", function (event) { beginDrag(surfaceId, event); });
    handle.addEventListener("keydown", function (event) {
      var holding = gesture && gesture.kind === "move" && gesture.keyboard && gesture.surfaceId === surfaceId;
      if (event.key === "Escape") {
        if (holding) { event.preventDefault(); finishDrag(false); }
        return;
      }
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        if (holding) { finishDrag(true); return; }
        if (!beginKeyboardMove(surfaceId, handle)) announce("This surface cannot be moved right now.");
        return;
      }
      if (!holding) return;
      if (event.key === "f" || event.key === "F") { event.preventDefault(); keyboardPlace("floating", 0); return; }
      if (event.key.indexOf("Arrow") === 0) {
        if (keyboardStep(event.key)) event.preventDefault();
      }
    });
  }

  function beginWorkgroupDrag(surfaceId, event) {
    var section = terminalSections[surfaceId];
    if (gesture || !section || !section.terminal_workgroup_id) return;
    gesture = { kind: "workgroup", sourceId: surfaceId, pointerId: event.pointerId, snapshot: clone(committed), draft: clone(committed), targetSectionId: null, targetHost: surfaceById(committed, surfaceId).host, changed: false, handle: event.currentTarget };
    document.body.classList.add("pm-home-dragging");
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch (error) {}
    event.preventDefault();
  }

  function updateWorkgroupDrag(event) {
    if (!gesture || gesture.kind !== "workgroup" || gesture.pointerId !== event.pointerId) return;
    var hit = document.elementFromPoint ? document.elementFromPoint(event.clientX, event.clientY) : event.target;
    var surfaceEl = hit && hit.closest ? hit.closest("[data-pm-home-surface]") : null;
    var targetId = surfaceEl && surfaceEl.getAttribute("data-pm-home-surface");
    var target = targetId && surfaceById(committed, targetId);
    if (!target || target.surface_kind !== "terminal_section" || targetId === gesture.sourceId || terminalSections[targetId].terminal_workgroup_id) targetId = null;
    var targetHost = dropHostAt(event.clientX, event.clientY);
    if (!targetHost) {
      gesture.targetSectionId = null;
      gesture.targetHost = null;
      gesture.changed = false;
      metrics.previewFrameCount += 1;
      clearPlaceholder();
      root.setAttribute("data-pm-home-drop-disposition", "invalid_target");
      event.preventDefault();
      return;
    }
    root.removeAttribute("data-pm-home-drop-disposition");
    gesture.targetSectionId = targetId;
    gesture.targetHost = targetHost;
    gesture.changed = Boolean(targetId) || gesture.targetHost !== surfaceById(gesture.snapshot, gesture.sourceId).host;
    metrics.previewFrameCount += 1;
    event.preventDefault();
  }

  function finishWorkgroupDrag(shouldCommit) {
    if (!gesture || gesture.kind !== "workgroup") return;
    var active = gesture;
    gesture = null;
    document.body.classList.remove("pm-home-dragging");
    if (root) root.removeAttribute("data-pm-home-drop-disposition");
    clearPlaceholder();
    if (shouldCommit && active.changed) {
      activeTerminalSectionId = active.sourceId;
      moveWorkgroupToHost(active.targetHost, active.targetSectionId);
    } else {
      if (!shouldCommit) metrics.cancelledGestureCount += 1;
      renderLayout(active.snapshot);
    }
  }

  function bindWorkgroupHandle(handle, surfaceId) {
    if (handle.getAttribute("data-pm-home-workgroup-bound") === "true") return;
    handle.setAttribute("data-pm-home-workgroup-bound", "true");
    handle.setAttribute("data-pm-home-workgroup-handle", "true");
    handle.draggable = false;
    handle.addEventListener("pointerdown", function (event) { beginWorkgroupDrag(surfaceId, event); });
    handle.addEventListener("pointermove", updateWorkgroupDrag);
    handle.addEventListener("pointerup", function (event) { if (gesture && gesture.pointerId === event.pointerId) finishWorkgroupDrag(true); });
    handle.addEventListener("pointercancel", function () { finishWorkgroupDrag(false); });
    handle.addEventListener("lostpointercapture", function () { if (gesture) finishWorkgroupDrag(false); });
  }

  /* A drag that grows the surface must move the pointer TOWARD the rest of the
     workspace: a right/bottom dock's handle sits on its inner edge, so its
     delta is inverted. */
  function resizeSignFor(host) { return (host === "dock_right" || host === "dock_bottom") ? -1 : 1; }

  /* Clamp band shared with syncHostGeometry, so a drag can actually reach the
     dock-track limits instead of silently discarding most of its range. */
  function resizeBandFor(surface) {
    var band = HOST_BANDS[surface.host];
    if (band) return band;
    return { min: Math.max(160, surface.size.min_width_px || 220), max: 1200 };
  }

  /* The EFFECTIVE minimum degrades to the host's fair share when the row is
     crowded: with hard nominal minimums, a full row wedged every divider and
     the layout could not be repaired by resizing. */
  function effectiveMinPx(host, surfaceId) {
    var nominal = nominalMinPx(surfaceId);
    var hostEl = hostElement(host);
    var reference = (gesture && gesture.draft) || committed;
    var ids = (hostRegistries[host] || []).filter(function (id) {
      var surface = surfaceById(reference, id);
      return surface && surface.visible && !surface.collapsed;
    });
    if (!hostEl || !hostEl.clientWidth || !ids.length) return nominal;
    var fair = Math.floor(hostEl.clientWidth / ids.length);
    return Math.max(80, Math.min(nominal, fair));
  }

  function beginResize(surfaceId, event, options) {
    /* Only another resize blocks a resize. A stranded move/workgroup gesture
       used to lock every grabber in the workspace. */
    if (gesture && gesture.kind === "resize") return;
    if (gesture && gesture.kind === "move") finishDrag(false);
    if (gesture && gesture.kind === "workgroup") finishWorkgroupDrag(false);
    if (gesture) return;
    var surface = surfaceById(committed, surfaceId);
    if (!surface) return;
    gesture = { kind: "resize", surfaceId: surfaceId, snapshot: clone(committed), draft: clone(committed), startX: event && event.clientX || 0, startY: event && event.clientY || 0, startBasis: Number(surface.size.basis_px) || 360, changed: false, cancelled: false, pair: null, corner: Boolean(options && options.corner), track: Boolean(options && options.track), startCross: Number(surface.size.cross_basis_px) || Number(surface.size.basis_px) || 360, startHeight: surface.floating_bounds ? surface.floating_bounds.height : null, startWidth: surface.floating_bounds ? surface.floating_bounds.width : null };
    /* Row-host dividers transfer pixels between the ADJACENT PAIR -- this now
       covers home_main AND the row docks (dock_top/dock_bottom); a TRACK
       gesture (the row dock's full-width handle) never pairs, it drives
       cross_basis_px instead. Freeze every visible sibling's rendered width
       as its flex basis first: with one shared free-space pool, a
       single-basis write was diluted across every sibling's flex-grow, so a
       200px drag moved the pair ~130px and dragged the far dashboard along
       with it. Constant pair sum + px bases on all siblings makes the divider
       px-exact and strictly local. */
    var draftSurface = surfaceById(gesture.draft, surfaceId);
    /* a TRACK gesture starts from the dock's CURRENT rendered thickness (the
       max over its surfaces), not the grabbed surface's own value -- else
       grabbing a shorter sibling's handle snaps the dock on the first move */
    if (gesture.track && draftSurface) {
      var startMax = 0;
      (hostRegistries[draftSurface.host] || []).forEach(function (peerId) {
        var peer = surfaceById(gesture.draft, peerId);
        if (peer && peer.visible) startMax = Math.max(startMax, Number(peer.size.cross_basis_px) || Number(peer.size.basis_px) || 0);
      });
      if (startMax) gesture.startCross = startMax;
    }
    if (draftSurface && !hostAxisIsVertical(draftSurface.host) && draftSurface.host !== "floating" && !(options && options.track)) {
      var rowIds = (hostRegistries[draftSurface.host] || []).filter(function (id) {
        var rowSurface = surfaceById(gesture.draft, id);
        return rowSurface && rowSurface.visible && !rowSurface.collapsed;
      });
      var rowIndex = rowIds.indexOf(surfaceId);
      var nextId = rowIndex !== -1 ? rowIds[rowIndex + 1] : null;
      if (nextId) {
        var sizes = {};
        rowIds.forEach(function (id) {
          var el = surfaceRegistry[id] && surfaceRegistry[id].element;
          var w = el ? Math.round(el.getBoundingClientRect().width) : 0;
          sizes[id] = w;
          var rowSurface = surfaceById(gesture.draft, id);
          if (rowSurface && w) rowSurface.size.basis_px = w;
          if (el && w) el.style.setProperty("flex", "1 1 " + w + "px", "important");
        });
        gesture.pair = { nextId: nextId, startA: sizes[surfaceId] || gesture.startBasis, startB: sizes[nextId] || 0 };
      }
    }
  }

  /* Preview writes ONLY the dragged surface's geometry. The old full
     renderLayout() per pointermove re-ran attachSurfaceControls for every
     surface, which could remove the very handle holding pointer capture. */
  /* Main-axis sizing is written INLINE with `important`. A stylesheet rule
     cannot win here: PM6 blocks that load after pm6-css-dashboard set
     `.editor-pane { flex: 1 }` (and equivalents for the dashboard and chat),
     which flattens flex-basis to 0 and made every resize a visual no-op even
     though the model committed a new basis. */
  function applySurfaceFlex(surface, element) {
    if (!element) return;
    if (surface.host === "floating") { element.style.removeProperty("flex"); return; }
    if (surface.collapsed) { element.style.removeProperty("flex"); return; }
    /* Floor at 80, not the nominal minimum: minimum POLICY lives in the
       resize/normalize layers (fair-share degradation) -- re-clamping here to
       220 fought the degraded bases and forced the row into overflow. */
    var basis = Math.max(80, surface.size.basis_px || 360);
    element.style.setProperty("--pm-home-basis", basis + "px");
    if (hostAxisIsVertical(surface.host)) element.style.setProperty("flex", "1 1 auto", "important");
    else element.style.setProperty("flex", "1 1 " + basis + "px", "important");
  }

  function previewResize(layout, surfaceId) {
    var surface = surfaceById(layout, surfaceId);
    var record = surfaceRegistry[surfaceId];
    var element = record && record.element;
    if (!surface || !element) return;
    applySurfaceFlex(surface, element);
    if (surface.host === "floating" && surface.floating_bounds) {
      element.style.setProperty("width", surface.floating_bounds.width + "px", "important");
      element.style.setProperty("height", surface.floating_bounds.height + "px", "important");
      return;
    }
    if (grid) {
      if (surface.host === "dock_left") grid.style.setProperty("--pm-home-left-w", surface.size.basis_px + "px");
      if (surface.host === "dock_right") grid.style.setProperty("--pm-home-right-w", surface.size.basis_px + "px");
      /* row docks preview their TRACK from cross_basis_px */
      if (surface.host === "dock_top") grid.style.setProperty("--pm-home-top-h", (Number(surface.size.cross_basis_px) || surface.size.basis_px) + "px");
      if (surface.host === "dock_bottom") grid.style.setProperty("--pm-home-bottom-h", (Number(surface.size.cross_basis_px) || surface.size.basis_px) + "px");
    }
  }

  function updateResize(surfaceId, event) {
    if (!gesture || gesture.kind !== "resize" || gesture.surfaceId !== surfaceId) return;
    var surface = surfaceById(gesture.draft, surfaceId);
    /* Row-dock TRACK gesture: vertical drag moves the dock's cross-axis
       track (cross_basis_px), band-clamped; the per-surface widths are
       untouched. */
    if (gesture.track) {
      var rawT = (event.clientY - gesture.startY) * resizeSignFor(surface.host);
      var bandT = HOST_BANDS[surface.host];
      if (bandT) {
        var trackPxNext = Math.max(bandT.min, Math.min(bandT.max, Math.round(gesture.startCross + rawT)));
        /* the dock TRACK is a host-level dimension; syncHostGeometry takes
           max(cross_basis_px) over the dock, so every visible surface in the
           host must carry the new value or a taller sibling silently pins
           the track and the drag looks dead */
        (hostRegistries[surface.host] || []).forEach(function (siblingId) {
          var sibling = surfaceById(gesture.draft, siblingId);
          if (sibling && sibling.visible) sibling.size.cross_basis_px = trackPxNext;
        });
        gesture.changed = trackPxNext !== gesture.startCross;
        metrics.previewFrameCount += 1;
        previewResize(gesture.draft, surfaceId);
      }
      return;
    }
    if (gesture.pair && !hostAxisIsVertical(surface.host) && surface.host !== "floating") {
      var rawA = event.clientX - gesture.startX;
      var minA = effectiveMinPx(surface.host, surfaceId);
      var minB = effectiveMinPx(surface.host, gesture.pair.nextId);
      var total = gesture.pair.startA + gesture.pair.startB;
      var sizeA = Math.max(minA, Math.min(total - minB, gesture.pair.startA + rawA));
      var sizeB = total - sizeA;
      surface.size.basis_px = Math.round(sizeA);
      var partner = surfaceById(gesture.draft, gesture.pair.nextId);
      if (partner) partner.size.basis_px = Math.round(sizeB);
      gesture.changed = Math.round(sizeA) !== Math.round(gesture.pair.startA);
      metrics.previewFrameCount += 1;
      var elA = surfaceRegistry[surfaceId] && surfaceRegistry[surfaceId].element;
      var elB = surfaceRegistry[gesture.pair.nextId] && surfaceRegistry[gesture.pair.nextId].element;
      if (elA) elA.style.setProperty("flex", "1 1 " + Math.round(sizeA) + "px", "important");
      if (elB) elB.style.setProperty("flex", "1 1 " + Math.round(sizeB) + "px", "important");
      return;
    }
    var horizontal = surface.host !== "dock_top" && surface.host !== "dock_bottom";
    var raw = horizontal ? event.clientX - gesture.startX : event.clientY - gesture.startY;
    var delta = raw * resizeSignFor(surface.host);
    var band = resizeBandFor(surface);
    surface.size.basis_px = Math.max(band.min, Math.min(band.max, gesture.startBasis + delta));
    if (surface.host === "floating") {
      var bounds = clone(surface.floating_bounds || { x: 24, y: 24, width: gesture.startBasis, height: 300 });
      /* seed from the CURRENT floating width: basis_px carries the docked
         row basis (rewritten by home_main normalization), so using it here
         made a shrink drag GROW a float whose rendered width differed */
      bounds.width = Math.max(240, Math.min(rootBounds().width - bounds.x - 8, (gesture.startWidth || gesture.startBasis) + delta));
      /* the corner handle drives BOTH axes; the edge handle stays width-only */
      if (gesture.corner) {
        var rawY = event.clientY - gesture.startY;
        var startH = gesture.startHeight || bounds.height || 300;
        bounds.height = Math.max(180, Math.min(rootBounds().height - bounds.y - 8, startH + rawY));
      }
      surface.floating_bounds = clampBounds(bounds);
    }
    gesture.changed = JSON.stringify(gesture.snapshot.surfaces) !== JSON.stringify(gesture.draft.surfaces);
    metrics.previewFrameCount += 1;
    previewResize(gesture.draft, surfaceId);
  }

  function finishResize() {
    if (!gesture || gesture.kind !== "resize") return;
    var active = gesture;
    gesture = null;
    if (active.cancelled) { metrics.cancelledGestureCount += 1; renderLayout(active.snapshot); return; }
    if (!active.changed) { renderLayout(active.snapshot); return; }
    var before = surfaceById(active.snapshot, active.surfaceId);
    var after = surfaceById(active.draft, active.surfaceId);
    commitLayout(active.draft, "resize_commit", "cmd.workspace_layout.resize_surface", {
      skip_render: true,
      affected_surface_instance_ids: active.pair ? [active.surfaceId, active.pair.nextId] : [active.surfaceId], source_host: before.host, target_host: after.host,
      command_payload: { surface_instance_id: active.surfaceId, width_px: after.host === "floating" && after.floating_bounds ? after.floating_bounds.width : after.size.basis_px, height_px: after.host === "floating" && after.floating_bounds ? after.floating_bounds.height : ((after.host === "dock_top" || after.host === "dock_bottom") ? (Number(after.size.cross_basis_px) || null) : null), flex_weight: after.size.flex_weight }
    });
  }

  function cancelResizeGesture() {
    if (!gesture || gesture.kind !== "resize") return;
    gesture.cancelled = true;
    if (typeof window.PM_CANCEL_RESIZER === "function") {
      try { window.PM_CANCEL_RESIZER(); } catch (error) {}
    }
    if (gesture && gesture.kind === "resize") finishResize();
  }

  function bindResizer(resizer, surfaceId, options) {
    if (resizer.getAttribute("data-pm-home-resize-bound") === "true") return;
    resizer.setAttribute("data-pm-home-resize-bound", "true");
    var cancelled = false;
    resizer.addEventListener("pointercancel", function () { cancelled = true; if (gesture && gesture.kind === "resize") gesture.cancelled = true; }, true);
    resizer.addEventListener("lostpointercapture", function () { cancelled = true; if (gesture && gesture.kind === "resize") gesture.cancelled = true; }, true);
    if (typeof window.registerResizer === "function") {
      window.registerResizer(resizer, {
        isHorizontal: !resizer.classList.contains("resizer-row"),
        onStart: function (event) { cancelled = false; beginResize(surfaceId, event, options); },
        onMove: function (event) { updateResize(surfaceId, event); },
        onEnd: function () { if (gesture && gesture.kind === "resize") gesture.cancelled = gesture.cancelled || cancelled; finishResize(); }
      });
    }
  }

  function installTitlebarHomeControl() {
    var themeWrap = document.getElementById("themeMenuWrap");
    if (!themeWrap || document.getElementById("pm-home-more-btn")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "pm6-tb-menu-trigger pm-home-titlebar-more";
    button.id = "pm-home-more-btn";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "pm-home-more-menu");
    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-label", "Home more options");
    button.title = "Home more options";
    button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>';
    themeWrap.parentNode.insertBefore(button, themeWrap);
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var menu = document.getElementById("pm-home-more-menu");
      if (menuState.main === menu) closeAllMenus(true); else openMainMenu(menu, button);
    });
    button.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMainMenu(document.getElementById("pm-home-more-menu"), button);
        setTimeout(function () { focusMenuItem(document.getElementById("pm-home-more-menu"), 0); }, 0);
      }
    });
  }

  function installSettingsReset() {
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest ? event.target.closest('.s4-row[data-sid="general.startup.reset-home-layout"] .s4-action') : null;
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var result = resetLayout();
      button.textContent = result && result.ok ? "Reset" : "Unavailable";
      if (typeof window.toast === "function") window.toast(result && result.ok ? "Home workspace layout reset" : "Home workspace layout could not be reset");
    }, true);
    if (window.MutationObserver) {
      var observer = new MutationObserver(function () {
        document.querySelectorAll('.s4-row[data-sid="general.startup.reset-home-layout"] .s4-action').forEach(function (button) {
          if (!button.classList.contains("s4-working") && button.textContent !== "Reset") button.textContent = "Reset";
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  function wireMenus() {
    document.querySelectorAll(".pm-home-portal").forEach(function (menu) {
      menu.addEventListener("keydown", menuKeydown);
      menu.addEventListener("pointerdown", function (event) { event.stopPropagation(); });
      menu.addEventListener("click", function (event) {
        event.stopPropagation();
        var submenu = event.target.closest ? event.target.closest("[data-pm-home-submenu]") : null;
        if (submenu) { event.preventDefault(); openFlyout(document.getElementById(submenu.getAttribute("data-pm-home-submenu")), submenu, false); return; }
        var action = event.target.closest ? event.target.closest("[data-pm-home-action]") : null;
        if (action) { event.preventDefault(); handleAction(action); }
      });
    });
    var topMenu = document.getElementById("pm-home-more-menu");
    if (topMenu) {
      topMenu.querySelectorAll("[data-pm-home-submenu]").forEach(function (row) {
        row.addEventListener("mouseenter", function () { scheduleFlyout(row); });
        row.addEventListener("mouseleave", function () { if (menuState.hoverTimer) { clearTimeout(menuState.hoverTimer); menuState.hoverTimer = null; } });
      });
    }
    [document.getElementById("pm-home-open-panel-flyout"), document.getElementById("pm-home-open-browser-flyout"), document.getElementById("pm-home-file-panel-menu")].forEach(function (menu) {
      if (!menu) return;
      menu.addEventListener("mouseenter", function () { if (menuState.hoverTimer) { clearTimeout(menuState.hoverTimer); menuState.hoverTimer = null; } });
      menu.addEventListener("mouseleave", function () { menuState.hoverTimer = setTimeout(function () { closeFlyout(false); }, 140); });
    });
    document.addEventListener("pointerdown", function (event) {
      if (!menuState.main && !menuState.flyout) return;
      if (event.target.closest && event.target.closest(".pm-home-portal, #pm-home-more-btn, [data-pm-home-surface-options], [data-pm-home-file-submenu]")) return;
      closeAllMenus(false);
    }, true);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && (menuState.main || menuState.flyout)) { event.preventDefault(); closeAllMenus(true); return; }
      if (event.key !== "Escape" || !gesture) return;
      if (gesture.kind === "move") finishDrag(false);
      else if (gesture.kind === "workgroup") finishWorkgroupDrag(false);
      else cancelResizeGesture();
    }, true);
  }

  function wireActions() {
    document.addEventListener("click", function (event) {
      var bottomCollapse = event.target && event.target.closest ? event.target.closest("#collapseBottom, [data-pm-home-collapse-toggle]") : null;
      if (bottomCollapse && bottomCollapse.closest("#pm-home-workspace")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        /* Toggle, then read the POST-commit state: the old code negated the
           value for the command but reported the pre-mutation value to
           aria-expanded, so the control always announced the wrong state. */
        toggleBottomTerminalCollapsed();
        var settled = eligibleBottomTerminal(committed);
        if (settled) {
          var settledEl = surfaceRegistry[settled.surface_instance_id] && surfaceRegistry[settled.surface_instance_id].element;
          syncCollapseControl(settled, settledEl);
          announce(settled.collapsed ? "Bottom terminal collapsed." : "Bottom terminal expanded.");
        }
        return;
      }
      var surfaceMenuButton = event.target && event.target.closest ? event.target.closest("[data-pm-home-surface-options]") : null;
      if (surfaceMenuButton) { event.preventDefault(); openSurfaceMenu(surfaceMenuButton, surfaceMenuButton.getAttribute("data-pm-home-surface-options")); return; }
      var localAction = event.target && event.target.closest ? event.target.closest("#pm-home-workspace [data-pm-home-action]") : null;
      if (localAction) { event.preventDefault(); event.stopImmediatePropagation(); handleAction(localAction); return; }
      var browserTab = event.target && event.target.closest ? event.target.closest("[data-pm-home-browser-tab]") : null;
      if (browserTab) { event.preventDefault(); openBrowser(browserTab.getAttribute("data-pm-home-browser-tab")); }
      var codeTab = event.target && event.target.closest ? event.target.closest("[data-pm-home-surface] .editor-tabs .tab[data-file]") : null;
      if (codeTab) {
        var surfaceEl = codeTab.closest("[data-pm-home-surface]");
        var surfaceId = surfaceEl && surfaceEl.getAttribute("data-pm-home-surface");
        if (surfaceId && browserOwner.target_editor_panel_id === surfaceId) {
          browserOwner.target_editor_panel_id = null;
          var content = document.getElementById("browserTabContent");
          if (content) content.style.display = "none";
          surfaceEl.querySelectorAll(".editor-area").forEach(function (area) { area.style.display = "flex"; });
        }
        /* Generated shells (panels 3/4) have no PM6 tab controller of their
           own: activate the clicked tab and render its buffer here. */
        if (surfaceId && surfaceEl.classList.contains("pm-home-editor-shell")) {
          var clickedFile = codeTab.getAttribute("data-file");
          if (clickedFile) {
            renderFileIntoPanel(surfaceId, clickedFile);
            Array.prototype.forEach.call(codeTab.parentNode.querySelectorAll(".tab"), function (tab) {
              tab.classList.toggle("active", tab === codeTab);
            });
            if (editorOwners[surfaceId] && buffersByPath[clickedFile]) editorOwners[surfaceId].active_buffer_id = buffersByPath[clickedFile];
          }
        }
      }
    }, true);
    /* Chat visibility reconciles on the BUBBLE phase, after PM6's own toggle
       has run. Intercepting it in capture with stopImmediatePropagation used to
       skip the base bookkeeping (mount layout, split refit, rail state), and
       the model then re-applied `.hidden` on the next render -- the two states
       fought and chat ended up neither open nor properly closed. */
    document.addEventListener("click", function (event) {
      var chatToggle = event.target && event.target.closest ? event.target.closest('.activity-bar .icon[title="Chat"]') : null;
      if (!chatToggle) return;
      var panel = document.getElementById("chatPanel");
      if (!panel) return;
      var visible = !panel.classList.contains("hidden");
      var chatSurface = surfaceById(committed, "chat");
      if (chatSurface && chatSurface.visible === visible) return;
      setSurfaceVisible("chat", visible, "cmd.panel.switch");
    }, false);
    document.addEventListener("keydown", function (event) {
      var browserTab = event.target && event.target.closest ? event.target.closest("[data-pm-home-browser-tab]") : null;
      if (browserTab && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openBrowser(browserTab.getAttribute("data-pm-home-browser-tab")); }
    });
  }

  function mountWorkspace() {
    var page = document.getElementById("panel-dashboard");
    if (!page || !root) return false;
    page.classList.add("pm-home-owned");
    page.appendChild(root);
    var editorView = document.getElementById("editorView");
    var pane1 = document.getElementById("editorPane1");
    var pane2 = document.getElementById("editorPane2");
    var dashboard = document.getElementById("dashboardView");
    var bottom = document.getElementById("bottomPanel");
    var chat = document.getElementById("chatPanel");
    if (pane1) hostElement("home_main").appendChild(pane1);
    if (pane2) hostElement("home_main").appendChild(pane2);
    if (dashboard) hostElement("home_main").appendChild(dashboard);
    if (bottom) hostElement("dock_bottom").appendChild(bottom);
    if (chat) hostElement("dock_right").appendChild(chat);
    if (editorView) editorView.style.setProperty("display", "none", "important");
    ["editorSplitResizer", "editorDashResizer", "terminalResizer", "chatResizer"].forEach(function (id) {
      var element = document.getElementById(id);
      if (element) element.style.setProperty("display", "none", "important");
    });
    return true;
  }

  function identitySnapshot() {
    var buffers = Object.keys(buffersByPath).map(function (path) { return { path: path, buffer_id: buffersByPath[path] }; });
    var terminals = Object.keys(terminalSections).map(function (id) { return clone(Object.assign({ surface_instance_id: id }, terminalSections[id])); });
    var renderedTerminalPanes = Array.prototype.slice.call(document.querySelectorAll('#bottomTerminalHost .terminal-pane[data-terminal-pane-id]')).map(function (pane) {
      return { terminal_pane_id: pane.getAttribute("data-terminal-pane-id"), terminal_session_id: pane.getAttribute("data-terminal-session-id"), element_count: document.querySelectorAll('[data-terminal-pane-id="' + pane.getAttribute("data-terminal-pane-id") + '"]').length };
    });
    return { editors: clone(editorOwners), buffers: buffers, browser: clone(browserOwner), terminals: terminals, rendered_terminal_panes: renderedTerminalPanes };
  }

  function identityIntegrity() {
    var snapshot = identitySnapshot();
    var panelIds = Object.keys(snapshot.editors);
    var groups = panelIds.map(function (id) { return snapshot.editors[id].editor_group_id; });
    var bufferIds = snapshot.buffers.map(function (buffer) { return buffer.buffer_id; });
    var paneIds = [];
    var sessionIds = [];
    snapshot.terminals.forEach(function (section) { paneIds = paneIds.concat(section.pane_ids); sessionIds = sessionIds.concat(section.terminal_session_ids); });
    function unique(values) { return new Set(values).size === values.length; }
    var renderedIds = snapshot.rendered_terminal_panes.map(function (pane) { return pane.terminal_pane_id; });
    var renderedSessions = snapshot.rendered_terminal_panes.map(function (pane) { return pane.terminal_session_id; });
    var renderedOwner = paneIds.every(function (id) { return renderedIds.indexOf(id) !== -1; }) && sessionIds.every(function (id) { return renderedSessions.indexOf(id) !== -1; }) && snapshot.rendered_terminal_panes.every(function (pane) { return pane.element_count === 1; });
    return { ok: unique(panelIds) && unique(groups) && unique(bufferIds) && unique(paneIds) && unique(sessionIds) && renderedOwner, editor_panel_ids_unique: unique(panelIds), editor_group_ids_unique: unique(groups), buffer_ids_unique: unique(bufferIds), terminal_pane_ids_unique: unique(paneIds), terminal_session_ids_unique: unique(sessionIds), rendered_terminal_owner_bound: renderedOwner };
  }

  /* The chat engine rebuilds #chatPanel with `innerHTML = CHAT_TEMPLATE(...)`
     and the editor tab renderers rebuild `.editor-tabs` from state -- both
     destroy the grip, kebab and collapse chevron mounted inside them. Re-seat
     the chrome whenever a claimed surface's subtree is rebuilt, rather than
     hoping the 250ms/1000ms boot catch-ups land after the last re-render. */
  var chromeWatch = { observer: null, queued: false, busy: false, watched: null };

  function reseatSurfaceChrome() {
    chromeWatch.queued = false;
    if (!committed || gesture) return;
    chromeWatch.busy = true;
    try {
      committed.surfaces.forEach(function (surface) {
        if (!surface.visible) return;
        var record = surfaceRegistry[surface.surface_instance_id];
        if (!record || !record.element || !record.element.isConnected) return;
        attachSurfaceControls(surface);
        syncCollapseControl(surface, record.element);
      });
    } finally {
      chromeWatch.busy = false;
    }
  }

  function queueChromeReseat() {
    if (chromeWatch.queued || chromeWatch.busy) return;
    chromeWatch.queued = true;
    requestAnimationFrame(reseatSurfaceChrome);
  }

  function watchSurfaceChrome() {
    if (typeof MutationObserver !== "function") return;
    if (!chromeWatch.observer) {
      chromeWatch.observer = new MutationObserver(function (records) {
        if (chromeWatch.busy || gesture) return;
        for (var i = 0; i < records.length; i += 1) {
          var target = records[i].target;
          /* ignore our own re-seating and the lifted drag clone */
          if (target && target.closest && target.closest("[data-pm-home-lifted]")) continue;
          queueChromeReseat();
          return;
        }
      });
    }
    chromeWatch.observer.disconnect();
    chromeWatch.watched = [];
    Object.keys(surfaceRegistry).forEach(function (id) {
      var element = surfaceRegistry[id] && surfaceRegistry[id].element;
      if (!element || !element.isConnected) return;
      chromeWatch.observer.observe(element, { childList: true, subtree: true });
      chromeWatch.watched.push(id);
    });
  }

  function init() {
    root = document.getElementById("pm-home-workspace");
    grid = document.getElementById("pm-home-host-grid");
    if (!root || !grid || !mountWorkspace()) return;
    committed = readLayout();
    committed = demoteFloatingAtBoot(committed);
    restoreOwnerRefs(committed);
    restoreFocusSequence(committed);
    installTitlebarHomeControl();
    installFileManagerOpenTargets();
    installSettingsReset();
    wireMenus();
    wireActions();
    document.querySelectorAll(".pane-header-drag").forEach(function (legacyHandle) { legacyHandle.draggable = false; });
    watchSurfaceChrome();
    /* Escape cancels a POINTER drag too. The handle's own keydown only fires
       while it holds focus, which a pointer drag does not guarantee. */
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !gesture) return;
      if (gesture.kind === "move") { event.preventDefault(); finishDrag(false); }
      else if (gesture.kind === "workgroup") { event.preventDefault(); finishWorkgroupDrag(false); }
      else if (gesture.kind === "resize") { event.preventDefault(); cancelResizeGesture(); }
    }, true);
    /* Workgroup drags ride these document listeners. Surface MOVE drags do
       NOT: beginDrag installs its own window-level capture listeners, and
       running both meant every pointermove was processed twice. */
    document.addEventListener("pointermove", function (event) { updateWorkgroupDrag(event); }, { passive: false });
    document.addEventListener("pointerup", function (event) {
      if (gesture && gesture.kind === "workgroup" && gesture.pointerId === event.pointerId) finishWorkgroupDrag(true);
    });
    document.addEventListener("pointercancel", function () {
      if (gesture && gesture.kind === "workgroup") finishWorkgroupDrag(false);
      else if (gesture && gesture.kind === "resize") cancelResizeGesture();
    });
    window.addEventListener("blur", function (event) {
      /* Capture-phase, so ELEMENT blurs pass through here too. Only a blur of
         the window itself cancels: beginDrag hides the dragged surface, which
         blurs a focused grip inside it, and that element blur used to kill
         the drag on frame one (a drag begun on a focused grip -- chat's
         out-of-the-box state -- cancelled instantly). */
      if (event && event.target !== window) return;
      if (gesture && gesture.kind === "move") finishDrag(false);
      else if (gesture && gesture.kind === "workgroup") finishWorkgroupDrag(false);
      else if (gesture && gesture.kind === "resize") cancelResizeGesture();
    }, true);
    window.addEventListener("resize", function () {
      if (!gesture && committed) { normalizeMainRowBases(committed); syncHostGeometry(committed); }
    });
    /* One render, inside DOMContentLoaded, before first paint. The old 250ms
       and 1000ms catch-up renders caused a visible double relayout at boot;
       late PM6 rebuilds are chromeWatch's job now. */
    renderLayout(committed);
    queueChromeReseat();
    window.PM_HOME_WORKSPACE = api;
  }

  var api = {
    schema_id: "pm.home_workspace_layout.v1",
    storage_key: STORAGE_KEY,
    hosts: HOSTS.slice(),
    editor_panel_ids: EDITOR_IDS.slice(),
    get layout() { return clone(committed); },
    get draft_layout() { return gesture ? clone(gesture.draft) : null; },
    get surface_registry() {
      var out = {};
      Object.keys(surfaceRegistry).forEach(function (id) { out[id] = { id: surfaceRegistry[id].id, kind: surfaceRegistry[id].kind, element_id: surfaceRegistry[id].element && surfaceRegistry[id].element.id }; });
      return out;
    },
    get host_registries() { return clone(hostRegistries); },
    get terminal_workgroups() { return clone(terminalSections); },
    get active_terminal_section_id() { return activeTerminalSectionId; },
    get command_log() { return clone(commandLog); },
    get event_log() { return clone(eventLog); },
    get receipt_log() { return clone(receiptLog); },
    get metrics() { return clone(metrics); },
    get browser() { return clone(browserOwner); },
    get identities() { return identitySnapshot(); },
    identityIntegrity: identityIntegrity,
    openPanel: openPanel,
    closePanel: closePanel,
    setSurfaceVisible: setSurfaceVisible,
    moveSurface: moveSurface,
    popOutPanel: popOutPanel,
    popOutChat: popOutChat,
    moveWorkgroup: function (host) { return moveWorkgroupToHost(host || "home_main", null); },
    setCollapsed: setSurfaceCollapsed,
    reset: resetLayout,
    openBrowser: openBrowser,
    openFileInPanel: openFileInPanel,
    splitTerminalPane: splitTerminalPane,
    setTerminalPaneCount: setTerminalPaneCount,
    validate: function (value) { return validateLayout(value || committed); },
    recover: function (reason) {
      var next = normalizeLayout(null, reason || "manual_recovery");
      next.layout_revision = committed.layout_revision;
      return commitLayout(next, "recovery", "cmd.workspace_layout.reset", { affected_surface_instance_ids: next.surfaces.map(function (surface) { return surface.surface_instance_id; }) });
    },
    failNextPersistenceWrite: function () { faults.failNextWrite = true; },
    beginDrag: beginDrag,
    updateDrag: updateDrag,
    commitDrop: function () { finishDrag(true); },
    cancelDrag: function () { finishDrag(false); },
    beginResize: beginResize,
    updateResize: updateResize,
    commitResize: finishResize,
    cancelResize: cancelResizeGesture
  };

  function safeInit() {
    try { init(); }
    catch (error) {
      window.PM_HOME_INIT_ERROR = { name: String(error && error.name || "Error"), message: String(error && error.message || error) };
      try { console.error("[pm-home] initialization failed", error); } catch (ignored) {}
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safeInit);
  else setTimeout(safeInit, 0);
})();
'''


# The band runs from the legacy pane-swap comment up to the start of the
# editor-tab drag-reorder block, which is the anchor that must survive.
LEGACY_SURFACE_DND_PATTERN = (
    r"\n[ \t]*// Setup Drag & Drop for Panels.*?"
    r"\n[ \t]*/\* -+ editor tab drag-reorder \(delegated\)"
)
LEGACY_SURFACE_DND_ANCHOR = "/* ---------- editor tab drag-reorder (delegated) ----------------------"
