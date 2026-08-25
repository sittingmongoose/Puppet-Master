# Orchestrator notes — read before starting a wave

## Standing rules
- **Do NOT patch `app.js` or `styles.css` directly.** Send the patch to the orchestrator, who
  serializes all shared-file edits. A frozen file is what produced the `renderFileEditor` dead
  end; a single serialization point is the mitigation, not a freeze.
- **Two-harness standard.** A fix is not done when its implementer verifies it. Another agent
  re-verifies with a *different* harness before it counts. This concept shipped a suite reporting
  434/434 PASS while twelve defects were live — single-agent self-verification is exactly how
  that happened.
- **Assert painted pixels.** `getBoundingClientRect()` lies about clipped and in-flight elements.
  Use `document.elementFromPoint()` plus a screenshot-crop colour read.

## CLOSED — do not re-fix
- `.chat-header .icon-button` flex-shrink: **already fixed by Wave 1B**
  (`.chat-header .icon-button, .chat-header .header-chip { flex: 0 0 auto; }`).
  Wave 1A's report lists this as open; that report predates Wave 1B. Orchestrator re-measured
  2026-08-25: 30x30px at 1440 / 1100 / 900, `ownsCentre: true` at every width. **Leave it alone.**
- The mystery second writer to `app.js` was the **orchestrator**, not an agent breaking the rule.
- `--spring` / `--spring-soft` bundle DURATION + easing. Correct in `transition`; in the
  `animation` shorthand the second time value is the **DELAY**. 19 shorthands silently carried a
  440-520ms delay. Fixed via easing-only `--spring-ease` / `--spring-soft-ease`. **In `animation`,
  use the `-ease` companions.** Verified: only the two intentional staggers (`pm-materialize`
  65/110/155ms, `bar-grow` 45ms) still carry a non-zero delay.

## CLOSED — pinned-layout horizontal overflow (was: `body.scrollWidth` 1557 @ 1440)
Root cause: `.assistant-grid.activity-pinned` had hard column minimums
(`224 + 250 + 300 = 774px`) exceeding the pane's real width (657px at 1440 with the editor at
54%). The degradation tiers are **viewport** media queries, but the real constraint is the
**editor split**, which the viewport cannot see — the same class of bug Wave 2 ActivityBar hit
with the bar icons. Fixed by orchestrator 2026-08-25: side columns now `minmax(0,…)` and chat
`minmax(min(300px,100%),1fr)`, so the two side columns compress and the chat column stays whole.
Verified 4 widths x 8 themes = 32 combos, **0 overflowing**, chat column painted in all 32,
0 console errors. Do not re-report.

**Residual, for Wave 5 (not a regression):** at 980px viewport with a 54% editor the history and
activity columns compress to ~78px. Cramped but on-screen and scrollable, vs previously
off-screen. The principled fix is a container query on `.assistant-pane` so the tiers fire on
real available width — NOT attempted here because `container-type:inline-size` implies
`contain:layout`, which makes the element a containing block for absolutely-positioned
descendants and could regress overlay positioning. Needs its own test pass.

## CLOSED — build.py locale-dependent encoding (Wave 1A, orchestrator-verified)
`read_text()`/`write_text()` inherited the **locale's** preferred encoding while the digest called
`.encode()` (always UTF-8) — the two halves disagreed with each other and with the file on disk.
Latent until `data.js` grew 33KB -> 229KB and gained 189 multi-byte characters, moving the first
bad byte to position 2972. Python 3.7+ C-locale coercion (PEP 538/540) hides it, so it only fires
with the safety nets off. Fixed by pinning `ENC='utf-8'` across all reads and both writes.
Orchestrator re-verified 2026-08-25 with a second harness:
`LC_ALL=C PYTHONCOERCECLOCALE=0 PYTHONUTF8=0 python3 build.py --check` -> same hash
(`920ef6f9d3144742`) as the normal-locale build; 12032 CRLF pairs / 0 bare LF; 1151 multi-byte
characters intact. **Do not "simplify" the encoding argument back out.**

