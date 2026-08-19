# Seven New Concepts — Test Report (2026-08-18 pass, Qwen 5.8)

Generated: 2026-08-18. Harness: `harness.py` (Playwright pip Chromium, headless) against the real ConceptHub server (`hubrun.py` shim for Windows `os.getuid`, `--port 0` OS-assigned, `--no-browser --no-runtime-state`), isolated browser context. All temp artifacts in `%TEMP%\pm-qwen58-seven\` (deleted at cleanup).

**Combined: 256 automated checks — 256 PASS, 0 FAIL. Zero page errors on all seven new concepts and all four originals.**

## Layers (packet 10_TESTING_EVIDENCE_AND_ACCEPTANCE.md)

1. Static/code checks — `tools/validate_seven_new_concepts.py`: PASS after this report lands (prior interim runs showed only missing reports; all 7 stems × 9 evidence files, hub entries, model label, no iframe, no cross-concept refs, no `shared_grammar`, no `missing`, all 42 required manager names per concept verified).
2. ConceptHub validation — `python Concepts/ConceptHub/validate.py "…\Qwen 5.8"`: "Concept validation passed".
3. Interaction smoke — per concept: load+home, model label `Qwen 5.8`, category deep link renders rows, copy view present, scenarios apply.
4. Search-route exactness — per concept: grouped results with immutable rids; duplicate labels ("Rate Limits" ×2, "Context Window" setting vs model) route by distinct rid; click routes by rid with `.pm2-locate` highlight; Back restores query + dropdown; typo/fuzzy returns results.
5. Manager-route isolation — per concept: all 42 families reachable at `#/mgr/<id>` (waited for lazy hydration), each with breadcrumb + Back; no iframe; no `concept-0[1-4]` hrefs/srcs.
6. State/persistence — copy preview/apply/rollback engine round-trip per concept; 18 deterministic scenarios apply without errors; reduced-motion preserves Home; localStorage persistence via PMState2 (per-concept keys).
7. Responsive/theme matrix — per concept × 8 themes (accent token resolves) × widths 760/900/1280/1700/2200/2500: no horizontal overflow; status-bar chips unoccluded (verified by elementFromPoint on 07/08 after fixes); squeezed push navigation.
8. Performance/hydration — compendium vlist present with `data-window` total ≥ 828 real rows and bounded DOM (<120 nodes); synthetic +2000 toggle labeled synthetic; lazy manager hydration observed (skeleton→content, waited in harness).
9. Independent visual audit — two read-only subagent audits (screenshots at 760/1280/2200): audit1 (05/07/09/11) and audit2 (06/08/10); all medium/critical findings fixed and re-verified (07 nav occlusion, 08 status-bar occlusion + search dominance, 10 blank-760 + truncation + wide desert, 09 wide balance/labels/h1, 11 wide margins/redundant search/rail labels); retheme prohibitions verified for 09/10/11; differentiation verdict: structurally distinct across all seven.
10. Original-concept regression — 01–04 load with zero page errors (harness); shared pre-existing `_shared/*` files untouched (only additive `pm-*2` modules; pm-managers2.css loaded exclusively by 05–11).

## Per-concept check counts (36 each) + regression (4)

| Concept | Checks | Fail |
|---|---|---|
| concept-05-directory-take-1 | 36 | 0 |
| concept-06-directory-take-2 | 36 | 0 |
| concept-07-compendium-workspace | 36 | 0 |
| concept-08-directory-take-3 | 36 | 0 |
| concept-09-tome-tabs | 36 | 0 |
| concept-10-command-suite | 36 | 0 |
| concept-11-tabbed-organizer | 36 | 0 |
| regression 01–04 | 4 | 0 |

## Fixes made during testing (all verified)

- 05: sec-only destination locate fallback (applyLocate) — highlight now lands on section/manager container.
- 06: bindSearch null-guard for `#/copy` (no search node) — 18 scenarios × all routes zero errors.
- 07: bounded nav scrollport (status bar unoccluded) + wrapped domain labels.
- 08: bounded `#d3-view` scrollport (no status-bar paint-over at 760/1280/2200), dominant home search (flex 1 1 420px), synthetic-click fallback + locate fallback chain.
- 09: synthetic-click fallback on result rows (mousedown preserved for real pointers); wide-balance/labels/h1 fixes.
- 10: explicit width/height on content chain (760 renders), wrapped index descriptions, balanced wide grid + bounded right column.
- 11: ultrawide card growth + recent-changes aside, single home search, labeled edge rail.
- Shared (05–11 only): pm-managers2.css narrow single-column `.pm-main` + tray clearance padding.

## Known limitations

- Prototypes: ObservableWork/ResourceGovernor/BinaryLocator are truthful simulations; candidate IDs provisional.
- Harness uses synthetic `.click()` (detail 0) for result rows; real-pointer path uses mousedown (both covered).
- Synthetic stress rows labeled synthetic; real inventory = 828 rows only.

## Post-fix final sweep (2026-08-18, after all fixes and index polish)

Independent read-only sweep of all seven concepts (home at 1280/760/2200 + `#/mgr/providers` + `#/all` at 1280, friendly-dark): **all seven PASS, zero medium-or-higher issues, zero low notes** — status bar unoccluded everywhere, tray clear of content, no clipping/overflow, home contract intact. `ConceptHub validate.py` re-run after index polish: passed.

## Packet completeness sweep (independent read-only cross-check, closed 2026-08-18)

A separate read-only subagent walked all 12 packet files + machine-readable contracts against the repo: verdict PASS with 7 narrow residuals, all subsequently closed and re-verified: runtime-demand → setup deep-link + continuation validation added to 05/08/09/10/11 (receipt names originating operation, token, resume-only-if-current, truthful stale note); 08 deferred names realigned to packet canon; 06 search matrix gained explicit grouped_results case; cumulative register count corrected (05: 42); slint_port_impacts notes filled (05/07/09/10); 07 copy-step glyph replaced with SVG; 10 scroll persistence added; 05/08 All Settings gained record-kind + attention facets. A latent 08 crash (no-preferred-account fixture) found during this work was guarded.

Final state evidence: harness 256/256 PASS (zero page errors, 7 concepts + 4 regression); `validate_seven_new_concepts.py` status=pass; `ConceptHub validate.py` passed; residual probes 93/93 + regression probes 56/56 (ResidualFix). Temp artifacts in `%TEMP%\pm-qwen58-seven\` deleted after final runs.
