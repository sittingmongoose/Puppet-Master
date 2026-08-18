# FINDINGS — GLM-5.2 Settings Bakeoff (Final Cumulative)

Per the **PM_Settings_Bakeoff_Final_Cumulative_2026-08-08** packet (which supersedes all prior Settings packets) and corrected per **PM_Settings_Dependency_and_Work_Correction_2026-08-13** (applied 2026-08-15 — the original build had not processed it; see `reference-review-report.json`). This file records IA choices, what each concept deliberately explores differently, the per-concept family-ownership partition, inventory/Plans conflicts found, functionality that remains simulated, and Slint translation risks. **No ranking or recommendation** is made.

## Correction pass (2026-08-13 packet, applied 2026-08-15)

The dependency omission was **material**, and it produced real defects the original audit missed:

1. **Concept-04 violated lazy hydration** — its Home built every category's channel body at startup, eagerly rendering 4 full managers (pam, context, mcp, media). Manager channels now render as lightweight lazy placeholders; an IntersectionObserver hydrates the active manager channel on first view; explicit opens hydrate immediately. Startup now builds zero manager surfaces.
2. **Simulated progress** — the manager-open "loading" was a 250ms spinner; reconnect/refresh were predetermined successes. Now: skeleton rows + an ObservableWork projection (indeterminate + waitReason; determinate only with a real denominator); the failing row's first probe times out honestly and recovers on retry; refresh is held with a network waitReason while offline.
3. **Missing/dead states** — no offline state existed; managed/unavailable state blocks were dead code. All three now render (PAM offline last-known-good banner; Permissions managed block; Containers unavailable block).
4. **Runtime-demand contract unimplemented** — the final adjudication's Provider Setup Required flow (receipt, explicit consent, continuation token) is now demonstrated end-to-end from a PAM toolbar trigger.
5. **No virtualization proof** — a 100-installation windowed list now demonstrates bounded DOM (11–16 rows live at any scroll position, with a meter).
6. **A real interaction bug** — `S.wireShell()` stacked duplicate click listeners on every navigation; after several view changes the rail/chat toggles appeared dead. Fixed with a wired guard and probe-verified.
7. **Search honesty** — typo tolerance was claimed but the matcher was exact substring. Now scored tiers (substring > word-prefix > close-typo via bounded edit distance > subsequence) with label-only highlight ranges, keyboard navigation, and visible empty states in all four concepts.
8. **Motion honesty** — `flip`/`transitionView`/`growSettle` were dead code while this file advertised "FLIP reorder" and "height-settles-then-content". They are now wired (Stack grows/settles and FLIP-reorders; 01/02 swap views with directed transitions incl. a cartographic zoom), and each concept gained its own motion personality additions (vitals count-up; traveling pin + draggable viewport rail; depth sheets; landmark tick pop + channel ink + progress bead).
9. **9-state completeness** — the missing `Auto` fixture was added.
10. **Governor representation** — RuntimeResourceGovernor had no positive presence (compliant only by absence). The Goal manager now shows admission outcomes (admitted / queued·resource / blocked·permission / cancelled·user) with the sole-ownership contract: Settings owns defaults and ceilings; the governor alone admits; ObservableWork alone projects waits and progress.

## Showcase pass (2026-08-15): "showpiece under strict packet-calm"

A deliberate polish layer **on top of** correction compliance (no packet claim changed). The design brief: every motion is interaction- or state-driven, idle screens are perfectly still, and the pointer is the instrument that makes the surface feel alive. This resolves the packet's motion law ("film-level means directed choreography and continuity, not constant movement") with a showpiece feel — calm is the resting state; motion is the response.

**Motion personality (per concept, metaphor-mapped):**

- **01 Control Room — "console power-up."** A one-time boot sequence after layout settles (eyebrow → headline → sub → search → vitals → config strip). The vitals ribbon pairs count-ups with inline SVG sparklines drawn via `stroke-dashoffset`. Destination panels are pointer-reactive (glow + ≤1.5° tilt), and stage entrances radiate from the clicked panel via origin capture.
- **02 Atlas — "cartography."** A static contour/grid backdrop sets the map mood with zero animation. On Home entry, region borders draw a survey beam (staggered). The you-are-here pin drops with a critically-damped spring bounce-settle; the minimap viewport thumb follows scroll on a spring curve; opening a region zooms the stage out from that region's origin.
- **03 Stack — "deck physics."** Depth sheets slide out with staggered insets; the FLIP reorder flight adds ±0.5° rotation for a card-deck feel; item heads have a deck press; chevrons are magnetic (rotate on hover/press).
- **04 Stream — "living river, calm at rest."** The progress bead grows a short velocity wake mapped to scroll velocity that decays to exactly zero at rest (interaction-driven, so calm-compliant); sections reveal children in a bounded stagger (title → purpose → channels → body); landmark activation fires a one-shot ripple ring.

