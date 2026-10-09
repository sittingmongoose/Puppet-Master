# Chat updates — current 5.6 Pro assistant behavior to fold into the Plans docs

**How to maintain this file:** it describes the CURRENT, authoritative behavior of
the 5.6 Pro chat concept. When behavior changes, DELETE the outdated sentence and
write the new truth in its place. Never append a changelog, never keep superseded
statements "for history" — an appended history will mislead the next agent.
Everything below is implemented and verified in this directory's build, except
where a sentence says a control only arms state or is a preview.

The Context Lens header trigger is retained at every supported chat-pane
width. At 420px and below the compact Goal projection yields the shared header
budget; Lens and the context ring remain reachable and their menus still open.
Canonical `Plans/**` are not edited from this file until an explicit compile.

Sources live in this directory. `index.html` and
`PM_Chat_Assistant_5.6_Pro_Standalone.html` are generated; never hand-edit them.
Build with `python3 build.py` then `--check`.

---

## Neon icon family

Every icon in the chat is drawn by one registry, `neon-icons.js`
(`window.PM56_NEON`: `icon(name, size, cls)`, `status(s, size, cls)`, `has`,
`register`), styled by `neon-icons.css`, in the activity bar's neon-sign
language.

- **One glyph per concept**, reused everywhere. The app's table, the module
  (pmx) glyphs and the former bespoke tables (thread options, attachments,
  sound, plans, To-Dos, Teach) all draw through the registry. An unknown name
  draws `info` and is recorded silently in `PM56_NEON.misses`. Provider marks,
  agent marks, charts and illustrations are not icons.
- **Anatomy.** A glyph is a lit tube (round caps and joins) over a soft core
  halo of the same ink; the soft tail of the glow is a radial backlight on the
  HTML host (status wrappers, activity-bar items). There is no CSS `filter`,
  `color-mix()` or `stroke-dashoffset`. Light themes keep a faint halo only,
  never a smudge or a plate.
- **Roles.** **Controls** (close, chevrons, copy, more, pickers, attach…) sit
  unlit in the host ink and **ignite on hover or keyboard focus**: the glyph
  lights to the text colour, the halo comes up on dark themes, and the glyph's
  act plays once. **Status** icons are always lit in their tone and move.
  **Concept** icons (kind marks, mode glyphs) are lit steady. A pressed toggle
  (history pin, Activity pin and filter) sits on a raised neutral tile with its
  glyph lit, never an accent tile.
- **Acts.** Each glyph moves part by part in its own way: the goal arrow strikes
  the target, the To-Do ticks check in one after another, artifact lines write
  in, the pen writes, the trash lid lifts, a chevron nudges, the wand flicks and
  then its sparkles twinkle, and Grill Me's kettle grill swings its lid open
  while flames flicker and smoke rises, then drops it shut with a small clank.
  Below 12px nothing moves; at 12-14px only parts with enough travel or length
  move.
- **Colour is reserved for status.** The tones are the bar's: blocked
  `--danger`, attention `--warning`, working `--accent`, changed `--accent-2`,
  done `--positive`, idle `--subtle`, paused `--muted`. Menu, event-card and
  card-head icons sit on neutral tiles. One deliberate exception: the
  composer's **capabilities wand**, and the wand in that menu's head, are drawn
  in colour, with a silver handle, a gold star and blue, pink and green
  sparkles. Each tube blooms in its own colour on dark themes and takes a
  deeper ink (at least 3:1) on light themes, and hover never greys it. After
  the composer wand's hover or focus flick its sparkles twinkle in turn (blue,
  pink, then green, 120ms apart): each dims, turns and bursts into an
  eight-point glint, all done about 1.1s after the hover. Under NieR the wand
  stays ink (see *NieR Mode*). The Skill step's wand (Orbit, the working card)
  still inks by status.
- **Voices.** Friendly overshoots, Glass glides, Retro steps, NieR steps square
  (see *NieR Mode*); timing and order never change.
- **Reduced motion** (the media query, Demo Studio's `body.pm56-reduced`, and
  `html[data-motion="reduced"]`) stops every act and loop; the lit ink, the
  halo and the silhouette still carry each state.
- **Fast mode** shows an amber bolt beside the model on the composer chip and,
  while a Fast reply's chrome shows, in its meta row. It strikes like lightning,
  top-down and only ever brighter than at rest: a bright leader (white-hot on
  dark themes, the bolt's amber on light ones) pours down inside the bolt from
  the top to the point in about 180ms, then the whole bolt, its halo and its
  backlight flash, re-flash and fade back into an afterglow. It strikes about
  every 5s while Fast is on, and hovering strikes it once more. The outline
  never dims or goes dark, and the bolt never shakes or moves as a whole.

### Status set

`PM56_NEON.status()` draws one shared set wherever a status shows (thread rows,
the chat header, the bar's previews, To-Dos, plan steps, module cards). Every
silhouette is distinct without colour, so states still read in grayscale and
under reduced motion.

| Status | Mark | Tone | Motion in lists |
|---|---|---|---|
| working (running, in progress) | a still ring with a bead travelling **on** it | working | the bead laps the ring in 9s |
| reviewing | a page with a lens | working | the lens sweeps |
| needs you (a thread waiting on the user) | a speech bubble with a tall "?" | attention | the "?" hops twice every 2.4s and the backlight swells; it outshines working |
| waiting on a dependency (queued for its turn) | an hourglass | attention | a slow tip |
| idle / ready | a small hollow ring | idle, unlit | none |
| complete | a bold check | done | draws once |
| blocked | a lock | blocked | the shackle drops, then a hard double blink |
| failed | a warning triangle | blocked | an irregular stutter on arrival |
| paused | two bars | muted | none |
| recovering (retrying, backing off) | two opposed arrow arcs | attention | a counter-clockwise ratchet |
| pending / queued step | a dashed ring | idle | none |
| skipped | a slashed circle | muted | none |
| mixed | a half-lit ring | changed | none |

In module (pmx) cards and sheets the marks are lit and still (one-shot acts
only), because those cards' loop budget is spent by their sheen.

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
  border, 9px radius). Send / Stop stays **24×24**. Icons are SVG only. A
  capability glyph is lit while its capability is on and plays its act on
  hover; Back Seat Driver **On** is a lit open eye, **Auto** a dim lowered lid.
- A static `1px` `--border-strong` divider always sits between the textarea
  and `.composer-tools` (including Layered Studio). Focusing the textarea does
  **not** glow, thicken, or recolor that line (no `:focus-within` ring, no
  `:focus-visible` outline on the field). Layered Studio still tints the
  tools **background**; the divider itself stays the same hairline.
- **Send / Stop** (`send-stop.js` + `send-stop.css`, "solid-living") is one
  24×24 chip with an 8px radius (a flat square tile under Retro), patched in
  place in every state. The chip stays solid (accent for Send and Queue, danger
  for Stop); the craft is in the glyph.
  - **Idle** (empty composer): the accent chip with its glyph at rest, a little
    dimmer. **Ready** (text typed): the glyph ignites with a short flicker and
    the plane hops once. Hover lifts the chip 1px and swells its backlight;
    press squeezes it.
  - **Sending into a run:** the plane lifts off along its heading, a fresh
    plane slides in and morphs point by point into a rounded square **on the
    accent**, and only then does the danger red flood out from under the
    square, so a plane never sits on red. Retro steps from accent to danger in
    one step as the square lands.
  - **Stop** shows while any work record is running **and the composer is
    empty**. Its white square breathes about 1px, at the activity bar's 2.2s
    working cadence while words arrive and slower (3.2s) while the model thinks
    or a tool runs, over a calm red backlight (.30/.18 on dark themes, .10/.06
    on light). It reads as running, not as an alarm.
  - **Clicking Stop** clunks the square, drains the red first, then opens the
    square back into the plane; a run that ends on its own drains and morphs
    back without the clunk. Stop cancels the live run and sequence. It does
    **not** clear the follow-up queue and does **not** auto-send the next queued
    message. The second click of a double-click is ignored (`event.detail > 1`),
    so a double-click on Send never stops the run it started.
  - **Busy with text = Queue:** a second plane stacks behind the front one with
    a badge counting the messages already waiting (1 or 2); a Queue click lifts
    the front plane off and the chip returns to Stop. **Full** (two waiting): a
    neutral chip with muted planes. A click on a full chip, or with nothing to
    send, **sputters** (a 300ms flicker that does not light); the full chip also
    shows the "Queue full" toast. A refused send shakes once with a danger flash.
  - Opening a busy thread shows its Stop at once, without the send motion.
    Typing or editing a queued follow-up morphs it back to Send without a full
    app re-render. Reduced motion (all three routes) shows the end states only;
    a refused send then shows a static danger ring for 1.4s.
  - **NieR:** an ink block with a paper plane; Stop is an ink block with a paper
    square that turns NieR rust on hover (a pointer that just sent must leave
    and come back first); square corners, stepped motion, no light.

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

## NieR Mode (NieR Light and NieR Dark)

Demo Studio's theme list ends with **NieR Dark** and **NieR Light**, after the
eight family themes. They follow PMConcept7's NieR contract exactly, so its
port carries every rule unchanged: NieR **paints Basic** (`body[data-theme]` is
`basic-light` or `basic-dark`) under `html[data-o55-nier="on"]`, with
`data-o55-nier-parts` listing the installed parts. Picking any other theme
removes every NieR attribute, layer and font.

- **Owners:** `nier.js` (engine, contract, Demo Studio manager), `nier.css`
  (palette, generated by `nier_palette_56.py` from PMConcept7's
  `nier-automata.json`), `nier-fonts.js` (PM NieR Sans and PM NieR Mono,
  embedded, OFL), `nier-parts.js/css` (look, motion, sound and pointer parts),
  `nier-world.js/css` (world parts) and `nier-scenes.js/css` (scenes; generated
  block from `nier_scenes_56.py`).
- **All 29 of PMConcept7's parts**, each switchable and all on by default, in
  Demo Studio's **Plug-in Chips** (five groups, a storage meter, the presets
  Full install / Quiet / Still / Colors only, and Play reboot moment). The
  choices persist per viewer.
- **Look:** ink on parchment, square hairlines, the menu cursor (an ink bar with
  paper text and a stepping square cursor), YoRHa headers, the parchment
  ground, target brackets on focus and the chosen thread, diamond loaders, the
  square pointer and square icon strokes. The cursor's paper text follows a
  class on the hovered item rather than a `:hover` rule on its whole subtree,
  as in PMConcept7, so moving the pointer restyles only the two items it
  leaves and enters.
- **Motion:** the reboot moment when NieR turns on or off, as PMConcept7
  draws it: a plate in the look's own NieR ground (never a full ink or
  parchment sheet) grows in held steps from the control you pressed, types a
  short check list while the look repaints under it, and tears out in six
  horizontal slats; turning off, the slats close in and the plate folds back
  into the control. Presses wait until the reveal, and the `wake` chord plays
  once at the reveal when NieR turns on or the moment is replayed, never after
  turning off. No large surface ever flashes; only small elements flicker.
  The other motion parts: the stepped slice on menus, dialogs and sheets; the
  title decode (titles and labels unscramble) on a thread switch; the page
  wipe; drifting particles; the ambient sweep; and a glitch on alert toasts,
  refusals and failed steps.
