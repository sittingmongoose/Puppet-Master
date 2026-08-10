# Side Panel Bakeoff

Six competing designs for seven narrow side panels, rendered across all 8 themes
and 5 widths, with a machine fit-check over every combination.

**Open `index.html` directly.** No build step, no server, no node.

---

## Why this exists

The seven panels are unreadable at their shipped width. Rendering PMConcept7 at
220px confirms the failures are **structural**, not cosmetic:

| Symptom | Mechanism |
|---|---|
| `Scopes / repo, read:user, user:email` overruns its label | `.pm6-kv` is `justify-content:space-between` with `flex:none` on the key |
| `validation_test  carg…  pass on retry` — label cut to 4 chars | kind chip and status chip are both `flex:none`; `.pm6-sp-row-meta` uses `margin-left:auto`, so the **label is the only compressible element** |
| `tastebook-postgres` wraps and orphans its status dot | no elision policy on identifiers |
| Source Control looks like overlapping boxes | accordion > card > row = three concentric borders |
| Tests and Agents are near-empty | 25 and 30 lines of markup against 33 and 7 specced commands |

The cause is the shared primitive layer, so fixing it panel-by-panel would only
move the bug. Hence a bakeoff: build the alternatives on **one** repaired
primitive layer, measure them all, and pick per panel.

---

## Layout

```
index.html              harness: control bar, stage renderer, 4 modes
_pm-tokens.css      *   root token contract + the 8 theme blocks
_pm-primitives.css  *   the whole shared side-panel primitive layer
_extracted.css      *   theme-aware supporting rules, pulled by selector
_pm-shell.css           hand-authored: stage, shell chrome, neutralizers, fixes
_pm-components.css      pm-select / pm-menu / pm-context-menu / pm-tooltip / pm-sheet
_pm-kit.css             shared primitives: row, kv, meta run, status mark, lens strip
_pm-portal.js           portal, placement, dismissal, sprout motion, a11y
_pm-components.js       the five components
_pm-kit.js              PMK.* - the markup helpers every version composes from
_pm-fitcheck.js         measurement kernel (shared by both runners)
_pm-data.js             shared fixtures - every version renders from these
_pm-shell.js            registry, stage renderer, control bar, resizer, picks
versions/v0-baseline.js *   today's markup, verbatim (the control)
versions/vA..vF.js          the six design systems
research/*.md               per-panel feature briefs, cited to Plans line ranges
tools/extract_shell.py      regenerates the three * CSS files
tools/extract_baseline.py   regenerates v0-baseline.js
tools/fitcheck_headless.mjs Playwright runner (optional; the in-page button
                            needs no dependencies)
```

`*` = **generated. Do not hand-edit.** Re-run the extractor and diff.

---

## Why one page instead of six files

Every theme selector in this codebase is a bare attribute selector
(`[data-theme="retro-dark"] { ... }`), never `html[data-theme]` or
`:root[data-theme]` — verified: **zero root-anchored selectors across 1,055
sites**. So `data-theme` on a plain `<div>` themes that subtree verbatim, and an
8-theme contact sheet is just eight sibling divs in one document.

That single fact removes iframes, `postMessage`, and the `file://` CORS problem
entirely, and it is what lets the fit checker walk every combination with full
DOM access. Six standalone HTML files would need iframes, and
`iframe.contentDocument` is blocked under `file://` — which would kill both the
checker and the contact sheet. `<script src>` has no such restriction, so the
versions live in `versions/*.js`.

---

## vG Cozy Shelves - the picked design

Added after the bake-off, when the design chosen was one of the *other* platform's
concepts (`Concepts/rail-concepts/c2-cozy-shelves.html`). It is ported here rather than
edited in place: that folder belongs to another agent, and this harness is where the
production fixture and the fit checker make "fixed" mean something measurable.

Additive by construction - `_pm-cozy.css` and `_pm-cozy.js` are new files. `_pm-kit.*`
was not touched, because the other fifteen designs are verified at zero R-tier and a
sixteenth is not worth risking them for.

