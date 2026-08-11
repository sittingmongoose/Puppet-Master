# Findings — Settings Redesign Bakeoff — Qwen 5.8

No ranking or recommendation is made. These are observations from building four divergent concepts against the packet.

## Major information-architecture choices

### 01 Atlas — Settings Directory
- Home is a directory of places: each destination row carries title, purpose, status summary, section count, and an open affordance. No pill silhouettes; status is icon + text + badge, never color-only.
- Notices live in a side column beside the directory (vertical stack, never a clipped horizontal rail).
- Workspace is a two-pane document: persistent left table of contents, continuous subcategory document right. Managers render as full sections ("rooms") inside the owning subcategory.
- Search morphs the directory itself into grouped results, preserving spatial memory of the home.

### 02 Deck — Command Center
- Home leads with a command field, then a status board (status-first rows: status chip, headline, reason, one primary action), then destination modules with live readout lines.
- Destinations are large tiles with explicit "OPEN" affordances and LED-style status dots that always pair with text.
- Workspace uses a sticky command strip: category chip, horizontally scrolling subcategory tabs that auto-center on scrollspy, adjacent search, exposure segment.
- Managers are consoles: expandable rows with monospace readouts; Crew shows requested vs admitted vs waves; Terminal shows palette swatches and a rendered preview strip.

### 03 Ledger — One Document
- Home is a document cover: doctype line, search as an underlined ledger line, numbered contents, notices as "marginalia", recent amendments.
- Every setting is a hairline-separated entry with a "Note" disclosure; value source and scope printed as quiet metadata.
- Managers are embedded appendices with document tables (provider register, requested/effective roles, skills/plugins/tools inventories, context admission ledger).
- Margin outline with a sliding ink marker replaces boxes and cards; section numbers (§N.M) run through the whole surface.

### 04 Spoke — Settings by Intent
- Home groups destinations into four intent wings (Connect & provide, Shape assistance, Guard & permit, Plan & automate) plus an A–Z fallback so no domain is hidden by the re-taxonomy.
- Search is a persistent launcher that floats over home and workspace.
- Workspace keeps the continuous document but moves subcategory navigation to a right-edge progress tick rail.
- Managers are master-detail split views: inventory list left, inspector right. Provider inspector holds accounts, usage snapshots, continuation choices, and models; Persona inspector carries scope application and the ceiling note; Media inspector carries route/capability/history.

## What each concept deliberately explores differently

- **Hierarchy source**: Atlas = spatial directory; Deck = operational status; Ledger = typographic document order; Spoke = user intent grouping.
- **Destination representation**: rows (Atlas), status module tiles (Deck), numbered contents entries (Ledger), wing spokes (Spoke). None uses pills, colored left borders, or color-only state.
- **Navigation placement**: left TOC, top strip, margin outline, right ticks — proving the scrollspy/jump contract is placement-independent.
- **Manager relationship**: inline room (Atlas), console row (Deck), appendix table (Ledger), split view (Spoke).
- **Density and disclosure**: Ledger is densest with inline footnotes; Deck is readout-heavy; Atlas is spacious; Spoke is inspector-driven.
- **Motion flavor**: cartographic travel, staged console reveals, ink-and-paper minimalism, orbital depth — all honoring the same reduced-motion contract (short opacity/state changes, identical final states).

## Inventory / Plans conflicts and gaps found

