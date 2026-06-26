# Repair Report

Audit: `audit-20260626-001-provider-updates-closed-world-semantic-fidelity`
Ledger: `pldg-20260624-001-provider-updates`

Status: `repair_validated`
Original repair-required rows: 8
Post-repair repair-required rows: 0

Closed rows:
- `semantic_risks.jsonl:1` `sfk-2e1b920cfabc04dc0be69949` -> `repaired` (closure-audit-20260626-001-provider-updates-closed-world-semantic-fidelity-repair-001)
- `semantic_risks.jsonl:2` `sfk-d1a2ecb4b7d39660d5d9f5a8` -> `repaired` (closure-audit-20260626-001-provider-updates-closed-world-semantic-fidelity-repair-002)
- `semantic_risks.jsonl:3` `sfk-2558838ab5b35d7ceef3db16` -> `repaired` (closure-audit-20260626-001-provider-updates-closed-world-semantic-fidelity-repair-003)
- `semantic_risks.jsonl:4` `sfk-61185c1dea495f4aaa303ecf` -> `repaired` (closure-audit-20260626-001-provider-updates-closed-world-semantic-fidelity-repair-004)
- `semantic_risks.jsonl:5` `sfk-929f4dfbd5cc1201eff2a369` -> `repaired` (closure-audit-20260626-001-provider-updates-closed-world-semantic-fidelity-repair-005)
- `validator_results.json:results.closure-global` `sfk-93891900f1e635b8b3c4b580` -> `repaired` (closure-audit-20260626-001-provider-updates-closed-world-semantic-fidelity-repair-006)
- `validator_results.json:results.closure-audit` `sfk-6c1ae9f97fecf47728347c9e` -> `repaired` (closure-audit-20260626-001-provider-updates-closed-world-semantic-fidelity-repair-007)
- `validator_results.json:results.git-diff-check-subject-range` `sfk-19d1dc52e0a9a087ce8f5460` -> `repaired` (closure-audit-20260626-001-provider-updates-closed-world-semantic-fidelity-repair-008)

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

Key repaired surfaces:
- `Plans/Multi-Account.md` active Gemini-family usage copy
- `Plans/Media_Generation_and_Capabilities.md` route identity schema and disabled-state copy
- `Plans/ledgers/v2/pldg-20260624-001-provider-updates/**` sealed ledger projections
- `Plans/.audits/_semantic_closure_registry.jsonl` current hash registry
- Source shard EOF whitespace normalization

No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime dispatch, or production build tasks were created.