- **Sound & voice:** NieR's ticks play through the chat's own sound switch and
  mute; Report / Alert / Proposal leads and the POD 042 band on toasts and
  system cards; Pod 042 hovers above the composer and turns toward toasts.
- **World:** the boot log, status-bar readouts and the context HP bar, block
  progress, ink charts, corner ticks, machine glyphs, intel cards for hover
  cards, the **Pod 042 persona** (it answers in Pod's voice while NieR and the
  part are on), quest banners (plan approved, build complete, goal complete),
  empty-state drawings and the save signal.
- **Scenes:** a background picker (None, City Ruins, Bunker, Desert, Forest
  Castle, Amusement Park, Flooded City, Follow the page) draws PMConcept7's ink
  panoramas as the transcript stage's own background. A change between two
  scenes cross-fades over 520ms; reduced motion and the Still and Colors only
  presets swap instantly. Follow the page maps the chat's view: the park for
  chat, the bunker for a plan, the desert for the context drawer, the flooded
  city for running work, the forest for an open artifact.
- **Icons under NieR:** no glow anywhere, ink tubes with square caps, stepped
  acts. Status marks stay distinct: needs you is an inverted ink block with a
  paper "?" (with ink corner brackets under the brackets part), working is the
  diamond loader, idle and pending are squares. The capabilities wand stays
  ink, with no colour: its handle is a lighter ink tone and its star is filled,
  and its sparkles twinkle in held steps. The Fast bolt's leader steps down band
  by band in ink, and the bolt then flashes solid ink in held frames.
- Reduced motion (all three routes) stops every NieR motion part; the static
  look stays complete.

## Retro themes (Retro Dark and Retro Light)

Retro Dark and Retro Light are PMConcept7's retro themes: its palette and its
box grammar, over 5.6's own geometry and type sizes, with every retro motion
and sound unchanged. `retro.css` draws the boxes; every rule is scoped to
`body[data-theme^="retro"]`, so no other theme changes and NieR (which paints
Basic) never reaches it.

- **Palette.** Retro Dark is PMConcept7's olive "Atlas": ink `#dfe6cf` on
  `#171a14` (canvas `#10120e`, raised `#1e2219`), a lime-yellow primary
  `#b8d066` (Send, primary buttons), blue `#9db4d0`, lime `#86c46a` for
  positive, the user turn, the selected thread, focus and checks, warning
  `#d8b93c` and danger `#e2694f`. Retro Light is ink on warm paper: `#1A1A1A`
  on `#F5F0E8` (raised `#FAF7F2`), a **blue** primary `#0047AB` (Send, primary
  buttons, focus), green `#2F7A3D` for positive, the user turn, the selected
  thread and checks, and danger `#D32F2F`. Two Retro Light inks are made
  readable rather than copied: warning text is `#A65800`, PMConcept7's orange
  darkened to 4.6:1 on the paper (its `#F57C00` reads 2.4:1), and the text on
  the green user turn is the paper colour `#F5F0E8` (4.7:1, where PMConcept7's
  near-black reads 3.3:1). `--border` is PMConcept7's inner hairline and
  `--border-strong` its structural line. The Turn Stage family tones, the
  context composition segments, the working steps' hues and the idle neon tone
  come from the same inks.
