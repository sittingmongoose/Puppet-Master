# fable — Seven New Concepts: Findings (packet 2026-08-18)

Companion to `SEVEN_NEW_CONCEPTS_TEST_REPORT.md` and the roll-up
`SEVEN_NEW_CONCEPTS_IMPACT_REGISTER.json`. This file records the architecture and IA decisions,
what the seven directions actually diverge on, honest simulation boundaries, and the limitations
we know about.

## Architecture: one headless spine, seven native systems

The packet allows shared headless data/search/state while demanding concept-native visible
surfaces. The pass therefore added an **additive `_shared2/` layer** (contract:
`_shared2/CONTRACT2.md`) and changed nothing in `_shared/` or concepts 01–04:

- `pm2-inventory.js` — the real `Plans/settings_inventory.json` (828 rows, 12 categories,
  36 subgroups) generated verbatim by `tools/gen-inventory.py`; legacy scope metadata carried as
  candidate-impact data only.
- `pm2-store.js` — current-Project value model over all 828 ids (31 curated divergences), row
  view-model resolver, counts/recents/attention, value persistence with rehydration and
  first-run clearing.
- `pm2-managers.js` / `pm2-managers2.js` — a 47-def view-model registry: 38 demonstrated manager
  families + 9 `deferred_named_owner` shells with owner names and insertion contracts. Provider
  view models answer the packet's six human questions first and reuse the frozen `PMProvider`
  resolvers for every state string.
- `pm2-search.js` — a 1,214-entry corpus (828 settings, 47 managers, 240 managed objects, 69
  actions, 10 workflows, 9 diagnostics, 6 unavailable capabilities, 5 help topics) with immutable
  rids, typo tolerance, duplicate-label disambiguation by path, and bounded grouped results.
- `pm2-copy.js` — the one-time Copy transaction: 5 demo sources (one legacy with conflicts +
  unavailable rows), deterministic preview, restore point, atomic verified apply, receipt, exact
  rollback.
- `pm2-states.js` — 8 scenarios, 13 fixture overlays, 33 truthful staged triggers, the States
  drawer, and a 2,000-record synthetic stress overlay that never masquerades as inventory.
- `pm2-route.js` — the deep-link grammar carried forward from the first wave
  (`#/route?scenario…fixture…trigger…focus…instant…` plus `all`, `copy`, `stress`).

Every concept renders exclusively from these view models with its own markup, CSS (`c05-`–`c11-`
prefixes), navigation, motion, and narrow-width behavior. No iframes, no cross-concept routes, no
shared visible renderer — verified by validator greps and the in-browser manager-isolation crawl.

## What the seven actually diverge on (differentiation gate: PASS)

The independent gate audit judged all eight packet axes across 28 cross-concept screenshots:

| Axis | Spread |
|---|---|
| Home composition | 05 two-column card directory · 06 editorial prose list · 07 welcome + browse-by-area beside a workspace rail · 08 few large super-cards · 09 chapter cards under an edge spine · 10 console summary + numbered command index · 11 tabbed sheet with category grid |
| Primary navigation | cards-as-nav · flat text rail · grouped workspace rail · breadcrumb page stack · right-edge chapter spine · keyboard command index · top tab strip |
| Deep navigation | card→workspace morph · rail + single document · rail + roster/detail panes · full-width page stack · layered pages with visible under-edges · Miller-column cascade · in-frame sheets with crumb chips |
| Manager composition | roster+form · single column with in-flow sheets · list/detail with explanation panel · summary status cards + quick actions · roster + tabbed detail page · dense objects/detail panes · roster + detail sheet with its own tab row |
| Narrow model | one-column push · single-pane editorial stack · facet drawer + pushed detail · single column of large cards · spine→top strip push · strict one-pane hierarchy · tabs+sheets→push stack |
| Density/type | compact-medium · roomiest editorial · information-forward · airiest · calm medium · densest · medium-compact |

The gate flagged the hero-search-attention-cardgrid family (05/07/09 Homes) as the most crowded
axis while still passing — the card treatments, chrome, and everything below Home diverge.

## The scale answer

Browsing is subgroup-sectioned (4–8-row groups, advanced folds) in every concept; the long tail
lives in each concept's faceted, virtualized **All Settings** (windowed to ~15–80 live DOM rows
even with the +2,000-record stress overlay active). Search stays bounded and never hydrates a
manager. Concept 07 makes the compendium a first-class surface per its blueprint; the others keep
it as a secondary utility.

