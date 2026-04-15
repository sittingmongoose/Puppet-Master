# Missing Transfer Report

## Summary
- Total open transfer failures: 85
- stubbed owner section: 11
- stubbed consumer propagation: 38
- over-summarized transfer: 6
- missing structural heading: 23
- stale contradictory survivors: 7

## Stubbed Owner Section

### FIDELITY-001
- exact canon item: Replace tier-rooted execution context with `execution_unit_context` carrying full node/attempt/worktree/package/seam/lane/account/role/runtime identity.
- where partial/stubbed transfer currently appears: Target heading `### 5.1B Persona/Runtime Snapshot Payload Contract` is missing in `Plans/Contracts_V0.md`; current note: The execution-unit packet is embedded inside `### 5.1A InvestigationContextAttachment`, and the owner-section field list omits one required identity field even though the section map requires it as part of the contract shape.
- what is still missing: missing tokens/fields: `operational_identity`; currently absent required exact tokens: `execution_unit_context`, `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `effective_account_id`, `operational_identity`; currently absent required interface fields: `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `effective_account_id`, `operational_identity`, `tool_use_id`; currently absent required labels: `execution unit context`, `runtime snapshot`
- failure: stubbed owner section
- classification: `interface shape missing`
- obligation ids: `OBL-031`, `OBL-033`
- legacy canon anchor: `working_ledger.md:8572-8755, 9805-10136, 17421-17431; current chat context legacy-readiness checks`; `working_ledger.md:9052-9136, 9137-9221, 10137-10335, 10336-10536, 17421-17431; current chat context audit synthesis`
- recovery shape: `insert_after` in `Plans/Contracts_V0.md`

### FIDELITY-003
- exact canon item: Storage must own a first-class runtime-artifact index/projection family with per-artifact row identity.
- where partial/stubbed transfer currently appears: Target heading `### Required redb keys` is missing in `Plans/storage-plan.md`; current note: The key name is listed, but the shaped contract is only given for `artifacts_project_state.v1:{project_id}` and the projector checkpoint.
- what is still missing: missing tokens/fields: `explicit row-shape contract for `artifacts_index.v1:{project_id}:{artifact_id}``; currently absent required exact tokens: `artifacts_index.v1:{project_id}:{artifact_id}`, `artifacts_project_state.v1:{project_id}`, `projector.checkpoint.runtime_artifacts:{project_id}`, `worktree_record.v1:{project_id}:{worktree_id}`, `lane_record.v1:{project_id}:{lane_id}`, `worktree_projection.v1:{project_id}:{worktree_id}`, `lane_projection.v1:{project_id}:{lane_id}`, `orchestrator.project_state.{project_id}`; currently absent required interface fields: `artifact_id`, `artifact_type`, `project_id`, `run_id`, `thread_id`, `node_id`, `attempt_id`, `worktree_id`, `lane_id`, `repo_id`, `path_ref`, `branch_ref`; currently absent required labels: `runtime artifact index`, `worktree record`, `lane record`, `orchestrator project state`
- failure: stubbed owner section
- classification: `persistence coupling missing`
- obligation ids: `OBL-037`, `OBL-038`, `OBL-042`
- legacy canon anchor: `working_ledger.md:9381-9457, 9467-9498`; `working_ledger.md:9459-9575, 4892-5050, 17264-17266`; `working_ledger.md:2517-2629, 2661-2707, 17377-17385`
- recovery shape: `insert_after` in `Plans/storage-plan.md`

### FIDELITY-005
- exact canon item: Receipt records must carry `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `validation_pass_report`, `workflow_run_id`, and `run_id`.
- where partial/stubbed transfer currently appears: Target heading `### Cross-surface receipt record` is missing in `Plans/storage-plan.md`; current note: The owner packet narrows the section down to `provider_attempt_ref` and `workflow_run_id`, so the canonical receipt contract is not preserved in the owning section.
- what is still missing: missing tokens/fields: ``usage_event_ref``, ``workflow_refs``, ``docker_refs``, ``kubernetes_refs``, ``run_id``, `label `receipt record``; currently absent required exact tokens: `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `validation_pass_report`, `workflow_run_id`, `run_id`; currently absent required interface fields: `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `workflow_run_id`, `run_id`; currently absent required labels: `receipt record`, `validation lineage`
- failure: stubbed owner section
- classification: `interface shape missing`
- obligation ids: `OBL-034`, `OBL-036`
- legacy canon anchor: `working_ledger.md:10460-10645, 10537-10645, 11663-11722, 17409-17419; current chat context audit synthesis`; `working_ledger.md:9297-9379, 10963-10966`
- recovery shape: `insert_after` in `Plans/storage-plan.md`

### FIDELITY-007
- exact canon item: `validation_pass_report` must remain an upstream artifact but carry full planning lineage, runtime identity, and downstream bridge data.
- where partial/stubbed transfer currently appears: Target heading `## 10. Validation Pass Report Artifacts` is missing in `Plans/Project_Output_Artifacts.md`; current note: The mapped owner section is not present as a real heading, and the surviving packet is truncated to a small subset of fields.
- what is still missing: missing tokens/fields: ``workflow_run_id``, ``provider``, ``model``, ``wizard_id``, ``project_id``, ``thread_id``, ``phase_plan_ref``, ``requirements_quality_report_ref``, ``execution_role``, ``effective_account_id``, ``run_id``; currently absent required exact tokens: `validation_pass_report`, `workflow_run_id`, `pass_number`, `pass_name`, `pass_verdict`, `verdict_reason`, `provider`, `model`, `wizard_id`, `project_id`, `thread_id`, `phase_plan_ref`; currently absent required interface fields: `workflow_run_id`, `pass_number`, `pass_name`, `pass_verdict`, `verdict_reason`, `provider`, `model`, `wizard_id`, `project_id`, `thread_id`, `phase_plan_ref`, `staged_bundle_ref`; currently absent required labels: `validation pass report`
- failure: stubbed owner section
- classification: `interface shape missing`
- obligation ids: `OBL-036`
- legacy canon anchor: `working_ledger.md:9297-9379, 10963-10966`
- recovery shape: `insert_after` in `Plans/Project_Output_Artifacts.md`

### FIDELITY-010
- exact canon item: `execution_unit_context` must carry the full worktree-aware runtime packet plus blocked-episode anchor in this owner section.
- where partial/stubbed transfer currently appears: Target heading `### Worktree-aware execution unit context` is missing in `Plans/Executor_Protocol.md`; current note: The mapped owner section is absent; surviving content is under `## Execution Context: Worktree Handoff`, and its required-field block omits `worktree_id`.
- what is still missing: missing tokens/fields: `worktree_id`; currently absent required exact tokens: `execution_unit_context`, `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `effective_account_id`, `operational_identity`; currently absent required interface fields: `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `effective_account_id`, `operational_identity`, `blocked_sequence`; currently absent required labels: `execution unit context`, `blocked episode`
- failure: stubbed owner section
- classification: `interface shape missing`
- obligation ids: `OBL-031`, `OBL-032`
- legacy canon anchor: `working_ledger.md:8572-8755, 9805-10136, 17421-17431; current chat context legacy-readiness checks`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Executor_Protocol.md`

### FIDELITY-015
- exact canon item: Tool-originated blocked payloads must carry canonical blocked identity and inspection refs.
- where partial/stubbed transfer currently appears: Target heading `\`tool.denied\` requirements` is missing in `Plans/Tools.md`; current note: The section keeps `blocked_reason_code`, `allowed_action_ids[]`, and `executed_at_all`, but still centers `failure_class` and headless flags while omitting the blocked-episode anchor and inspection refs.
- what is still missing: missing tokens/fields: ``blocked_sequence``, ``approval_scope_key``, ``detail_ref``, ``report_ref``
- failure: stubbed owner section
- classification: `interface shape missing`
- obligation ids: none linked in current section map
- legacy canon anchor: not linked
- recovery shape: `insert_after` in `Plans/Contracts_V0.md + Plans/Permissions_System.md`

### FIDELITY-021
- exact canon item: Permission resolution/carryover must be explicit across package, lane, project, global, and account contexts.
- where partial/stubbed transfer currently appears: Target heading `### 2.4B Scope specificity across package, seam, lane, project, and global contexts` is missing in `Plans/Permissions_System.md`; current note: The specificity order exists inside §2.4, but the mapped owner subsection is missing and its field block leaves lane/package scope under-specified.
- what is still missing: missing tokens/fields: ``lane_id``, ``package_id``, `labels `global``, ``project``, ``package``, ``lane``, ``account``; currently absent required exact tokens: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `permission_scope`, `approval_carryover_scope`; currently absent required interface fields: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `permission_scope`, `approval_carryover_scope`; currently absent required labels: `global`, `project`, `package`, `lane`, `account`
- failure: stubbed owner section
- classification: `interface shape missing`
- obligation ids: `OBL-009`
- legacy canon anchor: `working_ledger.md:1999-2001, 2029, 2036`
- recovery shape: `insert_after` in `Plans/Permissions_System.md`

### FIDELITY-022
- exact canon item: Permission snapshots must preserve blocked-episode identity and scoped approval dimensions together.
- where partial/stubbed transfer currently appears: Target heading `### Permission snapshot contract` is missing in `Plans/Permissions_System.md`; current note: The snapshot schema mentions `approval_scope_key`, but the surviving contract block omits it from the explicit required field set.
- what is still missing: missing tokens/fields: `approval_scope_key`; currently absent required exact tokens: `blocked_sequence`, `approval_scope_key`, `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `allowed_action_ids`; currently absent required interface fields: `blocked_sequence`, `approval_scope_key`, `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `allowed_action_ids`; currently absent required labels: `permission snapshot`
- failure: stubbed owner section
- classification: `interface shape missing`
- obligation ids: `OBL-009`, `OBL-032`
- legacy canon anchor: `working_ledger.md:1999-2001, 2029, 2036`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `insert_after` in `Plans/Permissions_System.md`

### FIDELITY-023
- exact canon item: Stable GitHub account keying must survive as its own owner anchor.
- where partial/stubbed transfer currently appears: Target heading `### Credential store keying (canonical)` is missing in `Plans/GitHub_API_Auth_and_Flows.md`; current note: The fields survive inside `## Token handling and storage (hard rules)` under “Authoritative credential-keying fields,” but the mapped subsection is missing.
- what is still missing: missing tokens/fields: `owner anchor `Credential store keying (canonical)``; currently absent required exact tokens: `account_id`, `credential_ref`, `login`, `display-only`, `auth_realm`; currently absent required interface fields: `account_id`, `credential_ref`, `login`, `auth_realm`; currently absent required labels: `account identity`, `credential locator`
- failure: stubbed owner section
- classification: `cross-reference stale`
- obligation ids: `OBL-035`
- legacy canon anchor: `working_ledger.md:6988-7056, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `insert_after` in `Plans/GitHub_API_Auth_and_Flows.md`

### FIDELITY-024
- exact canon item: Validation lineage must bridge into launch through launch receipt/promoted package ref with the full downstream handoff shape.
- where partial/stubbed transfer currently appears: Target heading `### 2.2 Downstream Handoff Contract` is missing in `Plans/chain-wizard-flexibility.md`; current note: The embedded handoff block omits `phase_plan_ref` from its required fields and does not exist as its own mapped subsection.
- what is still missing: missing tokens/fields: `phase_plan_ref`; currently absent required exact tokens: `validation_pass_report`, `workflow_run_id`, `phase_plan_ref`, `staged_bundle_ref`, `requirements_quality_report_ref`, `execution_role`, `effective_account_id`, `run_id`, `launch receipt`, `promoted package ref`; currently absent required interface fields: `workflow_run_id`, `phase_plan_ref`, `staged_bundle_ref`, `requirements_quality_report_ref`, `execution_role`, `effective_account_id`, `run_id`; currently absent required labels: `handoff contract`
- failure: stubbed owner section
- classification: `interface shape missing`
- obligation ids: `OBL-036`
- legacy canon anchor: `working_ledger.md:9297-9379, 10963-10966`
- recovery shape: `insert_after` in `Plans/chain-wizard-flexibility.md`

