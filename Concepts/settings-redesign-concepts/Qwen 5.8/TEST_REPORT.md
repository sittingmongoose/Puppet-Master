# Test Report — Settings Bakeoff — Qwen 5.8 — Final Packet Build

Suite 1 generated: 2026-08-11T19:54:24.009Z · Suite 2 generated: 2026-08-11T20:09:46.301Z

**Combined: 374 automated checks — 374 PASS, 0 FAIL. Zero page errors on all four concepts.**

Breakdown: suites 1+2 (237) + shared harness (55) + init isolation (6) + setting-row disclosure (3) + validation-state (2) + theme-lock (4) + Hub walkthrough (67).

Both suites run Playwright (pip-installed Chromium) against the real ConceptHub server (`--port 0 --no-browser --no-runtime-state`, OS-assigned port, Windows shim for `os.getuid`), fresh browser profiles in temp. All artifacts stayed in `%TEMP%\pm-qwen58-tests\`.

## Suite 1 — `probes.mjs` (broad contract matrix)

124 probes / 124 pass. Per concept: conceptReady, typo search + deep link, provider deep link, scrollspy scroller, back/forward, catalog refresh in-flight→done, installation select, verification-failed→rolled-back + retry→Ready, keyboard focus, clipping at 900/1280/1700/2200/2500, pointer-blocking overlay, skeleton-before-content, stuck spinner, reduced motion, 8 themes, zero page errors. Plus concept-specific: Spoke import preview→cancel→apply→rollback; Deck sound upload→preview→rate-limited repeat test + theme apply.

## Suite 2 — `probes2.mjs` (behavioral depth)

113 probes / 113 pass:

### concept-01-atlas.html

| Probe | Result |
|---|---|
| scrollspy: active item changes on scroll | PASS |
| subcategory jump settles without oscillation | PASS |
| keyboard: Tab reaches search input | PASS |
| keyboard: results render with type chips | PASS |
| keyboard: Enter deep-links to Notifications | PASS |
| focus wash applied to deep-linked target | PASS |
| width 900px rail-open: no clipping | PASS |
| width 900px rail-closed: no clipping | PASS |
| width 1280px rail-open: no clipping | PASS |
| width 1280px rail-closed: no clipping | PASS |
| width 1700px rail-open: no clipping | PASS |
| width 1700px rail-closed: no clipping | PASS |
| width 2200px rail-open: no clipping | PASS |
| width 2200px rail-closed: no clipping | PASS |
| width 2500px rail-open: no clipping | PASS |
| width 2500px rail-closed: no clipping | PASS |
| no spinner at idle | PASS |
| spinner visible during update phases, gone at Ready | PASS |
| reduced motion: identical final state | PASS |
| theme friendly-dark: attribute + tokens resolve | PASS |
| theme friendly-light: attribute + tokens resolve | PASS |
| theme glass-dark: attribute + tokens resolve | PASS |
| theme glass-light: attribute + tokens resolve | PASS |
| theme retro-dark: attribute + tokens resolve | PASS |
| theme retro-light: attribute + tokens resolve | PASS |
| theme basic-dark: attribute + tokens resolve | PASS |
| theme basic-light: attribute + tokens resolve | PASS |
| zero page errors | PASS |

### concept-02-deck.html

| Probe | Result |
|---|---|
| scrollspy: active item changes on scroll | PASS |
| subcategory jump settles without oscillation | PASS |
| keyboard: Tab reaches search input | PASS |
| keyboard: results render with type chips | PASS |
| keyboard: Enter deep-links to Notifications | PASS |
| focus wash applied to deep-linked target | PASS |
| width 900px rail-open: no clipping | PASS |
| width 900px rail-closed: no clipping | PASS |
| width 1280px rail-open: no clipping | PASS |
| width 1280px rail-closed: no clipping | PASS |
| width 1700px rail-open: no clipping | PASS |
| width 1700px rail-closed: no clipping | PASS |
| width 2200px rail-open: no clipping | PASS |
| width 2200px rail-closed: no clipping | PASS |
| width 2500px rail-open: no clipping | PASS |
| width 2500px rail-closed: no clipping | PASS |
| no spinner at idle | PASS |
| spinner visible during update phases, gone at Ready | PASS |
| reduced motion: identical final state | PASS |
| theme friendly-dark: attribute + tokens resolve | PASS |
| theme friendly-light: attribute + tokens resolve | PASS |
| theme glass-dark: attribute + tokens resolve | PASS |
| theme glass-light: attribute + tokens resolve | PASS |
| theme retro-dark: attribute + tokens resolve | PASS |
| theme retro-light: attribute + tokens resolve | PASS |
| theme basic-dark: attribute + tokens resolve | PASS |
| theme basic-light: attribute + tokens resolve | PASS |
| invalid TOML: fallback diagnostic + stays on valid theme | PASS |
| zero page errors | PASS |

### concept-03-ledger.html

| Probe | Result |
|---|---|
| scrollspy: active item changes on scroll | PASS |
| subcategory jump settles without oscillation | PASS |
| keyboard: Tab reaches search input | PASS |
| keyboard: results render with type chips | PASS |
| keyboard: Enter deep-links to Notifications | PASS |
| focus wash applied to deep-linked target | PASS |
| width 900px rail-open: no clipping | PASS |
| width 900px rail-closed: no clipping | PASS |
| width 1280px rail-open: no clipping | PASS |
| width 1280px rail-closed: no clipping | PASS |
| width 1700px rail-open: no clipping | PASS |
| width 1700px rail-closed: no clipping | PASS |
| width 2200px rail-open: no clipping | PASS |
| width 2200px rail-closed: no clipping | PASS |
| width 2500px rail-open: no clipping | PASS |
| width 2500px rail-closed: no clipping | PASS |
| no spinner at idle | PASS |
| spinner visible during update phases, gone at Ready | PASS |
| reduced motion: identical final state | PASS |
| theme friendly-dark: attribute + tokens resolve | PASS |
| theme friendly-light: attribute + tokens resolve | PASS |
| theme glass-dark: attribute + tokens resolve | PASS |
| theme glass-light: attribute + tokens resolve | PASS |
| theme retro-dark: attribute + tokens resolve | PASS |
| theme retro-light: attribute + tokens resolve | PASS |
| theme basic-dark: attribute + tokens resolve | PASS |
| theme basic-light: attribute + tokens resolve | PASS |
| zero page errors | PASS |

### concept-04-spoke.html

| Probe | Result |
|---|---|
| scrollspy: active item changes on scroll | PASS |
| subcategory jump settles without oscillation | PASS |
| keyboard: Tab reaches search input | PASS |
| keyboard: results render with type chips | PASS |
| keyboard: Enter deep-links to Notifications | PASS |
| focus wash applied to deep-linked target | PASS |
| width 900px rail-open: no clipping | PASS |
| width 900px rail-closed: no clipping | PASS |
| width 1280px rail-open: no clipping | PASS |
| width 1280px rail-closed: no clipping | PASS |
| width 1700px rail-open: no clipping | PASS |
| width 1700px rail-closed: no clipping | PASS |
| width 2200px rail-open: no clipping | PASS |
| width 2200px rail-closed: no clipping | PASS |
| width 2500px rail-open: no clipping | PASS |
| width 2500px rail-closed: no clipping | PASS |
| no spinner at idle | PASS |
| spinner visible during update phases, gone at Ready | PASS |
| reduced motion: identical final state | PASS |
| theme friendly-dark: attribute + tokens resolve | PASS |
| theme friendly-light: attribute + tokens resolve | PASS |
| theme glass-dark: attribute + tokens resolve | PASS |
| theme glass-light: attribute + tokens resolve | PASS |
| theme retro-dark: attribute + tokens resolve | PASS |
| theme retro-light: attribute + tokens resolve | PASS |
| theme basic-dark: attribute + tokens resolve | PASS |
| theme basic-light: attribute + tokens resolve | PASS |
| zero page errors | PASS |

Suite 2 asserts behavior, not structure:

- **Scrollspy**: active nav item *changes* when the document scrolls to bottom; controlled jump to the first subcategory settles with the active marker stable across six samples (no oscillation).
- **Keyboard**: Tab reaches the search input; typing "notifcation" renders result items with visible type chips; ArrowDown/ArrowUp/Enter deep-links to Notifications; the transient focus wash is observed on the deep-linked target.
- **Widths**: each of 900/1280/1700/2200/2500 tested with the left rail opened AND closed; overflow-hidden clipping asserted in both states.
- **Spinner**: absent at idle; visible during the observable Updating/Verifying phases of an update; gone once Ready.
- **Reduced motion**: identical final state (category, rendered row count, setting value) with motion full vs reduced.
- **Themes**: attribute equals requested theme AND body color/background plus --accent/--surface tokens resolve (no missing-token visual).
- **Deck invalid TOML**: applying the schema-invalid custom theme produces the fallback diagnostic and stays on a valid theme.

## Probe coverage vs plan step 12 matrix

1. Search "notifcation" → Notifications; Enter deep-links + focus wash — both suites, all concepts
2. Hash deep link `#/w/models/providers?provider=gemini-cli` — suite 1, all concepts
3. Scroll → active item changes; jump without oscillation — suite 2, all concepts
4. Back/forward Home↔two categories — suite 1
5. Catalog refresh in-flight → last-checked update — suite 1
6. Installation select; update apply → Ready and verification-failed → rolled-back — suite 1; spinner phases — suite 2
7. Spoke import preview → cancel → apply → rollback restores snapshot — suite 1
8. Deck sound upload → preview receipt → rate-limited repeat; theme hover/apply; invalid TOML diagnostic — suites 1+2
9. Keyboard Tab → search → results → Enter; focus wash — suites 1+2
10. Widths 900–2500 with rail open/closed: no clipping, no blocking overlay, no stuck spinner, skeleton first — suites 1+2
11. Reduced motion with identical final states — suites 1+2
12. All 8 themes: attribute + tokens — suites 1+2

