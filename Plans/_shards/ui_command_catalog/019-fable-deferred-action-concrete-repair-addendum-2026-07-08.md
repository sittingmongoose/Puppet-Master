# Shard 019: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/UI_Command_Catalog.md`

Source lines: L8788-L10328

Source SHA256: `e852be3ec466cc2d357de1901153bd33a907875d4d6dfd3a3217c8e7649e4342`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime UI command catalog rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-ddc264cdea296caf349adecd`: active semantic-command rows UCC-049 through UCC-105 inherit the strict schema overlay below. Each active row exposes `command_id`, `payload_required`, `payload_optional`, `result_fields`, `error_codes`, `disabled_reason_codes`, and `owner_doc_ref` either through a concrete current `cmd.*` token in its preserved tokens or through the owner-referenced family schema named in the overlay. Rows with prose-only or slash-token source lineage are implementation-ready only through that owner reference, not as free-form handler text. UCC-106 is now an explicit lineage exclusion: its eleven retained `cmd.onboarding.*` command-era tokens are not active commands or aliases; its separate eight packet candidates are rejected as commands, aliases, and handlers; and its current fourteen `ui.onboarding.*` tokens (`ui.onboarding.choose_look` added by DL-153) are typed local UI actions rather than command-schema rows. Amended 2026-11-05 (DL-333): the owner reference for each active row is the owner-doc typed definition that UCC-230 names, not this catalog.
- Repairs `sfk-ed92df2325332306b2463b50`: browser production command IDs keep `cmd.browser.share_with_agent` and `cmd.browser.revoke_share_with_agent`; `cmd.browser.run_code`, `cmd.browser.evaluate`, legacy `browser_run_code`, and legacy `browser_evaluate` are compatibility-only diagnostic/page-evaluation lineage, not default production browser commands.

### UCC-049 through UCC-105 strict schema overlay and UCC-106 lineage exclusion

This overlay is the owner reference for every active command row from UCC-049 through UCC-105. It keeps the catalog as the command-ID SSOT while avoiding duplicated payload tables. Implementers MUST resolve each active row through the row range below, then through the row's concrete current `cmd.*` tokens or compatibility notes. UCC-106 does not inherit this command schema; its retained command-era tokens and current typed local actions have the closed disposition stated in the final row below. Amended 2026-11-05 (DL-333): typed payload definitions live in the owner docs that UCC-230 names; this overlay keeps the common fields and closed code sets and stays the command-id and alias authority.

Common fields for every covered row:

- `command_id`: every concrete current `cmd.*` token in the row's `preserved_exact_tokens`, except a token expressly marked retired, source-lineage-only, or non-alias in `compatibility_only_notes` or `stale_retired_dispositions`; grouped or wildcard tokens are family aliases and must normalize to a concrete active `cmd.*` row before dispatch.
- `payload_required`: `dispatch_id`, `command_id`, `source_surface`, `actor_ref`, and the row-specific identity listed below.
- `payload_optional`: `route_target?`, `OpenSubject?`, `project_id?`, `repo_id?`, `worktree_id?`, `run_id?`, `attempt_id?`, `node_id?`, `thread_id?`, `usage_event_ref?`, `usage_record_id?`, `provider_attempt_ref?`, `tool_call_id?`, `trace_ref?`, `receipt_ref?`, `receipt_refs[]?`, `raw_payload_ref?`, `query_session_id?`, `selection_ref?`, `confirmation_ref?`, `idempotency_key?`, and family-specific args defined by the owner-doc definition that UCC-230 names.
- `result_fields`: the shared closed v2 `UICommandResponse` schema in CV-333, consuming the separately owned typed result rather than duplicating its domain fields.
- `error_codes`: closed to `invalid_route`, `unknown_command`, `invalid_args`, `permission_denied`, `blocked_state_required`, `stale_projection`, `handler_unavailable`, and `internal_error`; family owners may narrow but not expand this set without a new owner-doc row.
- `disabled_reason_codes`: closed to `unsupported`, `not_configured`, `unauthorized`, `unreachable`, `degraded`, `partial_capability`, `blocked_state_required`, `stale_projection`, and `permission_required`.
- `owner_doc_ref`: the owner-doc definition unit that UCC-230 names for the command; no handler may invent unowned payload keys or fabricate `*.command_applied` events.

| Rows | Family owner reference | Row-specific required identity |
|---|---|---|
| `UCC-049` through `UCC-053` | Docker and Kubernetes command families: `Plans/Containers_Registry_and_Unraid.md` CRAU-115; storage and capability details remain with `Plans/FinalGUISpec.md`, `Plans/Wiring_Matrix.md`, `Plans/storage-plan.md`, and `Plans/Tools.md` ContractRefs already carried by the rows. | `container_ref?`, `image_ref?`, `compose_project_ref?`, `kubernetes_context?`, `namespace?`, and `capability_snapshot_ref` for mutating or capability-gated actions. |
| `UCC-054` through `UCC-055` | Project-scope worktree command family: `Plans/WorktreeGitImprovement.md` W-095. | `repo_id`, `worktree_id?`, `branch_ref?`, `safe_point_id?`, and `worktree_lifecycle_state` when mutating worktree state. |
| `UCC-056` through `UCC-060` | Assistant chat, context lens, thread worktree, and context-detail command families: `Plans/assistant-chat-design.md` ACD-637. | `thread_id` plus `message_id?`, `context_lens_mode?`, `worktree_id?`, `usage_detail_ref?`, or `context_projection_ref?` according to the concrete command. |
| `UCC-061` through `UCC-065` | Browser and preview command family: `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-328. | `browser_session_id?`, `preview_subject_ref?`, `selection_ref?`, `screenshot_ref?`, and `agent_share_scope?` for capture/share/takeover commands. |
| `UCC-066` through `UCC-072` | Terminal and dev-session command families: `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-329 (terminal, dev-session and catalog lifecycle commands). | `terminal_session_id?`, `pane_id?`, `dev_session_id?`, `command_ref?`, and `layout_target?` for focus, rerun, split, reveal, and recovery commands. |
| `UCC-073` through `UCC-076` | Chat message, code-block, rewind/revert, and activity-dimension command families: `Plans/assistant-chat-design.md` ACD-638. | `thread_id`, `message_id?`, `code_block_id?`, `checkpoint_ref?`, and `activity_dimension?` for the concrete action. |
| `UCC-077` through `UCC-083` | Debug, web/slash dispatcher, web activity, reserved slash alias, and route-mapping command families: `Plans/Commands_System.md` CS-125 (`cmd.debug.*`) and `Plans/assistant-chat-design.md` ACD-639 (`cmd.chat.web.*`, `cmd.chat.stop`). | `thread_id`, `debug_session_id?`, `web_operation_id?`, `slash_command_id?`, `route_target?`, and `provider_route_ref?`; retired slash labels must normalize before dispatch. |
| `UCC-084` through `UCC-088` | Memory, artifact side-panel, and search command families: `Plans/assistant-memory-subsystem.md` AMS-141 (memory), `Plans/Runtime_Artifacts_Panel.md` RAP-129 (artifacts) and `Plans/FinalGUISpec.md` F3-716 (search). | `memory_item_id?`, `artifact_id?`, `ledger_ref?`, `query_session_id?`, `replacement?`, and `index_scope?` as required by the concrete command. |
| `UCC-089` through `UCC-095` | Runtime recovery command family: `Plans/Executor_Protocol.md` EP-236. | `run_id`, `blocked_sequence`, `allowed_action_id`, `node_id?`, `attempt_id?`, `safe_point_id?`, `baseline_ref?`, and `permission_carry_ref?`; pre-attempt blocked rows MUST NOT fabricate an `attempt_id`. |
| `UCC-096` through `UCC-100` | Goal, Planning Wizard, Plan Compile, discovery-routed search, and history wrapper command families: `Plans/Goal_Runtime_System.md` GRS-218, `Plans/PRD_Builder.md` PRDB-024, `Plans/Planning_Wizard.md` PWIZ-109 and `Plans/Plan_To_Node_Compilation.md` PNC-037; UCC-230 routes each concrete command and its `prose_unit_resolution` records the units that add no command row. | `goal_id?`, `thread_id?`, `planning_session_id?`, `plan_pack_ref?`, `plan_compile_run_id?`, `history_query_ref?`, and `target_identity_ref?` for the concrete command. |
| `UCC-101` through `UCC-105` | Vision bridge, Teach, notification/sound, DRY settings, and containerized-host command families: `Plans/FinalGUISpec.md` F3-717 (notifications and sounds), `Plans/Settings_System.md` SSYS-076 (`cmd.settings.open`) and `Plans/Containers_Registry_and_Unraid.md` CRAU-116 (Docker/Hosts, `cmd.docker.run`, `cmd.docker.container.open`); UCC-230 routes each concrete command and its `prose_unit_resolution` records the units that add no command row. UCC-103 expressly excludes retired non-alias `cmd.settings.open_notifications`; current Notifications navigation uses `cmd.settings.open`. | `image_ref?`, `teach_session_id?`, `notification_destination_id?`, `sound_asset_id?`, `settings_key?`, `host_capability_ref?`, and `host_profile_id?` for the concrete current command. |
| `UCC-106` | Product Onboarding is owned by `Plans/Planning_Wizard.md` PWIZ-021 through PWIZ-025. Its eleven command-era `cmd.onboarding.*` identifiers are retained source lineage only, its separate eight packet candidate tokens are rejected as commands/aliases/handlers, and its fourteen `ui.onboarding.*` identifiers (`ui.onboarding.choose_look` added by DL-153) are typed owner-local UI actions. | Not applicable: no Onboarding command schema, alias, primary handler, or production-wiring row. Owner-launch actions consume the v2 phase/draft/preflight/Project-commit bindings and target the existing owner's command; local request/result IDs are `pm.product_onboarding.action_request.v2` and `pm.product_onboarding.action_result.v2`. |

Compatibility-only and retired source tokens in these rows remain searchable lineage. They do not become command IDs unless the row's `command_id` rule maps them to a concrete active `cmd.*` value or an explicit `alias_of_command_id`; tokens expressly marked non-alias never normalize or dispatch.

### UCC-230 - Strict Schema Overlay Owner Definition Map

```yaml
plan_unit_id: UCC-230
unit_type: schema_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  UCC-230 maps every active command row of the UCC-049 through UCC-105 strict schema overlay to the owner-doc
  PlanUnit that holds its typed payload definition (DL-333). A definition is one entry of a
  pm.command_payload_definitions.v1 block: a fenced yaml block whose only top-level key is
  command_payload_definitions, with no plan_unit_id key, placed directly after the fence of a command_contract
  PlanUnit in the owner doc that the owners routing below names, and that unit lists every command it defines in
  preserved_exact_tokens. A definition gives the command's UICommand.args, each field with a type from the closed
  vocabulary below, a required flag, a default and canon or gap provenance; its command_kind and response_kind;
  its owner request and its owner result carried by the CV-333 UICommandResponse; and error and disabled-reason
  codes narrowed from the overlay's closed sets by the error_narrowing rule. It never restates dispatch_id,
  command_id, source_surface or actor_ref and never changes the canonical type of a common optional field. The
  expected set is the overlay command_id rule over the concrete tokens of UCC-049 through UCC-105, plus
  prose_unit_resolution, minus non_definition_tokens, each of which quotes the canon that marks it. A contested
  command gets no definition until the coordinator rules. Owner disabled states that fall outside the closed set
  map to closed codes through owner_state_code_map and stay display detail; identity exemptions exist only where
  this map records them with a decision. The catalog stays the command-id and alias authority and its command rows
  hold no data shapes. scripts/pm-command-payload-defs-check.py checks this map against the overlay and every
  definition against this map.