## Technique worth reusing
**The built deliverable is an accidental backup of every source as of its last build.** On a tree
with concurrent agents, an mtime plus a size delta looks exactly like a foreign write and usually
is not. Extract the inlined source back out of `index.html` and diff it — that settles "did
someone clobber me" in one command. Two false alarms already dissolved under it.
Also: a size delta between `len(str)` and `stat().st_size` is characters-vs-bytes, not corruption.

## CLOSED — glyph coverage (and a WARNING about the test method)
All nine non-ASCII codepoints the app emits (`· — − × … → ⌘ ’` and friends) render as real,
distinct glyphs in **both** the UI and mono stacks, across all 8 themes. Zero U+FFFD. The
`+92 −18` pill renders a true minus. Verified by Wave 2 Demo Data (proportional) and Wave 1A
(pixel method, both stacks). **Do not re-investigate.**

**WARNING — do not reuse the advance-width heuristic as a regression guard.** Comparing a
character's rendered width against an unmapped-codepoint "tofu" width is only valid in a
**proportional** font. In a monospace font every glyph has the same advance width *by definition,
including the tofu box*, so the check reports 100% missing and looks exactly like catastrophic
font failure. This matters here because the **retro theme sets `--font-ui: var(--font-mono)`**,
so its whole UI is mono, and the diff blocks are mono in every theme. Wave 1A's first run
reported all seven characters missing in every mono context — a false positive it caught only
because the result was *too uniform to be real*.
If you need a glyph guard, use the **pixel method**: render to canvas and compare ink coverage
and bitmap signature against the tofu box.

## The recurring trap in this codebase — read this
An easy proxy standing in for the thing itself. Advance width is not a glyph. A bounding box is
not a painted pixel. A dispatch count is not a render. This project has already logged three
false-positive "fixes" from `getBoundingClientRect()` reporting geometry for clipped elements,
and nearly logged a fourth from the width heuristic above.
**Corollary observed four times this session: the failure presents one layer above where it
lives.** Encoding looked like a build failure. A byte delta looked like a foreign write. A 440ms
animation delay looked like the app being slow. A broken test method looked like broken content.
When something looks like a category of problem you did not expect, check the layer below it.

## The one standing failure in verify_wave2_data.mjs — NAMED AND OWNED
`metaNodes: 0` — per-message model/time metadata is not rendered. It is **item 8, Wave 3
Transcript**, via the `messageMeta` slot. Demo Data shipped `sentAt` + a full `runtime` block on
all 374 messages; nothing consumed them yet. Orchestrator landed the `msgClock()` patch
2026-08-25 so takes 11/14 read the real clock. **Close condition for item 8 is that assertion
flipping to pass, re-verified by Demo Data's harness, not by Transcript's own.**
Harness history: 28/2 -> 29/1 (renderFileEditor fixed) -> 30/1 -> 31/1. The remaining 1 is this.

## Ownership ruling — Edit scoping
"Edit renders on every user message; scope it to the edit-eligible turn" appears in BOTH item 8
(Wave 3 Transcript) and item 13 (Wave 4 Thread Ops). **Wave 3 Transcript owns it. It is already
applied** (`m.eligibleForEdit ? … : ''`, user branch only, genuinely absent not `display:none`).
**Wave 4 Thread Ops must DROP that bullet from item 13.**

## CLOSED — item 8 metadata half (message details panel)
The defect was never "metadata is missing" — it was **"metadata is rendered and it misattributes
the turn"**. `renderMessageDetails` printed Provider/Account/Model from `selectedModel()` (the
*composer's* current model) for every assistant turn, plus hardcoded Started `11:42:08`,
`12,840` in, `$0.084`. All 16 fields were identical on every message in every thread except Turn
ID — and the `route` thread, whose entire purpose is to demonstrate a provider route change,
**actively denied that the route changed**.
Fixed by orchestrator: reads `m.runtime` (provider/account/model/effort/persona/mode via label
maps, startedAt/completedAt as locale clocks, workedSeconds, tokens, computed context %,
cacheHitPct, cost, terminal), falling back to em-dashes rather than literals when runtime is
absent. Orchestrator measured route-02 vs route-08: **4 of 22 fields identical, and those four
are legitimately shared**. Verified independently by Wave 2 Demo Data (the non-implementer):
21 fields, **zero mismatches against the fixture on both turns**. Harness 33 pass / 0 fail.

