# 5.6 Pro Chat Assistant — repair & polish wave

## Context

`Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html` is the
deliverable for the Puppet Master Assistant chat concept. Twelve defects/gaps were reported
against it, spanning broken panels (Activity Details, selection menus, Context Lens), missing
features (goal phases, new-thread button, plan Revise/Build, transcript metadata, message
selection), and motion/polish work (thread open+pin animation ported from kimi-k3 W1, menu
spring animations ported from PMConcept7, the Orbit working animation rebuilt around clickable
orbiting icons).

## Build mechanics — established before any edit

**The standalone is a generated artifact.** `build.py` inlines
`shell.html` + `styles.css` + `motion.css` + `variants-{a,b,c}.css` + `transcripts.css` +
`data.js` + `motion.js` + `variants-{a,b,c}.js` + `app.js` into BOTH `index.html` and
`PM_Chat_Assistant_5.6_Pro_Standalone.html`. `python3 build.py --check` fails if either
deliverable drifts from a fresh build. So **all edits go in the source files and the
deliverable is regenerated** — hand-editing the HTML is what `--check` exists to catch.

**Three facts that must be handled before the first rebuild:**

1. `python3 build.py --check` **currently FAILS**. The standalone is 104 lines ahead of the
   sources: an uncommitted hand-edit added a **draggable + resizable Demo Studio dialog**
   (`.demo-dialog` / `.demo-resize` CSS, `@keyframes demo-dialog-in`, `defaultDemoGeom()`,
   `clampDemoGeom()`, `openDemoDialog()`, `applyDemoGeomStyles()`, `demoResizeHandles()`, the
   `demo-move` / `demo-resize` pointer branches, and the resize/pointerup/window-resize
   handlers). `index.html` matches the sources, so this feature exists **only** in the
   standalone. Running `build.py` first would silently delete it.
   → **Step 0: back-port that delta into `styles.css` + `app.js`, then rebuild and confirm
   `--check` passes**, so the deliverables and sources agree before feature work starts.

2. Both deliverables are **CRLF** on disk and in HEAD, but `build.py` on Linux writes **LF**,
   which would turn every rebuild into a 5,000-line phantom diff (the repo is on an NFS share
   with 1,508 CRLF files already in HEAD). → Make `build.py` newline-preserving
   (`t.write_text(out, newline='\r\n')`; Python here is 3.13).

3. `variants-c.css` shows as modified in git but `--ignore-cr-at-eol` reports no change — it is
   a pure line-ending flip, not content. Leave it alone.

**Tooling available for visual verification:** Node v20.19.4, `playwright` +
`playwright-core` in `5.6 Pro/node_modules`, `chromium-1234` and `ffmpeg-1011` in
`~/.cache/ms-playwright`, plus an existing harness in `tests/` (`record-motion.mjs`,
`visual-audit.mjs`, `motion-visibility-audit.js`, `audit.mjs`). Per prior sessions in this
sandbox, headless Chromium must be driven over `file://` — http hangs.

## Scope decisions (confirmed with the requester)

- **Activity Details panel:** all **8** concepts get fixed *and* rebuilt so each is a genuinely
  different layout/interaction, not a reskin.
- **Orbit working animation:** only Orbit (take 1) gets the new clickable-orbit layout; but the
  garbled/undersized icon rendering in the **shared phase trail** is fixed for every other take
  that uses it — sizing, crispness, hit targets — **without** changing those takes' layouts.
- **Context ring — two different asks, do not conflate them:**
  - The **compact menu** (the small dropdown off the ring) is the part being *replaced*. Port
    u11's look **and** content, tuned to 5.6 Pro's visual language. The specific complaint:
    5.6 Pro stacks two full-width `.menu-item` buttons for Compact Now and More Details, where
    u11 puts them **side by side as small minibuttons on one action row** — denser and easier
    to read, which is what a compact menu should be.
  - The **More Details drawer** is *kept*. Its design stays; every addition is styled to match
    the sections already there (`.metric-card`, `.context-section`, `.composition-key`).
  - The **ring graphic itself** is unchanged.
  - **Invent sensible fixture data**; do not port u11's data.
- **Demo data:** substantial expansion, roughly **3x**. Every state/enum in the concept gets at
  least one fixture that exercises it; real diff hunks replace the fabricated ones; threads get
  realistic full-length conversations; each activity domain carries enough rows for the 5-item
  hover previews to be real rather than padded.
- **Goal mode is not the plan and not the todo list.** An agent may maintain todos while a goal
  runs, but the two are **not linked**. Goal phases are goal-intrinsic; the Todo domain stays an
  independent surface with its own data.

## How this codebase works (the idioms every change must follow)

`app.js` is one IIFE with closure-private `state` (`app.js:52-65`). Rendering is two
`pmPatch()` calls — a keyed DOM reconciler (`app.js:634-674`) — one into `#pmRoot`
(`renderApp`, `app.js:684`) and one into `#pmOverlayRoot` (`renderOverlays`, `app.js:769`).
Everything is a template string; there are **no inline handlers**. To add a control:

1. Emit `data-action="x"` plus payload (`data-id`, `data-domain`…), and add an
   `if(a==='x'){…; renderApp(); return;}` branch to the delegated `click` listener
   (`app.js:1046`). Inputs use `data-input` + the `input`/`change` listeners.
2. `data-k` decides re-mount: a constant key preserves identity across the 2s work tick so
   transitions can run; a key containing the subject id (`data-k="node:${id}"`) replays the
   entrance exactly when the subject changes.
3. Menus need `data-menu` + `data-menu-anchor` and a branch in `renderMenu()` (`app.js:782`);
   `positionOverlays()` (`app.js:919`) does anchoring, flipping and `--origin-x/y`.

Three traps this codebase has already fallen into, which the work must avoid:
- **`animation-fill-mode:both` beats a declared value.** Used pervasively; it is why
  `.pm-rail-item.enter` sticks at `scale(1)` instead of settling to `scale(.86)`.
- **`prefers-reduced-motion` is selective** (`motion.css:179-195`) — it stops *named* loops.
  Every new looping animation must be added to that stop list or it runs forever.
- **A stale-green suite.** `reports/audit.json` reports 434/434 PASS with zero failures while
  all twelve defects are live. It asserts none of them. New assertions are mandatory.

## Work items

Sources are `styles.css` / `app.js` / `data.js` / `motion.{css,js}` / `variants-*`. The
deliverable is regenerated by `build.py`, never edited.

Numbering differs slightly from the request: your **#5** covered two separate surfaces, so it
splits into **5 (pickers + worktree)** and **6 (context ring)**; your **#6** becomes **7**; and
your **#7** ("the panel concepts are broken") is the same defect as **#1**, so it folds in there.
Everything else keeps your number. **13–15** are the three follow-ups you added: missing thread
operations, demo-data expansion, and the hunt for other unwritten renderers.

