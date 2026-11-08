# Shard 045: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L8359-L8639

Source SHA256: `d74148ca8e5cc00a5a215cfc10cf36b29de00d4d306ca88331a12024529a55ad`

---

## Command payload definitions (DL-333, 2026-11-05)

### GRS-218 - Goal Mode Command Payload Definitions

```yaml
plan_unit_id: GRS-218
unit_type: command_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Typed payload definitions for the Assistant Chat Goal Mode commands that UI_Command_Catalog UCC-096
  registers (DL-333): cmd.chat.goal.start and cmd.chat.goal.update, the Goal Runtime exact commands whose
  request and result contracts Goal_Runtime_System owns (Goal V2 exact commands table; CV-342 adds
  GoalUpdateRequestV2 and GoalUpdateResultV2). The definitions block below gives each active command its
  args, owner result and narrowed error and disabled-reason codes in pm.command_payload_definitions.v1.
  The catalog keeps ids, labels, availability and aliases; the strict schema overlay keeps the common
  envelope and the closed code sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Goal Mode activation and update commands.
depends_on: [UCC-230, UCC-096, GRS-066, GRS-068, CV-342, SP-299, DL-333]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to GRS-218 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.chat.goal.start, cmd.chat.goal.update]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not restate the envelope fields dispatch_id, command_id, source_surface or actor_ref as args; the owner request carries them at its own layer.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: GRS-218
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.goal.start
      ucc_units: [UCC-096]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1121 2.7.1 Goal Mode slash command row payload { thread_id, goal_prompt?, source }; UCC-230 envelope common optional thread_id restated required (the Goal is created for the active thread, Goal_Runtime_System.md:254)"
        goal_prompt:
          type: string
          required: false
          default: none
          constraints: {max_length: 4000, pattern: '^[^\ud800-\udfff]*$'}
          provenance: gap
          gap_note: >-
            The 2.7.1 row names goal_prompt? but no canon states a type or bounds for the UI argument.
            Chosen: a string reusing the objective_text bounds of Plans/goal_runtime_contracts.schema.json
            $defs/GoalStartRequestV2 (maxLength 4000, no surrogate code points). Whether goal_prompt maps
            one-to-one onto that owner-request objective_text is not stated.
        source:
          type: enum
          values: [slash, button, chip, icon, natural_language]
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1121 2.7.1 row payload source: slash|button|chip|icon|natural_language (the activation surface). This is the UI activation enum; the owner request's source_surface in GoalStartRequestV2 is the separate goal-surface namespace (agent_runtime, approved_agent_proposal, goal_activity, goal_activity_editor, goal_control, goal_hover, natural_language, slash, wand)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/GoalStartRequestScopeV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/GoalStartResultScopeV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required]
      aliases: []
      judgments:
        - key: owner_request
          choice: Plans/application_workflow_contracts.schema.json#/$defs/GoalStartRequestScopeV2
          gap_note: "Canon disagrees on the owner request. The production wiring row (Wiring_Matrix.production.json entries.catalog.chat_goal_start request_schema_ref) and the Simplified Goal Runtime registration row (UI_Command_Catalog.md:15444, command_kind domain_action) name application_workflow_contracts GoalStartRequestScopeV2, which resolves to GoalCommandRequestApplicationV1, whose cmd.chat.goal.start branch is the retained GoalCommandRequestApplicationLegacyV1 (schema_id pm.goal.command_request.application.v1). This document's Goal V2 exact-commands passage (Goal_Runtime_System.md:262), live unit GRS-065 (Goal_Runtime_System.md:6337), Plans/Commands_System.md:6402 and Plans/Contracts_V0.md:22495 name goal_runtime_contracts GoalStartRequestV2 (CV-341). The definition follows the wiring row, which is the request the dispatch boundary sends, and so contradicts GRS-065 until the owner aligns the registration row and wiring with GRS-065 or the reverse. Not settled here."
        - key: owner_result
          choice: Plans/application_workflow_contracts.schema.json#/$defs/GoalStartResultScopeV2
          gap_note: "Same disagreement as the request: the wiring row's result_schema_ref is GoalStartResultScopeV2 (GoalCommandResultApplicationV1), while Goal_Runtime_System.md:262, GRS-065 (Goal_Runtime_System.md:6337) and Plans/Commands_System.md:6402 name GoalStartResultV2. Canon's result boundary (goal_id, revision 1, currentness_hash and a creation receipt, Goal_Runtime_System.md:254) is stated for the command, not for either schema; the definition follows the wiring row."
        - key: disabled_reason_codes
          choice: [not_configured, unreachable, degraded, blocked_state_required]
          gap_note: "No registration table states disabled reasons for this row; chosen from the closed set over the catalog preconditions assistant_chat_available && goal_runtime_available && no_active_goal_on_thread (UI_Command_Catalog.md:15444): runtime unavailable maps to not_configured, unreachable or degraded, and an active goal already on the thread to blocked_state_required. handler_unavailable stays the evidence boundary (Plans/Commands_System.md:6402) and is an error code, not a disabled code."
        - key: omitted:schema_id
          choice: "left out of args; the handler sets the const pm.goal.command_request.application.v1"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires schema_id (const pm.goal.command_request.application.v1, Plans/application_workflow_contracts.schema.json); canon does not say whether the UI or the handler supplies the request marker."
        - key: omitted:schema_version
          choice: "left out of args; the handler sets the const 1.0.0"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires schema_version (const 1.0.0, Plans/application_workflow_contracts.schema.json); canon does not say whether the UI or the handler supplies it."
        - key: omitted:context
          choice: "left out of args; the handler builds the WorkflowCommandContextV1 from the envelope and the active thread"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires context, a WorkflowCommandContextV1 (Plans/shared_integration_runtime.schema.json: scope, storage_instance_id, thread_id, execution_host_id, execution_environment_id, roots, command_instance_id, idempotency_key, actor_ref, permission_evidence, writer_evidence, scope_stop_epoch, task_stop_epoch, expected_generation, return_context_ref). The 2.7.1 row gives the UI only thread_id, goal_prompt and source (UI_Command_Catalog.md:1121); canon does not say how the handler fills the rest. actor_ref and the envelope identity are UCC-230 required_not_restated."
        - key: omitted:goal_id
          choice: "left out of args; null at start"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires goal_id, string or null (Plans/application_workflow_contracts.schema.json). A start creates the Goal (Goal_Runtime_System.md:254) and GoalStartRequestV2 types goal_id as null (Plans/goal_runtime_contracts.schema.json); canon does not say who writes the null on the legacy request."
        - key: omitted:expected_revision
          choice: "left out of args; null at start"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires expected_revision, integer minimum 0 or null; GoalStartRequestV2 types it as null because no Goal exists yet. Canon does not say who writes it on the legacy request."
        - key: omitted:expected_currentness_hash
          choice: "left out of args; null at start"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires expected_currentness_hash, sha256 hex or null; GoalStartRequestV2 types it as null because no Goal exists yet. Canon does not say who writes it on the legacy request."
        - key: omitted:objective_text
          choice: "left out of args; the handler fills objective_text from goal_prompt"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires objective_text (string maxLength 4000 without surrogate code points, or null) and GoalStartRequestV2 requires it as a string with the same bounds; the 2.7.1 row's UI argument is goal_prompt? (UI_Command_Catalog.md:1121). Canon does not state that goal_prompt maps onto objective_text, nor what an absent goal_prompt becomes (Plans/Contracts_V0.md:22495 says empty objective text is valid)."
        - key: omitted:source_message_id
          choice: "left out of args; the handler supplies it"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires source_message_id, string or null (Plans/application_workflow_contracts.schema.json); GoalStartRequestV2 has no such field, and canon does not say what a start writes there."
        - key: omitted:approval_id
          choice: "left out of args; the handler supplies it"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires approval_id, string or null; GoalStartRequestV2 has no such field, and canon does not say what a start writes there."
        - key: omitted:original_operation_ref
          choice: "left out of args; the handler supplies it"
          gap_note: "GoalCommandRequestApplicationLegacyV1 requires original_operation_ref, string or null; GoalStartRequestV2 has no such field, and canon does not say what a start writes there."
        - key: field:source
          choice: "kept in args as the UI activation enum; not forwarded into GoalCommandRequestApplicationLegacyV1"
          gap_note: "The 2.7.1 row requires source: slash|button|chip|icon|natural_language (UI_Command_Catalog.md:1121), but GoalCommandRequestApplicationLegacyV1 is additionalProperties false with no source field (Plans/application_workflow_contracts.schema.json), and its context, a WorkflowCommandContextV1, is additionalProperties false with none either (Plans/shared_integration_runtime.schema.json). Canon does not say whether the handler records the activation surface elsewhere."
    - command_id: cmd.chat.goal.update
      ucc_units: [UCC-096]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "Plans/goal_runtime_contracts.schema.json $defs/GoalUpdateRequestV2 requires project_id (string 1..256); UCC-230 envelope common optional project_id restated required"
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires thread_id (string 1..256); UCC-230 envelope common optional thread_id restated required"
        goal_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires goal_id (string minLength 1); overlay row group UCC-096..UCC-100 optional identity goal_id; canon makes the goal mandatory for an update (Goal_Runtime_System.md:255)"
        expected_revision:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "GoalUpdateRequestV2 expected_revision integer minimum 1; Goal_Runtime_System.md:255 requires the expected revision"
        expected_currentness_hash:
          type: sha256
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 expected_currentness_hash pattern ^[0-9a-f]{64}$; Goal_Runtime_System.md:255 requires the currentness hash"
        permission_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires permission_snapshot_ref (string 1..256)"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "GoalUpdateRequestV2 requires idempotency_key (string 1..256); UCC-230 envelope common optional idempotency_key (string max_length 256) restated required"
        return_route_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires return_route_ref (string 1..256)"
        objective_text:
          type: string
          required: true
          default: none
          constraints: {max_length: 4000, pattern: '^[^\ud800-\udfff]*$'}
          provenance: canon
          source: "GoalUpdateRequestV2 requires objective_text (string maxLength 4000, pattern excludes surrogate code points)"
        change_source:
          type: enum
          values: [user_direct, agent_proposed_user_approved]
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 change_source enum; a user-authored edit or a resolved approval (Goal_Runtime_System.md:255)"
        source_message_id:
          type: id
          required: true
          default: none
          nullable: true
          provenance: canon
          source: "GoalUpdateRequestV2 requires source_message_id, anyOf string minLength 1 or null; its allOf if/then/else makes it null when change_source is user_direct and a non-empty string otherwise (Plans/goal_runtime_contracts.schema.json)"
        approval_id:
          type: id
          required: true
          default: none
          nullable: true
          provenance: canon
          source: "GoalUpdateRequestV2 requires approval_id, anyOf string minLength 1 or null; its allOf if/then/else makes it null when change_source is user_direct and a non-empty resolved approval otherwise (Plans/goal_runtime_contracts.schema.json); precondition goal_present && expected_goal_revision_current && (user_authored_edit || approval_granted) (UI_Command_Catalog.md:15445)"
        schema_id:
          type: const
          value: pm.goal.update.request.v2
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires schema_id const pm.goal.update.request.v2 (Plans/goal_runtime_contracts.schema.json); the 2.7.1 row gives GoalUpdateRequestV2 as this command's payload (UI_Command_Catalog.md:1122)"
        schema_version:
          type: const
          value: "2.0.0"
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires schema_version const 2.0.0 (Plans/goal_runtime_contracts.schema.json); payload per UI_Command_Catalog.md:1122"
        command_instance_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GoalUpdateRequestV2 requires command_instance_id (string 1..256, Plans/goal_runtime_contracts.schema.json); payload per UI_Command_Catalog.md:1122. command_id and actor_ref of the same request come from the UICommand envelope (UCC-230 envelope required_not_restated)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - key: owner_request
          choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
          gap_note: "Canon layers two requests. The production wiring row (Wiring_Matrix.production.json entries.catalog.chat_goal_update request_schema_ref) names application_workflow_contracts ChatOwnerCommandRequestV2; the Simplified Goal Runtime registration row (UI_Command_Catalog.md:15445, command_kind domain_action), the 2.7.1 row (UI_Command_Catalog.md:1122), Goal_Runtime_System.md:262 and Plans/Commands_System.md:6403 name goal_runtime_contracts GoalUpdateRequestV2 -> GoalUpdateResultV2. The definition follows the wiring row; its args are the GoalUpdateRequestV2 fields the UI supplies, and ChatOwnerCommandRequestV2's owner_input_schema_ref, owner_input_ref and owner_input_sha256 can name that body, though canon does not say so in words."
        - key: owner_result
          choice: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
          gap_note: "The wiring row's result_schema_ref is ChatOwnerCommandResultV2; the registration row and Plans/Commands_System.md:6403 name GoalUpdateResultV2, the body transaction that returns revision n+1 atomically under GRS-068 and SP-299 (Goal_Runtime_System.md:255). The definition follows the wiring row; canon does not state that its owner_result_ref names the GoalUpdateResultV2 body."
        - key: disabled_reason_codes
          choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
          gap_note: "No registration table states disabled reasons for this row; chosen from the closed set over the catalog preconditions goal_present && expected_goal_revision_current && (user_authored_edit || approval_granted) (UI_Command_Catalog.md:15445): no goal or no approved change maps to blocked_state_required, a stale expected revision or currentness hash to stale_projection, and runtime availability to not_configured, unreachable or degraded."
        - key: omitted:source_surface
          choice: "left out of args; the handler writes the owner request's source_surface"
          gap_note: "GoalUpdateRequestV2 requires its own source_surface (string minLength 1; its $comment calls it routing lineage only, Plans/goal_runtime_contracts.schema.json). It is the owner request's Goal field, not the UICommand envelope source_surface: on GoalStartRequestV2 the same field is the separate goal-surface namespace (agent_runtime, approved_agent_proposal, goal_activity, goal_activity_editor, goal_control, goal_hover, natural_language, slash, wand; its $comment: not the generic UI source_surface). UCC-230 forbids restating the envelope name as an arg, and canon does not say how the handler derives the Goal value from the dispatch."
        - key: omitted:scope
          choice: "left out of args; the handler builds the WorkflowScopeV2"
          gap_note: "ChatOwnerCommandRequestV2 requires scope (WorkflowScopeV2, Plans/application_workflow_contracts.schema.json); the Goal update fields carry project_id and thread_id, and canon does not say how the handler builds the scope object from them."
        - key: omitted:initiating_client_id
          choice: "left out of args; the handler supplies the initiating client"
          gap_note: "ChatOwnerCommandRequestV2 requires initiating_client_id (string 1..256); canon does not say whether the UI or the handler supplies it."
        - key: omitted:owner_input_schema_ref
          choice: "left out of args; the handler names GoalUpdateRequestV2"
          gap_note: "ChatOwnerCommandRequestV2 requires owner_input_schema_ref (string 1..256); canon does not state that its value is the GoalUpdateRequestV2 ref, though the registration row names that request (UI_Command_Catalog.md:15445)."
        - key: omitted:owner_input_ref
          choice: "left out of args; the handler stores the GoalUpdateRequestV2 built from these args and refers to it"
          gap_note: "ChatOwnerCommandRequestV2 requires owner_input_ref (string 1..256); canon does not say who stores the owner input or mints the ref."
        - key: omitted:owner_input_sha256
          choice: "left out of args; the handler hashes the stored owner input"
          gap_note: "ChatOwnerCommandRequestV2 requires owner_input_sha256 (sha256 hex); canon does not say who computes it."
        - key: omitted:expected_owner_revision
          choice: "left out of args; the handler copies expected_revision"
          gap_note: "ChatOwnerCommandRequestV2 requires expected_owner_revision (integer minimum 0); canon does not state that it equals the Goal expected_revision arg."
        - key: omitted:permission_evidence
          choice: "left out of args; the handler resolves it from permission_snapshot_ref"
          gap_note: "ChatOwnerCommandRequestV2 requires permission_evidence (OwnerEvidenceRefV1, Plans/shared_integration_runtime.schema.json); canon does not say how it is derived from the permission_snapshot_ref arg."
        - key: omitted:scope_stop_epoch
          choice: "left out of args; the handler reads the current scope stop epoch"
          gap_note: "ChatOwnerCommandRequestV2 requires scope_stop_epoch (integer minimum 0); canon does not say who supplies it."
        - key: omitted:return_context_ref
          choice: "left out of args; the handler derives it from return_route_ref"
          gap_note: "ChatOwnerCommandRequestV2 requires return_context_ref (string 1..256); canon does not state its relation to the GoalUpdateRequestV2 return_route_ref arg."
```