### FIDELITY-054
- exact canon item: Wiring rows must preserve command normalization metadata.
- where partial/stubbed transfer currently appears: `Plans/Wiring_Matrix.md#### UI command handler rule` (lines 245-246)
- what is still missing: missing tokens/fields: ``command_kind``, ``normalization``, ``normalizes_to_contract``, ``alias_of_command_id``; currently absent required exact tokens: `command_kind`, `normalization`, `normalizes_to_contract`, `alias_of_command_id`; currently absent required interface fields: `command_kind`, `normalization.kind`, `normalizes_to_contract`, `alias_of_command_id`; currently absent required labels: `command normalization`
- failure: stubbed owner section
- classification: `interface shape missing`
- obligation ids: `OBL-030`
- legacy canon anchor: `working_ledger.md:12782-13050, 12905-13050, 17409-17419`
- recovery shape: `replace_section` in `Plans/UI_Command_Catalog.md`

## Stubbed Consumer Propagation

### FIDELITY-012
- exact canon item: Tool docs must consume the unified runtime/tool attribution packet for `tool.invoked` and `tool.denied`.
- where partial/stubbed transfer currently appears: `Plans/Tools.md#### 8.0 Event payloads (seglog)` (lines 866-919)
- what is still missing: missing tokens/fields: ``node_id``, ``lane_id``, ``package_id``, ``execution_role``, ``effective_account_id``, ``operational_identity``, ``tool_use_id``; currently absent required exact tokens: `tool.denied`, `node_id`, `lane_id`, `package_id`, `execution_role`, `effective_account_id`, `operational_identity`, `tool_use_id`; currently absent required interface fields: `node_id`, `lane_id`, `package_id`, `execution_role`, `effective_account_id`, `operational_identity`, `tool_use_id`; currently absent required labels: `tool event payload`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-033`
- legacy canon anchor: `working_ledger.md:9052-9136, 9137-9221, 10137-10335, 10336-10536, 17421-17431; current chat context audit synthesis`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/Runtime_Artifacts_Panel.md`

### FIDELITY-013
- exact canon item: Ask-flow payloads must preserve blocked-episode identity and scoped approval dimensions.
- where partial/stubbed transfer currently appears: `Plans/Tools.md#### 10.7 Ask-flow runner notes` (lines 1131-1137)
- what is still missing: missing tokens/fields: ``approval_scope_key``, ``blocked_sequence``, ``execution_entity_id``, ``lane_id``, ``package_id``, ``account_id``; currently absent required exact tokens: `approval_scope_key`, `blocked_sequence`, `execution_entity_id`, `lane_id`, `package_id`, `account_id`; currently absent required interface fields: `approval_scope_key`, `blocked_sequence`, `execution_entity_id`, `lane_id`, `package_id`, `account_id`; currently absent required labels: `Deny`, `Once`, `For session`, `Always`; stale residue still present: `{ tool_name, invocation_summary, options: deny | once | for session | always }`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-009`, `OBL-032`
- legacy canon anchor: `working_ledger.md:1999-2001, 2029, 2036`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Permissions_System.md + Plans/Contracts_V0.md`

### FIDELITY-014
- exact canon item: Tool-side web approval summaries must surface the same scope dimensions owned by Permissions System.
- where partial/stubbed transfer currently appears: `Plans/Tools.md#### 10.7A Web-operation approval summary rules` (lines 1138-1151)
- what is still missing: missing tokens/fields: ``execution_entity_id``, ``lane_id``, ``package_id``, ``account_id``, ``permission_scope``, ``approval_carryover_scope``, `labels `Allow``, ``Ask``, ``Deny``; currently absent required exact tokens: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `permission_scope`, `approval_carryover_scope`; currently absent required interface fields: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `permission_scope`, `approval_carryover_scope`; currently absent required labels: `Allow`, `Ask`, `Deny`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-009`
- legacy canon anchor: `working_ledger.md:1999-2001, 2029, 2036`
- recovery shape: `replace_section` in `Plans/Permissions_System.md + Plans/Contracts_V0.md`

### FIDELITY-017
- exact canon item: The panel must consume a storage-owned runtime-artifact projection with row identity, project state, checkpointing, and degrade-to-record behavior.
- where partial/stubbed transfer currently appears: `Plans/Runtime_Artifacts_Panel.md### 4. redb key and projector` (lines 57-93)
- what is still missing: missing tokens/fields: ``artifacts_project_state.v1:{project_id}``, ``projector.checkpoint.runtime_artifacts:{project_id}``; currently absent required exact tokens: `artifacts_index.v1:{project_id}:{artifact_id}`, `artifacts_project_state.v1:{project_id}`, `projector.checkpoint.runtime_artifacts:{project_id}`, `node_id`, `projection_freshness`, `projection_health`; currently absent required interface fields: `run_id`, `thread_id`, `node_id`, `projection_freshness`, `projection_health`; currently absent required labels: `artifact index`, `projector checkpoint`
- failure: stubbed consumer propagation
- classification: `persistence coupling missing`
- obligation ids: `OBL-037`
- legacy canon anchor: `working_ledger.md:9381-9457, 9467-9498`
- recovery shape: `replace_section` in `Plans/storage-plan.md`

### FIDELITY-019
- exact canon item: The shared export taxonomy and trust-state contract must survive here.
- where partial/stubbed transfer currently appears: `Plans/Runtime_Artifacts_Panel.md### 5A. Debug investigation grouping, manifests, and exports` (lines 94-138)
- what is still missing: missing tokens/fields: ``record export``, ``view export``, ``trust_state_at_export``, ``export_id``, ``export_kind``, ``focused_run_id``, ``filter_summary``, ``included_record_ids``, ``included_artifact_ids``, ``included_file_paths``; currently absent required exact tokens: `record export`, `view export`, `trust_state_at_export`; currently absent required interface fields: `export_id`, `export_kind`, `focused_run_id`, `filter_summary`, `included_record_ids`, `included_artifact_ids`, `included_file_paths`, `trust_state_at_export`; currently absent required labels: `record export`, `view export`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-017`
- legacy canon anchor: `working_ledger.md:3512-3635, 5298-5439, 17379-17391`
- recovery shape: `replace_section` in `Plans/Project_Output_Artifacts.md + Plans/storage-plan.md`

### FIDELITY-020
- exact canon item: Receipt linkage must preserve bridge-field precedence and validation lineage.
- where partial/stubbed transfer currently appears: `Plans/Runtime_Artifacts_Panel.md### Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)` (lines 211-220)
- what is still missing: missing tokens/fields: ``provider_attempt_ref``, ``usage_event_ref``, `label `receipt refs``, ``validation_pass_report``, ``workflow_run_id``; currently absent required exact tokens: `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `receipt refs`, `validation_pass_report`, `workflow_run_id`; currently absent required interface fields: `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `workflow_run_id`, `run_id`; currently absent required labels: `receipt linkage`, `validation lineage`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-034`, `OBL-036`
- legacy canon anchor: `working_ledger.md:10460-10645, 10537-10645, 11663-11722, 17409-17419; current chat context audit synthesis`; `working_ledger.md:9297-9379, 10963-10966`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/Project_Output_Artifacts.md`

### FIDELITY-025
- exact canon item: `resume_url` must remain serialized transport only while `route_target` stays canonical identity, and blocked surfaces must preserve ordered action/report/detail refs.
- where partial/stubbed transfer currently appears: `Plans/chain-wizard-flexibility.md#### 3. Dashboard / thread / resume behavior` (lines 2065-2078)
- what is still missing: missing tokens/fields: ``route_target``, ``serialized transport``, ``canonical identity``, ``allowed_action_ids``, ``detail_ref``; currently absent required exact tokens: `route_target`, `serialized transport`, `canonical identity`, `does not define a second routing ontology`, `blocked reason`, `allowed_action_ids`, `detail_ref`; currently absent required interface fields: `route_target`, `blocked_reason_code`, `allowed_action_ids`, `detail_ref`; currently absent required labels: `Blocked`
- failure: stubbed consumer propagation
- classification: `routing edge missing`
- obligation ids: `OBL-027`, `OBL-029`
- legacy canon anchor: `working_ledger.md:12371-12447, 13524-13594, 14913-14965; current chat context legacy-readiness checks`; `working_ledger.md:15027-15144`
- recovery shape: `replace_section` in `Plans/chain-wizard-flexibility.md`

### FIDELITY-028
- exact canon item: Source Control must stay `worktree-first` and expose the minimal lineage field set.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 7.2 Source Control` (lines 698-727)
- what is still missing: missing tokens/fields: ``worktree-first``, ``worktree_id``, ``lane_id``, ``package_id``, ``run_reference``, ``lifecycle_state``; currently absent required exact tokens: `worktree-first`; currently absent required interface fields: `worktree_id`, `lane_id`, `package_id`, `run_reference`, `lifecycle_state`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-001`, `OBL-002`
- legacy canon anchor: `working_ledger.md:1923-1933, 2105-2125, 2179-2194`; `working_ledger.md:1935-1946; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/GitHub_Integration.md + Plans/WorktreeGitImprovement.md`

### FIDELITY-029
- exact canon item: Preserve the full canonical route/open split and payload shape.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 7.3 Shared route and open behavior` (lines 728-750)
- what is still missing: missing tokens/fields: ``target_kind``, ``subject_id``, ``object_kind``, ``object_id``, ``inspector_target``, ``primary_view``, ``side_panel``, ``bottom_panel``, ``embedded_surface``, ``page_tab``, ``doc:<document_id>``, ``artifact:<artifact_id>``; currently absent required exact tokens: `target_kind`, `subject_id`, `object_kind`, `object_id`, `inspector_target`, `primary_view`, `side_panel`, `bottom_panel`, `embedded_surface`, `page_tab`, `doc:<document_id>`, `artifact:<artifact_id>`; currently absent required interface fields: `project_id`, `focused_run_id`, `thread_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `tab_id`, `inspector_target`; currently absent required labels: `Route`, `History`, `Lineage`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-020`, `OBL-021`, `OBL-022`, `OBL-023`, `OBL-024`, `OBL-025`, `OBL-026`, `OBL-027`
- legacy canon anchor: `working_ledger.md:2613-2757, 5576-5733`; `working_ledger.md:11917-12020, 13289-13391`; `working_ledger.md:13392-13461`; `working_ledger.md:12021-12124, 13595-13678`; `working_ledger.md:12125-12208, 13679-13733`; `working_ledger.md:13462-13523`; `working_ledger.md:12021-12124, 13210-13288, 13734-13805`; `working_ledger.md:12371-12447, 13524-13594, 14913-14965; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/FileManager.md`

### FIDELITY-031
- exact canon item: Keep project health/activity/attention separate and preserve the escalation ladder contract.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 7.5 Project and attention surfaces` (lines 1106-1191)
- what is still missing: missing tokens/fields: ``project health``, ``project activity``, ``project attention``, ``blocked_owner``, ``primary_attention_reason``, ``info``, ``warning``, ``attention_required``, ``blocked``, ``system_notification``, ``related_concepts``; currently absent required exact tokens: `project health`, `project activity`, `project attention`, `blocked_owner`, `primary_attention_reason`, `warning`, `attention_required`, `system_notification`, `related_concepts`, `Package Overseer`, `Seam Overseer`, `Corroboration`; currently absent required interface fields: `activity_state`, `attention_state`, `health_indicator`, `blocked_owner`, `primary_attention_reason`, `escalation_level`, `related_concepts`, `blocked_owner_kind`, `alert_level`, `event_family`, `condition_state`, `linger_policy`; currently absent required labels: `Attention Required`, `Blocked`, `System notification`, `Info`, `Warning`, `Attention`, `Action Required`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-011`, `OBL-012`, `OBL-013`, `OBL-041`
- legacy canon anchor: `working_ledger.md:3987-4126, 6468-6571, 17393-17407`; `working_ledger.md:4127-4272, 7080-7174, 17393-17407`; `working_ledger.md:4273-4395, 17393-17407`; `working_ledger.md:193-257, 4295-4417, 17373-17375`
- recovery shape: `replace_section` in `Plans/Orchestrator_Page.md + Plans/Glossary.md`

### FIDELITY-032
- exact canon item: Artifact-panel state must stay separate from per-artifact identity and degrade via projection health/freshness.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md##### Artifacts side-panel owner` (lines 1157-1174)
- what is still missing: missing tokens/fields: ``artifacts_index.v1:{project_id}:{artifact_id}``, ``run_id``, ``attempt_id``, ``projection_freshness``, ``projection_health``; currently absent required exact tokens: `artifacts_index.v1:{project_id}:{artifact_id}`, `artifact_id`, `run_id`, `attempt_id`, `projection_freshness`, `projection_health`; currently absent required interface fields: `artifact_id`, `run_id`, `attempt_id`, `projection_freshness`, `projection_health`
- failure: stubbed consumer propagation
- classification: `persistence coupling missing`
- obligation ids: `OBL-037`
- legacy canon anchor: `working_ledger.md:9381-9457, 9467-9498`
- recovery shape: `replace_section` in `Plans/storage-plan.md + Plans/Runtime_Artifacts_Panel.md`

