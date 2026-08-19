# Plan-owner delta — Opus 5 · Codex (concept-09-tome-tabs)

*Settings is a bound volume with chapter tabs, expressed entirely in Puppet Master's own materials.*

Source family: **Rethemed Tome Tabs**. The reference board is authority for layout, hierarchy,
navigation and density only — never for pixels, colours, wording, provider names, counts or data.

## What was borrowed, and what was removed

This reference is **layout-only**. Borrowed:

- persistent edge/chapter tabs for major domains;
- layered page depth and stable page location;
- a broad central reading canvas;
- domain tabs plus manager-local tabs;
- list/detail manager composition;
- a stepwise copy flow;

Removed entirely and rebuilt from Puppet Master's own theme tokens, typography, icons, menus and motion:

- parchment and paper texture;
- brass and gears;
- sepia palette;
- book ornament and rules;
- skeuomorphic page edges and drop-shadow leaves;
- medieval and fantasy wording;
- decorative serif display faces;

## What this concept's shape presses on

**a persistent vertical edge tab strip, one tab per domain, joined to the canvas at the current tab** is the load-bearing decision. Everything below follows from it.

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
| Home composition | a broad central canvas with wide margins, search at the top of the canvas, and domain destinations as a two-column reading list |
| Navigation geometry | a persistent vertical edge tab strip, one tab per domain, joined to the canvas at the current tab |
| Manager composition | roster plus a tabbed detail page whose manager-local tabs are visually distinct from the domain edge tabs |
| Exact-result reveal | the edge tab activates, the page layer lifts, then the row takes a ring — three steps that explain where you were taken |
| Narrow-width transformation | edge tabs become a controlled push navigation |
| Motion metaphor | layer depth: pages lift and settle on the z-axis with bounded shadow |
| Density and typography | comfortable, 14px body, a measured 68-character column, wide canvas margins |
