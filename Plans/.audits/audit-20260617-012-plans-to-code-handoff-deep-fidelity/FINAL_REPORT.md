# Plans-To-Code Handoff Deep Audit

Ledger: `pldg-20260617-001-plans-to-code-handoff`
Audit: `audit-20260617-012-plans-to-code-handoff-deep-fidelity`
Current ref: `3f6fb1fba`
Phase: `post_compile_deep_audit_only`
Status: `BLOCKED_WITH_FINDINGS`
Compile readiness: `not_safe_to_compile_or_enable_runtime`

## Summary

Audit artifacts were written only under this audit directory. No Plans prose, indexes, WorkNodes, NodeSeeds, governance locks, generated shards, or source/build files were edited.

Lineage coverage is complete at the atom level: 64 ledger atoms map into 38 target PlanUnits. Owner routing has 8 doc-impact groups and no non-pass routing groups. Forbidden implementation artifact checks pass: no WorkNodes, NodeSeeds, node queues, Rust, Slint, or Cargo artifacts were found; PlanCompile runtime remains `design_only_disabled` and node readiness remains `blocked_compiler_contract_incomplete`.

## Blockers

1. Closure registry evidence is stale. `pm-audit-closure validate` fails with 157 stale-hash errors in `Plans/.audits/_semantic_closure_registry.jsonl`. This target ledger has 0 prior closure rows, so the 40 current findings are treated as open/new; the missing `repair_closure_matrix.jsonl` is expected for this audit-only pass.
2. Plan migration evidence is stale. `pm-plan-migration.py validate` fails with 67 failures: 64 stale batch-report hashes, 1 doc-count mismatch, 1 inventory doc-set mismatch, and 1 stale final PlanUnit count (`5068` recorded vs `5105` live).
3. Semantic fidelity still needs bounded repair. There are 40 open risks: 37 atom-fidelity issues and 3 implementation-readiness warnings. Severity split is 13 medium and 27 low.

## Passing Checks

- `pm-plan-index.py validate`: pass; 5105 PlanUnits, 18220 acceptance units, coverage pass, node readiness blocked only by missing compiler contract.
- `pm-bootstrap-ledger-validate`: pass; 64 atoms, 28 decisions, 10 corrections, 11 events, 0 compile queue items, 0 questions.
- `pm-plans-verify.py run-gates`: pass.
- `pm-shard-plans.py --check`: pass; 51 docs, 925 shards.
- `git diff --check`: pass.
- `verify-spec-lock`, `validate-evidence`, `validate-auto-decisions`, `validate-plan-graph`, and `json-syntax`: pass.

## Next Safe Action

Run a bounded repair pass for the 40 semantic risks and stale closure/migration evidence, then rerun the failed validators. Keep PlanCompile runtime disabled and do not create WorkNodes/NodeSeeds until closure and migration validation pass.
