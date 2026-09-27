# Chat updates — current 5.6 Pro assistant behavior to fold into the Plans docs

**How to maintain this file:** it describes the CURRENT, authoritative behavior of
the 5.6 Pro chat concept. When behavior changes, DELETE the outdated sentence and
write the new truth in its place. Never append a changelog, never keep superseded
statements "for history" — an appended history will mislead the next agent.
Everything below is implemented and verified in this directory's build, except
where a sentence says a control only arms state or is a preview. A paragraph
ending "(re-check at closing)" describes behaviour a build lane is still
finishing.

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

These are concept-lab settings for Demo Studio. They are never compiled into
Plans.

- **Assistant body & composer** starts on **#8 Layered Studio** (`variants[0]=7`).
- **Thread History** starts on **#6 Preview Rows** (`variants[1]=5`).
- **Working Animation** starts on **#2 Orbit** (`variants[2]=1`). The dedicated
  Working activity picker matches that (Orbit · Default).
- **Activity Detail** starts on **#2 Status Board** (`variants[4]=1`).
- **Transcript** starts on **#17 Turn Stage** (`variants[5]=16`).
- **Question & decision** starts on **#9 Ask Card** (`variants[6]=8`).
- Full default vector is `variants:[7,5,1,0,1,16,8]`. Recipe starts as
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
  `.message-chrome` row below the message surface. At rest the row is hidden
  but keeps its space; hovering the message reveals it. Clicks do not pin the
  chrome open. After the pointer leaves, the row stays visible for **~280ms**
  so it is easier to reach. It stays open while its overflow menu is open, is
  hidden while a reply is being written, and shows once for ~1.5s when a
  streamed reply settles. Below **590px** width the row stays visible (no
  hover on phones).
- **Module ticks.** The popup modules add small one-line ticks to a reply's
  meta row: **Noted**, **Verified: …**, **Used 1 of your rules**, **Simple
  explanation**, **Sent on schedule**. They are part of the meta row, so they
  follow its gating exactly (hidden at rest, shown on hover). A reply's
  **Revert files** row ("Changed 4 files +121 −46 · Revert") is not chrome: it
  sits under the reply and is visible at rest.
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

## Transcript turns and item families (Turn Stage, the default take)

- The default transcript take is **Turn Stage** (transcript take 16). The other
  takes remain Demo Studio lab options.
- **Turn anatomy.** Each assistant turn opens with a small **orbit mark** in a
  24px gutter (it replaces the repeated "Assistant" label). A hairline **spine**
  runs from the mark through every item of the turn and ends in a dot. Cards
  meet the spine with a **family-colored tick**; prose carries no tick; ledger
  receipts sit **on** the spine (their icon rides the line). A user turn opens
  with extra air above it. The spine is one layer drawn behind the whole
  transcript, so cards never clip it.
- **Live.** While the assistant is thinking the mark's satellite (a bead that
  rides the ring itself, so the mark always reads as a circle) **orbits**;
  while a reply is written or work runs, the mark lights and a **comet of
  light** runs down the spine to the live point: a streaming reply's caret, or
  the live card. The comet appears only once it has real length (a few pixels
  under the ring read as a glyph, not as light travelling). Light, not color
  floods, says live. Reduced motion drops both.
- **Families.** Every transcript item is one of eight families, each with its
  own silhouette:
  - **Prose** (assistant text): no container, 14px reading type, the only
    full-contrast text.
  - **User**: a raised neutral bubble, no accent tint or colored border.
  - **Work** (working activity): a sunken instrument surface; the accent glows
    around it only while it is live.
  - **Deliverable** (plans, artifacts, file-change records): a raised sheet
    with a paper shadow and a teal eyebrow tile.
  - **Needs you** (permission, questionnaire, tool error, model unavailable,
    blocked, waiting): an accent-tinted surface, a round icon medallion, and
    one filled primary action at the far edge (danger-toned for tool errors).
    A collaboration run that needs the reader keeps its own card and shows it
    with an in-card warm tint, never the family halo.
  - **People** (crew / review / brainstorm / chat room runs, live subagents,
    delegation records): live subagents are a roster of rows. Collaboration
    run cards keep their own look inside the family: the spine tick only, no
    warm band and no avatar stack.
  - **Time** (scheduled messages while **Scheduled** or **Held**): the
    scheduled bubble keeps its own look and dateline (no ticket stub); the
    family gives it the spine's time tick. Once the message is **Sent**,
    **Canceled**, **Expired** or **Failed** it becomes a Ledger receipt.
  - **Ledger** (goal, context, thread-op, teach, memory and revert receipts,
    revert-turn, advisor notes (never Needs you), finished scheduled messages,
    route changes, reconnects, attachment events): not a card, one quiet line
    (icon, title, first line of detail); hover or focus expands the rest.
- **Accent rule.** Surfaces are neutral (Basic Dark and Light are graphite, not
  navy). The accent is spent only on live work, on Needs-you items, on the one
  primary action of a card, and on Send/Stop. Event icons outside Needs-you,
  the model chip and chart bars are neutral or family-toned. There is no
  exception: the Crew Coordinator's mark uses the text colour (provisional,
  pending Jared's decision).
- **Item identity.** Every item carries `data-family`, `data-msg-type`, a
  stable key and its turn position, so an item revealed mid-list animates in
  place and a thread switch arrives as one short crossfade instead of every
  card fading in.
- **Entrances by family.** Only an item that arrives live animates; a thread's
  existing items never do. Each family enters in its own way, for the same length
  in every voice (the voice changes only path and easing: Friendly overshoots with
  a slight tilt, Glass floats out of a blur, Retro steps and never scales):
  - **Deliverable**: the sheet rises 12px and unfolds top-down, its shadow
    arriving last (460ms).
  - **Needs you**: the item rises, then one accent ring swells out and fades
    (700ms).
  - **People**: the roster rises, then the live subagent rows arrive one by one,
    50ms apart.
  - **Time**: the ticket slides in 16px from the gutter side.
  - **Ledger**: a 4px slide and fade (220ms); receipts do not make a scene.

  The popup modules' own transcript surfaces (collaboration run cards and
  receipts, the scheduled bubble, advisor notes, file rows, the change-point
  divider) arrive through their own choreography and never play a family
  entrance; their family still places them on the spine. So the Time entrance
  has no item to play on, and People's plays only on the live subagent roster.
- **Thread switch.** The new thread's list fades up from 40% opacity with a 4px
  rise in 180ms, and the turn spine fades with it, so there is no blink between
  threads (Glass clears a blur, Retro steps, Friendly settles with a slight
  overshoot).

## Live replies (streaming)

- An ordinary reply **streams**. On send the reply's placeholder appears after
  the bubble lands: the model's name and a shimmering "is thinking" (elapsed
  seconds after 4s). When the first text arrives, the label **condenses
  toward the mark** while the first word emerges where the caret starts (the
  same 180ms in every voice: Basic condenses and blurs, Friendly hops away,
  Glass sinks into depth, Retro backspaces). The label leaves from its own
  layer, so the reply's first line never reflows. Words
  release at a natural, rate-smoothed pace (faster when text is waiting, a
  breath at sentence ends, never a dump), behind a soft caret. The reply's
  height follows its text through a spring, so a new line opens rather than
  jumps, and follow-along glides with it.
- Structure arrives with character: headings settle, list items slide in,
  code frames open then grow, inline code and bold stream as themselves.
- When the reply ends, the caret dissolves, the hover row shows for ~1.5s so
  people learn it is there, and the reply renders exactly as streamed (no
  reflow). A stopped reply keeps what was written with a **Stopped** marker;
  an error keeps it with the error's note.
- While a reply is being written the composer shows **Stop** and a send joins
  the follow-up queue. **Queue** is the default for sends made while the
  assistant is busy (DL-108); the product composer also keeps the **Steer /
  Queue** switch, where Steer sends straight into the running turn. The concept
  demonstrates Queue only; the switch comes with the port.
- **Send now** on a queued message **steers**: the reply written so far stays,
  with no Stopped marker, and that message is sent at once; any other queued
  message keeps waiting. The queue advances on its own only when a turn
  **completes**, never after **Stop** or an error (then it waits for Send, Send
  now, Edit or Remove).
  Leaving the thread lets the reply finish (it is complete when you return).
