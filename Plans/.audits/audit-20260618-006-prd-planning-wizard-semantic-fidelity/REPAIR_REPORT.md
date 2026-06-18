# Repair Report - audit-20260618-006-prd-planning-wizard-semantic-fidelity

Status: repaired_validated

## Scope

Bounded repair from the latest deep audit for ledger `pldg-20260618-001-prd-planning-wizard`. The repair closed all 11 required checklist rows from semantic risks, atom drift rows, owner-routing rows, and the failed closure-validator result. No WorkNodes, NodeSeeds, executable queues, final node manifests, GoalRuns, implementation files, or production build tasks were created.

## Repaired

- PRD Builder naming drift: active consumer prose now uses PRD Builder; Requirements Doc Builder remains only legacy compatibility/source-lineage where explicitly marked.
- Planning Wizard naming drift: active chat, GUI, command-surface, and model prose now uses Planning Wizard; Chain Wizard / Plan Wizard remain only compatibility/source-lineage tokens or legacy command aliases. ACD-308's active title and compile hint now use Planning Wizard terminology.
- Closure registry hash drift: added `pm-audit-closure.py refresh-hashes` and refreshed existing registry evidence hashes without changing closure statuses/reasons.
- Installer downgrade hazard: installer now exits as a sealed-ledger no-op when the ledger is already sealed.
- Migration readiness label drift: migration final summary now reports `blocked_compiler_contract_incomplete` for node readiness and `runtime_disabled` only for runtime enablement.

## Stale Retired

- `VALIDATION_REPORT.*` is explicitly historical drop-in/package validation and no longer presents its old counts as current seal proof.

## Governance And Generated Artifacts

Regenerated PlanUnit index, migration hashes/final summary, configured shards, plan-sharding evidence rows, Spec Lock, and dependent evidence-bundle hashes after live Plans stabilized. The node-readiness boundary remains intentionally blocked by `blocked_compiler_contract_incomplete`.

## Closure Matrix

`repair_closure_matrix.jsonl` contains 11 rows, each with evidence and a registry closure id. New closure-registry rows are appended for every matrix row.

## Validation

`repair_validator_results.json` records 13 commands, 13 passes, and 0 failures at `2026-06-18T21:00:29Z`. The passing bundle includes closure-registry validation, ledger validation, PlanUnit index validation, migration validation, standard plan-governance run-gates, shard check, Spec Lock verification, evidence validation, plan-graph validation, audit-governance, sealed-ledger installer dry-run, and `git diff --check`.

## Next Safe Action

Optional focused post-repair certification audit if needed. Do not broaden into redesign, runtime PlanCompile enablement, WorkNodes, NodeSeeds, executable queues, or implementation work.
