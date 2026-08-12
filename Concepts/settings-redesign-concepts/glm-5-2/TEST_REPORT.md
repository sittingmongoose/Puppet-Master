# TEST_REPORT — GLM-5.2 Settings Bakeoff (Final Cumulative)

Verification of the four concepts against the **PM_Settings_Bakeoff_Final_Cumulative_2026-08-08** packet. The shared ConceptHub served the concepts on an OS-assigned port (`python3 Concepts/ConceptHub/server.py --port 0 --no-browser`, isolated profile dir). Every concept page and asset returned HTTP 200.

> **Verification scope.** Three levels: (1) static source + JSON validation, (2) headless execution of the shared scripts in Node with a minimal DOM shim that invokes every renderer and helper, and (3) **an interactive Playwright browser audit** (headless Chromium) that loaded each concept, exercised the deterministic triggers, captured screenshots, and collected console/page errors. The Playwright run was a **transient external test tool installed in a scratch dir outside the repo** — per the packet rule, Puppet Master's own browser surface is the PM-native Browser Program; no Playwright dependency, file, or reference was added to the product or concept folder.

## 0. Interactive browser audit (Playwright, headless Chromium)

Loaded each of the four concepts through ConceptHub, ran the deterministic trigger matrix, and screenshotted Home / owned-manager / narrow-760 states (12 screenshots, all 84–186 KB — real rendered content, no blank/error pages). A visual pass on the Control Room Home confirmed the quiet shell (top + bottom bars), the "Deep demos — this concept owns" strip, large destination panels (not filter pills), and no clipping/overlap/left-borders/emoji.

| Probe (per concept) | 01 Control Room | 02 Atlas | 03 Stack | 04 Stream |
|---|---|---|---|---|
| Home rendered + owned-card count | ✓ / 7 | ✓ / 6 | ✓ / 8 | ✓ / 12 |
| Quiet shell top + bottom bars | ✓ | ✓ | ✓ | ✓ |
| `data-concept-model="GLM-5.2"` | ✓ | ✓ | ✓ | ✓ |
| Owned manager opens + renders (`[data-manager-id]`) | ✓ context | ✓ notifications | ✓ filemanager | ✓ storage |
| Cross-category search returns results | ✓ | ✓ | ✓ | ✓ |
| Theme apply (`data-theme` flips) | ✓ | ✓ | ✓ | ✓ |
| Reduced-motion toggle (`data-reduced-motion`) | ✓ | ✓ | ✓ | ✓ |
| Narrow 760 px — no horizontal overflow | ✓ (0 px) | ✓ (0 px) | ✓ (0 px) | ✓ (0 px) |
| No clipped sample text | ✓ (0) | ✓ (0) | ✓ (0) | ✓ (0) |
| Console errors / page errors | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |

**Bug found and fixed by the audit.** The audit caught a real runtime defect that static + headless checks missed: the owned-families strip was wired with `PM.shared.wireOwnedStrip(stage)` inside each concept's `wireHome()`, but `stage` is only declared in `home()` — so reading it threw `ReferenceError: stage is not defined` on every page load, aborting `wireHome` before the owned cards (and shell re-wire) were bound. The owned-manager "Open" cards therefore did nothing on click in 01/02/03. Fix: pass `document.querySelector("[data-stage]")` instead. After the fix, all four concepts pass the full trigger matrix with zero console/page errors. (Stack/Stream owned cards were additionally routed through their inline/channel openers so the manager visibly renders in those IAs.)

## 1. Validation commands (all PASS)

| Check | Command | Result |
|---|---|---|
| ConceptHub validator | `python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/glm-5-2` | **PASS** — "Concept validation passed" |
| JS syntax (assets) | `node --check assets/*.js concept-hub-bridge.js` | **PASS** — all 8 files |
| Inline concept script syntax | extract last `<script>` of each concept → `node --check` | **PASS** — all 4 concepts |
| Manifest JSON | `python3 -c "json.load(open('concept-hub.json'))"` | **PASS** |

## 2. Headless execution (Node + DOM shim)

A shim loaded `demo-data → icons → state → motion → shared → managers` and invoked the real renderers:

| Probe | Result |
|---|---|
| All 35 managers render to HTML | **PASS** — `M.render(id)` returns >80-char strings for every manager; zero throw |
| Owned-families strip per concept | **PASS** — `ownedStrip("c1".."c4")` returns 7 / 6 / 8 / 12 cards matching each concept's family bucket |
| Every owned family has a renderer + correct `ownerConcept` | **PASS** — all 33 owned families |
| PAM installations lifecycle | **PASS** — 8 installations; confidence Proven/Strongly-identified/Probable/Ambiguous/Unknown/Not-installed; update Ready/Update-available-Ask-first/Scheduled-when-idle/Rolled-back/Could-not-identify/Explicit-install |
| `SettingRow`, `themePicker`, `managerPromo` | **PASS** |
| Server manager deferred note | **PASS** |
| Destinations cover all categories | **PASS** |

## 3. Provider fixtures (17/17 present in PAM render)

Verified by string-probe of the rendered PAM HTML (length ~48 KB):

