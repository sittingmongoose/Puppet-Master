# Plan-owner delta — A1 Directory / Take 2 (CursorAuto)

Concept `concept-06-directory-take-2` · packet `PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18`.

Candidate notes only. **concept_only: true**. **Winner never selected.**
PMConcept7, Plans, inventory/schema, Command Catalog, Wiring, and DRY owners were not edited.
Candidate IDs are NOT_MINTED.

## FinalGUISpec
- Layout family: **A1 Directory / Take 2**
- Coverage depth: **core-deep**
- Notes: Editorial single-column directory with a stable domain rail and restrained content sheets. Distinct from Take 1 two-column destination cards. Search focus is restored after rerender. Demo-only. Visible Home/manager/search stay concept-native; shared PMv2 is headless only.

## settings inventory and schema
- Coverage depth: **core-deep**
- Notes: All 828 rows indexed and routable (`setting:{id}`). Inventory **still has legacy `scope:global`** metadata; the **project-only UI** projects those rows into the current Project and does not show Global as an editing scope. Search Default uses product index 1007 (cap 24); synthetic overlay 2000 is excluded. Candidate future change: remove user-facing global/project inheritance from schema.

## Models System / CLI Bridged Providers
- Coverage depth: **core-deep**
- Notes: Explicit **official-source** Install (`cmd.provider.cli.install_official` candidate). Authentication is a separate step; runtime demand deep-links to setup. No silent first acquisition. Routing/fallback reuses `cmd.provider.switch_route`. Usage refresh reuses `cmd.usage.refresh`.

## Commands / Wiring / DRY
- Preserve/reuse (not reminted): `cmd.settings.open`, `cmd.account.select_profile`, `cmd.provider.switch_route`, `cmd.usage.refresh`.
- New candidates (not minted): `cmd.settings.search.submit`, `cmd.settings.copy_from_project.preview` / `.apply` / `.rollback`, `cmd.provider.cli.install_official`, `cmd.settings.details.open`.
- All Settings rows mutate via registry-owned `setting:{id}` (not a new command id).
- Escape peels one layer: popup > details > search > sheet > named Back to rail.
- Consume SettingsSearch / ManagerSemantics / ObservableWork / RuntimeResourceGovernor / Project identity.
- Do not create a second ResourceGovernor or a universal visible manager renderer.

### Concept-native presentation (not shared)
- editorial single-column Home
- stable domain rail
- restrained content sheets
- compact roster and detail sheet
- compact anchored search dropdown
- exact-result reveal
- single-pane editorial push stack
- push motion

## Simulated backend
- Copy and CLI operations admit through the RuntimeResourceGovernor client; BinaryLocator provides installation identity from live Override→PATH→CommonLocations→Launchers probes. Project values persist in the project store (localStorage). ObservableWork owns progress. No second ResourceGovernor.
- ObservableWork is a truthful projection only.
- Deepen the existing simulated backend; do not invent a second ResourceGovernor.

## Bakeoff
- Winner: **none** (never selected).
- concept_only: **true**.
