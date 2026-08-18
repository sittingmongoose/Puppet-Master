# Independent auditor harness — U11 "Prism II" usage concept

**Audit** PM_Usage_Independent_Audit_2026-08-17 · **run** 2026-08-17 · **verdict scope** report only, no repair

| | |
|---|---|
| Harness | `audit-evidence/harness/audit-probe.mjs` (written by the auditor; the concept's own `u11-verify.mjs` was **never executed**) |
| Target | `file:///mnt/Cursor/PuppetMaster/Concepts/usage-concepts/QwenUsageConcept/u11-prism.html` |
| Results | `audit-evidence/probes/independent-probe-results.json` (1.1 MB, every measurement) |
| Screenshots | `audit-evidence/screenshots/` — 57 files from this harness, listed in `meta.screenshots` (the directory is shared with other agents' `replay-*.png`) |
| Groups executed | G0–G9, all ten, **zero blockers** |
| Browser | Chrome for Testing 151, headless, one long-lived persistent context, isolated profile, debug port 9412, `file://` only |
| Assertion policy | geometry, computed style and rendered text. **No dispatch counts were used as evidence of anything.** |

The concept was not modified. Every file under `QwenUsageConcept/` still carries its pre-audit
mtime (≤ Aug 15); `reports/` and `verify-shots/` are untouched.

---

## G0 — instrument self-test (added by the auditor, not requested)

A "0 violations" result is only evidence if the detector fires on a known defect. Before measuring the
concept, the harness injects synthetic defects into a scratch container on a throwaway page, measures
them, and removes them. **All detectors proven live:**

| detector | synthetic defect | fired |
|---|---|---|
| clipped text | 120px box, `nowrap`, `overflow:hidden`, long text | yes (`truncated-no-ellipsis`) |
| clipped text | same with `overflow:visible` | yes (`spills-outside-box`) |
| clipped text | same **with** `text-overflow:ellipsis` | correctly silent |
| clipped text | grid child squeezed to 0px holding text | yes (`collapsed-to-zero-width`) |
| right-edge | fixed box straddling the viewport edge | yes (`contentLostAtViewportEdge`) |
| right-edge | box 200px past the edge but clipped away by an ancestor | correctly classified as painting nothing |
| tiling | two overlapping cards | overlap detected |
| tiling | two cards with a 120px dead band | dead space detected, no false overlap |

Two instrument bugs were found and fixed by this self-test before any finding was reported: the
right-edge classifier originally mis-scored clipped-away boxes, and the clipped-text scan originally
**skipped** zero-width elements — the exact blind spot that hid the most serious finding below.

---

## Findings that matter

### 1. Ledger: per-attempt token counts render at zero width and vanish (360px, and once at 520px)

In the Ledger room at 360px, **42** leaf elements holding text have `clientWidth: 0` with
`scrollWidth` up to 264px. The parent grid resolves to `70px 60px 46px 0px 56.42px 0px` — the
`minmax(0,1fr)` token column collapses to **0px**, and the span has `overflow-x: hidden`, so the text
is neither wrapped, nor ellipsised, nor scrollable. It is simply gone.

Lost strings include `42.1k input · 3.2k output · 18.0k cache read`, `2.4k input · 310 output`,
`8.9k input · 1.1k output · 4.1k cache read`.

Pixel evidence — `screenshots/g1-evidence-ledger360-status-spill.png` shows the attempt row rendering
as `work | user work | completed | Inspect` with **nothing** where the token column belongs;
`screenshots/g1-crossroom-ledger-360.png` shows the turn-level summary line still present, so the
loss is specific to the per-attempt rows. Recurs once at 520px; clean at 768px and above.

Same room, same width: 32 elements **spill** outside their box without ellipsis — e.g. the status word
`completed` needs 51px in a 46px track, ending at x=208 while the next column starts at x=210, so it
overflows its own box with 2px of clearance and does not collide.

### 2. 27 "Open Usage settings" buttons are inert

`data-u11-act="opensettings"` dispatches `new CustomEvent('u11:opensettings')`, and **no listener for
that event exists anywhere in the concept** (`grep` over `_shared/*.js`, `u11-*.js`, `u11-prism.html`
finds the single `dispatchEvent` and nothing else). Confirmed behaviourally, not by reading code: of
314 unique visible controls, real mouse clicks left the DOM completely unchanged for **10** of them —
every one labelled "Open Usage settings" — with no HTML change, no text change, no toast, no storage
write, no popover. The other 17 instances were not resolvable at click time and are not counted.

The header cog (`#u11Settings`) is separately wired and works.

### 3. Disclosure has no effect on which widgets mount

The mounted widget-type list is **byte-identical at Essentials, Standard and Advanced** in all 13 rooms.

| level | out-of-level widget types mounted |
|---|---|
| Essentials | **12** — `authority` in plans/accounts/free/authority, `analytics` in costs/analytics, `cache` in context/cache, `runs`+`operations` in ledger, `tools`, `signals` |
| Standard | **4** — `authority` in plans/accounts/free/authority |
| Advanced | 0 |

Mechanism (code reading, matching the measurement): `typesForDisclosure` filters the room's declared
types, but `PMWidgets.mount` seeds from `defaultBoard`, and `boardItems()` filters only by
`typeKnown` — the canvas's allowed `types` never constrain the curated board. `load()` has the same
gap for stored layouts, so a board saved at Advanced also survives a drop to Essentials (measured:
the same 12 out-of-level mounts after clicking **Essen** in-page).

The audit's second suspicion also holds: the rail-hidden **Source authority** room renders in full at
Essentials — 1,233 characters of rendered text, 1 mounted `authority` card, heading "Source
authority" — reachable by activating the hidden tab. Screenshot
`g4-essentials-authority-room.png`.

The rail tab itself behaves correctly, but not for the reason it first appears: as loaded it is
invisible at **all three** levels because the rail's "More" group carries `.closed` and
`.u11-moregrp.closed .u11-sub{display:none}` hides every sub-tab. After expanding that group,
visibility is `essentials: false, standard: false, advanced: true` — the disclosure rule is right.

---

## Group-by-group results

### G1 — 8 themes × 8 widths (80 cells, 0 failed)

64 resize cells + 16 fresh-load cells at 360/2500, viewport height 1000, theme set via
`localStorage 'pm.theme'` before any page script runs.

| check | result |
|---|---|
| (a) page horizontal overflow | **0 / 80** cells. `scrollWidth == clientWidth` everywhere |
| (b) elements past the viewport right edge | 1–6 boxes per cell; after classification, the only one that is visible **and** paints/loses content is `div#glassBg > i.gb-b`, the decorative aria-hidden glass blob, in the 20 glass-theme cells. All others are closed popovers parked off-canvas or content clipped inside `overflow:auto`, and are itemised as such per cell |
| (c) clipped text | **0** in the active room in all 80 cells (366–413 leaves checked per cell). Rooms other than the active one carry `.pm-hidden` and have no layout, so a **cross-room sweep** re-measured all 13 rooms at all 8 widths → 2 findings, both Ledger (finding 1 above) |
| (d) console | **0** console errors and **0** pageerrors in every cell |
| (d) font CDN | reported separately, never suppressed. The Google Fonts stylesheet request returns `transferSize: 0` (no network in this sandbox) and Chromium raises no `requestfailed`. `Inter, Nunito, Outfit, Rajdhani, Sora` did **not** resolve; `Quicksand, JetBrains Mono, Cal Sans` did |
| (e) `data-theme` | matches the requested theme in **80 / 80** cells |

> **Caveat on (c).** Five web fonts were unavailable, so the page rendered in fallback system fonts.
> Text advance widths therefore differ from production: a build with Inter/Sora/Rajdhani loaded could
> clip where this run did not. The clipped-text result is valid **for fallback metrics only**.

### G2 — dead / clipped controls

314 unique visible controls across all 13 rooms (`button, [role=button], [data-tab], [data-disc],
[data-scope-open], [data-u11link], [data-act]`), deduped by a reload-stable CSS path.

| | |
|---|---|
| click-tested with a real mouse click | 290 |
| **live** (DOM changed) | 243 |
| **dead** (no DOM change, not a no-op by design) | **10**, all "Open Usage settings" (finding 2) |
| no-op by design | 37 — drag-only grip/resize affordances (a click is not their gesture; exercised with real drags in G3) and already-current tabs/levels/presets |
| unresolvable at click time | 24 — not evidence of deadness, reasons recorded |
| controls with no accessible name | **0** |
| icon-only controls with only a tooltip name | **0** |
| controls with clipped label text | **0** |
| not hit-testable after scrolling into view | **1** — `#u11PopX`, the closed scope-picker's close button, whose centre cannot be brought into the viewport while the picker is closed |
| present but scrolled out of their own widget body | 38 — live, but require scrolling `.uw-body` (which is `overflow:auto` and far shorter than its content) |

Two measurement errors were found and corrected here before reporting, and both had produced false
accusations in earlier passes: selectors containing per-load widget `data-uid`s (unresolvable after
reload → 197 phantom "unresolved"), and hit-testing/clicking coordinates without scrolling the
control into view (→ 39 phantom "not hit-testable" and 44 phantom "dead", including "Use next",
"Open provider console" and "Reconnect", all of which are in fact live).

### G3 — widget engine on Overview (never exercised by the concept harness)

Every mutation driven through the real UI; geometry measured before and after.

| step | cards | overlaps | interior dead space | flash |
|---|---|---|---|---|
| baseline | 6 | 0 | 0×0 | 0 |
| add via picker (`accounts`) | 6→7 | 0 | 342×6 | 0 |
| remove via kebab (`plans`) | 7→6 | 0 | 342×6 | 0 |
| resize by dragging the corner (span 4×8 → 4×11, 308px → 428px tall) | 6 | 0 | 342×6 | 0 |
| move by dragging the grip | 6 | 0 | 342×6 | 0 |
| reset layout | 6 | 0 | 0×0 | 0 |
| move on the restored board (**asserted**) | 6 | 0 | 0×0 | 0 |

- **No overlap** in any state. **No flash**: 12 rect samples per mutation over ~700ms; no card rect ever
  collapsed to 0×0 mid-transition. No orphaned lifted clone or placeholder survived any release.
- **Dead space.** Three gap metrics are reported because conflating them would misrepresent the board:
  raw (the 10px design gutter shows up), gutter-compensated, and **interior** (gutter-compensated,
  restricted to rows above the final row). The 342×354 gutter-compensated gap seen after `add` is the
  **unfilled tail of the last row**, not a hole: the interior figure is 342×**6** px, a sub-gutter
  sliver. There is no interior dead space in any state.
- **Persistence** across a real reload: `pmw:u11-overview` written; item types, spans **and uids**
  identical before and after; tiling unchanged.
- **Reset** restores exactly the curated default board
  `capacity:4x8, plans:4x10, costs:2x11, context:2x11, attention:2x9, accounts:2x9` and rewrites storage.
- **Drag honesty note.** Reorder is **proven** — rendered card order changed from
  `Completion capacity, Plans & limits, …` to `Plans & limits, Completion capacity, …`. Getting there
  required fixing the harness twice: a drop coordinate captured before the lift is stale (lifting a
  card reflows the board), and one captured during the reflow is also stale (the FLIP animation is
  still in flight). With a 520ms settle, reorder succeeds on the pristine and post-add boards; it did
  **not** take on the post-resize and post-remove boards. Given that real reorders were observed and
  that a pure timing change flipped two cases from fail to pass, those two nulls are **not** reported
  as an engine defect — they are **not characterised** and want a human hand-drag to confirm.

### G4 — disclosure

See finding 3. Full mounted-type lists per level per room are in
`groups.G4.summary.mountedTypesPerLevelPerRoom`; the in-page Advanced→Essentials switch path is in
`groups.G4.switchPath`.

### G5 — rooms the concept harness never visits

analytics, tools, signals, cache, attention — at Standard and at Essentials.

All five render non-empty content (601–1,202 characters of rendered text, 1–2 cards each), **no**
empty card bodies, **no** console errors, **no** clipped text, no overlap. Screenshots
`g5-room-*.png`. Content is identical at Essentials, which is finding 3 seen from another angle.

### G6 — context ring, compaction, forbidden labels

- The ring opens from `#sbChips`; **all 7** `COMPACT_SCENARIOS` cycled, in order, each read from the
  rendered status block: `Context compacted` → `Local prune` → `Context compacted` → `No gain` →
  `Deferred · locked` → `Timed out · discarded` → `Compaction failed`. Every result carried the
  standing note "Historical usage totals unchanged."
- **Geometry.** Ring popover fully inside the viewport at 360px (rect 8,8 318×341) **and** at 2500px
  (174,623 318×341). Context Details fully inside the viewport at both widths.
- **Forbidden labels: none present.** `provider_reported` and `provider-reported` appear in neither
  the rendered text nor the HTML of the ring or the details panel. Zero standalone `high`/`medium`
  value labels — the words do not occur at all (`\bhigh\b` = 0, `\bmedium\b` = 0 in both surfaces).
- **What it does show instead.** Ring: `Context 42.2k / 128k · 33%`, a segmented source bar with
  `Messages 46% · System & instructions 18% · Tools 14% · Other 22%`, plan/window meters
  (`5-hour window 78% resets in 2h 14m`, `Weekly window 61%`), `More limits (1)`,
  `Context cache hit 96.8%`, and the actions `Compact now` / `More details`. Details panel cards:
  *Current context, What is in context, What changed, Messages and attempts*, with label/value rows
  `Provider = Claude`, `Account = Claude · Work`, `Connection used = Claude CLI profile · CLI profile`,
  `Model = Claude Opus 4.6`, `Context used = 42.2k / 128k · 33%`, `Context cache hit = 96.8%`,
  `Current window = since 11:42 EDT`, `Last activity = 14:40 EDT`, `Stable prefix = sp-88`,
  `Cache epoch = e-12`, `Tool schema overhead (PM-derived) = 5.9k · 5% of window · pm derived`.
  One observation, not a forbidden-label hit: that last value renders the raw-ish provenance token
  **`pm derived`** in ordinary context UI.

### G7 — reduced motion + embed

| | |
|---|---|
| `html[data-reduced-motion="1"]` applied | yes, and applied **before boot** (first successful set recorded at `readyState: loading`) |
| page agrees | `USrender.isRM() === true` |
| elements with transition/animation duration > 1ms | **0** (all elements scanned) |
| after a room switch under reduced motion | 0 animating panes, 0 running animations, 0 offenders |
| OS path `prefers-reduced-motion: reduce` (no attribute) | media matches, `isRM() === true`, **0** offenders |
| `?embed=1` | `.title-bar` and `.status-bar` both computed `display: none`, rect 0×0; 27 cards still mount; context chips still built; 0 console errors |
| embed + reduced motion together | 0 console errors, 0 offenders |

### G8 — canonical fixture tokens (ground truth, no verdict)

13 fixtures from `tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json`, searched against
a 35,778-character DOM corpus (all 13 rooms at Advanced + ring + details) and a 76,766-character
bounded walk of `window.U11`.

- **MUST tokens as literals: almost entirely absent.** 2 of 79 appear literally in the DOM
  (`provider_payload_hash` in GUI-USG-002 and GUI-RAW-001); 0 appear literally in `window.U11`.
- The fixtures are written in `snake_case` while the data model is `camelCase`, so the camel form was
  probed too: **7 of 13** fixtures have MUST concepts present that way — `sourceClass`,
  `windowKind`, `cacheRead`, `projectionFreshness`, `projectionHealth`, `quota`, `credits`. Several
  colon-tokens also have their *value* half in the DOM (e.g. `unknown`, `0`, `reported`).
- **MUST_NOT tokens: 2 DOM hits, both innocuous prose**, quoted here so nobody misreads them —
  `success` inside "patch already applied · **success**ful no-op · zero mutation", and `credentials`
  inside "raw is redacted — **credentials**, raw payloads, account ids and local paths are withheld".
  One data hit: `$0.00` inside `cost per child = $0.00 · plan included`.
- No judgement is drawn. A machine token can be absent as a literal while the same fact is rendered
  as prose; both states are recorded per token per fixture in `groups.G8.fixtures`.

### G9 — honesty guards, verified in the rendered DOM

| guard | result |
|---|---|
| (i) no unknown value rendered as 0 / $0.00 | 8 zero renderings in the whole app, **0** of them in a row that also carries an unknown/unavailable/not-exposed marker. All 8 are legitimate counts or percentages: `Saved reset 0 %`, `Zen balance 0 %`, `Running 2 Done 0 Queued 6`, `Running 0 Done 0 Queued 0` |
| (ii) Mistral / Fireworks / OpenRouter / Cohere | **absent from the DOM** — rendered text and `outerHTML`, all 13 rooms plus both context popovers. All four **are** present in the loaded `window.U11` data (as unconfigured entries) and are correctly never rendered |
| (iii) maintenance/operations card shows tokens or cost | **no**. The `operations` card ("Maintenance & operations", 2,239 characters) contains 0 token-count matches, 0 currency matches, 0 bare thousands-separated numbers. It states "Installer time is maintenance, not model usage. The verify step made one real model call (recorded separately)." |
| (iv) cost split | consistent. 10 occurrences across overview/costs/analytics: `API-billed $61.85`, `Plan-included $125.57`, `$187.42 spent of $300.00 spending limit · warn at 80%`. 61.85 + 125.57 = 187.42 exactly |

---

## Limitations (read these before quoting any number above)

1. **Fallback fonts.** No network in this sandbox: 5 of 8 web fonts did not load. All text-fitting
   results (G1c, G2 clipped labels, G5) hold for fallback metrics only.
2. **`file://` only.** Headless Chromium hangs on `http://` here, so the page was driven from the
   filesystem. Anything that depends on an origin (service workers, real fetches) is out of scope.
3. **One viewport height (1000px).** Width was varied across 8 values; height was not.
4. **G2 coverage is 290 of 314 controls.** 24 could not be resolved or centred at click time; they are
   listed with reasons and are *not* counted as either live or dead.
5. **Two drag states are uncharacterised** (G3): post-resize and post-remove boards did not reorder
   under synthetic pointer input. Not called a defect.
6. **G8 is ground truth, not a verdict.** Literal-token absence is recorded, not interpreted.
7. **Screenshot caveat.** `g1-crossroom-*.png` are captured while the named room is on screen; an
   earlier revision captured them after the room loop and showed the wrong room. Those two files were
   deleted and regenerated.
8. **Group provenance.** All ten groups ran clean end-to-end in one process; G1 was then re-run to
   regenerate the corrected cross-room screenshots, and G6 to capture the details panel's label/value
   rows. Both re-runs used the same harness logic as the full pass for every other group.
