# Findings — Usage page (verified research pointer + load-bearing facts)

**Final consolidation 2026-08-01**, reflecting the whole rebuild: semantics, shared infrastructure,
persistence migrations, hardening, design elevation, finish polish, the final alignment/contrast
pass, and the closing phase — the U8 revert from freeform back to the standard grid (per user
direction), the area-aware renderer rebuild for content-fit, curated default compositions, the
focus-mode morph, and a full live-browser QA sweep with all findings fixed. The audit corpus lives in
`verification/audit-*.md` and the closing-phase QA/fit reports in `verification/qa-*.md` and
`verification/audit-widget-fit.md`. The research corpus itself was re-verified on 2026-07-30. This
file points to the research corpus and records the load-bearing verified findings, the
distinctiveness and content-fit outcomes, the audit/QA criticals that were fixed, and the
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
   prototypes now enforce this in the demo data: **≥36 provenance chips per concept**, machine-verified.

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
   and plan-backed vs API-billed buckets must not merge (register U3). The rebuilt demo data reconciles
   exactly: **61,850,000 (API-billed) + 125,570,000 (plan-included) = 187,420,000 = the single
   `cost_microdollars`** — machine-verified by the data-unit gate.

6. **Only two true Slint 1.17.1 blockers.** The version-pinned re-audit confirms `backdrop-filter`
   and element blur as the only genuine missing capabilities (no blur/backdrop/shader primitive). The
   prior audit's other four "blockers" — CSS transforms, grid auto-placement, FLIP drag/resize, and
   media queries — are downgraded to needs-fallback: 1.14.0 added native rotate/scale, 1.15.0 made
   GridLayout spans runtime-bindable with `if`/`for`, and 1.17.0 added in-window drag-and-drop
   (`slint-1.17.1-verification.md`). Glass was aligned to PMConcept7 and de-blurred accordingly
   (`glass-slint-mapping.md`).

7. **The used-total is source-aware: 160,090.** The rebuilt dataset measures used tokens at
   **160,090**, derived source-aware so provider-specific inclusive/additive semantics (finding 1)
   are honored and nothing is double-counted. The old double-counting total (156,310) is absent from
   every concept. This is asserted by the semantic gate together with the three-way cost reconcile
   (finding 5) and the per-value provenance contract (finding 2).

8. **The seven concepts are genuinely distinct paradigms, not skins.** The distinctiveness audit
   (`verification/audit-distinctiveness.md`) originally found four real paradigms (U3, U4, U6, and
   U5 by feel) plus U7/U8/U9 converged as the same widget canvas with different seeds — and flagged
   that U8's then-marketed "freeform" was not real (reorder-only drag, snap-to-grid resize). An
   elevation pass answered that by adding a true overlap/stack freeform engine to U8; **that engine
   was subsequently removed per user direction** (the overlapping tiles were disliked), and U8 was
   reverted to the standard grid. U7, U8, and U9 all now mount the **same grid engine** and diverge
   **by composition, navigation, and chrome**, not by engine: U7 = an orderly instrument board
   (uniform modules, live module numbers, bench readout strip, 4 distinct spans); U8 = a varied-span
   bento mosaic (10 distinct spans, dense hole-free packing, a bespoke 26px dot-grid ground with
   per-category spine chrome, a focal hero number); U9 = a curated tabbed deck (five `PMTabs` tabs
   over per-tab curated boards). The final live-browser QA confirms the three remain clearly
   distinct (span variety U8 10 > U7 4; U9 the only tabbed surface; `qa-final-widgets.md` Theme 7),
   and that no overlapping/stacked widgets and no "freeform" copy remain anywhere (`qa-final-widgets.md`,
   `qa-final-static.md`). The "three skins" critique is resolved at the paradigm level
   (`verification/qa-design-critique-final.md` §3).

9. **Final design verdict: good-with-character and clearly improved, three concepts at
   portfolio-grade; the U8 revert traded a high ceiling for a safer one.** The closing design
   critique (`verification/qa-design-critique-final.md`) — the same harsh senior reviewer — confirms
   the two findings that held the set back are closed: the font-integrity gap is fixed (all seven
   pages ship the full family set and every hero numeral resolves to a loaded face on a cold load,
   no OS-font fallback), and U9's featured hierarchy is fixed (every slide opens on a real headline
   card whose focal number scales with the viewport, the quota spreadsheet demoted to a support
   band). The honest grade is **three concepts portfolio-grade (U3, and conditionally U8/U9 on their
   best slide), four good-with-character (U4, U5, U6, U7), zero AI-slop, zero regressions**. U8's
   revert from freeform to the grid bento did **not** make it a U7 clone (it is still varied and
   alive) but it did surrender the overlap/raise engine that made U8 portfolio-grade on its own, and
   the grid surface exposes the wide-band void problem the freeform hid — a real ceiling regression
   acknowledged as the cost of the user's preferred orderliness. Each theme family carries a distinct
   typography voice with a loaded numeric font and a real type scale that does hierarchical work. The
   remaining distance to "portfolio-grade across the board" is now **compositional air, not
   character** (see Open gaps): vertical air in full-width bands (U9 hero/short bands, U8 wide tiles,
   the focus sheet), U8's wide-band internal voids and lack of an on-canvas focal figure, and a few
   density blemishes.

