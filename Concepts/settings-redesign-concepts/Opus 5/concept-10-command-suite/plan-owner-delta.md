# Plan-owner delta — Opus 5 · Command (concept-10-command-suite)

*Settings for someone who knows where they are going: keyboard first, panes left to right.*

Source family: **Rethemed Command Suite**. The reference board is authority for layout, hierarchy,
navigation and density only — never for pixels, colours, wording, provider names, counts or data.

## What was borrowed, and what was removed

This reference is **layout-only**. Borrowed:

- command-index navigation;
- keyboard-first movement;
- multi-pane left-to-right drill-down;
- compact legible data tables;
- direct path and status visibility;
- an editor beneath or beside its context;
- transactional copy panels;

Removed entirely and rebuilt from Puppet Master's own theme tokens, typography, icons, menus and motion:

- fake terminal chrome;
- green monochrome;
- CRT and scanline effects;
- monospace body text;
- code-only labels and slash-path labels as primary names;
- ASCII box drawing;

## What this concept's shape presses on

**multi-pane left-to-right drill-down, up to four panes at the widest widths, each pane separately scrollable** is the load-bearing decision. Everything below follows from it.

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
| Home composition | a left command index of the twelve areas with keyboard hints, a project context block, an at-a-glance panel and a recently accessed list |
| Navigation geometry | multi-pane left-to-right drill-down, up to four panes at the widest widths, each pane separately scrollable |
| Manager composition | a compact but legible table with real column headers and the selected row's detail beneath it in the same pane |
| Exact-result reveal | the row is selected in the table and its editor opens directly beneath it, with the full path shown once above |
| Narrow-width transformation | panes collapse to one with breadcrumb chips standing in for the panes that are off-screen |
| Motion metaphor | horizontal pane slide with the leftmost pane holding position |
| Density and typography | compact tabular, 13px body, 32px rows, tabular numerals, vertical rules between panes |
