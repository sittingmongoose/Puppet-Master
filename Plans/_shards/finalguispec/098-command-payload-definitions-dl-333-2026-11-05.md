# Shard 098: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/FinalGUISpec.md`

Source lines: L50376-L51623

Source SHA256: `6bd20f2d11d3cc6bf67337eecf0fac6715d8e81256a3061c7926eba956250225`

---

## Command payload definitions (DL-333, 2026-11-05)

### F3-716 - Search Command Payload Definitions

```yaml
plan_unit_id: F3-716
unit_type: command_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Typed payload definitions (DL-333) for the eight cmd.search.* commands that UI_Command_Catalog UCC-087
  registers and UCC-230 routes to this doc: show, find_in_files, replace_in_files, open_result,
  replace_selected, replace_all, rebuild_index and evict_remote_cache. The Search side panel owns persistent
  project text search, replace-in-files, scope filters and query-session result state; search command routing
  resolves through route_target and stays side-panel scoped with run-aware scope, query-session state and
  open-disposition/reuse policy through route/open owner resolution (UCC-088). The definitions block below
  gives each command its args, owner request and owner result in pm.command_payload_definitions.v1, with
  error and disabled-reason codes narrowed from the overlay's closed sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Search side panel commands.
depends_on: [UCC-230, UCC-087, UCC-088, UCC-099, CV-333, DL-333]
unblocks: []
acceptance_criteria:
  - Every command UCC-230 routes to F3-716 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - Replacement applies only after the Search owner validates the current result snapshot and mutation path (UCC-088).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.search.show, cmd.search.find_in_files, cmd.search.replace_in_files, cmd.search.open_result, cmd.search.replace_selected, cmd.search.replace_all, cmd.search.rebuild_index, cmd.search.evict_remote_cache]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not widen search commands beyond side-panel scope, and do not bypass Search-owner snapshot validation for replacement (UCC-088).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Orchestrator_Page.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: F3-716
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  # Shared conventions for this block:
  # - Row cites are the Search Command Catalog table, UI_Command_Catalog.md:1167-1174; its Parameters
  #   column is history under DL-333 resolution 10, kept as the command-row authority for names.
  # - FinalGUISpec.md:1788-1789 is the owner-doc canon for the canonical GUI shell shapes and the
  #   search-domain taxonomy (find/replace, regex/case/whole-word toggles, include/exclude scope).
  # - No wiring row of these commands names a request_schema_ref (Wiring_Matrix.production.json);
  #   owner_request is none throughout.
  # - No catalog row or registration table states command_kind or disabled_reason_codes for these
  #   eight; kinds follow the row behavior and disabled subsets are judgment from the closed set.
  definitions:
    - command_id: cmd.search.show
      ucc_units: [UCC-087]
      command_kind: shell_view                         # judgment: row "Reveal or focus the Search side panel" (UI_Command_Catalog.md:1167); no catalog kind cell states one
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1167 row args { project_id, focus? }; UCC-230 envelope common optional project_id (type id) made required by the row"
        focus:
          type: enum
          required: false
          default: none
          values: [query, results, replace]
          provenance: canon
          source: "FinalGUISpec.md:1788 canonical shape cmd.search.show { project_id, focus?: \"query\"|\"results\"|\"replace\", workspace_tab_id? }"
        workspace_tab_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "FinalGUISpec.md:1788 names workspace_tab_id? on the canonical show shape; type id per the UCC-230 identity_typing convention for _id fields"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]                # judgment: shell reveal degraded with the panel subsystem; no row states disabled reasons
      aliases: []
    - command_id: cmd.search.find_in_files
      ucc_units: [UCC-087, UCC-088, UCC-099]
      command_kind: domain_action                      # judgment: runs or reruns the owner search; no catalog kind cell states one
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1168 row args { project_id, query?, scope? }; UCC-230 envelope common optional project_id made required by the row"
        query:
          type: string
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1168 marks query? optional for rerun; FinalGUISpec.md:1788 canonical shape { project_id, query, include_globs?, ... } marks it required. Optional chosen so one shape admits first run and rerun; the Search owner validates a non-empty query when no session query exists."
        include_globs:
          type: list
          required: false
          default: none
          item: {type: string}
          provenance: gap
          gap_note: >-
            FinalGUISpec.md:1788 names include_globs? on the canonical find_in_files shape but fixes no type
            or bound. JUDGMENT: list of glob strings; no canon limit on item count or length.
        exclude_globs:
          type: list
          required: false
          default: none
          item: {type: string}
          provenance: gap
          gap_note: >-
            FinalGUISpec.md:1788 names exclude_globs? on the canonical find_in_files shape but fixes no type
            or bound. JUDGMENT: list of glob strings; no canon limit on item count or length.
        regex:
          type: boolean
          required: false
          default: none
          provenance: gap
          gap_note: >-
            FinalGUISpec.md:1788 names regex? and the taxonomy line fixes regex/case/whole-word toggles
            (FinalGUISpec.md:1789), but no canon types the toggle argument. JUDGMENT: boolean; alternative:
            an on|off toggle event.
        case_sensitive:
          type: boolean
          required: false
          default: none
          provenance: gap
          gap_note: >-
            FinalGUISpec.md:1788 names case_sensitive? and the taxonomy line fixes the case toggle
            (FinalGUISpec.md:1789), but no canon types the argument. JUDGMENT: boolean; alternative: an
            on|off toggle event.
        whole_word:
          type: boolean
          required: false
          default: none
          provenance: gap
          gap_note: >-
            FinalGUISpec.md:1788 names whole_word? and the taxonomy line fixes the whole-word toggle
            (FinalGUISpec.md:1789), but no canon types the argument. JUDGMENT: boolean; alternative: an
            on|off toggle event.
        scope:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:1168 carries scope?, and the standalone cmd.search.set_scope (registered in
            the Search panel completion rows, UI_Command_Catalog.md:12175) keeps "the scope argument on
            find_in_files unchanged", but no canon types the scope arg or its values; set_scope's own values
            are undefined too. JUDGMENT: opaque string placeholder; alternatives: an enum of scope kinds or an
            object of include/exclude filters, once the Search owner types it.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchQuerySessionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]                # judgment: search index unavailable or degraded
      aliases: []
    - command_id: cmd.search.replace_in_files
      ucc_units: [UCC-087, UCC-088]
      command_kind: domain_action                      # judgment: runs the owner replace preview or apply flow; no catalog kind cell states one
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1169 row args { project_id, query?, replacement?, scope? }; UCC-230 envelope common optional project_id made required by the row"
        query:
          type: string
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1169 marks query? optional; the panel reruns against the preserved query session"
        replacement:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row and the UCC-084..UCC-088 row-group identity name replacement? but no canon types it or
            bounds its length. JUDGMENT: string, the literal replacement text.
        mode:
          type: enum
          required: false
          default: none
          values: [preview, apply]
          provenance: gap
          gap_note: >-
            The row runs "replace preview or apply flow" (UI_Command_Catalog.md:1169) but names no argument
            that selects preview versus apply. JUDGMENT: enum preview|apply; alternative: two flows keyed on
            confirmation_ref presence.
        scope:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Same gap as cmd.search.find_in_files.scope: the row carries scope? (UI_Command_Catalog.md:1169)
            and no canon types its values; cmd.search.set_scope's values are undefined too.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchReplaceApplyResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]        # judgment: UCC-088 requires Search-owner validation of the current result snapshot before replacement
      aliases: []
    - command_id: cmd.search.open_result
      ucc_units: [UCC-087, UCC-088]
      command_kind: navigation_wrapper                 # judgment: opens a result through route_target and the canonical file-open path (UI_Command_Catalog.md:1170); no catalog kind cell states one
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1170 row args { project_id, query_session_id, subject_id, disposition? }; UCC-230 envelope common optional project_id made required by the row"
        query_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1170; UCC-230 envelope common optional query_session_id (type id) made required by the row; UCC-087 preserved_exact_token query_session_id"
        subject_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1170; UCC-087 preserved_exact_token subject_id; type id per the UCC-230 identity_typing convention for _id fields"
        disposition:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row carries disposition? and the rules preserve "open-disposition / reuse policy through
            disposition? and route/open owner resolution" (UI_Command_Catalog.md:1180), but no canon types
            the values; they are owned by route/open owner resolution under
            Plans/Orchestrator_Page.md#search-routing-and-action-policy. JUDGMENT: opaque string placeholder;
            alternative: an enum once the route/open owner publishes closed values.
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1170 \"Open a Search result through route_target\" and the rule \"Search command routing resolves through route_target\" (UI_Command_Catalog.md:1179); restates the UCC-230 common optional route_target without changing its canonical contract type. The row's arg list does not mark it required, so the handler may derive the route from the session subject."
        result_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            FinalGUISpec.md:1788 says cmd.search.open_result carries result_ref that opens the file/location
            through the canonical open-file contract, while the catalog row (UI_Command_Catalog.md:1170)
            identifies the result by query_session_id + subject_id. The relation between the two identities
            is stated nowhere. JUDGMENT: optional ref carried alongside; alternative: drop it once the Search
            owner types result identity.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]        # judgment: the preserved query session's result snapshot no longer current
      aliases: []
    - command_id: cmd.search.replace_selected
      ucc_units: [UCC-087, UCC-088]
      command_kind: domain_action                      # judgment: applies one replacement through the owner; no catalog kind cell states one
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1171 row args { project_id, query_session_id, subject_id }; UCC-230 envelope common optional project_id made required by the row"
        query_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1171; UCC-230 envelope common optional query_session_id (type id) made required by the row"
        subject_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1171 \"one selected result identified by canonical subject identity\"; type id per the UCC-230 identity_typing convention"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchReplaceApplyResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]        # judgment: UCC-088 snapshot validation gates the mutation
      aliases: []
    - command_id: cmd.search.replace_all
      ucc_units: [UCC-087, UCC-088]
      command_kind: domain_action                      # judgment: applies the replacement across the session; no catalog kind cell states one
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1172 row args { project_id, query_session_id, replacement }; UCC-088 \"project_id scopes dispatch in the canonical table row\""
        query_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1172; UCC-088 preserved_exact_token cmd.search.replace_all { query_session_id, replacement } is the required query-session payload core"
        replacement:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row and the UCC-088 payload core require replacement but no canon types it or bounds its
            length. JUDGMENT: string, the literal replacement text.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchReplaceApplyResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]        # judgment: the row applies "after the Search owner validates the current result snapshot and mutation path" (UI_Command_Catalog.md:1172)
      aliases: []
    - command_id: cmd.search.rebuild_index
      ucc_units: [UCC-087]
      command_kind: domain_action                      # judgment: triggers the Search-owned index rebuild; no catalog kind cell states one
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1173 row args { project_id }; UCC-230 envelope common optional project_id made required by the row"
        index_scope:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The UCC-084..UCC-088 row-group optional identity names index_scope? (UCC-230 row_groups), but no
            catalog row or FinalGUISpec prose types its values. JUDGMENT: opaque string placeholder;
            alternatives: an enum of index kinds once the Search owner fixes them, or omitting the arg.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchIndexRebuildResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]                # judgment: index subsystem unavailable or degraded
      aliases: []
    - command_id: cmd.search.evict_remote_cache
      ucc_units: [UCC-087]
      command_kind: domain_action                      # judgment: opens confirmed remote cache eviction; no catalog kind cell states one
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1174 row args { project_id, remote_cache_id? }; UCC-230 envelope common optional project_id made required by the row"
        remote_cache_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1174; UCC-087 preserved_exact_token remote_cache_id?; type id per the UCC-230 identity_typing convention. The row does not state what absence selects; the eviction stays subject to the FinalGUISpec indexing settings copy it must not bypass"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchCacheEvictionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, degraded]   # judgment: remote cache unreachable, or the eviction path degraded
      aliases: []
  results:
    SearchQuerySessionResultV1:
      fields:
        query_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the preserved query session the results belong to; name canon (UCC-087 preserved_exact_token), result shape typed nowhere"}
        result_count: {type: integer, required: false, default: none, provenance: gap, gap_note: "no canon types the result summary; count chosen as the minimal projection"}
    SearchReplaceApplyResultV1:
      fields:
        applied_count: {type: integer, required: false, default: none, provenance: gap, gap_note: "no canon types the replace outcome; count chosen for preview and apply alike"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt when the replacement records one; presence unstated"}
    SearchIndexRebuildResultV1:
      fields:
        rebuild_run_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "no canon names a rebuild run record"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt when the rebuild records one"}
    SearchCacheEvictionResultV1:
      fields:
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "confirmed eviction receipt; the row says the flow is confirmed but names no record"}
        evicted_cache_id: {type: id, required: false, default: none, provenance: gap, gap_note: "the cache evicted when the request named one; shape unstated"}
```

