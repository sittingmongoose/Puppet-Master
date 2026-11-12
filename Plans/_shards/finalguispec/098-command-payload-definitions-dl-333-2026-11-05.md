# Shard 098: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/FinalGUISpec.md`

Source lines: L50394-L52975

Source SHA256: `3e2813cc949145f5b8cc7f56399a0d6d1444558b9587c83fe6f3a0863f4555e7`

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
  Shared conventions of the definitions block: its row cites are the Search Command Catalog table
  (UI_Command_Catalog.md:1167-1174), whose Parameters column is history under DL-333 resolution 10 and stays
  the command-row authority for names. FinalGUISpec.md:1788-1789 is the owner-doc canon for the canonical GUI
  shell shapes and the search-domain taxonomy (find/replace, regex/case/whole-word toggles, include/exclude
  scope); where it disagrees with the catalog rows, the definition cites both in a gap_note. No wiring row of
  these commands (Wiring_Matrix.production.json entries catalog.search_*) names a request_schema_ref or
  result_schema_ref, so owner_request is none throughout. No catalog row or registration table states
  command_kind or disabled reasons for these eight (the Search panel completion rows,
  UI_Command_Catalog.md:12639-12644, cover other ids), so each definition records both in its judgments.
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
  definitions:
    - command_id: cmd.search.show
      ucc_units: [UCC-087]
      command_kind: shell_view
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
      disabled_reason_codes: [degraded]
      aliases: []
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: >-
            No catalog kind cell states one for this row; the row "Reveal or focus the Search side panel"
            (UI_Command_Catalog.md:1167) changes only what the shell shows.
        - key: disabled_reason_codes
          choice: [degraded]
          gap_note: >-
            No row states disabled reasons; degraded stands for the Search panel subsystem being degraded.
    - command_id: cmd.search.find_in_files
      ucc_units: [UCC-087, UCC-088, UCC-099]
      command_kind: domain_action
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
          provenance: gap
          gap_note: >-
            Canon conflict: UI_Command_Catalog.md:1168 has query? (optional; the row runs "or reruns"
            find-in-files), while FinalGUISpec.md:1788's canonical shape { project_id, query, include_globs?,
            ... } makes it required. The definition takes the catalog row (optional, so one shape admits a
            rerun) and leaves the reconciliation to the Search owner; no canon bounds its length.
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
            UI_Command_Catalog.md:1168 carries scope?, and the Cozy Shelves reconciliation keeps it
            ("scope argument retained", UI_Command_Catalog.md:12474; "find_in_files scope arg unchanged",
            :12478) beside the standalone cmd.search.set_scope (:12641), but no canon types the scope arg or
            its values, and set_scope's row gives none either. JUDGMENT: opaque string placeholder;
            alternatives: an enum of scope kinds or an object of include/exclude filters, once the Search
            owner types it.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchQuerySessionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog kind cell states one; the row runs or reruns the owner search
            (UI_Command_Catalog.md:1168) and produces a query session the owner keeps.
        - key: disabled_reason_codes
          choice: [degraded]
          gap_note: >-
            No row states disabled reasons; degraded stands for an unavailable or degraded search index.
    - command_id: cmd.search.replace_in_files
      ucc_units: [UCC-087, UCC-088]
      command_kind: domain_action
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
          source: "UI_Command_Catalog.md:1169 marks query? optional; FinalGUISpec.md:1788 names cmd.search.replace_in_files as the canonical replace-in-files action without a shape"
        replacement:
          type: string
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row (UI_Command_Catalog.md:1169) and the UCC-084..UCC-088 row-group optional identity
            (UCC-230 row_groups; overlay cell UI_Command_Catalog.md:8857) name replacement? but no canon types
            it or bounds its length. JUDGMENT: string, the literal replacement text.
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
            and no canon types its values; cmd.search.set_scope's row (:12641) gives none either.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchReplaceApplyResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog kind cell states one; the row runs the owner replace preview or apply flow
            (UI_Command_Catalog.md:1169).
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: >-
            No row states disabled reasons; UCC-088 requires the Search owner to validate the current result
            snapshot and mutation path before replacement, so a stale snapshot disables it.
    - command_id: cmd.search.open_result
      ucc_units: [UCC-087, UCC-088]
      command_kind: navigation_wrapper
      response_kind: owner_operation
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
        where:
          type: string
          required: false
          default: auto
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23628-23629): where is auto, tab, panel, right, down or a panel id; default auto; an id that names no panel reads as auto. The open-routes table lists this route (UI_Command_Catalog.md:18322: \"its disposition? resolves to CV-360's placement fields\") and its wiring row catalog.search_open_result resolves it \"into the result's tab kind with CV-360's placement fields\"."
        mode:
          type: enum
          values: [preview, keep]
          required: false
          default: none
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23629-23630): mode is preview or keep, preview only for kinds with a preview tab; no default stated. Route listed at UI_Command_Catalog.md:18322."
        by:
          type: string
          required: false
          default: user
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23630): by is user or agent:<name>; default user; an agent always opens in the background. Route listed at UI_Command_Catalog.md:18322."
        background:
          type: boolean
          required: false
          default: false
          provenance: canon
          source: "CV-360 (Contracts_V0.md:23631): background default false. Route listed at UI_Command_Catalog.md:18322."
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1170 \"Open a Search result through route_target\" and the rule \"Search command routing resolves through route_target\" (UI_Command_Catalog.md:1179); restates the UCC-230 common optional route_target, still optional, without changing its canonical contract type"
        result_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Canon conflict: FinalGUISpec.md:1788 says cmd.search.open_result carries result_ref that opens
            the file/location through the canonical open-file contract, while the catalog row
            (UI_Command_Catalog.md:1170) identifies the result by query_session_id + subject_id. The relation
            between the two identities is stated nowhere. JUDGMENT: optional ref carried alongside;
            alternative: drop it once the Search owner types result identity.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchResultOpenResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            No catalog kind cell states one; the row opens a result through route_target and the canonical
            file-open path (UI_Command_Catalog.md:1170), and the open-routes table lists it
            (UI_Command_Catalog.md:18322).
        - key: response_kind
          choice: owner_operation
          gap_note: >-
            The wiring row catalog.search_open_result names no result_schema_ref, but CV-360
            (Contracts_V0.md:23631) says what every open returns; the definition carries that return as the
            owner result (local:SearchResultOpenResultV1) rather than a local projection with no result.
        - key: owner_result
          choice: local:SearchResultOpenResultV1
          gap_note: >-
            No typed contract holds CV-360's open return; the local result restates its five fields, and the
            fields whose presence on a refused open CV-360 does not state are gap.
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: >-
            No row states disabled reasons; stale_projection stands for the preserved query session's result
            snapshot no longer being current.
        - key: omitted:disposition
          choice: replaced by CV-360's where, mode, by and background
          gap_note: >-
            Canon conflict: the row's Parameters column (history under DL-333 resolution 10,
            UI_Command_Catalog.md:1170) and the Search rules (:1180, "open-disposition / reuse policy through
            disposition?") keep disposition?, and the open-routes table says it "resolves to CV-360's placement
            fields" (:18322), while CV-360's acceptance (Contracts_V0.md:23646) says no route carries another
            placement field. The definition follows CV-360 and carries the four placement fields instead; the
            owner should retire disposition? in the rules or say what it adds.
    - command_id: cmd.search.replace_selected
      ucc_units: [UCC-087, UCC-088]
      command_kind: domain_action
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
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog kind cell states one; the row applies one replacement through the owner
            (UI_Command_Catalog.md:1171).
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: >-
            No row states disabled reasons; UCC-088's snapshot validation gates the mutation, so a stale
            result snapshot disables it.
    - command_id: cmd.search.replace_all
      ucc_units: [UCC-087, UCC-088]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1172 row args { project_id, query_session_id, replacement }; UCC-088 \"project_id scopes dispatch in the canonical table row\" (UI_Command_Catalog.md:1181)"
        query_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1172; the rule \"cmd.search.replace_all { query_session_id, replacement } is the required query-session payload core\" (UI_Command_Catalog.md:1181)"
        replacement:
          type: string
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row and the UCC-088 payload core require replacement but no canon types it or bounds its
            length. JUDGMENT: string, the literal replacement text.
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Commands_System.md:4519-4522 gives cmd.search.replace_all an owner-assigned destructive
            confirmation class and dispatches it "only through the shared confirm surface", and the Cozy
            Shelves reconciliation calls it destructive (UI_Command_Catalog.md:12480), but no canon names the
            arg that carries the confirmation. JUDGMENT: the UCC-230 common optional confirmation_ref (type
            ref), narrowed to required; alternative: the confirm surface holds the confirmation and the
            command carries none.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchReplaceApplyResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog kind cell states one; the row applies the replacement across the preserved query
            session (UI_Command_Catalog.md:1172).
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: >-
            No row states disabled reasons; the row applies only "after the Search owner validates the current
            result snapshot and mutation path" (UI_Command_Catalog.md:1172), so a stale snapshot disables it.
    - command_id: cmd.search.rebuild_index
      ucc_units: [UCC-087]
      command_kind: domain_action
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
            The UCC-084..UCC-088 row-group optional identity names index_scope? (UCC-230 row_groups; overlay
            cell UI_Command_Catalog.md:8857), but no catalog row or FinalGUISpec prose types its values, and
            the row's own args are { project_id } only. JUDGMENT: opaque string placeholder; alternatives: an
            enum of index kinds once the Search owner fixes them, or omitting the arg.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchIndexRebuildResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog kind cell states one; the row triggers the Search-owned index rebuild
            (UI_Command_Catalog.md:1173).
        - key: disabled_reason_codes
          choice: [degraded]
          gap_note: >-
            No row states disabled reasons; degraded stands for the index subsystem being unavailable or
            degraded.
    - command_id: cmd.search.evict_remote_cache
      ucc_units: [UCC-087]
      command_kind: domain_action
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
          source: "UI_Command_Catalog.md:1174 remote_cache_id?; UCC-087 preserved_exact_token remote_cache_id?; type id per the UCC-230 identity_typing convention"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SearchCacheEvictionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, degraded]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            No catalog kind cell states one; the row opens confirmed remote cache eviction
            (UI_Command_Catalog.md:1174).
        - key: disabled_reason_codes
          choice: [unreachable, degraded]
          gap_note: >-
            No row states disabled reasons; unreachable stands for the remote cache being unreachable and
            degraded for the eviction path being degraded.
        - key: field:remote_cache_id
          choice: default none; the meaning of absence is left to the Search owner
          gap_note: >-
            The row (UI_Command_Catalog.md:1174) does not say what absence of remote_cache_id selects (every
            cache, the current one, or a picker); the eviction stays subject to the FinalGUISpec indexing
            settings copy it must not bypass. The definition sets default none and leaves the meaning to the
            Search owner.
  results:
    SearchQuerySessionResultV1:
      fields:
        query_session_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the preserved query session the results belong to; name canon (UCC-087 preserved_exact_token), result shape typed nowhere"}
        result_count: {type: integer, required: false, default: none, provenance: gap, gap_note: "no canon types the result summary; count chosen as the minimal projection"}
    SearchReplaceApplyResultV1:
      fields:
        applied_count: {type: integer, required: false, default: none, provenance: gap, gap_note: "no canon types the replace outcome; count chosen for preview and apply alike"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt when the replacement records one; presence unstated"}
    SearchResultOpenResultV1:
      fields:
        ok: {type: boolean, required: true, default: none, provenance: canon, source: "CV-360 (Contracts_V0.md:23631): an open returns { ok, panel_tab_id, panel_id, created, reason }; acceptance (:23652): a refused open returns ok false"}
        panel_tab_id: {type: id, required: false, default: none, provenance: gap, gap_note: "CV-360 (Contracts_V0.md:23631) names panel_tab_id as the panel tab id; it does not say whether a refused open carries it, so it is optional here"}
        panel_id: {type: id, required: false, default: none, provenance: gap, gap_note: "CV-360 (Contracts_V0.md:23631) names panel_id; it does not say whether a refused open carries it, so it is optional here"}
        created: {type: boolean, required: false, default: none, provenance: gap, gap_note: "CV-360 (Contracts_V0.md:23632): created is false when an open tab was revealed and true when a tab was added; its presence on a refused open is unstated, so it is optional here"}
        reason: {type: string, required: true, nullable: true, default: none, provenance: canon, source: "CV-360 (Contracts_V0.md:23632-23633): reason is null on success, else unknown_kind, not_ready or the route's own refusal (an open set of values, so string)"}
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
  Shared conventions of the definitions block: UCC-103 registers these ids in its fenced unit only and calls
  them "Domain commands"; no catalog command table or registration table states command_kind, args or
  disabled_reason_codes for them. CV-298 names the provider fields; CV-369 now types them through
  NotificationDestinationProfileV1 (DL-471), and the block does not restate them. Update's optional profile
  is a whole-profile replacement, never a field merge, validated against the stored immutable provider;
  absence leaves that profile unchanged. The provider cannot change through update: use a separately
  created destination and explicit routing changes. Both choices are decided by DL-471 Q-F2 and Q-F3. notification_destination_id and
  sound_asset_id are the UCC-101..UCC-105 row-group optional identity fields, made required where the
  command's subject is one destination or asset. No wiring row of these commands (Wiring_Matrix.production.json
  entries catalog.notifications_* and catalog.sound_*) names a request_schema_ref or result_schema_ref, so
  owner_request is none throughout.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Notifications & Sounds settings commands.
