# Repair Report

Status: PASS_WITH_WARNINGS

Audit: `audit-20260617-003-orchestrator-goal-runtime-flow-head-semantic-fidelity`
Ledger: `pldg-20260616-002-orchestrator-goal-runtime-flow`

## Closure
- `blocked_requires_user_decision`: 1
- `explicitly_deferred`: 1
- `false_positive`: 1207
- `not_for_plan`: 12
- `repaired`: 63
- `source_lineage_only`: 293

Every source row/detail from `semantic_risks.jsonl`, `atom_fidelity_matrix.jsonl`, `planunit_source_claims.jsonl`, `owner_routing_findings.jsonl`, `changed_plan_fidelity.jsonl`, `ledger_consistency.json`, and `validator_results.json` has a closure row in `repair_closure_matrix.jsonl`.

## Repaired
- Removed MS-109 overclaim/non-standard moved lineage for atom-0031/0032.
- Added reciprocal typed VerificationFinding field coverage and acceptance in CV-288, SP-215, and GRS-027.
- Added runtime role/failure-mode fidelity across OSI-428, GRS-027, and EP-098.
- Restored atom-0070 Plan/PlanUnit routing through PDS-006, PNC-009, RGV-012, F3-395, ACD-420, and 0PI-056.
- Regenerated plan index, migration summaries, shards, evidence, and Spec Lock/governance evidence as needed.
- Sanitized audit-local absolute PYTHONPATH provenance in audit-002 and audit-003 validator results.

## Validators
Final suite status: `pass`.
- `bootstrap_ledger_validate`: `pass`, exit `0`, non-audit side effects `False`
- `pm_plan_index_validate`: `pass`, exit `0`, non-audit side effects `False`
- `pm_plan_migration_validate`: `pass`, exit `0`, non-audit side effects `False`
- `run_gates`: `pass`, exit `0`, non-audit side effects `False`
- `shard_check`: `pass`, exit `0`, non-audit side effects `False`
- `validate_auto_decisions`: `pass`, exit `0`, non-audit side effects `False`
- `verify_spec_lock`: `pass`, exit `0`, non-audit side effects `False`
- `validate_evidence`: `pass`, exit `0`, non-audit side effects `False`
- `git_diff_check`: `pass`, exit `0`, non-audit side effects `False`

## Remaining Warning
- `blocked_requires_user_decision`: ignored current-tree `.claude/.credentials.json`, `.claude/_state/`, and `.claude/debug/` remain local credential/session state. They are not tracked and were not created by the repair range; removal or relocation needs explicit user authorization.

## Forbidden Artifacts
No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or build tasks were created by this repair. The only current-tree warning is the ignored `.claude` local-state item above.

## Next Safe Action
Commit/push the bounded repair if the user accepts the remaining local .claude decision; otherwise ask for permission to delete or relocate ignored .claude credential/session files before claiming a clean current-tree forbidden-artifact pass.

## Compact Follow-Up Prompt
Local-state cleanup only: inspect ignored .claude/.credentials.json, .claude/_state/, and .claude/debug/ in <repo>; with Jared's explicit authorization, delete or relocate those local credential/session artifacts, then rerun git status --ignored --short .claude and the final validator suite. Do not edit Plans or product code unless a new audit finding is opened.