**0 — Baseline.** Back-port the standalone's Demo Studio drag/resize into `styles.css` +
`app.js`, make `build.py` newline-preserving, rebuild, confirm `--check` passes.

**1 — Activity Details panel** (`renderActivityPanel` `app.js:525`, sections `app.js:530-541`).
- *The filter is decorative.* `focus-activity` (`app.js:1066`) sets `state.activity.domain`,
  but the panel unconditionally renders all five sections (`app.js:526`), and `domain` only
  drives the head icon. Wire it to actually filter/focus; `state.activityFilter` (`app.js:61`)
  is declared and never read — remove or use it.
- *Todo rows aren't clickable* (no `data-action`, `app.js:537`). Subagents/Changes/Artifacts
  rows *are* wired (`open-agent`/`open-change`/`open-artifact`) — verify in-browser why they
  read as broken; the changes "diff" is fabricated in JS (`app.js:221`) rather than fixture-fed,
  and `data.js:112` has 3 change records with no hunks/patch text at all. Add real diff fixtures.
- *Goal actions are toast stubs* (`edit/pause/resume/stop/clear`, `app.js:1132`).
- **The 8 concepts are dead.** Markup never branches on `state.variants[4]`; the live CSS
  (`styles.css:262`) is cosmetic and options 0 and 3 have no rules at all. But
  **`styles.css:336-343` already defines the eight real structures** — `.activity-goal-tree`,
  `.activity-master-detail`, `.activity-agent-board`, `.activity-ledger`, `.activity-live-feed`,
  `.activity-dashboard`, `.activity-concept-board`, `.ring-mini` — with **zero emitters** in any
  JS file. Write the eight renderer branches against that existing CSS, extending it as needed.

**2 — Goal phases.** There is **no goal model**: `PM56_DATA` has no `goals` key, and "Phase 2 of
4 · 68%" is literal display text in three places (`app.js:514`, `app.js:536`, `renderGoalEditor`
`app.js:131`). Only `todos[].source:'Goal N'` (`data.js:101`) hints at structure.

Phases are canonical, not invented. The correction packet's `DEMO_SCENARIO_MANIFEST.json`
defines the fixture outright — phases `Audit · Research · Prototype · Implement · Verify ·
Handoff`, states `running · paused · updated_replan · blocked · resumed · completed` — and
`GRS-008` treats "goal phase boundaries" as a first-class runtime concept. Requirements to hit:
- Per-phase drill-in: the packet requires being able to "open a specific Todo, child agent,
  diff, or **Goal phase**", and lists a **Goal phase transition** among the required motions.
- Task states (`ACD-417`): `pending, running, verifying, completed, blocked, failed, skipped,
  cancelled, stale, replanned`.
- Blocked must carry `blocker_class, cause, affected scope, last attempted recovery, why
  autonomous recovery cannot continue safely, next safe action` — not a generic failure label
  (`GRS-019`). 5.6 Pro already shows one blocker line; make it structured.
- Material edits produce a visible **Replan** event rather than silently replacing the
  objective; `Stop` and `Clear` stay distinct states.
- Sidebar summary format is preserved exactly as `Running · 8/14 tasks · 3 subgoals active`
  (`ACD-418`).

Add a real `goals` fixture to `data.js` and drive the activity section, the hover card, and
`renderGoalEditor` from it. The existing goal buttons that are toast stubs (`app.js:1132`)
should act on it.

**Verified from source, and it corrects an earlier synthesis of mine.** Reading the actual Codex
Rust tree (`ext/goal`, `state/goals_migrations/0001_thread_goals.sql`, `prompts/templates/goals/
continuation.md`) settles three things:

1. **Goal is not a mode.** `ModeKind` has exactly two variants, `Plan` and `Default` — there is
   no `Goal`. The goal is an orthogonal, thread-scoped, *persisted* object that rides alongside
   whatever mode is active; a Plan-mode turn merely detaches it and stops charging its budget.
   So the concept should be able to show "Goal: 3/5 phases · 42K/100K" in the header regardless
   of what mode the user is in. **Do not build Goal as a mode.**
2. **Goal and todos have zero data linkage in Codex** — you were right. The goal row is nine
   columns with no slot for a checklist; the continuation prompt renders exactly four variables
   (`objective`, `tokens_used`, `token_budget`, `remaining_tokens`); the todo list isn't even
   persisted. The only mention of the todo tool in the whole goal surface is a prompt nudge that
   ends *"do not treat a plan update as a substitute for doing the work."* Codex enforces the
   neighbouring boundary in code — `update_plan` is **rejected outright** inside Plan mode with
   *"update_plan is a TODO/checklist tool and is not allowed in Plan mode."*
   (OMP is the one exception: it embeds the todo phase tree into its goal context — but one-way,
   render-time, and triple-gated, and todos never gate goal completion.)
3. **None of the three has phases on the goal.** Codex's goal is a single ≤4000-char objective
   string; grepping its entire goal surface for phase/milestone/stage/subgoal returns zero. So
   **phases are our addition** — that must be stated honestly rather than dressed up as a port.

**Therefore: phases are goal-intrinsic, authored at goal creation or an explicit replan — never
derived from the todo list.** The todo list is a *replaceable* artifact in all three tools (every
call replaces the whole list), so a phase bar sourced from it would thrash on every rewrite,
renumber mid-run, and — worse — let the agent shrink the goal by shrinking the checklist.

**Shape:**

- `goal { id, title, objective, status, plan?, phases[], currentPhaseId, budget?, progress,
  replans[], blocker? }`. Goal status follows Codex∩OMP: `planning · active · paused · blocked ·
  budget_limited · complete · cleared`.
