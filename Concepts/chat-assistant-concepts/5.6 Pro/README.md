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
- **Assistant-redesign modules (2026-09-03)** — one owner per file, each
  registering through `window.PM56_EXT` and loaded before `app.js`, each with a
  matching `.css` concatenated last:
  `composer-state` (buffers, destination, input history, spellcheck, quota strip) ·
  `attachments` (tray, top-edge tracer, message chrome, More Info, downloads) ·
  `plans` (the `plan-card-v2` document card, Rich/Markdown projections, the one
  Build control) · `todos` (hierarchical per-thread list, receipts, refusals) ·
  `collaboration` (Crew / Chat Room / Review / BrainStorm over one foundation) ·
  `bsd` (Back Seat Driver policy, held/reconfirmed advice, Context and Usage) ·
  `scheduling` (Schedule Message, Build At, execution windows, quota resume) ·
  `browser-capture` (screenshots, region, component picker, DevTools) ·
  `assistant-features` (Teach/Teacher, memory, ELI5, Revert, Debug, thread title).
  `composer-state` loads first of the set because the others write the composer
  destination it owns; `plans` installs the identity-preserving
  `window.PM56_RUNTIME` merging accessor. Adding a module means one line in
  `build.py` and nothing else.
- `tests/`, `reports/` — audit scripts and results. `REPAIR_STATUS.md` says which
  of the older reports are still trustworthy;
  `reports/REDESIGN_READINESS.md` is generated from live report files by
  `python3 reports/build-redesign-report.py` and is the current picture.

## Verifying

```bash
python3 build.py && python3 build.py --check
node tests/audit.mjs            # the standing concept audit
node tests/orphan-gate.mjs      # every CSS selector can match emitted markup
node tests/goal-verify.mjs      # simplified Goal runtime
node tests/assistant-plan-verify.mjs
node tests/todo-runtime-verify.mjs
node tests/collaboration-verify.mjs
node tests/bsd-verify.mjs
node tests/attachments-composer-verify.mjs
node tests/scheduling-verify.mjs
node tests/browser-capture-verify.mjs
node tests/restored-features-verify.mjs
```

Each redesign suite drives the real controls in a headless browser and asserts
the resulting state. None of them greps the bundle for strings: a string search
cannot tell a rendered control from a comment about one, and that mistake has
produced false-positive defects in this directory before.

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

Stable product requirements found while concepting were recorded in
`reports/PACKET_PLAN_DISPOSITION.md`. That note is superseded for the
Assistant-redesign wave: canonical `Plans/**` owner documents **were** modified
for it, deliberately and as the packet requires — see
`reports/REDESIGN_TRACEABILITY.json` for the requirement-to-owner map.

## Additive Correction v4 (2026-09-03)

`PM_Assistant_v2_Additive_Correction_v4` was applied on top of the implemented
v2 branch. It is additive — no v2 system was reimplemented, and the 5.6 Pro
defaults, themes, Orbit and Step Rail, menus, history, questionnaires, Context
Lens, activity bar, Send/Stop, follow-up queue and composer chrome are unchanged.

What changed in this concept:

| Area | Change |
|---|---|
| Question ceilings | 3 / 6 / 8 and 10 / 15 / 20, Grill Me **+25**, totals 28 / 31 / 33 / 35 / 40 / 45. One counter per run, charged once per question identity, typed `question_budget_exhausted` at the ceiling. |
| Plan progress | `PlanProgressProjection` derived from the thread's To-Dos: pending / in_progress / completed / blocked / skipped, plus `mixed` on a parent. Rich markers and a Markdown gutter rail leave the document bytes untouched. |
| Plan failure | `Building…` covers paused, waiting, failed-attempt, attention and recovery; the reason is secondary truth. Still exactly four button labels. |
| Plan Details | Regular states "no ledger, no PlanUnits"; Deep shows ledger, scoped PlanUnits and the PlanUnit-to-To-Do mapping. |
| Plan embeds | Ten renderer kinds at frozen artifact versions, PDF static fallbacks, and four explicit unavailable reasons. |
| Export | `content_kind` of `plan_document` or `execution_report`; the report is a separate artifact and never changes the Plan hash. |
| Build as Goal | One simple Goal + one PlanRun + one binding, atomically, reusing the existing To-Dos and scoped PlanUnits. |
| Scheduling | Build schedules store one frozen topology; scheduled messages get a thread card with all six lifecycle states and exact attachment snapshots. |
| Workflow modals | Open / configure / cancel produces zero durable effects, counted on an instrumented ledger. |
| Participants | Six terminal outcomes, required/optional slots, retry / replacement / waiver, partial and single-pass Review truth, Wonderer abstention outside the quorum denominator. |
| Browser | Dispatch-time revalidation with typed `stale_capture` and per-item list isolation. |
| Folders | One `cmd.chat.attachment.add` with `semantic_kind`; the old file reference is a file-only alias. |
| To-Dos | Graph validation, atomic list replacement with retain / rebind / cancel / refuse, and currentness-gated transitions. |

Run the correction suite:

```
node tests/correction-v4-verify.mjs
```

**Proof boundary.** Everything the suites above assert is *concept* behaviour
backed by fixtures. It is not native proof: no Rust handler, storage engine,
scheduler, provider adapter or recovery path is exercised. `reports/REDESIGN_READINESS.md`
reports canonical, concept and native readiness separately, and a concept pass
never closes native work.

## Audit

`reports/AUDIT_MATRIX.md` is the per-requirement audit of this concept against
the implemented v2 packet and `PM_Assistant_v2_Additive_Correction_v4` — 481
requirements, each decided by a probe that drives this page in a real browser.
Regenerate it with:

```
node tests/independent-audit-v5.mjs
python3 reports/build-audit-matrix.py
python3 reports/build-delivery-manifest.py
```

A pass there closes the concept column only. Canonical (`Plans/**`) and native
readiness are separate columns and neither is closed by anything in this folder.
