# Opus 5 — Settings redesign test report

Date: 2026-08-05. Four concepts plus the comparison index.
All testing ran on a throwaway static server bound to an **OS-assigned port (0)**, in an isolated
browser tab, with no output written inside the model folder. No process that this session did not
start was stopped.

---

## 1. Hub validation

```text
python3 Concepts/ConceptHub/validate.py "Concepts/settings-redesign-concepts/Opus 5"
→ Concept validation passed
```

Final result, run repeatedly to see through the flaky mount:

```text
clean passes: 5   mount read errors skipped: 291   real content failures: 0
```

> On this Windows host `python3` resolves to the Microsoft Store stub, so the command was run as
> `python validate.py …` from `Concepts/ConceptHub`. The mount is intermittent (see §7): most
> invocations fail before the validator can read a file at all, with `[Errno 13] Permission
> denied` or `ModuleNotFoundError: No module named 'catalog'`. Those are I/O failures, not
> validation results. **Every invocation that got far enough to inspect the folder returned
> _passed_, and no run ever reported a content issue.**

## 2. Local hygiene guards

Run against the built folder before validation. All pass.

| Guard | Result |
|---|---|
| No emoji in any source file | PASS |
| No coloured `border-left` / `border-inline-start` status accent | PASS |
| No pill silhouette on a primary destination control | PASS |
| No underscored internal labels in markup | PASS |
| `data-concept-model="Opus 5"` on all five registered pages | PASS |
| `pm-concept-ready` + `pm-concept-state` reachable from every standard entry | PASS |
| No shipped test/verification artifacts | PASS |
| `concept-hub.json` and `IMPACT_REGISTER.json` parse | PASS |
| Every JavaScript file parses | PASS |
| No infinite animation outside an explicit spinner | PASS |

One guard initially reported a pill silhouette. It was a **false positive** — the match was a
toggle-switch track, matched line-by-line rather than by rule block. The guard now matches on the
enclosing selector; no destination control is fully rounded.

## 3. Theme, width and shell sweep

Run per concept. "Issue" means a label, value, action or status that spills outside the app frame
or is cut without an elision affordance.

| Sweep | Coverage per concept | Issues found |
|---|---|---|
| All eight themes at 1280, rail open, panel closed | 8 cells | **0** |
| Widths 760 / 900 / 1280 / 1700 / 2200 / 2500 in Friendly Dark and Glass Light | 12 cells | **0** |
| Rail open/closed × Assistant panel open/closed at 900 and 1280 | 8 cells | **0** |
| Reduced motion on/off in Friendly Dark and Retro Light | 4 cells | **0** |

Total: 32 cells × 4 concepts = **128 cells, zero clipping or overflow findings.**
Maximum horizontal page overflow across every cell: **0 px**.

Width-mode thresholds behaved identically in all four:

```text
760 → squeezed    900 → narrow    1280 / 1700 / 2200 / 2500 → normal
```

Effective content width was measured rather than window width. At 1280 in Atlas:
rail open + panel closed **1046 px**, rail closed **1222 px**, both open **706 px**,
panel open + rail closed **882 px**. At 900 the shell is already in narrow mode, so the panel is
withdrawn and the rail is icon-only — the four shell combinations converge on **842 px** by
design rather than by accident.

## 4. Functional smoke checks

The packet's twelve checks.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Search result opens the correct category / subcategory / setting | PASS | Atlas: `half-life` → Context & memory ▸ Assistant memory ▸ `mem-halflife`, disclosure raised to Advanced so the row is actually visible. Ledger: `worktree location` → Git, worktrees & Crew ▸ Worktrees ▸ `wt-location`; `spelling language`, `sandbox` likewise. A manager result opens the manager instead. |
| 2 | Scrolling changes the active subcategory without oscillation | PASS | Monotonic across a six-step scroll sweep in all four. Boundary jitter test (1000 → 1006 → 998 px) held the same section. |
| 3 | Subcategory jump lands at a stable offset | PASS | Atlas 1872 / 513 px; Console 664 px; Stack 826 px; Ledger 457 / 937 px. Repeated jumps land identically. |
| 4 | Provider refresh preserves last-known-good rows during loading | PASS | Model rows before 3, during 3. Banner: "the last catalogue that activated cleanly". Receipt: models.dev activated, Free Coding Models quarantined. |
| 5 | Account selection affects future simulated requests only | PASS | Switching OpenAI to `orchard-ci` moves the "Used next" mark and returns: "Applies to the next request only. A generation already in flight is never migrated." |
| 6 | Model menu exposes effort and Normal/Fast only when supported | PASS | Opus 4.6 and Sonnet 4.6 offer Fast plus Low/Medium/High. Haiku 4.5 shows "Fast not supported by this model" and "Not offered by this model", both disabled. Nothing is inferred from the model name. |
| 7 | Default / inherit / reset state is unambiguous | PASS | Toggling `ctx-prev-chats` → "Changed · default was On" with a Reset control; reset returns "Default" and removes the control. |
| 8 | A manager action returns a visible simulated result or an honest unavailable state | PASS | Every action produces a dated receipt naming the production call. Destructive actions return **Not available here**. |
| 9 | Spellcheck suggestions never replace text automatically | PASS | Underline appears; opening the menu changes nothing; the word changes only on an explicit choice, and is announced. Browser `spellcheck` is off, so what is shown is this service. Keyboard route (Ctrl + full stop) also opens suggestions. |
| 10 | Reduced motion reaches equivalent final states | PASS | Same jump with motion on and off both land at **937 px**. |
| 11 | Every concept remains visually distinct after a theme change | PASS | Forced to one theme (Friendly Light) through the Hub bridge, the four remain structurally different: 11 destination rows / 11 contents entries / 12 column items / 11 table rows, with different first-level structure and grid geometry. |
| 12 | `validate.py` passes | PASS | See §1. |

