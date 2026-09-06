# Shard 037: Neutral Source-Control Concrete Catalog Completion - 2026-09-02

Source: `Plans/UI_Command_Catalog.md`

Source lines: L12335-L12375

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## Neutral Source-Control Concrete Catalog Completion - 2026-09-02

| Canonical command | Label | Owner | Sole future target | Complete intended consumers and exact return |
|---|---|---|---|---|
| `cmd.source_control.repository.bind` | Connect Existing Repository | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::repository_bind` | Source Control workbench; Project setup and existing-folder flow; Settings > Source Control; Doctor; palette/API. Return the exact Project/repository/workspace binding projection and initiating focus. |
| `cmd.source_control.status.refresh` | Refresh Source Status | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::status_refresh` | Source Control workbench; Files/source badges; Project setup verification; Settings > Source Control; Doctor; palette/API. Return the exact revision/currentness projection and initiating focus. |
| `cmd.source_control.workspace.remove` | Remove Workspace | `Plans/Source_Control_System.md#SCS-003` | `handlers::source_control::workspace_remove` | Source Control workspace manager; Project hosting/files manager; Settings > Source Control; Doctor; palette/API. Return the exact ownership/dependency/data-disposition result and initiating focus. |

Each control reads its canonical availability and exact disabled reason before dispatch, provides identical keyboard and pointer behavior, announces pending and terminal state without claiming success from acceptance, and restores the exact initiating route/focus. Remove requires the owner-defined active-work, dependency, ownership, data-disposition, currentness, permission, and confirmation gates. The three routes remain `handler_unavailable`; static catalog and wiring declarations are not rendered-control or runtime proof.

### UCC-155 - Neutral Source-Control Concrete Catalog And Reverse Coverage

```yaml
plan_unit_id: UCC-155
unit_type: gui_command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Repository bind, status refresh, and workspace remove have concrete catalog rows with Source Control ownership, one future handler each, complete intended consumers, canonical availability and disabled reasons, accessibility behavior, and exact route/focus return; static rows do not claim rendered or runtime evidence.
gui_related: true
gui_classification_reason: These exact controls are consumed by Source Control, Project setup, Settings, Doctor, Files/status, and palette/API surfaces.
depends_on: [UCC-151, CS-077, SCS-003]
unblocks: []
acceptance_criteria:
  - All three exact commands have one concrete catalog row and reuse their existing Touch Closure and production-intent wiring identities.
  - Every intended consumer reads canonical owner availability, exposes the exact disabled reason, preserves keyboard/pointer parity, and returns to the initiating route/focus with the typed owner result.
  - Workspace removal exposes ownership, dependency, active-work, data-disposition, currentness, permission, and confirmation gates and never implies repository-data deletion from command acceptance.
  - Compatibility inputs reuse the canonical controls after pre-gate normalization and receive no peer GUI identity.
  - handler_unavailable and absent native/rendered/accessibility evidence remain explicit.
validation_surfaces: [Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, Plans/touch_closure.json, Plans/Wiring_Matrix.production.json, python3 scripts/pm-touch-closure-verify.py --json, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: missing_source_control_reverse_consumer_or_destructive_remove_overclaim
reasoning_tier: high
context_scope: neutral_source_control_concrete_catalog
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Source_Control_System.md, Plans/Wiring_Matrix.production.json, future Slint source-control and setup controls]
node_compile_hint: {mode: static_existing_command_catalog_and_reverse_coverage_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Source_Control_System.md#SCS-003, Plans/Commands_System.md#CS-077, source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json]
preserved_exact_tokens: [cmd.source_control.repository.bind, cmd.source_control.status.refresh, cmd.source_control.workspace.remove, handler_unavailable]
negative_constraints:
  - Do not invent compatibility-source controls, generic source-control verbs, automatic deletion, or fabricated currentness/success.
  - Do not claim native Slint, rendered controls, accessibility execution, dispatcher, handler, repository mutation, or runtime evidence from static catalog closure.
```
