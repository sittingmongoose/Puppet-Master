# Chat updates — current 5.6 Pro assistant behavior to fold into the Plans docs

**How to maintain this file:** it describes the CURRENT, authoritative behavior of
the 5.6 Pro chat concept. When behavior changes, DELETE the outdated sentence and
write the new truth in its place. Never append a changelog, never keep superseded
statements "for history" — an appended history will mislead the next agent.
Everything below is implemented and verified in this directory's build.

The Context Lens header trigger is retained at every supported chat-pane
width. At 420px and below the compact Goal projection yields the shared header
budget; Lens and the context ring remain reachable and their menus still open.
Canonical `Plans/**` are not edited from this file until an explicit compile.

Sources live in this directory. `index.html` and
`PM_Chat_Assistant_5.6_Pro_Standalone.html` are generated; never hand-edit them.
Build with `python3 build.py` then `--check`.

---

## Composer chrome

- The composer box is one field. **Attach** and **active capability glyphs**
  sit in the **bottom-left of the textarea**. There is **no restore-draft
  control and no Draft product at all** — unsent text and attachments persist
  invisibly per thread (see *Composer persistence and destination*).
  **Send** sits in the **bottom-right of the textarea** (~24px). The tools row
  under the field holds only Persona, Model, Mode, Permissions, and the wand,
  and is **centered** in both labeled and icon modes.
- Attach and capability glyphs are **22×22** orbit-node squares with **16px**
  inner SVGs. Compact selectors and the wand are **28×28**. Labeled selectors
  and the labeled wand are **24px** tall orbit-node pills (`surface-3`, 1px
  border, 9px radius). Send stays **24×24** with its current glyph size. Icons
  are SVG only.
- A static `1px` `--border-strong` divider always sits between the textarea
  and `.composer-tools` (including Layered Studio). Focusing the textarea does
  **not** glow, thicken, or recolor that line (no `:focus-within` ring, no
  `:focus-visible` outline on the field). Layered Studio still tints the
  tools **background**; the divider itself stays the same hairline.
- While any work record is running **and the composer is empty**, Send **morphs
  to Stop**: same **24×24** slot, danger-red fill, **small filled rounded-square**
  glyph (media-player Stop, ~9×9 in the 24 viewBox, optically centered with
  Send). Not a stroked 12×12 box. Typing or editing a queued follow-up morphs it
  back to Send without a full app re-render. Stop cancels the live run and
  sequence. Stop does **not** clear the follow-up queue and does **not**
  auto-send the next queued message.

## Demo Studio boot defaults

- **Assistant body & composer** starts on **#8 Layered Studio** (`variants[0]=7`).
- **Thread History** starts on **#6 Preview Rows** (`variants[1]=5`).
- **Working Animation** starts on **#2 Orbit** (`variants[2]=1`). The dedicated
  Working activity picker matches that (Orbit · Default).
- **Activity Detail** starts on **#2 Status Board** (`variants[4]=1`).
- **Question & decision** starts on **#9 Ask Card** (`variants[6]=8`).
- Full default vector is `variants:[7,5,1,0,1,0,8]`. Recipe starts as
  **Custom mix** (`recipe: -1`) so those family picks are not mislabeled as
  PM7 Refined. **Reset all** restores this mix.

## Hover labels

- Icon chrome (attach, capability dots, wand, Context Lens, thread-search,
  worktree, context ring, history pin/close, history search, header
  new-thread/history, Activity Detail filter/pin/close, queue pencil and
  send-now, Send/Stop, message meta chips, message actions, Expand/Collapse,
  Context compact menu and More details controls, **scroll-to-bottom**) uses the app **hover card**,
  not a native `title` tooltip. The popup is a **24px selector-style pill**
  (`surface-3`, 1px border, 9px radius, 12px type). Icons themselves stay
  icon-only; the name appears on hover.
- Persona / Model / Mode / Permissions always use the hover card too, with a
  short action line (`Persona · …`, `Model · …`, `Mode · …`,
  `Permissions · …`) whether the chip is labeled or icon-only.
- Activity-bar domain previews dwell ~220ms from pointer hover and open
  immediately from keyboard focus. They are named interactive dialogs with
  actionable rows and one **Open Activity** footer; crossing from the trigger
  into the preview keeps it open, and Escape dismisses it without moving focus.
  The footer remains mounted through pointerdown so its click always reaches
  Activity Detail. Text tips are discarded when pinning, unpinning, or another
  layout change moves their anchor, rather than following the replacement
  control and becoming stuck.
  Chrome hover labels dwell **~400ms** before opening and close at 160ms. Text
  tips still work inside open menus and drawers (Context compact pop and More
  details). Long tip copy wraps inside the pill (`max-width` ~280px); it does
  not spill past the card edge.
- Tips stay up across live work ticks (Orbit / Step Rail) without blinking: the
  overlay root is not re-patched on clock-only ticks, disconnected `pointerout`
  from `pmPatch` is ignored, and an open tip with the same `data-hover-key` is
  kept and only repositioned.
- Context More Details (Curated / Raw tabs, metric cards, growth-chart points,
  Preview Compact / Redacted JSON / Raw projection actions, compaction history
  rows) uses the same hover card, not native `title`. Composition slices/rows,
  limit labels, Close, and capability rows keep their existing tips.

## Transcript message chrome

- Per-turn **metadata chips** and **action buttons** share a hover-gated
  `.message-chrome` row below the message surface. At rest the row is hidden;
  hovering the message reveals it. Clicks do not pin the chrome open. After
  the pointer leaves, the row stays visible for **~280ms** so it is easier to
  reach. Below **590px** width the row stays visible (no hover on phones).
- **User** turns place chrome **outside and below** the bubble, right-aligned
  with the bubble width. **Assistant** turns place chrome below the surface
  body. Copy / Details / More stay on the same row as the chips; they do not
  wrap. When that row is too narrow, the **provider** chip drops first, then
  the **model** chip. Those drops follow the chrome’s own width (a pinned
  Activity panel still counts), not the viewport.
- Row actions are **Copy**, **More details**, and **More** as icon-only
  buttons (13px SVGs in 28×28 hit targets; labels live in hover cards and
  `aria-label`). **Copy** swaps to a checkmark for ~1.2s after a successful
  copy; the check uses the same color as the copy icon. The one eligible user
  turn keeps a text **Edit & branch** button.
  **Re-answer** is removed; fork intent lives in the overflow menu (**Branch
  from here**, etc.).
- The time chip shows the locale clock **without** a leading icon. Duration
  chips read **Worked 13s** / **Working 13s** (no “for”). User turns do not
  show a **You** chip.
- Message overflow exposes **Mute**, **Focus**, and **Subcompact in Context
  Lens** when lens is off; each opens the horizontal strip and pre-selects the
  message. While overflow is open the chrome stays visible off-hover. The
  overflow **panel is a sibling** of the toolbar (not nested inside it), so
  layout is three rows: meta, then Copy / Details / More, then the panel.

## Scroll to bottom

- When the transcript is **not** at the bottom (more than ~24px of remaining
  scroll) a **scroll-to-bottom** control floats on the **right** of the thread.
  When a questionnaire or other decision host is open, the control sits above
  that host; when the host is empty, it stays immediately **above** the activity
  bar. It is a **30×30** icon-only tile
  (`surface-2`, 1px border, 9px radius) with the same **14px** stroked SVG
  treatment as activity-bar domain icons. Hidden at the bottom and when the
  thread does not overflow; the button stays in the DOM and only toggles
  visibility, so a scroll does not re-render the app.
