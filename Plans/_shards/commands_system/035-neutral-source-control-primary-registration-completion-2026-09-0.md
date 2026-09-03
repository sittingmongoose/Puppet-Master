# Shard 035: Neutral Source-Control Primary Registration Completion - 2026-09-02

Source: `Plans/Commands_System.md`

Source lines: L5811-L5854

Source SHA256: `f083fc0c7e53c324e4b735dc7df7db49667b8f504ac8c22329fa3aa4f6274487`

---

## Neutral Source-Control Primary Registration Completion - 2026-09-02

Three existing Source Control owner commands already have typed owner contracts, Touch Closure rows, and production-intent wiring, but require explicit concrete central catalog records. This section completes those records without minting new semantics or changing the packet compatibility aliases that target them.

| Command ID | Canonical owner | Sole future handler | Exact request -> result | Current evidence boundary |
|---|---|---|---|---|
| `cmd.source_control.repository.bind` | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::repository_bind` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.status.refresh` | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::status_refresh` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |
| `cmd.source_control.workspace.remove` | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::workspace_remove` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request` -> `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result` | `handler_unavailable`; owner result/receipt/projection only; `expected_event_types=[]` |

The compatibility spellings `cmd.project.checkout.connect_existing`, `cmd.project.checkout.verify`, and `cmd.project.checkout.remove` continue to normalize before every gate to these primaries. They do not receive peer registrations or handlers.

### CS-077 - Neutral Source-Control Primary Registration Completion

```yaml
plan_unit_id: CS-077
unit_type: command_registry
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Repository bind, status refresh, and workspace remove receive concrete central catalog records over their existing Source Control owner contracts, sole future handlers, Touch Closure rows, and production-intent wiring; compatibility inputs remain unregistered and native evidence remains absent.
gui_related: true
gui_classification_reason: Source Control, Settings, Project setup, Doctor, and palette/API consumers require exact availability, disabled reason, and return behavior for these commands.
depends_on: [CS-073, SCS-003]
unblocks: [UCC-155]
acceptance_criteria:
  - Each exact command appears once in this concrete table with Source Control owner, typed request/result, and one sole future handler.
  - Existing production-intent and Touch Closure rows remain the only wiring identities; no compatibility source receives a peer row or handler.
  - Every route remains handler_unavailable and event-silent with "expected_event_types=[]" until executable proof and Event Authority admission exist.
  - Repository binding, status observation, and workspace removal remain distinct actions with owner-defined currentness, permission, data-disposition, and exact-return semantics.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, Plans/touch_closure.json, Plans/Wiring_Matrix.production.json, python3 scripts/pm-touch-closure-verify.py --json, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: missing_central_source_control_primary_or_conflated_mutation
reasoning_tier: high
context_scope: neutral_source_control_primary_registration
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Source_Control_System.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: static_existing_primary_registration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Source_Control_System.md#SCS-003
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json
preserved_exact_tokens: [cmd.source_control.repository.bind, cmd.source_control.status.refresh, cmd.source_control.workspace.remove, handlers::source_control::repository_bind, handlers::source_control::status_refresh, handlers::source_control::workspace_remove, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not invent peer compatibility handlers, generic source-control dispatch, automatic removal, or fabricated currentness.
  - Do not claim native dispatcher, handler, persistence, filesystem, repository, or runtime evidence from static registration.
```
