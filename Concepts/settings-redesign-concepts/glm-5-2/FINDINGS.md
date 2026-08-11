# FINDINGS — GLM-5.2 Settings Bakeoff

Per the packet, this file records IA choices, what each concept deliberately explores differently, inventory/Plans conflicts found, functionality that remains simulated, and Slint translation risks. **No ranking or recommendation** is made unless the user later asks.

## Major information-architecture choices

### Concept 01 — Control Room (editorial / command center)
- **Home** is mission control: one dominant omni-search bar is the largest interactive element and the primary verb. Below it, a notices band (needs-attention / continue-setup / recommended — each with one headline, one consequence, one primary action), then **large editorial destination panels** carrying a title, a one-line purpose, a live status chip, and an explicit "Open" affordance.
- **Workspace** is a **book-TOC**: a persistent left vertical category index with collapsible subcategories, and a single continuous-document main pane for the active category. Settings search lives above the TOC.
- **Managers** open as a full stage with a back bar + breadcrumb.
- **Deliberately explores:** search primacy and editorial destination scale; the destination panel as the unit of importance (vs. a list or a map).

### Concept 02 — Atlas (spatial / cartographic)
- **Home** is an **atlas overview**: destinations are **named regions** with real boundaries placed on a 12-column grid, where **region size encodes content density** (more subcategories/managers = larger region). A "you-are-here" marker tracks the current region; needs-attention regions get a distinct border. A right rail holds the legend + notices + theme.
- **Workspace** is **focus + context**: the chosen region fills the canvas as a continuous document, while a compact **minimap** rail keeps every region visible (current one highlighted) and a **viewport rail** shows the in-view subcategory with a scroll-position thumb.
- **Search** is a **Cmd+K command overlay** centered at the top; focusing dims the map and surfaces results; selecting flies the viewport to the region/section.
- **Deliberately explores:** territory-as-navigation vs. list-as-navigation; whether a minimap makes the whole system legible at a glance.

### Concept 03 — Stack (single surface / progressive disclosure)
- **Home** is a **prioritized single stack**: a persistent search head, then status-critical notices, then **destinations as expandable rows** (chevron + status + open affordance — never pills).
- **Workspace** is **expand-in-place**: clicking a destination row grows it inline into the full workspace (subnav + continuous document + manager-promo cards); **only one row is expanded at a time**. There is no separate workspace route — disclosure is the whole model.
- **Search** filters the stack inline and can deep-link into an expanded row.
- **Deliberately explores:** whether Settings needs navigation at all, or whether progressive disclosure on one surface is enough; the cost/benefit of never leaving Home.

### Concept 04 — Stream (continuous navigable document)
- **Home** is the **headwaters**: a persistent **landmark rail** of named tick markers (on a ruler line — explicitly not pills), search, and an opening status beat, followed by the whole settings system as **named sections** in one continuous river.
- **Workspace** *is* Home — every category is a section in the stream; **managers are channels** you switch among via tabs within their section.
- **Search** filters/jumps the river; selecting scrolls (momentum-eased) to the matching section and switches its channel.
- **Scroll** drives the **landmark rail** (active marker advances) and a **progress indicator** along the rail.
- **Deliberately explores:** reading-vs-jumping; whether a single long document with good landmarks is more legible than a hierarchy.

## What each concept deliberately explores differently

| Dimension | 01 Control Room | 02 Atlas | 03 Stack | 04 Stream |
|---|---|---|---|---|
| Primary unit of importance | Editorial destination panel | Region (bounded, sized by density) | Expandable row | Named section in a river |
| Where search lives | Dominant bar atop Home | Cmd+K overlay, top-center | Head of the single stack | In the headwaters, above the river |
| Workspace shape | Book-TOC + continuous doc | Focus + context + minimap | Expand-in-place (no route) | The river itself |
| Nav/jump mechanism | Left TOC + jump + scrollspy | Minimap + viewport pan | Subnav within expanded row | Landmark rail + channel tabs |
| How managers relate | Full-stage surfaces, back-bar | Full-stage surfaces, back-bar | Rendered inline within the expanded row | Inline as channels within their section |
| Motion philosophy | Editorial cinematic (staggered) | Cartographic zoom/pan | Push/pop depth (FLIP) | Scroll-linked flow (calm at rest) |

These are genuinely different answers to the same questions, not four skins of one design.

## Inventory / Plans conflicts found

These are recorded in detail in `IMPACT_REGISTER.json` (record only — not applied). Headline conflicts:

1. **Primary category controls must stop reading as filter pills** (packet `01`, `00_START_HERE`). All four concepts replace the pill silhouette with destination panels / regions / rows / sections. This supersedes any existing inventory UI that renders categories as rounded chips.
2. **Settings row state model** (packet `01`) requires nine unambiguous states. Several demo rows in the legacy bloom modal used empty fields to mean "auto"/"inherit"; the new model forbids that. Affects `settings_inventory.json` row definitions.
3. **Category reorganization** (packet `01`): the humanized taxonomy (General, Appearance & Motion, Agents & Models, Permissions, Context/Memory/History, Planning/Goals, Git/Crew, Extensions, Media, System) differs from the legacy implementation-bound category list. Every required domain is preserved but regrouped.
4. **Provider hierarchy** (packet `02`): Provider→Account→Connection→Product→Model is strictly separated; the legacy flat "API key list" flattens distinct concepts. Connection groups (installed apps / connected accounts / API / server / free-community) replace the flat list.
5. **Claude/Antigravity CLI-owned OAuth** (packet `02`): PM must never present PM-direct OAuth for Claude or Antigravity; only CLI-owned flows inside isolated profiles. Any existing PM-OAuth path for these is a conflict.
6. **Goal Mode requested-vs-effective** (packet `03`): configured concurrency ≠ current effective capacity; the slider shows both. Any setting that implies "set concurrency = run concurrency" is wrong.
7. **Crew requested-vs-effective composition** (packet `03`): a template may request 5 members while capacity admits 2 and queues 3. Any UI that shows only the requested count is incomplete.
8. **Spellcheck as a quiet shared service** (packet `04`): no permanent composer button, no autocorrect, skips technical content. Any existing spellcheck toolbar mode conflicts.
9. **Theme selector model** (from PMConcept7 rev 7): family + mode (Auto/Light/Dark) rather than eight separate entries. The concepts follow the family/mode model.