- `phase { id, title, activeLabel?, status, exitCriterion, evidence?, blocker?, startedAt,
  endedAt }`. Phase status takes OMP's five — `pending · in_progress · completed · blocked ·
  abandoned` — a strict superset of the other two's three.
- **`exitCriterion` is the load-bearing field.** Codex's entire goal loop is "derive concrete
  requirements → identify the evidence that would prove each → inspect current state". A phase
  *with* an exit criterion is that audit, pre-decomposed; a phase *without* one is a progress bar
  with no semantics. Borrow OMP's bar for what counts: binary and evaluator-verifiable — tests
  pass, command exits 0, file exists with property X — and reject subjective "works well / clean".
- `activeLabel` is Claude Code's `activeForm`: a present-tense label ("Running tests") shown
  while a phase is current, so the running state isn't synthesised from the imperative title.
- `replan { at, note, added?, removed? }` — Codex requires an `explanation` on every plan
  revision, and replanning mid-run is treated as normal, not exceptional.
- `evidence { kind, label, ref? }` with `kind` from Codex's completion-audit list:
  `file · command_output · test_result · pr · artifact · runtime`. **Attach evidence only to
  completed phases** — all three tools warn against evidence that is really a promise.

**Invariants the UI must honour** (these are where a naive phase renderer breaks):
- **Exactly one phase `in_progress`** — unanimous across all three.
- **Never `pending → completed` directly**; a phase must pass through `in_progress`. And never
  batch-complete — completions arrive one at a time, so animate them individually.
- **`currentPhaseId` can move backward** (OMP: out-of-order completion legitimately moves the
  pointer to an earlier phase), so do **not** drive a monotonic stepper or progress bar off it.
- Counter is **three numbers**, not two — `{completed}/{total} done, {open} open` — because
  `open ≠ total − completed` once anything is abandoned or blocked.
- Titles are the identity: no synthetic ids on screen, and **no ordinal prefixes baked into
  titles** (`Phase 1:`) — number them in the renderer so a replan reorder doesn't print `3/1/2`.
- Label blocked as **"stalled"** in human copy (Codex deliberately relabels it), and exclude
  blocked phases from any "unfinished work" count while keeping them visible.
- Keep the **plan document separate from the phase checklist**. All three tools separate them,
  and Codex enforces it in code — which is also why item 10's plan editor and this phase list are
  different surfaces.

**Goal phases vs the Todo domain — the rules that keep them honest.** They are different
resolutions of the same work on different clocks (3–7 stable phases vs 5–30 churning todos), and
they will *legitimately* disagree. Two panels, two data sources, one soft presentational join:
- The join is a **foreign key on the todo**, not on the goal: stamp each todo with the
  `goalPhaseId` that was current when it was written. The Todo panel can then label itself
  "Phase 2 · Auth" without the goal ever reading the todo store.
- **Never advance a phase because its todos are all checked.** Phase advancement is an explicit,
  deliberate act — the same weight Codex gives `update_goal`.
- Copy Codex's **authority asymmetry**: the agent may only push a phase *forward* (advance,
  complete, block); only the user may re-open, reorder, or edit one. This is precisely what stops
  an agent from quietly deleting phase 4 to declare victory.
- **Show divergence rather than auto-reconciling it.** Todos working on phase 3 while the goal
  still says phase 2 is active is a real signal, and OMP treats exactly that as worth flagging.
- Both panels must render correctly alone — a goal with zero todos, and todos with no goal.
- **One budget for the whole goal, not per-phase.** Both Codex and OMP meter exactly one token
  budget, and both say explicitly that budget exhaustion is not completion.

For motion, OMP's completion treatment is the one to steal: a ~14-frame strikethrough that
*wipes across* the text rather than snapping on, so it reads as progress rather than deletion.

**3 — Thread History take 6 "Preview Rows"** = `state.variants[1] === 5` (names at `app.js:898`).
- The spinner is `.status-orbit` (`styles.css:123`), `renderStatus` variant 5 (`app.js:93`) —
  confirmed as the one matching Orbit. Add **animated indicators for the other statuses**;
  `statusLabel` (`app.js:84`) has nine: working, reviewing, waiting, idle, complete, blocked,
  failed, paused, recovering.
- **Padding:** `.thread-row` is `min-height:52px; padding:6px 5px 6px 8px` with **no margin**
  (`styles.css:100`), and take 5 raises it to `min-height:72px; padding-top:9px`
  (`styles.css:329`). Reduce, especially the vertical.
- **Two bugs to fix while here:** (a) the flyout `<aside class="history-flyout">` (`app.js:771`)
  carries **no `data-history-variant`**, so in floating mode all eight takes collapse to take 0;
  (b) `styles.css:113` fades the status slot to `opacity:0` on row hover, so the spinner
  vanishes under the cursor.

**4 — W1 thread open/pin animation.** Reference: `kimi-k3/windows/w1-solo-column.{js,css}`.
No FLIP, no View Transitions — it is plain CSS transitions, which ports cleanly:
- *Open:* left drawer `transform: translateX(-102%) → translateX(0)` over **240ms
  `cubic-bezier(.4,0,.2,1)`**, scrim opacity `0 → 1` in step (`w1-solo-column.css:131-164`).
  The JS idiom matters: set `display:''`, force a frame with `requestAnimationFrame`, *then*
  add `.is-open` so the transition runs from the closed transform; on close a **260ms**
  timeout restores `display:none` (`w1-solo-column.js:313-345`).
- *Pin:* the drawer does **not** move — it narrows in place from `min(300px,85%)` to
  `min(220px,42%)` while the main column's `padding-left` grows to the same value over the
  same 240ms, so the transcript slides right into a reserved gutter
  (`w1-solo-column.css:20-38, 158-197`). Scrim goes away; the heavy overlay shadow becomes a
  quiet right border. That is the open-left/pin-left feel to reproduce.
- **Do not port the close bug.** It is `if (drawerPinned()) return;` sitting *inside*
  `closeDrawer()` (`w1-solo-column.js:330-333`) instead of at the two implicit-dismissal call
  sites, so it also swallows the explicit toggle button. Guard Esc and scrim-click only; leave
  the toggle unguarded, and have it unpin so the gutter collapses with the drawer. Also fix the
  sibling defect: `paintPin()` hides the scrim on pin but never restores `display:''` on unpin.
- Thread-pin reordering in the reference is a `list.innerHTML = ''` rebuild — the pinned row
  **teleports** into the Pinned group with no animation. That is the one place to do better
  than the reference: this codebase's `pmPatch` keying plus `flipMoves` (`app.js:696-718`)
  already supports animating the move.
- Note 5.6 Pro has **no exit animation for any overlay** — `closeMenu()` (`app.js:950`) just
  drops the node — so the close transition must be built, and `pmPatch` must be prevented from
  removing the node before it finishes.

**5 — Selection menus + worktree.**
- *Models don't display:* `state.modelView` defaults to `'favorites'` (`app.js:57`) while the
  rail renders "All configured providers" as active, so only 3 of 6 models show
  (`app.js:821-823`). Worse, `toggle-favorite` (`app.js:1103`) mutates the shared fixture and
  `globalReset()` (`app.js:982`) re-clones threads/questions but **not** models — so un-starring
  everything yields a permanent empty state that survives Reset.
- *Scrolling is impossible:* `.overlay-menu.model-menu` sets `overflow:hidden` (overriding
  `overflow:auto`) and gets a definite inline `height` from `modelMenuHeight()` (`app.js:834`),
  but `.model-layout` is a plain block child with `height:auto` — it does **not** stretch to a
  definite parent height, so `.model-scroll`'s `minmax(0,1fr)` never bounds and `overflow:auto`
  never activates. Content beyond the inline height is clipped with no scrollbar. The formula
  also under-measures (rows are ~49-54px not 44, `groups` caps at 4 but "All" yields 5).
  Fix the height chain, not just the number. **There is a second, independent cause** — the
  hardening layer's viewport-clamp and `overflow:auto` rules target class names the renderer
  never emits, so `.overlay-menu` gets neither. See item 15b; Wave 1B fixes that half.
- *Menu animation:* replace `menu-pop` (`styles.css:306`) with PMConcept7's **corner-origin
  spring sprout** (`PMConcept7.html:15563-15717`, JS at `:48218-48300`). The mechanism: JS
  measures the trigger against the popout and writes `--pm6-sprout-ox/oy/tx/ty/sx/sy` so the box
  grows out of — and collapses back into — the corner nearest its trigger. Open is
  `opacity 160ms` + `transform 300ms cubic-bezier(0.22,1.55,0.36,1)` from a **non-uniform**
  closed scale (`scale3d(.72,.48,1)` — taller grow than wide). Close is asymmetric and *stays
  opaque through most of the collapse*: `transform 220ms cubic-bezier(0.45,0.05,0.55,0.2)` with
  the fade delayed to `opacity 45ms ease-in 175ms`. This matches canonical `ACD-439`.
- *List resize spring:* `portalAnimateHeight()` (`PMConcept7.html:48179-48216`) is the technique
  to port for search filtering — measure, lock height, mutate, measure, animate to the new
  height on a `340ms cubic-bezier(0.22,1.72,0.36,1)` overshoot spring, with a `size-bounce`
  keyframe and a `transitionend` + timeout cleanup. It also pins `top:auto` and anchors the
  **bottom** edge, so filtering shrinks the top edge rather than the edge it sprouted from.
- Note: PMConcept7 has **no row stagger and no backdrop** on these menus — don't add either.
  Its sticky search header (`position:sticky; top:0`) is what keeps search usable while
  scrolling, and there are no scroll-shadow masks.
- *Worktree to the top bar:* insert between the search icon (`app.js:259`) and the context ring
  (`app.js:260`) in `renderChatHeader` (`app.js:252`). The `worktree` menu branch (`app.js:786`)
  and `set-worktree` handler (`app.js:1098`) work unchanged. **Must remove the composer copy**
  (`app.js:578`) — `positionOverlays` uses `querySelector` on `data-menu-anchor`, so two
  anchors with the same id would collide.

**6 — Context ring dropdown.** Compact menu `app.js:840`, drawer `app.js:874`.
- **Replace** the compact menu with u11's (`u11-context.js:180-243`, CSS `u11-context.css:16-144`),
  tuned to 5.6 Pro's tokens and themes: head with `used / limit · pct`; segmented composition bar
  with a legend naming the top 3 families and rolling the rest into "N smaller sources P%"; a
  **plan-limits block** (product · connection, meter rows with %, reset times, "More limits (N)"
  expander); a single dense action row — `Context cache hit 78%` on the left, then **small
  side-by-side minibuttons** `Compact now` and `More details` (`.u11ctx-minibtn`, `4px 9px`
  padding) replacing today's two stacked full-width `.menu-item` rows; a post-compact status
  line with the working spinner and ok/info/warn tones; and a `model · account` footnote.
  u11's compact-now state machine (`u11-context.js:271-306`) has seven outcomes worth keeping —
  completed / no gain / deferred / timed out / failed — since "Compact Now" that always succeeds
  is not a concept, it is a placeholder.
- Drawer additions: **token counts alongside the percentages** in source composition (today
  `[['Conversation','34%'],…]`, `app.js:874`, percentages only); **Connection used**, **Product**,
  **Model**, and **capabilities** (`state.capabilities` — Goal/Crew/BSD/Context Lens/ELI5/Thought
  Stream — is never surfaced here today); and a **labelled Context-growth chart** — it is
  currently two bare `<path>`s in a `viewBox="0 0 420 90"` with no axes, ticks, labels, legend,
  gridlines or units, stretched non-uniformly by `preserveAspectRatio="none"`.
- **The growth chart cannot be ported — u11-prism has no context-growth chart.** Grepping the
  whole `usage-concepts` tree for growth/time-series turns up nothing; u11 has a *"What changed"*
  event timeline and a token-analytics stacked column chart instead. So 5.6 Pro's growth chart is
  its own. It stays in the drawer's existing visual language — the fix is **legibility, not a
  redesign**: y-axis reference lines with token values, x-axis time ticks, the window limit drawn
  as a marked ceiling, a legend, explicit units, and hover values. Borrow only the *conventions*
  from u11's analytics chart (`u11-widgets.js:1541-1611`, `u11-widgets.css:359-385`) — tick
  labels, stated units, per-point tooltips, and the honesty rule that a missing value reads
  *"not reported — unknown, not zero"* rather than rendering as zero. Also drop
  `preserveAspectRatio="none"`, which currently stretches the curve non-uniformly with drawer width.
- Two u11 details worth copying exactly: source rows are
  `[dot] [family] [pct%] [tokens]` with tabular-nums (`u11-context.js:593-599`), and segment
  colour is keyed to the **family name, not the array index**, so a family never changes colour
  between threads (`u11-context.js:33-50`).
- Invent sensible fixture data; move the hardcoded literals out of `app.js` into `data.js`.
  The ring itself is hardcoded `--context-pct:64` / `data-value="64"` at `app.js:260`.

**7 — Chat Activity Bar hover.** `renderHoverCard` `app.js:877-883`.
- Delete the two hardcoded chips `"Click for all five categories"` and `"Pin or resize"`
  (`app.js:880`), identical across all five domains.
- Per-domain content: Goal drops its `detail` prose; Todo lists up to ~5 todos; Subagents lists
  up to ~5 with status and **clickable rows**; Changes lists up to ~5 files and the bar button
  shows the running diff total; Artifacts lists the 5 most recent.
- Remove `.state-mark` status lights (`app.js:522`, `styles.css:237`) and light the **icons**
  instead. Note the current lights are static literals (`app.js:514-518`) that pulse identically
  whether work is running or complete — the replacement must derive from real state.
- Hover counts are hand-written and already wrong: Subagents says `2`, `data.js:86` has **5**.

**8 — Transcripts.** `renderTextMessage` `app.js:287`.
- Actions are **only half** hover-gated: assistant messages get `.always` (`app.js:288`,
  `styles.css:146-147`) so they never hide. Gate both roles on hover/focus.
- Add **time and model**. The `<article>` already carries `data-time`, but `msgClock`
  (`app.js:281`) *invents* a clock walking 3 minutes per message from 11:42 — meanwhile every
  fixture already has a real ISO `m.time` (`data.js:4-5`) that **no renderer reads**. Use it.
  Model likewise: `threads[].model` exists in `data.js:129-159` and is never read anywhere.
- Must work across all 16 transcript takes (pure CSS over shared markup).

**9 — Context Lens message selection.** Today it is a wand submenu + canned receipts
(`app.js:814/865/1110`) with **zero** selection capability — no checkboxes, no selection state,
no `select-message` action anywhere. Its own copy ("Selected superseded sources omitted") claims
a mechanism that does not exist. The requirement is well specified in both the packets and
canonical Plans (`ACD-192`/`193`/`194`/`195`, `Plans/assistant-chat-design.md:2045-2077`):

- Modes are exactly **Mute · Focus · Subcompact · Turn Off**. 5.6 Pro currently renders
  `Auto, Focus, Mute, Subcompact, Off` — **`Auto` is not a mode**, and the label is `Turn Off`.
- **Mute and Focus apply immediately** as selection toggles. **Subcompact requires an explicit
  Apply** because it creates a local summary artifact. **Turn Off exits selection mode and
  clears selection state.**
- The cap is **25 messages per Apply operation, not per thread** — multiple operations
  accumulate. So `applied` must be a *list of operations*, not one flat set.
- Per-message applied state: muted (de-emphasised), focused (protected/elevated), subcompacted
  (region replaced by a summary card) — plus **rehydration handles** to restore sources.
- Selection presentation, range behaviour and narrow-width interaction are explicitly
  **design-open**; no packet requires shift-range or select-all, so those are optional polish.

Three sibling concepts already implement this and are worth reading rather than reinventing:
`kimi-k3/_shared/data.js` + `threads/_thread-kit.js` is the most complete (gutter check button,
immediate-apply on toggle, cap enforced on both toggle and apply, subcompact summary card with
a `Rehydrate` button); `qwen-3-8` uses the whole message as the click target with a per-message
"Show full message · clear muted" escape; `opus-5/shared/lens.js` has the best *semantics*
(operations list, a distinct `source` state after rehydration, and an `effectiveHistory()` that
implements the human-search-vs-agent-retrieval split) but its `toggleSelect` is **never called**
by any UI. Note the packet rule that a colored left-edge accent bar may **not** be used for
selection or status.

The selection affordance lives inside `.message`, so it must carry a stable `data-k` or
`pmPatch` will remount it and replay entrances on every 2s work tick.

*(BSD — Back Seat Driver — is thoroughly specified in these same sources but is not one of the
twelve items; leaving it untouched.)*

**10 — Plan Revise/Build.** The transcript card at `app.js:299-302` **already has** wired View /
Revise / Build, and so does the decision host (`app.js:568`). The gap is the **plan's editor
view** — `open-artifact` → `openEditor` → `renderArtifactEditor` (`app.js:142`) → the plan doc
(`app.js:166`) renders prose *describing* "Approve, revise, cancel, or build" with no action row,
while the Mermaid artifact does get one (`app.js:178`). Add the action row there. Also confirm
in-browser that `.plan-actions` on the card isn't being clipped by layout.

**11 — New-thread button.** The `new-thread` handler already works (`app.js:1063`); its only
emitter is inside `.history-head` (`app.js:228`), visible only when history is open. Add an
icon button in `.chat-header` right after the history toggle (`app.js:255`) — and **outside**
that toggle's `historyMode!=='pinned'` ternary, or it disappears whenever history is pinned.

**12 — Orbit working animation** (take 1, `app.js:436-442`, CSS `styles.css:213-214`).
- *Orbiting nodes must become the control.* Today `.orbit-node` has no `data-action` **and**
  `.orbit-ring{pointer-events:none}` (`styles.css:214`) kills hit-testing on the whole ring, so
  even the `title` tooltip is unreachable. Make each node clickable to reveal that phase's
  detail, with subagent entries opening the agent.
- *Drop the icon row for Orbit.* It is the shared phase chrome (`renderPhaseChrome`,
  `app.js:382-431`), not Orbit's own. Give take 1 a `CHROME_OPTS` entry (`app.js:359`) — it has
  none today, which is also why **the entire orbit stage is deleted on completion** (`keepBody`
  false, `app.js:337`) instead of collapsing to the circle.
- *Fix the garbled trail everywhere* (per the scope decision): `icon(name,11)` on a
  `0 0 24 24` viewBox with `stroke-width:1.8` gives ~0.825px strokes, and the resting
  `transform:scale(.86)` (`motion.css:120-145`) drops that to **~0.71px** — sub-pixel at 1×,
  which is the "garbled and too small". Compounding it: `pm-disc-in` blurs 2px on a 15px box,
  the transition animates `width`/`height` (re-centring the SVG by layout every frame), and
  `.enter`'s filled keyframe pins `scale(1)`. Fix sizing/stroke/transform without changing any
  other take's layout. Also `.wa-track{flex:0 1 auto;overflow:hidden}` (`styles.css:186`) clips
  leading discs with no scroll or wrap when narrow.
- *Responsive:* orbit geometry is hard-coded pixels — `translateX(84px)`, track `168px` — and
  the only media query (`styles.css:297`) changes `min-height` but not the radius, so with
  `overflow:hidden` the ring is silently amputated when narrow. Derive the radius from the
  container. Wide = circle left / info right; narrow = circle on top.
- *Collapsed state:* circle centred, clicking an icon expands to details, with transitions.

**13 — Missing thread and message operations.** All four you named are genuinely missing, and the
full gap is **eleven** operations. `renderThreadMenu` (`app.js:844-847`) offers only Pin/Rename/
Fork/Archive (or Restore/Fork when archived), and the message action row (`app.js:287-291`) has
no overflow menu at all, so there is nowhere for the per-message operations to live.
**5.6 Pro has regressed against its own predecessor** — `5-6-sol` shipped all five branch/
restore/rewind rows plus an honestly-disabled Export.

*Missing entirely:*
| Operation | Canonical owner | Where it belongs |
|---|---|---|
| **Delete thread** | `cmd.chat.delete` | thread menu, destructive, confirmed |
| **Export thread** | `cmd.chat.export` | thread menu |
| **Create restore point** | `cmd.chat.create_restore_point` | **message** overflow menu |
| **Rewind to here** | `cmd.chat.rewind` | message overflow + composer rewind FAB |
| **Branch from restore / Delete restore point** | `cmd.chat.branch_from_restore` / `…delete_restore_point` | restore-point detail |
| **Branch from here / with another model / with another Persona** | AGT-012, ACD-447 | message overflow |
| **Copy link**, **Add passage to context** | packet §Branch-and-rewind, §Prior-chats | message overflow / search results |
| **Retry message** | `cmd.chat.retry_message` | failed assistant turns |
| **Request / Await / Spawn related thread**, **outbox retry/cancel** | `cmd.thread.*` | thread actions |

*Present but wrong:*
- **`fork-thread` (`app.js:1069`) is Duplicate, not Branch** — it deep-clones the whole thread
  with no `atMessageId` and no lineage, which the packet explicitly forbids ("does not clone
  every raw message"). Canonical label is **"Duplicate thread"**; a real Branch needs a message
  anchor.
- **Archive** (`app.js:1065`) is the *one* menu action the Plans require to dispatch a cataloged
  command (`ACD-443`), and it flips a boolean with no receipt and no `!active_run_in_thread` guard.
- **"Restore thread"** (`app.js:1066`) is Unarchive; the label collides with restore-point
  vocabulary, which the Plans forbid treating as interchangeable.
- **Edit** renders on *every* user message; it is scoped to the **most recent** user message only.
- **Thread search** has no scope selector — it should default to `Current Thread` with an
  `All Threads` option.

*Correctly absent — do not add:* **Resend** (superseded: `"resend": false`), **message-level
Stop** (belongs to the composer), **message delete** (retired from the catalog).

*Rules this item must respect:*
- **Do not mint command IDs.** The packets' candidate IDs are provisional; reuse the canonical
  ones. Duplicate / Pop out / Cycle layout / Close are deliberately *not* commands.
- **Delete needs a real destructive confirm** — and the concept currently has **no danger-styled
  confirm anywhere**. Copy is locked: title `Delete thread?`, buttons `Delete and keep worktree` /
  `Delete and remove worktree` (with `(has changes)` when dirty) / `Cancel` (default focus),
  worktree cleanup embedded in the same dialog, and **no undo promise**.
- **Rewind must be non-destructive**: write a restore point first, fold later messages into a
  collapsed restorable region, never delete. `kimi-k3/_shared/threadops.js:329-405` is the
  reference implementation.
- Restore-point create/apply/delete each emit a **receipt**; Archive/Pin/Rename/Export/Search
  are receipt-effect too. A `toast()` that mutates nothing is the failure mode here — the
  existing `app.js:1039` "Restore from point" demo trigger is exactly that.
- For anything genuinely not simulated, use the sanctioned **honest-gap pattern**: render the row
  **disabled with a truthful reason**, as `qwen-3-8` and `5-6-sol` do — never a lying toast.

Mechanically: Wave 1 adds a `messageOverflow` registry slot; the Transcript agent renders the row
and its "More" button, and this agent registers the overflow items into it.

**14 — Demo data expansion (~3x).** `data.js` is 32KB and holds the entire dataset; **every other
concept in `chat-assistant-concepts/` ships the same ~350KB handoff fixture and 5.6 Pro is the
only one that doesn't.** The diagnosis that matters: this is not "more rows" — **each Tier-1 gap
is a missing _field_ that a renderer is currently faking in `app.js`.** Fix the field and the
fake disappears.

*Tier 1 — each one unblocks a reported defect:*
| Collection | Now | Target | Kills the fake |
|---|---|---|---|
| `changes` | 3 records, **no diff content at all** | 12 files with real unified-diff `hunks`, all 4 statuses | `app.js:219-222` fabricates 18 lines and prints the same `CREATE INDEX` SQL for every path |
| `subagents` | 5 records | 14 in 3 groups, with `route`, resolvable `parentThreadId`, precomputed `counts` | Four renderers disagree today — `app.js:315` "3 active" over `slice(0,4)`, `:501` hardcodes 2, `:516` says `count:'2'`, `:538` renders 5 |
| `goal` | **absent** | 1 record with the 6 canonical phases + an 8-state array | `Phase 2 of 4`, `68%`, `Revision 4` are string literals at `app.js:513/541` |
| message `runtime` | absent; `m.time` written but **read by nothing** | `{provider,model,mode,effort,tokens,context,cost}` + real `sentAt` on every message | `msgClock()` (`app.js:280`) invents `11:42 + i*3`; `renderMessageDetails` has 16 constants identical for every message in every thread |
| `artifacts` | 13, `updated:'2m ago'` unsortable and out of order | `updatedAt` ISO, payload bodies, a `loading` state | `app.js:527` hardcodes `D.artifacts[0]`, so "most recent" is always the plan |
| `contextSources` | **absent** | 6 segments with integer `tokens`, growth series, window record | Every context number in `app.js:841/874` is a literal; composition has percentages and no tokens |
| `activityDefs` | hand-written literal | **derived** from the collections | Fixes all four subagent-count contradictions at once |

*Tier 2 — contract-required, closes named gaps:* `todos` 8 → 20 on the canonical enum
(`pending|in_progress|completed|blocked|skipped` — today's raw `doing`/`next` are printed
verbatim as user-facing copy); `models` 6 → 14 across 9 accounts with the non-`ready` states
(all six are `ready` today, which is why a thread claiming "two accounts need attention" is
fiction, and one provider = one account makes multi-account routing structurally unreachable);
`questions` 1 flow → 3 (active + queued + completed — `state.questionQueue` is initialised to 2
with only one flow in existence); `phaseRows` 6 → 8 phases; plus absent `operational`
(worktrees/ports/tests/forecast), `warnings`, `scriptedReplies`, and `drafts` collections.

*Tier 3 — volume and two real bugs:* raise 59 messages toward ~320 with **no thread below 12**
(16 of 24 threads currently have ≤2 messages), add one long-history thread, and add long
*user* messages (there are currently zero over the collapse threshold). Two defects to fix while
in here:
- **`plainConversation` is shared by reference between two threads** (`data.js:136` and `:151`),
  so message IDs collide and `state.messageExpanded` — a flat global id map (`app.js:57`) —
  leaks expand state across threads. The packets call state leaking between threads a **hard
  failure**.
- **`data.js` uses `Date.now()`**; every sibling uses fixed UTC ISO strings precisely because
  the trigger contract requires determinism for visual capture. Non-deterministic fixtures make
  a stable screenshot baseline impossible — which matters directly for this plan's Gate 3.

Also plant the three contract-mandated search phrases (`retention window nine days`, `blue
lantern checkpoint`, `canonical source history`) inside collapsed content — they exist in every
sibling concept and in none of 5.6 Pro, and they are the only way to prove search-in-hidden-text.

**15 — Other unwritten renderers.** Yes — the audit found several, and one of them explains the
menu defects in item 5. Verified against an emitted-token set (not naive grep), with the 19
interpolation-based false positives excluded.

**15a — A second Activity-Detail-class defect: the Question & decision family (`variants[6]`).**
Per-option CSS declaration counts are `0 · 2 · 2 · 3 · 1 · 2 · 1 · 5`. Options 4 and 6 are a
**single declaration each**. Names like "Morphing Composer", "Anchored Sheet", "Side Inspector",
"Step Sequence" promise structure and deliver a corner radius. Only option 7 changes layout.
Also **family 0** ("Assistant body & composer") never touches the body — all seven options only
restyle `.composer-*` and `.selector-button`.
*Related bug:* `styles.css:294` re-declares `.decision-evidence{display:block}` **unscoped** in a
media query, overriding `styles.css:232`. On narrow viewports the evidence pane appears in all 8
decision variants, flattening the one option that was actually differentiated.

**15b — The "FINAL HARDENING LAYER" (`styles.css:365-560`) guards components that do not exist.**
~45 of its selectors were guessed rather than read off the renderer — `.popup-menu`, `.menu-panel`,
`.model-picker`, `.activity-domain`, `.activity-chip`, `#overlay-root`, `.resize-handle`,
`.thread-item`, `.live-agent`… none are emitted. **This is a second, independent cause of the
item-5 menu complaints**, and of several others nobody reported yet:
- `.overlay-menu` gets **no viewport clamp and no `overflow:auto`** — the clamp/scroll rules target
  dead names. Menus clip and cannot scroll.
