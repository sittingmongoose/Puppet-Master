# Shard 080: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/assistant-chat-design.md`

Source lines: L29062-L31287

Source SHA256: `f2db76688d9646c0746c0b06525ef4e61a36dacd803b2e3ccb50d29c827bddf4`

---

## Command payload definitions (DL-333, 2026-11-05)

Typed payload definitions for the assistant chat command families that `Plans/UI_Command_Catalog.md#UCC-230` routes to this document (DL-333). Each unit below is a `command_contract` PlanUnit; the fenced `command_payload_definitions` block after it gives each active command its args, owner result and narrowed error and disabled-reason codes in `pm.command_payload_definitions.v1`. The catalog keeps ids, labels, availability and aliases; the strict schema overlay keeps the common envelope and the closed code sets.

### ACD-637 - Chat Thread Lifecycle, Context Lens, Thread Worktree And Context Detail Command Payload Definitions

```yaml
plan_unit_id: ACD-637
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Typed payload definitions for the chat thread lifecycle and discovery, Context Lens, assistant
  thread worktree, and thread context-detail commands that UI_Command_Catalog UCC-056..UCC-060
  register (DL-333). The definitions block below gives each active command its args, owner result
  and narrowed error and disabled-reason codes in pm.command_payload_definitions.v1. The catalog
  keeps ids, labels, availability and aliases; the strict schema overlay keeps the common envelope
  and the closed code sets. Every command wired through ChatOwnerCommandRequestV2 carries its typed
  args as that request's owner input, named by owner_input_schema_ref and carried by owner_input_ref
  and owner_input_sha256; a local result named here is the domain payload that ChatOwnerCommandResultV2
  carries by owner_result_ref. cmd.chat.new carries the ChatNewRequestScopeV2 draft identity
  (UCC-230 identity exemption, DL-333 resolution 8). The three thread context-detail commands carry
  CV-360's placement fields where, mode, by and background, as UCC-200's table of routes that open or
  reveal a tab and their production wiring rows require, and open and focus return CV-360's open result.
  Judgments the definitions make are in each definition's judgments list (DL-341).
  cmd.chat.worktree.bind_existing is a retired non-alias (DL-335) and gets no definition or alias here.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible chat thread, Context Lens, thread worktree and context-detail commands.
depends_on: [UCC-230, UCC-056, UCC-057, UCC-058, UCC-059, UCC-060, UCC-200, CV-360, ACD-191, ACD-192, ACD-193, ACD-194, ACD-460, ACD-461, DL-333, DL-335, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to ACD-637 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.chat.new, cmd.chat.archive, cmd.chat.delete, cmd.chat.rename, cmd.chat.pin, cmd.chat.export, cmd.chat.search, cmd.chat.context_lens.toggle, cmd.chat.context_lens.set_mode, cmd.chat.context_lens.turn_off, cmd.chat.context_lens.toggle_message_selection, cmd.chat.context_lens.clear_selection, cmd.chat.context_lens.apply_subcompact, cmd.chat.context_lens.revert_subcompact, cmd.chat.worktree.create, cmd.chat.worktree.unbind, cmd.chat.worktree.remove, cmd.chat.worktree.merge, cmd.chat.worktree.pr, cmd.chat.worktree.info, cmd.chat.compact_context, cmd.chat.open_thread_context_details, cmd.chat.focus_thread_context_details, cmd.chat.close_thread_context_details]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token (the grouped cmd.chat.{new,archive,delete,rename,pin,export,search} token, the cmd.chat.worktree.* family token, retired cmd.chat.worktree.bind_existing per DL-335).
  - Do not define the project-scope cmd.git.worktree.* family here; UCC-230 routes it to W-095.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Prompt_Pipeline.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: ACD-637
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.new
      ucc_units: [UCC-056]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        draft_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 required draft_id (string, minLength 1, maxLength 256); the draft identity UCC-230's identity exemption names (DL-333 resolution 8)"
        place_kind:
          type: enum
          values: [no_project, project]
          required: true
          default: none
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 place_kind enum [no_project, project]"
        project_id:
          type: id
          required: false
          default: none
          required_when: {field: place_kind, in: [project]}
          forbidden_when: {field: place_kind, in: [no_project]}
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 project_id (string or null; null when place_kind is no_project); UCC-230 envelope common optional project_id narrowed"
        initial_message_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 initial_message_ref (string 1..256 or null; absent here sends null); the first user message whose commit mints thread_id (UI_Command_Catalog.md:734)"
        initial_message_sha256:
          type: sha256
          required: false
          default: none
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 initial_message_sha256 (pattern ^[0-9a-f]{64}$ or null; absent here sends null), the digest beside initial_message_ref"
        expected_context_revision:
          type: integer
          required: true
          default: none
          constraints: {minimum: 0}
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 required expected_context_revision (integer, minimum 0)"
        return_context_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2 required return_context_ref (string 1..256)"
      identity_exemptions:
        - {field: thread_id, decision: DL-333, reason: "UCC-230 identity_exemptions: cmd.chat.new runs before a thread exists; thread_id is minted when the first user message commits (DL-333 resolution 8)"}
      owner_request: Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewRequestScopeV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/assistant_chat_contracts.schema.json#/$defs/ChatNewResultScopeV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6A row (UI_Command_Catalog.md:734) states no command_kind. New Thread mints draft identity and later the durable thread, a state change rather than a view toggle."
        - key: disabled_reason_codes
          choice: [not_configured]
          gap_note: "The row's only precondition is chat_available (UI_Command_Catalog.md:734); canon names no disabled code for it, so chat_available false is read as not_configured."
        - key: omitted:initiating_client_id
          choice: omitted
          gap_note: "ChatNewRequestScopeV2 requires initiating_client_id; canon does not say whether the caller or the dispatcher supplies it. Left to the handler, which takes it from the dispatch envelope (source_surface, actor_ref)."
        - key: omitted:server_id
          choice: omitted
          gap_note: "ChatNewRequestScopeV2 requires server_id; canon does not say who supplies it. Left to the handler, which resolves the actual Server of the selected WorkflowScopeV2."
        - key: omitted:execution_host_id
          choice: omitted
          gap_note: "ChatNewRequestScopeV2 requires execution_host_id; canon does not say who supplies it. Left to the handler, which resolves it with the scope."
        - key: omitted:execution_environment_id
          choice: omitted
          gap_note: "ChatNewRequestScopeV2 requires execution_environment_id; canon does not say who supplies it. Left to the handler, which resolves it with the scope."
    - command_id: cmd.chat.archive
      ucc_units: [UCC-056]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6A row (UI_Command_Catalog.md:735) states no command_kind. Archiving is the lifecycle transition to archived (assistant-chat-design.md Thread Lifecycle State Machine), a durable state change."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The row's preconditions thread_selected && !active_run_in_thread (UI_Command_Catalog.md:735) name no disabled code; both are read as blocked states."
    - command_id: cmd.chat.delete
      ucc_units: [UCC-056]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "row precondition delete_confirmed (UI_Command_Catalog.md:736) per UCC-230 identity rule; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, unsupported]
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6A row (UI_Command_Catalog.md:736) states no command_kind. Deleting persists the content-free tombstone and requests purge, a terminal lifecycle transition."
        - key: disabled_reason_codes
          choice: [blocked_state_required, unsupported]
          gap_note: "The row's preconditions (UI_Command_Catalog.md:736) name no disabled code: thread_selected, delete_confirmed and !active_run_in_thread are read as blocked states, deletion_family_available false as unsupported."
    - command_id: cmd.chat.rename
      ucc_units: [UCC-056]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        title:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            The field name title is canon: assistant-chat-design.md:1161 (Thread Identity Model: title is
            user-editable without changing identity) and the row renames the selected thread title
            (UI_Command_Catalog.md:737). Canon states no length bound; min_length 1 and max_length 256 are
            chosen here and stay open for the chat owner.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6A row (UI_Command_Catalog.md:737) states no command_kind. Renaming persists the thread title, a durable metadata change."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The row's precondition thread_selected (UI_Command_Catalog.md:737) names no disabled code; it is read as a blocked state."
    - command_id: cmd.chat.pin
      ucc_units: [UCC-056]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        pinned:
          type: boolean
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row says "Pins or unpins the selected thread" (UI_Command_Catalog.md:738); canon does
            not state whether the command is a no-argument toggle or carries an explicit pinned
            boolean, and names no field. Choice: optional pinned boolean, absent = toggle the
            current pin state. Alternative: no argument at all, pure toggle.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6A row (UI_Command_Catalog.md:738) states no command_kind. Pin/unpin persists thread-list pin state, a durable state change."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The row's precondition thread_selected (UI_Command_Catalog.md:738) names no disabled code; it is read as a blocked state."
    - command_id: cmd.chat.export
      ucc_units: [UCC-056]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        format:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row exports "to the supported local export format" (UI_Command_Catalog.md:739) but
            never names the format or formats and states no default. Choice: optional opaque format
            token, absent = the surface's default export format. Alternative: a closed enum once an
            owner names the supported formats.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadExportResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6A row (UI_Command_Catalog.md:739) states no command_kind. Exporting produces a local export artifact, an owner write."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The row's precondition thread_selected (UI_Command_Catalog.md:739) names no disabled code; it is read as a blocked state."
    - command_id: cmd.chat.search
      ucc_units: [UCC-056]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        query:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            The row searches within the selected thread (UI_Command_Catalog.md:740) but names no query
            field. Choice: query, the field name the /web search schema uses (assistant-chat-design.md:341);
            min_length 1 and max_length 256 are chosen here, no canon bound exists for in-thread search.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatThreadSearchResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases:
        - {command_id: 'cmd.chat.{new,archive,delete,rename,pin,export,search}', kind: family_alias,
           source: "UCC-056 preserved_exact_tokens grouped token; UI_Command_Catalog.md:730; UCC-230 non_definition_tokens"}
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The 2.6A row (UI_Command_Catalog.md:740) states no command_kind. In-thread search reads the chat index and restores focus to matches; it changes no durable thread state."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The row's precondition thread_selected (UI_Command_Catalog.md:740) names no disabled code; it is read as a blocked state."
    - command_id: cmd.chat.context_lens.toggle
      ucc_units: [UCC-057]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The Context Lens row (UI_Command_Catalog.md:750) states no command_kind. Toggling only opens or closes the dropdown."
        - key: response_kind
          choice: owner_operation
          gap_note: "The row is dropdown view state, but its production wiring row (Plans/Wiring_Matrix.production.json catalog.chat_context_lens_toggle) names request ChatOwnerCommandRequestV2 and result ChatOwnerCommandResultV2, so the definition follows the wired owner contracts rather than a local projection."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The Lens is thread-local (assistant-chat-design.md section 17.6) and canon names no disabled code; no selected thread is read as a blocked state."
    - command_id: cmd.chat.context_lens.set_mode
      ucc_units: [UCC-057]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        context_lens_mode:
          type: enum
          values: [mute, focus, subcompact]
          required: true
          default: none
          provenance: canon
          source: "row 'Set active mode to mute, focus, or subcompact' (UI_Command_Catalog.md:751); overlay UCC-056..UCC-060 optional identity context_lens_mode"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensModeResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The Context Lens row (UI_Command_Catalog.md:751) states no command_kind. Setting the mode establishes the one active shaping mode, and Mute/Focus apply immediately (assistant-chat-design.md section 17.6), a shaping change."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Thread-local control (section 17.6); canon names no disabled code, so no selected thread is read as a blocked state."
    - command_id: cmd.chat.context_lens.turn_off
      ucc_units: [UCC-057]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensTurnOffResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The Context Lens row (UI_Command_Catalog.md:752) states no command_kind. Turn Off clears selection and releases applied shaping with an attributable receipt (ACD-460), an owner state change."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Thread-local control (section 17.6); canon names no disabled code, so no selected thread is read as a blocked state."
    - command_id: cmd.chat.context_lens.toggle_message_selection
      ucc_units: [UCC-057]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        message_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The catalog row toggles "one message" (UI_Command_Catalog.md:753) and the wiring row says
            "message ids[] selection mutation" (Plans/Wiring_Matrix.md Context Lens minimum rows):
            single message_id versus a list is not settled. Choice: one message_id per dispatch
            (the catalog row's own words); a batch list variant stays open.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensSelectionResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The Context Lens row (UI_Command_Catalog.md:753) states no command_kind. Toggling mutates the thread-local selection set, which Mute/Focus apply immediately."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Canon names no disabled code; no selected thread or message is read as a blocked state."
    - command_id: cmd.chat.context_lens.clear_selection
      ucc_units: [UCC-057]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensSelectionResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The Context Lens row (UI_Command_Catalog.md:754) states no command_kind. Clearing mutates the thread-local selection set without touching canonical history."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Thread-local control (section 17.6); canon names no disabled code, so no selected thread is read as a blocked state."
    - command_id: cmd.chat.context_lens.apply_subcompact
      ucc_units: [UCC-057]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        context_projection_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row applies "from the current source-bound preview" (UI_Command_Catalog.md:755) and
            ACD-460 binds previews to exact scope, source revisions, shaping revision and summary
            identity, but canon names no preview identity field. Choice: the overlay's
            context_projection_ref carries the source-bound preview; alternative: a dedicated
            subcompact preview ref, which no canon names.
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "row 'Requires explicit confirmation' (UI_Command_Catalog.md:755) per UCC-230 identity rule; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensSubcompactResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The Context Lens row (UI_Command_Catalog.md:755) states no command_kind. Applying creates the local summary artifact and changes effective context assembly (ACD-460), an owner write."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "Canon names no disabled code. The row requires source/shaping currentness (UI_Command_Catalog.md:755) and ACD-460 refuses Apply on drift, read as stale_projection; no selected thread or missing confirmation is a blocked state."
    - command_id: cmd.chat.context_lens.revert_subcompact
      ucc_units: [UCC-057]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        context_projection_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon names no field for the subcompacted region being restored. The row restores "a
            previously subcompacted region" using canonical source refs (UI_Command_Catalog.md:756)
            and the wiring row restores "original selected message block" (Plans/Wiring_Matrix.md
            Context Lens minimum rows). Choice: the overlay's context_projection_ref identifies the
            applied shaping projection whose region is restored; alternative: a region or message-range
            ref, which no canon names.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ContextLensSubcompactResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The Context Lens row (UI_Command_Catalog.md:756) states no command_kind. Reverting restores a subcompacted region to full effective-context state through rehydration, an owner write."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "Canon names no disabled code. Rehydration uses canonical source refs (UI_Command_Catalog.md:756), so a stale projection is read as stale_projection; no selected thread or no subcompacted region is a blocked state."
    - command_id: cmd.chat.worktree.create
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id, branch_name?, base_ref? } (assistant-chat-design.md:3383); overlay UCC-056..UCC-060 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        branch_name:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "The name branch_name? is canon (W.11, assistant-chat-design.md:3383); canon states no length bound, so min_length 1 and max_length 256 are chosen here."
        base_ref:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "The name base_ref? is canon (W.11, assistant-chat-design.md:3383); canon states no type beyond the name and no length bound, so a string of 1..256 is chosen here."
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeCreateResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6.1 row (UI_Command_Catalog.md:766) states no command_kind. Creating binds a new worktree to the thread (W.11), a durable binding change."
        - key: disabled_reason_codes
          choice: [blocked_state_required, not_configured, unsupported]
          gap_note: "Canon names no disabled code. Base when-clause (UI_Command_Catalog.md:762): activeThreadExists false is a blocked state, projectIsGitRepo false is not_configured, projectIsRemoteNonSSH is unsupported ('worktrees unsupported', :782); the row's !activeThreadHasWorktree visibility is a blocked state."
    - command_id: cmd.chat.worktree.unbind
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id } (assistant-chat-design.md:3384); overlay UCC-056..UCC-060 required identity thread_id (always)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6.1 row (UI_Command_Catalog.md:767) states no command_kind. Unbinding detaches the thread from its worktree, a durable binding change."
        - key: disabled_reason_codes
          choice: [blocked_state_required, not_configured, unsupported]
          gap_note: "Canon names no disabled code. activeThreadHasWorktree visibility and !activeThreadHasActiveRun enablement (UI_Command_Catalog.md:767) are read as blocked states; the base clauses (:762) as for create."
    - command_id: cmd.chat.worktree.remove
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id } (assistant-chat-design.md:3385); overlay UCC-056..UCC-060 required identity thread_id (always)"
        confirmation_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "row 'with confirmation if dirty' (UI_Command_Catalog.md:768); UCC-230 envelope common optional confirmation_ref, optional because confirmation is needed only for the dirty case"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6.1 row (UI_Command_Catalog.md:768) states no command_kind. Removing detaches and prunes the thread worktree, a destructive owner write."
        - key: disabled_reason_codes
          choice: [blocked_state_required, not_configured, unsupported]
          gap_note: "Canon names no disabled code. activeThreadHasWorktree visibility and !activeThreadHasActiveRun enablement (UI_Command_Catalog.md:768) are read as blocked states; the base clauses (:762) as for create."
    - command_id: cmd.chat.worktree.merge
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id, strategy?, target_branch?, message? } (assistant-chat-design.md:3386); overlay UCC-056..UCC-060 required identity thread_id (always)"
        strategy:
          type: enum
          values: [squash, merge, rebase]
          required: false
          default: squash
          provenance: canon
          source: "W.11 strategy? (assistant-chat-design.md:3386); values squash|merge|rebase in the W.8.7 structured action (assistant-chat-design.md:3280); W.8.1 merge dialog Strategy Squash / Merge / Rebase with default Squash (assistant-chat-design.md:3183)"
        target_branch:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "The name target_branch? is canon (W.11, assistant-chat-design.md:3386; W.8.7 :3280 types it string); W.8.1 (:3184) says it must be an existing local branch and defaults from branching.assistant_worktree_base_ref or branching.base_branch, which the handler resolves, so default none here. Canon states no length bound; min_length 1 and max_length 256 are chosen here."
        message:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 4096}
          provenance: gap
          gap_note: "The name message? is W.11's (assistant-chat-design.md:3386); W.8.7 (:3280) names the same field commit_message, a canon conflict this definition does not settle (W.11 is the command parameter table, kept here). W.8.1 (:3185) auto-generates it per strategy and hides it for Rebase. Canon states no length bound; min_length 1 and max_length 4096 are chosen here."
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeMergeResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6.1 row (UI_Command_Catalog.md:769) states no command_kind. Merge runs the user-confirmed merge-back flow (W.8), an owner write."
        - key: disabled_reason_codes
          choice: [blocked_state_required, not_configured, unsupported]
          gap_note: "Canon names no disabled code. The enablement clause !activeThreadHasActiveRun && !worktreeDirty && !worktreeHasConflicts && !worktreeDetachedHead && !mergeLockHeld (UI_Command_Catalog.md:769) is read as blocked states; the base clauses (:762) as for create."
    - command_id: cmd.chat.worktree.pr
      ucc_units: [UCC-058, UCC-059]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id, title?, body?, target_branch? } (assistant-chat-design.md:3387); overlay UCC-056..UCC-060 required identity thread_id (always)"
        title:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "The name title? is canon (W.11, assistant-chat-design.md:3387); canon states no length bound, so min_length 1 and max_length 256 are chosen here."
        body:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 65536}
          provenance: gap
          gap_note: "The name body? is canon (W.11, assistant-chat-design.md:3387); canon states no length bound, so min_length 1 and max_length 65536 are chosen here."
        target_branch:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "The name target_branch? is canon (W.11, assistant-chat-design.md:3387); canon states no length bound, so min_length 1 and max_length 256 are chosen here."
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreePrResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The 2.6.1 row (UI_Command_Catalog.md:770) states no command_kind. PR opens the PR creation flow for the bound branch (W.8.6), an owner interaction with the forge."
        - key: disabled_reason_codes
          choice: [blocked_state_required, not_configured, unsupported]
          gap_note: "Canon names no disabled code. projectHasGitHubRemote false (UI_Command_Catalog.md:770) is read as not_configured; activeThreadHasWorktree visibility and !activeThreadHasActiveRun && !worktreeDetachedHead enablement as blocked states; the base clauses (:762) as for create."
    - command_id: cmd.chat.worktree.info
      ucc_units: [UCC-058, UCC-059]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "W.11 parameters { thread_id } (assistant-chat-design.md:3388); overlay UCC-056..UCC-060 required identity thread_id (always)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWorktreeInfoResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, not_configured, unsupported]
      aliases:
        - {command_id: cmd.chat.worktree.*, kind: family_alias,
           source: "UCC-054 preserved_exact_tokens; UI_Command_Catalog.md:718; UCC-230 non_definition_tokens (thread-scoped family, concrete rows are UCC-058's)"}
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The 2.6.1 row (UI_Command_Catalog.md:771) states no command_kind. Info shows the binding and status without mutation, a read-only view of the owner binding store."
        - key: disabled_reason_codes
          choice: [blocked_state_required, not_configured, unsupported]
          gap_note: "Canon names no disabled code. activeThreadHasWorktree visibility (UI_Command_Catalog.md:771) is read as a blocked state; the base clauses (:762) as for create."
    - command_id: cmd.chat.compact_context
      ucc_units: [UCC-060]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog payload { thread_id } (UI_Command_Catalog.md:790); overlay UCC-056..UCC-060 required identity thread_id (always)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatCompactContextResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, degraded]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The row (UI_Command_Catalog.md:790) states no command_kind. Compaction runs the bounded compaction transaction whose commit emits context.compaction.completed (ACD-461), an owner write."
        - key: disabled_reason_codes
          choice: [not_configured, degraded]
          gap_note: "Canon names no disabled code. The row's result vocabulary includes degraded and unavailable (UI_Command_Catalog.md:790); a degraded compaction family is read as degraded and no available compaction family as not_configured."
    - command_id: cmd.chat.open_thread_context_details
      ucc_units: [UCC-060]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog payload { thread_id } (UI_Command_Catalog.md:791); overlay UCC-056..UCC-060 required identity thread_id (always)"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field where: auto, tab, panel, right, down or a panel id; default auto; an id that names no panel reads as auto. The route is in UCC-200's table of routes that open or reveal a tab (UI_Command_Catalog.md:18060), and its wiring row (catalog.chat_open_thread_context_details) carries CV-360's placement fields."
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field mode: preview or keep, preview only for kinds with a preview tab; CV-360 states no default"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field by: user or agent:<name>, default user; an agent always opens in the background; wiring row catalog.chat_open_thread_context_details: by agent:<name> lands as a background tab and never takes keyboard focus (F3-634)"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field background, default false"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ThreadContextDetailsOpenResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The row (UI_Command_Catalog.md:791) states no command_kind; its effect is layout/UI state: open adds or reveals the thread's context tab (UCC-200, DL-180)."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Canon names no disabled code; the pane is thread-bound, so no selected thread is read as a blocked state."
    - command_id: cmd.chat.focus_thread_context_details
      ucc_units: [UCC-060]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog payload { thread_id } (UI_Command_Catalog.md:792); overlay UCC-056..UCC-060 required identity thread_id (always)"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field where: auto, tab, panel, right, down or a panel id; default auto. The route is in UCC-200's table of routes that open or reveal a tab (UI_Command_Catalog.md:18060); a reveal of an open tab never moves it (CV-360)."
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field mode: preview or keep; CV-360 states no default"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field by: user or agent:<name>, default user"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field background, default false"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ThreadContextDetailsOpenResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The row (UI_Command_Catalog.md:792) states no command_kind; its effect is layout/UI state: focus reveals the existing context tab (UCC-200, DL-180)."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Canon names no disabled code; no selected thread or no open context tab is read as a blocked state."
    - command_id: cmd.chat.close_thread_context_details
      ucc_units: [UCC-060]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog payload { thread_id } (UI_Command_Catalog.md:793); overlay UCC-056..UCC-060 required identity thread_id (always)"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field where: auto, tab, panel, right, down or a panel id; default auto. The route is in UCC-200's table of routes that open or reveal a tab (UI_Command_Catalog.md:18060), and its wiring row (catalog.chat_close_thread_context_details) carries CV-360's placement fields."
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field mode: preview or keep; CV-360 states no default"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field by: user or agent:<name>, default user"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 placement field background, default false"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The row (UI_Command_Catalog.md:793) states no command_kind; its effect is layout/UI state: close closes the context tab (UCC-200, DL-180)."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Canon names no disabled code; no selected thread is read as a blocked state. With no context tab open the wiring row returns a receipt and emits nothing, so that case is not disabled."
  results:
    ChatThreadLifecycleResultV1:
      fields:
        thread_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the thread acted on"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch or owner receipt"}
    ChatThreadExportResultV1:
      fields:
        export_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the produced local export artifact; no canon names the export artifact field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_export)"}
    ChatThreadSearchResultV1:
      fields:
        query_session_id: {type: id, required: false, default: none, provenance: gap, gap_note: "session id if in-thread search keeps a query session; canon does not say"}
        message_ids: {type: list, item: {type: id}, required: false, default: none, provenance: gap, gap_note: "matched message ids the surface focuses; canon names no result field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_search)"}
    ContextLensModeResultV1:
      fields:
        context_lens_mode: {type: enum, values: [mute, focus, subcompact], required: true, default: none, provenance: gap, gap_note: "the mode now active; result shape is not canon"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_context_lens_set_mode)"}
    ContextLensTurnOffResultV1:
      fields:
        released_counts: {type: integer, required: false, default: none, provenance: gap, gap_note: "the disclosed released counts (UI_Command_Catalog.md:752 'disclose released counts'); no canon names the field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the attributable receipt ACD-460 requires for releasing applied shaping"}
    ContextLensSelectionResultV1:
      fields:
        selection_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the selection set state after the toggle/clear; canon names no field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt"}
    ContextLensSubcompactResultV1:
      fields:
        context_projection_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the applied or reverted shaping projection; canon names no field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt"}
    ChatWorktreeCreateResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the created worktree binding"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_create)"}
    ChatWorktreeLifecycleResultV1:
      fields:
        worktree_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the unbound/removed worktree when one was bound"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_unbind / _remove)"}
    ChatWorktreeMergeResultV1:
      fields:
        merge_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the merge-back outcome record; W.8 names the flow, not a result field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_merge)"}
    ChatWorktreePrResultV1:
      fields:
        pr_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the created PR when creation completed; W.8.6 names the flow, not a result field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_pr)"}
    ChatWorktreeInfoResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the bound worktree; W.2 owns the binding record, no result field is canon"}
        branch: {type: string, required: false, default: none, provenance: gap, gap_note: "the bound branch, when the binding records one (W.2)"}
        status: {type: string, required: false, default: none, provenance: gap, gap_note: "the binding status the row shows; opaque projection token"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_worktree_info)"}
    ChatCompactContextResultV1:
      fields:
        outcome:
          type: enum
          values: [started, already_running, cancelled, no_op, degraded, unavailable, retry_scheduled, completed, failed]
          required: true
          default: none
          provenance: canon
          source: "result/receipt projection vocabulary (UI_Command_Catalog.md:790)"
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the result/receipt projection the row requires"}
    ThreadContextDetailsOpenResultV1:
      fields:
        ok: {type: boolean, required: true, default: none, provenance: canon, source: "Plans/Contracts_V0.md#CV-360: an open returns { ok, panel_tab_id, panel_id, created, reason }"}
        panel_tab_id: {type: id, required: true, default: none, provenance: canon, source: "Plans/Contracts_V0.md#CV-360 open result panel_tab_id, the panel tab id"}
        panel_id: {type: id, required: true, default: none, provenance: canon, source: "Plans/Contracts_V0.md#CV-360 open result panel_id"}
        created: {type: boolean, required: true, default: none, provenance: canon, source: "Plans/Contracts_V0.md#CV-360 open result created: false when an open tab was revealed"}
        reason:
          type: string
          required: true
          default: none
          nullable: true
          provenance: canon
          source: "Plans/Contracts_V0.md#CV-360 open result reason: null on success, else unknown_kind, not_ready or the route's own refusal"
```