**Money-row rule, generalised from Wave 1A's dual-cost finding:** every money field must trace to
a fixture cost. Adjacent money values must agree on precision — three rows at 2/3/4dp read as
three different quantities.

## BUILD STATE — do not rebuild while Wave 3 is mid-edit
`build.py --check` goes red whenever an agent is between edits; that is expected, not drift.
Settle "did someone clobber me" with the accidental-backup method rather than rebuilding, because
rebuilding bakes another agent's in-progress state into both deliverables and lets you report a
green you did not earn. Last orchestrator-verified green: `2f77c6f4b5543d25`.

## Item 3(b) attribution — closed by TWO agents, record both
Wave 1A added `data-history-variant` to the history flyout. But every take rule in
`styles.css:365-371` is scoped `.history-panel[data-history-variant="N"]` and there was not one
`.history-flyout[...]` selector, so floating mode still collapsed to take 0 — **the attribute was
present and unused, which is the orphan-selector defect this plan exists to fight.**
Wave 3 History mirrored all seven take rules onto `.history-flyout` in `history.css`.
Do not record 3(b) as "closed by Wave 1A".

## tests/audit.mjs is itself stale — ORCHESTRATOR fixes it in Wave 5, nobody else
Current: 417 pass / 12 fail. Triage:
- **Stale assertions (suite wrong, code right):** `audit.mjs:44` asserts the literal string
  `Compact Now`; item 6 deliberately renames it to u11's `Compact now`. Same for `More Details`.
- **Uncertain:** `close-activity` / `pin-activity` / `start-working` timeouts. Probed: those
  elements are **absent at rest** and only exist once the panel / working card is open. Cannot
  yet distinguish "the audit's setup step broke" from "the element broke".
- **One real regression:** `[data-submenu="deep-plan"]` resolves to **2 elements** (strict-mode
  violation) — something emits a duplicate. Owner unknown.
**No agent should bend its work to satisfy a stale assertion.** Do not edit `tests/audit.mjs`
mid-run either: a suite edited during the run cannot tell anyone anything.

## Instrument errors by the orchestrator — logged for symmetry
1. Verified with `PM56_DEMO.switchThread` (does not exist; the real name is `selectThread`).
   Optional chaining turned it into a silent no-op and I measured the wrong thread.
2. Interception probe reported `message-details` "blocked by `.message-actions`" — its own
   **parent**. Tested `el.contains(hit)` without `hit.contains(el)`. False positive.
Seven instrument errors this run across all agents. Nobody is exempt, including whoever is
coordinating.

## CLOSED — label-map leaks in app.js (Wave 1A found, orchestrator fixed)
`D.labels` ships 11 maps; `app.js` consulted one. Fixed:
- `renderMessageDetails` fallback printed raw `submitted` on **every user turn** (120 of 310 text
  messages have no `runtime`, all user). Now labelled. Verified: renders `Submitted`.
- The fallback also borrowed `selectedModel()` for Provider/Account/Model — the very thing that
  caused the original misattribution. Now prints `—`. **No runtime means the route is not known;
  an honest blank beats a confident default.** Verified: Provider `Local`, Model `—`.
- 5 status sites re-pointed at their correct map via `lblOf(map,v)`.

**Orchestrator error inside that fix, logged:** my first pass sent all 5 sites through
`artifactStatus`, but 2 were **subagent** statuses. The two maps share no keys, so the wrong map
silently fell through to the raw value — **right-looking output from the wrong source**, which no
output check would catch. Caught by re-reading the call sites, not by a test.

## OPEN for Wave 5 — two findings from the label probe
1. **The activity panel renders artifact statuses as `Ready` / `Stale` / `Error` / `Loading`,
   not the mapped `Needs retry` / `Rendering`.** app.js:946 is now superseded by
   `activity-panel.js`'s slot renderer, which capitalises the key instead of consulting the map.
   `error` -> `Error` vs `Needs retry` is a materially different claim. Owner: Activity Panel.
2. **My raw-enum check has a hole, and it is the shape-vs-property trap again.** It tested
   "is the painted text exactly the raw key". Capitalising the key (`error` -> `Error`) passes
   that check while still not using the map. The correct property is **"the painted text equals
   `labels[map][value]`"**, not "the painted text differs from `value`". Any Wave 5 label guard
   must assert the mapped label, not the absence of the key.
