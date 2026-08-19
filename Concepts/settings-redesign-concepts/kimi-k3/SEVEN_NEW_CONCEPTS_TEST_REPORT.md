# Seven New Concepts — Test Report (kimi-k3)

Date: 2026-08-19. Scope: concepts 05–11 under `Concepts/settings-redesign-concepts/kimi-k3/`. Concepts 01–04 untouched (regression proof below).

## Gates

| Gate | Result |
|---|---|
| ConceptHub validation (`python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/kimi-k3`) | **PASS** |
| Packet validator (`tools/validate_seven_new_concepts.py <model folder>`) | **PASS** (0 failures) |
| Frozen regression (concepts 01–04 + `shared/lib` + `shared/css` + `shared/data`: 57 files, md5 baseline taken before any new work) | **PASS — 57/57 unchanged** |
| `node --check` on all seven `concept-NN.js` | **PASS** |

## Test matrix (per concept: 8 themes × widths 760/900/1280/1700/2200/2500)

Browser-verified via ConceptHub-served pages (static server on an OS-assigned port, isolated headless Chromium, main-world probes):

| Concept | Load errors | Matrix (48 combos) | Reduced motion | Search exactness | Manager isolation (48/concept) | Copy flow | Scenarios |
|---|---|---|---|---|---|---|---|
| 05 Directory Take 1 | 0 | 0 anomalies | pass | **17/17** | 48/48 | pass (full cycle + rollback) | pass |
| 06 Directory Take 2 | 0 | 0 anomalies | pass | **14/14** | 48/48 | pass | pass |
| 07 Compendium Workspace | 0 | 0 anomalies | pass | **14/14** | 48/48 | pass (detailed diff pane verified) | pass |
| 08 Directory Take 3 | 0 | 0 anomalies | pass | **14/14** | 48/48 | pass | pass |
| 09 Tome Tabs (rethemed) | 0 | 0 anomalies | pass | **14/14** | 48/48 | pass (numbered steps) | pass (strip + clear + re-click-off) |
| 10 Command Suite (rethemed) | 0 | 0 anomalies | pass | **14/14** | 48/48 | pass | pass |
| 11 Tabbed Organizer (rethemed) | 0 | 0 anomalies | pass | **14/14** | 48/48 | pass | pass |

Totals: **101/101 search-exactness cases** (immutable result IDs; duplicate labels, grouped results, typo "theem"→Theme, unavailable results, manager objects, deep rows, action/workflow/diagnostic/help results, Back-restores-query in every concept); **336/336 manager routes** isolated (no cross-concept routing, no iframes, shell retained).

## Inventory and scale

- Real inventory: all **828** `Plans/settings_inventory.json` records projected and routable in every concept (browse via domain→subgroup, search, and the faceted virtualized All Settings compendium). 0 unreachable records at projection time.
- Search index: 1,078 entries (828 settings + domains + managers + subpages + managed objects + actions + workflows + diagnostics + help); all resolve by immutable ID.
- Synthetic stress (separate from product data): 2,400 injected rows → 3,478-entry index; queries ≤17.2 ms; results bounded (limit 30, `bounded` flag); **0 managers instantiated during search** (headless index; lazy manager render); compendium virtualization browser-verified (windowed rendering).

## Independent visual audit

Performed (designer subagent, screenshots per concept). Differentiation confirmed by composition (not reskins): 05 two-column directory; 06 editorial list + rail; 07 faceted compendium; 08 spacious large cards; 09 edge chapter tabs; 10 command-index multi-pane; 11 top-tab organizer with per-tab state preservation. Retheme confirmed for 09/10/11 (no steampunk/parchment/paper/binder/terminal-green/CRT/monospace-body). All audit findings were fixed and re-verified in-browser (see SEVEN_NEW_CONCEPTS_FINDINGS.md).

## Deterministic states

All 18 packet-required scenario fixtures are triggerable per concept from the demo-scenario drawer (`store.scenarios()`), with truthful projections (loading-cached, empty, offline, managed, unavailable, restart/reconnect, changed-elsewhere, import-conflict, rollback-complete, provider CLI states incl. multi-installation shadowed, unknown owner, update-available, verification-failure/rollback). Provider CLI acquisition is explicit, official-source, user-triggered — never bundled or silent.

## Defects found and fixed during verification (all re-verified)

