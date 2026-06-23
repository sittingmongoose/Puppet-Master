# Repair Report - audit-20260623-002-fff-post-repair-closed-world-semantic-fidelity

Status: PASS_CERTIFIED

## Closure
- Closed `sfk-2201fa3cba0d9f196f0a2fc4` as `repaired`.
- `CV-291` now owns the complete canonical DiscoveryService exact value registry.
- `T-161` now consumes the `CV-291` canonical exact value registry, not the ledger precision contract.

## Scope
- Original repair-required findings: 1
- Post-repair repair-required findings: 0
- Original audit-scope rows rechecked: 552
- Impact rows rechecked: 1

## Generated/Governed Surfaces
- Plan index regenerated and validated.
- Migration hashes/final summary refreshed and validated.
- Shards regenerated and checked.
- Spec Lock and stale evidence bundle hashes refreshed and validated.
- Plan graph and auto-decisions validated without content edits.

## Validators
- `target-ledger`: pass (7.591s)
- `plan-index`: pass (14.802s)
- `plan-migration`: pass (14.257s)
- `closure`: pass (1.315s)
- `shard-check`: pass (0.534s)
- `verify-spec-lock`: pass (0.071s)
- `validate-evidence`: pass (0.588s)
- `validate-plan-graph`: pass (0.52s)
- `validate-auto-decisions`: pass (0.06s)
- `run-gates`: pass (5.862s)
- `audit-governance`: pass (5.084s)
- `json-syntax`: pass (0.604s)
- `check-project-artifacts`: pass (0.065s)
- `prd-planning-runtime-contracts`: pass (0.118s)
- `plans-to-code-handoff-schema`: pass (0.057s)
- `tests`: pass (0.157s)
- `git-diff-check`: pass (0.213s)

## Forbidden Artifacts
No WorkNodes, NodeSeeds, executable queues, manifests, implementation files, runtime dispatch, or build tasks were created.