**Eight panels.** File Manager is the eighth, and new. Only vG and the v0 control claim
it (`covers: ALL8` in the gallery); the rest would render "NOT BUILT" cards, which is
noise rather than comparison.

### What the port changed, and why

| fix | reason |
|---|---|
| Five-token type ladder scaled by `--cz-scale` | the source hardcoded ten font sizes across 41 rules, so a text-size setting had nothing to scale |
| Tab labels off the display font | retro rendered them as Orbitron at 8px, which cost Docker 60px of width |
| `--cz-cat` from state, never `--accent-primary` | in retro-dark `--accent-primary` *is* `--accent-lime`, so a lime category chip was indistinguishable from "selected" |
| Count-aware tab thresholds, Docker cut to 4 tabs | six tabs do not fit 280px by any technique - a design fix, not a threshold tweak |
| `CZ.elide` with per-kind rules | no middle-elide helper existed anywhere in the project; several bugs traced to its absence |
| Flat tree, indent capped at depth 6, 72px name floor | the source nested DOM at 22px/level with no floor, so the filename hit 0px and vanished at depth 6 (220px) |
| Colour earned per row, not inherited | one conflicted file rolled the shelf up to `err` and 400 clean files wore a red spine |

### Measured

Two agreeing runs, 256 combinations (8 panels x 8 themes x 4 widths), fonts asserted
loaded, transitions disabled:

    R-tier 0        all eight panels, all eight themes
    W1 1816         ellipsis firing - the report of WHERE text elides, not a failure
    W2 3066         contrast, basic-* only - the pre-existing --text-muted value

File tree at 220px, 413 rows to depth 9: **zero zero-width names, zero truncated**
(122 rows pre-elided by `CZ.elide`, extensions preserved). Roving tabindex: 1 of 413
focusable, not a 413-stop tab trap.

vA-vF unchanged at zero. v0 still fails, as the control must.

### Known cost

vG renders 320-455KB of HTML per panel because inactive tab panes are materialised
rather than swapped. It is the heaviest design in the set and it is what wedged the
in-page `runMatrix`; the sweep above runs the checker directly, per combination. In
Slint the panes would swap, so this is a prototype artifact - but it is worth fixing
before anyone measures performance here.

---

## Two surfaces: the gallery and the instrument

`gallery.html` is the **presentation** surface. `index.html` is the
**instrument**. They answer different questions and look deliberately unalike.

    python3 tools/serve.py 47966      then open /gallery.html

**Gallery.** Every design live at once, themed like the product. Two axes,
because those are the two questions worth asking:

| | |
|---|---|
| **By panel** | one panel, every design of it - *"which Docker do I want?"* |
| **By design** | one design, every panel it covers - *"does this idea hold up beyond the panel it was invented for?"* |

Each card is a live stage, not a screenshot: change the theme or drag the width
and all of them re-render together, so a comparison is never between one design
as it is now and another as it was when someone captured it. The gallery chrome
is themed by the same tokens as the designs, so the page you judge FROM is not
a different visual language to the thing being judged.

Cards are iframes onto `index.html` in solo mode. Served over http:// they are
same-origin, so the gallery calls `contentWindow.PM_BAKEOFF.setState()` on them
directly - no message protocol, and no changes to the harness. The gallery is
purely additive: delete `gallery.html` and the bakeoff is byte-identical.

**It must be served, not opened from disk.** `file://` gives every document an
opaque origin and blocks the frame access this depends on. The page detects
that and says so rather than showing dead cards.

Each frame lays out at a real 1240x780 and is scaled with
`transform-origin: top left`, so a card shows the app at true desktop
proportions - the panel occupies its real fraction of the shell rather than a
phone-sized fiction.

