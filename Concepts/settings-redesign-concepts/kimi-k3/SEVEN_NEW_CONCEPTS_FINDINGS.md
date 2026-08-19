# Seven New Concepts — Findings (kimi-k3)

Date: 2026-08-19. Companion to `SEVEN_NEW_CONCEPTS_TEST_REPORT.md`. No winner selected; this file records findings, decisions, and known limitations only.

## What was built

Seven complete, self-contained Settings systems, each with its own Home, universal search, navigation geometry, manager compositions, motion metaphor, and narrow-width model:

- `concept-05-directory-take-1` — spatial two-column directory; card-to-workspace expansion.
- `concept-06-directory-take-2` — editorial list-led Home; narrow stable domain rail; restrained detail sheets.
- `concept-07-compendium-workspace` — first-class faceted All Settings compendium (828 rows, virtualized) + domain overviews; copy preview with detailed diff pane.
- `concept-08-directory-take-3` — spacious large-card directory; provider status cards with explicit quick actions; full-width stepped copy.
- `concept-09-tome-tabs` — persistent edge chapter tabs + layered page stack (rethemed; no steampunk/parchment).
- `concept-10-command-suite` — keyboard-first command index + multi-pane drill-down (rethemed; no terminal/CRT styling).
- `concept-11-tabbed-organizer` — top domain tabs with layered sheets and per-tab state preservation (rethemed; no paper/binder).

Shared layer (new, additive — `shared/v2/`): inventory projection (828 real records), manager/domain registry, project store + ObservableWork simulator, immutable-ID search index, copy transaction engine, demo rosters, candidate command/wiring/DRY helpers, PM popup-menu + custom-scrollbar/calm-highlight standards. Headless only: every visible surface is concept-native. `shared/lib/pm-views.js` (the 01–04 shared visible renderer) is not used by any new concept.

## Findings from verification (all resolved and re-verified in-browser)

Severity-at-discovery is noted; current state is **resolved** for every item.