- `@keyframes pm56-popup-in` / `pm56-sidecar-in` **never play**; `--popup-origin` / `--popup-shift`
  are read but never defined anywhere.
- The activity-bar hover lift/press micro-interaction never fires (all three selector names wrong).
- `touch-action:none` / `user-select:none` never reach a resizer — dragging a divider on touch
  scrolls the page and selects text.
- 4 of 6 scroll surfaces still chain their scroll to the page.
- The entire `@media(max-width:700px)` mobile-submenu behaviour is dead.
Fix by pointing these rules at the real class names — cheap, and it repairs a lot at once.

**15c — Nothing ever animates out.** `motion.css:80` defines `.pm-leaving` + `@keyframes
pm-dematerialize` and nothing ever applies them; `.pm-materialize-done` (`motion.css:74`) is never
added either, so every cascade row keeps `will-change` forever — a compositor leak across ~800
animated nodes. `.toast.is-leaving` (`styles.css:532`) is likewise dead: `toast()` (`app.js:957`)
splices the node out after 2800ms with no exit class, so toasts vanish instantly. This is the same
root cause as the missing overlay exit animations in items 4 and 5.

**15d — Twelve buttons that only fire a toast.** `copy-message` claims "Message copied" and
**there is no `navigator.clipboard` call anywhere in the codebase**; `copy-mermaid` likewise.
`dismiss-event` says "Receipt dismissed" and the card stays on screen. `export-context` exports
nothing. `pause/resume/stop/clear-goal` share one no-op branch. These are the same failure class
the sibling concepts call out explicitly: a menu item with no consequence teaches the reviewer the
surface is a mock.

