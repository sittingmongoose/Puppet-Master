# Proposed future Plans / command changes (NOT applied this pass)

Per governance, canonical Plans/**, `Spec_Lock.json`, shards, and evidence were NOT edited this pass. The following are the changes the fresh research implies, recorded with exact owners/IDs/ContractRefs/command impacts for a future explicit governance seal.

## P1 — Canonical burn-rate / run-out definition (NEW)
- **Owner:** Plans/usage-feature.md (UF-083 neighborhood) + a new PlanUnit; ContractRef in `Contracts_V0.md`.
- **Why:** No canonical run-out/burn definition exists; only the anomaly formula `current_window_cost / max(median_previous_7_windows_cost, 1)` threshold 3.0, confidence `min(1.0, observed_samples/7.0)` (`usage-feature.md:5811`), and `spend_rate_exceeded` (UF-083 `:6016`). Prototypes need a defensible forecast.
- **Proposed contract:** run-out = derived projection over the canonical window model + `provider_total`; separate formulas for `fixed_reset` (reset boundary) vs `rolling` (sliding lookback); MUST fail-closed to `unknown` on insufficient history / zero burn / stale observation; MUST surface "reset-before-exhaustion" instead of a countdown; MUST never fabricate. Carry `projection_freshness`/`source_confidence`.
- **Command impact:** none new (display projection); optionally `cmd.usage.refresh_projection`.

## P2 — Explicit "one reset per window; no cross-window synthesis" rule (NEW)
- **Owner:** Plans/usage-feature.md (UF-041/UF-085) + Multi-Account.md (MA-063).
- **Why:** The anti-synthesis rule is only IMPLIED (Alibaba 5h/weekly/monthly preserved separately `:358`; no fabricated countdowns UF-085 `:5711`; 5h vs 7d separate `resets_at` MA-063 `Multi-Account.md:915`). Make it explicit: each window carries its OWN reset evidence; never derive one window's reset from another's; render `Unknown reset` when no authoritative `resets_at` (`:352`).

## P3 — Reconcile duplicate widget-add command IDs
- **Owner:** Plans/`UI_Command_Catalog.md` + `Wiring_Matrix`.
- **Conflict:** `cmd.widget.add` (UCC:375, emits no event) vs `cmd.dashboard.add_widget` (emits `dashboard.widget_added`, F3:27735; WMp:6943).
- **Proposed:** standardize on `cmd.dashboard.add_widget` (event-emitting) for the add-widget flow; deprecate/alias `cmd.widget.add`. Add-widget payload must include content type + initial span (`col_span` / `row_span`).

## P4 — Canonical widget preset/focus/configure commands (optional)
- **Owner:** `UI_Command_Catalog.md`.
- **Why:** S/M/L/XL presets, Focus mode, and per-widget Configure are prototype-only (Rebuild Plan L52–53) with no canonical command. If they ship, define `cmd.widget.focus_toggle`, `cmd.widget.configure`, and clarify presets are shortcuts over free `cmd.widget.resize` (UCC:377), not constraints.

## P5 — Reduced-motion toggle command (optional)
- **Owner:** `UI_Command_Catalog.md` / settings.
- **Why:** Reduced motion is a setting (F3:29698) with no command ID. If a UI toggle ships, add `cmd.settings.reduced_motion_set` or bind to the settings inventory.

## P6 — Cost projection display contract (clarify, not a second cost model)
- **Owner:** FinalGUISpec.md (GUI-USG-003/007) over UF-087 `cost_microdollars`.
- **Why:** "Three-way cost" + "add-on/overage bucket" are rebuild-plan framings over the SINGLE `cost_microdollars` authority. A second cost model is banned (UF-064 `:4295`, UF-087 `:5429`). Document the three figures as a projection: API-billed/list (settled), plan-included/estimated value (`settlement_status=estimated` + `entitlement_class`), combined; with add-on vs overage split derived from `entitlement_class` — never stored as separate costs.

## P7 — Per-cell provenance schema enforcement (implementation)
- **Owner:** usage-feature.md UF-087 / F3-418 `FinalGUISpec.md:27751`.
- **Why:** Canonical requires `value_state` / `source_class` / `source_confidence` / `source_authority` / `settlement_status` / `projection_freshness` / `projection_health` / `observed_at` on EVERY visible value. The demo data carries these only partially. Implementation must thread them to each rendered cell (this is a build task, not a Plans change — the contract already exists).

## P8 — Window data independence in fixtures (implementation)
- **Owner:** demo fixtures (usage-data.js) + Plans/demo-flow if canonicalized.
- **Why:** Synthesized 5h/7d windows must be independent provider/account/window records, not reused reset data (handoff defect #7). Aligns with P2.

## P9 — Canonical curated default board + reset command (NEW)
- **Owner:** `UI_Command_Catalog.md` (§2 widget block, UCC L375–380) + `Widget_System` (WS-004) + FinalGUISpec.md (GUI-USG default Usage layout); resolves the `widget.budget_donuts` default-content conflict (register U8).
- **Why:** The rebuild introduced a shared `{v:2}` board persistence with a curated default board and a reset-to-default. `cmd.widget.reset_layout {page}` (UCC L380) only resets *layout* (positions/spans), not *content* (which widgets). Canonicalize a curated default board (the widget set + spans a fresh user sees) and a content-reset command.
- **Proposed contract:** define the curated default board as data (widget ids + default `col_span`/`row_span` + order) owned by the GUI spec; add `cmd.dashboard.reset_default_board {dashboard_id}` (emits `dashboard.board_reset`, confirmation `light` per FinalGUISpec §10.1) distinct from `cmd.widget.reset_layout`. Adjudicate whether `widget.budget_donuts` is in the curated default (register U8).
- **Command impact:** new `cmd.dashboard.reset_default_board`; clarify scope of existing `cmd.widget.reset_layout`.

## P10 — Effective-span clamping to active columns as canonical responsive behavior (NEW)
- **Owner:** usage-feature.md (widget grid PlanUnits) + FinalGUISpec.md (widget grid) + `UI_Command_Catalog.md` `cmd.widget.resize` (UCC L377).
- **Why:** The U8/U9 visual reviews found inert column-count breakpoints: grids held 4 tracks at widths that should collapse to 2/3, leaving a 0px ghost column and over-wide widget spans spilling past the live tracks. Free grid-span resize is canonical (`col_span`/`row_span`, UCC L377), but the *rendered* behavior when a span exceeds the active column count is not specified.
- **Proposed contract:** canonicalize `effective_span = min(col_span, active_columns)` at the render boundary (a stored 5-span renders across all active columns when only 4 exist), and make column-count breakpoints part of the widget-grid contract rather than an inert CSS media query. Presets (gap G3) remain non-binding shortcuts over free resize.
- **Command impact:** none new; clarifies `cmd.widget.resize`/`cmd.widget.move` render semantics.

## P11 — Machine-identifier humanization at the render boundary (NEW rule)
- **Owner:** usage-feature.md (UF-074 display/formatting neighborhood) + FinalGUISpec.md (F3-417/418 value presentation).
- **Why:** The U3–U9 gate asserts zero user-facing underscores, and the frozen U1/U2 deliberately retain raw machine identifiers (`usage_event_ref`, `file_edit`, raw model slugs). Canonicalize the rule that raw machine identifiers must never surface as UI text: humanize at the render boundary (display name + the raw identifier available via tooltip/title), tying the existing no-underscore UI rule (register G6) to a positive humanization contract.
- **Proposed contract:** every machine identifier rendered to the user maps through a humanizer (label table or title-case fallback); the raw value is preserved as an accessible tooltip, never as the visible label. Applies to event refs, tool names, model ids, window kinds.
- **Command impact:** none (presentation rule).

## P12 — Usage-first IA with cost one tab away as a governing principle (NEW)
- **Owner:** FinalGUISpec.md (GUI-USG information architecture) + `Concepts/usage-concepts/BUILD_PLAN.md`.
- **Why:** The U9 Deck review confirmed the pattern: the default view should lead with usage (quotas, attention, tokens) and park literal cost/spend widgets on a dedicated tab/section — "cost stays a tab away." The Budget dollar-hero sitting on Overview was read as a defect and fixed. Make usage-first IA + cost-one-navigation-away an explicit governing principle so future layouts do not regress.
- **Proposed contract:** the default Usage surface leads with usage/entitlement state; cost/spend is a first-class but secondary surface, always exactly one navigation step away (tab or section), never the landing hero. Consistent with the single-cost-authority three-way projection (P6); interacts with the curated default board (P9) and `widget.budget_donuts` (register U8).
- **Command impact:** none (IA principle).

## P13 — Dense vs sparse grid packing as an explicit per-concept choice (NEW)
- **Owner:** FinalGUISpec.md (widget grid) + `Widget_System` (layout schema).
- **Why:** The U8 (dense, hole-free bento) and U9 (initially non-dense, 16–21% dead space) reviews showed packing mode materially changes layout quality; U9 was fixed by switching to dense packing. Whether a widget grid packs dense (`grid-auto-flow: dense`) or preserves authored order (sparse) is currently accidental. Canonicalize it as an explicit per-surface layout setting recorded in the board layout schema.
- **Proposed contract:** add a `packing: dense | sparse` field to the widget layout/board schema (default per surface); dense for mosaic/bento canvases, sparse where authored reading order matters. Record it so the choice is deliberate and reviewable, not a CSS accident.
- **Command impact:** none new (schema field); could ride a future `cmd.dashboard.configure` if one ships.

## P14 — Freeform canvas engine (`layout:'free'`) as a canonical widget mode — RETRACTED
- **Status: RETRACTED (2026-08-01).** The opt-in freeform engine this proposal sought to canonicalize
  was **removed per user direction** — the overlapping/stacking tiles were disliked. U8 was reverted
  to the standard grid widget system (the engine was deleted from `_shared/usage-widgets.js`,
  959 → 752 lines). **Free grid-span resize (arbitrary corner resize) is retained**; what was removed
  is free x/y placement with overlap/stack/raise-to-top. U8 is now varied-span bento on the grid
  (drag = reorder, dense packing). The verification harness for the removed engine is obsoleted
  (`verification/u8-canvas-freeform.obsolete.mjs`). This is no longer a proposed canonical change.
  The named layout-strategy idea survives in P17, reframed without a free-placement engine
  (instrument / bento / deck are compositions over the one grid engine, not separate placement
  engines).

## P15 — Per-theme typography/voice tokens as a canonical design contract (NEW)
- **Owner:** FinalGUISpec.md (theming / typography tokens) + `Widget_System`/design-token inventory.
- **Why:** The design elevation gave each theme family a distinct typography voice and a loaded numeric font so hero numbers never fall back to an OS font (`_shared/themes.css`: `--num-font`, `--fs-hero` 44–52px with per-family letter-spacing). The recritique (`verification/audit-design-recritique.md` §2) confirmed the numeric voice loads everywhere and graded the type scale as doing real hierarchical work; its one integrity gap (the display-voice font link shipped on only one page, so glass/retro display degraded to `system-ui`/`ui-monospace` on a clean machine) was the difference between "looks designed here" and "ships designed," and was closed in the finish pass. Canonicalize the per-family voice + loaded numeric font as a contract so a theme never silently falls back to a generic OS face on its hero numbers.
- **Proposed contract:** each theme family declares a display voice, a numeric voice, and a body voice as tokens, with the fonts loaded (not merely named) and a documented no-OS-fallback guarantee for hero/numeric text; the type scale (hero/secondary ratios) is part of the contract. Record the loaded-font requirement so gates can test the shipped state, not a locally-installed or probe-injected face.
- **Command impact:** none (design-token contract).

## P16 — Redacted-Raw machine-field exception to the no-underscore UI rule (NEW)
- **Owner:** usage-feature.md (UF-074 display/formatting) + FinalGUISpec.md (F3-417/418); refines P11 and register G6.
- **Why:** The U3–U9 gate asserts zero user-facing underscores, and P11 canonicalizes humanizing machine identifiers at the render boundary. There is exactly one deliberate exception: the redacted **Raw** preview in the Context Detail surface (`_shared/usage-context.js`) is a developer-facing machine-field reference view whose identifiers (`usage_event_ref`, tool slugs, model ids) are intentionally shown as code tokens, not UI copy. The frozen U1/U2 likewise retain raw identifiers by design of the freeze. Make the exception explicit so the no-underscore rule and the humanization rule are not mis-read as banning a legitimate raw-payload view.
- **Proposed contract:** the no-underscore UI-prose rule and the P11 humanization rule apply to user-facing labels/values; a clearly-marked raw/machine-field reference surface (the redacted Raw view) is exempt and may display the canonical machine identifiers verbatim (optionally redacted for secrets). The raw value remains available as a tooltip on the humanized label elsewhere (P11).
- **Command impact:** none (presentation-rule clarification).

## P17 — Layout-strategy differentiation (instrument / bento / deck) as canonical named strategies (NEW)
- **Owner:** `Widget_System` (layout schema) + FinalGUISpec.md (widget grid); generalizes P13 (packing). (Originally framed as separate layout *engines* including a freeform engine; reframed after P14's retraction — the freeform engine was removed, so the three strategies are now **compositions over the one grid engine**, not separate placement engines.)
- **Why:** The distinctiveness audit (`verification/audit-distinctiveness.md` §6, recommendation 2) recommended encoding the widget concepts as different *layout strategies*, not different seeds, so the divergence is structural and survives a reset. The final state realizes this on a single grid engine: U7 = orderly instrument grid (uniform modules, locked rhythm, module numbers), U8 = varied-span bento (dense packing, size-variance, bespoke ground + spine chrome, focal hero), U9 = curated tabbed deck (per-tab curated boards) — one shared grid engine composed differently (`_shared/usage-widgets.js`, `PMWidgetDefs.layouts`). Canonicalize the named strategies so a surface's paradigm is a declared, reviewable field rather than an emergent CSS/seed accident.
- **Proposed contract:** a widget surface declares a named layout strategy — `instrument` (uniform auto-fit grid, locked rhythm), `bento` (dense packing, varied spans / size-variance contract, drag = reorder), or `deck` (tabbed, per-tab curated boards) — recorded in the board layout schema alongside `packing` (P13). Each strategy carries its own defaults, ground/chrome treatment, and capability flags; resetting restores the strategy's curated default, not a generic grid.
- **Command impact:** none new (schema field); could ride a future `cmd.dashboard.configure`.

## P18 — Area-aware density tiers + fit helpers as canonical widget behavior (NEW)
- **Owner:** usage-feature.md (widget PlanUnits) + FinalGUISpec.md (widget rendering) + `Widget_System`; extends P10 (effective-span clamping).
- **Why:** The closing-phase renderer rebuild made the 17 shared renderers (`PMWidgetDefs`) pick a density tier from each widget's **live pixel width and height** (area-aware), not from the grid span alone. The prior span-only tier let a full-width-but-short tile earn high-density content in a short box (the provenance closer overflow) and treated a 190px tile the same as an 800px one (`verification/audit-widget-fit.md`). The area-aware rebuild is what took widget scrolling from 77% to 7.8% (`verification/qa-fit-final.md`). Canonicalize area-aware density selection so a renderer's content volume is a function of the box it is given.
- **Proposed contract:** each widget renderer declares density tiers keyed off live pixel area (width and height), with purpose-built compositions per tier (headline-first, top-N, two-up, drill-through) rather than truncation; the tier function penalizes short heights and gains a pixel-width sub-tier. Document the tier table as part of the widget-renderer contract so gates can assert content fits its box.
- **Command impact:** none (rendering contract).

## P19 — Content-fit contract: widgets fit their box; top-N disclosure; chips never clip (NEW)
- **Owner:** usage-feature.md (UF-074 display/formatting) + FinalGUISpec.md (F3-417/418 value presentation) + `Widget_System`.
- **Why:** The QA sweep established a concrete, measurable content-fit bar (`verification/qa-fit-final.md`, `qa-final-widgets.md`): every widget body fits at ≤1.00× (worst vRatio 1.00×, 0px right cut-off), the only scrolling is deliberate ledger/tools table paging inside a fitting body, top-N lists disclose their tail honestly ("+N more" with the rows retained in the DOM behind a one-click reveal — data folded, never dropped), and value-state chips never clip mid-word (full label at width, a colored dot plus tooltip below ~340px bodies). Canonicalize this as the widget content-fit contract.
- **Proposed contract:** a rendered widget MUST fit its allocated box (no accidental body scroll; any scroll is an explicit, sanctioned inner-table paging model); truncation of a list MUST be an honest top-N + "+N more" disclosure that retains the full set behind a reveal (never a silent drop); and a value-state chip MUST render either its full label or a dot whose full state rides an accessible tooltip — never a mid-word clip. Ties to P11/P16 (humanization / raw-field exception) and P18 (area-aware tiers).
- **Command impact:** none (presentation contract).

## P20 — Curated default compositions as canonical (NEW)
- **Owner:** FinalGUISpec.md (GUI-USG default Usage layout) + `Widget_System` (WS-004); extends P9 (curated default board + reset) and P12 (usage-first IA).
- **Why:** The closing phase re-curated the default boards to be deliberately composed, not auto-laid-out: U7 a tier-aware hole-free instrument board; U8 a varied-span bento; U9 a varied-width curated deck whose Overview is cost-free and whose Cost tab leads with actual spend ($187.42) rather than a budget-utilization ratio (`verification/qa-u9.md`, `qa-final-widgets.md`). P9 canonicalizes a curated default board *set*; this extends it to the **composition** of each default board (spans, order, featured/hero treatment, and the per-tab content curation).
- **Proposed contract:** each layout strategy (P17) ships a curated default composition as data (widget ids + spans + order + featured/hero flag + per-tab curation for a deck), owned by the GUI spec; the default leads with usage/entitlement state and keeps cost one navigation step away (P12); a money tab leads with actual spend, not a utilization ratio. Reset restores this curated composition.
- **Command impact:** none new; rides the P9 reset command.

## P21 — Focus-mode morph as canonical behavior (NEW)
- **Owner:** FinalGUISpec.md (widget focus mode) + `UI_Command_Catalog.md` (extends the P4 focus-toggle command) + motion-token inventory.
- **Why:** Focus mode previously hard-cut the card to a fixed overlay rect. The closing phase made it **morph**: the card is hoisted and travels to its overlay on a compositor FLIP transform (continuous, ~470ms) while a scrim fades 0→1 (~700ms), and Esc returns the card exactly to its board slot (`verification/qa-design-critique-final.md` §5). Canonicalize the morph (continuous travel + scrim + exact return) as the focus-mode behavior, with a reduced-motion snap fallback.
- **Proposed contract:** entering focus mode animates the card from its board rect to the overlay rect via a continuous transform (FLIP), dims the board behind a fading scrim (kept as context, not blacked out), and Esc/exit returns the card to its exact origin slot; reduced motion replaces the travel with an instant switch. Honest residual to close later: the overlay sheet is a fixed large rectangle regardless of content, so a content-light widget can sit in an under-filled sheet (a composition/air issue, not a motion defect).
- **Command impact:** clarifies the P4 focus-toggle command's behavior; no new command.

## Cross-references for the seal
- Token counting inclusivity: plans-usage-synthesis.md Q1–Q2; external evidence usage-notes-A/B.md (opencode AI-SDK v6 inclusive subtraction; ccusage additive total; LiteLLM normalization; Helicone bucket de-dup).
- Slint mapping: research/motion-to-slint-map.md + research/slint-1.17.1-verification.md.
- Command registry: research/plans-command-registry.md (widget block UCC L375–380; presets gap G3; confirmation classes FinalGUISpec §10.1).
- Visual-review evidence for P9–P13: verification/visual-review-ledger.json + verification/visual-review-{u7-board,u8-canvas,u9-deck}.json.
- P14 is RETRACTED (freeform engine removed per user direction); its former evidence (verification/u8-canvas-freeform-results.json, now from the obsoleted harness verification/u8-canvas-freeform.obsolete.mjs) is retained as lineage only.
- Distinctiveness/strategy evidence for P17: verification/audit-distinctiveness.md (the "freeform is not real" callout + the named-layout-strategy recommendation) and verification/qa-design-critique-final.md §3 (U8 still distinct from U7 on the grid: 10 spans vs 4, bespoke ground, focal hero); `_shared/usage-widgets.js` + `_shared/usage-widget-renderers.js` (`PMWidgetDefs.layouts`).
- Content-fit / composition / motion evidence for P18–P21: verification/audit-widget-fit.md (the span-only tier problem), verification/qa-fit-final.md (scrolling 77%→7.8%, every widget 1.00×, 0px cut-off, chips never clip), verification/qa-final-widgets.md + qa-final-static.md + qa-u9.md (curated compositions, no overlap, cost tab leads with spend, focus morph), and verification/qa-design-critique-final.md (§2 density, §4 U9 hero, §5 focus morph).