### ACD-638 - Chat Message, Code-Block, Rewind Revert And Message Details Command Payload Definitions

```yaml
plan_unit_id: ACD-638
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Typed payload definitions for the chat message action, code-block, rewind/revert and
  message-details commands that UI_Command_Catalog UCC-073..UCC-076 register (DL-333). The
  definitions block below gives each active command its args, owner result and narrowed error and
  disabled-reason codes in pm.command_payload_definitions.v1. The catalog keeps ids, labels,
  availability and aliases; the strict schema overlay keeps the common envelope and the closed code
  sets. cmd.chat.revert keeps the FileSafe whole-turn manifest semantics of UCC-075 and ACD-217 and
  cmd.chat.rewind stays conversation-only; the two are never conflated. cmd.chat.add_file_reference
  is a file-only compatibility alias of cmd.chat.attachment.add (UCC-156, outside this range) and
  gets no definition here.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible chat message, code-block, rewind/revert and details commands.
depends_on: [UCC-230, UCC-073, UCC-074, UCC-075, UCC-076, ACD-217, ACD-012, ACD-013, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to ACD-638 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - cmd.chat.revert's result keeps the exact FileSafe outcome vocabulary; restored_with_conflicts and partial multi-file success stay invalid.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.chat.copy_message, cmd.chat.retry_message, cmd.chat.rewind, cmd.chat.revert, cmd.chat.edit_last_user_message, cmd.chat.resend_last_user_message, cmd.chat.copy_code_block, cmd.chat.insert_code_block, cmd.chat.apply_code_block, cmd.chat.toggle_message_details]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias or source-lineage token (cmd.chat.add_file_reference is a file-only compatibility alias of cmd.chat.attachment.add, UCC-156).
  - cmd.chat.rewind must not be used as a file-restore alias and cmd.chat.revert must not rewind conversation state (UCC-075, ACD-217).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/FileSafe.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: ACD-638
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.copy_message
      ucc_units: [UCC-073]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, message_id } (UI_Command_Catalog.md:972); overlay UCC-073..UCC-076 required identity thread_id (always)"
        message_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, message_id } (UI_Command_Catalog.md:972); overlay UCC-073..UCC-076 optional identity message_id made required by the row precondition message_selected (UI_Command_Catalog.md:990)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The rows (UI_Command_Catalog.md:972, :990) state no command_kind. Copy puts the rendered message content on the clipboard and changes no owner state."
        - key: response_kind
          choice: owner_operation
          gap_note: "A clipboard copy needs no owner result, but the production wiring row catalog.chat_copy_message names request ChatOwnerCommandRequestV2 and result ChatOwnerCommandResultV2, so the definition follows the wired owner contracts."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The preconditions chat_active && message_selected (UI_Command_Catalog.md:990) name no disabled code; they are read as blocked states."
    - command_id: cmd.chat.retry_message
      ucc_units: [UCC-073]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, message_id } (UI_Command_Catalog.md:973); overlay UCC-073..UCC-076 required identity thread_id (always)"
        message_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, message_id } (UI_Command_Catalog.md:973); overlay UCC-073..UCC-076 optional identity message_id made required by the row's selected-turn subject"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatRetryMessageResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The row (UI_Command_Catalog.md:973) states no command_kind. Retry re-runs the selected failed or cancelled assistant turn, an owner run action."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Canon names no disabled code; no selected failed or cancelled assistant turn is read as a blocked state."
    - command_id: cmd.chat.rewind
      ucc_units: [UCC-073, UCC-075, UCC-076]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, target_message_id } (UI_Command_Catalog.md:974); overlay UCC-073..UCC-076 required identity thread_id (always)"
        target_message_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters { thread_id, target_message_id } (UI_Command_Catalog.md:974)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatRewindResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The row (UI_Command_Catalog.md:974) states no command_kind. Rewind performs the conversation-only soft history mutation (assistant-chat-design.md section 4) and never restores files."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Canon names no disabled code; no eligible conversation restore point is read as a blocked state."
    - command_id: cmd.chat.revert
      ucc_units: [UCC-073, UCC-075, UCC-076]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); UCC-230 envelope common optional project_id restated required"
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); overlay UCC-073..UCC-076 required identity thread_id (always)"
        target_message_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "catalog parameters target_message_id? (UI_Command_Catalog.md:975); omitted resolves to the latest eligible mutating assistant turn"
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); UCC-230 envelope common optional repo_id restated required (the resolved turn record must match repo_id before mutation, UI_Command_Catalog.md:999)"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); UCC-230 envelope common optional worktree_id restated required (the resolved turn record must match worktree_id before mutation, UI_Command_Catalog.md:999)"
        expected_turn_manifest_sha256:
          type: sha256
          required: true
          default: none
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); the resolved turn record must match it before mutation (UI_Command_Catalog.md:999)"
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "catalog parameters (UI_Command_Catalog.md:975); UCC-230 envelope common optional idempotency_key restated required at its canonical max_length 256"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatRevertResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The row (UI_Command_Catalog.md:975) states no command_kind. Revert exact-replaces the whole-turn mutation manifest through FileSafe (ACD-217), an owner write."
        - key: disabled_reason_codes
          choice: [blocked_state_required, stale_projection]
          gap_note: "Canon names no disabled code. no_eligible_mutating_turn refuses without a FileSafe transaction (UI_Command_Catalog.md:999) and is read as a blocked state; a stale manifest or identity mismatch is read as stale_projection."
    - command_id: cmd.chat.edit_last_user_message
      ucc_units: [UCC-074, UCC-076]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && has_user_messages (UI_Command_Catalog.md:988); the row resolves the last user message itself and names no message argument"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatSoftHistoryMutationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The row (UI_Command_Catalog.md:988) states no command_kind. Edit restores the last user message into the composer and soft-mutates later history (assistant-chat-design.md section 4), an owner state change."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The preconditions chat_active && has_user_messages (UI_Command_Catalog.md:988) name no disabled code; they are read as blocked states."
    - command_id: cmd.chat.resend_last_user_message
      ucc_units: [UCC-074, UCC-076]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && has_user_messages (UI_Command_Catalog.md:989); the row resolves the last user message itself and names no message argument"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatSoftHistoryMutationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The row (UI_Command_Catalog.md:989, :1003) states no command_kind. Resend replays the latest user-authored input and discards later generated history (assistant-chat-design.md section 4), an owner run action."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The preconditions chat_active && has_user_messages (UI_Command_Catalog.md:989) name no disabled code; they are read as blocked states."
    - command_id: cmd.chat.copy_code_block
      ucc_units: [UCC-074]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && code_block_selected (UI_Command_Catalog.md:991)"
        code_block_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 optional identity code_block_id made required by the row precondition code_block_selected (UI_Command_Catalog.md:991) per UCC-230 identity rule; the three code-block rows operate on a resolved code-block sub-selection (UI_Command_Catalog.md:1004)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The row (UI_Command_Catalog.md:991) states no command_kind. Copy puts the resolved code-block content on the clipboard and changes no owner state."
        - key: response_kind
          choice: owner_operation
          gap_note: "A clipboard copy needs no owner result, but the production wiring row catalog.chat_copy_code_block names request ChatOwnerCommandRequestV2 and result ChatOwnerCommandResultV2, so the definition follows the wired owner contracts."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The preconditions chat_active && code_block_selected (UI_Command_Catalog.md:991) name no disabled code; they are read as blocked states."
    - command_id: cmd.chat.insert_code_block
      ucc_units: [UCC-074]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && code_block_selected && editor_active (UI_Command_Catalog.md:992); the row's target is the active editor cursor"
        code_block_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 optional identity code_block_id made required by the row precondition code_block_selected (UI_Command_Catalog.md:992) per UCC-230 identity rule"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The row (UI_Command_Catalog.md:992) states no command_kind. Insert places the code-block content at the active editor cursor, a local editor action."
        - key: response_kind
          choice: owner_operation
          gap_note: "An editor insertion needs no owner result, but the production wiring row catalog.chat_insert_code_block names request ChatOwnerCommandRequestV2 and result ChatOwnerCommandResultV2, so the definition follows the wired owner contracts."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The preconditions chat_active && code_block_selected && editor_active (UI_Command_Catalog.md:992) name no disabled code; they are read as blocked states."
    - command_id: cmd.chat.apply_code_block
      ucc_units: [UCC-074]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && code_block_selected (UI_Command_Catalog.md:993)"
        code_block_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 optional identity code_block_id made required by the row precondition code_block_selected (UI_Command_Catalog.md:993) per UCC-230 identity rule"
        target_file:
          type: path
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row applies the block "as an edit to the relevant file" (UI_Command_Catalog.md:993)
            but names neither the target-file field nor the rule that resolves it (code-block
            filename binding, /open-in-editor's resolved path, or an explicit choice).
            Choice: optional FileSafe-normalized target_file, absent = the resolved binding;
            alternatives: make it required, or name the resolution rule owner.
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatApplyCodeBlockResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The row (UI_Command_Catalog.md:993) states no command_kind. Apply edits the relevant file with the code-block content, an owner write through the file pipeline."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The preconditions chat_active && code_block_selected (UI_Command_Catalog.md:993) name no disabled code; they are read as blocked states."
    - command_id: cmd.chat.toggle_message_details
      ucc_units: [UCC-074]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 required identity thread_id (always); row preconditions chat_active && message_selected (UI_Command_Catalog.md:994)"
        message_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-073..UCC-076 optional identity message_id made required by the row precondition message_selected (UI_Command_Catalog.md:994) per UCC-230 identity rule"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The row (UI_Command_Catalog.md:994) states no command_kind. Toggle only shows or hides message metadata."
        - key: response_kind
          choice: owner_operation
          gap_note: "A view-state toggle needs no owner result, but the production wiring row catalog.chat_toggle_message_details names request ChatOwnerCommandRequestV2 and result ChatOwnerCommandResultV2, so the definition follows the wired owner contracts."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The preconditions chat_active && message_selected (UI_Command_Catalog.md:994) name no disabled code; they are read as blocked states."
  results:
    ChatRetryMessageResultV1:
      fields:
        assistant_turn_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the new assistant turn the retry starts; no canon names the result field"}
        run_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the run the re-run belongs to, when one is started"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_retry_message)"}
    ChatRewindResultV1:
      fields:
        target_message_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the conversation restore point rewound to"}
        superseded_by_message_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the soft-mutation marking assistant-chat-design.md section 4 names; canon does not say the result carries it"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_rewind)"}
    ChatRevertResultV1:
      fields:
        outcome:
          type: enum
          values: [restored_clean, restore_skipped, restore_refused, restore_failed, restore_recovery_required, no_eligible_mutating_turn]
          required: true
          default: none
          provenance: canon
          source: "FileSafe restore outcomes the command consumes, plus no_eligible_mutating_turn (UI_Command_Catalog.md:1000-1001; ACD-217)"
        manifest_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the restored whole-turn mutation manifest; no canon names the result field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_revert)"}
    ChatSoftHistoryMutationResultV1:
      fields:
        superseded_by_message_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the soft-mutation marking of later messages (assistant-chat-design.md section 4); result shape is not canon"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_edit_last_user_message / _resend_last_user_message)"}
    ChatApplyCodeBlockResultV1:
      fields:
        target_file: {type: path, required: false, default: none, provenance: gap, gap_note: "the file actually edited; mirrors the target_file gap"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_apply_code_block)"}
```

