# audit-20260619-010-prd-planning-wizard-post-repair-head-semantic-fidelity

## Status

Status: BLOCKED  
Repair required findings: 6  
Advisory findings: 2  
Ledger: `pldg-20260618-001-prd-planning-wizard`  
Range: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe..b257345ec12fa2e290948f4aee6c2b4a07a4b499`  
Baseline: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe`  
Subject: `b257345ec12fa2e290948f4aee6c2b4a07a4b499`  
Observation: `b257345ec12fa2e290948f4aee6c2b4a07a4b499`

## Exact Losses And Drift

No atom-level exact-token loss was found in the compile queue or compiled-to-Plan atom set. The atom matrix covers 168 design atoms: exact_present=99, equivalent_with_evidence=61, previously_closed=7, stale_retired=1, missing_or_drift=0. Previously closed rows were reused from the closure registry and are not findings.

One changed-doc semantic drift remains repair-required: the live handoff schema still consts `schema_id` to `pm.plans_to_code_handoff.v1` while canonical PlanUnits now describe a runtime-capable v2 contract/branch. Either the v2 contract identity needs to be explicit in schema/canon, or canon needs to explicitly state that the v1 schema identifier contains mode-versioned branches.

## Lineage

Two reciprocal lineage gaps remain repair-required. `CV-289` now carries PRD-cycle runtime-aware/native_runtime semantics, but its source_lineage still names only the earlier pldg-20260617 handoff. `CW-008`, `CWF-151`, and `GRS-002` now include PRD Builder/Planning Wizard compatibility language, but their source_lineage still stops at older Goal Runtime/Orchestrator ledgers.

## Routing

One owner-routing graph gap remains repair-required. `CV-289` and `PNC-014` canonical prose names the runtime-capable branch ownership owned by `CV-290`/`PNC-015`, but dependency metadata does not expose those reciprocal edges, so generated dependency views mirror an incomplete graph.

## Ledger And Governance

Two ledger-governing-state gaps remain repair-required. The machine-readable latest_audit fields point to audit-009, but compact handoff/current prose still directs the next agent to audit-007. The global registry ledger row also retains an older `updated_at_utc` than the local registry entry.

Governance validators pass. Spec lock, shards, evidence, graph, and schema checks are current enough for validator pass. One advisory remains: older evidence-bundle prose is cumulative/stale in places, but this audit does not require repair because the generated governance checks pass.

## Validators

All validators passed with clean git status before and after the read-only validation run. No validator side effects were detected. The suite included closure-registry validation, target-ledger validation, plan-index validation, migration validation, `run-gates`, shard check, governance/evidence/spec-lock/graph/schema checks, JSON syntax, ContractRef lint, banned phrase lint, project artifact guard, and `git diff --check`.

## Forbidden Artifacts

No forbidden WorkNodes, NodeSeeds, executable queues, manifests, implementation files, build tasks, legacy Iced app resurrection, secrets, or local-machine state were found in the audited range.

## Next Action

Run bounded repair for only these six findings:

1. `schema_runtime_v2_identity_ambiguity`
2. `cv289_prd_runtime_source_lineage_gap`
3. `legacy_adjacent_prd_source_lineage_gap`
4. `runtime_branch_dependency_edges_missing`
5. `ledger_compact_state_stale_audit007_prose`
6. `ledger_registry_row_updated_at_stale`

Repair prompt:

```text
Use the PM Bootstrap Planning Ledger workflow. Continue ledger pldg-20260618-001-prd-planning-wizard in bounded repair mode for audit-20260619-010-prd-planning-wizard-post-repair-head-semantic-fidelity. Repair only the six repair_required findings named in that audit: schema runtime-v2 identity ambiguity, CV-289 reciprocal PRD source_lineage gap, legacy wizard/goal-runtime PRD source_lineage gap, missing runtime-branch dependency edges, stale audit-007 compact-state prose, and stale global registry row updated_at_utc. Do not create WorkNodes, NodeSeeds, executable queues, manifests, implementation files, runtime dispatch, or build tasks. Preserve prior closure rows and prior lineage. Regenerate only generated governance/index artifacts explicitly required by the repairs. Run full validators with git status before/after, revert validator side effects only, and write a repair closure matrix plus final report under a new audit/repair directory.
```