### FIDELITY-033
- exact canon item: Preserve the shared export taxonomy for audit/log surfaces.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 7.19A Dedicated log and audit inspector` (lines 1283-1315)
- what is still missing: missing tokens/fields: ``record export``, ``bundle export``, ``view export``, ``manifest``, ``trust_state_at_export``; currently absent required exact tokens: `record export`, `bundle export`, `view export`, `manifest`, `trust_state_at_export`; currently absent required interface fields: `export_id`, `export_kind`, `source_surface`, `focused_run_id`, `filter_summary`, `included_record_ids`, `included_artifact_ids`, `included_file_paths`, `lineage_notes`, `trust_state_at_export`; currently absent required labels: `record export`, `bundle export`, `view export`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-017`
- legacy canon anchor: `working_ledger.md:3512-3635, 5298-5439, 17379-17391`
- recovery shape: `replace_section` in `Plans/Project_Output_Artifacts.md + Plans/Runtime_Artifacts_Panel.md`

### FIDELITY-035
- exact canon item: Blocked UI must treat blocked episodes as first-class durable objects.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 10.6 Blocked and recovery surfaces` (lines 1448-1451)
- what is still missing: missing tokens/fields: ``blocked_sequence``, ``blocked_reason_code``, ``allowed_action_ids``, ``detail_ref``, ``report_ref``, ``approval_scope_key``, ``startup_recovered``; currently absent required exact tokens: `blocked_sequence`, `blocked_reason_code`, `allowed_action_ids`, `detail_ref`, `report_ref`, `startup_recovered`; currently absent required interface fields: `blocked_sequence`, `blocked_reason_code`, `allowed_action_ids`, `detail_ref`, `report_ref`, `approval_scope_key`, `startup_recovered`; currently absent required labels: `Waiting approval`, `Action Required`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-029`, `OBL-032`
- legacy canon anchor: `working_ledger.md:15027-15144`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/human-in-the-loop.md`

### FIDELITY-036
- exact canon item: Approval scope must remain multi-lane, package-aware, account-aware, and distinct from blocked-episode approval identity.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 10.8 Human-in-the-loop approvals` (lines 1459-1468)
- what is still missing: missing tokens/fields: ``execution_entity_id``, ``lane_id``, ``package_id``, ``account_id``, ``permission_scope``, ``approval_carryover_scope``, ``blocked_sequence``, ``approval_scope_key``, `labels `Allow``, ``Ask``, ``Waiting approval``; currently absent required exact tokens: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `permission_scope`, `approval_carryover_scope`, `blocked_sequence`, `approval_scope_key`; currently absent required interface fields: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `permission_scope`, `approval_carryover_scope`, `blocked_sequence`, `approval_scope_key`; currently absent required labels: `Allow`, `Ask`, `Deny`, `Waiting approval`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-009`, `OBL-032`
- legacy canon anchor: `working_ledger.md:1999-2001, 2029, 2036`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Permissions_System.md + Plans/human-in-the-loop.md`

### FIDELITY-037
- exact canon item: Preserve the shared escalation ladder and keep `attention_required` distinct from `blocked`.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md### Canonical Blocked/Recovery Behavior` (lines 2699-2741)
- what is still missing: missing tokens/fields: ``info``, ``warning``, ``system_notification``, ``blocked_owner``, ``persistence_duration``, ``action_available``; currently absent required exact tokens: `info`, `system_notification`; currently absent required interface fields: `escalation_level`, `severity`, `blocked_owner`, `persistence_duration`, `action_available`; currently absent required labels: `Info`, `Warning`, `Attention Required`, `System notification`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-013`
- legacy canon anchor: `working_ledger.md:4273-4395, 17393-17407`
- recovery shape: `replace_section` in `Plans/Orchestrator_Page.md + Plans/human-in-the-loop.md`

### FIDELITY-044
- exact canon item: Widgets must consume shared projection-health and route contracts.
- where partial/stubbed transfer currently appears: `Plans/Widget_System.md### 2. Hostability and data contracts` (lines 20-29)
- what is still missing: missing tokens/fields: ``projection_freshness``, ``projection_health``, ``fallback_policy``, ``route_target``, ``project_id``, ``target_kind``, ``subject_id``, ``object_kind``, ``object_id``, ``inspector_target``, `labels `stale``, ``degraded``, ``unavailable``; currently absent required exact tokens: `projection_freshness`, `projection_health`, `fallback_policy`, `route_target`, `project_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `inspector_target`, `widget_id`, `host_surface`; currently absent required interface fields: `projection_freshness`, `projection_health`, `last_projected_at_utc`, `projector_lag`, `degraded_reason_code`, `fallback_policy`, `project_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `tab_id`; currently absent required labels: `stale`, `degraded`, `unavailable`, `Progress`, `Dashboard`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-010`, `OBL-020`, `OBL-039`, `OBL-044`
- legacy canon anchor: `working_ledger.md:2363-2467, 4648-4766, 8408-8479, 17433-17439`; `working_ledger.md:2613-2757, 5576-5733`; `working_ledger.md:75-105, 322-329, 17369-17372`; `working_ledger.md:6490-6590, 17286-17292, 17415-17420`
- recovery shape: `replace_section` in `Plans/storage-plan.md + Plans/Contracts_V0.md`

### FIDELITY-045
- exact canon item: Mirror the field-level ownership packet across executor/contracts/prompt-pipeline boundaries.
- where partial/stubbed transfer currently appears: `Plans/Crosswalk.md#### 3.1 Runtime orchestration ownership` (lines 61-69)
- what is still missing: missing tokens/fields: ``requested_account_id``, ``requested_account_binding``, ``requested_account_policy``, ``effective_account_id``, ``execution_role``, ``operational_identity``, ``command_kind``, ``normalization.kind``, ``blocked_sequence``, ``approval_scope_key``, ``run_id``, ``node_id``, ``attempt_id``, ``lane_id``, ``worktree_id``; currently absent required interface fields: `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `execution_role`, `operational_identity`, `command_kind`, `normalization.kind`, `blocked_sequence`, `approval_scope_key`, `run_id`, `node_id`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-007`, `OBL-030`, `OBL-031`, `OBL-032`
- legacy canon anchor: `working_ledger.md:1984-2001, 2022-2036, 7811-7900, 10137-10226, 17421-17431`; `working_ledger.md:12782-13050, 12905-13050, 17409-17419`; `working_ledger.md:8572-8755, 9805-10136, 17421-17431; current chat context legacy-readiness checks`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Executor_Protocol.md + Plans/Contracts_V0.md + Plans/Prompt_Pipeline.md`

### FIDELITY-046
- exact canon item: Mirror that `route_target` owns routing identity, `OpenSubject` owns open-by-identity, and `resume_url` is transport-only.
- where partial/stubbed transfer currently appears: `Plans/Crosswalk.md#### 3.3 Navigation and source-open ownership` (lines 79-87)
- what is still missing: missing tokens/fields: ``subject_id``, ``resume_url``, `labels `navigation ownership``, ``source-open ownership``; currently absent required exact tokens: `subject_id`, `resume_url`; currently absent required interface fields: `project_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `tab_id`, `inspector_target`, `resume_url`; currently absent required labels: `navigation ownership`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-020`, `OBL-026`, `OBL-027`
- legacy canon anchor: `working_ledger.md:2613-2757, 5576-5733`; `working_ledger.md:12021-12124, 13210-13288, 13734-13805`; `working_ledger.md:12371-12447, 13524-13594, 14913-14965; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/FileManager.md`

### FIDELITY-047
- exact canon item: Mirror separate-but-connected permission scope and blocked-episode approval scope.
- where partial/stubbed transfer currently appears: `Plans/Crosswalk.md#### 3.10 Permission and approval-scope ownership` (lines 173-182)
- what is still missing: missing tokens/fields: ``execution_entity_id``, ``lane_id``, ``package_id``, ``account_id``, ``approval_scope_key``, ``blocked_sequence``; currently absent required exact tokens: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `blocked_sequence`; currently absent required interface fields: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `blocked_sequence`; currently absent required labels: `permission scope`, `approval scope`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-009`, `OBL-032`
- legacy canon anchor: `working_ledger.md:1999-2001, 2029, 2036`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Permissions_System.md + Plans/Contracts_V0.md`

### FIDELITY-048
- exact canon item: Mirror requested/effective account state and stable internal account identity.
- where partial/stubbed transfer currently appears: `Plans/Crosswalk.md#### 3.12 Provider and account-selection ownership` (lines 194-203)
- what is still missing: missing tokens/fields: ``requested_account_id``, ``requested_account_binding``, ``requested_account_policy``, ``effective_account_id``, ``provider_account_id``, ``account_id``, ``credential_ref``, ``login``; currently absent required exact tokens: `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `provider_account_id`, `account_id`, `credential_ref`, `login`; currently absent required interface fields: `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `provider_account_id`, `account_id`, `credential_ref`, `login`; currently absent required labels: `requested account`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-007`, `OBL-008`, `OBL-035`
- legacy canon anchor: `working_ledger.md:1984-2001, 2022-2036, 7811-7900, 10137-10226, 17421-17431`; `working_ledger.md:1991, 2023-2026`; `working_ledger.md:6988-7056, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Multi-Account.md + Plans/Contracts_V0.md + Plans/GitHub_API_Auth_and_Flows.md`

### FIDELITY-049
- exact canon item: Chat must consume shared route identity plus the owner-doc requested/effective runtime identity field set.
- where partial/stubbed transfer currently appears: `Plans/assistant-chat-design.md#### Canonical navigation model` (lines 899-916)
- what is still missing: missing tokens/fields: ``requested_account_id``, ``requested_account_binding``, ``requested_account_policy``, ``effective_account_id``, ``execution_role``, ``operational_identity``; currently absent required interface fields: `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `execution_role`, `operational_identity`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-027`, `OBL-007`
- legacy canon anchor: `working_ledger.md:12371-12447, 13524-13594, 14913-14965; current chat context legacy-readiness checks`; `working_ledger.md:1984-2001, 2022-2036, 7811-7900, 10137-10226, 17421-17431`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/FileManager.md`

### FIDELITY-050
- exact canon item: Chat activity surfaces must stay lossless enough to bridge runtime identity to usage/artifact views.
- where partial/stubbed transfer currently appears: `Plans/assistant-chat-design.md#### 13.4 Shared runtime identity display` (lines 1250-1288)
- what is still missing: missing tokens/fields: ``node_id``, ``attempt_id``, ``lane_id``, ``package_id``, ``execution_role``, ``effective_account_id``, ``operational_identity``, ``tool_use_id``; currently absent required exact tokens: `node_id`, `attempt_id`, `lane_id`, `package_id`, `execution_role`, `effective_account_id`, `operational_identity`; currently absent required interface fields: `node_id`, `attempt_id`, `lane_id`, `package_id`, `execution_role`, `effective_account_id`, `operational_identity`, `tool_use_id`; currently absent required labels: `effective account`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-033`
- legacy canon anchor: `working_ledger.md:9052-9136, 9137-9221, 10137-10335, 10336-10536, 17421-17431; current chat context audit synthesis`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/Executor_Protocol.md`

