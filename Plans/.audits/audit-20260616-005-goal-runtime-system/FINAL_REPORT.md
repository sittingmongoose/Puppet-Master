# audit-20260616-005-goal-runtime-system

Verdict: PASS_WITH_WARNINGS

## Scope
- Ledger: `pldg-20260616-001-goal-runtime-system`
- Inferred range: `fb7dd9aee5ef21d4244deb74d151d2de15a620ab..ece3b8a503182f6dc456f2990dc2bb55059934e1`
- Earliest cycle commit: `fbb9c48c1e8bb1aff0ab70dae558d21fb68a7050`
- Current ref: `ece3b8a503182f6dc456f2990dc2bb55059934e1`
- Baseline ref: `fb7dd9aee5ef21d4244deb74d151d2de15a620ab`
- Audited snapshot: `/tmp/pm-exact-audit-head-005-7RrSKH`

## Changed Files
- Total changed paths: 286
- Changed live Plan docs: `Plans/00-plans-index.md`, `Plans/FinalGUISpec.md`, `Plans/Goal_Runtime_System.md`, `Plans/assistant-chat-design.md`
- Live-doc diff is additive. No removed prose, headings, ContractRefs, or existing PlanUnits were found.

## PlanUnit Deltas
- Added: 31
- Changed: 0
- Deleted: 0
- Added IDs: `0PI-055, ACD-416, ACD-417, ACD-418, ACD-419, F3-393, GRS-001, GRS-002, GRS-003, GRS-004, GRS-005, GRS-006, GRS-007, GRS-008, GRS-009, GRS-010, GRS-011, GRS-012, GRS-013, GRS-014, GRS-015, GRS-016, GRS-017, GRS-018, GRS-019, GRS-020, GRS-021, GRS-022, GRS-023, GRS-024, GRS-025`

## Exact-Detail Losses And Drift
- Atom fidelity matrix rows: 108
- Strict atoms with at least one `missing_or_drift` detail: 106
- Main confirmed losses: Assistant Chat status/menu labels, runtime metadata/activity examples, attachment bundle examples, weak-worker evidence fields, budget/parallelism caps, model-policy field names, source-lineage exact references, hard-stop classes.
- See `atom_fidelity_matrix.jsonl` and `semantic_risks.jsonl` for per-atom detail statuses.

## Reciprocal Lineage
- Audited added/changed PlanUnits: 31
- Weak/overclaim rows after correction-record loading: 2
- Confirmed findings: `GRS-021` pre-seal `.plan_index` overclaim, `ACD-417` pipe-delimited enum-shape drift, `0PI-055` missing model-selector source refs.

## Owner Routing
- Generated owner-routing findings: 64 heuristic rows; confirmed high/medium themes are in `semantic_risks.jsonl`.
- High: missing contract/storage/permission owner impact.
- High: incomplete model/provider/account owner routing.
- Medium: Settings Tab Registry under-routing, Chain Wizard consumer-ref omission, artifact owner ambiguity.

## Ledger And Governance
- Ledger atom statuses: `{"compiled_to_plan": 108, "deferred": 1, "not_for_plan": 1}`
- Question statuses: `{"deferred": 5}`
- Sealed checks: active candidates `0`, ready-for-compile atoms `0`, open questions `0`, deferred questions `5`.
- Projection warning: `ledger_registry.json` says status `sealed`, but ledger `manifest.json` still says status `compiled` while phase/notes say governance sealed.
- PlanUnits: 5036; acceptance units: 17890; unresolved dependency refs: 0.
- Node readiness: `blocked_compiler_contract_incomplete`; WorkNodes created: `false`; NodeSeed candidates created: `false`.

## Validators
All required validators passed and no mutation was detected between before/after `git status` captures:
- `python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system`
- `python3 scripts/pm-plan-index.py validate`
- `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits`
- `python3 scripts/pm-plans-verify.py run-gates`
- `python3 scripts/pm-shard-plans.py --check`
- `python3 scripts/pm-plans-verify.py validate-auto-decisions`
- `python3 scripts/pm-plans-verify.py verify-spec-lock`
- `python3 scripts/pm-plans-verify.py validate-evidence`
- `git diff --check`

## Forbidden Artifacts
Range result: PASS. No WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, product implementation files, production build tasks, Rust/Slint app scaffolds, or legacy Iced app resurrection were introduced by the audited range. Base-present local-machine state remains outside the audited range and is listed in `audit_report.json`.

## Subagent Summary
- Atom exact-fidelity: exact semantic fidelity fails; several exact details are still compressed out of governed prose.
- Reciprocal lineage: three semantic lineage findings remain.
- Owner routing: contract/storage/permission, model/provider/account, Settings, Chain Wizard, and artifact routing warnings remain.
- Changed-doc fidelity: additive live-doc diff; no deletion-based loss.
- Ledger/index/governance: validators pass; manifest status lags sealed registry.
- Forbidden artifacts: range passes; base-present local state remains.

## Next Safe Action
Run a narrow exact-fidelity repair for `ESF-001` through `ESF-017`, then regenerate PlanUnit index, migration summaries, shards, evidence, Spec Lock, auto_decisions, and plan_graph through repo scripts only. Do not create WorkNodes, NodeSeeds, queues, manifests, implementation files, or build tasks.

## Compact Repair Prompt
```text
Repair audit audit-20260616-005-goal-runtime-system for ledger pldg-20260616-001-goal-runtime-system. Audit-only findings show exact semantic fidelity is still incomplete. Restore or explicitly defer governed prose/source_lineage for ESF-001..ESF-017: ACD-416 status/menu labels; ACD-418 runtime metadata/activity examples; GRS-008 attachment path examples; GRS-009 weak-worker evidence fields; GRS-015/016/017 budget and parallelism cap fields; GRS-010 model-policy fields and model/provider/account owner routing; GRS-023 exact lineage tokens; GRS-021 compile/index/seal sequencing; ACD-417 enum-shape source; 0PI-055 model-selector source refs; Contracts_V0/storage-plan/Permissions owner impacts; FinalGUISpec Settings Tab Registry placement; chain-wizard-flexibility consumer ref; GRS-014 artifact owner scope; GRS-002 hard-stop classes; ledger manifest status. Regenerate generated artifacts only through scripts and rerun the validator suite. Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks.
```
