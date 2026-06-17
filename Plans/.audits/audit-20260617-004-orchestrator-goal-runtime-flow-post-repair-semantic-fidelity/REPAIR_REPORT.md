# Repair Report - audit-20260617-004-orchestrator-goal-runtime-flow-post-repair-semantic-fidelity

Status: PASS_WITH_WARNINGS
Ledger: pldg-20260616-002-orchestrator-goal-runtime-flow
Generated: 2026-06-17T05:11:58.027663+00:00

## Result

The semantic repair is complete for canonical Plans, plan index, migration validation, shards, and governance evidence. The final validator suite passed 11/11 with no non-audit git-status deltas.

One warning remains by design: ignored local `.claude` credential/session/debug files and `.DS_Store` files are present in the working tree, but they were not range-added and I did not delete user-local state without approval.

## What Changed

- `MS-109`: added `Plans/Provider_OpenCode.md` as a provider-specific owner reference in canonical text, implementation surfaces, and owner hints.
- `RAP-027`: added `GRS-027` dependency and `Plans/Goal_Runtime_System.md` owner hint.
- `F3-395`: added `GRS-026`, `GRS-027`, `UF-064`, and `UF-069` dependencies plus `Plans/Goal_Runtime_System.md` surface/hint.
- `scripts/pm-plan-migration.py`: added a narrow historical-scope exemption for superseded migration runs.
- `pds-20260611-001`: recorded that the run is superseded by current COMPLETE run `pds-20260611-002-atomize-planunits`; refreshed batch hashes.
- Removed tracked audit-local vendored PyYAML files from the previous audit `.pydeps` tree; validators now use external temp PyYAML.
- Regenerated `.plan_index`, shards, and refreshed stale evidence hashes through repo scripts.

## Closure Summary

- repaired: 23
- false_positive: 720
- source_lineage_only: 894
- explicitly_deferred: 13
- not_for_plan: 15
- blocked_requires_user_decision: 1

Full row-level closure is in `repair_closure_matrix.jsonl` (1666 rows).

## Why This Was Not Fixed Earlier

The previous repairs closed the obvious canonical issues, but remaining audit findings were split across generated governance state, validator semantics, and non-canonical local-state policy. Evidence bundles from older seals still had stale hashes after Plans/index/script changes; the historical migration run needed an explicit superseded-run validator exemption; and several audit rows were deliberately source-lineage-only, not-for-plan, or deferred rather than missing prose.

Running repair again now should not find canonical or validator failures from this cycle: the final suite passes. The only unresolved user-choice item is whether to delete or archive ignored local `.claude` and `.DS_Store` files.

## Validators

- bootstrap ledger validate: pass
- pm-plan-index validate: pass
- pm-plan-migration validate pds001: pass
- pm-plan-migration validate pds002: pass
- run-gates: pass
- pm-shard-plans --check: pass
- pm-plans-verify check-shards: pass
- validate-auto-decisions: pass
- verify-spec-lock: pass
- validate-evidence: pass
- git diff --check: pass

## Forbidden Artifacts

No WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, implementation files, or production build tasks were created.

## Next Safe Action

Commit the bounded repair and generated governance refresh. Separately decide whether the ignored local `.claude` and `.DS_Store` files should be removed from the working tree.
