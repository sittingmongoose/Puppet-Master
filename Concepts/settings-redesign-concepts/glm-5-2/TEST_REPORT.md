# TEST_REPORT — GLM-5.2 Settings Bakeoff

Testing was performed through the shared ConceptHub (`python3 Concepts/ConceptHub/server.py`) using an isolated browser profile, across all four concepts. Width/shell/theme/motion matrix per packet `06`.

## Validation

```
$ python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/glm-5-2
Concept validation passed: Concepts/settings-redesign-concepts/glm-5-2
```

Static checks:
- `node --check` on all shared JS (`demo-data.js`, `state.js`, `shared.js`, `managers.js`, `icons.svg.js`): **OK**.
- Emoji scan (U+1F000–1FAFF, U+FE0F, U+2600–26FF, U+2700–27BF, U+2B00–2BFF) across all `.html`/`.js`/`.css` in the folder: **0 banned glyphs**.
- Colored left-border status pattern scan (`border-left` using `var(--ok|--warn|--bad|--info|--accent)`): **none found**.
- Filter-pill primary-category-control scan: **none found**.

## Theme matrix (all 8 themes, verified per concept)

Each theme was applied programmatically and computed token values verified distinct; rendering confirmed via screenshot on Concept 01 (friendly-dark, glass-dark) and visual sweep on the rest.

| Theme | `--bg` | `--accent` | Radius | Glass wallpaper | Result |
|---|---|---|---|---|---|
| friendly-dark | `#211e26` | `#6fc6e8` | 13px | n/a | OK |
| friendly-light | `#fbf7f3` | `#3f9cc7` | 13px | n/a | OK |
| glass-dark | `#1c1530` | `#b79cff` | 13px | pre-baked radial | OK — translucent, one backdrop blur |
| glass-light | `#e8e0ef` | `#8161d6` | 13px | pre-baked radial | OK |
| retro-dark | `#0e0e0e` | `#00ff41` | **0** | n/a | OK — zero radius, mono lean |
| retro-light | `#f1ece1` | `#0047ab` | **0** | n/a | OK |
| basic-dark | `#15171b` | `#64b5f6` | 6px | n/a | OK |
| basic-light | `#eef0f3` | `#0056b3` | 6px | n/a | OK |

IA + semantic status language is constant across all eight (same chips, same status dot meaning, same row states). Glass falls back to opaque plates for the manager refresh-overlay (no nested backdrop-filter). Retro collapses all radii to 0.

## Reduced motion

- `data-reduced-motion="1"` collapses all `transition-duration` / `animation-duration` to `~0.01ms` (measured computed value `1e-05s`).
- Focus-flash falls back to a static `outline` ring instead of the keyframe.
- Smooth-scroll jumps fall back to instant `scrollTop` sets.
- Verified the workspace reaches the **same final state** with reduced motion on (settings rows visible, active sub set, manager rendered).

## Width × shell matrix (Concept 01 representative; spot-checked others)

| Width | Rail | Chat | Layout | Clipping/overlap |
|---|---|---|---|---|
| 760 (squeezed) | open | closed | adapts (TOC drawer available) | none |
| 900 | open | closed | OK | none |
| 1280 | open | closed | OK | none |
| 1280 | open | **open** | grid reflows to 4 cols | none — content + chat both readable |
| 1280 | closed | closed | 3 cols | none |
| 1700 / 2200 / 2500 | open | closed | content max-width capped, centered | none |

No required label, value, action, or status clipped or overlapped at any tested width/shell combination. The fake PM shell (top bar, activity bar, rail, footer) stays present and quiet at all widths.

## Functional smoke checks (packet `06`)

1. **Search result opens the correct category/subcategory/setting** — PASS. Searched "goal" in Concept 01; first result deep-linked to Planning → goal subcategory; `PM.state.activeCat="planning"`, `activeSub="goal"`.
2. **Scrolling changes active subcategory without oscillation** — PASS. IntersectionObserver scrollspy with `-80px 0px -55% 0px` rootMargin; active sub updates on scroll; no oscillation observed.
3. **Subcategory jump lands at a stable offset** — PASS. `focusSub` uses `offsetTop - jumpOffset()` with `scroll-margin-top` on sections.
4. **Provider refresh preserves last-known-good rows during loading** — PASS. Refresh overlay shows "Refreshing — last-known-good held"; rows remain; toast confirms.
5. **Account selection affects future simulated requests only** — PASS (by construction — account state is read-only in the demo; no in-flight migration).
6. **Model menu exposes effort and Normal/Fast only when supported** — PASS. Menu items conditionally include "Effort…" and "Normal / Fast" based on `model.effort`/`model.fast`.
7. **Default/inherit/reset state is unambiguous** — PASS. State chips label Default/Recommended/Inherited/Managed/Custom/Not-configured/Unavailable/Effective-differs explicitly; no blank-field ambiguity.
8. **A manager action returns a visible simulated result or honest unavailable state** — PASS. Reconnect flips row to healthy + toast; "Add" returns an honest "simulated in concept" toast; unavailable models show reason.
9. **Spellcheck suggestions never replace text automatically** — PASS. Uses HTML `spellcheck` (underline only); no autocorrect, no auto-replace.
10. **Reduced motion reaches equivalent final states** — PASS (see above).
11. **Every concept remains visually distinct after theme changes** — PASS. Control Room (editorial panels), Atlas (regions + minimap), Stack (expandable rows), Stream (landmark rail + river) each retain their distinct IA across all themes.
12. **`validate.py` passes** — PASS.

## Per-concept render verification (screenshots captured during testing)

| Concept | Home | Workspace | Manager | Notes |
|---|---|---|---|---|
| 01 Control Room | OK — dominant search, notices, destination panels | OK — book-TOC + continuous doc, manager-promo cards for manager-backed subs | PAM, Memory — OK | Deep-link search verified |
| 02 Atlas | OK — density-encoded regions, Cmd+K overlay, legend rail | OK — focus + minimap + viewport rail | Crew — OK (requested 5 / effective 2 / queued 3) | Region click → workspace verified |
| 03 Stack | OK — search head, notices, expandable rows | OK — expand-in-place, subnav, one-open-at-a-time | (managers render inline) | Expand toggle verified |
| 04 Stream | OK — landmark rail, headwaters, status beat, sections | (river is the workspace) — all 11 categories as sections | LSP — OK (renders as channel) | Landmark → section scroll verified; channel switching verified |

## Known simulations (honest)

All backend interactions are simulated (see `FINDINGS.md` → "Functionality that remains simulated"). No fake no-op actions: every control either produces a visible result or an honest unavailable/simulated message.

## Bugs found and fixed during testing

1. `PM.runSearch` referenced `PM.destinations` which was never assigned → `TypeError` on search. **Fixed**: added `PM.destinations = PM_DEMO.destinations` in `state.js`. Re-verified: search returns results with 0 console errors.
2. Concept 04 (Stream) originally rendered only 8 destination sections but 11 landmarks, so clicking the code/general/permissions landmarks did nothing. **Fixed**: the river now renders all 11 categories as sections; every landmark resolves. Re-verified: 11 sections, code-landmark scroll works (scrollTop 3324).
3. Manager-backed subcategories in workspace docs showed bare placeholder rows. **Fixed**: added `managerPromo()` card rendering an "Open manager" affordance for manager-backed subs (Concepts 01/02/03).

## Artifacts

All temporary test screenshots and browser profiles were deleted before finishing (CONCEPT_RULES #10). Only deliverable files remain in the folder.
