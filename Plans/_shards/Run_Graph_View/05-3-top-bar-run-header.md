## 3. TOP BAR: Run Header

Fixed-height bar (60px) at the top of the view. Contains:

| Element | Content | Behavior |
|---------|---------|----------|
| Run ID | `run_meta.run_id` | Selectable, copyable (Ctrl+C) |
| Run date | `run_meta.run_date` formatted | Static text |
| Status badge | `run_meta.status` (OrchestratorState) | Color-coded per section 8 |
| Start time | `run_meta.ts_start` formatted | Static text |
| End time | `run_meta.ts_end` formatted (or "--" if running) | Updates live |
| Elapsed | Wall-clock elapsed time | Live ticker (updates every second) |
| Status counts | Per-state counts (e.g., "5 passed, 2 running, 1 failed") | Color-coded badges, live-updated |
| Layout preset | Dropdown selector (5 presets, section 9) | Changes DAG layout |
| Zoom controls | Zoom in (+), Zoom out (-), Fit to screen | Buttons |
| Filter | Dropdown + search input | Filters visible nodes |
| Toggles | Hide completed, Show critical path only, Show blocked only | Toggle buttons |

ContractRef: ContractName:Plans/FinalGUISpec.md#7.2

---

<a id="4-dag-graph"></a>