**Engine additions (motion.js, all transform/opacity only, all reduced-motion-safe):** `M.captureOrigin` (spatial-origin stage transitions — entrances radiate from the clicked control); `M.spring` (critically-damped rAF spring with a hard force-settle so nothing can run long); `M.pointerFX` (delegated, rAF-throttled pointer reactivity — cursor-following glow via `--mx/--my`, ≤1.5° tilt via `--tilt-x/y` on opt-in cards, magnetic press on buttons; gated on `(hover:hover) and (pointer:fine)`, inert under reduced motion, paused when the tab is hidden); bounded staggers (`staggerIn` limit); theme-scaled pacing (`--pm-motion-scale`: friendly/glass 1.0, basic 0.85, retro 0.8 multiplying the `--t-*` duration tokens); micro-choreography (toast icon+label entrance and exit, chip settle on value change, sprout badge pop on count change, one-shot search breathe on ⌘K).

**Idle-silence is a tested guarantee, not a vibe:** the audit asserts zero running animations (`getAnimations()`) on every concept's Home after 2.1s idle — no indefinite pulses, no ambient shimmer, nothing moves unless the user acts. The Stream velocity wake is the exception that proves the rule: it exists only while the user scrolls and returns to exactly zero at rest.

## Per-concept family ownership (the final packet's coverage matrix)

The four concepts collectively prove the complete `MANAGER_COVERAGE_MATRIX.json` with no family `missing`. Each concept **owns** a bucket (full deep demos) and shares the rest via the common manager grammar:

- **01 Control Room** owns: Context & Instructions, Memory, Personas, Goal & Automation, Crew, Permissions/FileSafe, Back Seat Driver.
- **02 Atlas** owns: Notifications & Sounds, Sound Library/Uploads/Packs, Appearance, Spellcheck/Dictionaries, Desktop/Tray/Window, Teacher/Help.
- **03 Stack** owns: File Manager/Editor, Terminal, LSP, Formatters, Commands & Shortcuts, MCP, Skills/Plugins/Tools, Testing & Debug.
- **04 Stream** owns: Storage & Retention, Backup & Restore, Settings Lifecycle, History & Sessions, Runtime Artifacts, Source Control/Worktrees, GitHub Actions, Containers/Registries, Web/Search/Fetch, Project Search Index, Workspace Cleanup, and the **deferred** Future Server/Project Sync insertion shell.

Every concept also demonstrates the **core** surface (Settings Home, Search, Workspace, Provider/Account/Model/Installation, ordinary setting-row grammar). Each Home makes ownership explicit via an **owned-families strip** of destination-control cards (not filter pills). The full surface stays navigable everywhere; non-owned families are `shared_grammar`.

## Major information-architecture choices

### Concept 01 — Control Room (editorial / command center)
- **Home** is mission control: one dominant omni-search bar is the largest interactive element and the primary verb. Below it, the owned-families strip, then a notices band (needs-attention / continue-setup / recommended — each one headline, one consequence, one primary action), then **large editorial destination panels** with title, one-line purpose, live status chip, and explicit "Open" affordance.
- **Workspace** is a **book-TOC**: a persistent left vertical category index with collapsible subcategories, and a single continuous-document main pane for the active category.
- **Managers** open as a full stage with a back bar + breadcrumb.
- **Explores:** search primacy and editorial destination scale; the destination panel as the unit of importance.

### Concept 02 — Atlas (spatial / cartographic)
- **Home** is an **atlas overview**: destinations are **named regions** with real boundaries on a 12-column grid, where **region size encodes content density**. A "you are here" marker tracks the current region; needs-attention regions get a distinct border. A right rail holds legend + notices + theme; the owned-families strip spans full width below the canvas.
- **Workspace** is **focus + context**: the chosen region fills the canvas as a continuous document, while a compact **minimap** keeps every region visible and a **viewport rail** shows the in-view subcategory with a scroll thumb.
- **Search** is a **Cmd+K overlay** centered at the top; selecting flies the viewport to the region/section.
- **Explores:** territory-as-navigation vs list-as-navigation; whether a minimap makes the whole system legible at a glance.

### Concept 03 — Stack (single surface / progressive disclosure)
- **Home** is a **prioritized single stack**: a persistent search head, then the owned-families strip, then status-critical notices, then **destinations as expandable rows** (chevron + status + open affordance — never pills).
- **Workspace** is **expand-in-place**: clicking a destination row grows it inline into the full workspace (subnav + continuous document + manager-promo cards); **only one row is expanded at a time**. Disclosure is the whole model.
- **Search** filters the stack inline and deep-links into an expanded row; managers render inline.
- **Explores:** whether Settings needs navigation at all, or whether progressive disclosure on one surface is enough.