10. **The widget renderers are now area-aware and content-fit.** The 17 shared renderers
    (`PMWidgetDefs`) were rebuilt to pick a density tier from each widget's live pixel width and
    height, so content is composed for its box rather than chopped. Density variants are
    purpose-built and honest — headline-first at small sizes, top-N lists with a "+N more"
    disclosure whose tail rows stay in the DOM behind a one-click reveal (data folded, never
    dropped), column-dropping on narrow tables, two-up splits on wide tiles. The fit audit and its
    final re-measurement (`verification/audit-widget-fit.md`, `verification/qa-fit-final.md`) track
    the outcome: widget instances relying on scrolling fell **77% → 9.3% → 7.8%**; body-scroll count
    went **84 → 2 → 0** (worst vertical ratio **3.96× → 1.05× → 1.00×**); horizontal right cut-off
    went **130–165px / 60px → 0px**. Every one of the 9 remaining scrollers is the deliberate
    ledger/tools `.us-tblwrap` table-paging model inside a body that fits at 1.00×. Value-state chips
    never clip mid-word (full label at width, colored dot plus tooltip below ~340px bodies), verified
    with zero clipped spans. The closing QA sweep re-measured fit at 7.8% and verified U3/U4/U5/U6/U7/U8/U9
    all pass with no regressions, 0 console errors, 0 underscores, meter alignment Δ≤2px
    (`qa-fit-final.md`, `qa-final-widgets.md`, `qa-final-static.md`, `qa-u9.md`).

11. **Animation is expert-level across U3–U9, with distinct per-concept personalities, and
    exceeds PMConcept7.** A full animation-elevation pass (U1/U2 excluded) replaced PMConcept7's
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
    a direction-aware readout flip, and spring tab ink. The pass was verified three ways: an
    independent expert motion audit verdicted it **EXPERT-LEVEL, 66/66 checks** (measured overshoot /
    follow-through / stagger, personalities distinct, **reduced-motion fully compliant on all 7**)
    (`verification/audit-motion-final.md`); live-browser **visual witnesses watched every concept
    across all 8 themes** (per-frame trajectories plus screenshot frame-sequences in
    `verification/screenshots-witness/<concept>/<theme>/`, reports `verification/witness-u3.md` …
    `witness-u9.md`); and the regression gates stayed green (matrix **280/280**, data-unit
    **1003/1003**, U4 interactive states **59/59** after a pane-switch busy-lock regression was found
    and fixed). Against PMConcept7 — teleport reorders, from-$0 counters, identical 240ms fades, a
    dead press scale, a linear page exit — the concepts now move objects (lifted-clone FLIP reorders,
    value→value tweens, staggered springs, live press) and exceed it decisively. Full reference:
    `research/animation-elevation-reference.md` §E; honest residuals in
    `verification/known-limitations.md`.

## Verification status (final)

The automated + visual verification story, in full (details and caveats in
`verification/known-limitations.md`; per-combo evidence in `verification/visual-review-ledger.json`):

- **Base matrix: 280/280 pass** — 7 pages (U3–U9) × 8 themes × 5 widths (900/1280/1700/2200/2500);
  meter alignment (≤2px, both edges), zero underscores in any text node (incl. hidden panes), zero
  root overflow, zero console/page errors (`verification/run-matrix.mjs` → `results.json`, `report.md`).
- **Interactive states: 393 passed / 0 failed / 171 legitimate N/A** — tabs/panes, sort asc+desc,
  filter menus, context popup, More Details (Curated + redacted Raw + command dispatch),
  one-popup-at-a-time, widget kebab, add-picker, Configure, S/M/L/XL + free-resize Custom chip,
  focus + scrim, reduced-motion toggle, low-height 650/1400, and the gallery
  (`verification/run-states.mjs` → `state-results.json`).
