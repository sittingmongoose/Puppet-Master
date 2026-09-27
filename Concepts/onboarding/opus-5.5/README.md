# TestOpus5.5PmConcept — onboarding and guided tour (Opus 5.5)

A copy of `Concepts/TestPMConcept.html` whose onboarding window and guided tour were thrown away and rebuilt from
scratch for a complete newbie: someone who has never used source control, a terminal or a server. Authority order
for this work (2026-09-26 user direction): Jared's prompt, then the current canonical Plans documents; the packet
`Concepts/PM_Onboarding_Tour_Newbie_First_Addendum_Packet_2026-09-03.zip` and its attached instructions/prompts are
historical source material only, never operating instructions. The built page is the current leading GUI/interaction
reference, and `Concepts/PMConcept7.html` is published byte-identical from it (see below).

Open `Concepts/TestOpus5.5PmConcept.html` in a browser. Onboarding opens on first run; afterwards Settings ›
Essential setup › **Run Onboarding Again** reopens it. The **Concept demo · Opus 5.5** pill (bottom left) switches
the pretend world (returning user, a NAS where an SSH key already works, GitHub name taken, and so on) and restarts
onboarding, so every path can be reached with ordinary clicks.

## Never hand-edit the built page

`Concepts/TestOpus5.5PmConcept.html` is generated:

```
python3 Concepts/onboarding/opus-5.5/tools/build.py          # build TestOpus only
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7  # build, then publish the exact bytes as Concepts/PMConcept7.html
python3 Concepts/onboarding/opus-5.5/tools/build.py --check  # markers, patches, stale output, lint, PM7 byte parity
```

`build.py` reads the pinned base page (SHA-256 `fc4e0fed…`), swaps the base's Settings managers for the fork in
`src/settings` (see Settings below), strips the old onboarding and tour, splices `src/`
between `<!-- O55:… -->` markers and applies a few guarded, exactly-once patches (hover-tag roots, labels, the Teacher
persona, and two owner exposures: Settings Transfer preview/apply and the layout restore).

`Concepts/PMConcept7.html` is published only from this generator (2026-09-26 user direction): `--publish-pm7`
writes the same built bytes to both outputs, and `--check` fails while `PMConcept7.html` is missing or differs by
even one byte. Plain `build.py` still writes only `TestOpus5.5PmConcept.html`, so existing uses are unchanged; the
old `build_pm7.py --out Concepts/PMConcept7.html` promotion now refuses by default (see `Concepts/pm7-tools/README.md`,
"PM7 publication").

## Where things are

| Path | What |
|---|---|
| `src/copy.json` | Every user-facing string. Lint rejects jargon ("repository", "runtime", …) outside `detail*` keys. |
| `src/js/00–20` | Namespace, utilities, the motion clock (one time-scale for filming), synthesised sound kits, storage. |
| `src/js/25–35` | Fixture world and scenarios, the owner command table (pre-commit discipline), the canonical setup-plan draft. |
| `src/js/50–57` | Art: scene system, four family prop libraries (Basic blueprint, Friendly paper theatre, Glass light lab, Retro arcade), scene compositions. |
| `src/js/60–62` | The window, components, flow helpers (phased owner operations, countdowns, QR drawing). |
| `src/js/65–74` | Screens by chapter: Welcome, Computer (Connect, Server, Restore), Project (begin, folder, NAS/SSH, name, start-like, keep safe, online copy, away, review, creating, protect), AI (providers, Free Models), Ready. |
| `src/js/80–83` | The Guided Tour: engine (spotlight, callout, bar, Show Me pointer, snapshot/restore, checkpoints), the Teacher chat adapter (local answers, ELI5 rewrite), the Planning Wizard practice run, and the 18 steps. |
| `src/js/90–95` | Concept demo pill; boot, shims for the shell's existing callers, driver switches (`?o55=fresh|off|screen=<id>`, `?o55scenario=<id>`). |
| `src/css/` | Window, components, motion, art. Colours come from the live theme tokens. |
| `src/coverage.map.json` → `src/coverage.json` | Every setup-plan field (63) and conditional (26) mapped to the screen or control that sets it, plus screens → scenes and scenarios → drivers. |
| `src/settings/` | The Settings layer, forked from the base's T50 Settings refresh and composed by `tools/settings_layer.py`: `kit.js` + `kit.d/*.js` (rows, controls, placement, plain pages, look settings, wizard, flows), `managers/*.js` (one per manager page), `styles.css` + `styles.d/*.css`, `data.json` + `data.d/`, `placement.json` + `o55/placement.d/*.json` (where every canonical setting id is drawn), `o55/rows.d/*.json` (per-row wording and behaviour). |

