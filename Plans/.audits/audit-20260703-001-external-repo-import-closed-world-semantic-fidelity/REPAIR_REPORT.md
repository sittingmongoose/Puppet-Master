# Repair Report - audit-20260703-001-external-repo-import-closed-world-semantic-fidelity

Status: PASS_CERTIFIED

## Summary
Closed all 6 repair-required findings from the closed-world semantic audit. The terminal post-repair audit is `PASS_WITH_WARNINGS` only because the stale root shard report sibling remains a non-actionable warning.

No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime dispatch, or production build tasks were created.

## Coverage
Original audit scope rows: 3792. Repair impact rows: 6. Coverage: 100%, no sampling.

## Closed Findings
- `sfk-c2d9b8c999c653207d8dd63d` - `planunit_canonical_text_none_placeholder_from_source_delta` -> `repaired`
- `sfk-2048ad95d5a295c3a4b7a47f` - `ledger_design_atom_validation_notes_stale_compile_state` -> `repaired`
- `sfk-9eb4947b9111e0e62a6290fb` - `ledger_projection_notes_governance_seal_stale` -> `repaired`
- `sfk-c991bae414aca3fa4f29a7ac` - `ledger_compile_summary_stale_migration_validator_result` -> `repaired`
- `sfk-5efdc99245444addb8f240df` - `closure_registry_hashes_stale_validator_failure` -> `repaired`
- `sfk-0439337e339aad8f961ef365` - `forbidden_local_machine_state_in_subject_diff` -> `repaired`

## Validators
- `closure_registry_validate`: `pass`
- `target_audit_closure_validate`: `pass`
- `target_ledger_validate`: `pass`
- `plan_index_validate`: `pass`
- `plan_migration_validate`: `pass`
- `shard_check`: `pass`
- `audit_status_index_validate`: `pass`
- `auto_decisions_validate`: `pass`
- `spec_lock_verify`: `pass`
- `evidence_validate`: `pass`
- `plan_graph_validate`: `pass`
- `audit_governance`: `pass`
- `run_gates`: `pass`
- `pytest`: `pass`
- `git_diff_check`: `pass`
- `git_diff_cached_check`: `pass`

## Next Action
No repair remains. Commit/push only if explicitly requested.