- **Semantic / data-unit: 1003 assertions, 0 failures** — used-tokens 160,090 (source-aware),
  three-way cost = 187,420,000 = `cost_microdollars`, ≥36 provenance chips/concept, 0 prose
  underscores (`verification/data-unit.mjs`).
- **Visual review: 280/280 combos pass** — all 7 concepts × 40 combos. Geometry is the automated
  matrix above re-run on the final design; design-quality judgment is the agent critique in
  `verification/qa-design-critique-final.md` plus the live-browser QA sweep (`qa-fit-final.md`,
  `qa-final-widgets.md`, `qa-final-static.md`, `qa-u9.md`), the widget fit audit
    (`audit-widget-fit.md`), and the finish / alignment / contrast passes. Consolidated in
    `verification/visual-review-ledger.json` (280 entries, all pass). **Agent-done, not human
    sign-off.**
- **Motion: expert-level, audited and visually witnessed (finding 11).** Independent expert motion
    audit **EXPERT-LEVEL, 66/66** with reduced-motion fully compliant on all 7
    (`verification/audit-motion-final.md`); live-browser visual witnesses across **all 8 themes**
    for every concept (`verification/witness-u3.md` … `witness-u9.md`,
    `verification/screenshots-witness/<concept>/<theme>/`).

The demo numbers in `usage-data.js` are now rebuilt to the canonical contract (findings 1, 2, 5, 7).
U1 and U2 are frozen and excluded from every gate.

## Defect-resolution summary (polish pass)

The agent visual reviews flagged defects that were fixed in a polish pass (full per-combo notes in
`verification/visual-review-{page}.json` and the merged ledger):

- **U3 Cockpit** — Quota Bank tile interior void 37–45% → ~1% (tile no longer stretches against its
  tall Anomaly-guard row-mate; trailing note reflows).
- **U4 Focus** — quota-row meter gap filled (meter grows with row width instead of leaving a void).
- **U5 Cozy Console** — KPI primary values no longer truncate (stacked→row breakpoint raised).
- **U6 Workspace** — Budget Pulse provenance-chip collision → 0.
- **U7 Board** — Budget widget fill 0.51 → 1.0; glass-light control contrast 3.3:1 → 6.2:1.
- **U8 Canvas** — Spend pulse fill 0.49 → 1.0; analytics/token-flow tiles filled.
- **U9 Deck** — dead space 16–21% → 2–5% (dense packing); Overview made cost-free (dollar hero moved
  off the default tab, cost/spend widgets stay on the Cost tab).

The three formerly-deferred residuals are now fixed and verified in the post-fix reviews: the U3
account-status clip at 1280 (the line now wraps, 0% clip), the U5 ultra-wide band (now under 1%, the
meter absorbing the width as the hero soak), and the shared quota-widget overflow on U7/U8/U9 (about
4.6–8.8× down to about 1.0–1.5× via progressive density plus show-all and per-window detail
affordances). Only low/cosmetic items remain — graceful secondary-label ellipses and a retro ellipsis
glyph on U3; a 1280 annotation ellipsis and a popover caret on U5; an ultrawide mini-bar placement on
U6; a budget mid-card gap, slight non-quota body scroll, and glass-light H1 contrast on U7; trailing
dead space, a 900 notch, and a soft wordmark on the light themes of U8; and borderline quota scroll at
900, ragged overview notches, looser wide sub-tab packing, and a soft wordmark on U9. Full detail in
`verification/known-limitations.md` (the per-concept `verification/visual-review-{page}.json` files
retain the intermediate per-combo notes as lineage).

## Closing-phase QA sweep (live browser) — outcomes

The final phase was verified by an isolated live-browser QA sweep (playwright-core driving system
Chrome, not the shared MCP browser; evidence in `verification/qa-*.md`, `audit-widget-fit.md`):

- **U8 reverted to the grid (freeform removed).** The overlap/stack freeform engine was deleted from
  the shared canvas (`_shared/usage-widgets.js`, 959 → 752 lines) per user direction — the
  overlapping tiles were disliked. **Free grid-span resize (arbitrary corner resize) stays.** U8 is
  now varied-span bento on the grid: drag = reorder, dense hole-free packing, a bespoke 26px
  dot-grid ground, per-category spine chrome, and a focal hero number. The QA sweep confirms 0
  overlap pairs on U7/U8 across the whole matrix, the bespoke ground on all 8 themes, all
  "freeform"/"free-form" copy purged from the U8 page and the gallery, drag = reorder with no x/y in
  the persisted envelope, and the Custom chip retained on free resize (`qa-final-widgets.md`,
  `qa-final-static.md`).
