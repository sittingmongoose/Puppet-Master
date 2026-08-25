# Wave 2 — Activity Bar (item 7) — work log

Owner: `activity-bar.js` + `activity-bar.css` ONLY.
Audit invocation: `node tests/audit.mjs reports/audit.json ./tests` (Wave 1A's finding).
Build: `python3 build.py` (never hand-edit index.html / the standalone).

## Sub-steps
0. [DONE] Reconnaissance.
1. [next] DATA_HANDOFF.md + hover-card skeleton (5 domains) landing green.
2. [ ] Icon-lit indicators + `.state-mark` removal + Changes diff total on the bar.
3. [ ] Pixel verification.
4. [ ] Screenshots, 8 themes, report.

## Step 0 — RECONNAISSANCE (done)

### Confirmed
- Wave 1A **did** delete the two hardcoded chips. `renderHoverCard` (app.js:1227-1233) now emits
  only `label · summary` + `<p>detail</p>` + one `.hover-stat` pill holding `count` — identical
  in structure for all five domains, exactly as the brief describes.
- `activityDefs()` (app.js:769-826) is derived and additionally publishes `tone`
  (`working|blocked|done|idle`) for this wave. `goalSummary()` prefers `D.goal` and falls back to
  `GOAL_FALLBACK`. `mostRecentArtifact()` sorts on `updatedAt` and falls back to `list[0]`.
- Slot `activityHoverCard` is a **replace** slot, called with `{domain, def}` (app.js:1230).
- `open-agent` → `openEditor('thread-'+id)`, `open-change` → `openEditor('file:'+path)`,
  `open-artifact` → `openEditor(id)` (app.js:1479-1481). All three already exist.

### THE BLOCKER THE PLAN DID NOT ANTICIPATE (and the way around it)
`renderActivityBar()` is at **app.js:828-830 and there is no slot around it**. The 15 registry
slots are: headerExtras, activityPanelBody, activityHoverCard, threadRowStatus, historyChrome,
messageMeta, messageAffordance, messageOverflow, threadMenu, goalSection, contextCompactMenu,
contextDrawer, planEditorActions, questionSurface, workingTake:N — none of them wraps the bar.
So the two bar-markup asks in the brief — *delete the `.state-mark` `<i>`* and *print `+N −M` on
the Changes button* — **cannot be done by emitting markup**, and app.js is closed after Wave 1.

Route chosen (no DOM patching, survives every `pmPatch` tick):
- `renderApp()` already writes `--editor-w` / `--history-w` / `--activity-w` on
  `document.documentElement` and `data-theme` on `<body>`. `pmPatch` only ever touches `#pmRoot`
  and `#pmOverlayRoot`, so **the root element is a render-safe channel**.
- This module registers a **side-effect-only `headerExtras` slot** that returns `''` (extEach
  skips falsy output, so nothing is appended) and uses the call as a per-render hook to publish
  the derived state onto `<html>`: `data-ab-tone-<domain>` and the `--ab-add` / `--ab-del`
  content strings. `headerExtras` is inside `renderChatHeader`, which every `renderApp()` renders.
- `activity-bar.css` then does the painting: `.state-mark` hidden, the sibling `<svg>` lit from
  `[data-ab-tone-*]`, and the Changes `.count` grown a `::before`/`::after` carrying the totals.
- Everything is gated on `html[data-ab-ready]`, which only the module sets — if the module fails
  to load, the stock dots come back rather than the bar losing its indicator entirely.

## Step 1 — MODULE WRITTEN, first green build (LANDED)
`activity-bar.js` (≈300 lines) + `activity-bar.css` (≈200 lines) written.

- Slot `activityHoverCard` → five distinct card builders (`goalCard`/`todoCard`/`agentCard`/
  `changeCard`/`artifactCard`), all keyed `data-k="ab-card"` etc.
- Slot `headerExtras` used as a **side-effect-only per-render hook** (returns `''`), publishing
  `data-ab-<domain>` on `<html>` and `--ab-ink-*`/`--ab-anim-*`/`--ab-shadow-*`/`--ab-add`/
  `--ab-del` on `<body>`. Written on `<body>` and not `<html>` because the theme tokens are
  declared on `body[data-theme]` and a custom property's `var()` is substituted on the element
  that DECLARES it — `--ab-ink-goal: var(--danger)` on `<html>` would resolve to nothing.
- Own document `pointerout` closer for the hover card (180ms, deliberately > app.js's 160ms).

## SANDBOX (crash-safety, and it earned its keep immediately)
The first `python3 build.py && node tests/audit.mjs …` in the real tree **failed**:
`locator('[data-overlay="root-menu"]') Timeout`. Cause: **`goals.js` was mid-write by the
concurrent Wave 2 Goals agent and syntactically invalid** (`node --check goals.js` → error at
line 574), which kills the whole concatenated `<script>` before app.js even parses. Not mine.

So verification runs against an isolated copy at `scratchpad/waves/ab/` (every source copied,
`node_modules` symlinked, `goals.js` replaced by a one-line stub). Result there:
**`build.py` OK, `audit.mjs` 434 pass / 0 fail / 0 console errors / 0 page errors.**
The real tree gets rebuilt and re-audited once goals.js parses again.

## Step 2 — FIRST PIXEL PASS: 21/24, and it found three real things (LANDED)
`abverify.mjs` (in this dir) drives the sandbox standalone over `file://` with chromium-1234.
Every visibility claim goes through `document.elementFromPoint()` **plus** a painted-pixel read
(screenshot the crop → hand the PNG back to the page as a data URL → canvas → `getImageData`).

Passing on the first run: diff total `+311 −115` matches the summed fixture exactly; five cards
with five different texts; every list capped at 5; head counts derived; artifacts in ISO order;
a subagent row hit-tests to itself, survives 400ms of hover, and clicking it set
`activeEditor = 'thread-agent-schema'`; 8 themes clean; reduced motion kills both loops and
`getAnimations()` reports 0 infinite animations; zero console errors/warnings.

### Three failures, all real
1. **`.state-mark { display:none }` was never in the CSSOM.** The rule is in the built HTML but
   `document.styleSheets` did not contain it. Cause: my own comment contained
   `--ab-ink-<star>/--ab-anim-<star>` — the `<star>/` sequence **closed the CSS comment early**,
   and the parser swallowed the next rule while recovering. No console error, no build failure.
   Fixed, and `abverify.mjs` now has a standing CSSOM-presence check for ten key selectors so
   this class of loss can never pass again.
2. **PRE-EXISTING: the activity-bar icons were 0px wide and had never painted.** Measured with
   the module's CSS disabled as well — `.activity-item > svg` computes `width:0px` at 1440x900
   whenever the editor pane is open (the boot state, pane = 433px). The label/count spans are
   `white-space:nowrap` so their automatic minimum size is their full text and they cannot
   shrink; every bit of an over-capacity bar's shrinkage therefore lands on the only item that
   can, the icon — and on the `.state-mark` dot, which was also 0px wide. **The status lights
   this item is about had already been invisible at the default window size.** styles.css drops
   `.label` on a *viewport* query (1180px / 700px) but the bar's width comes from the editor
   split, not the window. Fixed in activity-bar.css: `flex:0 0 auto` on the icon plus
   `container: pmActivityBar / inline-size` on `.activity-wrap` and four container queries that
   take the space out of the labels, then the counts, then the diff total, then scroll.
3. **The hover card overhung a 420px viewport by 1.1px.** `positionOverlays()` measures
   `getBoundingClientRect()` one frame after mount, while `hover-in` is still at `scale(.97)`,
   so it clamps against a card 3% shorter than the real one. Textbook "rect lies about an
   in-flight element". Fixed at the source rather than by padding a number: `.ab-card` overrides
   the entrance to `ab-card-in`, which translates but never scales, so the measured box is the
   final box. Card also became a column flex with `max-height:calc(100vh - 16px)`.

## Step 3 — bar layout tiers, measured not guessed (LANDED)
`.activity-wrap` becomes `container: pmActivityBar / inline-size` and the bar degrades on its
own width. Numbers taken in-browser at 1440x900 with the editor pane open (container = 413px
content box), against the Demo Data agent's grown fixtures (Subagents 14, Artifacts 18):
- five labelled items need **503px** and cannot be tightened into 413;
- the same five as icon + count need **272px**.
So: ≤700px tighten (padding 6, gap 4, 9.5px label) and let the bar scroll instead of squeezing
nowrap text; **≤520px drop the labels**; ≤330px drop the diff total; ≤250px drop the count;
≤220px left-align. Verified: bar 316.6px wide, all five items present and 14px icons painted.
`.activity-item{flex:0 0 auto}` inside the ≤700px tier stops items being squeezed until their
text clips — the failure the pre-fix screenshot showed.

Also fixed my own `abverify.mjs`, which hit the identical comment-terminator hazard in a JS
block comment. Same lesson, two languages, one session.

## Step 4 — TWO MORE DEFECTS, both found by LOOKING at the screenshots (LANDED)

### 4a. The hover card was near-invisible for its first 680ms — pre-existing, whole-codebase
Captured all five cards in basic-dark/basic-light and measured `opacity` at capture time:
**0.044**. `styles.css:284` is `animation: hover-in 240ms var(--spring-soft) both`, and
`--spring-soft` is `440ms linear(...)` — a duration AND an easing. Two time values in an
`animation` shorthand means the second is the **animation-delay**, so the card sat on its 0%
keyframe (opacity 0) for 440ms and only finished appearing at 680ms.
My first harness had PASSED it: the crop still had 211 distinct colours, because the transcript
was showing through a transparent card. Fixed for `.ab-card` by restating the whole shorthand as
`animation: ab-card-in 180ms var(--ease) both` (`--ease` is a bare cubic-bezier, no time).
`abverify.mjs` now waits for `opacity === '1'` and additionally samples the SAME rectangle with
the card closed, asserting the mean RGB moves — "it repaints the pixels under it", which a
transparent card cannot fake.

**Reported, not fixed (not my files):** the same mistake is in styles.css ~8 more times —
`message-arrive 420ms var(--spring-soft)`, `details-open 280/300/360ms var(--spring-soft)`,
`bar-grow 700ms var(--spring-soft)`, `morph-stage 520ms var(--spring)`,
`decision-enter 520ms var(--spring)` — and twice in the Goals agent's new goals.css. Correct
idiom: `animation: name var(--spring) both` (token supplies the duration) OR
`animation: name 300ms var(--ease) both`. Messaged Wave2-Goals; styles.css is closed after 1B.

### 4b. The footers under-reported their own collections
The subagents footer read `4 working · 2 blocked · 1 waiting · 3 complete` — **10 of 14**. The
fixture had grown `queued`, `retrying` and `fallback`, none of which are in FIXTURE_SCHEMA's
`working|blocked|waiting|complete|failed` enum (todos likewise gained `verifying` and
`replanned`). Hand-picked buckets are the same failure mode as hand-written counts.
Replaced with one **status vocabulary table** (`STATUS` + `RANK`) shared by all four list cards:
label, tone and glyph per status, a `humanize()` fallback for anything unknown, `byRank()` for
the five-row preview order, and `histogram()` for the footer — which enumerates **every** status
present, so the footer now always sums to the collection size.

Also removed the `--ab-count-goal` CSS override I was about to need: the Goals agent moved the
abandoned phase out of `phases[]` into `retiredPhases[]`, so `activityDefs().goal.count` and
`PM56_GOAL.progress()` now agree at 3/6 without any help from this file.

Audit on the current sandbox (latest data.js / goals.js / activity-panel.js): **434 pass / 0 fail
/ 0 console errors / 0 page errors.** Horizontal overflow reported by Wave2-ActivityPanel does
not reproduce: `documentElement.scrollWidth` 1440 = `clientWidth` 1440, `body.scrollWidth` 1440,
and an all-element sweep finds nothing past `innerWidth` — with the module CSS on OR off.

## Step 5 — a fourth indicator channel, because two themes make colour ambiguous
`retro-light --accent #19734c` vs `--positive #16734c`, and `retro-dark #60f39a` vs `#74ffb0`:
**working and done are the same green**, and motion cannot rescue that under
`prefers-reduced-motion`. So the tone now carries four channels — colour, a per-tone
`stroke-width` (CSS `stroke-width` overrides the presentation attribute `icon()` writes and
inherits to the paths, verified `2.2px` on the child `<path>`), glow present/absent, and two
deliberately different motion shapes. `done` lost its glow entirely for the same reason.

New harness section forces each tone through the **real data path** (mutate
`PM56_DATA.subagents[].status`, re-render, restore afterwards) in retro-light, retro-dark and
basic-dark and asserts the five signatures are pairwise distinct. Measured retro-light:
working `rgb(25,115,76)` / 2.1px / glow / breathe against done `rgb(22,115,76)` / 1.5px / no
glow / none — three units apart in colour, unmistakable in everything else.

Also applied Wave 2 Goals' correction: `summary().tone` reports `blocked` for
`budget_limited`, but budget exhaustion is a stop, not a fault — the Goal icon reads the status
and paints it **amber**, and `stopped`/`cleared` read idle.

**Sandbox: `abverify.mjs` 28/28.** Cards screenshotted and inspected in basic-dark and
basic-light; bars inspected in all 8 themes.

## Step 6 — FINAL GATES on the REAL tree (DONE)
- `python3 build.py` then `python3 build.py --check` → **PASSES**, both deliverables sha256
  `116bdc30de6622e8`, byte-identical to each other.
- **CRLF preserved**: index.html 11946 CRLF / 0 bare LF; standalone 11946 CRLF / 0 bare LF.
- `node tests/audit.mjs reports/audit.json ./tests` → **434 pass / 0 fail / 0 console errors /
  0 page errors.**
- `abverify.mjs` against the real standalone over `file://` → **28/28.**
- Screenshots looked at: five cards × basic-dark and basic-light (`real_cards/`), the bar in all
  8 themes, the short-viewport flip, and the post-click state (`real_shots/`).
- Files touched: `activity-bar.js`, `activity-bar.css` (new, untracked) and the two generated
  deliverables. Nothing committed.

## OPEN / HANDED FORWARD
1. **`animation:` and `transition:` shorthands that swallow `var(--spring…)` as a DELAY.**
   `--spring` is `520ms linear(...)` and `--spring-soft` is `440ms linear(...)` — duration AND
   easing. `animation: name 240ms var(--spring-soft) both` therefore means *240ms duration,
   440ms delay*. Confirmed by measurement on `.hover-card` (opacity 0.044 at 420ms) and
   independently by the Goals agent on `.goal-phase` (`duration 0.3s, delay 0.44s`) — who also
   found the **transition** form, `transition: width 620ms var(--spring)` → `620ms, delay 520ms`,
   which reads as a laggy machine rather than a bug. Still live in **styles.css** (closed after
   Wave 1B): `message-arrive 420ms`, `details-open 280/300/360ms`, `bar-grow 700ms`,
   `morph-stage 520ms`, `decision-enter 520ms`. **Wave 5 should sweep both shorthands.**
2. **`renderActivityBar()` has no registry slot.** Everything item 7 asks for at the bar itself
   had to be done through root-element state + CSS. It works and it is stable, but if app.js
   ever reopens, an `activityBar` slot is the honest fix.
3. The bar shows icon + count without labels whenever the assistant pane is ≤520px — which is
   the default 1440x900 layout with the editor open. That is a deliberate trade (see Step 3):
   with the grown fixtures the labelled row needs 503px and the pane gives 413.

## Step 7 — pinned-layout overflow: independently measured, NOT the activity bar
Wave 2 Goals reported `body.scrollWidth` 1557 at a 1440 viewport with the Activity panel
**pinned** (my earlier 1440 was panel-CLOSED — we were measuring two different layouts). Re-measured
here with the module's CSS toggled, `pinned.mjs` / `real_shots/pinned.png`:

| | `body.scrollWidth` | top overflowing nodes | bar icons |
|---|---|---|---|
| module ON | **1557** | `.chat-stage` / `.chat-header` / `.transcript` / `.activity-wrap` / `.composer`, all at left 1256.6 × width 300 → right **1556.6** | 14px |
| module OFF | **1575** | `span.count` right **1575.4**, `span.label` right 1557.9 — i.e. the ACTIVITY BAR | **0px** |

Two conclusions:
1. **The residual 1557 is the chat pane's grid column**, not any module: editor 54% + history
   224px + activity 250px leaves the column starting at x=1256.6 and 300px wide, so its right
   edge is 1556.6 before a single byte of module markup exists. Pre-existing, `styles.css`-owned,
   closed after Wave 1B. Logged for Wave 5; agreed with Wave 2 Goals, not touched.
2. **This module makes the overflow smaller, not larger.** With `data-ab-ready` removed the bar's
   own `.label`/`.count` are the two worst offenders and push it to 1575; with the container tiers
   active the bar fits its 280px container exactly (`barScroll` 273 ≤ `barW` 275.3) and drops out
   of the overflow list entirely. The ≤330px tier had already dropped the diff total, the ≤520px
   tier the labels — the tiers do the right thing at 280px without being told about this layout.

Hover card re-checked in the pinned layout: x 1078, 354×308.9, fully inside the viewport,
`elementFromPoint` returns the card. No change needed.
