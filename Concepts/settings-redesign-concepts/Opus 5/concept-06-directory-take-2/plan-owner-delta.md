# Plan-owner delta — Opus 5 · Editorial (concept-06-directory-take-2)

*Settings reads like a well-set page.*

Source family: **A1 Directory / Take 2**. The reference board is authority for layout, hierarchy,
navigation and density only — never for pixels, colours, wording, provider names, counts or data.

## What this concept's shape presses on

**a narrow, stable icon-and-label rail that never changes as you go deeper; sub-navigation nests inside the content sheet** is the load-bearing decision. Everything below follows from it.

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
| Home composition | a single column of large editorial destination rows, each with a full sentence of description |
| Navigation geometry | a narrow, stable icon-and-label rail that never changes as you go deeper; sub-navigation nests inside the content sheet |
| Manager composition | a compact 44px roster and a restrained detail sheet measured to about 72 characters |
| Exact-result reveal | a marker in the left gutter beside the row and one slow underline sweep of its title |
| Narrow-width transformation | a single-pane editorial push stack, each level a full page with a named Back |
| Motion metaphor | vertical slide in the reading direction |
| Density and typography | airy, 14px body, 1.6 line height, 20px row rhythm |
