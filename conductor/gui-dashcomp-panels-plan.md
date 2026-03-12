# GUI Polish & Deep Functional Fixes

**Objective:**
Address critical layout DOM bugs, ensure robust dashboard tabs, fix editor tab drag-and-drop lifecycles, and properly restore chat window docking and resizing.

## Requirements & Revisions

### 1. Fix Broken DOM Tree (Projects Page visibility)
- **Diagnosis:** The `.page-dashboard` `<div>` was missing its closing tag after the recent bento grid refactor. This caused `.page-projects` to be incorrectly nested inside `.page-dashboard`, breaking the main navigation logic.
- **Fix:** Insert the missing `</div>` directly before the `.page-projects` div. 

### 2. Fix Chat Panel Layout & Resizing
- **Diagnosis:** The `.chat-resizer` and `.chat-panel` were pushed entirely outside the `.app-shell` hierarchy, placing them below the footer, which broke all horizontal flexbox sizing.
- **Fix:** Move `.chat-resizer` and `.chat-panel` back inside `.center-row`, placed exactly after `.content-wrapper` closes. The resizer JS logic is already sound, but fixing the DOM placement will make it function perfectly again.

### 3. Fleshed-out Dashboard Tabs (Main, Metrics, Monitoring)
- **Diagnosis:** The dashboard tabs currently only swap active visual states, but they don't change the underlying widgets.
- **Fix:** 
  - Create three distinct `.bento-dashboard` grids (`#dashGridMain`, `#dashGridMetrics`, `#dashGridMonitoring`).
  - Populate "Metrics" with mock performance line charts, cost/token usage graphs, and SLA badges (using styled HTML/CSS, no emojis).
  - Populate "Monitoring" with mock server health nodes, active Docker swarms, and memory allocation bars.
  - Update the dashboard tabs JS to toggle the visibility (`display: flex` vs `display: none`) of these specific grid containers.

### 4. Fix Editor Tab Tearing & Closing
- **Diagnosis:** When a tab is dropped, `draggedFilename` is extracted correctly, but recreating the tab using raw innerHTML loses the `*` dot indicator, and there might be CSS stacking contexts hiding the SVG close button.
- **Fix:** 
  - Refactor the Drag & Drop JS: Instead of destroying and recreating the tab via innerHTML, we will directly `appendChild` the *actual* DOM node of the dragged tab into the new pane. This perfectly preserves all attached event listeners (like `dragstart`), inner SVGs, and text nodes, permanently fixing the "disappearing close button" bug.
  - Ensure the empty pane placeholder text handles moving the last tab cleanly.

### 5. Terminal "Collapse" Sizing Fix
- **Diagnosis:** The terminal's collapse button toggles a class, but inline flex styles applied by the resizer override it.
- **Fix:** Ensure that when `#bottomPanel` has the `.collapsed` class, it forces `flex: none !important; height: 24px !important;` overriding any inline styles set by the user's manual dragging.

## Implementation Steps
1. **DOM Restructuring:** Extract the `chat-resizer` and `chat-panel` blocks from the bottom of the document and insert them inside `.center-row`.
2. **Close Tags:** Add the missing `</div>` for `.page-dashboard`.
3. **Tab JS Rewrite:** Change `drop` event listener in the editor tabs to physically move the `existingTab` DOM element instead of destroying and string-matching it.
4. **Dashboard Views:** Add the new Metrics and Monitoring HTML grids with rich bento widgets.
5. **Dashboard JS Logic:** Bind the tab clicks to swap the active bento grid.