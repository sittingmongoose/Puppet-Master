# Findings — Usage page (U1–U9 phase · load-bearing semantics and open gaps)

> **Read this before you trust any number in this document.**
>
> **Scope.** This file records the **U1–U9** phase. It does **not** describe U10 or U11:
> `grep -ci 'u11\|u10' FINDINGS.md` returned **0** before this repair, while **U11 Prism II is the
> selected concept**. Read this as U1–U9 lineage. For the current state of the folder read
> [`README.md`](./README.md); for findings about the selected concept read the independent audit's
> `FINDINGS.json` and the `unresolved_questions` array in
> [`reports/impact-register.json`](./reports/impact-register.json).
>
> **Every `verification/*` artifact this document used to cite is absent and was never committed.**
> Verified 2026-08-18, three ways: (1) `find verification -type f` returns exactly **15** files — 13
> PNGs plus `cdp-shots.mjs` and `std-shots.mjs`, all under `verification/u11/redesign/`; (2) each cited
> name was tested individually with `test -e` and then searched for with `find` across the whole
> repository — none is present and none was relocated; (3) `git log --all --oneline --diff-filter=A`
> returns **0** commits for every one of those names, and the only commit that has ever touched
> `verification/` is `aa122d7c85`, which added exactly those 15 files. There are no deletions. Nothing
> was lost — nothing was ever created.
>
> **Therefore no quantitative claim that rested on those files is falsifiable, and none should be
> relied on.** Every such claim has been **deleted rather than softened**; the inventory is in
> [What was removed from this document](#what-was-removed-from-this-document). This is finding
> **A11-03** of the independent audit at
> [`../PM_Usage_Independent_Audit_2026-08-17/`](../PM_Usage_Independent_Audit_2026-08-17/) — the same
> defect already repaired in [`README.md`](./README.md) and
> [`research/INDEX.md`](./research/INDEX.md). What survives below is the design and semantic knowledge
> that stands on the live files and on the research corpus, which does exist.

**Final consolidation 2026-08-01**, reflecting the whole rebuild: semantics, shared infrastructure,
persistence migrations, hardening, design elevation, finish polish, the final alignment/contrast
pass, and the closing phase — the U8 revert from freeform back to the standard grid (per user
direction), the area-aware renderer rebuild for content-fit, curated default compositions, and the
focus-mode morph. The research corpus itself was re-verified on 2026-07-30. This
file points to the research corpus and records the load-bearing verified findings, the
distinctiveness and content-fit outcomes, the defects that were found and fixed, and the
still-open gaps. **`Plans/**` were NOT edited here** — editing canonical prose, `Spec_Lock`, or
shards is a seal-phase action. Citations are `file:line` to live files; PlanUnit ids are `UF-xxx`
(usage-feature) and `F3-xxx` (FinalGUISpec).

## Where the research lives now (`research/`)

- **Plans synthesis** — `plans-usage-synthesis.md` (token / quota / cost / projection),
  `plans-gui-synthesis.md` (GUI surfaces), `plans-gap-and-conflict-register.md` (shared gap/conflict
  register), `plans-source-ledger.json`, `plans-command-registry.md`.
- **14 external open-source projects** (access-date 2026-07-30, SHA-pinned, clones removed after) —
  `usage-notes-A.md` / `usage-ledger-A.json` (ccusage, Claude-Code-Usage-Monitor, cc-statusline,
  opencode, claudecodeui, codeburn) and `usage-notes-B.md` / `usage-ledger-B.json` (LiteLLM,
  Helicone, OpenMeter, Lago, LLM-Token-Counter-VSCode, vs-context, copilot-usage-dashboard-v2,
  github-copilot-usage-tracker).
- **Motion** — `motion-synthesis.md` (principles P1–P12), `motion-token-map.json`,
  `motion-to-slint-map.md`, `motion-source-ledger.json`.
- **Slint 1.17.1** — `slint-1.17.1-verification.md` (version-pinned re-audit),
  `slint-portability-audit.md`, and `glass-slint-mapping.md`.

## Load-bearing verified findings

1. **Token counting is provider-specific (inclusive vs additive).** Whether cache sits inside the
   input total is governed per provider by `counting_semantics` (UF-085 `usage-feature.md:5619`;
   UF-086 `:5729`): inclusive totals make cache/reasoning non-additive subsets that must NOT be added
   back. The 14 projects reconcile this in opposite directions and prove it is provider- and
   SDK-version-specific — ccusage/codeburn keep cache separate and additive, claudecodeui folds cache
   into input, opencode subtracts cache (AI SDK v6 made input inclusive), and LiteLLM normalizes
   Anthropic's additive input up to an inclusive invariant before pricing
   (`usage-notes-A.md`, `usage-notes-B.md`).

2. **Provenance on EVERY value is canonical.** Every visible token, context, cost, quota, credit,
   cache, reasoning, provider-total, or context-estimate value must carry the full provenance grammar
   (`value_state`, `source_class`, `source_confidence`, `source_authority`, `settlement_status`,
   `projection_freshness`, `projection_health`, an observed/updated timestamp, and a `reason` when
   degraded) — not selectively. UF-087 `usage-feature.md:5429`, F3-418 `FinalGUISpec.md:27751`,
   UF-085 `:5619`. "Missing is never a silent zero" is part of this contract (UF-074 `:5041`). The
   rebuilt demo data carries the grammar on its value objects rather than selectively
   (`_shared/usage-data.js`, "Task 4 — provenance grammar on every visible value object").

3. **Run-out has NO canonical definition.** "Burn rate" and "run-out / forecast exhaustion" appear in
   `Plans/**` only as build-plan demo prose, the `spend_rate_exceeded` anomaly class (UF-083
   `:6016`), and UF-065's pre-execution high-cost warning (`:4362`) — none is a quota forecast. The
   only canonical numeric rate is the anomaly formula at `usage-feature.md:5811`. Any prototype
   burn/run-out MUST be a clearly-labeled derived GUI projection over the canonical window model,
   **fail-closed to `unknown` when history is insufficient, and never a fabricated countdown**
   (UF-085 `:5711`, UF-087 `:5441`). Recorded as the top usage-semantics gap (register U1).

4. **`window_kind` is a 5-value enum; 5h/weekly are labels, not kinds.** Canonical kind is
   `rolling` / `fixed_reset` / `billing_cycle` / `session_only` / `unknown` (`usage-feature.md:597`;
   UF-041 `:3080,3111`). "5-hour", "weekly", and "monthly" are `window_label` / duration values —
   Claude Code exposes separate five-hour and seven-day fields with separate resets (MA-063
   `Multi-Account.md:915`), and Alibaba's 5h/weekly/monthly windows must be preserved separately, not
   flattened (`usage-feature.md:358`). Each window carries its own reset evidence and renders
   "Unknown reset" rather than a guessed countdown; the rebuilt fixtures keep the synthesized
   5h/7d windows as independent provider/account/window records.

5. **One cost authority, three GUI projections.** The single canonical authority is
   `cost_microdollars` (integer) and/or provider minor units plus currency
   (`Contracts_V0.md:2192-2196`; UF-085 `:5619`); `cost_usd` is presentation-only with precision tiers
   of 6dp under $0.01, 4dp under $1, else 2dp (`usage-feature.md:523-524`). The "API-billed /
   plan-included / combined" split is a **GUI projection over that single authority, explicitly NOT a
   second cost model** (`Concepts/usage-concepts/BUILD_PLAN.md:20-22`); overage is a policy/entitlement state,
   and plan-backed vs API-billed buckets must not merge (register U3). How the rebuilt demo data
   carries that split, read out of the source on 2026-08-18: `cost_microdollars` is
   `Math.round(budget.spentMTD * 1e6)` from `spentMTD: 187.42` (`_shared/usage-data.js:286,615`), the
   API-billed bucket is the literal `61850000` (`:618`), and the plan-included bucket is computed as
   the remainder (`:619`). So the three-way identity holds **by construction** — it is a property of
   how the fixture is built, not an independent reconciliation, and it is not evidence that the split
   is correct.

6. **Only two true Slint 1.17.1 blockers.** The version-pinned re-audit confirms `backdrop-filter`
   and element blur as the only genuine missing capabilities (no blur/backdrop/shader primitive). The
   prior audit's other four "blockers" — CSS transforms, grid auto-placement, FLIP drag/resize, and
   media queries — are downgraded to needs-fallback: 1.14.0 added native rotate/scale, 1.15.0 made
   GridLayout spans runtime-bindable with `if`/`for`, and 1.17.0 added in-window drag-and-drop
   (`slint-1.17.1-verification.md`). Glass was aligned to PMConcept7 and de-blurred accordingly
   (`glass-slint-mapping.md`).

7. **A used-token total must be derived source-aware, never summed.** A used-total is only meaningful
   if each source's inclusive/additive semantics (finding 1) are applied *before* aggregation: summing
   the raw fields across providers double-counts cache and reasoning for every provider that reports
   them inside input, and the resulting figure is larger than the truth and unattributable. The
   rebuild adopted that rule alongside the three-way cost projection (finding 5) and the per-value
   provenance contract (finding 2). *The specific source-aware figure this finding used to report, and
   the older double-counted figure it contrasted against, are deleted — both were attributed to a
   semantic gate that does not exist.*

8. **The seven concepts are genuinely distinct paradigms, not skins.** The distinctiveness review
   originally found four real paradigms (U3, U4, U6, and U5 by feel) plus U7/U8/U9 converged as the
   same widget canvas with different seeds — and flagged that U8's then-marketed "freeform" was not
   real (reorder-only drag, snap-to-grid resize). An elevation pass answered that by adding a true
   overlap/stack freeform engine to U8; **that engine was subsequently removed per user direction**
   (the overlapping tiles were disliked), and U8 was reverted to the standard grid. U7, U8, and U9 all
   now mount the **same grid engine** and diverge **by composition, navigation, and chrome**, not by
   engine: U7 = an orderly instrument board (uniform modules on a fixed grid, live module numbers,
   bench readout strip, graph-paper ground); U8 = a varied-span bento mosaic (mixed spans, dense
   hole-free packing, a bespoke 26px dot-grid ground with per-category spine chrome, a focal hero
   number); U9 = a curated tabbed deck, the only tabbed surface in the set (five `PMTabs` tabs over
   per-tab curated boards). Each page states its own paradigm in its header comment. No overlapping or
   stacked widgets and no "freeform" copy remain on the U8 page or in the gallery.

9. **The closing design pass closed two set-wide gaps; the U8 revert traded a high ceiling for a
   safer one.** Two design problems that had held the set back were fixed in the closing phase: the
   font-integrity gap (all seven pages ship the full family set, so hero numerals resolve to a loaded
   face on a cold load rather than falling back to an OS font), and U9's featured hierarchy (every
   slide now opens on a real headline card whose focal number scales with the viewport, with the
   quota spreadsheet demoted to a support band). U8's revert from freeform to the grid bento did
   **not** make it a U7 clone (it is still varied and alive) but it did surrender the overlap/raise
   engine, and the grid surface exposes the wide-band void problem the freeform hid — a real ceiling
   regression accepted as the cost of the user's preferred orderliness. Each theme family carries a
   distinct typography voice with a loaded numeric font and a real type scale that does hierarchical
   work. The remaining distance is **compositional air, not character** (see Open gaps): vertical air
   in full-width bands (U9 hero/short bands, U8 wide tiles, the focus sheet), U8's wide-band internal
   voids and lack of an on-canvas focal figure, and a few density blemishes. *The overall grade this
   finding used to report — a per-concept portfolio-grade tally — is deleted: it was the verdict of a
   design critique document that does not exist.*