- **Square corners.** Every corner is square, except 2px on inputs, chips and
  pills, and round dials, rings, status dots, the bead on the Turn Stage spine
  and the discs a motion draws (neon halos and backlights, Send / Stop's flood
  and backlights). Markers that count steps (the Ask Card's spine marks and
  thumb, a plan's step boxes) are square. Any radius stated elsewhere in this
  file is square under Retro.
- **Lines and shadows.** Structural boxes carry a dark 2px line, drawn as a 1px
  border plus a 1px outer ring, so no box changes size and nothing that
  measures a box moves; inner boxes carry a hairline. Shadows are hard offsets
  with no blur: 5px on menus, hover cards, drawers, dialogs and module sheets,
  3px on thread rows, deliverables and the boxed reply, 2px on the primary
  button, the activity bar and a queued follow-up. Menus, hover cards, drawers
  and dialogs are opaque, with no backdrop blur. A faint 3px pixel grid lies
  over the whole app and never takes a pointer.
- **Boxes.** Thread rows are boxes in the structural line on a darker rail; the
  selected row is a lime (Retro Light: green) box with a lime line and a lime
  hard shadow. The user turn is a solid lime (green) block in the structural
  line with a soft glow off its right edge. The assistant turn is a square box
  on the raised surface with one plain 2px structural line all round and the
  3px hard shadow, and no coloured strip on any side; its orbit mark sits
  beside the box's top corner and the spine runs 17px clear of its left edge,
  so the box hangs off the spine. The subagent feed draws its turns the same
  way. The working card is a hairline chat card at rest and, while live,
  PMConcept7's op card (a lime wash and an olive edge) instead of the accent
  ring and glow. Deliverables are chat cards with the hard shadow; system,
  event and plan cards are chat cards without one; a Needs-you card keeps its
  tone's line and takes a hard shadow; collaboration run cards take a 2px
  hairline ring; nothing has a gradient. The composer is a square box on the
  raised surface in the structural line, with square selectors, square in-field
  glyph tiles and a square Send, and it does not change on focus, as in every
  theme. A queued follow-up is a square chip with an orange line. The Ask Card
  takes the structural line and a hard shadow. To-Do rows stay flat one-line
  rows: Retro adds only a hover fill and the selected wash, never a box per
  row. Focus is a 2px outline in lime (Retro Dark) or blue (Retro Light);
  scrollbar thumbs are square, in the primary at 50%.
- **Kept.** IBM Plex Mono for everything, every retro font size and step-down,
  every retro motion (stepped eases, the 0.6× pmx timing, the print-in and
  phosphor bloom, the block caret) and the retro sound kit.

## Hover labels

- Icon chrome (attach, capability dots, wand, Context Lens, thread-search,
  worktree, context ring, history pin/close, history search, header
  new-thread/history, the app header's Threads / Demo Studio / Reset chips, the
  editor's Return to chat and its tabs, the model picker's provider rail and
  favourite stars, the history rows' status marks and the pinned drawer's
  resize handle, the thread-operation dialog's close and its result actions,
  Activity Detail filter/pin/close, queue pencil and send-now, Send/Stop,
  message meta chips, message actions, Expand/Collapse, Context compact menu
  and More details controls, **scroll-to-bottom**) uses the app **hover card**,
  not a native `title` tooltip. The popup is a **24px selector-style pill**
  (`surface-3`, 1px border, 9px radius, 12px type). Icons themselves stay
  icon-only; the name appears on hover.
- **Previews are the one exception** (Jared, 2026-10-09; Plans DL-157,
  F3-590, UIW-013). The chat shows one hover surface at a time, so a hover card
  inside an open Activity Bar preview would replace the preview under the
  pointer: nothing inside an open preview opens one. The Subagents rows keep
  the native title "Open <agent>", the Artifacts rows "Open <artifact>", the
  Changes rows "<path> — <summary>", and the Crew member rows (shown while no
  Crew run is live) the member's name. The Goal preview's controls (Pause or
  Resume, Edit — accessible name "Edit objective" — Cancel Goal, Open exact
  Plan · Vn, Revise Plan, Objective history), the To-Do rows and their
  more-items and blocked lines, a collaboration kind's run rows, a live Crew
  run's rows and every preview head have no title and no hover card. Outside
  an open preview the rule holds: the Goal panel's Edit and a To-Do row in
  Activity Detail keep their hover cards.
- Persona / Model / Mode / Permissions always use the hover card too, with a
  short action line (`Persona · …`, `Model · …`, `Mode · …`,
  `Permissions · …`) whether the chip is labeled or icon-only.
- Activity-bar domain previews open after **~650ms** of pointer hover and
  immediately from keyboard focus; they are interactive previews, not labels,
  so the label timing below does not apply to them. They are named interactive
  dialogs with actionable rows and one **Open Activity** footer; crossing from the trigger
  into the preview keeps it open, and Escape dismisses it without moving focus.
  The footer remains mounted through pointerdown so its click always reaches
  Activity Detail. Text tips are discarded when pinning, unpinning, or another
  layout change moves their anchor, rather than following the replacement
  control and becoming stuck.
  Text hover labels wait for deliberate intent (product canon F3-523): a label
  opens only once the pointer has rested on its control for at least
  **1600ms** and has stayed within a 5px radius for the last **1100ms**
  (moving out of that radius restarts the still time, never the rest time), or
  after **1000ms** of continuous keyboard focus. There is no warm handoff:
  moving on to the next control waits the full time again. A press on a
  control dismisses its label and keeps it hidden until the pointer leaves.
  Labels close 160ms after the pointer or focus leaves. Text
  tips still work inside open menus and drawers (Context compact pop and More
  details). Long tip copy wraps inside the pill (`max-width` ~280px); it does
  not spill past the card edge.
- Tips stay up across live work ticks (Orbit / Step Rail) without blinking: the
  overlay root is not re-patched on clock-only ticks, disconnected `pointerout`
  from `pmPatch` is ignored, and an open tip with the same `data-hover-key` is
  kept and only repositioned (a tip opened from keyboard focus stays while
  focus stays inside its control).
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
  overflow **panel is a sibling** of the toolbar (not nested inside it). When
  More opens, the meta chips and Copy / Details / More keep their row and their
  places (a user turn's toolbar stays right-aligned); the panel opens on its own
  line below them.

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
  own silhouette (Retro draws them as PMConcept7's boxes: see *Retro themes*):
  - **Prose** (assistant text): no container (a square box under Retro), 14px
    reading type, the only full-contrast text.
  - **User**: a raised neutral bubble, no accent tint or colored border (a
    solid lime or green block under Retro).
  - **Work** (working activity): a sunken instrument surface; the accent glows
    around it only while it is live (under Retro a live card is a lime wash
    with an olive edge instead, with no glow).
  - **Deliverable** (plans, artifacts, file-change records): a raised sheet
    with a paper shadow (a hard offset shadow under Retro) and a teal eyebrow
    tile.
  - **Needs you** (permission, questionnaire, tool error, model unavailable,
    blocked, waiting): an accent-tinted surface, a round icon medallion, and
    one filled primary action at the far edge (danger-toned for tool errors).
    A collaboration run that needs the reader keeps its own card and shows it
    with an in-card warm tint, never the family halo.
  - **People** (crew / review / brainstorm / chat room runs, live subagents,
    delegation records): live subagents are a roster of rows, each led by the
    agent's puppet (see *Puppet agents*), which keeps swaying on its strings
    while the agent works. Collaboration run cards keep their own look inside
    the family: the spine tick only, no warm band and no avatar stack.
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
  exception: the lead seat's puppet (the Crew Coordinator's, which wears a
  crown, and the Chat Room Moderator's, which holds a gavel) uses the text
  colour (provisional, pending Jared's decision).
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
- **Subagent live transcripts.** Opening a subagent (its Activity Detail row or
  that row's **Open live transcript**, a row on the Live subagents card, an
  Orbit satellite or a row of an Orbit panel's Child agents, an Agent Stage
  lane, or a working-activity detail row that names a child agent) opens its
  read-only live transcript in the editor pane beside the chat. A Subagents row
  in the activity-bar preview pins Activity Detail on that agent instead. The
  feed is the same Turn Stage take as the chat (one orbit mark in the gutter,
  the spine through every item, the eight families, the theme's motion voice),
  drawn on a root of its own, so the chat's spine, streaming, sound and
  follow-along never bind to it. Its head is one row: the agent's name, its
  status mark and word with the elapsed time, the model (underlined), the
  parent (it ellipsizes in a narrow editor, with the full name in its hover
  card) and one **Read-only** marker at the end (**Read-only · live** while the
  agent works), whose hover card names it a read-only child thread and says
  that nothing in the feed acts on the parent. There is no composer. Messages
  sit one item gap (14px) apart, like paragraphs of one stream: their chrome
  reserves no height and appears on hover or focus as a small tool row
  floating on the gap above the message (below the first one), with the time
  and worked chips, **Copy** and **More details**. The model is in the head,
  not in that row, and **Expand/Collapse** stays inside long messages; at 590px
  and below the row sits in flow, as in the chat. There is no Edit & branch, no
  More overflow and no message affordances, and event and Needs-you items keep
  their cards but show no actions (no Recover), so nothing in the feed acts on
  the parent thread. While the agent works its mark is lit and the comet runs
  down the spine to its latest item; reduced motion drops both. In this
  concept the child transcripts are fixtures, so nothing new arrives in them.
  - **Work between messages.** The parent transcript hides a subagent's work
    records; its feed keeps them. Each run of work records between two
    messages is one **stretch** row: a compact Step Rail (one disc per record:
    finished discs lit green, the live one the dark disc rimmed in its phase
    hue, pulsing, its glyph acting; past 12 records the earliest fold into one
    counted disc), a plain count of what the records say ("Ran 3 tools · read 2
    files"; a stretch of one record reads as that record's title), the time of
    its last record and a chevron. While the agent works, the stretch the feed
    ends on is live and reads "Working · 2 tools so far" with a shimmering
    verb. The row is a real toggle: open, it lists every record of the stretch,
    one quiet line each (glyph, title, detail, time), with the full detail in
    the hover card, cascading in like Step Rail rows in the feed's voice;
    reduced motion shows the end state at once. Query Analyzer's fourteen work
    records fall into five stretches between its eight messages, and its last
    stretch is the live one.

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
- While any work record is running the tile is **working**: accent ink, a
  heavier stroke, the neon working halo, `ab-breathe` (2.2s) and a small
  chevron nudge; hover card **Scroll to latest**. Idle, its chevron is an unlit
  control that ignites on hover; hover card **Scroll to bottom**. Reduced motion
  keeps the accent and the halo and drops the animation; under NieR the nudge
  steps.

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
the reference-video layout in PM tokens, with one accent voice wherever the card
speaks to you: quieter shell (soft edge, no hard kit border) lit faintly in the
accent from its top-left corner (the pill face carries the same light through
the morph), ghost close, prompt as title with a still needs-you mark to its left
(the shared waiting status glyph, held still: its "?" hops in once per question
and never loops), a traveling numbered thumb on a 4px spine to the right of the
options (stretched above the footer so the last mark never clips), the card
matches the composer width, and the composer stays below unchanged. The decision
host does not clip this take. Footer is `Question N of M` on the left, text
**Back** / **Skip**, and an accent-filled **Next** (or **Submit** on review),
the card's one filled control. Choice does not auto-advance. Options rest on a
faint tint of the ink; the chosen row takes an accent tint and hairline, an
accent number and a semibold label, and its radio dot pops in (or its check
draws itself) once, landing just after its row on open and on a question change.
The numbers stay plain numerals ("1.") that turn accent on the chosen row; there
are no number tiles. Single choice uses a radio mark; multi uses a checkbox and
**Select all that apply**, with its running count (**· N selected**) in the
accent, and can keep several rows on. Clicking a multi or choice row presses
**that** row only: it gives a little and springs back. **Something else** is a
real radio (choice) or checkbox (multi) in that same exclusive group — clicking
the mark or the row chrome selects it; the inline field is a bordered well that
shares the radio midline and takes an accent focus ring. Review is tappable Ask
Card rows (not the key/value grid): an accent numbered disc, heavier answer
first, muted question under it, or *Not answered* in a dashed row with a dashed
disc. Open and close are the same pill morph in reverse (one shell, not a
reel): ~100ms fatten 44→50px, explode to ~6% height overshoot from the pinned
bottom, then settle — about **370ms** of motion. As the rows land they settle
within 3-4px (no jelly), the footer slides up into place (it never scales past
the card's edges) and the spine's wire draws down from the first mark. Close
inverts that cascade (last option first, title last), implodes to the fattened
50px pill then 44px (never a 28px squash), and on submit holds **Submitting
answers…** on the pill (a render that lands mid-close does not strip it), then
sinks into the composer.
The preparing/submitting pill is a **row**: label left, a 22px **two-ring orrery**
(balls on tilted rings, not the reference 4-dot square) on the right, fully above
the composer and not clipped. Every open, including after close, uses that morph
— it does not fall back to a linear host expand. The spine is a progress wire:
an accent fill runs from the first mark to the current one and rides the thumb's
spring; answered marks are accent beads, skipped ones hollow and unanswered ones
muted discs; the current mark is a 16px numbered accent circle with a cut ring,
at the end of the 4px track (the track does not stick out past the thumb).
Optional note has no resize grip; its label is sentence case ("Optional note")
and its well takes an accent focus ring. Question changes pull rows off on an
overlapping elastic stagger with light blur, settling within 3-4px. Under NieR
the chosen answer is the menu cursor (an ink bar with paper text, its mark
inverted), the spine's marks are diamonds, the needs-you mark is its ink block,
**Next** is ink with paper text, nothing glows (no corner light, thumb bloom or
button shadow) and the selection lands in stepped frames. Reduced motion (all
three routes) ends every Ask Card motion at its end state: no morph, cascade,
reel, row press, spine travel or selection pop.

**Long answers** (2026-10-09). The Ask Card grows and shrinks with what it holds,
up to the room above the composer: it stops short of the chat header, leaving a
48px strip of transcript under it, and the composer never moves off screen.
Past that the card's body scrolls inside the card (the page and the transcript
never scroll with it), while the close button, the spine and the footer
(**Back**, **Skip**, **Next** / **Submit**) stay in place and in reach. A body
that scrolls fades at the edge its content runs past, and the footer takes a
hairline above it. Each question opens at its top; picking an answer keeps the
place you scrolled to. The cap follows the window and the composer's height.
Long prompts, labels, descriptions and answers wrap, and a long unbroken word or
URL breaks inside its row: nothing scrolls or clips sideways. An option can carry
a description (the canonical `{label, description}` option shape), shown muted
under its label; a question's own description sits under its title. Rows that
wrap keep their radio or check and number on the first line. **Something else**
is a field that grows line by line as you type, and the optional note grows with
its text from its resting height, so neither scrolls inside itself. Review keeps a
long answer whole, line breaks included. The @-file list opens below its field
when the body has no room above it. Under NieR a description on the menu cursor
is paper, like its label. Short questionnaires look exactly as before. Demo
Studio → Questions and decisions → **Long answers questionnaire** opens the
deployment questionnaire written long to see all of this.

## Overlay menus

- Clicking the same trigger **closes** an open menu (persona, model, mode,
  permissions, wand, worktree, context ring, thread search, thread row menu,
  Context Lens). The same holds inside every wand-module sheet: a model,
  Persona or choice picker (opened through `PM56_PICKERS` or `PM56_PMX.pick`)
  closes when its own trigger is clicked again, and clicking another picker's
  trigger switches to that picker. Sheet picker triggers report
  `aria-haspopup="listbox"` and `aria-expanded`.
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
- Activity-bar hover cards **dwell ~650ms** before sprouting so a pass-through
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
- The chat header shows the thread's **status mark** from the status set next
  to its status word, and the word takes the mark's tone: Ready and Paused
  muted, Working and Reviewing accent, Waiting and Recovering warning, Complete
  positive, Blocked and Failed danger.
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
  icon). The header icon is lit per mode on a neutral tile, with the neon halo
  and a backlight (never a filter): Mute in the attention tone breathing at
  3.2s, Focus in the working tone breathing at 2.2s, Subcompact steady in the
  changed tone. Turn Off returns the icon to idle.
  Lens is not on the wand menu.
- Header, history-head, and Activity Detail icon buttons share orbit-node
  chrome (28×28 rounded square, `surface-3`, 1px border). New thread stays a
  labeled pill with the same fill when the head is wide. The context ring
  stays circular. A pressed toggle (history pin, Activity pin and filter) sits
  on a raised neutral tile (`--surface-4`, strong hairline) with its glyph lit;
  under NieR it is an ink block.
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
- Preview Rows draw the shared **status set** (see *Neon icon family*) at
  15px in the row's status slot, which keeps `data-status`, its `role=img`
  label and its tip: working is a still ring with its bead travelling on it,
  needs you a bubble whose "?" hops and swells and outshines working, blocked a
  blinking lock, failed a stuttering warning triangle, complete a check that
  draws once, idle a small unlit ring, paused two bars. The other history takes
  keep their own status shapes (the `.status-orbit` takes keep the on-ring
  satellite) and only take the new drawings.
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
- A pinned history drawer is in place from the first painted frame (2026-10-09):
  the chat no longer opens full width under the drawer and then slides its
  200px gutter in, which for about two seconds of a slow load put the composer
  over the thread rows.

## Context Lens glyph

- The glyph is the PMConcept7 lens (circle with three horizontal lines), drawn
  by the neon registry. It also appears as an in-field capability glyph, lit,
  while Lens is on.

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

Each bar icon is lit like a neon sign in its domain's status tone: **working**
in the accent, breathing at 2.2s; **attention** in the warning tone, breathing
at 3.2s; **blocked** in the danger tone with a hard double blink (`ab-alert`,
1.9s); **changed** (`--accent-2`), **done** (`--positive`) and **idle** steady.
A working or attention icon also plays its own part-by-part act: the goal arrow
strikes, the To-Do ticks check in turn, the subagent figures rise, the Crew
strands draw to their node, BrainStorm's branches spark, Review's lens sweeps,
Chat Room's satellites turn, the Changes arrows swap and the artifact lines
write in. The glow is the neon halo plus a radial backlight, never a filter.
Crew, BrainStorm, Review and Chat Room take the worst state over that domain's
runs, the same per-run state their cards show (needs you, limit, failed or
degraded → attention; running or starting → working; completed → done;
otherwise idle), so a Crew with a blocked helper reads amber like its card.
Hover-card heads and Activity Detail chips are lit in the domain tone without
loops.

Activity Detail's domain tabs never cut a word. They are sized to their words;
when the panel is too narrow for every label (the 280px pinned panel), the tabs
you are not on show their icon only, named by the hover tag and their
accessible name, and the selected tab keeps icon and label. A To-Do's
**Waiting on** chip keeps to one line; its hover tag lists every task it waits
on.

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
  summary of the run (its title, sentence, current phase, a compact team list,
  and Open Panel · Message), with the full record one click away in the run
  view.
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
4px gap from the text. The entire row opens its real diff. Focused Goal has no
summary card: the compact Goal projection stands alone. It shows the status
chip, the revision and the objective; one control row that stays on one line
down to the panel's 240px minimum, with **Pause** (or **Resume**) and **Edit**
on the left and **Cancel Goal**, in danger ink, alone at the far edge (Edit's
accessible name is "Edit objective", its hover card in the panel says so, and
it reads **Edit objective** wherever the row is at least 300px wide, as in the
Activity Bar preview); the bound Plan's **Open exact Plan · Vn** (and **Revise
Plan** while the Goal is blocked) when the Goal is bound. Open exact Plan · Vn
(`goal-open-plan-version`; product command `cmd.chat.plan.open_version`, Plans
DL-157) opens that exact version: the Plan's own editor tab while Vn is still
its version, otherwise Vn's retained read-only document. It never opens Plan
Details or a newer version, and pressed in the preview it closes the preview; and an **Objective
history** disclosure as its footer, with the revision count, which opens the
history inline without leaving the compact projection. There is no View Goal
route, no **Details** button and no Ask for a replacement. Editing the
objective, or reviewing a proposed change, opens the full Goal section with the
same control row and footer; it still shows no continuation-decision dumps,
session JSON **Details**, or **Evaluate next turn**. The activity-bar Goal
preview draws the same compact projection; **Edit** there opens this panel
with the objective in edit. Focused Subagents keep a slim head plus the
one-line agent summary, and each row underlines the agent's model. Clicking a
row selects it, expands its detail card (whose Model value is underlined too)
and opens the agent's read-only live transcript beside the chat (see
*Transcript turns*); the card's button reads **Open live transcript**. Focused
Artifacts keep the head and count only.

The Activity Bar previews use the same explicit status vocabulary as the board:
Blocked, Needs attention/Needs retry, Working, Changed, Queued/Waiting, and
Settled/Ready do not change meaning between surfaces. Each 354px preview has a
44px header, at most five 48px rows, a stable 68px status/time column, and one
34px **Open Activity** footer. The To-Do preview is the checklist form used by
agent plan lists: one line per item (status mark, ellipsized title, status
word in that same 68px column) and a single footer line that pairs **Open all**
with the blocked count. Preview rows have no identity glyphs and no
agent-initial badges, except that a Crew member's row leads with its cast mark;
Subagents rows match Activity Detail (name; the model, underlined, then
current/blocker; status plus elapsed). Header totals are retained; duplicate
footer histograms are not.

Activity Detail body scroll uses **8px** horizontal inset (10px vertical) so
domain panels keep more readable line length in narrow widths. To-Dos is the
exception: its list is the panel's scroller, so the body keeps 2px on the
right and no scrollbar gutter, and the list's own scrollbar sits at the panel
edge.

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
- When this chat's NieR Mode is ported, use the names PMConcept7 already has
  rather than this concept's: the `O55.sound` events `string`, `land`, `bow`
  and `save` (with their motif, sting and rest behaviour; `wake` is already
  here, ported with the reboot moment from PMConcept7 704b3d1888 under its own
  names: `rebootPlate`, `rbPlan`, `rbSlats` and the rest); the
  `O55.nierFx` functions `type` (typed text in a reserved layout, used instead
  of the decode for text longer than 8 characters), `bootlog`, the hung banner
  variant, `fold`, `lineTo`, `lineHold`, `slice({from})` and `trail`; and the
  Pod narrator's two lanes (below the control bar line, and low over the stage
  lip, never covering an actor).

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
  danger-red with a warning-triangle flag, and its panel chip reads **Failed**; a subject
  waiting for approval turns warning-amber with the needs-you bubble as its flag, the core
  shows the needs-you mark and reads **Waiting for you**,
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
- Finished subjects are **lit green** (positive ink, a faint done halo, a neutral tile)
  and never act, so a completed ring reads as finished at a glance. The live subject's
  dark disc carries the phase hue (see *Orbit*).
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
- Tooltips on subjects are **app-rendered hover cards** on the label timing of
  *Hover labels* (first line: subject · stat; second line: verb + status) —
  never native `title` tooltips.
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
- **The dark disc.** The live node and the center disc are a dark disc (the canvas on
  dark themes, a dark puck on light themes) rimmed in the phase hue, with the subject's
  glyph lit in that hue. The live glyph plays its act while the run runs; the node keeps
  its pop and pulse ring. Done nodes are lit green, pending nodes sit at rest, and only
  the live node and the current strip disc ever act. Under NieR the disc is ink with a
  paper glyph and the pulse steps.
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
  panel lists the same agents as Child agents. A satellite or a Child agents
  row opens that agent's read-only live transcript (its hover card says so).
  Each satellite and each Child agents row shows the agent's puppet (its role
  prop, its roster seat hue and its live state), never initials.
- Reduced motion: every choreography lands its end state instantly.

## Step Rail (simplified) — behavior spec

- An accumulating rail of **subject discs** (orbit-strip look) with a bold verb + count
  label; the **current disc is larger, a dark disc with its glyph lit in the phase hue,
  and pulses**; finished discs are lit green; discs grow slightly on hover. All spawned discs are clickable in every state. The disc **track wraps** like
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
the existing fixed-width sprout behaviour. Their glyphs (in the menu and on the
composer's Mode chip) are Ask `info`, Agent `sparkles`, Debug `bug`, Plan and
Deep Plan `plan` (a folded map) and Review the Review kind mark.

- **Plan** — Quick / **Standard · Default** / Thorough.
- **Deep Plan** — **Thorough · Default** / Exhaustive / BrainStorm, then a
  divider and a persistent **Grill Me** check. Grill Me matches the Fast-style
  auxiliary row pattern and is not model effort. Its row leads with the neon
  kettle grill, which plays its act (the lid swings open, flames flicker, smoke
  rises, the lid drops shut) when the row is hovered or focused; the same
  glyph marks the Grill Me buttons in the Deep Plan workspace and the Plan's
  details, the BrainStorm run card's and run view's Grill Me check and the
  Grill Me item on a setup sheet's Add specialists shelf. Reduced motion leaves
  the grill still.
- **Review** — Single Agent / **Multi-Pass Review · Default**.

Those are the **six Plan choices**, and there are exactly six: there is no
fourth regular depth and no Light / Balanced / Comprehensive labelling. Every
sidecar choice only arms state for the next composer send. It sets the mode and
its strategy (`set-plan-strategy`, `set-review-strategy`), closes the menu and
opens nothing. Choosing BrainStorm, Single Agent or Multi-Pass Review does not
open a configuration sheet in this concept: those sheets open from the wand's
Multi-Agent Workflows rows (BrainStorm…, Review…). When the chat moves into
PMConcept7, the Mode menu opens these sheets instead.

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
- **The transcript card's layout.** Kicker (`Plan` · `V5 · Thorough`), the
  title and a two-line summary, then one hairline that opens the card's status
  zone: the schedule line when the Plan has a scheduled build, the step count
  and status ("6 steps · Ready"), and the action row. The action row is
  **Build**, **Revise** (only while the Plan is Ready) and **Open plan**. It
  sits on the card's content edge with the card's own padding below it. There
  is no tinted band and no inset of its own.
- **One action row everywhere a Plan shows actions.** The transcript card's
  footer, the editor's sticky footer and its More row, the compact
  Completed/Canceled card, a Building plan's attention actions (Resume,
  Details, Cancel build), the schedule line's decision (Use V6, Cancel
  schedule) and the Build-started receipt's Open plan all use the shared
  `.pmx-actions` row and `.pmx-act` button. Every button is 32px tall with
  12px type. Boxed buttons sit 10px apart and text actions 6px apart. Build
  keeps the primary 14px sides and every other button 10px. `Building…`,
  `Completed` and `Canceled` keep full contrast; only their cursor shows they
  are disabled. Retro squares every corner and NieR keeps its own square,
  flat buttons; neither changes a button's size.
