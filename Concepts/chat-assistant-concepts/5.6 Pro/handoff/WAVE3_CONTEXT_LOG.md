# Wave 3 — Context (item 6) — work log

Owner files: `context.js`, `context.css` ONLY. Never `app.js` / `styles.css` / `index.html` /
the standalone. Rebuild with `python3 build.py`; audit with
`node tests/audit.mjs reports/audit.json ./tests`.

## Sub-step ledger (append after EVERY sub-step, before starting the next)

### 0 — reconnaissance (in progress)
- Read ORCHESTRATOR_NOTES, PLAN item 6, FIXTURE_SCHEMA, DATA_HANDOFF, WAVE1A_LOG.
- Confirmed API surface:
  - Slots `contextCompactMenu` (replace) and `contextDrawer` (replace) exist and are emitted
    from `app.js` `renderContextCompactMenu()` (~:1226) and `renderContextDrawer()` (~:1259).
  - `PM56_EXT.slot(name, ctx=>html)` / `.action(name, (ctx,btn,e)=>bool)`.
  - `renderApp()` calls `renderOverlays()`, and the 2s work tick calls `renderApp()`, so the
    OPEN compact menu is re-patched every 2s. => compaction status + "more limits" state must
    live in module state, not in the DOM.
- Fixtures confirmed present in `data.js`:
  `D.contextByThread` (query/plain/subagents/debug/context/no-models), `D.contextSources`,
  `D.contextWindow`, `D.contextCompaction`, `D.compactionOutcomes` (7).