### FIDELITY-051
- exact canon item: Handoff must preserve report lineage plus runtime identity.
- where partial/stubbed transfer currently appears: `Plans/assistant-chat-design.md#### 29.4 Accepting the recommendation: handoff to Chain Wizard / Interview` (lines 2165-2192)
- what is still missing: missing tokens/fields: ``requirements_quality_report_ref``, ``execution_role``, ``effective_account_id``, ``operational_identity``; currently absent required exact tokens: `requirements_quality_report_ref`, `execution_role`, `effective_account_id`, `operational_identity`; currently absent required interface fields: `requirements_quality_report_ref`, `execution_role`, `effective_account_id`, `operational_identity`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-033`
- legacy canon anchor: `working_ledger.md:9052-9136, 9137-9221, 10137-10335, 10336-10536, 17421-17431; current chat context audit synthesis`
- recovery shape: `replace_section` in `Plans/Project_Output_Artifacts.md + Plans/chain-wizard-flexibility.md`

### FIDELITY-052
- exact canon item: Thread blocked-state lifecycle must mirror durable blocked-episode identity and ordered action derivation.
- where partial/stubbed transfer currently appears: `Plans/assistant-chat-design.md### Unified Thread Blocked-State Lifecycle` (lines 2213-2243)
- what is still missing: missing tokens/fields: ``blocked_sequence``, ``blocked_reason_code``, ``detail_ref``, ``report_ref``, ``approval_scope_key``, ``startup_recovered``, `labels `Waiting approval``, ``Action Required``; currently absent required exact tokens: `blocked_sequence`, `blocked_reason_code`, `detail_ref`, `report_ref`, `approval_scope_key`, `startup_recovered`; currently absent required interface fields: `blocked_sequence`, `blocked_reason_code`, `detail_ref`, `report_ref`, `approval_scope_key`, `startup_recovered`; currently absent required labels: `Waiting approval`, `Action Required`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-029`, `OBL-032`
- legacy canon anchor: `working_ledger.md:15027-15144`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/human-in-the-loop.md + Plans/Permissions_System.md`

### FIDELITY-053
- exact canon item: Blocked notices must persist enough identity to restore the same blocked surface and action set after restart/resume.
- where partial/stubbed transfer currently appears: `Plans/assistant-chat-design.md#### Persistence and restore rule` (lines 2239-2243)
- what is still missing: missing tokens/fields: ``blocked_sequence``, ``approval_scope_key``, ``allowed_action_ids[]``, ``blocked_reason_code``, ``detail_ref``, ``report_ref``; currently absent required exact tokens: `blocked_sequence`, `approval_scope_key`, `allowed_action_ids[]`, `blocked_reason_code`, `detail_ref`, `report_ref`; currently absent required interface fields: `blocked_sequence`, `approval_scope_key`, `allowed_action_ids`, `blocked_reason_code`, `detail_ref`, `report_ref`; currently absent required labels: `persistence`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-029`, `OBL-032`
- legacy canon anchor: `working_ledger.md:15027-15144`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/human-in-the-loop.md + Plans/Permissions_System.md`

### FIDELITY-055
- exact canon item: The gate must validate normalization metadata as part of the command-envelope contract.
- where partial/stubbed transfer currently appears: `Plans/Progression_Gates.md### GATE-010 -- Wiring matrix validation` (lines 193-214)
- what is still missing: missing tokens/fields: ``command_kind``, ``normalizes_to_contract``, ``alias_of_command_id``; currently absent required exact tokens: `command_kind`, `normalizes_to_contract`, `alias_of_command_id`; currently absent required interface fields: `command_kind`, `normalization.kind`, `normalizes_to_contract`, `alias_of_command_id`; currently absent required labels: `wiring validation`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-030`
- legacy canon anchor: `working_ledger.md:12782-13050, 12905-13050, 17409-17419`
- recovery shape: `replace_section` in `Plans/UI_Command_Catalog.md + Plans/Wiring_Matrix.md`

### FIDELITY-067
- exact canon item: Consumer carry-through for cleanup posture across surfaces.
- where partial/stubbed transfer currently appears: `Plans/WorktreeGitImprovement.md### 4. GUI for Git & Worktrees` (lines 288-368)
- what is still missing: missing tokens/fields: `cleanup_scope`; currently absent required interface fields: `cleanup_scope`; currently absent required labels: `Lane`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-001`, `OBL-002`, `OBL-006`, `OBL-038`
- legacy canon anchor: `working_ledger.md:1923-1933, 2105-2125, 2179-2194`; `working_ledger.md:1935-1946; current chat context legacy-readiness checks`; `working_ledger.md:1911-1914, 2172`; `working_ledger.md:9459-9575, 4892-5050, 17264-17266`
- recovery shape: `replace_section` in `Plans/WorktreeGitImprovement.md`

### FIDELITY-071
- exact canon item: Run Graph layout must explicitly consume the Orchestrator-wide scale contract rather than relying on tab-local performance intuition.
- where partial/stubbed transfer currently appears: `Plans/Run_Graph_View.md### 2. Layout` (lines 13-25)
- what is still missing: missing tokens/fields: ``lazy expansion``, ``paging``, ``demand-loaded inspectors``, ``initial_slice_size``, ``virtualization_strategy``, ``lazy_expansion_trigger``, ``inspector_loading_strategy``, ``projection_fallback``; currently absent required exact tokens: `lazy expansion`, `paging`, `demand-loaded inspectors`; currently absent required interface fields: `initial_slice_size`, `virtualization_strategy`, `lazy_expansion_trigger`, `inspector_loading_strategy`, `projection_fallback`; currently absent required labels: `layout`, `performance`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-014`
- legacy canon anchor: `working_ledger.md:4396-4514`
- recovery shape: `replace_section` in `Plans/Orchestrator_Page.md`

### FIDELITY-072
- exact canon item: Inspector bridge-field/routing/escalation packet, including validation reports as artifacts and shared ladder carry-through.
- where partial/stubbed transfer currently appears: `Plans/Run_Graph_View.md### 3. Node detail inspector` (lines 26-46)
- what is still missing: missing tokens/fields: ``provider_attempt_ref``, ``usage_event_ref``, ``validation_pass_report``, ``workflow_run_id``, ``info``, ``warning``, ``attention_required``, ``blocked``, ``system_notification``, ``route_target``; currently absent required exact tokens: `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `validation_pass_report`, `workflow_run_id`, `info`, `warning`, `attention_required`, `system_notification`, `route_target`, `Feature Seam`, `Work Package`; currently absent required interface fields: `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_run_id`, `run_id`, `inspector_target`, `project_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `object_label`; currently absent required labels: `details`, `Attention Required`, `Blocked`, `Feature Seam`, `Weak Integration`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-013`, `OBL-020`, `OBL-034`, `OBL-036`, `OBL-040`, `OBL-044`
- legacy canon anchor: `working_ledger.md:4273-4395, 17393-17407`; `working_ledger.md:2613-2757, 5576-5733`; `working_ledger.md:10460-10645, 10537-10645, 11663-11722, 17409-17419; current chat context audit synthesis`; `working_ledger.md:9297-9379, 10963-10966`; `working_ledger.md:145-206, 6501-6584, 17373-17375`; `working_ledger.md:6490-6590, 17286-17292, 17415-17420`
- recovery shape: `replace_section` in `Plans/Runtime_Artifacts_Panel.md + Plans/Project_Output_Artifacts.md + Plans/Contracts_V0.md`

### FIDELITY-073
- exact canon item: Lane/worktree identity plus post-cleanup historical routing identity packet.
- where partial/stubbed transfer currently appears: `Plans/Run_Graph_View.md### 4. Data model and identity` (lines 47-64)
- what is still missing: missing tokens/fields: ``object_kind``, ``inspector_target``, ``historical``, ``stale_historical``, ``archived``, ``removed``, ``historical_state``, ``lineage_refs``, ``package_id``; currently absent required exact tokens: `historical`, `stale_historical`, `archived`, `removed`, `object_kind`, `inspector_target`, `Historical Run Mode`, `focused_run_id?`, `focus_mode = live | historical`; currently absent required interface fields: `object_kind`, `inspector_target`, `historical_state`, `lineage_refs`, `focused_run_id`, `focus_mode`; currently absent required labels: `historical`, `lineage`, `Historical Run Mode`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-002`, `OBL-003`, `OBL-018`, `OBL-023`, `OBL-024`, `OBL-038`, `OBL-042`
- legacy canon anchor: `working_ledger.md:1935-1946; current chat context legacy-readiness checks`; `working_ledger.md:2127-2141`; `working_ledger.md:2758-2885, 5734-5885`; `working_ledger.md:12021-12124, 13595-13678`; `working_ledger.md:12125-12208, 13679-13733`; `working_ledger.md:9459-9575, 4892-5050, 17264-17266`; `working_ledger.md:2517-2629, 2661-2707, 17377-17385`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/storage-plan.md`

### FIDELITY-074
- exact canon item: Blocked-episode-aligned HITL request contract with ordered visible actions.
- where partial/stubbed transfer currently appears: `Plans/human-in-the-loop.md#### Canonical HITL request contract` (lines 22-51)
- what is still missing: missing tokens/fields: ``report_ref``, ``startup_recovered``, `labels `Blocked``, ``Waiting approval``, ``Action Required``; currently absent required exact tokens: `report_ref`, `startup_recovered`; currently absent required interface fields: `report_ref`, `startup_recovered`; currently absent required labels: `Blocked`, `Waiting approval`, `Action Required`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-029`, `OBL-032`
- legacy canon anchor: `working_ledger.md:15027-15144`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/human-in-the-loop.md`

### FIDELITY-075
- exact canon item: Shared ladder rendering must preserve `attention_required` vs `blocked` across approval flows, and persistent blocked episodes must not downgrade into generic attention.
- where partial/stubbed transfer currently appears: `Plans/human-in-the-loop.md### Shared approval-ladder alignment (2026-04-04)` (lines 333-343)
- what is still missing: missing tokens/fields: ``info``, ``warning``, ``attention_required``, ``blocked``, ``system_notification``, ``blocked_sequence``, ``escalation_level``, ``action_available``; currently absent required exact tokens: `info`, `warning`, `attention_required`, `blocked`, `system_notification`, `blocked_sequence`; currently absent required interface fields: `escalation_level`, `blocked_sequence`, `action_available`; currently absent required labels: `Info`, `Warning`, `Attention Required`, `Blocked`, `System notification`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-013`, `OBL-032`
- legacy canon anchor: `working_ledger.md:4273-4395, 17393-17407`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/human-in-the-loop.md`

### FIDELITY-077
- exact canon item: Node execution must use the same requested/effective runtime identity model and execution-unit scope as the rest of the system.
- where partial/stubbed transfer currently appears: `Plans/orchestrator-subagent-integration.md### Tier-Level Subagent Strategy` (lines 82-94)
- what is still missing: missing tokens/fields: ``execution_unit_context``, ``requested_account_id``, ``requested_account_binding``, ``requested_account_policy``, ``effective_account_id``, ``operational_identity``; currently absent required exact tokens: `execution_unit_context`, `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `requested_account_binding`, `requested_account_policy`; currently absent required interface fields: `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`; currently absent required labels: `execution unit context`, `runtime identity`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-007`, `OBL-031`
- legacy canon anchor: `working_ledger.md:1984-2001, 2022-2036, 7811-7900, 10137-10226, 17421-17431`; `working_ledger.md:8572-8755, 9805-10136, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Executor_Protocol.md + Plans/Contracts_V0.md + Plans/Multi-Account.md`

### FIDELITY-081
- exact canon item: Define the three-part help contract: canonical term system, contextual help system, and dedicated help-entry contract with related-concept links.
- where partial/stubbed transfer currently appears: `Plans/usage-feature.md### Rewrite alignment (2026-02-21)` (lines 14-19)
- what is still missing: missing tokens/fields: ``canonical term system``, ``contextual help system``, ``dedicated help-entry contract``, ``related_concepts``, ``why it matters``, ``what it is not``; currently absent required exact tokens: `canonical term system`, `contextual help system`, `dedicated help-entry contract`, `related_concepts`; currently absent required interface fields: `canonical_name`, `short_definition`, `why_it_matters`, `what_it_is_not`, `common_related_states`, `related_concepts`, `surface_examples`; currently absent required labels: `why it matters`, `what it is not`, `related concepts`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-011`
- legacy canon anchor: `working_ledger.md:3987-4126, 6468-6571, 17393-17407`
- recovery shape: `replace_section` in `Plans/Glossary.md`

### FIDELITY-082
- exact canon item: Usage views must consume unified runtime attribution and the shared export taxonomy rather than coarse session/provider inference.
- where partial/stubbed transfer currently appears: `Plans/usage-feature.md#### Canonical usage pipeline` (lines 294-314)
- what is still missing: missing tokens/fields: ``node_id``, ``attempt_id``, ``lane_id``, ``package_id``, ``execution_role``, ``effective_account_id``, ``operational_identity``, ``record export``, ``bundle export``, ``view export``; currently absent required exact tokens: `node_id`, `attempt_id`, `lane_id`, `package_id`, `execution_role`, `effective_account_id`, `operational_identity`, `record export`, `bundle export`, `view export`, `account_pressure_episode`, `account_switch_event`; currently absent required interface fields: `node_id`, `attempt_id`, `lane_id`, `package_id`, `execution_role`, `effective_account_id`, `operational_identity`, `export_kind`, `trust_state_at_export`, `episode_id`, `switch_event_id`, `decision_kind`; currently absent required labels: `Show in Ledger`, `Show in Usage`, `Account / Usage Pressure`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-017`, `OBL-033`, `OBL-043`
- legacy canon anchor: `working_ledger.md:3512-3635, 5298-5439, 17379-17391`; `working_ledger.md:9052-9136, 9137-9221, 10137-10335, 10336-10536, 17421-17431; current chat context audit synthesis`; `working_ledger.md:8143-8238, 17256-17264, 17446-17449`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/storage-plan.md + Plans/Project_Output_Artifacts.md`

