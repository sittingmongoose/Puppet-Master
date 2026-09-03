# Shard 015: Shared Runtime receipt/projection wiring addendum - 2026-08-13

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L681-L732

Source SHA256: `bb2048d39770ab3c8ab6bf24519c89ba8660de407a4bab5525e780f23cfec60a`

---

## Shared Runtime receipt/projection wiring addendum - 2026-08-13

The 26 canonical shared-runtime command IDs owned by `Plans/Commands_System.md` CS-066 and registered by `Plans/UI_Command_Catalog.md` UCC-145 each have one production wiring row. Each row binds the exact sole handler, typed request/result pair, owner state selector, closed disabled-reason set, accessible pending/outcome behavior, and a receipt/projection-only effect. While Event Authority remains `UNKNOWN_OPEN`, every row has `expected_event_types: []`, carries `missing_event_registration`, and proves that no unregistered `EventRecord` is emitted. A command acknowledgement or accepted result is admission only, never terminal domain success.

The compatibility tokens `cmd.lsp.server.restart`, `cmd.lsp.server.diagnose`, `cmd.debug.session.start`, `cmd.debug.session.stop`, `cmd.worktree.provision`, `cmd.worktree.release`, and `cmd.context.receipt.open` have exclusions only; their canonical targets retain their production rows. `cmd.debug.session.action` is rejected and also has no production row. `cmd.remote.reconnect` remains a production wrapper: it resolves an exact `ExecutionEnvironmentId`, calls `cmd.environment.reconnect` through `EnvironmentConnectionCommandRequest`, returns `EnvironmentConnectionCommandResult`, and owns neither a second connection lifecycle nor an event family. The former `remote.reconnect.requested` claim is retired because that family is not registered.

ContractRef: ContractName:Plans/Commands_System.md#CS-066, ContractName:Plans/UI_Command_Catalog.md#UCC-145, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/DRY_Rules.md#DR-037, SchemaID:pm.shared_runtime.contracts.v1

### UIW-011 - Shared Runtime Production Wiring Without Event Fabrication

```yaml
plan_unit_id: UIW-011
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Exactly 26 new shared-runtime commands have production rows with exact handlers,
  typed request and result contracts, projection selectors, closed disabled reasons,
  accessibility and regression evidence, and receipt/projection-only effects carrying
  missing_event_registration until individual Event Authority admission; compatibility
  candidates do not become primary rows, and cmd.remote.reconnect remains an exact-
  environment wrapper over cmd.environment.reconnect.
gui_related: true
gui_classification_reason: This unit owns visible command availability, disabled state, dispatch, progress, outcome, and accessibility wiring.
split_recommended: false
depends_on: [CS-066, UCC-145, DR-037, SIR-004, SIR-005, SIR-008, SIR-010]
unblocks: []
acceptance_criteria:
  - Exactly 26 new canonical command IDs have one production row each and every row binds the CS-066 sole handler, typed request/result, selector, and closed disabled-reason set.
  - Every new row has expected_event_types empty, effect_kind receipt, missing_event_registration evidence, and a test that rejects unexpected persisted events while Event Authority is UNKNOWN_OPEN.
  - Seven compatibility candidate tokens and rejected cmd.debug.session.action have exclusions but no production rows; canonical target commands are not excluded.
  - cmd.remote.reconnect resolves exact ExecutionEnvironmentId and delegates to cmd.environment.reconnect without remote.reconnect.requested or a second lifecycle.
  - Keyboard and pointer activation are identical, focus remains deterministic, and disabled, pending, recovery, and terminal outcomes are announced without secret or raw-output disclosure.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - shared-runtime command row census, alias exclusion, exact-handler, receipt/projection, accessibility, restart, race, and no-unregistered-event fixtures
risk_class: shared_runtime_wiring_or_event_authority_drift
reasoning_tier: high
context_scope: shared_runtime_ui_wiring
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json]
node_compile_hint: {mode: shared_runtime_ui_wiring, create_worknodes: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/CANDIDATE_COMMAND_ID_REGISTER.json
  - Plans/Shared_Integration_Runtime.md#15.3
preserved_exact_tokens: [missing_event_registration, UNKNOWN_OPEN, cmd.remote.reconnect, cmd.environment.reconnect, ExecutionEnvironmentId, none_pending_event_authority]
negative_constraints:
  - Do not name or emit a new EventRecord family before individual Event Authority admission.
  - Do not register compatibility candidates, the generic debug action, or surface-local command clones as primary production rows.
  - Do not treat accepted dispatch or UI acknowledgement as terminal domain success.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Shared_Integration_Runtime.md]
```
