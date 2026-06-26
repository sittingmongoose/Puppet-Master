# Repair Certification

Audit: `audit-20260626-001-provider-updates-closed-world-semantic-fidelity`
Ledger: `pldg-20260624-001-provider-updates`

Certification: `PASS_WITH_WARNINGS`
repair_required_count: `0`
original_scope_rows: `1516`
scope_coverage: `100%`
impact_rows: `8`
closure_rows: `8`

Validators:
- `closure-global`: `pass`
- `closure-audit-required-matrix`: `pass`
- `target-ledger`: `pass`
- `plan-index`: `pass`
- `plan-migration`: `pass`
- `run-gates`: `pass`
- `shard-check`: `pass`
- `validate-auto-decisions`: `pass`
- `verify-spec-lock`: `pass`
- `validate-evidence`: `pass`
- `validate-plan-graph`: `pass`
- `git-diff-check-worktree`: `pass`
- `git-diff-check-baseline-to-worktree`: `pass`
- `git-diff-check-current-head-range`: `pass`

Evidence:
- `post_repair_audit_report.json`
- `repair_impact_matrix.jsonl`
- `repair_closure_matrix.jsonl`
- `terminal_state.json`
- `repair_report.json`

The historical `audit_report.json` remains the original blocked audit; this certification is the effective terminal report for the bounded repair.