### Hub bridge

The index drives all four previews through the real protocol
(`pm-concept-hub` → `pm-concept-state`, concept → `pm-concept-ready`). Setting theme to
Glass Light and toggling reduced motion propagated to all four iframes:
themes `["glass-light" ×4]`, reduced motion `["1" ×4]`.

### Hub discovery

`ConceptHub/server.py` **cannot run on this Windows host**: it calls `os.getuid()` at import
time, which does not exist on Windows (`AttributeError: module 'os' has no attribute 'getuid'`,
`server.py:30`). The Hub is a macOS/Linux script — consistent with `StartConceptHub.command`
being a Mac launcher — and this is an observation about the host, not a defect in these concepts.
Nothing in ConceptHub was modified.

Hub *discovery* was therefore verified directly against the Hub's own catalog module rather than
through its HTTP server, which exercises the same code path the server uses:

```text
build_catalog() →
  topic registered:  settings-redesign  ("Settings Redesign")
  model found:       Opus 5  ·  folder settings-redesign-concepts/Opus 5
  presentation:      hybrid
  widthControl:      accepted, max 2600, presets [760, 900, 1280, 1700, 2200, 2500]
  workspace:         index.html            broken = False
  entries:           4 × standard          broken = False
  warnings:          none
```

One earlier catalog read reported the workspace as `broken`. That was isolated and is **mount
flakiness, not a folder defect**: `catalog.safe_child(folder, "index.html")` was called 40 times
and raised `ValueError: path escapes its model folder` once (39 ok / 1 fail, ~2.5%), because
`Path.resolve()` intermittently fails on this SSHFS mount and the containment check then
compares mismatched paths. `index.html` is a regular file and every clean read resolves it.

## 5. Demo data coverage

```text
11 categories · 44 subcategories · 198 settings · 22 manager rows
7 provider families · 19 models · 8 notices · 14 manager datasets
```

Row-state sources present: default 87 · custom 53 · recommended 21 · managed 15 · auto 9 ·
inherited 7 · not configured 3 · unavailable 3. Plus requested-versus-effective on models,
Crew composition, concurrency, shell path and starting directory.

Exposure levels present: standard 146 · advanced 24 · managed 15 · expert 7 · diagnostic 4 ·
unavailable 2.

Every one of the fourteen manager datasets is reachable from a settings row — verified
programmatically, no orphans.

## 6. Bugs found and fixed during testing

These were real defects, not test-harness artifacts, and all were fixed in the shared layer.

1. **Width mode classified before first layout.** The shell measured `.pm-app` while it still had
   no width and latched "squeezed", then never corrected. Every page loaded into the wrong layout.
   Fixed: never classify a box narrower than 200 px, and defer the first evaluation.
2. **The section table was measured before layout, so every jump was a no-op.** Offsets were all
   zero. Fixed with a bounded retry that refuses to record a table of zeroes.
3. **The workspace grid had an implicit auto row**, so the settings document sized to its content
   and never became a scroller. Fixed with an explicit `minmax(0, 1fr)` row.
4. **Jumps depended on CSS `scroll-behavior: smooth`**, which silently does nothing in some
   environments — the jump never arrived. Replaced with an owned rAF tween that always lands on
   the exact offset, with a timer safety net, and reduced motion as a real branch.
5. **`requestAnimationFrame` was load-bearing for correctness.** In a hidden or non-compositing
   tab no frame is served, so measurement never ran and the scrollspy never started. Fixed: rAF is
   now an optimisation everywhere, with timer fallbacks; the scroll-throttle flag can no longer be
   wedged by a frame that never arrives.