- While building, the To-Do count ("0 of 6 steps done", or "Updating
  progress…" while the projection catches up) is plain words at the action
  row's right end, never a chip. A wait or attention line takes its own row
  under the buttons: the mark sits in a 16px column 10px from the copy, and
  the line's admitted actions form an action row under the copy.
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
- Step marks use the status set at 14px: done a check, in progress the working
  mark, blocked a lock in the danger tone, skipped a slashed circle, mixed a half
  ring. A Building plan's support line leads with the waiting-on-a-dependency
  hourglass ("Waiting for Usage", "Outside execution window") or the paused mark
  for a paused build. The warning callout's triangle is lit in the attention
  tone; info marks stay uncoloured.

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
  an **Owner · …** line when the item has an explicit assignment, an inset
  **Expected** well, then a full-width wrapping dependency or waiting line when
  one exists, **Open work** when the item has a work binding, and source links.
  It does not show dependency, attempt, or receipt dumps.
- Each virtual row is one 32px line in the To-Do preview's checklist form: the
  status mark from the shared set (lit, without loops, because the list
  remounts rows on scroll), the ellipsized title (full contrast while in
  progress, struck through when completed) and a right-aligned status word in
  its tone (Pending, Working, Blocked, Skipped; **Waiting** for a pending item
  held by a dependency or an owner wait; done/total on a parent). A finished
  leaf shows no word: its check, strike-through and colour already say Done.
  Only parents carry an expand caret, left of their mark; a leaf keeps no caret
  column, and each level steps 12px right (three levels at most), so a child's
  mark sits under the start of its parent's title. An item with an explicit
  agent or persona assignment shows its owner's 16px puppet (role prop and
  roster seat hue) before the status word, so the title keeps priority; the
  hover card and the selected item's Owner line name the owner. Hovering a
  row shows the app hover card with the full title, the owner and the status or
  the waiting or blocker reason; rows have no native tooltips, and the reason
  also stays in the selected detail. Rows carry no buttons: there is no Start
  work or Run work. A selected row takes a faint accent wash. The list fills
  the panel's height below its search and navigation line and renders only the
  rows its measured height shows. Expand carets point **right** when collapsed
  and **down** when expanded. Two demo To-Dos on Query Performance carry an
  owner (Query Analyzer and Schema Reviewer).
- The **navigation line** above the list holds the visible count (`N visible of
  M items`) and **Expand all**, and nothing else. There is no Last item control
  (removed 2026-10-09, DL-160). The search field finds any title or exact ID,
  and the list scrolls to its final item; **Expand all** opens every parent
  first.
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
  happen") where the module has any, and one **Advanced** entry. Foot: the
  read-back sentence, the estimate line, Cancel and one primary.
- **Marks.** Module glyphs come through the pmx primitive (`pmxGlyph`,
  `pmxKindMark`, `pmxStatus`, and `pmxMark` for agents, in `module-shell.js`)
  and are lit and still: sheet-head kind marks are concept-lit, a run's kind
  badge is lit in the run's tone, status marks come from the shared set
  (one-shot acts only), a decision row leads with its status mark in its own
  slot, and every agent is a puppet (see *Puppet agents*) that holds still in a
  sheet and acts only once in a run card or run view. The previews in the
  configuration sheets keep the same lit marks.
