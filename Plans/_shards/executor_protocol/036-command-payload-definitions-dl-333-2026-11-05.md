# Shard 036: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Executor_Protocol.md`

Source lines: L9145-L10080

Source SHA256: `11972653b14d23c33803c0fc7daf3992e0c3c95fc004448ae184f04ee83cff69`

---

## Command payload definitions (DL-333, 2026-11-05)

### EP-236 - Runtime Recovery Command Payload Definitions (UCC-089..UCC-095)

```yaml
plan_unit_id: EP-236
unit_type: command_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Typed payload definitions for the runtime recovery commands that the UI_Command_Catalog UCC-089..UCC-095
  overlay rows register under the shared cmd.runtime.* namespace (DL-333). The definitions block below gives
  each active command its args, owner request and owner result, and narrowed error and disabled-reason codes
  in pm.command_payload_definitions.v1. The catalog keeps ids, labels, availability and aliases; the strict
  schema overlay keeps the common envelope and the closed code sets. Blocked-episode identity (run_id,
  blocked_sequence, allowed_action_id) is required on every non-navigation command, and a pre-attempt blocked
  row never fabricates an attempt_id. The three runtime navigation commands keep run_id only, by the UCC-230
  identity exemptions recorded for DL-333 resolution 7. The overlay's optional baseline_ref and
  permission_carry_ref identity fields are named by the overlay row group alone: no catalog row, minimum-args
  entry or Executor contract assigns them to a concrete command, so no definition below restates them and
  they stay untyped until an owner defines them.
gui_related: true
gui_classification_reason: Types the arguments of the user-visible runtime recovery buttons and menu entries that GUI, chat, graph and orchestrator surfaces expose.
split_recommended: false
depends_on: [UCC-230, UCC-089, UCC-090, UCC-091, UCC-092, UCC-093, UCC-094, UCC-095, CV-333, DL-333]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 assigns to EP-236 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No pre-attempt-admissible command requires attempt_id, and no definition fabricates one.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_payload_definitions
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5 (DL-333)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/DESIGN.md sections 4-6"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens:
  - pm.command_payload_definitions.v1
  - cmd.runtime.approve
  - cmd.runtime.decline
  - cmd.runtime.retry_now
  - cmd.runtime.resume_after_prerequisite
  - cmd.runtime.restore_safe_point_then_retry
  - cmd.runtime.start_fresh_attempt
  - cmd.runtime.replan
  - cmd.runtime.skip_node
  - cmd.runtime.abort_run
  - cmd.runtime.open_attempt_details
  - cmd.runtime.locate_and_verify_recovery
  - cmd.runtime.abandon_recovery
  - cmd.runtime.open_queue_analysis
  - cmd.runtime.open_remediation_lineage
  - cmd.runtime.open_safe_point_history
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not require attempt_id on a pre-attempt-admissible command or fabricate one on a pre-attempt blocked row.
  - Do not restate the overlay's baseline_ref or permission_carry_ref on a command until canon assigns them.
owner_hints:
  - Plans/UI_Command_Catalog.md
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: EP-236
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.runtime.approve
      ucc_units: [UCC-089, UCC-092, UCC-093, UCC-094, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1199 approve minimum args; OrchestratorNodeApprovalRequestV1 required run_id; overlay UCC-089..095 required identity (UCC-230 row_groups)"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246)"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1199 approve minimum args node_id; OrchestratorNodeApprovalRequestV1 required node_id"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1199 approve minimum args attempt_id?; pre-attempt blocked rule (UI_Command_Catalog.md:1230-1231): a pre-attempt blocked row MUST NOT fabricate an attempt_id"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/RuntimeApproveV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/RuntimeApproveV3Result
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.decline
      ucc_units: [UCC-089, UCC-092, UCC-093, UCC-094, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1200 decline minimum args; OrchestratorNodeApprovalRequestV1 required run_id; overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246)"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1200 decline minimum args node_id; OrchestratorNodeApprovalRequestV1 required node_id"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1200 decline minimum args attempt_id?; pre-attempt blocked rule (UI_Command_Catalog.md:1230-1231)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/RuntimeDeclineV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/RuntimeDeclineV3Result
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.retry_now
      ucc_units: [UCC-089, UCC-090, UCC-092, UCC-093, UCC-094, UCC-095, UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1201 retry_now minimum args project_id; common optional field narrowed to required (UCC-230 envelope)"
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1201 retry_now minimum args; overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json); stale blocked_sequence refuses (UI_Command_Catalog.md:1220)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246)"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1201 retry_now minimum args node_id"
        attempt_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1201 retry_now minimum args attempt_id (post-attempt current exact value; no question mark in canon)"
        repo_id:
          type: id
          required: false
          default: none
          required_when: {field: baseline_target, in: [safe_point, historical_commit, worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1201 repo_id?; conditionally required in every baseline_target row (UI_Command_Catalog.md:1213-1218)"
        worktree_id:
          type: id
          required: false
          default: none
          required_when: {field: baseline_target, in: [safe_point, historical_commit, worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1201 worktree_id?; conditionally required in every baseline_target row (UI_Command_Catalog.md:1213-1218)"
        baseline_target:
          type: enum
          values: [safe_point, historical_commit, worktree_head]
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1201 baseline_target?; closed to safe_point | historical_commit | worktree_head (UI_Command_Catalog.md:1212)"
        safe_point_id:
          type: id
          required: false
          default: none
          required_when: {field: baseline_target, in: [safe_point]}
          provenance: canon
          source: "UI_Command_Catalog.md:1201 safe_point_id?; required when baseline_target = safe_point (UI_Command_Catalog.md:1213)"
        historical_commit_oid:
          type: string
          required: false
          default: none
          constraints: {min_length: 40, max_length: 64}
          required_when: {field: baseline_target, in: [historical_commit]}
          provenance: gap
          gap_note: >-
            Canon requires the full immutable historical_commit_oid and refuses abbreviated, branch, tag,
            remote, reflog, symbolic or moving refs (UI_Command_Catalog.md:1214), but states no format or
            length. JUDGMENT: bounds 40..64 cover full SHA-1 and SHA-256 Git object ids; a hex pattern could
            be added once an owner states the digest family.
        expected_head_oid:
          type: string
          required: false
          default: none
          constraints: {min_length: 40, max_length: 64}
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: gap
          gap_note: >-
            Canon requires the full expected_head_oid recomputed at bind time (UI_Command_Catalog.md:1215) but
            states no format. JUDGMENT: same 40..64 full-object-id bounds as historical_commit_oid.
        expected_state_sha256:
          type: sha256
          required: false
          default: none
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1201 and :1215 worktree_head row requires expected_state_sha256; FileSafe state digest must still match exactly"
        dirty_state_confirmed:
          type: boolean
          required: false
          default: none
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1201 dirty_state_confirmed?; dirty_state_confirmed = true when dirty in the worktree_head row (UI_Command_Catalog.md:1215)"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "UI_Command_Catalog.md:1201 retry_now minimum args idempotency_key; common optional field narrowed to required with its UCC-230 bound"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:RuntimeRetryNowResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.resume_after_prerequisite
      ucc_units: [UCC-089, UCC-092, UCC-093, UCC-094, UCC-095, UCC-100]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1202 resume_after_prerequisite minimum args; overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246)"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1202 resume_after_prerequisite minimum args node_id"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1202 attempt_id?; pre-attempt blocked rule (UI_Command_Catalog.md:1230-1231)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:RuntimeResumeAfterPrerequisiteResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.restore_safe_point_then_retry
      ucc_units: [UCC-089, UCC-090, UCC-092, UCC-093, UCC-094, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203 restore_safe_point_then_retry minimum args project_id; common optional field narrowed to required (UCC-230 envelope)"
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203; overlay UCC-089..095 required identity; Executor admission loads the canonical blocked episode by run_id (approved baseline-target retry and restore lifecycle, restore-before-rerun step 1)"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1; admission requires the same blocked_sequence as the live episode (Plans/Executor_Protocol.md approved baseline-target retry and restore lifecycle)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; admission requires the episode to expose that exact allowed_action_id (Plans/Executor_Protocol.md approved baseline-target retry and restore lifecycle)"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203 restore_safe_point_then_retry minimum args node_id"
        attempt_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203 attempt_id (post-attempt current exact value; no question mark in canon)"
        safe_point_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203 safe_point_id; safe_point row requires safe_point_id (UI_Command_Catalog.md:1213)"
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203 repo_id; safe_point row requires repo_id (UI_Command_Catalog.md:1213); common optional field narrowed to required (UCC-230 envelope)"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203 worktree_id; safe_point row requires worktree_id (UI_Command_Catalog.md:1213); common optional field narrowed to required (UCC-230 envelope)"
        baseline_target:
          type: const
          value: safe_point
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203 baseline_target \"safe_point\"; restore admits only baseline_target = safe_point (UI_Command_Catalog.md:1220)"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "UI_Command_Catalog.md:1203 idempotency_key; common optional field narrowed to required with its UCC-230 bound"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:RuntimeRestoreSafePointThenRetryResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.start_fresh_attempt
      ucc_units: [UCC-089, UCC-090, UCC-092, UCC-093, UCC-094, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1204 start_fresh_attempt minimum args project_id; common optional field narrowed to required (UCC-230 envelope)"
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1204; overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1; stale blocked_sequence refuses (UI_Command_Catalog.md:1220)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246)"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1204 start_fresh_attempt minimum args node_id"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1204 attempt_id?; pre-attempt blocked rule (UI_Command_Catalog.md:1230-1231)"
        repo_id:
          type: id
          required: false
          default: none
          required_when: {field: baseline_target, in: [safe_point, historical_commit, worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1204 repo_id?; conditionally required in every baseline_target row (UI_Command_Catalog.md:1213-1218)"
        worktree_id:
          type: id
          required: false
          default: none
          required_when: {field: baseline_target, in: [safe_point, historical_commit, worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1204 worktree_id?; conditionally required in every baseline_target row (UI_Command_Catalog.md:1213-1218)"
        baseline_target:
          type: enum
          values: [safe_point, historical_commit, worktree_head]
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1204 baseline_target?; closed to safe_point | historical_commit | worktree_head (UI_Command_Catalog.md:1212)"
        safe_point_id:
          type: id
          required: false
          default: none
          required_when: {field: baseline_target, in: [safe_point]}
          provenance: canon
          source: "UI_Command_Catalog.md:1204 safe_point_id?; required when baseline_target = safe_point (UI_Command_Catalog.md:1213)"
        historical_commit_oid:
          type: string
          required: false
          default: none
          constraints: {min_length: 40, max_length: 64}
          required_when: {field: baseline_target, in: [historical_commit]}
          provenance: gap
          gap_note: >-
            Same gap as cmd.runtime.retry_now.historical_commit_oid: full immutable commit OID required, format
            unstated (UI_Command_Catalog.md:1214); JUDGMENT: 40..64 full-object-id bounds.
        expected_head_oid:
          type: string
          required: false
          default: none
          constraints: {min_length: 40, max_length: 64}
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: gap
          gap_note: >-
            Same gap as cmd.runtime.retry_now.expected_head_oid: full recomputed head OID required, format
            unstated (UI_Command_Catalog.md:1215); JUDGMENT: 40..64 full-object-id bounds.
        expected_state_sha256:
          type: sha256
          required: false
          default: none
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1204 and :1215 worktree_head row requires expected_state_sha256; FileSafe state digest must still match exactly"
        dirty_state_confirmed:
          type: boolean
          required: false
          default: none
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1204 dirty_state_confirmed?; dirty_state_confirmed = true when dirty in the worktree_head row (UI_Command_Catalog.md:1215)"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "UI_Command_Catalog.md:1204 idempotency_key; common optional field narrowed to required with its UCC-230 bound"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:RuntimeStartFreshAttemptResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.replan
      ucc_units: [UCC-089, UCC-092, UCC-093, UCC-094, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1205 replan minimum args; overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246)"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1205 replan minimum args node_id"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1205 attempt_id?; pre-attempt blocked rule (UI_Command_Catalog.md:1230-1231)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:RuntimeReplanResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.skip_node
      ucc_units: [UCC-089, UCC-092, UCC-093, UCC-094, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1206 skip_node minimum args; overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246)"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1206 skip_node minimum args node_id"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1206 attempt_id?; pre-attempt blocked rule (UI_Command_Catalog.md:1230-1231)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:RuntimeSkipNodeResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.abort_run
      ucc_units: [UCC-089, UCC-092, UCC-093, UCC-094, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1207 abort_run minimum args { run_id }; overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity (the catalog minimum args list no per-node identity for abort_run; the overlay requires the row-group identity); integer minimum 1 per OrchestratorNodeApprovalRequestV1"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:RuntimeAbortRunResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.open_attempt_details
      ucc_units: [UCC-089, UCC-092, UCC-093, UCC-094, UCC-095]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1208 open_details minimum args; overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; open_details is projected first in the blocked episode's allowed_action_ids[] order (UI_Command_Catalog.md:140)"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1208 open_details minimum args node_id"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1208 attempt_id?; pre-attempt blocked rule (UI_Command_Catalog.md:1230-1231)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
    - command_id: cmd.runtime.locate_and_verify_recovery
      ucc_units: [UCC-094, UCC-092, UCC-093, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "Known-37 recovery-unavailable row (UI_Command_Catalog.md:137); every dispatch carries the exact current blocked episode (UI_Command_Catalog.md:142); overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; locate_and_verify_recovery is projected in the episode's allowed_action_ids[] order (UI_Command_Catalog.md:140)"
        node_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-089..095 optional identity node_id?"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "Known-37 pre-attempt payloads omit attempt_id; post-attempt payloads require the current exact value (UI_Command_Catalog.md:142)"
        recovery_source:
          type: path
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon prose only: "Locate collects one non-secret FileSafe-normalized recovery source and discloses
            verification requirements" (UI_Command_Catalog.md:142). The arg name is not stated; JUDGMENT:
            recovery_source, typed path because FileSafe owns normalization. No literal default (type path).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:LocateAndVerifyRecoveryResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required, degraded]
      aliases: []
    - command_id: cmd.runtime.abandon_recovery
      ucc_units: [UCC-094, UCC-092, UCC-093, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "Known-37 recovery-unavailable row (UI_Command_Catalog.md:138); every dispatch carries the exact current blocked episode (UI_Command_Catalog.md:142); overlay UCC-089..095 required identity"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "overlay UCC-089..095 required identity; integer minimum 1 per OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity; abandon_recovery is projected last in the episode's allowed_action_ids[] order (UI_Command_Catalog.md:140)"
        node_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-089..095 optional identity node_id?"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "Known-37 pre-attempt payloads omit attempt_id; post-attempt payloads require the current exact value (UI_Command_Catalog.md:142)"
        confirmation_value:
          type: const
          value: abandon_recovery_and_preserve_local_work
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon requires "explicit abandon_recovery_and_preserve_local_work confirmation" (UI_Command_Catalog.md:142)
            but names no arg; JUDGMENT: confirmation_value carrying the canon value as a const.
        confirmation_authority_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon requires "durable confirmation authority" (UI_Command_Catalog.md:142); neither the arg name nor
            the referenced record is defined. JUDGMENT: confirmation_authority_ref, typed ref.
        preserved_work_acknowledged:
          type: boolean
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon requires "preserved-work acknowledgement" (UI_Command_Catalog.md:142); neither the arg name nor
            its shape is defined. JUDGMENT: preserved_work_acknowledged, typed boolean true to acknowledge.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:AbandonRecoveryResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required, degraded]
      aliases: []
    - command_id: cmd.runtime.open_queue_analysis
      ucc_units: [UCC-091]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-091 payload { run_id, scheduler_pass_id } (UI_Command_Catalog.md:1225); DL-333 resolution 7 keeps run_id"
        scheduler_pass_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-091 payload { run_id, scheduler_pass_id } (UI_Command_Catalog.md:1225)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      identity_exemptions:
        - {field: blocked_sequence, decision: DL-333}
        - {field: allowed_action_id, decision: DL-333}
    - command_id: cmd.runtime.open_remediation_lineage
      ucc_units: [UCC-091]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-091 payload { run_id, remediation_root_id } (UI_Command_Catalog.md:1226); DL-333 resolution 7 keeps run_id"
        remediation_root_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-091 payload { run_id, remediation_root_id } (UI_Command_Catalog.md:1226)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      identity_exemptions:
        - {field: blocked_sequence, decision: DL-333}
        - {field: allowed_action_id, decision: DL-333}
    - command_id: cmd.runtime.open_safe_point_history
      ucc_units: [UCC-091]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-091 payload { run_id, safe_point_id? } (UI_Command_Catalog.md:1227); DL-333 resolution 7 keeps run_id"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UCC-091 payload { run_id, safe_point_id? } (UI_Command_Catalog.md:1227); overlay UCC-089..095 optional identity safe_point_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      identity_exemptions:
        - {field: blocked_sequence, decision: DL-333}
        - {field: allowed_action_id, decision: DL-333}
  results:
    RuntimeRetryNowResult:
      fields:
        attempt_id: {type: id, required: true, default: none, provenance: gap, gap_note: "successor attempt minted at durable admission (Executor_Protocol.md approved baseline-target retry and restore lifecycle step 5); no typed result schema exists"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "durable dispatch or owner receipt; the strict UICommandResponse requires a reference to the typed domain result (UI_Command_Catalog.md:143); no typed result schema exists"}
    RuntimeResumeAfterPrerequisiteResult:
      fields:
        attempt_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the resumed attempt of the existing blocked, paused or waiting episode (recovery verb copy, UI_Command_Catalog.md:1237-1243); no typed result schema exists"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "durable dispatch or owner receipt; no typed result schema exists"}
    RuntimeRestoreSafePointThenRetryResult:
      fields:
        restore_outcome: {type: enum, values: [restored_clean, restored_with_conflicts, restore_failed, restore_skipped, restore_refused, restore_recovery_required], required: true, default: none, provenance: gap, gap_note: "the closed restore_outcome enum is canon (Contracts_V0 safe_point.restored, Plans/Contracts_V0.md:2571-2583) but no typed command-result schema places it; only restored_clean or zero-mutation restore_skipped with target equality admits a successor (UI_Command_Catalog.md:1213)"}
        attempt_id: {type: id, required: true, default: none, provenance: gap, gap_note: "successor attempt minted only after the proved-ready baseline (Executor_Protocol.md approved baseline-target retry and restore lifecycle step 5); no typed result schema exists"}
        restore_transaction_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the exact restore transaction linked at admission; the field is named in the safe_point.restored event payload (Plans/Contracts_V0.md:2553-2567), no typed command-result schema"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the durable baseline receipt required for successor-attempt admission (UI_Command_Catalog.md:1213); no typed result schema exists"}
    RuntimeStartFreshAttemptResult:
      fields:
        attempt_id: {type: id, required: true, default: none, provenance: gap, gap_note: "successor attempt minted at durable admission; no typed result schema exists"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "durable dispatch or owner receipt; no typed result schema exists"}
    RuntimeReplanResult:
      fields:
        attempt_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the attempt the run continues under after replan_applied; canon gives only the wake_reason value (Plans/Contracts_V0.md:917), no typed result schema"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "durable dispatch or owner receipt; no typed result schema exists"}
    RuntimeSkipNodeResult:
      fields:
        node_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the skipped node; no typed result schema exists"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "durable dispatch or owner receipt; no typed result schema exists"}
    RuntimeAbortRunResult:
      fields:
        run_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the aborted run; no typed result schema exists"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "durable dispatch or owner receipt; no typed result schema exists"}
    LocateAndVerifyRecoveryResult:
      fields:
        resolved: {type: boolean, required: true, default: none, provenance: gap, gap_note: "a successful locate displays owner-verified material and receipt-backed resolved (UI_Command_Catalog.md:143); the named contract LocateAndVerifyRecoveryResult has no schema"}
        preserved_work: {type: boolean, required: true, default: none, provenance: gap, gap_note: "a successful locate displays preserved work (UI_Command_Catalog.md:143); no schema"}
        recovery_source: {type: path, required: true, default: none, provenance: gap, gap_note: "the one non-secret FileSafe-normalized recovery source collected (UI_Command_Catalog.md:142); no schema, no literal default (type path)"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "receipt identity of the locate result (UI_Command_Catalog.md:144 replay rule); no schema"}
    AbandonRecoveryResult:
      fields:
        abandoned_by_user: {type: boolean, required: true, default: none, provenance: gap, gap_note: "a successful abandonment displays receipt-backed abandoned_by_user (UI_Command_Catalog.md:143); the named contract AbandonRecoveryResult has no schema"}
        preserved_work: {type: boolean, required: true, default: none, provenance: gap, gap_note: "a successful abandonment displays preserved work (UI_Command_Catalog.md:143); no schema"}
        cleanup_performed: {type: const, value: false, required: true, default: none, provenance: gap, gap_note: "a successful abandonment displays cleanup_performed = false (UI_Command_Catalog.md:143); const false is canon prose, the field placement has no schema"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "receipt identity of the abandonment (UI_Command_Catalog.md:144 replay rule); no schema"}
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-230, ContractName:Plans/UI_Command_Catalog.md#UCC-089, ContractName:Plans/UI_Command_Catalog.md#UCC-090, ContractName:Plans/UI_Command_Catalog.md#UCC-091, ContractName:Plans/UI_Command_Catalog.md#UCC-092, ContractName:Plans/UI_Command_Catalog.md#UCC-093, ContractName:Plans/UI_Command_Catalog.md#UCC-094, ContractName:Plans/UI_Command_Catalog.md#UCC-095, ContractName:Plans/Contracts_V0.md#safe_point.restored, ContractName:Plans/projects_refresh_fix_contracts.schema.json