- Messages revealed after a work burst (the Multi Orbit demo's interim and
  summary text) stream in the same way, and the next burst waits until the
  interim text has finished.
- **Live agent turns.** In Agent mode a send that asks for work ("add the composite
  index…", "fix the rollback path…", "apply the pattern across the module…") plays a
  whole live turn: the thinking placeholder, then the working card born in its place
  under the same turn mark, parallel subjects, narration, a failure and its fix, an
  approval, and finally the answer streaming in as the card folds. The **Live turns**
  thread is their stage, and Demo Studio's **Live turns** group (Live reply, Live agent
  turn, Trouble mid-turn, Long agent turn) types and sends each one for real. Demo
  Studio's **Motion voice** picker shows any voice on any theme (default: follow the
  theme).
- Recorded example answers (ELI5) stay instant. Replies come from the concept's
  scripted reply set (`data.js` `scriptedReplies`), including two with
  structure: ask to "walk through the steps" or to "summarize".

## Sending

- The text you send **leaves the composer and becomes the bubble**: the typed
  glyphs lift off the field, scale to the bubble's size and travel to its slot
  while the bubble forms around them (one text layer; two only when the line
  breaks differ). The field's placeholder returns once the text has left it.
- **Theme voices.** One choreography, four personalities (dark and light share
  a voice); timing and order never differ, only path, easing and texture:
  - **Basic**: the text lifts; the bubble grows out of the text's own bounds.
  - **Friendly**: the bubble pops out of the Send button, catches the text
    mid-flight and carries it in; words hop into replies.
  - **Glass**: the text floats up; the bubble condenses out of blur; words
    surface from depth.
  - **Retro**: the text blinks out; the bubble prints in line by line and lands
    with a brief phosphor flare (never a dim); replies type in with a block
    cursor and phosphor bloom.
  PMConcept7 adopts voices by theme family (same eight theme ids).

## Sound

- The chat has a **subtle sound**, on by default. A speaker button in the chat
  header mutes it in one click (its hover card says what it does); the choice
  persists. Audio starts only after the first real click or key press, so
  demos that run on load stay silent until then. Reduced motion does not mute.
- Every sound is paired with a visual beat and never carries meaning alone:
  **send** (a soft lift with the flight), **first word** (a breath), **work
  born** (a low bloom), **step finished** (a tiny tick, at most one per 250ms
  and silent inside bursts), **failure** (a soft knock), **needs you** (a
  two-tone), **answer arrives** (a glide with the fold), **turn complete** (a
  two-note resolve) and **stop** (a muted click). At most one sound per 120ms.
- One kit per theme family (Basic, Friendly, Glass, Retro; dark and light
  share a kit), synthesized with WebAudio: no audio files. Every event is
  leveled to a tier by its measured loudness, so a beat sounds equally loud in
  every kit (within ~3 dB): needs you loudest, the turn's beats (send, work,
  fail, answer, complete) next, stop below them, the first word and step ticks
  quietest. No event peaks above -20 dBFS (checked by rendering each kit
  offline).
- Production: these events map onto the app's **Notifications & Sounds**
  settings (per-event toggles and the master volume live there); the header
  button is the quick mute.

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
- Clicking it re-engages **follow-along**: the transcript sticks to its bottom
  edge while a reply streams or a card grows, gliding after the growth (a
  critically damped approach, not a jump). Follow-along holds only while the
  reader is at the bottom; wheel-up, touch, a scrollbar drag, a scrolling key
  outside a text field, or anything that moves the view **up** (a jump to a
  search result) releases it, and scrolling back to the bottom re-engages it.
  Growth never moves a reader who has scrolled away; a receipt landing never
  drags them back down. The control does not steal scroll just by being visible.
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
- Thread rows are a **2-column** grid: left **lead** (status glyph only) | copy
  (title + optional time). The **⋯** thread-options control sits on the **right**
  edge of the row (absolute), hidden until the row is hovered or the button
  itself is focused — not when the row merely holds keyboard focus after a
  click. The status glyph **stays visible** on hover; it is not replaced by
  the menu. Each row’s hover tip is the status label; the more button has its
  own tip. History row / lead / status-slot use `overflow: visible`. At rest the
  title and summary use the full row width; copy only reserves right padding
  while the row is hovered or the options button is focused, so the text does
  not sit under the menu. Row horizontal padding is
  slightly tighter so the active inset ring does not crowd the title text. The
  **active** row keeps a **one-line ellipsized title**, the timestamp, and the
  **summary preview**; `box-sizing: border-box` and the copy gutter keep the
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
  width; the lead column stays collapsed (no hover expansion). Thread options
  still appear on the **right** on row hover only. Rows gain a little extra
  **left** inset so title and summary are not flush with the selection ring.
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
Detail only when that thread owns or invoked it, or when Goal Mode or Allow
Crews in this chat has stamped it on that thread, or when that thread still has
Goal/Crew **history** after the stamp is turned Off. Empty domains are omitted, not shown as zero.
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
- **Crew** — the thread has a `crew` event or a Crew run, **or** the wand's
  legacy **Allow Crews in this chat** is **On** for the selected thread (a
  stamp). Members come only from that thread’s `crew` event (Planner /
  Implementer / Reviewer / Browser auditor on Crew Coordination) or its Crew
  runs; none are invented. With neither, the Crew chip and its section read
  "No Crews in this chat yet." (count 0). Turning Allow Crews **On** opens
  nothing; it only stamps the thread. Turning it **Off** keeps Crew
  Coordination (and any thread that already formed a crew) and removes the
  stamp on threads with no crew history. Crew is not Subagents. The composer's
  Crew glyph is the Crew kind mark and follows the wand flag; the Goal glyph
  follows Goal Mode.
- **Crew, BrainStorm, Review and Chat Room runs** — the thread has a run of
  that kind. A click on the kind's chip reveals the newest card of that kind in
  the chat and pulses it once, instead of opening Activity Detail. The hover
  card lists at most 4 runs plus "and 2 more · Show all in Activity"; each row
  is the kind mark, the card title, the run's one true sentence (the same
  status word and reason as its card, so a born-waiting run reads "Waiting to
  start" and an unmet dependency reads "starts after …", never "Blocked") and
  its clock or "not started", and it says "helpers", never "participants".
  Clicking a row pins Activity on that run. Activity Detail shows a short
  summary of the run (its title, sentence, current phase, a compact team list
  with a stand-in sentence only where requested and effective differ, and Open
  Panel · Message), with the full record one click away in the run view
  (provisional pending owner decision E-04). (re-check at closing)
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
boxed hunk. On each file row those counts sit in a content-sized column with a
4px gap from the text. The entire row opens its real diff. Focused Goal has no summary card — the
compact Goal projection and a **View Goal** footer stand alone. The full Goal
section exposes lifecycle controls, **Objective history**, and **Ask for a
replacement** only — not continuation-decision dumps, session JSON **Details**,
or **Evaluate next turn**. The activity-bar Goal preview stays the short card.
**Edit objective** and **Details** close that preview and open this panel.
Focused
Subagents keep a slim head plus the one-line agent summary; focused Artifacts
keep the head and count only.

The Activity Bar previews use the same explicit status vocabulary as the board:
Blocked, Needs attention/Needs retry, Working, Changed, Queued/Waiting, and
Settled/Ready do not change meaning between surfaces. Each 354px preview has a
44px header, at most five 48px rows, a stable 68px status/time column, and one
34px **Open Activity** footer. The To-Do preview is the checklist form used by
agent plan lists: one line per item (status mark, ellipsized title, status
word in that same 68px column) and a single footer line that pairs **Open all**
with the blocked count. Preview rows have no identity glyphs and no
agent-initial badges; Subagents rows match Activity Detail (name, model and
current/blocker, status plus elapsed). Header totals are retained; duplicate
footer histograms are not.

