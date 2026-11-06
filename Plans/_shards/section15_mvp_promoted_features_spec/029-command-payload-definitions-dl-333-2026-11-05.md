# Shard 029: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L13363-L14617

Source SHA256: `e48b22f338b10ae7a1ae1e9cee8bb501c4d5c307a050779124832222b4e7a68a`

---

## Command payload definitions (DL-333, 2026-11-05)

### SMPFS-328 - Browser command payload definitions

```yaml
plan_unit_id: SMPFS-328
unit_type: command_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Typed payload definitions for the browser commands that UI_Command_Catalog UCC-061..UCC-065 register
  (DL-333). The definitions block below gives each of the 22 concrete cmd.browser.* rows its args, owner
  request and owner result in pm.command_payload_definitions.v1. The catalog keeps ids, labels, events and
  aliases; the strict schema overlay (UCC-230) keeps the common envelope and the closed code sets. The
  envelope's optional thread_id binding on capture rows stays the overlay's common optional field; only
  cmd.browser.share_with_agent narrows it to required, as its catalog row states it unadorned. Canon does
  not type the open rows' target, the DevTools mode and dock values, or agent_share_scope; each is marked
  provenance gap and left open for the compile review rather than invented.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible browser, preview and DevTools commands.
split_recommended: false
depends_on: [UCC-230, UCC-061, UCC-062, UCC-063, UCC-064, UCC-065, UCC-202, CV-333, CV-360, DL-180, DL-333]
unblocks: []
acceptance_criteria:
  - Every cmd.browser.* command that UCC-230 assigns to SMPFS-328 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_payload_definitions
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens:
  - cmd.browser.open_workspace_preview
  - cmd.browser.open_detached_preview
  - cmd.browser.focus_browser_tab
  - cmd.browser.detach_browser_tab
  - cmd.browser.open_devtools
  - cmd.browser.toggle_devtools_dock
  - cmd.browser.pick_element_for_chat
  - cmd.browser.add_selection_to_chat
  - cmd.browser.add_selection_screenshot_to_chat
  - cmd.browser.add_selection_full_screenshot_to_chat
  - cmd.browser.add_screenshot_to_chat
  - cmd.browser.add_full_screenshot_to_chat
  - cmd.browser.share_with_agent
  - cmd.browser.revoke_share_with_agent
  - cmd.browser.take_over
  - cmd.browser.pause_agent
  - cmd.browser.let_agent_continue
  - cmd.browser.stop_agent_keep_browser
  - cmd.browser.promote_to_normal_browsing
  - cmd.browser.reopen
  - cmd.browser.retry
  - cmd.browser.keep_closed
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not reintroduce target_editor_panel_id or target_editor_group_id as args; placement travels in CV-360's fields (DL-180).
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: SMPFS-328
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.browser.open_workspace_preview
      ucc_units: [UCC-063, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind for this row; the aliases table records it a kept id,
      # open route with normalization.kind wrapper (UI_Command_Catalog.md:17840), which is a
      # navigation_wrapper in Contracts_V0 7.2 terms.
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:825); common optional field narrowed to required per UCC-230 envelope rule"
        target:
          type: url
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon names target with no type (UI_Command_Catalog.md:825); the aliases row reads it as
            "browser session target" (:17840) and the launcher rows open "an address" through it. JUDGMENT:
            url covers the address opens; alternatives not settled by canon are a union with the overlay's
            preview_subject_ref or Primitive:RouteTarget.
        workspace_tab_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:825); token also preserved in UCC-063"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360): where is auto, tab, panel, right, down or a panel id; default auto"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360): mode is preview or keep; preview only for kinds with a preview tab; no default stated"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360): by is user or agent:<name>; default user"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360): background default false"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.open_detached_preview
      ucc_units: [UCC-063, UCC-061, UCC-062]
      # JUDGMENT: same open-route shape as open_workspace_preview; canon states no command_kind.
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:826); common optional field narrowed to required per UCC-230 envelope rule"
        target:
          type: url
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Same untyped target as cmd.browser.open_workspace_preview (UI_Command_Catalog.md:826); the url
            choice and its alternatives stay open as there. UCC-203 also restates detached-preview semantics
            because no panel tab pops out; that is placement behavior, not an arg.
        source_workspace_tab_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:826); token also preserved in UCC-063"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360); default auto"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360); no default stated"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360); default user"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360); default false"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.focus_browser_tab
      ucc_units: [UCC-063, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row is layout/UI state only (UI_Command_Catalog.md:827,
      # :17871), which is a shell_view.
      command_kind: shell_view
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:827); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.detach_browser_tab
      ucc_units: [UCC-063, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; layout/UI state row (UI_Command_Catalog.md:828), a shell_view.
      # UCC-203: no producer on a panel tab because no tab pops out; the row stays for lineage.
      command_kind: shell_view
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:828); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.open_devtools
      ucc_units: [UCC-063, UCC-061, UCC-062]
      # canon: UCC-156's row (via UCC-202) states command_kind navigation_wrapper for this canonical id
      # (UI_Command_Catalog.md:15191, :18560).
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:829); overlay UCC-061..065 identity browser_session_id?"
        mode:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names mode? with no values (UI_Command_Catalog.md:829); the named contract
            BrowserDevToolsOpenRequest (UI_Command_Catalog.md:15191, :18560) has no schema in Plans, so the
            DevTools mode vocabulary is still open. JUDGMENT: string holds the value; an enum needs the
            owner to name the modes.
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:BrowserDevToolsOpenResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases:
        - {command_id: cmd.browser.devtools.open, kind: alias, source: "UCC-202 and the duplicate-ids table (UI_Command_Catalog.md:18560); UCC-063 stale_retired_dispositions"}
    - command_id: cmd.browser.toggle_devtools_dock
      ucc_units: [UCC-063, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; layout/UI state only row (UI_Command_Catalog.md:830), a
      # shell_view.
      command_kind: shell_view
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:830); overlay UCC-061..065 identity browser_session_id?"
        dock:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names dock with no type or values (UI_Command_Catalog.md:830). JUDGMENT: string
            holds the value; alternatives are an enum of dock positions or a boolean toggle, and the owner
            must name the dock vocabulary before an enum can be written.
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.pick_element_for_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row emits browser.context_captured
      # (UI_Command_Catalog.md:831), a mutating capture, so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:831); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
    - command_id: cmd.browser.add_selection_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row emits browser.context_captured
      # (UI_Command_Catalog.md:832), a mutating capture, so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:832); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
    - command_id: cmd.browser.add_selection_screenshot_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row emits browser.context_captured and
      # runtime_artifact.screenshot (UI_Command_Catalog.md:833), a mutating capture, so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:833); overlay UCC-061..065 identity browser_session_id?"
        scope:
          type: const
          value: clip
          required: true
          default: none
          provenance: canon
          source: "catalog row payload scope:'clip' (UI_Command_Catalog.md:833)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
    - command_id: cmd.browser.add_selection_full_screenshot_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row emits browser.context_captured and
      # runtime_artifact.screenshot (UI_Command_Catalog.md:834), a mutating capture, so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:834); overlay UCC-061..065 identity browser_session_id?"
        scope:
          type: const
          value: full
          required: true
          default: none
          provenance: canon
          source: "catalog row payload scope:'full' (UI_Command_Catalog.md:834)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
    - command_id: cmd.browser.add_screenshot_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row emits runtime_artifact.screenshot
      # (UI_Command_Catalog.md:835), a mutating capture, so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:835); overlay UCC-061..065 identity browser_session_id?"
        scope:
          type: const
          value: clip
          required: true
          default: none
          provenance: canon
          source: "catalog row payload scope:'clip' (UI_Command_Catalog.md:835)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
    - command_id: cmd.browser.add_full_screenshot_to_chat
      ucc_units: [UCC-064, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row emits runtime_artifact.screenshot
      # (UI_Command_Catalog.md:836), a mutating capture, so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:836); overlay UCC-061..065 identity browser_session_id?"
        scope:
          type: const
          value: full
          required: true
          default: none
          provenance: canon
          source: "catalog row payload scope:'full' (UI_Command_Catalog.md:836)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
    - command_id: cmd.browser.share_with_agent
      ucc_units: [UCC-064, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row mutates browser-session share state and emits
      # browser.context_shared (UI_Command_Catalog.md:837; SMPFS-089), so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:837); overlay UCC-061..065 identity browser_session_id?"
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload names thread_id unadorned (UI_Command_Catalog.md:837); common optional field narrowed to required per UCC-230 envelope rule"
        agent_share_scope:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The overlay lists agent_share_scope? as row-group identity for capture/share/takeover commands
            (UI_Command_Catalog.md:8853) but no canon types it or gives values, and no concrete row payload
            carries it. JUDGMENT: string holds the value pending an owner decision on a scope enum; whether
            the share row carries it at all stays open.
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:BrowserShareWithAgentResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, permission_required]
      aliases: []
    - command_id: cmd.browser.revoke_share_with_agent
      ucc_units: [UCC-064, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row mutates browser-session share state and emits
      # browser.context_share_revoked (UI_Command_Catalog.md:838; SMPFS-089), so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:838); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.take_over
      ucc_units: [UCC-065, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row mutates the takeover state and emits
      # browser.session.takeover_state_changed (UI_Command_Catalog.md:839), so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:839); overlay UCC-061..065 identity browser_session_id?"
        takeover_choice:
          type: enum
          values: [pause_agent, let_agent_continue, stop_agent_keep_browser]
          required: true
          default: none
          provenance: canon
          source: "catalog row payload takeover_choice:'pause_agent'|'let_agent_continue'|'stop_agent_keep_browser' (UI_Command_Catalog.md:839); tokens preserved in UCC-065"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.pause_agent
      ucc_units: [UCC-065, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row mutates the takeover state and emits
      # browser.session.takeover_state_changed (UI_Command_Catalog.md:840), so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:840); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.let_agent_continue
      ucc_units: [UCC-065, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row mutates the takeover state and emits
      # browser.session.takeover_state_changed (UI_Command_Catalog.md:841), so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:841); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.stop_agent_keep_browser
      ucc_units: [UCC-065, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row ends the agent run and emits
      # browser.session.takeover_state_changed and dev.session.stopped (UI_Command_Catalog.md:842), so
      # domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:842); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.promote_to_normal_browsing
      ucc_units: [UCC-065, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row emits browser.session.promoted
      # (UI_Command_Catalog.md:843), a session-state mutation, so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:843); overlay UCC-061..065 identity browser_session_id?"
        target_workspace_tab_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "catalog row payload target_workspace_tab_id? (UI_Command_Catalog.md:843)"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.reopen
      ucc_units: [UCC-065, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row mutates session state and emits
      # browser.session.state_changed (UI_Command_Catalog.md:844), so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:844); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.retry
      ucc_units: [UCC-065, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row mutates session state and emits
      # browser.session.state_changed (UI_Command_Catalog.md:845), so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:845); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.browser.keep_closed
      ucc_units: [UCC-065, UCC-061, UCC-062]
      # JUDGMENT: canon states no command_kind; the row closes the session and emits
      # browser.session.closed (UI_Command_Catalog.md:846), so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        browser_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:846); overlay UCC-061..065 identity browser_session_id?"
      owner_request: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/section15_browser_program_contracts.schema.json#/$defs/BrowserActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
  results:
    BrowserDevToolsOpenResultV1:
      fields:
        devtools_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9952 (Browser Action Table output fields); no typed contract exists"}
        boundary_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9952; no typed contract exists"}
        opened_at_utc: {type: timestamp, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9952; no typed contract exists"}
    BrowserShareWithAgentResultV1:
      fields:
        share_receipt_id: {type: id, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9950 (Browser Action Table output fields); no typed contract exists"}
        target_agent_id: {type: id, required: true, default: none, provenance: gap, gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9950; no typed contract exists"}
        artifact_refs:
          type: list
          item: {type: ref}
          required: true
          default: none
          provenance: gap
          gap_note: "named at Section15_MVP_Promoted_Features_Spec.md:9950; item type ref by suffix; no typed contract exists"
```