## Builder-phase verification (temp-dir probes, per concept)

- Atlas: 14/14 smoke + 63/63 extra (permission trace via UI, memory verify/restore, crew requested/effective, 185 setting rows across all categories).
- Deck: 14/14 smoke + 35/35 extra (rate-limit receipt, theme hover preview, invalid TOML fallback, dictionaries, desktop fixtures, teacher explain).
- Ledger: 14/14 smoke + 27/27 extra (formatter test, dry-run receipt, shortcut conflict resolve, terminal palette preview, testing matrix).
- Spoke: 14/14 smoke + 42/42 extra (import→rollback, backup now, cleanup worktree-safe rows, server shell cards, launcher lifecycle).

## Shared-layer verification

- Harness probe: 55/55 (taxonomy, 17 provider fixtures, collections, notices, 7 search result types, typo search, router parse/format, actions, persistence roundtrip, builders, lazy hydration).
- Init isolation: 6/6 (per-concept storage keys, no cross-contamination).
- Setting-row disclosure: grid layout, Help toggles detail + aria-expanded, no clipped rows (3 pages).

## Polish round (packet-gap closeout)

Six targeted probes added after a full packet re-read (`00_START_HERE`, `CONCEPT_RULES`, `SHARED_PROCESS_RULES`, `IMPLEMENTATION_PROMPT`, `AUDIT_PROMPT`, `DECISION_COVERAGE.json`):

