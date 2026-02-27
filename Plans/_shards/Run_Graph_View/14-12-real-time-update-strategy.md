## 12. Real-Time Update Strategy

### 12.1 Initial Load

1. Load `TierTree` from backend (or redb checkpoint).
2. Convert all `TierNode` entries to `GraphNode` projections.
3. Build `Vec<GraphEdge>` from dependency lists.
4. Compute layout positions for the active preset.
5. Render graph, populate table, show "Select a node" placeholder in detail panel.

### 12.2 Incremental Updates

When events arrive via `invoke_from_event_loop`:

| Event Type | Update Action |
|------------|--------------|
| `TierChanged` | Update `GraphNode.state` for affected node. Update color in graph. Update badge in table. If selected, update detail panel. |
| `IterationStart` | Update `GraphNode.start_ts`, `attempts`. Show "Running" state. |
| `IterationComplete` | Update `GraphNode.end_ts`, `elapsed_ms`. Compute duration. |
| `GateStart` | Update `GraphNode.verifier_state` to InProgress. |
| `GateComplete` | Update `GraphNode.verifier_state` to Passed/Failed. Update verdict in C4. |
| `Progress` | Update `RunGraphMeta.counters_by_state`. Update top bar counts. |
| `Output` | If selected node matches tier_id: append to C3 worker activity stream. |
| `Error` | If selected node matches: append to C3 or show error in C1. |
| `UserInteractionRequired` | Set `hitl_pending = true` on matching node. Show HITL badge. If selected, show C6 controls. |
| `EvidenceStored` | Add to `evidence_refs` on matching node. If selected, update C3 evidence list. |

### 12.3 Structural Changes

When new nodes are added to the graph (rare, only during replanning):
1. Add new `GraphNode` projections.
2. Update `Vec<GraphEdge>`.
3. Re-compute layout positions (full re-layout on background thread).
4. Animate transition (nodes slide to new positions over 200ms).

### 12.4 Throttling

During rapid event bursts (e.g., parallel execution completing many subtasks):
- Batch visual updates at 60fps (16ms intervals).
- Accumulate state changes and apply as a single batch per frame.
- Top bar counters update at most once per frame.

---

<a id="13-theme-integration"></a>