**15e — Ten duplicate demo triggers.** 19 Demo Studio triggers route through one thread-switch map
with no further branch, so they collapse to 9 distinct behaviours — e.g. `BSD intervention` /
`BSD silent check` / `BSD timeout` all just switch to the same thread.

**15f — Why the audit trail was green.** `PM56_RUNTIME.snapshot()` (`app.js:1253-1255`) measures
`activityDomains`, `menus`, and `artifacts` with selectors the renderer never emits, so all three
are **structurally incapable of being non-zero**. Any harness trusting it read three permanent
zeros as measurements. Related: `PM56_FEATURE_MANIFEST` is read by nothing and asserts four
variant counts this audit disproves, and `listTriggers()` omits 29 working triggers.

**15g — Smaller items.** `.artifact-card` (`styles.css:161`, 24 declarations) is never emitted, so
artifact cards fall back to generic system-card styling. `--composer-h` (`styles.css:260`) is read
but never written, so the transient Activity panel sits a hard-coded 116px up regardless of
composer height. Eight state fields are write-only or never referenced at all (`editorMode`,
`activityFilter`, `newMessageCount` have **zero** references; `draftHistory`, `planStatus`,
`questionQueue` are written and never read). `flipHeight()` (`motion.js:73`) is exported and never
called.

