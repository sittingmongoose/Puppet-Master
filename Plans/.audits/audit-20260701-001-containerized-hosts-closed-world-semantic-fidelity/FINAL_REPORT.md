# Closed-World Semantic Audit Final Report

- audit_id: `audit-20260701-001-containerized-hosts-closed-world-semantic-fidelity`
- ledger_id: `pldg-20260630-001-feature-intake`
- observation_ref: `HEAD`
- subject_ref: `b27308f96ed80c0bbe71d079cca5eb188026b0a1`
- baseline_ref: `5a5a54c4e6a5e5ae74a5dffb306872beacae9db5`
- status: `BLOCKED`

## Scope And Coverage

- Scope manifest rows: `9144`
- Audited rows: `9144`
- Coverage: `100.0%`
- Unique check_ids: `9144`
- Manifest family counts:
  - `compile_target`: `220`
  - `compiled_atom_detail`: `4156`
  - `dependency_edge`: `177`
  - `forbidden_artifact_check`: `10`
  - `index_governance_check`: `696`
  - `ledger_projection_field`: `1971`
  - `owner_consumer_route`: `124`
  - `planunit_claim`: `1394`
  - `reciprocal_source_lineage`: `220`
  - `schema_contract_identity`: `176`

## Actionable Findings

- Repair-required findings: `3`
- `sfk-bd12e603e3d781b949823e2e` `closure_registry_currentness_failure`: Semantic closure registry validation fails with 700 stale owner_evidence_hashes/closure_evidence_hashes after the containerized-hosts governed files changed; closure rows must be refreshed before this audit can pass.
  - PlanUnits: `PDS-014, PLS-012`
  - Atoms: `none`
  - Owners: `Plans/.audits/_semantic_closure_registry.jsonl, scripts/pm-audit-closure.py`
  - Detail keys: `pm-audit-closure.py validate, owner_evidence_hashes, closure_evidence_hashes, stale_hash_error_count`
  - Exact tokens: `700 stale closure-registry hash errors | owner_evidence_hashes is stale | closure_evidence_hashes is stale | Plans/.audits/_semantic_closure_registry.jsonl:7: owner_evidence_hashes for Plans/00-plans-index.md is stale (stored bc4bbc03e1f95de07300cf271a85c04dbe7ebe06675160cd902125401da2e824, current bc51dc6b41d57a6e84caa44ba1fea89bce18079849ee203d1316746d758e633e) | Plans/.audits/_semantic_closure_registry.jsonl:7: closure_evidence_hashes for Plans/00-plans-index.md is stale (stored bc4bbc03e1f95de07300cf271a85c04dbe7ebe06675160cd902125401da2e824, current bc51dc6b41d57a6e84caa44ba1fea89bce18079849ee203d1316746d758e633e)`
- `sfk-b6d8491bd5d8509b3345f13a` `ledger_projection_governance_status_drift`: Sealed compact state still carries pre-seal governance-pending tokens in current/handoff post_compile_pending_items and compile_queue notes/validation_state.
  - PlanUnits: `none`
  - Atoms: `none`
  - Owners: `Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/current.json, Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/handoff.json, Plans/ledgers/v2/pldg-20260630-001-feature-intake/state/compile_queue.json`
  - Detail keys: `post_compile_pending_items[1], notes, validation_state.governance_status, validation_state.pm_plans_verify_run_gates, validation_state.pm_shard_plans_check`
  - Exact tokens: `Governance seal remains pending because live Plans, Plans/.plan_index, and allowed Plans/.plan_migration metadata changed; run a separate explicit seal phase before refreshing Spec_Lock, shards, evidence, plan_graph, or auto_decisions. | Governance seal remains pending because live Plans, Plans/.plan_index, and allowed Plans/.plan_migration metadata changed; run a separate explicit seal phase before refreshing Spec_Lock, shards, evidence, plan_graph, or auto_decisions. | Compiled PlanUnits are product/spec owner-coverage ready and compile validators pass. Fourth subjective/objective recheck found no missing canonical owner coverage, but direct Docker/Hosts GUI/workflow implementation-packet detail remains open; governance seal remains pending and explicit-only. | validation_state.governance_status=pending_seal | pm_plans_verify_run_gates=fail_pending_governance_seal`
