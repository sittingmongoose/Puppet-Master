# audit-20260618-009-prd-planning-wizard-post-closure-fidelity

## Status

BLOCKED for exact semantic fidelity. Repo validators passed and no validator side effects were detected.

## Inferred IDs And Range

- `ledger_id`: `pldg-20260618-001-prd-planning-wizard`
- `audit_id`: `audit-20260618-009-prd-planning-wizard-post-closure-fidelity`
- `baseline_ref`: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe`
- `current_ref`: `e40dae4d915795fac966b30bb260428c4128a3a5`
- `range`: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe..e40dae4d915795fac966b30bb260428c4128a3a5`
- Inference evidence: latest non-background sealed ledger in `Plans/ledgers/v2/ledger_registry.json`, recent contiguous commits touching `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/` or the registry, and current `HEAD`.
- Earliest contiguous cycle commit: `c205ca50`; baseline is its parent.
- Excluded background ledger: `pldg-20260610-001-ledger-plan-system`.

## Changed Files

- Full-range changed-file count: 835
- Classes: {"audits": 38, "governance": 702, "ledger": 41, "live_plan_docs": 38, "plan_index": 6, "support_root": 10}
- Changed live non-pipeline Plan docs (38):
- `Plans/00-plans-index.md`
- `Plans/Automated_Testing_System.md`
- `Plans/Bootstrap_Planning_Migration.md`
- `Plans/Commands_System.md`
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/Executor_Protocol.md`
- `Plans/FileSafe.md`
- `Plans/FinalGUISpec.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/GitHub_Integration.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/Media_Generation_and_Capabilities.md`
- `Plans/Models_System.md`
- `Plans/Multi-Account.md`
- `Plans/Orchestrator_Page.md`
- `Plans/PRD_Builder.md`
- `Plans/Permissions_System.md`
- `Plans/Personas.md`
- `Plans/Plan_Document_System.md`
- `Plans/Plan_To_Node_Compilation.md`
- `Plans/Planning_Ledger_System.md`
- `Plans/Planning_Wizard.md`
- `Plans/Progression_Gates.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/Run_Graph_View.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Wiring_Matrix.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/assistant-chat-design.md`
- `Plans/bootstrap/Bootstrap_Planning_Workflow.md`
- `Plans/bootstrap/Codex_Prompts.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/chain-wizard.md`
- `Plans/human-in-the-loop.md`
- `Plans/plans_to_code_handoff.schema.json`
- `Plans/storage-plan.md`

No live non-audit Plan docs changed between the prior semantic-audit current ref `d99a406a` and `e40dae4d915795fac966b30bb260428c4128a3a5`; the new issue is a post-closure cross-document fidelity miss found by re-reading changed owner docs, not by a new post-audit live Plan edit.

## PlanUnit Deltas

- Compiled PlanUnits added: 61
- Changed PlanUnits: 0
- Deleted PlanUnits: 0
- Added IDs: `PRDB-001`, `PRDB-002`, `PRDB-003`, `PRDB-004`, `PRDB-005`, `PRDB-006`, `PRDB-007`, `PWIZ-001`, `PWIZ-002`, `PWIZ-003`, `PWIZ-004`, `PWIZ-005`, `PWIZ-006`, `PWIZ-007`, `PWIZ-008`, `PWIZ-009`, `PWIZ-010`, `PWIZ-011`, `PWIZ-012`, `PWIZ-013`, `ACD-421`, `PLS-014`, `P-054`, `MS-112`, `PDS-016`, `ATS-005`, `ATS-006`, `ATS-007`, `ATS-008`, `ATS-009`, `ATS-010`, `PNC-015`, `PNC-016`, `PNC-017`, `EP-104`, `EP-105`, `GRS-031`, `CV-290`, `SP-216`, `F2-190`, `W-073`, `GI-032`, `GAAAF-013`, `PS-117`, `POA-049`, `RAP-030`, `RGV-014`, `MGAC-093`, `MA-061`, `HITL-037`, `PG-059`, `F3-398`, `OP-025`, `UCC-097`, `CS-052`, `0PI-059`, `C-050`, `WM-038`, `BPM-008`, `CW-009`, `CWF-152`

## Atom Fidelity

- Matrix rows: 168
- Classifications: {"exact_present": 161, "missing_or_drift": 7}
- Affected rows: `atom-0002`, `atom-0101`, `atom-0102`, `atom-0103`, `atom-0106`, `atom-0107`, `atom-0109`
- Artifact: `atom_fidelity_matrix.jsonl`

### Unclosed Exact-Detail Drift

1. `SR-DF0965458FFC` / `sfk-df0965458ffc0841ade5005f`
   - Classification: `missing_or_drift`
   - Severity: `blocker`
   - Source atoms: `atom-0002`, `atom-0101`, `atom-0102`, `atom-0103`, `atom-0106`, `atom-0107`, `atom-0109`
   - PlanUnits/docs implicated: `PNC-014`, `PWIZ-010`, `PNC-015`, `CV-290`, plus handoff row `H-001`
   - Required current semantics: `Planning Wizard`, `Approve And Build`, immutable `ApprovedPlanPack`, frozen `PlanUnit index`, frozen `acceptance-unit index`, `lineage`, `automatic_after_approval`, `PlanCompileRun`, and `Orchestrator` / `Plan Compile tab` authority.
   - Drift evidence: `Plans/Plan_To_Node_Compilation.md:669` still says active transitions start from `Plan Wizard approval`; `Plans/Plan_To_Node_Compilation.md:750` still says `Plan Wizard approval`, `approved Plan Wizard ledger plus PlanUnit index`, and producer `Goal Runtime / Plan Wizard`.
   - Correct evidence: `Plans/Planning_Wizard.md:697` defines `Approve And Build`, `ApprovedPlanPack`, and frozen PlanUnit/acceptance-unit indexes as Plan Compile authority; `Plans/Plan_To_Node_Compilation.md:778` keeps v1 handoff design-only and introduces runtime-capable v2.
   - Closure registry: checked; not previously closed. Existing `PNC-014` closures cover older plans-to-code tokens, not this active stale Plan Wizard approval / mutable-ledger authority drift.

2. `SR-HANDOFF-AUTODECISIONS-001` / `sfk-handoff-auto-decisions-provenance-drift-001`
   - Classification: `missing_or_drift`
   - Severity: `medium`
   - Ledger projection warning: `Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/state/handoff.json:8` says the seal refreshed `auto_decisions`, but `scripts/pm-governance-seal.py:251` describes the helper as refreshing Spec Lock and evidence hashes, and `Plans/auto_decisions.jsonl` has no PRD Planning Wizard seal row.
   - This does not fail validators, but it is not exact provenance and remains open.

## Previously Closed

- Reused closure rows: 108
- Closure statuses: false_positive: 2, not_for_plan: 14, repaired: 82, source_lineage_only: 3, stale_retired: 7
- Hash validation failures: 0
- Artifact: `closure_reuse.jsonl`

Closed findings whose hashes/evidence still match were recorded as reused and not reopened.

## Reciprocal Lineage

- Checked PlanUnit claim rows: 61
- Claim statuses: source_lineage_supported: 61
- Missing lineage rows: 0
- Extra source atoms: 0
- Canonical text atom-label leaks: 0
- Artifact: `planunit_source_claims.jsonl`

The compiled 61 PRD/Planning Wizard PlanUnits support their source-lineage claims. The open blocker is cross-owner handoff prose that remained stale in `PNC-014`/`H-001`, not a missing source-lineage claim on the newly compiled PlanUnits.

## Owner Routing

- Owner routing findings: 0
- No unclosed wrong-owner, consumer-only placement, missing owner impact, schema/storage/provider/security/GUI/governance owner-route defects were found for the 61 compiled PlanUnits.
- Artifact: `owner_routing_findings.jsonl`

## Ledger And Governance

- Sealed ledger core consistency: `pass_with_warnings`
- Manifest/current/registry status: sealed
- Compiled atoms: 168
- Compiled PlanUnits: 61
- Candidate atoms: 0
- Open questions: 0
- Open blockers: 0
- Ready-for-plan-compile atoms: 0
- Warning: handoff provenance overclaims `auto_decisions` refresh, recorded as `SR-HANDOFF-AUTODECISIONS-001`.

## Validators

- Validator status: `pass`
- Commands run: 13
- Side effects detected: False
- PYTHONPATH: `/private/tmp/pm-py-deps:/private/tmp/pm-jsonschema`

- `git_diff_check`: pass (0.017s), side_effects=False
- `plan_index_validate`: pass (20.84s), side_effects=False
- `plan_migration_validate`: pass (14.887s), side_effects=False
- `bootstrap_ledger_validate`: pass (8.173s), side_effects=False
- `shard_plans_check`: pass (0.512s), side_effects=False
- `audit_closure_validate`: pass (0.828s), side_effects=False
- `plans_run_gates`: pass (5.209s), side_effects=False
- `validate_auto_decisions`: pass (0.055s), side_effects=False
- `verify_spec_lock`: pass (0.059s), side_effects=False
- `validate_evidence`: pass (0.519s), side_effects=False
- `validate_plan_graph`: pass (0.459s), side_effects=False
- `audit_governance`: pass (4.589s), side_effects=False
- `validate_plans_to_code_handoff_schema`: pass (0.056s), side_effects=False

## Forbidden Artifacts

- WorkNodes created: no
- NodeSeeds / NodeSeed candidates created: no
- Executable queues / final node queues / manifests created: no
- Implementation files / Rust / Slint / legacy Iced app files created: no
- Production build tasks created: no
- Node readiness status remains `blocked_compiler_contract_incomplete`.

## Artifacts Written

- `audit_report.json`
- `atom_fidelity_matrix.jsonl`
- `planunit_source_claims.jsonl`
- `owner_routing_findings.jsonl`
- `closure_reuse.jsonl`
- `ledger_consistency.json`
- `validator_results.json`
- `semantic_risks.jsonl`
- `FINAL_REPORT.md`

## Next Safe Action

Run a bounded semantic repair for `PNC-014` and `H-001` only, plus an optional ledger-projection provenance cleanup for the `auto_decisions` handoff sentence. Do not create WorkNodes, NodeSeeds, executable queues, manifests, runtime dispatch, implementation files, or production build tasks. Regenerate PlanUnit index/governance artifacts only inside an explicit repair/seal phase.

## Compact Repair Prompt

```text
Repair only the audit-20260618-009 findings for ledger pldg-20260618-001-prd-planning-wizard. Do not redo the compile. Do not create WorkNodes, NodeSeeds, executable queues, manifests, implementation files, runtime dispatch, or production build tasks.

Fix PNC-014 and handoff row H-001 so active Plan_To_Node_Compilation prose no longer uses Plan Wizard approval, approved Plan Wizard ledger, or Goal Runtime / Plan Wizard as current authority. Align with Planning Wizard Approve And Build semantics: immutable ApprovedPlanPack plus frozen PlanUnit and acceptance-unit indexes are Plan Compile authority; the Planning Wizard ledger is source/reasoning lineage only. Preserve design-only/runtime-disabled v1 boundaries and runtime-capable v2 language.

Optionally repair ledger state/handoff.json provenance so it does not claim auto_decisions was refreshed unless an explicit governance decision row actually exists. Then run the standard validators and write a repair report/closure rows for SR-DF0965458FFC and SR-HANDOFF-AUTODECISIONS-001.
```