**Inside a prototype** there is a simplified Home behind the panel (metric
cards driven from the fixtures, an editor ghost, page tabs), and the activity
bar navigates: clicking a rail icon switches panel, by mouse or keyboard. Both
matter for judging - several of these are *navigation* designs, and against a
dashed "not under test" box you can see neither how the rail reads beside real
content nor how its navigation actually feels.

---

## Modes

| Mode | What it shows |
|---|---|
| **Single** | one stage, real drag resizer |
| **Compare** | two versions side by side |
| **Contact** | one version and panel at one width across **all 8 themes** — the mode that makes cross-theme spacing breakage visible without reading a report |
| **Matrix** | the fit-check grid; **click any cell** to jump the live stage to that combination with the offenders outlined |

Deep link: `index.html#v=C&panel=docker&theme=retro-dark&w=240&mode=solo`.

Width presets follow `FinalGUISpec.md:2081` §12.2 — 240 essential / 320 compact /
380 standard / 480 full. **220 is adversarial**: it is what the app clamps to
today, *below* the 240px spec floor. It is selectable so regressions stay
visible, and excluded from the matrix.

---

## Fit checker

Nine rules. **R**-tier fails, **W**-tier is surfaced for a human to accept and
log here. Suppress per element with `data-fit-allow="R2,R3"` — every suppression
is printed in the report, so none can hide.

| | Rule |
|---|---|
| R1 | clipped overflow — `scrollWidth > clientWidth` where `overflow-x` is visible/hidden |
| R2 | escapes its reference box (skips `[data-pm-portal]` — portals are *supposed* to escape) |
| R3 | truncates with **no** `text-overflow: ellipsis` |
| W1 | ellipsis firing — not a bug, but it answers *which labels get cut in which theme*. Splitting this from R3 is the primary false-positive control |
| R4 | hit target under 23.5px (`FinalGUISpec.md:2144` §13.5) |
| R5 | horizontal scrollbar in the panel |
| R6 | sibling overlap, scoped to known containers |
| R7 | collapsed box — has text, renders 0×0 (flex crush) |
| W2 | contrast < 4.5:1, gated to `basic-*` where §13.1 mandates AA |
| R8 | cross-theme height blowup — `max/min scrollHeight` across the 8 themes > 1.6 |

### Determinism preconditions

Web fonts load **lazily**: a face is not "available" until something renders
with it, so `document.fonts.ready` alone reports success while Orbitron and
Rajdhani are still unfetched. The checker force-loads all six faces, then
**asserts** each one, and aborts the whole sweep with a single `FONTS_MISSING`
result rather than emitting thousands of findings measured against fallback
metrics. It also kills animation and transition for the sweep (`.side-panel-slot`
carries `transition: width 0.3s`) and forces layout between combinations.

### Baseline self-validation

`v0-baseline` registers with `fixes:false`, so it keeps the real defects.
**The checker must report R4 failures on v0 in all 8 themes.** That is not a
harness bug — it is how the checker earns trust before anyone believes its
verdict on a redesign. It does: 2,480 R4 findings on v0, and **zero on any
redesign**, because the kit puts a 24px floor on every interactive class.

### Results - 3,584 combinations (16 versions x 7 panels x 8 themes x 4 widths)

Measured at production data volume, stable across consecutive runs. Variants
implement one panel each, so `W1 rate` (ellipsis findings per combination) is
the fair cross-comparison.

**Every redesign is at zero R-tier.** The baseline still reports 2,576, so the
checker's self-validation continues to hold: it detects the known-true defect
and finds nothing comparable in the redesigns.

| | R-tier | W1 rate | |
|---|---:|---:|---|
| xD1 Triage Board · xD3 Command Line | 0 | 0.00 | Docker variants |
| xS1 Commit Desk · xS2 Lane Board | 0 | 0.00 | Source variants |
| xA2 · xA3 | 0 | 0.00 | Artifacts variants |
| **vC Lens Deck** | 0 | 0.01 | full system |
| **vD Drill Stack** | 0 | 0.07 | full system |
| **vF Stream** | 0 | 0.19 | full system |
| **vB Gutter & Sheet** | 0 | 0.29 | full system |
| xS3 Review Queue · xA1 | 0 | 0.75 | variants |
| xD2 Column Ledger | 0 | 0.94 | dense table, trades legibility for density |
| **vA Ledger** | 0 | 1.89 | full system |
| **vE Cockpit** | 0 | 2.81 | full system |
| v0 baseline | **2576** | 1.34 | the control, keeps its real defects |

