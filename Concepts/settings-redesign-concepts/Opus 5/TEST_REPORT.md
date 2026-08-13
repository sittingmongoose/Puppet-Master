# Test report — Opus 5 Settings bakeoff

*Generated 2026-08-12. Every number below was produced by running the thing, not by reading it.*

Verification ran against the pages served by the ConceptHub server on an OS-assigned port, in a real
headless Chromium tab, plus a headless Node harness that loads the shared layer directly.

---

## V1 — Concept validator

```text
cd Concepts/ConceptHub
python validate.py "../settings-redesign-concepts/Opus 5"
→ Concept validation passed: ..\settings-redesign-concepts\Opus 5
exit=0
```

**PASS.** No temporary test or verification material ships in the folder.

---

## V2 — Hub catalog

`GET /api/catalog` for topic `settings-redesign`, model `Opus 5`:

| Field | Value |
|---|---|
| Folder | `settings-redesign-concepts/Opus 5` |
| Workspace | `workspace` → `index.html` |
| Entries | 4 (`opus-5-atlas`, `opus-5-console`, `opus-5-stack`, `opus-5-ledger`) |
| Broken files | 0 |
| Warnings | 0 |

All four pages served **HTTP 200**. The folder index served 200, rendered **4 cards with 4 live
iframe previews**, 9 theme options and 7 width options, and all 8 per-concept register links
(`concepts/<slug>/impact-register.json`, `concepts/<slug>/plan-owner-delta.md`) served **200**.

**PASS.**

---

## V3 — Browser probes

### Boot

| Concept | App mounts | Top bar | Bottom bar | Notification inbox | Page errors |
|---|---|---|---|---|---|
| Atlas | yes | yes | yes | yes | **0** |
| Console | yes | yes | yes | yes | **0** |
| Stack | yes | yes | yes | yes | **0** |
| Ledger | yes | yes | yes | yes | **0** |

Zero `pageerror` and zero `console.error` events across every probe in this report.

### Every assigned manager renders

Each concept was driven to `#/m/<managerId>` for **every** manager in its assignment and checked for a
rendered surface carrying the spec's own title.

| Concept | Manager routes | Rendered | Sections in DOM | Interactive controls (min–max) |
|---|---|---|---|---|
| Atlas | 9 | 9/9 | 7–18 | 21–113 |
| Console | 8 | 8/8 | 2–7 | 5–84 |
| Stack | 12 | 12/12 | 7 | 68–93 |
| Ledger | 15 | 15/15 | 2–6 | 6–26 |

**44/44 manager routes render.** (The provider manager is bespoke in every concept and
does not use the shared `[data-sub]` section markers; it was verified separately by content — 8 provider
cards in Console, 26–93 controls across the four.)

### Deep links, history and bad routes

| Check | Atlas | Console | Stack | Ledger |
|---|---|---|---|---|
| `#/search/<query>` opens the concept's own search with the query applied | PASS | PASS | PASS | PASS |
| Unknown manager (`#/m/manager-nope`) → notice with `role="status"` **quoting the link** | PASS | PASS | PASS | PASS |
| Unknown subcategory (`#/c/agents/nope-sub`) → notice quoting the link | PASS | PASS | PASS | PASS |
| Page stays fully interactive behind the notice | PASS | PASS | PASS | PASS |
| A good route clears the notice | PASS | PASS | PASS | PASS |
| Malformed arity (`#/c/a/b/c/d`) → home, still interactive | PASS | PASS | PASS | PASS |
| `history.back()` returns to the previous route | PASS | PASS | PASS | PASS |
| `history.forward()` returns to the pushed route | PASS | PASS | PASS | PASS |
| Route survives reload (`#/m/manager-usage` restored) | PASS | PASS | PASS | PASS |

Two defects were found here and fixed: **Atlas ignored the `#/search/` route entirely**, and **three of
the four concepts stored `badRoute` but never rendered it** — a dead state field. All four now render the
notice in their own idiom (`.at-badroute`, `.co-badroute`, `.st-badroute`, `.lg-badroute`).