gui_related: false
gui_classification_reason: Records where command payload types live and how they are checked; no GUI behavior changes.
split_recommended: false
depends_on: [DL-333, CV-333, UCC-109]
unblocks: []
acceptance_criteria:
  - "Every expected UCC-049..UCC-105 command has exactly one definition, in the owner unit this map routes it to, or is listed in contested."
  - "row_groups equal the overlay's row-specific identity cells, and envelope equals the overlay's payload_required and payload_optional bullets."
  - "Every non_definition_tokens entry quotes the canon that marks it, and every token a unit's compatibility or stale note marks is listed."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-command-payload-defs-check.py --self-test
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - scripts/pm-command-payload-defs-check.py
node_compile_hint:
  mode: command_payload_definition_map
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to closure question Q5"
  - "pm-mail 1105034552-f6f4 (pm7-build, 2026-11-05): coordinator resolutions 1-10 under that answer"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/DESIGN.md sections 4-6"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/RESOLUTIONS.md"
preserved_exact_tokens:
  - UCC-230
  - pm.command_payload_definitions.v1
  - command_payload_definitions
  - command_payload_definition_map
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias, source-lineage, outside-range or contested token.
  - Do not expand the overlay's closed error or disabled-reason sets; map owner states to closed codes instead.
  - Do not record an identity exemption anywhere but this map, and only with a decision.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Decision_Log.md