3. Probe limitation worth knowing: the activity panel still renders **all five sections
   regardless of selected domain** (item 1, still in progress), so a per-domain scrape collects
   the whole panel. Scope selectors to the section, not the panel.

## The dead-code trap was converted to a contract (Wave 2, harness 35/0)
The `selectedModel()` misattribution on the fallback path is unreachable — but **only because of
an accidental property of the fixture that nothing enforced**: zero assistant text messages lack
`runtime`. Ship one and the misattribution silently returns, on that turn, in a panel nobody
re-checks. Now asserted: (a) every assistant text message carries runtime, (b) the **fallback**
branch obeys the label rule too. Asserting only the happy path is exactly how the fallback drifted.
**Generalise: "unreachable today" is a property of the data, not of the code. Assert it or fix it.**

## Staleness — measured, not asserted
Twelve staleness events across this run. **Every stale claim was about rendered or build state;
not one was about fixtures or source.** Prefer claims about source and fixtures — stable and
diffable. Re-verify rather than relay.
Method for "is the deliverable stale": copy build inputs to a scratch dir, run `build.py` there,
byte-compare. Mtimes lie on this NFS share, "newest source" lists race live agents, and substring
probes can anchor on the wrong file (`app.js` and `data.js` share the first line `(() => {`).

## STALE — Activity Panel's three findings (all verified 2026-08-25)
1. "Pinned layout overflows at every width/theme, cols `224px 250px 300px`" — **fixed before that
   report**; those are the pre-fix values. Re-measured at 1600/1440/1280/1100 x 8 themes with the
   panel pinned: **0 of 32 overflowing.**
2. "`renderFileEditor()` still fabricates its diff" — **fixed by Wave 1A.** `CREATE INDEX
   CONCURRENTLY` occurrences in `app.js`: **0**. `renderDiffLine` present.
3. "`tests/audit.mjs` red for other agents' reasons" — TRUE, and its advice is the keeper:
   **only trust an audit number when `build.py --check` passes AND the sha is stable across two
   consecutive checks.** "Element resolved but click timed out" is that harness's signature for a
   half-written build, not a defect.

## OPEN — HIGH — pinned activity panel collapses to 1px at 1100
`cols: 1px 300px` at 1100 viewport with the editor at 54%. The overflow is gone but the panel is
effectively invisible — arguably worse than the original defect for that surface.
**Why a CSS-only floor cannot fix it:** give the three columns real minimums and their sum
(~680px) exceeds the available pane (~480px), so the overflow returns. The only correct behaviour
is to *remove* a column when the pane is too small, which requires knowing the **pane** width —
the existing tiers are **viewport** media queries and the pane is sized by the user-resizable
editor split, which the viewport cannot see.
**The fix is a container query on `.assistant-pane`** (`container-type:inline-size`) with tiers
that drop history, then activity. **NOT attempted mid-run** because `container-type:inline-size`
implies `contain:layout`, making the element a containing block for absolutely-positioned
descendants — and Wave 3 History is actively working on `.history-flyout`, which Menus already
measured rendering at x=782.6 mid-viewport. Needs its own pass with the flyout settled.

## RULING — `headerExtras` is CLOSED to new registrants
Three registrants landed in one wave (Goals' chip 26px, Menus' worktree control 30px, Lens'
trigger 30px) and collectively overflowed the page at 430px — ten header children summing to
288px in a **249.4px** chat column. Hiding any ONE cleared it, so no single control was "the"
cause. **A shared-resource defect: nobody did anything wrong individually, the aggregate broke.**
Menus fixed it below 760px by reducing the header's fixed costs (`gap 7->3`, `padding 10->5`),
buying 46px — the only slack left, since `.chat-title`/`.chat-meta` are already 0px there.
Verified 8 widths x 8 themes = 64 combos, zero overflow, button still >=29px and hit-testing
to itself.
**Goals / Menus / Lens keep theirs. Wave 4 agents must NOT add a fourth.** The fix buys headroom,
not extensibility. If a control genuinely needs that row later, the row needs a capacity rule
first — a priority order with defined drop behaviour — not another append.

