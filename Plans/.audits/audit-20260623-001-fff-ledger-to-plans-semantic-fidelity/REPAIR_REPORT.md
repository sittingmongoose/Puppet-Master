# Repair Report - audit-20260623-001-fff-ledger-to-plans-semantic-fidelity

Status: pass certified.

## Scope

- Ledger: `pldg-20260622-001-fff`
- Original repair-required rows: 4
- Post-repair repair-required rows: 0
- Original scope rows re-audited: 552
- Repair impact rows re-audited: 4

## Repairs

- Wrote `repair_impact_matrix.jsonl` for exactly the four actionable rows.
- Updated `state/operating_capsule.json` from pending-governance wording to sealed/no-open-work wording.
- Wrote `repair_closure_matrix.jsonl` and appended four matching closure registry rows.
- Refreshed semantic closure registry hashes with `scripts/pm-audit-closure.py refresh-hashes`.

## Boundaries

No canonical Plan prose, PlanUnit index outputs, generated shards, Spec Lock, evidence bundles, plan graph, auto-decisions, WorkNodes, NodeSeeds, executable queues, runtime launches, implementation files, or production build tasks were changed.

## Validators

- `target-ledger`: pass
- `plan-index`: pass
- `plan-migration`: pass
- `run-gates`: pass
- `audit-governance`: pass
- `shard-check`: pass
- `validate-auto-decisions`: pass
- `verify-spec-lock`: pass
- `validate-evidence`: pass
- `validate-plan-graph`: pass
- `json-syntax`: pass
- `lint-contractrefs`: pass
- `lint-banned-phrases`: pass
- `check-project-artifacts`: pass
- `prd-planning-runtime-contracts`: pass
- `plans-to-code-handoff-schema`: pass
- `closure-global`: pass
- `closure-audit-required-matrix`: pass
- `closure-audit-required-sources`: pass
- `closure-refresh-dry-run`: pass
- `tests`: pass
- `git-diff-check`: pass
