# Closed-World Semantic Audit - audit-20260702-001-doctor-onboarding-post-repair-closed-world-semantic-fidelity

Status: PASS_WITH_WARNINGS

Ledger: `pldg-20260701-001-feature-intake`  
Baseline: `f5c3d888e870414f77a3e793158b41d2d027c47c`  
Subject / observation: `1c6ffcb983557a9a19235b84241a12e70f32cd34`

## Scope And Coverage

- Scope rows: 2003
- Coverage: 100% classified, no sampling
- Compiled atoms: 27 of 47 design atoms
- PlanUnits audited: F3-411, MS-122, MA-066, CV-305, ACD-431, UCC-106, PWIZ-017, WM-041, ATS-020
- Owner docs audited: Plans/FinalGUISpec.md, Plans/Models_System.md, Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md, Plans/Planning_Wizard.md, Plans/Wiring_Matrix.md, Plans/Automated_Testing_System.md

## Actionable Findings

None. `repair_required_count=0`.

## Non-Actionable Warnings

1. The historical same-ledger `audit_report.json` remains a pre-repair `BLOCKED` record. The effective terminal evidence is `REPAIR_CERTIFICATION.md` plus `post_repair_audit_report.json`, with `repair_required_count=0`.
2. `node_readiness_report` remains `blocked_compiler_contract_incomplete` by design; no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime/build surfaces, or production build tasks were created.

## Exact Evidence

- Repair certification: `Plans/.audits/audit-20260701-003-doctor-onboarding-closed-world-semantic-fidelity/REPAIR_CERTIFICATION.md`
- Post-repair report: `Plans/.audits/audit-20260701-003-doctor-onboarding-closed-world-semantic-fidelity/post_repair_audit_report.json`
- Closure registry reused rows: 12
- Ledger projections: `current.json`, `handoff.json`, `compile_queue.json`, `open_items.json`, `operating_capsule.json`, `ledger_health.json`, and `ledger_registry.json`
- Plan index: `Plans/.plan_index/plan_units.jsonl`, `dependencies.json`, `coverage_report.json`, `node_readiness_report.json`

## Next Action

No repair. Validator stack passed 17/17 commands. Commit and push this audit-only bundle.
