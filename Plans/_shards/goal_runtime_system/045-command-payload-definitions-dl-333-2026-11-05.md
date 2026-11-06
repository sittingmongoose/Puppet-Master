# Shard 045: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L8359-L8566

Source SHA256: `44d9dc13437e91eea78fbfe4113e847fc82e5bd23f4528c340ba572d0dcd87da`

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
      # canon: UI_Command_Catalog.md:15016 Simplified Goal Runtime registration table command_kind column.
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
            JUDGMENT: string reusing the objective_text bounds of Plans/goal_runtime_contracts.schema.json
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
      # Equals the wiring request_schema_ref (Wiring_Matrix.production.json entries.catalog.chat_goal_start)
      # and the catalog registration table (UI_Command_Catalog.md:15016).
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/GoalStartResultScopeV2
      # The wiring result_schema_ref; the Goal Runtime result boundary (goal_id, revision 1,
      # currentness_hash, creation receipt; Goal_Runtime_System.md:254) is carried by that contract.
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required]
      # No registration table states disabled reasons for this row; drawn from the closed set over the
      # catalog preconditions assistant_chat_available && goal_runtime_available && no_active_goal_on_thread
      # (UI_Command_Catalog.md:15016): runtime unavailable maps to not_configured/unreachable/degraded and
      # an active goal already on the thread to blocked_state_required. handler_unavailable stays the
      # evidence boundary (Plans/Commands_System.md:6400), which the always-set already covers.
      # blocked_state_required in disabled adds blocked_state_required to error_codes.
      aliases: []
    - command_id: cmd.chat.goal.update
      ucc_units: [UCC-096]
      command_kind: domain_action
      # canon: UI_Command_Catalog.md:15017 Simplified Goal Runtime registration table command_kind column.
      response_kind: owner_operation
      args:
        # UICommand.args are the GoalUpdateRequestV2 fields the 2.7.1 row names as the payload
        # (UI_Command_Catalog.md:1122 'GoalUpdateRequestV2 under CV-342'), minus its request markers
        # schema_id, schema_version and command_instance_id and the envelope-carried command_id,
        # source_surface and actor_ref, which the envelope and the owner request carry at their layers.
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
          required: false
          default: none
          required_when: {field: change_source, in: [agent_proposed_user_approved]}
          forbidden_when: {field: change_source, in: [user_direct]}
          provenance: canon
          source: "GoalUpdateRequestV2 source_message_id is required-but-nullable (string minLength 1 or null): null exactly when change_source is user_direct and a non-null string otherwise; modeled optional with those conditionals because the closed vocabulary has no nullable type"
        approval_id:
          type: id
          required: false
          default: none
          required_when: {field: change_source, in: [agent_proposed_user_approved]}
          forbidden_when: {field: change_source, in: [user_direct]}
          provenance: canon
          source: "GoalUpdateRequestV2 approval_id is required-but-nullable (string minLength 1 or null): null exactly when change_source is user_direct and a non-null resolved approval otherwise (goal_present && expected_goal_revision_current && (user_authored_edit || approval_granted), UI_Command_Catalog.md:15017)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      # Equals the wiring request_schema_ref (Wiring_Matrix.production.json entries.catalog.chat_goal_update).
      # The catalog registration table names the goal-layer pair GoalUpdateRequestV2 -> GoalUpdateResultV2
      # (UI_Command_Catalog.md:15017; Plans/Commands_System.md:6401), which the chat-owner request carries
      # as its typed owner input.
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      # Equals the wiring result_schema_ref; its owner_result_ref carries the GoalUpdateResultV2 body
      # transaction result (revision n+1 atomically under GRS-068/SP-299, Goal_Runtime_System.md:255).
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      # No registration table states disabled reasons for this row; drawn from the closed set over the
      # catalog preconditions goal_present && expected_goal_revision_current && (user_authored_edit ||
      # approval_granted) (UI_Command_Catalog.md:15017): no goal or no approved change maps to
      # blocked_state_required, a stale expected revision or currentness hash to stale_projection, and
      # runtime availability to not_configured/unreachable/degraded. stale_projection in disabled keeps
      # stale_projection in error_codes (already required for a domain_action).
      aliases: []
```
