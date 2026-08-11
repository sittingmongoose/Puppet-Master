# FINDINGS — Settings Redesign Bakeoff (Kimi)

This file records what each concept explores, where the concepts deliberately diverge, conflicts found against the current inventory/Plans, what remains simulated, and Slint translation risks. **No concept is ranked; no winner is recommended.**

## 1. Major information-architecture choices

### Concept 01 — Atlas (Directory IA)
- Home is an *annotated directory*: search crowns the page, and every destination is a full-width row with title, purpose, live status summary, and a chevron — unmistakably a place, never a filter chip.
- Workspace is a three-region reference layout: persistent outline (search above it), continuous document, and a right **context gutter** that follows row focus with value source, scope, help, and related settings across categories.
- Managers are master–detail: provider list grouped by humanized connection groups; the detail side answers the packet's default questions on one Overview tab.
- Deliberately explores: whether a persistent context gutter removes the need for long tooltips; category "at a glance" state counts.

### Concept 02 — Constellation (Command-center IA)
- The query *is* the home: at rest the page shows verb-driven decision rows and destination command cards; the first keystroke reshapes the whole page into a ranked command list.
- Workspace docks the query into a compact header beside a segmented destination bar (rectangular space-switcher, not pills) and a breadcrumb; the scrollspy instrument is a **right-edge section minimap** whose ticks are both position indicators and jump buttons.
- Providers are a mission surface: a computed health-tile board over grouped, expanding family rows, with a slide-in brief for the full detail.
- Deliberately explores: keyboard-first flow (`/` focuses search from anywhere), how much navigation chrome can shrink before orientation suffers.

### Concept 03 — Ledger (Document IA)
- Home is an editorial front page: masthead, full-width search band, "Needs your decision" blocks (Recommended rendered quieter and dashed, never error-like), and a numbered **annotated index**.
- Workspace is a single ~78ch reading column with strong hierarchy and a **floating table of contents** (progress hairline, current-section marker) that condenses to a dot rail + overlay when squeezed; jump targets get a one-shot underline sweep.
- Managers are appendix chapters with a **stamped status block** per provider family and inline evidence expanders.
- Deliberately explores: how far calm typography and margin annotations can replace chrome; near-zero motion as a feature.

### Concept 04 — Workbench (Ops-console IA)
- Home is an ops board: omnibox in a console bar, a **status band** of computed tiles (attention, setup, providers ready, usage pressure, catalog freshness) that navigate on click, and destination **instrument panels** with live stats (counts of managed/expert/changed settings).
- Workspace uses an accordion drawer nav and **sticky section headers** carrying live "Section M of N" position plus per-section status chips; squeezed widths collapse the nav to an overlay drawer.
- Providers are a control room: dense rows, inline expansion decks, and a bottom **diagnostics drawer** that pushes content instead of overlapping it.
- Deliberately explores: density and live instrumentation; whether status-band-first helps triage; requested-vs-effective crew composition as seat blocks with queued waves.

## 2. Deliberate divergences

- Four different search *treatments* of the same engine: directory replacement (Atlas), page-reshaping command list (Constellation), annotated index overlay (Ledger), console overlay (Workbench).
- Four different scrollspy instruments: outline highlight, minimap ticks, floating TOC marker + progress hairline, sticky headers + accordion sync.
- Four motion philosophies with identical reduced-motion outcomes: settled utility, directed continuity, print precision, mechanical snap.
- Manager breadth is distributed on purpose: Memory + MCP (Atlas), Context & Instructions + Terminal (Constellation), Personas + Skills/Plugins/Tools (Ledger), Crew + Media (Workbench) — together covering all of packet group A and four of five in group B, while every concept ships the full Provider/Agent/Model manager.

## 3. Inventory / Plans conflicts found

- The current settings inventory mixes internal implementation boundaries with user goals; all four concepts use the packet's 11 humanized categories. No demo setting was dropped, but the mapping of legacy ids to the new taxonomy is a real migration task (recorded in `IMPACT_REGISTER.json`).
- PMConcept7's Spotlight has no per-row Default/Recommended/Managed/Unavailable/Effective-differs vocabulary; the bakeoff's row-state model supersedes its badge set conceptually (recorded, not applied).
- The demo data exposes a `planning.verifier-route` gap (no verifier configured) as an attention notice — consistent with the packet's role-assignment rules; any real route picker needs command/wiring support (recorded).
- Free Models is modeled strictly as a grouping (no credential store), matching packet §2; if the current inventory treats it as a provider, that is a conflict (recorded as uncertainty: medium).

## 4. What remains simulated

- All sign-in/install/reconnect/repair/readiness actions return honest receipts; no OAuth flow, download, or probe runs.
- Catalog refresh simulates latency and preserves last-known-good rows; no network fetch occurs.
- Account switching updates demo state and shows the "future requests only" receipt; there is no in-flight request to protect in a static concept.
- Guided setups (OpenRouter key, media provider, vLLM install) show steps and receipts only.
- Usage snapshots are static read-only demo data; the "Open Usage" deep link receipts instead of navigating (Usage concepts are another folder's canon).
- Spellcheck uses fixed demo suggestions for three seeded misspellings; production must use the Slint-portable spelling-service abstraction.

## 5. Slint translation risks

- **Low:** rows, badges, notices, tabs, accordions, tables, and master–detail layouts map directly to Slint widgets; all state is store-backed, never DOM-derived.
- **Medium:** the Constellation minimap and Ledger floating TOC need custom painted elements; the shared-element-style transforms (Constellation card→header) would become property animations, not FLIP.
- **Medium:** sticky section headers (Workbench) are straightforward in Slint scroll views but the "Section M of N" counter must come from the scroll model, not geometry reads — the concept already computes it from data.
- **Watch:** Glass theme's single `backdrop-filter` blur has no cheap Slint equivalent — use a pre-tinted translucent surface instead (documented in `pm-themes.css`); the wavy spellcheck underline needs a custom paint pass or a dotted-line fallback.
- **By design:** long inventories are data-backed and would virtualize in Slint; no concept instantiates unbounded row trees (the largest render is one category's sections, tens of rows).

## 6. Accessibility / input notes

- All scrollspy instruments have button semantics and labels; jump moves keyboard focus into the target section.
- Reduced motion is honored via `data-motion` and `prefers-reduced-motion`; every animated concept reaches the same final state.
- Status is always text + icon, never color-only; no information is hover-exclusive (`data-tip` only carries supplementary help/evidence).
