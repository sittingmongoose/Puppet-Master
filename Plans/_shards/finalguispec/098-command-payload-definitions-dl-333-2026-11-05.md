# Shard 098: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/FinalGUISpec.md`

Source lines: L50376-L52066

Source SHA256: `05719e033f2c8ffc8f17626be96e51efb5f5612251334efd4fa52402516410b3`

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