### ACD-639 - Chat Web Family And Stop Command Payload Definitions

```yaml
plan_unit_id: ACD-639
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Typed payload definitions for the cmd.chat.web.* web command family and cmd.chat.stop that
  UI_Command_Catalog UCC-077..UCC-083 register (DL-333). The definitions block below gives each
  active command its args, owner result and narrowed error and disabled-reason codes in
  pm.command_payload_definitions.v1. The catalog keeps ids, labels, availability and aliases; the
  strict schema overlay keeps the common envelope and the closed code sets. The /web UI-command
  schemas mirror the normalized web inputs (assistant-chat-design.md section 5.2), with the bounds of
  web_operation_contracts.schema.json WebActionInput; UCC-081 provider options are Settings/help
  visibility, and whether they are per-call args stays open: cmd.chat.web.search records each one it
  leaves out in its judgments list, and every web command records that invocation_source and
  agent_reason are left to the dispatcher pending the web owner. Legacy cmd.web.* spellings are compatibility-only retirement evidence and get no definition;
  retired slash labels (/webfetch, /webresearch, /cancel toward /stop) normalize before dispatch.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible chat web-operation and stop commands.
depends_on: [UCC-230, UCC-078, UCC-079, UCC-080, UCC-081, UCC-082, UCC-083, ACD-014, ACD-015, ACD-019, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to ACD-639 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets; the legacy web error names invalid_url, fetch_failed, provider_unavailable and credit_cap_exceeded are not used.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.chat.web.search, cmd.chat.web.fetch, cmd.chat.web.extract, cmd.chat.web.research, cmd.chat.web.crawl, cmd.chat.web.map, cmd.chat.web.help, cmd.chat.stop]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for a legacy or retired token (cmd.web.* spellings are compatibility-only retirement evidence; bare /web is help-only and dispatches cmd.chat.web.help; /cancel resolves internally to cmd.chat.stop before dispatch).
  - Do not flatten /web into separate top-level command families; the six operations stay one family.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Tools.md, Plans/Commands_System.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: ACD-639
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.web.search
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        query:
          type: string
          required: true
          default: none
          constraints: {min_length: 1}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: search uses { query }); /web search <query> consumes the remaining text verbatim (assistant-chat-design.md:342); Plans/web_operation_contracts.schema.json#/$defs/WebActionInput search branch query (string, minLength 1, no maximum)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "UCC-083's intent taxonomy (UI_Command_Catalog.md:1028) states no command_kind. Search runs the websearch operation through the shared dispatcher with an activity/provenance result, an owner operation."
        - key: disabled_reason_codes
          choice: [not_configured, unauthorized, unreachable, permission_required]
          gap_note: "Canon names no disabled code for the web rows. No configured web provider is read as not_configured (capability-unavailable branch, assistant-chat-design.md section 13.2), missing provider credentials as unauthorized, no network as unreachable, and an ask-gated web permission posture (UI_Command_Catalog.md:1038) as permission_required."
        - key: omitted:invocation_source
          choice: omitted
          gap_note: "Every web route persists invocation_source (UI_Command_Catalog.md:1028; Plans/web_operation_contracts.schema.json#/$defs/InvocationProvenance enum slash, palette, nl_user, agent_initiated, goal, prd, planning_wizard, subagent). Canon does not say whether it is a UICommand arg; left to the dispatcher, which derives it from source_surface and actor_ref."
        - key: omitted:agent_reason
          choice: omitted
          gap_note: "InvocationProvenance requires agent_reason (string, minLength 1) when invocation_source is agent_initiated, goal, prd, planning_wizard or subagent (Plans/web_operation_contracts.schema.json; UI_Command_Catalog.md:1028 'optional agent_reason'). Canon does not say whether the agent passes it as a UICommand arg or the dispatcher records it from the agent's turn; left out pending the web owner, candidate an optional agent_reason arg."
        - key: omitted:max_results
          choice: omitted
          gap_note: "UCC-081 lists max_results among the advanced provider controls shown in /web help and settings (UI_Command_Catalog.md:1035) and WebActionInput's search branch carries max_results (integer, minimum 1; Tools.md:709, default 8 at Tools.md:757). Canon does not say these are per-call UICommand args rather than settings; left out pending the web owner."
        - key: omitted:categories
          choice: omitted
          gap_note: "UCC-081 lets provider category help expose categories?: string[] with github, research, pdf when the provider supports them (UI_Command_Catalog.md:1036; WebActionInput search branch categories). Whether it is a per-call arg is not stated; left out pending the web owner."
        - key: omitted:include_domains
          choice: omitted
          gap_note: "UCC-081 lists include_domains among the advanced provider controls (UI_Command_Catalog.md:1035; WebActionInput search branch). Whether it is a per-call arg is not stated; left out pending the web owner."
        - key: omitted:exclude_domains
          choice: omitted
          gap_note: "UCC-081 lists exclude_domains among the advanced provider controls (UI_Command_Catalog.md:1035; WebActionInput search branch). Whether it is a per-call arg is not stated; left out pending the web owner."
        - key: omitted:time_range
          choice: omitted
          gap_note: "UCC-081 lists time_range, start_date and end_date among the advanced provider controls (UI_Command_Catalog.md:1035; WebActionInput search branch has time_range). Whether they are per-call args is not stated; left out pending the web owner."
    - command_id: cmd.chat.web.fetch
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        url:
          type: url
          required: true
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: fetch uses { url }); <url> normalizes to an absolute URL before dispatch (assistant-chat-design.md:342, UCC-082)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "UCC-083's intent taxonomy (UI_Command_Catalog.md:1028) states no command_kind. Fetch reads the URL through webfetch or the PM-native Site Reader path, an owner operation."
        - key: disabled_reason_codes
          choice: [not_configured, unauthorized, unreachable, permission_required]
          gap_note: "Canon names no disabled code for the web rows; read as for cmd.chat.web.search. Reading intents are host-scoped permission asks (UI_Command_Catalog.md:1038)."
        - key: omitted:invocation_source
          choice: omitted
          gap_note: "Every web route persists invocation_source (UI_Command_Catalog.md:1028; Plans/web_operation_contracts.schema.json#/$defs/InvocationProvenance). Canon does not say whether it is a UICommand arg; left to the dispatcher, which derives it from source_surface and actor_ref."
        - key: omitted:agent_reason
          choice: omitted
          gap_note: "InvocationProvenance requires agent_reason for agent-side invocation sources (Plans/web_operation_contracts.schema.json). Canon does not say whether it is a UICommand arg; left out pending the web owner, candidate an optional agent_reason arg."
    - command_id: cmd.chat.web.extract
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        url:
          type: url
          required: true
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: extract uses { url }); <url> normalizes to an absolute URL before dispatch (assistant-chat-design.md:342, UCC-082)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "UCC-083's intent taxonomy (UI_Command_Catalog.md:1028) states no command_kind. Extract runs the provider-level structured page pull, an owner operation."
        - key: disabled_reason_codes
          choice: [not_configured, unauthorized, unreachable, permission_required]
          gap_note: "Canon names no disabled code for the web rows; read as for cmd.chat.web.search. Extract is a host-scoped permission ask (UI_Command_Catalog.md:1038)."
        - key: omitted:invocation_source
          choice: omitted
          gap_note: "Every web route persists invocation_source (UI_Command_Catalog.md:1028; Plans/web_operation_contracts.schema.json#/$defs/InvocationProvenance). Canon does not say whether it is a UICommand arg; left to the dispatcher, which derives it from source_surface and actor_ref."
        - key: omitted:agent_reason
          choice: omitted
          gap_note: "InvocationProvenance requires agent_reason for agent-side invocation sources (Plans/web_operation_contracts.schema.json). Canon does not say whether it is a UICommand arg; left out pending the web owner, candidate an optional agent_reason arg."
    - command_id: cmd.chat.web.research
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        task:
          type: string
          required: true
          default: none
          constraints: {min_length: 1}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: research uses { task }); <task> consumes the remaining text verbatim (assistant-chat-design.md:342); Plans/web_operation_contracts.schema.json#/$defs/WebActionInput research branch task (string, minLength 1, no maximum)"
        research_mode:
          type: enum
          values: [standard, deep]
          required: false
          default: none
          provenance: canon
          source: "UCC-083 routes compare, investigate, research and deep-research requests to cmd.chat.web.research with research_mode (UI_Command_Catalog.md:1028); Plans/runtime_artifact_api_web_call.schema.json research_mode enum [standard, deep]; Plans/web_operation_contracts.schema.json#/$defs/WebActionInput research branch research_mode standard and deep_research branch research_mode deep"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "UCC-083's intent taxonomy (UI_Command_Catalog.md:1028) states no command_kind. Research runs the webresearch operation with research_mode, an owner operation."
        - key: disabled_reason_codes
          choice: [not_configured, unauthorized, unreachable, permission_required]
          gap_note: "Canon names no disabled code for the web rows; read as for cmd.chat.web.search. Research uses the * wildcard approval scope because the host is not known upfront (UI_Command_Catalog.md:1038)."
        - key: omitted:invocation_source
          choice: omitted
          gap_note: "Every web route persists invocation_source (UI_Command_Catalog.md:1028; Plans/web_operation_contracts.schema.json#/$defs/InvocationProvenance). Canon does not say whether it is a UICommand arg; left to the dispatcher, which derives it from source_surface and actor_ref."
        - key: omitted:agent_reason
          choice: omitted
          gap_note: "InvocationProvenance requires agent_reason for agent-side invocation sources (Plans/web_operation_contracts.schema.json). Canon does not say whether it is a UICommand arg; left out pending the web owner, candidate an optional agent_reason arg."
    - command_id: cmd.chat.web.crawl
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        root_url:
          type: url
          required: true
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: crawl/map use { root_url, max_pages?, max_depth?, same_origin_only? }); surfaced as a command-help field; URL normalization applies (UCC-082)"
        max_pages:
          type: integer
          required: false
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); Plans/web_operation_contracts.schema.json#/$defs/WebActionInput crawl branch max_pages (integer, minimum 1); when absent the webcrawl tool default max_pages = 25 applies (Plans/Tools.md:757), owned by Tools.md (UI_Command_Catalog.md:1039)"
        max_depth:
          type: integer
          required: false
          default: none
          constraints: {minimum: 0}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); Plans/web_operation_contracts.schema.json#/$defs/WebActionInput crawl branch max_depth (integer, minimum 0); when absent the webcrawl tool default max_depth = 2 applies (Plans/Tools.md:757)"
        same_origin_only:
          type: boolean
          required: false
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); Plans/web_operation_contracts.schema.json#/$defs/WebActionInput crawl branch same_origin_only (boolean); when absent the webcrawl tool default same_origin_only = true applies (Plans/Tools.md:757)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "UCC-083's intent taxonomy (UI_Command_Catalog.md:1028) states no command_kind. Crawl runs the site traversal operation, an owner operation."
        - key: disabled_reason_codes
          choice: [not_configured, unauthorized, unreachable, permission_required]
          gap_note: "Canon names no disabled code for the web rows; read as for cmd.chat.web.search. Crawl is host-scoped (UI_Command_Catalog.md:1038)."
        - key: omitted:invocation_source
          choice: omitted
          gap_note: "Every web route persists invocation_source (UI_Command_Catalog.md:1028; Plans/web_operation_contracts.schema.json#/$defs/InvocationProvenance). Canon does not say whether it is a UICommand arg; left to the dispatcher, which derives it from source_surface and actor_ref."
        - key: omitted:agent_reason
          choice: omitted
          gap_note: "InvocationProvenance requires agent_reason for agent-side invocation sources (Plans/web_operation_contracts.schema.json). Canon does not say whether it is a UICommand arg; left out pending the web owner, candidate an optional agent_reason arg."
    - command_id: cmd.chat.web.map
      ucc_units: [UCC-083, UCC-079, UCC-080, UCC-081, UCC-082]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
        root_url:
          type: url
          required: true
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2: crawl/map use { root_url, max_pages?, max_depth?, same_origin_only? }); URL normalization applies (UCC-082)"
        max_pages:
          type: integer
          required: false
          default: none
          constraints: {minimum: 1}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); Plans/web_operation_contracts.schema.json#/$defs/WebActionInput map branch max_pages (integer, minimum 1); when absent the webmap tool default max_pages = 50 applies (Plans/Tools.md:757)"
        max_depth:
          type: integer
          required: false
          default: none
          constraints: {minimum: 0}
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); Plans/web_operation_contracts.schema.json#/$defs/WebActionInput map branch max_depth (integer, minimum 0); when absent the webmap tool default max_depth = 3 applies (Plans/Tools.md:757)"
        same_origin_only:
          type: boolean
          required: false
          default: none
          provenance: canon
          source: "assistant-chat-design.md:341 (section 5.2 crawl/map parameters); Plans/web_operation_contracts.schema.json#/$defs/WebActionInput map branch same_origin_only (boolean); when absent the webmap tool default same_origin_only = true applies (Plans/Tools.md:757)"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatWebOperationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "UCC-083's intent taxonomy (UI_Command_Catalog.md:1028) states no command_kind. Map runs the site topology operation, an owner operation."
        - key: disabled_reason_codes
          choice: [not_configured, unauthorized, unreachable, permission_required]
          gap_note: "Canon names no disabled code for the web rows; read as for cmd.chat.web.search. Map is host-scoped (UI_Command_Catalog.md:1038)."
        - key: omitted:invocation_source
          choice: omitted
          gap_note: "Every web route persists invocation_source (UI_Command_Catalog.md:1028; Plans/web_operation_contracts.schema.json#/$defs/InvocationProvenance). Canon does not say whether it is a UICommand arg; left to the dispatcher, which derives it from source_surface and actor_ref."
        - key: omitted:agent_reason
          choice: omitted
          gap_note: "InvocationProvenance requires agent_reason for agent-side invocation sources (Plans/web_operation_contracts.schema.json). Canon does not say whether it is a UICommand arg; left out pending the web owner, candidate an optional agent_reason arg."
    - command_id: cmd.chat.web.help
      ucc_units: [UCC-078, UCC-081, UCC-082]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-077..UCC-083 required identity thread_id (always); UCC-230 envelope common optional thread_id restated required"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandResultV2
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: "The rows (UI_Command_Catalog.md:1026; assistant-chat-design.md:339) state no command_kind. Bare /web is a non-executing help entry."
        - key: response_kind
          choice: owner_operation
          gap_note: "A help entry needs no owner result, but the production wiring row catalog.chat_web_help names request ChatOwnerCommandRequestV2 and result ChatOwnerCommandResultV2, so the definition follows the wired owner contracts."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Canon names no disabled code; the help entry is chat-surface bound, so no selected thread is read as a blocked state."
    - command_id: cmd.chat.stop
      ucc_units: [UCC-083, UCC-076, UCC-080]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "FABLE row payload (UI_Command_Catalog.md:8664); overlay UCC-077..UCC-083 required identity thread_id (always)"
        run_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "FABLE row payload run_id? (UI_Command_Catalog.md:8664); UCC-230 envelope common optional run_id"
        assistant_turn_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "FABLE row payload assistant_turn_id? (UI_Command_Catalog.md:8664)"
        stop_reason_code:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 64}
          provenance: gap
          gap_note: >-
            The FABLE row requires stop_reason_code (UI_Command_Catalog.md:8664) but does not say which
            vocabulary it takes. Plans/Permissions_System.md:9378 (Permission Snapshot Reason-Code Enums)
            defines a closed stop_reason_code enum: user_stopped, policy_denied, budget_exhausted,
            safe_point_required, permission_snapshot_stale, indeterminate_remote_outcome. Whether chat Stop
            uses that enum is not stated, so the field stays an opaque string of 1..64 (bounds chosen here)
            with that enum as the candidate.
        idempotency_key:
          type: string
          required: true
          default: none
          constraints: {max_length: 256}
          provenance: canon
          source: "FABLE row payload idempotency_key (UI_Command_Catalog.md:8664); UCC-230 envelope common optional idempotency_key restated required at its canonical max_length 256"
      owner_request: Plans/application_workflow_contracts.schema.json#/$defs/ChatOwnerCommandRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:ChatStopResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: "The FABLE row (UI_Command_Catalog.md:8664) states no command_kind. Stop records chat_run.cancel_requested and cancels the active model, tool and subagent leases (assistant-chat-design.md section 4), an owner run action; /cancel resolves internally to it (UI_Command_Catalog.md:1105)."
  results:
    ChatWebOperationResultV1:
      fields:
        web_operation_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the operation id the activity/provenance cards key on (UCC-079 operation cards); canon names no result field"}
        sources_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "large sources material dereferenced on demand (UI_Command_Catalog.md:1030)"}
        content_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "large content material dereferenced on demand (UI_Command_Catalog.md:1030)"}
        map_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "map material for crawl/map results (UI_Command_Catalog.md:1030)"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_web_* rows)"}
    ChatStopResultV1:
      fields:
        thread_id: {type: id, required: true, default: none, provenance: canon, source: "FABLE row result fields (UI_Command_Catalog.md:8664)"}
        stopped_ref: {type: ref, required: false, default: none, provenance: canon, source: "FABLE row result stopped_ref? (UI_Command_Catalog.md:8664)"}
        resumable: {type: boolean, required: true, default: none, provenance: canon, source: "FABLE row result resumable (UI_Command_Catalog.md:8664)"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the chat.response_stop_requested receipt the FABLE row binds (UI_Command_Catalog.md:8664)"}
```

