# Shard 011: FABLE Residual Planning Ledger Service Cleanup Addendum - 2026-07-07

Source: `Plans/Planning_Ledger_System.md`

Source lines: L1034-L1251

Source SHA256: `4df58b72b2f65a562831593848a5477ca7ed125e88cc4c789de108f9446e0837`

---

## FABLE Residual Planning Ledger Service Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High Planning Ledger rows for native service storage/API boundaries. It keeps the ledger as planning/source memory and does not write canonical Plans except through explicit compile phases.

### PLS-019 - Native Ledger Service Storage And API Boundary

```yaml
plan_unit_id: PLS-019
unit_type: schema_contract
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  Native Ledger Service is an in-process API boundary over the ledger storage plan, not an implied network daemon.
  Its default persistence is the governed ledger directory plus EventRecord/seglog-backed projections when available;
  redb indexes are projections, and markdown/export files are derived views. The service exposes append_event,
  commit_turn, recover_turn, snapshot_state, import_package, and export_package request/response shapes with CAS,
  idempotency, source_ref, actor_ref, and validation receipt fields.
  Field types of the request and response fields the acceptance criteria name: ledger_id is a non-empty string (only
  bootstrap ledgers use the pldg- id form of Plans/ledgers/v2/schemas/ledger_core.schema.json ledger_id); event_id,
  turn_id,
  last_committed_turn_id and recommended_replay_start_event_id are non-empty strings, the last two null when no turn
  has committed or nothing needs replay; idempotency_key is a non-empty string; event_type is a non-empty string;
  payload is a JSON object; source_ref is a nullable non-empty string; actor_ref is a non-empty string;
  parent_event_ids[], accepted_atom_ids[], rejected_atom_ids[] and unapplied_event_ids[] are arrays of unique
  non-empty strings; expected_projection_version, expected_current_version, committed_projection_version and
  projection_version are non-negative integers, expected_projection_version nullable when omitted;
  validation_receipt_ref is a non-empty string. Three shapes are gap markers: event_type values (provenance gap;
  gap_note: no closed list of ledger event types exists), the per-event_type payload schema (provenance gap;
  gap_note: no payload schema per event type exists), and the item shapes of open_item_updates[] and
  conflict_records[] (provenance gap; gap_note: no record shape is defined for either).
  Failure results, each a refusal that writes nothing: append_event returns stale_revision when
  expected_projection_version is set and differs from the current projection version, and idempotency_conflict when
  the idempotency_key was used with a different request digest (the same key and digest returns the original
  event); commit_turn returns stale_revision when expected_current_version differs from the current version, and
  idempotency_conflict when turn_id was already committed with a different request digest (the same turn_id and
  digest returns the original result); a commit that fails after partial writes leaves the thread
  ledger_sync_blocked as PLS-015 requires. import_package returns import_path_traversal, import_absolute_path,
  import_symlink_escape, import_package_too_large, import_expanded_too_large, or import_ledger_collision (an id or
  name collision with no recorded replace or keep-both policy).
gui_related: false
gui_classification_reason: Ledger service storage and API boundaries are planning infrastructure contracts, not GUI presentation.
depends_on: [PLS-002, PLS-015]
unblocks: []
acceptance_criteria:
  - append_event requires ledger_id, event_id, idempotency_key, event_type, payload, source_ref?, actor_ref, parent_event_ids[], and expected_projection_version?.
  - commit_turn requires ledger_id, turn_id, accepted_atom_ids[], rejected_atom_ids[], open_item_updates[], expected_current_version, and emits committed_projection_version plus validation_receipt_ref.
  - recover_turn returns last_committed_turn_id, unapplied_event_ids[], projection_version, conflict_records[], and recommended_replay_start_event_id.
  - import_package rejects path traversal, absolute paths, symlink escape, package-size overflow, expanded-size overflow, and ledger id/name collision unless explicit replace or keep-both policy is recorded.
  - Storage bindings name the seglog EventRecord stream as the canonical source memory of the Native Ledger Service and mark redb/search/projection/export surfaces as rebuildable derived views. Amended 2026-10-31 (DL-270): per SP-339 the service keeps no always-on JSONL mirror or JSON state files; JSONL or JSON appear only as pm export output on request. JSONL/JSON files remain canonical only for the bootstrap ledger under Plans/ledgers/v2/.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_ledger_service_boundary_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: native_ledger_service_storage_api_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:1190
  - fablereport.md:1191
  - fablereport.md:1192
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "Native Ledger Service"
  - "storage-backed"
  - "append_event"
  - "commit_turn"
  - "recover_turn"
  - "import"
  - "export"
negative_constraints:
  - Do not turn ledger source memory into canonical product prose without an explicit compile request.
  - Do not imply a network service, runtime dispatch, WorkNode creation, NodeSeed creation, executable queue, implementation file, or production build task.
owner_hints:
  - Plans/Planning_Ledger_System.md
  - Plans/storage-plan.md
```