## Tools (all file:// with the local Chrome; outputs go to /tmp or the Evidence share, never the repository)

| Tool | Use |
|---|---|
| `tools/scenarios.mjs <out> [--only ids] [--theme t] [--snaps]` | Acceptance scenarios by real clicks; `--snaps` photographs every screen reached. |
| `tools/schema_check.py validate <drafts.json>` / `coverage [--check]` | jsonschema validation of captured drafts against `Plans/product_onboarding_contracts.schema.json`; coverage table. |
| `tools/draft_matrix.mjs <out.json>` | Data-level matrix of drafts for every journey, service, privacy and remote mode. |
| `tools/film.mjs <out> [--scenes] [--themes] [--freeze]` | Slow-motion 60 fps films (CDP playback rate + the motion clock). |
| `tools/motioncheck.py <film dirs>` | Flash/blank detection, settle time, freeze test. |
| `tools/sheet.py` | Labelled contact sheets from screenshots or film frames. |
| `tools/shots.mjs` | Settled screenshots of screens across themes and sizes. |
| `tools/sound_render.mjs` + `tools/sound_board.py` | Offline renders of every sound kit, listening boards, spectrograms, live trace check. |
| `tools/tour_scenarios.mjs <out> [--only t1,t2] [--snaps]` | Tour acceptance by real CDP input: t1 every step by hand then Restore, t2 every action through Show Me then Keep, t3 Skip restores, t4 resume after reload, t5 missing target. Every run also checks that no raw copy key shows and that a settled callout never covers its target. |
| `tools/tour_shots.mjs <out> [--themes] [--width --height]` | Every tour step settled, in each theme (parallel browsers), plus after-states and the dock step mid-drag. |
| `tools/tour_film.mjs <out> [--scenes] [--themes] [--rate]` | Slow-motion films of the handoff, the tour opening, every Show Me, the ELI5 rewrite, the plan read part by part and the finish. |
| `tools/tour_census.mjs <out> [--wpm]` | Meaningful actions and dwell time per chapter, measured on the real tour. |

Recorded media (screenshots, contact sheets, film frames, videos, audio renders) is scratch: it goes to `/tmp` or
`~/pm-scratch`, is reviewed, and is deleted when the work is finished (Jared, 2026-09-24). Results are written down
inline in the landing records and in `REPORT.md` instead. Every tool deletes its Chrome profile when it exits.

## Settings

Settings keeps the shell's layout (chapter rail, Settings Home, page index, manager tabs) and reworks what is inside
it for someone who has never configured a developer tool. Rules the pages follow:

