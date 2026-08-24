# Puppet Master Assistant Concept Lab — 5.6 Pro

A self-contained concept lab for the Puppet Master Assistant. This is concepting
work, not a production component drop-in.

## Open it

Open `index.html` directly in a current Chromium, Edge, Firefox, or Safari
browser. The file inlines its own CSS, fixtures, and JavaScript; no server and no
sibling files are needed. `PM_Chat_Assistant_5.6_Pro_Standalone.html` is a
byte-identical convenience copy — `python3 build.py --check` enforces that.

## Review controls

- **Demo Studio** switches among eight curated recipes, all eight PMConcept7
  themes, and seven independently swappable component families.
- The **Working Animation** family offers **twenty-four** genuinely different takes.
- The **Transcript** family also offers **sixteen**; options 8-15 are drawn from
  a survey of 36 open-source AI chat clients (see below).
- **Reset** restores the complete lab to its original state.
- The Context Ring opens its compact menu; **More Details** opens the full drawer.
- Hover or click the five Chat Activity Bar domains to preview or open details.
- Use the Working Animation controls to start, pause, step, complete, reset, and
  reopen the organized work/evidence history.
- Thread history includes Pinned, Recent, and searchable Archived sections.

## The twenty-four working takes

| # | Take | # | Take |
|---|---|---|---|
| 0 | Reference Morph | 8 | Step Rail |
| 1 | Orbit | 9 | Word Stream |
| 2 | Step Stack | 10 | Tool Collapse |
| 3 | Tool Ribbon | 11 | Diff Tape |
| 4 | Progressive Receipt | 12 | Signal Meter |
| 5 | Workbench | 13 | Blueprint |
| 6 | Agent Stage | 14 | Timeline Scrub |
| 7 | Calm Stage | 15 | Terminal Cast |
| 16 | Loom | 20 | Metronome |
| 17 | Pulse Grid | 21 | Filmstrip |
| 18 | Ledger | 22 | Sonar |
| 19 | Constellation | 23 | Circuit |

Every take runs inside the shared **phase chrome** measured from the reference
recording: an icon trail of phases, a bold verb with a grey count, and concrete
readable rows for what the agent is actually doing (thought stream, files read,
commands run, edits with diff stats). On completion the card compacts to the
trail plus an "N steps" roll and the work receipt; clicking any disc re-expands
that phase's rows. Take 8 (Step Rail) implements the same mechanic privately
and opts out of the shared chrome; takes 0, 11 and 15 keep their own rows.

## The sixteen transcript takes

Options 0-7 are the original set. Options 8-15 come from reading the message
components of 36 open-source AI chat clients, and each fills a gap the first
eight leave open.

| # | Take | Where it comes from |
|---|---|---|
| 8 | Aligned Bubbles | Asymmetric user-bubble / assistant-full-bleed — the modern consensus (LibreChat, Jan, Lobe Chat, Open WebUI, AnythingLLM) and absent from the original eight |
| 9 | Zebra Rows | Full-bleed bands; the band doubles as a status channel, as Big-AGI uses it for errors and edited prompts |
| 10 | Sticky Rail | Big-AGI pins the avatar column beside a long answer so attribution never scrolls away |
| 11 | Timeline Gutter | Jan's dotted single rail, applied to whole turns and ticked with the clock |
| 12 | Notebook Cells | In[n]/Out[n] — no surveyed chat client ships it, though every one is a sequence of numbered request/response pairs |
| 13 | Focus Reader | Big-AGI ghosts out-of-context turns rather than hiding them; here it is a reading mode |
| 14 | Print Sheet | Khoj ships a ~120-line `@media print` transcript; this promotes it to a live view |
| 15 | Threaded Turns | **No** surveyed app renders a branching transcript — all collapse siblings to a `< n/m >` stepper |

Every take is pure CSS over the shared message markup, so all of them inherit
the full feature set: long-message fade and expand, message details,
per-message actions, system and event cards, the working card, plan cards and
artifact cards. A feature matrix asserts this — 12 surfaces x 16 takes across
7 conversation states, plus 8 themes and reduced motion.

## Source files

- `shell.html` — development shell with the three inline slots
- `styles.css` — themes, layout, and the component renderers
- `motion.css` — the shared motion system (tokens, primitives, reduced-motion)
- `motion.js` — motion helpers plus the `PM56_WORKING` take registry
- `data.js` — deterministic demo fixtures; also the single source of truth for
  the working-take names (`PM56_DATA.workingTakes`)
- `app.js` — interaction/state implementation, including the `pmPatch` renderer
- `variants-a.js` / `variants-a.css` — working takes 8–11
- `variants-b.js` / `variants-b.css` — working takes 12–15
- `variants-c.js` / `variants-c.css` — working takes 16–23
- `transcripts.css` — transcript takes 8–15
- `build.py` — inlines everything into the two direct-open deliverables;
  `python3 build.py --check` re-builds and fails if either has drifted
- `index.html`, `PM_Chat_Assistant_5.6_Pro_Standalone.html` — generated. **Never
  hand-edit these**; `--check` exists because a previous hand-edit gave
  `index.html` a second copy of `app.js`.
- `tests/`, `reports/` — audit scripts and prior results. See `REPAIR_STATUS.md`
  for which of the older reports are still trustworthy.

## Motion

Timings are measured from the reference screen recording rather than invented,
and the values live as tokens in `motion.css`:

| token | value | measured from |
|---|---|---|
| `--pm-t-label` | 90ms | label settling after a step swap |
| `--pm-t-icon` | 150ms | the active disc scaling and tinting in |
| `--pm-t-row` | 110ms | a detail row resolving out of `blur(4px)` |
| `--pm-t-cascade` | 45ms | the gap between successive rows/words |
| `--pm-t-handoff` | 220ms | a full step handoff |
| `--pm-shimmer-cycle` | 1370ms | the band crossing the verb in ~500ms |

`--pm-step` gives every activity kind its own accent, so the active icon, its
ring, and the shimmer band share one colour identity.

Adding a take means: register `window.PM56_WORKING[N]` in a `variants-*.js`
file, scope its CSS under `.working-variant-N`, and add its name to
`workingTakes` in `data.js`. Everything else — the mixer, the clamp bounds, the
feature manifest — derives from that list.

Canonical Puppet Master Plans were not modified. Stable product requirements
found while concepting are recorded in `reports/PACKET_PLAN_DISPOSITION.md`.