W1 is *intentional* ellipsis, not a defect - but the rate is still the most
decision-relevant number here, because it says how often a design has to cut a
label to fit. Six versions never cut one. vA and vE cut often enough that it is
a design characteristic worth seeing before choosing them.

### Content volume is the test

The fixtures in `_pm-data.js` are deliberately at production volume - 24
containers, 38 artifacts across 19 kinds, 24 workflow runs, 16 changed files, 8
worktrees, 14 search files, 48 matches. That is not decoration. A design that
survives 5 rows tells you nothing about one that must survive 40, and the
shipped panel's readability problem is a *volume* problem.

The first fixture set was thin (5 containers, 8 artifacts, 4 runs) and it hid
the difference between the designs almost completely. Same code, same rules,
only the content grew:

| | W-tier, thin data | W-tier, real volume |
|---|---:|---:|
| vA Ledger | 1347 | **3932** |
| vE Cockpit | 1069 | **2708** |
| vB Gutter & Sheet | 1060 | **2462** |
| vC Lens Deck | 634 | 320 |
| vD Drill Stack | 310 | 192 |
| vF Stream | 32 | 34 |

Three designs degrade sharply under load and three barely move. That separation
was invisible at low volume, and it is the single most decision-relevant number
in this report.

Volume also exposed a latent crash the thin set hid: a run whose status was
`blocked` but which carried no `blocked` block threw in **five of six versions**,
each dereferencing `r.blocked.code` guarded only by status. Fixtures should keep
including rows that are legal-but-awkward for exactly this reason.

### One finding worth carrying into the decision

**Bucket 3 (480px) is the tightest bucket in the ladder, not the roomiest.**
Measured against the shipped fixtures: gutter 21 + chip 78 + time 44 + two
inline actions 60 + reserved overflow 24 + padding 16 = **243px of a 480px band
consumed before one character of identity is drawn**. Any design whose wide
behaviour is "put everything on one line" is therefore promising something the
arithmetic will not pay out - segments still drop into the `+N` escape. This is
why vA's one-line fold at 480px is worth scrutinising when comparing versions,
and it applies to any system that treats extra width as free.

### Four false-positive classes found while validating the checker

Each was found by disbelieving a suspiciously large number, and each is worth
knowing if you extend the rules:

1. An element whose **ancestor** is `display:none` keeps its computed display
   but has no client rects — every child of a hidden subview reported as a 0x0
   collapsed box at x=0. **2,592 phantom R7.** Fixed with a
   `getClientRects().length` guard.
2. Panel headers and fixed strips are **siblings** of the scroller, so measuring
   them against its padding box reported every header as escaping by exactly
   8px. **1,312 phantom R2.** Each node now resolves its own reference box.
3. **SVG internals** (`circle`, `path`, `polyline`) are not CSS layout boxes;
   their bbox routinely exceeds the parent `<svg>` viewBox. **~1,400 phantom
   R2.** Only the `<svg>` root is measured now.
4. R1 and W1 both fired on every element with `text-overflow: ellipsis`, so R1
   was calling **intentional** truncation a defect. R1 now skips ellipsis hosts.

And three genuine bugs the checker caught in the harness itself:

- The scroller selector missed `.pmk-body`, so **R5 and R8 silently skipped
  every kit-based version** — the two rules that most directly target the
  cross-theme risk were not running on the redesigns at all.
