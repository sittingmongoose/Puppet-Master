# Semantic Fidelity Audit - audit-20260618-006-prd-planning-wizard-semantic-fidelity

Status: BLOCKED

## IDs And Range

- ledger_id: `pldg-20260618-001-prd-planning-wizard`
- audit_id: `audit-20260618-006-prd-planning-wizard-semantic-fidelity`
- baseline_ref: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe`
- current_ref: `c205ca507832a23c9393c6e470229cc72f7f5eeb`
- range: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe..c205ca507832a23c9393c6e470229cc72f7f5eeb`
- inference: latest sealed non-background ledger from `Plans/ledgers/v2/ledger_registry.json`; the target ledger directory first appears at `HEAD`, so baseline is the parent commit.

## Changed Files

- Total changed files in range: 794
- Live non-pipeline Plan/ledger files changed: 79
- Generated/index/governance surfaces changed: `Plans/.plan_index/**`, `Plans/.plan_migration/**`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/Spec_Lock.json`.

## PlanUnit Deltas

- PlanUnits: 5105 -> 5166 (`+61`, `-0`, changed existing `2900` mostly regenerated hash/line metadata)
- Acceptance units: 18237 -> 18420 (`+183`, `-0`)
- Added PlanUnits: `0PI-059, ACD-421, ATS-005, ATS-006, ATS-007, ATS-008, ATS-009, ATS-010, BPM-008, C-050, CS-052, CV-290, CW-009, CWF-152, EP-104, EP-105, F2-190, F3-398, GAAAF-013, GI-032, GRS-031, HITL-037, MA-061, MGAC-093, MS-112, OP-025, P-054, PDS-016, PG-059, PLS-014, PNC-015, PNC-016, PNC-017, POA-049, PRDB-001, PRDB-002, PRDB-003, PRDB-004, PRDB-005, PRDB-006, PRDB-007, PS-117, PWIZ-001, PWIZ-002, PWIZ-003, PWIZ-004, PWIZ-005, PWIZ-006, PWIZ-007, PWIZ-008, PWIZ-009, PWIZ-010, PWIZ-011, PWIZ-012, PWIZ-013, RAP-030, RGV-014, SP-216, UCC-097, W-073, WM-038`

## Unclosed Semantic Drift

1. `afw1-stale-requirements-doc-builder-current-prose` - PRD Builder rename is canonical, but active-looking consumer prose still uses Doc Builder / Requirements Doc Builder outside a clear compatibility wrapper.
2. `afw1-stale-chain-plan-wizard-current-prose` - Planning Wizard rename is canonical, but active-looking UI/chat/command/model prose still uses Chain Wizard or Plan Wizard as current terminology.

No previous closure rows exist for this target ledger, so no finding was reused as `previously_closed`.

## Reciprocal Lineage

- Checked compiled PlanUnits: 61
- Source atom IDs in canonical text, `source_atom_ids`, and `source_lineage` match for every compiled PlanUnit.
- Mismatch count: 0

## Owner Routing

Owner split is broadly correct for PRD Builder, Planning Wizard, testing, PlanCompile, Executor, Goal Runtime, GUI, commands, source control, permissions, contracts, artifacts, and governance. The open routing issue is stale active consumer terminology in older consumer docs, not missing new owner docs.

## Ledger And Governance

- Ledger state: sealed, event `evt-0022`, 168 atoms, 61 compile-queue items, 61 compiled PlanUnits.
- Sealed projections have no active candidate/open question/ready_for_plan_compile residue.
- `.plan_index` is structurally green: 5,166 PlanUnits, 18,420 acceptance units, no unresolved dependencies.
- Node readiness remains intentionally `blocked_compiler_contract_incomplete`; runtime enablement remains `runtime_disabled`.
- Forbidden artifact scan found no unexpected WorkNodes, NodeSeeds, candidates, executable queues, final node manifests, implementation files, or production build tasks.

## Validators

- Passed: 12/13 commands.
- Failed: `pm-audit-closure.py validate` because older closure registry rows have stale evidence hashes after this governance/index cycle.
- No validator mutated files outside this audit directory.

## Additional Warnings

- `scripts/pm-install-prd-planning-wizard-ledger.py` would downgrade the sealed registry entry back to the precompile active drop-in state if run now.
- `VALIDATION_REPORT.*` is historical package/drop-in validation, not current seal proof.
- Migration final summary still has a stale `node_readiness_status=runtime_disabled` label even though current readiness status is `blocked_compiler_contract_incomplete`.

## Next Safe Action

Run a bounded repair from this audit bundle. Fix or explicitly compatibility-wrap stale naming references, refresh stale closure-registry hashes, then rerun a focused post-repair audit. Do not enable PlanCompile runtime, create WorkNodes/NodeSeeds/queues, or broaden into a redesign.

## Compact Repair Prompt

Repair `audit-20260618-006-prd-planning-wizard-semantic-fidelity` for ledger `pldg-20260618-001-prd-planning-wizard`. Read only its audit artifacts first. Fix every open `semantic_risks.jsonl` row: update/compat-wrap stale Requirements Doc Builder, Doc Builder, Chain Wizard, and Plan Wizard current-prose references; refresh closure registry stale hashes; guard stale installer/report hazards if in scope. Do not redesign, recompile broadly, enable PlanCompile runtime, or create WorkNodes/NodeSeeds/queues. Rerun validators and close each finding explicitly.
