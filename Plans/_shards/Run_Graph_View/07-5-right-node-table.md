## 5. RIGHT: Node Table

### 5.1 Columns

| Column | Source Field | Sortable | Default Sort | Default Visible |
|--------|------------|----------|-------------|-----------------|
| Name | `id` + `title` | Yes | -- | Yes |
| Type | `tier_type` (Phase/Task/Subtask) | Yes | -- | Yes |
| State | `state` (color-coded badge) | Yes | Primary (by state priority) | Yes |
| Start | `start_ts` (formatted) | Yes | -- | Yes |
| End | `end_ts` (formatted, or "--") | Yes | -- | Yes |
| Duration | `elapsed_ms` (formatted) | Yes | -- | Yes |
| Tries | `attempts` | Yes | -- | Yes |
| Verification | `verifier_state` (badge) | Yes | -- | Yes |
| V. Start | `verifier_start_ts` (formatted) | Yes | -- | No (expandable) |
| V. End | `verifier_end_ts` (formatted, or "--") | Yes | -- | No (expandable) |
| V. Duration | `verifier_elapsed_ms` (formatted) | Yes | -- | No (expandable) |
| Blocked | `blocked_reason` (truncated) | Yes | -- | Yes |

**State sort priority** (highest to lowest): Failed > Escalated > Retrying > Running > Gating > Planning > Pending > Reopened > Skipped > Passed. On ties within the same state, sort by `start_ts` ascending (oldest first). For disconnected-state ties, sort by `node.id` lexicographically.

### 5.2 Filtering

- **Search**: text input searches across id and title fields.
- **State filter**: multi-select dropdown of TierState values.
- **Quick filters** (toggle buttons):
  - "Failed" -- show only Failed nodes
  - "Blocked" -- show only nodes with blocked_reason
  - "Running" -- show only Running/Gating nodes
  - "Needs Approval" -- show only nodes with hitl_pending
  - "Upstream Failed" -- show only nodes whose dependencies failed

### 5.3 Two-Way Selection Sync

- **Table -> Graph**: clicking a row in the table highlights and centers the corresponding node in the DAG graph.
- **Graph -> Table**: clicking a node in the graph scrolls the table to show and highlight the corresponding row.
- **Multi-select**: Ctrl+click in either panel adds to selection. Shift+click in table selects range.

### 5.4 Virtualization

The node table MUST be virtualized (render only visible rows + overscan buffer) to handle 500+ nodes without performance degradation.

---

<a id="6-node-detail"></a>