## ROOT CAUSE linking two open defects
Both the 430px header overflow and the 1px activity column at 1100px have the same cause: the
degradation tiers are **viewport** media queries, but the binding constraint is the
**user-resizable editor split**, which the viewport cannot see. Confirmed independently by
Wave 2 ActivityBar (bar icons), Wave 3 Menus (header row), and the orchestrator (grid columns).
One container query on `.assistant-pane` addresses the class. Hold until `.history-flyout` settles.

## CLOSED — item 5 (Menus), 80/80, audit back to 434/0/0/0
Four pre-existing measurement defects found and fixed, all in `positionOverlays()`'s vicinity:
1. **It measured mid-animation.** `animation: menu-pop var(--spring) both` meant every menu was
   measured at `scale(.94)` — the model picker read 394.8x526.4 instead of 420x560 and **covered
   its own trigger by 33px**. This is why the new entrance is a `transition`, not `@keyframes`.
2. A `position:fixed` menu's **width depends on its `left`**, so wrapping and height do too
   (permissions measured 182.3px tall, settled at 211.7px).
3. The measurement pin was still applied when the settled rect was read — parking the model
   picker at the top of the viewport while "does not cover its trigger" happily passed.
4. **Mid-sprout re-measurement**: any `renderOverlays()` inside the 300ms entrance re-placed the
   menu from a transformed box — reproduced a persona menu at gap **-116.8px**, overlapping its
   trigger and hanging off-screen. Needs an *unrelated* re-render inside the entrance to
   reproduce, so a single-open test will never catch it. Sensitive probe: `menus/p11.mjs`.

Architecture note for later waves: `closeMenu()` drops the node and there is no lifecycle slot,
so Menus re-materialises the departing menu as a stripped clone parked on `<body>` where
`pmPatch` cannot see it. All its module state lives on `#pmOverlayRoot` because `pmSyncAttrs`
rewrites the menu's `class` and `style` every render.

## OPEN — needs a SECOND PAIR OF EYES in Wave 5 (not re-running a harness)
- **Menus' close-opacity claim**: that the close stays opaque through most of the collapse is the
  one claim CSS cannot settle. Re-read `close-contact-sheet.png` by eye.
- Plan correction: "worktree immediately after the search icon" is **not achievable** —
  `headerExtras` has three registrants. Live order is search / goal chip / worktree / lens / ring,
  which is what ACD-437 describes anyway.

## CLOSED — header overflow, all tiers reconciled (orchestrator)
Two agents mitigated the same shared budget independently and left a **gap between their tiers**:
Menus tightened `.chat-header` gap/padding below **760px**; Transcript hid its own lens trigger
below **1100px**. At 900px the lens was already hidden but the header still paid the full 7px gap
/ 10px padding -> measured **3px page overflow in basic-dark**.
Fixed by raising Menus' breakpoint 760 -> 1100 to match. Verified **11 widths x 8 themes = 88
combos, 0 overflowing**. Note this is a *module* file edited by the orchestrator after its owner
completed — recorded rather than silent.

**Measured, so nobody re-litigates it:** the lens trigger's withdrawal is genuinely required.
Forcing it visible at all widths overflows **8 of 28** combos, worst **43px** at 900px. It is a
mitigation, not a fix — the row remains full.

## CLOSED — items 8, 9 implemented (Wave 3 Transcript, 45/0)
Notable decisions: no details panel rendered by the module (the orchestrator fixed
`renderMessageDetails` mid-task — "two readers of one record is two places to disagree");
hover gate uses **`visibility` as well as `opacity`**, because an `opacity:0` button is still
hit-testable and "absent at rest" would be a claim `elementFromPoint()` falsifies; message
overflow is an inline disclosure, not a popover, because `.transcript` is `overflow:auto` and a
popover on the last turn would be clipped by its own scroll container.
`window.PM56_MSG_OVERFLOW.register(fn)` is published for **Wave 4 Thread Ops** — the affordance
is absent, not empty, when nothing registers.

