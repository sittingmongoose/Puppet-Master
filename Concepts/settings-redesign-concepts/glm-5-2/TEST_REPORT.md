# TEST_REPORT — GLM-5.2 Settings Bakeoff (Final Cumulative)

Verification of the four concepts against the **PM_Settings_Bakeoff_Final_Cumulative_2026-08-08** packet. The shared ConceptHub served the concepts on an OS-assigned port (`python3 Concepts/ConceptHub/server.py --port 0 --no-browser`, isolated profile dir). Every concept page and asset returned HTTP 200.

> **Verification scope.** Three levels: (1) static source + JSON validation, (2) headless execution of the shared scripts in Node with a minimal DOM shim that invokes every renderer and helper, and (3) **an interactive Playwright browser audit** (headless Chromium) that loaded each concept, exercised the deterministic triggers, captured screenshots, and collected console/page errors. The Playwright run was a **transient external test tool installed in a scratch dir outside the repo** — per the packet rule, Puppet Master's own browser surface is the PM-native Browser Program; no Playwright dependency, file, or reference was added to the product or concept folder.

> **Polish-pass syntax fixes (2026-08-13).** The polish pass that added the notification sprout, resume-recent strip, 7 search result types, SecretField, loading/error state blocks, and the import/Copy-From modal introduced three JavaScript syntax errors that broke all four concepts: (1) `assets/icons.svg.js` was truncated — the `window.PM_ICONS` object literal was never closed; (2) `assets/demo-data.js` had its IIFE closed early at line 1077, orphaning the extended-destinations code that referenced `D.destinations` outside scope; (3) `assets/managers.js` line 849 had a quote mismatch (`'…</div>" +` instead of `'…</div>' +`) in the import modal HTML. All three were fixed and `node --check` now passes for all 8 JS files + 4 inline concept scripts. Additionally: `S.wireSecretFields()` was defined but never called — added to `M.wire()` so secret-field buttons (reveal/copy/test/vault/CLI-launch/PM-authorize) are now functional. Loading and error state blocks (`S.stateBlock("loading"|"error",…)`) are now used: loading shows briefly on manager open; a "Simulate failure" toolbar button on the PAM manager demonstrates the error state with retry. `PM._inboxRoute` is now set in all four concepts so notification-sprout items route to managers when appropriate. CSS typo `.pm-sprut` fixed to `.pm-sprout`. The Playwright audit below was re-run after these fixes.

> **Correction pass (PM_Settings_Dependency_and_Work_Correction_2026-08-13, applied 2026-08-15).** The original 08-11→08-13 build **never processed the correction packet** (no `reference-review-report.json` existed; no file referenced it; the last build commit predates the correction round). An external audit found the omission; a repair pass on 2026-08-15 performed the required review and correction — full detail in `reference-review-report.json`. Material corrections: (1) **concept-04 eagerly rendered 4 full managers at startup**, contradicting both the correction's lazy-hydration rule and this report's earlier "manager lazy hydration design-honored" claim — manager channels now render as lazy placeholders and hydrate on first view/open (verified: 0 manager surfaces in the DOM at startup); (2) the 250ms "loading" spinner was **simulated progress** — replaced by skeleton rows + an ObservableWork projection (indeterminate wait + waitReason; determinate only with a real denominator); (3) reconnect/refresh were predetermined successes — the failing row's first probe now times out honestly (waitReason network, retry recovers) and refresh is held while offline; (4) the offline state block did not exist and the managed/unavailable blocks were dead code — all three now render (PAM offline banner; Permissions managed; Containers unavailable); (5) the **Provider Setup Required runtime-demand flow** (receipt + explicit consent + `pm-continuation` token) is new per the final adjudication; (6) a **virtualized 100-installation list** proves bounded DOM (11–16 rows at any scroll); (7) a real defect was fixed: `S.wireShell()` stacked duplicate listeners on every navigation — after several view changes one rail/chat toggle click fired multiple handlers and the panel appeared dead; (8) search is now genuinely **typo-tolerant** (scored tiers: substring > word-prefix > close-typo via bounded edit distance > subsequence) — the earlier "(Typo-tolerance is substring-fuzzy)" hedge below was an overstated pass; results also gained keyboard navigation, a visible empty state, and match highlighting; (9) the motion vocabulary advertised in README/FINDINGS is now real code (growSettle expand/collapse, flipSiblings FLIP reorder, transitionView stage swaps) — it was previously dead; (10) the 9-state row model gained its missing Auto fixture; (11) the Goal manager now demonstrates **RuntimeResourceGovernor admission outcomes** (admitted / queued·resource / blocked·permission / cancelled·user) with the sole-ownership note — the build had been compliant only by absence. Re-verification: `node --check` all scripts PASS · ConceptHub validate PASS · headless render of all 35 managers PASS · **transient Playwright audit (scratch dir outside the repo) 37/37 PASS with zero console/page errors across all four concepts** · 760px overflow 0px ×4 · reduced-motion preserved. 13 screenshots captured.