### Persistence

A switch and a select were changed on `#/c/agents`, then the page was reloaded.

| Concept | Control | Before | After click | After reload | Result |
|---|---|---|---|---|---|
| Atlas | `prov-sticky` switch | true | false | false | PASS |
| Console | `prov-sticky` switch | true | false | false | PASS |
| Stack | `prov-sticky` switch | true | false | false | PASS |
| Ledger | `prov-sticky` switch | true | false | false | PASS |
| All four | `prov-default-account` select | "Explicit priority order" | "Most recently used" | "Most recently used" | PASS |

### Notifications

An operation was triggered from the provider manager (`Refresh catalogues`) on each page:

| Concept | Inbox before | Inbox after | Count badge |
|---|---|---|---|
| Atlas | 0 | 1 | `1` |
| Console | 0 | 1 | `1` |
| Stack | 0 | 1 | `1` |
| Ledger | 0 | 1 | `1` |

The receipt reached the title-bar inbox in every concept, which is what makes "sound is never the only
indication" structurally true rather than a promise.

### Search

Typo query `notifcations` returned **8 results across 4 kinds** (manager, setting, subcategory, action)
in all four concepts. The full index carries **416 records across 9 kinds**: category,
subcategory, setting, manager, action, status, diagnostic, provider, model.

---

## V4 — Layout sweep

Width mode is driven through the shell's own width control and the probe waits for
`.pm-app[data-width]` to reach the expected mode before measuring, so nothing is sampled mid-debounce.

| Sweep | Cells | Failures |
|---|---|---|
| Every manager route × 4 concepts × 2 themes × 6 widths | **624** | **0** |
| 4 routes × 4 concepts × 8 themes × 6 widths | **768** | **0** |
| 5 routes (incl. search and the bad-route notice) × 4 concepts × 8 themes × 6 widths | **960** | **0** |
| **Total after fixes** | **2352** | **0** |
| Second audit pass (see V8) | **1440** | **0** |

Checked per cell: no horizontal scroll on `.pm-app`, top bar present, bottom bar present, and no
interactive control clipped outside the app box.

### Defects the sweep found and what fixed them

1. **Atlas provider room overflowed at 900px.** `.at-room-tools` was `flex: none` inside a non-wrapping
   head, so the tool cluster pushed the room 23px wider than the window. Fixed by letting the room head
   wrap and the tool cluster shrink (`flex: 0 1 auto; min-width: 0`).
2. **Ledger spec items were clipped at every width.** Manager items reused `.lg-record`, the *setting
   row* grid (`minmax(0,1fr) 156px 116px 92px`), so a 155px action button landed in a 92px column. Fixed
   by giving spec items their own `.lg-rec` record class instead of borrowing the row grid.
3. **Console manager head overflowed at 760/900px in Retro.** `.co-mode-tools` could not shrink. Same
   fix as Atlas.
4. **Ledger instrument bar overflowed at 760px in Retro.** `.lg-bar` now wraps onto a second line
   instead of driving a scrollbar through the whole record.

---

## V5 — Content bans

Every ban was scanned across **all 63 files in the folder**, then reported against the two sets the
folder actually contains:

- **34 implementation files** — `shared/*.js` (19), `shared/*.css` (2), `concepts/*/concept.{js,css}` (8),
  and the 5 HTML pages. This is where the bans apply.
- **29 documentation and register files** — `README.md`, `TEST_REPORT.md`, `FINDINGS.md`,
  `IMPACT_REGISTER.json`, `concept-hub.json` and the 24 per-concept register files.

**Implementation files: 0 occurrences of every ban.** The banned words do occur in the second set —
`bloom` 35 times, `yolo` 11, `toast` 5, `playwright` 1, `TODO`/"not implemented" 3, `lorem ipsum` 1 —
in every case naming what is superseded, banned or absent, which is what the packet asks the registers
to record.

