# 5.6 Sol — Wayfinder — Plan Owner Delta

> Concept-only impact analysis. No Plans, inventory, command catalog, wiring, or DRY owner was modified.

## Design contract

Guided toolchain routes with explicit setup, verification, and recovery checkpoints.

## Manager-to-owner review

| Manager family | Probable canonical owners | Review required |
|---|---|---|
| Provider / Account / Model / Installation | `Plans/Models_System.md`<br>`Plans/Multi-Account.md`<br>`Plans/CLI_Bridged_Providers.md`<br>`Plans/Provider_OpenCode.md`<br>`Plans/BinaryLocator_Spec.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| File Manager & Editor | `Plans/FileManager.md`<br>`Plans/FinalGUISpec.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Terminal | `Plans/FinalGUISpec.md`<br>`Plans/Commands_System.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| LSP | `Plans/LSPSupport.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Formatters | `Plans/Formatters_System.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Commands & Shortcuts | `Plans/Commands_System.md`<br>`Plans/UI_Command_Catalog.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| MCP | `Plans/MCP_Integration.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Skills | `Plans/Skills_System.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Plugins | `Plans/Plugins_System.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Tools | `Plans/Tools.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Testing & Debug | `Plans/Automated_Testing_System.md`<br>`Plans/Runtime_Artifacts_Panel.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |

## Cross-cutting owner deltas

- `Plans/FinalGUISpec.md`: destination navigation, search, workspace/manager shell, responsive inspector behavior, accessibility, and semantic motion intent.
- `Plans/settings_inventory.json` and `Plans/settings_inventory.schema.json`: stable destination IDs and typed source/scope/exposure/requested/effective/availability/recovery fields.
- `Plans/UI_Command_Catalog.md`: census and adjudication of reuse, alias, supersession, conflict, and provisional candidates in `candidate-command-delta.json`.
- `Plans/Wiring_Matrix.production.json`: trace each enabled action through owner, validation, operation/receipt, projection, attribution, and recovery.
- DRY owner: adjudicate candidate semantic component families without erasing the four concepts’ distinct composition and motion systems.

## Required supersessions

- Replace the old Settings chip/bloom/no-sidebar interaction contract; assess `cmd.settings.bloom.open` only as a compatibility alias.
- Replace stale fixed right-panel wording with wide inspector, middle-width drawer, and squeezed inline evidence behavior.
- Do not reintroduce stale `regular/yolo` coupling or invalid inventory values.

## Boundaries

- Provider CLI installation remains explicit, official-source, ownership-aware, separately verified, and rollback-capable.
- CLI-owned OAuth remains provider-owned; PM-direct OAuth is used only where explicitly supported.
- Usage measurements remain owned by Usage; Settings shows only source-labelled readiness snapshots and handoff routes.
- Candidate command and component names are provisional; this concept mints no canon.

## Deferred insertion

No deferred manager family is claimed by this concept.

## Validation surface

- ConceptHub structural validator.
- State/architecture tests for manager assignment, provider installation boundaries, lifecycle conflict/rollback, all deterministic fixtures, and theme preview/revert.
- Browser review at 900, 1280, 1700, 2200, and 2500 px; reduced motion; all eight themes; narrow and squeezed height; deep-link/history/focus checks.