command_payload_definition_map:
  format: pm.command_payload_definitions.v1
  overlay_section: UCC-049 through UCC-105 strict schema overlay and UCC-106 lineage exclusion
  unit_range:
  - UCC-049
  - UCC-105
  type_vocabulary:
  - id
  - ref
  - secret_ref
  - string
  - boolean
  - integer
  - sha256
  - timestamp
  - url
  - path
  - enum
  - const
  - list
  - object
  - contract
  constraint_keys:
  - min_length
  - max_length
  - pattern
  - minimum
  - maximum
  - min_items
  - max_items
  - unique_items
  conditional_keys:
  - required_when
  - forbidden_when
  contract_ref_forms:
  - Plans/<file>.schema.json#/$defs/<Name>
  - Plans/<Doc>.md#<UNIT-ID>
  - Primitive:RouteTarget
  - Primitive:OpenSubject
  - Primitive:ExecutionContext
  - local:<Name> (a result named in the same definitions block)
  default_sentinel: none (absent; the handler applies no implied value)
  error_narrowing:
    always:
    - handler_unavailable
    - internal_error
    - invalid_args
    - permission_denied
    domain_action_or_stale_disabled:
    - stale_projection
    blocked_disabled_or_runtime_group:
    - blocked_state_required
    navigation_or_route_args:
    - invalid_route
    never:
    - unknown_command
  envelope:
    required_not_restated:
    - dispatch_id
    - command_id
    - source_surface
    - actor_ref
    common_optional:
      route_target:
        type: contract
        ref: Primitive:RouteTarget
      OpenSubject:
        type: contract
        ref: Primitive:OpenSubject
      project_id:
        type: id
      repo_id:
        type: id
      worktree_id:
        type: id
      run_id:
        type: id
      attempt_id:
        type: id
      node_id:
        type: id
      thread_id:
        type: id
      usage_event_ref:
        type: ref
      usage_record_id:
        type: id
      provider_attempt_ref:
        type: ref
      tool_call_id:
        type: id
      trace_ref:
        type: ref
      receipt_ref:
        type: ref
      receipt_refs:
        type: list
        item:
          type: ref
      raw_payload_ref:
        type: ref
      query_session_id:
        type: id
      selection_ref:
        type: ref
      confirmation_ref:
        type: ref
      idempotency_key:
        type: string
        constraints:
          max_length: 256
    identity_typing: row-group identity fields ending in _id are type id and in _ref are type ref; they become required
      only where the overlay marks them required or canon makes the subject mandatory, citing the source
  row_groups:
  - id: UCC-049..UCC-053
    first: UCC-049
    last: UCC-053
    required_identity:
    - field: capability_snapshot_ref
      when: domain_action
    optional_identity:
    - container_ref
    - image_ref
    - compose_project_ref
    - kubernetes_context
    - namespace
  - id: UCC-054..UCC-055
    first: UCC-054
    last: UCC-055
    required_identity:
    - field: repo_id
      when: always
    - field: worktree_lifecycle_state
      when: domain_action
    optional_identity:
    - worktree_id
    - branch_ref
    - safe_point_id
  - id: UCC-056..UCC-060
    first: UCC-056
    last: UCC-060
    required_identity:
    - field: thread_id
      when: always
    optional_identity:
    - message_id
    - context_lens_mode
    - worktree_id
    - usage_detail_ref
    - context_projection_ref
  - id: UCC-061..UCC-065
    first: UCC-061
    last: UCC-065
    required_identity: []
    optional_identity:
    - browser_session_id
    - preview_subject_ref
    - selection_ref
    - screenshot_ref
    - agent_share_scope
  - id: UCC-066..UCC-072
    first: UCC-066
    last: UCC-072
    required_identity: []
    optional_identity:
    - terminal_session_id
    - pane_id
    - dev_session_id
    - command_ref
    - layout_target
  - id: UCC-073..UCC-076
    first: UCC-073
    last: UCC-076
    required_identity:
    - field: thread_id
      when: always
    optional_identity:
    - message_id
    - code_block_id
    - checkpoint_ref
    - activity_dimension
  - id: UCC-077..UCC-083
    first: UCC-077
    last: UCC-083
    required_identity:
    - field: thread_id
      when: always
    optional_identity:
    - debug_session_id
    - web_operation_id
    - slash_command_id
    - route_target
    - provider_route_ref
  - id: UCC-084..UCC-088
    first: UCC-084
    last: UCC-088
    required_identity: []
    optional_identity:
    - memory_item_id
    - artifact_id
    - ledger_ref
    - query_session_id
    - replacement
    - index_scope
  - id: UCC-089..UCC-095
    first: UCC-089
    last: UCC-095
    required_identity:
    - field: run_id
      when: always
    - field: blocked_sequence
      when: always
    - field: allowed_action_id
      when: always
    optional_identity:
    - node_id
    - attempt_id
    - safe_point_id
    - baseline_ref
    - permission_carry_ref
  - id: UCC-096..UCC-100
    first: UCC-096
    last: UCC-100
    required_identity: []
    optional_identity:
    - goal_id
    - thread_id
    - planning_session_id
    - plan_pack_ref
    - plan_compile_run_id
    - history_query_ref
    - target_identity_ref
  - id: UCC-101..UCC-105
    first: UCC-101
    last: UCC-105
    required_identity: []
    optional_identity:
    - image_ref
    - teach_session_id
    - notification_destination_id
    - sound_asset_id
    - settings_key
    - host_capability_ref
    - host_profile_id
  pre_attempt_admissible:
    field: attempt_id
    commands:
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    source: References allowed_action_id table (minimum args with attempt_id?) and the Pre-attempt blocked rule;
      UCC-092
  owners:
    routing_rule: an exact exception wins; otherwise the longest namespace (an id starting with cmd.<namespace>.)
      among the routes of the command's primary row group (the row group of its lowest-numbered token unit, else
      of its lowest-numbered prose_unit_resolution unit that adds it)
    units:
      CRAU-115: Plans/Containers_Registry_and_Unraid.md
      CRAU-116: Plans/Containers_Registry_and_Unraid.md
      W-095: Plans/WorktreeGitImprovement.md
      ACD-637: Plans/assistant-chat-design.md
      ACD-638: Plans/assistant-chat-design.md
      ACD-639: Plans/assistant-chat-design.md
      SMPFS-328: Plans/Section15_MVP_Promoted_Features_Spec.md
      SMPFS-329: Plans/Section15_MVP_Promoted_Features_Spec.md
      CS-125: Plans/Commands_System.md
      AMS-141: Plans/assistant-memory-subsystem.md
      RAP-129: Plans/Runtime_Artifacts_Panel.md
      F3-716: Plans/FinalGUISpec.md
      F3-717: Plans/FinalGUISpec.md
      EP-236: Plans/Executor_Protocol.md
      GRS-218: Plans/Goal_Runtime_System.md
      PRDB-024: Plans/PRD_Builder.md
      PWIZ-109: Plans/Planning_Wizard.md
      PNC-037: Plans/Plan_To_Node_Compilation.md
      SSYS-076: Plans/Settings_System.md
    routes:
    - row_group: UCC-049..UCC-053
      namespace: docker
      unit: CRAU-115
    - row_group: UCC-054..UCC-055
      namespace: git.worktree
      unit: W-095
    - row_group: UCC-056..UCC-060
      namespace: chat
      unit: ACD-637
    - row_group: UCC-061..UCC-065
      namespace: browser
      unit: SMPFS-328
    - row_group: UCC-066..UCC-072
      namespace: terminal
      unit: SMPFS-329
    - row_group: UCC-066..UCC-072
      namespace: dev
      unit: SMPFS-329
    - row_group: UCC-066..UCC-072
      namespace: catalog
      unit: SMPFS-329
    - row_group: UCC-073..UCC-076
      namespace: chat
      unit: ACD-638
    - row_group: UCC-077..UCC-083
      namespace: debug
      unit: CS-125
    - row_group: UCC-077..UCC-083
      namespace: chat.web
      unit: ACD-639
    - row_group: UCC-084..UCC-088
      namespace: chat.memory
      unit: AMS-141
    - row_group: UCC-084..UCC-088
      namespace: artifacts
      unit: RAP-129
    - row_group: UCC-084..UCC-088
      namespace: search
      unit: F3-716
    - row_group: UCC-089..UCC-095
      namespace: runtime
      unit: EP-236
    - row_group: UCC-096..UCC-100
      namespace: chat.goal
      unit: GRS-218
    - row_group: UCC-096..UCC-100
      namespace: prd_builder
      unit: PRDB-024
    - row_group: UCC-096..UCC-100
      namespace: planning_wizard
      unit: PWIZ-109
    - row_group: UCC-096..UCC-100
      namespace: plan_compile
      unit: PNC-037
    - row_group: UCC-101..UCC-105
      namespace: notifications
      unit: F3-717
    - row_group: UCC-101..UCC-105
      namespace: sound
      unit: F3-717
    - row_group: UCC-101..UCC-105
      namespace: docker
      unit: CRAU-116
    exceptions:
    - command_id: cmd.orchestrator.push_image
      unit: CRAU-115
      reason: UCC-051 token in the Orchestrator namespace; the Docker publication contract is CRAU's.
    - command_id: cmd.docker.run
      unit: CRAU-116
      reason: UCC-105 Docker/Hosts id.
    - command_id: cmd.docker.container.open
      unit: CRAU-116
      reason: UCC-105 Docker/Hosts id.
    - command_id: cmd.chat.stop
      unit: ACD-639
      reason: UCC-083 token outside cmd.chat.web.*; chat-owned stop.
    - command_id: cmd.settings.open
      unit: SSYS-076
      reason: UCC-103 token; Settings route owner.
  prose_unit_resolution:
  - unit: UCC-053
    adds: []
    covers: []
    basis: 'Rules only: cmd.container.* retires to cmd.docker.* and cmd.docker.k8s.*; adds disabled-state and approval
      rules to the UCC-049..UCC-052 commands, no new command.'
  - unit: UCC-055
    adds: []
    covers:
    - cmd.git.worktree.prune
    - cmd.git.worktree.recover
    - cmd.git.worktree.remove
    - cmd.git.worktree.reuse
    basis: Covers cmd.git.worktree.remove, prune and reuse (its tokens) and recover (recovery); no new command.
  - unit: UCC-059
    adds: []
    covers:
    - cmd.chat.worktree.create
    - cmd.chat.worktree.info
    - cmd.chat.worktree.merge
    - cmd.chat.worktree.pr
    - cmd.chat.worktree.remove
    - cmd.chat.worktree.unbind
    basis: Guard variables for the six cmd.chat.worktree.* commands; no new command.
  - unit: UCC-061
    adds: []
    covers:
    - cmd.browser.add_full_screenshot_to_chat
    - cmd.browser.add_screenshot_to_chat
    - cmd.browser.add_selection_full_screenshot_to_chat
    - cmd.browser.add_selection_screenshot_to_chat
    - cmd.browser.add_selection_to_chat
    - cmd.browser.detach_browser_tab
    - cmd.browser.focus_browser_tab
    - cmd.browser.keep_closed
    - cmd.browser.let_agent_continue
    - cmd.browser.open_detached_preview
    - cmd.browser.open_devtools
    - cmd.browser.open_workspace_preview
    - cmd.browser.pause_agent
    - cmd.browser.pick_element_for_chat
    - cmd.browser.promote_to_normal_browsing
    - cmd.browser.reopen
    - cmd.browser.retry
    - cmd.browser.revoke_share_with_agent
    - cmd.browser.share_with_agent
    - cmd.browser.stop_agent_keep_browser
    - cmd.browser.take_over
    - cmd.browser.toggle_devtools_dock
    - cmd.terminal.open
    - cmd.terminal.show
    basis: Ownership boundary over the browser, terminal and dev commands in range; no new command.
  - unit: UCC-062
    adds: []
    covers:
    - cmd.browser.add_full_screenshot_to_chat
    - cmd.browser.add_screenshot_to_chat
    - cmd.browser.add_selection_full_screenshot_to_chat
    - cmd.browser.add_selection_screenshot_to_chat
    - cmd.browser.add_selection_to_chat
    - cmd.browser.detach_browser_tab
    - cmd.browser.focus_browser_tab
    - cmd.browser.keep_closed
    - cmd.browser.let_agent_continue
    - cmd.browser.open_detached_preview
    - cmd.browser.open_devtools
    - cmd.browser.open_workspace_preview
    - cmd.browser.pause_agent
    - cmd.browser.pick_element_for_chat
    - cmd.browser.promote_to_normal_browsing
    - cmd.browser.reopen
    - cmd.browser.retry
    - cmd.browser.revoke_share_with_agent
    - cmd.browser.share_with_agent
    - cmd.browser.stop_agent_keep_browser
    - cmd.browser.take_over
    - cmd.browser.toggle_devtools_dock
    basis: cmd.browser.* resolves to the 22 concrete browser rows of UCC-063..UCC-065.
  - unit: UCC-066
    adds: []
    covers:
    - cmd.terminal.open
    - cmd.terminal.show
    basis: Covers cmd.terminal.open and cmd.terminal.show (promotion and handoff).
  - unit: UCC-068
    adds: []
    covers:
    - cmd.terminal.focus
    - cmd.terminal.open
    - cmd.terminal.restart_replace
    - cmd.terminal.show
    basis: Covers cmd.terminal.focus, show, open and restart_replace (reuse precedence).
  - unit: UCC-069
    adds: []
    covers:
    - cmd.terminal.open
    - cmd.terminal.rerun
    - cmd.terminal.show
    basis: Covers cmd.terminal.open, show and rerun (cards).
  - unit: UCC-076
    adds: []
    covers:
    - cmd.chat.edit_last_user_message
    - cmd.chat.resend_last_user_message
    - cmd.chat.revert
    - cmd.chat.rewind
    - cmd.chat.stop
    basis: Covers cmd.chat.stop, edit_last_user_message, resend_last_user_message, rewind and revert; /edit/delete
      is a shorthand, not a command.
  - unit: UCC-079
    adds: []
    covers:
    - cmd.chat.web.crawl
    - cmd.chat.web.extract
    - cmd.chat.web.fetch
    - cmd.chat.web.map
    - cmd.chat.web.research
    - cmd.chat.web.search
    basis: Web activity provenance over the six cmd.chat.web.* operations; no new command.
  - unit: UCC-080
    adds: []
    covers:
    - cmd.chat.stop
    - cmd.chat.web.crawl
    - cmd.chat.web.extract
    - cmd.chat.web.fetch
    - cmd.chat.web.map
    - cmd.chat.web.research
    - cmd.chat.web.search
    basis: Slash policy over the cmd.chat.web.* operations and cmd.chat.stop; no new command.
  - unit: UCC-081
    adds: []
    covers:
    - cmd.chat.web.crawl
    - cmd.chat.web.extract
    - cmd.chat.web.fetch
    - cmd.chat.web.help
    - cmd.chat.web.map
    - cmd.chat.web.research
    - cmd.chat.web.search
    basis: Supplies provider option names for cmd.chat.web.help and the six cmd.chat.web.* operations; no new command.
  - unit: UCC-082
    adds: []
    covers:
    - cmd.chat.web.crawl
    - cmd.chat.web.extract
    - cmd.chat.web.fetch
    - cmd.chat.web.help
    - cmd.chat.web.map
    - cmd.chat.web.research
    - cmd.chat.web.search
    basis: Supplies result-shape hints for cmd.chat.web.help and the six cmd.chat.web.* operations; no new command.
  - unit: UCC-088
    adds: []
    covers:
    - cmd.search.find_in_files
    - cmd.search.open_result
    - cmd.search.replace_all
    - cmd.search.replace_in_files
    - cmd.search.replace_selected
    basis: Covers cmd.search.find_in_files, replace_in_files, open_result, replace_selected and replace_all.
  - unit: UCC-089
    adds:
    - cmd.runtime.abort_run
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    covers: []
    basis: Maps allowed_action_id tokens through the References table (allowed_action_id -> canonical command id),
      adding resume_after_prerequisite, restore_safe_point_then_retry, start_fresh_attempt, replan, skip_node and
      abort_run.
  - unit: UCC-090
    adds: []
    covers:
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.retry_now
    - cmd.runtime.start_fresh_attempt
    basis: Rules over the runtime recovery retry and restore commands; no new command.
  - unit: UCC-092
    adds: []
    covers:
    - cmd.runtime.abandon_recovery
    - cmd.runtime.abort_run
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.locate_and_verify_recovery
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.retry_now
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    basis: Pre-attempt blocked-sequence identity over the runtime recovery commands; no new command.
  - unit: UCC-093
    adds: []
    covers:
    - cmd.runtime.abandon_recovery
    - cmd.runtime.abort_run
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.locate_and_verify_recovery
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.retry_now
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    basis: Recovery verb copy over the runtime recovery commands; no new command.
  - unit: UCC-094
    adds:
    - cmd.runtime.abandon_recovery
    - cmd.runtime.locate_and_verify_recovery
    covers:
    - cmd.runtime.abort_run
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.retry_now
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    basis: cmd.runtime.* covers the runtime recovery commands plus cmd.runtime.locate_and_verify_recovery and cmd.runtime.abandon_recovery
      from the Known-37 recovery-unavailable catalog rows.
  - unit: UCC-095
    adds: []
    covers:
    - cmd.runtime.abandon_recovery
    - cmd.runtime.abort_run
    - cmd.runtime.approve
    - cmd.runtime.decline
    - cmd.runtime.locate_and_verify_recovery
    - cmd.runtime.open_attempt_details
    - cmd.runtime.replan
    - cmd.runtime.restore_safe_point_then_retry
    - cmd.runtime.resume_after_prerequisite
    - cmd.runtime.retry_now
    - cmd.runtime.skip_node
    - cmd.runtime.start_fresh_attempt
    basis: Recovery metadata resolver and permission carry-through over the runtime recovery commands; no new command.
  - unit: UCC-097
    adds: []
    covers:
    - cmd.plan_compile.cancel
    - cmd.plan_compile.inspect_assignment
    - cmd.plan_compile.inspect_blocker
    - cmd.plan_compile.inspect_evidence
    - cmd.plan_compile.open_build
    - cmd.plan_compile.pause
    - cmd.plan_compile.request_bounded_recompile
    - cmd.plan_compile.resume
    - cmd.plan_compile.retry
    - cmd.planning_wizard.amendment.accept
    - cmd.planning_wizard.approve_and_build
    - cmd.planning_wizard.start
    - cmd.planning_wizard.topic.add
    - cmd.planning_wizard.topic.defer
    - cmd.planning_wizard.topic.mark_impacted
    - cmd.planning_wizard.topic.merge
    - cmd.planning_wizard.topic.open
    - cmd.planning_wizard.topic.rename
    - cmd.planning_wizard.topic.reopen
    - cmd.planning_wizard.topic.reorder
    - cmd.planning_wizard.topic.split
    - cmd.prd_builder.annotation.resolve
    - cmd.prd_builder.annotation.upsert
    - cmd.prd_builder.answer.upsert
    - cmd.prd_builder.approve_for_planning_wizard
    - cmd.prd_builder.conflict.resolve
    - cmd.prd_builder.pack.reopen
    - cmd.prd_builder.source.import
    basis: Covers the 28 rows of Concrete PRD Builder, Planning Wizard, and Plan Compile command rows (UCC-098 adds
      them).
  - unit: UCC-098
    adds:
    - cmd.plan_compile.cancel
    - cmd.plan_compile.inspect_assignment
    - cmd.plan_compile.inspect_blocker
    - cmd.plan_compile.inspect_evidence
    - cmd.plan_compile.open_build
    - cmd.plan_compile.pause
    - cmd.plan_compile.request_bounded_recompile
    - cmd.plan_compile.resume
    - cmd.plan_compile.retry
    - cmd.planning_wizard.amendment.accept
    - cmd.planning_wizard.approve_and_build
    - cmd.planning_wizard.start
    - cmd.planning_wizard.topic.add
    - cmd.planning_wizard.topic.defer
    - cmd.planning_wizard.topic.mark_impacted
    - cmd.planning_wizard.topic.merge
    - cmd.planning_wizard.topic.open
    - cmd.planning_wizard.topic.rename
    - cmd.planning_wizard.topic.reopen
    - cmd.planning_wizard.topic.reorder
    - cmd.planning_wizard.topic.split
    - cmd.prd_builder.annotation.resolve
    - cmd.prd_builder.annotation.upsert
    - cmd.prd_builder.answer.upsert
    - cmd.prd_builder.approve_for_planning_wizard
    - cmd.prd_builder.conflict.resolve
    - cmd.prd_builder.pack.reopen
    - cmd.prd_builder.source.import
    covers: []
    basis: Adds the 28 rows of Concrete PRD Builder, Planning Wizard, and Plan Compile command rows (the command
      family required by UCC-098 is concrete).
  - unit: UCC-099
    adds: []
    covers:
    - cmd.search.find_in_files
    basis: No cmd.discovery.* family is needed; cmd.search.* stays canon. Covers cmd.search.find_in_files.
  - unit: UCC-100
    adds: []
    covers: []
    basis: No concrete History command id exists yet; Q5 resolution 9b mints ids from the actions this unit lists.
  - unit: UCC-101
    adds: []
    covers: []
    basis: No concrete Vision bridge command id exists yet; Q5 resolution 9b mints ids from the actions this unit
      lists.
  - unit: UCC-102
    adds: []
    covers: []
    basis: No concrete Teach guided GUI command id exists yet; Q5 resolution 9b mints ids from the actions this
      unit lists.
  - unit: UCC-104
    adds: []
    covers: []
    basis: Its only token is retired source lineage; the toggle reuses cmd.settings.transaction.preview and .apply
      (UCC-120, SSYS-018). No command.
  - unit: UCC-105
    adds:
    - cmd.docker.container.open
    - cmd.docker.host.access.open_app
    - cmd.docker.host.instance.restart
    - cmd.docker.host.instance.retain
    - cmd.docker.host.instance.start
    - cmd.docker.host.instance.stop
    - cmd.docker.host.preflight
    - cmd.docker.host.profile.save
    - cmd.docker.host.receipt.open
    - cmd.docker.host.refresh
    - cmd.docker.host.session.launch
    - cmd.docker.hosts.open
    - cmd.docker.run
    covers:
    - cmd.docker.cleanup.prune
    - cmd.docker.cleanup.scan
    - cmd.docker.container.attach_shell
    - cmd.docker.container.view_logs
    basis: Wildcards only; its canonical_text names the Docker/Hosts ids. Adds the 11 host ids, cmd.docker.run and
      cmd.docker.container.open; covers cmd.docker.container.view_logs, attach_shell, cleanup.scan and cleanup.prune.
  non_definition_tokens:
  - token: cmd.browser.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-062
      field: stale_retired_dispositions
      quote: Older /focus/detach/share/revoke shorthand maps only to concrete rows
  - token: cmd.browser.devtools.open
    disposition: alias
    targets:
    - cmd.browser.open_devtools
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-063
      field: stale_retired_dispositions
      quote: cmd.browser.devtools.open is an alias of cmd.browser.open_devtools
  - token: cmd.chat.add_file_reference
    disposition: compatibility_alias
    targets:
    - cmd.chat.attachment.add
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: File-only compatibility alias to `cmd.chat.attachment.add`
    note: Target cmd.chat.attachment.add is owned by UCC-156, outside UCC-049..UCC-105; the signature-locked spelling
      stays.
  - token: cmd.chat.close_thread_usage
    disposition: superseded_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-060
      field: negative_constraints
      quote: cmd.chat.open_thread_usage, cmd.chat.focus_thread_usage, and cmd.chat.close_thread_usage are superseded
    note: Normalizes to cmd.nav.open_usage_subject (UCC-109).
  - token: cmd.chat.focus_thread_usage
    disposition: superseded_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-060
      field: negative_constraints
      quote: cmd.chat.open_thread_usage, cmd.chat.focus_thread_usage, and cmd.chat.close_thread_usage are superseded
    note: Normalizes to cmd.nav.open_usage_subject (UCC-109).
  - token: cmd.chat.open_thread_usage
    disposition: superseded_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-060
      field: negative_constraints
      quote: cmd.chat.open_thread_usage, cmd.chat.focus_thread_usage, and cmd.chat.close_thread_usage are superseded
    note: Normalizes to cmd.nav.open_usage_subject (UCC-109, outside UCC-049..UCC-105).
  - token: cmd.chat.worktree.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-054
      field: preserved_exact_tokens
      quote: cmd.chat.worktree.*
    note: Thread-scoped family; its concrete rows are UCC-058's.
  - token: cmd.chat.{new,archive,delete,rename,pin,export,search}
    disposition: family_alias
    targets:
    - cmd.chat.new
    - cmd.chat.archive
    - cmd.chat.delete
    - cmd.chat.rename
    - cmd.chat.pin
    - cmd.chat.export
    - cmd.chat.search
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-056
      field: preserved_exact_tokens
      quote: cmd.chat.{new,archive,delete,rename,pin,export,search}
  - token: cmd.container.*
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-053
      field: stale_retired_dispositions
      quote: Legacy cmd.container.* references are retired to active cmd.docker.* and cmd.docker.k8s.* namespaces
  - token: cmd.debug.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-077
      field: preserved_exact_tokens
      quote: cmd.debug.*
  - token: cmd.docker.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-105
      field: preserved_exact_tokens
      quote: cmd.docker.*
  - token: cmd.docker.build
    disposition: compatibility_alias
    targets:
    - cmd.docker.build.image
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-049
      field: compatibility_only_notes
      quote: cmd.docker.build/logs/exec/inspect are compatibility aliases
    note: 'Cozy Shelves reconciliation: alias-of cmd.docker.build.image (selected path).'
  - token: cmd.docker.compose.scenario.save/run/edit/delete
    disposition: family_alias
    targets:
    - cmd.docker.compose.scenario.save
    - cmd.docker.compose.scenario.run
    - cmd.docker.compose.scenario.edit
    - cmd.docker.compose.scenario.delete
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-050
      field: compatibility_only_notes
      quote: Grouped scenario command token denotes the scenario command family
  - token: cmd.docker.compose_down
    disposition: compatibility_alias
    targets:
    - cmd.docker.compose.down
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '| `cmd.docker.compose_down` | Compose Down | Compatibility alias for full-compose down |'
    note: Target cmd.docker.compose.down is owned by UCC-137, outside UCC-049..UCC-105.
  - token: cmd.docker.compose_up
    disposition: compatibility_alias
    targets:
    - cmd.docker.compose.up
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '| `cmd.docker.compose_up` | alias-of `cmd.docker.compose.up` |'
    note: Target cmd.docker.compose.up is owned by UCC-137, outside UCC-049..UCC-105.
  - token: cmd.docker.exec
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.attach_shell
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-049
      field: compatibility_only_notes
      quote: cmd.docker.build/logs/exec/inspect are compatibility aliases
  - token: cmd.docker.inspect
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.inspect
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-049
      field: compatibility_only_notes
      quote: cmd.docker.build/logs/exec/inspect are compatibility aliases
  - token: cmd.docker.k8s.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-105
      field: preserved_exact_tokens
      quote: cmd.docker.k8s.*
  - token: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace
    disposition: family_alias
    targets:
    - cmd.docker.k8s.apply
    - cmd.docker.k8s.diff
    - cmd.docker.k8s.logs
    - cmd.docker.k8s.exec
    - cmd.docker.k8s.port_forward
    - cmd.docker.k8s.select_context
    - cmd.docker.k8s.select_namespace
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-052
      field: preserved_exact_tokens
      quote: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace
  - token: cmd.docker.logs
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.view_logs
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-049
      field: compatibility_only_notes
      quote: cmd.docker.build/logs/exec/inspect are compatibility aliases
  - token: cmd.docker.restart
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.restart
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '`cmd.docker.restart` becomes a recorded compatibility alias'
  - token: cmd.docker.set_context
    disposition: compatibility_alias
    targets:
    - cmd.docker.context.select
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '| `cmd.docker.set_context` | alias-of `cmd.docker.context.select` |'
  - token: cmd.docker.stop
    disposition: compatibility_alias
    targets:
    - cmd.docker.container.stop
    evidence:
      doc: Plans/UI_Command_Catalog.md
      quote: '`cmd.docker.stop` becomes a recorded compatibility alias'
  - token: cmd.git.worktree.open_files
    disposition: compatibility_alias
    targets:
    - cmd.git.worktree.open
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-054
      field: compatibility_only_notes
      quote: cmd.git.worktree.open_files
  - token: cmd.git.worktree.switch
    disposition: compatibility_alias
    targets:
    - cmd.git.worktree.open
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-054
      field: compatibility_only_notes
      quote: and switch are compatibility aliases
    note: '2.5C: compatibility alias for select plus open until callers migrate.'
  - token: cmd.k8s.*
    disposition: compatibility_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-052
      field: compatibility_only_notes
      quote: Existing cmd.k8s.*, set_context, and set_namespace rows are compatibility aliases
  - token: cmd.panel_tab.close
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-072
      field: canonical_text
      quote: cmd.panel_tab.close ends the tab's session after the terminal kind's close check
    note: Owned by UCC-200.
  - token: cmd.plan_compile.retry_stage
    disposition: compatibility_alias
    targets:
    - cmd.plan_compile.retry
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.plan_compile.retry", "alias_command_ids": ["cmd.plan_compile.retry_stage"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.accept_amendment
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.amendment.accept
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.amendment.accept", "alias_command_ids": ["cmd.planning_wizard.accept_amendment"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.add_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.add
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.add", "alias_command_ids": ["cmd.planning_wizard.add_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.defer_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.defer
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.defer", "alias_command_ids": ["cmd.planning_wizard.defer_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.mark_impacted
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.mark_impacted
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.mark_impacted", "alias_command_ids": ["cmd.planning_wizard.mark_impacted"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.merge_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.merge
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.merge", "alias_command_ids": ["cmd.planning_wizard.merge_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.rename_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.rename
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.rename", "alias_command_ids": ["cmd.planning_wizard.rename_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.reopen_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.reopen
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.reopen", "alias_command_ids": ["cmd.planning_wizard.reopen_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.reorder_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.reorder
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.reorder", "alias_command_ids": ["cmd.planning_wizard.reorder_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.split_topic
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.topic.split
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.topic.split", "alias_command_ids": ["cmd.planning_wizard.split_topic"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.planning_wizard.start_from_prd
    disposition: compatibility_alias
    targets:
    - cmd.planning_wizard.start
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.planning_wizard.start", "alias_command_ids": ["cmd.planning_wizard.start_from_prd"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.annotate_source
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.annotation.upsert
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.annotation.upsert", "alias_command_ids": ["cmd.prd_builder.annotate_source"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.answer_question
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.answer.upsert
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.answer.upsert", "alias_command_ids": ["cmd.prd_builder.answer_question"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.approve_for_planning
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.approve_for_planning_wizard
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.approve_for_planning_wizard", "alias_command_ids": ["cmd.prd_builder.approve_for_planning"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.import_sources
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.source.import
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.source.import", "alias_command_ids": ["cmd.prd_builder.import_sources"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.reopen_pack
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.pack.reopen
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.pack.reopen", "alias_command_ids": ["cmd.prd_builder.reopen_pack"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.prd_builder.resolve_conflict
    disposition: compatibility_alias
    targets:
    - cmd.prd_builder.conflict.resolve
    evidence:
      doc: Plans/prd_planning_runtime_contracts.json
      quote: '"command_id": "cmd.prd_builder.conflict.resolve", "alias_command_ids": ["cmd.prd_builder.resolve_conflict"]'
    note: 'Q5 resolution 1: the catalog id is canonical; the runtime contract file records its former id as an alias.'
  - token: cmd.runtime.*
    disposition: family_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-089
      field: stale_retired_dispositions
      quote: 'Canonical recovery commands use one shared namespace: cmd.runtime.*'
    note: Legacy recovery command namespaces are deprecated aliases only (UCC-089 compatibility_only_notes).
  - token: cmd.settings.agent_rules.dry_method_default_guard.set
    disposition: source_lineage
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-104
      field: stale_retired_dispositions
      quote: 'cmd.settings.agent_rules.dry_method_default_guard.set: retired source lineage'
  - token: cmd.settings.open_notifications
    disposition: retired_non_alias
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-103
      field: stale_retired_dispositions
      quote: 'cmd.settings.open_notifications: retained source lineage only; no primary handler, production-wiring
        row, or alias'
  - token: cmd.settings.transaction.apply
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-104
      field: canonical_text
      quote: reuses cmd.settings.transaction.preview and cmd.settings.transaction.apply from SSYS-018
    note: Owned by UCC-120 and SSYS-018.
  - token: cmd.settings.transaction.preview
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-104
      field: canonical_text
      quote: reuses cmd.settings.transaction.preview and cmd.settings.transaction.apply from SSYS-018
    note: Owned by UCC-120 and SSYS-018.
  - token: cmd.terminal.close_pane
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-072
      field: stale_retired_dispositions
      quote: termination_policy retires with cmd.terminal.close_pane
  - token: cmd.terminal.detach
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-067
      field: stale_retired_dispositions
      quote: the detach and pane rows retire; replacements in UCC-201
  - token: cmd.terminal.kill_session
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-072
      field: canonical_text
      quote: ending a session while keeping its tab is cmd.terminal.terminate_session or cmd.terminal.kill_session
        (UCC-201)
    note: Owned by UCC-201.
  - token: cmd.terminal.move_pane
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-067
      field: stale_retired_dispositions
      quote: the detach and pane rows retire; replacements in UCC-201
  - token: cmd.terminal.split_pane
    disposition: retired
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-067
      field: stale_retired_dispositions
      quote: the detach and pane rows retire; replacements in UCC-201
  - token: cmd.terminal.terminate_session
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-072
      field: canonical_text
      quote: ending a session while keeping its tab is cmd.terminal.terminate_session or cmd.terminal.kill_session
        (UCC-201)
    note: Owned by UCC-201.
  - token: cmd.thread.request
    disposition: owned_outside_range
    evidence:
      doc: Plans/UI_Command_Catalog.md
      unit: UCC-056
      field: canonical_text
      quote: Existing cmd.thread.request/spawn Send uses current local previews and receiver authority
    note: Owned by UCC-145 and UCC-216.
  owner_state_code_map:
  - owner_state: activation_not_active
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: actor_not_authorized
    maps_to: unauthorized
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: annotation_terminal
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: assignment_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: blocker_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: blocking_findings
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: compile_terminal
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: dependency_conflict
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: dependency_order_conflict
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: dirty_worktree
    maps_to: blocked_state_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: duplicate_title
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: evidence_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: ledger_sync_blocked
    maps_to: degraded
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_approver
    maps_to: permission_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_claims
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_impact_evidence
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_project_context
    maps_to: not_configured
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_remote
    maps_to: not_configured
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: missing_resource_limit_profile
    maps_to: not_configured
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_resume_ref
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: missing_source_lineage
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: mutation_already_active
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: no_invalidated_refs
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: operation_in_progress
    maps_to: blocked_state_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: pack_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: parser_sandbox_unavailable
    maps_to: degraded
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: permission_denied
    maps_to: permission_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands; Plans/prd_planning_runtime_contracts.json
      ui_command_contracts disabled_reason_codes
  - owner_state: projection_stale
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: protected_branch
    maps_to: blocked_state_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: required_topic
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: source_coverage_missing
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: source_limit_exceeded
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: source_quarantined
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stage_not_retryable
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_acceptance_index
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_anchor_unrelocated
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_approved_plan_pack
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_final_audit_closure
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_named_plan
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_pack
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_planning_run_revision
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_planunit_index
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_project_context
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_source_security_policy
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_testing_policy
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_topic_map_version
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: stale_workspace
    maps_to: stale_projection
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: topic_busy
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: topic_not_deferred_or_ready
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: topics_not_ready
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  - owner_state: untracked_files
    maps_to: blocked_state_required
    sources:
    - Plans/GitHub_Integration.md#GI-041; GitHub_Integration.md Worktree Topology Commands
  - owner_state: zero_incomplete_failed
    maps_to: blocked_state_required
    sources:
    - Plans/prd_planning_runtime_contracts.json ui_command_contracts disabled_reason_codes
  identity_exemptions:
  - command_id: cmd.runtime.open_queue_analysis
    field: allowed_action_id
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_queue_analysis
    field: blocked_sequence
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_remediation_lineage
    field: allowed_action_id
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_remediation_lineage
    field: blocked_sequence
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_safe_point_history
    field: allowed_action_id
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.runtime.open_safe_point_history
    field: blocked_sequence
    decision: DL-333
    reason: 'Q5 resolution 7: runtime navigation opens a route by run identity (References navigation commands);
      it carries no blocked episode.'
  - command_id: cmd.chat.new
    field: thread_id
    decision: DL-333
    reason: 'Q5 resolution 8: cmd.chat.new runs before a thread exists (thread_id is minted when the first user
      message commits); it carries draft identity (ChatNewRequestScopeV2).'
  contested:
  - command_id: cmd.chat.worktree.bind_existing
    question_id: Q5-resolution-4
    reason: 'Resolution 4 (retire as non-alias) is held in P0: dropping its production wiring row also changes the
      projects-refresh command bindings census and its Touch closure profile, which this packet may not edit. Defined
      by nobody until the coordinator rules.'
```
