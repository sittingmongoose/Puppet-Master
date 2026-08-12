# 5.6 Sol — Switchboard — Plan Owner Delta

> Concept-only impact analysis. No Plans, inventory, command catalog, wiring, or DRY owner was modified.

## Design contract

Operational readiness surface for notifications, appearance, input, and desktop behavior.

## Manager-to-owner review

| Manager family | Probable canonical owners | Review required |
|---|---|---|
| Provider / Account / Model / Installation | `Plans/Models_System.md`<br>`Plans/Multi-Account.md`<br>`Plans/CLI_Bridged_Providers.md`<br>`Plans/Provider_OpenCode.md`<br>`Plans/BinaryLocator_Spec.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Notifications, Sounds, Uploads & Packs | `Plans/FinalGUISpec.md`<br>`Plans/Media_Generation_and_Capabilities.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Appearance | `Plans/FinalGUISpec.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Spellcheck & Dictionaries | `Plans/FinalGUISpec.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Desktop, Tray & Window | `Plans/FinalGUISpec.md`<br>`Plans/Release_Supply_Chain.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |
| Teacher & Help | `Plans/FinalGUISpec.md`<br>`Plans/Planning_Wizard.md` | State shape, command ownership, lifecycle/recovery, requested/effective projection, and deep-link contract. |

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