### ACD-640 - Chat Vision Bridge Command Payload Definitions

```yaml
plan_unit_id: ACD-640
unit_type: command_contract
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Typed payload definitions for the cmd.chat.vision_bridge.* commands that UI_Command_Catalog
  UCC-101 registers (DL-333 resolution 9b; ACD-425 is the control-surface requirement). The
  definitions block below gives each active command its args, owner result and narrowed error and
  disabled-reason codes in pm.command_payload_definitions.v1. The catalog keeps ids, labels,
  availability, command_kind and aliases; the strict schema overlay keeps the common envelope and
  the closed code sets. The seven rows state no payload fields anywhere: every argument or result
  field below except the overlay's image_ref identity is provenance gap, and the source-class
  vocabulary stays the row's five prose classes until an owner fixes canonical tokens.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible vision bridge controls in Assistant Chat.
depends_on: [UCC-230, UCC-101, ACD-425, T-165, RAP-035, PS-121, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to ACD-640 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - command_kind equals the catalog's UCC-101 table where it states one; error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5 (resolution 9b minted the family)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/DESIGN.md sections 2.3, 5 and 7"
preserved_exact_tokens: [cmd.chat.vision_bridge.select_source, cmd.chat.vision_bridge.pick_recent_screenshot, cmd.chat.vision_bridge.inspect, cmd.chat.vision_bridge.rerun, cmd.chat.vision_bridge.copy_description, cmd.chat.vision_bridge.attach_result, cmd.chat.vision_bridge.manage_permission]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default and never choose an ambiguous recent screenshot silently (UCC-101).
  - Do not present the non-vision model's answer as if it directly saw the image when it consumed a bridge-derived description (UCC-101, ACD-425).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Runtime_Artifacts_Panel.md, Plans/Permissions_System.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: ACD-640
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.chat.vision_bridge.select_source
      ucc_units: [UCC-101]
      command_kind: domain_action                       # canon: UI_Command_Catalog.md:21489
      response_kind: owner_operation
      args:
        source_class:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 64}
          provenance: gap
          gap_note: >-
            The row allows five source classes - current-turn attachment, selected artifact,
            project file allowed by FileSafe, clipboard image, recent OS screenshot
            (UI_Command_Catalog.md:21489) - but no canon names the field or fixes canonical tokens
            for the classes. Choice: source_class as an opaque token of 1..64 (bounds chosen here),
            one of those five classes; alternative: a closed enum once an owner fixes the spellings.
            A project-file source still carries FileSafe and artifact permissions (UCC-101 negative
            constraints).
        image_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row chooses "the image the bridge reads" and shows the selected source
            (UI_Command_Catalog.md:21489), so a class alone cannot pick one attachment, artifact,
            FileSafe project file or clipboard image. image_ref is the overlay identity for
            UCC-101..UCC-105 (UI_Command_Catalog.md:8860 overlay row, image_ref?), typed ref by UCC-230's
            identity rule, but canon does not say that select_source carries it or for which classes.
            Choice: optional image_ref naming the chosen source; it is needed for every class except
            recent OS screenshot, whose pick goes through cmd.chat.vision_bridge.pick_recent_screenshot.
            Canon states no rule that makes it required per class.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:VisionBridgeSelectResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]
      aliases: []
      judgments:
        - key: owner_request
          choice: none
          gap_note: "The production wiring row catalog.chat_vision_bridge_select_source names no request_schema_ref, and no typed owner request exists for the vision bridge yet."
        - key: disabled_reason_codes
          choice: [not_configured]
          gap_note: "The row's only precondition is vision_bridge_available (UI_Command_Catalog.md:21489) and canon names no disabled code; false is read as not_configured."
    - command_id: cmd.chat.vision_bridge.pick_recent_screenshot
      ucc_units: [UCC-101]
      command_kind: domain_action                       # canon: UI_Command_Catalog.md:21490
      response_kind: owner_operation
      args: {}
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:VisionBridgeSelectResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required]
      aliases: []
      judgments:
        - key: omitted:image_ref
          choice: omitted
          gap_note: "The row opens the recent OS screenshot picker and uses the screenshot the user picks; an ambiguous recent screenshot is never chosen silently (UI_Command_Catalog.md:21490). The picker chooses, so no input names the image; the overlay identity image_ref? is left out."
        - key: owner_request
          choice: none
          gap_note: "The production wiring row catalog.chat_vision_bridge_pick_recent_screenshot names no request_schema_ref, and no typed owner request exists for the vision bridge yet."
        - key: disabled_reason_codes
          choice: [not_configured, permission_required]
          gap_note: "Canon names no disabled code. vision_bridge_available false is read as not_configured and recent_screenshot_access_allowed false (UI_Command_Catalog.md:21490) as permission_required."
    - command_id: cmd.chat.vision_bridge.inspect
      ucc_units: [UCC-101]
      command_kind: navigation_wrapper                  # canon: UI_Command_Catalog.md:21491
      response_kind: local_projection
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The overlay lists image_ref? for UCC-101..UCC-105 and the row opens the description for
            the bridge result with its source image or artifact link (UI_Command_Catalog.md:21491);
            precondition vision_bridge_result_present makes the source subject mandatory per UCC-230
            identity rule, but no canon names the bridge-result identity field. Choice: image_ref
            binds the inspected result to its source image or artifact.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The row's only precondition is vision_bridge_result_present (UI_Command_Catalog.md:21491) and canon names no disabled code; false is read as a blocked state."
    - command_id: cmd.chat.vision_bridge.rerun
      ucc_units: [UCC-101]
      command_kind: domain_action                       # canon: UI_Command_Catalog.md:21492
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row reruns "on the same source" (UI_Command_Catalog.md:21492); precondition
            vision_bridge_result_present makes the source subject mandatory per UCC-230 identity
            rule, but no canon names the field. Choice: the overlay identity image_ref carries the
            same source.
        question:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 4096}
          provenance: gap
          gap_note: >-
            The row reruns "with the user's question" (UI_Command_Catalog.md:21492) but names no
            field. Choice: question, matching the row's label 'Rerun With A Question'; the bounds
            1..4096 are chosen here, canon states none.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:VisionBridgeRerunResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, permission_required]
      aliases: []
      judgments:
        - key: owner_request
          choice: none
          gap_note: "The production wiring row catalog.chat_vision_bridge_rerun names no request_schema_ref, and no typed owner request exists for the vision bridge yet."
        - key: disabled_reason_codes
          choice: [blocked_state_required, permission_required]
          gap_note: "Canon names no disabled code. vision_bridge_result_present false (UI_Command_Catalog.md:21492) is read as a blocked state and permission_allowed false as permission_required."
    - command_id: cmd.chat.vision_bridge.copy_description
      ucc_units: [UCC-101]
      command_kind: shell_view                          # canon: UI_Command_Catalog.md:21493
      response_kind: local_projection
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row copies the derived description of the present bridge result
            (UI_Command_Catalog.md:21493); precondition vision_bridge_result_present makes the
            source subject mandatory per UCC-230 identity rule, but no canon names the field.
            Choice: the overlay identity image_ref binds the copied description to its source.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The row's only precondition is vision_bridge_result_present (UI_Command_Catalog.md:21493) and canon names no disabled code; false is read as a blocked state."
    - command_id: cmd.chat.vision_bridge.attach_result
      ucc_units: [UCC-101]
      command_kind: domain_action                       # canon: UI_Command_Catalog.md:21494
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row attaches the bridge result of the present source (UI_Command_Catalog.md:21494);
            precondition vision_bridge_result_present makes the source subject mandatory per UCC-230
            identity rule, but no canon names the field. Choice: the overlay identity image_ref binds
            the attached result to its source.
        thread_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row's target is "the current turn or run" (UI_Command_Catalog.md:21494) and names no
            target field. Choice: the UCC-230 envelope common optional thread_id names the thread whose
            current turn receives the result; canon does not say which target field the row uses.
        run_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row's target may be "the current ... run" (UI_Command_Catalog.md:21494), and no target
            field is named. Choice: the UCC-230 envelope common optional run_id names the run target.
            Canon states no rule on whether exactly one of thread_id and run_id must be present.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:VisionBridgeAttachResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: owner_request
          choice: none
          gap_note: "The production wiring row catalog.chat_vision_bridge_attach_result names no request_schema_ref, and no typed owner request exists for the vision bridge yet."
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "Canon names no disabled code. vision_bridge_result_present and attach_target_available false (UI_Command_Catalog.md:21494) are read as blocked states. The attachment stays labelled bridge-derived (ACD-425)."
    - command_id: cmd.chat.vision_bridge.manage_permission
      ucc_units: [UCC-101]
      command_kind: navigation_wrapper                  # canon: UI_Command_Catalog.md:21495
      response_kind: local_projection
      args:
        image_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row opens the remembered always-accept image permission in its Permissions owner
            (PS-121, UI_Command_Catalog.md:21495) scoped by project, user/account identity, source
            class, destination provider/account, provider-family policy, tool id and
            sensitivity/redaction class (UCC-101 preserved tokens), but no canon names a payload
            field; the permission record is inspectable and revocable without passing an image.
            Choice: optional image_ref narrows the view to one source's rule.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [blocked_state_required]
          gap_note: "The row's only precondition is remembered_vision_permission_present (UI_Command_Catalog.md:21495) and canon names no disabled code; false is read as a blocked state."
  results:
    VisionBridgeSelectResultV1:
      fields:
        source_class: {type: string, required: true, default: none, provenance: gap, gap_note: "the class of the source now selected and shown; mirrors the source_class gap"}
        image_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the selected source image or artifact"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_vision_bridge_select_source / _pick_recent_screenshot)"}
    VisionBridgeRerunResultV1:
      fields:
        description_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the new bridge-derived description artifact; ACD-425 requires the artifact, provider/model used and freshness state to show"}
        provider_model: {type: string, required: false, default: none, provenance: gap, gap_note: "the provider/model used, disclosed per ACD-425; no canon names the field"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_vision_bridge_rerun)"}
    VisionBridgeAttachResultV1:
      fields:
        attachment_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the bridge-derived attachment created in the current turn or run"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.chat_vision_bridge_attach_result)"}
```