| Ban | Result in the 34 implementation files |
|---|---|
| `playwright` | **0 occurrences** |
| `yolo` | **0 occurrences** |
| `regular`/`yolo` mode coupling | **0 occurrences** |
| Chip/bloom Settings architecture (`bloom`) | **0 occurrences** |
| Emoji | **0 occurrences** (87 SVG glyphs instead) |
| `TODO` / `FIXME` / "not implemented" | **0 occurrences** |
| Toast stack as a class, function or identifier | **0 occurrences** — the 3 remaining string matches are comments in `pm-shell.js`, `pm-shell.css` and `pm-data-desktop.js` stating that the surface deliberately does not exist |
| `border-left` used as a status accent | **0 occurrences** |
| `role="switch"` (a second ARIA toggle grammar) | **0 occurrences** — uniformly `aria-pressed` |
| Lorem ipsum | **0 occurrences** |
| Unstyled class referenced by JS but absent from CSS | **0** in all four concepts |

One rename was required to reach this: Atlas's `toastReceipt()` named a pattern the architecture bans;
it is now `showReceipt()`, matching the other three concepts.

---

## V6 — Manager coverage gate

Source: `PACKET/MANAGER_COVERAGE_MATRIX.json`. Rule: *missing is a failure; deferred requires a named
canonical owner and insertion contract*.

| Concept | Families required | Demonstrated | Shared grammar | Deferred | **Missing** |
|---|---|---|---|---|---|
| Atlas | 12 | 8 | 4 | 0 | **0** |
| Console | 11 | 7 | 4 | 0 | **0** |
| Stack | 15 | 11 | 4 | 0 | **0** |
| Ledger | 17 | 13 | 4 | 0 | **0** |
| **Total** | **55** | **39** | **16** | **0** | **0** |

**PASS.** Four named deferred owners are recorded with insertion contracts (Project Sync, Browser
Runtime/Expert Browser, RuntimeResourceGovernor policy, Release supply chain) — none of them is a
required family; they are boundaries the packet explicitly puts outside a Settings concept.

---

## Shared-layer harness

Loaded headless in Node with no DOM, asserting the contract every concept depends on:

| Assertion | Result |
|---|---|
| Manager records | 38 |
| Registered builders | 37 (+ 4 bespoke provider surfaces = 38 families) |
| ManagerSpec normalisation failures | **0** |
| Managers whose spec title disagrees with their data record | **0** (was 1: `manager-filesafe` — fixed) |
| `window.PMData` frozen after `pm-data-seal.js` | **true** |
| Search index records | 416 |
| Missing setting ids referenced by a spec | **0** |
| Route grammar cases (26 parse + 8 round-trip) | **34/34** |

---

## V8 — Second audit pass: the packet's full probe list

The first pass ran 6 of the 17 probes `PACKET/09` requires and never swept the surrounding-shell axis.
This pass ran all of them.

| Probe (PACKET/09) | Result |
|---|---|
| Search and typo result | PASS — `notifcations` → 8 results, 4 kinds |
| Destination open | PASS |
| Deep link | PASS — 34/34 grammar cases |
| Subcategory jump | PASS — target section lands at y≈282–323 inside the 117–977 viewport in all four |
| Scrollspy | PASS — 4 distinct active sections across a full scroll in all four |
| Back/forward | PASS |
| Provider refresh | PASS |
| Account/installation expansion | PASS — 8–15 expandable controls per concept, DOM changes on toggle |
| Import preview/cancel/apply/rollback | PASS **after fix** — `cancel` did not exist |
| Sound upload/preview/test fixtures | PASS — upload, preview and pack import present; receipt reaches the inbox |
| Theme preview/apply/fallback | PASS **after fix** — `preview` did not exist |
| Keyboard focus | PASS — 25 tab stops reach a control with a visible ring, inside the viewport |
| No clipped/overlapping text | PASS — 0 text nodes overflow a hidden box |
| No pointer-blocking overlay | PASS — 3 sample points per concept hit real content |
| No stuck resizer | PASS — no resizer surface exists to stick |
| No permanent spinner | PASS — 0 spinners in the `loading` demo state; refresh spinner clears within 4s |
| Manager lazy hydration | PASS — hydration counter is 0 on a category, 1 after opening one manager |