### FIDELITY-083
- exact canon item: Preserve the shared escalation ladder — `info`, `warning`, `attention_required`, `blocked`, `system_notification` — across usage/recovery observability.
- where partial/stubbed transfer currently appears: `Plans/usage-feature.md### Runtime Scheduler / Recovery Observability Addendum (2026-03-09)` (lines 690-709)
- what is still missing: missing tokens/fields: ``info``, ``attention_required``, ``system_notification``, ``escalation_level``, ``severity``, ``blocked_owner``, ``persistence_duration``, ``action_available``; currently absent required exact tokens: `info`, `warning`, `attention_required`, `system_notification`; currently absent required interface fields: `escalation_level`, `severity`, `blocked_owner`, `persistence_duration`, `action_available`; currently absent required labels: `Info`, `Warning`, `Attention Required`, `Blocked`, `System notification`
- failure: stubbed consumer propagation
- classification: `consumer propagation missing`
- obligation ids: `OBL-013`
- legacy canon anchor: `working_ledger.md:4273-4395, 17393-17407`
- recovery shape: `replace_section` in `Plans/Orchestrator_Page.md + Plans/human-in-the-loop.md`

### FIDELITY-084
- exact canon item: Usage/billing attribution must flow through stable internal account identity and requested/effective runtime identity, with login remaining display-only metadata.
- where partial/stubbed transfer currently appears: `Plans/usage-feature.md#### Billing identity, attribution, and pricing metadata` (lines 346-353)
- what is still missing: missing tokens/fields: ``requested_account_id``, ``requested_account_binding``, ``effective_account_id``, ``credential_ref``, ``login``, ``execution_role``, ``operational_identity``; currently absent required exact tokens: `requested_account_id`, `requested_account_binding`, `effective_account_id`, `credential_ref`, `login`, `execution_role`, `operational_identity`, `account_pressure_episode`, `account_switch_event`, `source_kind`, `signal_confidence`, `decision_kind`; currently absent required interface fields: `requested_account_id`, `requested_account_binding`, `effective_account_id`, `credential_ref`, `login`, `execution_role`, `operational_identity`, `source_kind`, `signal_confidence`, `decision_kind`, `started_at_utc`, `updated_at_utc`; currently absent required labels: `requested account`, `effective account`, `billing identity`, `account pressure episode`, `account switch event`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-007`, `OBL-033`, `OBL-035`, `OBL-043`
- legacy canon anchor: `working_ledger.md:1984-2001, 2022-2036, 7811-7900, 10137-10226, 17421-17431`; `working_ledger.md:9052-9136, 9137-9221, 10137-10335, 10336-10536, 17421-17431; current chat context audit synthesis`; `working_ledger.md:6988-7056, 17421-17431; current chat context legacy-readiness checks`; `working_ledger.md:8143-8238, 17256-17264, 17446-17449`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/Multi-Account.md`

### FIDELITY-085
- exact canon item: Usage artifact drill-through must make bridge-field precedence explicit and degrade via projection-health semantics rather than implying artifact loss.
- where partial/stubbed transfer currently appears: `Plans/usage-feature.md#### Cost_usage runtime artifact and Show in Ledger / Show in Usage` (lines 234-249)
- what is still missing: missing tokens/fields: ``attempt_id``, ``usage_event_ref``, ``provider_attempt_ref``, ``artifact_id``, ``artifact_type``, ``projection_freshness``, ``projection_health``; currently absent required exact tokens: `attempt_id`, `usage_event_ref`, `provider_attempt_ref`, `artifact_id`, `artifact_type`, `projection_freshness`, `projection_health`; currently absent required interface fields: `attempt_id`, `usage_event_ref`, `provider_attempt_ref`, `artifact_id`, `artifact_type`, `projection_freshness`, `projection_health`
- failure: stubbed consumer propagation
- classification: `interface shape missing`
- obligation ids: `OBL-034`, `OBL-037`
- legacy canon anchor: `working_ledger.md:10460-10645, 10537-10645, 11663-11722, 17409-17419; current chat context audit synthesis`; `working_ledger.md:9381-9457, 9467-9498`
- recovery shape: `replace_section` in `Plans/Runtime_Artifacts_Panel.md + Plans/storage-plan.md + Plans/Contracts_V0.md`

## Over-Summarized Transfer

### FIDELITY-004
- exact canon item: Lifecycle vocabulary must include `historical` with explicit distinction between cleanup state and historical truth.
- where partial/stubbed transfer currently appears: Target heading `### Restart and stale history` is missing in `Plans/storage-plan.md`; current note: The section lists `archived`, `removed`, `baseline`, `active`, `suspect`, `restoring`, `retained`, and `cleanup_eligible`, but does not preserve `historical` as a first-class vocabulary item.
- what is still missing: missing tokens/fields: `explicit `historical` lifecycle entry in the owner packet`; currently absent required exact tokens: `historical`, `archived`, `removed`, `baseline`, `active`, `suspect`, `restoring`, `retained`, `cleanup_eligible`, `worktree_id`, `lane_id`, `historical_lineage_refs[]`; currently absent required interface fields: `worktree_id`, `lane_id`, `lifecycle_state`, `historical_flag`, `archived_flag`, `removed_flag`, `cleanup_eligible_flag`, `historical_lineage_refs[]`; currently absent required labels: `historical`, `archived`, `removed`, `cleanup eligible`
- failure: over-summarized transfer
- classification: `over-summarized section`
- obligation ids: `OBL-003`, `OBL-004`, `OBL-038`
- legacy canon anchor: `working_ledger.md:2127-2141`; `working_ledger.md:1948-1965`; `working_ledger.md:9459-9575, 4892-5050, 17264-17266`
- recovery shape: `insert_after` in `Plans/storage-plan.md`

### FIDELITY-026
- exact canon item: Palette-visible actions must preserve the action-surface policy and canonical route payload.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 4.2 Command Palette` (lines 282-304)
- what is still missing: missing tokens/fields: ``navigation vs mutation``, ``shortcut eligibility``, ``palette visibility``, ``confirmation``, ``reversibility``, ``route_target``, `labels `Open``, ``Review``, ``Resolve``; currently absent required exact tokens: `navigation vs mutation`, `shortcut eligibility`, `palette visibility`, `confirmation`, `reversibility`, `route_target`; currently absent required interface fields: `action_type`, `target_scope`, `palette_visible`, `shortcut_eligible`, `confirmation_strength`, `reversibility`, `project_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `tab_id`; currently absent required labels: `Open`, `Review`, `Resolve`
- failure: over-summarized transfer
- classification: `over-summarized section`
- obligation ids: `OBL-015`, `OBL-020`
- legacy canon anchor: `working_ledger.md:3162-3328, 4515-4647, 6376-6467, 17365-17377`; `working_ledger.md:2613-2757, 5576-5733`
- recovery shape: `replace_section` in `Plans/UI_Command_Catalog.md`

### FIDELITY-027
- exact canon item: Shortcut policy must stay narrower than general command visibility for dangerous mutations.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 4.4 Keyboard Shortcuts` (lines 309-363)
- what is still missing: missing tokens/fields: ``shortcut eligibility``, ``confirmation``, ``reversibility``; currently absent required exact tokens: `shortcut eligibility`, `confirmation`, `reversibility`; currently absent required interface fields: `shortcut_eligible`, `confirmation_strength`, `reversibility`, `target_scope`; currently absent required labels: `Keyboard shortcuts`
- failure: over-summarized transfer
- classification: `over-summarized section`
- obligation ids: `OBL-015`
- legacy canon anchor: `working_ledger.md:3162-3328, 4515-4647, 6376-6467, 17365-17377`
- recovery shape: `replace_section` in `Plans/UI_Command_Catalog.md`

### FIDELITY-034
- exact canon item: Confirmations must classify action safety using shared command policy.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 10.1 Confirmation dialogs` (lines 1424-1427)
- what is still missing: missing tokens/fields: ``reversibility``, ``single-target vs multi-target``, ``navigation vs mutation``; currently absent required exact tokens: `reversibility`, `single-target vs multi-target`, `navigation vs mutation`; currently absent required interface fields: `confirmation_strength`, `reversibility`, `action_type`, `target_scope`
- failure: over-summarized transfer
- classification: `over-summarized section`
- obligation ids: `OBL-015`
- legacy canon anchor: `working_ledger.md:3162-3328, 4515-4647, 6376-6467, 17365-17377`
- recovery shape: `replace_section` in `Plans/UI_Command_Catalog.md`

### FIDELITY-079
- exact canon item: Interview/runtime surfaces must preserve requested/effective identity plus runtime attribution through interview execution and review flows.
- where partial/stubbed transfer currently appears: `Plans/interview-subagent-integration.md#### Requested/effective Interview contract` (lines 1910-1916)
- what is still missing: missing tokens/fields: ``requested_account_id``, ``requested_account_binding``, ``requested_account_policy``, ``effective_account_id``, ``execution_role``, ``operational_identity``, ``node_id``, ``attempt_id``, ``lane_id``, ``package_id``; currently absent required exact tokens: `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `execution_role`, `operational_identity`, `node_id`, `attempt_id`, `lane_id`, `package_id`; currently absent required interface fields: `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `execution_role`, `operational_identity`, `node_id`, `attempt_id`, `lane_id`, `package_id`; currently absent required labels: `requested account`, `effective account`, `runtime identity`
- failure: over-summarized transfer
- classification: `over-summarized section`
- obligation ids: `OBL-007`, `OBL-033`
- legacy canon anchor: `working_ledger.md:1984-2001, 2022-2036, 7811-7900, 10137-10226, 17421-17431`; `working_ledger.md:9052-9136, 9137-9221, 10137-10335, 10336-10536, 17421-17431; current chat context audit synthesis`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md + Plans/Executor_Protocol.md`

### FIDELITY-080
- exact canon item: `validation_pass_report` must carry lineage-rich validation and execution-seeding fields, not just point to another doc.
- where partial/stubbed transfer currently appears: `Plans/interview-subagent-integration.md#### Execution-Critical Validation References` (lines 2055-2058)
- what is still missing: missing tokens/fields: ``validation_pass_report``, ``workflow_run_id``, ``pass_verdict``, ``phase_plan_ref``, ``requirements_quality_report_ref``, ``run_id``; currently absent required exact tokens: `validation_pass_report`, `workflow_run_id`, `pass_verdict`, `phase_plan_ref`, `requirements_quality_report_ref`, `run_id`; currently absent required interface fields: `workflow_run_id`, `pass_verdict`, `phase_plan_ref`, `requirements_quality_report_ref`, `run_id`; currently absent required labels: `validation pass report`
- failure: over-summarized transfer
- classification: `over-summarized section`
- obligation ids: `OBL-036`
- legacy canon anchor: `working_ledger.md:9297-9379, 10963-10966`
- recovery shape: `replace_section` in `Plans/Project_Output_Artifacts.md + Plans/chain-wizard-flexibility.md`

## Missing Structural Heading