## Execution: how the work is parallelised without collisions

The problem: almost every item needs to touch `app.js` (159KB) and `styles.css` (88KB). Four
agents editing those two files concurrently would corrupt each other. The fix is to make **one**
agent own each shared file, in sequence, then give every later agent its own files.

Twelve agent-tasks across five waves, ≤4 concurrent, all Opus 5.

**Wave 1A — Platform (1 agent, owns `app.js` + `build.py`).** Nothing else runs until 1A and 1B land.
1. Back-port the standalone's Demo Studio drag/resize into the sources; make `build.py`
   newline-preserving; rebuild; `--check` green. Register the new per-feature source files in
   `build.py` (CSS after `styles.css` so module rules win; JS after `data.js` so modules can
   register before `app.js` boots).
2. Add a `window.PM56_EXT` registry to `app.js` — the same idiom `PM56_WORKING` already uses —
   exposing named render slots and action handlers, so feature modules in their own files can
   inject markup and behaviour without reopening `app.js`. Slots: `headerExtras`,
   `activityPanelBody`, `activityHoverCard`, `threadRowStatus`, `historyChrome`, `messageMeta`,
   `messageAffordance`, `messageOverflow`, `threadMenu`, `goalSection`, `contextCompactMenu`,
   `contextDrawer`, `planEditorActions`, `questionSurface`, and an Orbit take override.
