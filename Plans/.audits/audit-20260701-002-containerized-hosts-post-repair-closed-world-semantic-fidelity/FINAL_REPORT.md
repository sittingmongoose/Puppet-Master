# audit-20260701-002-containerized-hosts-post-repair-closed-world-semantic-fidelity

Status: PASS_WITH_WARNINGS

Ledger: `pldg-20260630-001-feature-intake`
Observation ref: `HEAD`
Subject ref: `b65a21127ae685f6f98127d3d9ee667b302edfe2`
Baseline ref: `5a5a54c4e6a5e5ae74a5dffb306872beacae9db5`

## Scope And Coverage

- Scope rows: 9150
- Coverage rows: 9150 / 9150 (100%)
- Compiled PlanUnits: 23
- Atom-to-PlanUnit target pairs: 220
- Changed non-audit paths in subject range: 647

## Result

No repair-required findings are open. The three repair-required findings from `audit-20260701-001-containerized-hosts-closed-world-semantic-fidelity` are reused as valid `previously_closed` closure-registry rows. Current ledger projections are sealed, reciprocal source lineage is repaired for `0PI-065`, governance/index/migration artifacts validate, and forbidden runtime/build artifacts are absent.

## Validators

- Validator status: pass
- Passed: 16
- Failed: 0
- Non-audit side effects: 0

The closure audit-dir validator reports the expected no-repair warning that no `repair_closure_matrix.jsonl` exists; this is non-blocking because `repair_required_count=0`.

## Non-Actionable Warnings

- Node readiness remains `blocked_compiler_contract_incomplete` / `runtime_disabled` by design.
- Direct Docker/Hosts GUI/workflow implementation packet detail remains open and should be handled in a separate hardening pass before code/runtime implementation.
- `compile_queue.items[0].target_doc` remains a legacy scalar while `target_docs` / `compiled_owner_docs` are authoritative.
- `Provider_OpenCode` remains adjacent/reference-only, not an owner authority.

## Next Action

PASS_WITH_WARNINGS is terminal for this audit. No repair is required; do not start implementation from this audit. The next substantive action is a separate direct Docker/Hosts Slint GUI/workflow build-packet hardening pass.