### FIDELITY-008
- exact canon item: Define dedicated rewrite-term entries using the help-entry contract for project health/activity/attention and shared historical vocabulary.
- where partial/stubbed transfer currently appears: Target heading `### Orchestrator rewrite terms` is missing in `Plans/Glossary.md`; current note: The doc has generic scaffolding in `## 2. Core terms`, but no dedicated `Orchestrator rewrite terms` section and no structured rewrite-term entries.
- what is still missing: currently absent required exact tokens: `canonical term system`, `contextual help system`, `dedicated help-entry contract`, `related_concepts`, `project health`, `project activity`, `project attention`, `historical`, `stale_historical`, `superseded`, `revoked`, `reopened`; currently absent required interface fields: `canonical_name`, `short_definition`, `why_it_matters`, `what_it_is_not`, `common_related_states`, `related_concepts`, `surface_examples`, `term_id`, `help_depth`, `context_help_target`, `canonical_help_entry_ref`, `object_label`; currently absent required labels: `why it matters`, `what it is not`, `related concepts`, `Feature Seam`, `Work Package`, `Weak Integration`, `Attention`, `Action Required`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-011`, `OBL-012`, `OBL-018`, `OBL-040`, `OBL-041`, `OBL-044`
- legacy canon anchor: `working_ledger.md:3987-4126, 6468-6571, 17393-17407`; `working_ledger.md:4127-4272, 7080-7174, 17393-17407`; `working_ledger.md:2758-2885, 5734-5885`; `working_ledger.md:145-206, 6501-6584, 17373-17375`; `working_ledger.md:193-257, 4295-4417, 17373-17375`; `working_ledger.md:6490-6590, 17286-17292, 17415-17420`
- recovery shape: `insert_after` in `Plans/Glossary.md`

### FIDELITY-009
- exact canon item: Routing/open glossary terms must mirror canonical contracts for `route_target`, `target_kind`, `object_kind`, `inspector_target`, `subject_id`, and `resume_url`.
- where partial/stubbed transfer currently appears: Target heading `### Runtime and routing terms` is missing in `Plans/Glossary.md`; current note: The doc only provides terse bullets for these concepts, not a dedicated runtime/routing terms section with structured help-entry records.
- what is still missing: currently absent required exact tokens: `route_target`, `target_kind`, `object_kind`, `inspector_target`, `subject_id`, `doc:<document_id>`, `artifact:<artifact_id>`, `resume_url`; currently absent required interface fields: `canonical_name`, `short_definition`, `why_it_matters`, `what_it_is_not`, `related_concepts`, `surface_examples`; currently absent required labels: `why it matters`, `what it is not`, `related concepts`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-011`, `OBL-020`, `OBL-022`, `OBL-023`, `OBL-024`, `OBL-026`, `OBL-027`
- legacy canon anchor: `working_ledger.md:3987-4126, 6468-6571, 17393-17407`; `working_ledger.md:2613-2757, 5576-5733`; `working_ledger.md:13392-13461`; `working_ledger.md:12021-12124, 13595-13678`; `working_ledger.md:12125-12208, 13679-13733`; `working_ledger.md:12021-12124, 13210-13288, 13734-13805`; `working_ledger.md:12371-12447, 13524-13594, 14913-14965; current chat context legacy-readiness checks`
- recovery shape: `insert_after` in `Plans/Glossary.md`

### FIDELITY-030
- exact canon item: Settings/help surfaces must reuse the canonical help-entry contract.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md##### 7.4.4 Settings (Unified) panel specification` (lines 829-916)
- what is still missing: missing tokens/fields: ``canonical term system``, ``contextual help system``, ``dedicated help-entry contract``, ``related_concepts``, `labels `why it matters``, ``what it is not``, ``related concepts``; currently absent required exact tokens: `canonical term system`, `contextual help system`, `dedicated help-entry contract`, `related_concepts`, `inline help`, `context help`, `canonical help entry`, `source`, `execution`, `Inherited from`, `Overridden by`, `Requested`; currently absent required interface fields: `canonical_name`, `short_definition`, `why_it_matters`, `what_it_is_not`, `common_related_states`, `related_concepts`, `surface_examples`, `help_depth`, `term_id`, `inline_help_text`, `context_help_target`, `canonical_help_entry_ref`; currently absent required labels: `why it matters`, `what it is not`, `related concepts`, `Requested`
- failure: missing structural heading
- classification: `wrong section allocation`
- obligation ids: `OBL-011`, `OBL-044`, `OBL-045`
- legacy canon anchor: `working_ledger.md:3987-4126, 6468-6571, 17393-17407`; `working_ledger.md:6490-6590, 17286-17292, 17415-17420`; `working_ledger.md:3658-3745, 3831-3925, 17401-17414`
- recovery shape: `replace_section` in `Plans/Glossary.md`

### FIDELITY-038
- exact canon item: Render blocked-episode identity, ordered actions, and scoped approval dimensions together.
- where partial/stubbed transfer currently appears: `Plans/FinalGUISpec.md#### 15.7 Permission approval card widget` (lines 3042-3077)
- what is still missing: missing tokens/fields: ``execution_entity_id``, ``lane_id``, ``package_id``, ``account_id``, ``approval_scope_key``, ``allowed_action_ids``, ``blocked_sequence``, `label `Ask``; currently absent required exact tokens: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `approval_scope_key`, `blocked_sequence`; currently absent required interface fields: `execution_entity_id`, `lane_id`, `package_id`, `account_id`, `approval_scope_key`, `blocked_sequence`; currently absent required labels: `Allow`, `Deny`, `Blocked`, `Attention Required`
- failure: missing structural heading
- classification: `wrong section allocation`
- obligation ids: `OBL-009`, `OBL-032`
- legacy canon anchor: `working_ledger.md:1999-2001, 2029, 2036`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Permissions_System.md + Plans/human-in-the-loop.md`

### FIDELITY-039
- exact canon item: `OpenSubject` must survive as the owner anchor for source-open identity.
- where partial/stubbed transfer currently appears: Target heading `### OpenSubject` is missing in `Plans/FileManager.md`; current note: The contract exists only inline inside `#4.1`; the mapped cross-reference target `Plans/FileManager.md#OpenSubject` has no live section anchor.
- what is still missing: missing tokens/fields: `live owner anchor `### OpenSubject``; currently absent required exact tokens: `OpenSubject`, `subject_id`, `doc:<document_id>`, `artifact:<artifact_id>`; currently absent required interface fields: `subject_id`; currently absent required labels: `Open Subject`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-026`
- legacy canon anchor: `working_ledger.md:12021-12124, 13210-13288, 13734-13805`
- recovery shape: `insert_after` in `Plans/FileManager.md`

### FIDELITY-040
- exact canon item: Preserve the command-envelope normalization contract as a live owner section.
- where partial/stubbed transfer currently appears: Target heading `### 2.0 Command entry contract (doc-level)` is missing in `Plans/UI_Command_Catalog.md`; current note: The packet appears as unheaded preamble under `## 2` / `### 2.0A`, so the mapped owner section does not exist as such.
- what is still missing: missing tokens/fields: `live owner anchor `### 2.0 Command entry contract (doc-level)``; currently absent required exact tokens: `command_kind`, `normalization`, `kind`, `normalizes_to_contract`, `alias_of_command_id`, `shell_view`, `navigation_wrapper`, `domain_action`, `wrapper`, `deprecated_alias`; currently absent required interface fields: `command_kind`, `normalization.kind`, `normalizes_to_contract`, `alias_of_command_id`; currently absent required labels: `command kind`, `normalization`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-030`
- legacy canon anchor: `working_ledger.md:12782-13050, 12905-13050, 17409-17419`
- recovery shape: `insert_after` in `Plans/UI_Command_Catalog.md`

### FIDELITY-041
- exact canon item: Orchestrator commands must live in a dedicated owner section with the mapped action-surface fields.
- where partial/stubbed transfer currently appears: Target heading `### 2.5 Orchestrator page commands` is missing in `Plans/UI_Command_Catalog.md`; current note: Related content is folded into `### 2.4 Run Graph commands`; the mapped section is absent and the field packet is incomplete.
- what is still missing: missing tokens/fields: `live owner anchor `### 2.5 Orchestrator page commands``, ``project_id``; currently absent required exact tokens: `navigation vs mutation`, `single-target vs multi-target`, `shortcut eligibility`, `palette visibility`, `confirmation`, `reversibility`, `route_target`; currently absent required interface fields: `action_type`, `target_scope`, `palette_visible`, `shortcut_eligible`, `confirmation_strength`, `reversibility`, `project_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `tab_id`; currently absent required labels: `Open`, `Review`, `Resolve`, `Export`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-015`, `OBL-020`
- legacy canon anchor: `working_ledger.md:3162-3328, 4515-4647, 6376-6467, 17365-17377`; `working_ledger.md:2613-2757, 5576-5733`
- recovery shape: `insert_after` in `Plans/UI_Command_Catalog.md`

### FIDELITY-042
- exact canon item: Search-command routing must survive in the mapped section with canonical labels.
- where partial/stubbed transfer currently appears: Target heading `#### Search commands` is missing in `Plans/UI_Command_Catalog.md`; current note: The route/open content is embedded under `### 2.8A Side-panel and artifacts navigation commands`, not the mapped search section.
- what is still missing: missing tokens/fields: `live anchor `#### Search commands``, `label `Open``; currently absent required exact tokens: `route_target`, `project_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `inspector_target`; currently absent required interface fields: `project_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `tab_id`, `inspector_target`; currently absent required labels: `Open`, `Details`, `Artifacts`, `History`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-020`, `OBL-021`, `OBL-026`
- legacy canon anchor: `working_ledger.md:2613-2757, 5576-5733`; `working_ledger.md:11917-12020, 13289-13391`; `working_ledger.md:12021-12124, 13210-13288, 13734-13805`
- recovery shape: `insert_after` in `Plans/UI_Command_Catalog.md`

### FIDELITY-043
- exact canon item: Canonical runtime recovery command ownership must survive as a dedicated section.
- where partial/stubbed transfer currently appears: Target heading `## Canonical Runtime Recovery Command Consolidation (2026-03-09)` is missing in `Plans/UI_Command_Catalog.md`; current note: The command table and rules exist, but not under the mapped owner heading.
- what is still missing: missing tokens/fields: `live owner anchor `## Canonical Runtime Recovery Command Consolidation (2026-03-09)``; currently absent required exact tokens: `allowed_action_id`, `blocked_sequence`, `attempt_id?`, `cmd.runtime.approve`, `cmd.runtime.decline`, `cmd.runtime.resume_after_prerequisite`, `allowed_action_ids[]`; currently absent required interface fields: `allowed_action_id`, `blocked_sequence`, `attempt_id`, `allowed_action_ids`; currently absent required labels: `Approve`, `Decline`, `Resume after prerequisite`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-032`
- legacy canon anchor: `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `insert_after` in `Plans/UI_Command_Catalog.md`

### FIDELITY-056
- exact canon item: `Source Control` / `worktree-first` scope packet, including “Source Control remains the primary operational surface...” and “Scale behavior must be defined above individual tab prose.”
- where partial/stubbed transfer currently appears: Target heading `## 1. Scope and canonical model` is missing in `Plans/Orchestrator_Page.md`; current note: The content survives only as an unheaded intro block above `## 2`, so the mapped owner section is not addressable as its own section.
- what is still missing: missing tokens/fields: `section anchor `## 1. Scope and canonical model``; currently absent required exact tokens: `Source Control`, `worktree-first`, `Orchestrator`, `Lane`, `primary operational object in Orchestrator`, `Worktree`, `concrete filesystem/Git backing`, `Orchestrator-wide scale contract`; currently absent required interface fields: `lane_id`, `worktree_id`, `package_id`, `node_id`, `seam_id`, `virtualization_strategy`, `lazy_expansion_trigger`, `inspector_loading_strategy`; currently absent required labels: `Source Control`, `Orchestrator`, `Lane`, `Worktree`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-001`, `OBL-002`, `OBL-014`
- legacy canon anchor: `working_ledger.md:1923-1933, 2105-2125, 2179-2194`; `working_ledger.md:1935-1946; current chat context legacy-readiness checks`; `working_ledger.md:4396-4514`
- recovery shape: `insert_after` in `Plans/Orchestrator_Page.md`