- **`panelHTML()` passed the module-scope `state`, not the per-combination
  `cfg`.** Every panel therefore rendered markup keyed to whatever width the
  CONTROL BAR happened to show, and was then laid out in a different box - so
  every width-responsive version was measured against markup built for the
  wrong bucket. One version reported ~1,900 failures that way and 0 once fixed,
  and the first published ranking of all six was wrong because of it. Any
  renderer that takes a config must be handed THAT config.
- The sweep gated on fonts but not stylesheets. Run while `_pm-kit.css` was
  still parsing, it measured UA button defaults (21.5px) and reported thousands
  of phantom hit-target failures. It now probes a known rule before measuring.

### Known fidelity limits

- **v0's JS-rendered content does not appear.** The baseline's Docker container
  list, agent counts and several live regions are populated by `PM_DEMO` at
  runtime, which the harness does not carry. v0's Docker panel therefore looks
  emptier than the real app. The static markup — which is what the redesigns are
  competing against for layout — is faithful.
- The glass wallpaper is a gradient stand-in; see the deviations section.

---

## Feature completeness

Fit is not coverage. A design can score zero layout failures partly **because**
it does not render the controls that would have had to fit. So every panel was
audited a second time against its research brief, asking only whether the
mandated features are present at all.

**The fixture now carries state variety** — title-less artifacts, cancelled and
inconclusive runs, reserved/orphaned/released worktrees, unresolvable registry
entries, a failed redaction, an archived repository, a degraded auth provider and
per-row `allowedActionIds[]` — so every panel was then audited a **third** time
to ask whether what a design renders is *true*, not merely present.

Full report: **[`research/AUDIT-SUMMARY.md`](research/AUDIT-SUMMARY.md)**.
Per-panel detail: `research/audit-{search,source,git,docker,tests,agents,artifacts}.md`.

Percent of MUST requirements present (partial counts half), **before -> after**
the fixture gained state variety. **Bold** = best in panel after.

| Panel | MUSTs | v0 | vA | vB | vC | vD | vE | vF | X1 | X2 | X3 | Best after |
|---|---:|---|---|---|---|---|---|---|---|---|---|---|
| Search | 26 | 33 -> 33 | 75 -> **73** | 75 -> 71 | 75 -> **73** | 69 -> 67 | 62 -> 62 | 52 -> 52 | - | - | - | vA / vC (73) |
| Source Control | 36 | 40 -> 40 | 76 -> 69 | 50 -> 50 | 68 -> 65 | 51 -> 49 | 53 -> 49 | 44 -> 44 | 90 -> **82** | 83 -> 75 | 83 -> 76 | xS1 Commit Desk |
| Actions (git) | 36 | 36 -> 36 | 68 -> 65 | 46 -> 42 | 75 -> **71** | 74 -> 68 | 56 -> 51 | 57 -> 54 | - | - | - | vC Lens Deck |
| Docker | 32 | 22 -> 22 | 59 -> 59 | 50 -> 52 | 69 -> 69 | 50 -> 52 | 48 -> 48 | 61 -> 63 | 73 -> 73 | 70 -> 70 | 75 -> **75** | xD3 Command Line |
| Tests | 25 | 12 -> 12 | 74 -> 72 | 60 -> 58 | 76 -> 72 | 78 -> **74** | 72 -> 70 | 60 -> 60 | - | - | - | vD Drill Stack |
| Agents | 24 | 6 -> 6 | 67 -> **69** | 56 -> 60 | 60 -> 65 | 56 -> 58 | 56 -> 60 | 52 -> 50 | - | - | - | vA Ledger |
| Artifacts | 29 | 28 -> 28 | 62 -> 62 | 52 -> **0** | 64 -> 62 | 45 -> 43 | 50 -> 50 | 41 -> 41 | 66 -> 66 | 76 -> **74** | 66 -> 66 | xA2 Casefile |
| **Mean** | | **25 -> 25** | **69 -> 67** | **55 -> 47** | **70 -> 68** | **60 -> 59** | **57 -> 56** | **52 -> 52** | | | | |