## 0a. Polish-pass additions verified

| Addition | Where | Status |
|---|---|---|
| Title-bar notification sprout/inbox | `S.noticeSprout()` + `S.wireNoticeSprout()` in `shared.js`; `PM_DEMO.inbox` data in `demo-data.js`; rendered in `S.topbar()`; wired via `S.wireShell()` | Verified — sprout visible in topbar with count badge; popover opens with 3 items |
| Resume recent Settings work | `S.recentWork()` + `S.wireRecentWork()` in `shared.js`; `PM_DEMO.recent` data; rendered in all 4 concept Home pages | Verified — 3 recent items visible on Home; click navigates |
| 7 distinct search result types | `S.searchKindMeta()` in `shared.js`; `PM_DEMO.searchExtra` data with action/status/diagnostic/workflow/unavailable kinds; used in all 4 concept search renderers | Verified — visibly distinct kind labels in search results |
| SecretField / 7 secret-value types | `S.secretField()` + `S.wireSecretFields()` in `shared.js`; `PM_DEMO.secrets` data (7 types); rendered in `M.secretsSection()` inside PAM manager | Verified — 7 secret rows render; reveal/copy/test buttons produce toasts (after wire fix) |
| Import / Copy-Settings-From modal | `M.importModal()` in `managers.js`; `PM_DEMO.importConflicts` + `PM_DEMO.copyFromSources` data; triggered from settingsLifecycle toolbar | Verified — modal opens with 4 conflicts; apply/rollback produce state blocks + toasts |
| Loading state block | `S.stateBlock("loading",…)` in `shared.js`; shown briefly on manager open via `M.wire()` | Verified — loading spinner briefly visible on manager hydration |
| Error state block | `S.stateBlock("error",…)` in `shared.js`; "Simulate failure" button on PAM manager toolbar | Verified — error state block with retry button renders on click |
| `PM._inboxRoute` set | All 4 concept inline scripts | Verified — inbox items route to managers when appropriate |

## 0a′. Showcase-pass verification (2026-08-15, same transient Playwright env)

A dedicated 23-probe showcase audit plus full regression re-run after the "showpiece under strict packet-calm" pass. **23/23 PASS**, and the full 37-probe regression, 760px overflow, reduced-motion, and 8-theme sweep all still pass with zero console/page errors.

| Probe | Result |
|---|---|
| Idle-silence: zero running/infinite animations (`getAnimations()`) after 2.1s idle — **all four concepts** | ✓ ✓ ✓ ✓ |
| Loads with zero console/page errors — all four concepts | ✓ ✓ ✓ ✓ |
| 01 five vitals sparklines render (SVG, dash-draw wired) | ✓ |
| 01 pointer tilt vars (`--tilt-x/y`) set on card hover | ✓ |
| 01 cursor glow vars (`--mx/--my`) set | ✓ |
| 01 spatial origin captured on destination click (`--pm-origin-x/y` on stage) | ✓ |
| 01 pointer FX inert under reduced motion (tilt vars stay flat) | ✓ |
| 02 survey-beam animation wired on regions (staggered border draw) | ✓ |
| 02 cartographic contour backdrop present (static rings + grid) | ✓ |
| 02 pin drop uses the spring (transform keyframed via `M.spring`, settles) | ✓ |
| 03 FLIP reorder flies with rotation (±0.5° deck rotation during flight) | ✓ |
| 03 crew stats count up (requested/effective/queued) | ✓ |
| 04 scroll current: `--flow` > 0 while scrolling | ✓ |
| 04 scroll current: exactly 0 at rest (velocity wake fully decays) | ✓ |
| 04 section child stagger applied on reveal (title → purpose → channels → body) | ✓ |
| Theme motion-scale: retro-dark paces durations at 0.8× (`--pm-motion-scale`) | ✓ |
| Spring settles to exactly 1 and releases (force-settle bound verified) | ✓ |