- **Numbered questions** appear only where the order is real: the four
  collaboration kinds (1-4: job, team, how, extras) and Crew Auto (1-3). Settings-style sheets use
  unnumbered questions. Each number is a step tile, so the order reads as
  steps: a 20px tile in the theme's small corner (5px; 6 in Friendly, 2 in
  Retro), tinted with the accent and ringed in the focus edge, its numeral in
  the accent (Retro draws the tile as an outline, with no fill). The question
  that holds focus is the step you are on: its tile fills with the accent and
  its numeral turns to the theme's on-accent ink, at least 4.5:1 on the
  accent in every theme (colour only; instant under reduced motion). A
  question in error turns its tile warm. Under NieR the tile is an inverted ink
  square, and the step that holds focus is framed by an ink hairline 2px out.
- **Fixed sizes.** Wide 1120×780 (1120×760 at 1280×800, 976×728 at 1024×768);
  standard 900×720; compact 720 wide at a fixed height per sheet (ELI5 560,
  New chat defaults 600, Revert 520). A sheet never resizes or re-centres while
  it is open: switching tabs, opening Advanced or adding rows moves nothing.
  Advanced opens as a page inside the same sheet, never as a disclosure that
  grows.
- **Yield rules.** The common case never scrolls at 1440×900 or 1280×800. In a
  collaboration sheet the cast plate yields first as the roster grows: it takes
  the richest mode that fits its slot (full, compact, BrainStorm's lean, a
  strip, Chat Room's lean line, the wrap; see *The cast plate*) and grows into
  spare height when the column is short. It never yields past its floor, the
  leanest drawing that fits the slot's width: the slot keeps that drawing's
  height and the roster's rows scroll in their own region instead, so the graph
  stays in view at every team size up to the 8-helper limit, with both
  specialists, in every theme from 700 px wide up. The caption sentence is only
  for a slot no drawing fits the width of. With the default teams at 1440×900,
  Crew and Review draw the full plate, BrainStorm the compact one and Chat Room
  its one-line strip; at 1280×800 Crew and Review draw compact and BrainStorm
  and Chat Room their lean modes; at 1024×768 Crew and Review stay compact,
  BrainStorm draws the wrap and Chat Room keeps its lean line where it fits
  (Basic, Glass and NieR; Friendly and Retro draw the wrap there). These are
  Basic's numbers; another theme's type can move a kind one mode. The roster
  scrolls inside its own region once its rows no longer fit beside the plate's
  floor (at 1440×900 from 6 helpers, Chat Room from 5; at 1280×800 from 5, and
  Chat Room's default 4 with its pinned Moderator row), with Add a helper kept
  visible. The side column scrolls only below 1280×800. The hero field scrolls inside itself past three
  lines and never grows. Below a 900px sheet width the body becomes one column
  that scrolls inside the sheet while head and foot stay put; there the cast
  plate sticks to the top of the body while its question is on screen, on the
  sheet's own colour, and the roster's rows pass under it. A sheet is always
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
- **Height budgets in the chat.** At the default card width a run card is at
  most 346px live, 190px while waiting to start, and 360px when it needs you or
  has finished (360px live and 400px otherwise at the narrowest tier), and a
  receipt is one 44px line. A reply that changed files, took a note and used a
  rule grows by at most 40px. The 500ms tick only changes text inside fixed
  boxes; heights change only at state boundaries.
- **Surfaces and motion.** Sheets are opaque in-window modal surfaces over a
  flat scrim; nothing uses a backdrop blur or an element blur, because Slint
  (checked at 1.18.1) still cannot draw a backdrop blur. Motion is only
  transform, opacity, height and clip, and every draw-on is a clip reveal.
  Motion personality belongs to the theme family: every duration and easing is
  a foundation token (`--pmx-t-*`, `--pmx-ease-*`) that a theme family can
  override, and no module keeps its own timing. Today retro is the one family
  with its own values (0.6× the durations and no scale on sheet entry); basic,
  glass and friendly share the base timing. Under reduced motion every change is its instant end
  state, never a fade. A closing sheet stops taking input at once; its exit
  plays on a non-interactive copy.
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
  view state, or a demo action. A sheet names the command its primary would
  dispatch in one Technical details line on its Advanced page, or says "no
  command: view state": a collaboration sheet as the last row of its Advanced
  page, and Back Seat Driver on its Advanced page. Nothing else shows Technical
  details: not the sheets without an Advanced page (ELI5, Revert, New chat
  defaults, Teach, Memory, Schedule Message, Build At), the Wonderer workspace,
  run cards or run views (their More row and their side columns), the
  Scheduled manager, scheduled-message records, the Review report's Plain text
  and Export, or the Back Seat Driver session in Context's More Details.

## Puppet agents

Every agent is drawn as a small marionette, after PMConcept7's onboarding
helpers: a control bar with strings to the head and both hands, a chibi figure
(a big round head, a small tunic, stick limbs) and one prop or piece of
headwear that names its role, so roles read in grayscale. The seat hue is the
second cue and paints the figure; props are drawn in the text ink. One owner
draws every puppet (`pmxMark` and `markInner` in `module-shell.js`, on a
28-unit grid with the whole figure inside the box, so a plate can scale a
seat), so a sheet's roster, cast plate and specialist shelf (where Grill Me's
item is the neon kettle grill instead), a run card's cluster and lanes, a run
view's plate, team and conversation, Activity's Crew rows and Agent Board,
Activity Detail's Subagents lines, Orbit's satellites and Child agents rows, a
To-Do's owner, the chat's Live subagents card and the Agent Stage lanes all
show the same puppet. No agent is drawn as initials anywhere.

- **Props by role.** The Coordinator (and this chat) wears a crown; the Chat
  Room's Moderator holds a gavel; both are lead seats in the text colour.
  Builders, implementers, engineers and helpers wear a hard hat. Reviewers,
  checkers, auditors, QA, testers and analysts hold a magnifier. Critics,
  critical advisors, skeptics and adversarial reviewers wear a jester's cap.
  Wonderer has an orbit ring and moon round its head. Grill Me stands behind a
  little kettle grill with its hands on the lid (the neon `grill` glyph's
  anatomy: a domed lid, the bowl with three grill marks, two splayed legs).
  Scribes, teachers and writers hold a page; architects and designers a set
  square; product people and managers a pennant. You are an unstrung figure
  holding the control bar up yourself. A persona matches on its full name, then
  on its last word ("Database Reviewer" → reviewer); an unknown role wears the
  hard hat.
- **Material by theme family.** Basic is a blueprint line puppet, with the neon
  halo on dark themes. Friendly is felt: a skin head with hair, a solid tunic in
  the seat hue, a wooden bar with sunny studs, and cheeks and a smile from 28px.
  Glass is crystal: a clear body with a lit edge, a light core in the chest, a
  shine and filament strings. Retro is a pixel sprite on 2-unit cells, its
  crown gold. NieR draws PMConcept7's final NieR puppet unit, which both
  concepts share: ink on parchment with no hue and no halo, a solid ink bar
  with square studs, ink strings at 55%, a paper shield-octagon head under a
  rigid ink visor band that overhangs both sides, an ink coat and boots, square
  paper joints and the props in ink (the gavel and the kettle are this
  concept's own); You under NieR are a solid ink figure with a paper visor
  slit.
- **Detail by size.** 12px and a card's mini cluster draw a bust (bar, head
  string, head and headwear, shoulders); 16-18px the whole figure with its
  three strings; 22px and up the face; 28px and up, and plate seats, the
  joints, feet and family detail. A run card's head cluster draws its puppets
  at 18px. Under NieR the unit keeps one string at 18-20px and three from
  22px, adds the studs, hands and collar from 28px, and is a crisp pixel map at
  16px and under.
- **States.** States keep the mark grammar, drawn puppet-native. Working pulls
  the strings taut over a lit stage floor. Queued hangs them slack and dashed,
  dimmed (NieR only dims). Needs you raises a hand beside the warning notch;
  done shows the check notch. Failed cuts a hand string, slumps the head and
  shows the x notch. Abstained is dimmed, optional is a dashed figure, and a
  stand-in shows the swap notch at the top left.
- **Motion.** Inside a setup sheet (the roster, the specialist shelf, the cast
  plate) puppets hold still. In run cards and run views a puppet acts once,
  when it mounts in or changes into a state: it is picked up and swung on its
  strings as it starts working, and it hops when it is done or needs you.
  Nothing moves at 12px. On the Live subagents card and the Agent Stage lanes,
  which are not module surfaces, a working puppet keeps swaying from its bar
  (under NieR an idle one sways too, in steps). The voice is the family's
  (Retro and NieR step). Reduced motion (all three routes) leaves the rest
  pose.

## Multi-agent workflows

**Crew**, **Chat Room**, **Review** and **BrainStorm** are four kinds over one
foundation, owned by `collaboration.js`: one run record, one participant record,
one sheet frame, one card, one run view, one Activity projection and one
composer-target path. Each kind supplies its own parts to that frame
(`PM56_<KIND>.sheetParts`, `cardParts`, `viewParts`); a kind never draws a
second frame. On screen the people in a run are **helpers** (**reviewers** in
Review); the data keeps `participant`.

**Where they start.** The wand's Multi-Agent Workflows rows open Crew…, Chat
Room…, Review… and BrainStorm…. A
natural-language request for a BrainStorm opens the BrainStorm sheet with the
request prefilled word for word, and Cancel puts that text back in the
composer. A card's More › Change setup… / Run again with changes…, Build At ›
Who builds it › A Crew (scheduled mode) and a Plan's **Build With Crew** open
the same sheet.

**The configuration sheet** (wide).
- Hero: the job or question, the **Card title** input (derived from the job
  until you edit it: its first sentence, at most 48 characters, cut at a word)
  and the **In your chat** preview of the card's first frame. The preview fills
  the hero's side column (340px; 330 in Retro; 308 in a window under 1168px
  wide or 820px tall) down to the main column's foot, and lays the frame out at
  the narrowest card width (360px), scaled to fit the tray and never past 1:1:
  about .89 at 1440×900, where the card title reads at 12px, and .8 at
  1280×800 and 1024×768. In a window 820px tall or less its "In your chat"
  caption drops, and the preview keeps those words as its label. Start is
  disabled with "Add a job first." while the job is empty, except in scheduled
  mode, where the plan is the job.
- The plate over the roster. Each helper row has its job, its own model
  trigger, its own Persona trigger, Copy and Remove; a removed row can be
  brought back for 6 s. **No model ever stands in for another.** When a chosen
  model is offline (a helper's, a specialist's, the Moderator's or the plan
  writer's), its row says so under its controls ("{Model} is offline right
  now. Pick another model to start." with a [Fix] that opens that row's model
  picker) and Start is disabled with the same sentence until you pick another
  model; Advanced shows "If a model is offline · Start waits until you pick
  another model." instead of a choice. Scheduled starts and Crew Auto rules
  refuse the same way.
- The roster foot: **Add a helper**, with a suggested next role, and **Start
  from a team ▾** (the kind's team presets, with "Your default" first when one
  is saved). Review's presets are Careful review (Security, Bugs, Tests), Quick
  check (one reviewer, Single Agent) and Deep audit (5 reviewers, one of them a
  Critical Advisor).