### Surrounding-shell matrix

`PACKET/09` requires the shell states as a test axis. Rail × panel × 6 widths × 4 concepts:

| Sweep | Cells | Failures |
|---|---|---|
| rail(open/closed) × panel(open/closed) × 6 widths × 4 concepts | **96** | **0** |

### Defects this pass found and fixed

1. **Width mode could go stale.** `setWidth()` left reclassification to a `ResizeObserver`, whose delivery
   is tied to the rendering lifecycle. A backgrounded tab could sit at 900px still classified `normal`,
   applying normal-mode rules to a narrow box — observed as **40 clipped controls in Stack**. `setWidth()`
   now schedules the evaluation directly. Classification is deterministic at 124–227ms.
2. **Four persisted keys were dead.** `widthChoice`, `railOpen`, `panelOpen` and `reducedMotion` were
   declared in every concept's store, never written and never restored, while the wiring delta documented
   them as persisted. The shell now reports every review-strip change through one `onShellState` channel
   and restores all five controls at mount. Verified: change all five, reload, all five survive.
3. **Console and Ledger booted the wrong identity theme** (`friendly-light` instead of `glass-dark` /
   `retro-dark`), contradicting the folder index and README. Fixed in the store default, the mount
   fallback and the page's first-paint `data-theme`.
4. **Theme preview and import cancel did not exist.** Both are required probes. Added as real operations:
   preview paints the theme without recording a choice, apply goes through the shell so the choice
   persists.
5. **The first preview implementation poisoned persisted state** — it passed the row id
   (`theme-friendly-dark`) where a theme id was required, producing a `data-theme` that matches no rules
   and storing it. `setTheme()` now rejects unknown ids and falls back to the concept's identity theme.
   Verified by writing `theme-nonsense` into localStorage: all four recover to their own theme.
   Persistence now subscribes *before* the shell mounts, so the corrected theme is captured by the first
   flush rather than left stale in storage: `persist()` only subscribes, and `flush()` snapshots at timer
   fire (250ms), so every write mount makes -- `onShellState` and the restored route alike -- coalesces
   into one payload.

### Regression after the fixes

| Check | Result |
|---|---|
| Identity theme on a clean profile | 4/4 correct |
| Identity theme after a poisoned stored value | 4/4 recover |
| First-paint `data-theme` matches the concept | 4/4 |
| Manager routes render | **44/44** |
| Layout cells (themes × widths × routes, re-run) | **960 + 384**, **0 failures** |
| Page errors across the whole pass | **0** |

---

## Known limitations

- **Everything a production build would send is simulated.** `shared/pm-sim.js` returns seeded receipts;
  no concept has signed in, installed a CLI, spent money or contacted a provider.
- **The dataset is a fixture, not a live system.** 274 settings, 8 providers,
  7 installations and 13 notices were authored to contain connected, unconfigured,
  loading, refreshing, degraded, managed, inherited, unavailable and error states *at the same time*,
  because the packet forbids a single happy path. They are representative, not exhaustive.
- **Retention periods, adapter MVP scope and automatic-update defaults are placeholders.** They are
  recorded as unresolved questions in every impact register rather than presented as decisions.
- **Slint portability is argued structurally, not proven.** The store holds semantic state only and
  layout is measured at explicit checkpoints, which is what a port needs — but no Slint port was built.
- **Accessibility was verified structurally, not with a screen reader.** Status is always icon plus
  word, focus follows document order, live regions announce state changes, and toggles use one ARIA
  grammar (`aria-pressed`) across the shell and all four concepts. No assistive-technology run was done.
- **Print, RTL and locales other than English were not tested.**