X1/X2/X3 are the panel-scoped variants — `xS1/xS2/xS3` for Source, `xD1/xD2/xD3`
for Docker, `xA1/xA2/xA3` for Artifacts. Every redesign still beats the shipped
panel everywhere, and every pass-1 pick survived — but **the best designs lost
the most**, because a design that renders a field can render it wrongly and a
design that renders nothing cannot. `v0` is flat in all seven panels (it is
static markup and never reads the fixture), which is what makes the deltas
credible.

**vB's Artifacts 0% is real and is already repaired.** The panel threw on the two
title-less rows — `a.title.indexOf('/')` on a field the envelope marks optional —
and took the whole harness down at every width and theme. The one-line fix landed
with this pass; vB reads 52% again. It is left in the table because it is the
clearest thing the exercise learned: **the fit checker was green for that panel
in the same sweep in which it could not draw a pixel.**

### What broke when the data got harder

The most decision-relevant list, because it separates designs that merely scored
well from designs that work. Full ranking in `research/AUDIT-SUMMARY.md` §2.

1. **vB Artifacts threw and rendered nothing** at any width or theme — the only
   total failure in the bakeoff. **Fixed.**
2. **vF Agents drops 11 of 15 active rows and 4 of 5 blocked episodes** from one
   hardcoded four-element array, while its own header still counts all of them.
3. **All three Source variants print the status token where the reserved
   lifecycle word belongs**, so a `released` worktree — cleanly merged, retained
   for lineage — renders and is announced to screen readers as "Unavailable".
4. **`cancelled` and `inconclusive` are pixel-identical to `queued`** in every
   version that draws a run list: `_pm-kit.js` keeps its own nine-token
   `GLYPH`/`DASH` maps and ignores the fixture's `glyph`/`rail`. **No design can
   fix this itself** — two lines in the kit.
5. **Four Docker versions assert that data they were given does not exist**, one
   with a header count of 5 over a footer count of 0 in the same frame.
6. **Every version asserts a clean redaction over a run whose redaction failed**,
   and offers live mutation on an archived repository.
7. **vF Artifacts rendered the literal string `undefined`**; four designs render a
   blank identity row. **vF fixed**; vA, vC, vE remain.

### Blind spots — what no version has

These survive any pick. **The cause column moved**: the fixture now carries the
states, so roughly two thirds of the requirements pass 1 blamed on the fixture
are provably design absences. Six remain genuinely fixture-blocked; three are kit
or harness; two are spec.

1. **No confirmation surface exists anywhere.** `grep confirm` over the kit
   returns nothing and `alert`/`confirm` are banned. Discard, remove worktree,
   drop stash, prune, Replace All, evict cache, export bundle — all ungated.
2. **The redaction gate has no failure path.** `redaction_failed` never
   suppresses `artifact_preview` in any Tests version; the whole bakeoff designed
   the happy path.
3. **Repo identity is nowhere.** Ten of ten Source versions render branch +
   worktree, none renders the repo — the single-repo assumption GI-005 forbids.
4. **Requested vs Effective** identity block absent from all ten Docker versions.
5. **The blocked-state vocabulary is untested** — one code family, two codes, no
   `warning` tier, no GI-021 lifecycle states, five Artifacts presentations
   collapsed to two.
6. **`retention_class`**, a required envelope field, renders nowhere.
7. **Time since blocked** on Agents rows — cheapest to close, costliest to leave.
8. **No list keyboard model** — no roving focus, Home/End, type-ahead or
   Escape-to-deselect on any list in any version (kit-level).
9. Docker first-open disclosure cards; CRAU-021 host and writability axes.
10. Source `resolve_conflict_side`, worktree `recover`, worktree `lock`/`unlock`.
11. Agents: remediation ceiling, unresolvable entries, provenance badges,
    requested-vs-effective persona, the §7.19 audit summary surface.
12. The detach grip (kit has no slot; harness has no affordance).
13. Search record-identity hits, the no-silent-local-fallback statement, and
    `Index build cancelled`.