Activity Detail body scroll uses **8px** horizontal inset (10px vertical) so
domain panels keep more readable line length in narrow widths.

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
- The half-second **work tick re-renders only the live working cards** (and the
  status bar's elapsed time); completions, reveals, new cards and queue flushes
  run a full render. Its period is 500ms of motion time (`PM56_CLOCK`), so a film
  tool that slows the clock slows the tick with it.
- **Cost at scale (measured on the review VM, software rendering).** At 140
  subjects the tick costs ~45-50ms against ~100ms for a full render of the same
  state (the old every-tick full render measured 185ms). About half of the tick
  is the ring itself: every spawn re-spaces the nodes and turns the dial, so each
  of the ~30 nodes restarts its transform transition. That is why the node count
  is capped at 30 (clusters, then Earlier); keep the cap in the port. Settled
  nodes drop their entrance animation, and the dial's turn lives on the ring
  (its only reader) rather than on the whole stage.
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
- **Auto-collapse rule:** a working activity collapses when a NEW working activity
  enters the thread, and the turn's **last** activity collapses **when the turn's
  answer starts streaming** (decided 2026-09-26), so the answer rises into the room the
  card frees. Both use the collapse choreography; the reader can reopen the card from
  its strip. Completing never scrolls the reader's transcript position.
- **Several subjects can be live at once** (parallel reads, a background command next
  to a test run): a subject is live from its start until its own duration ends. Every
  live node pulses; the core shows the newest live subject with a **+N** badge for the
  others. When no subject is running (the model is between tool calls) the most
  recently started one stays live, exactly as before.
- **A subject can fail or wait for the reader.** A failed node shakes once and turns
  danger-red with an x flag, and its panel chip reads **Failed**; a subject waiting for
  approval turns warning-amber with a pause flag, the core reads **Waiting for you**,
  and an **Approval needed** item appears in the transcript right under the card. The
  product item offers the full approval ladder (deny, once, for this session, always;
  ACD-011); the concept demonstrates Approve once and Deny. Approving resumes the run; denying stops it with nothing applied.
- **Long runs stay legible.** Past 16 started subjects, adjacent subjects of the same
  kind merge into one **cluster node** with a count ("Read ×12"); past 30 nodes the
  oldest fold into one **Earlier** node. A cluster's panel lists every member (the
  newest eight) with its rows. Pins follow the subject, not its place on the ring.
- **Narration.** Short lines the assistant writes between bursts of tool calls do not
  split the card: while a line is the newest thing the run has produced it streams in
  as prose at the **foot of the card**; when the next subject starts, the line **tucks
  up into the head caption** (it flies from where it was written). Longer prose and the
  final answer stay transcript text.
- Finished subjects keep their kind's colour (muted) with a small green completion pip,
  so a completed ring still reads as the run it was.
- **Demo controls** (play/pause, step, complete, reset, work history) sit behind **one
  button** in the card head that opens them as a drawer inside the head. They are
  concept-lab controls only (the product's Stop lives in the composer) and are
  **removed in the PMConcept7 port**.
- **Lab only, never product** (ACD-474): Demo Studio and its variant indices, the
  **Motion voice** picker (production follows the theme family), the **Live turns**
  demos and thread, the Multi Orbit demo, the card's demo drawer, the instant/stream
  reply switch, the scripted replies, the film clock (`PM56_CLOCK`) and every measured
  timing in this file.
- Collapsed activities show **receipt chips WITHOUT a "Worked for" chip** (elapsed
  already lives in the card head). Play/complete respect the user's pin and collapse;
  only Reset clears them.
- Tooltips on subjects are **instant app-rendered hover cards** (first line: subject ·
  stat; second line: verb + status) — never native `title` tooltips.
- While a card is running at the bottom of the thread, its detail region keeps a height
  floor so per-subject content changes do not push the page up and down.
- **A card that shrinks mid-turn never pulls the thread down.** When a live card gets
  shorter under a reader at the bottom (a narration line tucking into the caption, a
  subject's rows folding), the list keeps its height for 700ms (the next subject
  usually fills it), then eases the rest away gently. Before, a tuck dropped the whole
  thread 36px in four frames.

## Orbit (default) — behavior spec

- The stage is **always open**: dial on the left, detail panel visible — no click
  needed. In a narrow container the panel sits full-width UNDER the dial.
- The **panel follows the live subject**; clicking a ring node **pins** the panel to
  that subject (clicking the pinned node again is NOT a collapse). The **center disc
  always shows the live subject** and clicking it returns the panel to following live.
  It never collapses the card.
- The **panel X collapses the card** — live or completed — to a compact strip. The
  collapse is two beats: the panel folds while the dial recenters, then the dial lifts
  up into the strip line while the stage closes to the strip's height (one move, no
  empty box), and the strip settles in.
- **The fold never moves the thread.** When a turn's card folds as its answer starts,
  the room the card gives up is **held** (a floor on the list's height at its pre-fold
  size) and the answer grows into it; what the answer does not use is let go once it
  has settled, easing shut like a drawer. While the card folds, follow-along waits:
  the answer's first line mounts under a card that is about to free several times its
  height, so chasing it would scroll the thread down only for the fold to clamp it
  back. Measured on the live agent turn: the thread above moved 550px down and back
  at first, then 33px down and back in one frame, and 0px now. The answer that follows visible
  work starts writing without an "is thinking" label. Expanding is the exact reverse: the dial **drops down from
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
  tiers shrink nodes as the ring passes ~13 and ~22 nodes, and clustering keeps the
  ring at 30 nodes or fewer (a 140-subject run stays readable).
- **Birth.** A live turn's working card unfolds out of the turn's mark in the gutter (a
  circle growing to the whole card), in the theme's voice.
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
fourth regular depth and no Light / Balanced / Comprehensive labelling. Every
sidecar choice only arms state for the next composer send. It sets the mode and
its strategy (`set-plan-strategy`, `set-review-strategy`), closes the menu and
opens nothing. Choosing BrainStorm, Single Agent or Multi-Pass Review does not
open a configuration sheet today: those sheets open from the wand's Multi-Agent
Workflows rows (BrainStorm…, Review…) (provisional pending owner decision
E-01).

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
  **refused**, with the refusal visible (via **Show refused attempts**, not a
  raw JSON disclosure on the selected item).
- The **selected To-Do detail** is a header bar (title and an icon-only **Close details** mark),
  an inset **Expected** well, then a full-width wrapping dependency or waiting
  line when one exists, plus source links. It does not show dependency,
  attempt, or receipt dumps.
- Each virtual row is a bordered card: the title sits with the status glyph,
  and progress or status sits in a full-width meta strip under a hairline.
  Expand carets point **right** when collapsed and **down** when expanded.
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

## Wand modules: shared presentation

Every wand popup (Crew, Chat Room, BrainStorm, Review, Crew Auto, Back Seat
Driver, Schedule Message, Build At, Scheduled, Memory, Teach, Revert Last Agent
Edit, ELI5, New chat defaults) is a **configuration sheet** drawn from one
shared grammar (`pmx-system.js` / `pmx-system.css`, builders on `PM56_SHELL`).
Each module supplies only its own content.