depends_on: [UCC-230, UCC-103, CV-298, CV-369, DL-471, F3-405, CV-333, DL-333]
unblocks: []
acceptance_criteria:
  - Every command UCC-230 routes to F3-717 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - Destination create/update accept CV-298 fields typed by CV-369/NotificationDestinationProfileV1 without exposing raw URLs or tokens; update replaces the complete supplied profile against the stored immutable provider (decided by DL-471 Q-F2/Q-F3); test-send stays separate from local preview and never mutates alert state (UCC-103).
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
  - "Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json (destination_matrix), which UCC-103 lists as source lineage: display_name is a required destination field for Slack webhook only"
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
            Telegram) and delivery receipts record a "provider kind", but no canon fixes enum tokens.
            JUDGMENT: lowercase snake_case of the canon names, generic_webhook for "generic webhook"; the enum
            stays open to re-tokening by the Notifications owner.
        display_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            No canon PlanUnit names a destination label; the name display_name comes from this unit's source
            lineage, which lists it as required for the Slack webhook destination only. JUDGMENT: required for
            all six providers, with the generic text bound; alternative: required for Slack only and optional
            elsewhere.
        profile:
          {type: contract, ref: Plans/Contracts_V0.md#CV-369/NotificationDestinationProfileV1, discriminator_source: {arg: provider}, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-F1 decided by the owner: one arg named profile, typed by CV-369''s NotificationDestinationProfileV1 and matching the selected provider.'}
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:NotificationDestinationResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists destination create among its "Domain commands" but no catalog row states a
            command_kind; it writes a destination record.
        - key: disabled_reason_codes
          choice: [not_configured, permission_required]
          gap_note: >-
            No canon states disabled reasons; not_configured stands for the delivery subsystem not being
            configured and permission_required for the settings write permission.
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
          {type: contract, ref: Plans/Contracts_V0.md#CV-369/NotificationDestinationProfileV1, discriminator_source: {owner: stored_destination.provider}, required: false, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-F1, Q-F2, Q-F3 decided by the owner: optional CV-369/NotificationDestinationProfileV1; absent leaves the stored profile unchanged, present replaces it completely after validation against the stored immutable provider. provider is not an update arg and cannot change on this route.'}
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
      disabled_reason_codes: [not_configured, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists destination update among its "Domain commands" but no catalog row states a
            command_kind; it writes a destination record.
        - key: disabled_reason_codes
          choice: [not_configured, permission_required]
          gap_note: >-
            No canon states disabled reasons; the same choice as destination create.
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
      disabled_reason_codes: [permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists destination delete among its "Domain commands" but no catalog row states a
            command_kind; it removes a destination record.
        - key: disabled_reason_codes
          choice: [permission_required]
          gap_note: >-
            No canon states disabled reasons; permission_required stands for the destructive settings write.
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
      disabled_reason_codes: [not_configured]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists destination toggle among its "Domain commands" but no catalog row states a
            command_kind; it writes the destination's enabled state.
        - key: disabled_reason_codes
          choice: [not_configured]
          gap_note: >-
            No canon states disabled reasons; not_configured stands for the destination store not being
            configured.
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
      disabled_reason_codes: [not_configured, unauthorized, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists destination test among its "Domain commands" but no catalog row states a
            command_kind; it sends one external delivery and records a receipt.
        - key: disabled_reason_codes
          choice: [not_configured, unauthorized, permission_required]
          gap_note: >-
            No canon states disabled reasons. UCC-103 requires "explicit user action, enabled destination
            authority, rate limiting, masking, and receipt recording"; unauthorized stands for missing
            destination authority, not_configured for delivery not being configured, and permission_required
            for the explicit-action permission. Test-send never mutates alert state (UCC-103).
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
                type: string
                required: true
                default: none
                constraints: {min_length: 1, max_length: 128}
                provenance: gap
                gap_note: >-
                  The name is canon: F3-405 keys the routing matrix on canonical event categories
                  (FinalGUISpec.md:28463-28464; event_category is its preserved token) and CV-298 carries
                  event_category beside event_family (Contracts_V0.md:19256). The vocabulary is not. CV-298's
                  acceptance names eleven families and categories (Contracts_V0.md:19278: run_blocked,
                  approval_required, human_input_requested, run_failed, run_completed, goal_blocked,
                  provider_attention, system_error, security_attention, quiet_digest and test_send) without
                  saying which are category values or that they are the whole set. F3-405 puts the chat cues
                  (F3-564) and the onboarding and Guided Tour cues (F3-599) among the matrix's categories
                  (FinalGUISpec.md:28478-28479; F3-564 acceptance :40535; F3-599 acceptance :43309), and no
                  canon spells a token for either cue category; whether the notifications' own cue (F3-460) is
                  a mapping category is unstated (:28484-28485). So the field is an open string, not a closed
                  enum, and the 1..128 bounds are not canon.
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
      disabled_reason_codes: [not_configured]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists notification mapping update among its "Domain commands" but no catalog row states a
            command_kind; it writes the routing matrix.
        - key: disabled_reason_codes
          choice: [not_configured]
          gap_note: >-
            No canon states disabled reasons; not_configured stands for the delivery subsystem not being
            configured.
        - key: field:entries[].event_category
          choice: an open string naming one of the owner's current mapping categories; the owner checks it against its category list and refuses an unknown one with invalid_args
          gap_note: >-
            Canon spells eleven CV-298 event family and category names (Contracts_V0.md:19278) and no token
            for the chat cue category or the onboarding and Guided Tour cue category, which F3-405, F3-564
            and F3-599 require in this mapping (FinalGUISpec.md:28478-28479, :40535, :43309). A closed enum
            of the eleven would refuse those required mappings, and adding two spellings chosen here would
            publish category tokens canon has not named while leaving open whether F3-460's cue or a CV-298
            family name is a category. An open string keeps every required category mappable until the
            owner spells the vocabulary. cmd.sound.mapping.set takes the same choice.
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
          source: "F3-405 acceptance criterion \"global/project overrides\" (FinalGUISpec.md:28497); restates the UCC-230 envelope common optional project_id (type id), still optional"
        override_kind:
          type: enum
          required: true
          default: none
          values: [quiet, focus]
          provenance: gap
          gap_note: >-
            UCC-103 registers only "runtime override set"; F3-405 names the subject as quiet/focus behavior
            (FinalGUISpec.md:28456) but no payload. JUDGMENT: enum quiet|focus from the F3-405 words;
            alternative: one boolean mute override.
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
      disabled_reason_codes: [not_configured]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists runtime override set among its "Domain commands" but no catalog row states a
            command_kind; it writes an override.
        - key: disabled_reason_codes
          choice: [not_configured]
          gap_note: >-
            No canon states disabled reasons; not_configured stands for the delivery subsystem not being
            configured.
        - key: field:project_id
          choice: absent applies the global override, present the project override
          gap_note: >-
            F3-405's acceptance (FinalGUISpec.md:28497) says users configure "global/project overrides" but
            no canon says how one command selects between the two; reading project_id's presence is the
            definition's choice.
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
            asset id or plays the current library selection is unstated. F3-599 (FinalGUISpec.md:43323-43330,
            DL-153) also says each sound-library entry's Play dispatches cmd.sound.preview, and those entries
            are takes of each onboarding and Tour cue per kit and look, so an asset id may not identify a take;
            no canon names a take identity. F3-405 says "The same control stops playback"
            (FinalGUISpec.md:28469), and canon does not say whether a second cmd.sound.preview stops playback
            or another command does. JUDGMENT: optional id; absent plays the currently selected entry.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:SoundPlaybackResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists sound preview among its "Domain commands" but no catalog row states a command_kind;
            it starts local playback through the Notifications & Sounds player and never delivers externally
            (UCC-103).
        - key: disabled_reason_codes
          choice: [degraded]
          gap_note: >-
            No canon states disabled reasons; degraded stands for missing audio support or an unavailable or
            undecodable asset, for which F3-405 hides or labels the controls.
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
      disabled_reason_codes: [permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists sound upload among its "Domain commands" but no catalog row states a command_kind;
            it writes the sound library.
        - key: disabled_reason_codes
          choice: [permission_required]
          gap_note: >-
            No canon states disabled reasons; permission_required stands for the sound library write.
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
      disabled_reason_codes: [blocked_state_required, permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists pack import among its "Domain commands" but no catalog row states a command_kind;
            it adds assets to the sound library.
        - key: disabled_reason_codes
          choice: [blocked_state_required, permission_required]
          gap_note: >-
            No canon states disabled reasons; blocked_state_required stands for the compatibility and
            licensing checks F3-405 requires before a pack is admitted, and permission_required for the
            library write.
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
      disabled_reason_codes: [permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists asset delete among its "Domain commands" but no catalog row states a command_kind;
            it removes or hides a library asset.
        - key: disabled_reason_codes
          choice: [permission_required]
          gap_note: >-
            No canon states disabled reasons; permission_required stands for the destructive library write.
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
      disabled_reason_codes: [permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists asset restore among its "Domain commands" but no catalog row states a command_kind;
            it restores a hidden or disabled asset.
        - key: disabled_reason_codes
          choice: [permission_required]
          gap_note: >-
            No canon states disabled reasons; permission_required stands for the library write.
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
      disabled_reason_codes: [permission_required]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists asset export among its "Domain commands" but no catalog row states a command_kind;
            it writes an export file.
        - key: disabled_reason_codes
          choice: [permission_required]
          gap_note: >-
            No canon states disabled reasons; permission_required stands for the library read with a file
            write.
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
                type: string
                required: true
                default: none
                constraints: {min_length: 1, max_length: 128}
                provenance: gap
                gap_note: >-
                  The name is canon: F3-405 keys the routing matrix on canonical event categories
                  (FinalGUISpec.md:28463-28464; event_category is its preserved token) and CV-298 carries
                  event_category beside event_family (Contracts_V0.md:19256). The vocabulary is not. CV-298's
                  acceptance names eleven families and categories (Contracts_V0.md:19278: run_blocked,
                  approval_required, human_input_requested, run_failed, run_completed, goal_blocked,
                  provider_attention, system_error, security_attention, quiet_digest and test_send) without
                  saying which are category values or that they are the whole set. F3-405 puts the chat cues
                  (F3-564) and the onboarding and Guided Tour cues (F3-599) among the matrix's categories
                  (FinalGUISpec.md:28478-28479; F3-564 acceptance :40535; F3-599 acceptance :43309), and no
                  canon spells a token for either cue category; whether the notifications' own cue (F3-460) is
                  a mapping category is unstated (:28484-28485). So the field is an open string, not a closed
                  enum, and the 1..128 bounds are not canon.
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
      disabled_reason_codes: [not_configured]
      aliases: []
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            UCC-103 lists mapping set among its "Domain commands" but no catalog row states a command_kind;
            it writes the sound mapping.
        - key: disabled_reason_codes
          choice: [not_configured]
          gap_note: >-
            No canon states disabled reasons; not_configured stands for the sound library not being
            configured.
        - key: field:entries[].event_category
          choice: an open string naming one of the owner's current mapping categories; the owner checks it against its category list and refuses an unknown one with invalid_args
          gap_note: >-
            Canon spells eleven CV-298 event family and category names (Contracts_V0.md:19278) and no token
            for the chat cue category or the onboarding and Guided Tour cue category, which F3-405, F3-564
            and F3-599 require in this mapping (FinalGUISpec.md:28478-28479, :40535, :43309). A closed enum
            of the eleven would refuse those required mappings, and adding two spellings chosen here would
            publish category tokens canon has not named while leaving open whether F3-460's cue or a CV-298
            family name is a category. An open string keeps every required category mappable until the
            owner spells the vocabulary. cmd.notifications.mapping.update takes the same choice.
  results:
    NotificationDestinationResultV1:
      fields:
        notification_destination_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the destination the mutation applied to; name canon (row-group identity), result shape typed nowhere"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt; test-send receipts are the CV-298 NotificationDeliveryAttemptReceipt (Contracts_V0.md:19331), mutation receipts unstated"}
    NotificationTestSendResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the CV-298 delivery receipt (Contracts_V0.md:19265-19268 lists what it records); no typed contract holds it"}
        status_class: {type: string, required: true, default: none, provenance: gap, gap_note: "receipt status class; CV-298 names the field, no enum values are fixed"}
    NotificationMappingUpdateResultV1:
      fields:
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt for the matrix write"}
    NotificationOverrideSetResultV1:
      fields:
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt for the override write"}
    SoundPlaybackResultV1:
      fields:
        playback_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "playback started after the explicit gesture; F3-405 (FinalGUISpec.md:28468) makes the playing indicator follow actual playback, no record is named"}
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
  Shared conventions of the definitions block: command_kind for every command equals its row in the Teacher
  guided GUI command rows table (UI_Command_Catalog.md:21769-21777, one row per command in the order listed
  above), the only catalog table that states kinds here. teach_session_id is the UCC-101..UCC-105 row-group
  optional identity, made required on guide.* steps by their teacher_guidance_active precondition. UCC-102
  and F3-403 list the degraded states the disabled codes stand for (target surface unavailable, route or
  control no longer exists, context stale, permission blocked, capability unavailable, model fallback or
  clamp); the table states no disabled reasons. No wiring row of these commands (Wiring_Matrix.production.json
  entries catalog.teacher_*) names a request_schema_ref or result_schema_ref, so owner_request is none
  throughout.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Teacher guided GUI commands.
depends_on: [UCC-230, UCC-102, DL-127, F3-403, CV-333, DL-333]
unblocks: []
acceptance_criteria:
  - Every command UCC-230 routes to F3-718 has exactly one definition in the block below.
  - Every command_kind equals the catalog's Teacher guided GUI command rows (UI_Command_Catalog.md:21769-21777).
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
  definitions:
    - command_id: cmd.teacher.open_from_help
      ucc_units: [UCC-102]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "Opens a new Teacher thread from a help icon with the current surface and control
            context" (UI_Command_Catalog.md:21769) and UCC-102's negative constraints "Do not launch Teacher
            without preserving current surface context needed for useful help." (:7772) and "Do not lose the
            originating surface/control context during launch." (:7778) require the context, and "Do not use
            stale or private panel-local route fields when the route/open contract provides canonical
            targets." (:7776) points at the route/open contract, but no canon names the arg that carries the
            surface. JUDGMENT: the UCC-230 common optional route_target, canonical contract type kept, narrowed
            to required as the carrier of the current surface; the control part travels in control_ref.
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
      disabled_reason_codes: [degraded, partial_capability, permission_required]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [degraded, partial_capability, permission_required]
          gap_note: >-
            The row states only the precondition help_icon_visible (UI_Command_Catalog.md:21769) and no
            disabled reasons; degraded stands for model fallback or clamp, partial_capability for an
            unavailable capability and permission_required for a permission block (UCC-102 degraded states).
    - command_id: cmd.teacher.continue_in_teacher
      ucc_units: [UCC-102]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "Row \"Hands an intent-classified natural-language request off into a new or selected Teacher thread\" (UI_Command_Catalog.md:21770); UCC-230 envelope common optional thread_id (type id), still optional"
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
          source: "Row \"with the current surface context\" (UI_Command_Catalog.md:21770) and CS-053 current-surface context; restates the UCC-230 common optional route_target, still optional, without changing its canonical contract type"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:TeacherThreadLaunchResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded, partial_capability]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [degraded, partial_capability]
          gap_note: >-
            The row states only the precondition teach_intent_classified (UI_Command_Catalog.md:21770) and no
            disabled reasons; degraded stands for model fallback or clamp and partial_capability for an
            unavailable capability (UCC-102 degraded states).
        - key: field:thread_id
          choice: absent hands off into a new Teacher thread, present into the selected one
          gap_note: >-
            The row says "a new or selected Teacher thread" (UI_Command_Catalog.md:21770) but not how the
            command chooses; reading thread_id's presence is the definition's choice.
    - command_id: cmd.teacher.guide.open_route
      ucc_units: [UCC-102]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21771): a guided step runs inside an active guidance session; type id per identity_typing"
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: canon
          source: "Row \"Guided step: opens a canonical route target to show the user where something is\" with precondition route_target_resolvable (UI_Command_Catalog.md:21771); restates the UCC-230 common optional route_target narrowed to required, canonical contract type kept"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: >-
            The row states preconditions (teacher_guidance_active && route_target_resolvable,
            UI_Command_Catalog.md:21771) but no disabled reasons; stale_projection stands for a route or
            control that no longer exists or a stale context (UCC-102 degraded states).
    - command_id: cmd.teacher.guide.focus
      ucc_units: [UCC-102]
      command_kind: shell_view
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21772); type id per identity_typing"
        target:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "focuses a tab or panel" with precondition target_present (UI_Command_Catalog.md:21772)
            names no target field. JUDGMENT: id of the canonical tab or panel; alternative: route_target
            through the route/open contract.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: >-
            The row states preconditions (UI_Command_Catalog.md:21772) but no disabled reasons;
            stale_projection stands for an unavailable target surface or a control that no longer exists
            (UCC-102, F3-403).
    - command_id: cmd.teacher.guide.highlight
      ucc_units: [UCC-102]
      command_kind: shell_view
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21773); type id per identity_typing"
        target:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "spotlights or outlines a control or region" (UI_Command_Catalog.md:21773) names no
            target field. JUDGMENT: id of the control or region; alternative: route_target for region-level
            targets.
        caption:
          type: string
          required: false
          default: none
          constraints: {max_length: 256}
          provenance: gap
          gap_note: >-
            The row and F3-403 fix the anchored caption that does not cover the target
            (UI_Command_Catalog.md:21773), and UCC-102 preserves "anchored caption", but no arg names the
            caption text or bounds it. JUDGMENT: optional string with the generic text bound; alternative:
            caption text owned by the guidance step record, not the command.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: >-
            The row states preconditions (UI_Command_Catalog.md:21773) but no disabled reasons;
            stale_projection stands for a stale or missing UI target, which UCC-102 says guidance must not
            keep stepping through.
    - command_id: cmd.teacher.guide.scroll_to
      ucc_units: [UCC-102]
      command_kind: shell_view
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21774); type id per identity_typing"
        target:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "scrolls to a section or field" (UI_Command_Catalog.md:21774) names no target field.
            JUDGMENT: id of the section or field target; alternative: an anchor ref resolved by the surface.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: >-
            The row states preconditions (UI_Command_Catalog.md:21774) but no disabled reasons;
            stale_projection stands for a stale or missing UI target (UCC-102).
    - command_id: cmd.teacher.guide.inspect
      ucc_units: [UCC-102]
      command_kind: shell_view
      response_kind: local_projection
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21775); type id per identity_typing"
        target:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "expands non-mutating details or previews a selection, read-only"
            (UI_Command_Catalog.md:21775) names no target field. JUDGMENT: id of the detail target;
            alternative: the UCC-230 common optional selection_ref for the preview-selection case.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: >-
            The row states preconditions (UI_Command_Catalog.md:21775) but no disabled reasons;
            stale_projection stands for a lost selection or a stale target (UCC-102 degraded states).
    - command_id: cmd.teacher.explain_current_ui
      ucc_units: [UCC-102]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        thread_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "Row \"Asks Teacher to explain the current surface in the Teacher thread\" with precondition teacher_thread_available (UI_Command_Catalog.md:21776); UCC-230 envelope common optional thread_id (type id) made required by the row subject"
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row asks Teacher to explain "the current surface" (UI_Command_Catalog.md:21776) and UCC-102
            says "Do not launch Teacher without preserving current surface context needed for useful help."
            (:7772), but no canon names the arg that identifies that surface or says whether it comes from
            the Teacher thread's launch context instead. JUDGMENT: the UCC-230 common optional route_target,
            canonical contract type kept and still optional; absent, canon does not say which surface is
            explained.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:TeacherExplanationResultV1
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [degraded, partial_capability]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [degraded, partial_capability]
          gap_note: >-
            The row states only the precondition teacher_thread_available (UI_Command_Catalog.md:21776) and no
            disabled reasons; degraded stands for model fallback or clamp and partial_capability for an
            unavailable capability or a missing help entry (UCC-102 degraded states).
    - command_id: cmd.teacher.guide.do_it
      ucc_units: [UCC-102]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        teach_session_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UCC-230 row-group UCC-101..UCC-105 optional identity teach_session_id?, made mandatory by the row precondition teacher_guidance_active (UI_Command_Catalog.md:21777); type id per identity_typing"
        target_command_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row "Runs an explicitly safe action for the user through its stable command after
            confirmation and permission gates" (UI_Command_Catalog.md:21777) names no field for that command
            and types no pass-through of its args. JUDGMENT: id of the target command; its args travel as
            that command's own payload after the safety gate, not as a typed field here.
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row requires confirmation (precondition confirmation_given, "a mutation always needs
            confirmation", UI_Command_Catalog.md:21777), but no canon names the arg that carries it.
            JUDGMENT: the UCC-230 common optional confirmation_ref (type ref), narrowed to required;
            alternative: the confirmation gate holds the confirmation and the command carries none.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:TeacherDoItResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [permission_required, blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - key: disabled_reason_codes
          choice: [permission_required, blocked_state_required, stale_projection]
          gap_note: >-
            The row states preconditions (teacher_guidance_active && action_explicitly_safe &&
            confirmation_given, UI_Command_Catalog.md:21777) but no disabled reasons; permission_required
            stands for the permission gates, blocked_state_required for confirmation not yet given, and
            stale_projection for a stale or missing UI target (UCC-102).
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

### F3-700 - alert.acknowledged event boundary

```yaml
plan_unit_id: F3-700
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: 'alert.acknowledged: unacknowledged or snoozed -> acknowledged; clear unread only; never resolve
  the underlying condition. Current owner must prove the action is allowed, including permission, current subject
  revision and currentness_basis_ref. Mute/snooze cannot suppress blocking confirmations or security-sensitive failures;
  dismissal cannot clear a blocker. A refusal, stale result, no change, rollback or failed persistence produces
  no event. F3-453 remains the one shared alert store; visible read is not domain acknowledgement; source access
  and existing confirmation owners still apply. The complete newly authored per-family owner contract is Plans/storage-plan.md#SP-660,
  payload Plans/event_payloads/attention/alert_acknowledged.schema.json. Its producer explicitly adopts SP-286/CV-339
  full-value v2; its history consumer explicitly adopts SP-278/DL-076. Retention PENDING_RETENTION_DECISION; prepared
  without admission.'
gui_related: true
gui_classification_reason: Governs visible alert action semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.acknowledged is denied until its own admission; exact identity, custody, recovery and negative paths are
  checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_acknowledged
implementation_surfaces:
- Plans/event_payloads/attention/alert_acknowledged.schema.json
- Plans/storage-plan.md#SP-660
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.acknowledged
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### F3-701 - alert.dismissed event boundary

```yaml
plan_unit_id: F3-701
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: 'alert.dismissed: unacknowledged, acknowledged or snoozed -> dismissed; rationale required; remove
  inbox presentation only; no approval, denial, resolution or source deletion. Current owner must prove the action
  is allowed, including permission, current subject revision and currentness_basis_ref. Mute/snooze cannot suppress
  blocking confirmations or security-sensitive failures; dismissal cannot clear a blocker. A refusal, stale result,
  no change, rollback or failed persistence produces no event. F3-453 remains the one shared alert store; visible
  read is not domain acknowledgement; source access and existing confirmation owners still apply. The complete newly
  authored per-family owner contract is Plans/storage-plan.md#SP-661, payload Plans/event_payloads/attention/alert_dismissed.schema.json.
  Its producer explicitly adopts SP-286/CV-339 full-value v2; its history consumer explicitly adopts SP-278/DL-076.
  Retention PENDING_RETENTION_DECISION; prepared without admission.'
gui_related: true
gui_classification_reason: Governs visible alert action semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.dismissed is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_dismissed
implementation_surfaces:
- Plans/event_payloads/attention/alert_dismissed.schema.json
- Plans/storage-plan.md#SP-661
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.dismissed
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### F3-702 - alert.rule_muted event boundary

```yaml
plan_unit_id: F3-702
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: 'alert.rule_muted: unmuted or expired -> muted for the exact Project rule; keep the issue visible
  in its owning surface; expiry follows the original explicit deadline, never retry time. Current owner must prove
  the action is allowed, including permission, current subject revision and currentness_basis_ref. Mute/snooze cannot
  suppress blocking confirmations or security-sensitive failures; dismissal cannot clear a blocker. A refusal, stale
  result, no change, rollback or failed persistence produces no event. F3-453 remains the one shared alert store;
  visible read is not domain acknowledgement; source access and existing confirmation owners still apply. The complete
  newly authored per-family owner contract is Plans/storage-plan.md#SP-662, payload Plans/event_payloads/attention/alert_rule_muted.schema.json.
  Its producer explicitly adopts SP-286/CV-339 full-value v2; its history consumer explicitly adopts SP-278/DL-076.
  Retention PENDING_RETENTION_DECISION; prepared without admission.'
gui_related: true
gui_classification_reason: Governs visible alert action semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.rule_muted is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_rule_muted
implementation_surfaces:
- Plans/event_payloads/attention/alert_rule_muted.schema.json
- Plans/storage-plan.md#SP-662
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.rule_muted
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### F3-703 - alert.snoozed event boundary

```yaml
plan_unit_id: F3-703
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: 'alert.snoozed: unacknowledged or acknowledged -> snoozed until snooze_until, strictly after ts;
  keep original deadline on replay; never suppress blocking confirmations or security-sensitive failures. Current
  owner must prove the action is allowed, including permission, current subject revision and currentness_basis_ref.
  Mute/snooze cannot suppress blocking confirmations or security-sensitive failures; dismissal cannot clear a blocker.
  A refusal, stale result, no change, rollback or failed persistence produces no event. F3-453 remains the one shared
  alert store; visible read is not domain acknowledgement; source access and existing confirmation owners still
  apply. The complete newly authored per-family owner contract is Plans/storage-plan.md#SP-663, payload Plans/event_payloads/attention/alert_snoozed.schema.json.
  Its producer explicitly adopts SP-286/CV-339 full-value v2; its history consumer explicitly adopts SP-278/DL-076.
  Retention PENDING_RETENTION_DECISION; prepared without admission.'
gui_related: true
gui_classification_reason: Governs visible alert action semantics.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.snoozed is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_snoozed
implementation_surfaces:
- Plans/event_payloads/attention/alert_snoozed.schema.json
- Plans/storage-plan.md#SP-663
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.snoozed
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### F3-704 - panel.redocked chat-only current action boundary

```yaml
plan_unit_id: F3-704
unit_type: contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: 'panel.redocked: only cmd.panel.redock moves the current chat from detached_window to chat_column;
  desktop Pop out/Dock back remain UCC-203/F3-637. CV-361/SP-330 already decide restart-unsaved host state and no
  workspace.layout_changed. Durable audit evidence is separate from live host state: no Home revision advance, no
  saved popped_out, no replayed OS effect or startup redock. F3-527 v1 fields are historical reader interpretation.
  Full independent current 2.0.0 contract SP-664/CV-684 explicitly adopts SP-286/CV-339 and SP-278/DL-076. Prepared
  without admission; retention PENDING_RETENTION_DECISION.'
gui_related: true
gui_classification_reason: Current chat pop-out action semantics.
split_recommended: false
depends_on:
- SP-664
- CV-684
- F3-637
- CV-361
unblocks: []
acceptance_criteria:
- F3-704 binds only its explicitly named exact family, prepared without admission; native execution NOT_RUN.
- Exact event admission precedes effects; retention remains PENDING_RETENTION_DECISION.
validation_surfaces:
- python3 scripts/pm-panel-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: chat_panel_event_authority
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/panel_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Contracts_V0.md#CV-361
- Plans/storage-plan.md#SP-330
preserved_exact_tokens:
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
negative_constraints:
- No event admission, saved pop-out host, Home revision advance, replayed OS window effect, retention decision or
  native execution proof.
```

### F3-705 - panel.undocked chat-only current action boundary

```yaml
plan_unit_id: F3-705
unit_type: contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: 'panel.undocked: only cmd.panel.undock moves the current chat from chat_column to detached_window;
  desktop Pop out/Dock back remain UCC-203/F3-637. CV-361/SP-330 already decide restart-unsaved host state and no
  workspace.layout_changed. Durable audit evidence is separate from live host state: no Home revision advance, no
  saved popped_out, no replayed OS effect or startup redock. F3-527 v1 fields are historical reader interpretation.
  Full independent current 2.0.0 contract SP-665/CV-685 explicitly adopts SP-286/CV-339 and SP-278/DL-076. Prepared
  without admission; retention PENDING_RETENTION_DECISION.'
gui_related: true
gui_classification_reason: Current chat pop-out action semantics.
split_recommended: false
depends_on:
- SP-665
- CV-685
- F3-637
- CV-361
unblocks: []
acceptance_criteria:
- F3-705 binds only its explicitly named exact family, prepared without admission; native execution NOT_RUN.
- Exact event admission precedes effects; retention remains PENDING_RETENTION_DECISION.
validation_surfaces:
- python3 scripts/pm-panel-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: chat_panel_event_authority
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/panel_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Contracts_V0.md#CV-361
- Plans/storage-plan.md#SP-330
preserved_exact_tokens:
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
negative_constraints:
- No event admission, saved pop-out host, Home revision advance, replayed OS window effect, retention decision or
  native execution proof.
```

### F3-706 - bundle.note_created Card 5 exact-family contract

```yaml
plan_unit_id: F3-706
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Newly authored owner contract for bundle.note_created 1.0.0 under DL-045 and DL-437, deck-2 Card 5.a option A. Prepared without admission. Semantic owners remain Storage SP-095 and Contracts CV-077; this exact-family unit supplies the missing technical bindings and applies only the approved Card 5 action. The seven pre-round prepared contracts remain unchanged. Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here. Jared's answer was "i approve all of it". The as-presented deck's fast-reply rule selects A; the following is the card's option text, not a quotation attributed to Jared:

  Save one note-created event for creation and one note-status-changed event for each later status change. Keep old entries under the general note-change name readable, but stop creating new entries under that name only after owners prove and approve how each old entry maps to creation/status history. Set ambiguous old entries aside for inspection. Preserve existing note statuses and where each note came from. You see one history entry per change.

  Authorized controller means Puppet Master's permitted coordinating software for that part of the work, including package and seam controllers. Responsible owner means the assigned person, agent or component; assignment alone grants no additional permission. Workers propose and never gain direct recording permission. Preserve access checks, current supporting evidence, allowed transitions, and all existing critical/security/governance/human-approval requirements. The creator, responsible owner, resolver, confirmer and recording controller remain distinct roles. A role spelling or ref is never an authorization credential.

  Payload and scope: the exact closed schema is Plans/card5_event_contracts/bundle_note_created.payload.schema.json; its $id is pm.card5.bundle_note_created.payload.v1, version 1.0.0. Only Project EventRecord 2.0.0: scope_kind=project, project_id must join original command, record and independently verified Storage evidence. scope_partition is project~base64url_no_pad(UTF8(project_id)), with no active/focus/default Project or application substitution. Subject identity is bundle_id/doc_id/annotation_id/note_id plus immutable provenance; note_id is the existing note_record identity and annotation_id is its verified annotation identity, never a guessed alias. Envelope actor_ref, occurred_at_utc=ts, correlation_id, idempotency_key and payload schema join the frozen original; original authenticated thread/run/node/attempt/account/parent/causation context joins independently or is explicit null, never parsed from opaque refs. Storage assigns sequence, observed/persisted timestamps and receipt offsets; payload/caller metadata cannot override them.

  Producer and identity: cmd.bundle.note.create through handlers::bundle_note::create is the exact owning handler after independently authenticated action authority. This is a newly named private binding of the already specified durable note action, not an additional public control. H=lowercase SHA-256(canonical MessagePack [storage_instance_id, project_id, "bundle.note_created", idempotency_key]); operation_digest=H and event_id=evt_bundle_note_created_H. Subject ids are preserved from canonical owner state (creation allocates/fixes its original annotation identity once). Request digest=lowercase SHA-256(canonical MessagePack {original_command, payload, before, after}), containing every field, including authority/confirmations/evidence, exact original command, immutable before/after revision refs and facts. Frozen original schema Plans/card5_event_contracts/bundle_note_created.operation.schema.json is closed, private canonical authority. before/after are complete action snapshots of the fields defined by that schema plus immutable refs committing to the full owner records; they do not replace the full canonical record. A ref cannot stand in for readback/authentication. All shared copies and snapshot effects join field by field. Exact types precede comparisons; use the existing canonical MessagePack codec without coercion, a new numeric cap or a lane-local serializer. Numbers follow CV-1100/SP-1100 (loads_current_json, current_integer within each slot's own bounds, no lane cap); timestamps follow CV-1101 through the shared date_time predicate (EventRecord profile for payload ts, CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds). New schemas add no numeric upper limit. Existing date-time/UUID validation is enforced through the existing full-match/Gregorian format checker, not optional jsonschema format support.

  Ordering: exact event-family admission FIRST, before journal, body commit, owner mutation, append, side effect or checkpoint advance. Registry membership remains ABSENT and refuses family_not_admitted; synthetic future-admission fixtures grant nothing. Current writer and retry use dedupe_by_idempotency_key only; projector_replay_only refuses replay_only_not_appendable before effects. Authenticate membership, permissions/source access, actual current owner revision, single-writer lease, canonical allowed action and existing approval evidence under the same commit fence. Resolve immutable evidence/body refs and secret-screen all strings. Freeze prepared original with all four receipt/result refs null at bundle_note_created_operation.v1:{project_id}:{operation_digest}. Atomically whole-value-CAS the original owner revision and complete canonical after-record plus committed operation in ONE canonical-redb transaction; committed has owner_commit_ref/result_ref/dispatch_receipt_ref nonnull and original_append_result_ref null. Large dependent bodies must be durable and authenticated before this atomic commit. A failed/no-change/stale/refused action produces no event. Missing atomicity or ambiguous original commit fences the action.

  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 and its full-value v2 successor. After independently authenticated original owner commit/readback, append only the frozen candidate; join original EventRecord, Storage/source identity, semantic payload, eleven-field first AppendReceipt and retained four-field original_append_result. Storage metadata is verified against the independently retained Storage record. Only whole-value committed->settled CAS with all four original refs nonnull publishes terminal success. Prepared abandonment requires authenticated commit/append absence; uncertain append remains fenced. Committed recovery resolves the ORIGINAL append, settled same-key/same-caller-body retries return its exact original result/receipt. Same scoped key with changed caller semantic body is idempotency_conflict; unavailable authoritative dedupe is dedupe_unavailable, zero effect. No renewed timestamp, reclassification, reconfirmation, second effect or append. Storage-assigned metadata does not participate in caller-body retry comparison. Replay and History never dispatch cmd.bundle.note.create or any linked action. Current live facts do not invalidate a valid retained original or its exact retry; original admission/version/recipe selection must be independently authenticated, never selected by a caller.

  Exact transition: canonical note key absent -> one durable open annotation at original revision one, previous_state=null/prior_revision=0/before_record_ref=null; preserve the exact note id and document provenance in note_record.v1 and notes_index.{bundle_id}. One creation emits only bundle.note_created after original commit; no generic annotation or status event for this same creation. note_record.v1 compatibility lineage does not itself identify an EventRecord alias. An existing key, replay, failed creation or refused mapping precondition emits no second creation.

  Consumers/checkpoints: newly authored projector.bundle_note_created.history@1.0.0 and reader.bundle_note_created.history@1.0.0 expose passive record-backed audit History for this exact family. Document/review History is the named operating consumer; it follows canonical source routes and never invokes an action from an event replay. Explicitly adopt SP-278/DL-076: bundle_note_created_checkpoint.v1:{project_id}:{storage_instance_id}, closed schema Plans/card5_event_contracts/bundle_note_created.checkpoint.schema.json. Complete CURRENT-selected EventRecord index and nine-field durable index_read_token, no persisted redb_snapshot_id. Before every scan/read/CAS join actual live Storage/redb snapshot, scope, source-selection/generation, publication and original event context. Scan all source sequences through the captured frontier; unsupported/corrupt/inadmissible originals are unavailable, not skipped. Atomically whole-value CAS prior token/publication/state/frontier/last_event_id to complete verified coverage in one derived-redb transaction. last_event_id is last exact match or null, through_sequence_id is scanned coverage; no accumulated event refs or unbounded checkpoint array. Registry absence forbids advance; withdrawal/unknown schemas fence it.

  History request uses publication_id, exact durable token, unsigned after_sequence_id. Closed response is {publication_id,index_read_token,after_sequence_id,event_refs,complete} with at most 256 scanned source sequences, 64 matching refs and 16384 canonical MessagePack bytes for the COMPLETE response, adopting the existing bounded reader contract. Stop before an unreturned match; oversized individual metadata/ref is unavailable without skipped coverage. Empty filtered pages continue at last actually scanned sequence until the verified frontier; no empty success merely on a budget boundary. All retained matches remain reachable across pages. Cursor beyond frontier or stale continuation refuses. Rebuild stages a separate publication from verified retained CURRENT source and complete coverage; atomically withdraw old/publish new. Source-generation change requires SP-278 verified translation or a verified new publication and restarted traversal. Current permission/membership/source access, deletion tombstones and withdrawal are checked before disclosure and again after returning helpers. Authenticate original event/family/schema/receipt/source/publication against independent retained evidence; a hash/ref is not authority. A valid retained original remains readable after current owner state/roles change or live writer admission closes, including valid replay-only history. Historical guards never invoke current-writer action rules.

  Custody and physical binding: original canonical note/concern/action/operation records and authenticated commit/first/full-value receipt/source dependencies are non-rebuildable authority. Mandatory coherent backup/restore preserves them together under one verified Storage/source recovery boundary; mixed or missing originals fence mutation/disclosure. Projections cannot recreate lost authority. No raw note/title/reason/source/credentials/private account text or absolute local path in event/journal/checkpoint; use authenticated immutable refs, secret-screen every string and recheck source access/deletion at resolution. Preserve all original anchors/provenance/closure/lineage fields. Existing record keys and storage classes remain owned by SP-095/SP-666/CV-315/SP-233; note_record.v1 is compatibility lineage, not a new note subsystem. bundle_note_created_operation uses canonical redb/coordination_and_storage advisory budget, canonical MessagePack and complete-value 16384-byte limit. bundle_note_created_checkpoint uses derived redb/event_log hard budget, canonical MessagePack and complete-value 16384-byte limit. Measure every stored value independently; oversized mandatory metadata refuses, never truncates. Event bodies above the 16 KiB inline limit use SP-337 payload_ref with verified BLAKE3 identity, byte size and media type, not inline base64; externalizing an event does not waive any operation/checkpoint bound. Pressure cannot silently evict canonical authority; derived eviction makes History unavailable until verified rebuild.

  Retention: existing concern_record RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds bind only those already governed records. This exact event, its original operation/action custody and its History checkpoint have retention_policy_ref=PENDING_RETENTION_DECISION: Case L-3/SP-026 audit-authority/ordinary-telemetry groups and checkpoint RP-PROJECTION-3GEN are candidates only until the retention owners bind the exact family. No new duration, deletion, compaction, auto-expiry or hold release is chosen. Retention stays PARTIAL.

  Compatibility/withdrawal: keep all original payload bytes/ids/versions; no old schema was specified for this exact split event; unsupported/unversioned originals require governed validation/quarantine, never inferred aliases. Original valid history is interpreted with its authenticated write-time edition/recipe, not a caller-selected weaker recipe: the SP-1101 RetainedDispatcher resolves it from Storage's sealed custody, exact binding and an installed frozen recipe tuple that pins the edition's exact schema bytes (a legacy concern v1 edition keeps its original Draft 2020-12 type and number validation with the CV-1101 predicate installed); unavailable or unsupported originals refuse without fallback. StorageMigrationCoordinator installs each declared schema before activation; unknown editions/withdrawn sources disclose unavailable. Future versions require their own exact admission and verified projection rebuild. Close exact-family writer admission first, fence new mutations, settle existing original obligations under original custody without repeating effects, whole-value-CAS checkpoint withdrawn and refuse stale/staged/withdrawn publications; retained original read rights and legal deletion/holds remain owner-governed. No sibling/alias admission or current-writer permission follows.

  Oracles: Plans/card5_event_contracts/bundle_note_created.fixtures.json and python3 scripts/pm-card5-event-contracts-check.py --family bundle.note_created. Test closed payload/operation, recomputed identity/digest, original command/snapshot joins, phase/order/admission/refusal/replay/retry custody, current permission/currentness and exact action roles, retained historical reads after live changes, forged/foreign/withdrawn controls, enforced types/formats/LF/reference closure and bounded read/Storage metadata. Each negative is built from a valid named base, with coherent copies/digests/keys; changed semantic body is distinguished from Storage-assigned metadata. Every refusal goes through guard-table rows proved by the gated guard tool scripts/pm_guard_isolation.py (004bdedd63), credited per row in the lane report. C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool, CV-1101's datetime_validator and whole-Plans inventory gate run at batch-2 integration, and the batch Sol/Astra review has not run. Native authentication, owner atomicity, append/custody/durability, mapping approval, checkpoint CAS, coherent backup/recovery and disclosure races remain NOT_RUN. Membership ABSENT. No admission, executable task or native availability is asserted.
gui_related: true
gui_classification_reason: Exact concern or annotation action and visible audit History boundary.
split_recommended: false
depends_on:
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- bundle.note_created has its own contract; membership ABSENT, retention PENDING_RETENTION_DECISION, native NOT_RUN.
- Preserve exact Card 5.a A recording and confirmation roles without expansion.
validation_surfaces:
- python3 scripts/pm-card5-event-contracts-check.py --family bundle.note_created
risk_class: event_authority
reasoning_tier: high
context_scope: bundle_note_created
implementation_surfaces:
- Plans/card5_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-437
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- bundle.note_created
- DL-437
- PENDING_RETENTION_DECISION
negative_constraints:
- No admission, new recording privilege beyond option A, duplicate note co-emission or invented retention.
```

### F3-707 - bundle.note_status_changed Card 5 exact-family contract

```yaml
plan_unit_id: F3-707
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Newly authored owner contract for bundle.note_status_changed 1.0.0 under DL-045 and DL-437, deck-2 Card 5.a option A. Prepared without admission. Semantic owners remain Storage SP-095 and Contracts CV-077; this exact-family unit supplies the missing technical bindings and applies only the approved Card 5 action. The seven pre-round prepared contracts remain unchanged. Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here. Jared's answer was "i approve all of it". The as-presented deck's fast-reply rule selects A; the following is the card's option text, not a quotation attributed to Jared:

  Save one note-created event for creation and one note-status-changed event for each later status change. Keep old entries under the general note-change name readable, but stop creating new entries under that name only after owners prove and approve how each old entry maps to creation/status history. Set ambiguous old entries aside for inspection. Preserve existing note statuses and where each note came from. You see one history entry per change.

  Authorized controller means Puppet Master's permitted coordinating software for that part of the work, including package and seam controllers. Responsible owner means the assigned person, agent or component; assignment alone grants no additional permission. Workers propose and never gain direct recording permission. Preserve access checks, current supporting evidence, allowed transitions, and all existing critical/security/governance/human-approval requirements. The creator, responsible owner, resolver, confirmer and recording controller remain distinct roles. A role spelling or ref is never an authorization credential.

  Payload and scope: the exact closed schema is Plans/card5_event_contracts/bundle_note_status_changed.payload.schema.json; its $id is pm.card5.bundle_note_status_changed.payload.v1, version 1.0.0. Only Project EventRecord 2.0.0: scope_kind=project, project_id must join original command, record and independently verified Storage evidence. scope_partition is project~base64url_no_pad(UTF8(project_id)), with no active/focus/default Project or application substitution. Subject identity is bundle_id/doc_id/annotation_id/note_id plus immutable provenance; note_id is the existing note_record identity and annotation_id is its verified annotation identity, never a guessed alias. Envelope actor_ref, occurred_at_utc=ts, correlation_id, idempotency_key and payload schema join the frozen original; original authenticated thread/run/node/attempt/account/parent/causation context joins independently or is explicit null, never parsed from opaque refs. Storage assigns sequence, observed/persisted timestamps and receipt offsets; payload/caller metadata cannot override them.

  Producer and identity: cmd.bundle.note.change_status through handlers::bundle_note::change_status is the exact owning handler after independently authenticated action authority. This is a newly named private binding of the already specified durable note action, not an additional public control. H=lowercase SHA-256(canonical MessagePack [storage_instance_id, project_id, "bundle.note_status_changed", idempotency_key]); operation_digest=H and event_id=evt_bundle_note_status_changed_H. Subject ids are preserved from canonical owner state (creation allocates/fixes its original annotation identity once). Request digest=lowercase SHA-256(canonical MessagePack {original_command, payload, before, after}), containing every field, including authority/confirmations/evidence, exact original command, immutable before/after revision refs and facts. Frozen original schema Plans/card5_event_contracts/bundle_note_status_changed.operation.schema.json is closed, private canonical authority. before/after are complete action snapshots of the fields defined by that schema plus immutable refs committing to the full owner records; they do not replace the full canonical record. A ref cannot stand in for readback/authentication. All shared copies and snapshot effects join field by field. Exact types precede comparisons; use the existing canonical MessagePack codec without coercion, a new numeric cap or a lane-local serializer. Numbers follow CV-1100/SP-1100 (loads_current_json, current_integer within each slot's own bounds, no lane cap); timestamps follow CV-1101 through the shared date_time predicate (EventRecord profile for payload ts, CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds). New schemas add no numeric upper limit. Existing date-time/UUID validation is enforced through the existing full-match/Gregorian format checker, not optional jsonschema format support.

  Ordering: exact event-family admission FIRST, before journal, body commit, owner mutation, append, side effect or checkpoint advance. Registry membership remains ABSENT and refuses family_not_admitted; synthetic future-admission fixtures grant nothing. Current writer and retry use dedupe_by_idempotency_key only; projector_replay_only refuses replay_only_not_appendable before effects. Authenticate membership, permissions/source access, actual current owner revision, single-writer lease, canonical allowed action and existing approval evidence under the same commit fence. Resolve immutable evidence/body refs and secret-screen all strings. Freeze prepared original with all four receipt/result refs null at bundle_note_status_changed_operation.v1:{project_id}:{operation_digest}. Atomically whole-value-CAS the original owner revision and complete canonical after-record plus committed operation in ONE canonical-redb transaction; committed has owner_commit_ref/result_ref/dispatch_receipt_ref nonnull and original_append_result_ref null. Large dependent bodies must be durable and authenticated before this atomic commit. A failed/no-change/stale/refused action produces no event. Missing atomicity or ambiguous original commit fences the action.

  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 and its full-value v2 successor. After independently authenticated original owner commit/readback, append only the frozen candidate; join original EventRecord, Storage/source identity, semantic payload, eleven-field first AppendReceipt and retained four-field original_append_result. Storage metadata is verified against the independently retained Storage record. Only whole-value committed->settled CAS with all four original refs nonnull publishes terminal success. Prepared abandonment requires authenticated commit/append absence; uncertain append remains fenced. Committed recovery resolves the ORIGINAL append, settled same-key/same-caller-body retries return its exact original result/receipt. Same scoped key with changed caller semantic body is idempotency_conflict; unavailable authoritative dedupe is dedupe_unavailable, zero effect. No renewed timestamp, reclassification, reconfirmation, second effect or append. Storage-assigned metadata does not participate in caller-body retry comparison. Replay and History never dispatch cmd.bundle.note.change_status or any linked action. Current live facts do not invalidate a valid retained original or its exact retry; original admission/version/recipe selection must be independently authenticated, never selected by a caller.

  Exact transition: existing canonical annotation at prior_revision -> its immediate successor, with unequal previous_state/state among open/addressed/still_open/cannot_apply/resolved, subject to the existing owner-allowed lifecycle transition. Preserve document provenance, note id and all other note content/anchor/targeted-revision lineage. Each real later committed status change emits only bundle.note_status_changed. Same state, stale revision, invalid allowed transition, replay or refused action emits nothing; no generic co-emission. The private operation authenticates the complete original note record before/after; omitted unrelated fields may not silently change.

  Consumers/checkpoints: newly authored projector.bundle_note_status_changed.history@1.0.0 and reader.bundle_note_status_changed.history@1.0.0 expose passive record-backed audit History for this exact family. Document/review History is the named operating consumer; it follows canonical source routes and never invokes an action from an event replay. Explicitly adopt SP-278/DL-076: bundle_note_status_changed_checkpoint.v1:{project_id}:{storage_instance_id}, closed schema Plans/card5_event_contracts/bundle_note_status_changed.checkpoint.schema.json. Complete CURRENT-selected EventRecord index and nine-field durable index_read_token, no persisted redb_snapshot_id. Before every scan/read/CAS join actual live Storage/redb snapshot, scope, source-selection/generation, publication and original event context. Scan all source sequences through the captured frontier; unsupported/corrupt/inadmissible originals are unavailable, not skipped. Atomically whole-value CAS prior token/publication/state/frontier/last_event_id to complete verified coverage in one derived-redb transaction. last_event_id is last exact match or null, through_sequence_id is scanned coverage; no accumulated event refs or unbounded checkpoint array. Registry absence forbids advance; withdrawal/unknown schemas fence it.

  History request uses publication_id, exact durable token, unsigned after_sequence_id. Closed response is {publication_id,index_read_token,after_sequence_id,event_refs,complete} with at most 256 scanned source sequences, 64 matching refs and 16384 canonical MessagePack bytes for the COMPLETE response, adopting the existing bounded reader contract. Stop before an unreturned match; oversized individual metadata/ref is unavailable without skipped coverage. Empty filtered pages continue at last actually scanned sequence until the verified frontier; no empty success merely on a budget boundary. All retained matches remain reachable across pages. Cursor beyond frontier or stale continuation refuses. Rebuild stages a separate publication from verified retained CURRENT source and complete coverage; atomically withdraw old/publish new. Source-generation change requires SP-278 verified translation or a verified new publication and restarted traversal. Current permission/membership/source access, deletion tombstones and withdrawal are checked before disclosure and again after returning helpers. Authenticate original event/family/schema/receipt/source/publication against independent retained evidence; a hash/ref is not authority. A valid retained original remains readable after current owner state/roles change or live writer admission closes, including valid replay-only history. Historical guards never invoke current-writer action rules.

  Custody and physical binding: original canonical note/concern/action/operation records and authenticated commit/first/full-value receipt/source dependencies are non-rebuildable authority. Mandatory coherent backup/restore preserves them together under one verified Storage/source recovery boundary; mixed or missing originals fence mutation/disclosure. Projections cannot recreate lost authority. No raw note/title/reason/source/credentials/private account text or absolute local path in event/journal/checkpoint; use authenticated immutable refs, secret-screen every string and recheck source access/deletion at resolution. Preserve all original anchors/provenance/closure/lineage fields. Existing record keys and storage classes remain owned by SP-095/SP-666/CV-315/SP-233; note_record.v1 is compatibility lineage, not a new note subsystem. bundle_note_status_changed_operation uses canonical redb/coordination_and_storage advisory budget, canonical MessagePack and complete-value 16384-byte limit. bundle_note_status_changed_checkpoint uses derived redb/event_log hard budget, canonical MessagePack and complete-value 16384-byte limit. Measure every stored value independently; oversized mandatory metadata refuses, never truncates. Event bodies above the 16 KiB inline limit use SP-337 payload_ref with verified BLAKE3 identity, byte size and media type, not inline base64; externalizing an event does not waive any operation/checkpoint bound. Pressure cannot silently evict canonical authority; derived eviction makes History unavailable until verified rebuild.

  Retention: existing concern_record RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds bind only those already governed records. This exact event, its original operation/action custody and its History checkpoint have retention_policy_ref=PENDING_RETENTION_DECISION: Case L-3/SP-026 audit-authority/ordinary-telemetry groups and checkpoint RP-PROJECTION-3GEN are candidates only until the retention owners bind the exact family. No new duration, deletion, compaction, auto-expiry or hold release is chosen. Retention stays PARTIAL.

  Compatibility/withdrawal: keep all original payload bytes/ids/versions; no old schema was specified for this exact split event; unsupported/unversioned originals require governed validation/quarantine, never inferred aliases. Original valid history is interpreted with its authenticated write-time edition/recipe, not a caller-selected weaker recipe: the SP-1101 RetainedDispatcher resolves it from Storage's sealed custody, exact binding and an installed frozen recipe tuple that pins the edition's exact schema bytes (a legacy concern v1 edition keeps its original Draft 2020-12 type and number validation with the CV-1101 predicate installed); unavailable or unsupported originals refuse without fallback. StorageMigrationCoordinator installs each declared schema before activation; unknown editions/withdrawn sources disclose unavailable. Future versions require their own exact admission and verified projection rebuild. Close exact-family writer admission first, fence new mutations, settle existing original obligations under original custody without repeating effects, whole-value-CAS checkpoint withdrawn and refuse stale/staged/withdrawn publications; retained original read rights and legal deletion/holds remain owner-governed. No sibling/alias admission or current-writer permission follows.

  Oracles: Plans/card5_event_contracts/bundle_note_status_changed.fixtures.json and python3 scripts/pm-card5-event-contracts-check.py --family bundle.note_status_changed. Test closed payload/operation, recomputed identity/digest, original command/snapshot joins, phase/order/admission/refusal/replay/retry custody, current permission/currentness and exact action roles, retained historical reads after live changes, forged/foreign/withdrawn controls, enforced types/formats/LF/reference closure and bounded read/Storage metadata. Each negative is built from a valid named base, with coherent copies/digests/keys; changed semantic body is distinguished from Storage-assigned metadata. Every refusal goes through guard-table rows proved by the gated guard tool scripts/pm_guard_isolation.py (004bdedd63), credited per row in the lane report. C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool, CV-1101's datetime_validator and whole-Plans inventory gate run at batch-2 integration, and the batch Sol/Astra review has not run. Native authentication, owner atomicity, append/custody/durability, mapping approval, checkpoint CAS, coherent backup/recovery and disclosure races remain NOT_RUN. Membership ABSENT. No admission, executable task or native availability is asserted.
gui_related: true
gui_classification_reason: Exact concern or annotation action and visible audit History boundary.
split_recommended: false
depends_on:
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- bundle.note_status_changed has its own contract; membership ABSENT, retention PENDING_RETENTION_DECISION, native NOT_RUN.
- Preserve exact Card 5.a A recording and confirmation roles without expansion.
validation_surfaces:
- python3 scripts/pm-card5-event-contracts-check.py --family bundle.note_status_changed
risk_class: event_authority
reasoning_tier: high
context_scope: bundle_note_status_changed
implementation_surfaces:
- Plans/card5_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-437
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- bundle.note_status_changed
- DL-437
- PENDING_RETENTION_DECISION
negative_constraints:
- No admission, new recording privilege beyond option A, duplicate note co-emission or invented retention.
```

### F3-708 - bundle.annotation_state_changed Card 5 exact-family contract

```yaml
plan_unit_id: F3-708
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Newly authored owner contract for bundle.annotation_state_changed 1.0.0 under DL-045 and DL-437, deck-2 Card 5.a option A. Prepared without admission. Semantic owners remain Storage SP-095 and Contracts CV-077; this exact-family unit supplies the missing technical bindings and applies only the approved Card 5 action. The seven pre-round prepared contracts remain unchanged. Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here. Jared's answer was "i approve all of it". The as-presented deck's fast-reply rule selects A; the following is the card's option text, not a quotation attributed to Jared:

  Save one note-created event for creation and one note-status-changed event for each later status change. Keep old entries under the general note-change name readable, but stop creating new entries under that name only after owners prove and approve how each old entry maps to creation/status history. Set ambiguous old entries aside for inspection. Preserve existing note statuses and where each note came from. You see one history entry per change.

  Authorized controller means Puppet Master's permitted coordinating software for that part of the work, including package and seam controllers. Responsible owner means the assigned person, agent or component; assignment alone grants no additional permission. Workers propose and never gain direct recording permission. Preserve access checks, current supporting evidence, allowed transitions, and all existing critical/security/governance/human-approval requirements. The creator, responsible owner, resolver, confirmer and recording controller remain distinct roles. A role spelling or ref is never an authorization credential.

  Payload and scope: the exact closed schema is Plans/card5_event_contracts/bundle_annotation_state_changed.payload.schema.json; its $id is pm.card5.bundle_annotation_state_changed.payload.v1, version 1.0.0. Only Project EventRecord 2.0.0: scope_kind=project, project_id must join original command, record and independently verified Storage evidence. scope_partition is project~base64url_no_pad(UTF8(project_id)), with no active/focus/default Project or application substitution. Subject identity is bundle_id/doc_id/annotation_id/note_id plus immutable provenance; note_id is the existing note_record identity and annotation_id is its verified annotation identity, never a guessed alias. Envelope actor_ref, occurred_at_utc=ts, correlation_id, idempotency_key and payload schema join the frozen original; original authenticated thread/run/node/attempt/account/parent/causation context joins independently or is explicit null, never parsed from opaque refs. Storage assigns sequence, observed/persisted timestamps and receipt offsets; payload/caller metadata cannot override them.

  Producer and transitions: there is no current producer, journal, effect, new append, retry append or dual emission under bundle.annotation_state_changed. Refuse every new-write request as compatibility_no_new_writes, including replay-only attempts. Preserve originally admitted originals and their exact original event identity, payload edition/bytes, timestamps, receipt and Storage source. Closed payload here is a decoded compatibility view, never a replacement of original bytes or a new historical append. The read classifier must prove original bundle/doc/annotation/note/provenance identities against independently held immutable pre/post snapshots and original receipt: absent pre-record plus original creation evidence maps to creation; existing pre-record with unequal allowed old/new status maps to status_change. Both require owner-verified source proof and explicit mapping approval from the responsible document/Storage owners. A claimed mapped_kind is checked against the original facts, never accepted as evidence. No timestamp guess, identifier similarity, replay of note commands, synthetic split append or duplicate co-emission is permitted. Ambiguous/unproved/unapproved old entries stay in a read-only inspection quarantine with original bytes and provenance, excluded from authoritative creation/status projections until the owners prove and approve the mapping. One verified change has one History entry under its retained original identity; reading never manufactures a split-family record. The owner proof/approval is a release precondition still NOT_RUN, not falsely claimed by a schema or synthetic fixture. Current generic writes are refused throughout preparation; before any split-writer activation the owners must prove/approve the inventory mapping and quarantine ambiguous entries as DL-437 requires. Withdrawal of this historical reader fences disclosure/publications but never erases the original or changes its retained meaning.

  Consumers/checkpoints: newly authored projector.bundle_annotation_state_changed.history@1.0.0 and reader.bundle_annotation_state_changed.history@1.0.0 expose passive record-backed audit History for this exact family. Document/review History is the named operating consumer; it follows canonical source routes and never invokes an action from an event replay. Explicitly adopt SP-278/DL-076: bundle_annotation_state_changed_checkpoint.v1:{project_id}:{storage_instance_id}, closed schema Plans/card5_event_contracts/bundle_annotation_state_changed.checkpoint.schema.json. Complete CURRENT-selected EventRecord index and nine-field durable index_read_token, no persisted redb_snapshot_id. Before every scan/read/CAS join actual live Storage/redb snapshot, scope, source-selection/generation, publication and original event context. Scan all source sequences through the captured frontier; unsupported/corrupt/inadmissible originals are unavailable, not skipped. Atomically whole-value CAS prior token/publication/state/frontier/last_event_id to complete verified coverage in one derived-redb transaction. last_event_id is last exact match or null, through_sequence_id is scanned coverage; no accumulated event refs or unbounded checkpoint array. Registry absence forbids advance; withdrawal/unknown schemas fence it.

  History request uses publication_id, exact durable token, unsigned after_sequence_id. Closed response is {publication_id,index_read_token,after_sequence_id,event_refs,complete} with at most 256 scanned source sequences, 64 matching refs and 16384 canonical MessagePack bytes for the COMPLETE response, adopting the existing bounded reader contract. Stop before an unreturned match; oversized individual metadata/ref is unavailable without skipped coverage. Empty filtered pages continue at last actually scanned sequence until the verified frontier; no empty success merely on a budget boundary. All retained matches remain reachable across pages. Cursor beyond frontier or stale continuation refuses. Rebuild stages a separate publication from verified retained CURRENT source and complete coverage; atomically withdraw old/publish new. Source-generation change requires SP-278 verified translation or a verified new publication and restarted traversal. Current permission/membership/source access, deletion tombstones and withdrawal are checked before disclosure and again after returning helpers. Authenticate original event/family/schema/receipt/source/publication against independent retained evidence; a hash/ref is not authority. A valid retained original remains readable after current owner state/roles change or live writer admission closes, including valid replay-only history. Historical guards never invoke current-writer action rules.

  Custody and physical binding: original canonical note/concern/action/operation records and authenticated commit/first/full-value receipt/source dependencies are non-rebuildable authority. Mandatory coherent backup/restore preserves them together under one verified Storage/source recovery boundary; mixed or missing originals fence mutation/disclosure. Projections cannot recreate lost authority. No raw note/title/reason/source/credentials/private account text or absolute local path in event/journal/checkpoint; use authenticated immutable refs, secret-screen every string and recheck source access/deletion at resolution. Preserve all original anchors/provenance/closure/lineage fields. Existing record keys and storage classes remain owned by SP-095/SP-666/CV-315/SP-233; note_record.v1 is compatibility lineage, not a new note subsystem. No new operation value exists for the generic compatibility spelling. bundle_annotation_state_changed_checkpoint uses derived redb/event_log hard budget, canonical MessagePack and complete-value 16384-byte limit. Measure every stored value independently; oversized mandatory metadata refuses, never truncates. Event bodies above the 16 KiB inline limit use SP-337 payload_ref with verified BLAKE3 identity, byte size and media type, not inline base64; externalizing an event does not waive any operation/checkpoint bound. Pressure cannot silently evict canonical authority; derived eviction makes History unavailable until verified rebuild.

  Retention: existing concern_record RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds bind only those already governed records. This exact event, its compatibility mapping custody and its History checkpoint have retention_policy_ref=PENDING_RETENTION_DECISION: Case L-3/SP-026 audit-authority/ordinary-telemetry groups and checkpoint RP-PROJECTION-3GEN are candidates only until the retention owners bind the exact family. No new duration, deletion, compaction, auto-expiry or hold release is chosen. Retention stays PARTIAL.

  Compatibility/withdrawal: keep all original payload bytes/ids/versions; the old general annotation spelling is historical-only under the verified mapping/inspection path above. Original valid history is interpreted with its authenticated write-time edition/recipe, not a caller-selected weaker recipe: the SP-1101 RetainedDispatcher resolves it from Storage's sealed custody, exact binding and an installed frozen recipe tuple that pins the edition's exact schema bytes (a legacy concern v1 edition keeps its original Draft 2020-12 type and number validation with the CV-1101 predicate installed); unavailable or unsupported originals refuse without fallback. StorageMigrationCoordinator installs each declared schema before activation; unknown editions/withdrawn sources disclose unavailable. Future versions require their own exact admission and verified projection rebuild. Close exact-family writer admission first, fence new mutations, settle existing original obligations under original custody without repeating effects, whole-value-CAS checkpoint withdrawn and refuse stale/staged/withdrawn publications; retained original read rights and legal deletion/holds remain owner-governed. No sibling/alias admission or current-writer permission follows.

  Oracles: Plans/card5_event_contracts/bundle_annotation_state_changed.fixtures.json and python3 scripts/pm-card5-event-contracts-check.py --family bundle.annotation_state_changed. Test closed payload/operation, recomputed identity/digest, original command/snapshot joins, phase/order/admission/refusal/replay/retry custody, current permission/currentness and exact action roles, retained historical reads after live changes, forged/foreign/withdrawn controls, enforced types/formats/LF/reference closure and bounded read/Storage metadata. Each negative is built from a valid named base, with coherent copies/digests/keys; changed semantic body is distinguished from Storage-assigned metadata. Every refusal goes through guard-table rows proved by the gated guard tool scripts/pm_guard_isolation.py (004bdedd63), credited per row in the lane report. C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool, CV-1101's datetime_validator and whole-Plans inventory gate run at batch-2 integration, and the batch Sol/Astra review has not run. Native authentication, owner atomicity, append/custody/durability, mapping approval, checkpoint CAS, coherent backup/recovery and disclosure races remain NOT_RUN. Membership ABSENT. No admission, executable task or native availability is asserted.
gui_related: true
gui_classification_reason: Exact concern or annotation action and visible audit History boundary.
split_recommended: false
depends_on:
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- bundle.annotation_state_changed has its own contract; membership ABSENT, retention PENDING_RETENTION_DECISION, native NOT_RUN.
- Preserve exact Card 5.a A recording and confirmation roles without expansion.
validation_surfaces:
- python3 scripts/pm-card5-event-contracts-check.py --family bundle.annotation_state_changed
risk_class: event_authority
reasoning_tier: high
context_scope: bundle_annotation_state_changed
implementation_surfaces:
- Plans/card5_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-437
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- bundle.annotation_state_changed
- DL-437
- PENDING_RETENTION_DECISION
negative_constraints:
- No admission, new recording privilege beyond option A, duplicate note co-emission or invented retention.
```

### F3-709 - concern.assigned Card 5 exact-family contract

```yaml
plan_unit_id: F3-709
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Newly authored owner contract for concern.assigned 2.0.0 under DL-045 and DL-438, deck-2 Card 5.b option A. Prepared without admission. Semantic owners remain Orchestrator_Page OP-002/OP-004 and UCC-147; this exact-family unit supplies the missing technical bindings and applies only the approved Card 5 action. The seven pre-round prepared contracts remain unchanged. Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here. Jared's answer was "i approve all of it". The as-presented deck's fast-reply rule selects A; the following is the card's option text, not a quotation attributed to Jared:

  Only the authorized Puppet Master controller for that area records reassignment; users and workers request it. Within the same area of responsibility, require no added confirmation beyond existing rules. Crossing to another area requires **an authorized human for the outgoing area to approve and the receiving responsible owner (person, agent or component) to explicitly accept** before the change is saved. The outgoing concern owner has no additional veto merely for holding the old assignment. If either required confirmer is unavailable or declines, leave the old assignment in place. Save both confirmations, who gave each and in which role, old/new owners, reason and proof of permission. The controller recording the transfer cannot treat its own recording as either confirmation; if it is the receiving owner, it must separately record acceptance and still obtain the human’s approval. You see who approved and who accepted. If this reassignment also moves the concern to a wider area of responsibility, follow your selected 5.d rule as well, including its promotion recorder and required approvals.

  Authorized controller means Puppet Master's permitted coordinating software for that part of the work, including package and seam controllers. Responsible owner means the assigned person, agent or component; assignment alone grants no additional permission. Workers propose and never gain direct recording permission. Preserve access checks, current supporting evidence, allowed transitions, and all existing critical/security/governance/human-approval requirements. The creator, responsible owner, resolver, confirmer and recording controller remain distinct roles. A role spelling or ref is never an authorization credential.

  Payload and scope: the exact closed schema is Plans/card5_event_contracts/concern_assigned.payload.schema.json; its $id is pm.card5.concern_assigned.payload.v2, version 2.0.0. Only Project EventRecord 2.0.0: scope_kind=project, project_id must join original command, record and independently verified Storage evidence. scope_partition is project~base64url_no_pad(UTF8(project_id)), with no active/focus/default Project or application substitution. Subject identity is concern_id; creator and original identity never change under assignment, promotion, reopening, resolution or assessment. Envelope actor_ref, occurred_at_utc=ts, correlation_id, idempotency_key and payload schema join the frozen original; original authenticated thread/run/node/attempt/account/parent/causation context joins independently or is explicit null, never parsed from opaque refs. Storage assigns sequence, observed/persisted timestamps and receipt offsets; payload/caller metadata cannot override them.

  Producer and identity: cmd.concern.assign through handlers::concern::assign is the exact owning handler after independently authenticated action authority. UCC-147 retains its public command fields; the closed normalized action custody is private and grants no extra caller fields or privileges. H=lowercase SHA-256(canonical MessagePack [storage_instance_id, project_id, "concern.assigned", idempotency_key]); operation_digest=H and event_id=evt_concern_assigned_H. Subject ids are preserved from canonical owner state (creation allocates/fixes its original annotation identity once). Request digest=lowercase SHA-256(canonical MessagePack {original_command, payload, before, after}), containing every field, including authority/confirmations/evidence, exact original command, immutable before/after revision refs and facts. Frozen original schema Plans/card5_event_contracts/concern_assigned.operation.schema.json is closed, private canonical authority. before/after are complete action snapshots of the fields defined by that schema plus immutable refs committing to the full owner records; they do not replace the full canonical record. A ref cannot stand in for readback/authentication. All shared copies and snapshot effects join field by field. Exact types precede comparisons; use the existing canonical MessagePack codec without coercion, a new numeric cap or a lane-local serializer. Numbers follow CV-1100/SP-1100 (loads_current_json, current_integer within each slot's own bounds, no lane cap); timestamps follow CV-1101 through the shared date_time predicate (EventRecord profile for payload ts, CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds). New schemas add no numeric upper limit. Existing date-time/UUID validation is enforced through the existing full-match/Gregorian format checker, not optional jsonschema format support.

  Ordering: exact event-family admission FIRST, before journal, body commit, owner mutation, append, side effect or checkpoint advance. Registry membership remains ABSENT and refuses family_not_admitted; synthetic future-admission fixtures grant nothing. Current writer and retry use dedupe_by_idempotency_key only; projector_replay_only refuses replay_only_not_appendable before effects. Authenticate membership, permissions/source access, actual current owner revision, single-writer lease, canonical allowed action and existing approval evidence under the same commit fence. Resolve immutable evidence/body refs and secret-screen all strings. Freeze prepared original with all four receipt/result refs null at concern_assigned_operation.v1:{project_id}:{operation_digest}. Atomically whole-value-CAS the original owner revision and complete canonical after-record plus committed operation in ONE canonical-redb transaction; committed has owner_commit_ref/result_ref/dispatch_receipt_ref nonnull and original_append_result_ref null. Large dependent bodies must be durable and authenticated before this atomic commit. A failed/no-change/stale/refused action produces no event. Missing atomicity or ambiguous original commit fences the action.

  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 and its full-value v2 successor. After independently authenticated original owner commit/readback, append only the frozen candidate; join original EventRecord, Storage/source identity, semantic payload, eleven-field first AppendReceipt and retained four-field original_append_result. Storage metadata is verified against the independently retained Storage record. Only whole-value committed->settled CAS with all four original refs nonnull publishes terminal success. Prepared abandonment requires authenticated commit/append absence; uncertain append remains fenced. Committed recovery resolves the ORIGINAL append, settled same-key/same-caller-body retries return its exact original result/receipt. Same scoped key with changed caller semantic body is idempotency_conflict; unavailable authoritative dedupe is dedupe_unavailable, zero effect. No renewed timestamp, reclassification, reconfirmation, second effect or append. Storage-assigned metadata does not participate in caller-body retry comparison. Replay and History never dispatch cmd.concern.assign or any linked action. Current live facts do not invalidate a valid retained original or its exact retry; original admission/version/recipe selection must be independently authenticated, never selected by a caller.

  Exact effect: owner_kind/owner_ref change, identity and creator/resolver/lifecycle preserved. Same-area transfer has no additional confirmation beyond existing rules. Area comparison uses authenticated canonical responsibility scopes, never caller-supplied labels. Cross-area transfer requires outgoing authorized human approval and receiving owner explicit acceptance, each independently authenticated, tied to this original action, role, actor, scope and evidence. Recording is neither confirmation. The controller may separately accept as receiving owner (person/agent/component) but must still obtain outgoing human approval; unavailable/declined confirmer leaves old assignment untouched. Holding old assignment grants no veto. A wider target additionally requires the exact promotion controller/evidence/approval contract F3-711/DL-440; linked action custody proves both contracts before the same canonical commit, never a unilateral owner rewrite. Save old/new owners, reason, proof and who approved/accepted in which role.

  Consumers/checkpoints: newly authored projector.concern_assigned.history@1.0.0 and reader.concern_assigned.history@1.0.0 expose passive record-backed audit History for this exact family. Orchestrator concern History/inspector is the named operating consumer; it follows canonical source routes and never invokes an action from an event replay. Explicitly adopt SP-278/DL-076: concern_assigned_checkpoint.v1:{project_id}:{storage_instance_id}, closed schema Plans/card5_event_contracts/concern_assigned.checkpoint.schema.json. Complete CURRENT-selected EventRecord index and nine-field durable index_read_token, no persisted redb_snapshot_id. Before every scan/read/CAS join actual live Storage/redb snapshot, scope, source-selection/generation, publication and original event context. Scan all source sequences through the captured frontier; unsupported/corrupt/inadmissible originals are unavailable, not skipped. Atomically whole-value CAS prior token/publication/state/frontier/last_event_id to complete verified coverage in one derived-redb transaction. last_event_id is last exact match or null, through_sequence_id is scanned coverage; no accumulated event refs or unbounded checkpoint array. Registry absence forbids advance; withdrawal/unknown schemas fence it.

  History request uses publication_id, exact durable token, unsigned after_sequence_id. Closed response is {publication_id,index_read_token,after_sequence_id,event_refs,complete} with at most 256 scanned source sequences, 64 matching refs and 16384 canonical MessagePack bytes for the COMPLETE response, adopting the existing bounded reader contract. Stop before an unreturned match; oversized individual metadata/ref is unavailable without skipped coverage. Empty filtered pages continue at last actually scanned sequence until the verified frontier; no empty success merely on a budget boundary. All retained matches remain reachable across pages. Cursor beyond frontier or stale continuation refuses. Rebuild stages a separate publication from verified retained CURRENT source and complete coverage; atomically withdraw old/publish new. Source-generation change requires SP-278 verified translation or a verified new publication and restarted traversal. Current permission/membership/source access, deletion tombstones and withdrawal are checked before disclosure and again after returning helpers. Authenticate original event/family/schema/receipt/source/publication against independent retained evidence; a hash/ref is not authority. A valid retained original remains readable after current owner state/roles change or live writer admission closes, including valid replay-only history. Historical guards never invoke current-writer action rules.

  Custody and physical binding: original canonical note/concern/action/operation records and authenticated commit/first/full-value receipt/source dependencies are non-rebuildable authority. Mandatory coherent backup/restore preserves them together under one verified Storage/source recovery boundary; mixed or missing originals fence mutation/disclosure. Projections cannot recreate lost authority. No raw note/title/reason/source/credentials/private account text or absolute local path in event/journal/checkpoint; use authenticated immutable refs, secret-screen every string and recheck source access/deletion at resolution. Preserve all original anchors/provenance/closure/lineage fields. Existing record keys and storage classes remain owned by SP-095/SP-666/CV-315/SP-233; note_record.v1 is compatibility lineage, not a new note subsystem. concern_assigned_operation uses canonical redb/coordination_and_storage advisory budget, canonical MessagePack and complete-value 16384-byte limit. concern_assigned_checkpoint uses derived redb/event_log hard budget, canonical MessagePack and complete-value 16384-byte limit. Measure every stored value independently; oversized mandatory metadata refuses, never truncates. Event bodies above the 16 KiB inline limit use SP-337 payload_ref with verified BLAKE3 identity, byte size and media type, not inline base64; externalizing an event does not waive any operation/checkpoint bound. Pressure cannot silently evict canonical authority; derived eviction makes History unavailable until verified rebuild.

  Retention: existing concern_record RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds bind only those already governed records. This exact event, its original operation/action custody and its History checkpoint have retention_policy_ref=PENDING_RETENTION_DECISION: Case L-3/SP-026 audit-authority/ordinary-telemetry groups and checkpoint RP-PROJECTION-3GEN are candidates only until the retention owners bind the exact family. No new duration, deletion, compaction, auto-expiry or hold release is chosen. Retention stays PARTIAL.

  Compatibility/withdrawal: keep all original payload bytes/ids/versions; original concern assigned 1.0.0 schema in Plans/event_payloads/concern/concern_assigned.schema.json remains immutable and selected only from independently authenticated original admission evidence; it is not a current 2.0.0 writer. Original valid history is interpreted with its authenticated write-time edition/recipe, not a caller-selected weaker recipe: the SP-1101 RetainedDispatcher resolves it from Storage's sealed custody, exact binding and an installed frozen recipe tuple that pins the edition's exact schema bytes (a legacy concern v1 edition keeps its original Draft 2020-12 type and number validation with the CV-1101 predicate installed); unavailable or unsupported originals refuse without fallback. StorageMigrationCoordinator installs each declared schema before activation; unknown editions/withdrawn sources disclose unavailable. Future versions require their own exact admission and verified projection rebuild. Close exact-family writer admission first, fence new mutations, settle existing original obligations under original custody without repeating effects, whole-value-CAS checkpoint withdrawn and refuse stale/staged/withdrawn publications; retained original read rights and legal deletion/holds remain owner-governed. No sibling/alias admission or current-writer permission follows.

  Oracles: Plans/card5_event_contracts/concern_assigned.fixtures.json and python3 scripts/pm-card5-event-contracts-check.py --family concern.assigned. Test closed payload/operation, recomputed identity/digest, original command/snapshot joins, phase/order/admission/refusal/replay/retry custody, current permission/currentness and exact action roles, retained historical reads after live changes, forged/foreign/withdrawn controls, enforced types/formats/LF/reference closure and bounded read/Storage metadata. Each negative is built from a valid named base, with coherent copies/digests/keys; changed semantic body is distinguished from Storage-assigned metadata. Every refusal goes through guard-table rows proved by the gated guard tool scripts/pm_guard_isolation.py (004bdedd63), credited per row in the lane report. C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool, CV-1101's datetime_validator and whole-Plans inventory gate run at batch-2 integration, and the batch Sol/Astra review has not run. Native authentication, owner atomicity, append/custody/durability, mapping approval, checkpoint CAS, coherent backup/recovery and disclosure races remain NOT_RUN. Membership ABSENT. No admission, executable task or native availability is asserted.
gui_related: true
gui_classification_reason: Exact concern or annotation action and visible audit History boundary.
split_recommended: false
depends_on:
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- concern.assigned has its own contract; membership ABSENT, retention PENDING_RETENTION_DECISION, native NOT_RUN.
- Preserve exact Card 5.b A recording and confirmation roles without expansion.
validation_surfaces:
- python3 scripts/pm-card5-event-contracts-check.py --family concern.assigned
risk_class: event_authority
reasoning_tier: high
context_scope: concern_assigned
implementation_surfaces:
- Plans/card5_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-438
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- concern.assigned
- DL-438
- PENDING_RETENTION_DECISION
negative_constraints:
- No admission, new recording privilege beyond option A, duplicate note co-emission or invented retention.
```

### F3-710 - concern.evidence_linked Card 5 exact-family contract

```yaml
plan_unit_id: F3-710
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Newly authored owner contract for concern.evidence_linked 2.0.0 under DL-045 and DL-439, deck-2 Card 5.c option A. Prepared without admission. Semantic owners remain Orchestrator_Page OP-002/OP-004 and UCC-147; this exact-family unit supplies the missing technical bindings and applies only the approved Card 5 action. The seven pre-round prepared contracts remain unchanged. Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here. Jared's answer was "i approve all of it". The as-presented deck's fast-reply rule selects A; the following is the card's option text, not a quotation attributed to Jared:

  Let authorized users and the authorized Puppet Master controller add evidence through the concern action, after checking source access and the latest saved concern version. Ordinary additions need no extra confirmation. Removing or replacing evidence needs its separate authorized action. Save who linked what.

  Authorized controller means Puppet Master's permitted coordinating software for that part of the work, including package and seam controllers. Responsible owner means the assigned person, agent or component; assignment alone grants no additional permission. Workers propose and never gain direct recording permission. Preserve access checks, current supporting evidence, allowed transitions, and all existing critical/security/governance/human-approval requirements. The creator, responsible owner, resolver, confirmer and recording controller remain distinct roles. A role spelling or ref is never an authorization credential.

  Payload and scope: the exact closed schema is Plans/card5_event_contracts/concern_evidence_linked.payload.schema.json; its $id is pm.card5.concern_evidence_linked.payload.v2, version 2.0.0. Only Project EventRecord 2.0.0: scope_kind=project, project_id must join original command, record and independently verified Storage evidence. scope_partition is project~base64url_no_pad(UTF8(project_id)), with no active/focus/default Project or application substitution. Subject identity is concern_id; creator and original identity never change under assignment, promotion, reopening, resolution or assessment. Envelope actor_ref, occurred_at_utc=ts, correlation_id, idempotency_key and payload schema join the frozen original; original authenticated thread/run/node/attempt/account/parent/causation context joins independently or is explicit null, never parsed from opaque refs. Storage assigns sequence, observed/persisted timestamps and receipt offsets; payload/caller metadata cannot override them.

  Producer and identity: cmd.concern.link_evidence through handlers::concern::link_evidence is the exact owning handler after independently authenticated action authority. UCC-147 retains its public command fields; the closed normalized action custody is private and grants no extra caller fields or privileges. H=lowercase SHA-256(canonical MessagePack [storage_instance_id, project_id, "concern.evidence_linked", idempotency_key]); operation_digest=H and event_id=evt_concern_evidence_linked_H. Subject ids are preserved from canonical owner state (creation allocates/fixes its original annotation identity once). Request digest=lowercase SHA-256(canonical MessagePack {original_command, payload, before, after}), containing every field, including authority/confirmations/evidence, exact original command, immutable before/after revision refs and facts. Frozen original schema Plans/card5_event_contracts/concern_evidence_linked.operation.schema.json is closed, private canonical authority. before/after are complete action snapshots of the fields defined by that schema plus immutable refs committing to the full owner records; they do not replace the full canonical record. A ref cannot stand in for readback/authentication. All shared copies and snapshot effects join field by field. Exact types precede comparisons; use the existing canonical MessagePack codec without coercion, a new numeric cap or a lane-local serializer. Numbers follow CV-1100/SP-1100 (loads_current_json, current_integer within each slot's own bounds, no lane cap); timestamps follow CV-1101 through the shared date_time predicate (EventRecord profile for payload ts, CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds). New schemas add no numeric upper limit. Existing date-time/UUID validation is enforced through the existing full-match/Gregorian format checker, not optional jsonschema format support.

  Ordering: exact event-family admission FIRST, before journal, body commit, owner mutation, append, side effect or checkpoint advance. Registry membership remains ABSENT and refuses family_not_admitted; synthetic future-admission fixtures grant nothing. Current writer and retry use dedupe_by_idempotency_key only; projector_replay_only refuses replay_only_not_appendable before effects. Authenticate membership, permissions/source access, actual current owner revision, single-writer lease, canonical allowed action and existing approval evidence under the same commit fence. Resolve immutable evidence/body refs and secret-screen all strings. Freeze prepared original with all four receipt/result refs null at concern_evidence_linked_operation.v1:{project_id}:{operation_digest}. Atomically whole-value-CAS the original owner revision and complete canonical after-record plus committed operation in ONE canonical-redb transaction; committed has owner_commit_ref/result_ref/dispatch_receipt_ref nonnull and original_append_result_ref null. Large dependent bodies must be durable and authenticated before this atomic commit. A failed/no-change/stale/refused action produces no event. Missing atomicity or ambiguous original commit fences the action.

  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 and its full-value v2 successor. After independently authenticated original owner commit/readback, append only the frozen candidate; join original EventRecord, Storage/source identity, semantic payload, eleven-field first AppendReceipt and retained four-field original_append_result. Storage metadata is verified against the independently retained Storage record. Only whole-value committed->settled CAS with all four original refs nonnull publishes terminal success. Prepared abandonment requires authenticated commit/append absence; uncertain append remains fenced. Committed recovery resolves the ORIGINAL append, settled same-key/same-caller-body retries return its exact original result/receipt. Same scoped key with changed caller semantic body is idempotency_conflict; unavailable authoritative dedupe is dedupe_unavailable, zero effect. No renewed timestamp, reclassification, reconfirmation, second effect or append. Storage-assigned metadata does not participate in caller-body retry comparison. Replay and History never dispatch cmd.concern.link_evidence or any linked action. Current live facts do not invalidate a valid retained original or its exact retry; original admission/version/recipe selection must be independently authenticated, never selected by a caller.

  Exact effect: additive evidence links only, preserving existing evidence, identity, owner, lifecycle and all unrelated record facts. Authorized user or scoped authorized controller may record via cmd.concern.link_evidence, after source access and latest saved revision verification. Ordinary additions require no extra confirmation. Save who linked which immutable source in action_ref. Worker proposals grant no record permission. Destructive replacement/removal is refused by this action and requires its own separately authorized action; an already-linked-only set is no change and emits nothing.

  Consumers/checkpoints: newly authored projector.concern_evidence_linked.history@1.0.0 and reader.concern_evidence_linked.history@1.0.0 expose passive record-backed audit History for this exact family. Orchestrator concern History/inspector is the named operating consumer; it follows canonical source routes and never invokes an action from an event replay. Explicitly adopt SP-278/DL-076: concern_evidence_linked_checkpoint.v1:{project_id}:{storage_instance_id}, closed schema Plans/card5_event_contracts/concern_evidence_linked.checkpoint.schema.json. Complete CURRENT-selected EventRecord index and nine-field durable index_read_token, no persisted redb_snapshot_id. Before every scan/read/CAS join actual live Storage/redb snapshot, scope, source-selection/generation, publication and original event context. Scan all source sequences through the captured frontier; unsupported/corrupt/inadmissible originals are unavailable, not skipped. Atomically whole-value CAS prior token/publication/state/frontier/last_event_id to complete verified coverage in one derived-redb transaction. last_event_id is last exact match or null, through_sequence_id is scanned coverage; no accumulated event refs or unbounded checkpoint array. Registry absence forbids advance; withdrawal/unknown schemas fence it.

  History request uses publication_id, exact durable token, unsigned after_sequence_id. Closed response is {publication_id,index_read_token,after_sequence_id,event_refs,complete} with at most 256 scanned source sequences, 64 matching refs and 16384 canonical MessagePack bytes for the COMPLETE response, adopting the existing bounded reader contract. Stop before an unreturned match; oversized individual metadata/ref is unavailable without skipped coverage. Empty filtered pages continue at last actually scanned sequence until the verified frontier; no empty success merely on a budget boundary. All retained matches remain reachable across pages. Cursor beyond frontier or stale continuation refuses. Rebuild stages a separate publication from verified retained CURRENT source and complete coverage; atomically withdraw old/publish new. Source-generation change requires SP-278 verified translation or a verified new publication and restarted traversal. Current permission/membership/source access, deletion tombstones and withdrawal are checked before disclosure and again after returning helpers. Authenticate original event/family/schema/receipt/source/publication against independent retained evidence; a hash/ref is not authority. A valid retained original remains readable after current owner state/roles change or live writer admission closes, including valid replay-only history. Historical guards never invoke current-writer action rules.

  Custody and physical binding: original canonical note/concern/action/operation records and authenticated commit/first/full-value receipt/source dependencies are non-rebuildable authority. Mandatory coherent backup/restore preserves them together under one verified Storage/source recovery boundary; mixed or missing originals fence mutation/disclosure. Projections cannot recreate lost authority. No raw note/title/reason/source/credentials/private account text or absolute local path in event/journal/checkpoint; use authenticated immutable refs, secret-screen every string and recheck source access/deletion at resolution. Preserve all original anchors/provenance/closure/lineage fields. Existing record keys and storage classes remain owned by SP-095/SP-666/CV-315/SP-233; note_record.v1 is compatibility lineage, not a new note subsystem. concern_evidence_linked_operation uses canonical redb/coordination_and_storage advisory budget, canonical MessagePack and complete-value 16384-byte limit. concern_evidence_linked_checkpoint uses derived redb/event_log hard budget, canonical MessagePack and complete-value 16384-byte limit. Measure every stored value independently; oversized mandatory metadata refuses, never truncates. Event bodies above the 16 KiB inline limit use SP-337 payload_ref with verified BLAKE3 identity, byte size and media type, not inline base64; externalizing an event does not waive any operation/checkpoint bound. Pressure cannot silently evict canonical authority; derived eviction makes History unavailable until verified rebuild.

  Retention: existing concern_record RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds bind only those already governed records. This exact event, its original operation/action custody and its History checkpoint have retention_policy_ref=PENDING_RETENTION_DECISION: Case L-3/SP-026 audit-authority/ordinary-telemetry groups and checkpoint RP-PROJECTION-3GEN are candidates only until the retention owners bind the exact family. No new duration, deletion, compaction, auto-expiry or hold release is chosen. Retention stays PARTIAL.

  Compatibility/withdrawal: keep all original payload bytes/ids/versions; original concern evidence_linked 1.0.0 schema in Plans/event_payloads/concern/concern_evidence_linked.schema.json remains immutable and selected only from independently authenticated original admission evidence; it is not a current 2.0.0 writer. Original valid history is interpreted with its authenticated write-time edition/recipe, not a caller-selected weaker recipe: the SP-1101 RetainedDispatcher resolves it from Storage's sealed custody, exact binding and an installed frozen recipe tuple that pins the edition's exact schema bytes (a legacy concern v1 edition keeps its original Draft 2020-12 type and number validation with the CV-1101 predicate installed); unavailable or unsupported originals refuse without fallback. StorageMigrationCoordinator installs each declared schema before activation; unknown editions/withdrawn sources disclose unavailable. Future versions require their own exact admission and verified projection rebuild. Close exact-family writer admission first, fence new mutations, settle existing original obligations under original custody without repeating effects, whole-value-CAS checkpoint withdrawn and refuse stale/staged/withdrawn publications; retained original read rights and legal deletion/holds remain owner-governed. No sibling/alias admission or current-writer permission follows.

  Oracles: Plans/card5_event_contracts/concern_evidence_linked.fixtures.json and python3 scripts/pm-card5-event-contracts-check.py --family concern.evidence_linked. Test closed payload/operation, recomputed identity/digest, original command/snapshot joins, phase/order/admission/refusal/replay/retry custody, current permission/currentness and exact action roles, retained historical reads after live changes, forged/foreign/withdrawn controls, enforced types/formats/LF/reference closure and bounded read/Storage metadata. Each negative is built from a valid named base, with coherent copies/digests/keys; changed semantic body is distinguished from Storage-assigned metadata. Every refusal goes through guard-table rows proved by the gated guard tool scripts/pm_guard_isolation.py (004bdedd63), credited per row in the lane report. C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool, CV-1101's datetime_validator and whole-Plans inventory gate run at batch-2 integration, and the batch Sol/Astra review has not run. Native authentication, owner atomicity, append/custody/durability, mapping approval, checkpoint CAS, coherent backup/recovery and disclosure races remain NOT_RUN. Membership ABSENT. No admission, executable task or native availability is asserted.
gui_related: true
gui_classification_reason: Exact concern or annotation action and visible audit History boundary.
split_recommended: false
depends_on:
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- concern.evidence_linked has its own contract; membership ABSENT, retention PENDING_RETENTION_DECISION, native NOT_RUN.
- Preserve exact Card 5.c A recording and confirmation roles without expansion.
validation_surfaces:
- python3 scripts/pm-card5-event-contracts-check.py --family concern.evidence_linked
risk_class: event_authority
reasoning_tier: high
context_scope: concern_evidence_linked
implementation_surfaces:
- Plans/card5_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-439
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- concern.evidence_linked
- DL-439
- PENDING_RETENTION_DECISION
negative_constraints:
- No admission, new recording privilege beyond option A, duplicate note co-emission or invented retention.
```

### F3-711 - concern.promoted Card 5 exact-family contract

```yaml
plan_unit_id: F3-711
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Newly authored owner contract for concern.promoted 2.0.0 under DL-045 and DL-440, deck-2 Card 5.d option A. Prepared without admission. Semantic owners remain Orchestrator_Page OP-002/OP-004 and UCC-147; this exact-family unit supplies the missing technical bindings and applies only the approved Card 5 action. The seven pre-round prepared contracts remain unchanged. Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here. Jared's answer was "i approve all of it". The as-presented deck's fast-reply rule selects A; the following is the card's option text, not a quotation attributed to Jared:

  The authorized Puppet Master controller records the move after required evidence and approval checks. Users request it or answer a required human approval; workers nominate. Ordinary automation stays automatic. Existing critical, security and governance approval rules still require their stated approval. You are asked only at a required human approval step. If this promotion also changes the responsible owner, follow your selected 5.b rule as well, including its reassignment recorder and transfer confirmations.

  Authorized controller means Puppet Master's permitted coordinating software for that part of the work, including package and seam controllers. Responsible owner means the assigned person, agent or component; assignment alone grants no additional permission. Workers propose and never gain direct recording permission. Preserve access checks, current supporting evidence, allowed transitions, and all existing critical/security/governance/human-approval requirements. The creator, responsible owner, resolver, confirmer and recording controller remain distinct roles. A role spelling or ref is never an authorization credential.

  Payload and scope: the exact closed schema is Plans/card5_event_contracts/concern_promoted.payload.schema.json; its $id is pm.card5.concern_promoted.payload.v2, version 2.0.0. Only Project EventRecord 2.0.0: scope_kind=project, project_id must join original command, record and independently verified Storage evidence. scope_partition is project~base64url_no_pad(UTF8(project_id)), with no active/focus/default Project or application substitution. Subject identity is concern_id; creator and original identity never change under assignment, promotion, reopening, resolution or assessment. Envelope actor_ref, occurred_at_utc=ts, correlation_id, idempotency_key and payload schema join the frozen original; original authenticated thread/run/node/attempt/account/parent/causation context joins independently or is explicit null, never parsed from opaque refs. Storage assigns sequence, observed/persisted timestamps and receipt offsets; payload/caller metadata cannot override them.

  Producer and identity: cmd.concern.promote through handlers::concern::promote is the exact owning handler after independently authenticated action authority. UCC-147 retains its public command fields; the closed normalized action custody is private and grants no extra caller fields or privileges. H=lowercase SHA-256(canonical MessagePack [storage_instance_id, project_id, "concern.promoted", idempotency_key]); operation_digest=H and event_id=evt_concern_promoted_H. Subject ids are preserved from canonical owner state (creation allocates/fixes its original annotation identity once). Request digest=lowercase SHA-256(canonical MessagePack {original_command, payload, before, after}), containing every field, including authority/confirmations/evidence, exact original command, immutable before/after revision refs and facts. Frozen original schema Plans/card5_event_contracts/concern_promoted.operation.schema.json is closed, private canonical authority. before/after are complete action snapshots of the fields defined by that schema plus immutable refs committing to the full owner records; they do not replace the full canonical record. A ref cannot stand in for readback/authentication. All shared copies and snapshot effects join field by field. Exact types precede comparisons; use the existing canonical MessagePack codec without coercion, a new numeric cap or a lane-local serializer. Numbers follow CV-1100/SP-1100 (loads_current_json, current_integer within each slot's own bounds, no lane cap); timestamps follow CV-1101 through the shared date_time predicate (EventRecord profile for payload ts, CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds). New schemas add no numeric upper limit. Existing date-time/UUID validation is enforced through the existing full-match/Gregorian format checker, not optional jsonschema format support.

  Ordering: exact event-family admission FIRST, before journal, body commit, owner mutation, append, side effect or checkpoint advance. Registry membership remains ABSENT and refuses family_not_admitted; synthetic future-admission fixtures grant nothing. Current writer and retry use dedupe_by_idempotency_key only; projector_replay_only refuses replay_only_not_appendable before effects. Authenticate membership, permissions/source access, actual current owner revision, single-writer lease, canonical allowed action and existing approval evidence under the same commit fence. Resolve immutable evidence/body refs and secret-screen all strings. Freeze prepared original with all four receipt/result refs null at concern_promoted_operation.v1:{project_id}:{operation_digest}. Atomically whole-value-CAS the original owner revision and complete canonical after-record plus committed operation in ONE canonical-redb transaction; committed has owner_commit_ref/result_ref/dispatch_receipt_ref nonnull and original_append_result_ref null. Large dependent bodies must be durable and authenticated before this atomic commit. A failed/no-change/stale/refused action produces no event. Missing atomicity or ambiguous original commit fences the action.

  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 and its full-value v2 successor. After independently authenticated original owner commit/readback, append only the frozen candidate; join original EventRecord, Storage/source identity, semantic payload, eleven-field first AppendReceipt and retained four-field original_append_result. Storage metadata is verified against the independently retained Storage record. Only whole-value committed->settled CAS with all four original refs nonnull publishes terminal success. Prepared abandonment requires authenticated commit/append absence; uncertain append remains fenced. Committed recovery resolves the ORIGINAL append, settled same-key/same-caller-body retries return its exact original result/receipt. Same scoped key with changed caller semantic body is idempotency_conflict; unavailable authoritative dedupe is dedupe_unavailable, zero effect. No renewed timestamp, reclassification, reconfirmation, second effect or append. Storage-assigned metadata does not participate in caller-body retry comparison. Replay and History never dispatch cmd.concern.promote or any linked action. Current live facts do not invalidate a valid retained original or its exact retry; original admission/version/recipe selection must be independently authenticated, never selected by a caller.

  Exact effect: authenticated wider responsibility scope, never merely a severity/display edit; retain concern identity/creator and existing canonical promotion/gate/evidence/receipt links under CV-315/SP-233. Authorized scoped controller records after gate/evidence/approval checks; user requests or answers a true required human approval and worker nominates. Ordinary automation remains automatic, with no routine added human prompt. Required critical/security/governance/HITL approvals remain mandatory. If responsible owner changes too, require the full F3-709/DL-438 transfer contract including outgoing-human approval and receiving-owner explicit acceptance; save linked transfer proof, never manufacture it from recording the promotion. Promotion and transfer obligations are validated together under the same owner transaction; neither event substitutes for the other distinct mutation.

  Consumers/checkpoints: newly authored projector.concern_promoted.history@1.0.0 and reader.concern_promoted.history@1.0.0 expose passive record-backed audit History for this exact family. Orchestrator concern History/inspector is the named operating consumer; it follows canonical source routes and never invokes an action from an event replay. Explicitly adopt SP-278/DL-076: concern_promoted_checkpoint.v1:{project_id}:{storage_instance_id}, closed schema Plans/card5_event_contracts/concern_promoted.checkpoint.schema.json. Complete CURRENT-selected EventRecord index and nine-field durable index_read_token, no persisted redb_snapshot_id. Before every scan/read/CAS join actual live Storage/redb snapshot, scope, source-selection/generation, publication and original event context. Scan all source sequences through the captured frontier; unsupported/corrupt/inadmissible originals are unavailable, not skipped. Atomically whole-value CAS prior token/publication/state/frontier/last_event_id to complete verified coverage in one derived-redb transaction. last_event_id is last exact match or null, through_sequence_id is scanned coverage; no accumulated event refs or unbounded checkpoint array. Registry absence forbids advance; withdrawal/unknown schemas fence it.

  History request uses publication_id, exact durable token, unsigned after_sequence_id. Closed response is {publication_id,index_read_token,after_sequence_id,event_refs,complete} with at most 256 scanned source sequences, 64 matching refs and 16384 canonical MessagePack bytes for the COMPLETE response, adopting the existing bounded reader contract. Stop before an unreturned match; oversized individual metadata/ref is unavailable without skipped coverage. Empty filtered pages continue at last actually scanned sequence until the verified frontier; no empty success merely on a budget boundary. All retained matches remain reachable across pages. Cursor beyond frontier or stale continuation refuses. Rebuild stages a separate publication from verified retained CURRENT source and complete coverage; atomically withdraw old/publish new. Source-generation change requires SP-278 verified translation or a verified new publication and restarted traversal. Current permission/membership/source access, deletion tombstones and withdrawal are checked before disclosure and again after returning helpers. Authenticate original event/family/schema/receipt/source/publication against independent retained evidence; a hash/ref is not authority. A valid retained original remains readable after current owner state/roles change or live writer admission closes, including valid replay-only history. Historical guards never invoke current-writer action rules.

  Custody and physical binding: original canonical note/concern/action/operation records and authenticated commit/first/full-value receipt/source dependencies are non-rebuildable authority. Mandatory coherent backup/restore preserves them together under one verified Storage/source recovery boundary; mixed or missing originals fence mutation/disclosure. Projections cannot recreate lost authority. No raw note/title/reason/source/credentials/private account text or absolute local path in event/journal/checkpoint; use authenticated immutable refs, secret-screen every string and recheck source access/deletion at resolution. Preserve all original anchors/provenance/closure/lineage fields. Existing record keys and storage classes remain owned by SP-095/SP-666/CV-315/SP-233; note_record.v1 is compatibility lineage, not a new note subsystem. concern_promoted_operation uses canonical redb/coordination_and_storage advisory budget, canonical MessagePack and complete-value 16384-byte limit. concern_promoted_checkpoint uses derived redb/event_log hard budget, canonical MessagePack and complete-value 16384-byte limit. Measure every stored value independently; oversized mandatory metadata refuses, never truncates. Event bodies above the 16 KiB inline limit use SP-337 payload_ref with verified BLAKE3 identity, byte size and media type, not inline base64; externalizing an event does not waive any operation/checkpoint bound. Pressure cannot silently evict canonical authority; derived eviction makes History unavailable until verified rebuild.

  Retention: existing concern_record RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds bind only those already governed records. This exact event, its original operation/action custody and its History checkpoint have retention_policy_ref=PENDING_RETENTION_DECISION: Case L-3/SP-026 audit-authority/ordinary-telemetry groups and checkpoint RP-PROJECTION-3GEN are candidates only until the retention owners bind the exact family. No new duration, deletion, compaction, auto-expiry or hold release is chosen. Retention stays PARTIAL.

  Compatibility/withdrawal: keep all original payload bytes/ids/versions; original concern promoted 1.0.0 schema in Plans/event_payloads/concern/concern_promoted.schema.json remains immutable and selected only from independently authenticated original admission evidence; it is not a current 2.0.0 writer. Original valid history is interpreted with its authenticated write-time edition/recipe, not a caller-selected weaker recipe: the SP-1101 RetainedDispatcher resolves it from Storage's sealed custody, exact binding and an installed frozen recipe tuple that pins the edition's exact schema bytes (a legacy concern v1 edition keeps its original Draft 2020-12 type and number validation with the CV-1101 predicate installed); unavailable or unsupported originals refuse without fallback. StorageMigrationCoordinator installs each declared schema before activation; unknown editions/withdrawn sources disclose unavailable. Future versions require their own exact admission and verified projection rebuild. Close exact-family writer admission first, fence new mutations, settle existing original obligations under original custody without repeating effects, whole-value-CAS checkpoint withdrawn and refuse stale/staged/withdrawn publications; retained original read rights and legal deletion/holds remain owner-governed. No sibling/alias admission or current-writer permission follows.

  Oracles: Plans/card5_event_contracts/concern_promoted.fixtures.json and python3 scripts/pm-card5-event-contracts-check.py --family concern.promoted. Test closed payload/operation, recomputed identity/digest, original command/snapshot joins, phase/order/admission/refusal/replay/retry custody, current permission/currentness and exact action roles, retained historical reads after live changes, forged/foreign/withdrawn controls, enforced types/formats/LF/reference closure and bounded read/Storage metadata. Each negative is built from a valid named base, with coherent copies/digests/keys; changed semantic body is distinguished from Storage-assigned metadata. Every refusal goes through guard-table rows proved by the gated guard tool scripts/pm_guard_isolation.py (004bdedd63), credited per row in the lane report. C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool, CV-1101's datetime_validator and whole-Plans inventory gate run at batch-2 integration, and the batch Sol/Astra review has not run. Native authentication, owner atomicity, append/custody/durability, mapping approval, checkpoint CAS, coherent backup/recovery and disclosure races remain NOT_RUN. Membership ABSENT. No admission, executable task or native availability is asserted.
gui_related: true
gui_classification_reason: Exact concern or annotation action and visible audit History boundary.
split_recommended: false
depends_on:
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- concern.promoted has its own contract; membership ABSENT, retention PENDING_RETENTION_DECISION, native NOT_RUN.
- Preserve exact Card 5.d A recording and confirmation roles without expansion.
validation_surfaces:
- python3 scripts/pm-card5-event-contracts-check.py --family concern.promoted
risk_class: event_authority
reasoning_tier: high
context_scope: concern_promoted
implementation_surfaces:
- Plans/card5_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-440
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- concern.promoted
- DL-440
- PENDING_RETENTION_DECISION
negative_constraints:
- No admission, new recording privilege beyond option A, duplicate note co-emission or invented retention.
```

### F3-712 - concern.reopened Card 5 exact-family contract

```yaml
plan_unit_id: F3-712
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Newly authored owner contract for concern.reopened 2.0.0 under DL-045 and DL-441, deck-2 Card 5.e option A. Prepared without admission. Semantic owners remain Orchestrator_Page OP-002/OP-004 and UCC-147; this exact-family unit supplies the missing technical bindings and applies only the approved Card 5 action. The seven pre-round prepared contracts remain unchanged. Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here. Jared's answer was "i approve all of it". The as-presented deck's fast-reply rule selects A; the following is the card's option text, not a quotation attributed to Jared:

  The currently responsible, authorized concern owner records reopening on that new evidence. Users and workers may request it. Save the reason and prior closure history; ask for extra confirmation only where existing critical/human-approval policy requires it. Valid new evidence can reopen the issue without a routine prompt.

  Authorized controller means Puppet Master's permitted coordinating software for that part of the work, including package and seam controllers. Responsible owner means the assigned person, agent or component; assignment alone grants no additional permission. Workers propose and never gain direct recording permission. Preserve access checks, current supporting evidence, allowed transitions, and all existing critical/security/governance/human-approval requirements. The creator, responsible owner, resolver, confirmer and recording controller remain distinct roles. A role spelling or ref is never an authorization credential.

  Payload and scope: the exact closed schema is Plans/card5_event_contracts/concern_reopened.payload.schema.json; its $id is pm.card5.concern_reopened.payload.v2, version 2.0.0. Only Project EventRecord 2.0.0: scope_kind=project, project_id must join original command, record and independently verified Storage evidence. scope_partition is project~base64url_no_pad(UTF8(project_id)), with no active/focus/default Project or application substitution. Subject identity is concern_id; creator and original identity never change under assignment, promotion, reopening, resolution or assessment. Envelope actor_ref, occurred_at_utc=ts, correlation_id, idempotency_key and payload schema join the frozen original; original authenticated thread/run/node/attempt/account/parent/causation context joins independently or is explicit null, never parsed from opaque refs. Storage assigns sequence, observed/persisted timestamps and receipt offsets; payload/caller metadata cannot override them.

  Producer and identity: cmd.concern.reopen through handlers::concern::reopen is the exact owning handler after independently authenticated action authority. UCC-147 retains its public command fields; the closed normalized action custody is private and grants no extra caller fields or privileges. H=lowercase SHA-256(canonical MessagePack [storage_instance_id, project_id, "concern.reopened", idempotency_key]); operation_digest=H and event_id=evt_concern_reopened_H. Subject ids are preserved from canonical owner state (creation allocates/fixes its original annotation identity once). Request digest=lowercase SHA-256(canonical MessagePack {original_command, payload, before, after}), containing every field, including authority/confirmations/evidence, exact original command, immutable before/after revision refs and facts. Frozen original schema Plans/card5_event_contracts/concern_reopened.operation.schema.json is closed, private canonical authority. before/after are complete action snapshots of the fields defined by that schema plus immutable refs committing to the full owner records; they do not replace the full canonical record. A ref cannot stand in for readback/authentication. All shared copies and snapshot effects join field by field. Exact types precede comparisons; use the existing canonical MessagePack codec without coercion, a new numeric cap or a lane-local serializer. Numbers follow CV-1100/SP-1100 (loads_current_json, current_integer within each slot's own bounds, no lane cap); timestamps follow CV-1101 through the shared date_time predicate (EventRecord profile for payload ts, CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds). New schemas add no numeric upper limit. Existing date-time/UUID validation is enforced through the existing full-match/Gregorian format checker, not optional jsonschema format support.

  Ordering: exact event-family admission FIRST, before journal, body commit, owner mutation, append, side effect or checkpoint advance. Registry membership remains ABSENT and refuses family_not_admitted; synthetic future-admission fixtures grant nothing. Current writer and retry use dedupe_by_idempotency_key only; projector_replay_only refuses replay_only_not_appendable before effects. Authenticate membership, permissions/source access, actual current owner revision, single-writer lease, canonical allowed action and existing approval evidence under the same commit fence. Resolve immutable evidence/body refs and secret-screen all strings. Freeze prepared original with all four receipt/result refs null at concern_reopened_operation.v1:{project_id}:{operation_digest}. Atomically whole-value-CAS the original owner revision and complete canonical after-record plus committed operation in ONE canonical-redb transaction; committed has owner_commit_ref/result_ref/dispatch_receipt_ref nonnull and original_append_result_ref null. Large dependent bodies must be durable and authenticated before this atomic commit. A failed/no-change/stale/refused action produces no event. Missing atomicity or ambiguous original commit fences the action.

  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 and its full-value v2 successor. After independently authenticated original owner commit/readback, append only the frozen candidate; join original EventRecord, Storage/source identity, semantic payload, eleven-field first AppendReceipt and retained four-field original_append_result. Storage metadata is verified against the independently retained Storage record. Only whole-value committed->settled CAS with all four original refs nonnull publishes terminal success. Prepared abandonment requires authenticated commit/append absence; uncertain append remains fenced. Committed recovery resolves the ORIGINAL append, settled same-key/same-caller-body retries return its exact original result/receipt. Same scoped key with changed caller semantic body is idempotency_conflict; unavailable authoritative dedupe is dedupe_unavailable, zero effect. No renewed timestamp, reclassification, reconfirmation, second effect or append. Storage-assigned metadata does not participate in caller-body retry comparison. Replay and History never dispatch cmd.concern.reopen or any linked action. Current live facts do not invalidate a valid retained original or its exact retry; original admission/version/recipe selection must be independently authenticated, never selected by a caller.

  Exact transition: resolved|dismissed -> active on new current evidence invalidating that original closure. Recorder must be the currently responsible AND independently authorized owner (person/agent/component); assignment/creator title alone does not grant permission. Users and workers request; workers never record directly. Retain reason, new evidence, immutable prior-terminal ref and complete prior closure/lineage; do not overwrite old closure history. Extra confirmation only where existing critical/HITL policy requires it. Owner, scope, assessment, creator and evidence set remain unchanged unless their separately authorized linked actions commit; the reopening action records its new supporting evidence as immutable action custody, not an implicit evidence-removal action.

  Consumers/checkpoints: newly authored projector.concern_reopened.history@1.0.0 and reader.concern_reopened.history@1.0.0 expose passive record-backed audit History for this exact family. Orchestrator concern History/inspector is the named operating consumer; it follows canonical source routes and never invokes an action from an event replay. Explicitly adopt SP-278/DL-076: concern_reopened_checkpoint.v1:{project_id}:{storage_instance_id}, closed schema Plans/card5_event_contracts/concern_reopened.checkpoint.schema.json. Complete CURRENT-selected EventRecord index and nine-field durable index_read_token, no persisted redb_snapshot_id. Before every scan/read/CAS join actual live Storage/redb snapshot, scope, source-selection/generation, publication and original event context. Scan all source sequences through the captured frontier; unsupported/corrupt/inadmissible originals are unavailable, not skipped. Atomically whole-value CAS prior token/publication/state/frontier/last_event_id to complete verified coverage in one derived-redb transaction. last_event_id is last exact match or null, through_sequence_id is scanned coverage; no accumulated event refs or unbounded checkpoint array. Registry absence forbids advance; withdrawal/unknown schemas fence it.

  History request uses publication_id, exact durable token, unsigned after_sequence_id. Closed response is {publication_id,index_read_token,after_sequence_id,event_refs,complete} with at most 256 scanned source sequences, 64 matching refs and 16384 canonical MessagePack bytes for the COMPLETE response, adopting the existing bounded reader contract. Stop before an unreturned match; oversized individual metadata/ref is unavailable without skipped coverage. Empty filtered pages continue at last actually scanned sequence until the verified frontier; no empty success merely on a budget boundary. All retained matches remain reachable across pages. Cursor beyond frontier or stale continuation refuses. Rebuild stages a separate publication from verified retained CURRENT source and complete coverage; atomically withdraw old/publish new. Source-generation change requires SP-278 verified translation or a verified new publication and restarted traversal. Current permission/membership/source access, deletion tombstones and withdrawal are checked before disclosure and again after returning helpers. Authenticate original event/family/schema/receipt/source/publication against independent retained evidence; a hash/ref is not authority. A valid retained original remains readable after current owner state/roles change or live writer admission closes, including valid replay-only history. Historical guards never invoke current-writer action rules.

  Custody and physical binding: original canonical note/concern/action/operation records and authenticated commit/first/full-value receipt/source dependencies are non-rebuildable authority. Mandatory coherent backup/restore preserves them together under one verified Storage/source recovery boundary; mixed or missing originals fence mutation/disclosure. Projections cannot recreate lost authority. No raw note/title/reason/source/credentials/private account text or absolute local path in event/journal/checkpoint; use authenticated immutable refs, secret-screen every string and recheck source access/deletion at resolution. Preserve all original anchors/provenance/closure/lineage fields. Existing record keys and storage classes remain owned by SP-095/SP-666/CV-315/SP-233; note_record.v1 is compatibility lineage, not a new note subsystem. concern_reopened_operation uses canonical redb/coordination_and_storage advisory budget, canonical MessagePack and complete-value 16384-byte limit. concern_reopened_checkpoint uses derived redb/event_log hard budget, canonical MessagePack and complete-value 16384-byte limit. Measure every stored value independently; oversized mandatory metadata refuses, never truncates. Event bodies above the 16 KiB inline limit use SP-337 payload_ref with verified BLAKE3 identity, byte size and media type, not inline base64; externalizing an event does not waive any operation/checkpoint bound. Pressure cannot silently evict canonical authority; derived eviction makes History unavailable until verified rebuild.

  Retention: existing concern_record RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds bind only those already governed records. This exact event, its original operation/action custody and its History checkpoint have retention_policy_ref=PENDING_RETENTION_DECISION: Case L-3/SP-026 audit-authority/ordinary-telemetry groups and checkpoint RP-PROJECTION-3GEN are candidates only until the retention owners bind the exact family. No new duration, deletion, compaction, auto-expiry or hold release is chosen. Retention stays PARTIAL.

  Compatibility/withdrawal: keep all original payload bytes/ids/versions; original concern reopened 1.0.0 schema in Plans/event_payloads/concern/concern_reopened.schema.json remains immutable and selected only from independently authenticated original admission evidence; it is not a current 2.0.0 writer. Original valid history is interpreted with its authenticated write-time edition/recipe, not a caller-selected weaker recipe: the SP-1101 RetainedDispatcher resolves it from Storage's sealed custody, exact binding and an installed frozen recipe tuple that pins the edition's exact schema bytes (a legacy concern v1 edition keeps its original Draft 2020-12 type and number validation with the CV-1101 predicate installed); unavailable or unsupported originals refuse without fallback. StorageMigrationCoordinator installs each declared schema before activation; unknown editions/withdrawn sources disclose unavailable. Future versions require their own exact admission and verified projection rebuild. Close exact-family writer admission first, fence new mutations, settle existing original obligations under original custody without repeating effects, whole-value-CAS checkpoint withdrawn and refuse stale/staged/withdrawn publications; retained original read rights and legal deletion/holds remain owner-governed. No sibling/alias admission or current-writer permission follows.

  Oracles: Plans/card5_event_contracts/concern_reopened.fixtures.json and python3 scripts/pm-card5-event-contracts-check.py --family concern.reopened. Test closed payload/operation, recomputed identity/digest, original command/snapshot joins, phase/order/admission/refusal/replay/retry custody, current permission/currentness and exact action roles, retained historical reads after live changes, forged/foreign/withdrawn controls, enforced types/formats/LF/reference closure and bounded read/Storage metadata. Each negative is built from a valid named base, with coherent copies/digests/keys; changed semantic body is distinguished from Storage-assigned metadata. Every refusal goes through guard-table rows proved by the gated guard tool scripts/pm_guard_isolation.py (004bdedd63), credited per row in the lane report. C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool, CV-1101's datetime_validator and whole-Plans inventory gate run at batch-2 integration, and the batch Sol/Astra review has not run. Native authentication, owner atomicity, append/custody/durability, mapping approval, checkpoint CAS, coherent backup/recovery and disclosure races remain NOT_RUN. Membership ABSENT. No admission, executable task or native availability is asserted.
gui_related: true
gui_classification_reason: Exact concern or annotation action and visible audit History boundary.
split_recommended: false
depends_on:
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- concern.reopened has its own contract; membership ABSENT, retention PENDING_RETENTION_DECISION, native NOT_RUN.
- Preserve exact Card 5.e A recording and confirmation roles without expansion.
validation_surfaces:
- python3 scripts/pm-card5-event-contracts-check.py --family concern.reopened
risk_class: event_authority
reasoning_tier: high
context_scope: concern_reopened
implementation_surfaces:
- Plans/card5_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-441
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- concern.reopened
- DL-441
- PENDING_RETENTION_DECISION
negative_constraints:
- No admission, new recording privilege beyond option A, duplicate note co-emission or invented retention.
```

### F3-713 - concern.resolved Card 5 exact-family contract

```yaml
plan_unit_id: F3-713
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Newly authored owner contract for concern.resolved 2.0.0 under DL-045 and DL-442, deck-2 Card 5.f option A. Prepared without admission. Semantic owners remain Orchestrator_Page OP-002/OP-004 and UCC-147; this exact-family unit supplies the missing technical bindings and applies only the approved Card 5 action. The seven pre-round prepared contracts remain unchanged. Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here. Jared's answer was "i approve all of it". The as-presented deck's fast-reply rule selects A; the following is the card's option text, not a quotation attributed to Jared:

  The authorized Puppet Master controller may choose and record seven evidence-backed outcomes: `fixed` (a genuine fix), `superseded` (replaced by a successor concern), `merged` (combined with another concern), `split` (divided into linked concerns), `invalidated` (shown to be invalid), `obsoleted_by_patch` (made obsolete by a patch), and `obsoleted_by_recovery` (made obsolete by recovery). Users and workers may request these outcomes but gain no recording permission. Only an authorized human may choose `accepted_risk` (accepting remaining risk), by an explicit decision that the controller records with the evidence and remaining risk. Every resolution requires current evidence that the underlying issue changed, a reason, and all existing critical/security/human approvals. Supersession, merge and split use guided, audited lineage actions and preserve links and history; they do not prove a fix. Any resulting transfer follows your selected 5.b rule, and any promotion to a wider area follows your selected 5.d rule. Acknowledge/dismiss stays separate and cannot erase a live blocker. You get controller choice and recording for all seven non-risk outcomes, and an explicit human choice for accepted risk.

  Authorized controller means Puppet Master's permitted coordinating software for that part of the work, including package and seam controllers. Responsible owner means the assigned person, agent or component; assignment alone grants no additional permission. Workers propose and never gain direct recording permission. Preserve access checks, current supporting evidence, allowed transitions, and all existing critical/security/governance/human-approval requirements. The creator, responsible owner, resolver, confirmer and recording controller remain distinct roles. A role spelling or ref is never an authorization credential.

  Payload and scope: the exact closed schema is Plans/card5_event_contracts/concern_resolved.payload.schema.json; its $id is pm.card5.concern_resolved.payload.v2, version 2.0.0. Only Project EventRecord 2.0.0: scope_kind=project, project_id must join original command, record and independently verified Storage evidence. scope_partition is project~base64url_no_pad(UTF8(project_id)), with no active/focus/default Project or application substitution. Subject identity is concern_id; creator and original identity never change under assignment, promotion, reopening, resolution or assessment. Envelope actor_ref, occurred_at_utc=ts, correlation_id, idempotency_key and payload schema join the frozen original; original authenticated thread/run/node/attempt/account/parent/causation context joins independently or is explicit null, never parsed from opaque refs. Storage assigns sequence, observed/persisted timestamps and receipt offsets; payload/caller metadata cannot override them.

  Producer and identity: cmd.concern.resolve through handlers::concern::resolve is the exact owning handler after independently authenticated action authority. UCC-147 retains its public command fields; the closed normalized action custody is private and grants no extra caller fields or privileges. H=lowercase SHA-256(canonical MessagePack [storage_instance_id, project_id, "concern.resolved", idempotency_key]); operation_digest=H and event_id=evt_concern_resolved_H. Subject ids are preserved from canonical owner state (creation allocates/fixes its original annotation identity once). Request digest=lowercase SHA-256(canonical MessagePack {original_command, payload, before, after}), containing every field, including authority/confirmations/evidence, exact original command, immutable before/after revision refs and facts. Frozen original schema Plans/card5_event_contracts/concern_resolved.operation.schema.json is closed, private canonical authority. before/after are complete action snapshots of the fields defined by that schema plus immutable refs committing to the full owner records; they do not replace the full canonical record. A ref cannot stand in for readback/authentication. All shared copies and snapshot effects join field by field. Exact types precede comparisons; use the existing canonical MessagePack codec without coercion, a new numeric cap or a lane-local serializer. Numbers follow CV-1100/SP-1100 (loads_current_json, current_integer within each slot's own bounds, no lane cap); timestamps follow CV-1101 through the shared date_time predicate (EventRecord profile for payload ts, CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds). New schemas add no numeric upper limit. Existing date-time/UUID validation is enforced through the existing full-match/Gregorian format checker, not optional jsonschema format support.

  Ordering: exact event-family admission FIRST, before journal, body commit, owner mutation, append, side effect or checkpoint advance. Registry membership remains ABSENT and refuses family_not_admitted; synthetic future-admission fixtures grant nothing. Current writer and retry use dedupe_by_idempotency_key only; projector_replay_only refuses replay_only_not_appendable before effects. Authenticate membership, permissions/source access, actual current owner revision, single-writer lease, canonical allowed action and existing approval evidence under the same commit fence. Resolve immutable evidence/body refs and secret-screen all strings. Freeze prepared original with all four receipt/result refs null at concern_resolved_operation.v1:{project_id}:{operation_digest}. Atomically whole-value-CAS the original owner revision and complete canonical after-record plus committed operation in ONE canonical-redb transaction; committed has owner_commit_ref/result_ref/dispatch_receipt_ref nonnull and original_append_result_ref null. Large dependent bodies must be durable and authenticated before this atomic commit. A failed/no-change/stale/refused action produces no event. Missing atomicity or ambiguous original commit fences the action.

  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 and its full-value v2 successor. After independently authenticated original owner commit/readback, append only the frozen candidate; join original EventRecord, Storage/source identity, semantic payload, eleven-field first AppendReceipt and retained four-field original_append_result. Storage metadata is verified against the independently retained Storage record. Only whole-value committed->settled CAS with all four original refs nonnull publishes terminal success. Prepared abandonment requires authenticated commit/append absence; uncertain append remains fenced. Committed recovery resolves the ORIGINAL append, settled same-key/same-caller-body retries return its exact original result/receipt. Same scoped key with changed caller semantic body is idempotency_conflict; unavailable authoritative dedupe is dedupe_unavailable, zero effect. No renewed timestamp, reclassification, reconfirmation, second effect or append. Storage-assigned metadata does not participate in caller-body retry comparison. Replay and History never dispatch cmd.concern.resolve or any linked action. Current live facts do not invalidate a valid retained original or its exact retry; original admission/version/recipe selection must be independently authenticated, never selected by a caller.

  Exact transition: active|acknowledged -> resolved with current evidence that the underlying issue changed, reason and required critical/security/human approvals. Authorized controller chooses/records fixed/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery. Only authorized human explicitly chooses accepted_risk; controller records the independently authenticated decision, remaining-risk ref and supporting evidence. Acknowledge/dismiss cannot erase a live blocker. Supersession/merge/split require guided audited lineage action and preserved links/history; these outcomes never prove a fix or clear a blocker by themselves. Existing blocker/gate owner revalidates the underlying issue separately; this event never edits blocking_effect_ref merely because it is terminal. Any transfer obeys F3-709/DL-438, any widening obeys F3-711/DL-440, with both obligations authenticated before commit. Save resolution_kind, resolver, resolution evidence, decision and lineage in the immutable action record and canonical owner's closure record; the event action_ref commits to those exact bytes. User/worker requests confer no recording permission.

  Consumers/checkpoints: newly authored projector.concern_resolved.history@1.0.0 and reader.concern_resolved.history@1.0.0 expose passive record-backed audit History for this exact family. Orchestrator concern History/inspector is the named operating consumer; it follows canonical source routes and never invokes an action from an event replay. Explicitly adopt SP-278/DL-076: concern_resolved_checkpoint.v1:{project_id}:{storage_instance_id}, closed schema Plans/card5_event_contracts/concern_resolved.checkpoint.schema.json. Complete CURRENT-selected EventRecord index and nine-field durable index_read_token, no persisted redb_snapshot_id. Before every scan/read/CAS join actual live Storage/redb snapshot, scope, source-selection/generation, publication and original event context. Scan all source sequences through the captured frontier; unsupported/corrupt/inadmissible originals are unavailable, not skipped. Atomically whole-value CAS prior token/publication/state/frontier/last_event_id to complete verified coverage in one derived-redb transaction. last_event_id is last exact match or null, through_sequence_id is scanned coverage; no accumulated event refs or unbounded checkpoint array. Registry absence forbids advance; withdrawal/unknown schemas fence it.

  History request uses publication_id, exact durable token, unsigned after_sequence_id. Closed response is {publication_id,index_read_token,after_sequence_id,event_refs,complete} with at most 256 scanned source sequences, 64 matching refs and 16384 canonical MessagePack bytes for the COMPLETE response, adopting the existing bounded reader contract. Stop before an unreturned match; oversized individual metadata/ref is unavailable without skipped coverage. Empty filtered pages continue at last actually scanned sequence until the verified frontier; no empty success merely on a budget boundary. All retained matches remain reachable across pages. Cursor beyond frontier or stale continuation refuses. Rebuild stages a separate publication from verified retained CURRENT source and complete coverage; atomically withdraw old/publish new. Source-generation change requires SP-278 verified translation or a verified new publication and restarted traversal. Current permission/membership/source access, deletion tombstones and withdrawal are checked before disclosure and again after returning helpers. Authenticate original event/family/schema/receipt/source/publication against independent retained evidence; a hash/ref is not authority. A valid retained original remains readable after current owner state/roles change or live writer admission closes, including valid replay-only history. Historical guards never invoke current-writer action rules.

  Custody and physical binding: original canonical note/concern/action/operation records and authenticated commit/first/full-value receipt/source dependencies are non-rebuildable authority. Mandatory coherent backup/restore preserves them together under one verified Storage/source recovery boundary; mixed or missing originals fence mutation/disclosure. Projections cannot recreate lost authority. No raw note/title/reason/source/credentials/private account text or absolute local path in event/journal/checkpoint; use authenticated immutable refs, secret-screen every string and recheck source access/deletion at resolution. Preserve all original anchors/provenance/closure/lineage fields. Existing record keys and storage classes remain owned by SP-095/SP-666/CV-315/SP-233; note_record.v1 is compatibility lineage, not a new note subsystem. concern_resolved_operation uses canonical redb/coordination_and_storage advisory budget, canonical MessagePack and complete-value 16384-byte limit. concern_resolved_checkpoint uses derived redb/event_log hard budget, canonical MessagePack and complete-value 16384-byte limit. Measure every stored value independently; oversized mandatory metadata refuses, never truncates. Event bodies above the 16 KiB inline limit use SP-337 payload_ref with verified BLAKE3 identity, byte size and media type, not inline base64; externalizing an event does not waive any operation/checkpoint bound. Pressure cannot silently evict canonical authority; derived eviction makes History unavailable until verified rebuild.

  Retention: existing concern_record RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds bind only those already governed records. This exact event, its original operation/action custody and its History checkpoint have retention_policy_ref=PENDING_RETENTION_DECISION: Case L-3/SP-026 audit-authority/ordinary-telemetry groups and checkpoint RP-PROJECTION-3GEN are candidates only until the retention owners bind the exact family. No new duration, deletion, compaction, auto-expiry or hold release is chosen. Retention stays PARTIAL.

  Compatibility/withdrawal: keep all original payload bytes/ids/versions; original concern resolved 1.0.0 schema in Plans/event_payloads/concern/concern_resolved.schema.json remains immutable and selected only from independently authenticated original admission evidence; it is not a current 2.0.0 writer. Original valid history is interpreted with its authenticated write-time edition/recipe, not a caller-selected weaker recipe: the SP-1101 RetainedDispatcher resolves it from Storage's sealed custody, exact binding and an installed frozen recipe tuple that pins the edition's exact schema bytes (a legacy concern v1 edition keeps its original Draft 2020-12 type and number validation with the CV-1101 predicate installed); unavailable or unsupported originals refuse without fallback. StorageMigrationCoordinator installs each declared schema before activation; unknown editions/withdrawn sources disclose unavailable. Future versions require their own exact admission and verified projection rebuild. Close exact-family writer admission first, fence new mutations, settle existing original obligations under original custody without repeating effects, whole-value-CAS checkpoint withdrawn and refuse stale/staged/withdrawn publications; retained original read rights and legal deletion/holds remain owner-governed. No sibling/alias admission or current-writer permission follows.

  Oracles: Plans/card5_event_contracts/concern_resolved.fixtures.json and python3 scripts/pm-card5-event-contracts-check.py --family concern.resolved. Test closed payload/operation, recomputed identity/digest, original command/snapshot joins, phase/order/admission/refusal/replay/retry custody, current permission/currentness and exact action roles, retained historical reads after live changes, forged/foreign/withdrawn controls, enforced types/formats/LF/reference closure and bounded read/Storage metadata. Each negative is built from a valid named base, with coherent copies/digests/keys; changed semantic body is distinguished from Storage-assigned metadata. Every refusal goes through guard-table rows proved by the gated guard tool scripts/pm_guard_isolation.py (004bdedd63), credited per row in the lane report. C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool, CV-1101's datetime_validator and whole-Plans inventory gate run at batch-2 integration, and the batch Sol/Astra review has not run. Native authentication, owner atomicity, append/custody/durability, mapping approval, checkpoint CAS, coherent backup/recovery and disclosure races remain NOT_RUN. Membership ABSENT. No admission, executable task or native availability is asserted.
gui_related: true
gui_classification_reason: Exact concern or annotation action and visible audit History boundary.
split_recommended: false
depends_on:
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- concern.resolved has its own contract; membership ABSENT, retention PENDING_RETENTION_DECISION, native NOT_RUN.
- Preserve exact Card 5.f A recording and confirmation roles without expansion.
validation_surfaces:
- python3 scripts/pm-card5-event-contracts-check.py --family concern.resolved
risk_class: event_authority
reasoning_tier: high
context_scope: concern_resolved
implementation_surfaces:
- Plans/card5_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-442
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- concern.resolved
- DL-442
- PENDING_RETENTION_DECISION
negative_constraints:
- No admission, new recording privilege beyond option A, duplicate note co-emission or invented retention.
```

### F3-714 - concern.updated Card 5 exact-family contract

```yaml
plan_unit_id: F3-714
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Newly authored owner contract for concern.updated 2.0.0 under DL-045 and DL-443, deck-2 Card 5.g option A. Prepared without admission. Semantic owners remain Orchestrator_Page OP-002/OP-004 and UCC-147; this exact-family unit supplies the missing technical bindings and applies only the approved Card 5 action. The seven pre-round prepared contracts remain unchanged. Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here. Jared's answer was "i approve all of it". The as-presented deck's fast-reply rule selects A; the following is the card's option text, not a quotation attributed to Jared:

  The authorized Puppet Master controller records assessment changes within its permitted area, limited here to changes that neither reassign the responsible owner nor move the concern to a wider area. Users and workers request them. Save current evidence, exact saved version and reason for severity, category or authority changes. An authority assessment identifies the already-authorized role whose decision is needed; it grants no new action permission. A severity, category or authority change that amounts to a transfer follows your selected 5.b rule; one that amounts to promotion follows your selected 5.d rule, even when requested as part of an update. Any linked evidence addition, reopening or resolution follows 5.c, 5.e or 5.f respectively; an assessment update cannot perform those actions instead. Editing the screen’s display copy is insufficient. You see the current assessment, subject to existing human-approval rules.

  Authorized controller means Puppet Master's permitted coordinating software for that part of the work, including package and seam controllers. Responsible owner means the assigned person, agent or component; assignment alone grants no additional permission. Workers propose and never gain direct recording permission. Preserve access checks, current supporting evidence, allowed transitions, and all existing critical/security/governance/human-approval requirements. The creator, responsible owner, resolver, confirmer and recording controller remain distinct roles. A role spelling or ref is never an authorization credential.

  Payload and scope: the exact closed schema is Plans/card5_event_contracts/concern_updated.payload.schema.json; its $id is pm.card5.concern_updated.payload.v2, version 2.0.0. Only Project EventRecord 2.0.0: scope_kind=project, project_id must join original command, record and independently verified Storage evidence. scope_partition is project~base64url_no_pad(UTF8(project_id)), with no active/focus/default Project or application substitution. Subject identity is concern_id; creator and original identity never change under assignment, promotion, reopening, resolution or assessment. Envelope actor_ref, occurred_at_utc=ts, correlation_id, idempotency_key and payload schema join the frozen original; original authenticated thread/run/node/attempt/account/parent/causation context joins independently or is explicit null, never parsed from opaque refs. Storage assigns sequence, observed/persisted timestamps and receipt offsets; payload/caller metadata cannot override them.

  Producer and identity: cmd.concern.update through handlers::concern::update is the exact owning handler after independently authenticated action authority. UCC-147 retains its public command fields; the closed normalized action custody is private and grants no extra caller fields or privileges. H=lowercase SHA-256(canonical MessagePack [storage_instance_id, project_id, "concern.updated", idempotency_key]); operation_digest=H and event_id=evt_concern_updated_H. Subject ids are preserved from canonical owner state (creation allocates/fixes its original annotation identity once). Request digest=lowercase SHA-256(canonical MessagePack {original_command, payload, before, after}), containing every field, including authority/confirmations/evidence, exact original command, immutable before/after revision refs and facts. Frozen original schema Plans/card5_event_contracts/concern_updated.operation.schema.json is closed, private canonical authority. before/after are complete action snapshots of the fields defined by that schema plus immutable refs committing to the full owner records; they do not replace the full canonical record. A ref cannot stand in for readback/authentication. All shared copies and snapshot effects join field by field. Exact types precede comparisons; use the existing canonical MessagePack codec without coercion, a new numeric cap or a lane-local serializer. Numbers follow CV-1100/SP-1100 (loads_current_json, current_integer within each slot's own bounds, no lane cap); timestamps follow CV-1101 through the shared date_time predicate (EventRecord profile for payload ts, CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds). New schemas add no numeric upper limit. Existing date-time/UUID validation is enforced through the existing full-match/Gregorian format checker, not optional jsonschema format support.

  Ordering: exact event-family admission FIRST, before journal, body commit, owner mutation, append, side effect or checkpoint advance. Registry membership remains ABSENT and refuses family_not_admitted; synthetic future-admission fixtures grant nothing. Current writer and retry use dedupe_by_idempotency_key only; projector_replay_only refuses replay_only_not_appendable before effects. Authenticate membership, permissions/source access, actual current owner revision, single-writer lease, canonical allowed action and existing approval evidence under the same commit fence. Resolve immutable evidence/body refs and secret-screen all strings. Freeze prepared original with all four receipt/result refs null at concern_updated_operation.v1:{project_id}:{operation_digest}. Atomically whole-value-CAS the original owner revision and complete canonical after-record plus committed operation in ONE canonical-redb transaction; committed has owner_commit_ref/result_ref/dispatch_receipt_ref nonnull and original_append_result_ref null. Large dependent bodies must be durable and authenticated before this atomic commit. A failed/no-change/stale/refused action produces no event. Missing atomicity or ambiguous original commit fences the action.

  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 and its full-value v2 successor. After independently authenticated original owner commit/readback, append only the frozen candidate; join original EventRecord, Storage/source identity, semantic payload, eleven-field first AppendReceipt and retained four-field original_append_result. Storage metadata is verified against the independently retained Storage record. Only whole-value committed->settled CAS with all four original refs nonnull publishes terminal success. Prepared abandonment requires authenticated commit/append absence; uncertain append remains fenced. Committed recovery resolves the ORIGINAL append, settled same-key/same-caller-body retries return its exact original result/receipt. Same scoped key with changed caller semantic body is idempotency_conflict; unavailable authoritative dedupe is dedupe_unavailable, zero effect. No renewed timestamp, reclassification, reconfirmation, second effect or append. Storage-assigned metadata does not participate in caller-body retry comparison. Replay and History never dispatch cmd.concern.update or any linked action. Current live facts do not invalidate a valid retained original or its exact retry; original admission/version/recipe selection must be independently authenticated, never selected by a caller.

  Exact effect: assessment-only changes to severity/category/authority_ref within the permitted current area, exact current saved revision, nonempty real patch, evidence and reason retained. Controller records; user/worker requests. An authority assessment names an already-authorized deciding role and grants no action permission. Owner, responsibility area, lifecycle, evidence set, lineage, creator and blocking effect cannot change through this assessment operation. A requested owner transfer must use F3-709/DL-438, wider area F3-711/DL-440, evidence addition F3-710/DL-439, reopening F3-712/DL-441 or resolution F3-713/DL-442, with their separate recorders/confirmers. Screen/projection edits do not mutate canonical records; update_kind/changed_fields from old editions are historical compatibility only and confer no broader current write capability.

  Consumers/checkpoints: newly authored projector.concern_updated.history@1.0.0 and reader.concern_updated.history@1.0.0 expose passive record-backed audit History for this exact family. Orchestrator concern History/inspector is the named operating consumer; it follows canonical source routes and never invokes an action from an event replay. Explicitly adopt SP-278/DL-076: concern_updated_checkpoint.v1:{project_id}:{storage_instance_id}, closed schema Plans/card5_event_contracts/concern_updated.checkpoint.schema.json. Complete CURRENT-selected EventRecord index and nine-field durable index_read_token, no persisted redb_snapshot_id. Before every scan/read/CAS join actual live Storage/redb snapshot, scope, source-selection/generation, publication and original event context. Scan all source sequences through the captured frontier; unsupported/corrupt/inadmissible originals are unavailable, not skipped. Atomically whole-value CAS prior token/publication/state/frontier/last_event_id to complete verified coverage in one derived-redb transaction. last_event_id is last exact match or null, through_sequence_id is scanned coverage; no accumulated event refs or unbounded checkpoint array. Registry absence forbids advance; withdrawal/unknown schemas fence it.

  History request uses publication_id, exact durable token, unsigned after_sequence_id. Closed response is {publication_id,index_read_token,after_sequence_id,event_refs,complete} with at most 256 scanned source sequences, 64 matching refs and 16384 canonical MessagePack bytes for the COMPLETE response, adopting the existing bounded reader contract. Stop before an unreturned match; oversized individual metadata/ref is unavailable without skipped coverage. Empty filtered pages continue at last actually scanned sequence until the verified frontier; no empty success merely on a budget boundary. All retained matches remain reachable across pages. Cursor beyond frontier or stale continuation refuses. Rebuild stages a separate publication from verified retained CURRENT source and complete coverage; atomically withdraw old/publish new. Source-generation change requires SP-278 verified translation or a verified new publication and restarted traversal. Current permission/membership/source access, deletion tombstones and withdrawal are checked before disclosure and again after returning helpers. Authenticate original event/family/schema/receipt/source/publication against independent retained evidence; a hash/ref is not authority. A valid retained original remains readable after current owner state/roles change or live writer admission closes, including valid replay-only history. Historical guards never invoke current-writer action rules.

  Custody and physical binding: original canonical note/concern/action/operation records and authenticated commit/first/full-value receipt/source dependencies are non-rebuildable authority. Mandatory coherent backup/restore preserves them together under one verified Storage/source recovery boundary; mixed or missing originals fence mutation/disclosure. Projections cannot recreate lost authority. No raw note/title/reason/source/credentials/private account text or absolute local path in event/journal/checkpoint; use authenticated immutable refs, secret-screen every string and recheck source access/deletion at resolution. Preserve all original anchors/provenance/closure/lineage fields. Existing record keys and storage classes remain owned by SP-095/SP-666/CV-315/SP-233; note_record.v1 is compatibility lineage, not a new note subsystem. concern_updated_operation uses canonical redb/coordination_and_storage advisory budget, canonical MessagePack and complete-value 16384-byte limit. concern_updated_checkpoint uses derived redb/event_log hard budget, canonical MessagePack and complete-value 16384-byte limit. Measure every stored value independently; oversized mandatory metadata refuses, never truncates. Event bodies above the 16 KiB inline limit use SP-337 payload_ref with verified BLAKE3 identity, byte size and media type, not inline base64; externalizing an event does not waive any operation/checkpoint bound. Pressure cannot silently evict canonical authority; derived eviction makes History unavailable until verified rebuild.

  Retention: existing concern_record RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds bind only those already governed records. This exact event, its original operation/action custody and its History checkpoint have retention_policy_ref=PENDING_RETENTION_DECISION: Case L-3/SP-026 audit-authority/ordinary-telemetry groups and checkpoint RP-PROJECTION-3GEN are candidates only until the retention owners bind the exact family. No new duration, deletion, compaction, auto-expiry or hold release is chosen. Retention stays PARTIAL.

  Compatibility/withdrawal: keep all original payload bytes/ids/versions; original concern updated 1.0.0 schema in Plans/event_payloads/concern/concern_updated.schema.json remains immutable and selected only from independently authenticated original admission evidence; it is not a current 2.0.0 writer. Original valid history is interpreted with its authenticated write-time edition/recipe, not a caller-selected weaker recipe: the SP-1101 RetainedDispatcher resolves it from Storage's sealed custody, exact binding and an installed frozen recipe tuple that pins the edition's exact schema bytes (a legacy concern v1 edition keeps its original Draft 2020-12 type and number validation with the CV-1101 predicate installed); unavailable or unsupported originals refuse without fallback. StorageMigrationCoordinator installs each declared schema before activation; unknown editions/withdrawn sources disclose unavailable. Future versions require their own exact admission and verified projection rebuild. Close exact-family writer admission first, fence new mutations, settle existing original obligations under original custody without repeating effects, whole-value-CAS checkpoint withdrawn and refuse stale/staged/withdrawn publications; retained original read rights and legal deletion/holds remain owner-governed. No sibling/alias admission or current-writer permission follows.

  Oracles: Plans/card5_event_contracts/concern_updated.fixtures.json and python3 scripts/pm-card5-event-contracts-check.py --family concern.updated. Test closed payload/operation, recomputed identity/digest, original command/snapshot joins, phase/order/admission/refusal/replay/retry custody, current permission/currentness and exact action roles, retained historical reads after live changes, forged/foreign/withdrawn controls, enforced types/formats/LF/reference closure and bounded read/Storage metadata. Each negative is built from a valid named base, with coherent copies/digests/keys; changed semantic body is distinguished from Storage-assigned metadata. Every refusal goes through guard-table rows proved by the gated guard tool scripts/pm_guard_isolation.py (004bdedd63), credited per row in the lane report. C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool, CV-1101's datetime_validator and whole-Plans inventory gate run at batch-2 integration, and the batch Sol/Astra review has not run. Native authentication, owner atomicity, append/custody/durability, mapping approval, checkpoint CAS, coherent backup/recovery and disclosure races remain NOT_RUN. Membership ABSENT. No admission, executable task or native availability is asserted.
gui_related: true
gui_classification_reason: Exact concern or annotation action and visible audit History boundary.
split_recommended: false
depends_on:
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- concern.updated has its own contract; membership ABSENT, retention PENDING_RETENTION_DECISION, native NOT_RUN.
- Preserve exact Card 5.g A recording and confirmation roles without expansion.
validation_surfaces:
- python3 scripts/pm-card5-event-contracts-check.py --family concern.updated
risk_class: event_authority
reasoning_tier: high
context_scope: concern_updated
implementation_surfaces:
- Plans/card5_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-443
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- concern.updated
- DL-443
- PENDING_RETENTION_DECISION
negative_constraints:
- No admission, new recording privilege beyond option A, duplicate note co-emission or invented retention.
```
