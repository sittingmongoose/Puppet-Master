# Plan-owner delta — Opus 5 · Directory (concept-05-directory-take-1)

*Settings is a directory you can hold in your head.*

Source family: **A1 Directory / Take 1**. The reference board is authority for layout, hierarchy,
navigation and density only — never for pixels, colours, wording, provider names, counts or data.

## What this concept's shape presses on

**compact left text rail plus a card grid; the card expands in place into the area it names** is the load-bearing decision. Everything below follows from it.

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
| Home composition | search, one attention block, then a two-column grid of destination cards over a compact text rail of the twelve areas |
| Navigation geometry | compact left text rail plus a card grid; the card expands in place into the area it names |
| Manager composition | roster at a fixed 280px with the selected object's form filling the rest of one pane; subpages are a quiet tab strip above the form |
| Exact-result reveal | the destination row lifts and takes a soft ring that fades once, originating at the row |
| Narrow-width transformation | the rail pushes off-screen, the grid becomes one column, roster and form become two pushed pages |
| Motion metaphor | expand-and-transfer: the thing you pressed becomes the thing you get |
| Density and typography | medium-tight, 13px body, 1.45 line height, 12px row rhythm |
