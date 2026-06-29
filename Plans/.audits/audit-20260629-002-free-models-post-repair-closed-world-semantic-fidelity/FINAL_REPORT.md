# Final Report: audit-20260629-002-free-models-post-repair-closed-world-semantic-fidelity

Status: PASS_WITH_WARNINGS
Next action: TERMINAL_PASS_WITH_WARNINGS_NO_REPAIR

## Scope
- ledger_id: pldg-20260629-001-feature-name
- baseline_ref: d6da6b229ff6e675b3be717c2fb92e42baab19b2
- subject_ref: 55e344021b89e8d81c04acf914fc8e68a4ba6efa
- observation_ref: HEAD
- scope rows: 10428
- audited coverage: 10428/10428 rows, 100%, no sampling
- audit writer boundary: only `Plans/.audits/audit-20260629-002-free-models-post-repair-closed-world-semantic-fidelity/` was written

## Result
- actionable findings: 0
- repair_required_count: 0
- previously closed findings reused: 3
- non-actionable warnings: 3
- observations: 3
- PlanUnits checked: 23 (MS-118, MS-119, CV-301, SP-224, EP-108, PP-058, F3-407, CV-302, PS-125, F2-193, MA-065, MS-120, F3-409, EP-107, SP-225, UF-077, F3-408, MA-064, RAP-040, MS-121, UF-078, RAP-041, 0PI-064)

## Exact Evidence
- Atom fidelity matrix: 10428 rows; classifications {'equivalent_with_evidence': 2800, 'exact_present': 9313, 'not_for_plan': 254, 'observation': 6, 'previously_closed': 1, 'stale_retired': 198}
- PlanUnit reciprocal source claims: 2007 rows, all exact_present
- Owner routing findings: 137 rows; 136 exact_present, 1 observation
- Ledger consistency: pass; governance sealed; compiled PlanUnit count 23; open questions 0; open blockers 0
- Registry and compile queue agreement: top registry and entry timestamps are 2026-06-29T18:56:04Z, compile queue governance note is current, node readiness remains blocked_compiler_contract_incomplete by design
- Forbidden artifacts: no WorkNodes, NodeSeeds, executable queues, GoalRuns, runtime/build surfaces, implementation paths, or production build artifacts changed; text hits are generated shard filenames only

## Previously Closed
- closure_registry_currentness_failure (sfk-f6f7b1a8d1ba5658b04fb84f): previously closed via closure-audit-20260629-001-free-models-closed-world-semantic-fidelity-repair-001
- compile_queue_governance_note_stale (sfk-efd04bdd70b5ae8d16202105): previously closed via closure-audit-20260629-001-free-models-closed-world-semantic-fidelity-repair-002
- ledger_registry_top_level_timestamp_stale (sfk-c69d7fbf0d257ba89b1d2d67): previously closed via closure-audit-20260629-001-free-models-closed-world-semantic-fidelity-repair-003

## Warnings
- node_readiness_phase_boundary (sfk-b9777e94042d51ec207d53ca): Node readiness remains blocked by compiler/runtime boundary by design; no executable node artifacts are authorized.
- legacy_compile_queue_target_doc_weak_scalar (sfk-1dbffc691373ded340364f39): Compile queue legacy scalar target_doc remains Plans/Contracts_V0.md on all queue items, but authoritative target_docs and compiled owner docs are correct; treat target_doc as weak legacy evidence only.
- provider_opencode_owner_hint_overridden (sfk-f1fcdcdd2834d6433c67cd70): Some source atoms mention Provider_OpenCode or CLI_Bridged_Providers in owner_hints, but atom-0297/atom-0298 and 0PI-064 override routing to the compiled owner set and keep Provider_OpenCode adjacent/reference-only.

## Observations
- audit_bundle_untracked_not_in_subject_ref (sfk-516f37e40d47d2244d86fc9c): This post-repair audit bundle is intentionally written after subject_ref under the audit-only write boundary; observation_ref records HEAD.
- provider_opencode_adjacent_reference_only (sfk-4b583841183e0c9111977992): Provider_OpenCode remains adjacent/reference-only for Free Models compile; no owner drift detected in compiled owner docs.
- forbidden_artifact_name_hit_generated_shard_only (sfk-e2eec4507b4f489edd58f167): Forbidden-artifact text-pattern hits are confined to generated shard filenames for historical plan prose; no actual WorkNodes, NodeSeeds, executable queues, GoalRuns, runtime/build surfaces, implementation paths, or production build artifacts changed.

## Validators
All validators passed with no non-audit side effects.

- closure_registry_validate: pass
- closure_audit_dir_validate: pass
- target_ledger_validate: pass
- plan_index_validate: pass
- migration_validate: pass
- audit_governance: pass
- run_gates: pass
- shard_check: pass
- validate_auto_decisions: pass
- validate_plan_graph: pass
- verify_spec_lock: pass
- validate_evidence: pass
- audit_closure_unittest: pass
- git_diff_check: pass

## Closure
The audit reused valid closure-registry rows and did not reopen them because governed source, PlanUnit, owner, and closure evidence did not change. No repair is authorized or required.
