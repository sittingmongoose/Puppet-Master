# fable — Seven New Concepts: Test Report (packet 2026-08-18)

Pass executed 2026-08-20 → 2026-08-21. Method note: headless Chromium in this environment hangs on
all http, so browser testing ran over `file://` with a hand-rolled CDP driver
(`tools/harness/cdp.js`); ConceptHub was validated statically (`Concepts/ConceptHub/validate.py`)
and the pages implement the hub `?hub=1` postMessage bridge per the folder contract. Google Fonts
(the only external resource) were blocked in every run; pages render on fallback stacks by design.

## Test families and final results

| # | Family | Method | Result |
|---|---|---|---|
| 1 | Static / code | `node --check` on every module + concept; packet validator `tools/validate_seven_new_concepts.py` | PASS (validator: only pre-report-file findings during the pass; final run clean) |
| 2 | ConceptHub validation | `Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/fable` | PASS |
| 3 | Module contract | `tools/smoke2.js` (vm-sandboxed full 12-file stack) | 263 passed / 0 failed / 0 warnings |
| 4 | Interaction smoke | `tools/boot-check.js` per concept: 13 routes × widths 760/1280/2500 + scenario/fixture/theme runs | PASS ×7 concepts (zero console errors/warnings, no overflow, no blank routes) |
| 5 | Search-route exactness | `harness/suite-search.js`: real key-event typing, clicks by immutable `data-rid`, landing asserts (route stamp, scroll, focus, `pm2-located`), Back restores query+results; grouped/duplicate-label/typo/no-results/unavailable/workflow/deep-object cases | **147/147** (21 × 7) |
| 6 | Manager-route isolation | `harness/suite-managers.js`: all 47 manager routes per concept — concept-native surface, shell retained, breadcrumb, `data-pm2-back`, no cross-concept hrefs, no iframes, deferred shells owner-named with no fake actions | **343/343** (49 × 7) |
| 7 | State / persistence | `harness/suite-state.js`: 8 scenarios, fixture battery (import-conflict, validation-error, restart/reconnect, changed-elsewhere, rollback-complete), setValue→reload persistence, copy preview→apply→rollback with receipts, stress-bounded DOM | **119/119** (17 × 7) |
| 8 | Responsive / theme matrix | `harness/suite-matrix.js`: 7 concepts × 8 themes × 6 widths (760/900/1280/1700/2200/2500) on Home + 4 extra routes at 760/1280; console/overflow/element-clip/shell-visibility asserts + screenshot capture | **791/791** (113 × 7) |
| 9 | Performance / hydration | `harness/suite-perf.js`: zero manager view-models computed at Home (instrumented `model()` counter), search hydrates no manager, All Settings DOM bounded (<300 rows incl. stress), navigation timings < 1.5s | **63/63** (9 × 7) |
| 10 | Original-concept regression | `harness/suite-regression.js`: c1–c4 + index vs pre-pass baseline (ready stamp, innerText byte-identical, zero errors, screenshots) + git cleanliness of `_shared/` and c1–c4 (NFS CRLF-aware) | **7/7** — concepts 01–04 untouched and behaviorally identical |
| 11 | Scroll integrity | `harness/suite-scroll.js` (added after an independent audit found a defect no stills-based pass could see): resolves the *visible* scroller, derives an honest scrollHeight ceiling from painted rows, sweeps 9 offsets to the exact end asserting no blank band, requires the row window to advance, requires the last row reachable inside its own list, and drives resize/stale-window traps including height-only growth | **721/721** (103 × 7) |

**Final battery total: 2,191 / 2,191 automated checks passing** — families 5–11, all seven
concepts, one uninterrupted run after the last fix — plus families 1–4 green.

## Inventory and scale evidence

- All **828** canonical inventory ids load, resolve (`store.resolveRow`), render through browse
  (subgroup sections sum to 828 per concept), and are searchable/routable (`s:<id>` rids).
- 12 categories / 36 subgroups verified as a clean grid; category totals: general 95, ai 112,
  safety 62, code 128, memory 47, planning 98, branching 65, media 31, web 53, personas 36,
  extensions 44, system 57.