- **Anatomy, top to bottom.** Head: the module's kind mark (26px, text colour,
  no tile), a sentence-case title with the canonical name inside ("Set up a
  Crew"), one lead sentence, and the close control; no header pill. Hero: the
  most important input, first and focused. Then the **plate** (a flat stage
  drawing of who is involved and where the result goes) over the roster or the
  module's equivalent, then the questions, the promise lines ("What won't
  happen") and one **Advanced** entry. Foot: the read-back sentence, the
  estimate line, Cancel and one primary.
- **Numbered questions** (1-4) appear only in the four collaboration kinds,
  where the order is real (job, team, how, extras). Settings-style sheets use
  unnumbered questions.
- **Fixed sizes.** Wide 1120×780 (1120×760 at 1280×800, 976×728 at 1024×768);
  standard 900×720; compact 720 wide at a fixed height per sheet (ELI5 560,
  New chat defaults 600, Revert 520). A sheet never resizes or re-centres while
  it is open: switching tabs, opening Advanced or adding rows moves nothing.
  Advanced opens as a page inside the same sheet, never as a disclosure that
  grows.
- **Yield rules.** The common case never scrolls at 1440×900 or 1280×800. In a
  collaboration sheet the plate yields first as the roster grows (full at 1-3
  rows, compact at 4, a strip at 5-6, one caption sentence at 7-8) and grows
  into spare height when the column is short. The roster scrolls inside its own
  region only at 7-8 helpers, with Add a helper kept visible. The side column
  scrolls only below 1280×800. The hero field scrolls inside itself past three
  lines and never grows. Below a 900px sheet width the body becomes one column
  that scrolls inside the sheet while head and foot stay put. A sheet is always
  fully inside the viewport, with no horizontal overflow.
- **Foot grammar.** The read-back is one sentence that is always true for the
  current settings; words that change ink. The estimate line reads "About 5–15
  min · stops at $6.00 · an estimate, not a promise", "Recorded example · no AI
  cost" on a recorded example, or "Time and cost depend on the work"; never
  "$0.00". The primary is a verb plus the canonical name plus a count ("Start
  Crew · 3 helpers") and stays the last enabled primary button. A disabled
  primary prints its reason beside it in words ("Add a job first."). A refused
  Start replaces the read-back with the refusal sentence and a [Fix] that opens
  the offending control; the offending row is marked and the code stays in
  `data-failure`. Sheets whose changes apply at once (Memory, ELI5, New chat
  defaults) show only Done.
- **Controls.** Every control has a visible label and one helper line written
  for a newcomer; a longer explanation lives in the app hover card on the
  label, never in a native tooltip or an "(i)" icon. Anything with described
  options uses the preserved dropdown trigger, whose look and motion are
  unchanged; its menu title is human ("How watchful") and every option has its
  own description line. Small numbers use a stepper, two or three exclusive
  words a switch, and checkboxes a drawn square over the real input. A disabled
  control prints its reason in words.
- **Hover-to-light.** Hovering a control, or focusing it from the keyboard,
  lights the plate parts and read-back phrases it affects in the accent and
  dims the other plate parts to 35%, with no re-render.
- **What is never drawn.** No pills or capsules, no side strips or vertical
  rules beside a block (columns are separated by space only), no nested boxes,
  no uppercase micro-labels, no initials avatars, no emoji.
- **Fonts.** Every surface uses its theme's own font, as PMConcept7 assigns it:
  Inter in basic and glass, Poppins in friendly, and IBM Plex Mono for
  everything in retro only. There is no separate display face and no italic
  voice. The "voice" roles (read-backs, result headlines, pull-quotes, run-view
  headings) differ only by size, weight (620; 600 in retro and friendly) and
  colour, and a quote is marked by quotation marks and the muted colour.
- **Spacing minimums.** Text sits at least 8px from a hairline, divider or
  border above or below it (6px inside a 40px in-chat lane, whose height grows
  rather than shrink the gap) and at least 12px from a container's left or
  right edge. Controls keep at least 10px horizontal and 7px vertical padding,
  and sheet buttons are at least 32px tall. Adjacent controls in a row sit at
  least 10px apart, stacked controls at least 12px, and a control at least 16px
  from unrelated text on its line. A secondary line under a row sits at least
  6px below the row and 12px above what follows. Roster rows are at least 52px
  tall. Body and helper text keep a line height of at least 1.45 and headlines
  at least 1.25. When space runs short, text wraps, truncates with an ellipsis,
  or a secondary element drops; padding and gaps never compress.
- **Height budgets in the chat.** A run card is at most 340px live and 360px
  when it needs you or has finished (400px at the narrowest card tier), and a
  receipt is one 44px line. A reply that changed files, took a note and used a
  rule grows by at most 40px. The 500ms tick only changes text inside fixed
  boxes; heights change only at state boundaries.
- **Surfaces and motion.** Sheets are opaque in-window modal surfaces over a
  flat scrim; nothing uses a backdrop blur or an element blur (provisional
  pending owner decision E-24). Motion is only transform, opacity, height and
  clip, and every draw-on is a clip reveal. Motion is the same in every theme
  except retro, which runs at 0.6× the durations with no scale on sheet entry
  (provisional pending owner decision E-22). Under reduced motion every change
  is its instant end state, never a fade (provisional pending owner decision
  E-25). A closing sheet stops taking input at once; its exit plays on a
  non-interactive copy.
- **Keyboard and focus.** A sheet opens with focus in its hero field.
  Ctrl/Cmd+Enter fires the primary, except that a warm (destructive) primary
  such as "Revert 3 files" fires only when it has focus itself. Escape follows
  the app's order: an open menu first, then the sheet's own cancel. After a
  committed Start or Schedule Message, focus goes to the composer; after Revert,
  to the files row; after a settings-style sheet (Back Seat Driver, Crew Auto,
  Memory, ELI5, New chat defaults) saves or closes, to the wand trigger; after
  any other sheet, and after Cancel, × or Escape, to the control that opened it
  (the wand trigger if that control is gone). Focus never lands on the page
  body. A model picker opened from a sheet opens over the sheet on its
  trigger's larger side and closes with the sheet.
- **Canonical commands.** Every control is a canonical `cmd.*`, draft state,
  view state, or a demo action. Each sheet's and card's Technical details line
  names the command its primary would dispatch, or says "no command: view
  state".

## Multi-agent workflows

**Crew**, **Chat Room**, **Review** and **BrainStorm** are four kinds over one
foundation, owned by `collaboration.js`: one run record, one participant record,
one sheet frame, one card, one run view, one Activity projection and one
composer-target path. Each kind supplies its own parts to that frame
(`PM56_<KIND>.sheetParts`, `cardParts`, `viewParts`); a kind never draws a
second frame. On screen the people in a run are **helpers** (**reviewers** in
Review); the data keeps `participant` (provisional pending owner decision
E-06).

**Where they start.** The wand's Multi-Agent Workflows rows open Crew…, Chat
Room…, Review… and BrainStorm… (provisional pending owner decision E-01). A
natural-language request for a BrainStorm opens the BrainStorm sheet with the
request prefilled word for word, and Cancel puts that text back in the
composer. A card's More › Change setup… / Run again with changes…, Build At ›
Who builds it › A Crew (scheduled mode) and a Plan's **Build With Crew** open
the same sheet.

**The configuration sheet** (wide).
- Hero: the job or question, the **Card title** input (derived from the job
  until you edit it: its first sentence, at most 48 characters, cut at a word)
  and the **In your chat** preview of the card's first frame. Start is disabled
  with "Add a job first." while the job is empty, except in scheduled mode,
  where the plan is the job.
- The plate over the roster. Each helper row has its job, its own model
  trigger, its own Persona trigger, Copy and Remove; a removed row can be
  brought back for 6 s. **Requested versus effective** identity is always
  disclosed: a stand-in is named in a sentence under its row ("Qwen 3.8 stands
  in for Qwen 3.8 Coder (offline)") before Start, it is allowed only when the
  sheet's "If a model isn't available" row permits it, and otherwise Start is
  refused (provisional pending owner decision E-03). Nothing is ever
  substituted silently.
- The roster foot: **Add a helper**, with a suggested next role, and **Start
  from a team ▾** (the kind's team presets, with "Your default" first when one
  is saved). Review has no Start from a team (provisional pending owner decision
  E-37).
- **Add specialists** (Crew, Chat Room and BrainStorm; never Review):
  **Wonderer** is a built-in Persona plus a reusable methodology skill that
  brings ideas from other fields, kept labelled as hypotheses until researched;
  it doesn't vote. **Grill Me** is a skill that asks you the key decisions
  first, with suggested answers (provisional pending owner decision E-35). Both
  are off by default, are added on top of the helpers and never replace one,
  and each shows its own model trigger; they join the run on those visible
  models.
- Every collaboration Advanced page starts with the same rows, in this order:
  Time and cost limit · Token limit · What helpers can see · Tools they can use
  · If a helper gets stuck · If a model isn't available · Keep the full record
  for · How it finishes · Permissions (a sentence, not a setting: helpers can't
  do more than this chat). The kind's own rows follow. The limits and estimates
  are concept numbers.
- Every choice reads one option catalog. "One of the helpers" as the Crew's
  Coordinator is listed disabled with "Not available in this preview yet."
- The foot: **Save as my default**, the read-back, the estimate, Cancel and
  "Start {Kind} · N helpers". Save as my default stores this kind's team,
  specialists and settings and prefills only new drafts (never Reconfigure,
  scheduled or recorded drafts); it shows "Saved as your default" in place for
  2.4 s, and where it is stored stays concept-local this wave.
- **Must-haves** (BrainStorm) are your own per-run rules, and Review's target
  choice is its own field. Whether a run is a recorded example is decided only
  by a recorded marker that a recorded example sets when it opens the sheet,
  never by what these fields hold; the recording preflights run only on
  recorded drafts, so a wand-started Crew or Chat Room is never refused for not
  being a recording.
- The sheet is a transaction: before a successful Start there is no run,
  provider call, usage, event, card or settings write, and open → configure →
  cancel changes nothing. Only after the commit succeeds does the preview fly
  onto the new card (when you are at the bottom of the chat) and focus move to
  the composer. (re-check at closing)

**The run card in the chat.** One card per run, on one node, in one of eight
densities: `starting` (Start accepted, no participant event yet; in this
concept only recorded runs reach it), `waiting` (only before any participant
attempt has started), `live` (the newest live run in the thread), `collapsed`
(older live runs, or collapsed by you), `attention` (needs you), `result` (just
finished, until your next message), `failed`, and `receipt` (one line once the
chat moves on). Every surface that shows or acts on a run's state (the card,
the dock, the receipt, Activity's counts and rows, the run view, the composer
destination, and which of Pause and Cancel is offered) reads it from one place,
never from the raw record status. A card turns to `result` only on a clean
completion, and nothing on a cancelled card changes again. (re-check at
closing)
- The card shows the kind mark and word, the card title, the cast (the lead
  first) and a clock; then one true sentence (status word · reason); a track of
  the kind's phases; at most three lanes plus "+N more · Show all"; a meta line;
  and the actions. A lane gives a verb plus either the helper's current words
  (one line, in quotation marks, streaming live; provisional pending owner
  decision E-31) or what it waits for. Raw tool output is never quoted as
  speech. An unmet dependency reads "starts after …", never "blocked". The
  Coordinator's mark uses the text colour, not the accent (provisional pending
  owner decision E-17). (re-check at closing)
- A run started from the wand with no recorded input is born `waiting` and
  stays there: "**Waiting to start** · Nothing runs by itself in this preview,
  so the Coordinator hasn't split the job yet." (each kind supplies its own
  noun), with the meta "Nothing spent · your setup is saved on this card", no
  clock and no motion loop. Its actions are [Watch a recorded example], which
  opens the kind's recorded example in a new chat and leaves your setup on this
  card, Open Panel, the expand chevron, and More (Change setup…, Cancel).
  (re-check at closing)