1. 05: one-arg `addEventListener` in copy view (2 sites) — fixed; copy action search case + full flow pass.
2. 06/08/10/11 HTML: malformed SVG `x="4 4"` — fixed; zero load console errors.
3. 06/07/08/09/10/11 JS: `PMShell.init()` not called at startup — fixed; shell theme/width/motion controls live.
4. All seven concept CSS: `.pm-drawer[hidden]` guard missing (shared `.pm-drawer{display:flex}` beat UA `[hidden]`) — concept-local guard appended; drawers hidden until opened.
5. 07: deferred-owner route key mismatch (`defId`/`deferredId`) — fixed; 9/9 owner shells render. Domain row-cap hid exact-search rows — reveal-on-locate fixed. Narrow nav defaulted open over Home — fixed.
6. 08: copy destination now opens the full-width copy view; manager subpage landings highlight painted content; "Review 11 categorys" pluralization/stale-count fixed; stale cross-session search prefill removed (Back-restore within session retained).
7. 09: result-row clicks inert (delegation read `data-arg` vs `data-result-id`) — fixed; CopyEngine constructed without `new` — fixed; manager subpage resolution (page||section, label/slug) — fixed; copy destination routes to the stepwise view; scenario re-click-clear + drawer state sync — fixed; attention-row clipping, duplicated Overview tab, roster label/count collision, breadcrumb truncation — fixed.
8. 10: CopyEngine `new` — fixed; manager subpage selection from search destinations — fixed; lifecycle copy destination routes to the copy pane — fixed; multi-pane engagement at ≥940/≥1560 — fixed and verified with keyboard pane movement; scenario strip with truthful projection + clear + re-click-off — fixed.
9. 11: copy wizard init order (paint before refs) — fixed, full flow verified; `[object Object]` inputs (17) — root-caused (whole setting object passed as base value) and fixed; missing Home Needs-attention list + banner — added with real routes; raw auth-model tokens → human labels; tab overflow staleness on width-only change — fixed; duplicate breadcrumb segment — fixed.

## Second-pass independent audit (2026-08-19)

An independent audit (different agent pass) re-ran the gates and browser-verified all seven concepts, the gallery, and concepts 01–04:

| Gate | Result |
|---|---|
| Packet validator re-run | **PASS** (0 failures) |
| ConceptHub validation re-run | **PASS** |
| Browser: all 7 new concepts — load, Home+search field, search exactness with Back-restore, manager isolation (URL/iframe), copy flow opens, retheme (09/10/11) | **PASS** (zero console errors everywhere) |
| Browser: gallery lists all 11 concepts; concept-09 link navigates correctly; 01–04 load/render/interact | **REGRESSION PASS** |
| 760px + 900px topbar control reachability (DOM-measured per concept) | **PASS after fix** (see below) |

Defects found by the second pass and fixed (all re-verified in-browser at exactly 760px and 900px page width):

10. All seven concept CSS: shared-shell `.pmx-topbar` content (~962px) clipped the demo control cluster at 760/900px page widths (inherited from the frozen shared shell; identical in 01–04). Fixed concept-locally (`@container pmx (max-width: 990px)` wraps the top bar, hides decorative `.pmx-model` chips); shared `pm-shell.css` untouched. Post-fix measurements per concept: scrollWidth==clientWidth (760/760, 900/900), all six shell controls inside the frame rect, theme select exposes 8 themes and is clickable, topbar wraps to 60.5px with no stage overlap, zero console errors. Standalone narrow-window pass at a 625px frame (stricter than 760) with the width select reachable.
11. 05: Home attention rows ellipsized without a way to read the full text — added a `title` with the complete text; 06 measured, no truncation, rows clickable.
12. All seven concept CSS (user-reported): shell top-bar demo toggles (reduced motion, side/chat/bottom panels) rendered blank — bare inline SVGs with no intrinsic size and no shared size rule (pre-existing shared-shell markup, identical in 01–04). Fixed concept-locally (14×14 rule on `.pmx-controls [data-shell-motion] > svg, .pmx-controls [data-shell-toggle] > svg`). Browser-verified on all seven: rule live in CSSOM, all four icons 14×14, Scenarios icon unchanged, toggles still function, zero console errors. 01–04 untouched (frozen).

Housekeeping: deleted unreferenced scratch file `harvest.json` (search-dump residue from the mid-work sweep). Per-concept `test-evidence.json` files carry an additive `audit_2026_08_19_second_pass` record.

## Known limitations

- `Concepts/ConceptHub/server.py` does not run on Windows (`os.getuid()` — Hub-side Unix assumption). Per scope rules the Hub was not edited; browser verification ran against the same pages served by a static server on an OS-assigned port, and ConceptHub's own `validate.py` (the structural gate) passes. This is a Hub platform bug, recorded for its owner.
- Visual verification used DOM assertions plus screenshot review; one environment note: the headless compositor lags one state change, so DOM measurements were treated as authoritative.
- 08's lifecycle "help" search result lands on the manager's first subpage with the locate fallback (no dedicated help subpage exists) — recorded in its search-route-matrix.
- Deferred named-owner shells are truthful insertion points only (no fabricated backend state machines), per packet.

## Temporary material

Scratch verification JSON, screenshots, and profiles live outside the repo and are deleted at completion (see final response). No temp artifacts ship in the model folder (ConceptHub `validate.py` temp-artifact scan passes).