- Stress: +2,000 clearly-labeled synthetic records (`zz-stress.*`) via `?stress=1`; All Settings
  stays windowed (~15–80 live rows) and search stays bounded; real inventory never replaced.
- Search corpus: 1,214 entries across 8 result kinds; duplicate-label ("API Key" ×≥3 providers,
  "Rate Limits" ×6) disambiguated by path; typo probes (`notifcations`, `apperance`,
  `permisions`) hit; `flux capacitor` → honest no-results.

## Visual audit (full-coverage, not spot checks)

Five full-coverage sweeps were run. In every sweep **all 784 screenshots were actually viewed**
(7 concepts × 8 themes × 6 home widths + 8 extra-route cells, split across 14 independent viewers),
and every raised finding went through an adversarial refute-first verifier before any fix.

A blunt lesson from sweep 5 is worth stating up front: the automated suites were green at
1,470/1,470 while 49 real defects were live in the code, and a further 13 functional scroll defects
were invisible to all five screenshot sweeps because none of them scrolled. Green suites were never
sufficient evidence on their own.

- **Sweep 1** — 71 raised → **62 confirmed** (15 blockers, all concept-11's narrow-width
  attention-card collapse; 9 majors; 38 minors). Seven fixer agents resolved all 62; root causes
  included a `flex-basis:100%` inside a no-wrap row, a button reset out-ranking every component
  rule (fixed with `:where()`), the shared unavailable-chip line-through, per-theme font-width
  truncation, and shell page-tab overflow.
- **Sweep 2** (on regenerated shots, deeper method — verifiers decoded PNGs with hand-written
  pure-Python decoders and computed real contrast ratios) — 67 raised → **41 confirmed**
  (26 refuted). This sweep found what sweep 1's stills-only reading missed: WCAG failures in
  tokens inherited from the frozen shell, and regressions introduced by sweep 1's own fixes
  (notably that replacing hard clipping with ellipsis produced one- and two-character nav labels).
  Fixed centrally in `_shared2/pm2-tokens.css` plus a seven-agent per-concept wave.
- **Sweep 3 (sign-off)** — 20 raised → **14 confirmed**, of which 5 were already resolved by
  central token edits made after those screenshots were captured. The remaining 9 (2 majors in
  concept-10, 7 minors across 05/08/11) were fixed in a closing wave. A c08 back-restore race
  surfaced by the battery (2 of 3 runs failing) was traced to a `focusout` timer firing against a
  detached node and wiping the restored dropdown; fixed and confirmed deterministic over 8
  consecutive runs.
- **Sweep 4 (final confirmation)** — the finished code re-shot and all 784 images read again, with
  pixel-decoded contrast measurement. Six of seven concepts confirmed their last fixes visually
  (concept-08's two could not be judged from stills because the enabled primary button and toggle
  switches do not appear in the captured routes; both were measured directly by its fixer across
  all eight themes). 33 observations were raised: the genuine defects were fixed — retro-light's
  status green was still the raw phosphor `#00FF41` at 1.20:1 on cream (invisible), glass-light's
  amber sat at 3.99:1, glass-dark's muted token had no headroom, concept-11 printed raw internal
  subgroup ids in All Settings paths (a packet violation, isolated to that concept and verified
  absent from the other six by probe), and concept-10 had four layout majors whose shared root
  cause was a `.c10 button` reset out-specifying 26 of its 27 component classes. The remainder are
  recorded as residual observations in `SEVEN_NEW_CONCEPTS_FINDINGS.md` rather than silently
  dropped.
- **Sweep 5 (independent audit of the committed code)** — reviewers who had built nothing, briefed
  on exactly which changes had never been independently reviewed, read all 784 fresh screenshots:
  88 raised → **49 confirmed** (39 refuted). This is the sweep that justified the exercise. It
  caught: concept-10's `is-wide`/`is-ultra` modes being **inert** (a previous agent had reported
  measured success; Home in fact rendered identically at 1700/2200/2500 because the width watcher
  only re-rendered on `computeMode()` thresholds of 900/1150); the same `button { color: inherit }`
  specificity trap still live in concepts 05 and 06, silently defeating 14 and 8 single-class
  colour rules; raw internal subgroup ids and control-type enums in concept-11's prose; and three
  theme-ramp inversions that **this pass had itself introduced**, where a lifted `--text-muted`
  overtook `--text-secondary` (friendly-light, basic-dark) or `--text-primary` (glass-light).
  All 49 were fixed, plus the inversions and the shared value-chip strikethrough.