14. Tests `cancelled` / `inconclusive` statuses, the Run precondition set, the
    zero-failure empty state, the entire P2 depth tier.
15. Artifacts identity fallback chain and `truncation_state` gap rendering.

**The fixture excuse is spent for most of these.** `_pm-data.js` was extended and
re-audited: items 3, 4, 5, 9, 10, 11, 13 and 15 above now have data behind them
and are still unrendered, so their cause is **design**. Item 8 is **kit**, item
12 is **kit + harness**, and Search record rows additionally need a **spec**
(F3-047 ships no row spec at all). Only Docker's disclosure cards, Tests' P2
tier, Actions' runner labels and the Agents audit surface remain genuinely
fixture-blocked and should not count against any design.

**Correction to the first audit: `PM.confirm` already exists.**
`_pm-components.js:498` defines a real modal sheet with a scrim, `role="dialog"`,
`aria-modal`, focus capture and no auto-close, documented as "replaces
confirm()". The pass-1 claim that no confirmation affordance exists came from a
grep restricted to `_pm-kit.js`. **Zero versions call it.** Blind spot 1 is
therefore the cheapest open item in the report, not the most expensive.

### Regressions the redesigns introduced

Short list, and the one to guard in the port:

| Lost | Has it | Dropped it |
|---|---|---|
| Compose scenario list + `stale` badge + repair CTA | v0 | 9 of 9 Docker redesigns |
| Triage changed-files + likely-next-action | v0 | all 6 Actions redesigns |
| `Open`/`Watch` on `browser_recording` | v0, xA1-3 | all 6 full systems |
| GI-021 capability sentence | v0 | all 6 Actions redesigns |
| Worktree filter bar | v0, vA, vC, xS1, xS2 | vB, vD, vE, vF, xS3 |
| Expanded worktree detail (Path/Base/Age) | v0, vD, xS1-3 | vA, and partial in vB/vC/vE |
| Visibility value chip (`show_when_possible`) | v0, vA, vC, vD, vF | vB, vE |

Search and Agents have no regressions — v0 holds nothing the field lost.

**Four of these are now worse, not equal.** The scenario list, the triage
changed-files, the GI-021 capability sentence and the host/writability axes all
have data in the fixture now, and the redesigns still render none of it. Pass 1
scored those as principled abstentions under rule 8. They are no longer
abstentions; they are gaps.

---

## Rules for version authors

See `versions/README.md`. The short list:

- no `id=` attributes — use `data-pm-*` (six versions would collide on
  `searchQueryInput` and fail `check_ids.py` at port time)
- no emoji; inline SVG only
- no backtick or `${` inside markup strings
- no new `color-mix()`; **no new `backdrop-filter`** — that budget is closed at
  7 surfaces (`F3-431`)
- every interactive row at least 24px
- every `<select>` is a `pm-select`; every icon-only control has `data-pm-tip`
- **all content from `_pm-data.js`** — otherwise you are comparing content, not
  design

---

## Accepted W1 ellipsis log

Populated during Phase 6. Every warning that survives into a picked version gets
an entry here with the reason it is acceptable.

| Version | Panel | Theme | Element | Why acceptable |
|---|---|---|---|---|
| _(pending)_ | | | | |

---

## Per-panel picks

Recorded in `localStorage['pm.bakeoff.picks']` as a 7-entry `{panel: version}`
map, because the pick is expected to differ per panel — Docker carries 78 wired
commands and Artifacts 2, so a design that wins for one will likely lose for the
other.

| Panel | Pick | Rationale |
|---|---|---|
| _(pending)_ | | |

---

## Known deviations from spec, carried deliberately

- `FinalGUISpec.md:522-556` puts the side panel on the **right**; the concept
  mounts it left. Pre-existing; the redesign inherits it.
- Activity bar ships 36px collapsed / 72px expanded; §12.4 says 48px. The
  harness exposes all three so the discrepancy stays visible while designing.
