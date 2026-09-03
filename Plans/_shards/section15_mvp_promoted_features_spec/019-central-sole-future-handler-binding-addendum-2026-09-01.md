# Shard 019: Central Sole Future Handler Binding Addendum - 2026-09-01

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L10420-L10494

Source SHA256: `cddc39f6018cb3977d9b4e9548a521c5befbf8d24e634cced5730046cb3b622c`

---

## Central Sole Future Handler Binding Addendum - 2026-09-01

This owner adjudicates exactly 14 previously unbound primary commands. The table is the sole future-route authority; it does not prove a dispatcher, executable handler, durable effect, provider capability, native Slint surface, security result, or runtime certification. Every command remains `handler_unavailable` until source-hashed native evidence closes its typed availability, permission, receipt/ObservableWork, failure, currentness, idempotency, restart, race, accessibility, and reverse-GUI obligations.

| Command | Sole future handler | Request -> result | Error / permission |
|---|---|---|---|
| `cmd.browser.page.activate` | `handlers::browser_program::page_activate` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.page.close` | `handlers::browser_program::page_close` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.page.create` | `handlers::browser_program::page_create` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.page.evaluate` | `handlers::browser_program::page_evaluate` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.page.representation.capture` | `handlers::browser_program::page_representation_capture` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.page.representation.delta` | `handlers::browser_program::page_representation_delta` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.page.representation.query` | `handlers::browser_program::page_representation_query` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.program.cancel` | `handlers::browser_program::program_cancel` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.program.pause` | `handlers::browser_program::program_pause` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.program.resume` | `handlers::browser_program::program_resume` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.program.run` | `handlers::browser_program::program_run` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.workspace.close` | `handlers::browser_program::workspace_close` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.workspace.create` | `handlers::browser_program::workspace_create` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |
| `cmd.browser.workspace.reset` | `handlers::browser_program::workspace_reset` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request` -> `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_result` | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_error` / `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_command_request/properties/permission_snapshot_ref` |

The central closure emits no new EventRecord type. `expected_event_types=[]` is mandatory until Event Authority registers an owner event and payload. Owner-typed result/receipt/projection records remain required, and asynchronous work must correlate through the owner ObservableWork contract where applicable. Protected authentication, secret bytes, browser content, provider credentials, filesystem authority, trust, readiness, success, and completion are never inferred from dispatch acceptance.

Exact command set: `cmd.browser.page.activate`, `cmd.browser.page.close`, `cmd.browser.page.create`, `cmd.browser.page.evaluate`, `cmd.browser.page.representation.capture`, `cmd.browser.page.representation.delta`, `cmd.browser.page.representation.query`, `cmd.browser.program.cancel`, `cmd.browser.program.pause`, `cmd.browser.program.resume`, `cmd.browser.program.run`, `cmd.browser.workspace.close`, `cmd.browser.workspace.create`, `cmd.browser.workspace.reset`.

Exact sole future handler set: `handlers::browser_program::page_activate`, `handlers::browser_program::page_close`, `handlers::browser_program::page_create`, `handlers::browser_program::page_evaluate`, `handlers::browser_program::page_representation_capture`, `handlers::browser_program::page_representation_delta`, `handlers::browser_program::page_representation_query`, `handlers::browser_program::program_cancel`, `handlers::browser_program::program_pause`, `handlers::browser_program::program_resume`, `handlers::browser_program::program_run`, `handlers::browser_program::workspace_close`, `handlers::browser_program::workspace_create`, `handlers::browser_program::workspace_reset`.

### SMPFS-157 - Central Sole Future Handler Bindings

```yaml
plan_unit_id: SMPFS-157
unit_type: command_binding
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Browser Program owns exactly 14 additional central command routes. Each command maps to the sole future handler shown in this addendum, consumes the existing owner-DRY request/result/error/availability/permission family, starts handler_unavailable, and earns no native implementation credit from a target string or production-intent row.
gui_related: true
gui_classification_reason: Settings, Onboarding/Doctor, owner workspaces, palette/API, and other named consumers expose some or all of these 14 commands and their exact disabled reasons.
depends_on: [SMPFS-147, SMPFS-156]
unblocks: []
acceptance_criteria:
- Every exact command ID in this 14-commands set maps one-to-one to the table's sole future handler target and no competing handler path exists.
- Every request, result, error, availability, permission, disabled-reason, receipt, ObservableWork, return-route, persistence, migration, and negative-security obligation remains owner-DRY.
- Every central production-intent row starts handler_unavailable, expected_event_types is empty, and static wiring is never represented as native implementation evidence.
- Commands System, UI Command Catalog, production wiring, Touch Closure, and every intended GUI consumer preserve exact reverse coverage without synthetic controls.
- Static schema, fixture, command/handler/GUI/reverse-wiring, accessibility, restart/race/currentness, and no-unregistered-event gates pass.
validation_surfaces:
- python3 scripts/pm-touch-closure-verify.py --json
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-new-contracts-verify.py
risk_class: command_route_authority_and_runtime_claim_boundary
reasoning_tier: high
context_scope: canonical_owner_command_binding
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.production.json
- Plans/touch_closure.json
node_compile_hint:
  mode: owner_adjudicated_future_handler_bindings
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/touch_closure.json
- Plans/Wiring_Matrix.production.json
- user-approved Parallel Canon, Settings, and PMConcept7 Integration Plan
negative_constraints:
- Do not claim a native handler, runtime dispatch, durable effect, registered event, security result, readiness, or certification from this Plans-only binding.
- Do not duplicate owner schemas, state machines, repair logic, credentials, or provider operations in Settings, Onboarding, Doctor, or PMConcept7.
- Do not expose protected-auth content, secret bytes, private browser state, or provider credentials to agents, adapters, logs, receipts, capture, or ordinary GUI projections.
compile_disposition: extend_existing_owner
```

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/touch_closure.json