3. Every fix that is *inherently* resident in `app.js`, since no later agent may edit it: the
   model-menu height chain and `modelView` default (5), `globalReset()` re-cloning `D.models`,
   `data-history-variant` on the flyout (3), deleting the two hover chips (7), the new-thread
   button in `.chat-header` (11), the plan-editor action row (10), hover-gating assistant message
   actions (8), removing `.orbit-ring{pointer-events:none}` (12), fixing the three
   `PM56_RUNTIME.snapshot()` selectors and `listTriggers()` (15f), wiring the toast-only stubs to
   real behaviour incl. an actual clipboard write and a working `dismiss-event` (15d),
   de-duplicating the demo triggers (15e), and removing the dead state fields (15g).
4. Publish a short **fixture schema contract** — the field shapes later agents rely on
   (`changes[].hunks`, `artifacts[].updatedAt`, message `runtime`, …) — and make `activityDefs`
   derive from whatever is present with safe fallbacks, so the Demo Data agent can fill it in
   later without a circular dependency.

**Wave 1B — Hardening & motion repair (1 agent, owns `styles.css` + `motion.css`).** Sequential
after 1A, because it is the second and last writer of `styles.css`:
- **15b**: repoint the ~45 wrong selectors in the "FINAL HARDENING LAYER" (`styles.css:365-560`)
  at the class names the renderer actually emits. This alone restores menu clamping, menu
  scrolling, the menu entrance animation, activity-bar hover feedback, resizer `touch-action`,
  scroll containment on 4 surfaces, and the mobile submenu behaviour.
- **15c**: wire `.pm-leaving` / `pm-dematerialize` and `.toast.is-leaving` so things animate
  *out*, and add `.pm-materialize-done` to stop the `will-change` leak. This is the shared
  prerequisite for the overlay close transitions in items 4 and 5.