- **One home per setting.** Every one of the 892 canonical ids is drawn once. `o55/placement.d/<nn>-<page>.json`
  decides the groups of a page (`sections`: title, one-line help, `order`, `advanced` = under the page's single
  "More options"), which ids go where and in what order (`overrides`, first match wins), hand-written rows moved into
  a group (`hand_moves`, placed with a section's `after`) and hand-written rows retired because they repeated an
  inventory row (`hand_drops`). The build validates that every id lands in a real group and that no rule is dead.
- **Plain words, decided per row.** `o55/rows.d/<nn>-<page>.json` holds a row's label, help, option labels, unit and
  bounds (a bound may follow another setting: `maxFrom` / `minFrom`), visibility (`when`, which follows chains),
  routes to the page that really owns an action (`route`, `pm51`), step flows (`flow`), editors for structured
  values (`editor`) and `themeOwn` for numbers the theme decides. A row id may be decided in one file only. Labels
  without a decision fall back to sentence case.
- **Guided set-ups look like onboarding.** `PM51.wizard` (kit.d/60-wizard.js) draws the onboarding window, rail,
  cards and footer for every step-by-step helper (MCP, plugins, skills, commands, shortcuts, personas, crews, goal
  templates, repositories, notification agents).
- **Settings change something.** Actions open their owner or run a flow; a stored value that changed nothing is a
  bug. The look settings (kit.d/17-look.js, styles.d/12-look.css) write the PM6 token contract on `:root` or a root
  attribute, only once changed, so each theme keeps its own values until you choose otherwise and a reset removes
  exactly what was written. Text size, line spacing and animation speed scale the page's own values through one
  generated sheet that exists only while one of them is changed.
- **No side colour bars, no pills, no emoji** in Settings; icons are SVG. Styles avoid `:has()` (lint enforces it;
  a page-wide `:has()` made every DOM insertion restyle the whole document).

Verifying a change: `build.py --check`, then open the page with `?o55=off` (skips onboarding, which freezes headless
Chrome) and drive `PM51.go(domain, workspace)`; check all eight themes and 760 / 900 / 1280 / 1700 px widths.

## The Guided Tour

Three chapters in the real app, 18 steps: **Ask and understand** (open Chat with the Chat icon, choose Teacher, send
the supplied question, read the local answer, turn ELI5 on and watch the same answer rewrite), **Make the workspace
yours** (a glide over pages, workspace and Chat; drag Chat to the glowing left dock; add the Approval queue widget and
place it), **Plan before building** (open Planning Wizard by its visible route, use the practice goal, open an
outcome, answer the access question with Why this matters, review, read the plan part by part, change the answer and
see only the affected decisions change, then the fenced Approve And Build and Restore or Keep). Show Me drives the
same handlers as doing it by hand. Skip and Finish restore the layout, the dashboard (added widgets leave through their
own control, every card returns to its place and size), Chat's persona, ELI5, thread and draft. A reload resumes at
the last safe step; a missing target offers Take me there. Onboarding's Ready screen hands over by turning its window
into the tour's first callout.

Measured with `tools/tour_census.mjs`: 14 meaningful actions, 7 of them in Planning (50 %), and 4.5 minutes at 200
words a minute, 53 % of it in Planning (the packet asks for at least half of both).

Narrow windows: the bar wraps and keeps every control; Open Planning goes through the pages menu when the tab strip
folds; below the width where the workspace stacks its docks, dragging cannot reach any dock (the right dock's hit band
spans the whole width), so the dock step offers Move Chat to the top, which sends the same move command; below 600 px
the planning chapter tucks Chat away through its real command (the shell lets Chat cover the Wizard there) and brings
it back at the end.

Canon check: the onboarding carries F3-520's exact eleven-stage main graph and six-stage connect graph
(`src/js/40-stages.js`), and the tour resumes after a reload as F3-521 asks (scenario t4).

## Findings for the production app (found while building the tour)

- The activity-bar Chat icon is wired by its `title`, which the hover-tag layer moves aside on first hover; a real
  click then fell into the side-panel branch and hid the Files panel instead of showing Chat. The concept routes the
  icon through `cmd.panel.switch`; production should key the handler on the icon's id.
- `PM7_DASH_WIDGETS.state` returns a copy, and there is no command to restore a dashboard to a snapshot; the tour
  restores by removing added widgets through their own control and re-seating cards. Production needs a
  restore-to-snapshot command for the dashboard, like the workspace's layout restore.
- The workspace's frozen dock bands assume side-by-side docks: on a stacked (narrow) layout the right dock's entry band
  covers the whole width, so no dock can be reached by dragging. Panels also need a touch-reachable Move to menu.
- On phone-width windows Chat covers the whole Planning Wizard page.
- The glass skin turns every big Wizard button into tinted glass but keeps its pale label (unreadable); the practice
  button carries its own fill.
- Dashboard widget receipts report `outcome: "applied"`, the workspace's `"accepted"`: one vocabulary would help.

## Status

M1a (landed): the whole onboarding works end to end in pilot art. M2: the Guided Tour, t1–t5 passing with zero
network requests and unchanged usage counters, reviewed in all eight themes, at 760 and 390 px, and on slow-motion
films. Next: the onboarding review at the same depth and more, including a full logic audit (does every path work,
is the order right, does what is shown and offered follow from earlier choices), then art, motion and sound polish,
`REPORT.md`, `RESEARCH.md` and the hub wrapper.