## Verification story (details in the test report)

Ten test families ran: packet validator, ConceptHub validation, smoke2 module contract (263
assertions), boot-check walks, and the six-suite CDP harness (matrix/search/managers/state/perf/
regression) — plus a 784-screenshot full visual audit (14 viewers, every image actually viewed,
adversarial verification of all 71 raw findings → 62 confirmed → all fixed and re-verified), an
independent double-check of concept 07 (its builder lost its transcript mid-build), and a
differentiation-gate audit. Concepts 01–04 and `_shared/` are byte-identical to the pre-pass
baseline (git + innerText + screenshot comparison).

## Honesty about simulation

Prototype over demo data: nothing installs, signs in, spends money, stores credentials, or calls
providers. Every impossible action returns a visibly simulated receipt. The only persistence is
UI preferences, scenario/fixture pins, and user value edits, namespaced under
`pm.settingsConcepts.fable.<conceptId>.*`. "Close Settings" produces an honest simulated receipt —
there is no real app shell behind the prototype.

## Residual observations carried forward (not defects that block the pass)

The fourth and final full-coverage sweep (all 784 screenshots viewed again on the finished code,
with pixel-decoded contrast measurement) confirmed every targeted fix and left the following
recorded rather than changed. They are listed honestly so the next pass can pick them up.

- **Wide-width composition (05, 10, others).** Several concepts bound their content column and
  centre it, so at 2200/2500 a large share of the window is quiet background. The packet forbids
  "text deserts"; a bounded measure with balanced whitespace is an accepted answer, but 05 and 10
  in particular would compose better with an additional useful pane at ultrawide. 10 was fixed in
  the last pass; 05's remains as-is.
- **Disabled-control legibility.** The `opacity` treatment for disabled buttons composites toward
  the ground, so a disabled primary button reads faintly in glass-light (~1.9:1) and, conversely,
  still reads as a live CTA in retro-dark. WCAG exempts disabled controls, but a token-painted
  disabled state (as concept-08 now uses) is the better pattern for all concepts.
- **Small-text antialiasing.** At `--fs-2xs` (10px) glyph cores never reach the declared token
  colour, so measured peak-ink contrast sits below the nominal token ratio in the Friendly faces
  even where the token itself passes. This is a type-size choice, not a token defect.
- **Per-concept polish** noted and not changed: 05's two longest section-rail labels ellipsize at
  1280; 09's Copy step badge and retro-dark disabled button; 11's narrow attention items pushing
  the destination grid down at 760/900. Each is cosmetic and recorded in the concept's own
  `test-evidence.json`.
- **Not a defect, recorded to prevent re-flagging:** the Retro faces render Puppet Master's own
  green accent (`--accent-lime`/`--accent-primary` in `_shared/pm-shell.css`). That is theme
  fidelity required by the packet's eight-theme rule, not a terminal skin in concept 10.

## Known limitations

1. **Live ConceptHub server sessions cannot run in this sandbox** (headless Chromium hangs on all
   http). Validation ran static `ConceptHub/validate.py` plus the file:// CDP harness; the hub
   `?hub=1` postMessage bridge is implemented per contract and smoke-verified, not exercised
   through a live hub server here.
2. **Collection editors**: `list`/`keyvalue` rows render entries read-only in Details drawers with
   an honest note — no fake inline collection editors were built.
3. **Motion under reduced-motion** is state-equivalent by construction (kill-switch CSS +
   settle-pattern JS), verified by boot-check runs with `motion=reduced`; frame-by-frame motion
   choreography was reviewed per concept by its builder, not by the screenshot audit (stills).
4. **Shape drift in shared view models** (two step shapes, two object-address forms) is handled by
   tolerant renderers; recorded as IMP-GRAMMAR-1 for future normalization.
5. **Google Fonts are the only external resource**; the harness blocks them, so shots render with
   fallback stacks. On a blocked network the pages remain fully functional by design (matches the
   first wave's convention).
6. **c10 uses CSS container queries** for its detail-pane recomposition — a web-only device; the
   Slint port would express the same rule as an explicit width-threshold state machine (noted in
   its plan-owner delta).
7. The three rethemed concepts interpret their reference boards' layout systems, not their pixel
   look; where a board's device conflicted with packet rules (e.g. the Command Suite's slash-path
   labels), the packet won.