- Clicking it uses the existing scroll-to-end intent, so a click while work is
  running **resumes follow-along** until the reader wheels again. The control
  does not steal scroll just by being visible.
- While any work record is running the tile is **working**: accent color,
  slightly heavier stroke, `ab-breathe` plus a small chevron bounce, hover card
  **Scroll to latest**. Idle hover card is **Scroll to bottom**. Reduced motion
  keeps the accent and drops the animation.

## Selector collapse and hint

- Persona / Model / Mode / Permissions stay as **text labels** until the
  **composer container** is within **~8px** of clipping them (including the
  wand). Then they become **icon-only** SVGs (persona, provider mark, mode,
  lock). They expand back only with **~8px** extra slack so the switch does
  not flicker. Viewport `max-width` rules do not clip selector chips.
- `.composer-hint` appears **only** in that icon mode, as
  `Product Manager · Claude Sonnet 4.6 · Agent · Auto`. It does **not** include
  `⌘↵ to send`. It is **centered** under the tools. When labels fit, the hint
  is omitted so the bottom chrome is shorter.

## Follow-up queue

Plans already own the contract (`Plans/assistant-chat-design.md` §4 / ACD-012).
The concept implements it:

- Sending while the agent is working **enqueues** the draft (FIFO, **max 2**).
  The queue is transient (not restored across reload). When the queue is full,
  the draft stays in the composer and Send refuses a third entry.
- The queue sits **in flow with the activity bar**, immediately above the
  composer and **below** an open Plan / questionnaire host. It is not a
  full-width layout stripe. When the bar is hidden (no live domains on that
  thread), the queued rows still occupy that same stack. Live order is
  transcript → **decision (when open)** → activity bar + queue (in-flow
  pill) → composer. `--chat-dock-h` is the composer height; `--decision-h` is
  the open decision-host height used to lift scroll-to-bottom above that host.
  The bar no longer overlays the thread, so the last message does not need extra
  `--thread-float-h` padding to clear the chrome.
  Each row has an **Edit** pencil (returns the text to the composer and removes
  the entry) and a **Send now** arrow (steers: sends that entry immediately).
  Otherwise the next entry sends when the current run **completes** (not when
  it is stopped).
- **Queued Message Demo** (`queue-demo`) is a pinned demo thread. Opening it
  (history or Demo Studio → Thread and message states) starts a live work run
  with two follow-ups already in the queue.

## Questionnaire

