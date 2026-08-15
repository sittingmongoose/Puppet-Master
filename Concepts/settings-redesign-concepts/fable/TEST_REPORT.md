# TEST REPORT — fable Settings bakeoff (final cumulative pass, 2026-08-11)

Verification results for the final cumulative packet upgrade. Environment: Linux
(Ubuntu, kernel 6.17), ConceptHub `server.py` on an OS-assigned port
(`--host 127.0.0.1 --port 0 --no-browser --no-runtime-state`), headless Firefox driven over the
WebDriver protocol via geckodriver with a fresh isolated per-session profile. All temporary
profiles and outputs lived outside the repo and were removed; nothing test-generated ships in this
folder. The prior pass's report (2026-08-05, macOS) is superseded by this one; its conclusions that
remain true are re-verified below rather than carried forward on trust.

## 1. Static gates

| Gate | Result |
|---|---|
| `node --check` on all 12 JS files (4 concepts + 8 shared) | pass |
| `python3 -m json.tool` on concept-hub.json + all 20 per-concept register JSONs + IMPACT_REGISTER.json | pass |
| Emoji codepoint grep across all js/css/html | 0 hits |
| `border-left` grep across all CSS | 0 hits (structural dividers use logical `border-inline-start`) |
| "playwright" grep across every file in the folder | 0 hits |
| "yolo" grep across UI files | 0 hits |
| "bloom" grep across UI files | 0 hits (appears only in the registers' required retire-flag entries) |
| `python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/fable` | **Concept validation passed** (run before and after the docs pass) |

## 2. Shared-layer harness (node, no DOM)

68 assertions over `pm-demo-data.js` + `pm-demo-data-ext.js` + `pm-provider.js` + `pm-state.js`:
all 24 new collections present and shaped; the 17 provider fixtures reachable (3 Claude
installations with npm-selected/brew-shadowed, unknown-owner manual-only Ollama, Cursor CLI
official-source offer, OpenCode server, usage-unavailable-but-ready, all six free-route states,
requested/effective role, auth boundaries); resolver behavior (shadow notes, managed-externally,
no manage actions on unknown ownership); all 8 scenarios rebuild; fixture overlays apply, survive
scenario switches, and clear; deep-link parse/build round-trips; and the full trigger set at
timescale 0 (update happy path ends 1.20.1/up-to-date, failure path ends rolled-back, import
chain ends rollback-complete, sound preview yields **no** receipt, OpenPeon import blocks on
license, warcraft pack rejects on format, dest-test is masked+receipted, index rebuild reaches
ready, cleanup dry-run skips the leased worktree, permission test returns the 1/4/5→5 trace).
**All pass.**

## 3. Browser probe matrix

**187 probes, 0 failures** (`probe-runner` against the served pages; every probe a deterministic
hash URL with `instant=1`; readiness waited on the `data-pm-state="ready"` handshake). Per
concept (c1/c2/c3/c4 each):

- Ready handshake, home render, shell top+bottom bars present (hub rule).
- Search: typo query `notifcations` yields rendered results; `flux capacitor` yields zero.
- Deep link `#/setting/system.health.diagnostics-verbosity` reaches the focused row.
- Every native manager route renders its family content (8 routes on c1, 7 on c2, 11 on c3, 13
  on c4, checked against family-distinctive content).
- Provider manager renders; fixture data intact (installations/shadowing/manual-only/setup
  offer/OpenCode/free-route states).
- `install-update` ends 1.20.1/up-to-date; `install-update-fail` ends rolled-back.
- Import chain `import-preview,import-apply,import-rollback` ends rollback-complete.
- `sound-upload` + `dest-test:dest.slack` → library entry added, masked receipted lastTest,
  title-bar stack count increments.
- Fixture overlays via URL (`fx.import-conflict`, `fx.storage-pressure`) apply.
- Scenarios via URL: `first-run` and `offline` apply; **URL state does not persist** (no `pin`).
- Browser Back returns from a pushed manager route to `#/home` (real history).
- Tab moves focus off `<body>` into interactive chrome.
- All 8 themes apply via `?theme=`; reduced motion applies via `?motion=reduced`.
- Width sweep 900/1280/1700/2200/2500: no clipped text (leaf elements with hidden/clip overflow
  and no ellipsis; a11y `.pm-visually-hidden` boxes and inline elements excluded as
  non-clipping), and no pointer-blocking full-viewport overlay.

Probe-side false positives fixed during the run (not product defects): visually-hidden
accessibility spans and `display:inline` elements flagged by an over-eager scrollWidth
comparison; async settle races on first paint fixed with readiness polling.

## 3b. Supplementary gap probes (2026-08-12)

A second pass closed the verification gaps the main matrix left: **92 probes, 0 failures**, per
concept (c1/c2/c3/c4 each):

- **All 12 fixture overlays via URL** (`fx.import-conflict`, `fx.rollback-complete`,
  `fx.changed-elsewhere`, `fx.restart-required`, `fx.reconnect-required`, `fx.validation-error`,
  `fx.theme-fallback`, `fx.storage-pressure`, `fx.credit-guard`, `fx.index-failed`,
  `fx.long-text`, `fx.doom-loop-tripped`) asserted against their target state.
- **`install-select`**: selecting the shadowed Homebrew installation flips selection and
  recomputes shadowing.
- **Hub bridge round-trip in `?hub=1` mode**: a posted `pm-concept-state` message applies theme
  `retro-light`, reduced motion, and `--hub-test-width: 1100px`; top and bottom bars stay
  present.
- **Scrollspy**: a mid-document scroll of the top-most workspace scroller moves the active
  subcategory indicator and refines the hash sub-route via replaceState (e.g.
  `#/dest/system/cleanup`). Two subtleties verified as correct behavior, not defects: c3 only
  writes routes from the *top* sheet layer (lower layers are inert), and bottom-of-document
  sections without a subcategory (diagnostics, manager links) intentionally write no sub-route.
- **Back AND Forward** across pushed routes restore the expected hashes.
- **Shell-state sweeps**: clip scans clean with the rail collapsed and with the Assistant panel
  open, at 900 and 1280.
- **Deep-surface sweeps**: clip scans clean on the provider manager (the deepest shared surface)
  at 900 and 2500.

Combined browser total: **279 probes, 0 failures.**

## 3c. Exhaustive theme and cross-product pass (2026-08-12)

A third pass replaced the sampled coverage with an exhaustive one: **2,400 checks, 0 failures**
on the final run.

**Screenshot-level theme verification** (per concept, Home at 1280×950, 32 screenshots decoded
and analyzed pixel-by-pixel):

- **Dark/light truth**: mean luminance correct for all 32 concept×theme screenshots (every
  `-dark` theme measurably dark, every `-light` measurably light).
- **Themes genuinely differ**: every one of the 28 theme pairs per concept diverges in ≥8.3% of
  sampled pixels (minimum: retro-light vs basic-light) — no theme silently falls back to
  another's rendering.
- **Contrast**: ~140 visible leaf text elements sampled per concept×theme (WCAG relative
  luminance of computed foreground vs alpha-composited effective background); all 32 combinations
  pass the ≥2.0 floor with zero failing elements.
- **Layout stability across themes**: title bar, status bar, stage, and rail geometry identical
  within 8px across all 8 themes per concept — restyling never reflows the chrome.
- **Single-blur rule**: at most one `backdrop-filter` layer on every concept×theme combination.

**Exhaustive width × shell-state × surface sweep** (2,016 scans): every native surface — 15
routes on c1, 11 on c2, 14 on c3, 16 on c4 (Home, two workspace categories, and every native
manager) — swept at 900/1280/1700/2200/2500 × four shell states (rail open/collapsed ×
Assistant closed/open) with clip and overlay scans, plus all 8 themes per surface at both 1280
and 900. Theme sweeps at width use the per-theme fonts, so font-metric clipping differences
(Retro's display faces, etc.) are covered.

**Defects found by this pass and fixed** (the reason it was worth running):

1. **glass-light "Recommended" status word at 1.84:1 contrast** — the raw accent color on light
   glass surfaces. Fixed in `_shared/pm-shell.css` with a glass-light-scoped override mixing the
   accent 55% toward the text color; re-verified at ≥2.0 with zero contrast failures.
2. **c3 sheet titles clipped in the squeezed state** (900px shell with the Assistant panel open
   — narrower than `is-narrow`'s shell-width trigger, so the title kept its full display size
   inside a ~300px sheet). Fixed with `overflow-wrap: anywhere` inside the existing two-line
   clamp in `c3-focus-stack.css`; all 13 previously failing route×state combinations re-verified
   clean, and the full matrix re-run confirms no regression anywhere.

Screenshots and machine-readable results stayed in the session scratchpad (the validator's
no-test-artifacts rule); this report is the durable record.

## 4. Per-concept build verification (by the concept passes)

- **c1 Atlas**: 68-assertion jsdom functional smoke — boot, rulebook + last-match-wins trace +
  reorder re-evaluation, ELI5/Expert toggle, FileSafe no-bypass, doom-loop fixture, installation
  cards (shadowed/manual-only/update happy+fail/offer/OpenCode), free-route states + freshness,
  requested/effective, all 10 appendices, stub links, first-run/offline honesty. All pass.
- **c2 Mission Control**: static verification + manual review (two runtime issues found and
  fixed: Teacher overlay surviving its own navigation; add-form focus). The browser probe matrix
  above supplies its functional coverage.
- **c3 Focus Stack**: static verification + reference sweep; probe matrix supplies functional
  coverage (all 11 native manager routes + fixtures pass).
- **c4 Ledger**: 98-check DOM-shim smoke — all 13 manager renders + inspectors, import chain,
  backup/test-restore/index/cleanup, update happy+fail, router kinds, receipt anchors,
  first-run/offline, four fixture overlays. All pass.

## 5. Known limitations

- Theme verification is now screenshot-level (§3c: luminance, pairwise pixel divergence,
  contrast sampling, layout stability, blur-layer count) but has no golden-image baseline to
  diff against — aesthetic judgment ("does retro *look* right") remains human. The contrast
  floor is a pragmatic 2.0 for all visible text including muted/secondary; a formal WCAG-AA
  (4.5:1 body text) audit is a production task, not a bakeoff gate.
- The width × shell-state × surface cross-product is now swept exhaustively (§3c); the theme
  axis crosses surfaces at 1280 and 900 rather than all five widths (theme changes typography,
  not layout systems, and the five-width sweep runs in the default theme).
- Keyboard verification is a focus-advance smoke, not a full screen-reader pass (same limitation
  as the prior pass).
- Sound playback, OS notifications, real OAuth/installs, TOML parsing, and tray integration are
  simulations by design (see FINDINGS §4); phases and receipts are the verified artifact.
- The hub postMessage bridge was round-tripped in-page (theme, reduced motion, test width);
  width sweeps otherwise drove window size, which exercises the same ResizeObserver path.

## 6. Reproduction

```bash
python3 Concepts/ConceptHub/server.py --host 127.0.0.1 --port 0 --no-browser --no-runtime-state
python3 Concepts/ConceptHub/validate.py Concepts/settings-redesign-concepts/fable
```

Then open any probe URL from README's deterministic-fixtures cookbook; pages stamp
`data-pm-state="ready"` when the link is fully applied.

## 3d. Dependency-correction pass (2026-08-13)

The correction packet `PM_Settings_Dependency_and_Work_Correction_2026-08-13` supplied the
full-thread performance decision register that the original archive omitted. The work was
re-inspected against it; four genuine shortcomings were found, corrected, and proven (full detail
and the honest opened-references ledger live in `reference-review-report.json`):

1. **Fabricated index-rebuild percentages** (register §11/§16.6) — scanning is now honestly
   indeterminate; indexing emits measured file counts (6,470 of 14,382); c4 renders counts with
   real-valued progressbar aria and never a bare percentage.
2. **c3 whole-stack re-rendering** (§7.3) — covered layers now mark stale and re-render once on
   reveal instead of rebuilding on every provider/catalog event.
3. **Startup-scan copy** (§13) — the skills-discovery description no longer claims a startup scan.
4. **ObservableWork field gap** (§11) — op events now carry progressKind, source
   (measured|derived|unknown), completed/total only with a real denominator, and waitReason
   (`waiting_resource` on rate-limited test sends); c4's credits meter aria exposes real units.

Evidence from this pass:

| Suite | Result |
|---|---|
| Node harness (76 checks, incl. 7 new correction assertions) | all pass |
| Correction probes: c1–c4 lazy-hydration DOM evidence (deep manager content absent on Home, materializes on open) | all pass |
| Correction probes: c3 stale-on-reveal (covered-layer DOM marker survives data events; gone after pop) | pass |
| Correction probes: c4 measured index progress (ends ready/14,382; no bare percent in copy; mid-flight progressbar aria-valuemax 14382 with "measured" valuetext) | pass |
| Full 187-probe functional regression | 0 failures |
| ConceptHub validator | passed |

Reviewed with evidence, no change needed: RuntimeResourceGovernor sole ownership; provider-CLI
policy (adjudication sha-identical to the copy read in the build pass); humanized installation
identity (all raw-identity render sites are advanced-scoped); subscription discipline (all 28
store.on calls are boot-scope; pm-spell is element-scoped); animation clocks (only the
active-refresh shimmer, torn down by the completion re-render); the §18 Basic-Dark factory
default (PMConcept7-scoped); the SQLite prohibition (zero occurrences).