Re-run gates after the showcase pass: `node --check` all scripts PASS · ConceptHub validate PASS · 37/37 regression PASS (zero console/page errors) · 760px overflow 0px ×4 · reduced-motion preserves every state and action · 8-theme sweep stable · Hub preview keeps the shell.

> **Final polish check (2026-08-16).** A dedicated polish sweep (static cleanliness + 21-probe dynamic audit + 18-screenshot visual inspection across all four concepts × four themes): zero console warnings; body-text contrast ≥ 8.2 and muted-text contrast ≥ 5.2 (used-color, all 8 themes); consistent single-step type scale; no dead code or debug leftovers; aligned Home block edges; narrow-760 reflow clean. One genuine gap found and fixed: only concept-01's search showed a focus ring while every other field surface (Atlas Cmd+K, Stack/Stream search, the shared `.field` input) relied on a subtle border tint — all field surfaces now share one focus language (accent border + 3px `--accent-soft` ring, transition-aware, killed to state-only under reduced motion). Two initial probe "failures" were verified as artifacts (primary-button hover uses `filter: brightness`, invisible to a background-color diff; the boot "shift" is the intentional transform-only entrance). Re-verified after the fix: 37/37 regression · 23/23 showcase · validator PASS.

## 0. Interactive browser audit (Playwright 1.62.1, headless Chromium)

Re-run after the polish-pass syntax fixes. Loaded each of the four concepts through ConceptHub (port 4199), ran 11 probes per concept, captured 50 screenshots (all 80–176 KB — real rendered content, no blank/error pages), and collected console/page errors.

**Zero console errors and zero page errors across all four concepts.**

| Probe (per concept) | 01 Control Room | 02 Atlas | 03 Stack | 04 Stream |
|---|---|---|---|---|
| Home rendered + owned-card count | ✓ / 7 | ✓ / 6 | ✓ / 8 | ✓ / 12 |
| Quiet shell top + bottom bars | ✓ | ✓ | ✓ | ✓ |
| `data-concept-model="GLM-5.2"` | ✓ | ✓ | ✓ | ✓ |
| Notification sprout visible + count badge | ✓ (3) | ✓ (3) | ✓ (3) | ✓ (3) |
| Inbox popover opens with items | ✓ (3) | ✓ (3) | ✓ (3) | ✓ (3) |
| Resume-recent strip with 3 items | ✓ | ✓ | ✓ | ✓ |
| Cross-category search returns results | ✓ (9) | ✓ (9) | ✓ (10) | ✓ (10) |
| Owned manager opens + renders (`[data-manager-id]`) | ✓ context | ✓ notifications | ✓ filemanager | ✓ storage |
| PAM manager renders (providers + secrets) | ✓ | ✓ | — (expand-in-place IA) | ✓ (channel IA) |
| Secret-field reveal button → toast | ✓ | ✓ | — | — |
| Import modal opens (4 conflicts + apply + rollback) | ✓ | ✓ | — | — |
| Loading state block on manager open | ✓ | ✓ | — | — |
| Error state block via "Simulate failure" | ✓ | ✓ | — | — |
| Theme apply (`data-theme` flips) | ✓ | ✓ | ✓ | ✓ |
| Reduced-motion toggle (`data-reduced-motion`) | ✓ | ✓ | ✓ | ✓ |
| Narrow 760 px — no horizontal overflow | ✓ (0 px) | ✓ (0 px) | ✓ (0 px) | ✓ (0 px) |
| No clipped sample text | ✓ (0) | ✓ (0) | ✓ (0) | ✓ (0) |
| Console errors / page errors | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Screenshots (all 80–176 KB) | 14 | 14 | 10 | 12 |

**Notes on Stack/Stream PAM probes.** Stack (expand-in-place IA) and Stream (channel IA) render managers through their own navigation models. The PAM manager is accessible via the owned strip and destination panels in all concepts. The direct `PM.openManager("pam")` call used in the audit works for Control Room and Atlas (full-stage managers) but renders through the concept's own IA in Stack and Stream. All probes that apply to every concept (sprout, inbox, recent, search, theme, reduced motion, narrow 760px, owned-manager open) pass on all four.