### Concept 04 — Stream (continuous navigable document)
- **Home** is the **headwaters**: a persistent **landmark rail** of named tick markers (on a ruler — explicitly not pills), search, the owned-families strip, an opening status beat, then the whole settings system as **named sections** in one continuous river.
- **Workspace** *is* Home — every category is a section; **managers are channels** switched via tabs within their section.
- **Search** filters/jumps the river; **scroll** drives the landmark rail and a progress indicator.
- **Explores:** reading-vs-jumping; whether a single long document with good landmarks is more legible than a hierarchy.

## What each concept deliberately explores differently

| Dimension | 01 Control Room | 02 Atlas | 03 Stack | 04 Stream |
|---|---|---|---|---|
| Primary unit of importance | Editorial destination panel | Region (bounded, sized by density) | Expandable row | Named section in a river |
| Where search lives | Dominant bar atop Home | Cmd+K overlay, top-center | Head of the single stack | In the headwaters, above the river |
| Workspace shape | Book-TOC + continuous doc | Focus + context + minimap | Expand-in-place (no route) | The river itself |
| Nav/jump mechanism | Left TOC + jump + scrollspy | Minimap + viewport pan | Subnav within expanded row | Landmark rail + channel tabs |
| How managers relate | Full-stage surfaces, back-bar | Full-stage surfaces, back-bar | Inline within the expanded row | Inline as channels within their section |
| Motion philosophy | Editorial cinematic — power-up boot, sparkline draws, origin-radiating swaps | Cartographic — survey beams, spring pin drop, zoom-from-region | Deck physics — rotated FLIP flights, depth sheets, magnetic chevrons | Scroll-linked flow — velocity wake that decays to zero at rest |

These are genuinely different answers to the same questions, not four skins of one design.

## Inventory / Plans conflicts found

Recorded in detail in the per-concept `concepts/<name>/impact-register.json` (record only — not applied). Headline conflicts:

1. **Primary category controls must stop reading as filter pills** (`01`). All four concepts use destination panels / regions / rows / sections. The owned-families strip is destination-control cards, not pills.
2. **Settings row state model** requires nine unambiguous states; the new managers + rows forbid empty-field-as-auto/inherit. Affects `settings_inventory.json`.
3. **Humanized taxonomy** regroups domains (General & Desktop, Appearance, Agents & Models, Permissions & FileSafe, Code/Languages/Commands, Context/Memory/History, Planning/Goals/Testing/BSD, Git/Worktrees/Source Control/Crew/GitHub, Extensions, Media, System/Storage/Server). Every required domain is preserved.
4. **Provider hierarchy** Provider→Account→Connection→Product→Model strictly separated; flat "API key list" flattens distinct concepts. Connection groups replace the flat list.
5. **Provider CLI acquisition is explicit / official-source / host-specific — never bundled or pre-seeded.** Installations carry 5 confidence levels and 7 update states; unknown/ambiguous ownership is manual-only.
6. **CLI-owned OAuth boundary:** Claude CLI & Antigravity CLI OAuth are CLI-owned; PM-direct OAuth only for OpenAI/Codex, GitHub, Copilot. Any PM-OAuth path for Claude/Antigravity is a conflict.
7. **Goal Mode requested-vs-effective:** configured concurrency ≠ current effective capacity. Settings owns defaults+ceilings; runtime admits actual work.
8. **Crew requested-vs-effective:** a template may request 5, capacity admits 2, queues 3.
9. **Spellcheck as a quiet shared service:** no permanent button, no autocorrect, skips technical content. Grammar/style is a separate opt-in provider-backed feature.
10. **Notifications title-bar stack is the sole in-app surface** — no bottom-right stack, bell, or dedicated Notifications side panel. Sound is never the only failure/approval signal. PeonPing/OpenPeon packs require format + license checks; unverified packs are never bundled.
11. **Settings Lifecycle:** Copy Settings From is a one-time transactional copy (no universal inheritance system); no raw format dropdown as the primary interaction; restore point + atomic apply + rollback + receipt.
12. **Server/Project Sync is deferred.** The Stream concept reserves manager grammar + semantic destinations for Servers / Execution Hosts / Clients / Project Hosting & Files / Remote Access / Updates with **named canonical owners and insertion contracts** — no state machine invented here.
13. **Browser is PM-native only** — no Playwright runtime/facade/compatibility dependency.

## Functionality that remains simulated

All of the following are **interactive** (they respond and show visible results) but do not call real backends:

- The manager-open **hydration wait is a labeled timed demo** (skeleton + ObservableWork projection with waitReason); the projection contract — never a fabricated percentage, determinate only with a real denominator — is the portable part.
- Provider **refresh** (last-known-good overlay + toast — stale-while-revalidate; held with a network waitReason while the offline banner is up), **reconnect** (honest probe: the currently-failing row's first probe times out with a waitReason and recovers on retry — simulated latency, truthful outcome), **install/update/verify/repair** (toasts + state flips; success criteria are documented but not executed).
- All **25 new family managers'** row actions (preview, test-send, run, enable, edit, open, logs, export, delete, dry-run…) run through a single generic action handler that produces honest toasts/state changes — no real operation.
- Model favorite/alias/effort/Normal-Fast menu, search (against the in-memory demo dataset, not the 818-setting inventory), settings toggles/selects/sliders (UI + toast; no write to `settings_inventory.json`), theme/reduced-motion/density (localStorage only).
- **Spellcheck** uses the browser `spellcheck` attribute to simulate the underline; production needs a Slint-portable spelling-service abstraction.

No fake no-op actions are used: every control either does something visible or honestly reports it is simulated/unavailable.

## Slint translation risks (Slint 1.17.1)

Residual risks (semantic state is kept separate from DOM geometry throughout):

1. **CSS Grid `grid-template-areas`** (shell) → nested Slint layout containers; responsive reflow translates manually.
2. **`backdrop-filter` (glass)** → no Slint analogue. Glass uses **one backdrop blur over a pre-baked wallpaper** (PMConcept7 T16 technique). The manager refresh-overlay **falls back to an opaque plate under glass** (no nested blur) — preserve this.
3. **`color-mix(in srgb,…)`** themed borders → Slint build precomputes (FinalGUISpec F3-431).
4. **IntersectionObserver scrollspy** → observes section visibility, not geometry-as-state. Active-sub state lives in `PM.state.activeSub`; only the observer is web-specific. Stream's landmark rail uses scroll math (also portable as state).
5. **Smooth scroll + FLIP** → reduced-motion paths reach the same final state via opacity/state; motion re-expresses as Slint property animations.
6. **`localStorage`** → web-only convenience, not semantic state.
7. **Long lists** (35 managers' resource rows, memory Gists, history, artifacts) → demo sets are small; production must virtualize. Row components are data-driven and stateless, so virtualization is additive.
8. **`max-height` transition (Stack expand)** → web idiom; Slint animates `height`/layout. Reduced-motion path is opacity-only.
9. **Motion helpers (motion.js)** → FLIP/staggerIn/transitionView/smoothJump/pulseOnce/crossFade/growSettle animate semantic state that lives in `PM.state`; each maps to a Slint property animation. Reduced-motion fallbacks are portable as-is.
10. **Spellcheck demo** → `contenteditable` + TreeWalker is browser-only; the dictionary/suggestion-menu/skip contract is the portable part.
11. **Exposure-level disclosure** → model filter in Slint, not DOM show/hide. Portable.
12. **Owned-families strip + setup-stepper modal** → `position:fixed`/cards translate to Slint layout + `PopupWindow`. Portable.
13. **Correction-pass mechanisms (2026-08-15)** — all portable as state + property animations: IntersectionObserver lazy channels (§4 pattern: semantic state decides what exists; only the observer is web-specific); pointer-capture viewport drag (input events → Slint property); rAF count-up (numeric property animation); virtualized list (fixed row height + window index — directly models a Slint `ListView`); ObservableWork block + skeletons (state-driven components); FLIP reorder (invert-transform → Slint property animation; reduced-motion path already state-only).
14. **Deep links are in-app only** (search → manager/sub; no URL-hash routing). Production deep-linking needs a route parser; flagged for the Slint build.
15. **Showcase-pass mechanisms (2026-08-15)** — all transform/opacity/property-driven, portable as Slint property animations + pointer handlers: rAF spring (force-settle keeps it bounded; Slint has spring easing), pointer glow/tilt (pointer position properties feeding a radial-gradient shader + ≤1.5° rotation — the CSS vars are just plumbing), origin-capture transitions (animate from a recorded click position — recorded as state, not derived from DOM geometry at animation time), theme motion-scale (a duration multiplier in the theme definition), and scroll-velocity wake (scroll offset deltas → a 0..1 property that decays to exactly 0). Reduced-motion paths are state-only and port as-is.

## Deliverables layout

Per-concept registers live in `concepts/<name>/` (matching the CursorAuto / Qwen 5.8 sibling convention): `impact-register.json`, `manager-coverage.json`, `candidate-command-delta.json`, `candidate-wiring-delta.json`, `candidate-dry-delta.json`, `plan-owner-delta.md`. The root `IMPACT_REGISTER.json` is an aggregate index pointing into them. Candidate command IDs are provisional — they census existing `catalog.*` / `UCC-###` canon and flag reuse/alias/supersession/conflict; they do not mint canon.

## No ranking

Per the packet, concepts are presented for comparison only. A selection decision is the user's to make later.