### SMPFS-329 - Terminal, dev-session and catalog command payload definitions

```yaml
plan_unit_id: SMPFS-329
unit_type: command_contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Typed payload definitions for the terminal, dev-session and catalog lifecycle commands that
  UI_Command_Catalog UCC-066..UCC-072 register (DL-333). The definitions block below gives each active
  row its args, owner request and owner result in pm.command_payload_definitions.v1. The catalog keeps
  ids, labels, events and aliases; the strict schema overlay (UCC-230) keeps the common envelope and the
  closed code sets. Canon leaves the rerun replay reference and same-session flag, the restart/replace
  policy and hints, the dev start mode and target, and the catalog item_type spellings and version format
  untyped; each is marked provenance gap and left open for the compile review rather than invented.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible terminal, dev-session and catalog commands.
split_recommended: false
depends_on: [UCC-230, UCC-066, UCC-067, UCC-068, UCC-069, UCC-070, UCC-071, UCC-072, CV-333, CV-360, DL-181, DL-333]
unblocks: []
acceptance_criteria:
  - Every terminal, dev and catalog command that UCC-230 assigns to SMPFS-329 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces:
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_payload_definitions
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens:
  - cmd.terminal.open
  - cmd.terminal.show
  - cmd.terminal.rerun
  - cmd.terminal.focus
  - cmd.terminal.restart_replace
  - cmd.terminal.clear_scrollback
  - cmd.dev.start_session
  - cmd.dev.stop_session
  - cmd.dev.restart_session
  - cmd.dev.show_output
  - cmd.dev.show_problems
  - cmd.dev.show_ports
  - cmd.catalog.install_item
  - cmd.catalog.update_item
  - cmd.catalog.remove_item
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not reintroduce terminal_pane_id, termination_policy or the retired detach and pane rows as args (DL-181).
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: SMPFS-329
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.terminal.open
      ucc_units: [UCC-067, UCC-061, UCC-066, UCC-068, UCC-069]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:880); kept-commands row 'Reveals the tab of the exact terminal_session_id' (UI_Command_Catalog.md:18285); overlay UCC-066..072 identity terminal_session_id?"
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360); the kept-commands row says it carries CV-360's placement fields (UI_Command_Catalog.md:18285); default auto"
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360); no default stated"
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360); default user"
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 placement fields (Plans/Contracts_V0.md#CV-360); default false; an agent's open lands as a background tab (UCC-066)"
        origin_surface:
          type: string
          required: false
          default: none
          provenance: canon
          source: "catalog row payload names optional origin_surface (UI_Command_Catalog.md:880)"
        reveal_origin_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog row names an optional "reveal-origin" ref (UI_Command_Catalog.md:880) without a fixed
            arg spelling; reveal-origin-terminal lineage is Section15_MVP_Promoted_Features_Spec.md:241.
            JUDGMENT: reveal_origin_ref, type ref; the exact field name is not locked by canon.
        linkback_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog row names optional "/linkback refs" (UI_Command_Catalog.md:880) without a fixed arg
            spelling. JUDGMENT: linkback_ref, type ref; the exact field name is not locked by canon.
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.terminal.show
      ucc_units: [UCC-067, UCC-061, UCC-066, UCC-068, UCC-069]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:881); kept-commands row (UI_Command_Catalog.md:18286); overlay UCC-066..072 identity terminal_session_id?"
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.terminal.rerun
      ucc_units: [UCC-067, UCC-069]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: >-
            catalog row payload (UI_Command_Catalog.md:882); UCC-067 acceptance: "Rerun preserves
            terminal_session_id only when same-session execution is explicitly requested and available";
            overlay UCC-066..072 identity terminal_session_id?
        command_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon says "command replay payload plus terminal session launch context" (UI_Command_Catalog.md:882)
            without naming the replay field; the overlay's command_ref? is the row-group identity candidate.
            JUDGMENT: command_ref, type ref, optional; whether rerun can instead carry a literal command
            string stays open.
        same_session:
          type: boolean
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon says "same-session flag or new-session request" (UI_Command_Catalog.md:882) without naming
            or typing the field. JUDGMENT: same_session boolean, absent meaning the row's default
            new-invocation-in-bound-session; the alternative is a mode enum [same_session, new_session];
            not settled by canon.
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.terminal.focus
      ucc_units: [UCC-067, UCC-068]
      command_kind: shell_view
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "catalog row payload terminal_session_id? (UI_Command_Catalog.md:884); kept-commands row (UI_Command_Catalog.md:18287); overlay UCC-066..072 identity terminal_session_id?"
        dev_session_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "catalog row payload dev_session_id? (UI_Command_Catalog.md:884, :18287); overlay UCC-066..072 identity dev_session_id?"
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.terminal.restart_replace
      ucc_units: [UCC-067, UCC-068]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:888); kept-commands row (UI_Command_Catalog.md:18290); overlay UCC-066..072 identity terminal_session_id?"
        policy:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon names a "/restart/replace policy" (UI_Command_Catalog.md:888) with no values; the
            kept-commands row fixes the behavior (a new session in the same tab, same folder and profile,
            UI_Command_Catalog.md:18290) without a policy vocabulary. JUDGMENT: string holds the value
            pending an owner enum.
        command_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon names "command replay or shell profile hints" (UI_Command_Catalog.md:888) without a field
            shape. JUDGMENT: command_ref, type ref, optional, for the replay hint; the overlay's command_ref?
            identity is the candidate name.
        profile:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon names "command replay or shell profile hints" (UI_Command_Catalog.md:888); the default is
            the same folder and profile (UI_Command_Catalog.md:18290). JUDGMENT: profile, string, optional,
            overrides that default; the exact field name is not locked by canon.
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.terminal.clear_scrollback
      ucc_units: [UCC-072]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        terminal_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "kept-commands row (UI_Command_Catalog.md:18293); UCC-072 rule 'cmd.terminal.clear_scrollback preserves runtime identity'; overlay UCC-066..072 identity terminal_session_id?"
      owner_request: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionRequestV2
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/shared_runtime_command_contracts.schema.json#/$defs/TerminalActionResultV2
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.dev.start_session
      ucc_units: [UCC-070]
      # JUDGMENT: canon states no command_kind; the row starts a dev session and emits dev.session.started
      # (UI_Command_Catalog.md:930), a runtime mutation, so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:930); common optional field narrowed to required per UCC-230 envelope rule"
        workspace_tab_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:930)"
        mode:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names mode with no type or values (UI_Command_Catalog.md:930); no owner doc
            types the dev start mode. JUDGMENT: string holds the value; an enum needs the owner to name the
            modes (for example a run/debug/watch vocabulary) before it can be written.
        target:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names target? with no type (UI_Command_Catalog.md:930). JUDGMENT: string holds
            the value; alternatives are a url, a path or an enum of dev targets, none chosen by canon.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevSessionStartResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.dev.stop_session
      ucc_units: [UCC-070]
      # JUDGMENT: canon states no command_kind; the row stops a dev session and emits dev.session.stopping
      # and dev.session.stopped (UI_Command_Catalog.md:931), a runtime mutation, so domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:931); overlay UCC-066..072 identity dev_session_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevSessionLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.dev.restart_session
      ucc_units: [UCC-070]
      # JUDGMENT: canon states no command_kind; the row restarts a dev session and emits
      # dev.session.restarting and dev.session.started (UI_Command_Catalog.md:932), a runtime mutation, so
      # domain_action. Distinct from the retired terminal spelling cmd.terminal.restart_session (UCC-202).
      command_kind: domain_action
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:932); overlay UCC-066..072 identity dev_session_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevSessionLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.dev.show_output
      ucc_units: [UCC-070, UCC-072]
      # JUDGMENT: canon states no command_kind; the row is layout/UI state only and reveals the output tool
      # tab by kind affinity (UI_Command_Catalog.md:933, :17867), a navigation_wrapper.
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:933); overlay UCC-066..072 identity dev_session_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevSurfaceRevealResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.dev.show_problems
      ucc_units: [UCC-070, UCC-072]
      # JUDGMENT: canon states no command_kind; the row is layout/UI state only and reveals the problems
      # tool tab by kind affinity (UI_Command_Catalog.md:934, :17867), a navigation_wrapper.
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:934); overlay UCC-066..072 identity dev_session_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevSurfaceRevealResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.dev.show_ports
      ucc_units: [UCC-070, UCC-072]
      # JUDGMENT: canon states no command_kind; the row is layout/UI state only and reveals the ports tool
      # tab by kind affinity (UI_Command_Catalog.md:935, :17867), a navigation_wrapper.
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        dev_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:935); overlay UCC-066..072 identity dev_session_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DevSurfaceRevealResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.catalog.install_item
      ucc_units: [UCC-071]
      # JUDGMENT: canon states no command_kind; the row mutates catalog state and emits
      # catalog.install.started and catalog.install.completed (UI_Command_Catalog.md:949), so
      # domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        item_type:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names item_type (UI_Command_Catalog.md:949); SMPFS-055 gives the item kinds
            only in prose ("commands, skills, plugins/hooks, themes, and MCP configs",
            Section15_MVP_Promoted_Features_Spec.md:4385) with no snake_case spellings, so no enum values
            are written. JUDGMENT: string holds the value until the owner fixes the spellings.
        item_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:949)"
        version:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names version? (UI_Command_Catalog.md:949); no canon fixes the version string
            format. JUDGMENT: unconstrained string pending an owner format (semver or catalog-native).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:CatalogItemLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.catalog.update_item
      ucc_units: [UCC-071]
      # JUDGMENT: canon states no command_kind; the row mutates catalog state and emits
      # catalog.update.started and catalog.update.completed (UI_Command_Catalog.md:950), so
      # domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        item_type:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Same prose-only item kinds as cmd.catalog.install_item (UI_Command_Catalog.md:950;
            Section15_MVP_Promoted_Features_Spec.md:4385); no enum spellings written.
        item_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:950)"
        target_version:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Catalog payload names target_version? (UI_Command_Catalog.md:950); no canon fixes the version
            string format. JUDGMENT: unconstrained string pending an owner format.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:CatalogItemLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
    - command_id: cmd.catalog.remove_item
      ucc_units: [UCC-071]
      # JUDGMENT: canon states no command_kind; the row mutates catalog state and emits
      # catalog.remove.started and catalog.remove.completed (UI_Command_Catalog.md:951), so
      # domain_action.
      command_kind: domain_action
      response_kind: owner_operation
      args:
        item_type:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Same prose-only item kinds as cmd.catalog.install_item (UI_Command_Catalog.md:951;
            Section15_MVP_Promoted_Features_Spec.md:4385); no enum spellings written.
        item_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "catalog row payload (UI_Command_Catalog.md:951)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:CatalogItemLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported]
      aliases: []
  results:
    DevSessionStartResultV1:
      fields:
        dev_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the started dev session; UCC-070 preserves the token but no typed contract exists"}
        status: {type: string, required: true, default: none, provenance: gap, gap_note: "lifecycle status of the start; values not fixed by canon (dev.session.started is the event, UI_Command_Catalog.md:930)"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "present when the owner records a receipt; no typed contract exists"}
    DevSessionLifecycleResultV1:
      fields:
        dev_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the stopped or restarted dev session; no typed contract exists"}
        status: {type: string, required: true, default: none, provenance: gap, gap_note: "lifecycle status; values not fixed by canon (dev.session.stopped / dev.session.started are the events, UI_Command_Catalog.md:931-932)"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "present when the owner records a receipt; no typed contract exists"}
    DevSurfaceRevealResultV1:
      fields:
        dev_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the owning dev session of the revealed surface; no typed contract exists"}
        panel_tab_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the revealed tool tab, named for the open-route result shape (CV-360); no typed contract exists"}
    CatalogItemLifecycleResultV1:
      fields:
        item_type: {type: string, required: true, default: none, provenance: gap, gap_note: "echoes the row's item_type; spellings still prose-only (SMPFS-055)"}
        item_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the catalog item; no typed contract exists"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "present when the owner records a receipt; no typed contract exists"}
```