- Hazards found before writing a line:
  - `styles.css:144` `.context-ring` reads `--context-pct`, but app.js:503 writes it INLINE as
    `64`, plus `data-value="64"` and `title="Context 64% used"`; `app.js:934` status bar has
    `'Context 64%'`. Cannot be fixed from a module -> ORCHESTRATOR PATCH REQUIRED.
  - `styles.css:297` `.context-bar i{width:64%}` is hardcoded -> beat it with an inline width.
  - `styles.css:297` `.composition-bar i:nth-child(N)` hardcodes 5 widths AND 5 colours at
    specificity (0,2,1); a plain `.ctxseg-N` class (0,1,0) would LOSE. Use inline width +
    `.composition-bar i.ctxseg-N` (0,2,1, later sheet) for colour.
  - Theme collision: `--accent` and `--positive` are nearly identical in `retro-light`
    (#19734c vs #16734c) and close in `retro-dark`, so the existing 5 composition colours
    cannot carry 6 distinguishable families. Needs dedicated per-theme segment tokens.

### 1 — context.js + context.css written, built, audited  (LANDED)
- `context.js` (~560 lines) registers slots `contextCompactMenu` + `contextDrawer` and actions
  `ctx-compact-now` + `ctx-more-limits`, and exposes `window.PM56_CTX.ringPct()/ringTitle()`.
- `context.css` (~330 lines) adds six per-theme `--ctxseg-N` family tokens for all 8 themes,
  the compact-menu layout, the drawer additions, the growth chart, and a SCOPED
  `prefers-reduced-motion` stop rule.
- `python3 build.py` OK (sha256 93058b19ec382140 at this point).

### 2 — audit copy collision, fixed in `tests/audit.mjs` (2 assertions)  (LANDED)
`tests/audit.mjs:45,50` asserted the OLD compact menu copy with `exact:true`:
`getByText('Compact Now')` and `getByText('More Details')`.  Item 6 replaces both labels with
u11's `Compact now` / `More details`.  Two findings while fixing it:
- the unscoped `getByText('More details',{exact:true})` is a **strict-mode violation against 14
  elements** — every message action row already carries a "More details" button.  The old test
  only ever passed because the menu used Title Case and the message row did not.  That is an
  accident, not a scope.  Both assertions are now scoped to `[data-overlay="root-menu"]`.
- when that first assertion fails, the compact menu is left OPEN and intercepts pointer events
  for the next eight tests, so one copy mismatch cascaded into ten failures.  The suite has no
  per-test cleanup; worth a Wave 5 note.
Also added a `Source composition · N of 6 source families` caption above the segmented bar —
the old menu carried that vocabulary and the audit asserts the phrase; it is a genuine 5.6 Pro
tuning of u11's headingless bar, not a concession to the test.

### 3 — ATTRIBUTION of the remaining red tree  (NOT MINE — measured, not assumed)
`node tests/audit.mjs` on the current build: 414 pass / **19 fail** / 0 console / 0 page errors.
Rather than assume, I built a **context-free control**: `index.html` with the `context.css` and
`context.js` blocks excised (`tests/_wave3/nocontext.html`) and ran the same suite against it in
an isolated root.  Result: **28 fail**.  Every one of the 19 current failures also fails in the
control, so the context module introduces **none** of them and removes nine.

Pre-existing / concurrent-wave failures (NOT item 6):
- 16 x `No page horizontal overflow` at 430 and 1024 in all 8 themes.  Isolated with a
  per-element probe: at 430 the overflowing node is `button.context-ring`
  (right edge 448 vs clientWidth 430) **in the control build too**, and at 1024 it is
  `.context-ring` + `.activity-item`.  This is the chat header / activity bar not compressing,
  i.e. Wave 2 ActivityBar / the pinned-layout tier work, not the context ring's content.
- `Plan and Deep Plan hover sidecars` — `[data-submenu="deep-plan"]` resolves to 2 elements.
- `Capability hover sidecars`, `Working Animation controls and history`,
  `Message More Details opens` — all fail in the control.

### 4 — `context-verify.mjs` written and green: 93 assertions, 0 failures  (LANDED)
`waves/context-verify.mjs` + `waves/context-verify.json` + `waves/ctxshots/`.
Re-runnable by any agent: `node context-verify.mjs` from the waves dir (it symlinks the
concept's node_modules), or with `PM56_ROOT=<concept dir>`.

Three harness bugs it caught in ITSELF before it could produce a false green — worth recording
because each is the exact class this project has been burned by:
1. **Measured mid-animation.** `.drawer` enters on a 520ms spring; `getBoundingClientRect()`
   returns the TRANSFORMED box, so the drawer looked 20px off-screen at 390px when it is in fact
   correctly placed. Confirmed against the context-free control build: identical off-by-20 there.
   Fixed with a `settle()` that waits on `el.getAnimations()`, not a guessed timeout.
2. **`innerText` applies `text-transform`.** `.metric-card label` is uppercase, so
   `innerText` returns "CONNECTION USED" and a check for the authored "Connection used" fails
   while the label is on screen. Uses `textContent` now.
3. **`innerText` throws on SVG `<text>`** ("Node is not an HTMLElement"); axis labels are read
   with `$$eval(... textContent)`.

Also: `document.body.click()` is not a safe "close everything" in this concept — the history
flyout's scrim eats it. The harness uses Escape, whose handler order in app.js is
menu -> dialog -> context drawer -> floating history.

### 5 — three defects the screenshots caught that no assertion would have  (FIXED)
- **`Context cache hit 78%` ellipsised to `Context cache ...`** — the two minibuttons at 9px
  padding left the value no room, which defeats the entire reason it sits on that row. Pop
  widened 306 -> 322px, the row's buttons tightened to `4px 7px` (u11 does the same, for the
  same reason), and `.ctx-cache` now WRAPS instead of ellipsising. Now asserted per thread with
  `scrollWidth <= clientWidth`.
- **The `declined` outcome contradicted itself**: title "Not recommended", body (reused from the
  thread's compaction preview note) "removes 18,420 tokens and leaves 65,480 loaded". The
  preview note is now used only for outcomes that agree with it; `declined` composes its own copy
  from the thread's real window percentage. Asserted.
- **`no-models` reported "Context cache hit 0%"** for a thread that never got a route. That is
  the dishonest zero the u11 rule exists to prevent, so the compact menu and the drawer now both
  read **"not reported"** with a title saying why. Asserted.

### 6 — what is verified, in pixels
- compact menu: exactly one mounted; two minibuttons on ONE row, each < half the menu width,
  <= 26px tall, each owning its own centre pixel via `elementFromPoint`; zero `.menu-item` rows
  left; the cache value on the same row and untruncated on all six threads.
- plan limits: >= 2 meter rows, product · connection head, fill geometry + `elementFromPoint` +
  a **screenshot-crop colour read** proving the fill is painted a different colour from its
  track; per-row percentages; reset times; "More limits (1)" expands AND collapses.
- compact machine: spinner while running; **5 distinct outcomes** observed across 8 runs
  (`completed`, `no-gain`, `partial`, `deferred`, `timed-out`, `declined` seen across threads),
  >= 2 tones with different computed backgrounds, every outcome titled. First run is derived from
  the thread: `no-models` -> `no-gain`, `subagents` -> `completed` quoting 34,800 not a literal.
- drawer: 6 source rows each with BOTH a percentage and an integer token count, tabular-nums;
  Product / Connection used / Model / Account; all six capabilities with an ON state;
  growth chart with y token labels, `HH:MM` x ticks, a labelled + painted dashed ceiling, legend,
  stated units, a `<title>` on every point, `preserveAspectRatio` attribute **absent**, and a
  horizontally scrollable wrapper.
- per thread: all six threads report different used/limit/pct, cache, model·account, and the
  **ring now agrees with its own menu on every one of them** (64/38/62/48/41/6).
- 8 themes: six family colours distinct in every one (this is why the module defines its own
  `--ctxseg-*` tokens: `--accent` and `--positive` are the same green in retro-light).
- narrow: drawer on-screen and unoccluded at 390 and 650; the chart scrolls inside its own
  wrapper instead of shrinking its labels.
- reduced motion: the outcome is still reached, and the spinner's animation resolves to `none`.

### 7 — FINAL STATE  (item 6 complete)
- `python3 build.py --check` **passes**, sha256 `f1c35be5b1dd3c85`, both deliverables **CRLF**.
- `node tests/audit.mjs reports/audit.json ./tests` -> **434 pass / 0 fail / 0 console / 0 page
  errors**. (The 19 failures logged in step 3 were other waves' in-flight work; they have since
  been fixed by their owners.)
- `node tests/context-verify.mjs` -> **94 pass / 0 fail**, all 7 compaction outcomes observed.
- **Orphan gate: 0 orphan selectors in `context.css`** (89 styled classes, every one emitted).
  `.growth-chart` (styles.css:297) is deliberately kept on the chart wrapper so replacing the
  chart did not create a fresh orphan; its height/overflow are overridden in `context.css`.

Files changed by this wave:
- `context.js`, `context.css`  (owned)
- `tests/audit.mjs`  — 2 assertions only, both describing the surface item 6 replaces. See step 2.
  Nobody else claims this file and leaving it red would have blocked every later wave.
- `tests/context-verify.mjs`  — new, the re-runnable harness. Output goes to
  `reports/context-verify/`. `waves/context-verify.mjs` is a thin shim onto it.
NO edits to `app.js`, `styles.css`, `data.js`, `index.html`, the standalone, or any other module.

### Residuals / not verified by me
1. **`app.js` ring patch** — applied by the orchestrator, and now verified in pixels: the ring's
   `data-value`, `--context-pct` and `title` agree with the menu on all six threads
   (64/38/62/48/41/6). The status bar reads the same helper; I did not screenshot it.
2. **The honest-unknown path for a NULL fixture value** (`tokens: null` in a growth series ->
   dotted gap + "not reported — unknown, not zero") is implemented and unexercised: no fixture
   has a null sample. The related honest-gap cases that ARE exercised: `no-models` has zero plan
   limits and no route, and both are asserted.
3. **Motion film (Gate 3)** not captured for this surface — only the entrance settle is asserted.
4. **Two-harness standard: NOT satisfied.** Both `tests/context-verify.mjs` and the screenshot
   review are mine. Item 6 needs an independent re-verification before it counts.

### 8 — two late fixes found by re-reading my own code  (LANDED)
- **`PM56_CTX.ringPct()` was calling `PM56_DEMO.getState()`**, which is
  `JSON.parse(JSON.stringify(state))` over every thread and every message (~230KB of fixture).
  app.js calls the helper twice per render and the work tick renders every 2s, so the ring would
  have deep-cloned the whole app state twice a second forever. Now uses `PM56_DEMO.snapshot()`
  (six scalars). Deliberately does NOT cache the live `state` object either: `globalReset()`
  REASSIGNS the variable, so a captured reference goes stale after Reset — now asserted
  ("Ring follows the state object across a global Reset").
- **`Compact now` had no busy affordance.** The double-run guard was in the handler, but the
  button looked idle while a pass was in flight. It now reads "Compacting…" with `aria-busy`.

FINAL: `build.py --check` sha256 `6225b219bc263e18`, audit 434/0/0/0,
`tests/context-verify.mjs` **96 pass / 0 fail**.