### FIDELITY-057
- exact canon item: “Filtered JSON is not automatically canonical record export.” / “Validation pass reports must remain visibly upstream artifacts...”
- where partial/stubbed transfer currently appears: Target heading `## 6. Evidence tab` is missing in `Plans/Orchestrator_Page.md`; current note: The Evidence packet is present, but it is embedded after `## 5. Node Graph tab` with no section boundary.
- what is still missing: missing tokens/fields: `section anchor `## 6. Evidence tab``; currently absent required exact tokens: `record export`, `bundle export`, `view export`, `manifest`, `trust_state_at_export`, `validation_pass_report`, `Corroboration Queue`, `Recovery State`; currently absent required interface fields: `export_id`, `export_kind`, `focused_run_id`, `filter_summary`, `included_record_ids`, `included_artifact_ids`, `included_file_paths`, `trust_state_at_export`, `workflow_run_id`; currently absent required labels: `record export`, `bundle export`, `view export`, `Corroboration Queue`, `Recovery State`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-017`, `OBL-036`, `OBL-039`
- legacy canon anchor: `working_ledger.md:3512-3635, 5298-5439, 17379-17391`; `working_ledger.md:9297-9379, 10963-10966`; `working_ledger.md:75-105, 322-329, 17369-17372`
- recovery shape: `append` in `Plans/Orchestrator_Page.md`

### FIDELITY-058
- exact canon item: History surfaces must render the shared historical vocabulary explicitly.
- where partial/stubbed transfer currently appears: Target heading `## 7. History tab` is missing in `Plans/Orchestrator_Page.md`; current note: The history vocabulary block survives, but not as the mapped owner section.
- what is still missing: missing tokens/fields: `section anchor `## 7. History tab``; currently absent required exact tokens: `historical`, `stale_historical`, `superseded`, `revoked`, `reopened`, `archived`, `removed`, `Run Status`, `Recent Major Events`, `Throughput / Capacity`, `Info`, `Warning`; currently absent required interface fields: `historical_state`, `lineage_refs`, `supersession_refs`, `revocation_refs`, `archive_status`, `event_family`, `condition_state`, `linger_policy`, `episode_id`, `switch_event_id`; currently absent required labels: `historical`, `archived`, `removed`, `Run Status`, `Recent Major Events`, `Throughput / Capacity`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-018`, `OBL-039`, `OBL-041`, `OBL-043`
- legacy canon anchor: `working_ledger.md:2758-2885, 5734-5885`; `working_ledger.md:75-105, 322-329, 17369-17372`; `working_ledger.md:193-257, 4295-4417, 17373-17375`; `working_ledger.md:8143-8238, 17256-17264, 17446-17449`
- recovery shape: `append` in `Plans/Orchestrator_Page.md`

### FIDELITY-059
- exact canon item: Ledger export affordances must distinguish canonical record exports from derived view exports and bundles.
- where partial/stubbed transfer currently appears: Target heading `## 8. Ledger tab` is missing in `Plans/Orchestrator_Page.md`; current note: The Ledger packet is present inline, but the mapped section anchor is missing.
- what is still missing: missing tokens/fields: `section anchor `## 8. Ledger tab``; currently absent required exact tokens: `record export`, `bundle export`, `view export`, `manifest`, `trust_state_at_export`, `Promotion Queue`, `account_pressure_episode`, `account_switch_event`, `decision_kind`, `source_episode_id?`; currently absent required interface fields: `export_id`, `export_kind`, `source_surface`, `focused_run_id`, `filter_summary`, `included_record_ids`, `included_artifact_ids`, `included_file_paths`, `lineage_notes`, `trust_state_at_export`, `episode_id`, `switch_event_id`; currently absent required labels: `record export`, `bundle export`, `view export`, `Promotion Queue`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-017`, `OBL-039`, `OBL-043`
- legacy canon anchor: `working_ledger.md:3512-3635, 5298-5439, 17379-17391`; `working_ledger.md:75-105, 322-329, 17369-17372`; `working_ledger.md:8143-8238, 17256-17264, 17446-17449`
- recovery shape: `append` in `Plans/Orchestrator_Page.md`

### FIDELITY-060
- exact canon item: Historical truth must not disappear when live worktrees are gone, and `historical` must remain distinct from cleanup state.
- where partial/stubbed transfer currently appears: Target heading `## 9. Current vs historical run behavior` is missing in `Plans/Orchestrator_Page.md`; current note: The historical-run packet exists only as a continuation block, not as the mapped section.
- what is still missing: missing tokens/fields: `section anchor `## 9. Current vs historical run behavior``; currently absent required exact tokens: `historical`, `archived`, `removed`, `baseline`, `active`, `suspect`, `restoring`, `retained`, `cleanup_eligible`, `stale_historical`, `superseded`, `revoked`; currently absent required interface fields: `lifecycle_state`, `historical_state`, `archive_status`, `lineage_refs`, `active_run_id`, `focused_run_id`, `focus_mode`, `last_live_run_id`, `auto_return_to_live`; currently absent required labels: `historical`, `archived`, `removed`, `cleanup eligible`, `Historical Run Mode`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-003`, `OBL-004`, `OBL-018`, `OBL-042`
- legacy canon anchor: `working_ledger.md:2127-2141`; `working_ledger.md:1948-1965`; `working_ledger.md:2758-2885, 5734-5885`; `working_ledger.md:2517-2629, 2661-2707, 17377-17385`
- recovery shape: `append` in `Plans/Orchestrator_Page.md`

### FIDELITY-061
- exact canon item: Command/palette exposure must not silently downgrade confirmation strength, and cross-surface pivots must restore context through canonical route payloads.
- where partial/stubbed transfer currently appears: Target heading `## 10. Search, routing, and action policy` is missing in `Plans/Orchestrator_Page.md`; current note: The routing/action packet is present, but not under the mapped owner heading.
- what is still missing: missing tokens/fields: `section anchor `## 10. Search`, `routing`, `and action policy``; currently absent required exact tokens: `navigation vs mutation`, `single-target vs multi-target`, `shortcut eligibility`, `palette visibility`, `confirmation`, `reversibility`, `shared routing payload contract`, `focused_run_id?`, `focus_mode = live | historical`, `source`, `request`, `execution`; currently absent required interface fields: `action_type`, `target_scope`, `palette_visible`, `shortcut_eligible`, `confirmation_strength`, `reversibility`, `project_id`, `target_kind`, `subject_id`, `object_kind`, `object_id`, `tab_id`; currently absent required labels: `navigation`, `mutation`, `confirmation`, `Requested`, `Effective`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-015`, `OBL-020`, `OBL-042`, `OBL-045`
- legacy canon anchor: `working_ledger.md:3162-3328, 4515-4647, 6376-6467, 17365-17377`; `working_ledger.md:2613-2757, 5576-5733`; `working_ledger.md:2517-2629, 2661-2707, 17377-17385`; `working_ledger.md:3658-3745, 3831-3925, 17401-17414`
- recovery shape: `append` in `Plans/Orchestrator_Page.md`

### FIDELITY-062
- exact canon item: Destructive Git/worktree actions must resolve through Source Control semantics, and files cleanup must remain distinct from worktree removal.
- where partial/stubbed transfer currently appears: Target heading `## 11. Source Control boundary` is missing in `Plans/Orchestrator_Page.md`; current note: The boundary packet survives only as inline prose; the mapped section boundary is absent.
- what is still missing: missing tokens/fields: `section anchor `## 11. Source Control boundary``; currently absent required exact tokens: `Source Control`, `worktree-first`, `dirty_worktree`, `worktree_conflict`, `worktree_id`, `lane_id`, `cleanup_eligible`, `archived`, `removed`; currently absent required interface fields: `worktree_id`, `lane_id`, `blocked_reason_code`, `remediation_actions_allowed`, `dirty_state`, `conflict_state`, `selected_worktree_id`; currently absent required labels: `Source Control`, `dirty worktree`, `worktree conflict`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-001`, `OBL-005`, `OBL-006`, `OBL-038`
- legacy canon anchor: `working_ledger.md:1923-1933, 2105-2125, 2179-2194`; `working_ledger.md:2169-2175`; `working_ledger.md:1911-1914, 2172`; `working_ledger.md:9459-9575, 4892-5050, 17264-17266`
- recovery shape: `append` in `Plans/Orchestrator_Page.md`

### FIDELITY-063
- exact canon item: Health, activity, and attention must not collapse into one indicator, and `attention_required` must remain distinct from `blocked`.
- where partial/stubbed transfer currently appears: Target heading `## 12. Concern and notification model` is missing in `Plans/Orchestrator_Page.md`; current note: The concern/notification packet is present, but not as the mapped owner section.
- what is still missing: missing tokens/fields: `section anchor `## 12. Concern and notification model``; currently absent required exact tokens: `project health`, `project activity`, `project attention`, `blocked_owner`, `primary_attention_reason`, `info`, `warning`, `attention_required`, `blocked`, `system_notification`, `concern`, `concern_id`; currently absent required interface fields: `activity_state`, `attention_state`, `health_indicator`, `blocked_owner`, `primary_attention_reason`, `escalation_level`, `concern_id`, `owner_kind`, `resolution_kind`, `lineage_refs`, `blocked_owner_kind`, `alert_level`; currently absent required labels: `Info`, `Warning`, `Attention`, `Action Required`, `System notification`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-012`, `OBL-013`, `OBL-019`, `OBL-041`
- legacy canon anchor: `working_ledger.md:4127-4272, 7080-7174, 17393-17407`; `working_ledger.md:4273-4395, 17393-17407`; `working_ledger.md:2947-3161, 5886-6075, 17365-17377`; `working_ledger.md:193-257, 4295-4417, 17373-17375`
- recovery shape: `append` in `Plans/Orchestrator_Page.md`

### FIDELITY-064
- exact canon item: Startup restore must recover historical lineage from durable records, and missing live worktrees must render as historical/archived/removed.
- where partial/stubbed transfer currently appears: Target heading `### 2.8 Startup recovery uses process CWD` is missing in `Plans/WorktreeGitImprovement.md`; current note: The packet is merged into `### 2.7 worktree_exists is path-only`, so the mapped owner section is missing.
- what is still missing: missing tokens/fields: `section anchor `### 2.8 Startup recovery uses process CWD``; currently absent required exact tokens: `historical`, `archived`, `removed`, `last_seen_at_utc`, `owner_run_id`, `owner_attempt_id`, `orchestrator.receipt.{run_id}.{attempt_id}`; currently absent required interface fields: `worktree_id`, `lane_id`, `last_seen_at_utc`, `owner_run_id`, `owner_attempt_id`, `historical_lineage_refs[]`; currently absent required labels: `startup recovery`, `historical lineage`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-003`, `OBL-038`
- legacy canon anchor: `working_ledger.md:2127-2141`; `working_ledger.md:9459-9575, 4892-5050, 17264-17266`
- recovery shape: `insert_after` in `Plans/WorktreeGitImprovement.md`

### FIDELITY-065
- exact canon item: Assistant worktree lifecycle must preserve cleanup-vs-remove distinction and `lane_id` vs `worktree_id` identity carry-through.
- where partial/stubbed transfer currently appears: Target heading `### 4.1 Assistant-created worktree lifecycle` is missing in `Plans/WorktreeGitImprovement.md`; current note: The content survives inside `## 4. GUI for Git & Worktrees`, but not under the mapped owner subsection.
- what is still missing: missing tokens/fields: `section anchor `### 4.1 Assistant-created worktree lifecycle``; currently absent required exact tokens: `baseline`, `active`, `suspect`, `restoring`, `retained`, `cleanup_eligible`, `archived`, `removed`, `worktree_id`, `lane_id`, `selected_worktree_id`; currently absent required interface fields: `worktree_id`, `lane_id`, `lifecycle_state`, `selected_worktree_id`, `dirty_state`, `conflict_state`, `blocked_reason_code`, `projection_freshness`, `projection_health`; currently absent required labels: `worktree lifecycle`, `cleanup eligible`, `archived`, `removed`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-004`, `OBL-006`, `OBL-038`
- legacy canon anchor: `working_ledger.md:1948-1965`; `working_ledger.md:1911-1914, 2172`; `working_ledger.md:9459-9575, 4892-5050, 17264-17266`
- recovery shape: `insert_after` in `Plans/WorktreeGitImprovement.md`

