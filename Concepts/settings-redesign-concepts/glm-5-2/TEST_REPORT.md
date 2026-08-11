# TEST_REPORT — GLM-5.2 Settings Bakeoff

Testing was performed through the shared ConceptHub (`python3 Concepts/ConceptHub/server.py`) using an isolated browser profile, across all four concepts. Width/shell/theme/motion matrix per packet `06`. This report covers both the initial build and the second-pass completeness/motion/polish work.

## Validation

```
$ python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/glm-5-2
Concept validation passed: Concepts/settings-redesign-concepts/glm-5-2
```

Static checks:
- `node --check` on all shared JS (`demo-data.js`, `motion.js`, `spellcheck.js`, `state.js`, `shared.js`, `managers.js`, `icons.svg.js`): **OK**.
- Emoji + decorative-glyph scan (U+1F000–1FAFF, U+FE0F, U+2600–26FF, U+2700–27BF, U+2B00–2BFF, U+25CB, U+25CF, U+2022–2023) across all `.html`/`.js`/`.css`: **0 banned glyphs**.
- Colored left-border status pattern scan (`border-left` using `var(--ok|--warn|--bad|--info|--accent)`): **none found**.
- Filter-pill primary-category-control scan: **none found**.

## Theme matrix (all 8 themes, verified per concept)

| Theme | `--bg` | `--accent` | Radius | Glass wallpaper | Result |
|---|---|---|---|---|---|
| friendly-dark | `#211e26` | `#6fc6e8` | 13px | n/a | OK |
| friendly-light | `#fbf7f3` | `#3f9cc7` | 13px | n/a | OK |
| glass-dark | `#1c1530` | `#b79cff` | 13px | pre-baked radial | OK — translucent, one backdrop blur |
| glass-light | `#e8e0ef` | `#8161d6` | 13px | pre-baked radial | OK |
| retro-dark | `#0e0e0e` | `#00ff41` | **0** | n/a | OK — zero radius; ink-3/4 lightened for AA (D3) |
| retro-light | `#f1ece1` | `#0047ab` | **0** | n/a | OK |
| basic-dark | `#15171b` | `#64b5f6` | 6px | n/a | OK |
| basic-light | `#eef0f3` | `#0056b3` | 6px | n/a | OK |

IA + semantic status language is constant across all eight. Glass falls back to opaque plates for the manager refresh-overlay (no nested backdrop-filter). Retro collapses all radii to 0. Theme-picker swatches (B3 fix) now carry fixed literal preview gradients so each swatch is visually distinct.

## Reduced motion

- `data-reduced-motion="1"` collapses all `transition-duration` / `animation-duration` to `~0.01ms`.
- Every motion helper in `motion.js` (FLIP, staggerIn, transitionView, smoothJump, pulseOnce, crossFade, growSettle) has an opacity/state-only fallback — not just a global kill.
- Focus-flash falls back to a static outline ring.
- Smooth-scroll jumps fall back to instant `scrollTop`.
- Verified the workspace reaches the **same final state** with reduced motion on.

## Width × shell matrix (Concept 01 representative; spot-checked others)

| Width | Rail | Chat | Layout | Clipping/overlap |
|---|---|---|---|---|
| 760 (squeezed) | open | closed | adapts (TOC drawer available) | none |
| 900 | open | closed | OK | none |
| 1280 | open | closed | OK | none |
| 1280 | open | **open** | grid reflows to 4 cols | none — content + chat both readable |
| 1280 | closed | closed | 3 cols | none |
| 1700 / 2200 / 2500 | open | closed | content max-width capped, centered | none |

No required label, value, action, or status clipped or overlapped at any tested width/shell combination.

## Functional smoke checks (packet `06`)

1. **Search result opens the correct category/subcategory/setting** — PASS. Deep-link to Planning→goal verified.
2. **Scrolling changes active subcategory without oscillation** — PASS. IntersectionObserver + scroll listener; B6 fallback for short categories (picks center-nearest when content fits without scrolling).
3. **Subcategory jump lands at a stable offset** — PASS. `focusSub` uses `motion.smoothJump` + `scroll-margin-top`.
4. **Provider refresh preserves last-known-good rows during loading** — PASS. Overlay shows "Refreshing — last-known-good held"; rows remain.
5. **Account selection affects future simulated requests only** — PASS. Account-overflow menu (A4) toasts "affects future requests only; in-flight requests are not migrated".
6. **Model menu exposes effort and Normal/Fast only when supported** — PASS. Menu items conditional on `model.effort`/`model.fast`; menu also now includes Hide/Show + Priority (A6).
7. **Default/inherit/reset state is unambiguous** — PASS. Nine explicit state chips; reset-to-default affordance (A3) on non-default rows.
8. **A manager action returns a visible simulated result or honest unavailable state** — PASS. Reconnect, refresh, account-switch, setup-stepper, kind-tab filter all return visible results.
9. **Spellcheck suggestions never replace text automatically** — **PASS (second-pass fix).** The first TEST_REPORT incorrectly claimed PASS with only a toggle row. The second pass added a real spellcheck demo (`spellcheck.js`): subtle wavy underline on 6 demo misspellings, right-click suggestion menu offering Replace-once / Ignore-once / Ignore-draft / Add-to-personal / Add-to-project, **no autocorrect**, skips code/URLs/paths/identifiers/model-names. Verified: right-clicking "definately" opens a menu with "Replace with definitely" + the 4 non-replace actions.
10. **Reduced motion reaches equivalent final states** — PASS.
11. **Every concept remains visually distinct after theme changes** — PASS.
12. **`validate.py` passes** — PASS.