### F3-717 - Notifications And Sounds Command Payload Definitions

```yaml
plan_unit_id: F3-717
unit_type: command_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Typed payload definitions (DL-333) for the fourteen notifications and sounds commands that UI_Command_Catalog
  UCC-103 registers and UCC-230 routes to this doc: destination create, update, delete, toggle and test,
  mapping update, runtime override set, and sound preview, upload, pack import, asset delete, asset restore,
  asset export and mapping set. Destination create/update payloads carry provider-specific profile fields from
  CV-298 for Slack, Discord, generic webhook, ntfy, Pushover and Telegram while storing only credential refs
  for secrets; destination test requires explicit user action, enabled destination authority, rate limiting,
  masking and receipt recording; sound preview is local only and must not send external notifications. The
  definitions block below gives each command its args, owner request and owner result in
  pm.command_payload_definitions.v1, with error and disabled-reason codes narrowed from the overlay's closed
  sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Notifications & Sounds settings commands.
depends_on: [UCC-230, UCC-103, CV-298, F3-405, CV-333, DL-333]
unblocks: []
acceptance_criteria:
  - Every command UCC-230 routes to F3-717 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - Destination create/update accept provider-typed profiles through CV-298 without exposing raw URLs or tokens; test-send stays separate from local preview and never mutates alert state (UCC-103).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.notifications.destination.create, cmd.notifications.destination.update, cmd.notifications.destination.delete, cmd.notifications.destination.toggle, cmd.notifications.destination.test, cmd.notifications.mapping.update, cmd.notifications.override.set, cmd.sound.preview, cmd.sound.upload, cmd.sound.pack.import, cmd.sound.asset.delete, cmd.sound.asset.restore, cmd.sound.asset.export, cmd.sound.mapping.set]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token, including the retired non-alias cmd.settings.open_notifications.
  - Do not route local sound preview through external notification delivery, and do not make test-send implicit from saving settings (UCC-103).
  - Do not carry raw secrets, webhook URLs or tokens in any arg; secrets travel only as credential refs (CV-298).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: F3-717
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  # Shared conventions for this block:
  # - UCC-103 registers these ids in its fenced unit only; no catalog command table or registration
  #   table states command_kind, args or disabled_reason_codes for them. Kinds follow the UCC-103
  #   canonical_text (domain controls), and disabled subsets are judgment from the closed set.
  # - Provider-typed destination profile fields are typed by CV-298
  #   (Plans/Contracts_V0.md#CV-298), referenced as a contract; this block does not restate them.
  # - notification_destination_id and sound_asset_id are the UCC-101..UCC-105 row-group optional
  #   identity fields, made required where the command's subject is one destination or asset.
  # - No wiring row of these commands names a request_schema_ref (Wiring_Matrix.production.json);
  #   owner_request is none throughout.
  definitions:
    - command_id: cmd.notifications.destination.create
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        provider:
          type: enum
          required: true
          default: none
          values: [slack, discord, generic_webhook, ntfy, pushover, telegram]
          provenance: gap
          gap_note: >-
            UCC-103 and CV-298 name the six providers (Slack, Discord, generic webhook, ntfy, Pushover,
            Telegram) and delivery receipts record a "provider kind", but no canon fixes snake_case enum
            tokens. JUDGMENT: lowercase snake_case of the canon names, generic_webhook for "generic webhook";
            the enum stays open to re-tokening by the Notifications owner.
        display_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            No canon PlanUnit types a destination label. The name and its required place come from the ledger
            readiness matrix destination_matrix (source lineage, notifications_sounds_readiness_matrix.json);
            JUDGMENT: required string with the generic text bound.
        profile:
          type: contract
          ref: Plans/Contracts_V0.md#CV-298
          required: true
          default: none
          provenance: canon
          source: "UCC-103 \"Destination create/update payloads carry provider-specific profile fields from CV-298 ... while storing only credential refs for secrets\"; typed by the CV-298 provider-typed destination profiles (credential_ref, channel_ref, mrkdwn_mode, mention_policy, rate_limit_profile; webhook_credential_ref, thread_id, allowed_mentions; url_credential_ref, method, static_header_refs, body_template_ref, timeout, success_predicate; server_ref, topic_ref, priority, tags, click_action_policy; app_token_ref, user_key_ref, device, sound, retry/expire policy; bot_token_ref, chat_id_ref, message_thread_id, parse_mode, disable_notification)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:NotificationDestinationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required]   # judgment: delivery subsystem not configured; settings write permission
      aliases: []
    - command_id: cmd.notifications.destination.update
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        notification_destination_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity notification_destination_id?, made mandatory by the command subject (one destination); type id per identity_typing"
        profile:
          type: contract
          ref: Plans/Contracts_V0.md#CV-298
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UCC-103 routes create and update through the same CV-298 profile fields, but partial versus full
            replacement semantics are stated nowhere. JUDGMENT: optional contract payload; absent leaves the
            stored profile unchanged.
        display_name:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "same label gap as cmd.notifications.destination.create.display_name; optional here because the update may leave the label unchanged"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:NotificationDestinationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required]   # judgment: as create
      aliases: []
    - command_id: cmd.notifications.destination.delete
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        notification_destination_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity notification_destination_id?, made mandatory by the command subject; type id per identity_typing"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:NotificationDestinationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [permission_required]   # judgment: destructive settings write
      aliases: []
    - command_id: cmd.notifications.destination.toggle
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        notification_destination_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity notification_destination_id?, made mandatory by the command subject; type id per identity_typing"
        enabled:
          type: boolean
          required: true
          default: none
          provenance: gap
          gap_note: >-
            UCC-103 names only "toggle" and F3-405 shows a destination list with status; whether the command
            is a bare toggle or carries the target state is unstated. JUDGMENT: required boolean carrying the
            target enabled state; alternative: a bare toggle event with no arg.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:NotificationDestinationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: destination store not configured
      aliases: []
    - command_id: cmd.notifications.destination.test
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        notification_destination_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity notification_destination_id?, made mandatory by the command subject; type id per identity_typing"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:NotificationTestSendResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, permission_required]   # judgment: enabled destination authority (unauthorized), delivery not configured, explicit-action permission; test never mutates alert state (UCC-103)
      aliases: []
    - command_id: cmd.notifications.mapping.update
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        entries:
          type: list
          required: true
          default: none
          item:
            type: object
            fields:
              event_category:
                type: enum
                required: true
                default: none
                values: [run_blocked, approval_required, human_input_requested, run_failed, run_completed, goal_blocked, provider_attention, system_error, security_attention, quiet_digest, test_send]
                provenance: canon
                source: "CV-298 acceptance criterion fixes the canonical event families and categories; F3-405 preserved_exact_token event_category and \"canonical event categories\""
              notification_destination_ids:
                type: list
                required: false
                default: none
                item: {type: id}
                provenance: gap
                gap_note: "routing targets of one matrix row; the matrix shape itself is the gap below"
              sound_asset_id:
                type: id
                required: false
                default: none
                provenance: gap
                gap_note: >-
                  F3-405 puts canonical event categories and default sound mappings in one routing matrix,
                  but whether this command also writes the sound column or only cmd.sound.mapping.set does is
                  unstated. JUDGMENT: optional here.
          provenance: gap
          gap_note: >-
            F3-405 fixes the per-event routing matrix over canonical event categories and default sound
            mappings, and UCC-103 registers only "notification mapping update"; the matrix row shape is
            defined nowhere. JUDGMENT: list of rows keyed by event_category carrying destination ids and an
            optional sound.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:NotificationMappingUpdateResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: delivery subsystem not configured
      aliases: []
    - command_id: cmd.notifications.override.set
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "F3-405 acceptance criterion \"global/project overrides\"; restates the UCC-230 envelope common optional project_id (type id): absent applies the global override, present the project override"
        override_kind:
          type: enum
          required: true
          default: none
          values: [quiet, focus]
          provenance: gap
          gap_note: >-
            UCC-103 registers only "runtime override set"; F3-405 names the subject as quiet/focus behavior
            but no payload. JUDGMENT: enum quiet|focus from the F3-405 words; alternative: one boolean mute
            override.
        enabled:
          type: boolean
          required: true
          default: none
          provenance: gap
          gap_note: "same unstated payload; JUDGMENT: required boolean carrying the target override state"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:NotificationOverrideSetResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: delivery subsystem not configured
      aliases: []
    - command_id: cmd.sound.preview
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        sound_asset_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The UCC-101..UCC-105 row-group identity names sound_asset_id?, and F3-405 says "Preview starts
            the selected available audio only after an explicit user gesture", but whether preview takes the
            asset id or plays the current library selection is unstated. JUDGMENT: optional id; absent plays
            the currently selected entry.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SoundPlaybackResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]   # judgment: missing audio support, unavailable or undecodable asset (F3-405 hides or labels the controls); preview is local only and never delivers
      aliases: []
    - command_id: cmd.sound.upload
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        source_path:
          type: path
          required: true
          default: none
          provenance: gap
          gap_note: >-
            No canon types the upload input. JUDGMENT: FileSafe-normalized path of the sound file to import;
            alternatives: a ref to an import staging record. Format limits are likewise unstated (F3-405
            separates bundled licensed recordings from session-only user files).
        display_name:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "library label for the uploaded asset; unstated, JUDGMENT: optional display name, absent keeps the file name"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SoundAssetMutationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [permission_required]   # judgment: sound library write
      aliases: []
    - command_id: cmd.sound.pack.import
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        pack_source:
          type: path
          required: true
          default: none
          provenance: gap
          gap_note: >-
            F3-405 admits PeonPing/OpenPeon-compatible imported packs but types no pack source. JUDGMENT:
            FileSafe-normalized path of the pack archive; alternatives: a ref to an import staging record.
        licensing_acknowledged:
          type: boolean
          required: true
          default: none
          provenance: gap
          gap_note: >-
            F3-405 admits packs "only after compatibility and licensing checks" and forbids bundling
            PeonPing-style voice packs until license verification permits it, but no arg types the
            acknowledgement. JUDGMENT: required boolean set by the explicit acknowledgement control.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SoundPackImportResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, permission_required]   # judgment: compatibility/licensing acknowledgement missing (blocked until given); library write permission
      aliases: []
    - command_id: cmd.sound.asset.delete
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        sound_asset_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity sound_asset_id?, made mandatory by the command subject; type id per identity_typing. UCC-103 distinguishes user-uploaded assets, imported packs and built-ins in delete behavior"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SoundAssetMutationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [permission_required]   # judgment: destructive library write
      aliases: []
    - command_id: cmd.sound.asset.restore
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        sound_asset_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity sound_asset_id?, made mandatory by the command subject; type id per identity_typing. UCC-103 pairs hide/disable with restore"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SoundAssetMutationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [permission_required]   # judgment: library write
      aliases: []
    - command_id: cmd.sound.asset.export
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        sound_asset_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity sound_asset_id?, made mandatory by the command subject; type id per identity_typing"
        destination:
          type: path
          required: false
          default: none
          provenance: gap
          gap_note: >-
            No canon types the export destination. JUDGMENT: optional FileSafe-normalized path the export
            writes; alternatives: a ref to an export record, or absent meaning a Save As picker.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SoundAssetExportResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [permission_required]   # judgment: library read with a file write
      aliases: []
    - command_id: cmd.sound.mapping.set
      ucc_units: [UCC-103]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        entries:
          type: list
          required: true
          default: none
          item:
            type: object
            fields:
              event_category:
                type: enum
                required: true
                default: none
                values: [run_blocked, approval_required, human_input_requested, run_failed, run_completed, goal_blocked, provider_attention, system_error, security_attention, quiet_digest, test_send]
                provenance: canon
                source: "CV-298 acceptance criterion fixes the canonical event families and categories; F3-405 preserved_exact_tokens event_category and default sound mappings"
              sound_asset_id:
                type: id
                required: true
                default: none
                provenance: gap
                gap_note: "the asset one mapping row selects; the row shape itself is the gap below"
          provenance: gap
          gap_note: >-
            F3-405 fixes default sound mappings per canonical event category, and UCC-103 registers only
            "mapping set"; the event-to-sound row shape is defined nowhere. JUDGMENT: list of rows keyed by
            event_category selecting one asset each; alternatives: per-row enable/disable or built-in
            sentinel values.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SoundMappingSetResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]   # judgment: sound library not configured
      aliases: []
  results:
    NotificationDestinationResultV1:
      fields:
        notification_destination_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the destination the mutation applied to; name canon (row-group identity), result shape typed nowhere"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt; test-send receipts are the CV-298 NotificationDeliveryAttemptReceipt, mutation receipts unstated"}
    NotificationTestSendResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the CV-298 delivery receipt: provider kind, destination id, event id, event category, status class, HTTP status, digests, idempotency key"}
        status_class: {type: string, required: true, default: none, provenance: gap, gap_note: "receipt status class; CV-298 names the field, no enum values are fixed"}
    NotificationMappingUpdateResultV1:
      fields:
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt for the matrix write"}
    NotificationOverrideSetResultV1:
      fields:
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt for the override write"}
    SoundPlaybackResultV1:
      fields:
        playback_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "playback started after the explicit gesture; F3-404/F3-405 make the playing indicator follow actual playback, no record is named"}
    SoundAssetMutationResultV1:
      fields:
        sound_asset_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the asset mutated; name canon (row-group identity), result shape typed nowhere"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt for the library write"}
    SoundPackImportResultV1:
      fields:
        imported_asset_ids: {type: list, required: false, default: none, item: {type: id}, provenance: gap, gap_note: "assets created by the import; count and identity unstated"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt for the import"}
    SoundAssetExportResultV1:
      fields:
        export_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the export record or written artifact; unstated"}
    SoundMappingSetResultV1:
      fields:
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt for the mapping write"}
```

