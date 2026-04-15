# Current State

## Ready check result
- Work item: `w-20260312-203855`
- Status: `blocked`
- Run lineage preserved: `run_prefix = r-20260312-203855`, `run_id = r-20260312-203855-09`, `next_run_seq = 10`
- Ready-standard verdict: **not ready for mutation planning**
- Why: scope is clear enough, exact canon exists, and owner/consumer targets are mostly mapped, but unresolved blockers are still material.
- Canon inventory remains `45` obligations across `119` active mapped sections.
- Material open blockers remain `85` across `26` planning docs, affecting `43` obligations.

## Locked decisions
- The work item stays in migrated/reconciliation-prep state; it is not reopened as a new audit work item.
- `canonical_obligations.json` remains the exact canon inventory and `section_obligation_map.json` remains the owner/consumer propagation map.
- The durable blocker baseline remains the run-07 fidelity pair: `ledger_fidelity_report.txt` plus `fidelity_recovery_plan.txt`.
- Owner-first reconciliation order remains the intended repair strategy, but it cannot advance into mutation planning while the current blocker set stays open.
- Preserve both currently known truths together: the live work-item map has `119` active mapped sections, while the durable fidelity baseline still tracks `85` open transfer failures.

## Exact canon that must survive
- `OBL-032`: approval identity stays blocked-episode-centered, with `blocked_sequence` as the canonical approval anchor and explicit startup-recovery to first `scheduler.pass` handoff ownership.
- `OBL-020`: search, palette, widget drill-down, recovery, and cross-surface pivots must normalize through one shared routing payload contract instead of ad hoc payload families.
- `OBL-007`: requested/effective execution identity must include canonical requested-side concrete-account identity; `requested_account_policy` remains routing logic, not the selected account.
- `OBL-038`: storage owns durable worktree/lane record and projection families so `worktree_id` is durable identity and `lane_id` is operational lineage across restart/cleanup/archive/remove flows.
- `OBL-033`: runtime/tool/artifact attribution remains one shared packet spanning tool events, artifacts, validation reports, wizard handoff, and usage/account-pressure surfaces.
- `OBL-027`: `resume_url` remains serialized transport only; `route_target` stays canonical internal identity.
- `OBL-031`: `execution_unit_context` replaces tier-rooted execution scope and must carry node/attempt/worktree/package/seam/lane/account/role/runtime identity.
- Already-landed canon that must not regress:
  - `OBL-016`: one shared governance/runtime record-envelope pattern with family-specific payload blocks.
  - `OBL-028`: inspection/provenance refs stay in event/record payloads; route/open contracts own navigation identity.

## Exact readiness blockers
- The blocker is **not** lack of canon. The blocker is that the surviving canon is still under-transferred in material owner and consumer sections.
- Failure breakdown:
  - `23` missing structural headings
  - `11` stubbed owner sections
  - `38` stubbed consumer propagations
  - `6` over-summarized transfers
  - `7` stale contradictory survivors
- Highest-pressure docs:
  - `Plans/FinalGUISpec.md` (`13`)
  - `Plans/Orchestrator_Page.md` (`8`)
  - `Plans/Runtime_Artifacts_Panel.md` (`5`)
  - `Plans/assistant-chat-design.md` (`5`)
  - `Plans/usage-feature.md` (`5`)
- Exact leading blockers:
  - `FIDELITY-001` — missing owner section `Plans/Contracts_V0.md#5.1B Persona/Runtime Snapshot Payload Contract`; `execution_unit_context` packet is not present as its own owner anchor and still misses `operational_identity`.
  - `FIDELITY-002` — stale contradictory survivor in `Plans/Contracts_V0.md#7.3 \`route_target\``; closed `target_kind` enum is violated by `detached_window`.
  - `FIDELITY-003` — missing owner section `Plans/storage-plan.md#Required redb keys`; runtime-artifact row-shape contract for `artifacts_index.v1:{project_id}:{artifact_id}` is not preserved.
  - `FIDELITY-004` — over-summarized `Plans/storage-plan.md#Restart and stale history`; explicit `historical` lifecycle vocabulary did not survive as a first-class entry.
  - `FIDELITY-005` — stubbed owner section `Plans/storage-plan.md#Cross-surface receipt record`; receipt fields such as `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, and `run_id` are still missing.
  - `FIDELITY-008` / `FIDELITY-009` — `Plans/Glossary.md` still lacks the required structural headings for `Orchestrator rewrite terms` and `Runtime and routing terms`.
  - `FIDELITY-010` / `FIDELITY-011` — `Plans/Executor_Protocol.md` still lacks the correct `execution_unit_context` owner anchor and still carries stale execution-field residue.
  - `FIDELITY-012` — `Plans/Tools.md#8.0 Event payloads (seglog)` still drops the unified runtime/tool attribution packet.
- Materiality test failed:
  - owner canon is still incomplete in `Contracts_V0.md`, `storage-plan.md`, `Glossary.md`, and `Executor_Protocol.md`
  - consumer propagation is still incomplete in `Tools.md`, `FinalGUISpec.md`, `assistant-chat-design.md`, and related mirror docs
  - stale contradictory survivors are still live in core owner docs, so implementers could still read conflicting behavior

## Next required stage
 - Required stage: `Audit Mode`
 - Goal: close the material transfer-fidelity blockers before any mutation-planning pass begins.
 - Immediate audit order:
   1. `Plans/Contracts_V0.md`
   2. `Plans/storage-plan.md`
   3. `Plans/Glossary.md`
   4. `Plans/Executor_Protocol.md`
   5. `Plans/Tools.md`
 - Planning may resume only after owner anchors, required fields, and contradictory survivors stop failing the ready standard.
