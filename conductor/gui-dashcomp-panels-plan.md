# GUI Tweaks & Widget Additions Plan

**Objective:**
Fix the editor pane closing issue on tab drag-and-drop, and flesh out the Dashboard tabs with more diverse, realistic bento widgets.

## Requirements & Revisions

### 1. Fix Editor Pane Empty State (Drag & Drop)
- **Diagnosis:** When a tab is dragged to another `.editor-pane`, the tab's DOM element is moved. However, the source pane does not check if it is now empty. This leaves an empty, unclosable editor pane on the screen.
- **Fix:** Update the `drop` event listener in the editor tabs. Before moving the tab, identify its source pane. After the DOM move, check if the source pane has any `.tab` elements remaining. If not, apply `display: none` to the source pane. Also check if the entire `.editor-view` should hide, identical to the manual tab close logic.

### 2. Flesh Out Dashboard Widgets
- **Diagnosis:** The Dashboard tabs (Main, Metrics, Monitoring) only have a few widgets each and feel sparse.
- **Fix:** Add several new premium, SVG-powered widgets to each grid to emphasize the layout capabilities.
- **Main Grid Additions:**
  - *Active Subagents* (`size-1x1`): List of currently working agents (e.g., Code Investigator, Test Writer).
  - *Recent Activity* (`size-2x1`): A timeline list of recent file changes or system events.
- **Metrics Grid Additions:**
  - *API Latency* (`size-1x1`): Displaying average request latency with a mini trendline.
  - *Cache Hit Rate* (`size-1x1`): Displaying a percentage visual.
  - *Budget Allocation* (`size-2x1`): Displaying budget splits across models (Claude, OpenAI, Gemini) using inline styling to mock pie/bar distributions.
- **Monitoring Grid Additions:**
  - *Container Health* (`size-2x1`): Status of orchestrator docker instances with mock uptime data.
  - *Network Traffic* (`size-2x1`): Mock area chart of ingress/egress.
  - *Database Load* (`size-1x1`): Query volume per second.
  - *Error Rates* (`size-1x1`): Exception counts in the last 24 hours.

### 3. Strict Constraints
- **No Emojis:** Rely exclusively on high-quality SVGs and styled CSS for all new widgets.
- **Bento Grid Alignment:** Ensure the new widgets use the exact `size-1x1`, `size-2x1`, and `size-2x2` CSS classes to maintain the reflowing grid structure without stretching.

## Implementation Steps
1. **JS Update:** Refactor the `e.dataTransfer` drop logic to include a source pane cleanup step.
2. **HTML Grid `#dashGridMain`:** Append the *Active Subagents* and *Recent Activity* widgets.
3. **HTML Grid `#dashGridMetrics`:** Append *API Latency*, *Cache Hit Rate*, and *Budget Allocation*.
4. **HTML Grid `#dashGridMonitoring`:** Append *Container Health*, *Network Traffic*, *Database Load*, and *Error Rates*.