# Closed-World Semantic Audit Final Report

audit_id: `audit-20260701-003-doctor-onboarding-closed-world-semantic-fidelity`  
ledger_id: `pldg-20260701-001-feature-intake`  
baseline_ref: `f5c3d888e870414f77a3e793158b41d2d027c47c`  
subject_ref: `291d567e0b8c706df37a055391fa5be1a81e521f`  
observation_ref: `291d567e0b8c706df37a055391fa5be1a81e521f`

## Result

`BLOCKED`

The audit completed with 100% manifest coverage: 1,571/1,571 scope rows classified. It found 10 semantic repair-required findings and 2 validator repair-required findings. No repairs were performed.

## Coverage

- `audit_scope_manifest.jsonl`: 1,571 classified rows
- `atom_fidelity_matrix.jsonl`: 1,103 rows
- `planunit_source_claims.jsonl`: 385 rows
- `owner_routing_findings.jsonl`: 144 rows
- `ledger_consistency.json`: 180 ledger projection rows
- `semantic_risks.jsonl`: 10 grouped semantic findings
- `repair_impact_matrix.jsonl`: 12 actionable impact rows
- `closure_reuse.jsonl`: 0 same-ledger closure rows reused

## Actionable Findings

1. `sfk-d77059aad13a97f6cdde66dc` - `reciprocal_source_lineage_atom_qualification`  
   All 9 compiled PlanUnits carry `source_atom_ids`, but `source_lineage` lists the design atom stream generically instead of atom-qualified refs.

2. `sfk-3c9b5dbc51d0cf9a295cb500` - `reciprocal_source_atom_id_disagreement`  
   `ACD-431`, `MA-066`, and `UCC-106` disagree with ledger atom target mappings.

3. `sfk-c6b44a39a77dd5c092e9ea69` - `planunit_source_lineage_missing_source_ref`  
   Several PlanUnits omit source shard refs required by claimed source atoms.

4. `sfk-6c1c3f86840868d121796012` / `sfk-14e39c5db4bde40c6ce66d53` - `planunit_preserved_exact_token_missing`  
   `CV-305` misses `assistant_chat_handoff_seed`; `ATS-020` misses exact token `Fee models`.

5. `sfk-d1bd4226cde58ebf29d82cd6` - `dependency_edge_reciprocal_drift`  
   `UCC-106` unblocks `PWIZ-017`, but `PWIZ-017.depends_on` does not include `UCC-106`.

6. `sfk-a31dd763cd49746248d2e9de` - `compile_queue_target_doc_stale`  
   Non-contract compile queue items keep singular `target_doc=Plans/Contracts_V0.md` while `target_docs[0]` has the real owner.

7. `sfk-635ea8974cc7f9be1c0a79d0` - `ledger_operating_capsule_projection_drift`  
   `operating_capsule.json` still says `conversation_active`, `not_started`, and `evt-0015` while sealed projections are at `evt-0018`.

8. `sfk-0be34b8e3a55f0c873b0f3f2` - `ledger_registry_root_timestamp_stale`  
   Registry root `updated_at_utc=2026-07-01T20:34:05Z` predates the target sealed ledger `last_updated_at_utc=2026-07-01T20:52:02Z`.

9. `sfk-1e3e6b3f9de577e1bdfa0952` - `ledger_health_summary_count_drift`  
   `ledger_health.summary.not_for_plan_atoms=6`, but `design_atoms.jsonl` has 20 `not_for_plan` records: 6 non-applicable plus 14 source-lineage-only candidates.

10. Validator findings `sfk-4295336d87f4f0b9df21a400` and `sfk-49196add0ba77692bc015ce1`  
    `pm-audit-closure.py validate` fails because `_semantic_closure_registry.jsonl` has stale owner/closure evidence hashes. The audit-dir closure coverage itself has 0 artifact errors and 0 missing impact coverage.

## Validator Summary

Passed: target ledger validate, PlanUnit index validate, migration validate, governance audit, run-gates, shard check, auto-decisions, Spec Lock, evidence, plan graph, project artifacts, and `git diff --check`.

Failed: closure registry validate and target audit-dir closure validate, both due to stale global closure registry hashes.

No validator side effects outside the audit directory remained.

## Next Action

Run bounded repair for the 12 actionable rows. Do not recompile or redesign first; repair the listed PlanUnit lineage/token/edge/projection drift and refresh closure registry hashes with `scripts/pm-audit-closure.py refresh-hashes`, then rerun the closure and governance validator stack.