### FIDELITY-068
- exact canon item: GitHub surface worktree rows must respect durable worktree/lane identity and historical rendering semantics.
- where partial/stubbed transfer currently appears: Target heading `### A.4 Worktrees` is missing in `Plans/GitHub_Integration.md`; current note: The worktree packet is embedded after `A.3` with no `A.4` heading, and the explicit `worktree_id` token drops out of the section-owned schema.
- what is still missing: missing tokens/fields: `section anchor `### A.4 Worktrees``, ``worktree_id``; currently absent required exact tokens: `worktree_id`, `lane_id`, `historical`, `archived`, `removed`, `cleanup_eligible`, `selected_worktree_id`; currently absent required interface fields: `worktree_id`, `lane_id`, `path_ref`, `branch_ref`, `baseline_ref`, `lifecycle_state`, `selected_worktree_id`; currently absent required labels: `worktrees`, `historical`, `archived`, `removed`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-003`, `OBL-004`, `OBL-038`
- legacy canon anchor: `working_ledger.md:2127-2141`; `working_ledger.md:1948-1965`; `working_ledger.md:9459-9575, 4892-5050, 17264-17266`
- recovery shape: `insert_after` in `Plans/GitHub_Integration.md`

### FIDELITY-069
- exact canon item: Deep-link recovery must serialize canonical route identity, and GitHub reconnect context must use stable internal account identity.
- where partial/stubbed transfer currently appears: Target heading `## Deferred GitHub Recovery Binding (2026-03-09)` is missing in `Plans/GitHub_Integration.md`; current note: The recovery-binding packet exists only as an unnamed tail block, so the mapped owner section is not reachable.
- what is still missing: missing tokens/fields: `section anchor `## Deferred GitHub Recovery Binding (2026-03-09)``; currently absent required exact tokens: `resume_url`, `route_target`, `account_id`, `credential_ref`, `login`; currently absent required interface fields: `resume_url`, `project_id`, `focused_run_id`, `thread_id`, `account_id`, `credential_ref`, `login`; currently absent required labels: `recovery binding`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-027`, `OBL-035`
- legacy canon anchor: `working_ledger.md:12371-12447, 13524-13594, 14913-14965; current chat context legacy-readiness checks`; `working_ledger.md:6988-7056, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `append` in `Plans/GitHub_Integration.md`

### FIDELITY-070
- exact canon item: Source Control owns Git-native worktree inspection and mutation actions, and cross-surface opens must route through canonical route/open contracts.
- where partial/stubbed transfer currently appears: Target heading `### A.5 Surface boundary rule` is missing in `Plans/GitHub_Integration.md`; current note: The boundary packet is present inline after the worktree block, but the mapped owner subsection is absent.
- what is still missing: missing tokens/fields: `section anchor `### A.5 Surface boundary rule``; currently absent required exact tokens: `Source Control owns Git-native worktree inspection and mutation actions`, `Orchestrator owns lane/package/seam operational context, lineage, and governance state`, `cross-surface opens route through canonical route/open contracts rather than feature-local payloads`; currently absent required interface fields: `initiator_surface`, `executor_surface`, `worktree_id`, `lane_id`, `package_id`, `run_reference`; currently absent required labels: `Source Control`, `Orchestrator`
- failure: missing structural heading
- classification: `section allocation missing`
- obligation ids: `OBL-001`
- legacy canon anchor: `working_ledger.md:1923-1933, 2105-2125, 2179-2194`
- recovery shape: `insert_after` in `Plans/GitHub_Integration.md`

### FIDELITY-076
- exact canon item: Replace tier-rooted execution context with `execution_unit_context` carrying run/node/attempt/lane/package/seam/worktree/account/role/runtime identity instead of `TierContext` / `tier_id`.
- where partial/stubbed transfer currently appears: Target heading `### Tier Context` is missing in `Plans/orchestrator-subagent-integration.md`; current note: The mapped `### Tier Context` section does not exist. A partial `execution_unit_context` block survives unheaded, while stale `TierContext` / `tier_id` canon remains elsewhere.
- what is still missing: missing tokens/fields: ``execution_unit_context``, ``run_id``, ``node_id``, ``attempt_id``, ``lane_id``, ``package_id``, ``seam_id``, ``worktree_id``, ``execution_role``, ``requested_account_id``, ``effective_account_id``, ``operational_identity``; currently absent required exact tokens: `execution_unit_context`, `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `effective_account_id`, `operational_identity`; currently absent required interface fields: `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `effective_account_id`, `operational_identity`; currently absent required labels: `execution unit context`
- failure: missing structural heading
- classification: `wrong section allocation`
- obligation ids: `OBL-031`
- legacy canon anchor: `working_ledger.md:8572-8755, 9805-10136, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `insert_after` in `Plans/Executor_Protocol.md + Plans/Contracts_V0.md + Plans/Multi-Account.md`

## Stale Contradictory Survivors

### FIDELITY-002
- exact canon item: `target_kind` must remain a closed enum with exactly `primary_view`, `side_panel`, `bottom_panel`, `embedded_surface`, and `page_tab`.
- where partial/stubbed transfer currently appears: Target heading `7.3 \`route_target\`` is missing in `Plans/Contracts_V0.md`; current note: The section adds `detached_window`, contradicting the mapped closed-vocabulary contract.
- what is still missing: The section adds `detached_window`, contradicting the mapped closed-vocabulary contract.
- failure: other (stale contradictory survivor)
- classification: `stale contradictory residue`
- obligation ids: none linked in current section map
- legacy canon anchor: not linked
- recovery shape: `insert_after` in `Plans/Contracts_V0.md`

### FIDELITY-006
- exact canon item: Runtime artifacts must mirror storage-owned runtime-artifact indexing using `artifacts_index.v1:{project_id}:{artifact_id}`.
- where partial/stubbed transfer currently appears: `Plans/Project_Output_Artifacts.md#### Runtime Artifacts (GUI panel) — distinct from this document` (lines 17-27)
- what is still missing: missing tokens/fields: `artifacts_index.v1:{project_id}:{artifact_id}`; currently absent required exact tokens: `artifacts_index.v1:{project_id}:{artifact_id}`; currently absent required interface fields: `artifact_id`, `artifact_type`; stale residue still present: `redb `artifacts_index:v1:{project_id}``
- failure: other (stale contradictory survivor)
- classification: `stale contradictory residue`
- obligation ids: `OBL-037`
- legacy canon anchor: `working_ledger.md:9381-9457, 9467-9498`
- recovery shape: `replace_section` in `Plans/Project_Output_Artifacts.md`

### FIDELITY-011
- exact canon item: Legacy execution-scope field names must be retired from canonical node execution context.
- where partial/stubbed transfer currently appears: Target heading `## 5. Node execution fields` is missing in `Plans/Executor_Protocol.md`; current note: The normalization rules still keep deprecated aliases live inside the canonical execution-context section even though the section map marks them as must-not-remain residue.
- what is still missing: missing tokens/fields: `stale tokens remain `work_package_id``, ``feature_seam_id``; currently absent required exact tokens: `execution_unit_context`, `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `requested_account_binding`, `requested_account_policy`; currently absent required interface fields: `run_id`, `node_id`, `attempt_id`, `lane_id`, `package_id`, `seam_id`, `worktree_id`, `execution_role`, `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`; currently absent required labels: `node execution fields`
- failure: other (stale contradictory survivor)
- classification: `stale contradictory residue`
- obligation ids: `OBL-007`, `OBL-031`, `OBL-032`
- legacy canon anchor: `working_ledger.md:1984-2001, 2022-2036, 7811-7900, 10137-10226, 17421-17431`; `working_ledger.md:8572-8755, 9805-10136, 17421-17431; current chat context legacy-readiness checks`; `working_ledger.md:8645-8824, 9642-9729, 17421-17431; current chat context legacy-readiness checks`
- recovery shape: `replace_section` in `Plans/Executor_Protocol.md`

### FIDELITY-016
- exact canon item: Runtime-artifact family identity must use per-artifact row identity; the retired project-only key must not remain.
- where partial/stubbed transfer currently appears: Target heading `## 2. Two artifact families (no conflation)` is missing in `Plans/Runtime_Artifacts_Panel.md`; current note: The section correctly names `artifacts_index.v1:{project_id}:{artifact_id}` but still advertises the retired per-project blob key in the same persistence prose.
- what is still missing: missing tokens/fields: `none; stale token remains `artifacts_index:v1:{project_id}``; currently absent required exact tokens: `Project Plan Package`, `Runtime Artifacts`, `seglog `runtime_artifact.*``, `artifacts_index.v1:{project_id}:{artifact_id}`; currently absent required interface fields: `artifact_id`, `artifact_type`, `project_id`, `run_id`, `attempt_id`, `projection_freshness`, `projection_health`; currently absent required labels: `Project Plan Package`, `Runtime Artifacts`
- failure: other (stale contradictory survivor)
- classification: `stale contradictory residue`
- obligation ids: `OBL-037`
- legacy canon anchor: `working_ledger.md:9381-9457, 9467-9498`
- recovery shape: `insert_after` in `Plans/storage-plan.md`

### FIDELITY-018
- exact canon item: The runtime-artifact envelope must fully retire non-canonical `artifact_kind` / task-id residue.
- where partial/stubbed transfer currently appears: Target heading `## 5. Canonical IDs and task_id rule` is missing in `Plans/Runtime_Artifacts_Panel.md`; current note: The owner section still mentions `artifact_kind` instead of fully retiring it from canon.
- what is still missing: missing tokens/fields: `none; stale token remains `artifact_kind``; currently absent required exact tokens: `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `runtime-artifact envelope`, `artifact_id`, `artifact_type`, `logical_artifact_id`, `linked_artifact_id`, `created_at_utc`; currently absent required interface fields: `attempt_id`, `provider_attempt_ref`, `usage_event_ref`, `workflow_refs`, `docker_refs`, `kubernetes_refs`, `artifact_id`, `artifact_type`, `logical_artifact_id`, `linked_artifact_id`, `created_at_utc`, `summary`; currently absent required labels: `artifact id`, `attempt id`
- failure: other (stale contradictory survivor)
- classification: `stale contradictory residue`
- obligation ids: `OBL-034`
- legacy canon anchor: `working_ledger.md:10460-10645, 10537-10645, 11663-11722, 17409-17419; current chat context audit synthesis`
- recovery shape: `insert_after` in `Plans/storage-plan.md`

### FIDELITY-066
- exact canon item: `dirty_worktree` and `worktree_conflict` must stay canonical blocked reasons, and conflict and cleanup semantics must remain distinct.
- where partial/stubbed transfer currently appears: Target heading `## Worktree Conflict and Dirty-Worktree Runtime Alignment` is missing in `Plans/WorktreeGitImprovement.md`; current note: The canonical packet lives under historical `## Runtime Worktree Conflict Reconciliation Addendum (2026-03-09)`, which says the rules “now live” in a section that does not exist.
- what is still missing: missing tokens/fields: `section anchor `## Worktree Conflict and Dirty-Worktree Runtime Alignment``, `label `worktree conflict``; currently absent required exact tokens: `dirty_worktree`, `worktree_conflict`, `blocked_reason_code`, `remediation_actions_allowed`; currently absent required interface fields: `blocked_reason_code`, `blocked_reason_detail`, `remediation_actions_allowed`, `dirty_state`, `conflict_state`; currently absent required labels: `dirty worktree`, `worktree conflict`
- failure: other (stale contradictory survivor)
- classification: `stale contradictory residue`
- obligation ids: `OBL-005`, `OBL-006`
- legacy canon anchor: `working_ledger.md:2169-2175`; `working_ledger.md:1911-1914, 2172`
- recovery shape: `insert_after` in `Plans/WorktreeGitImprovement.md`

### FIDELITY-078
- exact canon item: Requested/effective execution identity must expose canonical requested-side concrete-account fields and preserve requested/effective runtime identity without local aliases.
- where partial/stubbed transfer currently appears: `Plans/interview-subagent-integration.md#### Runtime identity visibility` (lines 1686-1698)
- what is still missing: missing tokens/fields: ``requested_account_id``, ``requested_account_policy``, ``effective_account_id``; currently absent required exact tokens: `requested_account_id`, `requested_account_policy`, `effective_account_id`; currently absent required interface fields: `requested_account_id`, `requested_account_policy`, `effective_account_id`; currently absent required labels: `requested account`, `effective account`
- failure: other (stale contradictory survivor)
- classification: `stale contradictory residue`
- obligation ids: `OBL-007`
- legacy canon anchor: `working_ledger.md:1984-2001, 2022-2036, 7811-7900, 10137-10226, 17421-17431`
- recovery shape: `replace_section` in `Plans/Contracts_V0.md`