- **15g** CSS half: emit or retire `.artifact-card`; define `--composer-h`; fix the unscoped
  `.decision-evidence` override at `styles.css:294`; drop the genuinely dead keyframe and
  custom properties.

**Ownership rule after Wave 1: nobody edits `app.js` or `styles.css` again.** Module CSS is
concatenated after `styles.css`, so overrides win without touching it. `data.js` has a single
owner (the Demo Data agent); feature-specific new collections (`goal`, `contextSources`) live in
their own module files instead.

**Wave 2 — four agents, file-disjoint:**
| Agent | Items | Owns |
|---|---|---|
| Demo Data | 14 | `data.js` **exclusively** — all three tiers, plus the `plainConversation` aliasing bug and the `Date.now()` determinism fix |
| Activity Panel | 1 | `activity-panel.{js,css}` — the eight genuinely distinct concepts, built on the orphaned `styles.css:336-343` structures |
| Activity Bar | 7 | `activity-bar.{js,css}` — per-domain hover content, clickable rows, icon-lit indicators |
| Goals | 2 | `goals.{js,css}` — phased goal fixture + all three goal surfaces |

**Wave 3 — four agents, file-disjoint:**
| Agent | Items | Owns |
|---|---|---|
| Context | 6 | `context.{js,css}` — u11 compact menu, drawer gaps, legible growth chart |
| History | 3, 4 | `history.{js,css}` — take-6 status indicators + padding, W1 open/pin choreography |
| Menus | 5 | `menus.{js,css}` — corner-origin sprout, height spring, worktree in the top bar |
| Transcript + Lens | 8, 9 | `transcript.{js,css}`, `lens.{js,css}` — both touch message rendering, so one owner |

**Wave 4 — three agents:**
| Agent | Items | Owns |
|---|---|---|
| Orbit | 12 | `orbit.{js,css}` — clickable orbit, responsive radius, shared trail icon fix |
| Thread Ops | 13 | `threadops.{js,css}` — the missing thread/message operations, restore-point store, destructive confirm |
| Decisions | 15a | `questions.{js,css}` — make the 8 question/decision options structurally distinct, the second Activity-Detail-class defect |

**Wave 5 — verification** (see below), then a final read-through pass by me.

**Crash-safety** (the requester's explicit concern — subagents cut off mid-task):
- Every agent owns disjoint files, so a half-finished agent never corrupts anyone else's work.
- Each agent keeps a running `WORK_LOG.md` in its own directory, updated after **every**
  sub-step with what landed and what is next — so a replacement agent resumes instead of restarts.
- Each agent must run `python3 build.py && node tests/audit.mjs` after each coherent sub-step,
  never batching one giant edit at the end. The tree stays green and shippable at all times.
- Agents commit nothing; the working tree is left for review.
- All agents are Opus 5, max 4 concurrent.

## Verification

Prior evidence in this folder is **not** trustworthy, and we now know exactly why.
`reports/audit.json` reports **434/434 PASS with zero failures** while every defect in this plan
is live — because `PM56_RUNTIME.snapshot()` measures `activityDomains`, `menus` and `artifacts`
with selectors the renderer never emits, so three of its six metrics are structurally incapable
of being non-zero. `reports/FINAL_AUDIT.md` separately reads `Certification status: FAIL` with
the browser and motion gates `MISSING`, and `reports/DEMO_TRIGGER_CATALOG.md` still claims
"eight takes" when there are 24. **Everything below gets re-measured; nothing is inherited**, and
Wave 1A fixes the snapshot selectors first so the harness can tell the truth.

Add a standing **orphan gate**: re-run the emitted-token check from item 15 after every wave, so
a new rule pointing at a class name nothing emits fails the build instead of shipping as a
plausible-looking stylesheet. That single check is what would have caught 15a, 15b and 15g years
of hand-edits ago.

**Gate 1 — build integrity.** `python3 build.py --check` passes after every wave, and
`index.html` and the standalone stay byte-identical. No hand-edit of either deliverable.

**Gate 2 — interaction, asserted in pixels.** Drive the standalone over `file://` with the
local Playwright + `chromium-1234` (http hangs in this sandbox). A past session logged three
false-positive "fixes" here because `getBoundingClientRect()` reports geometry for elements
that are clipped, occluded, or mid-transition. So each assertion must confirm the pixel:
`document.elementFromPoint()` at the target centre plus a colour sample from a screenshot
crop — never a bounding box or a dispatch count alone. Concretely, per item: models actually
paint rows and the list actually scrolls; a subagent row click actually changes the panel;
a changed-file row click actually opens that path and line; transcript actions are absent at
rest and present on hover; selected messages actually render selected.

**Gate 3 — motion, filmed.** Capture with Playwright `recordVideo` (its bundled
`ffmpeg-1011` is present) and CDP screencast frames for frame-stepping, then build contact
sheets. Film, at minimum: the W1-style thread open + pin, the model/mode menu spring, the
Orbit expand/collapse and its wide↔narrow reflow, the thread-history status indicators, and
the activity-panel transitions. Verify each has a distinct, non-looping, correctly-timed
signature — and re-check every take under `prefers-reduced-motion`, where state must still
advance without perpetual loops.

**Gate 4 — no regressions.** Re-run the existing `tests/` harness (`audit.mjs`,
`motion-visibility-audit.js`, `visual-audit.mjs`) across the 8 themes; zero console
errors/warnings; no content escaping a card; no text overlap.

**Gate 5 — my own eyes.** Screenshot each repaired surface in a light and a dark theme and
inspect it, and watch the captured video before reporting done.

## Deliberately out of scope

Exploration turned up several real divergences between this concept and the canonical Plans
that are **not** among the twelve items. Flagging rather than fixing, so the decision stays
with the requester:

- `ACD-437` puts Persona/Model/Mode in the **chat header**, with the worktree icon appended
  after them; 5.6 Pro keeps them in the composer tool row. The request moves only the worktree
  selector, so that is all that moves.
- `ACD-192` puts the Context Lens control top-right, immediately right of chat search; here it
  lives in the composer Wand menu. The request is for message *selection*, not relocation.
- `ACD-438` wants selecting a model to auto-open the effort popout; today it is a hover sidecar.
- The Wand's **BSD** (Back Seat Driver) submenu lacks the packet's `This turn` / `This thread`
  scopes, and its composer indicator lights whenever BSD is not Off — which contradicts the
  rule that the glow means *actively evaluating*. Not in the twelve items.
- Canonically "Activity Bar" means the 48px IDE shell nav (`F3-041`); this concept's five-domain
  Chat Activity Bar is a conversation-override invention with the same name. Worth renaming
  someday; not touching it now.
- `reports/DEMO_TRIGGER_CATALOG.md` still says "eight takes" when there are 24, and
  `reports/EVIDENCE_INDEX.md` cites three `.webm` files that do not exist. Stale docs, not code.
