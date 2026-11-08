# Shard 043: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L3267-L3632

Source SHA256: `1a2ac4aa1cd47300880ed030f58c1a2332f736d25a9c639dd0e83d34ceda5ac8`

---

## Command payload definitions (DL-333, 2026-11-05)

### RAP-129 - Runtime Artifacts Navigation Command Payload Definitions

```yaml
plan_unit_id: RAP-129
unit_type: command_contract
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Typed payload definitions for the Runtime Artifacts panel navigation commands that UI_Command_Catalog
  UCC-086 registers (DL-333). The definitions block below gives each active command its args, owner
  result and narrowed error and disabled-reason codes in pm.command_payload_definitions.v1. The catalog
  keeps ids, labels, availability and aliases; the strict schema overlay keeps the common envelope and
  the closed code sets.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Runtime Artifacts panel navigation commands.
depends_on: [UCC-230, UCC-086, UCC-109, RAP-048, DL-333]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to RAP-129 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.artifacts.show_in_ledger, cmd.artifacts.show_in_usage]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not define the other RAP-048 artifact bindings here; cmd.artifacts.sort, cmd.artifacts.play_recording, cmd.artifacts.watch_recording and cmd.artifacts.show_sources sit outside the UCC-230 routing for this unit.
owner_hints: [Plans/UI_Command_Catalog.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: RAP-129
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.artifacts.show_in_usage
      ucc_units: [UCC-086]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row payload project_id; UCC-230 envelope common optional project_id restated required"
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row; UCC-230 envelope canonical type. route_target.object_kind = usage_event with object_id derived from usage_event_ref whenever usage_event_ref is present (2.8A behavior cell; Wiring_Matrix.production.json catalog.artifacts_show_in_usage acceptance check and effect_contract)"
        OpenSubject:
          type: contract
          ref: Primitive:OpenSubject
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row open_subject (UCC-086 preserved token open_subject); UCC-230 envelope canonical name and type; retains the artifact route/open source-realization bridge (UCC-109 canonical text and negative constraint, UI_Command_Catalog.md:10834)"
        artifact_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row artifact_id?; overlay row group UCC-084..UCC-088 optional identity artifact_id; UCC-230 identity typing"
        usage_event_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row usage_event_ref?; UCC-230 envelope common optional usage_event_ref"
        usage_record_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row usage_record_id?; UCC-230 envelope common optional usage_record_id"
        provider_attempt_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row provider_attempt_ref?; UCC-230 envelope common optional provider_attempt_ref"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row attempt_id?; UCC-230 envelope common optional attempt_id"
        node_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row node_id?; UCC-230 envelope common optional node_id"
        tool_call_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row tool_call_id?; UCC-230 envelope common optional tool_call_id"
        trace_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row trace_ref?; UCC-230 envelope common optional trace_ref"
        receipt_refs:
          type: list
          item: {type: ref}
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row receipt_refs[]?; UCC-230 envelope common optional receipt_refs list of ref"
        raw_payload_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row raw_payload_ref?; UCC-230 envelope common optional raw_payload_ref"
        run_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row run_id?; UCC-230 envelope common optional run_id"
        thread_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1155 2.8A row thread_id?; UCC-230 envelope common optional thread_id"
        source_class:
          type: enum
          values: [provider_reported, provider_header, cli_reported, local_estimated, pricing_estimated, unknown]
          required: false
          default: none
          provenance: canon
          source: "UCC-109 canonical text and acceptance criterion carry source_class when present for the artifact Usage/Ledger commands (UI_Command_Catalog.md:10834); values from Plans/runtime_artifact_cost_usage.schema.json $defs/authorityFields.properties.source_class"
        source_confidence:
          type: enum
          values: [high, medium, low, unknown]
          required: false
          default: none
          provenance: canon
          source: "UCC-109 carries source_confidence when present; values from Plans/runtime_artifact_cost_usage.schema.json $defs/authorityFields.properties.source_confidence"
        source_authority:
          type: string
          required: false
          default: none
          nullable: true
          provenance: canon
          source: "UCC-109 carries source_authority when present (UI_Command_Catalog.md:10834); Plans/runtime_artifact_cost_usage.schema.json $defs/authorityFields.properties.source_authority is $defs/stringOrNull (type string or null)"
        settlement_status:
          type: enum
          values: [observed, streaming_partial, settled, adjusted, failed, unknown]
          required: false
          default: none
          provenance: canon
          source: "UCC-109 carries settlement_status when present; values from Plans/runtime_artifact_cost_usage.schema.json $defs/authorityFields.properties.settlement_status"
        projection_freshness:
          type: string
          required: false
          default: none
          provenance: canon
          source: "UCC-109 carries projection_freshness when present; Plans/runtime_artifact_cost_usage.schema.json properties.projection_freshness is a string"
        projection_health:
          type: string
          required: false
          default: none
          provenance: canon
          source: "UCC-109 carries projection_health when present; Plans/runtime_artifact_cost_usage.schema.json properties.projection_health is a string"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: response_kind
          choice: local_projection
          gap_note: "Canon names cmd.artifacts.show_in_usage a navigation_wrapper over canonical route targeting rather than a generic layout toggle (UI_Command_Catalog.md:121) but states no response_kind. The wiring row gives no result_schema_ref; its effect contract is route_open with the receipt cmd.artifacts.show_in_usage.route_open_receipt (Wiring_Matrix.production.json entries.catalog.artifacts_show_in_usage.effect_contract), so the route/open response without a typed owner result is chosen."
        - key: owner_request
          choice: none
          gap_note: "The wiring row states no request_schema_ref (Wiring_Matrix.production.json entries.catalog.artifacts_show_in_usage) and no other canon names a typed owner request; the effect contract is route_open."
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: "No catalog row states disabled reasons for cmd.artifacts.show_in_usage; chosen from the closed set. The wiring row requires a projected state selector and a disabled-reason projection before dispatch (Wiring_Matrix.production.json catalog.artifacts_show_in_usage.disabled_reason_projection), and stale_projection is the closed-set code for a stale usage projection (UCC-109 carries projection_freshness and projection_health, UI_Command_Catalog.md:10834)."
    - command_id: cmd.artifacts.show_in_ledger
      ucc_units: [UCC-086]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row payload project_id; UCC-230 envelope common optional project_id restated required"
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row; UCC-230 envelope canonical type. route_target.object_kind = usage_event with object_id derived from usage_event_ref whenever usage_event_ref is present (2.8A behavior cell; Wiring_Matrix.production.json catalog.artifacts_show_in_ledger acceptance check and effect_contract); the row stays event-primary and is not widened into the PMConcept7 attempt-primary branch"
        OpenSubject:
          type: contract
          ref: Primitive:OpenSubject
          required: true
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row open_subject (UCC-086 preserved token open_subject); UCC-230 envelope canonical name and type; retains the artifact route/open source-realization bridge (UCC-109 canonical text and negative constraint, UI_Command_Catalog.md:10834)"
        artifact_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row artifact_id?; overlay row group UCC-084..UCC-088 optional identity artifact_id; UCC-230 identity typing"
        usage_event_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row usage_event_ref?; UCC-230 envelope common optional usage_event_ref"
        usage_record_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row usage_record_id?; UCC-230 envelope common optional usage_record_id"
        ledger_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row ledger_ref?; overlay row group UCC-084..UCC-088 optional identity ledger_ref; UCC-230 identity typing"
        provider_attempt_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row provider_attempt_ref?; UCC-230 envelope common optional provider_attempt_ref"
        attempt_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row attempt_id?; UCC-230 envelope common optional attempt_id"
        node_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row node_id?; UCC-230 envelope common optional node_id"
        tool_call_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row tool_call_id?; UCC-230 envelope common optional tool_call_id"
        trace_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row trace_ref?; UCC-230 envelope common optional trace_ref"
        receipt_refs:
          type: list
          item: {type: ref}
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row receipt_refs[]?; UCC-230 envelope common optional receipt_refs list of ref"
        raw_payload_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row raw_payload_ref?; UCC-230 envelope common optional raw_payload_ref"
        run_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row run_id?; UCC-230 envelope common optional run_id"
        thread_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "UI_Command_Catalog.md:1156 2.8A row thread_id?; UCC-230 envelope common optional thread_id"
        source_class:
          type: enum
          values: [provider_reported, provider_header, cli_reported, local_estimated, pricing_estimated, unknown]
          required: false
          default: none
          provenance: canon
          source: "UCC-109 canonical text and acceptance criterion carry source_class when present for the artifact Usage/Ledger commands (UI_Command_Catalog.md:10834); values from Plans/runtime_artifact_cost_usage.schema.json $defs/authorityFields.properties.source_class"
        source_confidence:
          type: enum
          values: [high, medium, low, unknown]
          required: false
          default: none
          provenance: canon
          source: "UCC-109 carries source_confidence when present; values from Plans/runtime_artifact_cost_usage.schema.json $defs/authorityFields.properties.source_confidence"
        source_authority:
          type: string
          required: false
          default: none
          nullable: true
          provenance: canon
          source: "UCC-109 carries source_authority when present (UI_Command_Catalog.md:10834); Plans/runtime_artifact_cost_usage.schema.json $defs/authorityFields.properties.source_authority is $defs/stringOrNull (type string or null)"
        settlement_status:
          type: enum
          values: [observed, streaming_partial, settled, adjusted, failed, unknown]
          required: false
          default: none
          provenance: canon
          source: "UCC-109 carries settlement_status when present; values from Plans/runtime_artifact_cost_usage.schema.json $defs/authorityFields.properties.settlement_status"
        projection_freshness:
          type: string
          required: false
          default: none
          provenance: canon
          source: "UCC-109 carries projection_freshness when present; Plans/runtime_artifact_cost_usage.schema.json properties.projection_freshness is a string"
        projection_health:
          type: string
          required: false
          default: none
          provenance: canon
          source: "UCC-109 carries projection_health when present; Plans/runtime_artifact_cost_usage.schema.json properties.projection_health is a string"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, invalid_route, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
      judgments:
        - key: response_kind
          choice: local_projection
          gap_note: "Canon names cmd.artifacts.show_in_ledger a navigation_wrapper over canonical route targeting rather than a generic layout toggle (UI_Command_Catalog.md:121) but states no response_kind. The wiring row gives no result_schema_ref; its effect contract is route_open with the receipt cmd.artifacts.show_in_ledger.route_open_receipt (Wiring_Matrix.production.json entries.catalog.artifacts_show_in_ledger.effect_contract), so the route/open response without a typed owner result is chosen."
        - key: owner_request
          choice: none
          gap_note: "The wiring row states no request_schema_ref (Wiring_Matrix.production.json entries.catalog.artifacts_show_in_ledger) and no other canon names a typed owner request; the effect contract is route_open."
        - key: disabled_reason_codes
          choice: [stale_projection]
          gap_note: "No catalog row states disabled reasons for cmd.artifacts.show_in_ledger; chosen from the closed set. The wiring row requires a projected state selector and a disabled-reason projection before dispatch (Wiring_Matrix.production.json catalog.artifacts_show_in_ledger.disabled_reason_projection), and stale_projection is the closed-set code for a stale usage projection (UCC-109 carries projection_freshness and projection_health, UI_Command_Catalog.md:10834)."
```