10. **The widget renderers are now area-aware and content-fit.** The 17 shared renderers
    (`PMWidgetDefs`) were rebuilt to pick a density tier from each widget's live pixel width and
    height, so content is composed for its box rather than chopped. Density variants are
    purpose-built and honest — headline-first at small sizes, top-N lists with a "+N more"
    disclosure whose tail rows stay in the DOM behind a one-click reveal (data folded, never
    dropped), column-dropping on narrow tables, two-up splits on wide tiles. The tier is derived from
    the tile's live pixel box (`fitOf`), measured off the mounted `.uw` when present and otherwise
    estimated deterministically from the span and the canvas grid metrics — so a short box is a low
    tier no matter how wide, and a narrow box is a low tier no matter how tall
    (`_shared/usage-widget-renderers.js:25-30`). Where a widget still scrolls, the intended model is
    the deliberate ledger/tools `.us-tblwrap` table-paging surface rather than an overflow.
    Value-state chips are built not to clip mid-word: the full label at width, a colored dot plus a
    tooltip in narrow bodies. *The before/after fit percentages, body-scroll counts and vertical-ratio
    figures this finding used to report are deleted — every one came from a fit audit and a
    re-measurement report that do not exist.*

11. **Motion was rebuilt across U3–U9 into real object motion with distinct per-concept
    personalities.** A full animation-elevation pass (U1/U2 excluded) replaced PMConcept7's
    flat-appearance motion with real object motion. A shared spring/personality token vocabulary —
    `--mo-spring/settle/antic/follow/stagger/press/reveal/bounce`, each with a reduced-motion
    twin and all scaled by the per-theme `--pm-motion-k` (retro 0.58 → glass 1.33) — drives:
    value→value counters with a landing tick and retarget (never from $0), overshoot-then-settle
    meters/donuts, chart bars that stagger and morph from previous values, sparkline draw-ons, a
    staggered widget entry wave with 3-layer hover-lift plus spring-back press and menu cascade,
    popups that spring with content follow-through and a state-linked heat ring pulse, More Details
    stagger with a Curated↔Raw cross-slide, and one-shot scroll reveal. Each concept then carries a
    signature personality: U3 instrument power-on (needle sweep with overshoot, LED strikes,
    threshold flashes, bench ticker), U4 calm directional depth panes with a spring rail indicator,
    U5 spend-linked lub-dub hearth with ambient breathing, U6 directional dossier swap with pressure
    pulses, U7 module power-on cascade with a bench diagnostic scan and odometer numbers, U8 bouncy
    tile settle with tactile 3D tilt and a breathing hero wash, and U9 slide depth with hero count-up,
    a direction-aware readout flip, and spring tab ink. Against PMConcept7 — teleport reorders,
    from-$0 counters, identical 240ms fades, a dead press scale, a linear page exit — the concepts
    now move objects (lifted-clone FLIP reorders, value→value tweens, staggered springs, live press).
    A pane-switch busy-lock regression on U4 was found and fixed during the pass. Full reference:
    `research/animation-elevation-reference.md` §E. *The motion audit verdict and check count, the
    per-theme visual-witness record, and the three "gates stayed green" tallies this finding used to
    report are deleted — every one named a file that does not exist. No measured record of the motion
    quality or of reduced-motion compliance survives.*

