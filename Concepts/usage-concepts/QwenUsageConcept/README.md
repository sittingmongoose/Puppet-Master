# Usage Page — Design Concepts (`Concepts/usage-concepts/QwenUsageConcept/`)

Theme-aware redesign prototypes of Puppet Master's **Usage** page, plus a comparison gallery and a
research corpus. Illustrative concept work — same status as `Concepts/rail-concepts/` and
`Concepts/PMConcept7.html`. `Plans/**` remains the canonical spec; these prototypes explore how the
Usage page could look and behave. The research corpus lives in [`research/`](./research/); load-bearing
findings and open gaps from the U1–U9 phase are in [`FINDINGS.md`](./FINDINGS.md); the register outputs
for the selected concept are in [`reports/`](./reports/).

> **Read this before you trust anything in this folder.** An independent audit of the selected concept
> ran on 2026-08-17 and is at
> [`../PM_Usage_Independent_Audit_2026-08-17/`](../PM_Usage_Independent_Audit_2026-08-17/). Its verdict is
> **not ready to port; ready for one more iteration** — 7 blockers, 51 majors, and 38 register and
> evidence-integrity defects. Among those defects: this README previously cited roughly 38 verification
> artifacts that do not exist and were never committed, including every hard number it reported. Those
> claims have been **deleted**, not softened. See [Verification](#verification) and
> [What was removed from this document](#what-was-removed-from-this-document).

## How to view

The pages use relative includes and an iframe gallery, so they need an http origin (not `file://`):

```bash
cd Concepts/usage-concepts
python3 -m http.server 8000      # then open http://localhost:8000
```

- **`index.html` — the gallery (start here).** Embeds all eleven concepts. The top bar retints every
  concept across all **8 themes** (friendly / glass / retro / basic × dark / light), drives one
  **page-width** slider (900 / 1280 / 1700 / 2200 / 2500) across them, and toggles **reduced motion**.
  **Compare** shows them side-by-side (filter by family); **Focus** drives one concept full-size;
  **open full →** opens any concept standalone.
- **Standalone:** each `uN-*.html` opens on its own and carries the full app shell (title bar with the
  Usage tab active, status bar with a page-fit width harness and reduced-motion toggle, theme menu).

## The eleven concepts

`concept-hub.json` registers eleven entries. **U1 and U2 are FROZEN (rejected)** — not edited since the
first pass. **U11 Prism II is the selected concept** and the only one that has been carried forward
through the 2026-08-08 final cumulative packet and the 2026-08-13 correction packet.

| # | Name | Family | Status | Organizing idea |
|---|------|--------|--------|-----------------|
| **U1** | Signal | Triage | FROZEN | Severity is the layout axis: a status line, a single "now" hero, a severity-ranked deck, then a calm "all clear". |
| **U2** | Stream | Timeline | FROZEN | The event ledger is the page — a vertical spine grouped into 5-hour billing blocks with a burn-rate readout. |
| **U3** | Cockpit | Telemetry | earlier pass | A gauge-hero cockpit: one large pressure gauge leads a 2×2 dial bank, an LED quota readout, a scrolling ticker, and threshold lamps. |
| **U4** | Focus | Focus | earlier pass | One roomy section at a time via a depth rail; maximum legibility, deep content per pane. |
| **U5** | Cozy Console | Cozy | earlier pass | Warm shelf-cards with recessed KPI pockets and a hearth spend-pulse hero; the warmth is designed per theme. |
| **U6** | Workspace | Workspace | earlier pass | Master–detail triage: a pressure-sorted, searchable subject index beside a full context dossier that swaps on selection. |
| **U7** | Board | Widgets (grid) | earlier pass | An orderly instrument board on the shared grid engine — uniform modules on a fixed grid with live module numbers and a bench readout strip. |
| **U8** | Canvas | Widgets (grid) | earlier pass | A varied-span bento mosaic on the shared grid engine — 10 distinct spans, dense hole-free packing, a bespoke 26px dot-grid ground. |
| **U9** | Deck | Widgets (deck) | earlier pass | A curated tabbed deck — five topical tabs (`PMTabs`) over per-tab curated boards on the grid engine. |
| **U10** | Prism | Widgets (rooms) | superseded by U11 | The first room-rail prototype: a left rail of topical rooms (overview, quotas, budget, accounts, context, cache, ledger, analytics, tools, guard, coaching) over the shared widget canvas, on the shared `_shared/usage-data.js` dataset. |
| **U11** | **Prism II** | **Widgets (rooms)** | **SELECTED** | The room rail rebuilt on its own dataset and its own widget layer, with three disclosure levels and stable provider/account/connection/product identities. See below. |

U1–U10 all render the shared canonical dataset (`_shared/usage-data.js`), so their differences are purely
design. **U11 does not** — it carries its own dataset (`u11-data.js`) built against the final cumulative
packet, which is why it is the only concept that can demonstrate the packet's fixtures. File roles and
line counts for the U1–U9 set are catalogued in
[`research/concept-inventory.md`](./research/concept-inventory.md); that inventory predates U10 and U11
and does not cover them.

## U11 Prism II — the selected concept

`u11-prism.html` plus six sibling files. It is the only concept in this folder built against
`PM_Usage_Concept_Update_Final_Cumulative_2026-08-08` and
`PM_Usage_Dependency_and_Work_Correction_2026-08-13`.

### Files

| File | Role |
|------|------|
| `u11-prism.html` | The page: app shell, the 13-room rail, the disclosure control, the scope picker, the export and refresh flows, the settings sheet, and the canvas mounts |
| `u11-data.js` | The whole dataset and the data API (`window.U11`): attempts, works, meters, accounts, connections, families, products, models, runs, threads, operational events, BSD events, free-model routes, hosts, environments, cache stats, forecasts, plus the lookup helpers, `U11.dispatch`, and `U11.openSettings` |
| `u11-widgets.js` / `u11-widgets.css` | The `TYPES` registry (15 widget types) and every widget renderer, mounted on the shared `PMWidgets` canvas engine |
| `u11-rundetail.js` / `u11-rundetail.css` | The run and attempt inspector |
| `u11-context.js` / `u11-context.css` | The context ring compact module and its docked details pane |
| `u11-time.js` | Time and duration formatting |
| `u11-icons.js` | U11-specific glyphs extending `PMIcons` |
| `u11-verify.mjs` | The verification harness. See [Verification](#verification) |

**Imports**, verified 2026-08-18. Ten shared files: `base.css`, `themes.css`, `usage-shared.css`,
`usage-widgets.css`, `icons.js`, `menu.js`, `usage-chrome.js`, `usage-icons.js`, `usage-widgets.js` and
`usage-data.js`. It does **not** import `usage-context.*`, `usage-tabs.*` or
`usage-widget-renderers.*` — it supplies its own context module and its own renderers.

It does load `_shared/usage-data.js`, but **not for its data**: that module also defines the shared
render helpers on `window.USrender`, which U11 reaches through a local `R()` accessor. So the shared
`USAGE` dataset is present in the page and unused, while `u11-data.js` supplies everything U11 renders.
One consequence worth knowing: `R().human` is `String(s).replace(/_/g, ' ')` — a render-time
underscore-to-space substitution, not a label map — so raw enum tokens reach the screen de-underscored
and the harness's "zero underscores" assertion cannot detect them.

### The 13 rooms

A left rail navigates thirteen rooms, each a widget canvas with its own curated default board:

**Overview** · **Plans & limits** · **Costs** · **Accounts** · **Free models** · **Context** ·
**Analytics** · **Ledger**, then a collapsed **More** group holding **Attention** · **Prompt cache** ·
**Tools** · **Signals** · **Source authority**.

The rail also carries the scope picker (which dispatches `cmd.account.select_profile`) and the
disclosure control. Room selection persists in `localStorage` under `u11:scope` and `u11:disclosure`.

### The three disclosure levels

One control, three levels, defined in `u11-widgets.js` as `typesForDisclosure`. It filters which widget
types a room may mount, so the same room is a different page at each level:

- **Essentials** — decisions and plain language. 8 widget types: plans, costs, accounts, attention,
  context, capacity, free, ledger.
- **Standard** — adds token, context, cache, account, cost and plan detail. 14 types: the Essentials
  eight plus runs, operations, analytics, tools, cache, signals.
- **Advanced** — adds raw meters, source authority, receipts and diagnostics. 15 types: the Standard
  fourteen plus authority.

Because the filter is on widget *type*, the Source authority room is empty below Advanced and the rail
entry for it is hidden — which is what the harness case `interaction disclosure Std→Adv toggles
authority rail` checks.

### The widget engine

U11 mounts the **shared** canvas engine (`_shared/usage-widgets.js`, `PMWidgets`) — FLIP drag-reorder,
free grid-span pointer resize, focus-mode morph, and versioned `{v:2}` `localStorage` persistence per
room under `pmw:<pageId>` — and supplies its **own** renderer registry rather than the shared
`PMWidgetDefs`. `u11-widgets.js` defines 15 types: `plans`, `costs`, `accounts`, `attention`, `context`,
`capacity`, `runs`, `free`, `analytics`, `ledger`, `operations`, `tools`, `cache`, `signals`,
`authority`. Each carries a label, an icon, a default span, a description, a render function and a
config spec.

**One thing to know about that split:** the shared engine owns the widget lifecycle (`addWidget`,
`removeWidget`, `setSize`, `resetCanvas`, the "Add widget" control) and contains **no command dispatch
code at all** — `grep -c 'dispatch\|U11\.\|cmdLog' _shared/usage-widgets.js` returns 0. So of the six
shared widget commands, only `cmd.widget.add` is ever dispatched, and only from the kebab's Duplicate
path. This is recorded in [`reports/candidate-command-delta.json`](./reports/candidate-command-delta.json).

### Persistence

Eight `localStorage` keys, declared with owner, retention and eviction in
[`reports/impact-register.json`](./reports/impact-register.json) under `storage_retention_impacts`:
`u11:disclosure`, `u11:scope`, `u11:settingsView`, `u11:seeded`, `u11:parked`, `u11:range`,
`pmw:<pageId>` (one per room), and `pm.theme` (owned by the shared app shell, used by all eleven
concepts). All of them carry view or layout state; none carries a Settings-owned policy.

This list read "five" until 2026-08-18, when a harness guard that checked writes against the declared
allowlist failed and surfaced `u11:seeded` and `u11:parked`; `u11:range` arrived the same day with the
date-range control. The guard is now structural rather than allowlist-based, so a new key cannot pass
unnoticed but also does not fail the build merely for being new.

## Verification

**There is exactly one automated gate for U11, and it is `u11-verify.mjs`.** It is documented here for
the first time.

```bash
cd Concepts/usage-concepts/QwenUsageConcept
npm install --prefix .verify playwright-core     # once; .verify/ already has it
node u11-verify.mjs
```

It starts its own static file server (port 8097, bumping to 8098/8099 if taken), launches its own Chrome
via `executablePath` with an isolated `userDataDir` under the system temp directory, runs headless at
viewport-driven widths, and writes `reports/visual-interaction-test-report.json` plus screenshots into
`verify-shots/`. It is collision-safe by design so several copies can run at once.

**The run of record** is **108 cases, 108 pass, 0 fail, exit 0** at `2026-08-18T14:09:40.337Z`, written to
`reports/visual-interaction-test-report.json` by the harness itself. It grew from 80 to 108 during the
2026-08-18 remediation: 10 hard-failure guards were added first, then 18 closure cases and 3 rewrites, so
that every finding the remediation closed is now guarded by a test rather than by a claim.

**The 21 cases added last carry a negative control.** Each was proved to have teeth by breaking the thing
it guards in a scratch copy, confirming the case went red, and discarding the copy. That matters because
twice in this concept's history a repair silently broke something a green suite did not notice — a Ledger
column that collapsed and lost 98 strings below 768px, and a duplicate id — and in both cases the suite
stayed green because nothing asserted the fact.

**How to keep this number honest.** Re-run the harness after any edit and quote only what it printed. The
earlier version of this section quoted an 80/80 result that had gone stale under later edits; the audit at
`../PM_Usage_Independent_Audit_2026-08-17/` exists in large part because numbers in this documentation
were repeated long after they stopped being true.

### What the harness does check

- **Matrix (40 cases):** 8 themes × 5 widths (900 / 1280 / 1700 / 2200 / 2500). Per case: the page
  mounted, the rail has at least 10 items, the visible text contains zero underscores, the theme
  attribute matches, and the console produced no errors.
- **Interactions (6):** scope picker, the Standard→Advanced disclosure toggle, the settings sheet route,
  the export flow, the refresh toast, and a console-error sweep.
- **New behaviour and corrections (11):** the BSD inspector section, the operations widget, the capacity
  envelope line, the forecast-refresh dispatch, the account-row "Use next" flow, the plans estimate row,
  the free-model cooldown row, the acquisition lineage, the setup-required deep link, the inspector
  acquisition note, and a second console sweep.
- **Guards (4):** maintenance entries carry no token totals; unknown is not rendered as zero; the four
  unconfigured providers are absent from the visible text; the cost identity holds.
- **Fixtures (18):** the packet's 18 demo fixtures.
- **Context (1):** the context details pane renders stable prefix, cache epoch and tool-schema overhead.

### What the harness does NOT cover

Stated plainly because the last version of this document implied a coverage that did not exist.

- **The widget lifecycle.** No case adds, removes, resizes, moves, configures, duplicates or resets a
  widget. `grep` for `pmw-add`, `pmw-grip` and `dragTo` in `u11-verify.mjs` returns 0 hits each. The
  drag, resize and focus-morph interactions are entirely untested.
- **Keyboard and assistive technology.** The only keyboard use in the harness is three `Escape` presses
  to dismiss the inspector. No tab-order test, no focus-management test, no ARIA or accessible-name
  assertion, no screen-reader check. `grep 'aria-'` returns 0 hits.
- **Reduced motion.** 0 hits for `reduced` or `prefers-reduced`. The reduced-motion path is never
  exercised.
- **The compact-scenario cycle.** `cmd.chat.compact_context` is dispatched by the concept and tested by
  nothing; 0 hits for `compact` in the harness.
- **Embed mode.** 0 hits. The gallery-embedded rendering is never tested.
- **8 of the 13 rooms.** The harness navigates only `overview`, `plans`, `accounts`, `free` and
  `ledger`. **Analytics, Tools, Signals, Prompt cache, Attention, Costs, Context and Source authority
  are never opened** — the 40 matrix cases only load the default room. The context-details pane is
  reached by calling `window.U11Context.openDetails()` directly rather than by navigating to the Context
  room.
- **Narrow widths.** The narrowest tested width is 900px. The independent audit measured 42 zero-width
  leaf elements in the Ledger at 360px.
- **Whether controls do anything.** The harness clicks a handful of specific controls. It never sweeps
  controls for effect; the audit did, and found 10 of 290 click-tested controls inert.
- **Rendering, for most fixtures.** 12 of the 20 fixture claims are asserted against `window.U11` data
  with no DOM read anywhere and would pass against a page that rendered nothing.
  [`reports/demo-fixture-report.json`](./reports/demo-fixture-report.json) now records the verification
  basis per fixture.
- **The mandatory concept gate.** `Concepts/CONCEPT_RULES.md` rule 11 requires
  `python3 Concepts/ConceptHub/validate.py Concepts/usage-concepts/QwenUsageConcept` before finishing.
  The audit ran it and reports 24 issues. It has not been re-run here.

### The independent audit

[`../PM_Usage_Independent_Audit_2026-08-17/`](../PM_Usage_Independent_Audit_2026-08-17/) is a read-only
12-axis audit of U11 against both packets and against `Plans/**`. It ships:

| File | What it is |
|---|---|
| `AUDIT_REPORT.md` | The report. Section 4 is the 7 blockers, section 8 the register and evidence defects, section 12 the readiness verdict and must-fix list, section 13 the audit's own stated limitations. |
| `FINDINGS.json` | 167 surviving findings plus 20 refuted, each with evidence, a reproduction command, and the critic verdicts for and against. |
| `DECISION_CLASSIFICATION.json` | All 107 packet decisions classified: 51 demonstrated, 30 represented, 13 deferred to a verified owner, 13 missing. |
| `CANONICAL_FIXTURE_CROSSCHECK.json` | The 13 `UF-088` Plans-owned fixtures, token by token. The concept was not built against them: 6 unaddressed, 7 partially addressed under different vocabulary, 0 genuine violations. |
| `handoff/HANDOFF_CORRECTIONS.md` | Measured corrections to the port handoff. Read before either handoff document. |
| `audit-evidence/` | Re-runnable harness scripts, probe result files and screenshots. Counted 2026-08-18: `harness/` 18 files, `probes/` 34, `screenshots/` 86. The audit's own contents list at `AUDIT_REPORT.md` section 14 says 15 / 27 / 80, so its manifest undercounts what it shipped. |

What it found, in one paragraph: the Usage quick-controls sheet mutated and persisted five
Settings-owned policies locally while dispatching nothing, which is the packet's named hard failure and
which three registers had certified as compliant; cached-read tokens were added into displayed totals;
a `-1` sentinel rendered as `-1%`; product kinds were collapsed; Free Models rows rendered without their
underlying route; and every quantitative verification claim in this document rested on files that do not
exist. The register-side defects are corrected in `reports/` and here; the concept-side defects are
separate changes and most are still open.

## What was removed from this document

The version of this README that shipped before 2026-08-18 contained a `Verification` section and an
`Audit corpus` section describing roughly 38 named artifacts under `verification/`. **None of them
exists.** Verified 2026-08-18: `find verification -type f` returns exactly 15 files — 13 PNGs plus
`cdp-shots.mjs` and `std-shots.mjs`, all under `verification/u11/redesign/`. `verification/screenshots/`
and `verification/screenshots-states/` do not exist. `git log --all --oneline --diff-filter=A` returns 0
commits for every one of the named artifacts, and the only commit ever touching `verification/` is
`aa122d7c85`, which added exactly those 15 files. Nothing was deleted; nothing was ever created.

Those 15 files no longer live here. `Concepts/CONCEPT_RULES.md` rule 10 requires verification material to
be deleted from a concept folder before finishing, and `ConceptHub/validate.py` failed this folder while
`verification/` held any file. Rather than destroy the only artifacts of that phase, they were moved to
[`../PM_Usage_Independent_Audit_2026-08-17/preserved-concept-verification/`](../PM_Usage_Independent_Audit_2026-08-17/preserved-concept-verification/),
with a provenance note recording that both drivers are dead as written (macOS-only Chrome path, and a
server on port 8741 that nothing starts).

Deleted rather than softened, because each rested on a file that does not exist:

- The three runnable commands `node verification/run-matrix.mjs`, `run-states.mjs` and `data-unit.mjs` —
  no such scripts.
- **"280 cases, 280/280 pass, 0 failures"** for a 7-page × 8-theme × 5-width base matrix, and the 280
  screenshots and `report.md` / `results.json` it cited.
- **"393 passed / 0 failed / 171 legitimate N/A"** for interactive states, and `state-results.json`.
- **"1003 assertions, 0 failures"** for semantic and data-unit checks, and the source-aware
  **160,090** used-tokens figure and the **≥36 provenance chips per concept** claim that came with it.
- **"scrolling dropped from 77% of instances to 7.8%"**, **"every widget measures exactly 1.00×"** and
  **"0px right cut-off"** — from `qa-fit-final.md`, which does not exist.
- **"280/280 combos pass (7 concepts × 40)"** for the visual review, and
  `verification/visual-review-ledger.json` "(280 entries, all pass)", and the per-concept
  `visual-review-{page}.json` lineage files.
- The instruction to **"Read `verification/known-limitations.md` before trusting green"** — the file the
  README designated as its own mandatory caveat does not exist.
- The entire audit corpus list: `audit-design-critique.md`, `audit-design-recritique.md`,
  `audit-distinctiveness.md`, `audit-robustness.md`, `audit-data-semantics.md`,
  `audit-accessibility.md`, `audit-motion.md`, `audit-a11y-motion-recheck.md`,
  `contrast-final-cleanup.md`, `qa-design-critique-final.md`, `qa-final-widgets.md`,
  `qa-final-static.md`, `qa-u9.md`, `audit-widget-fit.md`, `a11y-audit.mjs`, and the AA-contrast probe
  files. All 41 names checked individually on 2026-08-18; all 41 missing.

Two further corrections of fact: this document said "The nine concepts" and never mentioned U10 or U11
at all — `grep -ci 'u11\|u10'` returned 0 — while U11 is the selected concept. And even if the missing
matrix had existed, it scoped itself to "7 pages (U3–U9)", so it would have been evidence about
concepts other than the one that matters.

The corresponding claims in [`research/INDEX.md`](./research/INDEX.md) were removed in the same pass.

**Still outstanding: `FINDINGS.md`.** It was outside the scope of this repair and was not edited.
`grep -ci 'u11\|u10' FINDINGS.md` still returns 0, so it describes the U1–U9 phase only and says
nothing about the selected concept. Read it as U1–U9 lineage, not as findings about U11; the U11
findings are the audit's `FINDINGS.json` and the `unresolved_questions` array in
`reports/impact-register.json`.

## Research corpus (`research/`)

Read-only research from the U1–U9 phase. Every file listed in
[`research/INDEX.md`](./research/INDEX.md) was checked on 2026-08-18 and exists.

- **Plans synthesis:** `plans-usage-synthesis.md` (token / quota / cost / projection semantics),
  `plans-gui-synthesis.md` (GUI surfaces), `plans-gap-and-conflict-register.md`,
  `plans-coverage-map.md`, plus `plans-source-ledger.json` and `plans-command-registry.md`.
- **14 external open-source projects** (access-date 2026-07-30, SHA-pinned): batch A
  (`usage-notes-A.md` / `usage-ledger-A.json`) — ccusage, Claude-Code-Usage-Monitor, cc-statusline,
  opencode, claudecodeui, codeburn; batch B (`usage-notes-B.md` / `usage-ledger-B.json`) — LiteLLM,
  Helicone, OpenMeter, Lago, LLM-Token-Counter-VSCode, vs-context, copilot-usage-dashboard-v2,
  github-copilot-usage-tracker. Synthesis in `usage-recommendations.md`.
- **Motion:** `motion-synthesis.md` (principles P1–P12), `motion-token-map.json`,
  `motion-to-slint-map.md`, `motion-source-ledger.json`, `animation-elevation-reference.md`.
- **Slint 1.17.1:** `slint-1.17.1-verification.md` (re-audit, version-pinned) and
  `slint-portability-audit.md`, with the glass mapping in `glass-slint-mapping.md`. Two true
  missing-capability blockers remain — `backdrop-filter` and element blur.
- **Inventory and lineage:** `concept-inventory.md` (file roles, line counts, importers — U1–U9 only),
  `data-rebuild-notes.md`, `pmconcept7-reference.md`, `reconciliation-traceability.md`,
  `proposed-plan-updates.md` (P1–P21, not applied; P14 retracted).

Note the scope limit: the research corpus was produced during the U1–U9 phase and re-verified against
that corpus on 2026-07-30. It predates U10 and U11 and does not describe them. The audit separately
found that the four Slint portability documents contain zero occurrences of the string "u11".

## Register outputs (`reports/`)

The eight outputs packet §06 requires, plus two extras. All were revised on 2026-08-18 to correct
defects the audit found; each correction preserves the original claim verbatim inside a `retraction`
object with a date and a reason.

| File | What it holds |
|---|---|
| `impact-register.json` | 21 plan-owner impacts, 14 command dispositions, the wiring chains, 18 DRY roles, the event-schema summary, the client-persistence declaration, the settings deep-link contract, fixtures and test results |
| `plan-owner-delta.md` | The same 21 owners as a table, with every `Plans/` path and PlanUnit id verified to exist |
| `candidate-command-delta.json` | The measured dispatch inventory, the never-dispatched list, seven command verdicts, and the re-derived Plans census |
| `candidate-wiring-delta.json` | The seven-stage chain plus the 2026-08-13 correction chain |
| `candidate-dry-delta.json` | 18 DRY role attributions, each re-checked against source |
| `event-schema-delta.json` | The attempt schema, the meter schema, the purpose taxonomy, the enums, and what the file still does not declare |
| `demo-fixture-report.json` | 20 fixtures with a verification basis each, and all 9 packet hard-failure guardrails |
| `visual-interaction-test-report.json` | The harness output. **Not edited by the audit repair** — it is a machine artifact and rewriting it by hand would destroy its only value |
| `reference-review-report.json` | The 2026-08-13 correction-packet reference review |
| `visual-interaction-test-report.pre-correction-77.json` | The superseded 77-case run, retained |

## Picking one / next steps

U11 Prism II is the selected direction. It is **not ready to port** — see the audit's section 12 for the
must-fix list, which includes removing policy mutation from Usage, declaring counting semantics, making
the `-1` sentinel unrepresentable, rendering the underlying route on ineligible Free Models rows, and
making `validate.py` pass. A port would go into the PMConcept7 lineage via the `pm6-build` parts
pipeline — not done in this folder, and the audit's `handoff/HANDOFF_CORRECTIONS.md` should be read
before either handoff document. The load-bearing semantics and open gaps to canonicalize in Plans are in
[`FINDINGS.md`](./FINDINGS.md) (U1–U9 phase) and in the `unresolved_questions` array of
[`reports/impact-register.json`](./reports/impact-register.json) (U11).
