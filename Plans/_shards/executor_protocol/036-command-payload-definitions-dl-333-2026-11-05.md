# Shard 036: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Executor_Protocol.md`

Source lines: L9139-L10675

Source SHA256: `d0e92f093ddf7cb354e3c3f8120a54a1b22441d6f30d37b5a2104b4bd103901a`

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
  they stay untyped until an owner defines them. Amended 2026-11-07 (DL-341): cmd.runtime.approve and
  cmd.runtime.decline define both shapes of their owner request, the node shape and the HITL-038 chat-tool shape,
  selected by approval_kind; blocked_sequence and allowed_action_id are required on the node branch only, by the
  UCC-230 conditional identity exemptions. cmd.runtime.locate_and_verify_recovery and cmd.runtime.abandon_recovery
  carry the fields of the closed LocateAndVerifyRecoveryRequest and AbandonRecoveryRequest, and their results the
  fields of the closed 1.0.0 domain results (Plans/Commands_System.md, Plans/Contracts_V0.md). Every judgment a
  definition makes is in its judgments list.
gui_related: true
gui_classification_reason: Types the arguments of the user-visible runtime recovery buttons and menu entries that GUI, chat, graph and orchestrator surfaces expose.
split_recommended: false
depends_on: [UCC-230, UCC-089, UCC-090, UCC-091, UCC-092, UCC-093, UCC-094, UCC-095, CV-333, DL-333, DL-341, HITL-038]
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
        approval_kind:
          type: enum
          values: [orchestrator_node, chat_tool]
          required: true
          default: none
          provenance: gap
          gap_note: >-
            DL-341 (UCC-230 identity_exemptions branch_field approval_kind) requires a discriminator over the two
            shapes of RuntimeApproveV3Request (HITL-038, Plans/human-in-the-loop.md:2739). chat_tool is canon: the
            approval_kind const of RuntimeApproveV3ToolRequest (Plans/projects_refresh_fix_contracts.schema.json).
            The node shape OrchestratorNodeApprovalRequestV1 is closed and has no approval_kind, so canon gives the
            node branch no request value; orchestrator_node is taken from the approval_kind const of
            RuntimeApproveV3NodeResult in the same schema. The handler does not forward approval_kind into the
            node request, whose additionalProperties is false.
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1199 approve minimum args; required by both OrchestratorNodeApprovalRequestV1 and RuntimeApproveV3ToolRequest (Plans/projects_refresh_fix_contracts.schema.json); overlay UCC-089..095 required identity (UCC-230 row_groups)"
        node_id:
          type: id
          required: false
          default: none
          required_when: {field: approval_kind, in: [orchestrator_node]}
          forbidden_when: {field: approval_kind, in: [chat_tool]}
          provenance: canon
          source: "UI_Command_Catalog.md:1199 approve minimum args node_id; OrchestratorNodeApprovalRequestV1 requires node_id; RuntimeApproveV3ToolRequest is additionalProperties false without node_id (Plans/projects_refresh_fix_contracts.schema.json)"
        blocked_sequence:
          type: integer
          required: false
          default: none
          constraints: {minimum: 1}
          required_when: {field: approval_kind, in: [orchestrator_node]}
          forbidden_when: {field: approval_kind, in: [chat_tool]}
          provenance: canon
          source: "OrchestratorNodeApprovalRequestV1 requires blocked_sequence, integer minimum 1 (Plans/projects_refresh_fix_contracts.schema.json); blocked_sequence starts at 1 (Plans/Contracts_V0.md:600); required on the node branch only by the DL-341 conditional exemption (UCC-230 identity_exemptions); RuntimeApproveV3ToolRequest has no blocked_sequence"
        allowed_action_id:
          type: id
          required: false
          default: none
          required_when: {field: approval_kind, in: [orchestrator_node]}
          forbidden_when: {field: approval_kind, in: [chat_tool]}
          provenance: canon
          source: "overlay UCC-089..095 required identity, required on the node branch only by the DL-341 conditional exemption (UCC-230 identity_exemptions); blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246); RuntimeApproveV3ToolRequest has no allowed_action_id"
        attempt_id:
          type: id
          required: false
          default: none
          forbidden_when: {field: approval_kind, in: [chat_tool]}
          provenance: canon
          source: "UI_Command_Catalog.md:1199 approve minimum args attempt_id?; OrchestratorNodeApprovalRequestV1 optional attempt_id; RuntimeApproveV3ToolRequest has no attempt_id; pre-attempt blocked rule (UI_Command_Catalog.md:1230-1231): a pre-attempt blocked row MUST NOT fabricate an attempt_id"
        schema_id:
          type: const
          value: pm.runtime.chat_tool_decision.v3
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required schema_id const pm.runtime.chat_tool_decision.v3 (Plans/projects_refresh_fix_contracts.schema.json); OrchestratorNodeApprovalRequestV1 has no schema_id"
        schema_version:
          type: const
          value: "3.0.0"
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required schema_version const 3.0.0 (Plans/projects_refresh_fix_contracts.schema.json)"
        context:
          type: contract
          ref: Plans/shared_integration_runtime.schema.json#/$defs/WorkflowCommandContextV1
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required context, $ref WorkflowCommandContextV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        approval_id:
          type: id
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required approval_id, string 1..256 (Plans/projects_refresh_fix_contracts.schema.json)"
        tool_id:
          type: id
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required tool_id, string 1..256 (Plans/projects_refresh_fix_contracts.schema.json)"
        request_sha256:
          type: sha256
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required request_sha256, pattern ^[0-9a-f]{64}$ (Plans/projects_refresh_fix_contracts.schema.json)"
        normalized_target_ref:
          type: ref
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required normalized_target_ref, string 1..256 (Plans/projects_refresh_fix_contracts.schema.json)"
        target_sha256:
          type: sha256
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required target_sha256, pattern ^[0-9a-f]{64}$ (Plans/projects_refresh_fix_contracts.schema.json)"
        expected_request_revision:
          type: integer
          required: false
          default: none
          constraints: {minimum: 0}
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required expected_request_revision, integer minimum 0 (Plans/projects_refresh_fix_contracts.schema.json)"
        request_evidence:
          type: contract
          ref: Plans/shared_integration_runtime.schema.json#/$defs/OwnerEvidenceRefV1
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required request_evidence, $ref OwnerEvidenceRefV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        person_evidence:
          type: contract
          ref: Plans/shared_integration_runtime.schema.json#/$defs/OwnerEvidenceRefV1
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required person_evidence, $ref OwnerEvidenceRefV1 (Plans/projects_refresh_fix_contracts.schema.json); HITL-038 protected person evidence (Plans/human-in-the-loop.md:2739)"
        decision:
          type: const
          value: approved
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required decision const approved (Plans/projects_refresh_fix_contracts.schema.json); HITL-038: wrong decisions refuse (Plans/human-in-the-loop.md:2739)"
        expires_at_utc:
          type: timestamp
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeApproveV3ToolRequest required expires_at_utc, string format date-time (Plans/projects_refresh_fix_contracts.schema.json); no literal default (type timestamp)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/RuntimeApproveV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/RuntimeApproveV3Result
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
      identity_exemptions:
        - {field: blocked_sequence, decision: DL-341}
        - {field: allowed_action_id, decision: DL-341}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The catalog requires command_kind metadata on recovery commands (UCC-095, UI_Command_Catalog.md:6852) but states no value for cmd.runtime.approve; domain_action because approval resolves the blocked episode (node.unblocked, Wiring_Matrix.production.json catalog.runtime_approve expected_event_types) or the chat-tool request (approval.chat_tool_resolved, the event_types const of RuntimeApproveV3ToolResult in Plans/projects_refresh_fix_contracts.schema.json and HITL-038, Plans/human-in-the-loop.md:2739)."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "No catalog row states disabled reasons for cmd.runtime.approve; chosen from the closed set: the node branch needs a live blocked episode, and both branches revalidate the original pending request and refuse stale currentness (HITL-038, Plans/human-in-the-loop.md:2739)."
        - key: field:allowed_action_id
          choice: "kept in args on the node branch; not forwarded into OrchestratorNodeApprovalRequestV1"
          gap_note: "The overlay requires allowed_action_id (UI_Command_Catalog.md:8858), but the node owner request OrchestratorNodeApprovalRequestV1 is additionalProperties false with no allowed_action_id; canon does not say how the handler maps the arg into the closed request."
    - command_id: cmd.runtime.decline
      ucc_units: [UCC-089, UCC-092, UCC-093, UCC-094, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        approval_kind:
          type: enum
          values: [orchestrator_node, chat_tool]
          required: true
          default: none
          provenance: gap
          gap_note: >-
            DL-341 (UCC-230 identity_exemptions branch_field approval_kind) requires a discriminator over the two
            shapes of RuntimeDeclineV3Request (HITL-038, Plans/human-in-the-loop.md:2739). chat_tool is canon: the
            approval_kind const of RuntimeDeclineV3ToolRequest (Plans/projects_refresh_fix_contracts.schema.json).
            The node shape OrchestratorNodeApprovalRequestV1 is closed and has no approval_kind, so canon gives the
            node branch no request value; orchestrator_node is taken from the approval_kind const of
            RuntimeDeclineV3NodeResult in the same schema. The handler does not forward approval_kind into the
            node request, whose additionalProperties is false.
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1200 decline minimum args; required by both OrchestratorNodeApprovalRequestV1 and RuntimeDeclineV3ToolRequest (Plans/projects_refresh_fix_contracts.schema.json); overlay UCC-089..095 required identity (UCC-230 row_groups)"
        node_id:
          type: id
          required: false
          default: none
          required_when: {field: approval_kind, in: [orchestrator_node]}
          forbidden_when: {field: approval_kind, in: [chat_tool]}
          provenance: canon
          source: "UI_Command_Catalog.md:1200 decline minimum args node_id; OrchestratorNodeApprovalRequestV1 requires node_id; RuntimeDeclineV3ToolRequest is additionalProperties false without node_id (Plans/projects_refresh_fix_contracts.schema.json)"
        blocked_sequence:
          type: integer
          required: false
          default: none
          constraints: {minimum: 1}
          required_when: {field: approval_kind, in: [orchestrator_node]}
          forbidden_when: {field: approval_kind, in: [chat_tool]}
          provenance: canon
          source: "OrchestratorNodeApprovalRequestV1 requires blocked_sequence, integer minimum 1 (Plans/projects_refresh_fix_contracts.schema.json); blocked_sequence starts at 1 (Plans/Contracts_V0.md:600); required on the node branch only by the DL-341 conditional exemption (UCC-230 identity_exemptions); RuntimeDeclineV3ToolRequest has no blocked_sequence"
        allowed_action_id:
          type: id
          required: false
          default: none
          required_when: {field: approval_kind, in: [orchestrator_node]}
          forbidden_when: {field: approval_kind, in: [chat_tool]}
          provenance: canon
          source: "overlay UCC-089..095 required identity, required on the node branch only by the DL-341 conditional exemption (UCC-230 identity_exemptions); blocked-state actions map from allowed_action_ids[] (UI_Command_Catalog.md:1246); RuntimeDeclineV3ToolRequest has no allowed_action_id"
        attempt_id:
          type: id
          required: false
          default: none
          forbidden_when: {field: approval_kind, in: [chat_tool]}
          provenance: canon
          source: "UI_Command_Catalog.md:1200 decline minimum args attempt_id?; OrchestratorNodeApprovalRequestV1 optional attempt_id; RuntimeDeclineV3ToolRequest has no attempt_id; pre-attempt blocked rule (UI_Command_Catalog.md:1230-1231): a pre-attempt blocked row MUST NOT fabricate an attempt_id"
        schema_id:
          type: const
          value: pm.runtime.chat_tool_decision.v3
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required schema_id const pm.runtime.chat_tool_decision.v3 (Plans/projects_refresh_fix_contracts.schema.json); OrchestratorNodeApprovalRequestV1 has no schema_id"
        schema_version:
          type: const
          value: "3.0.0"
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required schema_version const 3.0.0 (Plans/projects_refresh_fix_contracts.schema.json)"
        context:
          type: contract
          ref: Plans/shared_integration_runtime.schema.json#/$defs/WorkflowCommandContextV1
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required context, $ref WorkflowCommandContextV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        approval_id:
          type: id
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required approval_id, string 1..256 (Plans/projects_refresh_fix_contracts.schema.json)"
        tool_id:
          type: id
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required tool_id, string 1..256 (Plans/projects_refresh_fix_contracts.schema.json)"
        request_sha256:
          type: sha256
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required request_sha256, pattern ^[0-9a-f]{64}$ (Plans/projects_refresh_fix_contracts.schema.json)"
        normalized_target_ref:
          type: ref
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required normalized_target_ref, string 1..256 (Plans/projects_refresh_fix_contracts.schema.json)"
        target_sha256:
          type: sha256
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required target_sha256, pattern ^[0-9a-f]{64}$ (Plans/projects_refresh_fix_contracts.schema.json)"
        expected_request_revision:
          type: integer
          required: false
          default: none
          constraints: {minimum: 0}
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required expected_request_revision, integer minimum 0 (Plans/projects_refresh_fix_contracts.schema.json)"
        request_evidence:
          type: contract
          ref: Plans/shared_integration_runtime.schema.json#/$defs/OwnerEvidenceRefV1
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required request_evidence, $ref OwnerEvidenceRefV1 (Plans/projects_refresh_fix_contracts.schema.json)"
        person_evidence:
          type: contract
          ref: Plans/shared_integration_runtime.schema.json#/$defs/OwnerEvidenceRefV1
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required person_evidence, $ref OwnerEvidenceRefV1 (Plans/projects_refresh_fix_contracts.schema.json); HITL-038 protected person evidence (Plans/human-in-the-loop.md:2739)"
        decision:
          type: const
          value: declined
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required decision const declined (Plans/projects_refresh_fix_contracts.schema.json); HITL-038: wrong decisions refuse (Plans/human-in-the-loop.md:2739)"
        expires_at_utc:
          type: timestamp
          required: false
          default: none
          required_when: {field: approval_kind, in: [chat_tool]}
          forbidden_when: {field: approval_kind, in: [orchestrator_node]}
          provenance: canon
          source: "RuntimeDeclineV3ToolRequest required expires_at_utc, string format date-time (Plans/projects_refresh_fix_contracts.schema.json); no literal default (type timestamp)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/RuntimeDeclineV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/RuntimeDeclineV3Result
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
      identity_exemptions:
        - {field: blocked_sequence, decision: DL-341}
        - {field: allowed_action_id, decision: DL-341}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The catalog requires command_kind metadata on recovery commands (UCC-095, UI_Command_Catalog.md:6852) but states no value for cmd.runtime.decline; domain_action because decline resolves the blocked episode (a recorded receipt; Wiring_Matrix.production.json catalog.runtime_decline lists no expected event) or the chat-tool request (approval.chat_tool_resolved, the event_types const of RuntimeDeclineV3ToolResult in Plans/projects_refresh_fix_contracts.schema.json and HITL-038, Plans/human-in-the-loop.md:2739)."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "No catalog row states disabled reasons for cmd.runtime.decline; chosen from the closed set: the node branch needs a live blocked episode, and both branches revalidate the original pending request and refuse stale currentness (HITL-038, Plans/human-in-the-loop.md:2739)."
        - key: field:allowed_action_id
          choice: "kept in args on the node branch; not forwarded into OrchestratorNodeApprovalRequestV1"
          gap_note: "The overlay requires allowed_action_id (UI_Command_Catalog.md:8858), but the node owner request OrchestratorNodeApprovalRequestV1 is additionalProperties false with no allowed_action_id; canon does not say how the handler maps the arg into the closed request."
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
          source: "overlay UCC-089..095 required identity; integer minimum 1: blocked_sequence starts at 1 (Plans/Contracts_V0.md:600), as in OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json); stale blocked_sequence refuses (UI_Command_Catalog.md:1220)"
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
          source: "UI_Command_Catalog.md:1201 safe_point_id?; required when baseline_target = safe_point (UI_Command_Catalog.md:1216)"
        historical_commit_oid:
          type: string
          required: false
          default: none
          constraints: {min_length: 40, max_length: 64}
          required_when: {field: baseline_target, in: [historical_commit]}
          provenance: gap
          gap_note: >-
            Canon requires the full immutable historical_commit_oid and refuses abbreviated, branch, tag,
            remote, reflog, symbolic or moving refs (UI_Command_Catalog.md:1217), but states no format or
            length. Chosen: bounds 40..64 cover full SHA-1 and SHA-256 Git object ids; a hex pattern could
            be added once an owner states the digest family.
        expected_head_oid:
          type: string
          required: false
          default: none
          constraints: {min_length: 40, max_length: 64}
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: gap
          gap_note: >-
            Canon requires the full expected_head_oid recomputed at bind time (UI_Command_Catalog.md:1218) but
            states no format. Chosen: same 40..64 full-object-id bounds as historical_commit_oid.
        expected_state_sha256:
          type: sha256
          required: false
          default: none
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1201 and :1218 worktree_head row requires expected_state_sha256; FileSafe state digest must still match exactly"
        dirty_state_confirmed:
          type: boolean
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon makes it optional (UI_Command_Catalog.md:1201 dirty_state_confirmed?) and requires the value true
            only when the worktree is dirty (UI_Command_Catalog.md:1218 "dirty_state_confirmed = true when dirty";
            Plans/Executor_Protocol.md:672 "explicit dirty-state confirmation when dirty"). Dirtiness is owner
            state, not an arg, so the vocabulary cannot condition on it: the field stays optional and the owner
            refuses a dirty worktree_head bind that does not carry true.
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
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value for this command; domain_action because it admits and mints a successor attempt (Plans/Executor_Protocol.md:688)."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "No catalog row states disabled reasons for this command; chosen from the closed set: it needs the live blocked episode that exposes its allowed_action_id (UI_Command_Catalog.md:1246), and a stale blocked_sequence or projection refuses (UI_Command_Catalog.md:1220)."
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
          source: "overlay UCC-089..095 required identity; integer minimum 1: blocked_sequence starts at 1 (Plans/Contracts_V0.md:600), as in OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
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
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value for this command; domain_action because it continues the blocked episode (node.unblocked, scheduler.pass in Wiring_Matrix.production.json catalog.runtime_resume_after_prerequisite)."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "No catalog row states disabled reasons for this command; chosen from the closed set: it needs the live blocked episode that exposes its allowed_action_id (UI_Command_Catalog.md:1246), and a stale blocked_sequence or projection refuses (UI_Command_Catalog.md:1220)."
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
          source: "overlay UCC-089..095 required identity; integer minimum 1: blocked_sequence starts at 1 (Plans/Contracts_V0.md:600), as in OrchestratorNodeApprovalRequestV1; admission requires the same blocked_sequence as the live episode (Plans/Executor_Protocol.md approved baseline-target retry and restore lifecycle)"
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
          source: "UI_Command_Catalog.md:1203 safe_point_id; safe_point row requires safe_point_id (UI_Command_Catalog.md:1216)"
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203 repo_id; safe_point row requires repo_id (UI_Command_Catalog.md:1216); common optional field narrowed to required (UCC-230 envelope)"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1203 worktree_id; safe_point row requires worktree_id (UI_Command_Catalog.md:1216); common optional field narrowed to required (UCC-230 envelope)"
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
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required]
      owner_state_codes:
        - {owner_state: permission_denied, code: permission_required}
        - {owner_state: operation_in_progress, code: blocked_state_required}
        - {owner_state: safe_point_missing, code: blocked_state_required}
        - {owner_state: state_changed, code: stale_projection}
      aliases:
        - {command_id: cmd.orchestrator.restore_safe_point_then_retry, kind: compatibility_alias,
           source: "UI_Command_Catalog.md:10958 (it normalizes to this command and remains a compatibility alias for it) and the exact recovery command contracts table (UI_Command_Catalog.md:11186: normalization.kind compatibility_alias, normalizes_to_contract cmd.runtime.restore_safe_point_then_retry, alias_of_command_id cmd.orchestrator.safe_point_retry, the wrapper of :11185, whose own alias_of_command_id is null); it accepts the wrapper input with its optional permission_snapshot_id and applies the wrapper's identical permission-validation and consumption transform before dispatching this command's exact canonical payload, with no handler, result, effect, admission or idempotency domain of its own (UI_Command_Catalog.md:10963; Plans/Executor_Protocol.md:677); UCC-230 non_definition_tokens targets it to this command"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value for this command; domain_action because it runs the FileSafe restore and admits a successor attempt (Plans/Executor_Protocol.md:676-688)."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection, permission_required]
          gap_note: "No catalog row states disabled reasons for cmd.runtime.restore_safe_point_then_retry itself. Its wrapper cmd.orchestrator.safe_point_retry, which shares its admission decision (Plans/Executor_Protocol.md:677), keeps safe_point_missing, state_changed, permission_denied and operation_in_progress (UI_Command_Catalog.md:10962). All four map through UCC-230 owner_state_code_map: permission_denied to permission_required, operation_in_progress to blocked_state_required, safe_point_missing to blocked_state_required and state_changed to stale_projection (the last two added to the map under DL-341), recorded in owner_state_codes."
        - key: field:idempotency_key
          choice: required
          gap_note: "Canon disagrees: the catalog minimum args require idempotency_key (UI_Command_Catalog.md:1203), while Plans/Executor_Protocol.md:677 gives the exact canonical payload { project_id, run_id, node_id, blocked_sequence, attempt_id, safe_point_id, repo_id, worktree_id, baseline_target: \"safe_point\" } with no idempotency_key (and no allowed_action_id, which the overlay and Plans/Executor_Protocol.md:676 require). The definition follows the catalog row and the overlay; not settled here."
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
          source: "overlay UCC-089..095 required identity; integer minimum 1: blocked_sequence starts at 1 (Plans/Contracts_V0.md:600), as in OrchestratorNodeApprovalRequestV1; stale blocked_sequence refuses (UI_Command_Catalog.md:1220)"
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
          source: "UI_Command_Catalog.md:1204 safe_point_id?; required when baseline_target = safe_point (UI_Command_Catalog.md:1216)"
        historical_commit_oid:
          type: string
          required: false
          default: none
          constraints: {min_length: 40, max_length: 64}
          required_when: {field: baseline_target, in: [historical_commit]}
          provenance: gap
          gap_note: >-
            Same gap as cmd.runtime.retry_now.historical_commit_oid: full immutable commit OID required, format
            unstated (UI_Command_Catalog.md:1217); chosen: 40..64 full-object-id bounds.
        expected_head_oid:
          type: string
          required: false
          default: none
          constraints: {min_length: 40, max_length: 64}
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: gap
          gap_note: >-
            Same gap as cmd.runtime.retry_now.expected_head_oid: full recomputed head OID required, format
            unstated (UI_Command_Catalog.md:1218); chosen: 40..64 full-object-id bounds.
        expected_state_sha256:
          type: sha256
          required: false
          default: none
          required_when: {field: baseline_target, in: [worktree_head]}
          provenance: canon
          source: "UI_Command_Catalog.md:1204 and :1218 worktree_head row requires expected_state_sha256; FileSafe state digest must still match exactly"
        dirty_state_confirmed:
          type: boolean
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon makes it optional (UI_Command_Catalog.md:1204 dirty_state_confirmed?) and requires the value true
            only when the worktree is dirty (UI_Command_Catalog.md:1218 "dirty_state_confirmed = true when dirty";
            Plans/Executor_Protocol.md:672 "explicit dirty-state confirmation when dirty"). Dirtiness is owner
            state, not an arg, so the vocabulary cannot condition on it: the field stays optional and the owner
            refuses a dirty worktree_head bind that does not carry true.
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
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value for this command; domain_action because it admits and mints a successor attempt (Plans/Executor_Protocol.md:688; scheduler.pass in Wiring_Matrix.production.json catalog.runtime_start_fresh_attempt)."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "No catalog row states disabled reasons for this command; chosen from the closed set: it needs the live blocked episode that exposes its allowed_action_id (UI_Command_Catalog.md:1246), and a stale blocked_sequence or projection refuses (UI_Command_Catalog.md:1220)."
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
          source: "overlay UCC-089..095 required identity; integer minimum 1: blocked_sequence starts at 1 (Plans/Contracts_V0.md:600), as in OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
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
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value for this command; domain_action because it emits goal.replanned (Wiring_Matrix.production.json catalog.runtime_replan)."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "No catalog row states disabled reasons for this command; chosen from the closed set: it needs the live blocked episode that exposes its allowed_action_id (UI_Command_Catalog.md:1246), and a stale blocked_sequence or projection refuses (UI_Command_Catalog.md:1220)."
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
          source: "overlay UCC-089..095 required identity; integer minimum 1: blocked_sequence starts at 1 (Plans/Contracts_V0.md:600), as in OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
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
        reason_code:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: "The name and its requiredness are canon: the HITL Skip And Cancel Commands passage gives cmd.runtime.skip_node the fields node_id, run_id, reason_code and operator_note? (Plans/human-in-the-loop.md:2669). Canon gives no type, value set or bounds for reason_code, and the catalog minimum args (UI_Command_Catalog.md:1206) do not list it; a plain string is chosen until the owner names its codes."
        operator_note:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: "The name and its optionality are canon (operator_note?, Plans/human-in-the-loop.md:2669). Canon gives no type, length bound or content rule; a free-text string with no bound is chosen until the owner sets one."
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:RuntimeSkipNodeResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value for this command; domain_action because it records a skip receipt for the node (Wiring_Matrix.production.json catalog.runtime_skip_node)."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "No catalog row states disabled reasons for this command; chosen from the closed set: it needs the live blocked episode that exposes its allowed_action_id (UI_Command_Catalog.md:1246), and a stale blocked_sequence or projection refuses (UI_Command_Catalog.md:1220)."
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
          source: "overlay UCC-089..095 required identity (the catalog minimum args list no per-node identity for abort_run; the overlay requires the row-group identity); integer minimum 1: blocked_sequence starts at 1 (Plans/Contracts_V0.md:600), as in OrchestratorNodeApprovalRequestV1"
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
          provenance: gap
          gap_note: "The name and type are canon: the overlay lists node_id? as an optional identity of the UCC-089..095 rows (UI_Command_Catalog.md:8858). Canon does not require it for abort_run: the catalog minimum args are { run_id } (UI_Command_Catalog.md:1207) and the HITL field list is run_id, reason_code, requested_by and created_at_utc (Plans/human-in-the-loop.md:2670). It is required here because the required blocked_sequence is monotonic per { run_id, node_id } (Plans/Contracts_V0.md:600), so run_id and blocked_sequence alone do not name one blocked episode when two nodes of a run are blocked."
        reason_code:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: "The name and its requiredness are canon: the HITL Skip And Cancel Commands passage gives cmd.runtime.abort_run the fields run_id, reason_code, requested_by and created_at_utc (Plans/human-in-the-loop.md:2670). Canon gives no type, value set or bounds for reason_code, and the catalog minimum args (UI_Command_Catalog.md:1207) do not list it; a plain string is chosen until the owner names its codes."
        created_at_utc:
          type: timestamp
          required: true
          default: none
          provenance: gap
          gap_note: "The name and its requiredness are canon (Plans/human-in-the-loop.md:2670). Canon gives no format; timestamp is chosen from the _utc suffix, with no literal default (type timestamp), and canon does not say whether the UI or the handler stamps it."
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:RuntimeAbortRunResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value for this command; domain_action because it emits goal_run.stopped (Wiring_Matrix.production.json catalog.runtime_abort_run)."
        - key: omitted:requested_by
          choice: "left out of args; the UICommand envelope actor_ref carries the requester"
          gap_note: "The HITL field list names requested_by for cmd.runtime.abort_run (Plans/human-in-the-loop.md:2670). The requester of a UICommand is the envelope actor_ref, which UCC-230 lists as required_not_restated, so a definition can carry it neither under that name nor as requested_by without restating the actor; UCC-230 has no form that records requested_by as the canon name of actor_ref. Canon does not say that requested_by is anything other than the actor."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "No catalog row states disabled reasons for this command; chosen from the closed set: it needs the live blocked episode that exposes its allowed_action_id (UI_Command_Catalog.md:1246), and a stale blocked_sequence or projection refuses (UI_Command_Catalog.md:1220)."
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
          source: "overlay UCC-089..095 required identity; integer minimum 1: blocked_sequence starts at 1 (Plans/Contracts_V0.md:600), as in OrchestratorNodeApprovalRequestV1 (Plans/projects_refresh_fix_contracts.schema.json)"
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
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value for this command; navigation_wrapper because open_details opens the attempt detail view without a domain effect (UI_Command_Catalog.md:1208; Wiring_Matrix.production.json catalog.runtime_open_attempt_details records a no-persist receipt)."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "No catalog row states disabled reasons for cmd.runtime.open_attempt_details; chosen from the closed set: open_details is offered from the live blocked episode's allowed_action_ids[] (UI_Command_Catalog.md:140, :1246), and a stale projection refuses."
    - command_id: cmd.runtime.locate_and_verify_recovery
      ucc_units: [UCC-094, UCC-092, UCC-093, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        schema_version:
          type: const
          value: "1.0.0"
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon names the field and the contract version: "LocateAndVerifyRecoveryRequest is closed at 1.0.0 and
            requires schema_version" (Plans/Commands_System.md:4374; Plans/Contracts_V0.md:334 "closed 1.0.0
            contracts"). It does not state the field's type or literal value; const "1.0.0" reads the closed
            contract version as the field's value.
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires project_id (Plans/Commands_System.md:4374; Plans/Contracts_V0.md:334); common optional field narrowed to required (UCC-230 envelope)"
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires run_id (Plans/Commands_System.md:4374; Plans/Contracts_V0.md:334); overlay UCC-089..095 required identity"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires node_id (Plans/Commands_System.md:4374; Plans/Contracts_V0.md:334); overlay optional identity node_id? narrowed to required"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires blocked_sequence (Plans/Commands_System.md:4374); blocked_sequence is monotonic per { run_id, node_id } and starts at 1 (Plans/Contracts_V0.md:600); overlay UCC-089..095 required identity"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity (UI_Command_Catalog.md:8858); admitted only from the current ordered safe_point.recovery_unavailable.allowed_action_ids[] (Plans/Commands_System.md:4372; UI_Command_Catalog.md:140)"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "the conditional attempt field (Plans/Commands_System.md:4374): pre-attempt dispatch omits attempt_id, post-attempt dispatch requires the exact prior-attempt identity (Plans/Commands_System.md:4372; Plans/Contracts_V0.md:334; UI_Command_Catalog.md:142)"
        safe_point_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires safe_point_id (Plans/Commands_System.md:4374; Plans/Contracts_V0.md:334); overlay optional identity safe_point_id? narrowed to required"
        anchor_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires anchor_ref (Plans/Commands_System.md:4374; Plans/Contracts_V0.md:334); the safe_point.recovery_unavailable payload's anchor_ref is a non-empty string (Plans/event_payload_safe_point_recovery_unavailable.schema.json)"
        expected_snapshot_refs:
          type: list
          item: {type: ref}
          required: true
          default: none
          constraints: {min_items: 1, unique_items: true}
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires expected_snapshot_refs, the exact snapshot set (Plans/Commands_System.md:4374; Plans/Contracts_V0.md:334); the snapshot set is exact and non-empty, a mismatched set refuses (Plans/Commands_System.md:4372); it matches the event's snapshot_refs, minItems 1 and uniqueItems (Plans/event_payload_safe_point_recovery_unavailable.schema.json)"
        expected_recovery_unavailable_reason_code:
          type: enum
          values: [snapshot_missing, snapshot_corrupt, snapshot_scope_unsupported, snapshot_identity_stale, snapshot_unanchored]
          required: true
          default: none
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires expected_recovery_unavailable_reason_code (Plans/Commands_System.md:4374); the reason enum is exactly these five values and unknown values fail closed (Plans/Contracts_V0.md:332)"
        recovery_source_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires recovery_source_ref (Plans/Commands_System.md:4374; Plans/Contracts_V0.md:334 'Locate additionally requires recovery_source_ref'); a raw path or moving ref refuses before mutation (Plans/Commands_System.md:4372), so the field is a ref, not a path"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "LocateAndVerifyRecoveryRequest requires idempotency_key (Plans/Commands_System.md:4374); common optional field narrowed to required with its UCC-230 bound"
        expected_manifest_sha256:
          type: sha256
          required: false
          default: none
          provenance: canon
          source: "Optional expected_manifest_sha256 is evidence only (Plans/Commands_System.md:4374)"
        permission_snapshot_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "Optional permission_snapshot_id is evidence only (Plans/Commands_System.md:4374); optional permission evidence is always revalidated (Plans/Contracts_V0.md:334)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:LocateAndVerifyRecoveryResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required, degraded]
      owner_state_codes:
        - {owner_state: permission_denied, code: permission_required}
        - {owner_state: operation_in_progress, code: blocked_state_required}
      aliases: []
      judgments:
        - key: owner_request
          choice: none
          gap_note: "Canon names the owner request LocateAndVerifyRecoveryRequest and its fields (Plans/Commands_System.md:4369, :4374; Plans/Contracts_V0.md:334; UI_Command_Catalog.md:137; Wiring_Matrix.production.json catalog.runtime_locate_and_verify_recovery), but no schema $def or PlanUnit holds it, so no contract ref form can name it; the args above carry its fields except command_id and actor_ref, which are envelope fields."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection, permission_required, degraded]
          gap_note: "Canon keeps the exact owner reason in disabled projections: stale projection, permission/storage failure, operation in progress, source verification failure (UI_Command_Catalog.md:142). Mapped: stale projection to stale_projection; permission failure to permission_required and operation in progress to blocked_state_required (UCC-230 owner_state_code_map permission_denied, operation_in_progress); storage failure to degraded; source verification failure to blocked_state_required. Canon gives no map for storage or source verification failure."
        - key: command_kind
          choice: domain_action
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value here; domain_action because the command commits a typed result and receipt and releases the recovery anchor (Plans/Contracts_V0.md:336-338)."
        - key: field:blocked_sequence
          choice: "minimum 1"
          gap_note: "Canon disagrees on the lower bound: Plans/Contracts_V0.md:600 says blocked_sequence starts at 1 (and OrchestratorNodeApprovalRequestV1 has minimum 1), while Plans/event_payload_safe_point_recovery_unavailable.schema.json, the event this command answers, allows minimum 0. The definition follows Contracts_V0.md:600; not settled here."
        - key: field:allowed_action_id
          choice: "required in args; not a field of the closed LocateAndVerifyRecoveryRequest"
          gap_note: "The overlay requires allowed_action_id on every runtime recovery command (UI_Command_Catalog.md:8858), but the closed request's field list (Plans/Commands_System.md:4374) has none; the handler admits the action from it and does not forward it."
    - command_id: cmd.runtime.abandon_recovery
      ucc_units: [UCC-094, UCC-092, UCC-093, UCC-095]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        schema_version:
          type: const
          value: "1.0.0"
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon says AbandonRecoveryRequest is "closed at 1.0.0" (Plans/Commands_System.md:4376;
            Plans/Contracts_V0.md:334) but, unlike LocateAndVerifyRecoveryRequest (Plans/Commands_System.md:4374),
            does not list schema_version among its fields, nor its type or value. The field mirrors the locate
            request; const "1.0.0" reads the closed contract version as its value.
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "AbandonRecoveryRequest requires the common exact episode fields (Plans/Commands_System.md:4376), which both requests bind: project_id, run_id, node_id, blocked_sequence, safe_point_id, anchor_ref, expected_snapshot_refs, expected_recovery_unavailable_reason_code (Plans/Contracts_V0.md:334); common optional field narrowed to required (UCC-230 envelope)"
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "common exact episode field (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334); overlay UCC-089..095 required identity"
        node_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "common exact episode field (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334); overlay optional identity node_id? narrowed to required"
        blocked_sequence:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "common exact episode field (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334); blocked_sequence starts at 1 (Plans/Contracts_V0.md:600); overlay UCC-089..095 required identity"
        allowed_action_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-089..095 required identity (UI_Command_Catalog.md:8858); admitted only from the current ordered safe_point.recovery_unavailable.allowed_action_ids[] (Plans/Commands_System.md:4372; UI_Command_Catalog.md:140)"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "the conditional attempt field (Plans/Commands_System.md:4376): pre-attempt dispatch omits attempt_id, post-attempt dispatch requires the exact prior-attempt identity (Plans/Commands_System.md:4372; Plans/Contracts_V0.md:334; UI_Command_Catalog.md:142)"
        safe_point_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "common exact episode field (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334); overlay optional identity safe_point_id? narrowed to required"
        anchor_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "common exact episode field (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334); the safe_point.recovery_unavailable payload's anchor_ref is a non-empty string (Plans/event_payload_safe_point_recovery_unavailable.schema.json)"
        expected_snapshot_refs:
          type: list
          item: {type: ref}
          required: true
          default: none
          constraints: {min_items: 1, unique_items: true}
          provenance: canon
          source: "common exact episode field, the exact snapshot set (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334); exact and non-empty, a mismatched set refuses (Plans/Commands_System.md:4372); matches the event's snapshot_refs, minItems 1 and uniqueItems (Plans/event_payload_safe_point_recovery_unavailable.schema.json)"
        expected_recovery_unavailable_reason_code:
          type: enum
          values: [snapshot_missing, snapshot_corrupt, snapshot_scope_unsupported, snapshot_identity_stale, snapshot_unanchored]
          required: true
          default: none
          provenance: canon
          source: "common exact episode field (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334); the reason enum is exactly these five values and unknown values fail closed (Plans/Contracts_V0.md:332)"
        confirmation:
          type: const
          value: abandon_recovery_and_preserve_local_work
          required: true
          default: none
          provenance: canon
          source: "AbandonRecoveryRequest requires confirmation = abandon_recovery_and_preserve_local_work (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334)"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "AbandonRecoveryRequest requires a durable confirmation_ref (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334); common optional field confirmation_ref? narrowed to required (UCC-230 envelope)"
        preserved_local_work_acknowledged:
          type: const
          value: true
          required: true
          default: none
          provenance: canon
          source: "AbandonRecoveryRequest requires preserved_local_work_acknowledged = true (Plans/Commands_System.md:4376; Plans/Contracts_V0.md:334)"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "AbandonRecoveryRequest requires idempotency_key (Plans/Commands_System.md:4376); common optional field narrowed to required with its UCC-230 bound"
        permission_snapshot_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Plans/Contracts_V0.md:334 gives both requests optional permission evidence ("Optional permission
            evidence is always revalidated"), but names the field only for the locate request
            (permission_snapshot_id, Plans/Commands_System.md:4374); the abandon request's field list
            (Plans/Commands_System.md:4376) names none. The locate name is reused.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:AbandonRecoveryResult
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required, degraded]
      owner_state_codes:
        - {owner_state: permission_denied, code: permission_required}
        - {owner_state: operation_in_progress, code: blocked_state_required}
      aliases: []
      judgments:
        - key: owner_request
          choice: none
          gap_note: "Canon names the owner request AbandonRecoveryRequest and its fields (Plans/Commands_System.md:4370, :4376; Plans/Contracts_V0.md:334; UI_Command_Catalog.md:138; Wiring_Matrix.production.json catalog.runtime_abandon_recovery), but no schema $def or PlanUnit holds it, so no contract ref form can name it; the args above carry its fields except command_id and actor_ref, which are envelope fields."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection, permission_required, degraded]
          gap_note: "Canon keeps the exact owner reason in disabled projections: stale projection, permission/storage failure, operation in progress, missing explicit confirmation (UI_Command_Catalog.md:142). Mapped: stale projection to stale_projection; permission failure to permission_required and operation in progress to blocked_state_required (UCC-230 owner_state_code_map permission_denied, operation_in_progress); storage failure to degraded; missing explicit confirmation to permission_required. Canon gives no map for storage failure or missing confirmation."
        - key: command_kind
          choice: domain_action
          gap_note: "Canon requires command_kind metadata on recovery commands (UI_Command_Catalog.md:6852) but states no value here; domain_action because the command commits a typed result and receipt and releases the recovery anchor as abandoned_by_user (Plans/Contracts_V0.md:336-338)."
        - key: field:blocked_sequence
          choice: "minimum 1"
          gap_note: "Canon disagrees on the lower bound: Plans/Contracts_V0.md:600 says blocked_sequence starts at 1, while Plans/event_payload_safe_point_recovery_unavailable.schema.json, the event this command answers, allows minimum 0. The definition follows Contracts_V0.md:600; not settled here."
        - key: field:allowed_action_id
          choice: "required in args; not a field of the closed AbandonRecoveryRequest"
          gap_note: "The overlay requires allowed_action_id on every runtime recovery command (UI_Command_Catalog.md:8858), but the closed request's field list (Plans/Commands_System.md:4376) has none; the handler admits the action from it and does not forward it."
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
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: "Canon lists the command under \"Navigation commands\" as a route identity example owned by the catalog and the shared route contract (UI_Command_Catalog.md:1224-1228) but states no command_kind value; navigation_wrapper follows that."
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: "No catalog row states disabled reasons for this command; chosen from the closed set: a navigation route keyed by run identity (DL-333 resolution 7) is unavailable only while its run projection is stale."
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
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: "Canon lists the command under \"Navigation commands\" as a route identity example owned by the catalog and the shared route contract (UI_Command_Catalog.md:1224-1228) but states no command_kind value; navigation_wrapper follows that."
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: "No catalog row states disabled reasons for this command; chosen from the closed set: a navigation route keyed by run identity (DL-333 resolution 7) is unavailable only while its run projection is stale."
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
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: "Canon lists the command under \"Navigation commands\" as a route identity example owned by the catalog and the shared route contract (UI_Command_Catalog.md:1224-1228) but states no command_kind value; navigation_wrapper follows that."
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: "No catalog row states disabled reasons for this command; chosen from the closed set: a navigation route keyed by run identity (DL-333 resolution 7) is unavailable only while its run projection is stale."
  results:
    RuntimeRetryNowResult:
      fields:
        attempt_id: {type: id, required: false, default: none, provenance: gap, gap_note: "The successor attempt, present only when durable admission mints one (Plans/Executor_Protocol.md:688, restore-before-rerun step 5). A refused admission (UI_Command_Catalog.md:1220) or a safe_point target whose restore ends restore_refused, restore_failed or restore_recovery_required mints none (Plans/Executor_Protocol.md:697-701), so the field is optional; no typed result schema gives an outcome field to condition it on."}
        worktree_id: {type: id, required: false, default: none, provenance: gap, gap_note: "The new isolated worktree a historical_commit baseline creates: the name is canon (\"the durable result carries the new worktree_id\", UI_Command_Catalog.md:1217, a target this command accepts, :1220; the new isolated worktree identity is linked, Plans/Executor_Protocol.md:671, and the baseline-preparation result is persisted before successor admission, :687), but no typed result schema places it. It is the destination worktree, distinct from the source worktree_id in the request. Present when the dispatch named baseline_target historical_commit and baseline preparation created the worktree, whether or not admission then minted a successor attempt_id; absent for safe_point and worktree_head targets, which name an existing worktree, and when preparation was refused or failed. The format has no condition on a request arg, so the presence rule is stated here."}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "durable dispatch or owner receipt; canon states that the strict UICommandResponse contains a reference to the matching typed domain result only for the locate and abandon recovery commands (UI_Command_Catalog.md:144), and the same reference is assumed here; no typed result schema exists"}
    RuntimeResumeAfterPrerequisiteResult:
      fields:
        attempt_id: {type: id, required: false, default: none, provenance: gap, gap_note: "The attempt of the resumed blocked, paused or waiting episode (recovery verb copy, UI_Command_Catalog.md:1237-1243). Optional: a pre-attempt blocked episode has no attempt and must not fabricate one (UI_Command_Catalog.md:1230-1231), and the request's attempt_id is optional; no typed result schema exists."}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "durable dispatch or owner receipt; no typed result schema exists"}
    RuntimeRestoreSafePointThenRetryResult:
      fields:
        restore_outcome: {type: enum, values: [restored_clean, restored_with_conflicts, restore_failed, restore_skipped, restore_refused, restore_recovery_required], required: true, default: none, provenance: gap, gap_note: "the closed restore_outcome enum is canon (Contracts_V0 safe_point.restored, Plans/Contracts_V0.md:2571-2583) but no typed command-result schema places it; only restored_clean or zero-mutation restore_skipped with target equality admits a successor (UI_Command_Catalog.md:1216). restored_with_conflicts is kept only because the enum is closed: safe-point restore never emits it (Plans/Contracts_V0.md:2576), and if an owner returns it anyway the result can carry it only as an owner-contract violation that keeps dispatch fenced and routes to recovery diagnostics (Plans/Executor_Protocol.md:701)"}
        attempt_id: {type: id, required: false, default: none, forbidden_when: {field: restore_outcome, in: [restored_with_conflicts, restore_failed, restore_refused, restore_recovery_required]}, provenance: gap, gap_note: "The successor attempt, present only when Executor durably admitted one. restore_outcome is the baseline preparation result, not admission: the FileSafe restore reaches its terminal result (Plans/Executor_Protocol.md:686, restore-before-rerun step 3), that result and its receipt refs are persisted before any runnable successor state (:687, step 4), and only then may the proved-ready baseline mint the new attempt_id and bind the successor at the durable admission point (:688, step 5). restored_clean or restore_skipped with the equality proof continues to that admission (:697) but does not prove it committed, so either may come back without attempt_id, and the terminal owner_operation response still carries this typed result (Plans/ui_command_response.schema.json:460-487). restore_refused, restore_failed, restore_recovery_required and restored_with_conflicts mint no successor attempt (Plans/Executor_Protocol.md:698-701), so the field is forbidden on them. No field of this result records admission and canon names none, so presence follows durable admission rather than a required_when condition, as on RuntimeRetryNowResult and RuntimeStartFreshAttemptResult; no typed result schema places the field."}
        restore_transaction_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the exact restore transaction linked at admission; the field is named in the safe_point.restored event payload (Plans/Contracts_V0.md:2553-2567), no typed command-result schema"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the durable baseline receipt required for successor-attempt admission (UI_Command_Catalog.md:1216); no typed result schema exists"}
    RuntimeStartFreshAttemptResult:
      fields:
        attempt_id: {type: id, required: false, default: none, provenance: gap, gap_note: "The successor attempt, present only when durable admission mints one (Plans/Executor_Protocol.md:688, step 5); a refused admission (UI_Command_Catalog.md:1220) or a failed safe_point restore (Plans/Executor_Protocol.md:697-701) mints none, so the field is optional; no typed result schema gives an outcome field to condition it on."}
        worktree_id: {type: id, required: false, default: none, provenance: gap, gap_note: "The new isolated worktree a historical_commit baseline creates: the name is canon (\"the durable result carries the new worktree_id\", UI_Command_Catalog.md:1217, a target this command accepts, :1220; the new isolated worktree identity is linked, Plans/Executor_Protocol.md:671, and the baseline-preparation result is persisted before successor admission, :687), but no typed result schema places it. It is the destination worktree, distinct from the source worktree_id in the request. Present when the dispatch named baseline_target historical_commit and baseline preparation created the worktree, whether or not admission then minted a successor attempt_id; absent for safe_point and worktree_head targets, which name an existing worktree, and when preparation was refused or failed. The format has no condition on a request arg, so the presence rule is stated here."}
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
        outcome: {type: enum, values: [applied, replayed, refused, failed_recoverable], required: true, default: none, provenance: canon, source: "LocateAndVerifyRecoveryResult is a closed 1.0.0 domain result with outcome = applied | replayed | refused | failed_recoverable (Plans/Contracts_V0.md:336; Plans/Commands_System.md:4378)"}
        receipt_state: {type: enum, values: [committed, not_committed], required: true, default: none, provenance: canon, source: "receipt_state = committed | not_committed (Plans/Contracts_V0.md:336; Plans/Commands_System.md:4378)"}
        anchor_state: {type: enum, values: [released, recovery_unavailable], required: true, default: none, provenance: canon, source: "successful locate requires anchor_state = released; every nonsuccess leaves anchor_state = recovery_unavailable (Plans/Contracts_V0.md:336)"}
        release_reason: {type: const, value: resolved, required: false, default: none, required_when: {field: anchor_state, in: [released]}, forbidden_when: {field: anchor_state, in: [recovery_unavailable]}, provenance: canon, source: "successful locate requires release_reason = resolved; every nonsuccess has no release claim (Plans/Contracts_V0.md:336); locate releases only as resolved (Plans/Commands_System.md:4378)"}
        cleanup_performed: {type: const, value: false, required: true, default: none, provenance: canon, source: "cleanup_performed is always false (Plans/Contracts_V0.md:336; Plans/Commands_System.md:4378)"}
        receipt_ref: {type: ref, required: false, default: none, required_when: {field: receipt_state, in: [committed]}, provenance: gap, gap_note: "Canon requires a committed recovery_unavailable_resolution_receipt (pm.storage_value.recovery_unavailable_resolution_receipt.v1, not an EventRecord) for any release, and replay returns the original receipt (Plans/Contracts_V0.md:336-338; Plans/Commands_System.md:4378), but names no result field for it; receipt_ref names it, required when receipt_state is committed."}
        verified_snapshot_refs: {type: list, item: {type: ref}, required: false, default: none, constraints: {min_items: 1}, required_when: {field: anchor_state, in: [released]}, provenance: gap, gap_note: "Successful locate requires owner-verified refs (Plans/Contracts_V0.md:336); canon names no field and no item type."}
        manifest_sha256: {type: sha256, required: false, default: none, required_when: {field: anchor_state, in: [released]}, provenance: gap, gap_note: "Successful locate requires the owner-verified manifest hash (Plans/Contracts_V0.md:336); canon names no field; sha256 follows the request's expected_manifest_sha256 (Plans/Commands_System.md:4374)."}
        verification_evidence_ref: {type: ref, required: false, default: none, required_when: {field: anchor_state, in: [released]}, provenance: gap, gap_note: "Successful locate requires owner verification evidence (Plans/Contracts_V0.md:336; Plans/Commands_System.md:4378); canon names no field or form."}
        command_id: {type: const, value: cmd.runtime.locate_and_verify_recovery, required: true, default: none, provenance: gap, gap_note: "Both results require command identity (Plans/Commands_System.md:4378); canon names no result field; the request's const command ID is reused."}
        idempotency_key: {type: string, required: true, default: none, constraints: {max_length: 256}, provenance: gap, gap_note: "Both results require idempotency identity (Plans/Commands_System.md:4378); canon names no result field; the request field name and its UCC-230 bound are reused."}
        run_id: {type: id, required: true, default: none, provenance: gap, gap_note: "Episode identity is required in the result (Plans/Commands_System.md:4378); canon names no result fields; the request's episode field names are reused."}
        node_id: {type: id, required: true, default: none, provenance: gap, gap_note: "Episode identity is required in the result (Plans/Commands_System.md:4378); canon names no result fields; the request's episode field names are reused."}
        blocked_sequence: {type: integer, required: true, default: none, constraints: {minimum: 1}, provenance: gap, gap_note: "Episode identity is required in the result (Plans/Commands_System.md:4378); canon names no result fields; the request's episode field and its Contracts_V0.md:600 bound are reused."}
        anchor_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "Anchor identity is required in the result (Plans/Commands_System.md:4378); canon names no result field; the request's anchor_ref is reused."}
        attempt_id: {type: id, required: false, default: none, provenance: gap, gap_note: "Conditional attempt identity (Plans/Commands_System.md:4378): present on the post-attempt branch, absent pre-attempt; canon names no result field."}
    AbandonRecoveryResult:
      fields:
        outcome: {type: enum, values: [applied, replayed, refused, failed_recoverable], required: true, default: none, provenance: canon, source: "AbandonRecoveryResult is a closed 1.0.0 domain result with outcome = applied | replayed | refused | failed_recoverable (Plans/Contracts_V0.md:336; Plans/Commands_System.md:4378)"}
        receipt_state: {type: enum, values: [committed, not_committed], required: true, default: none, provenance: canon, source: "receipt_state = committed | not_committed (Plans/Contracts_V0.md:336; Plans/Commands_System.md:4378)"}
        anchor_state: {type: enum, values: [released, recovery_unavailable], required: true, default: none, provenance: canon, source: "successful abandonment requires anchor_state = released; every nonsuccess leaves anchor_state = recovery_unavailable (Plans/Contracts_V0.md:336)"}
        release_reason: {type: const, value: abandoned_by_user, required: false, default: none, required_when: {field: anchor_state, in: [released]}, forbidden_when: {field: anchor_state, in: [recovery_unavailable]}, provenance: canon, source: "successful abandonment requires release_reason = abandoned_by_user; every nonsuccess has no release claim (Plans/Contracts_V0.md:336); abandonment releases only as abandoned_by_user (Plans/Commands_System.md:4378)"}
        cleanup_performed: {type: const, value: false, required: true, default: none, provenance: canon, source: "cleanup_performed is always false (Plans/Contracts_V0.md:336; Plans/Commands_System.md:4378)"}
        receipt_ref: {type: ref, required: false, default: none, required_when: {field: receipt_state, in: [committed]}, provenance: gap, gap_note: "Canon requires the committed recovery_unavailable_resolution_receipt family for a release (pm.storage_value.recovery_unavailable_resolution_receipt.v1, Plans/Contracts_V0.md:336-338; Plans/Commands_System.md:4378), but names no result field for it; receipt_ref names it, required when receipt_state is committed."}
        command_id: {type: const, value: cmd.runtime.abandon_recovery, required: true, default: none, provenance: gap, gap_note: "Both results require command identity (Plans/Commands_System.md:4378); canon names no result field."}
        idempotency_key: {type: string, required: true, default: none, constraints: {max_length: 256}, provenance: gap, gap_note: "Both results require idempotency identity (Plans/Commands_System.md:4378); canon names no result field; the request field name and its UCC-230 bound are reused."}
        run_id: {type: id, required: true, default: none, provenance: gap, gap_note: "Episode identity is required in the result (Plans/Commands_System.md:4378); canon names no result fields; the request's episode field names are reused."}
        node_id: {type: id, required: true, default: none, provenance: gap, gap_note: "Episode identity is required in the result (Plans/Commands_System.md:4378); canon names no result fields; the request's episode field names are reused."}
        blocked_sequence: {type: integer, required: true, default: none, constraints: {minimum: 1}, provenance: gap, gap_note: "Episode identity is required in the result (Plans/Commands_System.md:4378); canon names no result fields; the request's episode field and its Contracts_V0.md:600 bound are reused."}
        anchor_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "Anchor identity is required in the result (Plans/Commands_System.md:4378); canon names no result field; the request's anchor_ref is reused."}
        attempt_id: {type: id, required: false, default: none, provenance: gap, gap_note: "Conditional attempt identity (Plans/Commands_System.md:4378): present on the post-attempt branch, absent pre-attempt; canon names no result field."}
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-230, ContractName:Plans/UI_Command_Catalog.md#UCC-089, ContractName:Plans/UI_Command_Catalog.md#UCC-090, ContractName:Plans/UI_Command_Catalog.md#UCC-091, ContractName:Plans/UI_Command_Catalog.md#UCC-092, ContractName:Plans/UI_Command_Catalog.md#UCC-093, ContractName:Plans/UI_Command_Catalog.md#UCC-094, ContractName:Plans/UI_Command_Catalog.md#UCC-095, ContractName:Plans/Contracts_V0.md#safe_point.restored, ContractName:Plans/projects_refresh_fix_contracts.schema.json