- **Scroll integrity (new suite, family 11)** — sweep 5 also surfaced a functional defect no
  stills pass could see: concept-09 at narrow widths reached a 46,817px `scrollHeight` with 63
  frozen rows, so scrolling showed a blank sheet. A dedicated suite was then built and
  negative-control proven (reintroducing that bug in a throwaway copy drops it to 34/41 with 8 of 9
  offsets blank). It found **13 further genuine defects across 5 concepts** in two families:
  a row window that repaints only on scroll, so growing the viewport *height* leaves 261–365px
  blank strips (05, 06, 10, and a variant in 08); and a list viewport taller than its own space, so
  the final setting is unreachable inside the list (09, 11). The subtlest was concept-08's, where a
  hard-coded 58px row height against an actual 62px made spacers disagree with painted rows,
  triggering Chrome's scroll anchoring into a self-sustaining repaint loop that walked `scrollTop`
  from 19,100 to 43,490 in 28 events. All 13 are fixed; the suite now passes 721/721.
- **Differentiation gate** (re-run on the final designs, 28 cross-concept shots): **PASS on all
  eight axes**. Weakest pair named as concept-06/concept-07 (a shared left-index geometry and
  deep-nav model) — they diverge decisively on home composition, manager composition, All Settings
  treatment, and narrow-width behavior, so no two concepts are substantially the same on multiple
  axes. Runner-up pair: concept-05/concept-08.
- **Concept-07 double-check** (its original builder lost its transcript): an independent verifier
  re-drove boot/routes, 14 manager routes, 9 rid-click landings, the full copy transaction,
  states/fixtures, ~20 evidence-claim reproductions, and 13 screenshots. Verdict: **meets the
  packet bar**; three stale evidence rows corrected; the two moderate items it raised (a `u:`
  locate regression, the missing `data-pm2-back` hook) were fixed and re-verified the same pass.

**Audit totals across the four sweeps: 3,136 screenshot readings (784 images × 4 passes), 191
findings raised, 131 adversarially confirmed, all confirmed defects fixed or explicitly recorded.**

## Defects found and fixed during the pass (selection)

- Store persistence gap (setValue never persisted; found by harness, fixed in `pm2-store.js`,
  verified by reload round-trips on a real page).
- Offline scenario left web rows 'normal' in states-driven mode (fixed in `pm2-states.js`; both
  resolution modes now agree).
- Import-conflict fixture referenced two non-inventory ids from the frozen demo data (normalized
  onto real rows in the cloned working data).
- Stale rev-2 probe id absent from real inventory (canonical probe re-anchored to
  `system.health.platform-diagnostics`; honest not-found surface for the stale id everywhere).
- Search-suite/staleness interplay and the missing `data-pm2-search-input` / `data-pm2-back`
  contract hooks (standardized in CONTRACT2, applied to all seven concepts).
- c07 `u:`/`d:` search-landing locate regression (fixed with auto-opening advanced sections).
- c08/c10 lifecycle preview sections invisible under fx.import-conflict (preview-kind renderers
  added); c10 validation-error hidden behind a closed advanced fold (auto-disclose + count).

## Known limitations

See `SEVEN_NEW_CONCEPTS_FINDINGS.md` §Known limitations (live-hub sessions impossible in this
sandbox; read-only collection editors; motion reviewed by builders rather than the stills audit;
tolerated shared view-model shape drift; c10's container-query device noted for Slint porting).

## Temporary material

All test screenshots, browser profiles, probe scripts, and suite outputs lived under the session
scratchpad or `/tmp` (outside the repository) and were deleted by their owning agents or at pass
close. The repository keeps only the concept files, evidence folders, shared modules, the
reusable `tools/` harness, and the required reports.