- The app does **not persist panel width** (inline style only, lost on reload) —
  a gap against §15 Persistence. The harness does persist it.
- Glass wallpaper is a 3-stop gradient standing in for the 172KB baked WebP
  (PM7 transform T16). Stops are drawn from the real asset's darkest and
  lightest regions rather than its mean, so contrast judgements made here are
  **conservative** rather than optimistic. Parallax and billow motion are lost.
  No new `backdrop-filter` is introduced.

## Port-back path

`PMConcept7.html` is a build artifact and is not touched. After the pick:
winning templates go to `pm6-build/parts/12-html-side-panels.part.html`, the
component CSS/JS become new parts, the primitive repairs patch
`10x-pm6-css-panels.part.html`, then `assemble.py --gate g2` → `g3` →
`build_pm7.py --allow-new-base`. Removing `.context-menu-mock`,
`.pm6-fm-rootdd` and `.wizard-select` changes the frozen dead-selector families,
so `pm7-tools/dead_selectors.py` must be re-derived and human-reviewed.


---

## Fix log - what changed after measuring at volume

Four defects, each found by disbelieving a number rather than by reading code.
Three were in shared layers, which is why they hit several versions at once.

| Fix | Where | Effect |
|---|---|---|
| `--text-muted` was 3.45:1 in `basic-dark` | kit (shared) | W2 across all versions fell from ~6,000 to ~1,000. vA 3348 to 93, vB 2188 to 140, vE 1562 to 64. The shipped baseline has the same defect, so this is pre-existing in the app |
| Lens strip collapsed by bucket, not by arithmetic | kit (shared) | vB W1 274 to 64; vA R-tier 100 to 12. Docker's 11 subviews need 616px at the `F3-445` 56px floor and so collapse at every width; a 6-family strip renders from 380px |
| vE passed its sub-line through raw while budgeting only the identity | vE | W1 846 to 664. CSS was clipping up to 108px; it now degrades by computed elision, which is also what ports - Slint's `overflow: elide` only cuts tails |
| xA1's decorative pip overhung its gutter | xA1 | R-tier **1248 to 0**. Every row in every combination reported "content is 4px wider than the box" |
| `PMK.row` budgeted the meta run against the identity's 96px FLOOR, not its real need | kit (shared) | A 35-char container name takes ~230px, so the run was over-budgeted and `.pmk-meta` (overflow:hidden) hard-clipped it. **Two version authors hit this independently.** Cleared vA's last 12 failures |
| `metaRun` force-kept one segment even when it did not fit | kit (shared) | The retained segment was hard-clipped with no ellipsis - invisible truncation, the exact failure the primitive exists to prevent. It now drops to zero and shows only the `+N` escape |
| An uncapped chip could not wrap out of its own overflow | vF | R-tier **64 to 0** from one `max-width:none` declaration |
| A `-webkit-box` preview could resolve to zero height | vB | R-tier **14 to 0**. Text rendered at 338x0 - invisible rather than clamped |
| `.pmk-chip--ok/--warn` under AA in `basic-light` | kit (shared) | ok 4.24:1 and warn 3.20:1 against the 4.5 floor. W2 across the redesigns fell to 424 total (from ~6,000 before any of the colour work). Found by a variant author who correctly declined to override it locally |

Two harness defects were also fixed, both of which had silently invalidated
earlier numbers:

- **Derived accent tokens were dead.** `--accent-primary` resolved empty in 6
  of 8 themes and `--accent-soft` in **all 8** - a leak in the container-scoping
  technique, since `:root` derives them from `--accent-blue` which only the
  `[data-theme]` blocks declare. It killed every focus outline, hover fill,
  primary-button background and running-status rail at once. Re-homed onto the
  stage with `:where()` so retro-dark keeps its acid lime.
- **The dev server was single-threaded**, so parallel script loads were silently
  dropped and versions went missing from sweeps without any error. Assets now
  carry a content-hash stamp and the server is threaded and no-store.