## Verification status (U1–U9)

**There is none.** There is no base matrix, no interactive-states gate, no data-unit gate, no
visual-review ledger and no design-critique corpus for the U1–U9 set, and none was ever committed. The
section that used to stand here reported five green gates with hard counts; every one of them named a
script or a result file that does not exist, so all five have been deleted rather than softened. The
inventory is in [What was removed from this document](#what-was-removed-from-this-document).

The only automated gate in this folder is `u11-verify.mjs`, and it exercises **U11 only** — not any
concept this document describes. See [`README.md`](./README.md) under Verification, which also records
what that harness does and does not cover.

The demo numbers in `_shared/usage-data.js` were rebuilt to the canonical contract (findings 1, 2, 5,
7); that the rebuild landed is readable in the file, but it was never gated. U1 and U2 are frozen
(rejected) and were not edited after the first pass.

## Closing-phase changes (U8 revert, U9 recomposition, drag-reorder)

What the closing phase changed. These are descriptions of shipped behaviour, readable in the live
files. The live-browser QA sweep that used to be cited as their verification left no artifact that
exists, so nothing here carries a measured pass record.

- **U8 reverted to the grid (freeform removed).** The overlap/stack freeform engine was deleted from
  the shared canvas (`_shared/usage-widgets.js`) per user direction — the overlapping tiles were
  disliked. **Free grid-span resize (arbitrary corner resize) stays.** U8 is now varied-span bento on
  the grid: drag = reorder, dense hole-free packing, a bespoke 26px dot-grid ground, per-category
  spine chrome, and a focal hero number. Measured 2026-08-18: `grep -ci 'freeform\|free-form'`
  returns 0 for `u8-canvas.html` and 0 for `index.html`; the one surviving hit in
  `_shared/usage-widgets.js:33` is the code comment recording the retirement. The persisted envelope
  is `{v, items:[{uid, type, c, r, cfg, focus}]}` with no x/y (`:130-138`), and the Custom chip is
  still shown when a free span matches no preset (`:271`).
- **U9 recomposed into a varied-width curated deck.** Hero bands are filled rather than hollow;
  widths vary at the wide tiers instead of stacking all-full-width slabs; the Cost tab leads with
  actual spend while the Overview stays cost-free (the dollar hero moved off the default tab, and the
  cost/spend widgets stay on the Cost tab). The earlier hollow-hero / flat-slab over-correction and
  the 900px sessions body-scroll were fixed.
- **Renderer density edge cases fixed.** The U7 cache 2×5 under-fill and the density-re-gating
  under-fill were both fixed, and U3's dial names were made to fit without a silent clip (full text
  reachable on the tooltip).