Question & decision is nine takes over one model (Demo Studio `variants[6]`; boot
is **#9 Ask Card**). Header chrome does not show queued, Required, or
Optional pills; takes that still have a head may show the answered count. Choice
and multi cards show at most four numbered options plus a **Something else…**
input numbered as the next consecutive index (three presets → **4**, never a skipped
**5**) with attach and `@` file chips. Text questions on **#9 Ask Card** are an
**Optional note** well (textarea), not a numbered Something else row. Step bars
are clickable (`qs-goto-question`) on every take,
including Anchored Sheet and Evidence Split. Open, close, and submit morph a
shared pill↔card shell; question changes use a vertical reel. **#9 Ask Card** is
the reference-video layout in PM tokens: quieter shell (soft edge, no hard kit
border), ghost close, prompt as title, a traveling numbered thumb on a 4px spine
to the right of the options (stretched above the footer so the last mark never
clips), the card matches the composer width, and the composer stays below
unchanged. The decision host does not clip this take. Footer is `Question N of M`
on the left, text **Back** / **Skip**, and a filled **Next** (or **Submit** on
review). Choice does not auto-advance. Single choice uses a radio mark; multi
uses a checkbox, **Select all that apply**, and can keep several rows on.
Clicking a multi or choice row springs **that** row only. **Something else** is a
real radio (choice) or checkbox (multi) in that same exclusive group — clicking
the mark or the row chrome selects it; the inline field is a bordered well that
shares the radio midline. Review is tappable Ask Card rows (not the
key/value grid): a numbered disc, heavier answer first, muted question under it,
or *Not answered*. Open and close are the same pill morph in reverse (one
shell, not a reel): ~100ms fatten 44→50px, explode to ~6% height overshoot from
the pinned bottom, then settle — about **370ms** of motion. Close inverts that
cascade (last option first, title last), implodes to the fattened 50px pill then
44px (never a 28px squash), and on submit holds then sinks into the composer.
The preparing/submitting pill is a **row**: label left, a 22px **two-ring orrery**
(balls on tilted rings, not the reference 4-dot square) on the right, fully above
the composer and not clipped. Every open, including after close, uses that morph
— it does not fall back to a linear host expand. Spine dots are solid filled
discs; the current mark is a 16px numbered circle at the end of the 4px track
(the track does not stick out past the thumb). Optional note has no resize grip.
Question changes pull rows off on overlapping elastic stagger with light blur.

## Overlay menus

- Clicking the same trigger **closes** an open menu (persona, model, mode,
  permissions, wand, worktree, context ring, thread search, thread row menu,
  Context Lens).
- While a menu is open, the activity bar does **not** receive hover or click
  through the menu. Menus stack above activity hover cards.
- Root menus (persona, model, mode, permissions, wand) use the PMConcept7
  corner-origin sprout (closed `scale3d(.72,.48)`, 300ms spring, asymmetric close).
- Sidecars (effort, thoroughness, capability submenus) are a **fixed 228px**
  wide. Fast mode is a one-line effort row with no subtitle. They sprout from
  the **facing edge** (PMConcept7 effort origin ~28% / `scale3d(.48,.72)`),
  aligned to the **hovered row**, ~3px from the root menu. Horizontal side is
  locked at open. Hovering another row **does not re-sprout**; height springs
  in place with an exaggerated size-bounce (expand then contract). Hovering a
  mode row **without** a submenu (Ask / Agent / Debug) unsprouts the sidecar.
  Sidecars never park at the viewport origin (`left: 8px`).
- Activity-bar hover cards **dwell ~220ms** before sprouting so a pass-through
  to or from the composer does not pop a card. Switching Goal / Todo / … while
  a card is already open stays instant. Close remains 160ms.

## Models and provider marks

- The model picker lists configured provider accounts, including **OpenAI**
  (GPT-5.3, GPT-5 Mini on a Work account) alongside Anthropic, Alibaba,
  Moonshot, z.ai, and Cursor.
- Provider rail buttons and model-row marks are the providers' **SVG marks**,
  not letter initials.
- Each model row shows the account **nickname** only (e.g. `Work`), plus the
  model's effort **words** on one line (`Low / Medium / High / Max`). The
  connection id (`anthropic-work`) is not shown in the picker; Context More
  Details still has both Account and Connection. An effort word is lit
  (accent, saturate, heavier weight) **only on the active model row after an
  explicit effort pick**. Until then the words stay muted. Unselected words
  stay muted. The picker itself is **360px** wide (effort sidecar stays 228px).
  If a nickname is long, it ellipsizes; effort words do not wrap.

## Chat header and thread history

- The chat header does **not** show the goal chip or `chat-meta`
  (model · mode · worktree). Those are redundant with the activity bar and
  composer selectors.
- **Context Lens** is a header icon **left of thread-search**, then search,
  worktree, context ring. Clicking it sprouts a **horizontal** Lens strip on
  the top of the transcript (Mute / Focus / Subcompact / Turn Off). Opening
  the strip starts picking; **closing** it does not re-enter picking.
  While the strip is open, the transcript gets a top buffer equal to the
  strip **layout** height (`offsetHeight`, transform-safe) so reopening the
  strip or opening it from a message overflow action (Mute / Focus / Subcompact
  in Context Lens) still pushes the thread down reliably; long threads can
  still scroll to the top and clear the strip.
  The buffer is cleared when the strip closes and is not applied for other
  menus.
  **Seal** and **Apply** close the menu and hide message checkboxes. After
  seal, the status pill stays **`N of 25`** and the meter fills from the live
  selection if any, else the last sealed operation’s `ids.length` (`0 of 25`
  only when nothing is selected and nothing is sealed). Restore is not on the
  status head; per-message Show full / Release and subcompact “Release
  operation” remain. **Turn Off** is a bordered soft button with **danger-red
  label** (matching the Turn Off mode-row icon); **Apply** is text only (no
  icon). The header icon keeps a per-mode glow (Mute warning/slow pulse, Focus
  accent, Subcompact accent-2 compress). Turn Off returns the icon to idle.
  Lens is not on the wand menu.
- Header, history-head, and Activity Detail icon buttons share orbit-node
  chrome (28×28 rounded square, `surface-3`, 1px border). New thread stays a
  labeled pill with the same fill when the head is wide. The context ring
  stays circular.
- Pin / unpin glyphs are a Lucide-style pushpin (history head and Activity
  Detail).
- **Open history** and **New thread** always exist in the chat-header markup.
  They are **CSS-hidden** while the history drawer is pinned
  (`data-ph-drawer="pinned"`) and shown again when unpinned, without requiring
  a full remount. When pinned, New thread / pin / Close live in the history
  head.
- History head order: **New thread**, then **pin** (`margin-left: auto`), then
  **Close**. Pin and Close stay fixed **28×28**. New thread is **content-width**
  when the head is wide (does not stretch across the drawer). When
  `.history-scroll` width is **≤ 204px** (`--ph-history-narrow-max`), the head
  collapses New thread to a **+** icon (`is-hh-compact`), and thread rows enter
  **narrow** mode (`is-history-narrow`) at the same threshold (JS measures the
  scroll rect; CSS `@container history-drawer` stays aligned).
- Thread rows are a **2-column** grid: left **lead** (status glyph + hover **⋯**
  menu) | copy (title + optional time). On hover, status fades and the more
  menu appears **in the lead** (not on the right). Each row’s hover tip is the
  status label; the more button has its own tip. History row / lead /
  status-slot use `overflow: visible`. Row horizontal padding is slightly
  tighter so the active inset ring does not crowd the title text. The **active**
  row keeps a **one-line ellipsized title**, the timestamp, and the **summary
  preview**; `box-sizing: border-box` and a slightly wider copy gutter keep the
  inset ring from clipping. Long names like **Inline Visualizer Gallery** may
  still ellipsize.
- Preview Rows: working / reviewing keep the outer spinning satellite **on**
  the ring (constant radius around the ring center; the pip does not drift on
  and off the stroke). **Complete** check, **paused** bars, and **failed** X are
  15×15 SVGs centered on the ring (not CSS capsules). **Blocked** is a **full**
  danger ring with a centered halt bar (the top of the circle is not missing).
  Other history takes that still use `.status-orbit` keep the same on-ring
  satellite.
- In narrow mode: status glyph and timestamp are hidden so the title gets full
  width; on hover the lead expands only enough to show the more menu.
- Pinned / Recent / Archived are **collapsible** section heads with an always-
  visible chevron (rotates when collapsed). **Archived defaults collapsed**;
  Pinned and Recent default open. **No count badges** on section heads.
  Collapse state is session-only.
- There is no `PINNED LEFT` strip and no goal summary card in the history
  drawer. The pinned drawer still has a resize handle.

## Context Lens glyph

- The glyph is the PMConcept7 lens (circle with three horizontal lines),
  restyled to the activity-bar SVG language (`stroke-width="1.8"`,
  `currentColor`). It also appears as an in-field capability glyph when Lens
  is on.

## Activity bar and Activity Detail

Goal, Todo, Subagents, Crew, BrainStorm, Review, Chat Room, Changes, and
Artifacts are **per-thread**. Goal and To-Dos live **here, in Activity — never
as transcript cards**. A
domain appears in the activity bar, the filter row, hover cards, and Activity
Detail only when that thread owns or invoked it, or when Goal Mode / Crew Mode
has published it on that thread, or when that thread still has Goal/Crew
**history** after Mode Off. Empty domains are omitted, not shown as zero.
If a thread has none of the live domains, the whole activity wrap is hidden.
Switching threads retargets a focused panel to the first live domain, or
closes it when the new thread has no activity.

The activity bar and follow-up queue **float on the transcript** just above
the composer. They are not a full-width wrap stripe. The inner pill and
queued rows keep their own look across all eight Chat Activity Bar variants.
Transient Activity Detail lifts by the measured float height and subtracts that
stack from its height budget, so it does not sit under the bar or escape above
the chat header. Pinning is an intent: below 591px, or when the desktop
assistant pane cannot preserve a 240px panel and a readable chat column, the
same open panel remains transient and docks automatically when room returns.
The transient form has no inert resize handle. Escape closes only the transient
form; pin, unpin, and close restore focus to the corresponding panel control or
Activity Bar domain.

Presence:

- **Goal** — attached (`D.goal.thread` or `thread.goalId` while `D.goal` is
  not cleared), **or** the thread has a `goal-receipt` (or a durable goal
  artifact), **or** Goal Mode is **On** with a stamp on this thread (stub,
  count `—`). Turning Goal Mode **On** always opens Activity Detail focused
  on Goal. Threads without a durable goal show a Goal chip with count `—`
  and “Goal Mode is on”; they do not inherit Query Performance’s 3/6 goal.
  Turning Goal Mode **Off** removes only that stub when the thread has no
  attached goal and no receipts. Off does not wipe other threads’ stamps.
  An attached goal and receipt history stay, and Activity Detail stays open
  on Goal when that history remains.
- **Todo** — `todos[].threadId` matches. All 20 current todos are stamped
  `query`.
- **Subagents** — `parentThreadId` matches, or the transcript has
  `live-agents`. A `crew` event is not Subagents.
- **Crew** — the thread has a `crew` event, **or** Crew Mode is **On** on the
  selected thread (stub). Members come from that thread’s `crew` event when
  present (Planner / Implementer / Reviewer / Browser auditor on Crew
  Coordination); otherwise a four-role stub. Turning Crew Mode **On** opens
  Activity Detail focused on Crew. Turning it **Off** keeps Crew Coordination
  (and any thread that already formed a crew) and still removes the fallback
  stub on threads with no crew history. Crew is not Subagents. Composer
  Goal/Crew glyphs still follow the wand On/Off flags.
- **Changes** — `changes[].threadId` matches. `agent-work` file edits without
  a change row do not count.
- **Artifacts** — `artifacts[].threadId` matches, or the transcript opened
  that id via `artifact` / `plan-card`. Attachments are not this domain.

Counts are over that same union. **Show all** changes the Status Board from one
focused summary and its real records to a **Thread activity** overview with one
card for every live domain. No domain filter is falsely selected in the
overview; focused scope selects exactly one. Each overview card derives its
count and summary from the same per-thread collections, then drills back into
that domain. Todo, Crew, and Changes also carry two facts plus a labelled
measure (Changes uses an additions/deletions split rather than presenting
churn as completion, and paints add/delete counts green and red on the card,
the focused summary, and each file row). Goal, Subagents, and Artifacts do
not: a completion bar is not a truthful proportion for those domains, so those
cards are identity, summary, and **View details** only, and they size to that
content instead of matching the taller measured cards. The overview has no
Working/Attention/Queued/Settled tally strip and no live-domain subtitle.
With only one live domain there is no Show-all copy. Clicking an Activity Bar
item dismisses its preview and opens Activity Detail focused on that domain;
pinning is effective only when the available layout can preserve the panel.

Status Board is single-column through 300px and two-column from roughly 340px,
including the 390px transient surface. It uses neutral cards, 1px separators,
tabular right-aligned values, 13–14px primary copy, 12–13px support copy, and
compact semantic marks instead of broad tinted boxes. Focused Changes show the
basename first with path context below; add/delete counts are green and red
on the file rows, the Added/Deleted facts, and the Change mix label — not a
boxed hunk. The entire row opens its real diff. Focused Goal has no summary card — the
compact Goal projection and a **View Goal** footer stand alone. Focused
Subagents keep a slim head plus the one-line agent summary; focused Artifacts
keep the head and count only.

The Activity Bar previews use the same explicit status vocabulary as the board:
Blocked, Needs attention/Needs retry, Working, Changed, Queued/Waiting, and
Settled/Ready do not change meaning between surfaces. Each 354px preview has a
44px header, at most five 48px rows, a stable 68px status/time column, and one
34px **Open Activity** footer. Preview rows have no identity glyphs and no
agent-initial badges; Subagents rows match Activity Detail (name, model and
current/blocker, status plus elapsed). Header totals are retained; duplicate
footer histograms are not.

The final Activity-specific verifier covers the default, Show all/drill-down,
preview footer, keyboard focus, pin/unpin/close focus restoration, independent
scrolling, reduced motion, all eight themes, and widths from 390px through
1920px. Recording evidence under `evidence/activity-detail-redesign/` includes
the selected 1080p/25fps film, a timestamped compositor-frame film and source
frames, 12 full-resolution state keyframes, ten every-frame contact sheets, and
the machine-readable preflight/geometry manifest.

The bar **compacts before it clips**, from a ResizeObserver on the wrap with
~8px hysteresis, driven by the assistant pane width rather than the window:

1. labeled (icon + label + count)
2. compact (icon + count)
3. icon-only (icon)

Every Chat Activity Bar variant uses those three tiers, including **Icon Dock**
(Demo Studio #3). Icon Dock tiles stay bordered squares; at the last tier they
become icon-only (no label, then no count). Domain Grid does not shrink below
content and clip nowrap labels — it overflows/compacts instead.

Threads with live domains after the audit:

| Thread | Live domains |
|---|---|
| `query` Query Performance | Goal, Todo 6/20, Subagents 5, Changes 8, Artifacts 4 |
| `goal-replan` Goal Replanning | Goal |
| `subagents` Runtime Architecture Review | Subagents 5, Artifacts 2 |
| `debug` Browser Debug Session | Subagents 4, Changes 2, Artifacts 2 |
| `route` Model Route Change | Changes 2, Artifacts 2 |
| `visuals` Inline Visualizer Gallery | Artifacts 4 (owned mermaid + image; invoked dashboard-query + flow-plan) |
| `context` Context Lens Review | Artifacts 2 |
| `plan-deep` Deep Plan Approval | Goal (plan-approval receipt), Artifacts 2 (owned flow-plan; invoked plan-query) |
| `plain` Product Design Discussion | Artifacts 1 (`transcript-summary`) |
| `crew` Crew Coordination | Crew, Artifacts 1 (`crew-board`) |
| `artifact-error` Recoverable Artifact Error | Artifacts 2 (owned broken-viz; invoked chart-latency) |

Empty bar (no wrap): `orbit-run`, `queue-demo`, `questions`, `bsd`, `offline`,
`attachments`, `tool-failure`, `new-message`, `no-models`, `archived-1`…`archived-6`.

The panel has no Context Growth Forecast summary card, no “Focused” pill on
section heads, and no Goal/Todo/Subagents/Crew/Changes/Artifacts chip footer.

## Context composition

- The compact-menu and More Details composition bars are shares of the
  **full context window** (e.g. 131K), not of tokens currently loaded. Unused
  window remains empty on the right of the bar.
- There is no “shares of the N now in context, not of the window” caption.
- Cache reading is one line: `Cache hit: 78.34%` (two decimal places). Unknown
  routes still say cache hit is not reported.
- Attachments / rolled-up “smaller sources” use the same distinct segment
  color as each other.
- Context growth readout does **not** say “Hover a point for its value.”
- Each thread owns one mutable context projection seeded from
  `data.js::contextByThread`. It carries a stable context epoch, requested and
  effective route, fallback identity/reason/history, plan limits, source
  families, growth, compaction preview/state/revision/history, redacted Raw
  metadata, command results, dispatch receipts, and an always-empty
  compaction EventRecord list. Reset and reload reseed this demo projection;
  mutations never leak between threads. A newly created or spawned thread is
  seeded with a fresh empty-turn projection; Duplicate copies the source
  composition without inventing branch lineage; Branch and restore-branch
  copy the source composition with explicit source lineage. Every path resets
  command evidence and then retains later evidence across re-render.
- The compact-menu **Compact now** action and the details-drawer compaction
  flow both use only `cmd.chat.compact_context`. The drawer first opens a
  dynamic local preview. Its Cancel button, close button, and Escape path are
  pre-dispatch and create no command result, dispatch receipt, history row, or
  event. Apply dispatches the command. The menu selection is already an
  explicit choice and dispatches directly.
- Every dispatched invocation produces exactly one correlated command result,
  one non-persisted dispatch receipt, and one terminal compaction-history row.
  All three carry the same dispatch id, thread id, command id, context epoch,
  result status, revision, and before/after token values. The visible result
  vocabulary is `started | already_running | cancelled | no_op | degraded |
  unavailable | retry_scheduled | completed | failed`. Rapid re-entry returns
  `already_running` and does not start a second pass.
- No `context.compaction.*` EventRecord family exists or is emitted. The
  receipt appears once in the transcript, with stable command/result/dispatch
  attributes for inspection, while the per-thread `eventRecords` collection
  remains empty.
- A `completed` result mutates the shared projection exactly once: loaded and
  available tokens, per-family source counts and percentages, cache count,
  growth samples, preview, state, and committed revision refresh together.
  The header ring, compact menu, and an already-open More Details drawer read
  that same projection. The context epoch and historical Usage totals are
  preserved byte-for-byte; compaction never recalculates Usage history.
- More Details has real accessible **Curated** and **Raw** tabs (`tablist`,
  `tab`, and `tabpanel`, with Left/Right/Home/End keyboard navigation).
  Curated shows requested/effective route, fallback identity/reason/history,
  plan limits, compaction state/revision/history, source composition, growth,
  cost/cache, capabilities, and preview. Raw renders only a redacted
  projection: raw payload ref, 64-hex provider payload hash, redaction status,
  omitted-evidence counts, permission state, redacted route fields, and
  receipt/result refs. It excludes secrets, credentials, account identifiers,
  connection ids, worktree/local paths, and provider payload bytes.
- Focus remains on the compact-menu action across working and terminal states.
  The drawer preview moves focus to Apply, then Cancel, Escape, and terminal
  completion restore focus to the surviving Preview Compact action rather
  than `<body>`. The drawer remains open and scrollable throughout a completed
  command, including narrow panes and reduced motion.

### Later PMConcept7 port requirements

- Port the redesigned compact menu and More Details drawer as one unit after
  PMConcept7's current Usage work; do not preserve PM7's older hardcoded Chat
  context markup or its legacy `compact-now`/`apply-compaction` split path.
- Bind both surfaces to the production context/Usage projection owner and
  `cmd.chat.compact_context`. Preserve stable thread, context epoch, requested
  route, effective route, fallback, result, receipt, history, and revision
  identities. The standalone `state.context.projections` object is fixture/demo
  lineage, not a production storage key or persistence contract.
- Keep preview cancellation local and silent. Production wiring must retain
  exactly one result, one dispatch receipt, and one terminal history row per
  dispatch, including `already_running`, with no invented
  `context.compaction.*` EventRecord family.
- A completed production projection update must refresh the ring, menu, and
  open detail surface coherently while preserving context epoch and historical
  UsageRecord totals. Raw must use the production redaction/permission owner;
  never substitute the standalone fixture hash or omitted-count values.
- Preserve the accessible tab semantics, keyboard interaction, focus return,
  reduced-motion behavior, and internal Raw scroller. Re-run the complete
  context suite after the port; static markup or a closed-drawer-only check is
  not sufficient runtime evidence.

---

## Product decisions (working activity)

- **Orbit is the DEFAULT working activity** (working-animation take 1, `orbit.js`).
- **Step Rail is the SIMPLIFIED option** (take 8, `variants-a.js`) for people who do
  not want the full animation. Same engine, same interactions, plainer presentation.
- The choice is a user setting: **Settings → General → new "Assistant Chat" section →
  "Working activity style"** (segmented: Orbit / Step Rail; default Orbit; per-project;
  takes effect on the next assistant turn). Implemented in the current settings concept
  (`Concepts/settings-redesign-concepts/kimi-k3-polish/concept-12-tome-tabs.html`, data
  in `concept-12-kimi/kimi-data.js` → `appInputSections` → section `assistant-chat`).
  The 5.6 Pro Demo Studio mirrors it as an "Assistant chat · Working activity" picker
  (Orbit · Default / Step Rail · Simple) above the concept-family mixers.

## Shared working-activity engine (applies to BOTH styles)

- One transcript can hold **several working activities in one assistant turn**. Each
  working card binds to its own work record; a scripted demo turn reveals its later
  messages only after the run they wait on completes (the "Multi Orbit demo" thread:
  user → burst A → interim assistant text → burst B → summary).
- **Clock-only work ticks** (card height unchanged, `|Δh| < 1px`) do **not** FLIP the
  working body or rewrite transcript `scrollTop`. User scroll during a live Orbit or
  Step Rail run is not stolen. Height-changing expand/collapse still FLIPs and
  scroll-follows as today.
- **Subjects are not known up front.** They spawn one at a time as work starts, with an
  entrance animation; **duplicate subjects are normal** (three searches, two edit
  passes…). Every subject instance has its own label, verb, detail prose, detail rows,
  and a short stat ("2 files · +106 −23") shown in its hover card.
- **Detail rows stream in** as the run's clock passes each row's timestamp — never a
  full dump when a subject begins. Reasoning-style rows word-stream. Search subjects
  show real query strings with result counts; fetch subjects show document titles with
  hostnames. Pausing the run freezes the reveal.
- **Clickable detail rows.** Every working-activity detail row that has a
  destination is a button — Orbit panel, Step Rail, and shared chrome, on the
  primary 14-step timeline and the Multi Orbit A/B demos. Files, edits,
  artifacts, fetched pages, search results, MCP calls, child agents, browser
  traces, app-inspector records, and test evidence open in the **editor** side
  panel. Commands (`cmd` or a “Ran …” line) open an inline **Shell** box
  **below the working card** with “Ran command in …”, a `$` prompt, output,
  exit code, and an **X** to close. One Shell box is open per card; clicking
  another command row replaces it. Streamed reasoning and dest-less status
  lines (policy ready, LSP clean, extracted-section counts) stay plain text.
  Bash-kind alone does **not** make a row a Shell — an MCP line inside a bash
  subject opens the MCP editor doc. Editor tabs accumulate; `file:` tabs use
  the basename.
- Subject kinds include **MCP tool calls** (plug icon, e.g. "MCP · grafana.query-range")
  and **skill invocations** (wand icon, e.g. "Skill · /benchmark-report") alongside
  files/search/fetch/browser/bash/subagents/edit/app/test/validate/artifact.
- A subject may carry its **own child agents** (per-occurrence status: a running pair
  early in the run, a completed pair later). If a subject has no agents, no agents
  UI appears at all — no empty-state filler.
- **No percent-complete anywhere** — total subject count is unknowable mid-run. The
  head shows the live subject caption and the elapsed time; a completed card's head
  says **"Completed"** (never "Completed work").
- **Auto-collapse rule:** a working activity collapses ONLY when a NEW working activity
  enters the thread (with a collapse animation). **The last activity always stays
  expanded** — after it finishes, it remains open until the user collapses it or a new
  activity appears. Completing never scrolls the reader's transcript position.
- Collapsed activities show **receipt chips WITHOUT a "Worked for" chip** (elapsed
  already lives in the card head). Play/complete respect the user's pin and collapse;
  only Reset clears them.
- Tooltips on subjects are **instant app-rendered hover cards** (first line: subject ·
  stat; second line: verb + status) — never native `title` tooltips.
- While a card is running at the bottom of the thread, its detail region keeps a height
  floor so per-subject content changes do not push the page up and down.

## Orbit (default) — behavior spec

- The stage is **always open**: dial on the left, detail panel visible — no click
  needed. In a narrow container the panel sits full-width UNDER the dial.
- The **panel follows the live subject**; clicking a ring node **pins** the panel to
  that subject (clicking the pinned node again is NOT a collapse). The **center disc
  always shows the live subject** and clicking it returns the panel to following live.
  It never collapses the card.
- The **panel X collapses the card** — live or completed — to a compact strip. The
  collapse is two beats: the panel folds while the dial recenters, then the dial lifts
  up into the strip line. Expanding is the exact reverse: the dial **drops down from
  the strip line to the center** (visible travel), then slides left as the panel opens.
- **Compact strip:** one row of kind-colored subject discs + "N subjects" + a
  **chevron that re-expands following the live/last subject**. Clicking a disc
  re-expands pinned to that subject. A LIVE strip keeps spawning discs and **pulses
  the current one** (icons only — no rows) while the head caption and timer keep
  running; a completed strip adds the receipt chips. The current strip disc renders
  slightly larger. A collapsed card is compact (~100px tall) with no dead space.
  A completed card collapsed to the compact strip keeps **no leftover min-height**
  under the receipt line; done-state body/receipt padding stays tight.
- Ring geometry: the ring starts empty and re-spaces evenly on every spawn; density
  tiers shrink nodes as the ring passes ~13 and ~22 subjects (works at 2–3 and 25+).
  Subagent subjects pop their agents out as satellites around the center disc; the
  panel lists the same agents (each opens its agent thread).
- Reduced motion: every choreography lands its end state instantly.

## Step Rail (simplified) — behavior spec

- An accumulating rail of **kind-colored subject discs** (orbit-strip look) with a bold
  verb + count label; the **current disc is larger and pulses**; discs grow slightly on
  hover. All spawned discs are clickable in every state. The disc **track wraps** like
  the orbit strip. The verb/count label and **chevron sit on a full-width tail row**
  under the discs so the chevron cannot be pushed off the card when many steps spawn.
- Clicking a disc **pins** the rows region to that subject; clicking the pinned disc
  again unpins; **clicking the CURRENT disc always returns to following the live run**
  (the rails equivalent of orbit's center disc). Pinning never touches the run itself
  (no scrubbing, no un-completing).
- The **chevron toggles the rows region** in every state — while running it collapses
  to an icons-only rail (the compact look), completed it collapses to "N tools used" +
  receipt chips (no "Worked for").
- Rows under the rail come from the pinned-or-live subject and stream in live; a
  superseded rail defaults to icons-only.

## Primary mode menu and sidecars

Six roots exactly, in this order: **Ask**, **Agent**, **Debug**, **Plan**,
**Deep Plan**, **Review**. Plan, Deep Plan and Review carry sidecars that use
the existing fixed-width sprout behaviour.

- **Plan** — Quick / **Standard · Default** / Thorough.
- **Deep Plan** — **Thorough · Default** / Exhaustive / BrainStorm, then a
  divider and a persistent **Grill Me** check. Grill Me matches the Fast-style
  auxiliary row pattern and is not model effort.
- **Review** — Single Agent / **Multi-Pass Review · Default**.

Those are the **six Plan choices**, and there are exactly six: there is no
fourth regular depth and no Light / Balanced / Comprehensive labelling. Choosing
a Plan or Deep Plan strategy sets the next planning request; choosing BrainStorm
or either Review entry opens that workflow's configuration modal.

`Debug` is a primary mode, not a wand toggle. **Context Lens stays a standalone
header control and is never a wand item.**

## Plan card

The Plan is a transcript card because it is a human-readable deliverable. It is
`plan-card-v2`, owned by `plans.js`.

- Header is the Plan title, a `Plan · Vn` badge, and a **Rich Text / Markdown**
  toggle. **Rich Text is the default.**
- Rich Text and Markdown are two **projections of one immutable block array**,
  so they cannot drift; the Markdown view keeps every block's identity. Neither
  is editable: there is no `textarea` and no `contenteditable` anywhere in the
  card, and no path from it to a caret.
- Exactly **one** primary control, which changes label and is never replaced by
  a separate status badge:
  `Build` → `Building…` → `Completed` | `Canceled`. `Building…` and both
  terminal labels are the same control, disabled. Pause / quota / window
  explanations appear as small support copy **beside** the control — they never
  become a fifth button state, so a paused build still reads `Building…`.
- Actions as eligible: **Revise**, **Build With Crew**, **Build At…**,
  **Send To Planning Wizard**, **Export**, **Cancel**, **Details**, and
  **Open To-Dos** while building.
- **Revise**, never Edit. It targets the ordinary composer at the current
  Plan/version and the composer chrome visibly changes; the user submits prose
  and the agent writes a complete new version. `V4 → V5`. Earlier versions stay
  immutable and readable in Details.
- At most **one unfinished Plan per thread**. An explicit new-Plan request
  cancels the old one; it does not stack. Historical Completed/Canceled cards
  stay in chronological transcript order and default **compact**. There is no
  Plan picker and **no `Superseded` label** — that status is retired.
- **Build freezes** exact plan_id, version, content hash, step ids, runtime,
  permissions and worktree. Regular Plan creates To-Dos directly and **no**
  ledger, PlanUnits, WorkNodes or Plan Compile. Deep Plan is `ledger_bound`:
  it carries a **run-scoped** ledger and materialises **scoped** PlanUnits at
  Build, never writing the global PlanUnit index and never creating WorkNodes.
  **Neither enters Orchestrator.**
- **Send To Planning Wizard** bypasses PRD Builder — the Assistant Plan is the
  intake specification — and leaves a durable receipt in the transcript.
- Export produces Markdown and a structured bundle as real downloads; the PDF
  route opens the browser print pipeline and the receipt records what actually
  happened rather than claiming a file was written.

## To-Dos

One **thread-local hierarchical** list, owned by `todos.js`. Parent To-Dos with
child sub-To-Dos; every leaf carries a bounded expected outcome.

- Statuses are exactly `pending | in_progress | completed | blocked | skipped`.
- **Several leaves may be in progress at once**, and out of display order, when
  dependencies permit. A pending item with an unmet dependency is *not* blocked.
- Transitions are **individually receipted** for that item. Bulk completion,
  a provider whole-list replacement, and a stale-revision write are all
  **refused**, with the refusal visible.
- There is **no verification status** anywhere user-visible; validation, when
  needed, is its own To-Do. There is **no separate Done section and no source
  grouping** — completed items stay inline, in place, struck through.

## Composer persistence and destination

- Unsent text and attachments persist **invisibly per thread** across thread
  switching and reload. No banner, no toast, no restore button, no Draft UI.
- **Up / Down** cycles prior sent user messages only while the composer is
  **empty** and no module has a conflicting pending state.
- **Passive native spellcheck** only — red underline and right-click
  replacement, re-asserted after each patch. No icon, no control.
- A **destination ribbon** sits adjacent to the field when the composer is
  targeted at a Plan revision or a collaborative run, with an illuminated
  destination glyph at its leading edge. `composer-state.js` owns the ribbon and
  the `clear-destination` action; no other module renders one.
- The **quota wait strip** shows reset truth *and its source*, with an opt-in
  auto-resume checkbox. When the source is unknown it prints `unknown`,
  suppresses the countdown entirely, and offers a field for the user to supply
  one — which then reads `user supplied`, never `provider reported`.
- Preserved unchanged: Attach and capability glyphs bottom-left inside the
  field, Send/Stop bottom-right at 24×24, the centred tools row, the static 1px
  `--border-strong` divider that does **not** glow or thicken on focus, and the
  container-based selector collapse.

## Attachments

- The attachment **tray sits above the text entry**; Attach stays bottom-left
  inside the field.
- Processing shows a **thin animated top-edge tracer** across the thumbnail —
  not a conventional progress bar. Reduced motion keeps the state and drops the
  animation.
- Hover reveals an **X**; clicking the body opens the item where supported.
- Type, size, source, process state and open/download/details live in the
  **hover-gated message chrome**, not a permanent metadata row.
- **More Info** carries producer/run, related message/workflow, version, hash,
  trust/freshness, retention, export history, and context-materialization truth.
- Download resolves the **exact stored version** and discloses drift when the
  live file has changed since the message. A failed operation never clears data.

## Multi-agent workflows

**Crew**, **Chat Room**, **Review** and **BrainStorm** are four kinds over one
foundation, owned by `collaboration.js`: one run record, one participant record,
one transcript renderer, one card, one full panel, one Activity projection and
one composer-target path.

- Each invocation opens its **configuration modal**, populated from Settings
  defaults. Each participant has a selectable model and Persona, and
  **requested versus effective** identity is always disclosed — never a silent
  substitution.
- Clicking a participant opens that participant's transcript. Cards expand
  inline and pop out to full panels. **Message** targets the ordinary composer
  and the chrome names the destination.
- **Review** — Single Agent, or Multi-Pass with **1–8 reviewers, default 3**,
  repeated models allowed. Initial passes are **blind and concurrent** against
  one **frozen** target pack. Findings are normalized, then exchanged for
  corroboration and disagreement. Review is **read-only and never auto-repairs**.
- **BrainStorm** is the third Deep Plan choice and a strict superset of
  Exhaustive. Base maximum **20** user questions; **Grill Me** raises it by a
  configurable **+25**, for an effective maximum of **45**. The maximum is
  shared across participants, not per-agent. Independent proposals, then evidence-driven debate, targeted
  research, voting, **preserved dissent**, and synthesis into exactly **one**
  Deep Plan document.
- **Crew Auto** is a checkable submenu item that opens configuration when
  enabled. It cannot start without committed config and cannot widen authority.
- **Chat Room** discussion creates no To-Dos, Plan or Goal without an explicit
  **promotion**.
- **Wonderer** is a built-in Persona plus a reusable methodology skill, and
  **Grill Me** is additive; both are options in Crew, Chat Room and BrainStorm.
  Wonderer's leads stay labelled as hypotheses until researched.
- Crew stays **distinct from Subagents**.

## Back Seat Driver

A separate **passive advisor**, deliberately not one of the four workflow kinds
and deliberately not in the Multi-Agent Workflows manager.

- **Off / Auto / On**, Auto default. Read-only: it never authorizes, mutates,
  certifies, or substitutes for a required review or test, and the primary flow
  completes identically whether BSD is Off, Auto, On, degraded or quarantined.
- Severity is exactly `nit | concern | critical`.
- **Held and reconfirmed advice** is the behaviour worth the design. A concern
  raised against generation N is **held**, re-evaluated against newer
  generations, and then either **cleared** (the newer work addressed it) or
  **emitted** — a stale warning is never delivered as if it were current. A held
  finding never renders as advice. Emitted advice names the generation it was
  raised against.
- It runs in its own isolated context and tool session over bounded deltas, with
  a cursor, cooldown, catch-up, quarantine and self-compaction that never
  touches the user's conversation.
- Stage bindings cover PRD Builder, Planning Wizard, ledger / PlanUnit work,
  Plan Compile, WorkNode creation and audit, execution, verification,
  remediation and certification. A bound stage is still never gated by BSD.
- It is visible in the compact Context row, a **Context Details** section, advice
  cards, and **Usage with its own attribution**, never folded into the primary
  run.

## Scheduling, execution windows, and quota resume

- **Schedule Message** lives in the **wand** menu. Plan cards expose **Build At…**.
- Execution windows support start, wind-down, pause, recurring resume, timezone,
  days and DST-safe behaviour, with the transition night stated rather than
  hidden.
- A schedule binds an **exact** Plan version and hash, or an exact message and
  attachment snapshot, and **revalidates before dispatch**. A later revision
  **invalidates** the schedule with a stated reason and requires an explicit
  rebind — it never silently runs the newer version. A duplicate nightly fire is
  idempotent.
- **Manual pause / cancel / Stop always overrides** scheduled or quota
  auto-resume, and the refusal is visible.

## Browser capture and DevTools

- Full visible screenshot, optional full-page screenshot, region screenshot, and
  component selection.
- Full and region capture send **immediately** to the current composer
  destination using an **isolated payload** — unrelated composer text is never
  sent along with it.
- The component prompt bar offers **Send Now**, **Add To Composer List** and
  **Insert Component At Cursor**; the last mode persists. The composer list is
  numbered with hidden refs.
- `BrowserElementContext` keeps a **stable locator** plus DOM, component,
  source, style, rect and page-generation data, and an optional crop; the
  locator survives a re-render.
- Ordinary internal browser and DevTools control is policy-gated. The
  **protected authentication browser stays human-only** and refuses with a
  stated reason.

## Teach, Teacher, memory, ELI5, Debug, and Revert

- **Teach** is user → Puppet Master durable teaching, through `/teach` and
  natural language. It captures a memory record and **never switches Persona**.
- **Teacher** is a distinct **Persona** that explains Puppet Master to the user.
  Teach and Teacher are never conflated.
- **Automatic memory creation** stays active under the Assistant memory owner
  and is not replaced by Teach.
- **ELI5** is an independent conversation override plus an application default —
  not a Persona and not a mode. It changes presentation only and never mutates
  artifacts.
- **Debug** is a primary mode with a full Investigation Context and
  verification / cleanup / recovery states.
- **Revert Last Agent Edit** restores the exact latest eligible **whole-turn**
  mutation manifest through FileSafe. It is distinct from conversation Rewind
  and is never partial; an ineligible turn says why.
- **Thread title policy** is Default resolver, None, or an explicit available
  model. A manual rename **locks** the auto-title until an explicit Regenerate,
  and an unavailable model is disclosed rather than silently substituted. An
  untitled thread reads **New chat**.

## What is fixture and what is not

This is a concept lab, and the distinction is kept visible rather than blurred:

- Every control above changes **fixture state** and renders a durable,
  re-readable result. None of them dispatches a native command — the commands
  they would call are registered in `Plans/UI_Command_Catalog.md` and have no
  handler yet, and each card's Details names the ones it would have used.
- Demo records carry a `demo: true` marker.
- Progress timers here are client-side. No client-local timer is authoritative
  in the runtime spec, and these are not either.
- No required behaviour is represented by a toast alone.

## File pointers (this directory unless noted)

- Engine: `app.js` (work records `state.works`, 500ms clock, sequencer, reveal gating,
  hover-card system, FLIP guard, composer, queue) · demo data: `data.js` (`workRuns`,
  thread `orbit-run` "Multi Orbit demo", model catalog).
- Orbit: `orbit.js` + `orbit.css`. Step Rail: `variants-a.js` (`W[8]`) +
  `variants-a.css` (+ shared disc metrics in `orbit.css` PART 1).
- Composer overlay, queue, selector collapse: `app.js` + `composer.css`.
- Menus: `menus.js` + `menus.css`. Context: `context.js` + `context.css`.
  History pin: `history.js` + `history.css`.
- Assistant-redesign wave (2026-09-03), one owner per file, each registering
  through `window.PM56_EXT` and loaded before `app.js`:
  `composer-state.js` (buffers, destination, history, spellcheck, quota strip) ·
  `attachments.js` (tray, tracer, message chrome, More Info, downloads) ·
  `plans.js` (the `plan-card-v2` document card, projections, Build control) ·
  `todos.js` (hierarchical per-thread list, receipts, refusals) ·
  `collaboration.js` (Crew / Chat Room / Review / BrainStorm over one foundation) ·
  `bsd.js` (Back Seat Driver policy, hold/reconfirm, Context and Usage) ·
  `scheduling.js` (Schedule Message, Build At, windows, quota resume) ·
  `browser-capture.js` (screenshots, region, component picker, DevTools) ·
  `assistant-features.js` (Teach/Teacher, memory, ELI5, Revert, Debug, title).
  Each has a matching `.css` concatenated last. `composer-state` loads first of
  the set because the others write the composer destination it owns; `plans.js`
  installs the identity-preserving `window.PM56_RUNTIME` merging accessor.
- Verification: `node orbit-verify.mjs` (+ `--negative`), `node tests/audit.mjs`,
  `node tests/context-verify.mjs` (current context contract: **207 checks**),
  and the redesign suites `node tests/assistant-plan-verify.mjs`,
  `tests/todo-verify.mjs`, `tests/collaboration-verify.mjs`,
  `tests/bsd-verify.mjs`, `tests/attachments-composer-verify.mjs`,
  `tests/scheduling-verify.mjs`, `tests/browser-capture-verify.mjs`,
  `tests/restored-features-verify.mjs`;
  build with `python3 build.py` then `--check` (never hand-edit the two HTML outputs).

## 31. Additive Correction v4 (2026-09-03)

`PM_Assistant_v2_Additive_Correction_v4` was applied on top of the implemented
v2 branch. It is **additive**: every rule above stays in force except where a
clause here explicitly retires an earlier value, and no v2 system was
reimplemented. The 5.6 Pro defaults, themes, Orbit and Step Rail, menus, thread
history, questionnaires, Context Lens, the context ring and details, the
activity bar, Send/Stop, the follow-up queue, the attachment tray and the
composer selectors are all unchanged.

**Question ceilings replace the old ones.** Plan Quick **3**, Standard **6**,
Thorough **8**; Deep Plan Thorough **10**, Exhaustive **15**, BrainStorm **20**.
Grill Me adds **25**, giving effective maxima of **28 / 31 / 33 / 35 / 40 / 45**.
The totals are derived from base + extension, never stored a second time. The
BrainStorm base of 15 and the Grill extension of +10 are **retired**; §21 above
was corrected in place rather than annotated.

One counter serves a whole planning run and is shared by every participant, so
the ceiling is never multiplied by roster size. A `QuestionItem` is charged once,
when its identity is first durably presented — re-render, restart, retry and
reopen charge nothing. A question already answered in the thread is resolved
from that answer, and a fact an agent can research is routed to research;
neither consumes the allowance. At the ceiling the admission returns typed
`question_budget_exhausted`: the run does not fail, no extra question is
persisted, and Build is disabled only when an unresolved item is an explicit
build blocker.

**Plan progress is one host-owned projection.** `PlanProgressProjection` derives
every step state from the thread's To-Dos, their work bindings and the Plan-step
mapping — joined on stable ids, never on heading text or list position. Leaf
states are `pending`, `in_progress`, `completed`, `blocked` and `skipped`; a
parent may be `mixed`. Several steps can be in progress at once and steps can
complete out of display order. A step whose *dependency* is unmet stays
`pending`; only a genuine blocker makes it `blocked`. Rich Text shows a marker
beside each step and Markdown shows a separate gutter rail — neither changes one
byte of the approved document, and the Markdown serialisation is byte-identical
whether a Plan is at rest or running. The `- [ ]` checkbox that used to appear in
the Markdown projection is gone: a checkbox reads as a status and as an editable
checklist, and status belongs in the rail.

**The Build control still has exactly four labels.** An unfinished Plan reads
`Building…` even when it is paused, waiting on a window or a Usage reset, holding
a failed attempt, needing attention or needing recovery. Those conditions appear
as secondary truth beside the control with the owner's exact reason and only the
actions the owner admits. `Failed` is not a fourth label.

**Plan Details tell the truth about the backend.** A Regular Plan states
`Direct planning` and `No ledger, no PlanUnits`. A Deep Plan shows its ledger
summary, its scoped PlanUnit count and validation, and the PlanUnit-to-To-Do
mapping — hidden by default, inspectable there, and never rendered as To-Do items
or as an Activity domain.

**Plan embeds are versioned.** Mermaid, graph, chart, image, diagram, table,
code, checklist, video and interactive blocks all go through the shared artifact
renderer and freeze an exact `artifact_version` at approval. Video and
interactive blocks carry a static fallback that PDF export uses, with the
caption. A missing, stale, denied or unsupported artifact renders an explicit
unavailable block naming which of the four it is — never dropped, and never
substituted with another version.

**Export separates the document from the run.** `Plan document` exports the
approved bytes and never changes the Plan hash. `Execution report` is a separate
versioned artifact carrying To-Dos, step states, deviations, evidence and a
completion summary keyed to the exact version, hash and run, and it says plainly
that it is not the approved Plan.

**Build as Goal** sits in the Plan's secondary actions. It creates one simple
Goal, one PlanRun and one binding, atomically, for the exact Plan version and
hash, and it *references* the existing To-Do list and scoped PlanUnit bundle
rather than duplicating either. The Goal is text-only and lives in Activity — no
title, no phases, no child Goals, no Orchestrator, no thread card. Pausing the
Goal keeps the Plan at `Building…` with a Paused reason; cancelling it makes the
Plan `Canceled` and fences only that execution's schedules and quota consent,
leaving unrelated scheduled messages alone. A repeated request with the same
idempotency binding returns the original Goal and run.

**Scheduled builds store one topology** — agent, goal_driven or crew — frozen at
commit, with a frozen Crew definition where that applies, and create no run, Goal
or provider attempt until first dispatch. Starting Build Now invalidates the
pending schedule for that version first.

**Scheduled messages have a card.** One durable schedule renders one card in its
source thread after a commit, never on button press and never as a toast alone.
Its states are `Scheduled`, `Held`, `Sent`, `Canceled`, `Failed` and `Expired`,
each with its exact time, IANA timezone, destination, preview, attachment count
and requested model. A `Sent` card links the message that was actually inserted,
at the real dispatch time. Attachments freeze exact artifact versions and hashes;
an unresolvable destination holds rather than rerouting, and an explicitly chosen
model fails rather than silently falling back.

**Workflow modals are transactions.** Opening or editing a Crew, Crew Auto,
BrainStorm, Review, Chat Room, BSD or Build-With-Crew modal creates only a local
draft. Before a confirmed Start there is no run, provider request, Usage record,
event, card, settings write or install — the concept counts these on an
instrumented ledger, and open → configure → cancel leaves every counter at zero.
Cancelling a natural-language BrainStorm returns the request to the composer
exactly as written. Crew Auto's checkmark appears only after a successful
Settings commit.

**Participants reach stated outcomes**: completed, failed, timed out,
unavailable, canceled, or explicitly waived, with required and optional declared
by the workflow definition. Nothing is silently substituted; a retry creates a
new attempt identity and preserves the failed one; a replacement or a waiver
needs an explicit reason. A one-reviewer Review says it is a single pass and
claims no corroboration; a partial Review reports requested, completed and
failed counts and stays attention-required. An active **Wonderer abstains** and
leaves the vote denominator entirely — two-for, two-against with a Wonderer
present reads 50% of four eligible voters, not 40% of five, and abstention is
never counted as opposition. A failed coordinator blocks clean completion and is
named; a failed Chat Room member produces no fabricated messages.

**Browser components revalidate at dispatch.** Session, page, frame, generation,
locator and captured identity are all checked. Exactly one compatible match may
refresh the generation and proceed; zero matches, multiple matches, a destroyed
frame, an identity mismatch or a changed source mapping return typed
`stale_capture` with a recapture action, and nothing is sent. In a numbered
composer list one stale item blocks only itself.

**Folders attach through the shared command.** `cmd.chat.attachment.add` takes
`semantic_kind: file | folder`, and a folder carries a bounded manifest — exact
root identity, entries and hash policy, exclusions, permissions and
materialization status — rather than a recursive dump.
`cmd.chat.add_file_reference` survives only as a file-only alias and refuses a
folder; the old statement that folder references are out of scope is retired.

**To-Do graphs fail closed.** A self-parent, a parent cycle, a dependency cycle
of any length, a cross-thread reference, and an unknown or duplicate id are each
rejected as `invalid_graph` with nothing committed. Replacing a list is one
atomic operation that first classifies every piece of active work as retained,
rebound, safely canceled or refused. A late event is applied only when the list
revision, item revision, work binding, Plan version and run epoch are all still
current; a stale one is retained as rejected evidence. Validation stays an
ordinary To-Do — there is still no verification status, no source groups and no
separate Done section — and the test module was renamed from `todo-verify` to
`todo-runtime-verify` so the name stops implying otherwise.

**What this is not.** Everything above is concept behaviour backed by fixtures.
It is not native proof: no Rust handler, storage engine, scheduler, provider
adapter or recovery path runs here, and the readiness report keeps canonical,
concept and native verdicts separate. Accessibility is out of scope for this
correction, and no pre-existing accessibility behaviour was removed.