## Second-pass feature verification

### Exposure-level disclosure (A2)
- Segmented control (Standard | Advanced | Expert) wired in all 4 concepts' workspaces.
- Standard shows 3 rows; Expert shows 8 rows (verified on Planning category). Advanced/expert/diagnostic rows hidden until selected.
- Search overrides the filter (matching rows stay visible even if filtered out).

### Reset-to-default (A3)
- Reset icon button appears on hover/focus of non-default rows. 5 reset buttons present on Planning category (verified). Clicking resets value + state + toasts + pulse-once.

### Settings persistence (B7)
- `PM.state.settingValues` map; toggles/sliders/selects persist across re-renders within the session.

### Same-provider account switching (A4)
- Overflow menu (Use first / Use next / Set priority / Sticky session / Repair / Install-Update / Rescan / Logs) on every PAM connection row (9 rows). Priority badge updates on "Set priority".

### Connection controls completeness (A5)
- Identity, enabled state, last-generation, usage-pressure shown. Repair/Install-Update/Rescan in overflow menu.

### Model controls completeness (A6)
- Hide/Show, Priority, Structured-output chips (2 found), requested-vs-effective model (GPT-5 → GPT-5 4o fallback), capability-evidence freshness chip.

### Catalog metadata (A7)
- Last-activated, source version/commit, validation/quarantine chip, expandable material-change + removed-free history (2 demo entries).

### Free-model setup stepper (A8)
- "Needs setup" row opens a 6-step modal (account → credential → scopes → verify → quota → return). Verified: modal opens with all 6 steps.

### Goal Mode warning (A9)
- Verbatim packet warning rendered as an info callout on the Goal concurrency row: "Starting eight agents now is unlikely to finish before the provider resets. PM recommends two concurrent agents and three waves."

### Operational-awareness settings (A10)
- Worktree provisioning, port-collision, cross-project read/write (separate, off by default), test-automation, snapshot-access. 3 rows verified in Git region.

### Terminal depth (A11)
- Font fallback, line-height, ANSI palette swatches (16-color), cursor style, copy-links, CWD/env, retention. Richer preview with ANSI-colored sample.

### Skills/plugins/tools/commands split (A12)
- Four-kind tabs (All/Skill/Plugin/Tool/Command) with counts. Tools show 5 lifecycle states (installed/project-enabled/available/selected/invoked). Plugins show compat/channel/failure. Commands show shortcut/conflicts/remap/reset. Verified: "Tools" tab shows only 3 tools; "All" restores 12.

## Motion verification (second pass — the biggest gap, now addressed)

Each concept now has a **distinct motion philosophy** (not 4× fade-in) via shared `motion.js` helpers + per-concept CSS:

| Moment | 01 Control Room | 02 Atlas | 03 Stack | 04 Stream |
|---|---|---|---|---|
| Destination→workspace | stagger dest panels (50ms) | region zoom-in + focus-in scale | FLIP grow + content stagger | scroll-linked section reveal |
| Search results | cascade (28ms stagger) | overlay results | cascade | cascade |
| Category replacement | home-dest stagger | at-focus-in animation | crossFade inline | river scroll |
| Subcategory jump | smoothJump + sliding TOC indicator | smoothJump + viewport thumb tween | smoothJump + subnav stagger | momentum-eased river scroll |
| Manager expansion | full-stage render | full-stage render | crossFade inline (B1 fixed) | channel crossFade (B2 fixed) |
| Provider refresh | overlay fade | overlay fade | overlay fade | overlay fade |
| Focus after deep link | softened focus-flash | focus-flash | focus-flash | focus-flash |
| Apply/reconnect/saved | pulseOnce on row | pulseOnce | pulseOnce | pulseOnce |
| Narrow nav open/close | drawer slide | grid reflow | grid reflow | drawer slide |

All moments have reduced-motion fallbacks reaching the same final state.

## Bug fixes verified

- **B1 (Stack openManagerInline)**: expand → open manager inline → back-to-area → settings toggle works. Fixed: `wireBody(bodyInner)` now called on expand; direct expand replaces fragile `.click()`.
- **B2 (Stream channel cleanup)**: switching channels clears pending refresh overlays; no orphans. Verified.
- **B3 (Theme swatches)**: each swatch now shows its target theme's colors via fixed literal gradients.
- **B4 (RM toggle initial state)**: reflects saved `PM.state.reducedMotion` on render.
- **B5 (Gallery theme-picker note)**: caption added.
- **B6 (Scrollspy short-content fallback)**: center-nearest picking when content fits without scrolling.
- **B7 (Settings persistence)**: in-memory map drives re-renders.

## Known simulations (honest)

All backend interactions are simulated (see `FINDINGS.md`). No fake no-op actions.

## Bugs found and fixed during testing (both passes)

Pass 1: (1) `PM.runSearch` missing `PM.destinations` assignment; (2) Stream rendered 8 sections for 11 landmarks; (3) bare placeholder rows on manager-backed subs.
Pass 2: (4) render() called all three view functions as a "safety" — crashed manager() with null activeManager; (5) Stack expand didn't call `wireBody` — sub-manager links dead after expand; (6) `•••` overflow button used banned U+2022 glyphs; (7) `○` gallery bullets used banned U+25CB.

## Artifacts

All temporary test screenshots, recordings, and browser profiles were deleted before finishing (CONCEPT_RULES #10).