- `sfk-b4f324ee79a3f93b1b370ef7` `reciprocal_source_lineage_atom_qualification`: 0PI-065 lists eight source_atom_ids, but its source_lineage is file-level and does not atom-qualify those refs while the other compiled PlanUnits do.
  - PlanUnits: `0PI-065`
  - Atoms: `atom-0006, atom-0017, atom-0051, atom-0054, atom-0055, atom-0056, atom-0076, atom-0082`
  - Owners: `Plans/00-plans-index.md, Plans/.plan_index/plan_units.jsonl`
  - Detail keys: `source_atom_ids, source_lineage`
  - Exact tokens: `atom-0006 | atom-0017 | atom-0051 | atom-0054 | atom-0055`

## Non-Actionable Findings

- Warnings: `4`
- `sfk-4d02867e69dc8d096b8f43d6` `node_readiness_phase_boundary`: Node readiness remains blocked by compiler/runtime boundary by design; no executable node artifacts are authorized.
- `sfk-00c783f767fb8b0f3a68d7cc` `direct_gui_workflow_build_packet_gap_preserved`: The direct Docker/Hosts Slint GUI/workflow build-packet gap remains open and is correctly preserved as implementation_ready_in_ledger=false, not hidden as compile readiness.
- `sfk-e34623186bb7a6f7389355a7` `legacy_compile_queue_target_doc_weak_scalar`: Compile queue legacy scalar target_doc remains Plans/Contracts_V0.md, but authoritative target_docs and compiled_owner_docs enumerate all 20 owner docs.
- `sfk-8a900b663e752609f10c9e81` `provider_opencode_adjacent_reference_only`: CBP-023 has Provider_OpenCode in owner_hints, but its canonical text keeps OpenCode reference-only and not a generic containerized-host owner; treat this as adjacent hint wording, not owner route authority.
- Observations: `3`
- `sfk-45cbc476e74096519208023c` `audit_bundle_untracked_not_in_subject_ref`: This audit bundle is intentionally written after subject_ref under the audit-only write boundary; observation_ref records HEAD.
- `sfk-6e81d44d83bd224f2bb801c8` `no_matching_closure_reuse_for_current_ledger`: No prior semantic-closure registry rows exist for pldg-20260630-001-feature-intake, so no valid current-ledger closures can be reused.
- `sfk-bbbebffd971ab790692799ee` `forbidden_artifact_absence_verified`: No actual WorkNodes, NodeSeeds, executable queues, GoalRuns, runtime/build surfaces, implementation files, production build tasks, or legacy Iced app files were created by the subject range; forbidden terms appear only in plan/governance text and generated shard filenames.

## Validator Results

- Validator commands: `15`
- Passed: `13`
- Failed: `2`
- `closure_registry_validate` failed with exit code `1`; repair_required=`true`
- `closure_audit_dir_validate` failed with exit code `1`; repair_required=`true`
- Closure registry currentness: `fail_stale_hashes` with `700` stale hash errors
- Mutated outside audit dir: `false`
- Non-audit side effects: `[]`

## Closure And Forbidden Artifacts

- Closure reuse rows: `1`; valid reused rows for this ledger: `0`
- Forbidden artifacts: `absent`; no WorkNodes, NodeSeeds, executable queues, GoalRuns, runtime/build surfaces, implementation files, production build tasks, legacy Iced app, or separate Coasts website were created by the subject range.

## Next Action

Repair is required before this cycle can pass: refresh closure-registry currentness, reconcile sealed ledger projections that still say governance is pending, and atom-qualify `0PI-065` reciprocal `source_lineage` for its eight source atoms. This audit did not repair anything.