1. `Plans/settings_inventory.json` currently holds **825 settings in 12 categories** (`general, ai, safety, code, memory, planning, branching, media, web, personas, extensions, system`), while `PMConcept7-NOTES.md` still cites **818 settings**. The inventory is newer; the notes are stale.
2. The inventory's category ids are internal boundaries, not the packet's humanized domains. `ai` mixes providers/models/personas/roles; `branching` mixes Git/worktrees/Crew; `web` mixes extensions and search. The four concepts propose humanized taxonomies; a mapping table will be needed before any canonical reorganization.
3. The packet's exposure ladder (Standard / Advanced / Expert / Managed / Diagnostic / Unavailable) does not match the inventory's `tier` vocabulary (e.g. `simple`), so a tier migration would be required.
4. The second Usage handoff requires deep links by stable identity rather than `cmd.settings.bloom.open`. These concepts navigate by `{category, subcategory, setting, manager}` targets; command catalog ids for those targets do not exist yet (recorded as candidates, not minted).
5. The current PMConcept7 settings surface is the `s4` bloom modal (shelves + horizontal rail). All four concepts replace it with a full workspace; the bloom would survive only as a possible quick-access shell if desired. This is a structural change to the Settings System contracts in `Plans/FinalGUISpec.md`.
6. Model names in demo data (Claude Sonnet 4.5, GPT-5.2, Gemini 3 Pro, Qwen3 Coder 30B, etc.) are illustrative; production must source names/capabilities from models.dev / Free Coding Models catalogs with evidence freshness.

## Coverage notes on manager controls

- Model management demonstrates favorite/unfavorite, alias, hide/show, priority, capability evidence, effort, Normal/Fast, modality/context/tool/MCP readouts, unavailable reasons, and requested/effective roles in all four concepts. Models are browsed inside their provider, which is how provider/account filtering is structured here; a separate global model filter control is not built.
- Provider/account controls demonstrate nickname, identity, auth owner, transport, isolation model, enabled state (disabling the preferred account migrates preference with a receipt), priority ordering, sticky sessions, preferred-account switching (future requests only), health, usage pressure/reset, continuation choices, reconnect, readiness probe, diagnostics, install, CLI-owned login launch, rescan, and CLI update checks.
- Spellcheck demonstrates the full contract: underlines, five explicit suggestion actions with no autocorrect, the normal and advanced Settings rows from the combined contract, and the per-thread overflow disable in the assistant panel header (thread-local; defaults unchanged).
- Crew templates show requested vs effective composition, min/max members, per-member Persona/route plus route candidate lists, route policy, guards, reserve, worktrees, ports/test resources, child-spawning depth, board, reducer, and failure policy.
- Console/details expansion state now survives re-renders after account or provider actions, so acting on a row never collapses the context around it.

## Functionality that remains simulated

- All provider network actions: reconnect, readiness probe, install, repair, setup flows, catalog refresh (timed 2.2s), account identity checks. Each returns an honest receipt.
- Deep links to Usage (Usage surface is out of scope for this bakeoff) — receipts describe the intended target.
- Account switching affects only future simulated requests; there is no live request stream in a concept.
- Manager actions beyond local state: memory verify/discard/rebuild, MCP repair/connect, Crew dry-run forecasts, terminal diagnostics, media test generations, skill inspect.
- Alias editing uses the browser `prompt()`; effort/Normal-Fast preferences save to demo state only.
- Spellcheck uses a small demo dictionary with seeded misspellings; browser `spellcheck` is not used. Production needs the Slint-portable spelling-service abstraction.
- The surrounding shell (rail destinations, project chip, route chip) is decorative by design and says so when clicked.

## Slint 1.17.1 translation risks

1. **Scrollspy geometry**: concepts compute active sections from element offsets. In Slint, keep the active subcategory as state driven by viewport position from the list/section model; never make DOM geometry the source of truth.
2. **Sticky frosted chrome**: `backdrop-filter` on bars has no Slint analogue. Use the PMConcept7 T16 pattern: one blur over pre-baked assets for Glass, opaque plates elsewhere.
3. **`color-mix()` in badges**: precompute per-theme colors at build time (F3-431 precedent).
4. **contenteditable spellcheck underlines**: needs Slint styled-text ranges plus a `PopupWindow` for suggestions; the interaction contract (no autocorrect, five explicit actions) ports directly.
5. **Auto-centering tab strip / sliding markers**: implement as Flickable ensure-visible animations and property-animated indicator positions.
6. **Fully instantiated rows**: demo lists are small; production catalogs (hundreds of models) must be data-backed/virtualized repeaters.
7. **Width tiers**: ResizeObserver tiers become size-change callbacks writing a tier enum into state.
8. **`prompt()` dialogs**: replace with native dialog components.
