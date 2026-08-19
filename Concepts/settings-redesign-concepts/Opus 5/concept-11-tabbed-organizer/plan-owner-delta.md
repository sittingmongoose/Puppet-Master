# Plan-owner delta — Opus 5 · Folio (concept-11-tabbed-organizer)

*Settings is well-organised into tabs and sheets that never lose your place.*

Source family: **Rethemed Tabbed Organizer**. The reference board is authority for layout, hierarchy,
navigation and density only — never for pixels, colours, wording, provider names, counts or data.

## What was borrowed, and what was removed

This reference is **layout-only**. Borrowed:

- category tabs resembling a well-organised file system;
- layered sheets that preserve location;
- compact home categories and recent changes;
- domain-level tabs and a related-manager strip;
- provider roster with detail tabs;
- deep-link results nested in the same page stack;
- copy categories and source project in adjacent panes;

Removed entirely and rebuilt from Puppet Master's own theme tokens, typography, icons, menus and motion:

- literal paper and manila folders;
- binder rings, staples and paper clips;
- physical tab dividers and torn edges;
- stacked-sheet drop shadows;
- parchment and office-supply decoration;

## What this concept's shape presses on

**top category tabs for the domains and a second row of sub-tabs inside a domain, ranked by size and weight** is the load-bearing decision. Everything below follows from it.

### FinalGUISpec

Settings gains a directory-and-workspace contract in place of the chip/bloom modal; the navigation, breadcrumb, Back and Close grammar all change with it.

### settings inventory and schema

Legacy `scope` metadata is projected to the current Project and is no longer an editing axis. `general.interaction.scope-labels` describes a capability a Project-only design does not have.

### Models System / Multi-Account / CLI Bridged Providers / Provider OpenCode

Provider manager density: connected state, selected account, models, usage-end behaviour, routing and setup answered first; credentials, installations, catalogues, limits and logs as coordinated subpages.

### Binary Locator and installation lifecycle

Installations are addressable objects with human identity first and resolved launcher, real path, owner and confidence in advanced detail. Unknown ownership is manual-only.

### Assistant Memory / Personas / Goal Runtime / Orchestrator / Planning Wizard / PRD Builder

Each is a manager family reachable from its owning domain and from search, with a concept-native archetype rather than a wall of rows.

### Permissions / FileSafe

Rule editing lives in a manager, and permission gates apply to setting writes that govern tool reach.

### Commands / UI Command Catalog

`cmd.settings.bloom.open` retires; navigation collapses onto one destination-carrying command; search selection must route by immutable result id.

### MCP / Skills / Plugins / Tools / LSP / Formatters / File Manager / Testing

Catalogue and roster archetypes, lazily hydrated and virtualized.

### Worktrees / Git / GitHub / Containers / Registries

Roster and read-only health projections inside Settings; the owning subsystems keep their operations.

### Storage / Runtime Artifacts / Outputs

Retention and cleanup are preview-and-confirm transactions with receipts.

### Release / updates owner

Application and content updates stay a named owner with a reachable insertion point and a stated return contract.

### Usage

Read-only snapshot in Settings; measurement, history and projection stay with Usage.

## Required supersessions

- the old Settings chip / bloom / no-sidebar contract, which PMConcept7 still ships as the `s4-*`
  hero, chip rail, horizontal shelves and modal editing panel;
- the `Inheriting from Global` affordance in the current project settings modal — no inheritance is
  exposed anywhere in this concept;
- collective manager coverage and `shared_grammar` as a coverage status;
- search that routes by grouped-array position.

## What this concept deliberately does not own

Measurement and balances (Usage), admission and scheduling (RuntimeResourceGovernor), progress and
wait projection (ObservableWork), binary resolution and installation lifecycle (BinaryLocator), and
the ten named owner modules reachable from System & Advanced. Each has a reachable insertion point,
a named owner, a stated reason for being separate and a return contract — and no fabricated backend.

## Presentation this concept owns alone

| Axis | This concept |
|---|---|
| Home composition | a compact grid of category tiles above a Recent changes list showing what changed, where, when and by whom |
| Navigation geometry | top category tabs for the domains and a second row of sub-tabs inside a domain, ranked by size and weight |
| Manager composition | roster on the left and a detail on the right with its own third-level tab row |
| Exact-result reveal | the correct tab and sub-tab auto-select and the sheet slides in with the row ringed, inside the existing tab stack |
| Narrow-width transformation | tab rows become a horizontally scrolling chip rail with the current chip pinned into view |
| Motion metaphor | sheet cross-slide while the tabs never move |
| Density and typography | medium, 14px body, 40px roster rows, hierarchy through size and weight rather than colour |