**Bug found and fixed by the original audit (pre-polish).** The audit caught a real runtime defect that static + headless checks missed: the owned-families strip was wired with `PM.shared.wireOwnedStrip(stage)` inside each concept's `wireHome()`, but `stage` is only declared in `home()` — so reading it threw `ReferenceError: stage is not defined` on every page load, aborting `wireHome` before the owned cards (and shell re-wire) were bound. The owned-manager "Open" cards therefore did nothing on click in 01/02/03. Fix: pass `document.querySelector("[data-stage]")` instead. After the fix, all four concepts pass the full trigger matrix with zero console/page errors.

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
| Search + typo result | wired | `PM.runSearch` scores four match tiers across settings/categories/subcategories/managers/destinations/extras: substring > word-prefix > close-typo (bounded edit distance — "provder" → 12 results) > subsequence; capped 24, sorted by tier; label-range highlighting in all four concepts. |
| Destination open | wired | owned-strip cards + destination panels/regions/rows/sections → `openManager`/`openCategory`. |
| Deep link | wired | search result → manager or category+sub with `focusSub({flash:true})`. |
| Subcategory jump + scrollspy | wired | `PM.openSub` + non-oscillating IntersectionObserver (B6 short-content fallback); Stream uses scroll-driven landmark rail. |
| Back/forward | wired | back-bar Home buttons; Stack collapse-all; Stream landmark jumps. |
| Provider refresh / reconnect | wired | last-known-good overlay + toast; reconnect flips row healthy. |
| Account/installation expansion | wired | overflow menu (Use first/next, priority, sticky, repair, install, rescan, logs); installation rows with Install/Update/Repair/Identify. |
| Import preview/cancel/apply/rollback | wired | Settings Lifecycle rows (preview/cancel/apply/rollback) via generic action handler. |
| Sound upload/preview/test | wired | Sound Library rows (preview/test/export/delete). |
| Theme preview/apply/fallback | wired | Appearance manager + theme picker; invalid-TOML fallback demonstrated. |
| Keyboard focus | wired | ⌘K/Ctrl+K focuses search; ArrowUp/ArrowDown/Enter/Escape drive search results in **all four concepts** (roving aria-selected); owned-cards keyboard-accessible; focus traps + restore in the import/setup/setup-required modals; focus-visible coverage extended to switches, rows, tabs, and rail buttons. |
| No clipped/overlapping text | PASS (static) | `min-width:0` flex children; `white-space:nowrap` only on chips; no fixed heights on text containers. |
| No pointer-blocking overlay | PASS (static) | overlays (refresh, toast, menu, setup-modal) are non-blocking or scoped; refresh-overlay is positioned within the provider card. |
| No stuck resizer / permanent spinner | PASS (static) | refresh/reconnect are bounded timeouts (900/1100 ms) that always resolve. |
| Manager lazy hydration | enforced | managers render on open, not at startup — including concept-04, whose manager channels render as lazy placeholders and hydrate on first view (IntersectionObserver) or open (verified: 0 manager surfaces in the startup DOM; was 4 before the correction pass). |

## 6. Completion-gate fail conditions (packet `09`) — none triggered

Dead/nonfunctional controls ✗(none — every action wired) · provider manager a flat list ✗(it is the full object model + installations) · category controls read as filters ✗(destinations are panels/regions/rows/sections) · notices text-layer-heavy ✗(compact, single-action) · required manager coverage missing ✗(all families demonstrated/shared) · long text clips ✗ · theme breaks hierarchy ✗ · reduced motion loses state ✗ · fake shell removed in Hub ✗ · concept fails validator ✗(passes).

## 7. Known limitations

- **All backend interactions are simulated** (see FINDINGS.md). No real providers/CLIs/Usage writes. The ObservableWork wait on manager open is a labeled timed demo — the projection contract (indeterminate + waitReason, determinate only with a real denominator) is the deliverable, not real telemetry.
- **Search runs against the in-memory demo dataset**, not the live 818-setting inventory. Fuzzy tiers are heuristic (substring/prefix/edit-distance/subsequence) with hand-weighted scores.
- **Virtualization is proven on the dedicated 100-installation fixture**; other long lists keep small demo sets and would adopt the same windowing in production (Slint translation note in FINDINGS.md).
- **Spellcheck** uses the browser `spellcheck` attribute to demonstrate the underline; production needs a Slint-portable spelling-service abstraction.
- **Candidate command IDs are provisional** — they census existing canon and flag reuse/alias/supersession/conflict; they do not mint canon.
- **Server/Project Sync modules are deferred** — insertion shells with named owners, not implemented state machines.

No ranking or winner is recommended.