### F3-718 - Teacher Guided GUI Command Payload Definitions

```yaml
plan_unit_id: F3-718
unit_type: command_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Typed payload definitions (DL-333) for the nine Teacher guided GUI commands that UI_Command_Catalog UCC-102
  registers in the Teacher guided GUI command rows and UCC-230 routes to this doc: open_from_help,
  continue_in_teacher, guide.open_route, guide.focus, guide.highlight, guide.scroll_to, guide.inspect,
  explain_current_ui and guide.do_it. Mutations require confirmation, permission gates and activity
  transparency; guided steps never keep stepping through a stale or missing UI target. Following DL-127,
  typing /teach opens the Teach popup through cmd.chat.teach.capture and is not a Teacher launch; the Teacher
  keeps the help-icon launch and CS-053's intent-classified natural-language route, so no cmd.teacher.*
  command owns /teach. The definitions block below gives each command its args, owner request and owner
  result in pm.command_payload_definitions.v1, with error and disabled-reason codes narrowed from the
  overlay's closed sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Teacher guided GUI commands.
depends_on: [UCC-230, UCC-102, DL-127, F3-403, CV-333, DL-333]
unblocks: []
acceptance_criteria:
  - Every command UCC-230 routes to F3-718 has exactly one definition in the block below.
  - Every command_kind equals the catalog's Teacher guided GUI command rows (UI_Command_Catalog.md:21303-21311).
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - guide.do_it runs only explicitly safe actions through their stable commands, with confirmation and permission gates; a mutation always needs confirmation (UCC-102).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "DL-333 coordinator resolution 9a/9b: the Teacher guided GUI command family is concrete in the Teacher guided GUI command rows; /teach stays the Teach popup (DL-127)"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.teacher.open_from_help, cmd.teacher.continue_in_teacher, cmd.teacher.guide.open_route, cmd.teacher.guide.focus, cmd.teacher.guide.highlight, cmd.teacher.guide.scroll_to, cmd.teacher.guide.inspect, cmd.teacher.explain_current_ui, cmd.teacher.guide.do_it]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token; cmd.chat.teach.capture is the Teach popup command (DL-127) and is not defined here.
  - Do not let guided GUI actions bypass Permissions_System requested/effective disclosure, and do not run mutating actions through guide.do_it without confirmation (UCC-102).
  - Do not use raw cursor/click automation or panel-local route fields where the route/open contract provides canonical targets (UCC-102, F3-403).
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/assistant-chat-design.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: F3-718
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  # Shared conventions for this block:
  # - command_kind for every command equals the Teacher guided GUI command rows table
  #   (UI_Command_Catalog.md:21303-21311), the only catalog table that states kinds here.
  # - teach_session_id is the UCC-101..UCC-105 row-group optional identity, made required on
  #   guide.* steps by their teacher_guidance_active precondition.
  # - Degraded-state disabled codes are judgment from the UCC-102/F3-403 degraded list (target
  #   surface unavailable, route/control no longer exists, context stale, permission blocked,
  #   capability unavailable, model fallback/clamp).
  # - No wiring row of these commands names a request_schema_ref (Wiring_Matrix.production.json);
  #   owner_request is none throughout.
  definitions:
    - command_id: cmd.teacher.open_from_help
      ucc_units: [UCC-102]
      command_kind: domain_action                 # canon: UI_Command_Catalog.md:21303
      response_kind: owner_operation
      args:
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: canon
          source: "Row \"Opens a new Teacher thread from a help icon with the current surface and control context\" (UI_Command_Catalog.md:21303); UCC-102 \"Do not use stale or private panel-local route fields when the route/open contract provides canonical targets\" and \"Do not launch Teacher without preserving current surface/control context\"; restates the UCC-230 common optional route_target narrowed to required, canonical contract type kept"
        control_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row launches with "the current surface and control context" but no canon names a control
            identity field. JUDGMENT: optional ref to the originating control; alternative: the UCC-230
            common optional selection_ref.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:TeacherThreadLaunchResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded, partial_capability, permission_required]   # judgment: model fallback/clamp, capability unavailable, permission blocked (UCC-102 degraded states)
      aliases: []
    - command_id: cmd.teacher.continue_in_teacher
      ucc_units: [UCC-102]
      command_kind: domain_action                 # canon: UI_Command_Catalog.md:21304
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "Row \"Hands an intent-classified natural-language request off into a new or selected Teacher thread\" (UI_Command_Catalog.md:21304); UCC-230 envelope common optional thread_id (type id); absent means a new Teacher thread"
        intent_request_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            CS-053 resolves the summon phrase and "carries current-surface context into a new or selected
            Teacher thread", but no canon names the intent-classified request identity. JUDGMENT: required
            ref to the classified request record.
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: false
          default: none
          provenance: canon
          source: "Row \"with the current surface context\" (UI_Command_Catalog.md:21304) and CS-053 current-surface context; restates the UCC-230 common optional route_target without changing its canonical contract type"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:TeacherThreadLaunchResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded, partial_capability]   # judgment: model fallback/clamp, capability unavailable (UCC-102 degraded states)
      aliases: []
    - command_id: cmd.teacher.guide.open_route
      ucc_units: [UCC-102]
      command_kind: navigation_wrapper            # canon: UI_Command_Catalog.md:21305
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21305): a guided step runs inside an active guidance session; type id per identity_typing"
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: canon
          source: "Row \"Guided step: opens a canonical route target to show the user where something is\" with precondition route_target_resolvable (UI_Command_Catalog.md:21305); restates the UCC-230 common optional route_target narrowed to required, canonical contract type kept"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]   # judgment: route/control no longer exists, context stale (UCC-102 degraded states)
      aliases: []
    - command_id: cmd.teacher.guide.focus
      ucc_units: [UCC-102]
      command_kind: shell_view                    # canon: UI_Command_Catalog.md:21306
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21306); type id per identity_typing"
        target:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "focuses a tab or panel" (UI_Command_Catalog.md:21306) names no target field.
            JUDGMENT: id of the canonical tab or panel; alternative: route_target through the route/open
            contract.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]   # judgment: target surface unavailable / control no longer exists (UCC-102, F3-403)
      aliases: []
    - command_id: cmd.teacher.guide.highlight
      ucc_units: [UCC-102]
      command_kind: shell_view                    # canon: UI_Command_Catalog.md:21307
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21307); type id per identity_typing"
        target:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "spotlights or outlines a control or region" (UI_Command_Catalog.md:21307) names no
            target field. JUDGMENT: id of the control or region; alternative: route_target for region-level
            targets.
        caption:
          type: string
          required: false
          default: none
          constraints: {max_length: 256}
          provenance: gap
          gap_note: >-
            F3-403 fixes the anchored caption presentation and UCC-102 preserves "anchored caption", but no
            arg names the caption text. JUDGMENT: optional string; the caption must not cover the target
            (F3-403). Alternative: caption text owned by the guidance step record, not the command.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]   # judgment: stale or missing UI target (UCC-102: do not keep stepping through it)
      aliases: []
    - command_id: cmd.teacher.guide.scroll_to
      ucc_units: [UCC-102]
      command_kind: shell_view                    # canon: UI_Command_Catalog.md:21308
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21308); type id per identity_typing"
        target:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "scrolls to a section or field" (UI_Command_Catalog.md:21308) names no target field.
            JUDGMENT: id of the section or field target; alternative: an anchor ref resolved by the surface.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]   # judgment: stale or missing UI target (UCC-102)
      aliases: []
    - command_id: cmd.teacher.guide.inspect
      ucc_units: [UCC-102]
      command_kind: shell_view                    # canon: UI_Command_Catalog.md:21309
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21309); type id per identity_typing"
        target:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "expands non-mutating details or previews a selection, read-only"
            (UI_Command_Catalog.md:21309) names no target field. JUDGMENT: id of the detail target;
            alternative: the UCC-230 common optional selection_ref for the preview-selection case.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]   # judgment: selection lost / stale target (UCC-102 degraded states)
      aliases: []
    - command_id: cmd.teacher.explain_current_ui
      ucc_units: [UCC-102]
      command_kind: domain_action                 # canon: UI_Command_Catalog.md:21310
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "Row \"Asks Teacher to explain the current surface in the Teacher thread\" with precondition teacher_thread_available (UI_Command_Catalog.md:21310); UCC-230 envelope common optional thread_id (type id) made required by the row subject"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:TeacherExplanationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded, partial_capability]   # judgment: model fallback/clamp, capability unavailable, help entry missing (UCC-102 degraded states)
      aliases: []
    - command_id: cmd.teacher.guide.do_it
      ucc_units: [UCC-102]
      command_kind: domain_action                 # canon: UI_Command_Catalog.md:21311
      response_kind: owner_operation
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21311); type id per identity_typing"
        target_command_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "Runs an explicitly safe action for the user through its stable command after
            confirmation and permission gates" (UI_Command_Catalog.md:21311) names no field for that command
            and types no pass-through of its args. JUDGMENT: id of the target command; its args travel as
            that command's own payload after the safety gate, not as a typed field here.
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "Row precondition confirmation_given, \"a mutation always needs confirmation\" (UI_Command_Catalog.md:21311); restates the UCC-230 envelope common optional confirmation_ref (type ref) narrowed to required"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:TeacherDoItResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [permission_required, blocked_state_required, stale_projection]   # judgment: permission gates; confirmation not yet given; stale or missing UI target (UCC-102)
      aliases: []
  results:
    TeacherThreadLaunchResultV1:
      fields:
        thread_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the new or selected Teacher thread; UCC-102/F3-403 fix the thread model, no launch result is typed"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt for the launch"}
    TeacherExplanationResultV1:
      fields:
        reply_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the Teacher reply explaining the current surface; no canon types the reply identity"}
        thread_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the Teacher thread that answered"}
    TeacherDoItResultV1:
      fields:
        target_command_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the stable command that ran"}
        result_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "the target command's own result, carried by reference; shape owned by that command"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt for the executed action"}
```
