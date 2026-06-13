# Shard 005: Verification Table

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L58-L74

Source SHA256: `391caac1cbf802ad04f7f522d2ac9524074421cb913066491528d63ce3328694`

---

## Verification Table

| Area | Required canonical state | Verification status rule |
|---|---|---|
| Orchestrator tabs | `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger` | Fail if `Tiers` remains canonical or if non-Progress tabs remain widget canvases |
| Widget hostability | Dashboard, Usage, and Orchestrator `Progress` only | Fail if `Seams`, `Node Graph`, `Evidence`, `History`, or `Ledger` are still treated as widgetized |
| Runtime approval identity | blocked-episode identity with `run_id`, `node_id`, `blocked_sequence`, `attempt_id?`, `allowed_action_ids[]` | Fail if `request_id`, `tier_id`, or `allowed_actions[]` remain primary |
| Runtime identity display | inherited/overridden, requested/effective, honored/skipped/clamped | Fail if compact or detailed surfaces collapse these states |
| Projection state | `projection_freshness` and `projection_health` | Fail if trust is still modeled as one overloaded field |
| Usage correlation | `usage_event_ref` and runtime attribution fields | Fail if Orchestrator/Graph/Usage still correlate primarily by `tier_id` |
| Source-open behavior | `route_target`, `OpenSubject`, `OpenFile` split | Fail if path-only open is still treated as universal |
| Source Control boundary | narrow worktree-first Source Control; operational lane/package/seam Orchestrator | Fail if Source Control becomes lane-first canon or Orchestrator duplicates raw worktree inventory |
| Graph lineage | graph patches create new generations and retain superseded visible paths | Fail if graph patching still rewrites in place conceptually |
| Instant Grep rebuild concurrency | Regex-index rebuilds write to a new generation directory and publish the live snapshot through one `ArcSwap::store()` pointer swap; reader queries remain wait-free and continue on their held snapshot | Fail if an index rebuild mutates the current generation in place, blocks live queries, or bypasses the `Plans/storage-plan.md` and `Plans/Wiring_Matrix.md` publication contract |
| Concern model | first-class concern lifecycle and lineage | Fail if concerns remain buried in reviews/alerts only |

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FileManager.md