- **U9 recomposed into a varied-width curated deck.** Hero bands are filled (occupancy 0.932 on every
  tab/theme/width, never a void); widths vary at 2200/2500 (not all-full-width slabs); the Cost tab
  now leads with actual spend ($187.42 hero by default) while the Overview stays cost-free
  (`qa-u9.md`, `qa-final-widgets.md`). The earlier hollow-hero / flat-slab over-correction
  (`qa-u9.md`) and the 900px sessions body-scroll were fixed.
- **Renderer density edge cases fixed.** The U7 cache 2×5 under-fill (~63–70% void) found in the
  widget QA was fixed (cache 2×5 now 100% filled; `qa-final-widgets.md` F1), along with the
  density-re-gating under-fill (37.5% → 100%). U3 dial names fit with no silent clip (0 clipped, 0
  masks, full text on every tooltip) and the intra-tile voids at 2200/2500 were fixed (max band
  8.9%) (`qa-final-static.md`).
- **No regressions across the sweep.** U3/U4/U5/U6/U7/U8/U9 all verified pass; 0 console/page
  errors, 0 user-facing underscores, meter alignment Δ≤2px (worst 0px), 0 mid-word-clipped chips,
  focus mode morphs (continuous FLIP) with the focal surviving focus on U8 (`qa-final-widgets.md`,
  `qa-final-static.md`, `qa-design-critique-final.md`).
- **Rich drag-reorder experience shipped and verified.** The shared widget canvas now lifts a floating
  copy of the grabbed widget (its slot becomes a dashed ghost landing slot), reflows siblings live with
  FLIP (bodies never re-render, so charts don't flicker) as a real-time drop preview, and settles the
  widget into the ghost slot on drop with persistence; Esc reverts, drop-in-place is a no-op, reduced
  motion stays functional, and viewport edges auto-scroll. An independent live-browser pass across
  U7/U8/U9 confirmed it at **184/184 checks** (`verification/qa-drag.md`).

## Audit criticals fixed (hardening + elevation)

Beyond the visual polish, the adversarial audits (`verification/audit-*.md`) surfaced criticals that
were fixed and re-verified; the post-elevation recheck is `verification/audit-a11y-motion-recheck.md`:

- **Robustness (U9 tab blanking)** — rapid or interrupted tab switching silently hid every panel
  (a stale one-shot `animationend` listener in the crossfade). Fixed: rapid switching now never
  blanks; exactly one panel is visible (`audit-robustness.md` C1; recheck §4).
- **Accessibility (operation-blocking)** — the four keyboard/ARIA criticals are fixed: sortable
  ledger headers are keyboard-operable with managed `aria-sort` across U3–U9; the Context Detail
  surface is a real dialog (`role="dialog"`, `aria-modal`, focus-trap, focus restored on close);
  the widget kebab / add-picker menus move focus into the menu and restore it on Esc; and the
  title-bar page tabs are keyboard-activable (`audit-accessibility.md` C1–C4; recheck §2).
- **Motion (U9 entrance replay)** — switching tabs replayed the widget entrance on the whole panel.
  Fixed: zero entrance replays on every tab switch, and reduced motion is pixel-perfect on both
  paths across all concepts (`audit-motion.md` C1; recheck §4–5).
- **Data semantics (entitlement contradiction)** — Copilot premium was rendered as both "exhausted"
  and "9 left" on the same screen; the window mislabels and the conflated cache-hit hero (context
  cache-hit vs provider prompt-cache) are corrected, and the three-way cost projection is
  machine-verified (`audit-data-semantics.md` C1/M1/M2/M5; `verification/data-unit.mjs`).
- **Contrast** — brought to AA across the owned token set (worst text ≥4.5:1, non-text ≥3:1); the
  prior 1.20:1 raw-tone and 2.85:1 muted-text catastrophes are gone (`audit-accessibility.md`
  M1–M4; `verification/contrast-final-cleanup.md`).

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

**Open design gaps** (the narrow remaining distance to "portfolio-grade across the board," from
`verification/qa-design-critique-final.md` §7, ranked by leverage): vertical air in full-width bands
(U9 hero/short support bands, U8 wide tiles, and the focus sheet — boxes taller than their content,
so dominance partly reads as emptiness); U8's wide-band internal voids plus no on-canvas focal
figure; U8's lowered ceiling now the freeform engine is gone (an acknowledged trade); four density
blemishes (narrow-width chip handled, but cost/spend lack a clean wide-tall composition, the
sessions cap is non-monotonic, quota 2×5 was borderline — since fixed to 1.00×); U5's warmth still
stops at the chrome and never reaches the quota rows; and U7's plotting-field ground is
under-rendered. These are taste/craft and composition items, not gate failures.

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