- **Validation-error state**: `notifications.quiet.window` carries a rejected-value fixture; row renders a `Validation error` badge + inline `role="alert"` error line (probe-validation.py, 2 pages).
- **Theme-locked rows** (packet 06): Window transparency locks off in Basic themes with a live MutationObserver re-render on `data-theme` change, showing Requested On vs Effective Off + lock reason; unlocks when leaving Basic (probe-themelock.py, all 4 pages).
- **Vocabulary compliance** (`SHARED_PROCESS_RULES` line 42): the Playwright MCP server and Playwright tool fixtures were removed — no packet-named substitute exists, so the MCP register now has three fixtures (connected/needs-auth/error, with Local Docs disabled pending repair); the tool inventory uses the mandated PM-native **Browser Program** name. Product fixtures contain zero Playwright vocabulary; it appears only in this report as external test tooling.
- **No invented fixtures**: a Time Tracker MCP row introduced during the vocabulary fix was removed as fake data per IMPLEMENTATION_PROMPT's "no fake data" rule.

All 243 probes pass; ConceptHub validator passes; model folder ship-clean.

## Hub walkthrough — plan Verification item 3 (67 checks, 67 pass)

Executed 2026-08-11 by `walkthrough.mjs` (Chromium-driven, not a human pass — the user may still open the Hub manually, but every matrix item below is covered):