## OPEN — WAVE 5 MUST DO THESE (two-harness rule)
1. **Item 9 (Context Lens) has had exactly ONE harness — its author's.** Needs an independent
   pass. Highest-value assertions to re-run with a *different* method:
   - the 25-cap **accumulates** (25 selected -> seal -> a 26th shapes in a second operation,
     26 shaped total)
   - **Turn Off**, because "nothing is selected" and "selection is broken" render identically.
   Its `--selftest` runs negative controls, so those have been seen to go red on purpose.
2. **Item 8 closes on Demo Data's rebuilt route-turn diff**, not on Transcript's harness — the
   orchestrator implemented the panel, Transcript implemented the meta row, neither may close it.
3. **Menus' close-opacity claim** needs an eye-check of `close-contact-sheet.png`.
4. Wave 3 Transcript made two minimal, commented edits to `tests/audit.mjs`; both were the test
   asserting pre-item-8 behaviour (an unscoped `getByText('Worked for')` became a strict-mode
   violation against 9 elements; `Message More Details` relied on clicking an invisible button).
   Legitimate, but verify them.

## Reusable technique — the module-blanked A/B baseline
`scratchpad/w3/base/` holds a deliverable built with `transcript.js`+`lens.js` **blanked**, so the
audit can be diffed against it. **This is the only reliable way to tell your own regression from a
concurrent agent's.** Wave 2 ActivityPanel independently invented the same method (emptying its
slot to prove the pinned overflow was pre-existing). Wave 4/5 should use it by default.

## CLOSED — item 6 (Context), 94/94, audit 434/434
Ring patch verified in pixels: `data-value`, `--context-pct` and `title` now agree with the menu
they open on all six threads — 64 / 38 / 62 / 48 / 41 / 6. The contradiction is gone.

## WAVE 5 — `tests/audit.mjs` has NO PER-TEST CLEANUP. Fix it.
Independently reported by Wave 3 Context and Wave 3 Menus. When the stale `Compact Now`
assertion threw, it left the compact menu **open**, and it intercepted pointer events for the
next eight tests. **One copy mismatch cascaded into ten failures**, all pointing at innocent
modules. The orchestrator wasted a probe chasing those phantom interceptions.
Also found while fixing it: unscoped `getByText('More details',{exact:true})` is a **strict-mode
violation against 14 elements** — every message action row carries that label. The old assertion
passed *only* because the menu used Title Case and the message row did not. **An accident, not a
scope.** Both are now scoped to `[data-overlay="root-menu"]`.
Wave 5 must add per-test cleanup (close overlays between tests) and audit the suite for other
unscoped `getByText` matchers.

## Reusable technique #2 — the CONTROL BUILD (three agents invented it independently)
Build a deliverable with your own module's blocks **excised**, run the same suite against it in an
isolated root, diff. Wave 3 Context: its wave showed 19 red; the control showed **28** red, and
every one of the 19 also failed in the control — so its module introduced none of them and
removed nine. Wave 2 ActivityPanel and Wave 3 Transcript built the same thing independently.
**Settles "is this mine?" in one run.** Scripts: `scratchpad/wave3-debug/`, `scratchpad/w3/base/`.

## OPEN — item 6 also needs independent re-verification (two-harness)
`tests/context-verify.mjs` and its screenshot review are both its author's.
Re-run: `node tests/context-verify.mjs` from the concept dir (or `PM56_ROOT=<dir>`).
Its log step 4 documents three false positives it caught **in itself** — including a drawer
measured mid-spring that would have reported a perfectly placed drawer as 20px off-screen.

## CLOSED — items 3 & 4 (History): 60/0 normal, 57/0 reduced, 2/58 negative control
Nine status indicators each with their own **motion** signature (not just colour); `working`
reproduces `.status-orbit` exactly, since that is the requester's pick. Row padding
`min-height 72->44px`, vertical `9/6 -> 3/3`. W1 choreography ported: open left
`translateX(-102%)->0` 240ms, pin narrows **in place** 300->200 while the grid gutter grows to
the same expression. **The close bug is not ported** — the pinned guard sits at Esc and
scrim-click only; the toggle closes a pinned drawer and unpins. The scrim is declarative, so the
reference's "hides on pin, never restores on unpin" defect is structurally impossible.

**USER-VISIBLE CAPABILITY DROP — flagged to the requester, reversible:** the pinned drawer has
**no resize handle**. The floating flyout never had one, but the pinned *grid column* did, so
pin-then-drag is gone. Traded for the invariant that drawer width and transcript gutter are one
expression — which is what makes pin-in-place correct.