6. **A re-measure during a jump hijacked the active section.** `measure()` forced an evaluation
   that ignored the navigation lock, read a mid-travel scroll position, reassigned the active
   section — and the hysteresis band then refused to correct it on arrival. A deep link landed on
   the right setting under the wrong heading. Fixed by making the navigation lock absolute.
7. **Spellcheck swallowed sentence-ending punctuation into the token**, so "recommended." was
   treated as an identifier and the real typo went unflagged, while common words missing from the
   dictionary were flagged instead. Fixed the tokeniser so punctuation only joins when another
   word character follows, and extended the dictionary.
8. **An exposure chip rendered on every ordinary setting** in one concept (`undefined !== "standard"`).
   Fixed.
9. **The Personas manager had no entry point** anywhere in the settings taxonomy. A Personas
   subcategory was added to the demo fixture; recorded in `IMPACT_REGISTER.json` as a probable
   inventory gap.
10. **A search result for an Advanced setting arrived with nothing to focus**, because the current
    disclosure level hid the row. Now the level is raised far enough to render the target; Expert
    controls still arrive behind their guard.

These were found by finally looking at rendered screenshots, not by DOM-geometry assertions (see
§7):

11. **Notice dismissal was a fake no-op in all four concepts** — it announced success and
    re-rendered the same frozen data, so the notice never left. Now a real removal.
12. **Stacked text spans were never blockified** — titles and sub-lines collapsed onto one line and
    overlapped in narrow columns, across all four concepts. 28 selectors fixed.
13. **`-webkit-line-clamp` clipped destination purposes in Atlas**, which the packet forbids; the
    clipping guard had been written to treat a clamp as a legitimate elision affordance, so it
    excused the violation. Both fixed.
14. **Entrance animations used `animation-fill-mode: both` with stagger delays**, so content was
    invisible until the animation completed — and permanently invisible if it never ran. A settle
    safety net now always removes the entrance class.
15. **Stack crushed the settings document to ~190px when a manager column was pushed**, wrapping
    every label one word per line. The root column now pops instead.
16. **Console's notice dismissal called `renderHome;` instead of `renderHome();`** — a bare
    reference to the function, not a call. The dismissed-notice bookkeeping (item 11) was correct,
    but Console's home view never actually re-rendered afterward, so the dismissed notice stayed
    on screen until something else forced a redraw. Fixed to call the function.
17. **At squeezed width (below 820px) the entire content pane collapsed to 0px in all four
    concepts** — Atlas, Stack and Ledger's home page rendered fully blank; Console rendered with
    every line wrapped to roughly one character. Cause: the shared shell's `.pm-body` grid
    (rail / main / panel) relies on source-order auto-placement with no explicit `grid-column`. At
    squeezed width `.pm-rail` is `display: none`, which removes it from the grid item list
    entirely, so `.pm-main` auto-placed into the rail's now-vacant first (0px) track instead of the
    middle content track. Fixed by pinning each region to its own column in `shared/pm-shell.css`
    with three separate single-value rules — `.pm-rail { grid-column: 1; }`,
    `.pm-main { grid-column: 2; }`, `.pm-panel { grid-column: 3; }` — so hiding a sibling can no
    longer shift the layout.
18. **Once that was fixed, Stack's squeezed-width home page still opened onto an empty "Choose a
    place to see its settings" pane**, with the root places list — the only way to navigate from
    there — hidden and unreachable. Cause: the squeezed single-column view always marks the
    last-rendered stack column `is-top`; on first load, with nothing selected, that last column is
    the empty document placeholder rather than the root list. Fixed in `opus-5-stack.js` to keep
    the root column focused until a place has actually been picked.

These were found by a later requirements audit against the packet, not by functional or visual
testing (see §7):

19. **Three of the eleven main/auxiliary model roles from packet §2 were missing** — Approval
    review, MCP/tool routing, and Subagents/Crew roles had no row anywhere in the role
    assignments. Added (`role-approval-review`, `role-mcp-routing`, `role-subagents-crew`).
20. **The core Persona "General" was missing from the Persona manager**, despite being listed in
    packet §3 as one of the core personas. Added.
21. **Two required Advanced spellcheck rows were absent**: "Additional installed language packs"
    and "Thread/project overrides". Added.
22. **"Dictionary source" was marked Advanced**, though the spellcheck contract places it in the
    Normal view. Reclassified to standard exposure.
23. **The provider usage snapshot did not deep-link to Usage** in Console, Stack or Ledger, which
    packet §2 requires. Each concept's provider usage line now opens a real "Open Usage" action.
24. **Spellcheck was attached only to the decorative Assistant composer**, not to any real
    Settings prose input, so the four spellcheck actions (check, suggest, learn, ignore) were
    never exercised against an actual setting. Now also attached to Atlas's "Personal
    instructions" field (`ctx-global-instructions`).