- **Needs you** is the one loud moment: a warm decision row says who needs what
  and who is not blocked ("**CSV specialist needs your OK** to restore a
  snapshot. Only this helper waits; the others keep working." [Allow once]
  [Don't allow] [Details]). An accent decision row is "your move" when nothing
  is wrong (a Chat Room round ended; a BrainStorm is ready to write the plan).
  (re-check at closing)
- Failures and stops offer only the owner's allowed actions and use the canon
  verbs **Retry** and **Recover** (provisional pending owner decision E-38): "**1
  helper didn't finish.** …" [Retry] [Use another model] [Continue without
  it]; a Coordinator or Moderator that stopped reads "**Needs attention** · …";
  "**Stopped at your limit** ($6.00 or 45 min) · everything so far is kept."
  (warm, not a failure); "Cancelled · 2 of 3 parts done · everything so far is
  kept."; and "Paused · nothing is lost." An accepted partial result adds
  "Degraded result: …" to its figures. No findings, no promotions and nothing
  to fix are success faces. (re-check at closing)
- The result face leads with the answer: a headline, a figures sentence, one
  output or the kind's board, and who did what; then **Open Panel**, the kind's
  follow-ons, Message and More. On a finished run, Message sits in More,
  disabled with "This {Kind} has finished, so it can't take messages. Ask the
  assistant instead." A collapsed or narrow card may keep Open Panel, Message
  and More behind Expand and the helper count in a hover card (provisional
  pending owner decision E-05). (re-check at closing)
- **One control set per run.** While a run's view is the active editor tab, the
  card's follow-on controls and finding ticks are replaced by one line
  ("Choosing in the report beside the chat" / "Deciding in the panel beside the
  chat") and come back when the view closes. A decision from an approval owner
  stays in the card. (re-check at closing)
- More holds Pause or Resume (only when valid), Cancel {Kind} with an in-place
  confirm ("Everything so far is kept. [Cancel Crew] [Keep going]"), Change
  setup… or Run again with changes…, Download transcript (disabled with "Not
  available in this preview.") and Technical details. (re-check at closing)
- **Receipts** share one grammar: "Crew · Export ready: all 3 parts checked ·
  8m 40s · $0.92 · Open Panel". The chevron expands a receipt back to its result
  face. (re-check at closing)

**The dock** (up to three lines above the composer, only for runs whose cards
are off-screen, or only partly visible when they need you): needs you → your
move → live runs, newest first → scheduling's "Coming up"; a fourth item
becomes "and 2 more · Activity". Permission decisions are never taken from the
dock; BrainStorm questions may be ("Answer now"). (re-check at closing)

**The run view.** Open Panel opens the run's full record in the editor pane
beside the chat, never as a centred modal: Summary, Report or How they decided,
then Conversation, Team and Cost (a Chat Room opens its room document with
Discussion, Team and Cost). A lane, team row or speaker name opens that
helper's own transcript. **Message** targets the ordinary composer, whose
destination reads "{Kind} · {card title} · N helpers", and the message you
send shows "Sent to {Kind} · {card title}" in its meta (a room adds " · 3
replies"; there is no "Read"). (re-check at closing)

**Crew.** A Coordinator (this chat's assistant by default; "A separate AI"
adds one more AI) splits the job into parts, hands them out, and accepts a part
only once its expected output is verified. Each part's "Done when" and "Starts
after" come from the Coordinator's split, not from the sheet (provisional
pending owner decision E-14). Working at the same time is clamped by the plan's
capacity and the card says so ("2 at a time (you asked for 3)"). After a
recorded Crew finishes, the assistant's summary reply appears under the card
labelled "Recorded example · no AI cost"; a real run never gets an invented
reply, and "Changed N files · Revert" appears only when Revert holds a manifest
for that turn. Crew stays **distinct from Subagents**. (re-check at closing)

**Crew Auto.** A checkable wand item plus its own sheet, reached from **Crew
Auto settings…** (the wand row and the Crew sheet). From the Crew sheet the two
sheets swap: Back to Crew, Cancel, Escape and a successful commit restore the
Crew draft, while × and the scrim close both. Nothing starts from this sheet. It
sets when Puppet Master may bring in a Crew by itself: big jobs only, or medium
and big; only when the job splits into 2 or more (or 3 or more) parts; which
team, at most 4 helpers with no specialists; and how many work at once. The cap
of 4 is never raised: a larger team is refused with "Crew Auto teams have at
most 4 helpers. Remove one to turn it on." "How it would decide" re-evaluates
four sample requests live from the draft. Turning it on commits the rules as
version N, adds one line to the chat ("Crew Auto is on · big jobs that split
into 2+ parts · rules v1 · Change"; provisional pending owner decision E-15)
and creates no card; the wand's check appears only after that commit succeeds.
Crew Auto cannot start without committed rules and cannot widen authority. A
declined evaluation creates no card; an admitted one is an ordinary Crew card
whose meta begins "Started by Crew Auto: …". (re-check at closing)

**Allow Crews in this chat** (the legacy wand row, On / Off) gates nothing:
both options carry "Preview: shown, not enforced yet.", and turning it On opens
nothing (provisional pending owner decision E-02).

**Chat Room.** A **Moderator** row is pinned first (fixed role, its own model
and Persona; it picks who speaks next and sums up each round), then four
helpers by default, "Who talks when" (Moderator guides / Take turns / Open
discussion / One answer each) and 1-20 rounds, default 5. The card shows the
current speaker, who is up next and the previous turn folded, with "Round 2 of
5". The end of a round is an accent "Your move." with [Next Round] [Summarize
Now] [Message]; End discussion is in More. A message sent while a round is
still going is refused with "This round is still going. You can send when it
ends." in the card's meta, and the text stays in the composer (provisional
pending owner decision E-18). The summary board is What we agreed · Still
debated · Open questions. Discussion creates no To-Do, Plan or Goal without an
explicit **Promote to** To-Do · Plan · Goal (three text buttons; Goal is
disabled on the protocol path with "Can't make a Goal from a room yet"). A room
without a recording is born waiting like every other kind. (re-check at
closing)

**BrainStorm.** The third Deep Plan choice and a strict superset of
Exhaustive. Its phases are Understand the ask · Draft ideas alone · Line up the
options · Debate · Check the facts · Vote · Write the plan. Base maximum **20**
user questions; **Grill Me** raises it by **+25**, for an effective maximum of
**45**. The maximum is shared by the whole run, not per helper, and reaching it
is not a failure. Helpers draft alone without seeing each other's ideas; the
ideas are lined up into options, debated for 1-4 rounds (default 2), and
checked against evidence (a research tool install is a warm decision); then
they vote. Evidence decides and votes inform it, and a rule always wins: an
option that breaks a must-have is ruled out whatever the votes. Dissent is kept
word for word, and Wonderer abstains and leaves the vote count. A tie is a warm
decision. **Write the plan** (canon: Synthesize; provisional pending owner
decision E-38) produces exactly **one** Deep Plan document, whose Plan card
appears directly beneath; the BrainStorm card stays. "Who writes the plan"
(the synthesis model) is its own Advanced row. (re-check at closing)

**Review.** Single Agent, or Multi-Pass with **1–8 reviewers, default 3**
(the count and the approach stay in sync: 1 is Single Agent), repeated models
allowed, each in its own fresh session; no specialists. You pick what to
review (your latest changes, the last answer, the last agent run, a Plan, file
changes, artifacts or a task result); a **frozen** snapshot is taken at Start
(shown as "snapshot"; canon: frozen target pack; provisional pending owner
decision E-38), and every reviewer sees that exact version. Initial passes are
**blind and concurrent**. Findings are normalized, then exchanged for
corroboration and disagreement. A target that changes mid-run is a warm
decision, and notes about the new version are set aside, never mixed in. Review
is **read-only and never auto-repairs**. The result reads "2 to fix · 1 unsure
· nothing was changed"; only confirmed findings are ticked and only they can
become To-Dos through **Create To-Dos (N)**. **Send Findings To Agent** writes a
fix request into your empty message box and never sends by itself; if the box
already has text it refuses, and the finding lineage travels in metadata, not
in the text (provisional pending owner decision E-07). A Single Agent result
says "Single pass: one reviewer, so nothing was double-checked." and shows no
agreement words. (re-check at closing)

## Back Seat Driver

A separate **passive advisor**, deliberately not one of the four workflow kinds
and deliberately not in the Multi-Agent Workflows group. It is never a card.

- **Off / Auto / On**, Auto default, for every chat in the project, set from
  the wand sidecar (the row shows the committed mode in title case, and the
  sidecar checks it) or from the sheet. Read-only: it never authorizes,
  mutates, certifies, or substitutes for a required review or test, and the
  primary flow completes identically whether it is Off, Auto, On, degraded or
  quarantined. The words "intervened", "blocked", "stopped you" and "blocker"
  never appear.
- Severity is exactly `nit | concern | critical`, printed Nit, Concern and
  Critical.
- **Held and reconfirmed advice** is the behaviour worth the design. A concern
  raised against generation N is **held**, re-evaluated against newer
  generations, and then either **cleared** (the newer work addressed it) or
  **emitted**. A held or cleared finding puts nothing in the chat. An emitted
  note names the version it was checked against ("Checked against the latest
  work (v2)", or "Checked against an earlier version (v2)" once the work has
  moved on). A critical that could not be re-checked before the assistant
  finished shows a dashed outline and "**Stale · not re-checked (v3):** this
  was about an earlier version, and it wasn't re-checked before the assistant
  finished."
- **The sheet** (standard). The cue sheet plate draws a typical task as six
  steps, with hollow cues where the current settings check quietly and a filled
  cue where it speaks up, hanging a miniature margin note; the catch-up wait
  and the quiet period after a warning are drawn on the same line. Below it:
  **Mode**; **Who advises** (model and Persona); **Memory** (Keep the advisor's
  notes, and "Tidies its own notes at 80%"); and **When it speaks up** (How
  watchful: Conservative / Balanced / Frequent; Catch-up delay: Off / 15 / 30 /
  60 seconds; Quiet period after a warning: 0-100 replies, default 3). With Off,
  the columns stay in place, dimmed, under "Applies when Back Seat Driver is
  on", so the sheet never jumps. Advanced holds Where it watches, For a run in
  progress, and Tidy its notes at. When the chosen advisor model is unavailable,
  a sentence under its trigger says nothing can stand in for it, because the
  advisor never swaps models by itself.
- **Save** is one click with up to three dispatches in a fixed order:
  `cmd.bsd.set` only if the mode changed, then `cmd.bsd.configure`, then
  `cmd.bsd.workflow.configure` only if a Where it watches row changed. It stops
  at the first refusal, says what saved and what didn't ("**Mode saved; the rest
  didn't.** Settings changed somewhere else. Reopen to see the latest."), and
  keeps the unsaved values on the open sheet. With an active assignment the
  primary reads "Save and refresh advisor", which starts a fresh advisor session
  and leaves the chat unchanged.
- **Where it watches** is ten rows, each a plain name with its canonical stage
  name in fine print and Same as default / Off / Auto / On: Writing the
  requirements (PRD Builder) · Planning interview (Planning Wizard) ·
  Researching and drafting the plan (Plan Drafting) · Breaking the plan into
  pieces (PlanUnit Compilation) · Creating build tasks (WorkNode Generation) ·
  Writing code (Code Generation) · Running tests (Verification Run) ·
  Ready-to-continue checks (Gate Evaluation) · Reviewing finished work (Audit
  Review) · Final sign-off, it only advises (Certification). Each row maps to
  canon's operational stage set: PlanUnit Compilation covers `planunit_compile`
  and `plan_compile`; Code Generation covers `worknode_execution` and
  `remediation`; Gate Evaluation and Audit Review are the readiness and audit
  stages of `worknode_audit`. Ordinary assistant work follows the project mode,
  with no eleventh row. An unknown stage name fails validation and is never
  ignored. A bound stage is still never gated by BSD.
- **In the chat, nothing is a card.** Every BSD line is Ledger family.
  - The ambient **eye** in the composer tools row (a muted eye on a neutral
    tile; none when Off) plays one iris sweep per check. Its hover card prints
    the status line.
  - The **Advisor note** is a margin note between steps: the kicker "Advisor
    note · Concern", a short title, one to four sentences, a fine line naming
    the version and the advisor ("· Claude Sonnet 4.6 as Critical Advisor", or
    "· Qwen 3.8 standing in for Claude Sonnet 4.6 (offline) as Critical
    Advisor"), **Why?**, and **Dismiss** ("Won't come back unless things
    change"), which leaves the line "Dismissed · {title}". Its weight is stored
    when it is emitted: a nit, or any note that arrives during the quiet
    period, is a one-line aside ("Nit · {title} · Why?") that expands in place,
    and replay or reload never re-weights a note. Notes from a replaced epoch or
    branch read "From earlier in this chat".
  - The **catch-up line** before the assistant finishes: "Holding a moment for
    your advisor · up to 30 s · [Don't wait]", with a ring that depletes over
    the real wait. When the advisor converges, the line becomes the note in
    place, or fades away when there is nothing to say.
  - One quiet **failure line**, deduplicated with a count: "Advisor couldn't
    check this step (took too long). Your main work continues · Details".
  - A **safety pause**: "Paused for safety: its last two answers weren't
    usable. [Resume] [Change model]"; Resume saves the same settings again.
  - `resume_only`: "Will be shared with the assistant when you resume."
- **Status words** come from one table and print the canon Context word first,
  then a plain helper, in the eye's hover card, the Context row and Context
  Details alike: **Off** · **Caught up** · checked 18 s ago (only when a review
  completed and the cursor converged) · **Idle** · watching, nothing to check
  yet · **Reviewing** · checking the latest work… · **Catching up** · 3 updates
  behind · **Finding held** · double-checking 1 thing (Context row and Details
  only, never the eye or the chat) · **Advice delivered** · 1 note in this chat
  · **Quota paused** · usage limit reached; your main work continues ·
  **Failed** · couldn't check this time · **Unavailable** · stopped for this
  run. A pause you asked for prints "**Unavailable** · paused by you"
  (provisional pending owner decision E-10).
- It runs in its own isolated context and tool session over bounded deltas, with
  a cursor, cooldown, catch-up, quarantine and self-compaction that never
  touches the user's conversation.
- It is visible in the compact **Context row** (eye, "Back Seat Driver", mode ·
  Persona, status line) and a **Context Details** section: three plain facts,
  then Advisor notes (N) (every finding with its state — Shown in chat /
  Double-checking 1 thing / Dismissed — its evidence as sentences, and raw data
  behind "Show raw data"), Session (the requested and effective advisor, and
  Pause / Resume / Stop advisor, each disabled one printing its reason), and
  **Usage with its own attribution** ("N checks · cost not reported · kept
  separate from your chat's usage"), never folded into the primary run. Usage
  and the advisor transcript open as compact sheets with a readable summary
  first.
- **Dismiss** and **Don't wait** are new command requests
  (`cmd.bsd.finding.dismiss`, `cmd.bsd.catch_up.release`; provisional pending
  owner decision E-32).

## Scheduling, execution windows, and quota resume

- **Schedule Message** lives in the **wand** menu. Plan cards expose **Build
  At…**. The wand's scheduled row opens the **Scheduled** manager.
- **The Schedule Message sheet** (standard). The message is drawn as a future
  bubble with a dashed outline, prefilled with the exact composer snapshot, with
  its attachments ("1 file · sends this exact copy") and its destination ("To
  **this chat**"). A 48-hour track shows now and the send marker. Presets (In 1
  hour · Tonight 10 PM · Tomorrow 9 AM · Monday 9 AM) write the real Date, Time
  and Time zone inputs, which are always visible; the device's zone is listed
  first and is the default, never UTC. Under them, the resolved time ("**Sat,
  Sep 27 · 10:00 PM** your time (Chicago) · in 5 h 30 m") and a DST sentence
  only when that night is affected. **Answered by** is an exact model and
  account: if it isn't available at send time the message is held and you are
  asked; it is never swapped. **If Puppet Master is closed at that time**: Ask
  me first (default) / Send as soon as I'm back / Skip it if it's more than N
  min late, with a real minutes input. The primary reads "Schedule for Sat
  10:00 PM". After a successful commit, and only then, the bubble seals (the
  dashed outline draws solid), the sheet says "Scheduled for Sat 10:00 PM."
  with [Done] and [See all scheduled], and the composer is cleared.
- **The Build At sheet** (standard). A week-map plate draws seven day rows
  across 24 hours: each slot is a band that wraps past midnight, the wrap-up
  minutes are hatched, the next occurrence is lit and a now line is drawn.
  **When**: One time (Date, Start at) or Nightly time slot (Start at, Stop by,
  Which nights, Wrap-up time, Keep going next time), with Time zone. Wrap-up
  time stops new tasks from starting that many minutes before the end, so
  nothing is cut off mid-way. **Who builds it**: the assistant, as a Goal (the
  Goal is created only when the build starts), or a Crew, chosen now through
  Set up the Crew…, which opens the Crew sheet in scheduled mode, so you are
  asked nothing at night. **If the slot is missed**: Ask me first / Build at the
  next chance / Skip it if it's more than N min late, where the minutes shown
  are the grace the schedule uses. The plan's id, version and hash sit in
  Technical details. A DST line appears only when relevant, computed from the
  real start and stop.
- All scheduling defaults come from one `SCHED_DEFAULTS`: a message is Ask me
  first with 30 minutes' grace; a build has 10 minutes of wrap-up, Keep going
  next time on, Ask me first and 30 minutes' grace.
- Execution windows support start, wind-down, pause, recurring resume, timezone,
  days and DST-safe behaviour, with the transition night stated rather than
  hidden.
- A schedule binds an **exact** Plan version and hash, or an exact message and
  attachment snapshot, and **revalidates before dispatch**. A later revision
  **invalidates** the schedule with a stated reason and requires an explicit
  rebind — it never silently runs the newer version. A duplicate nightly fire is
  idempotent.
- **A scheduled message in the chat** prints its canon state word first.
  **Scheduled**: the future bubble at its transcript position, "**Scheduled** ·
  sends 10:00 PM · in 5 h", a clock ring that fills over the real remaining
  time, one fine line (destination, files, model and account, zone), and [Edit]
  [Cancel] and Details, which opens the full record in place. **Held**: a warm
  decision bubble with the reason ("load-profile.json (v3) was deleted, so we
  didn't send, and we didn't send a newer copy.") and [Edit and send] [Cancel].
  A time missed while away is Held with a missed reason, not a seventh state,
  and offers [Send now] (an update that reschedules to now), [Reschedule] and
  [Cancel]. **Sent**, **Canceled**, **Expired** and **Failed** are one-line
  receipts ("**Sent** · 10:00 PM · you scheduled this on Sep 2 · Go to
  message"), and the real sent message carries the tick "Sent on schedule".
  Scheduled and Held are Time family with no stub; the other four are Ledger.
  (re-check at closing)
- **Dock lines**: "1 scheduled message needs you · [Show]", and at the lowest
  priority "Coming up · Next: 10:00 PM · '…' · +1 more · [Show]". (re-check at
  closing)
- **The Plan card's schedule line** sits beside the Build control and never
  replaces its `Building…`. Each secondary state leads with its canon token:
  "Builds weeknights 10 PM–2 AM · next: tonight" with a night ribbon; "Building
  now · wraps up 1:50 AM"; "**Outside execution window** · paused for the
  night, continues Mon 10 PM"; "**Schedule needs update** · You edited this
  plan (now V3). Build V3 instead? [Use V3] [Cancel schedule]"; "**Waiting for
  Usage** · resets 4:00 AM (from Anthropic), continues Mon 10 PM", with no
  countdown when the reset is unknown; and "**Paused** · …" for a build you
  paused. The next morning one receipt sums up the night: "Overnight: built 2
  of 5 steps (10:00 PM–1:52 AM, paused safely) · sent 1 scheduled message · 1
  message needs you · Open". (re-check at closing)
- **The Scheduled manager** (wide): the next 48 hours as a plate, where hovering
  a marker lights its row and hovering a row lights its marker; four tabs with
  their canonical labels (Scheduled Messages · Execution & Build Windows ·
  Resume & Safety Policy · Events & Automation); messages as an agenda grouped
  Needs you · Tonight · Tomorrow · Later · Past; search, status and sort on
  every list tab; each build slot with a mini week strip and a night journal;
  events as sentences; and a focused view of one record beside the agenda.
  (re-check at closing)
- **Manual pause / cancel / Stop always overrides** scheduled or quota
  auto-resume, and the refusal is visible. "Pause all automations always wins"
  names where the control lives, Scheduled › Resume & Safety Policy; in this
  concept it is one read-only switch for all scheduling, while canon latches
  each run separately (provisional pending owner decision E-19). Quota resume
  shows the reset time and its source ("from Anthropic", "your estimate", or
  no countdown when unknown), and it is changed only in the usage notice in
  the chat.

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

- **Teach** is user → Puppet Master durable teaching. It captures a rule and
  **never switches Persona**. The wand, `/teach`, "remember that…" and a
  message's More › **Save as a rule…** all open the **Teach sheet**, prefilled
  with the rule text and its source ("From: your message at 10:31"); the
  user's message stays in the chat as sent, and nothing is saved until Save
  (provisional pending owner decision E-12). The sheet holds Your rule (with
  "Try:" examples that fill it), a safety line that refuses anything that looks
  like a password or key, **Where it applies** as three nested rings (This
  thread ⊂ This project ⊂ Every project; Every project needs "It's safe to use
  in my other projects" ticked), **Locked** ("Only you can change this rule",
  on by default), the rule card exactly as it will be saved, and, when a
  similar rule exists, a word-by-word comparison with **Replace the old rule ·
  Keep both**, which Save waits for. The primary reads Save rule, Save and
  replace, or Save as version N. In correct mode an edit cannot widen where a
  rule applies, and the old wording stays in history. (re-check at closing)
- **Teach in the chat.** One receipt line per change ("**Rule saved:** 'Always
  use pnpm' · This project · locked · View", "Rule updated to v2", "**Rule
  turned off:** '…'"); consecutive saves coalesce ("3 rules saved · View").
  Replies whose context included a rule carry the tick "**Used 1 of your
  rules**", never "Followed": inclusion can be proven, obedience cannot
  (provisional pending owner decision E-36). Turning a rule off is an inline
  confirm, never a modal ("Stop using this rule? It stays in history, and older
  versions don't come back."). Lock and Turn off are new command requests
  (provisional pending owner decision E-32). (re-check at closing)
- **Teacher** is a distinct **Persona** that explains Puppet Master to the user.
  Teach and Teacher are never conflated; the Teach sheet's fine print says
  "Teach isn't the Teacher Persona."
- **Memory** is one sheet for notes and rules. Its plate reads what the next
  message brings ("Your next message will bring **1 note** and **2 rules**.")
  with those note and rule cards and a meter that counts **notes only** ("Space
  for notes: 11 of 350 tokens · 2 didn't fit"); rules never use that space.
  Tabs: **Notes it took** and **Your rules**. The notes filter is All / Verified
  / Unverified, default Unverified. Notes are grouped Needs your decision ·
  Unverified · Verified · Out of date, where "Out of date" is a display group
  only; the stored states stay Unverified, Verified and Discarded. A note's
  detail shows the claim, why it believes it (the file, each test case, what was
  tested), its history, and Verify · Pin or Unpin · Discard. A proposal to change
  a locked rule is a warm decision, [Keep my rule] or [Edit my rule…]. **Also
  keep notes that aren't verified yet** is on by default: unverified notes are
  kept for you to review and never used. The notes document is titled "Notes it
  took" (canon: Gist Review; provisional pending owner decision E-38).
- **Memory in the chat** is never a card. A reply's meta row gets "Noted",
  which relaxes to the glyph alone after 3 s, and "Verified: label checks pass
  (3/3)" once a check proves it; a note going out of date makes no chat noise.
  The only line is a proposal to change a locked rule ("Suggested change to
  your rule · 'Edit the source…' · it won't change unless you say so" [Review]).
- **Automatic memory creation** stays active under the Assistant memory owner
  and is not replaced by Teach.
- **ELI5** is an independent conversation override plus an application default —
  not a Persona and not a mode. It changes presentation only and never mutates
  artifacts. Its compact sheet shows two voices, Standard and Simple, over one
  shared code line that never moves; a choice applies from the next message
  ("Answers already here keep their wording"), and "Follow my usual setting"
  removes this chat's override. **How it's decided** traces All chats (the
  Explain Terms Everywhere setting, default Off) → Chats in this project (a
  preview level) → This chat, and lights the level that decides (provisional
  pending owner decision E-11). Replies answered in Simple carry the tick "Simple
  explanation", and a divider marks each change ("Simple explanations from
  here" / "Back to standard explanations"). Crew, Review and BrainStorm results
  stay technical. The composer's ELI5 dot is a speech bubble ("Simple
  explanations in this chat"). A retried answer does not yet re-resolve ELI5,
  so it carries no tick (a request to the thread-operations owner).
- **Debug** is a primary mode with a full Investigation Context and
  verification / cleanup / recovery states.
- **Revert Last Agent Edit** restores the exact latest eligible **whole-turn**
  mutation manifest through FileSafe. It is distinct from conversation Rewind
  and is never partial; an ineligible turn says why ("Nothing to revert yet",
  "Already reverted", "Only the latest change can be reverted."). Under the
  reply that changed files, a files row reads "Changed 3 files +5 −3 ·
  **Revert**", only on the latest eligible turn. Revert opens a confirm sheet
  with one row per file, a plain verb (Put back the old version / Delete the
  file it made / Bring back the file it deleted) and its counts; "Revert 3
  files" checks once more right before reverting. A file you changed since is
  marked "You changed this since" with **See what's blocking it**, which only
  opens the Revert document at that file and never reverts. When every file is
  already as before, the sheet offers Done and records `restore_skipped`. The
  rewind animation plays only on a durable `restored_clean`, after which the
  row reads "Reverted · 3 files put back". Outcomes keep canon's closed five
  (`restored_clean`, `restore_skipped`, `restore_refused`, `restore_failed`,
  `restore_recovery_required`). A conflict reads "**Couldn't revert:**
  checkout.js changed after the assistant's edit. Nothing was touched." with
  **Retry**; **Leave my files as they are** only dismisses it and writes no
  outcome record; a recovery case offers **Recover** (provisional pending owner
  decision E-38). No wording ever reads as a partial success. "See what
  happened" opens the Revert document: a timeline and one diff per file with
  What the assistant changed · What revert put back · Now. The word is always
  "Revert", never Undo, Rollback or Rewind. (re-check at closing)
- **New chat defaults** is a compact sheet with Done only: Explain simply in new
  chats (the ELI5 application default), Thought Stream (While it thinks / Always
  open), and Name new chats, each beside a live specimen. **Thought Stream
  drives nothing yet**: only its wand row, its sidecar and this sheet read it,
  and the sheet says so. (re-check at closing)
- **Thread title policy** is Automatic (a fast, low-cost model that is ready
  now), Don't name chats, or an explicit model with its account. An unavailable
  model stays pickable, reads "Not available now · {reason}", and chats are not
  named until it is available again — it is never silently substituted. A
  manual rename **locks** the auto-title until an explicit **Name it for me**
  (canon: Regenerate Title; provisional pending owner decision E-38), which sits
  in the thread menu directly under Rename and is disabled with its reason when
  naming is off or unavailable. The header shows a shimmer on "New chat" while
  naming, a lock glyph once you named the chat (it opens the thread menu), and
  a warning glyph when naming is unavailable (it opens New chat defaults at
  Name new chats); a generated title arrives word by word. Naming outcomes read
  Naming… · Named "{title}" · Not named: automatic naming is off · Couldn't
  name: {model} isn't available · Waiting for your first message · Kept your
  name: you renamed this chat. An untitled thread reads **New chat**. (re-check
  at closing)

## What is fixture and what is not

This is a concept lab, and the distinction is kept visible rather than blurred:

- Every control above changes **fixture state** and renders a durable,
  re-readable result. None of them dispatches a native command. Each sheet's and
  card's Technical details names the canonical `cmd.*` it would dispatch, or
  says "no command: view state"; an action with no catalog entry yet is a new
  command request.
- **Concept-only, never product behaviour:** the born-waiting face of a
  wand-started run ("Nothing runs by itself in this preview…"), **Watch a
  recorded example**, the guided demos, every "Preview:" and "Demo:" line, and
  the concept's time, cost and limit estimates.
- **Recorded examples** carry one label, "Recorded example · no AI cost", and a
  recorded receipt shows a play-ring glyph at every width. Whether a record is
  recorded comes from one provenance marker per module (`recorded`, `wand` or
  `seed`), never from the shape of its data. A real run never carries a recorded
  label, and recorded inputs are never written into user fields: a recorded
  example copies its values into those fields as a prefill. (re-check at
  closing)
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
reimplemented.

**Authority, in order.** The latest correction and the conversation that
produced it **supersede** the implemented v2 packet; v2 supersedes any
non-conflicting statement in this file; this file supersedes older `Plans/**`.
Nothing is kept side by side: where a clause below retires a value, the old
value is deleted from this file rather than annotated, and there is exactly one
active rule for any behaviour. The 5.6 Pro defaults, themes, Orbit and Step Rail, menus, thread
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

**Workflow configuration sheets are transactions.** Opening or editing a Crew,
Crew Auto, BrainStorm, Review, Chat Room, BSD or Build-With-Crew configuration
sheet creates only a local draft. Before a confirmed Start there is no run,
provider request, Usage record, event, card, settings write or install — the
concept counts these on an instrumented ledger, and open → configure → cancel
leaves every counter at zero. The hand-off from the sheet to the new card runs
only after a successful commit. Cancelling a natural-language BrainStorm
returns the request to the composer exactly as written. Crew Auto's checkmark
appears only after a successful Settings commit, and a Crew Auto commit creates
no card, only its one-line receipt.

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
