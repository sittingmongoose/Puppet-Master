## 10. Interactions

### 10.1 Mouse Interactions

| Action | Target | Behavior |
|--------|--------|----------|
| Click | Node | Select node; show details in panel; highlight row in table |
| Ctrl+Click | Node | Add/remove from multi-selection |
| Double-click | Node | Open that tier in the Tiers tab (Orchestrator_Page.md tab 2) |
| Right-click | Node | Context menu: "View Evidence", "View in Tiers", "Retry", "Replan", "Reopen" (per tier state) |
| Hover | Node | Tooltip: id, title, state, start/end time, elapsed, attempts |
| Click-drag | Empty area | Pan the graph |
| Scroll wheel | Anywhere | Zoom in/out |
| Click | Minimap | Jump to that position |
| Drag | Minimap viewport | Pan the graph |
| Click | Table row | Select node; highlight in graph; show details |

### 10.2 Keyboard Interactions

| Key | Behavior |
|-----|----------|
| Arrow keys | Move selection to connected node (Up/Down = upstream/downstream for L-R; Left/Right for T-B) |
| Tab | Cycle focus between regions: Top Bar -> Graph -> Table -> Detail |
| Enter | On selected node: expand/collapse detail section |
| Escape | Deselect all; close context menu |
| Ctrl+0 | Fit to screen |
| Ctrl++ / Ctrl+- | Zoom in / out |
| Ctrl+F | Focus search/filter input |
| F5 | Refresh graph data |
| Space | On node with HITL pending: open HITL approve/deny dialog |

### 10.3 Context Menu Actions

When right-clicking a node, available actions depend on node state:

| Action | Available When | Behavior |
|--------|---------------|----------|
| View Evidence | `evidence_refs` not empty | Navigate to Evidence tab filtered to this node |
| View in Tiers | Always | Switch to Tiers tab, expand tree to this node |
| Retry | State is Failed | Trigger retry for this node (dispatches UICommand) |
| Replan | State is Failed or Escalated | Trigger replanning for this node |
| Reopen | State is Passed or Skipped | Reopen this node for re-execution |
| Copy Node ID | Always | Copy tier_id to clipboard |
| View Usage | Always | Navigate to Usage page filtered by this node |

ContractRef: ContractName:Plans/FinalGUISpec.md#7.2, ContractName:Plans/FinalGUISpec.md#13

---

<a id="11-performance"></a>