25. **Console nested one `backdrop-filter` inside another in the glass themes** — the docked
    search-results panel sat inside `.co-dock`, which already carries the surface blur, so two
    blurred layers stacked, which packet §5 forbids relying on. Fixed by removing the blur from
    `.co-dock-results` and giving it an opaque theme-scoped background in the two glass themes
    instead.
26. **Three pieces of defined vocabulary were never actually used anywhere**: the capability
    state "Supported through transformation", the free-route qualifier "Subscription-included",
    and the Crew "board/coordination policy" field were all specified or required by the packet
    but did not appear in any rendered concept. Wired in (the Audio input capability, the Kimi
    K2.5 free-route terms, and Crew's Board field).

## 7. Known limitations of this test run

- **The "128 cells, zero findings" sweep in §3 was DOM-geometry only, and it measured the wrong
  failure mode.** It checked for *overflow* — content spilling past its container — and found none.
  It was never built to notice *collapse*: a box that shrinks to zero width and therefore has
  nothing to overflow with, or a column that renders cleanly but is the wrong one. No screenshot
  was captured during that pass because the browser preview tool refused to start against this
  session's UNC working directory (`\\sshfs.kr\...`). A later pass, using a standalone
  headless-Chromium screenshot harness instead of the blocked preview tool, looked at actual
  rendered images for the first time and found the eight defects in §6 (items 11–18). Three of
  those (16–18) were not caught by any earlier check, automated or manual, including the guards and
  the 128-cell sweep. Screenshots themselves were never written into the model folder or kept as
  deliverables — `validate.py` fails a folder that ships screenshots, reports, traces, coverage or
  browser profiles — they were only ever used transiently, outside the folder, to look at the page.
- **Items 19–26 in §6 were found by a requirements audit against the packet, run after functional
  and visual testing had already passed** — passing those tests did not mean the packet's
  requirements were met.
- **`git status` could not be used as the scope check.** Git cannot operate on this SSHFS mount:
  `fatal: failed to stat '//sshfs.kr/...': Function not implemented`. Scope was verified by
  modification time instead — every file in `Concepts/ConceptHub` still dates from 3–4 August,
  before this session. See the caveat below.
- **`Concepts/ConceptHub/__pycache__/` appeared during the session.** Python writes it when
  `validate.py` imports `catalog.py`. It is a byproduct of running the packet's own mandated
  command, not an edit. It was deliberately **not** deleted, because removing a file inside
  `ConceptHub` would itself be a modification of a folder this work must not touch, and other
  model folders are running the same validator concurrently.
- **The Hub's own server could not be started here** (`os.getuid()` on Windows). Preview testing
  used a throwaway static server on an OS-assigned port; the Hub *protocol* and the Hub *catalog*
  were both verified directly. See §4.
- **The mount is intermittent.** Reads and writes fail with `Access is denied` at an unpredictable
  rate, and `Path.resolve()` occasionally misbehaves. Every file was copied with retries and
  verified byte-for-byte with `cmp` after writing; a final pass confirmed **30/30 files identical**
  on the mount. Some listings and command runs in this report needed dozens of attempts.
- **Programmatic scrolling does not emit scroll events in the test browser**, so scrollspy sweeps
  dispatched a synthetic `scroll` event after setting `scrollTop`. This exercises the real handler
  path; it does not prove the browser's own event emission, which is not code under test here.
- **Other model folders were being written concurrently** by other agents during this session
  (`fable`, `Qwen 5.8`, `5.6 Sol`, `CursorAuto` all changed while this ran). None were read or
  modified by this work.

## 8. What remains simulated

Listed in full in `FINDINGS.md` §4. In short: provider sign-in, CLI install, catalogue fetch,
readiness probes, MCP reconnect, free-model setup, log viewing, media generation, Crew selection,
Persona application, and every destructive action. Each returns a dated receipt naming the
production call; destructive actions are refused outright rather than faked.

## 9. Files delivered

30 files. Verified byte-for-byte on the mount after sync.

```text
concept-hub.json  index.html  README.md  FINDINGS.md  IMPACT_REGISTER.json  TEST_REPORT.md
opus-5-atlas.html  opus-5-console.html  opus-5-stack.html  opus-5-ledger.html
concepts/  (4 × .css, 4 × .js)
shared/    concept-hub-bridge.js  pm-data.js  pm-icons.js  pm-search.js  pm-sections.js
           pm-semantics.js  pm-shell.css  pm-shell.js  pm-sim.js  pm-spellcheck.js
           pm-store.js  pm-themes.css
```

`files_modified_outside_model_folder` in `IMPACT_REGISTER.json` is `[]`.

**No concept is recommended over another.**