1. **Critical** — 09 result-row clicks inert (delegation read `data-arg`; rows carry `data-result-id`). Resolved; 14/14 exact landings.
2. **Critical** — 09/10 CopyEngine constructed without `new`; copy flow unreachable. Resolved; full transaction + rollback verified.
3. **Critical** — 11 copy wizard painted before element refs were assigned (TypeError; wizard unreachable). Resolved.
4. **Critical** — 11 rendered literal `[object Object]` in 17 setting inputs (whole setting object passed as the control's base value). Resolved; all inputs truthful.
5. **Major** — 06/07/08/09/10/11 never called `PMShell.init()` (shell theme/width/motion controls inert). Resolved everywhere.
6. **Major** — shared `.pm-drawer{display:flex}` overrode `[hidden]`, leaving demo drawers visible. Resolved per concept with a local `[hidden]` guard (shared CSS untouched to protect 01–04).
7. **Major** — 07 deferred-owner shells rendered "Unknown area." (route key mismatch); exact-search rows hidden behind subgroup row caps; narrow nav overlaying Home on load. Resolved; 48/48 routes pass.
8. **Major** — 08 desktop card grid crammed at 1280 (frame-keyed breakpoints misfired when shell panels squeezed the stage); re-keyed to the pane's real width; title/subtitle run-together fixed; stale cross-session search prefill removed.
9. **Major** — 09 attention rows clipped mid-word; duplicated Overview tab; roster label/count collisions; breadcrumb truncation. Resolved.
10. **Major** — 10 multi-pane drill-down never engaged above 1 pane. Resolved; 2/3-pane layouts engage at ≥940/≥1560 concept width with keyboard pane movement.
11. **Minor** — 05 one-arg `addEventListener` in copy view; 06/08/10/11 malformed SVG attribute (`x="4 4"`); accent-bar on the critical banner (packet bans colored left accent bars on Home) overridden per concept; 11 missing Home attention list/banner and raw auth tokens in provider subtitles; 08 "Review 11 categorys" pluralization/stale count. All resolved.

## Cross-concept routing scan

Packet validator + browser crawl: no 05–11 page references concept-01..04; no iframes; every manager route stays inside its own concept shell with Back/breadcrumb/search/project context. `shared_grammar` appears nowhere; every required family is `demonstrated` per concept (42 required strings named verbatim in each `manager-coverage.json`; 9 named-owner shells `deferred_named_owner` with insertion point, owner, and return contract).

## Second-pass independent audit (2026-08-19, post-completion)

A fresh audit re-verified the packet validator, ConceptHub validation, per-concept evidence (101/101 search cases, 336/336 manager routes all recorded pass), git-based regression (01–04 HTML last touched in b972435a60 on 2026-08-12; `shared/lib`, `shared/css`, `shared/data`, `concepts/` last touched in 880bbd942a on 2026-08-15 — both before this work; working tree clean for those paths), and live browser behavior on all seven concepts plus the gallery and 01–04. It found and fixed two residue items, both re-verified in-browser:

12. **Major (shell-level, inherited from the shared demo shell)** — at 760/900px page widths the `.pmx-topbar` content (~962px) exceeded the frame and the demo control cluster (Scenarios, theme select, motion, panel toggles) clipped. Pre-existing in the frozen shared shell (identical markup in 01–04; `pm-shell.css` unchanged since 2026-08-15), so the fix is concept-local: each concept-NN.css now wraps `.pmx-topbar` to two rows and hides the decorative `.pmx-model` chips under `@container pmx (max-width: 990px)`. Browser-verified at exactly 760px and 900px on all seven concepts: no horizontal overflow, all six shell controls inside the frame rect, theme select exposes all 8 themes and is clickable, no topbar/content overlap, zero console errors. Shared CSS untouched.
13. **Minor** — 05 Home attention rows ellipsize at narrow widths but the full text was unreachable; the row paragraph now carries a `title` with the complete text. 06's attention rows were measured and need no change (nothing truncates; rows are clickable).
14. **Minor (shell-level, user-reported)** — the shell top bar's four demo toggles (reduced motion, side/chat/bottom panels) rendered as blank boxes: their bare inline SVGs have no intrinsic size and no rule in the shared CSS sizes them (the sibling Scenarios icon carries an inline 14px style, which is why it rendered). Pre-existing in the frozen 01–04 shell markup too, so fixed concept-locally: each concept-NN.css now sizes `.pmx-controls [data-shell-motion] > svg, .pmx-controls [data-shell-toggle] > svg` at 14×14. Browser-verified on all seven concepts: rule live in CSSOM, all four icons 14×14, Scenarios icon unchanged, toggle buttons still function, zero console errors. 01–04 intentionally untouched (frozen). The same rule (plus the narrow top-bar wrap) was also added to the gallery's inline `<style>` in `index.html` (the model index is not a frozen concept), and headless-Chrome screenshots of the gallery and concepts 08/09 confirm the icons now render.

Housekeeping: removed `harvest.json`, an unreferenced scratch search-dump committed by the mid-work sweep — "no temp artifacts ship in the model folder" is now literally true.

## Known limitations (current, truthful)

1. `Concepts/ConceptHub/server.py` is Unix-only (`os.getuid()`); Hub code is out of edit scope, so browser verification used a static server on an OS-assigned port serving the identical pages. ConceptHub's structural validator passes. Recorded for the Hub owner.
2. 08's lifecycle "help" result lands on the manager default subpage with locate fallback (no help subpage exists in the demo registry).
3. Deferred owner shells intentionally show insertion points only — no fabricated backend state.
4. Demo data is deterministic simulation; receipts/restore points are honest simulations (labeled as such).

## Regression status

Concepts 01–04, `shared/lib`, `shared/css`, `shared/data`: **57/57 files byte-identical** to the pre-work md5 baseline. PMConcept7, Plans, inventory/schema, canonical Command/Wiring/DRY registries, Usage, Assistant Chat, ConceptHub, and other model folders: untouched.