- **Add specialists** (Crew, Chat Room and BrainStorm; never Review):
  **Wonderer** is a built-in Persona plus a reusable methodology skill that
  brings ideas from other fields, kept labelled as hypotheses until researched;
  it doesn't vote. **Grill Me** is a skill that asks you the key decisions
  first, with suggested answers; on the shelf its item shows the neon kettle
  grill in its seat hue, which plays its act when the item is hovered or its
  Add is focused, and once added its puppet stands behind the same kettle on
  the plate and in the roster. Both are off by default, are added on top of the
  helpers and never replace one, and each shows its own model trigger; they
  join the run on those visible models.
- Every collaboration Advanced page starts with the same rows, in this order:
  Time and cost limit · Token limit · What helpers can see · Tools they can use
  · If a helper gets stuck · If a model is offline · Keep the full record
  for · How it finishes · Permissions (a sentence, not a setting: helpers can't
  do more than this chat). The kind's own rows follow. A run's own time and
  cost limit is used instead of your general run limit ("This Crew stops after
  45 minutes or $6.00, whichever comes first."), and everything done before it
  stops is kept. The limits and estimates are concept numbers.
- Every choice reads one option catalog. "One of the helpers" as the Crew's
  Coordinator is listed disabled with "Not available in this preview yet."
- The foot: **Save as my default**, the read-back, the estimate, Cancel and
  "Start {Kind} · N helpers". Save as my default stores this kind's team,
  specialists and settings and prefills only new drafts (never Reconfigure,
  scheduled or recorded drafts); it shows "Saved as your default" in place for
  2.4 s, and where it is stored stays concept-local this wave.
- **Must-haves** (BrainStorm) are your own per-run rules, in a box of their own
  beside the question, as tall as the job field, so the side column holds only
  the preview; Review's target choice is its own field. Whether a run is a
  recorded example is decided only by a recorded marker that a recorded example
  sets when it opens the sheet, never by what these fields hold; the recording
  preflights run only on recorded drafts, so a wand-started Crew or Chat Room
  is never refused for not being a recording.
- The sheet is a transaction: before a successful Start there is no run,
  provider call, usage, event, card or settings write, and open → configure →
  cancel changes nothing. Only after the commit succeeds does the sheet's
  preview fly onto the new card (the flight lays its copy out at the real
  card's width), or toward the dock and fade when the card is off-screen; the
  chat first makes room only for a reader already at the bottom. When there is
  no preview to fly (a narrow window hides it) or motion is reduced, the card
  simply appears. Focus then moves to the composer.

**The cast plate.** Crew, Chat Room, Review and BrainStorm draw their graph in
one grammar, in the sheet and in the run view (`pmxCastPlate` and `pmxCastFit`
in `module-shell.js`; each kind only describes its cast in
`collaboration.js`).
- **The bar.** A bar across the top reads left to right: what goes in, on a
  paper (the job, the topic, or Review's snapshot, "Locked at Start"); who runs
  it (the Coordinator's or the Moderator's puppet on the bar, or Review's
  junction, where the snapshot goes down to the reviewers and their notes come
  back up to be compared); then one accent edge to You (one checked result,
  one report, or pick what to keep). BrainStorm's bar is its seven chapters
  (Understand · Draft alone · Line up · Debate · Check facts · Vote · Write the
  plan), ending in the edge to You (one plan), and its team hangs from a bar
  of its own under the chapter names.
- **The cast.** The helpers hang under the bar on straight vertical and
  horizontal strings only, never diagonals or curves, every seat on one
  baseline at one pitch and always named; the full plate adds each helper's
  model on a second line. A queued helper hangs on a slack, dashed string, and
  "waits its turn" is written once under the queued group. Review and
  BrainStorm stand a short screen between seats, because the helpers can't see
  each other, and one note line says so.
- **The wing.** The specialists (Wonderer, Grill Me) stand in a wing at the
  right end of the row, after a dotted rule, in every kind that has them, Chat
  Room included. Nothing routes under or through the wing.
- **Chat Room.** Its turn policy and rounds are one note line ("Moderator
  guides · up to 5 rounds"), never arcs or a table.
- **State** shows on the seats only. There is no table, no rim ticks, no lock
  and no eye glyph.
- **Modes**, richest first: full (seats at 1.5×, about 155px tall, 182 with a
  note), compact (seats at 1.25×, names only, 110px), lean (BrainStorm only:
  the compact at .86, about 99px, keeping its chapters and strings), a one-row
  strip (names under the marks, 60px; Chat Room's is a 40px line with the names
  beside the marks, and with the specialists on it stacks the names under the
  marks), Chat Room's lean line (32px, its puppets at 22px with every name
  whole beside them), the wrap and the caption sentence. A mode whose seats would
  sit closer than its minimum pitch is skipped, and a plate is never scaled to
  fit its slot. Long names are cut at a whole word first, and in full and
  compact a seat's pitch grows to keep its name whole.
- **The wrap** is for a team too wide for one strip row. At 1440×900 Crew
  draws it from 7 helpers (6 with both specialists), BrainStorm from 7 with
  both specialists, Chat Room at 8 (6 with both specialists), and Review never
  (its strip holds 8); the 516px column of a 1024 window needs it sooner (Crew
  from 6, BrainStorm always, Review at 8). Its seats,
  names under the marks, wrap onto two rows 52px apart (112px tall), or three
  (164px) if two would sit closer than the strip's minimum pitch. The hub
  (Coordinator or Moderator) and You stand at the rows' middle height; a fork
  carries the hub's string to each row's first seat and a join brings each
  row's last seat to the accent edge to You, so it still reads left to right.
  The specialists stand in one column after the dotted rule, one per row. It
  is drawn 576px wide and 500px wide (the 516px column of a 1024 window), and
  the slot shows the wider one that fits. A team whose strip fits 500px never
  gets a wrap. Every kind's 8-helper limit with both specialists draws the
  two-row wrap in all ten themes.
- **Run views.** Every run view draws its run's plate, its seats in their live
  states: working, waiting only while a helper really waits, needs you, done
  or failed. A run that has not started shows everyone idle, never "waits its
  turn", and the Coordinator is done when the run is. The Crew view hangs a
  short "after" arrow from the helper a seat waits for ("after both" when it
  waits for two), and the BrainStorm view lights the chapter it is on. The
  Chat Room's room document and the recorded Review report draw it too.

**The run card in the chat.** One card per run, on one node, in one of eight
densities: `starting` (Start accepted, no participant event yet; in this
concept only recorded runs reach it), `waiting` (only before any participant
attempt has started), `live` (the newest live run in the thread), `collapsed`
(older live runs, or collapsed by you), `attention` (needs you, or your move),
`result` (just finished, until your next message or a newer run), `failed`, and
`receipt` (one line once the chat moves on). Every surface that shows or acts on a run's state (the card,
the dock, the receipt, Activity's counts and rows, the run view, the composer
destination, and which of Pause and Cancel is offered) reads it from one place,
never from the raw record status. A card turns to `result` only on a clean
completion, and nothing on a cancelled card changes again.
- The card shows the kind mark and word, the card title, the cast as a row of
  small puppets (the lead first) and a clock; then one true sentence (status
  word · reason); a track of the kind's phases (a Chat Room's track has one stop
  per round, up to its 20-round limit; a track of 8 or more stops wraps its dots
  down onto more rows with shorter joins, 20 rounds taking two rows of a 360px
  card, and its words, such as "Round 1 of 20 · not started", take the row
  under them, so nothing runs past the card); at most three lanes plus "+N
  more · Show all"; a meta line; and the actions. A lane gives a verb plus either the helper's current words
  (one line, in quotation marks, streaming live through the same pacing as
  assistant replies; the finished message then lands once, whole) or what it
  waits for. Raw tool output is never quoted as speech. An unmet dependency
  reads "starts after …", never "blocked". The Coordinator's mark uses the text
  colour, not the accent.
- A run started from the wand with no recorded input is born `waiting` and
  stays there: "**Waiting to start** · Nothing runs by itself in this preview,
  so the Coordinator hasn't split the job yet." (each kind supplies its own
  noun), with the meta "Nothing spent · your setup is saved on this card", no
  clock and no motion loop. Its actions are [Watch a recorded example], which
  opens the kind's recorded example in a new chat and leaves your setup on this
  card, Open Panel, the expand chevron, and More (Change setup…, Cancel).
- **Needs you** is the one loud moment: a warm decision row says who needs what
  and who is not blocked ("**CSV specialist needs your OK** to go on. Only
  this helper waits; the others keep working." [Allow once] [Don't allow]
  [Details]). An accent decision row is "your move" when nothing is wrong (a
  Chat Room round ended; a BrainStorm is ready to write the plan).
- Failures and stops offer only the owner's allowed actions and use the canon
  verbs **Retry** and **Recover**, never "Try again": "**1 helper didn't
  finish.** {Role} ran out of time." with [Retry] among the kind's actions; a
  Review that lost a reviewer reads "Only 2 of 3 reviewers finished (…). This
  is a partial review." [Retry] [Continue with 2] [Cancel]; a Coordinator or
  Moderator that stopped reads "**Needs attention** · …"; "**Stopped at your
  limit** ($6.00 or 45 min) · everything so far is kept." (warm, not a
  failure); "Cancelled · 2 of 3 parts done · everything so far is kept."; and
  "Paused · nothing is lost." An accepted partial review adds "Degraded result:
  2 of 3 reviewers finished" to its figures. No findings, no promotions and
  nothing to fix are success faces.
- The result face leads with the answer: a headline, a figures sentence, one
  output or the kind's board, and who did what; then **Open Panel**, the kind's
  follow-ons, Message and More. On a finished run, Message sits in More,
  disabled with "This {Kind} has finished, so it can't take messages. Ask the
  assistant instead." A collapsed or narrow card may keep Open Panel, Message
  and More behind Expand and the helper count in a hover card.