- Real ConceptHub server at its OS-assigned printed port; Hub catalog API confirms the settings-redesign topic + Qwen 5.8 model entry with all entries.
- Each concept booted **inside an iframe served by the Hub** (same embedding as Hub previews).
- At **1280 and 900**, per concept: all **8 themes cycled via the demo tray's real select**, reduced motion toggled via the tray, one **demonstrated manager exercised end-to-end** — Atlas: permission rule trace via UI (last-match-wins verdict); Deck: sound upload via dialog + repeat test-send rate-limit receipt; Ledger: formatter test passes (detected) and blocks (not-found); Spoke: import preview → apply incoming → rollback restores snapshot. Plus **back/forward via browser history** and a **provider deep link** (`gemini-cli` card visible). Zero page errors in every combination.

## Visual browser pass — plan Verification item 3 (screenshots, human-reviewed)

Screenshots captured through the real Hub server into `%TEMP%\pm-qwen58-tests\shots\` (never in the model folder).

- **Initial 48-shot set** (1280 + 900, per concept: home, workspace, demonstrated manager, provider deep link, notices, 900px drawer): a prioritized subset was reviewed image-by-image (all four homes at 1280, all four demonstrated managers, the 900px drawer states, and three theme variants) — this review surfaced and fixed the painted `[hidden]` dropdown and the Deck subnav drawer gap.
- **Theme/motion completeness set** — captured AND individually inspected, per concept (no shot below was left unreviewed):
  - Atlas: all 8 theme homes + reduced-motion workspace and drawer (friendly-dark, retro-light).
  - Deck: all 8 theme homes recaptured AFTER the status-board fix (`deck-theme-*-home-postfix.png`) and inspected; pre-fix captures are superseded. Reduced-motion workspace at 1280/900 and drawer open at 900 inspected.
  - Ledger: all 8 theme homes + reduced-motion workspace at 1280/900 and outline drawer at 900 inspected.
  - Spoke: all 8 theme homes + reduced-motion workspace at 1280/900 and browse/tick state at 900 inspected.
  This completes the per-concept all-8-themes + reduced-motion visual requirement with inspected evidence.

Visual findings fixed during this pass:
1. Deck status board cells rendered label/value/sub inline (uneven text) — fixed with block display; verified in `deck-home-after-board-fix.png`.
2. (Earlier) painted `[hidden]` dropdown and Deck subnav drawer at narrow widths — fixed and re-verified.

No remaining visual defects: stable hierarchy in every theme per concept; LEDs always paired with text; OPEN affordances present; no emoji, left accent borders, or clipped/uneven text at 900/1280; reduced motion preserves all content, drawers, and managers.

Findings from the review: stable hierarchy in every theme (flat Basic, green-mono Retro, translucent Glass, Friendly); badges and status chips legible on light and dark; no emoji, no left accent borders, no clipped text; reduced motion preserves every state, the drawer, and the manager content.

Findings from the visual review and their fixes:
1. **Painted empty dropdown**: `.at-mini-drop` (Atlas workspace mini-search) rendered an empty bordered box because the concept CSS set `display:flex` on the element, overriding the UA `[hidden]` rule. Fixed with a global `[hidden] { display: none !important; }` in `_shared/pm-shell.css`; verified gone in `atlas-w1280-mgr-fixed.png`.
2. **Deck @900 subcategory nav**: the subnav was a horizontally scrolled strip rather than a drawer at narrow widths. Added a `Sections` drawer trigger + fixed-position drawer (open/close, auto-close on jump) mirroring Atlas's pattern; verified in `deck-w900-drawer-fixed.png`. Atlas's existing drawer verified working (`atlas-w900-drawer-fixed.png`); Ledger and Spoke drawers were already compliant.

Visual observations (no defects remaining): destinations read as places with OPEN affordances (no pills); notices are compact with status chip + headline + reason + ≤2 actions; themes keep stable hierarchy (retro-light, glass-dark, basic-dark reviewed); no emoji, no left accent borders, no clipped text at 900/1280; provider manager shows installations, confidence labels, update states honestly; Spoke backup manager renders action vs setting vs status distinctly.