## Evidence caution — contact sheets are not timing evidence
History's first contact sheet showed a ~200ms dead period that **did not exist**: it was
Playwright's own click round-trip between the timestamp mark and the event. In-page rAF traces
showed the handler returning in 10-22ms. **Use in-page rAF traces for timing claims, not frame
counts.** (Instrument #8 of the run.)

## PERFORMANCE TRAP — never call `PM56_DEMO.getState()` from a renderer
It is a full `JSON.parse(JSON.stringify(state))` over **~230KB of fixture**. Any helper a renderer
calls must use `snapshot()` instead. (Found by Wave 3 Context.) Related: `renderApp` costs
**25-49ms** on the current fixture while `renderOverlays` costs ~4ms — History routed every drawer
path through `renderOverlays` for that reason.

## DESIGN CONSTRAINT — five theme accents cannot carry six source families
`--accent` and `--positive` are `#19734c` / `#16734c` in retro-light: **the same green**. Context
defined six real `--ctxseg-*` tokens per theme rather than reusing accents. Any future surface
needing 6+ categorical colours must do the same, and must key colour to the **family name**, not
the array index, so a family never changes colour between threads.

## Hardcoded literals also live in CSS, not just JS
`.context-bar i{width:64%}` and `.composition-bar i:nth-child(N)` (five widths + colours at
specificity (0,2,1) — a bare class loses to them). When hunting fabricated values, grep the
stylesheets too.

## CORRECTION — the bundled-token defect fires in `transition` TOO. My earlier note was wrong.
I wrote "`--spring`/`--spring-soft` are correct in `transition`". **They are correct only when the
rule supplies NO duration of its own.** When it does, the token's leading time becomes the
**transition-delay**:
`transition: transform 620ms var(--spring)` -> `transform 620ms 520ms linear(...)`
Measured by Wave 4 Orbit on the stock orbit before replacing it:
`transitionDuration: "0.62s, 0.32s, 0.32s, 0.32s"` / **`transitionDelay: "0.52s, 0s, 0s, 0s"`** —
the ring did not begin turning until a quarter of the 2000ms step had elapsed. Every affected rule
was a working-animation take, so this was "several takes feel laggy" hiding one layer down.
**Fixed: 7 lines / 8 segments in `styles.css`. Re-swept: 0 remaining.**

**THE RULE, restated correctly:**
> Never put a bundled duration+easing token after an explicit duration, in EITHER `animation` or
> `transition`. Use the easing-only companions `--spring-ease` / `--spring-soft-ease` whenever the
> rule states its own duration; use the bundled token only when it is the sole time value.

Detector caution: a naive sweep flags `var(--spring-ease)` too. The `-ease` companions carry no
duration, so `transform 620ms var(--spring-ease)` is CORRECT. Only the bundled forms are defects.

## CLOSED — the editor-split defect class (all three surfaces)
Root cause, confirmed independently by Wave 2 ActivityBar, Wave 3 Menus, Wave 4 Verifier and
Wave 4 ThreadOps: **every degradation tier was a viewport media query, but the width that binds
is the user-resizable editor split.** Invisible to every prior test because they all varied the
viewport and none varied the split.
Reproduction: viewport held at **1440**, split dragged to **70-80%** -> chat column 248-249px,
header content 278px, `button.context-ring` driven **+29px off the page**.
Fixed with a container query on `.chat-stage` (`container: pmChat / inline-size`) dropping
`.chat-meta` / `.pm-lens-trigger` at <=420px and `.goal-chip` at <=340px, in priority order.
**Verified 4 viewports x 6 splits x 8 themes = 192 combos, 0 page-overflowing.**
Containment regression-checked: overlays still position correctly (`inViewport: true`,
`ownsTop: true`) — `contain:layout` did NOT break `positionOverlays()`.

## CLOSED — dialogs painted under the history drawer
`.dialog` carried **no z-index** while `.history-flyout` carries 900, so the drawer painted over
every dialog — app.js's four built-in types included. Found by Wave 4 ThreadOps while building
the destructive confirm ("the modal was not modal"). Added `--z-dialog: 1150` and applied it.
**Modality is deliberately per-dialog, not blanket:** the Demo Studio dialog is draggable and
resizable and must stay non-modal, so a destructive confirm brings its own scrim rather than one
being imposed on every dialog.

## OPEN — minor, found while probing the split
`.wa-count` (the grey step count in the working card) is clipped by ~9-10px at splits of 70-75%.
Content clipped by its own container, **not** page overflow. Cosmetic; Wave 5.

## CLOSED — item 12 (Orbit), 53/0, negative control 6/25
**PLAN CORRECTION — `.orbit-ring{pointer-events:none}` must STAY.** The plan told the agent to
remove it. Wrong: the ring is an `inset:0` overlay that also covers the core, so deleting the rule
makes the **core button unclickable**. The correct fix is the *nodes opting back in*
(`.orbit-node{pointer-events:auto}`). Orchestrator verified live: ring `none`, node `auto`, core
and node both hit-test to **self**, a node click opens a 19-element detail panel, and
`.working-variant-1 .wa-chrome` is **absent** (noChrome, not display:none). 0 console errors.

**Shared trail fixed for every take that uses it** — painted stroke **0.71px -> 1.34px** at rest
and **0.825px -> 1.58px** on the current disc. Blur removed, resting `scale(.86)` removed, the
width/height transition replaced by transform on a constant box, `.wa-track` turned from a
clipping box into a scroller. Note `.wa-track` was clipping at the **default 1440 layout**
(143px of content in a 141px box) — not only "when narrow" as the plan assumed.

**Deliberate reuse of the original class names** (`.orbit-stage/.orbit-ring/.orbit-node/...`)
rather than new ones, because new names would have orphaned six `styles.css` blocks — the exact
defect class this plan exists to fight. Good instinct; copy it.

**Filming found four defects no assertion caught**: the collapse blanked its content then shrank
an empty box; the dial row bulged 160.8 -> 225.3 -> 160.8px mid-expand (interpolating an `auto`
grid track); the core went blank ~40ms on a phase handover; the core label painted 10.3px outside
its own circle. **Its orphan gate over its own file found a fifth**: `agentsForRun()` fell back to
another thread's agents when a thread had none.

## OPEN — Wave 5 eye-check
`scratchpad/w4orbit/02-collapse.png` — one contact sheet appeared to show the panel opening,
vanishing and reopening, while the in-page rAF trace shows a clean monotonic 0->260px. Orbit
believes the trace and suspects CDP frame-arrival ordering but could not fully explain the sheet.
Second pair of eyes needed. (Consistent with History's finding that contact sheets carry
Playwright's own round-trip latency and are not timing evidence.)
Also: trail crispness was measured on takes **0/1/3/8 only**; the rest is inference.

## SUITE FULLY GREEN — 446 pass / 0 fail / 0 console / 0 page errors
Every audit failure this session turned out to be **the suite measuring something the code never
promised**, not a product defect: the `Compact Now` literal, the unscoped `More details` matcher
(14 elements), `Worked for` (9), clicking a correctly-invisible button, and finally
`Phase compact and expand`.

**The last one, in detail, because I got it wrong twice.**
`opened:0, closed:3` did NOT mean a broken toggle — it meant **the disc starts EXPANDED**. After
`completeWorking()` some takes restore an open phase, so the first click collapses and the second
expands. The assertion presumed a starting state and read a working toggle inverted.
It had also **never genuinely passed** — the earlier green came from the loop stopping at take 23.
- My first fix added a **probe click**, which toggled the disc and desynchronised every later
  take. Never measure a toggle by toggling it.
- The correct assertion is the **property**: clicking changes the row count, clicking again
  returns it. State-agnostic; cannot be fooled by which phase is open.
Same shape/property lesson Wave 2 reached from the opposite direction.

## Instrument-error tally, honest: ELEVEN, across every participant including the orchestrator
Mine: `switchThread` (a no-op via optional chaining), `el.contains(hit)` without the converse,
18/26 false positives from a naive `--spring` sweep, DOM-structure standing in for "visibly
different", clicking a drawer that was already open, and the probe-click above.
**No participant was exempt.** The remedy is not more care — it is a second party who checks.
