# GUI Tweaks & Advanced Layout Plan

**Objective:**
Transform the `Concepts/PuppetMasterDashComp.html` prototype into a highly flexible, premium dockable workspace. Introduce advanced layout management, grid-based dashboard widgets, multiple dashboard tabs, and fix remaining resizing and tab interaction issues.

## Requirements & Revisions

### 1. Dashboard Toggle & Left Bar Icon
- **Top Icon:** Add a "Dashboard" icon to the very top of the `.activity-bar` (above Chat). 
- **Toggle Behavior:** Clicking this Dashboard icon toggles the visibility of the Dashboard view on and off, similar to how the Chat icon works. It does not replace the left side-panel content.
- **Space Claiming:** When the Dashboard is toggled off, its allocated space yields to the Editor/Terminals. Toggling it on squishes the other panes to reclaim space.
- **Rename Page:** Rename the "Dashboard" tab in the top `.title-bar` (the main page tabs) to "Home".

### 2. Dashboard Layout & Tabs
- **Dashboard Header:** 
  - Left side: Add draggable tabs (e.g., "Main", "Metrics", "Monitoring") similar to the editor tabs, but without the close "x" buttons.
  - Right side: Remove the duplicate "Add Widget" buttons. Keep only a single "Customize" button.
- **Tab Functionality:** The conceptual intent is that these tabs allow multiple Dashboard layouts. The Customize button lets you edit the current tab's info and layout. This should conceptually persist.
- **Premium Widget Bento Grid:** 
  - Transition `.dashboard-grid` to an absolute-positioned or Masonry-style "invisible grid" mimicking iOS widgets.
  - Widgets have fixed dimensions (1x1, 2x1, 2x2) and do *not* stretch. The grid reflows (wraps) widgets cleanly.
  - Give widgets a serious visual upgrade (premium typography, polished layout).
  - Add a settings gear icon (SVG) to each widget on hover to configure its size and contents.

### 3. Dockable Layout Engine (Editors, Terminals, Dashboard)
- **Fluid Layout:** Implement a dockable layout concept where the major panes (Editor, Dashboard, Terminal) can be reordered by dragging their header bars (e.g., moving Terminal to the side).

### 4. Advanced Terminal Resizing
- **Internal Splitters:** Implement horizontal and vertical resizer columns/rows (`.resizer-col`, `.resizer-row`) *between* the internal `.terminal-pane` instances in the `.terminal-grid` to allow individual terminal resizing.

### 5. Editor Tab Tearing & Fake Data
- **Tab Dragging:** Enable HTML5 Drag & Drop on the editor `.tab` elements. Dragging a tab to another `.editor-pane` should move it. Dragging it to empty space should spawn a new pane. Side-by-side editing must work flawlessly.
- **Enhanced Fake Data:** Update the file click handler to inject rich, multi-line, syntax-highlighted (simulated) fake data tailored to common file extensions (`.rs`, `Cargo.toml`, `README.md`, etc.).

### 6. Chat Resizer Fix
- **Structural Check:** Fix the `#chatResizer` logic by correcting the CSS flex-basis and positioning. Ensure that dragging the left edge of the Chat panel strictly resizes it horizontally without snapping back.

### 7. Strict Constraints
- **No Emojis:** Rely exclusively on high-quality SVGs.
- **Animations:** Ensure all state changes (hiding/showing panes, dragging tabs, reordering widgets) use smooth CSS transitions.

## Implementation Steps
1. **Activity Bar & Top Bar:** Add Dashboard icon to the top of `.activity-bar` and rename "Dashboard" to "Home" in `.page-tabs`. Update JS toggle logic.
2. **Dashboard Header & Grid:** Add tabs to the left side of the dashboard header, keep only "Customize" on the right. Refactor `.widget-card` CSS for the iOS-style grid and add gear SVGs.
3. **Layout Restructuring:** Ensure the main area uses flexible layout containers that adapt when Dashboard is hidden/shown.
4. **Internal Resizers:** Inject resizers inside `.terminal-grid` and bind JS.
5. **JS Drag & Drop:** Write the drag-start, drag-over, and drop event listeners for Editor Tabs.
6. **JS File Generation:** Expand `fileItem` click logic to return file-specific fake code.
7. **Chat Resizer Logic:** Correct the JS DOM bindings and CSS for `.chat-panel`.