- **Rich drag-reorder experience shipped.** The shared widget canvas lifts a floating copy of the
  grabbed widget (its slot becomes a dashed ghost landing slot), reflows siblings live with FLIP
  (bodies never re-render, so charts don't flicker) as a real-time drop preview, and settles the
  widget into the ghost slot on drop with persistence; Esc reverts, drop-in-place is a no-op, reduced
  motion stays functional, and viewport edges auto-scroll.

## Defects found and fixed (hardening + elevation)

Beyond the visual polish, the hardening and elevation passes surfaced defects that were fixed in the
concept files. The reports those passes wrote are among the artifacts that do not exist, so what
survives is the defect and the fix — the *description* of a real bug, not a verification record, and
not a claim that the fix was re-measured.

- **Robustness (U9 tab blanking)** — rapid or interrupted tab switching silently hid every panel
  (a stale one-shot `animationend` listener in the crossfade). Fixed so that rapid switching leaves
  exactly one panel visible.
- **Accessibility (operation-blocking)** — four keyboard/ARIA defects were fixed: sortable ledger
  headers are keyboard-operable with managed `aria-sort` across U3–U9; the Context Detail surface is
  a real dialog (`role="dialog"`, `aria-modal`, focus-trap, focus restored on close); the widget
  kebab / add-picker menus move focus into the menu and restore it on Esc; and the title-bar page
  tabs are keyboard-activable.
- **Motion (U9 entrance replay)** — switching tabs replayed the widget entrance on the whole panel.
  Fixed so the entrance does not replay on a tab switch.
- **Data semantics (entitlement contradiction)** — Copilot premium was rendered as both "exhausted"
  and "9 left" on the same screen; that contradiction, the window mislabels, and the conflated
  cache-hit hero (context cache-hit vs provider prompt-cache) were corrected.
- **Contrast** — the owned token set went through a dedicated contrast cleanup pass. *The before and
  after ratios this bullet used to quote came from probe files that do not exist and are deleted;
  no contrast measurement of this concept set survives.*

## Open gaps to adjudicate (full detail in the register)

From `research/plans-gap-and-conflict-register.md`:

- **Duplicate widget-add command IDs** — `cmd.widget.add` vs `cmd.dashboard.add_widget` disagree on
  payload and on whether a domain event is persisted (register G1).
- **Widget focus mode and S/M/L/XL presets have no canonical command** — only free `col_span` /
  `row_span` resize is canonical; focus mode is unowned (register G2).
- **`value_state` has no single closed enum** — two overlapping lists exist across UF-074 and
  F3-418 / UF-087 and need reconciliation (register U4); `source_authority` has no spelled-out enum
  (register U5).
- **`widget.budget_donuts` conflict** — canonical default Usage layout includes it, the build plan
  says to kill it; needs owner adjudication (register U8).
- **Reduced-motion toggle and the no-underscore UI rule have no canonical command/prose home**
  (register G4, G6); detailed motion tokens are not yet canonical (register G7).

**Open design gaps**, ranked by leverage: vertical air in full-width bands (U9 hero/short support
bands, U8 wide tiles, and the focus sheet — boxes taller than their content, so dominance partly
reads as emptiness); U8's wide-band internal voids plus no on-canvas focal figure; U8's lowered
ceiling now the freeform engine is gone (an acknowledged trade); density blemishes (the narrow-width
chip is handled, but cost/spend lack a clean wide-tall composition, the sessions cap is
non-monotonic, and quota 2×5 was borderline — since fixed); U5's warmth still stops at the chrome and
never reaches the quota rows; and U7's plotting-field ground is under-rendered. These are taste and
composition items. They are judgements, not measurements, and they are not gate failures because
there is no gate.

**Proposed future Plans/command changes** discovered across the whole build are queued (NOT applied)
in `research/proposed-plan-updates.md` — P1–P13 (canonical burn-rate/run-out, one-reset-per-window,
duplicate widget-add IDs, widget preset/focus/configure commands, reduced-motion toggle, cost
projection contract, per-cell provenance, window independence, curated default-board reset,
effective-span clamping, machine-identifier humanization at the render boundary, usage-first IA,
dense-vs-sparse packing), P15–P17 (per-theme typography/voice tokens, the redacted-Raw machine-field
exception to the no-underscore rule, and layout-strategy differentiation instrument / bento / deck),
and the closing-phase P18–P21 (area-aware density tiers + fit helpers as canonical widget behavior, a
content-fit contract, curated default compositions, and focus-morph behavior). **P14 (the freeform
canvas engine) is RETRACTED** — the engine was removed per user direction, so it is no longer a
proposed canonical change.

## What was removed from this document

The version of this file that shipped before 2026-08-18 cited artifacts under `verification/` that do
not exist and were never committed, and reported hard numbers on their authority. The verification
method and its result are in the note at the top of this file. Everything below was **deleted, not
softened**, because each rested on a file that does not exist. The names are listed once here so a
reader who remembers the old text can see exactly what went; every occurrence elsewhere in this
document is gone.

**Two whole sections went.**

- A **`Verification status (final)`** block reporting five green gates: a base matrix at **280/280**
  across 7 pages × 8 themes × 5 widths, from `verification/run-matrix.mjs` writing `results.json` and
  `report.md`; interactive states at **393 passed / 0 failed / 171 legitimate N/A**, from
  `verification/run-states.mjs` writing `state-results.json`; a semantic/data-unit gate of **1003
  assertions, 0 failures** carrying the source-aware used-tokens figure **160,090** and the **≥36
  provenance chips per concept** claim, from `verification/data-unit.mjs`; a visual review of
  **280/280 combos** consolidated in `verification/visual-review-ledger.json` as **"280 entries, all
  pass"**; and a motion verdict of **EXPERT-LEVEL, 66/66** from `verification/audit-motion-final.md`
  with per-theme witnesses in `verification/witness-u3.md` … `witness-u9.md` and frame sequences in
  `verification/screenshots-witness/`.
- A **`Defect-resolution summary (polish pass)`** block reporting per-concept before/after
  measurements (interior void **37–45% → ~1%**, widget fill **0.51 → 1.0** and **0.49 → 1.0**,
  glass-light control contrast **3.3:1 → 6.2:1**, dead space **16–21% → 2–5%**, quota-widget overflow
  **4.6–8.8× → 1.0–1.5×**) plus a residual-defects list, all sourced from the per-concept
  `verification/visual-review-{page}.json` files and `verification/known-limitations.md`.

**Figures deleted from prose that otherwise survives.** The qualitative finding was kept in each case;
only the number and its dead citation went.

- Content fit: **77% → 9.3% → 7.8%** scrolling, body-scroll **84 → 2 → 0**, worst vertical ratio
  **3.96× → 1.05× → 1.00×**, horizontal cut-off **130–165px / 60px → 0px**, "9 remaining scrollers",
  "meter alignment Δ≤2px" — from `verification/audit-widget-fit.md` and `verification/qa-fit-final.md`.
- Distinctiveness: the span-variety comparison **U8 10 > U7 4** and the "three skins resolved" verdict
  — from `verification/audit-distinctiveness.md`, `verification/qa-final-widgets.md`,
  `verification/qa-final-static.md` and `verification/qa-design-critique-final.md`.
- Design: the portfolio-grade tally (**three portfolio-grade, four good-with-character, zero AI-slop,
  zero regressions**) and the "ranked by leverage" attribution on the open design gaps — from
  `verification/qa-design-critique-final.md`.
- Closing phase: **959 → 752 lines** for `_shared/usage-widgets.js` (the file measures **1007** lines
  on 2026-08-18, so the figure was wrong as well as unbacked), U9 hero occupancy **0.932**, the U7
  cache under-fill **~63–70% → 100%**, density re-gating **37.5% → 100%**, intra-tile void **max band
  8.9%**, a whole "no regressions across the sweep" bullet, and drag-reorder at **184/184 checks**
  from `verification/qa-drag.md` — all from `verification/qa-*.md`.
- Hardening: the audit critical references (`verification/audit-robustness.md`,
  `verification/audit-accessibility.md`, `verification/audit-motion.md`,
  `verification/audit-data-semantics.md`, and the recheck
  `verification/audit-a11y-motion-recheck.md`), the "reduced motion is pixel-perfect" claim, and the
  contrast ratios **≥4.5:1 / ≥3:1** against a prior **1.20:1** and **2.85:1** from
  `verification/contrast-final-cleanup.md`.
- The pointer instructing the reader to find "honest residuals" and "details and caveats" in
  `verification/known-limitations.md`.

**One figure was kept because it was re-measured, not inherited.** The three-way cost split in finding
5 is read directly out of `_shared/usage-data.js` at the lines cited there, and the finding now says
plainly that the identity holds by construction — the plan-included bucket is computed as the
remainder — which is a weaker and more accurate statement than the "machine-verified" claim it
replaces.
