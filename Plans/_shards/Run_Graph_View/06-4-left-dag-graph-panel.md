## 4. LEFT: DAG Graph Panel

### 4.1 Node Rendering

Each node is a **rectangle** rendered in the graph canvas:
- **Width**: 160px (at 100% zoom)
- **Height**: 48px (at 100% zoom)
- **Background**: status color from section 8 (theme token)
- **Border**: 2px solid, darker shade of status color; **4px** when selected (accent color)
- **Content**:
  - Row 1: Tier type icon (phase/task/subtask) + title (truncated to ~18 chars with ellipsis)
  - Row 2: Status text + optional badges

### 4.2 Node Badges

Badges appear as small indicators on the node rectangle when the relevant data exists:

| Badge | Condition | Display |
|-------|-----------|---------|
| Attempt count | `attempts > 1` | Small circle with number (e.g., "3") at top-right |
| Duration | `elapsed_ms` available | "1m 23s" text below status |
| HITL waiting | `hitl_pending == true` | Pulsing dot at top-left, colored `Theme.graph-running` |
| Blocked | `blocked_reason` is set | Lock icon at top-left, colored `Theme.graph-failed` |

### 4.3 Edge Rendering

Dependency edges are drawn as lines/arrows from dependency node to dependent node:
- **Arrow direction**: from upstream (dependency) to downstream (dependent)
- **Color**: based on upstream node state:
  - Pending/Planning: `Theme.graph-pending` (gray)
  - Passed: `Theme.graph-passed` (green)
  - Failed: `Theme.graph-failed` (red)
  - Other: `Theme.border` (neutral)
- **Style**: solid line, 2px width, arrowhead at destination
- **Routing**: orthogonal routing (horizontal and vertical segments only) to avoid crossing through nodes

### 4.4 Minimap

- **Location**: bottom-left corner of the graph panel
- **Size**: 150x100px (fixed)
- **Content**: scaled-down view of the entire graph with colored node dots
- **Viewport rectangle**: semi-transparent overlay showing the currently visible portion
- **Interaction**: click on minimap to jump to that position; drag viewport rectangle to pan

### 4.5 Zoom and Pan

- **Zoom**: mouse wheel (Ctrl+wheel on trackpad). Range: 25% to 400%. Default: fit-to-screen.
- **Pan**: click-and-drag on empty canvas area, or middle-mouse-button drag anywhere.
- **Fit to screen**: button in top bar (also Ctrl+0). Adjusts zoom and pan so all nodes are visible with 20px padding.
- **Zoom indicator**: small text in bottom-right of graph panel showing current zoom % (e.g., "75%").

---

<a id="5-node-table"></a>
