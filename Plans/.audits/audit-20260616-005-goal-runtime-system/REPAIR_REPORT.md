# Repair Report - audit-20260616-005-goal-runtime-system

Status: PASS

Ledger: `pldg-20260616-001-goal-runtime-system`

## Scope

This was a bounded repair for `ESF-001` through `ESF-017` from the Deep Post-Compile Fidelity Audit. It did not redo the compile or audit, and it did not create WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, implementation files, or production build tasks.

PyYAML was installed into `/private/tmp/pm-py-deps` because the local Xcode `python3` lacked `yaml`; validators were run with `PYTHONPATH=/private/tmp/pm-py-deps`.

## Repaired Findings

- `ESF-001`: Restored ACD-416 status labels, menu/drawer actions, update entry points, and exact tokens.
- `ESF-002`: Restored ACD-418 runtime metadata labels and activity examples.
- `ESF-003`: Restored GRS-008 attachment path examples and local/remote image terms.
- `ESF-004`: Restored GRS-009 weak-worker roles, evidence fields, no-material reasons, and unsupported/canonical content terms.
- `ESF-005`: Restored GRS-015/016/017 budget, parallelism, write-scope conflict, worktree isolation, and no-unlimited-agents constraints.
- `ESF-006`: Restored GRS-010 role-policy fields and model/provider negative constraint.
- `ESF-007`: Restored GRS-023 exact external lineage tokens without making them canonical behavior.
- `ESF-008`: Split ledger compile, explicit PlanUnit indexing, and governance seal wording in GRS-021 and the index map.
- `ESF-009`: Replaced ACD-417 pipe enum shape with individual source tokens.
- `ESF-010`: Added `atom-0103`, `atom-0104`, and `atom-0105` to `0PI-055` source_lineage.
- `ESF-011`: Added `CV-286`, `SP-214`, and `PS-114` adjacent owner PlanUnits.
- `ESF-012`: Added `MS-108` and `MA-060`; routed model/account/provider ownership through Goal Runtime and index refs.
- `ESF-013`: Added Goal Mode worker/verifier-adjudicator selector placement to the Settings Tab Registry.
- `ESF-014`: Added `chain-wizard-flexibility.md` to the Native Goal Runtime owner map.
- `ESF-015`: Clarified runtime evidence ownership: `Runtime_Artifacts_Panel`/storage consume runtime receipts; `Project_Output_Artifacts` is a boundary reference only.
- `ESF-016`: Restored GRS-002 hard-stop classes.

## False Positives / Out Of Scope

- `ESF-017`: False positive / audit taxonomy drift. `manifest.status` must remain `compiled` for compiled phases per `scripts/pm-bootstrap-ledger-validate.py`; sealed governance remains in registry/current/handoff/compile_queue/ledger_health. No ledger JSON was changed.
- `ESF-018`: Out of scope. Base-present local-machine state was outside the audited range and was not edited.

## Files Changed

Live Plan docs changed:

- `Plans/00-plans-index.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/Models_System.md`
- `Plans/Multi-Account.md`
- `Plans/Permissions_System.md`
- `Plans/assistant-chat-design.md`
- `Plans/storage-plan.md`

Generated artifacts refreshed:

- `Plans/.plan_index/**`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/**` summaries/reports
- `Plans/_shards/**`
- `Plans/Spec_Lock.json`
- affected `Plans/.evidence/**/evidence.json` bundles

## PlanUnit Changes

Modified PlanUnits:

`0PI-055`, `ACD-416`, `ACD-417`, `ACD-418`, `GRS-002`, `GRS-008`, `GRS-009`, `GRS-010`, `GRS-014`, `GRS-015`, `GRS-016`, `GRS-017`, `GRS-021`, `GRS-023`

Added PlanUnits:

`CV-286`, `SP-214`, `PS-114`, `MS-108`, `MA-060`

`F3-393` was not changed directly; its Settings placement was repaired in the canonical Settings Tab Registry.

## Ledger Records

No ledger records or projections were changed. `ESF-017` was recorded as a false positive because the current validator contract requires `manifest.status: compiled` while sealed governance is represented separately.

## Validators

All required validators passed; validator mutation check was clean.

- `python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system`
- `python3 scripts/pm-plan-index.py validate`
- `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits`
- `python3 scripts/pm-plans-verify.py run-gates`
- `python3 scripts/pm-shard-plans.py --check`
- `python3 scripts/pm-plans-verify.py validate-auto-decisions`
- `python3 scripts/pm-plans-verify.py verify-spec-lock`
- `python3 scripts/pm-plans-verify.py validate-evidence`
- `git diff --check`

PlanUnit index summary: 5,041 PlanUnits, 17,918 acceptance units, coverage `pass`, node readiness `blocked_compiler_contract_incomplete`, no WorkNodes or NodeSeed candidates.

## Governance Status

Governance artifacts were refreshed only after live Plans and `.plan_index` were stable. Spec Lock, shards, evidence bundles, plan migration summaries, and PlanUnit index validation all pass.

## Remaining Blockers

None for this bounded repair.

## Exact Next Safe Action

Commit the bounded repair and generated governance/index/shard refresh artifacts, then run a follow-up audit only if independent confirmation of ESF closure is desired.