- **One control set per run.** While a run's view is the active editor tab, the
  card's follow-on controls and finding ticks are replaced by one line
  ("Choosing in the report beside the chat" / "Deciding in the panel beside the
  chat") and come back when the view closes. A decision from an approval owner
  stays in the card.
- More holds Pause or Resume (only when valid), Cancel {Kind} with an in-place
  confirm ("Everything so far is kept. [Cancel Crew] [Keep going]"), Change
  setup… or Run again with changes…, and Download transcript once the run has
  started (disabled with "Not available in this preview."). A run card has no
  Technical details.
- **Receipts** share one grammar: "Crew · Export ready: all 3 parts checked ·
  8m 40s · $0.92 · Open Panel". The chevron expands a receipt back to its result
  face.

**The dock** (up to three lines above the composer, only for runs whose cards
are off-screen, or only partly visible when they need you): needs you → your
move → live runs, newest first → scheduling's "Coming up"; a fourth item
becomes "and 2 more · Activity". A run waiting to start and a finished run get
no line. Each line has one control, [Review] on a needs-you line and [Show]
otherwise, which brings its card into view; no decision is ever taken from the
dock.

**The run view.** Open Panel opens the run's full record in the editor pane
beside the chat, never as a centred modal: Summary, Report or How they decided,
then Conversation, Team and Cost (a Chat Room opens its room document with
Discussion, Team and Cost). It draws the run's cast plate with its seats in
their live states (see *The cast plate*). A run view shows no Technical
details, neither in its More row nor in its side columns. A lane, team row or
speaker name opens that helper's own transcript. **Message** targets the
ordinary composer, whose
destination reads "{Kind} · {card title}" with "N helpers" beside it, and the
message you send shows "Sent to {Kind} · {card title}" in its meta (a room adds
" · 3 replies" once they answer; there is no "Read").

**Crew.** A Coordinator (this chat's assistant by default; "A separate AI"
adds one more AI) splits the job into parts, hands them out, and accepts a part
only once its expected output is verified. Each part's "Done when" and "Starts
after" come from the Coordinator's split, not from the sheet. Working at the
same time is clamped by the plan's capacity and the card says so ("2 at a time
(you asked for 3)"; a Crew Auto run says "rules allow 3"). After a recorded
Crew finishes, the assistant's summary reply appears under the card labelled
"Recorded example · no AI cost"; a real run never gets an invented reply, and
"Changed N files · Revert" appears only when Revert holds a manifest for that
turn. Crew stays **distinct from Subagents**.

**Crew Auto** is the assistant's permission to bring in a Crew by itself when
a job needs one (you can still start a Crew yourself). It is on by default for
the project, with a default set of rules (rules v1). The wand's checkable Crew Auto item shows this chat's answer ("The
assistant may call a Crew when a job needs one" / "Off in this chat: no Crew
starts by itself"), and toggling it changes this chat only; the project's rules
stay as they are. The legacy wand row **Allow Crews in this chat** (On / Off)
sets the same per-chat answer. The Crew sheet's promise line reads "Crew Auto
is on: big jobs may get a Crew. Settings…". Crew Auto's own sheet is reached
from **Crew Auto settings…** (the wand row and that Settings… link). From the
Crew sheet the two sheets swap: Back to Crew, Cancel, Escape and a successful
commit restore the Crew draft, while × and the scrim close both. Nothing starts
from this sheet. It sets when the assistant may bring in a Crew: big jobs only,
or medium and big; only when the job splits into 2 or more (or 3 or more)
parts; which team, at most 4 helpers with no specialists; and how many work at
once. The cap of 4 is never raised: a larger team is refused with "Crew Auto
teams have at most 4 helpers. Remove one to turn it on." "How it would decide"
re-evaluates four sample requests live from the draft. While Crew Auto is on,
the primary reads "Save Crew Auto rules" ("Saving changes the rules for every
chat."). Saving commits the rules as the next version, adds one line to the
chat ("Crew Auto is on · big jobs that split into 2+ parts · rules v2 ·
Change", or "Crew Auto rules saved · off in this chat · …" when this chat's
answer is off) and creates no card. Crew Auto never runs without committed
rules and cannot widen authority. A declined evaluation creates no card; an
admitted one is an ordinary Crew card whose meta begins "Started by Crew Auto:
…".

**Chat Room.** A **Moderator** row is pinned first (fixed role, its own model
and Persona; it picks who speaks next and sums up each round), then four
helpers by default, "Who talks when" (Moderator guides / Take turns / Open
discussion / One answer each) and 1-20 rounds, default 5. The card shows the
current speaker, who is up next and the previous turn folded, with "Round 2 of
5". Before the first round and at the end of each round it is your move: an
accent decision row ("**Round 2 done.** Your move." [Next Round] [Summarize
Now]; once summed up, End discussion becomes the primary). A message sent while
a round is still going works like the main chat's queue: it waits, at most two
at a time, in "Queued" rows above the composer (Edit · Send now), goes to the
room when the round ends, and the next round answers it; the card's meta says
"1 message queued for the next round". **Send now** steers the current round
without interrupting the helper who is speaking: the next helper to speak reads
it ("reads your note on their turn"). When the room can no longer take it
(ended, last round used), the row reads "Not sent" with the reason. The room
document lists queued messages as words only. The result shows the Moderator's
summary. Discussion creates no To-Do, Plan or Goal without an explicit
**Promote to** To-Do · Plan · Goal (three text buttons; Goal is disabled with
"Can't make a Goal from a room yet"). A room without a recording is born
waiting like every other kind.

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
decision. **Write the plan** (the Plans' new label for Synthesize) produces
exactly **one** Deep Plan document, whose Plan card appears directly beneath;
the BrainStorm card stays. "Who writes the plan" (the synthesis model) is its
own Advanced row.

**Review.** Single Agent, or Multi-Pass with **1–8 reviewers, default 3**
(the count and the approach stay in sync: 1 is Single Agent), repeated models
allowed, each in its own fresh session; no specialists. You pick what to
review (your latest changes, the last answer, the last agent run, a Plan, file
changes, artifacts or a task result); a **frozen** snapshot is taken at Start
(shown as "snapshot"; the data keeps "frozen target pack"), and every reviewer
sees that exact version. Initial passes are
**blind and concurrent**. Findings are normalized, then exchanged for
corroboration and disagreement. A target that changes mid-run is a warm
decision, and notes about the new version are set aside, never mixed in. Review
is **read-only and never auto-repairs**. The result reads "2 to fix · 1 unsure
· nothing was changed"; only confirmed findings are ticked and only they can
become To-Dos through **Create To-Dos (N)**. **Send Findings To Agent** writes a
fix request into your empty message box and never sends by itself; if the box
already has text it refuses ("Your message box already has text. Send or clear
it first."), and the finding lineage travels in metadata, not in the text. A
Single Agent result says "Single pass: one reviewer, so nothing was
double-checked." and shows no agreement words. The report's Plain text view
and its Export are the same Markdown in the report's own words, with no
Technical details section and no engine ids, report version or snapshot hash
(those stay in the record).

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
  finished shows a dashed outline and "**About an earlier version (v3):** not
  re-checked before the assistant finished."
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
- **Status words** come from one table and are plain words only (the Plans'
  status words change to match; each row still maps onto one of canon's nine
  Context states in data), in the eye's hover card, the Context row and Context
  Details alike: Off · Up to date · checked 18 s ago (only when a review
  completed and the cursor converged) · Watching · nothing to check yet ·
  Checking the latest work… · 3 updates behind · Getting up to speed · Holding
  a moment for your advisor · up to 30 s · Double-checking 1 thing (Context row
  and Details only, never the eye or the chat) · 1 note in this chat · Paused:
  usage limit reached · your main work continues · Couldn't check this time
  (took too long) · Paused for safety · its last two answers weren't usable ·
  Couldn't reach its model this time · {Model} isn't available right now ·
  Paused by you · Stopped for this run.
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
- **Dismiss** and **Don't wait** are new commands
  (`cmd.bsd.finding.dismiss`, `cmd.bsd.catch_up.release`).

## Scheduling, execution windows, and quota resume

- **Schedule Message** lives in the **wand** menu. Plan cards expose **Build
  At…**. The wand's scheduled row opens the **Scheduled** manager.
- **The Schedule Message sheet** (standard). The message is drawn as a future
  bubble with a dashed outline, prefilled with the exact composer snapshot, with
  its attachments ("1 file · sends this exact copy") and its destination ("To
  **this chat**"). A 48-hour track shows now and the send marker, and it is the
  send-time control (a slider named Send time). Drag the marker, or press
  anywhere on the track to move it there; it snaps to 15 minutes (5 with
  Shift). With the track focused, the arrow keys move it 5 minutes (an hour
  with Shift), Page Up a day later and Page Down a day earlier, Home to the
  earliest time allowed (a minute from now, rounded up to 5 minutes) and End to
  the end of the track. It never goes into the past. Every move writes the same
  Date and Time inputs as the presets, and the resolved time, the read-back and
  the primary's label follow it. The track has no tooltip: its cursor and
  focus ring are the affordance. Presets (In 1
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
  with [Done] and [See all scheduled], and the composer is cleared. The sheet
  has no promise lines and no Technical details.
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
  are the grace the schedule uses. The lead names the exact version it builds
  ("this exact version (V3)"); the plan's id and hash are bound to the
  schedule and not printed, and the sheet has no Technical details. A DST line
  appears only when relevant, computed from the real start and stop.
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
  [Cancel] and Details, which opens the full record in place: its facts, then
  **Show raw data**, with no Technical details. **Held**: a warm
  decision bubble with the reason ("load-profile.json (v3) was deleted, so we
  didn't send, and we didn't send a newer copy.") and [Edit and send] [Cancel].
  A time missed while away is Held with a missed reason, not a seventh state,
  and offers [Send now] (an update that reschedules to now), [Reschedule] and
  [Cancel]. **Sent**, **Canceled**, **Expired** and **Failed** are one-line
  receipts ("**Sent** · 10:00 PM · you scheduled this on Sep 2 · Go to
  message"), and the real sent message carries the tick "Sent on schedule".
  Scheduled and Held are Time family with no stub; the other four are Ledger.
- **Dock lines**: "1 scheduled message needs you · [Show]", and at the lowest
  priority "Coming up · Next: 10:00 PM · '…' · +1 more · [Show]".
- **The Plan card's schedule line** sits beside the Build control and never
  replaces its `Building…`. Each secondary state leads with its canon token:
  "Builds weeknights 10 PM–2 AM (Chicago time) · next: tonight" with a night ribbon; "Building
  now · wraps up 1:50 AM"; "**Outside execution window** · paused for the
  night, continues Mon 10 PM"; "**Schedule needs update** · You edited this
  plan (now V3). Build V3 instead? [Use V3] [Cancel schedule]"; "**Waiting for
  Usage** · resets 4:00 AM (from Anthropic), continues Mon 10 PM", with no
  countdown when the reset is unknown; "**Paused** · …" for a build you
  paused; and "**Schedule ended** · you started this build now, so the
  schedule won’t start a second one." after Build runs the version the
  schedule was bound to (wording approved by Jared, 2026-10-09; Plans
  DL-157). That last state offers no "Use V…": there is no new
  version to rebind to, so its link reads Details rather than Review.
- **Its layout.** The canon token is the first row, in the text colour, with
  **Details** (**Review** when a new version is waiting) beside it. Details
  is a 32px text action centred on that row, its label on the card's right
  content edge. The detail ("next: tonight") follows on the row below, then
  the night ribbon and the steps built, wrapping together as the width
  allows. A decision's buttons get their own action row under the sentence,
  so they never squeeze it into a narrow column. A zone in parentheses
  ("(Chicago time)") never breaks inside them. The " · " between the token
  and the detail stays in the text for screen readers. On a card narrower
  than 360px, Details moves under the sentence. In the transcript card the
  line has no hairline of its own: the card's status-zone hairline sits above
  it. The next morning one receipt sums up the night: "Overnight: built 2
  of 5 steps (10:00 PM–1:52 AM, paused safely) · sent 1 scheduled message · 1
  message needs you · Open".
- **The Scheduled manager** (wide): the next 48 hours as a plate, where hovering
  a marker lights its row and hovering a row lights its marker; four tabs with
  their canonical labels (Scheduled Messages · Execution & Build Windows ·
  Resume & Safety Policy · Events & Automation); messages as an agenda grouped
  Needs you · Tonight · Tomorrow · Later · Past; search, status and sort on
  every list tab; each build slot with a mini week strip and a night journal;
  events as sentences; and a focused view of one record beside the agenda.
- **Manual pause / cancel / Stop always overrides** scheduled or quota
  auto-resume, and the refusal is visible. **Pause all automations** (Scheduled
  › Resume & Safety Policy) is a real project-wide pause: it stops every
  scheduled send and scheduled build in this project until you turn it back
  on, only you can turn it off, and every held item names the pause as its
  reason. Creating a schedule while it is on does not lift it: Schedule Message
  and Build At say so in one line before Start ("Pause all automations is on, so
  this will wait until you turn it off.") and the new item is created held.
  Quota resume
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
  user's message stays in the chat as sent, and nothing is saved until Save;
  there is no separate capture card. The sheet holds Your rule (with
  "Try:" examples that fill it), a safety line that refuses anything that looks
  like a password or key, **Where it applies** as three nested rings (This
  thread ⊂ This project ⊂ Every project; Every project needs "It's safe to use
  in my other projects" ticked), **Locked** ("Only you can change this rule",
  on by default), the rule card exactly as it will be saved, and, when a
  similar rule exists, a word-by-word comparison with **Replace the old rule ·
  Keep both**, which Save waits for. The primary reads Save rule, Save and
  replace, or Save as version N. In correct mode an edit cannot widen where a
  rule applies, and the old wording stays in history.
- **Teach in the chat.** One receipt line per change ("**Rule saved:** 'Always
  use pnpm' · This project · locked · View", "Rule updated to v2", "**Rule
  turned off:** '…'"); consecutive saves coalesce ("3 rules saved · View").
  A reply the rule applied to carries "**Followed 1 of your rules**" only when
  the rule's check passed on the finished reply. A rule has a check only when
  its wording gives a clear test (a recorded example's rule, or "use X, not Y",
  "prefer X over Y", "never use Y"); a rule without one never shows Followed or
  Missed, and its version details in the Your rules document list "Its check"
  as None.
  A failed check shows "**Missed 1 of your rules**" with [Ask for a fix], which
  puts a fix request in the message box and sends nothing. Turning a rule off is
  an inline confirm, never a modal ("Stop using this rule? It stays in history,
  and older versions don't come back."). Lock and Turn off are new commands, as
  is Export memory (`cmd.chat.memory.export`).
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
  took" (the data keeps "Gist Review").
- **Memory in the chat** is never a card. A reply's meta row gets "Noted",
  which relaxes to the glyph alone after 3 s, and "Verified: label checks pass
  (3/3)" once a check proves it; a note going out of date makes no chat noise.
  The only line is a proposal to change a locked rule ("Suggested change to
  your rule · 'Edit the source…' · it won't change unless you say so" [Review]).
- **Automatic memory creation** stays active under the Assistant memory owner
  and is not replaced by Teach.
- **ELI5** has a project default that applies to every chat in the project,
  and a chat's own choice overrides it for that chat only. It is not a Persona
  and not a mode: it changes presentation only and never mutates artifacts.
  Switching changes only replies written after the switch; it never re-sends or
  rewrites an earlier reply ("Answers already here keep their wording"), so no
  second response is needed. Its compact sheet shows two voices, Standard and
  Simple, over one shared code line that never moves, and "Follow my usual
  setting" removes this chat's override. **How it's decided** traces All chats
  (the Explain Terms Everywhere setting, default Off) → Project default → This
  chat, and lights the level that decides. Each finished assistant reply offers
  **Explain this reply simply**, which writes one extra, simpler reply under it
  only when asked (not while that reply is still streaming). Replies answered
  in Simple carry the tick "Simple explanation", and a divider marks each change
  ("Simple explanations from here" / "Back to standard explanations"). Crew,
  Review and BrainStorm results stay technical. The composer's ELI5 dot is the
  quick on/off for this chat, a speech bubble ("Simple explanations in this
  chat"). Expert and simple versions of an explanation exist only in hover
  cards and help, not in the helper lines. A retried answer does not yet
  re-resolve ELI5, so it carries no tick (a request to the thread-operations
  owner).
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
  outcome record; a recovery case offers **Recover**. No wording ever reads as a partial success. "See what
  happened" opens the Revert document: a timeline and one diff per file with
  What the assistant changed · What revert put back · Now. The word is always
  "Revert", never Undo, Rollback or Rewind.
- **New chat defaults** is a compact sheet with Done only: Explain simply in new
  chats (the ELI5 application default), Thought Stream (While it thinks / Always
  open), and Name new chats, each beside a live specimen. **Thought Stream
  drives nothing yet**: only its wand row, its sidecar and this sheet read it,
  and the sheet says so.
- **Thread title policy** is Automatic (a fast, low-cost model that is ready
  now), Don't name chats, or an explicit model with its account. An unavailable
  model stays pickable, reads "Not available now · {reason}", and chats are not
  named until it is available again — it is never silently substituted. A
  manual rename **locks** the auto-title until an explicit **Name it for me**
  (the Plans' new label for Regenerate Title), which sits
  in the thread menu directly under Rename and is disabled with its reason when
  naming is off or unavailable. The header shows a shimmer on "New chat" while
  naming, a lock glyph once you named the chat (it opens the thread menu), and
  a warning glyph when naming is unavailable (it opens New chat defaults at
  Name new chats); a generated title arrives word by word. Naming outcomes read
  Naming… · Named '{title}' · Not named: automatic naming is off · Couldn't
  name: {model} isn't available · Waiting for your first message · Kept your
  name: you renamed this chat. An untitled thread reads **New chat**.

## What is fixture and what is not

This is a concept lab, and the distinction is kept visible rather than blurred:

- Every control above changes **fixture state** and renders a durable,
  re-readable result. None of them dispatches a native command. A sheet's
  Technical details names the canonical `cmd.*` its primary would dispatch, or
  says "no command: view state" (which sheets carry one, and where, is under
  *Wand modules: shared presentation*); an action with no catalog entry yet is
  a new command request.
- **Concept-only, never product behaviour:** the born-waiting face of a
  wand-started run ("Nothing runs by itself in this preview…"), **Watch a
  recorded example**, the guided demos, every "Preview:" and "Demo:" line, and
  the concept's time, cost and limit estimates.
- **Recorded examples** carry one label, "Recorded example · no AI cost", and a
  recorded receipt shows a play-ring glyph at every width. Whether a record is
  recorded comes from one provenance marker per module (`recorded`, `wand` or
  `seed`), never from the shape of its data. A real run never carries a recorded
  label. A recorded example's own inputs are used only for its recorded run:
  when it opens a sheet it copies its values into your fields as a visible
  prefill, and a run started from those fields is recorded only because of the
  marker, never because of what the fields hold.
- Progress timers here are client-side. No client-local timer is authoritative
  in the runtime spec, and these are not either.
- No required behaviour is represented by a toast alone.

## File pointers (this directory unless noted)

- Engine: `app.js` (work records `state.works`, 500ms clock, sequencer, reveal gating,
  hover-card system with the label timing `TIP_RESIDE_MS` / `TIP_STILL_MS` /
  `TIP_STILL_PX` / `TIP_FOCUS_MS` / `TIP_CLOSE_MS` and the preview dwell
  `ACT_PREVIEW_MS`, the shared sheet pickers `PM56_PICKERS` with their
  same-trigger close, the read-only subagent feed `renderAgentEditor`, FLIP
  guard, composer, queue) · demo data: `data.js` (`workRuns`, thread
  `orbit-run` "Multi Orbit demo", model catalog).
- Orbit: `orbit.js` + `orbit.css`. Step Rail: `variants-a.js` (`W[8]`) +
  `variants-a.css` (+ shared disc metrics in `orbit.css` PART 1).
- Composer overlay, queue, selector collapse: `app.js` + `composer.css`. Send / Stop:
  `send-stop.js` + `send-stop.css`.
- Icons: `neon-icons.js` (the registry and status set, first in `MODULES`) +
  `neon-icons.css`. NieR Mode: `nier.js`, `nier-fonts.js`, `nier-parts.js`,
  `nier-world.js`, `nier-scenes.js` with their `.css` (generated blocks from
  `nier_palette_56.py` and `nier_scenes_56.py`; run each with `--check`).
- Menus: `menus.js` + `menus.css`. Context: `context.js` + `context.css`.
  History pin: `history.js` + `history.css`.
- The wand's colours and sparkle, the Fast bolt's strike and Grill Me's kettle
  grill: `neon-icons.js` + `neon-icons.css` (sections 8b, 8c and 8d).
- Retro: `retro.css` (CSS only, no `MODULES` entry; in `CSS_LAST` after
  `send-stop.css` and before the NieR sheets; every rule scoped
  `body[data-theme^="retro"]`; its section 0 holds the Retro Light readability
  inks and the boxed reply, one block each), with the retro token tables in
  `styles.css`, `turn-stage.css`, `module-shell.css`, `context.css`,
  `neon-icons.css` and `orbit.css`.
- Goal panel: `goals.js` + `goals.css`. Ask Card: `questions.js` +
  `questions.css` (+ its NieR block in `nier-parts.css`). Subagent live
  transcript: `app.js` `renderAgentEditor` (a `.tx-feed` root, never
  `.transcript`) + `turn-stage.js` (one spine per root) + `turn-stage.css`.
- Agents and plates: `module-shell.js` (`pmxMark` / `markInner` puppets and
  the NieR unit `pnUnit`, `pmxCastPlate` / `pmxCastFit`) + `module-shell.css`
  (puppet materials, states and motion; step tiles; the hero side column and
  preview tray) + `nier-parts.css` (NieR puppets and step tiles); each kind's
  cast in `collaboration.js` (`crewCast`, `reviewCast`, `brainstormCast`,
  `roomCast`, and `castRun` for run views); the Live subagents rows' and Agent
  Stage lanes' puppets in `app.js` `agentPuppet`. Work stretches in the
  subagent feed: `transcript-records.js` `feedStretch`, called from `app.js`
  `renderFeedStretch`.
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
- Verification: `node neon-verify.mjs` (+ `--reduced`; census, roles, status set,
  salience, contrast order, reduced motion, all ten themes; its preview checks
  wait for the hover card rather than a fixed delay), `node orbit-verify.mjs`
  (+ `--negative`), `node turn-verify.mjs` (the send flight, the live agent
  turn, item families and voices), `node questions-verify.mjs` (the Ask Card),
  `node history-verify.mjs`, `node tests/audit.mjs`,
  `node tests/context-verify.mjs` (the current context contract, including the
  capability boxes' closed outlines), `node hover-tip-verify.mjs` (hover tag
  timing, the hand-off between anchors and press to dismiss),
  `node tests/transcript-verify.mjs` (including the More overflow keeping the
  meta chips and the toolbar on one row), `node tests/scheduling-verify.mjs`
  (including the Schedule Message send-time track, its Page Up / Page Down
  direction, no tooltip on the track, and no promise lines or Technical
  details on Schedule Message, Build At, the Scheduled manager or a record),
  `node tests/collaboration-verify.mjs`, `node tests/pmx-verify.mjs` (forbidden
  props, no pills or side strips, plate labels, crowding, loop census, theme
  fonts, over the surfaces in `tests/pmx-surfaces/`) and
  `node tests/shell-selfcheck.cjs` (the pmx primitives' contract);
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
