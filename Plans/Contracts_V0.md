# Contracts V0 (Canonical)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Emerging execution-settings direction
  - runtime/model precedence
  - Highest-Impact Docs
  - Runtime / Storage / Contract Impacts
  - Cleanup Priorities

#### Source target target-0106
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Emerging execution-settings direction
  - runtime/model precedence
  - Highest-Impact Docs
  - Runtime / Storage / Contract Impacts
  - Cleanup Priorities
- Exact required items represented:
  - Define distinct defaults/overrides for provider/model at run/global, feature seam, work package, node, work package overseer, feature seam overseer, and overseer-delegated node worker levels.
  - Make requested vs effective provider/model visible at all levels where [retired-token-3] can occur.
  - Specify node [retired-token-5] selection as dynamic-by-default from node scope/type; node-worker [retired-token-5] override is policy-owned, not per-node [retired-token-1].
  - Specify whether overseers may use subagents for node work and what provider/model policy applies to delegated node workers.
  - provider/model precedence order across run, seam, package, node, overseer, and delegated-subagent levels
  - whether seam/package/node provider-model settings are hard constraints, defaults, or hints
  - whether an overseer can do direct node work or only delegate/review
  - if direct node work is allowed, whether it uses overseer-[retired-token-6] or node-[retired-token-6]
  - how dynamic node [retired-token-5]s interact with explicit node overrides and overseer-controlled delegation
  - Replace tier-rooted execution with package/seam/lane model
  - Define package overseer + seam overseer roles
  - Add node/package/seam/lane/attempt/effective_identity fields to contracts and storage
  - Redefine gates to package-complete / seam-complete
  - Rename or retire Tiers UI/tab and tier_tree/progress bars
  - Add node_id
  - Add package_id
  - Add seam_id
  - Add lane_id
  - Add attempt_id
  - Add effective_identity
  - Normalize requested/effective account identity shapes
  - Normalize blocked_[retired-token-25]/allowed_action_ids and safe-point/restore-point/rollback terminology
  - Relax or replace stale graph-schema constants `[retired-token-23]` and [retired-token-24].
  - Add package/seam/lane/worktree/account identity fields to canonical runtime/event/envelope contracts.
  - Define contamination and safe-point linkage explicitly in storage and blocked-payload contracts.
  - Priority 1 — Canonical contracts that cannot safely coexist with the new model**
  - 4. **`requested_[retired-token-5]_id` vs canonical `requested_[retired-token-5]`**
  - requested_[retired-token-5]_id
  - requested_[retired-token-5]
  - Why it matters: GPT-5.4 found almost no owner docs that actually define these objects, even where many other contracts now depend on them.
  - impacted contract/runtime/storage area: identity fields.
  - this collides with the newer package-based lane-pool model
  - `suspect`
  - suspect
  - `restoring`
  - restoring
  - `retained`
  - retained
  - `cleanup_eligible`
  - cleanup_eligible
  - now needs explicit requested/effective identity, trust-state, and governance-record drill-in contracts to stay viable as the graph-native surface
  - `worktree_id`
  - worktree_id
  - owning package/lane identity when applicable
  - owner run/package/lane
  - from `TierChanged` / `IterationStart` / `TierTree`
  - TierChanged
  - IterationStart
  - TierTree
  - `refreshing`
  - refreshing
  - `active_run_id?`
  - active_run_id?
  - `focused_run_id?`
  - focused_run_id?
  - `focus_mode = live` when `focused_run_id == active_run_id`
  - focus_mode = live
  - focused_run_id == active_run_id
  - inspect evidence
  - Candidate fields:
  - `focus_mode`
  - focus_mode
  - `last_live_run_id?`
  - last_live_run_id?
  - evidence/artifact when directly addressable
  - `focused_run_id`
  - focused_run_id
  - and/or command-palette integrated
  - canonical names/titles
  - `Reopened by New Evidence`
  - Reopened by New Evidence
  - Compared with attempts/blocked/remediation, concerns currently lack:
  - `seam_id?`
  - seam_id?
  - `package_id?`
  - package_id?
  - `lane_id?`
  - lane_id?
  - `worktree_id?`
  - worktree_id?
  - `owner_ref?`
  - owner_ref?
  - `created_by_ref?`
  - created_by_ref?
  - `first_seen_at_utc`
  - first_seen_at_utc
  - `last_seen_at_utc`
  - last_seen_at_utc
  - `resolved_at_utc?`
  - resolved_at_utc?
  - `dismissed_at_utc?`
  - dismissed_at_utc?
  - `acknowledged_at_utc?`
  - acknowledged_at_utc?
  - `artifact_refs[]`
  - artifact_refs[]
  - `parent_concern_id?`
  - parent_concern_id?
  - `superseded_by_concern_id?`
  - superseded_by_concern_id?
  - `merged_into_concern_id?`
  - merged_into_concern_id?
  - `split_from_concern_id?`
  - split_from_concern_id?
  - `state_contract`
  - state_contract
  - `design_architecture`
  - design_architecture
  - `evidence_gap`
  - evidence_gap
  - `account_usage_pressure`
  - account_usage_pressure
  - append sources/evidence
  - `Seams`
  - Seams
  - `strong`
  - strong
  - `hard_gate`
  - hard_gate
  - `immediate_undo`
  - immediate_undo
  - `compensating_action_only`
  - compensating_action_only
  - `non_reversible`
  - non_reversible
  - `Reapply`
  - Reapply
  - merge/split should be `strong`
  - strong confirmations should be consequence-specific, not generic "Are you sure?"
  - `record_id`
  - record_id
  - `record_kind`
  - record_kind
  - `promotion_id?`
  - promotion_id?
  - `concern_id?`
  - concern_id?
  - `created_at_utc`
  - created_at_utc
  - `superseded_by_record_id?`
  - superseded_by_record_id?
  - linked artifacts/evidence
  - `corroboration_result`
  - corroboration_result
  - `graph_patch_result`
  - graph_patch_result
  - requester identity
  - `seam_completion`
  - seam_completion
  - `export_id`
  - export_id
  - `export_kind`
  - export_kind
  - `generated_at_utc`
  - generated_at_utc
  - `filter_summary`
  - filter_summary
  - `record_counts`
  - record_counts
  - `artifact_counts`
  - artifact_counts
  - `included_record_ids[]`
  - included_record_ids[]
  - `included_artifact_ids[]`
  - included_artifact_ids[]
  - `status_notes`
  - status_notes
  - `schema_version`
  - schema_version
  - These should not be treated as canonical archival formats.
  - `source axis`
  - source axis
  - `execution/result axis`
  - execution/result axis
  - `Inherited from`
  - Inherited from
  - `Overridden by`
  - Overridden by
  - provider/model/variant/effort
  - `Temperature: 0.2 -> Honored`
  - Temperature: 0.2 -> Honored
  - `Top-p: 1.0 -> Clamped to 0.9`
  - Top-p: 1.0 -> Clamped to 0.9
  - This should answer:
  - `background_active`
  - background_active
  - dominant concern/blocked owner
  - `system_notification`
  - system_notification
  - System/tray notifications should stay narrow.
  - Usage/account-pressure implication
  - or only `compensating_action_only`
  - bulk-forbidden
  - `freshness_state`
  - freshness_state
  - `last_updated_at`
  - last_updated_at
  - `data_source_kind`
  - data_source_kind
  - `degraded_reason?`
  - degraded_reason?
  - `action_gate_reason?`
  - action_gate_reason?
  - `attempt_record`
  - attempt_record
  - `tier_runtime_record`
  - tier_runtime_record
  - `evidence_record`
  - evidence_record
  - `thread_blocked_notice`
  - thread_blocked_notice
  - `wizard_runtime_state`
  - wizard_runtime_state
  - `scope_type`
  - scope_type
  - `scope_id`
  - scope_id
  - `updated_at_utc?`
  - updated_at_utc?
  - `summary_kind?`
  - summary_kind?
  - `related_record_refs[]`
  - related_record_refs[]
  - `actor_ref?`
  - actor_ref?
  - `requested_effective_snapshot_refs?`
  - requested_effective_snapshot_refs?
  - Worktree-oriented state implication
  - `orphaned`
  - orphaned
  - `recovering`
  - recovering
  - prune/remove should usually be `strong`
  - `selection_reason`
  - selection_reason
  - lane-pool objects
  - package/seam-governance objects
  - same provider/account/model/runtime machinery
  - `filter_summary?`
  - filter_summary?
  - `included_file_paths[]?`
  - included_file_paths[]?
  - `lineage_notes?`
  - lineage_notes?
  - `trust_state_at_export?`
  - trust_state_at_export?
  - `thread/chat`
  - thread/chat
  - This should apply across:
  - Good common fields:
  - `actor_run_kind?`
  - actor_run_kind?
  - `wizard_id?`
  - wizard_id?
  - `object_kind?`
  - object_kind?
  - `object_id?`
  - object_id?
  - `record_id?`
  - record_id?
  - `artifact_id?`
  - artifact_id?
  - `usage_event_ref?`
  - usage_event_ref?
  - `filter_payload?`
  - filter_payload?
  - `inspector_target?`
  - inspector_target?
  - `scroll_target?`
  - scroll_target?
  - `focus_behavior?`
  - focus_behavior?
  - `feature_seam`
  - feature_seam
  - `work_package`
  - work_package
  - `recovery_record`
  - recovery_record
  - The real need is:
  - `deleted`
  - deleted
  - `description?`
  - description?
  - `owner_kind?`
  - owner_kind?
  - `origin_kind`
  - origin_kind
  - `updated_at_utc`
  - updated_at_utc
  - `first_observed_at_utc`
  - first_observed_at_utc
  - `last_observed_at_utc`
  - last_observed_at_utc
  - `resolution_kind?`
  - resolution_kind?
  - `resolution_rationale?`
  - resolution_rationale?
  - `acknowledged_by?`
  - acknowledged_by?
  - `dismissed_by?`
  - dismissed_by?
  - `blocked_episode_refs[]?`
  - blocked_episode_refs[]?
  - `promotion_refs[]?`
  - promotion_refs[]?
  - `graph_patch_refs[]?`
  - graph_patch_refs[]?
  - `recovery_refs[]?`
  - recovery_refs[]?
  - concern-linked findings/evidence
  - `Orchestrator_Page.md` still specifies `Tiers` and widget/persistence contracts around that obsolete structure
  - Orchestrator_Page.md
  - Tiers
  - canonical contracts want stable internal `account_id`
  - account_id
  - `allowed_actor_kinds`
  - allowed_actor_kinds
  - `confirmation_level`
  - confirmation_level
  - `resulting_status_or_lineage`
  - resulting_status_or_lineage
  - page/widget contracts still mostly speak in `[retired-token-10]` terms, which will collapse concurrent actors and remediation lanes into misleading “current work” summaries
  - [retired-token-10]
  - `audit_kind = start_of_tier | end_of_tier`
  - audit_kind = start_of_tier | end_of_tier
  - no `actor_kind`
  - actor_kind
  - `primary_owner_kind?`
  - primary_owner_kind?
  - `primary_[retired-token-25]?`
  - primary_[retired-token-25]?
  - `primary_object_ref?`
  - primary_object_ref?
  - `active_run_count`
  - active_run_count
  - `blocked_run_count`
  - blocked_run_count
  - `attention_object_count`
  - attention_object_count
  - `last_activity_at_utc`
  - last_activity_at_utc
  - `historical_run_count`
  - historical_run_count
  - `attention_item_id`
  - attention_item_id
  - `source_kind`
  - source_kind
  - `source_object_ref`
  - source_object_ref
  - `primary_route_payload`
  - primary_route_payload
  - `secondary_route_payload?`
  - secondary_route_payload?
  - `recent_switch_reason` and `account_switch_reason` exist
  - recent_switch_reason
  - account_switch_reason
  - Bridged-provider contracts are now visibly weaker than direct-provider contracts in the exact places the rewrite needs strongest parity:
  - `project_summary.v1:{project_id}`
  - project_summary.v1:{project_id}
  - `project_attention_item.v1:{project_id}:{attention_item_id}`
  - project_attention_item.v1:{project_id}:{attention_item_id}
  - `activity_state`
  - activity_state
  - `attention_state`
  - attention_state
  - `health_state`
  - health_state
  - `primary_attention_item_id?`
  - primary_attention_item_id?
  - `background_run_count`
  - background_run_count
  - `attention_item_count`
  - attention_item_count
  - `summary_generated_at_utc`
  - summary_generated_at_utc
  - `dismissibility_kind`
  - dismissibility_kind
  - There is still no canonical internal `route_payload` or equivalent schema in the contracts docs.
  - route_payload
  - `project_id?`
  - project_id?
  - `historical_mode?`
  - historical_mode?
  - `account_switch_reason` and `recent_switch_reason` exist
  - current `working_ledger.md`
  - working_ledger.md
  - `requested_account_id?`
  - requested_account_id?
  - `effective_account_id?`
  - effective_account_id?
  - `account_switch_reason?`
  - account_switch_reason?
  - `requested_account_binding?`
  - requested_account_binding?
  - Bridged contracts still cannot legally carry all correlation/account/trust metadata their addenda already imply.
  - current canonical fields cover provider/model/auth/account identity
  - `requested_operational_identity?`
  - requested_operational_identity?
  - `effective_operational_identity?`
  - effective_operational_identity?
  - `node_worker`
  - node_worker
  - `recovery_actor`
  - recovery_actor
  - `requested_ref?`
  - requested_ref?
  - `effective_ref?`
  - effective_ref?
  - `selection_reason?`
  - selection_reason?
  - `partial_capability?`
  - partial_capability?
  - `github_api_account`
  - github_api_account
  - `registry_namespace`
  - registry_namespace
  - `kubernetes_context`
  - kubernetes_context
  - overload provider/account fields incorrectly
  - `signal_confidence`
  - signal_confidence
  - role/account interactions
  - `account_pressure_episode`
  - account_pressure_episode
  - `account_switch_event`
  - account_switch_event
  - `execution_role?`
  - execution_role?
  - `pressure_kind`
  - pressure_kind
  - `projected_remaining?`
  - projected_remaining?
  - `reset_at?`
  - reset_at?
  - `started_at_utc`
  - started_at_utc
  - `ended_at_utc?`
  - ended_at_utc?
  - `switch_event_id`
  - switch_event_id
  - `from_account_id?`
  - from_account_id?
  - `to_account_id?`
  - to_account_id?
  - `source_episode_id?`
  - source_episode_id?
  - Widget/page drill contracts still lack strong, typed route payloads tied to canonical identity/trust/linkage fields.
  - The Orchestrator/Usage/GitHub deep-link story is now blocked more by missing route payload/trust contracts than by missing page chrome.
  - `last_projected_at_utc`
  - last_projected_at_utc
  - `degraded_[retired-token-25]?`
  - degraded_[retired-token-25]?
  - `refresh_in_progress?`
  - refresh_in_progress?
  - `project_summary`
  - project_summary
  - `project_attention_item`
  - project_attention_item
  - Before reconciliation, define an explicit owner table for the remaining open contracts so downstream edits do not keep re-litigating field placement.
  - `owner run/tier`
  - owner run/tier
  - `get_tier_worktree([retired-token-10])`
  - get_tier_worktree([retired-token-10])
  - `feature_seam_id?`
  - feature_seam_id?
  - `work_package_id?`
  - work_package_id?
  - `scheduler_lane`
  - scheduler_lane
  - `manual_priority?`
  - manual_priority?
  - `remediation_root_id?`
  - remediation_root_id?
  - `remediation_parent_attempt_id?`
  - remediation_parent_attempt_id?
  - `safe_point_id?`
  - safe_point_id?
  - `workspace_path`
  - workspace_path
  - `worktree_path?`
  - worktree_path?
  - `snapshot_ref?`
  - snapshot_ref?
  - `requested_account_policy?`
  - requested_account_policy?
  - `operational_identity?`
  - operational_identity?
  - `blocked_[retired-token-25]?`
  - blocked_[retired-token-25]?
  - `allowed_action_ids[]?`
  - allowed_action_ids[]?
  - `permission_snapshot_id?`
  - permission_snapshot_id?
  - `model_snapshot_id?`
  - model_snapshot_id?
  - `provider_attempt_ref?`
  - provider_attempt_ref?
  - `waiting_approval` is `blocked_[retired-token-25] = waiting_approval`
  - waiting_approval
  - blocked_[retired-token-25] = waiting_approval
  - still leaves pre-run governance lineage under-keyed relative to adjacent canonical event/artifact contracts.
  - receipts and evidence
  - `handoff_source`
  - handoff_source
  - `handoff_reason`
  - handoff_reason
  - `origin_thread_id`
  - origin_thread_id
  - `origin_message_id`
  - origin_message_id
  - `default_intent`
  - default_intent
  - `requested_[retired-token-5]?` / `effective_[retired-token-5]?`
  - requested_[retired-token-5]?
  - effective_[retired-token-5]?
  - `requested_platform?` / `effective_platform?`
  - requested_platform?
  - effective_platform?
  - `requested_model?` / `effective_model?`
  - requested_model?
  - effective_model?
  - grouped by `workflow_run_id`
  - workflow_run_id
  - `phase_plan_ref?`
  - phase_plan_ref?
  - `scheduler_pass_record`
  - scheduler_pass_record
  - `artifacts_index.v1:{project_id}:{artifact_id}`
  - artifacts_index.v1:{project_id}:{artifact_id}
  - `artifacts_project_state.v1:{project_id}`
  - artifacts_project_state.v1:{project_id}
  - `worktree_record.v1:{project_id}:{worktree_id}`
  - worktree_record.v1:{project_id}:{worktree_id}
  - `lane_record.v1:{project_id}:{lane_id}`
  - lane_record.v1:{project_id}:{lane_id}
  - `repo_id`
  - repo_id
  - `branch_ref`
  - branch_ref
  - `baseline_ref?`
  - baseline_ref?
  - `created_by_run_id?`
  - created_by_run_id?
  - `created_by_attempt_id?`
  - created_by_attempt_id?
  - `historical_lineage_refs[]?`
  - historical_lineage_refs[]?
  - `dirty_state`
  - dirty_state
  - `conflict_state`
  - conflict_state
  - `owner_run_id?`
  - owner_run_id?
  - `owner_attempt_id?`
  - owner_attempt_id?
  - latest `blocked_[retired-token-25]?`
  - `wake_reason = approval_resolved | clarification_resolved | auth_recovered | startup_recovered | ...`
  - wake_reason = approval_resolved | clarification_resolved | auth_recovered | startup_recovered | ...
  - `decomposition_context` or `selection_context`
  - decomposition_context
  - selection_context
  - `blocked_sequence?`
  - blocked_sequence?
  - `workspace_ref` or canonical path ref
  - workspace_ref
  - `[retired-token-18]?`
  - [retired-token-18]?
  - `effective_auth_mode?`
  - effective_auth_mode?
  - `tier_type`
  - tier_type
  - `[retired-token-10]`
  - `primary_language?`
  - primary_language?
  - `domain?`
  - domain?
  - `subtask_focus?`
  - subtask_focus?
  - `has_errors?`
  - has_errors?
  - `needs_testing?`
  - needs_testing?
  - `error_patterns[]?`
  - error_patterns[]?
  - `parent_subagents[]?`
  - parent_subagents[]?
  - `TierChanged`
  - It should not be treated as the canonical source for:
  - `scheduler_pass_id`
  - scheduler_pass_id
  - `effective_project_id?`
  - effective_project_id?
  - conditional recovery/blocked fields
  - worktree/branch refs
  - Cross-owner docs repeatedly implicated by this tranche:
  - `[retired-token-16]`
  - [retired-token-16]
  - `linked_artifact_id`
  - linked_artifact_id
  - `logical_artifact_id`
  - logical_artifact_id
  - `repo_id?`
  - repo_id?
  - `branch_ref?`
  - branch_ref?
  - `commit_range?`
  - commit_range?
  - `workflow_refs?`
  - workflow_refs?
  - `docker_refs?`
  - docker_refs?
  - `kubernetes_refs?`
  - kubernetes_refs?
  - `linked_artifact_id?`
  - linked_artifact_id?
  - `logical_artifact_id?`
  - logical_artifact_id?
  - attempt-scoped evidence
  - `artifact_kind`
  - artifact_kind
  - `content_ref?`
  - content_ref?
  - `tool_llm_trace`
  - tool_llm_trace
  - `content_ref`
  - content_ref
  - `scheduler_pass:<scheduler_pass_id>`
  - scheduler_pass:<scheduler_pass_id>
  - `open_file`
  - open_file
  - identity-based target:
  - `open_subject`
  - open_subject
  - `subject_id?`
  - subject_id?
  - `target_kind?`
  - target_kind?
  - `route_payload?`
  - route_payload?
  - deprecated-vs-canonical command-family status still cannot be represented in the catalog/matrix/gate contracts.
  - `STATE_FILES.md`
  - STATE_FILES.md
  - slash-command reservation,
  - Cross-owner docs repeatedly implicated by GPT-5.2:
  - `command_arg_contract_ref?`
  - command_arg_contract_ref?
  - `route_target_kind?`
  - route_target_kind?
  - `subject_kind?`
  - subject_kind?
  - `deprecated_alias_for?`
  - deprecated_alias_for?
  - `preconditions?`
  - preconditions?
  - `correlation_passthrough?`
  - correlation_passthrough?
  - Event contracts already have a recognizable alias/migration pattern, but command contracts do not.
  - `issued_at`
  - issued_at
  - `correlation_id`
  - correlation_id
  - subject-open identity
  - Gate/evidence closeout stayed productive:
  - wiring/gate extraction/schema hardening,
  - artifact/run/workflow identity closure,
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `wizard_step`
  - wizard_step
  - `message_id`
  - message_id
  - `wizard_step?`
  - wizard_step?
  - `message_id?`
  - message_id?
  - So the best model is not “two unrelated contracts” and not “one giant contract that does everything.” It is a layered contract family.
  - `range?`
  - range?
  - or `object_kind?` + `object_id?`
  - `workflow_run_id`
  - `range`
  - range
  - These should normally normalize into:
  - `subject_id = doc:<document_id>`
  - subject_id = doc:<document_id>
  - `object_id = <thread_id>`
  - object_id = <thread_id>
  - `object_id = <wizard_id>`
  - object_id = <wizard_id>
  - prefer `object_kind = usage_event`
  - object_kind = usage_event
  - `graph_generation`
  - graph_generation
  - `object_id = <message_id>`
  - object_id = <message_id>
  - `object_id = <id>`
  - object_id = <id>
  - new docs/producers MUST prefer canonical route-target forms
  ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject
  - Keep `active_subview`, filters, compare targets, pinned selections, and similar fields in destination/view-state contracts.
  - active_subview
  - `focus_thread_usage`
  - focus_thread_usage
  - `navigation_wrapper`
  - navigation_wrapper
  - `domain_action`
  - domain_action
  - contracts own canonical route identity
  - `backing_document_id`
  - backing_document_id
  - `last_saved_path`
  - last_saved_path
  - Those fields belong elsewhere:
  - The narrow scope-restoration fields are:
  - The narrow focus-refinement fields are:
  - Good serialized fields
  - Bad serialized fields
  - `object_kind = blocked_episode`
  - object_kind = blocked_episode
  - `focused_run_id = run_id`
  - focused_run_id = run_id
  - `object_id = blocked_sequence`
  - object_id = blocked_sequence
  - It must stay small.
  - `object_kind = usage_event`
  - `agent-rules-context.md` still under-enumerates callers, omits execution-role input, conflicts with Personas/Prompt_Pipeline on bundle ordering, and has weaker disclosure/help contracts than adjacent systems.
  - agent-rules-context.md
  - `project_id = <project_id>`
  - project_id = <project_id>
  - `thread_id = <thread_id>`
  - thread_id = <thread_id>
  - `focused_run_id = <run_id>`
  - focused_run_id = <run_id>
  - `object_id = <attempt_id>`
  - object_id = <attempt_id>
  - `object_id = <blocked_sequence>`
  - object_id = <blocked_sequence>
  - `object_kind = scheduler_pass`
  - object_kind = scheduler_pass
  - `object_id = <scheduler_pass_id>`
  - object_id = <scheduler_pass_id>
  - `object_id = <safe_point_id>`
  - object_id = <safe_point_id>
  - `object_id = <remediation_root_id>`
  - object_id = <remediation_root_id>
  - `object_kind = graph_generation`
  - object_kind = graph_generation
  - `object_id = <graph_generation_id>`
  - object_id = <graph_generation_id>
  - `object_kind = graph_patch`
  - object_kind = graph_patch
  - `object_id = <graph_patch_id>`
  - object_id = <graph_patch_id>
  - `object_id = <worktree_id>`
  - object_id = <worktree_id>
  - `object_id = <lane_id>`
  - object_id = <lane_id>
  - `object_kind = feature_seam`
  - object_kind = feature_seam
  - `object_id = <feature_seam_id>`
  - object_id = <feature_seam_id>
  - `object_kind = work_package`
  - object_kind = work_package
  - `object_id = <work_package_id>`
  - object_id = <work_package_id>
  - `object_id = <concern_id>`
  - object_id = <concern_id>
  - `object_id = <promotion_id>`
  - object_id = <promotion_id>
  - `seams`
  - seams
  - `node_graph`
  - node_graph
  - `object_id = scheduler_pass_id`
  - object_id = scheduler_pass_id
  - `object_id = safe_point_id`
  - object_id = safe_point_id
  - `object_id = remediation_root_id`
  - object_id = remediation_root_id
  - `object_id = attempt_id`
  - object_id = attempt_id
  - Stratum 1: owner docs
  - Treat the routing tranche as structurally closed after the owner-doc contracts are added.
  - subsection `7.2 WiringEntry`
  - 7.2 WiringEntry
  - `handler_location`
  - handler_location
  - `expected_event_types`
  - expected_event_types
  - unknown-command rejection
  - report/evidence refs
  - `workflow_refs`
  - workflow_refs
  - `docker_refs`
  - docker_refs
  - `kubernetes_refs`
  - kubernetes_refs
  - `attempt_record` with scheduler/safe-point/remediation/runtime identity fields
  - they correctly carry blocked/wizard state
  - wizard-blocked keeps wizard-specific clarification/report fields
  - `usage_record` with `[retired-token-10]`
  - usage_record
  - tier-adjacent `evidence_record`
  - `thread_blocked_notice` / `wizard_runtime_state` with `resume_url?`
  - resume_url?
  - exact command-arg mismatches
  - `requested_[retired-token-5]`
  - `effective_[retired-token-5]`
  - effective_[retired-token-5]
  - `requested_platform`
  - requested_platform
  - `effective_platform`
  - effective_platform
  - `requested_model`
  - requested_model
  - `effective_model`
  - effective_model
  - `requested_[retired-token-5]_id`
  - `effective_[retired-token-5]_id`
  - effective_[retired-token-5]_id
  - `worker_provider`
  - worker_provider
  - `worker_model`
  - worker_model
  - `verifier_provider`
  - verifier_provider
  - `verifier_model`
  - verifier_model
  - `request_id`
  - request_id
  - `request_kind = tier_boundary_approval`
  - request_kind = tier_boundary_approval
  - Strong aligned owner:
  - with `request_id` args
  - `PuppetMasterEvent::TierChanged`
  - PuppetMasterEvent::TierChanged
  - `PuppetMasterEvent::IterationStart`
  - PuppetMasterEvent::IterationStart
  - `PuppetMasterEvent::EvidenceStored`
  - PuppetMasterEvent::EvidenceStored
  - `IterationStart`
  - `GateStart`
  - GateStart
  - `GateComplete`
  - GateComplete
  - `EvidenceStored`
  - EvidenceStored
  - Strong owner docs:
  - `hitl_request_id`
  - hitl_request_id
  - Reconcile the base `GraphNode` and `GraphNodeUI` contracts to the later runtime-lineage model.
  - GraphNode
  - GraphNodeUI
  - `Orchestrator_Page.md`
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `3.13` appears twice
  - 3.13
  - `3.14` appears twice
  - 3.14
  - `3.15` appears twice
  - 3.15
  - `DRY_Rules.md` second
  - DRY_Rules.md
  - `Decision_Log.md` third
  - Decision_Log.md
  - `DRY_Rules.md` needs:
  - `Decision_Log.md` needs:
  - `plan_or_tier_default`
  - plan_or_tier_default
  - `Orchestrator_Page.md` needs:
  - mixed-canon owner docs
  - MUST RECONCILE
  - MUST VERIFY
  ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2
  - `Plans/_shards/**`
  - Plans/_shards/**
  - `[retired-token-30]`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/UI_Command_Catalog.md`
  - [retired-token-30]
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - 1. Reconcile owner contracts and schemas first.
  - `[retired-token-30]`, `Plans/storage-plan.md`, `Plans/Decision_Policy.md`, `Plans/FinalGUISpec.md`
  - Plans/Decision_Policy.md
  - The rerun confirms that these were not just vague "help gaps", but concrete missing contracts:
  - pressure-summary field
  - `[retired-token-30]`, `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/Wiring_Matrix.md`, `Plans/Progression_Gates.md`, `Plans/FileManager.md`, `Plans/Project_Output_Artifacts.md`
  - Plans/Crosswalk.md
  - Plans/Wiring_Matrix.md
  - Plans/Progression_Gates.md
  - Plans/FileManager.md
  - Plans/Project_Output_Artifacts.md
  - `Plans/Executor_Protocol.md` already carries a strong `execution_unit_context` owner field block, but `[retired-token-30]` still lacks the exact `### 5.1B Persona/Runtime Snapshot Payload Contract` heading.
  - Plans/Executor_Protocol.md
  - execution_unit_context
  - ### 5.1B Persona/Runtime Snapshot Payload Contract
  - `[retired-token-30]:778-806`
  - [retired-token-30]:778-806
  - `[retired-token-30]:684-692`
  - [retired-token-30]:684-692
  - `[retired-token-30]:1218-1229`
  - [retired-token-30]:1218-1229
  - `[retired-token-30]:461-465`
  - [retired-token-30]:461-465
  - `gap-001` sharpened: the exact owner anchor `### 5.1B Persona/Runtime Snapshot Payload Contract` is still absent, and the explicit `execution_unit_context` required-field list in `[retired-token-30]` still omits `requested_account_binding`, `requested_account_policy`, and `operational_identity` even though the surrounding canon expects requested/effective identity carry-through.
  - gap-001
  - requested_account_binding
  - requested_account_policy
  - operational_identity
  - `[retired-token-30]:557-624`
  - [retired-token-30]:557-624
  - `[retired-token-35]` sharpened: `[retired-token-30]` still points at the missing `Plans/storage-plan.md#[retired-token-29]` anchor, and both `[retired-token-31]` and `[retired-token-32]` still point at the missing `[retired-token-34]` anchor in addition to the already-carried missing `[retired-token-29]` heading.
  - [retired-token-35]
  - Plans/storage-plan.md#[retired-token-29]
  - [retired-token-31]
  - [retired-token-32]
  - [retired-token-34]
  - [retired-token-29]
  - `[retired-token-30]:55-60`
  - [retired-token-30]:55-60
  - `[retired-token-30]:800-807`
  - [retired-token-30]:800-807
  - `[retired-token-30]:50-58`
  - [retired-token-30]:50-58
  - `[retired-token-30]:800-806`
  - [retired-token-30]:800-806
  - `cov-034` / `obl-016` remains unresolved because the ledger requires a canonical concern-lifecycle owner section with explicit `active` / `acknowledged` / `resolved` / `dismissed` semantics, `resolution_kind` coverage including `accepted_risk`, and a concern-action confirmation matrix, but the live docs only expose fragments: `[retired-token-31]:12-13` keeps concern and notification surfaces distinct from health/activity, `Plans/storage-plan.md:294` lists `concern_record.v1`, `Plans/GUI_Rebuild_Requirements_Checklist.md:31` calls for first-class concern lifecycle and lineage, and `[retired-token-30]:649` only names `concern` as a routable object. Exact ledger evidence remains at `working_ledger.md:L3070-L3092`, `working_ledger.md:L3170-L3182`, `working_ledger.md:L5990-L6015`, and `working_ledger.md:L6442-L6490`.
  - cov-034
  - obl-016
  - active
  - acknowledged
  - resolved
  - dismissed
  - resolution_kind
  - accepted_risk
  - `working_ledger.md:L806`
  - working_ledger.md:L806
  - `working_ledger.md:L1030`
  - working_ledger.md:L1030
  - `working_ledger.md:L1035-L1036`
  - working_ledger.md:L1035-L1036
  - `working_ledger.md:L1283-L1290`
  - working_ledger.md:L1283-L1290
  - `working_ledger.md:L1539`
  - working_ledger.md:L1539
  - `working_ledger.md:L3070-L3092`
  - working_ledger.md:L3070-L3092
  - `working_ledger.md:L3170-L3182`
  - working_ledger.md:L3170-L3182
  - `working_ledger.md:L5990-L6015`
  - working_ledger.md:L5990-L6015
  - `working_ledger.md:L6442-L6490`
  - working_ledger.md:L6442-L6490
  - `[retired-token-30]:649`
  - [retired-token-30]:649
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #12 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #13 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #14 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #15 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #16 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #17 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #18 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #19 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #20 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #21 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #22 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #23 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #24 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #25 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #26 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #27 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #28 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #29 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #30 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #31 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #32 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #33 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #34 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #35 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0113
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - safe-point / recovery history
  - recovery / safe-point object where applicable
  - canonical recovery path
  - `Recovery actor default`
  - Recovery actor default
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-001: Owner-first fidelity recovery order

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0129
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Reconcile owner docs in this order:
  - This is not just a missing paragraph. The owner-doc section order already tells us where the contract belongs.
  - Reconciliation order for this tranche should be:
  - Impacted docs and likely owner order
  - Owner-doc-first order still holds:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-001
- Fidelity gap refs: cov-001
- Required fidelity items:
- Exact required item: Apply owner-doc corrections before consumer and mirror cleanup
- Exact required item: Rerun fidelity audit only after owner and consumer corrections are in place
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-001: Owner-first fidelity recovery order` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-001` repair states the exact requirement: Apply owner-doc corrections before consumer and mirror cleanup
- Exact acceptance check: The `cov-001` repair states the exact requirement: Rerun fidelity audit only after owner and consumer corrections are in place
- Exact acceptance check: The `cov-001` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-012: Requested/effective account identity contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0130
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - remains the best place to lock requested/effective identity semantics, but currently stops short of requested concrete-account identity and still embeds tier-era override ownership
  - none of them define one shared persisted trust/freshness contract with action gating and Ledger/direct-record fallback
  - UI contract direction
  - FinalGUISpec has good safety language, but it does not yet appear to define one reusable trust-state UI contract for projection-backed tabs/widgets/panels.
  - Add a shared projection health/trust contract used by:
  - This needs a sharper contract later.
  - No explicit `historical-run mode` contract yet.
  - historical-run mode
  - Recommended contract:
  - requested/effective platform/model/variant/runtime controls
  - Requested/effective direction
  - This is not the same as requested/effective difference in general.
  - two-column requested/effective block
  - hard requirement from plan/tier/surface contract
  - Research Progress - 2026-03-16 - Help System Contract
  - The current help/copy contract is mostly tooltip-oriented.
  - The current dual-copy contract is strong for tooltip/help text, but not yet for a concept-help system.
  - Define a dedicated help-entry contract with a fixed structure and related-concept links.
  - The current Projects page contract is still fairly basic:
  - There is no one explicit cross-surface escalation contract yet.
  - treat scale as a cross-tab contract, not just a graph-tab concern
  - Current graph-scale guidance is much stronger than the scale contract for `Seams`, `Evidence`, `History`, and `Ledger`.
  - Seams
  - Evidence
  - History
  - Ledger
  - Define one shared projection-trust contract with operational state meanings and action thresholds.
  - requested/effective state at a high level
  - requested/effective visibility
  - the runtime/provider docs already provide a solid requested/effective foundation; do not reinvent that vocabulary
  - requested/effective provider/model/persona/account/auth semantics
  - open-file contract
  - Not every route uses every field, but the contract should make these composable rather than reinvented.
  - Requested/effective identity pressure is now showing up across more than persona/runtime docs:
  - graph/page/artifact docs require identity disclosure but do not yet define a shared display/record contract
  - `Runtime_Artifacts_Panel.md` and related surfaces still need a tighter canonical id/trust/freshness contract
  - Runtime_Artifacts_Panel.md
  - Define one shared requested/effective identity disclosure contract reusable across:
  - adaptive phase planning and contract unification create a broader orchestration-mode matrix than older docs assume
  - Contract unification is treated as deterministic, but the conflict-resolution authority/rules are still underdefined for contradictory upstream phase outputs.
  - Dashboard-hosted push widgets still lack a no-active-run/historical-run render contract
  - username rename risk is now a concrete contract inconsistency, not just a theoretical identity concern
  - Research Progress - 2026-03-16 - help system contract and concept-depth cluster
  - Define a three-depth help contract:
  - no clear contract yet separates:
  - `Widget_System.md` still references the wrong multi-account keyspace and does not yet define one shared projection-trust chrome contract
  - Widget_System.md
  - The canonical identity/account contract still fails to enter the dispatch boundary cleanly:
  - Research Progress - 2026-03-16 - GPT-5.3-Codex Contract / Actor Envelope Hotspot
  - The canonical contract layer still has unresolved intra-doc collisions, not just downstream drift:
  - There is still no canonical `project_summary` or equivalent projection contract.
  - project_summary
  - What is still missing is a shared project-attention item contract.
  - Recommended contract direction
  - consumer docs that disclose requested/effective runtime identity
  - requested/effective provider/account identity
  - Conversational docs promise or imply requested/effective runtime truth but still omit account/auth details in their concrete sections.
  - Concern and trust-state escalation still lack a shared conversational/tooling surface contract.
  - Contract Unification Pass still lacks concrete provider/model/persona governance
  - No owner doc yet explicitly defines projection freshness/health fields as a reusable cross-surface contract.
  - own route-payload envelope name only if it becomes a generic cross-cutting contract
  - own requested/effective runtime resolution semantics, including:
  - requested/effective operational identity disclosure
  - requested/effective runtime identity
  - requested/effective runtime state: persona/platform/model snapshot fragments
  - requested/effective runtime identity:
  - older request-local contract: `HITLRequest` with `tier_id`, `tier_type`, and HITL-only `allowed_actions[]` like `approve_continue`
  - HITLRequest
  - tier_id
  - tier_type
  - allowed_actions[]
  - approve_continue
  - GPT-5.4 sharpened several downstream issues from “drift” into concrete contract breaks.
  - `interview-subagent-integration.md` explicitly claims shared runtime alignment and has separate requested/effective interview contract pieces, but still drops the same execution-governance fields in practice:
  - interview-subagent-integration.md
  - no single pass-report contract currently ties those together cleanly
  - richer requested/effective runtime snapshot than provider/model alone
  - requested/effective persona/platform/model snapshot refs
  - execution-unit context owner and minimum field contract
  - `Prompt_Pipeline.md` already owns the canonical effective-resolution contract through the `effective resolution record`. It defines requested/effective persona/platform/model/auth/account fields and the required selection metadata.
  - Prompt_Pipeline.md
  - effective resolution record
  - canonical runtime identity (`requested/effective persona/platform/model`)
  - requested/effective persona/platform/model
  - It owns which requested/effective runtime identity fields exist and what they mean.
  - It owns where requested/effective identity is stored for attempts and current runtime projections.
  - requested/effective model/platform refs or embedded snapshot refs
  - The highest-risk duplication is requested/effective runtime identity being defined three times:
  - The missing contract is not “which fields exist somewhere”; it is the executor-facing statement of which fields are mandatory for correctness at dispatch time versus optional disclosure/overlay fields.
  - required when applicable, but canonical field names must exist in the contract:
  - requested/effective model snapshot ref
  - The executor-facing contract is now mostly a normalization task across existing owner docs, not a greenfield schema invention.
  - define an `OpenArtifact`-style FileManager contract plus required supporting projections,
  - OpenArtifact
  - Research Progress - 2026-03-16 - Runtime-artifact envelope minimum contract
  - Recommended contract rule
  - The missing piece is no longer “we need schemas”; it is “the common envelope contract is underspecified.”
  - Research Progress - 2026-03-16 - FileManager open-by-identity contract split
  - That preview contract is effectively the model FileManager now wants more broadly.
  - Recommended contract split
  - add a second canonical open contract for identity-native objects, e.g.:
  - Split FileManager’s canonical open contract into:
  - the file-open contract in `FinalGUISpec.md`
  - FinalGUISpec.md
  - `OpenFile { path }` is directly incompatible with generated/runtime identity opens; the missing contract is now clearly an open-by-identity router, not a bigger `OpenFile`.
  - OpenFile { path }
  - OpenFile
  - The matrix/schema mismatch is now the same kind of issue as earlier gate/evidence mismatches: prose is promising stronger guarantees than the machine-readable contract can support.
  - This is now the gate-side version of the same drift pattern seen in the matrix/schema seam: the prose is expanding faster than the verifiable contract.
  - shared route-payload contract
  - shared subject-open/open-by-identity contract
  - `FileManager.md` is now the main lagging owner. It still presents `OpenFile { path... }` as the single internal open contract for all callers, which is correct for real workspace files but no longer sufficient for generated/runtime/preview-backed subjects.
  - FileManager.md
  - OpenFile { path... }
  - The storage/UI model already admits identity-native preview subjects, but the universal open contract in `FileManager.md` still assumes everything meaningful is a path.
  - Research Progress - 2026-03-16 - Missing canonical route-target contract in Contracts_V0
  - The remaining mismatch is that this stance is still distributed across planning/UI docs rather than being tied back to one canonical subject-open contract.
  - `Project_Output_Artifacts.md` gets canonical persistence right, but does not itself own the GUI/open-resolution contract.
  - Project_Output_Artifacts.md
  - Link the planning/output docs back to the same canonical route-target / subject-open contract once that owner exists.
  - pass-report finality is still tied to `workflow_run_id` without that key being fully carried through the base artifact-event contract.
  - workflow_run_id
  - Usage/artifact/search/attention all now look like natural consumers of the same route-target contract.
  - `FileManager.md` still legitimately needs a path-based `OpenFile { path... }` contract for real workspace documents.
  - identity-native open contract
  - workspace-path contract only
  - This means many existing ad hoc payloads should collapse into a smaller vocabulary rather than being copied verbatim into the new contract.
  - Allow some object-family-specific anchors, but force them to justify themselves instead of defaulting every special case into the base route contract.
  - `FileSafe.md` still contains silent or under-owned bypass/degradation paths, HTE-only enforcement assumptions, and no complete DAE-side contract for write-scope or remote side-effect enforcement.
  - FileSafe.md
  - mixed mutation semantics inside `lsp` remain unresolved against the `mutation_capable: bool` contract.
  - lsp
  - mutation_capable: bool
  - scroll offsets except when the target contract explicitly depends on them
  - Keep shell/workspace persistence in the shell/storage docs, not in the base route contract.
  - Shell persistence and route identity should cooperate, but they should not collapse into one contract.
  - Define a controlled coarse destination enum/family in the route contract layer.
  - `cmd.panel.switch` currently accepts contextual object refs (`repo_id`, `worktree_id`, `workflow_run_id`, `publish_result_id`, `k8s_ref`) even though the shell model increasingly wants object targeting to route through a shared target contract instead of the panel-switch primitive.
  - cmd.panel.switch
  - repo_id
  - worktree_id
  - publish_result_id
  - k8s_ref
  - Research Progress - 2026-03-17 - Exact shape of the command-normalization contract
  - The normalization contract needs to stay deliberately small.
  - Add a minimal command-classification / normalization contract to the command-definition layer:
  - route contract owns route-target structure
  - The ledger should preserve firm contract language instead of drifting into ambiguous wording.
  - `FinalGUISpec.md`, `FileManager.md`, and `UI_Command_Catalog.md` are also consumers. They should reference the route contract and the primitive boundary instead of restating them.
  - UI_Command_Catalog.md
  - another subject-native preview/open path defined by the subject contract
  - If `OpenSubject` starts carrying panel/tab/shell destination semantics, it will collapse back into a second route contract.
  - OpenSubject
  - `assistant-chat-design.md` and `FinalGUISpec.md` already treat `open_source` as a real action, but the action still lacks a contract owner.
  - assistant-chat-design.md
  - open_source
  - Keep resolver-support metadata out of the contract.
  - `wizard_step` is sub-selection, not base route identity. It belongs in serialized deep-link detail or another narrower subtarget contract.
  - wizard_step
  - Keep destination-local refinements outside the enum and outside the base route contract.
  - internal canonical contract:
  - The contract now has enough shape to define concrete route normalization for the most common user-facing flows.
  - Keep wizard-step focus in serialized anchor detail, not in the base route contract.
  - These examples are the pressure test for the contract.
  - State that invalid route payloads are contract failures, not “best effort” cases.
  - Keep panel-subview and shell-tab identities outside the route base contract.
  - base route contract stays small
  - The route contract does not need to grow extra top-level scope ids for each of these families.
  - Small contract, strong resolver.
  - it still says all open-file actions share that one internal contract and one code path
  - The clean contract placement is:
  - shell/navigation language that still lets deep-link behavior live outside a shared route contract
  - route/open contract consumption
  - canonical target contract
  - The owner docs already settled the canonical requested/effective runtime identity field names:
  - `requested_persona_id` and `effective_persona_id` are still being named in consumer docs even though the owner contract already disallows them as canonical fields.
  - requested_persona_id
  - effective_persona_id
  - it correctly locks canonical requested/effective runtime field names
  - `00-plans-index.md`, `Decision_Log.md`, and `rewrite-tie-in-memo.md` still under-route or fail to record rewrite-era owner decisions around Seams/Packages/Overseers, requested/effective identity scope, operational identity classes, and Crosswalk-based owner precedence.
  - 00-plans-index.md
  - Decision_Log.md
  - rewrite-tie-in-memo.md
  - `Execution contract (recommended)`
  - Execution contract (recommended)
  - Gemini requested/effective auth/account identity is already framed correctly
  - the canonical execution context replacement for `TierContext` still is not named here as a first-class owner contract
  - TierContext
  - worker/verifier identity fields aligned to canonical requested/effective runtime disclosure
  - Cross-doc primitives are referenced in prose but not elevated into **machine-verifiable contract owners**.
  - cases where a doc implies a stronger shared contract should exist but does not clearly own it
  - account-switch / pressure families named but still under-owned at the contract level
  - finding_type: contract
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-012
- Fidelity gap refs: cov-012
- Required fidelity items:
- Exact required item: Add requested_account_id alongside requested_account_policy
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact required item: Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes
- Retired-token handling: exact retired tokens are preserved in packet metadata; live wording omits them.
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-012: Requested/effective account identity contract` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-012` repair states the exact requirement: Add requested_account_id alongside requested_account_policy
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-012` repair states the exact requirement: Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-012` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-014: Shared governance/runtime record envelope

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0131
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Ledger` = exact record inspection
  - Ledger
  - Likely missing project-state record:
  - explicit canonical record schema
  - Candidate shared envelope fields:
  - A review record likely needs:
  - Promotion record should likely include:
  - Recovery record likely needs:
  - record = canonical structured object in Ledger/export/search/routing
  - Export contracts should likely use the record envelope as the manifest backbone.
  - `record export`
  - record export
  - `Record export` for single exact records
  - Record export
  - JSON/JSONL should remain close to canonical record structure
  - absence of a live backing file/worktree should not corrupt the exported record bundle
  - Chat/Interview/Builder/Orchestrator should still share the same effective resolution record and display grammar.
  - dense event bursts should be summarized when collapsed, not force every low-level record into the initial viewport
  - exact record inspection in `Ledger` still needs paging; exactness does not require eager full materialization
  - Good shared payload fields:
  - should remain broadly usable under degraded projections because chronological record slices can fall back closer to canonical events
  - exact ledger browsing should remain available via slice-based record queries even when higher-level projections are unhealthy
  - `Ledger` and record inspectors should be the stable fallback when summary surfaces lose trust
  - What is still missing is a shared envelope pattern that keeps those families structurally compatible.
  - Good base envelope fields:
  - `Ledger` can inspect exact record structure consistently across families without inventing a custom viewer for every new object.
  - The envelope should not collapse these into one generic old-state bit.
  - Some current docs are better at record identity than at record-family consistency.
  - Define a shared record-envelope contract for governance/runtime record families.
  - the envelope should carry enough shared identity for search, export, and inspector routing without flattening family-specific meaning
  - Search and record systems should be able to span these actors without flattening them into one type.
  - exact canonical record(s) with stable ids/refs and schema-aware payloads
  - but export does not itself authorize deletion of the canonical/historical record model
  - What is still missing is one shared destination payload model that can span:
  - Candidate shared payload fields
  - all “Open in …” / “Show in …” actions should become thin wrappers over the shared routing payload
  - safe-point restore creates a new attempt record rather than mutating the old one
  - early envelope is only `{ run_id, seq, type, payload }`
  - { run_id, seq, type, payload }
  - now clearly needs a versioned correlation/event envelope and bridged-provider capability parity
  - but the shared effective-resolution record still only models provider/model/persona/auth/account identity
  - missing shared route-payload schema
  - Add blocked/degraded reason fields and confidence/source hooks to the effective-resolution record.
  - effective-resolution record
  - declares envelope and per-type schema files
  - the runtime-artifact envelope should be attempt-native by default.
  - Extend evidence checks enough to record structured normalization verification instead of only free-form details text.
  - This is a family-contract mismatch, not a request for one giant shared blocked payload.
  - visible labels must bind to the shared runtime recovery commands
  - The effective-resolution record is close to the rewrite direction, but it still lacks the newer identity layers already established elsewhere:
  - Still missing field schemas for `project_summary.v1`, `project_attention_item.v1`, `account_pressure_episode.v1`, `account_switch_event.v1`, and broader governance/runtime record-envelope families.
  - project_summary.v1
  - project_attention_item.v1
  - account_pressure_episode.v1
  - account_switch_event.v1
  - the gap record is now detailed enough that the next stage should be condensation rather than another broad evidence sweep
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-014
- Fidelity gap refs: cov-014
- Required fidelity items:
- Exact required item: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact required item: Keep record objects distinct from artifacts and rendered summaries
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-014: Shared governance/runtime record envelope` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-014` repair states the exact requirement: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact acceptance check: The `cov-014` repair states the exact requirement: Keep record objects distinct from artifacts and rendered summaries
- Exact acceptance check: The `cov-014` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-019: Concern record family definition

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0132
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - 1. **Define the package/seam/lane/promotion object family canonically.**
  - `concern source event/ref`
  - concern source event/ref
  - Concern record should likely carry:
  - may nominate a concern or attach evidence to an existing concern
  - should be able to turn a nominated concern into an accepted canonical concern
  - concern owner for follow-up
  - A concern should be allowed to change owner over time without changing identity.
  - Concern results should be object-first.
  - exact concern record / merge-split lineage -> `Ledger`
  - Ledger
  - Concern result should carry:
  - grouped concern clusters by seam/package and weak-integration category
  - There is no obvious current concern event family or concern record family in the local docs comparable to attempts/blocked/remediation.
  - Add a canonical concern record family and corresponding projection contract.
  - Add explicit concern lineage fields for merge/split/supersession.
  - review findings may nominate or update concerns, but the review record itself should remain distinct from concern records
  - This aligns with earlier concern and blocked-state work:
  - Concern / blocked-owner implication
  - Concern / lane / record density implication
  - concern severity alone should not drive escalation
  - This means many concern changes should remain in-app only unless:
  - Keep concern acknowledgment as a noise-control mechanism, not a blocked-state suppressor.
  - The local docs still do not define a canonical concern record family the way they define:
  - concern replaced by a newer concern or broader canonical object framing
  - but should not be replaced by the concern record
  - seam/package concern rollups
  - concern owner = who is responsible for the concern
  - There is still no obvious concern event family or concern record family in the local docs comparable to attempts/blocked/remediation.
  - if a concern is currently tied to active blocked status, acknowledgment alone must not clear the block
  - Add a canonical account-switch history family:
  - GPT-5.2 reinforced that switch-history remains under-owned as an event family, not just a missing view:
  - GPT-5.2 sharpened that this likely needs a distinct account-health / pressure event or record family instead of overloading auth-state
  - Extend the effective-resolution/runtime snapshot family with:
  - The missing piece is an append-only switch/pressure episode family.
  - Add a canonical append-only event/record family for account-pressure and switching.
  - `provider_accounts.health` is a current-state family, not a durable episode history.
  - provider_accounts.health
  - Notification copy already assumes switch outcomes like `threshold_preemptive_switch` and `no eligible backup`, but there is no canonical durable event family behind that assumption.
  - threshold_preemptive_switch
  - no eligible backup
  - Freshness and degradation are currently discussed together often enough that later docs could collapse them into one field family by accident.
  - The required runtime-artifact schema family is not merely incomplete; it is absent.
  - schema family references
  - The canonical field family is already mostly clear:
  - The concrete field family is already present, but split across three owner docs:
  - one conditional family for blocked/remediation/recovery cases
  - `UI_Command_Catalog.md` is mostly action-oriented, not target-model-oriented. It has strong runtime action IDs, but no generalized subject-open/routing payload family.
  - UI_Command_Catalog.md
  - but add a small canonical navigation/open family for target resolution:
  - That becomes a real limitation if the rewrite adopts a reusable navigation family such as `cmd.nav.open_subject` or route-payload-driven wrappers. The wiring schema cannot currently distinguish:
  - cmd.nav.open_subject
  - canonical wrapper family such as `cmd.nav.*` if adopted
  - cmd.nav.*
  - Recommend against making a large public `cmd.nav.*` family the main catalog-facing answer.
  - potentially another future canonical primitive family
  - point to the canonical primitive family
  - Wrapper normalization metadata is about canonical primitive family, not about serializing the exact route payload.
  - definition of canonical route identity does not
  - `object_kind = concern`
  - object_kind = concern
  - The blocked family is no longer conceptually unclear, but the owner docs still describe its members at different maturity levels.
  - concern record canonical field set
  - concern owner-kind enum
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-019
- Fidelity gap refs: cov-019
- Required fidelity items:
- Exact required item: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact required item: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-019: Concern record family definition` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-019` repair states the exact requirement: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact acceptance check: The `cov-019` repair states the exact requirement: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Exact acceptance check: The `cov-019` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-023: Concern lifecycle and resolution kinds

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0133
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - impacted contract/runtime/storage area: scheduling and blocked/recovery lifecycle.
  - Good owner kinds still look like:
  - Owner kinds already align with prior ledger work:
  - severity, category, owner, lifecycle, resolution_kind
  - unresolved conflict worktrees may need to survive until user resolution
  - What is still missing is a full lifecycle that separates:
  - annotation lifecycle (`open -> addressed -> resolved`)
  - open -> addressed -> resolved
  - Recommended operational-identity kinds:
  - Give startup recovery, counter ceilings/backoff, DAE/jail lifecycle, and attention/blocked escalation one authoritative owner each instead of leaving them to cross-doc inference.
  - lane/worktree lifecycle
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-023
- Fidelity gap refs: cov-023
- Required fidelity items:
- Exact required item: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact required item: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-023: Concern lifecycle and resolution kinds` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-023` repair states the exact requirement: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact acceptance check: The `cov-023` repair states the exact requirement: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Exact acceptance check: The `cov-023` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-029: Concern action policy and authority model

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0134
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - this cluster suggests reconciliation risk now lives in authority semantics as much as in storage/schema drift
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-029
- Fidelity gap refs: cov-029
- Required fidelity items:
- Exact required item: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact required item: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-029: Concern action policy and authority model` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-029` repair states the exact requirement: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact acceptance check: The `cov-029` repair states the exact requirement: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Exact acceptance check: The `cov-029` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-033: Concern linkage to adjacent families

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0135
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - 5. **Graph-local recovery commands vs canonical runtime action families**
  - likely issue: lexicographic dispatch, scored scheduler, blocked overlays, and graph-local retry families still coexist without one canonical model.
  - Compared to attempts/blocked/usage, these families still lack a normalized envelope and linkage story.
  - The docs imply multiple identity families that must stay distinct:
  - preserve run/thread/attempt/worktree linkage
  - The docs have enough adjacent durable-record rigor to make the absence of a concern contract more risky now than earlier.
  - canonical runtime object families
  - `UsageRecord` carries effective-account attribution, but still lacks first-class switch-history and requested-side linkage
  - UsageRecord
  - still needs explicit binding to project-scoped repo/account selection, degraded-trust signaling, and blocked-episode recovery linkage
  - The promised runtime-artifact schemas are absent today, so any linkage that depends on them is currently documentation-only.
  - needs actor-scoped snapshots and durable account-switch/pressure history families
  - Extend runtime-artifact envelopes and `cost_usage` linkage with canonical identity/trust/switch fields or refs.
  - cost_usage
  - The missing storage-owner work is now specific enough to propose concrete families rather than leaving it as a generic gap.
  - package/work-package linkage
  - New supporting docs (`newtools.md`, `assistant-memory-subsystem.md`) are now independently inventing command/event families faster than the canonical owners are registering them.
  - newtools.md
  - assistant-memory-subsystem.md
  - The biggest repeated pattern is that runtime-era concepts already exist in adjacent docs, but the owner docs for registration/verification/routing still lag behind them.
  - runtime-artifact and project-artifact families are staying distinct, but they now need parallel discipline about canonical versus derived identity.
  - Other ref families are mostly record-inspection or provenance links already, but the owner docs still do not state that distinction clearly.
  - `evidence_record` in a section surrounded by tier-keyed families
  - evidence_record
  - canonical key families
  - Strong adjacent owner:
  - Adjacent references checked through existing owner docs:
  - action binding is through canonical runtime action families
  - canonical runtime action families
  - The rerun makes it clear that the concern/action/governance tranche is missing not just "some schemas", but the following concrete families:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-033
- Fidelity gap refs: cov-033
- Required fidelity items:
- Exact required item: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact required item: Allow blocked episodes to reference concerns without replacing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-033: Concern linkage to adjacent families` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-033` repair states the exact requirement: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact acceptance check: The `cov-033` repair states the exact requirement: Allow blocked episodes to reference concerns without replacing concern identity
- Exact acceptance check: The `cov-033` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-036: Promotion classes and gate evidence

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0136
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Good category set likely needs to align with weak-integration groupings plus runtime/governance classes:
  - Recommended executor-facing field classes
  - `run-gates` currently enforces plan-shard freshness, but Progression_Gates does not admit that as part of its gate inventory/status model.
  - run-gates
  - Align evidence schema with the actual gate outputs expected by GATE-011/GATE-012 or reduce gate claims to what the schema can encode today.
  - The doc still uses non-deterministic phrasing in owner-level gate text:
  - route primitive indexing / bridge precedence / gate schema follow-through
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-036
- Fidelity gap refs: cov-036
- Required fidelity items:
- Exact required item: Define lane_to_package, package_to_seam_available, and seam_complete promotions
- Exact required item: Attach exact gate/evidence expectations to each promotion class
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-036: Promotion classes and gate evidence` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-036` repair states the exact requirement: Define lane_to_package, package_to_seam_available, and seam_complete promotions
- Exact acceptance check: The `cov-036` repair states the exact requirement: Attach exact gate/evidence expectations to each promotion class
- Exact acceptance check: The `cov-036` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-075: Historical semantic consistency

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0137
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `focus_mode = live | historical`
  - focus_mode = live | historical
  - replaced by a newer canonical successor for the same semantic slot
  - still needs historical semantics:
  - neither should imply lineage or semantic succession relative to the other unless an explicit relationship exists
  - Exports must preserve historical truth even when live backing objects no longer exist.
  - a project with only historical runs is not inherently degraded or blocked
  - live backing removed; only historical identity and lineage remain
  - Preserve historical lane/worktree records after archive/prune/remove.
  - `historical vs superseded vs revoked`
  - historical vs superseded vs revoked
  - these should remain family-specific, while still allowing cross-family historical overlays where relevant
  - `historical vs superseded vs revoked vs reopened`
  - historical vs superseded vs revoked vs reopened
  - wrapper-to-canonical navigation consistency
  - explicit `focus_mode = live | historical`
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-075
- Fidelity gap refs: cov-075
- Required fidelity items:
- Exact required item: Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed
- Exact required item: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-075: Historical semantic consistency` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-075` repair states the exact requirement: Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed
- Exact acceptance check: The `cov-075` repair states the exact requirement: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Exact acceptance check: The `cov-075` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-164: Coverage blocker concern lifecycle owner section
- Coverage rows: cov-164
- Fidelity gap refs: cov-164
- Required fidelity items:
- Exact required item: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact required item: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-164: Coverage blocker concern lifecycle owner section` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-164` repair states the exact requirement: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact acceptance check: The `cov-164` repair states the exact requirement: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Exact acceptance check: The `cov-164` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-173: Concern owner vs creator vs resolver separation

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0139
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The auto resolver should emit concise but structured reason text.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-173
- Fidelity gap refs: cov-173
- Required fidelity items:
- Exact required item: Separate concern owner_kind/owner_ref from created_by_kind/created_by_ref and resolver authority
- Exact required item: Allow ownership changes without changing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-173: Concern owner vs creator vs resolver separation` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-173` repair states the exact requirement: Separate concern owner_kind/owner_ref from created_by_kind/created_by_ref and resolver authority
- Exact acceptance check: The `cov-173` repair states the exact requirement: Allow ownership changes without changing concern identity
- Exact acceptance check: The `cov-173` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-175: Concern source-event vs record vs projection split

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0140
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - a canonical blocked event can still drive notification even if some projection surfaces are degraded
  - one concern is reframed into multiple more precise concerns; original resolves with `resolution_kind = split`
  - resolution_kind = split
  - but non-remediation concern posture, projection freshness, and degraded-action gating still lack a single contract owner at the canonical layer
  - canonical blocked episodes should outrank derived projection warnings
  - runtime/blocked/wizard objects already use their own record families and projection rows
  - without a canonical replacement execution-context object, downstream docs keep papering over the split locally
  - That means the replacement should not be “TierContext but with more fields.” The cleaner model is a split:
  - The owner split is now explicit enough to stop treating this as a vague “replace `TierContext`” task.
  - TierContext
  - Recommended owner split
  - The provider/account snapshot fields are at risk of becoming a dumping ground for non-provider identity unless this split is made explicit.
  - startup recovery is still split not only by owner doc but by incompatible recovery objects and emission boundaries.
  - blocked-governance attribution (`blocked_owner` or equivalent) is still absent from canonical blocked projection shape even though UX/governance needs it.
  - blocked_owner
  - The conceptual work is largely done; the missing piece is declaring the owner split in the docs that are supposed to stop duplication.
  - The clean owner split is:
  - The owner-doc adoption split is:
  - `thread_blocked_notice` and `wizard_runtime_state` still treat `resume_url?` as stored state alongside canonical blocked metadata, which keeps the navigation transport/model split unresolved.
  - thread_blocked_notice
  - wizard_runtime_state
  - resume_url?
  - That split keeps teaching implementers that `TierChanged` and `UserInteractionRequired` are the primary operational truth even though the runtime/storage owner docs have already moved to canonical event and projection families.
  - TierChanged
  - UserInteractionRequired
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-175
- Fidelity gap refs: cov-175
- Required fidelity items:
- Exact required item: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-175: Concern source-event vs record vs projection split` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-175` repair states the exact requirement: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Exact acceptance check: The `cov-175` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-180: Runtime attribution ownership split

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0141
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Why it matters: tier-boundary approvals, graph-local commands, and blocked-node runtime actions currently coexist as competing canonical mechanisms.
  - Research Progress - 2026-03-16 - Opus Identity / Runtime Batch
  - Runtime ownership is still tier-bound in the identity-facing docs:
  - Replace tier-first aggregation and event anchoring in usage/storage/UI docs with attempt/node/lane/package/seam-aware attribution, leaving tier terms only as compatibility aliases if needed.
  - `runtime blocked/recovery state`
  - runtime blocked/recovery state
  - page state must not silently stand in for runtime state when freshness/trust is insufficient
  - object context menus should show only actions valid for that object's current state, with canonical labels from runtime semantics
  - or perform an authoritative revalidation against canonical/current runtime state before executing
  - `dirty_worktree` and `worktree_conflict` are explicit runtime blocked reasons
  - dirty_worktree
  - worktree_conflict
  - acknowledged concerns can reduce noise, but they must not create fake health when the runtime is still blocked
  - runtime execution stop with canonical recovery metadata
  - seam/package/lane/worktree lineage is not yet treated as first-class storage/usage attribution everywhere it needs to be
  - Rework storage/usage attribution to treat `seam_id`, `package_id`, `lane_id`, and `attempt_id` as first-class where the runtime model now requires them, instead of centering `tier_id`
  - seam_id
  - package_id
  - lane_id
  - attempt_id
  - tier_id
  - `HITLRequest` / blocked-flow thinking still leans on `tier_id` / `tier_type` in places while the runtime increasingly uses `node_id` and attempt-scoped records as the canonical execution anchors.
  - HITLRequest
  - tier_type
  - node_id
  - Canonical field-name and schema ownership drift is sharper than the earlier Gemini pass suggested:
  - Rework usage/storage attribution around lane/package/seam/attempt/remediation dimensions instead of centering `tier_id`.
  - Canonical runtime identity is still split between strong normative prose and weaker tables/consumers:
  - strongest remaining table-vs-prose conflict for runtime identity, usage attribution, and receipt/projection ownership
  - either inline the canonical runtime snapshot fields explicitly
  - graph-local recovery IDs still conflict with the canonical `[retired-token-1] -> cmd.runtime.*` model
  - [retired-token-1] -> cmd.runtime.*
  - app-default plus project override matches the already-emerging inherited/override/effective grammar used elsewhere in settings and runtime disclosure
  - now clearly needs one canonical handoff/runtime object and execution-role ownership
  - still cannot faithfully render the runtime identity bundle or pivot by the newer attempt/receipt/usage anchors
  - now clearly needs explicit transport-vs-upstream identity ownership and full auth/account runtime disclosure
  - still needs requested concrete-account ownership plus explicit role/actor semantics in the canonical runtime record
  - requested concrete-account ownership
  - this leaves side-effect surfaces at risk of collapsing provider-account identity and operational identity into one misleading runtime story
  - Preview `trust_tier` and runtime projection-freshness trust still need distinct vocabularies.
  - trust_tier
  - this leaves blocked overlays unable to explain who/what would have executed the side effect under the final runtime identity model
  - needs immediate correction of canonical/session identity ownership
  - Add operational-identity blocks to runtime records where side-effectful or externally-scoped actions matter.
  - `account_switch_reason` on runtime snapshots
  - account_switch_reason
  - runtime-artifact payload ownership is still split across docs without an actually-populated canonical schema family
  - Replace or wrap `TierContext` with a node-native execution context carrying full canonical runtime identity.
  - TierContext
  - need a consolidation pass as the eventual runtime owner for:
  - The cross-cutting canonical runtime fields already exist elsewhere:
  - `[retired-token-2]` aligns with the newer runtime model:
  - [retired-token-2]
  - Move approval anchoring onto canonical runtime identity:
  - `FinalGUISpec.md` still has no true Orchestrator-page owner section, still leaves Dashboard/Orchestrator operational surfaces identity-thin, still conflicts with `[retired-token-2]` on slash-command canon, and still mixes `restore point` language with runtime safe-point recovery.
  - FinalGUISpec.md
  - restore point
  - runtime identity looks declared but is not actually materialized by its own constructor/coordination path.
  - Several docs still claim to align with canonical runtime records while silently dropping auth/account/role fields that those records already own elsewhere.
  - Contribute(PR) still needs isolated runtime execution even if the user-facing PR branch stays singular.
  - still mismatches `worktree_id` ownership, base-branch ownership, and canonical blocked-emitter semantics.
  - worktree_id
  - `persona_override_owner_id` still allows `tier_id`-style ownership in shared runtime docs, while wizard/interview are simultaneously trying to align with newer non-tier execution semantics.
  - persona_override_owner_id
  - Extend wizard/interview handoff payloads so they can carry the upstream subset of canonical runtime identity:
  - active coordination and context construction still cannot be trusted as canonical runtime identity.
  - The same owner docs still claim both file-based canon and event-sourced canon for runtime coordination/audit.
  - Add the upstream subset of canonical runtime identity to pass reports when a provider/model actually executed the pass:
  - this makes it unclear where authoritative schema registration and projector ownership actually live
  - clear schema ownership boundary
  - canonical execution-context replacement / `TierContext` successor ownership
  - `blocked_sequence` should be owned by the runtime scheduler/executor layer, not by UI/HITL/chat/storage.
  - blocked_sequence
  - canonical runtime action routing
  - now has multiple ghost-ID dependents and remains the weak link for command-family ownership.
  - Move all requested/effective runtime identity field definitions back behind the owner split:
  - If `TierContext` survives at all, it should survive as a derived selection/view helper, not as the thing that owns canonical runtime identity.
  - `Runtime_Artifacts_Panel.md` is stronger about canonical runtime identity, but its canonical ID set is still artifact-centric:
  - Runtime_Artifacts_Panel.md
  - every side-effect-bearing or evidence-bearing runtime object should be able to answer:
  - `attempt_id` remains the canonical local runtime execution anchor.
  - local runtime anchor = `attempt_id`
  - `logical_artifact_id` and `linked_artifact_id` are lineage/navigation helpers, not replacements for runtime identity.
  - logical_artifact_id
  - linked_artifact_id
  - `cmd.runtime.open_attempt_details`
  - cmd.runtime.open_attempt_details
  - `cmd.runtime.open_queue_analysis`
  - cmd.runtime.open_queue_analysis
  - `cmd.runtime.open_remediation_lineage`
  - cmd.runtime.open_remediation_lineage
  - `cmd.runtime.open_safe_point_history`
  - cmd.runtime.open_safe_point_history
  - Command/wiring ownership tightened further:
  - Gate/evidence integrity still is not caught up to the runtime model:
  - The `[retired-token-1]` and stale/degraded revalidation issues are not just runtime concerns; they also need a verification home.
  - [retired-token-1]
  - Command/event ownership tightened at the end:
  - Runtime-governance docs still lack a few critical ownership fields/rules (startup recovery handshake, blocked-owner attribution, DAE restart/intercept model).
  - startup/blocked/DAE governance ownership.
  - The existing `cmd.runtime.*` consolidation shows a related but different pattern:
  - cmd.runtime.*
  - `Skills_System.md` still has unresolved HTE/DAE runtime delivery mechanics, bundling-off ambiguity, bundled-skill compaction loss, actor-scope ambiguity for subagents/rotated runs, and provider-affinity ambiguity for `.claude/` discovery roots.
  - Skills_System.md
  - .claude/
  - The rewrite still lacks clean owner boundaries for several cross-cutting areas: runtime identity invariants, safe-point cleanup ordering, OpenCode server/session limits, project/session browser ownership, attention-center ownership, runtime-recovery command family coverage, and plugin/skill/formatter runtime safety.
  - Current docs still sometimes imply that scoped runtime identities need bespoke top-level route fields.
  - resume/retry controls must map to canonical runtime actions
  - thread blocked notices stay as rendered/persisted consumer state, not canonical blocked ownership
  - The result is that node-first routing and attempt-native runtime identity still cannot flow cleanly through Usage and Evidence without compatibility translation.
  - later runtime recovery / canonical-record addenda
  - Keep any graph-local display structs derived from the canonical runtime snapshot rather than naming parallel canonical fields.
  - Reconcile owner docs so canonical runtime wording is graph/node/package/seam/lane aligned rather than tier-aligned.
  - canonical runtime commands use:
  - canonical runtime actions
  - `decline` -> `cmd.runtime.decline` -> `{ run_id, node_id, blocked_sequence, attempt_id? }`
  - decline
  - cmd.runtime.decline
  - { run_id, node_id, blocked_sequence, attempt_id? }
  - The canonical runtime action model has already made both versions obsolete.
  - newer canonical runtime records and projections
  - The owner docs already provide a stronger canonical runtime source set:
  - Keep any surviving tier labels explicitly as derived display/grouping metadata, not as the core runtime identity shape.
  - worker/runtime detail should key from runtime identity, not only active-tier heuristics
  - Runtime identity and recovery semantics sharpened again:
  - `Media_Generation_and_Capabilities.md` and `OpenCode_Coverage_Matrix.md` both show that caller-scoped identity and transient runtime capability state still lack proper request/event surfaces.
  - Media_Generation_and_Capabilities.md
  - OpenCode_Coverage_Matrix.md
  - Research Progress - 2026-03-17 - owner-contract seam: Contracts_V0 runtime identity, blocked identity, route/open ownership
  - Research Progress - 2026-03-17 - owner-contract seam: storage-plan mixed runtime eras
  - The owner doc says runtime identity is canonical, while still anchoring key override and selection concepts to `tier`.
  - tier
  - The runtime identity model across the rewrite now needs more than Persona/model/account disclosure. It also needs execution-role and operational-identity disclosure, and this owner doc has not caught up yet.
  - `[retired-token-2]` now has a direct same-file contradiction between graph-HITL commands and canonical runtime recovery commands.
  - Cluster C - Identity / attribution / owner-doc transfer misses
  - `[retired-token-6]` downgraded: `[retired-token-7]` and `[retired-token-8]` are no longer kept in the unresolved exact-missing list; the remaining live defect is the skeletal `[retired-token-4]` payload, missing usage observability carry-through for `[retired-token-5]`, missing `[retired-token-3]` ownership, and the stale tuple / stale verdict survivors.
  - [retired-token-6]
  - [retired-token-7]
  - [retired-token-8]
  - [retired-token-4]
  - [retired-token-5]
  - [retired-token-3]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-180
- Fidelity gap refs: cov-180
- Required fidelity items:
- Exact required item: Let Contracts_V0 own cross-family attribution packet shape
- Exact required item: Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-180: Runtime attribution ownership split` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-180` repair states the exact requirement: Let Contracts_V0 own cross-family attribution packet shape
- Exact acceptance check: The `cov-180` repair states the exact requirement: Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins
- Exact acceptance check: The `cov-180` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-186: Approval scope key and approver identity

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0142
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `ActiveAgent`, crew structs, and coordination payloads are still tier-keyed and therefore inherit the same problem. They should key on canonical execution refs first, with tier/package/seam labels only as secondary metadata when still useful.
  - ActiveAgent
  - Add durable approver identity fields to approval/rejection records/events so audit/history can explain who approved or declined, not just that it happened.
  - Several downstream docs now fail on exact key or field names rather than broad conceptual drift.
  - Worktree/source-control docs still lack one agreed durable identity key (`worktree_id` vs tier/path) and one agreed base-branch owner.
  - worktree_id
  - Ledger with event identity in scope
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-186
- Fidelity gap refs: cov-186
- Required fidelity items:
- Exact required item: Separate blocked-episode approval scope from session-wide policy scope
- Exact required item: Persist durable approver identity fields on approval and rejection events
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-186: Approval scope key and approver identity` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-186` repair states the exact requirement: Separate blocked-episode approval scope from session-wide policy scope
- Exact acceptance check: The `cov-186` repair states the exact requirement: Persist durable approver identity fields on approval and rejection events
- Exact acceptance check: The `cov-186` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Fidelity recovery cov-193: Concern update heuristics

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0143
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - But those must be explicit metadata, not inferred by heuristics.
  - workspace heuristics (`workspace`, language/domain/framework detection)
  - workspace
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-193
- Fidelity gap refs: cov-193
- Required fidelity items:
- Exact required item: Use source/scope/category/lineage-aware heuristics when deciding whether repeated sightings update an existing concern or create a new one
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-193: Concern update heuristics` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-193` repair states the exact requirement: Use source/scope/category/lineage-aware heuristics when deciding whether repeated sightings update an existing concern or create a new one
- Exact acceptance check: The `cov-193` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-199: Route/open compatibility-only fallback marking

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0144
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - canonical fallback
  - fallback reason when the preferred candidate is not the effective one
  - deprecated `allowed_actions[]` is compatibility-only and MUST NOT appear in new canonical schemas
  ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject
  - allowed_actions[]
  - Base route/open primitives landed, but missing:
  - Route/open auditing must stay focused on **refinement omissions**, not on re-claiming absence of primitives that already landed.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-199
- Fidelity gap refs: cov-199
- Required fidelity items:
- Exact required item: Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts
- Exact required item: Keep ref-family split explicit when route/open normalization is transferred
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-199: Route/open compatibility-only fallback marking` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-199` repair states the exact requirement: Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts
- Exact acceptance check: The `cov-199` repair states the exact requirement: Keep ref-family split explicit when route/open normalization is transferred
- Exact acceptance check: The `cov-199` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Recommended minimum concern record shape

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0145
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Object-first search targets should include at minimum:
  - Minimum runtime-facing fields still align with earlier findings:
  - Recommended lane-oriented states
  - Recommended `project_summary` fields:
  - project_summary
  - Recommended `project_attention_item` fields:
  - project_attention_item
  - Recommended minimum route payload fields:
  - Recommended operational-identity shape:
  - Recommended fields
  - Recommended supporting fields:
  - Minimum indexed fields should include:
  - Minimum `worktree_record` fields:
  - worktree_record
  - Recommended derived `decomposition_context` / `selection_context`
  - decomposition_context
  - selection_context
  - 5. Optional but strongly recommended disclosure fields
  - Recommended minimum contract additions
  - Strongly recommended execution/runtime fields
  - Recommended runtime-artifact envelope minimum fields
  - Recommended command-family responsibilities
  - Recommended minimum field set
  - Some current surfaces still behave as if every target kind needs its own bespoke payload shape.
  - The canonical minimum is:
  - Downstream docs already imply several subject-open intents, but there is still no owner contract that states the minimum shape directly.
  - The canonical minimum field set is:
  - The evidence schema cannot carry structured normalization proof, so GATE-010 can only verify flat dispatch behavior unless its proof shape expands.
  - Define a cross-family blocked minimum for canonical blocked objects:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-207
- Fidelity gap refs: cov-207
- Required fidelity items:
- Exact required item: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact required item: Keep `blocking_effect` explicitly separate from `severity`
- Acceptance checks represented:
- Exact acceptance check: The heading `### Recommended minimum concern record shape` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-207` repair states the exact requirement: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact acceptance check: The `cov-207` repair states the exact requirement: Keep `blocking_effect` explicitly separate from `severity`
- Exact acceptance check: The `cov-207` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

### Concern ownership / authority direction

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0124
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Concerns and blocked ownership should feed escalation, but not every concern should become a system notification.
  - Canonical-validation direction
  - Identity-model direction
  - escalation should be based on concern severity + execution impact + persistence + ownership
  - `[retired-token-2]` still sits in a three-way ownership contradiction with `[retired-token-1]` and `[retired-token-3]` over payload schema authority; it still points at missing schema files and still lacks a concrete artifact-projection key family in `[retired-token-3]`.
  - [retired-token-2]
  - [retired-token-1]
  - [retired-token-3]
  - The later sections in the same doc already show the stronger direction, so this is a local reconciliation problem rather than a missing concept.
  - Still preserves `TierContext`-era live canon rather than fully reflecting `execution_unit_context` direction.
  - TierContext
  - execution_unit_context
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-210
- Fidelity gap refs: cov-210
- Required fidelity items:
- Exact required item: Define concern owner surfaces across `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`
- Exact required item: Treat `concern resolver` as distinct from owner/source roles
- Exact required item: Allow concern ownership reassignment without changing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Concern ownership / authority direction` exists in `Plans/Contracts_V0.md`.
- Exact acceptance check: The `cov-210` repair states the exact requirement: Define concern owner surfaces across `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`
- Exact acceptance check: The `cov-210` repair states the exact requirement: Treat `concern resolver` as distinct from owner/source roles
- Exact acceptance check: The `cov-210` repair states the exact requirement: Allow concern ownership reassignment without changing concern identity
- Exact acceptance check: The `cov-210` repair is in the owner section for `Plans/Contracts_V0.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- CANONICAL CONTRACTS

Purpose:
- This file is the single source of truth for core, cross-cutting **contracts** referenced by other plan documents.
- Keep it DRY: define only stable envelopes + type contracts; other plans reference these contracts instead of redefining.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- Use "Puppet Master" naming consistently throughout this document.
-->

## 0. Scope
This document defines the canonical contracts for:
- Persisted event envelopes (`EventRecord`, schema `pm.event.v0`)
- A minimal compatibility envelope (`EventEnvelopeV1`) used by early-phase writers/readers
- Provider normalized stream (CLI-bridged, server-bridged, and direct-provider transports)
- UI commands (`UICommand`)
- Auth state + events (`AuthState`, `AuthPolicy`, `AuthEvent`)

Other plans MUST reference these contracts rather than redefining them.

ContractRef: ContractName:Plans/Contracts_V0.md

## Cross-surface runtime, concern, and route/open contracts

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0112
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Bridged-provider contracts remain materially weaker than the canonical runtime identity contract:
  - any approval path whose allowed actions are defined by runtime blocked/HITL contracts rather than generic UI choice
  - Bind high-consequence runtime actions to canonical blocked/HITL command contracts where appropriate instead of ad hoc UI confirms.
  - Replace worker/verifier/page contracts with canonical runtime snapshot refs or inline canonical runtime bundles instead of ad hoc persona/provider/model strings.
  - still the broadest consumer doc and still missing concern, trust, switch/pressure, and rewrite-era widget/tab contracts
  - still needs producer identity, trust/provenance, and stronger cross-surface linkage contracts
  - interview runtime contracts still stop at persona/platform/model-level identity and still omit auth/account/switch identity
  - Wizard/Builder handoff contracts are still incomplete for runtime identity and worktree policy:
  - the replacement should inherit existing canonical runtime snapshot contracts, not create a parallel runtime-resolution schema
  - still contains concrete runtime structs that cannot carry the rewrite’s full execution identity or concern model.
  - `UI_Wiring_Rules.md` still cannot express dispatcher preconditions such as freshness/health gating, permission gating, dynamic `allowed_action_ids[]`, or mutation safety tiers; GATE-010 currently can’t verify the contracts the runtime docs now rely on.
  - UI_Wiring_Rules.md
  - allowed_action_ids[]
  - Canonical runtime actions and states exist upstream, but dispatcher, matrix, and gate contracts still do not express the runtime checks needed to enforce them safely.
  - `MiscPlan.md` still conflicts with safe-point cleanup ordering, remediation lineage preservation, attempt-scoped evidence retention, and also carries orphan cleanup/crew runtime contracts not owned anywhere else.
  - MiscPlan.md
  - Demote `tier_id` from cross-surface navigation identity and realign usage consumers around runtime object routing plus canonical usage-event identity.
  - tier_id
  - Research Progress - 2026-03-17 - Exact owner-doc insertion points for route/open contracts
  - The document is still missing the canonical route/open contracts entirely.
  - `WiringEntry` must consume route/open contracts, not become their surrogate owner.
  - WiringEntry
  - route/open contracts missing by name
  - These docs should be treated as mirrors and summaries, not as places to re-own runtime or surface contracts.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This section is the single canonical owner for runtime identity, concern/episode lifecycle, route_target primitives, and OpenSubject routing semantics across all surfaces and execution contexts.

### Fidelity recovery order
- Apply owner-doc corrections before consumer and mirror cleanup.
- Rerun fidelity audit only after owner and consumer corrections are in place.
- The recovery sequence in this owner section is strict: canonical owner repairs first, dependent consumer updates second, mirror cleanup third, and fidelity rerun evidence last.

### Shared governance and runtime record envelope

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0148
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Research Progress - 2026-03-16 - Shared Conversational-Actor / Runtime Identity Boundary
  - requested/effective provider/model/effort/persona/auth/account and selection reason are already shared runtime concepts
  - This is useful because it means the shared runtime contract should stay broad.
  - Add a canonical actor envelope shared by runtime records, provider-account snapshots, receipts, Usage pivots, and conversational actor telemetry.
  - §6.5 defines a rich runtime identity record with auth/account/switch fields
  - now clearly needs a binding path from operational identity and role-scoped pools into the shared runtime grammar
  - Add an OperationalIdentity block or equivalent disclosure layer to the shared runtime identity grammar.
  - now clearly needs version governance for new actor/account/trust categories or fields
  - needs explicit role/actor and blocked/degraded disclosure in the canonical runtime record
  - Operational identities are declared but still absent from shared runtime snapshots.
  - `tier_runtime_record` or successor graph-owned runtime record
  - tier_runtime_record
  - Conversational actor docs still lag the shared runtime identity model in concrete ways:
  - package/seam governance identity
  - package/seam overseers are governance actors, not the scheduler
  - `chain-wizard-flexibility.md` still leaves CUP without requested/effective runtime governance, still has no `wizard_id -> run_id` lineage bridge, and still carries the actively misleading “no change to tier/subtask execution” claim.
  - chain-wizard-flexibility.md
  - wizard_id -> run_id
  - still claims shared runtime alignment while dropping auth/account identity and reintroducing pseudo-tier execution keys.
  - Wizard/interview docs are increasingly explicit about lineage and blocked-state handling, but their concrete handoff payloads still stop short of the shared runtime identity model.
  - the upstream actors are not orchestration nodes, but they still need shared runtime identity semantics when handing off into execution
  - if there is no concrete attempt, the envelope should still carry the strongest available runtime anchor:
  - Gate/evidence schema mismatch is now a first-class governance defect, not just a tooling gap.
  - clear relationship between runtime scheduler/execution roles and the newer package/seam overseer governance model
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Define one shared record envelope with canonical lineage refs and artifact/evidence refs.
- Keep record objects distinct from artifacts and rendered summaries.
- Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed.
- Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict.
- Share one attribution family across tool events, runtime artifacts, receipts, and usage records.
- Carry run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity fields.
- Let Contracts_V0 own cross-family attribution packet shape.
- Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins.

### Requested/effective account and execution identity

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0146
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - why impacted: still the main SCM/worktree execution owner.
  - what likely new model pressure is: first-class seam/package/lane nodes, promotion-class badges, requested/effective execution identity, blocked/recovery action unification.
  - The requested/effective execution identity model is still strongest on the effective side and still weak on the requested side:
  - the docs have not been rewritten around node/package/seam/lane-aware execution identity
  - but remain upstream conversational/document-production actors, not package/seam/node execution objects
  - This is especially important when usage/account pressure turns into a real blocked execution condition.
  - `ContributePr` explicitly disables tier worktrees and forces single-branch execution
  - ContributePr
  - `Permissions_System.md` still scopes `always` approvals and reject-cascades to the whole session, which is unsafe for multi-lane/multi-actor execution
  - Permissions_System.md
  - always
  - package/seam/corroboration/concern-aware execution hooks
  - A specific structural problem is emerging: execution identity is spread across incompatible keys:
  - `attempt_record` and blocked/runtime records hold canonical execution truth
  - attempt_record
  - `effective state` is still too broad relative to requested/effective execution identity.
  - effective state
  - `MUST RECONCILE` docs are not primary execution owners, but they will drift or mislead if omitted from the packet.
  - MUST RECONCILE
  ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Permissions_System.md, Primitive:RuntimeIdentity
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Required rules:
- Add requested_account_id alongside requested_account_policy
- Add requested_account_binding and govern provider_account_id as subordinate provider-native metadata
- Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes
- Model requested_account_id separately from requested_account_policy
- Add requested_account_binding with none/preferred/required semantics and display Requested account / Requested binding / Effective account / Switch reason
- Carry execution_role plus requested/effective operational identity in shared runtime identity
- Project them into effective-resolution, attempt, usage, and inspector surfaces

Canonical field split:
- `requested_account_id` is the explicit requested account anchor; `requested_account_policy` remains the policy selector used before effective resolution and MUST NOT replace the concrete requested account field.
  ContractRef: Primitive:RuntimeIdentity
  ContractRef: ContractName:Plans/Contracts_V0.md
- `requested_account_binding` is the canonical binding posture with `none | preferred | required` semantics.
- `effective_account_id` and `effective_provider_identity` disclose the resolved runtime account without rewriting the requested selection.
- `provider_account_id` is retired as canonical/live identity vocabulary and may survive only as subordinate provider-native metadata inside bridged-provider envelopes.

Projection/display rules:
- Runtime, effective-resolution, permission, attempt, usage, and inspector surfaces all project Requested account / Requested binding / Effective account / Switch reason from the same shared runtime identity snapshot.
- Shared runtime identity carries `execution_role` together with requested/effective operational identity so downstream audit, approval, and attribution joins keep the same intent-versus-effective split.
- Bridged-provider and permission envelopes preserve the same requested/effective account pair instead of collapsing them into provider-native identifiers or policy-only selectors.

### Concern record family, lifecycle, and deferred visibility

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0125
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `concern record` = canonical durable object with stable identity and lifecycle
  - concern record
  - palette visibility must not silently downgrade confirmation strength
  - The other major missing family is worktree/lane lifecycle state:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request.
- Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata.
- Use active/acknowledged/resolved/dismissed as concern lifecycle states.
- Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values.
- Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions.
- Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions.
- Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns.
- Allow blocked episodes to reference concerns without replacing concern identity.
- Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics.
- Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section.
- Separate concern owner_kind/owner_ref from created_by_kind/created_by_ref and resolver authority.
- Allow ownership changes without changing concern identity.
- Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers.
- Use source/scope/category/lineage-aware heuristics when deciding whether repeated sightings update an existing concern or create a new one.
- Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract.
- Keep `blocking_effect` explicitly separate from `severity`.
- Define concern owner surfaces across `Runtime`, `Package Overseer`, `Seam Overseer`, `Corroboration`, `Graph Patch`, `Recovery`, `User`, and `External Resource`.
- Treat `concern resolver` as distinct from owner/source roles.
- Allow concern ownership reassignment without changing concern identity.

### route_target, OpenSubject, and command normalization

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0152
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - still lag behind command/catalog normalization and still encode compatibility-era identity/action fields
  - `OpenSubject { subject_id, target_group?, open_mode?, location? }`
  - OpenSubject { subject_id, target_group?, open_mode?, location? }
  - uses `OpenSubject { subject_id, target_group?, open_mode?, location? }`
  - Proceed to the final `GPT-5.3-Codex` pass because GPT-5.2 still found concrete mechanical deltas, especially around extraction hazards, event naming, gate-schema mismatch, and missing final command IDs.
  - GPT-5.3-Codex
  - Reuse the event-alias and recovery-command migration style as the template for navigation normalization.
  - Move object-targeting payload semantics out of `cmd.panel.switch` and into canonical route-consuming commands or normalized `route_target` wrappers.
  - cmd.panel.switch
  - route_target
  - optional `normalization { kind, normalizes_to_contract? | alias_of_command_id? }`
  - normalization { kind, normalizes_to_contract? | alias_of_command_id? }
  - `OpenSubject(subject_id = doc:...)` resolves to workspace-backed source opening
  - OpenSubject(subject_id = doc:...)
  - one command/wiring normalization gap
  - The clean fix is catalog-owned normalization metadata consumed by wiring/gates, not a second routing schema inside the matrix.
  - promoted-shell command-family completeness and persistence-scope normalization second
  - evidence structures that can encode normalization and alias failures
  - insert `route_target` and `OpenSubject` into the UI-command/navigation section
  - OpenSubject
  - `Wiring_Matrix.md` still cannot structurally express wrapper/canonical normalization or route-aware fields
  - Wiring_Matrix.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Define lane_to_package, package_to_seam_available, and seam_complete promotions.
- Attach exact gate/evidence expectations to each promotion class.
- Use one shared routing/deep-link payload for search, palette, widgets, recovery links, and cross-surface pivots.
- Treat resume_url as serialized transport of that route payload.
- Let Contracts_V0 own canonical route_target and OpenSubject contracts.
- Keep Crosswalk limited to primitive boundary ownership and FileManager OpenFile narrow and path-based.
- Carry selector precedence, reject rules, closed tab_id vocabulary, scoped resolver rules, route examples, ref-family split, and resume_url demotion into live route/open docs.
- Carry Primitive:RouteTarget/OpenSubject and wrapper/canonical normalization into crosswalk and wiring docs.
- Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts.
- Keep ref-family split explicit when route/open normalization is transferred.

### Blocked episode, approval scope, and compatibility fallback

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0122
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - why a lane is blocked, weakly integrated, or cleanup-eligible
  - `Attention`: `none | attention_required | blocked | degraded`
  - Attention
  - none | attention_required | blocked | degraded
  - show one `primary attention reason` / `primary blocked reason`
  - primary attention reason
  - primary blocked reason
  - run-graph/node blocked badges
  - show active warnings / attention / blocked states
  - real blocked states should remain represented until underlying truth changes
  - `attention_required` and `blocked` must remain distinct everywhere
  - attention_required
  - blocked
  - approve multiple HITL/runtime blocked actions with one generic confirm
  - wizard/interview blocked state is explicit and persistent, not a soft conversational inconvenience
  - thread badges preserve highest severity and blocked counts
  - direct user-action path when the blocked owner or flow genuinely needs user input
  - `Blocked: waiting on user approval`
  - Blocked: waiting on user approval
  - misroute blocked episodes to the wrong surface
  - Allow quiet windows for advisory/pressure warnings, not for canonical blocked episodes that still require action.
  - `attention_required` vs `blocked`
  - Interaction with notifications and blocked routing
  - Introduce a versioned replacement for `tier_boundary` such as `governance_boundary`, keeping compatibility aliases only as an explicit migration strategy.
  - tier_boundary
  - governance_boundary
  - title bar shows current project context plus badges for background activity / blocked items / unsaved shell state
  - project cards should not just say “blocked”
  - they should identify the primary blocked owner / attention owner when one exists
  - `attention_required` and `blocked` must remain distinct
  - trust state may downgrade confidence, but should not automatically manufacture a blocked state
  - some talk about blocked items
  - `attention_state` (`none | advisory | attention_required | blocked`)
  - attention_state
  - none | advisory | attention_required | blocked
  - `health_state` (`healthy | degraded | blocked`)
  - health_state
  - healthy | degraded | blocked
  - canonical active blocked episodes win over derived warnings
  - `blocked` outranks `attention_required`
  - a project can have background activity and still not be blocked
  - `attention center` is the canonical shell surface for background, blocked, or action-needed items outside the current active project/thread
  - attention center
  - canonical blocked episodes, approval waits, and persisted thread/wizard states can drive strong routing
  - `severity` (`advisory | attention_required | blocked`)
  - severity
  - advisory | attention_required | blocked
  - rows remain object-linked; they do not collapse into one synthetic “project blocked” blob
  - Permissions still use tier-boundary wording and still cannot explain which effective account/identity a blocked action would have used.
  - it must not invent synthetic blocked states unsupported by canonical owners
  - Approval and blocked records still cannot explain which effective account/identity would have executed the action.
  - Keep any replacement for `TierContext` as a compatibility wrapper at most:
  - TierContext
  - newer model treats approval as a blocked episode attached to canonical runtime execution
  - what exact blocked episode is being approved
  - one blocked episode approval
  - pre-attempt blocked episodes must not invent an `attempt_id`; `blocked_sequence` is already the cleaner anchor
  - attempt_id
  - blocked_sequence
  - Research Progress - 2026-03-16 - Blocked episode ownership and startup-recovery handshake
  - no doc clearly says when a new blocked episode starts versus an existing one being updated
  - A blocked episode is the canonical unit for:
  - Updating metadata for the same unresolved blocked prerequisite must retain the same `blocked_sequence`.
  - the prior blocked episode was resolved/unblocked and a later distinct blocked condition occurs, or
  - Approval commands should route by blocked episode identity; any retained `request_id` is lookup metadata, not the canonical recovery target.
  - request_id
  - That startup-recovery pass does not mint new blocked episodes by itself; it rehydrates existing unresolved episodes and reevaluates runnable work.
  - Update storage/event docs so approval records and blocked projections are consistent on:
  - what is the latest active attempt or blocked episode pointer for this grouping
  - Treat timestamp/run/thread fallback routing as compatibility behavior only when canonical bridge refs are absent.
  - attempt-scoped evidence remains blocked not just by missing filters but by storage/UI keying that is still tier/node-centric instead of attempt-centric.
  - Once normalized, Dashboard, thread badges, and blocked notices should stop behaving like separate navigation systems.
  - `blocked_sequence` has canonical identity meaning, but current docs still tend to route blocked work through node/attempt views instead of treating blocked episodes as their own targetable object.
  - Keep wizard/thread blocked records on:
  - The docs do not yet say clearly which blocked fields are cross-family minimums versus family-local additions.
  - Research Progress - 2026-03-17 - Approval identity still splits between blocked episodes and HITL requests
  - or a blocked/runtime episode
  - graph/orchestrator live-status bindings that bypass canonical blocked projections
  - `hitl_action(node_id, action, rationale)` callback rather than a runtime-native blocked action target
  - hitl_action(node_id, action, rationale)
  - Research Progress - 2026-03-17 - owner-contract seam: human-in-the-loop blocked identity collapse
  - lineage-preserving persistence through blocked records
  - Any surviving `request_id` wording belongs only in compatibility or lineage notes.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Transfer execution_role, requested_account_id, operational_identity, account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy into owner and consumer docs.
- Carry usage switch-history and usage execution-role follow-through.
- Separate blocked-episode approval scope from session-wide policy scope.
- Persist durable approver identity fields on approval and rejection events.
- Approval lineage stays keyed to blocked-episode identity (`run_id`, `node_id`, `blocked_sequence`, `attempt_id?`) instead of being inferred from session-wide policy state.

## 1. Events (persisted)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0107
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `WorktreeGitImprovement.md` still lacks a durable `worktree_record` / `worktree_projection` family, still has no explicit precedence rule between persisted runtime lineage and filesystem rediscovery, and still treats git-hook blocks and state files as if they could substitute for canonical blocked/runtime events.
  - WorktreeGitImprovement.md
  - worktree_record
  - worktree_projection
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 1.1 Assistant worktree seglog events
Assistant worktree seglog events keep assistant-worktree lifecycle local while pointing shared record ownership back to canonical storage.

Rules:
- Authoritative storage ownership stays in `Plans/storage-plan.md`.
- This section links to `Plans/storage-plan.md#Canonical records` for canonical record families instead of restating them locally.
### 1.3 EventEnvelopeV1 -- minimal compatibility envelope
`EventEnvelopeV1` is the minimal event envelope used by some plans as an intermediate format.

```json
{
  "ts": "2026-02-23T00:00:00Z",
  "seq": 1,
  "type": "run.started",
  "payload": {}
}
```

Rules:
- Writers SHOULD include `run_id` and `thread_id` whenever available, but `EventEnvelopeV1` does not require them.
- Readers MUST tolerate both envelopes; projectors SHOULD upgrade in-memory to `EventRecord` form.

ContractRef: ContractName:Plans/Contracts_V0.md#EventEnvelopeV1, PolicyRule:Decision_Policy.md§2

---

**Payload schema ownership:** `Contracts_V0.md` owns the canonical persisted envelope (`EventRecord`) and cross-cutting auth/event contracts. Concrete persisted event-type payload schemas are registered in `Plans/storage-plan.md` so writers, projectors, analytics, and generated docs share one payload SSOT.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord

---

## 2. Provider normalized stream (non-persisted contract)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0108
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - non-persisted drafts use transient `generated://<artifact_id>` buffers
  - generated://<artifact_id>
  - Once the route/subject contract is normalized, these docs should mostly reconcile cleanly rather than needing conceptual redesign.
  - rather than a normalized identity-preserving export contract
  - canonical primitive or normalized target contract
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Providers emit a normalized stream for live UI consumption. Persistent storage remains governed by `EventRecord` in §1.

**Normative:** See `Plans/CLI_Bridged_Providers.md` for the full schema (event envelope + event types). This contracts file only asserts the boundary: normalized provider stream events are transport-facing, while seglog events are persistence-facing.

**Provider architecture constraints (normative):**
- All providers (CLI-bridged, server-bridged, and direct-provider) MUST conform to the unified Provider facade/trait contract with capability flags and tool-policy inputs defined at the Provider boundary.
- UI and orchestrator consumers MUST NOT special-case provider transport or provider brand beyond provider configuration fields (enablement, connection/auth inputs, model selection).
- Provider-originated events and tool-call lifecycle signals MUST be normalized into the canonical provider event stream contract before reaching consumers or persistence mapping.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md

---

### 2.1 Provider transport taxonomy

Providers may use one of these transport classes. The normalized stream contract (§2) applies identically regardless of class:
- **CLI-bridged:** local CLI subprocess transport (`stream-json`/ACP). Cursor and Claude Code are CLI-bridged only.
- **Server-bridged:** HTTP REST + SSE to a local server process. OpenCode is server-bridged.
- **Direct-provider:** direct provider endpoint calls with provider-native auth. Codex, Copilot, and Gemini Direct follow this class.

Canonical enum contract for implementation:
```text
ProviderTransport = CliBridge | DirectApi | ServerBridge
```

Mapping:
- `CliBridge` → CLI-bridged
- `DirectApi` → direct-provider
- `ServerBridge` → server-bridged

**Transport-specific notes:**
- Server-bridged providers communicate via HTTP REST endpoints and SSE event streams (e.g., OpenCode; see `Plans/Provider_OpenCode.md`).
- CLI-bridged providers communicate via CLI event outputs and adapter parsing (`Plans/CLI_Bridged_Providers.md`).
- Direct-provider integrations may use provider HTTP/gRPC endpoints directly, but they MUST still emit the same normalized event types (`text_delta`, `tool_use`, `tool_result`, `usage`, `done`, etc.).
- Consumers MUST NOT branch on transport class. All provider output is consumed through the unified normalized stream.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/CLI_Bridged_Providers.md

---

## 3. Tool events (persisted)
Tool activity MUST be represented in the persisted event stream using the following `type` values.

ContractRef: EventType:tool.invoked, EventType:tool.denied, ContractName:Plans/Contracts_V0.md

**tool event contract** for `tool.invoked`.

ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)

**runtime/tool/artifact attribution** must live in the authoritative payload shape itself.

**Authoritative payload fields**

| Field | Requirement |
| --- | --- |
| `node_id` | Runtime node identity for the tool invocation. |
| `attempt_id` | Canonical local runtime anchor for the invocation attempt. |
| `lane_id` | Lane identity associated with the invocation. |
| `package_id` | Package identity associated with the invocation. |
| `execution_role` | Effective execution-role disclosure for the tool attempt. |
| `effective_account_id` | Effective account identity when the invocation is account-backed. |
| `operational_identity` | External-operation identity carried for downstream attribution. |
| `tool_use_id` | Stable tool-use identity for receipts and joins. |
| `provider_attempt_ref` | Provider-side attempt/reference bridge that remains subordinate to `attempt_id`. |
| `usage_event_ref` | Usage-side reference for accounting and evidence joins. |

Rules:
- Analytics-thin tool events are no longer sufficient.
- `attempt_id` is the canonical local runtime anchor; bridge refs stay subordinate but explicit.
**tool event contract** for `tool.denied`.

ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)

**runtime/tool/artifact attribution** must live in the authoritative denial payload shape itself.

**Authoritative payload fields**

| Field | Requirement |
| --- | --- |
| `node_id` | Runtime node identity for the denied tool action. |
| `attempt_id` | Canonical local runtime anchor for the denied action. |
| `lane_id` | Lane identity associated with the denial. |
| `package_id` | Package identity associated with the denial. |
| `execution_role` | Effective execution-role disclosure for the denied action. |
| `effective_account_id` | Effective account identity when the denial is account-backed. |
| `operational_identity` | External-operation identity carried for denial attribution. |
| `tool_use_id` | Stable tool-use identity for denial receipts. |
| `provider_attempt_ref` | Provider-side bridge reference that remains subordinate to `attempt_id`. |
| `usage_event_ref` | Usage-side reference for accounting and evidence joins. |

Rules:
- Analytics-thin tool events are no longer sufficient.
- `attempt_id` is the canonical local runtime anchor; bridge refs stay subordinate but explicit.
- permission and denial surfaces must still expose effective actor and account identity.
Requirements-quality workflow state uses stable persisted event shapes anchored to the canonical **validation pass report** artifact and launch handoff lineage.

ContractRef: Plans/Project_Output_Artifacts.md#10. Validation Pass Report Artifacts, Plans/chain-wizard-flexibility.md#12. Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep)

**Authoritative shared payload fields**

| Field | Requirement |
| --- | --- |
| `validation_pass_report` | Canonical artifact family for the persisted quality result. |
| `workflow_run_id` | Workflow execution lineage for the validation pass. |
| `pass_number` | Ordered validation pass index. |
| `pass_name` | Stable name for the pass. |
| `pass_verdict` | Verdict value for the pass; supports `skipped` where the flow requires it. |
| `verdict_reason` | Structured reason for the emitted verdict. |
| `provider` | Provider used for the validation step. |
| `model` | Model used for the validation step. |
| `wizard_id` | Wizard identity that owns the requirements workflow. |
| `project_id` | Owning project identity. |
| `thread_id` | Conversation or workflow thread identity. |
| `phase_plan_ref` | Phase-plan lineage reference for launch handoff. |
| `staged_bundle_ref` | Staged-bundle lineage reference for launch handoff. |
| `requirements_quality_report_ref` | Stable reference to the quality report artifact. |
| `execution_role` | Effective runtime identity that survives from validation into launch handoff. |
| `effective_account_id` | Effective account identity that survives from validation into launch handoff. |
| `run_id` | Run identity when a launch handoff is already bound to runtime state. |

Rules:
- Pass reports must stay upstream artifacts rather than masquerading as runtime attempts.
- `pass_verdict` must support `skipped` where the flow needs it.
- Accepted/final pass output must bridge into launched execution.
- effective runtime identity must survive from validation into launch handoff.
This section owns the payload-extension fields that stay attached to persisted events and records rather than becoming route payload surrogates.

ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Contracts_V0.md#7.3 `route_target`

**inspection refs**

| Field | Requirement |
| --- | --- |
| `detail_ref` | Stable detail reference for a tool/event detail payload. |
| `report_ref` | Stable report reference for emitted reports. |
| `evidence_ref` | Stable evidence reference for linked evidence artifacts. |
| `usage_event_ref` | Stable usage reference for accounting joins. |
| `workflow_refs` | Workflow-specific reference bundle when workflow lineage is present. |
| `docker_refs` | Container/runtime reference bundle when Docker lineage is present. |
| `kubernetes_refs` | Cluster/workload reference bundle when Kubernetes lineage is present. |

**navigation transport**

| Field | Requirement |
| --- | --- |
| `resume_url` | Transport-only serialized resume/open handoff; it does not replace canonical route identity. |

Rules:
- Inspection/provenance refs stay in event and record payloads.
- Route/open contracts own navigation identity.
- `resume_url` remains transport-only.
### 3.4A Web error taxonomy and applicability

This section defines the canonical contract for this surface.

Core rules:
- The per-contract web error applicability table remains required canon and must stay aligned with provider-to-PM error mapping.
- Firecrawl-specific HTTP and provider errors must map to PM canonical error codes exactly as specified.

Fields:
- HTTP 401/403 → `adapter_unavailable`
- HTTP 429 → `rate_limited`
- HTTP 402 → `rate_limited`
- HTTP 500/502/503 → `adapter_unavailable`
- Timeout → `timeout`
- HTTP 404 → `content_not_found`
- HTTP 400 → `invalid_input`
- "Blocked by robots.txt" → `crawl_robots_blocked` or `content_blocked`
- "Content too large" → `content_too_large`

Rules:
- adapter_unavailable
- unsupported_operation
- content_blocked
- content_not_found
- unsupported_source
- extraction_schema_mismatch
- autonomous_budget_exceeded
- no_previous_version
### 3.5 Debug investigation events

Debug investigations use persisted `EventRecord` envelopes with the following stable `type` values.

| Event type | Minimum payload |
|---|---|
| `debug.investigation.started` | `investigation_id`, `project_id`, `thread_id?`, `run_id?`, `initiator_surface`, `target_kind`, bounded `target_locator_summary`, `requested_mode_overlay`, `effective_mode_overlay`, `runtime_mode` |
| `debug.investigation.state_changed` | `investigation_id`, `previous_phase?`, `phase`, `state`, `attention_reason_code?`, `blocked_reason_code?`, `verification_strength?` |
| `debug.investigation.target_bound` | `investigation_id`, `target_kind`, `target_bindings`, `binding_state` |
| `debug.investigation.context_item_added` | `investigation_id`, `item_id`, `item_kind`, `source_surface`, `state`, bounded `summary`, `artifact_ref?`, `redaction_state` |
| `debug.investigation.context_item_state_changed` | `investigation_id`, `item_id`, `previous_state`, `state`, `reason_code?` |
| `debug.investigation.instrumentation_state_changed` | `investigation_id`, `instrumentation_id`, `scope_kind`, `state`, `rollback_state`, `detail_ref?` |
| `debug.investigation.verification_recorded` | `investigation_id`, `verification_strength`, bounded `verification_summary`, `artifact_refs?` |
| `debug.investigation.exported` | `investigation_id`, `bundle_id`, `schema_id`, `item_count`, `artifact_count`, `redaction_profile` |
| `debug.investigation.imported` | `investigation_id`, `bundle_id`, `source_kind`, `schema_id`, `imported_target_kind` |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md

Event rules:
- raw secrets, raw log dumps, raw trace blobs, and raw binary artifact bytes MUST NOT be duplicated inside these payloads
- raw material is referenced through artifact or blob refs owned by the appropriate artifact system
- bounded summaries must preserve redaction and omission state so downstream readers can tell what was intentionally trimmed or withheld

ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md

---

<a id="AuthState"></a>
### 4.1 AuthState
`AuthState` is the canonical persisted and evented auth snapshot for a provider subject. It records the selected identity, readiness state, and any provider-owned optional dimensions without forcing null-padding for dimensions that do not apply.

Example persisted row for a server-bridged OpenCode profile where the effective subject is a server profile and no billing-entity selection exists:
- `provider = opencode`
- `subject_kind = server_profile`
- `connection_profile_id = opencode-main`
- `provider_identity = http://127.0.0.1:4096`
- `auth_job_state = LoggedIn`
- `readiness_state = Ready`
- `credential_state = present`
- `configuration_state = ready`
- `availability_state = eligible`
- `updated_at = 2026-03-23T00:00:00Z`

The omitted fields in this example are intentional: `account_id`, `selected_billing_entity_id`, `auth_realm`, and `auth_surface` are absent because they do not apply to this server-profile-backed subject.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md

Rules:
- `subject_kind`, `account_id`, and `connection_profile_id` follow the provider-specific rules in this document and in `Plans/Multi-Account.md`.
- `account_id` is present only when the selected runtime subject is account-backed; server-profile-backed rows omit `account_id` rather than null-padding it.
- `provider_identity` is provider-owned and may be an email, URL, local account label, or server profile id.
- `selected_billing_entity_id` is conditionally required: it MUST be present when the effective quota bucket depends on entity selection and MUST be omitted when the provider quota is purely account-scoped. Null-padding is not canonical.
- `auth_realm` and `auth_surface` remain provider-owned optional fields; they are omitted when unused rather than backfilled with placeholder values.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/usage-feature.md

Attached external OpenCode providers use `provider = opencode-external`, `subject_kind = external_server`, and a stable `provider_identity` derived from the attached server profile. They omit `account_id`, `selected_billing_entity_id`, `auth_realm`, and `auth_surface` unless a provider-specific runtime contract explicitly requires one of those fields.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md
### 4.2 AuthPolicy
Defines deterministic defaults for auth method selection per provider.

Canonical enum contracts for implementation:
```text
ProviderAuthMethod = OAuthBrowser | OAuthDeviceCode | ApiKey | GoogleCredentials | CliInteractive
RequestedAuthMode = auto | oauth | api_key | device_code | google_credentials | cli_interactive
```

Rules:
- Cursor and Claude Code use `CliInteractive` (CLI-bridged only).
- Codex supports `OAuthBrowser`, `OAuthDeviceCode`, and `ApiKey` for direct-provider auth/calls.
- GitHub Copilot uses `OAuthDeviceCode` for direct-provider auth/calls.
- Gemini Direct (`gemini`) uses direct-provider auth/calls with `ApiKey` only.
- Gemini CLI (`gemini_cli`) is a CLI-bridged provider entry that may resolve `oauth` requests through `CliInteractive`, `api_key` requests through CLI-managed API-key flows, and `google_credentials` requests through `GoogleCredentials` where the provider/runtime capability matrix supports them.
- OpenCode uses server credentials for server access plus provider-native auth managed by OpenCode.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/CLI_Bridged_Providers.md, SchemaID:Spec_Lock.json#locked_decisions.auth_model

- Gemini Direct and Gemini CLI are separate provider entries and MUST NOT be collapsed into one mixed auth pool.
- `gemini` defaults `requested_auth_mode` to `api_key`.
- `gemini_cli` defaults `requested_auth_mode` to `auto`, and the provider-default auth-surface preference is OAuth/CLI-interactive first, then API key, then Google credentials, unless project/run policy overrides it.
- Explicit `oauth` or `cli_interactive` requests MUST filter to Gemini CLI accounts only.
- Explicit `api_key` requests MUST remain inside the selected provider entry's API-key-capable accounts.
- Explicit `google_credentials` requests MUST filter to Gemini CLI Google-credential accounts only.
- There is no silent cross-provider fallback between `gemini` and `gemini_cli`.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD

- `auto` resolves auth-surface preference before account selection and then chooses an eligible account inside the first viable surface.
- Same-provider accounts are not interchangeable. Policy precedence is: provider default -> account override -> role-by-provider override -> role-by-account override -> run snapshot -> attempt/message resolution.
- Manual `set active` / preferred-account selection is an override/debug control, not the default operating model.
- For GitHub, default interactive auth MUST be OAuth device-code flow.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md
### 4.3 AuthEvent
Auth flows MUST emit persisted events using `EventRecord` (§1.2), with stable `type` strings owned by the provider's plan.

Example (GitHub):
- `auth.github.device_code.issued`
- `auth.github.token.polling`
- `auth.github.authenticated`
- `auth.github.failed`
- `auth.github.disconnected`

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Contracts_V0.md#EventRecord

---

### 4.4 Setup/Health lifecycle contracts
Canonical enum families for setup, health, and readiness:

```text
InstallableComponent = CursorAgent | ClaudeCodeCli | GeminiCli | Playwright | Nanobanana | OpenCodeServer
InstallJobState = NotInstalled | Installing | Installed | Uninstalling | Failed
AuthJobState = LoggedOut | LoggingIn | LoggedIn | LoggingOut | AuthExpired | AuthFailed
ProviderReadinessState = NeedsSetup | Validating | Ready | Degraded | ExternalNotManaged
AuthRealm = github_api | copilot_github
AuthSurface = oauth | api_key | chatgpt | google_adc | service_account_json | vertex_api_key | cli_interactive | console_api | sso
CredentialState = missing | present | expired | invalid | revoked
ConfigurationState = ready | needs_configuration | validation_required
AvailabilityState = eligible | cooldown | hard_blocked | disabled
UsagePressureState = nominal | approaching_threshold | threshold_reached | exhausted | unknown
```

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md

Lifecycle rules:
- Setup and Health MUST expose both `AuthJobState` and `ProviderReadinessState` when a provider can be authenticated but still blocked on configuration, billing/entity selection, trust, discovery, or validation.
- `CursorAgent` is the canonical installable/runtime target for Cursor CLI integration.
- `Nanobanana` is an installable helper for Gemini CLI media paths only when media is enabled.
- `AuthSurface = chatgpt` is the canonical user-facing direct-login family for Codex plan-backed usage.
- `google_adc`, `service_account_json`, and `vertex_api_key` are separate validation branches for Gemini CLI Vertex/Google Cloud setups and MUST NOT be collapsed into a single unlabeled "Google credentials" setup path in user-facing flows.
- `UsagePressureState` is provider-agnostic and maps authoritative counters, authoritative blocks, monthly-plan exhaustion, or weaker inferred pressure into one normalized scheduler vocabulary.
- provider-reported cooldown windows remain facts; user actions such as `Temporary Pause`, `Resume Now`, and `Mark Needs Recheck` are PM-imposed overlays and MUST NOT overwrite the provider-reported cooldown metadata.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md

### 4.5 Provider State Lifecycle Mapping

Provider setup/health projection needs an explicit lifecycle mapping because provider-profile state, Executor Protocol node state, and PM runtime/contract state are related but not identical. The table below is canonical for provider-state reconciliation. It does not replace the canonical child-run lifecycle in §Canonical Runtime Event, Outcome, and Action Contract Reconciliation Addendum; instead, it defines how provider-profile state should be understood when compared across those systems.

| Provider state | EP equivalent | Contracts equivalent | Notes |
|---|---|---|---|
| `unknown` | — | — | Pre-registration |
| `discovered` | `pending` | `created` | Provider found but not configured |
| `configuring` | `pending` | `initializing` | User entering credentials |
| `ready` | `pending` | `ready` | Configured, not yet used |
| `active` | `running` | `active` | Processing requests |
| `degraded` | `running` (with warning) | `degraded` | Working but with issues |
| `suspended` | `blocked` | `suspended` | Temporarily unavailable |
| `expired` | `failed` | `expired` | Credentials expired |
| `removed` | — | `deleted` | Provider removed |

When provider lifecycle is projected into canonical child execution, only execution-relevant states map through the child-run lifecycle directly: `active`/`degraded` correspond to active execution, `suspended` corresponds to blocked execution, and `expired` corresponds to failure. Discovery/configuration-only states remain provider-profile states and MUST NOT be misreported as in-flight child execution.
ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Executor_Protocol.md

**requested/effective execution identity**

**AuthState account-backed identity fields**

| Field | Meaning |
| --- | --- |
| `effective_account_id` | Stable internal selected account identity captured in persisted auth state when the runtime subject is account-backed. |
| `effective_provider_identity` | provider-native metadata preserved for display and routing audit without replacing the stable internal account key. |
| `provider_account_id` | provider-native metadata key retained only as provider-native metadata subordinate to stable internal identity. |
| `execution_role` | Runtime disclosure role preserved with the effective auth snapshot. |
| `operational_identity` | Stable runtime and audit identity preserved with the effective auth snapshot. |

**AuthPolicy requested selection fields**

| Field | Meaning |
| --- | --- |
| `requested_account_id` | Explicit selected-account anchor for historical recovery and account-directed routing. |
| `requested_account_binding` | Binding mode that distinguishes preference from requirement. |
| `requested_account_policy` | Requested account-policy selection used before effective resolution. |

**provider-native metadata** remains subordinate to the stable internal account key.

Rules:
- Requested state must remain recoverable in historical snapshots.
- Binding distinguishes preference from requirement.
- `provider_account_id` must be retired or explicitly governed as provider-native metadata subordinate to stable internal identity.

Permission carry-through:
- effective-account-scoped permission resolution must read `requested_account_binding` rather than a policy-only route
- `effective_account_id` must remain available to approval and permission snapshots

ContractRef: Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Multi-Account.md#4.5 Selectable unit and runtime resolution

Required fields:
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- effective_provider_identity
- provider_account_id
- execution_role
- operational_identity

Canonical terms and values:
- requested_account_id
- requested_account_binding
- requested_account_policy
- effective_account_id
- effective_provider_identity
- provider_account_id

Labels:
- requested/effective execution identity
- provider-native metadata

Behavioral rules:
- Requested state must remain recoverable in historical snapshots.
- Binding distinguishes preference from requirement.
- `provider_account_id` must be retired or explicitly governed as provider-native metadata subordinate to stable internal identity.

Permission carry-through:
- effective-account-scoped permission resolution must read `requested_account_binding` rather than a policy-only route
- `effective_account_id` must remain available to approval and permission snapshots
## 5. Context management (instruction scoping + attempt journaling + parent summary + `AGENTS.md` enforcement)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0109
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Settings > Branching` and `Settings > Health` expose config/diagnostics, not primary active-worktree management.
  - Settings > Branching
  - Settings > Health
  - mutation-safe-point enforcement
  - `Runtime_Artifacts_Panel.md` assumes concrete runtime-artifact schema enforcement that is not currently present in the repo.
  - Runtime_Artifacts_Panel.md
  - must exist for any dispatched attempt:
  - `summary?`
  - summary?
  - `attempt:<attempt_id>`
  - attempt:<attempt_id>
  - `object_kind = attempt`
  - object_kind = attempt
  - `targeted for future enforcement`
  - targeted for future enforcement
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Context management keeps runtime identity explicit across prompt assembly, execution, approval, and historical review.

### 5.1A InvestigationContextAttachment
Investigation attachments remain additive and do not rename or shadow the shared runtime snapshot fields.

### 5.1B Persona/Runtime Snapshot Payload Contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0118
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - why it matters: `needs_review` and blocked/failure payload semantics disagree inside the same doc, which will leak into automation-first operator flows.
  - needs_review
  - define one shared routing payload contract rather than separate ad hoc payloads per surface
  - but normalize their decoded payload into the same routing contract used by in-app search and command routing
  - URLs and in-app actions should decode to the same route payload
  - `primary_route_payload_ref` or inline route payload
  - primary_route_payload_ref
  - allow navigation/open/focus commands to carry or resolve into the canonical route payload
  - route payload should use canonical surface/tab/object terms
  - attention-center items should likely store either an inline route payload or a stable ref to one; they should not depend on ambient current UI state to open correctly
  - add/own canonical snapshot field names such as:
  - operational-identity snapshot block names
  - `UI_Command_Catalog.md` is currently being used as a de facto navigation contract in places where a deeper route payload is still unowned.
  - UI_Command_Catalog.md
  - refs or embedded snapshot for canonical requested/effective persona/runtime record
  - `chain-wizard-flexibility.md` has a reasonably solid assistant-to-wizard handoff payload:
  - chain-wizard-flexibility.md
  - permission/runtime snapshot refs when a pass is provider-executed rather than purely structural
  - `path_ref` or canonical path snapshot
  - path_ref
  - define one canonical internal route/target payload for navigation
  - `UI_Command_Catalog.md` has many action IDs but no explicit generalized subject-open command family or route payload contract.
  - Add a canonical route payload / target model owner section, likely in `Contracts_V0.md` or an equivalent routing owner doc.
  - Contracts_V0.md
  - docs should explicitly mark older/raw payload conventions as migration aliases where needed
  - `UI_Command_Catalog.md` still presents many navigation commands with ad hoc payload shapes that should eventually normalize into this bounded field set.
  - Without rejection rules, route producers will keep slipping local payload habits into the base contract.
  - `gap-005` stays open because the blocked-packet payload is still under-specified even though the assistant-chat headings are now confirmed.
  - gap-005
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
`execution_unit_context` is the authoritative runtime snapshot packet.

Required fields:
- `run_id`
- `node_id`
- `attempt_id`
- `lane_id`
- `package_id`
- `seam_id`
- `worktree_id`
- `execution_role`
- `requested_account_id`
- `requested_account_binding`
- `requested_account_policy`
- `effective_account_id`
- `operational_identity`
- `tool_use_id`

Rules:
- Requested and effective account state stays explicit across runtime, approval, and usage surfaces.
- `requested_account_binding` distinguishes preference from requirement.
- `requested_account_policy` remains explicit in the stored snapshot.
- `operational_identity` and `tool_use_id` survive into downstream joins.
## 6. HITLRequest

Approval and recovery are anchored to runtime blocked episodes rather than to tier-boundary request objects.

Required runtime-facing fields are:
- `run_id`
- `node_id`
- `blocked_sequence`
- `attempt_id?`
- `blocked_reason_code`
- `allowed_action_ids[]`
- `approval_scope_key`
- `approver_identity?`
- `detail_ref?`
- `report_ref?`

ContractRef: Plans/human-in-the-loop.md#Canonical HITL request contract, Plans/Executor_Protocol.md#Worktree-aware execution unit context

Labels:
- Blocked
- Waiting approval
- Action Required

Behavioral rules:
- `blocked_sequence` is the canonical approval anchor.
- Pre-attempt blocked episodes must not invent `attempt_id`.
- Chat and GUI action buttons derive from ordered `allowed_action_ids[]`.

Permission carry-through:
- approval scope remains blocked-episode-scoped rather than session-global
- ordered `allowed_action_ids[]` must survive into approval UI
### 6.2 Scope and persistence rules

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0120
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - recovery/conflict persistence phrased in `tier_id` terms
  - tier_id
  - persistence should be through canonical blocked/runtime records
  - remaining drift is concentrated around compatibility-era fields like `resume_url?` in blocked-notice persistence rather than broad ontology problems
  - resume_url?
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Rules:
- approvals bind to canonical runtime identity first: `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`
- a blocked-episode approval does not imply a broader policy approval unless the `approval_scope_key` says so explicitly
- unresolved blocked episodes survive restart and are rehydrated rather than reminted opportunistically
- a failed approval attempt or failed switch of recovery action remains historically material and must persist in records/history

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md

### 6.3 Compatibility boundary
Older request-centric payloads may continue to carry `request_id` for lineage and migration, but any consumer that mutates runtime state must resolve through the blocked-episode identity model.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md
## 7. UICommand

### 7.1 Assistant worktree command registrations

Six UICommand registrations for assistant worktree operations. All require `activeThreadExists && projectIsGitRepo && !projectIsRemoteNonSSH`.

| Command ID | Label | Icon | Category | Extra when clause |
|---|---|---|---|---|
| `cmd.chat.worktree.create` | Create Worktree | `worktree-add` | chat | `!activeThreadHasWorktree` |
| `cmd.chat.worktree.remove` | Remove Worktree | `worktree-remove` | chat | `activeThreadHasWorktree` |
| `cmd.chat.worktree.bind_existing` | Bind Existing Worktree | `worktree-link` | chat | `!activeThreadHasWorktree` |
| `cmd.chat.worktree.open_files` | Open Worktree Files | `folder-opened` | chat | `activeThreadHasWorktree` |
| `cmd.chat.worktree.merge` | Merge Worktree | `git-merge` | chat | `activeThreadHasWorktree` |
| `cmd.chat.worktree.create_pr` | Create PR | `git-pull-request-create` | chat | `activeThreadHasWorktree && projectHasGitHubRemote` |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/assistant-chat-design.md

`UICommand` is the canonical command envelope. Shared navigation and identity-open primitives sit underneath public wrapper commands rather than beside them.

Required envelope fields are:
- `command_id`
- `command_kind`
- `args`
- `context?`
- `normalization?`

`command_kind` is closed to:
- `shell_view`
- `navigation_wrapper`
- `domain_action`

`normalization` is closed to:
- `wrapper`
- `deprecated_alias`

Rules:
- deprecated aliases point at `alias_of_command_id`
- stable wrapper commands point at `normalizes_to_contract`
- shell-facing commands may carry terminal-scoped identity args, but those identities still normalize through the canonical route and persistence model

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Crosswalk.md

### 7.2 UICommand envelope rules

ContractRef: Plans/UI_Command_Catalog.md#2.0 Command entry contract (doc-level), Plans/Crosswalk.md#3.1 Runtime orchestration ownership

Required fields:
- normalization.kind

Canonical terms and values:
- normalization.kind

Labels:
- command envelope

Behavioral rules:
- Wrapper metadata stays narrow and contract-level.
- Wrappers point to canonical primitive families only.
- Route payload structure is not restated inside command metadata.

### 7.3 `route_target`
`route_target` is the canonical navigation-and-focus contract.

Required fields:
- `target_kind`
- `project_id`

Allowed focus fields:
- `focused_run_id`
- `thread_id`
- `tab_id`
- `browser_session_id`
- `terminal_section_id`
- `terminal_tab_id`
- `terminal_pane_id`
- `terminal_session_id`
- `dev_session_id`
- `inspector_target`

Exactly one selector is required:
- `subject_id`
- or `object_kind` + `object_id`

`target_kind` is closed to:
- `primary_view`
- `side_panel`
- `bottom_panel`
- `embedded_surface`
- `page_tab`

`subject_id` is closed to:
- `doc:<document_id>`
- `artifact:<artifact_id>`

`object_kind` is closed to:
- `thread`
- `message`
- `wizard`
- `usage_event`
- `run`
- `node`
- `attempt`
- `scheduler_pass`
- `blocked_episode`
- `safe_point`
- `remediation`
- `feature_seam`
- `work_package`
- `lane`
- `worktree`
- `concern`
- `promotion`
- `graph_patch`
- `graph_generation`
- `browser_session`
- `terminal_section`
- `terminal_tab`
- `terminal_pane`
- `terminal_session`
- `dev_session`

`inspector_target` is closed to:
- `summary`
- `evidence`
- `artifacts`
- `history`
- `reviews`
- `usage`
- `lineage`
- `details`

Rules:
- `project_id` is required
- route activation must override remembered shell state when needed to reveal the requested object, scope, and destination surface
- route activation may reuse remembered shell state when that state still reveals the requested object cleanly
- terminal routes prefer exact same-session reveal when `terminal_session_id` is supplied and still resolvable
- historical terminal routes may reveal a historical pane or receipt view, but they MUST NOT synthesize live PTY continuity
- `resume_url` is serialized transport only and decodes to `route_target`; it is not a stronger parallel primitive

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md

Labels:
- route target
- target kind
- object kind
- inspector target

Behavioral rules:
- Exactly one canonical primary selector is permitted.
- `project_id` is required.
- `target_kind` is destination class only, and `inspector_target` is focus refinement only after selector identity is established.
- `resume_url` is serialized transport of `route_target`, not a second routing ontology.

### 7.4 OpenSubject
`OpenSubject` is the canonical identity-native source-open contract.

Required fields:
- `subject_id`
- `open_intent`

`open_intent` is closed to:
- `open_source`
- `open_preview`
- `open_review`

Rules:
- `OpenSubject` resolves canonical identity to the best source realization
- `OpenSubject` may resolve to `OpenFile` or to a transient `generated://<artifact_id>` buffer
- transport details do not belong in the `OpenSubject` contract itself
- terminal, dev-session, and browser-session reveals normalize through `route_target` rather than overloading `OpenSubject`

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Canonical terms and values:
- doc:<document_id>
- artifact:<artifact_id>
- Everything else routes through object_kind + object_id

Labels:
- open subject
- subject identity

Behavioral rules:
- `subject_id` is bounded to canonical renderable/openable content only.
- Everything outside document/artifact families routes through `object_kind + object_id`.
## 8. UI Scaling

The application exposes a user-facing UI scale setting (Settings → General tab).
In the Slint rewrite this MUST be implemented via Slint's native window/global scale-factor mechanism.

ContractRef: ContractName:Plans/FinalGUISpec.md#7.4, ContractName:Plans/FinalGUISpec.md#16.2

**Contract fields:**

| Field | Value |
|-------|-------|
| `scale_range` | `[0.75, 1.5]` (clamped) |
| `presets` | `[0.75, 0.9, 1.0, 1.1]` |
| `default` | `1.0` |
| `mechanism` | Slint native scale factor (window-level) |
| `prohibited` | Per-token manual scaling / Iced-era `ScaledTokens` multiplication layers |

Rules:
- UI scale MUST use Slint's native global/window scale factor as the **only** scaling path.
- Per-token manual scaling (e.g. the legacy Iced `ScaledTokens` multiplication approach) MUST NOT be ported to Slint view code.
- The same four preset buttons (75 %, 90 %, 100 %, 110 %) MUST appear in Settings → General.
- Editor text zoom (Ctrl+= / Ctrl+−) is independent of app-level UI scale.

ContractRef: ContractName:Plans/FinalGUISpec.md#7.4, ContractName:Plans/FinalGUISpec.md#16.2, PolicyRule:Plans/rewrite-tie-in-memo.md#ui-scaling-migration

## Usage and Billing Contracts Addendum

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0116
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Bind Usage and Widget contracts to canonical `provider_accounts.*` sourcing and a shared projection-health/trust-state contract rather than page-local heuristics
  - provider_accounts.*
  - older sections still drive detail panes, worker activity, verification streams, Usage links, and event correlation by `tier_id` / `tier_type`
  - tier_id
  - tier_type
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### Cost field type contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0126
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - actor type and operation type should dominate stack hints
  - this should probably be rare and usually resolved by actor type + operation type
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

All persisted usage/cost values are stored as integer microdollars (`u64`). Presentation converts to decimal currency strings; storage and accumulation do not.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md

### Token bucket contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0149
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - but it must not be implied to share the same ownership or token source unless the owning auth contract says so
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The canonical token fields are:
- `input_tokens`
- `output_tokens`
- `cache_read_input_tokens`
- `cache_creation_input_tokens`
- `reasoning_tokens`

These fields are individually persisted. Storage-layer aggregation or collapse into a smaller field set is prohibited.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Architecture_Invariants.md

`total_tokens` MAY be stored or derived for convenience, but it MUST NOT replace the individual token buckets.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### Usage attribution contract
Usage records and normalized usage events MUST preserve:
- `provider_id`
- `model_id`
- `account_id` when the provider/runtime surface is account-backed
- `parent_run_id` when usage is emitted by a child run, tool, title-generation pass, summary pass, or other background operation
- `billing_entity_id` when quota semantics depend on it
- `entitlement_class` when provider routing, quota, or pricing semantics depend on it
- `cache_hit?`
- `cache_strategy?`

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md

Rules:
- usage attribution is keyed by the canonical tuple `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)` when those fields are known
- bridge adapters, storage snapshots, analytics rollups, and UI projections MUST NOT collapse that tuple to `billing_entity_id` alone when account or entitlement context exists
- background/helper usage keeps the same attribution tuple and lineage through `parent_run_id` rather than inventing a second attribution model

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Architecture_Invariants.md

### Billing entity field contract

`requested_billing_entity_id` and `effective_billing_entity_id` are conditionally required fields. A provider includes them only when billing entity selection exists for that provider and when the field is meaningful in the current flow.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md

This conditional-requirement contract applies uniformly wherever billing entity selection is surfaced:
- In `EventRecord.payload`, fields are present only for provider flows that expose billing entity selection.
- In `AuthState`, the persisted selection field is present only when the effective quota bucket depends on entity selection; otherwise the field is omitted.
- In usage attribution, canonical attribution is keyed by `(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)` when those dimensions are known. `billing_entity_id` alone is never a sufficient canonical substitute when account or entitlement context exists.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md

## Scheduler, Safe-Point, and Remediation Events Addendum (2026-03-08)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0115
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - resurfacing should respond to meaningful change, not spam the user on every scheduler tick
  - safe-point creation/restore
  - `remediation:<remediation_root_id>`
  - remediation:<remediation_root_id>
  - scheduler / blocked / safe point / remediation
  - `object_kind = remediation`
  - object_kind = remediation
  - Older docs still assume history pivots can be attempt-only, which is insufficient for scheduler, blocked, and remediation lineage.
  - safe-point, remediation, worktree-conflict, and blocked/runtime state are already present
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Add the following event families to the canonical contract set.

### 1. Scheduler analysis and readiness events

#### `scheduler.pass`

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0156
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The scheduler then emits a scheduler pass with `wake_reason = startup_recovered`.
  - wake_reason = startup_recovered
  - The GPT-5.4 pass confirmed the owner-doc tranche still has strong signal after Opus and Sonnet; it did not plateau into repetition.
  - Repeated cross-owner dependencies sharpened by this pass:
  - GPT-5.2 is still producing signal strong enough to justify the last requested model pass.
  - The final Codex pass still added meaningful last-mile contradictions instead of flattening into simple confirmation, especially where owner docs remain mechanically unverifiable or structurally inconsistent.
  - The `GPT-5.2` continuation wave still produced substantive new deltas across the full 22-doc tail, so the tranche has still not converged before the final `GPT-5.3-Codex` pass.
  - GPT-5.2
  - GPT-5.3-Codex
  - The tail still has broad, meaningful signal at the fifth model pass; it still merits carrying the full tranche into the final `GPT-5.3-Codex` pass rather than narrowing early.
  - The final `GPT-5.3-Codex` pass still produced meaningful last-mile deltas, but they were now mostly mechanical canon-integrity failures rather than entirely new thematic seams. That makes this a strong closeout tranche rather than a flat confirmation pass.
  - `Section15_MVP_Promoted_Features_Spec.md` last as a verification pass against the corrected upstream owners
  - Section15_MVP_Promoted_Features_Spec.md
  - This packet must be a canon-collapse pass, not a light additive pass.
  - Constraint for this pass: do **not** edit planning docs directly; use the existing work-item ledger plus current canonical docs.
  - Evidence base used for this pass:
  - This rerun adds confidence that reconciliation should proceed as a **canon-collapse and owner-schema completion pass**, not as a generic polish pass.
  - This pass narrowed `gap-005` exact-missing wording from blanket field absence to consumer-propagation defects for the fields already owned elsewhere.
  - gap-005
  - This pass removed only one overstated exact-missing item from gap-008 and further sharpened the identity-carrythrough wording.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Migration note:** `run.scheduler_analysis` is a deprecated legacy alias for this event. New producers MUST emit `scheduler.pass`. Consumers SHOULD accept both during migration.

ContractRef: EventType:scheduler.pass, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `scheduler_pass_id` (canonical identity -- `analysis_id` is a legacy alias)
- `run_id`
- `thread_id`
- `replan_generation`
- `wake_reason`
- `available_slots`
- `ready_nodes[]`
- `selected_nodes[]` with per-node `{ node_id, score_tuple, lane }`
- `non_selected_nodes[]` with per-node `{ node_id, non_selected_reason }`
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `run.node_ready`
Minimum payload:
- `run_id`
- `node_id`
- `ready_since_utc`
- `wake_reason`
- `replan_generation`

#### `node.blocked`

> **Migration note:** `run.node_blocked` is a deprecated legacy alias for this event. New producers MUST emit `node.blocked`.

ContractRef: EventType:node.blocked, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_reason_code`
- `blocked_sequence`
- `allowed_action_ids[]`
- `preserved_local_work`
- `detail_ref?`
- `failure_class?` (only when the block originated from a classified outcome)
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `node.unblocked`

> **Migration note:** `run.node_unblocked` is a deprecated legacy alias for this event. New producers MUST emit `node.unblocked`.

Minimum payload:
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_sequence`
- `resolution` (the action that resolved the block)
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 2. Retry/backoff events

#### `run.node_backoff_started`
Minimum payload:
- `run_id`
- `node_id`
- `attempt_id`
- `failure_class`
- `backoff_until_utc`
- `retry_count`
- `ts`

#### `run.node_backoff_expired`
Minimum payload:
- `run_id`
- `node_id`
- `attempt_id`
- `failure_class`
- `ts`

#### `run.node_retry_scheduled`
Minimum payload:
- `run_id`
- `node_id`
- `prior_attempt_id`
- `retry_count`
- `failure_class`
- `safe_point_id?`
- `ts`

### 3. Safe-point events

#### `safe_point.created`

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0155
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `safe_point:<safe_point_id>`
  - safe_point:<safe_point_id>
  - `object_kind = safe_point`
  - object_kind = safe_point
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Minimum payload:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `worktree_path?`
- `baseline_ref`
- `replan_generation`
- `ts`

#### `safe_point.restored`
Minimum payload:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `restore_outcome`
- `ts`

#### `restore_outcome` enum

Canonical values for the `restore_outcome` field in `safe_point.restored` events:

| Value | Meaning |
|-------|---------|
| `restored_clean` | All files and state restored to safe-point snapshot without conflicts. |
| `restored_with_conflicts` | Restore completed but one or more files had merge conflicts requiring resolution. |
| `restore_failed` | Restore could not be applied; original state preserved. |
| `restore_skipped` | Restore was requested but determined unnecessary (state already matches safe-point). |

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 4. Remediation lineage events

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0117
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - promotion_class, source_scope, target_scope, canonical verdict, revoked/reopened lineage
  - no newer lineage operation depending on that lane/worktree still being live
  - replaced by a newer canonical successor in the same lineage
  - concerns need durable identity and lineage, not just severity/status
  - `Run_Graph_View.md` still assumes a simpler phase/task/subtask tree and under-specifies concern/corroboration/promotion/patch lineage
  - Run_Graph_View.md
  - `workflow_run_id` is useful grouping identity, but not enough lineage by itself
  - workflow_run_id
  - package/lane operational lineage object
  - still too thin for modern event/runtime/account lineage.
  - identity / lineage:
  - Use `inspector_target = lineage` for scheduler/remediation/safe-point/patch lineage drill-ins.
  - inspector_target = lineage
  - `inspector_target = lineage | details`
  - inspector_target = lineage | details
  - `inspector_target = lineage | history`
  - inspector_target = lineage | history
  - `inspector_target = lineage`
  - Keep scheduler/safe-point/remediation/patch lineage under `inspector_target = lineage` when the object is already selected.
  - `inspector_target = details | lineage`
  - inspector_target = details | lineage
  - normalize seam/package/lane/worktree/concern/promotion/graph lineage pivots through object-first route recipes
  - The blocked/runtime lineage work already moved toward:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

#### `remediation.spawned`

> **Migration note:** `run.remediation_started` is a deprecated legacy alias for this event. New producers MUST emit `remediation.spawned`.

ContractRef: EventType:remediation.spawned, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `run_id`
- `node_id`
- `remediation_root_id`
- `child_attempt_id`
- `remediation_generation`
- `parent_failure_class`
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `remediation.resolved`

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0154
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `open -> addressed -> resolved`
  - open -> addressed -> resolved
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Migration note:** `run.remediation_completed` is a deprecated legacy alias for this event. New producers MUST emit `remediation.resolved`.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

Minimum payload:
- `run_id`
- `node_id`
- `remediation_root_id`
- `child_attempt_id`
- `resolution` (`fixed` | `superseded` | `abandoned` | `replan_required`)
- `ts`

`remediation_ceiling_exceeded` remains a blocked-state outcome (`blocked_reason_code`), not a `remediation.resolved.resolution` value.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 5. Degradation / integrity events

#### `plan.decomposition_degraded`
Minimum payload:
- `project_id`
- `source_stage`
- `reason_code`
- `original_shape`
- `degraded_shape`
- `evidence_ref`
- `ts`

#### `run.graph_integrity_failed`
Minimum payload:
- `run_id`
- `reason_code`
- `detail_ref`
- `replan_generation`
- `ts`

### 6. Wizard blocked escalation events

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0119
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - What is still missing is a shared escalation ladder across concerns, blocked states, usage pressure, and persistent unresolved conditions.
  - GATE-012 still collapses `attention_required` and true `blocked` escalation in its evidence path.
  - attention_required
  - blocked
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

#### `wizard.blocked`
Minimum payload:
- `wizard_id`
- `thread_id?`
- `round_count`
- `report_ref`
- `resume_url`
- `ts`

#### `wizard.unblocked`
Minimum payload:
- `wizard_id`
- `thread_id?`
- `resolution_source`
- `ts`

### 7. Contract rules

- Events above are canonical ledger events, not debug-only instrumentation.
- All UI and storage projections added by this packet derive from these events or fields normatively referenced by them.
- `safe_point.*` events are runtime-internal recovery records and are distinct from user-facing `restore_point.*` / `rollback.*` contracts.
- `plan.decomposition_degraded` is allowed only before canonical graph lock.
## Runtime Scheduler / Attempt Lineage Contract Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0114
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - why impacted: core runtime contract already shows drift against UI/runtime consumers.
  - simple help must not mutate runtime truth or contract semantics
  - `Models_System.md` calls its runtime contract cross-system while omitting already-canonical auth/account fields.
  - Models_System.md
  - result: the doc is effectively trying to consume a node/lane scheduler while still operationalizing execution via tier-native runtime structs
  - runtime scheduler remains canonical readiness/transition authority
  - schema family absent, attempt identity incomplete, receipt/artifact drill contract still unimplementable.
  - but their handoff payloads still need to carry enough canonical identity and lineage so downstream runtime, history, ledger, search, and audit can explain how execution began
  - `FileManager.md` still cannot satisfy its own addendum requiring open-by-runtime-identity because its core open contract is path-only; `generated://` only covers preview restore, and `evidence_record` is still tier-keyed where attempt-native pivots are now required.
  - FileManager.md
  - generated://
  - evidence_record
  - `Prompt_Pipeline.md` already owns the immutable runtime handoff bundle captured at attempt start.
  - Prompt_Pipeline.md
  - Push tier/group surfaces to consume pointers into this contract instead of reconstructing runtime identity from `tier_id` plus ambient state.
  - tier_id
  - `attempt.started` is the canonical runtime start packet
  - attempt.started
  - `FileManager.md`'s addendum requires open-by-identity and generated non-repo drafts, but `OpenFile { path: PathBuf }` plus root-path validation cannot satisfy it; no `OpenArtifact`-style contract, no `evidence_by_attempt` projection, and no artifact-index freshness/degraded fallback exist.
  - OpenFile { path: PathBuf }
  - OpenArtifact
  - evidence_by_attempt
  - related runtime attempt/evidence lineage
  - `FileManager.md` still describes one internal open-file contract while its own runtime-artifact addendum already requires identity-native opens that cannot be expressed as safe path opens.
  - Add these lineage examples to the route contract owner docs.
  - `tier_id` is still treated as a required usage identity/correlation key even though the broader runtime and routing direction is object-first and node/attempt/block lineage aware.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Add the following canonical runtime event families and required fields.

Required fields:
- `run_id`
- `thread_id`
- `replan_generation`
- `wake_reason`
- `available_slots`
- `ready_nodes[]` with score breakdown terms
- `selected_nodes[]`
- `non_selected[]` with `non_selected_reason`
- capacity summary

ContractRef: Plans/Executor_Protocol.md#Wake reasons and coalescing

Required fields:
- startup_recovered

Canonical terms and values:
- scheduler.pass
- startup_recovered

Labels:
- scheduler pass

Behavioral rules:
- The first scheduler pass after startup recovery persists `wake_reason = startup_recovered`.
- Blocked and recovery wake ownership is carried by `scheduler.pass` rather than inferred from prompt text.
### `attempt.started`

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0150
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `attempt.started`
  - attempt.started
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- `scheduler_lane`
- effective requested/effective model snapshot
- effective permission snapshot identifier
- `safe_point_id` when present
- `remediation_root_id` / `remediation_parent_attempt_id` when present
- `replan_generation`

### `attempt.completed`
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id`
- terminal state
- `failure_class` or success marker
- retry count and backoff metadata
- verification / reviewer result references when relevant
- resolved lineage identifiers

### `node.blocked`
Required fields:
- `run_id`, `thread_id`, `node_id`, `attempt_id` if an attempt existed
- `blocked_reason_code`
- `failure_class` when the blocked state originated from a classified outcome
- ordered `allowed_action_ids[]`
- `auth_realm`, `missing_scopes[]`, or side-effect metadata when relevant
- whether local work was preserved

### `safe_point.created` and `safe_point.restored`
Required fields:
- `safe_point_id`
- `run_id`, `node_id`, `attempt_id`
- workspace / worktree reference
- `replan_generation`
- reason for creation or restore
- restore result

### `remediation.spawned` and `remediation.resolved`
Required fields:
- `remediation_root_id`
- `remediation_parent_attempt_id`
- child `attempt_id`
- finding / issue references
- `remediation_generation`
- resolution enum (`fixed`, `superseded`, `abandoned`, `replan_required`)

### `tool.denied` alignment

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0151
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Several owner docs claim EventRecord/runtime alignment but still omit project/thread/run/attempt/account identity in their own schemas.
  - This is now a clear owner-doc gap, not a vague alignment issue.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
`tool.denied` MUST carry canonical runtime mapping fields when the denial affects scheduler state:
ContractRef: EventType:tool.denied, ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md
- `blocked_reason_code`
- `failure_class`
- ordered `allowed_action_ids[]`
- `headless_denied` boolean
- effective permission snapshot identifier

All of the above are canonical contract fields, not UI-only projection conveniences.
## Canonical Runtime Taxonomy and Event Precedence Reconciliation Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0111
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `storage-plan.md` still splits tier-era event tables from newer attempt-centric records
  - storage-plan.md
  - The global requested-Persona precedence is already strong and should remain the backbone:
  - canonical event fields instead of GUI-only aliases
  - Require requested/effective identity fields in decision/permission records, not just runtime event records.
  - this must move into provider-native correlation before shared-runtime event joins become trustworthy
  - still needs richer event payloads, reconciled outcome taxonomy, and DAE tool-event reconstruction
  - Must-fix spec-integrity failures before reconciliation**
  - Repair structural owner docs before downstream reconciliation work depends on them:
  - likely owner doc for formal field precedence:
  - Repair structural owner docs before downstream reconciliation relies on them:
  - Any future reconciliation work should prioritize:
  - canonical event names with explicit legacy aliases in `[retired-token-1]`
  - [retired-token-1]
  - Right now navigation has no explicit migration discipline comparable to event aliases or `cmd.runtime.*` consolidation.
  - cmd.runtime.*
  - The git/worktree coordination examples are a high-risk backdoor for reintroducing tier-era identity after reconciliation.
  - many earlier event examples and keys still centered on `tier_id`
  - tier_id
  - early canonical event table still centers `tier_id`
  - The authored sweep itself is complete and should now hand off to reconciliation rather than additional model passes.
  - Future reconciliation should prioritize:
  - later reconciliation addendum weakens it to `resume_url?`
  - resume_url?
  - event tables keyed to `tier_id`
  - The page doc still contains enough lower aligned material that reconciliation should collapse same-file contradictions instead of replacing the whole thing blindly.
  - mirror/checklist docs that will need revalidation after owner reconciliation
  - The ledger contains enough owner-routing, contradiction, and cleanup-order detail for downstream reconciliation without restarting discovery.
  - Primary owner docs for reconciliation:
  - Verification / mirror followers should remain downstream of owner reconciliation.
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
This section is an exact compatibility mirror of the later canonical runtime contract so readers do not stop at stale transitional enum lists.

### Event-name precedence
| Canonical event | Legacy alias | Rule |
|---|---|---|
| `scheduler.pass` | `run.scheduler_analysis` | `scheduler.pass` is canonical. |
| `node.blocked` | `run.node_blocked` | `node.blocked` is canonical. |
| `node.unblocked` | `run.node_unblocked` | `node.unblocked` is canonical. |
| `remediation.spawned` | `run.remediation_started` | `remediation.spawned` is canonical. |
| `remediation.resolved` | `run.remediation_completed` | `remediation.resolved` is canonical. |

### Canonical enum families
`failure_class`:
- `provider_transient`
- `structured_output_invalid`
- `verification_failed`
- `reviewer_findings`
- `auth_expired`
- `storage_io`
- `quota_exceeded`
- `graph_integrity`

`blocked_reason_code`:
- `permission_denied`
- `user_declined`
- `headless_ask_denied`
- `filesafe_blocked`
- `external_side_effect_blocked`
- `replan_required`
- `waiting_approval`
- `clarification_blocked`
- `worktree_conflict`
- `dirty_worktree`
- `plugin_hook_blocked`
- `validation_blocked`
- `remediation_ceiling_exceeded`

`allowed_action_id`:
- `approve`
- `decline`
- `retry_now`
- `resume_after_prerequisite`
- `restore_safe_point_then_retry`
- `start_fresh_attempt`
- `replan`
- `skip_node`
- `abort_run`
- `open_details`

### Blocking payload rule

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0123
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Severity should probably stay independent from blocking semantics:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Every runtime-facing blocked event or projection MUST expose:
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Executor_Protocol.md
- `blocked_reason_code`
- ordered `allowed_action_ids[]`
- prerequisite metadata needed to bind the recovery command
- `preserved_local_work`
- `requires_safe_point_restore?`
- `failure_class?`
- `detail_ref?`

No section in this file may present an earlier shorter enum set as the canonical value family.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Executor_Protocol.md
## Canonical Runtime Event, Outcome, and Action Contract Reconciliation Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0110
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Opus reinforces that contract naming drift and native-surface ownership are among the highest-risk reconciliation areas
  - must decide whether these field additions are V0 extensions or a V1 event contract
  - The contract layer has canonical event aliasing and blocked-action vocabulary, but still no canonical route/subject vocabulary.
  - Several Sonnet findings sharpened prior generic flags into precise contract failures or source-verified architecture limits; these should not be collapsed back into generic summary language during reconciliation.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The canonical runtime event contract extends to child runs, crew coordination, and effective-context shaping. These contracts are part of the same runtime event and action family as parent execution. They are not an optional overlay and they do not define a separate event grammar.

### Child-run lifecycle and projection

PM child runs are canonical runtime entities with stable identity, lineage, and lifecycle. Command-launched subtasks, orchestrated child runs, delegated plan-mode research, and crew members all project into this same model. Disposable-by-default child lifecycle is the default product posture; long-lived or reopened child identity is the exception path.

Canonical child lifecycle states are: `queued`, `running`, `awaiting_parent`, `blocked`, `complete`, `failed`, `cancelled`. `superseded` remains a terminal reason used when replacement occurred, even if the user-facing terminal state is still presented as `cancelled` or `complete` in some consumers.
ContractRef: Canonical child lifecycle states MUST be preserved across runtime storage, event projection, chat projection, and recovery, and consumers MUST NOT invent incompatible parallel enums. [Source: Tools.md#event-model; storage-plan.md#canonical-child-run-records-and-batch-structure]

Child-to-parent signals are canonical runtime events, not ad hoc UI messages. At minimum the contract family includes: `progress`, `result`, `blocked`, `clarification_needed`, `context_expansion_requested`, `user_input_requested`, `failed`, `cancelled`. Parent orchestration may summarize, consolidate, or route these signals, but canonical event identity must remain intact.
ContractRef: Child-to-parent escalation and progress signals MUST remain canonical runtime events even when parent chat or crew UI projects them into higher-level summaries. [Source: Tools.md#event-model; assistant-chat-design.md#14-subagents--crew]

Chat-facing projection events may normalize child lifecycle into UI-specific projection envelopes, but they MUST preserve the underlying canonical child identity fields. Required fields remain `child_run_id`, `parent_run_id`, `thread_id`, timestamp, attempt identity when relevant, and requested/effective persona/runtime descriptors when the event semantics depend on them.
ContractRef: ContractName: child_projection_identity. Any projection event that feeds chat, cards, groups, or batch summaries MUST preserve canonical child identity fields and MUST NOT demote child runs into anonymous status text. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#14-subagents--crew]

### Retry, reroute, replacement, and resume

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0147
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - separate `time status`, `replacement status`, and `validity status`
  - time status
  - replacement status
  - validity status
  - `Decision_Policy.md` still lacks startup-recovery defaults, misstates retry ceilings in terms that collide with policy-prohibited derived fields, and leaves backoff plus manual/prerequisite resume ceilings unowned.
  - Decision_Policy.md
  - `tier_runtime_record`, tier-keyed `usage_record`, and tier-keyed `evidence_record` need owner-level demotion or replacement.
  - tier_runtime_record
  - usage_record
  - evidence_record
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

`retry`, `reroute`, `replacement`, and `resume` are distinct runtime concepts and must remain distinct in contracts, storage, and event history.

- `resume`: continue the same paused or interrupted child without semantically resetting the task.
- `retry`: a new attempt in the same child lineage after failure, blockage, or interruption.
- `reroute`: same logical child task, different effective runtime surface or capability path.
- `replacement`: a new child because the old role, task shape, or specialization was wrong.

ContractRef: Runtime and storage contracts MUST preserve the semantic distinction between resume, retry, reroute, and replacement; projections MAY summarize them but MUST NOT collapse them into one generic retry/restart bucket. [Source: Tools.md#retry-reroute-replacement-and-cancel; storage-plan.md#canonical-child-run-records-and-batch-structure]

Cancelled and superseded children are terminal by default. Resumption is primarily for in-flight interrupted or waiting children, not for re-opening completed disposable helpers. Crew mode may justify narrower persistence or re-entry behavior, but only as an explicit mode-level exception.
ContractRef: Disposable-by-default child lifecycle is canonical; resume/reopen behavior MUST be treated as an exception path, not the baseline continuity model. [Source: assistant-memory-subsystem.md#capability-boundary-assistant-only; assistant-chat-design.md#15-plan-mode--crew-mode]

### Crew-board coordination contracts

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0127
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - several future crew/message examples still propagate `tier_id` through git/worktree coordination
  - tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Crew coordination uses an explicit crew board. Child-to-child communication in crew mode occurs through board messages or other explicit crew-scoped coordination records, not hidden direct peer channels. Crew board messages are task-scoped, attributable, timestamped, and persisted as part of shared crew coordination state.
ContractRef: Crew-board coordination MUST remain attributable, inspectable, and task-scoped; hidden direct peer messaging is not a canonical runtime channel. [Source: assistant-chat-design.md#14-subagents--crew; storage-plan.md#canonical-child-run-records-and-batch-structure]

Crew members do not gain new authority through board traffic. Permissions, tools, skills, plugins, MCP access, and provider restrictions remain subject to the same requested/effective capability rules as any other child run.
ContractRef: Crew coordination messages MUST NOT widen authority, permissions, or capability availability beyond the child's effective runtime envelope. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; Skills_System.md#child-capability-subset-clarification]

#### Stable subagent and crew event families

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0153
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `provider_attempt_ref?` and similar continuity fields are still conceptually present but not fully owned by a stable schema slot
  - provider_attempt_ref?
  - `Contracts_V0.md` should own cross-cutting persisted-envelope field families and stable event names
  - Contracts_V0.md
  - any new blocked/recovery/governance event families
  - The evidence schema cannot cleanly encode route-payload mismatch reports, alias/deprecation findings, or passthrough/correlation failures in a stable machine-readable form.
  - canonical event families
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
In addition to the effective-context projection events defined below (`subagent.context_shrunk` and `subagent.context_rehydrated`), the following stable runtime event families are canonical for subagent and crew orchestration. Child identity and lineage are not optional metadata: they are part of the event contract.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

For every `subagent.*` event below, the payload MUST preserve the PM lineage envelope:
- `run_id`
- `thread_id`
- `agent_id`
- `parent_run_id?`
- `child_run_id?`
- `parent_thread_id?`
- requested and effective runtime descriptors when they differ

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md

| event_type | payload_fields | description |
|---|---|---|
| `subagent.spawned` | `run_id`, `thread_id`, `agent_id`, `agent_type`, `parent_run_id`, `child_run_id`, `parent_thread_id`, `model_id` | New subagent created and linked to parent lineage. |
| `subagent.started` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `prompt_preview` | Subagent begins execution. |
| `subagent.progress` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `progress_pct?`, `status_text` | Progress update. |
| `subagent.tool_called` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `tool_name`, `tool_args_preview` | Subagent invoked a tool. |
| `subagent.tool_completed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `tool_name`, `success`, `duration_ms` | Tool call finished. |
| `subagent.message_sent` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `message_preview`, `turn_index` | Follow-up message sent. |
| `subagent.message_received` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `response_preview`, `turn_index` | Response received. |
| `subagent.completed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `result_summary`, `duration_ms`, `token_usage` | Subagent finished successfully. |
| `subagent.failed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `error_code`, `error_message`, `duration_ms` | Subagent failed. |
| `subagent.cancelled` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `reason`, `duration_ms` | Subagent was cancelled. |
| `subagent.timeout` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `timeout_ms`, `partial_result?` | Subagent exceeded time limit. |
| `subagent.retried` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `attempt_number`, `retry_reason` | Subagent retry attempt. |
| `subagent.context_warning` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `context_usage_pct`, `threshold` | Context approaching limit. |
| `subagent.model_switched` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `from_model`, `to_model`, `reason` | Model changed mid-execution. |
| `subagent.paused` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `reason` | Subagent paused. |
| `subagent.resumed` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `trigger` | Subagent resumed. |
| `subagent.output_truncated` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `original_length`, `truncated_length` | Output was truncated. |
| `subagent.budget_warning` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `budget_used_pct`, `budget_limit` | Approaching budget limit. |
| `subagent.escalated` | `run_id`, `thread_id`, `agent_id`, `parent_run_id`, `child_run_id`, `escalation_reason`, `target` | Subagent escalated to parent. |

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

For every `crew.*` event below, the payload MUST preserve crew and child lineage together:
- `run_id`
- `thread_id`
- `crew_id`
- `parent_run_id?`
- `child_run_id?`
- `member_agent_ids[]` where membership matters

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md

| event_type | payload_fields | description |
|---|---|---|
| `crew.formed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `member_agent_ids[]`, `purpose` | Crew created. |
| `crew.member_added` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `agent_id`, `role` | Member joined. |
| `crew.member_removed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `agent_id`, `reason` | Member left. |
| `crew.coordination` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `coordination_type`, `details` | Inter-agent coordination. |
| `crew.completed` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `result_summary`, `duration_ms` | Crew finished. |
| `crew.disbanded` | `run_id`, `thread_id`, `crew_id`, `parent_run_id`, `child_run_id`, `reason` | Crew dissolved. |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md
### Dynamic context shrinking and effective-context projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

#### Source target target-0128
- Reconciliation action: [retired-token-1]_retirement
- Replace scope: exact_section
- Exact required items represented:
  - `[retired-token-1]`: projection is usable for context but may not reflect current runtime truth
  - [retired-token-1]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_[retired-token-1]_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Dynamic context shrinking is a canonical effective-context mechanism distinct from compaction, retrieval injection, rotation, and Assistant memory. It operates during ordinary tool-driven work and may replace stale effective-context blocks with shorter summaries while preserving canonical source state and rehydration references.
ContractRef: Dynamic context shrinking MUST preserve canonical source state and MUST operate on effective context only, not rewrite source-of-truth history. [Source: Prompt_Pipeline.md#dynamic-context-shrinking; storage-plan.md#canonical-child-run-records-and-batch-structure]

The default automatic shrinking scope is tool results. Retrieved-context blocks and plan/report blocks remain user-configurable optional categories. Shrinking uses conservative automatic triggers based on staleness and context pressure, with current working set items protected from automatic shrinking.
ContractRef: Automatic shrinking MUST respect protected current-working-set items and MUST NOT rewrite static system/provider/persona/tool-definition content. [Source: Prompt_Pipeline.md#dynamic-context-shrinking]

Runtime projection may emit `subagent.context_shrunk` and `subagent.context_rehydrated` events where effective-context state changes need to be inspectable or replayable. These events supplement, but do not replace, canonical child history and source references.
ContractRef: Context-shrinking events MUST be additive effective-context projections and MUST NOT become the sole durable record of planning evidence or child outputs. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#17-context--truncation]

### Parent mediation and required-vs-optional dependency state

Parent orchestration retains final mediation responsibility for child escalations, user questioning, and crew synthesis. Children do not directly interrogate the user by default. Required versus optional child dependency classification is part of the canonical runtime contract because it determines whether unresolved child work blocks dependent parent completion.
ContractRef: Parent orchestration MUST preserve required-vs-optional child dependency semantics and MUST mediate child-to-user escalation by default. [Source: orchestrator-subagent-integration.md#plan-mode-strategy--defaults; assistant-chat-design.md#14-subagents--crew]

Blocked state means external or runtime constraints prevent progress. `awaiting_parent` means the child is paused pending parent decision, clarification, context expansion, or user response. These are not interchangeable.
ContractRef: `blocked` and `awaiting_parent` MUST remain distinct canonical runtime meanings across permissions, events, chat projection, and recovery. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; assistant-chat-design.md#14-subagents--crew]