### PLS-017 - P2-AI-TRIAGE-CLOSURE-CONFIDENCE

```yaml
plan_unit_id: PLS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  P2-AI-TRIAGE-CLOSURE-CONFIDENCE (P2) is compiled as canonical Puppet Master intent for AI triage closure confidence and reopen policy: Imported external-repo finding extrepo-20260703-0099 / P2-AI-TRIAGE-CLOSURE-CONFIDENCE (P2). The preserved PM gap/delta is: Semantic closure registry should extend to external issue triage with confidence, actor, evidence quality, and reopen triggers. The observed external-repo signal remains source-lineage evidence: Auto-closed/untriaged issue surfaces can bury real UI/input bugs while recurring warnings create noise.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Closed issue with new repro reopens by key
- Bot closure reason is user-visible
- Previously closed unchanged finding is suppressed with evidence
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Closed issue with new repro reopens by key
- Bot closure reason is user-visible
- Previously closed unchanged finding is suppressed with evidence
risk_class: p2_external_handoff_and_triage_coverage
reasoning_tier: standard
context_scope: external_handoff_and_triage
implementation_surfaces:
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: p2_ai_triage_closure_confidence
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0103
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0103
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0099/P2-AI-TRIAGE-CLOSURE-CONFIDENCE@line=99
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0099/P2-AI-TRIAGE-CLOSURE-CONFIDENCE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_one_more_external_repo_backlog_2026-07-03.jsonl:12
source_atom_ids:
- atom-0103
external_atom_id: extrepo-20260703-0099
source_row_id: P2-AI-TRIAGE-CLOSURE-CONFIDENCE
priority: P2
finding_family: AI triage closure confidence and reopen policy
source_repos:
- Pi
- Ghostty
- Cline
preserved_exact_tokens:
- extrepo-20260703-0099
- P2-AI-TRIAGE-CLOSURE-CONFIDENCE
- P2
- AI triage closure confidence and reopen policy
- Pi
- Ghostty
- Cline
negative_constraints: []
observed_signal: Auto-closed/untriaged issue surfaces can bury real UI/input bugs while recurring warnings create noise.
pm_gap_or_delta: Semantic closure registry should extend to external issue triage with confidence, actor, evidence quality, and reopen triggers.
compile_disposition: create_new_planunit
```

### PLS-018 - external_issue_closure

```yaml
plan_unit_id: PLS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: >-
  external_issue_closure (P1) is compiled as canonical Puppet Master intent for external_issue_closure: Add ExternalIssueClosureRegistry The preserved PM gap/delta is: External issue/PR closure governance not clearly extended The observed external-repo signal remains source-lineage evidence: OpenCode needs:compliance auto-close user frustration
gui_related: false
gui_classification_reason: Backend/orchestration contract; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- No auto-close without evidence/triage schema
- reopen conditions
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- No auto-close without evidence/triage schema
- reopen conditions
risk_class: p1_external_handoff_and_triage_hardening
reasoning_tier: standard
context_scope: external_handoff_and_triage
implementation_surfaces:
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: external_issue_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0116
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0116
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0112/external_issue_closure@line=112
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0112/external_issue_closure
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/opencode_pm_plan_change_matrix.csv:14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:3448-3472
source_atom_ids:
- atom-0116
external_atom_id: extrepo-20260703-0112
source_row_id: external_issue_closure
priority: P1
finding_family: external_issue_closure
target_docs:
- Plans/Planning_Ledger_System.md
- Plans/Prompt_Packet_Update_Process_Defect_Repair equivalent
- audit closure docs
owner_hints:
- Plans/Planning_Ledger_System.md
- Plans/Prompt_Packet_Update_Process_Defect_Repair equivalent
- audit closure docs
preserved_exact_tokens:
- extrepo-20260703-0112
- external_issue_closure
- P1
negative_constraints: []
observed_signal: OpenCode needs:compliance auto-close user frustration
pm_current_coverage: Semantic closure registry exists for audits
pm_gap_or_delta: External issue/PR closure governance not clearly extended
proposal_or_recommendation: Add ExternalIssueClosureRegistry
compile_disposition: create_new_planunit
```
