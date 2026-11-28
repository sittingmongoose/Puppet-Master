# Shard 005: Verification Table

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L58-L76

Source SHA256: `fa54d28deacb313c7c1ca7c169f563d3e988a23831677867022cb7a8ebbb4b33`

---

## Verification Table

| Area | Required canonical state | Verification status rule | Plan-coverage status (2026-11-25) | Evidence ref |
|---|---|---|---|---|
| Orchestrator tabs | `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger` | Fail if `Tiers` remains canonical, if `Plan Compile` is omitted, or if non-Progress tabs remain widget canvases | `pass` | `Plans/Orchestrator_Page.md#OP-002`; `Plans/Widget_System.md#WS-010` |
| Widget hostability | Dashboard, Usage, and Orchestrator `Progress` only | Fail if `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, or `Ledger` are still treated as widgetized | `pass` | `Plans/Widget_System.md#WS-010`; `Plans/Widget_System.md#section=Progress-only widget hostability` |
| Runtime approval identity | blocked-episode identity with `run_id`, `node_id`, `blocked_sequence`, `attempt_id?`, `allowed_action_ids[]` | Fail if `request_id`, `tier_id`, or `allowed_actions[]` remain primary | `pass` | `Plans/Contracts_V0.md#CV-029` (`allowed_actions[]`, `request_id`, `tier_id` compatibility or lineage only) |
| Runtime identity display | inherited/overridden, requested/effective, honored/skipped/clamped | Fail if compact or detailed surfaces collapse these states | `pass` | `Plans/Personas.md#section=10. Persona Runtime Contract Expansion (2026-03-06)` (the three pairs stay distinct); `Plans/Contracts_V0.md#section=Requested/effective runtime identity field split` |
| Projection state | `projection_freshness` and `projection_health` | Fail if trust is still modeled as one overloaded field | `fail` (2026-11-26) | `Plans/FinalGUISpec.md#section=15.6 Durable Storage Recovery, Continuity, and Trust Surfaces (Case L)` renders separate freshness and health enums. `Plans/Contracts_V0.md#CV-048` still defines one combined health vocabulary in its acceptance criteria. |
| Usage correlation | `usage_event_ref` and runtime attribution fields | Fail if Orchestrator/Graph/Usage still correlate primarily by `tier_id` | `pass` | `Plans/Contracts_V0.md#CV-059` (tier/run/thread filters are degraded compatibility, not primary identity) |
| Source-open behavior | `route_target`, `OpenSubject`, `OpenFile` split | Fail if path-only open is still treated as universal | `pass` | `Plans/Contracts_V0.md`, section 7.3 `route_target`; `Plans/Contracts_V0.md#section=7.4 OpenSubject`; `Plans/Contracts_V0.md#section=route_target, OpenSubject, and command normalization` (FileManager `OpenFile` stays narrow and path-based) |
| Source Control boundary | narrow worktree-first Source Control; operational lane/package/seam Orchestrator | Fail if Source Control becomes lane-first canon or Orchestrator duplicates raw worktree inventory | `pass` | `Plans/Crosswalk.md#section=3.13B Rewrite-era owner-routing safety` (Source Control `worktree-first`, Orchestrator lane/package/seam first); `Plans/Crosswalk.md#section=3.4 Source Control and lane/worktree ownership` |
| Graph lineage | graph patches create new generations and retain superseded visible paths | Fail if graph patching still rewrites in place conceptually | `pass` | `Plans/Run_Graph_View.md#section=1. Scope and canonical role` (lineage spans generations when graph patching occurs); `Plans/Run_Graph_View.md#RGV-004` |
| Instant Grep rebuild concurrency | Regex-index rebuilds write to a new generation directory and publish the live snapshot through one `ArcSwap::store()` pointer swap; reader queries remain wait-free and continue on their held snapshot | Fail if an index rebuild mutates the current generation in place, blocks live queries, or bypasses the `Plans/storage-plan.md` and `Plans/Wiring_Matrix.md` publication contract | `pass` | `Plans/storage-plan.md#SP-018`; `Plans/storage-plan.md#section=2.1 File locations and directory layout` (builder publishes from `gen-{N+1}/` by one atomic pointer swap; readers keep their `Arc` snapshot) |
| Concern model | first-class concern lifecycle and lineage | Fail if concerns remain buried in reviews/alerts only | `pass` | `Plans/Contracts_V0.md#CV-063` |

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FileManager.md

Status recording rule (2026-11-25). Each row records one status, `pass`, `fail`, `blocked` or `not_applicable`, and an evidence ref, as the FABLE Deferred Action Concrete Repair Addendum below requires. This checklist verifies that the GUI rebuild requirements are covered by canonical plan documents (Purpose), so a row is `pass` when the cited owner unit or section states the required canonical state and keeps the alternative named in the row's fail condition to compatibility or lineage only. A plan-coverage `pass` is not runtime, implementation or PNC-019 evidence. A row reads `fail` when the owner text still makes the failing alternative canonical, `blocked` when the owner text is missing or ambiguous, and `not_applicable` only with a written reason. The statuses above were checked against `main` on 2026-11-25. When a cited owner unit or section changes, its row is checked again before anyone claims completion. `- [ ]` checkbox lines elsewhere in this document list verification scope; they are not statuses and are not completion inputs.