## Functionality that remains simulated

All of the following are **interactive in the concept** (they respond and show results) but do not call real backends:

- Provider **refresh** (shows a "last-known-good held" overlay, then a toast — simulates stale-while-revalidate).
- Provider/account **reconnect** (flips the row to healthy after a delay — simulates a probe).
- Model **favorite/alias/effort/Normal-Fast** menu (applies a toast — no persistence to a real catalog).
- **Search** runs against the in-memory demo dataset, not the real 818-setting inventory.
- **Settings toggles/selects/sliders** update UI and toast; they do not write to `settings_inventory.json`.
- **Manager add/connect** returns a simulated "Add … — simulated in concept" toast (honest about being a concept).
- **Goal concurrency effective value** is a fixed demo number (2), not computed from live Usage/Orchestrator capacity.
- **Spellcheck** uses the browser's HTML `spellcheck` attribute to simulate the underline concept; production needs a Slint-portable spelling-service abstraction (recorded as a Slint impact).
- **Theme/reduced-motion/density** persist via localStorage only.

No fake no-op actions are used: every control either does something visible or honestly reports it is simulated/unavailable.

## Slint translation risks

Recorded per packet `05` (Slint 1.17.1 portability). The concepts deliberately avoid the listed unportable patterns; residual risks:

1. **CSS Grid with `grid-template-areas`** (the shell) → Slint uses layout containers; the grid is a layout spec, not semantic state, so it translates to nested `VerticalLayout`/`HorizontalLayout`. Low risk but requires manual translation of the responsive reflow.
2. **`backdrop-filter` (glass themes)** → Slint 1.17.1 has no analogue. Glass themes use **one backdrop blur over a pre-baked wallpaper** (the PMConcept7 T16 technique, already proven). The concept's glass implementation bakes the wallpaper into `--glass-wall`; production re-bakes at native resolution. The manager refresh-overlay also uses a backdrop blur and **falls back to an opaque plate under glass** (no nested blur) — this fallback must be preserved.
3. **`color-mix(in srgb, …)`** is used for themed chip borders. Slint build is expected to precompute these (per FinalGUISpec F3-431); the concept leaves them as `color-mix` rather than hand-precomputing, since the Slint build owns that pass.
4. **IntersectionObserver scrollspy** → not a DOM-measurement-as-semantic-state violation (it observes section visibility, not geometry-as-state), but Slint scroll views need an equivalent visibility/offset hook. Each concept keeps the active-sub **state** in `PM.state.activeSub` separate from DOM positions, so the semantic state is portable; only the observer mechanism is web-specific.
5. **Smooth scroll + FLIP animations** → Slint has animations but not the web's `scrollTo({behavior})` or FLIP. Reduced-motion paths already reach the same final state via opacity/state changes; the motion paths need re-expression as Slint property animations.
6. **`localStorage` persistence** → production uses the real settings store; the concept's localStorage is a web-only convenience with no Slint equivalent. Low risk (it is not semantic state).
7. **Long lists** (provider/model rows, memory Gists) → the concepts render the full demo set (small). Production must virtualize per packet `05` ("no always-instantiated rendering of hundreds of rows"); the row components are already data-driven and stateless, so virtualization is additive.
8. **`max-height` transition on Stack expand** → uses `max-height` animation which is a web idiom; Slint would animate `height` or use a layout animation. Reduced-motion path is opacity-only and portable.
9. **Motion helpers (`motion.js`)** → FLIP, staggerIn, transitionView, smoothJump, pulseOnce, crossFade, growSettle are all web-DOM-idiom animations. The **semantic state** they animate (expanded/active-saved/active-sub) lives in `PM.state`, separate from DOM geometry. Slint port: each helper maps to a Slint property animation or layout animation; the reduced-motion fallbacks (opacity/state-only) are portable as-is.
10. **Spellcheck demo (`spellcheck.js`)** → uses `contenteditable` + TreeWalker text-node wrapping, which is browser-only. Production must use a **Slint-portable spelling-service abstraction** (packet 04); the concept's dictionary/suggestion-menu/skip-logic contract is the portable part, not the DOM-wrapping mechanism.
11. **Exposure-level disclosure** → the segmented control filters rows by `data-exposure` attribute; in Slint this is a model filter on the settings list, not a DOM show/hide. Portable.
12. **Setup-stepper modal** → uses `position:fixed` overlay; Slint uses `PopupWindow` or a dialog component. Portable.

## No ranking

Per the packet, concepts are presented for comparison only. A selection decision is the user's to make later.