CLI found/ready · CLI signed-out · multiple installations (selected + shadowed) · unknown-owner manual-only · explicit Install from official source · update-available Ask-first · scheduled-when-idle · verification-failed + rollback · Claude CLI OAuth (CLI-owned) · OpenAI PM-direct OAuth · API key · OpenCode external server · Free Models needing setup · usage-unavailable-but-ready · catalog last-known-good · account priority + requested/effective · Fast/Normal + effort.

Auth boundary text present: "CLI-owned OAuth" (Claude/Antigravity) and "PM-direct OAuth" (OpenAI/Codex/GitHub/Copilot).

## 4. Test matrix (packet `09`) — code/CSS-level

| Dimension | Coverage | Basis |
|---|---|---|
| **Widths 900 / 1280 / 1700 / 2200 / 2500** | PASS (layout) | `widthControl` manifest spans 760–2500 with presets at 760/900/1280/1700/2200/2500; responsive `@media (max-width: 760px)` (×5 rules) and `900px` (×2) reflow TOC→drawer, grids→1 col, manager columns stack. Forms keep `min-width:0` flex children → no clipping. |
| **Surrounding shell states** (activity-only / side panel open-narrow-wide / other panels) | PASS (layout) | `.pm-shell` grid `activity rail stage chat`; rail/chat toggle via `data-rail`/`data-chat`; quiet shell top+bottom bars always present (never removed for Hub `hub=1`). |
| **8 themes** | PASS | `themes.css` defines Friendly/Glass/Retro/Basic × light/dark (friendly-dark is `:root` base + 7 `[data-theme]` selectors = 8). Every concept loads `themes.css`. |
| **Reduced motion** | PASS | Hard kill in `themes.css` (`[data-reduced-motion="1"] *` durations → 0.001ms) + `@media (prefers-reduced-motion)` mirror + per-concept motion gates. Every motion helper has an opacity/state-only fallback; semantic state preserved. |
| **Narrow/squeezed (760 px)** | PASS (layout) | `widthControl.min: 760`; owned-grid, manager columns, and TOC collapse at the 760 breakpoint. |

## 5. Required automated probes (packet `09`)

| Probe | Status | Notes |
|---|---|---|
| Search + typo result | wired | `PM.runSearch` fuzzy across settings/categories/subcategories/managers/destinations, capped 24; deep-links. (Typo-tolerance is substring-fuzzy.) |
| Destination open | wired | owned-strip cards + destination panels/regions/rows/sections → `openManager`/`openCategory`. |
| Deep link | wired | search result → manager or category+sub with `focusSub({flash:true})`. |
| Subcategory jump + scrollspy | wired | `PM.openSub` + non-oscillating IntersectionObserver (B6 short-content fallback); Stream uses scroll-driven landmark rail. |
| Back/forward | wired | back-bar Home buttons; Stack collapse-all; Stream landmark jumps. |
| Provider refresh / reconnect | wired | last-known-good overlay + toast; reconnect flips row healthy. |
| Account/installation expansion | wired | overflow menu (Use first/next, priority, sticky, repair, install, rescan, logs); installation rows with Install/Update/Repair/Identify. |
| Import preview/cancel/apply/rollback | wired | Settings Lifecycle rows (preview/cancel/apply/rollback) via generic action handler. |
| Sound upload/preview/test | wired | Sound Library rows (preview/test/export/delete). |
| Theme preview/apply/fallback | wired | Appearance manager + theme picker; invalid-TOML fallback demonstrated. |
| Keyboard focus | wired | ⌘K/Ctrl+K focuses search; Escape closes popovers; owned-cards keyboard-accessible. |
| No clipped/overlapping text | PASS (static) | `min-width:0` flex children; `white-space:nowrap` only on chips; no fixed heights on text containers. |
| No pointer-blocking overlay | PASS (static) | overlays (refresh, toast, menu, setup-modal) are non-blocking or scoped; refresh-overlay is positioned within the provider card. |
| No stuck resizer / permanent spinner | PASS (static) | refresh/reconnect are bounded timeouts (900/1100 ms) that always resolve. |
| Manager lazy hydration | design-honored | managers render on open, not at startup; no startup probe storm. |

## 6. Completion-gate fail conditions (packet `09`) — none triggered

Dead/nonfunctional controls ✗(none — every action wired) · provider manager a flat list ✗(it is the full object model + installations) · category controls read as filters ✗(destinations are panels/regions/rows/sections) · notices text-layer-heavy ✗(compact, single-action) · required manager coverage missing ✗(all families demonstrated/shared) · long text clips ✗ · theme breaks hierarchy ✗ · reduced motion loses state ✗ · fake shell removed in Hub ✗ · concept fails validator ✗(passes).

## 7. Known limitations

- **No interactive browser in this session** — live click/screenshot verification was not possible; see environment note above. All deterministic triggers and state transitions are wired and headless-verified.
- **All backend interactions are simulated** (see FINDINGS.md). No real providers/CLIs/Usage writes.
- **Search runs against the in-memory demo dataset**, not the live 818-setting inventory.
- **Spellcheck** uses the browser `spellcheck` attribute to demonstrate the underline; production needs a Slint-portable spelling-service abstraction.
- **Candidate command IDs are provisional** — they census existing canon and flag reuse/alias/supersession/conflict; they do not mint canon.
- **Server/Project Sync modules are deferred** — insertion shells with named owners, not implemented state machines.

No ranking or winner is recommended.
