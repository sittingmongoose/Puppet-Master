# FINAL REPORT - audit-20260703-001-external-repo-import-closed-world-semantic-fidelity

Status: BLOCKED
Ledger: `pldg-20260703-001-feature-intake`
Baseline ref: `298894101e433e2ada6e12c06c309369fa361c1b`
Subject ref: `e063ae4395aacbd94ba8dde9bd411e83a42df643`
Observation ref: `e063ae4395aacbd94ba8dde9bd411e83a42df643`
Generated at: `2026-07-03T21:33:11Z`

## Scope

- Final manifest rows: 3792
- Coverage: 100% classified; no sampling
- Design atoms covered: 122
- Compiled PlanUnits covered: 127
- Changed paths in subject range: 897
- repair_required_count = 6

## Actionable Findings

1. `sfk-c2d9b8c999c653207d8dd63d` `planunit_canonical_text_none_placeholder_from_source_delta`: 42 compiled PlanUnits contain literal `: None` in canonical_text. Affected PlanUnits: ACD-432, AMS-043, ATS-022, CV-307, F2-196, F3-414, F3-415, F3-416, GRS-034, GRS-038, GRS-039, MA-067, MI-033, MI-034, MI-035, MI-037, MS-124, MS-125, MS-130, PLS-016, PLS-017, PLUG-063, PP-060, PP-069, PP-070, PP-071, PS-128, PS-129, RSC-004, RSC-005, RSC-006, RSC-007, SMPFS-129, SMPFS-130, SMPFS-131, SMPFS-132, SMPFS-135, SMPFS-136, T-171, T-172, T-173, UF-079.
2. `sfk-2048ad95d5a295c3a4b7a47f` `ledger_design_atom_validation_notes_stale_compile_state`: 113 external import atoms are compiled but still carry validation_notes saying they were not compiled to canonical Plans.
3. `sfk-9eb4947b9111e0e62a6290fb` `ledger_projection_notes_governance_seal_stale`: ledger registry/manifest notes still describe governance as pending while status fields say sealed/pass.
4. `sfk-c991bae414aca3fa4f29a7ac` `ledger_compile_summary_stale_migration_validator_result`: compile_summary retains stale migration validator failure object while normalized validation and governance recheck are pass.
5. `sfk-5efdc99245444addb8f240df` `closure_registry_hashes_stale_validator_failure`: semantic closure registry validator fails on stale owner/closure evidence hashes.
6. `sfk-0439337e339aad8f961ef365` `forbidden_local_machine_state_in_subject_diff`: subject diff includes `.claude/settings.local.json`, which violates the AGENTS.md local-machine-state boundary.

## Warning

- `sfk-a722575c4a364e816074e0c8` `stale_root_shard_report_sibling`: stale root `Plans/.evidence/plan-sharding-2026-06-09/shard_report.json` remains beside current `reports/shard_report.json`; it was not changed by this subject cycle.

## Validators

All recorded standard validators passed except `python3 scripts/pm-audit-closure.py validate`, which failed on stale closure-registry hashes. Git status before/after validator execution showed no non-audit validator side effects; the pre-existing `.claude/settings.local.json` modification remained, and this audit directory is the only audit write surface.

## Next Action

Run a repair pass for the six repair-required findings, then rerun the closure, target-ledger, plan-index, migration, governance, shard, auto-decision, Spec Lock, evidence, and diff validators. This audit performed no repairs.
