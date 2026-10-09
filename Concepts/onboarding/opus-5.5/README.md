# TestOpus5.5PmConcept — onboarding and guided tour (Opus 5.5)

A copy of `Concepts/Onboarding concepts/TestPMConcept.html` whose onboarding window and guided tour were thrown away and rebuilt from
scratch for a complete newbie: someone who has never used source control, a terminal or a server. Authority order
for this work (2026-09-26 user direction): Jared's prompt, then the current canonical Plans documents; the packet
`Concepts/PM_Onboarding_Tour_Newbie_First_Addendum_Packet_2026-09-03.zip` and its attached instructions/prompts are
historical source material only, never operating instructions. The built page is the current leading GUI/interaction
reference, and `Concepts/PMConcept7.html` is published byte-identical from it (see below).

Open `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html` in a browser. Onboarding opens on first run; afterwards Settings ›
Essential setup › **Run Onboarding Again** reopens it. The **Concept demo · Opus 5.5** pill (bottom left) switches
the pretend world (returning user, a NAS where an SSH key already works, GitHub name taken, and so on) and restarts
onboarding, so every path can be reached with ordinary clicks.

## Never hand-edit the built page

`Concepts/Onboarding concepts/TestOpus5.5PmConcept.html` is generated:

```
python3 Concepts/onboarding/opus-5.5/tools/build.py          # build TestOpus only
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7  # build, then publish the exact bytes as Concepts/PMConcept7.html
python3 Concepts/onboarding/opus-5.5/tools/build.py --check  # markers, patches, stale output, lint, PM7 byte parity
```

`build.py --out <path>` is a private build: it lints, then writes only that path, never either published output.

`build.py` reads the pinned base page (SHA-256 `b3888fad…`), swaps the base's Settings managers for the fork in
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
| `src/copy.d/*.json` | Strings added by later work, merged into `copy.json` by the build in filename order; a leaf key may be defined once. |
| `src/js/00–20` | Namespace, utilities, the motion clock (one time-scale for filming), synthesised sound kits, storage. |
| `src/js/16-nier-fx.js` + `src/css/05-nier-fx.css` | `O55.nierFx`: the shared NieR effects for the onboarding window and the tour (see Settings below). |
| `src/js/25–35` | Fixture world and scenarios, the owner command table (pre-commit discipline), the canonical setup-plan draft. |
| `src/js/50–59` | Art: scene system, five family prop libraries (Basic blueprint, Friendly paper theatre, Glass light lab, Retro arcade, and the NieR unit marionettes in `54-art-nier.js`), the marionette rig and the troupe's stage performances (`58-rig.js`, `59-cheer.js`), scene compositions. |
| `src/js/60–62` | The window, components, flow helpers (phased owner operations, countdowns, QR drawing). |
| `src/js/64-nier-look.js` | `O55.nierLook`: NieR Mode where a look is chosen (the Pick a look row, the look popover's row, the Adjust panel) and the preview that is committed with the look into the new Project. |
| `src/js/65–74` | Screens by chapter: Welcome, Computer (Connect, Server, Restore), Project (begin, folder, NAS/SSH, name, start-like, keep safe, online copy, away, review, creating, protect), AI (providers, Free Models), Ready. |
| `src/js/66-nier-window.js` + `src/css/11-window-nier.css`, `13-nier-look.css` | The NieR window (`O55.nierWindow`, NieR Mode's skin of the onboarding window) and the styles of the look row, its thumbnail and its Adjust panel. |
| `src/js/66-family-window.js` + `src/css/14-family-moments.css` | The four looks' own hero moments (`O55.famWindow`): the wake, the act card and the curtain call in Basic, Friendly, Glass and Retro, asked after NieR's skin (see "The four looks' hero moments"). |
| `src/js/80–84` | The Guided Tour: engine (spotlight, callout, bar, Show Me pointer, snapshot/restore, checkpoints), the Teacher chat adapter (local answers, Explain this reply simply), the Planning Wizard practice run, and the 18 steps; then NieR Mode's Pod 042 chat adapter. |
| `src/js/85-tour-nier.js` + `src/css/41-tour-nier.css` | The Guided Tour's NieR skin: Pod 042 in the callout and as the Show Me pointer, the square spotlight, the hung chapter cards and the results card. |
| `src/js/90–95` | Concept demo pill; boot, shims for the shell's existing callers, driver switches (`?o55=fresh|off|screen=<id>`, `?o55scenario=<id>`). |
| `src/css/` | Window, components, motion, art. Colours come from the live theme tokens. |
| `src/css/03-retro-light-readability.css` | Retro Light warning text and user-bubble text, approved 2026-10-08. |
| `src/coverage.map.json` → `src/coverage.json` | Every setup-plan field (63) and conditional (26) mapped to the screen or control that sets it, plus screens → scenes and scenarios → drivers. |
| `src/settings/` | The Settings layer, forked from the base's T50 Settings refresh and composed by `tools/settings_layer.py`: `kit.js` + `kit.d/*.js` (rows, controls, placement, plain pages, look settings, wizard, flows), `managers/*.js` (one per manager page), `styles.css` + `styles.d/*.css`, `data.json` + `data.d/`, `placement.json` + `o55/placement.d/*.json` (where every canonical setting id is drawn), `o55/rows.d/*.json` (per-row wording and behaviour). |
| `src/settings/kit.d/23-nier-theme-menu.js` + `src/settings/styles.d/18-nier-theme-menu.css` | The title-bar theme menu's NieR Mode row and its Adjust button (see Settings below). |

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
| `tools/tour_scenarios.mjs <out> [--only t1,t2] [--snaps]` | Tour acceptance by real CDP input: t1 every step by hand then Restore, t2 every action through Show Me then Keep, t3 Skip restores, t4 resume after a reload, t5 missing target. Every run also checks that no raw copy key shows and that a settled callout never covers its target. |
| `tools/tour_reset.mjs [--page <path>]` | Reload and reset checks: Settings search › Restore home layout lands on Reset the layout, Settings Home's three setup and tour rows, Resume after a reload, Run Onboarding Again after a reload, a legacy record starting over, and Skip for a tour started from Settings. Exits 1 on any failure. |
| `tools/tour_shots.mjs <out> [--themes] [--width --height]` | Every tour step settled, in each theme (parallel browsers), plus after-states and the dock step mid-drag. |
| `tools/tour_film.mjs <out> [--scenes] [--themes] [--rate]` | Slow-motion films of the handoff, the tour opening, every Show Me, Explain this reply simply, the plan read part by part and the finish. |
| `tools/tour_census.mjs <out> [--wpm]` | Meaningful actions and dwell time per chapter, measured on the real tour. |
| `tools/nier_palette.py --write \| --check` | NieR Mode's token tables in `src/settings/styles.d/13-nier.css`, generated from `src/settings/nier/nier-automata.json`; `build.py --check` runs `--check` (stale tables, or a colour literal elsewhere in that file). |
| `tools/nier_scene_art.py --write \| --check` / `tools/nier_scenes.py --write \| --check` | NieR Mode's background scenes: the drawn SVGs in `src/settings/nier/scenes/`, then their composition into `kit.d/21-nier-scenes.js`; `build.py --check` runs both checks. |
| `tools/nier_hue_audit.mjs <out> [--modes] [--views] [--shots]` | Photographs the main views with NieR Mode on, light and dark, and names the element and property behind every pixel outside ink and parchment (swatches that show a real choice are counted apart). |
| `tools/perf/perf.py <page> <out.json> [--themes] [--quick] [--headful] [--tracefps]` | Performance walk per theme (opening, screens at rest and changing, typing, tour steps, Show Me, look picker). Python stdlib only, so it runs on the Windows PC over SSH as well as on the VM (`xvfb-run … --headful`). See "Performance rules". |
| `tools/perf/film.py <page> <outdir> [--themes] [--scenes] [--rate 0.1] [--solid 0\|1]` | Slow-motion 60 fps films of the opening, a screen change with the rig, typing, the tour's ring and Show Me, on the Windows GPU. |

Recorded media (screenshots, contact sheets, film frames, videos, audio renders) is scratch: it goes to `/tmp` or
`~/pm-scratch`, is reviewed, and is deleted when the work is finished (Jared, 2026-09-24). Results are written down
inline in the landing records and in `REPORT.md` instead. Every tool deletes its Chrome profile when it exits.

The tools launch Chrome on the GPU (no `--disable-gpu`) and accept `--page <built html>` to test a private build
(`python3 tools/build.py --out <path>`) instead of the checked-in `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html`; without
`--page` they test the checked-in page.

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

**NieR Mode** (Settings › App & Input › Theme & colors, off by default) is a hidden theme painted over the Basic family
in light or dark, not a ninth theme: the chosen family stays in `PM_THEME`'s state and comes back when it is turned off.
`build.py` routes every writer of `<html data-theme>` through `window.PM_THEME_PAINT_FAMILY`; `kit.d/18-nier.js` is the
engine and documents the contract the parts code against (`html[data-o55-nier="on"]`, `data-o55-nier-parts`,
`window.PM_NIER`); `styles.d/13-nier.css` holds the palette and the embedded faces (M PLUS 1 and JetBrains Mono,
inlined by `tools/settings_layer.py`; sources and licences in `src/settings/nier/`).

Its 29 parts (general.visual.nier-parts, all installed by default) are each a switch that does nothing while NieR Mode is
off: Look, Motion, Sound & voice and Pointer in `kit.d/19-nier-parts.js` + `styles.d/14-nier-parts.css`, the 12 World
parts (boot log, status readouts, block progress, ink charts, map ticks, machine glyphs, intel tooltips, square icon
strokes, quest banners, ink empty states, save signal) in `kit.d/20-nier-world.js` + `styles.d/15-nier-world.css`, and
Pod 042, a Chat persona that answers locally in Pod voice (`src/js/84-pod042-chat.js`, added to `PERSONA_CATALOG` by
`build.py`). The background scenes (general.visual.nier-background) are original line art in
`src/settings/nier/scenes/*.svg`, drawn by `tools/nier_scene_art.py` and composed into `kit.d/21-nier-scenes.js` by
`tools/nier_scenes.py` (`--write`, and `--check` in `build.py --check`). The row Customize NieR Mode opens the parts
editor, drawn as the game's Plug-in Chips screen (`kit.d/22-nier-chips.js` + `styles.d/17-nier-chips.css`): a chip per
part, a storage meter, the presets Full install, Quiet, Still and Colors only, a preview tile, the background picker and
Play reboot moment. It is a row editor, not a manager. The palette tables come from `tools/nier_palette.py`, and
`tools/nier_hue_audit.mjs` finds any pixel outside ink and parchment.

The title-bar theme menu ends with a NieR Mode row (`kit.d/23-nier-theme-menu.js` +
`styles.d/18-nier-theme-menu.css`): a divider after the family rows, a `menuitemcheckbox` that calls `PM_NIER.set`
and syncs from `PM_NIER.onChange`, and an Adjust NieR look button that opens the parts editor on the live store.
Toggling leaves the menu open; Adjust closes it. The same Plug-in Chips editor renders outside Settings as
`PM_NIER_CHIPS.popup` (a body-level modal dialog with a scrim, a focus trap, Escape and a close button, returning
focus to its opener) and through `PM_NIER_CHIPS.mount` (the editor inside a host element, which onboarding uses for
a panel in its own window instead of a nested dialog). Both read and write only through a store, and the editor's
CSS works outside `#panel-settings`.

`O55.nierFx` (`src/js/16-nier-fx.js` + `src/css/05-nier-fx.css`, words in `src/copy.d/10-nier-fx.json`) holds the
shared NieR effects the onboarding window and the tour use: one-shot decode, slice, wipe, glitch and alert, the
brackets and cursor followers, quest banners, reboot bands and Pod 042 speech. Every effect is a no-op while NieR
is off, honours Reduced Motion with the end state at once, draws only while its part is installed, and cleans up
after itself. The Pod's chirps and the banners' stings play through `O55.sound`, so the window's mute governs them.

Verifying a change: `build.py --check`, then open the page with `?o55=off` (skips onboarding, which freezes headless
Chrome) and drive `PM51.go(domain, workspace)`; check all eight themes and 760 / 900 / 1280 / 1700 px widths.

## Sound

`O55.sound` (`src/js/15-sound.js`) plays synthesised UI sound for the onboarding window and the tour: no audio files
and no samples, every sound built from oscillators, filters and noise. One kit per theme family (dark and light
share a kit), plus a fifth NieR kit while NieR is painted with its Menu sounds part installed; with the part off
NieR plays the painted Basic kit. `nierOn`, `nierOff` and `reboot` always use the NieR voice while the sounds part
is installed, even mid-transition. An explicit `family` or `kit` option picks a kit outright.

The vocabulary is 49 events. An event a kit lacks falls back to an older one: `chapter` to `next`,
`reveal`/`sheet`/`reboot`/`nierOn` to `open`, `wake` to `reveal`, `unsheet`/`nierOff` to `close`,
`phase`/`copy`/`move`/`pod`/`string` to `tap`, `found`/`save` to `success`, `warn`/`missing`/`glitch` to `error`,
`callout` to `spot`, `pointer` to `pickup`, `showPointer` to `pointer`, `arrive`/`land` to `drop`,
`checkpoint`/`quest` to `step`, `interrupt`/`bow` to `back`, `showInterrupt` to `interrupt`, `decode` to `type`.
`hover` is silent outside NieR; an unknown event is dropped and logged.

Frequent events are pools of related variants drawn by a shuffle that never repeats the last one. Pitches follow
the journey: each chapter has its chord (Welcome I, Computer IV, Project V, AI vi, Ready I up an octave; the tour's
ask, workspace and plan chapters IV, ii and V, resolving to I at the finish; NieR its own modal chords), forward
steps climb the chord with progress, Back descends, and choices rotate through it. The first forward move into a new
chapter becomes a chapter sting automatically, unless the window has only just opened or NieR's window claims the
sting (the hung act card's `quest` is then the chapter's one sting). `setContext` tells the music
where the journey is; `chapter: 'tour'` follows the tour's own chapter.

Several events in the same moment (one task, or within 70 ms) play the most important one; more layer by design
instead: the texture ticks (decode chatter, typing, moves, the cursor's hover) and the stage's foley (a string, a
landing, a bow) under anything, a celebration's sparkles over commit or finish, and the Pod just after callout,
quest, chapter or step. Very frequent events carry a minimum gap between two of the same. Nothing
plays before the first trusted gesture.

The mute control mirrors the current Project's `general.interaction.sound-effects` (factory default on, DL-107); a
refused or unavailable write changes nothing. With no Project the control starts on as a session-only preview: it
writes and stores nothing, and the Project's own value wins at the commit and at every rebind (canon F3-520).

The NieR Menu sounds part plays through `O55.sound.synth`, so there is one AudioContext and the blips sit under the
same mute and gesture rule. The blips ignore synthetic clicks and anything inside the onboarding window or the tour.

`O55.sound.CATALOG` lists all 354 kit, event and variant takes with names, styles and durations; `preview` plays one
entry unmuted, `renderBuffer` renders one offline, and `bars` draws its waveform. Settings › Notifications & Sounds ›
Sounds shows them as Setup & tour groups (one look at a time) and a NieR group, all generated demonstration tones
previewed through `O55.sound`; main takes show first and the rest sit behind Show N more takes. The event phrases
come from the `soundLibrary` strings in `src/copy.d/30-sound.json`. `TRIM` (level trims per kit and event) and `DUR`
(audible seconds per kit, event and variant) in `15-sound.js` are generated: `tools/sound_render.mjs` renders every
entry offline, then `tools/sound_catalog.py --write` rewrites the tables.

## The Guided Tour

Three chapters in the real app, 18 steps: **Ask and understand** (open Chat with the Chat icon, choose Teacher, send
the supplied question, read the local answer, ask for Explain this reply simply, which adds one simpler reply under
the answer and leaves the answer as it was (DL-126), then meet the quick ELI5 switch by the message box, which changes
only later replies), **Make the workspace
yours** (a glide over pages, workspace and Chat; drag Chat to the glowing left dock; add the Approval queue widget and
place it), **Plan before building** (open Planning Wizard by its visible route, use the practice goal, open an
outcome, answer the access question with Why this matters, review, read the plan part by part, change the answer and
see only the affected decisions change, then the fenced Approve And Build and Restore or Keep). Show Me drives the
same handlers as doing it by hand. Skip and Finish restore the layout, the dashboard (added widgets leave through their
own control, every card returns to its place and size), Chat's persona, ELI5, thread and draft. The restoration basis (layout, dashboard cards, page, thread,
persona, ELI5; never the composer's text) is kept in its own record, `pm.o55.tour-basis.v1`, beside the bounded
checkpoint, so Resume the Guided Tour works after a reload too: it revalidates the current owner state and picks up
at the earliest step whose result no longer holds, and Skip or Finish still put the layout back (the composer is left
as it is). A saved tour that cannot pick up (another Project, its thread gone) first puts back what of its basis is still
there, then starts from the beginning and says so, naming the layout when it could not be put back.
Only a layout that could not be put back stops at the recovery panel (Retry restore, or start over). Run Onboarding
Again and Start the Guided Tour over reset the tour completely: progress, basis, chip and any recovery note go.
Settings Home › Essential setup has Run Onboarding Again, Resume the Guided Tour (only enabled when there is a tour
to pick up) and Start the Guided Tour over. A missing target offers Take me there. Onboarding's Ready screen hands over by turning its window
into the tour's first callout.

Measured with `tools/tour_census.mjs`: 14 meaningful actions, 7 of them in Planning (50 %), and 4.5 minutes at 200
words a minute, 52 % of it in Planning (the packet asks for at least half of both).

Native durable owner snapshot admission remains to be implemented; the browser fixture's basis record stands in for
the layout owner's snapshot store, and it does not recover an unsaved composer draft after a full reload.

Narrow windows: the bar wraps and keeps every control; Open Planning goes through the pages menu when the tab strip
folds; below the width where the workspace stacks its docks, dragging cannot reach any dock (the right dock's hit band
spans the whole width), so the dock step offers Move Chat to the top, which sends the same move command; below 600 px
the planning chapter tucks Chat away through its real command (the shell lets Chat cover the Wizard there) and brings
it back at the end.

Canon check: the onboarding carries F3-520's exact eleven-stage main graph and six-stage connect graph
(`src/js/40-stages.js`). The full-reload resume capability in F3-521 is shown by the concept's basis record (scenario t4)
and remains unverified natively until the real layout owner can resolve a bounded restoration reference.

## NieR Mode in onboarding and the tour

NieR Mode (see Settings above) has a full showpiece pass in the onboarding window and the Guided Tour: a look row, a
window skin, a tour skin, an art family and a sound pass of its own. Every touch answers only while NieR Mode is
painted and asks for its own installed part, so Reduced Motion and the Quiet, Still and Colors only presets fall back
cleanly, and the four families keep every pixel outside the NieR thumbnail and the look menu's NieR row.

### Where NieR Mode is chosen

`O55.nierLook` (`src/js/64-nier-look.js`) puts NieR Mode where a look is chosen: a checkbox with an Adjust NieR look
button and a NieR art thumbnail as a row of its own under the four family tiles on Pick a look
(`src/js/65-screens-welcome.js`), the same two controls as a row in the look popover that the onboarding header's and
the tour bar's look buttons open (`src/js/63-look-menu.js`), and the title-bar theme menu's NieR Mode row
(`src/settings/kit.d/23-nier-theme-menu.js`).

In onboarding it is a preview, never a write: `PM_NIER.preview` paints the three NieR rows over the stored values
without writing them, `PM_NIER.previewing()` reads the preview back, and the rows are committed with the look into the
Project selected at the commit (the new Project a first run creates), so no other Project is written and a start like
another Project excludes the three rows as it excludes the theme pair. The Plug-in Chips editor reads and writes
through a store from `PM_NIER.store`: `'preview'` inside the window, `'live'` after it. Closing or skipping the window
leaves the preview painted, lingering exactly like the family preview until the next Settings write or Project load,
and a resume (after a reload too) re-applies it from the session.

The Adjust NieR look editor is `PM_NIER_CHIPS.mount` inside the onboarding window, a panel that replaces the window's
interior instead of a nested dialog, and `PM_NIER_CHIPS.popup` everywhere else.

### The NieR window

`O55.nierWindow` (`src/js/66-nier-window.js`, styles in `src/css/11-window-nier.css`, words in
`src/copy.d/45-nier-window.json`) is NieR Mode's skin of the onboarding window, called through `O55.ui.skin` at the
window's moments: a ruled header with a chamfered brand block, a rail drawn as an ink ruler with ticks, strings and
tabs, and chosen cards, tiles and rows inverted to ink blocks under corner brackets. Pod 042 narrates the screens from
the stage in two lanes, just below the control bar or low over the stage lip, and never covers an actor, a hung card
or the stage kicker. Words longer than 8 characters type on through `FX.type` behind a block caret, their final
layout held from the first frame; `FX.decode`'s scramble stays on labels of 8 characters or fewer. No surface larger
than 340x256 px reverses its opacity or brightness: large areas leave one way (a fold, a wipe, slats), and only small
elements (carets, stamps, ticks) flicker.

### The hero moments as built

| Moment | What happens | Files |
|---|---|---|
| Ticking NieR | The reboot cover grows from the NieR thumbnail in six held steps, a check list types with blinking stamps to "All clear", and six slats tear away; at the reveal the `wake` choir plays, You raises the signal, and the three units are lowered in centre first on the notes of the chord. Unticking powers the units down and folds the world back into the thumbnail. Turned on or off from Settings, the title-bar theme menu or the tour bar, the page-wide cover is the same plate in NieR's ground of the look's own tone, grown from the control pressed and torn away in the same slats, with the `wake` choir at its reveal. | `src/js/64-nier-look.js`, `src/settings/kit.d/19-nier-parts.js`, `src/js/59-cheer.js` |
| The cold open | The window opens empty on a line and the header assembles; a boot log types in the pane, and each of its stamps wakes the asleep puppets (the strings go taut, the units rise from their slump); the log folds onto its underline, which slides on as the title's eyebrow rule, and then the first music plays and Pod gives its first line. | `src/js/66-nier-window.js`, `src/js/16-nier-fx.js`, `src/js/59-cheer.js` |
| The act card | At a chapter's end an ink card is lowered on two strings and lands on the chapter's chord; on landing the ink block walks the rail to the next chapter and the brand's counter rolls; the leaving troupe bows under the card, and after the haul a unit points at the question. | `src/js/66-nier-window.js`, `src/js/16-nier-fx.js` |
| Created, and Ready's curtain call | The Project's name sign comes down on its strings and is stamped CREATED on the frame the celebration plays, with confetti fanning from behind it (at narrow widths the sign hangs inside the visible band and the troupe nods); at Ready a two-panel theatre curtain closes over the last scene and opens on the troupe standing in a line, the three bows (the upper body pitching about the hips) spell the chord, the rail re-stamps every check, and a unit points at the tour button. | `src/js/72-screens-review.js`, `src/js/74-screens-ready.js`, `src/js/57-scenes-journey.js`, `src/js/59-cheer.js` |
| The one-line hand-over | The troupe waves goodbye, the content steps out, the Pod lifts and detaches, and the window folds to an ink line that travels into the tour's first callout and slices it open while the Pod hops into the callout's dock. | `src/js/74-screens-ready.js`, `src/js/66-nier-window.js`, `src/js/80-tour-core.js`, `src/js/85-tour-nier.js` |
| Show Me, Pod takes the strings | Pod 042 launches from its dock in the callout, travels in nine held hops with trail squares, lowers a string onto the target and tugs it; a control frame reads "Pod 042 · In control" and "Press any key to stop", and hands back with "You have control". | `src/js/85-tour-nier.js`, `src/js/80-tour-core.js`, `src/css/41-tour-nier.css` |
| The chapter card and the HUD walk | Each new tour chapter gets a hung card on two strings while the spotlight moves on, and the bar's ink block walks from the old chapter's name to the new one's. | `src/js/85-tour-nier.js`, `src/js/16-nier-fx.js` |
| The debrief, then home | At the finish the callout folds and a results card opens from its line: objectives done, shown by Pod 042 (when Show Me was used), the layout put back or kept, and the time; the Pod flies home to its corner, and the card folds onto the landing note. | `src/js/85-tour-nier.js`, `src/js/16-nier-fx.js` |

Under Reduced Motion and the Still and Colors only presets every moment stands in its end state at once and the foley
is skipped, Quiet drops the Pod beats, low resource plays the instant paths, and input never waits: a key or a press
snaps a running performance to its end state.

### The four looks' hero moments (Phase 2)

Basic, Friendly, Glass and Retro have their own act card, wake and curtain call, each in its own world's materials
and working in its Light and Dark (`O55.famWindow`, `src/js/66-family-window.js`, styles in
`src/css/14-family-moments.css`, words in `src/copy.d/60-family-moments.json`). So there are five styles of each
moment, and **NieR always wins**: `O55.ui.skin` asks `O55.nierWindow` first, exactly as before, and asks the family
skin only when NieR's answer is falsy; every family hook also stands down at once while NieR Mode is painted (live
or the onboarding preview), whatever family is under it. The moments play on the same occasions as NieR's: the wake on
a fresh open on Welcome, the act card on the first forward arrival in a chapter this run (it claims the chapter's
one sting and plays it as it lands, and the rail is held in its old state until then), the curtain call on the first
forward arrival at Ready (it claims Ready's resolving sting).

| Look | The wake (Welcome, a fresh open) | The act card (a chapter's end) | The curtain call (Ready) |
|---|---|---|---|
| Basic (blueprint) | The window opens on a blank drawing sheet with a parallel rule parked above it. The rule sweeps down and the blank sheet travels with it, so the drawing appears exactly where the rule has passed; construction is drafted ahead of the ink (a dash-dot centreline running down, compass circles where the heads will be) and each construction line is drawn along the rule's edge as it passes the control bar, the heads and the floor. The construction fades, each string is tensioned (plucked, ringing on its helper's chord tone) as the rule leaves the floor, h0 waves and the welcome chord plays. | The old troupe nods; a title block is drafted over the stage (frame, then cells, the finished chapter in the big cell, Next: and Sheet n of 5), lands on the chapter's sting while a dimension line draws along the rail to the new chapter, is stamped DONE in orange with a felt thump, and is lifted off the stage like the cover sheet. | The cover sheet lifts on the troupe in a line; once the drawing has finished inking, three measured bows on the chord (the upper body pitched toward the audience about the hips, the round compass-circle head going down and its equator tipping, no overshoot), corner marks draw on in mid-sheet and the draftsman's rubber stamp, drawn in plan (its mount, chamfers and knob with centre lines), glides in from above and hovers over them with its face's outline dashed over it (the drafting sign of a hidden edge); it lifts a little in the rest and strikes on the resolving chord with a felt thump as the troupe straightens: the grid under it brightens once, two press lines spread from its edges, the sheet gives 1.5 px, and the stamp lifts away up and to the right, uncovering a big orange APPROVED impression with today's date across the sheet between the control bar and the heads (ink over the strings, a worn double border), with drafting-mark confetti; the rail re-stamps every chapter. |
| Friendly (paper theatre) | The window springs open on the closed velvet house curtain with the footlights on the stage lip in front of it; the lamps light one by one with plinks, the curtain gathers into the drapes and the paper troupe, lying flat on the boards, folds up one by one; h0 waves, the welcome chord. | The old troupe gives a squashy bow; a paper title card on a wooden stick pops up out of a slot in the boards just under it (That's a wrap!, the chapter, Next up:), lands on the sting with a paper thump and wobbles, its paper star spins, a paper pennant hops along the rail; the card ducks back into the slot. | The velvet gathers; each puppet gives a deep paper bow on the chord (the upper body pitched about the hips with a squash, the round head going down over the chest with its face tipped toward the boards, springing up past upright); on the resolving chord three big paper roses are thrown from the house, large as they pass the audience, turn over in the air and land across the front boards as the troupe steps back a beat; paper confetti, the rail's nodes pop one by one. |
| Glass (light lab) | The lab opens in the dusk (a thin cool slate in Light), the cores out; the switch clicks and the beam snaps on with its pool on the floor, the dusk lifts in 350 ms, a comet of light runs down each filament into its helper, whose core lights with a bell on its note, motes rise off the floor; h0 waves, the welcome chord. | The old troupe dips; a beam comes on from above and a frosted glass plate, hung under the control bar, rises into focus under it, a bright streak sweeps across the plate as it lights (Chapter complete, the chapter, Next:) on the sting, motes rise off its edge, a light pulse runs along the rail; the beam goes out and the plate floats away. | The frosted panes slide apart; each helper dips slowly and deep, its round head lowering into the light, as a spotlight comes on over it and its core flares; on the resolving chord the three spots swell together, the cores flare in one chord and light motes rise off the pools; the rail's nodes brighten one by one. |
| Retro (arcade) | Attract mode: PUPPET MASTER types on in pixel type over the stage, PRESS START blinks, PLAYER 1 with a coin blip, the screen wipes away in steps and each sprite spawns (a column of pixel blocks drops onto its spot, then the sprite and its string are there); h0 waves, the chip chord. | The old sprites duck a pixel step; an interstitial screen wipes down in steps: the chapter types on and CLEAR! cuts in on the chip sting, the rail's cursor hops to the new chapter, a BONUS tally counts up with blips and stars, the troupe's sprites jump, NEXT: and a blinking READY?, then it wipes away. | The pixel wall steps away; each sprite bows in two frames on its chip note (the head a block down, then the crown toward the audience with the hands together); on the resolving arpeggio they come up and hop two pixel steps, pixel confetti bursts, ALL CLEAR types on big between the sign and the heads, SETUP 100% tallies under the stage, h2 points at the pane and an arrow by its hand blinks toward the tour button; the rail's boxes blink one by one. |

Ready's end state is the one deliberate change to a settled screen: in the four looks the troupe stands in a line with
h2 pointing at the tour button (it was bow, wave, bow; Retro's h2 has a pointing sprite of its own, `aim`), each look's
emblem of its call is part of the composition (Basic's dated APPROVED impression, Friendly's roses, Glass's spotlights, Retro's
ALL CLEAR, score and arrow), and the narrow window's band frames the troupe's heads and shoulders with room to bow,
each emblem placed inside it (Basic's impression at half size above h2's pointing arm, Retro's ALL CLEAR across its top and the arrow by h2's
head, Friendly's roses along its foot with the third below h2's pointing hand, Glass's spots as they are). The emblem leads the finale: the celebration under
it is a smaller burst (18 pieces). The bows pitch the upper body: the Basic, Friendly and Glass helpers draw everything
above the hips in `.o55-up` groups (two per helper, in the drawing's own paint order, so every settled picture is
unchanged), which the call scales about the hip line while the legs stand. The head is a ball, not foreshortened: its
`.o55-hd` groups inside them (the head, Friendly's head shadow, the knot or loop on it) carry the inverse scale about the
head's centre, so it stays round, rides down with the torso and drops a little further (Basic 3 units, Glass 3,
Friendly 5), and the face on it (`.o55-fc`) slides toward the floor so the top of the head turns toward the audience
(Basic's equator about 4 units lower on a copy of its centre-line cross drawn for the call, Glass's eyes 3, Friendly's
eyes, cheeks and smile about 4, pressed toward the chin); Basic's neck folds away behind the head. The keyframes are
sampled from each bow's easing, so the head's scale is the body's exact inverse at every frame. Glass dips deeper than
before (`k` 0.72). The head's string point rides in the knot's group while it bows; Retro's string point and pixel knot
step down a block with each bow frame. Under the call Basic's troupe inks in 640 ms instead of 1050
(`.o55fm-inkfast`), so its first bow comes after every head is drawn. Reduced Motion and a low-resource computer show
every moment's end state at once: no wake, no card (the chapter's sting plays on the move, as before), Ready drawn in
its end composition with the previous quiet celebration rule. A key or a press snaps a running moment to its end
(the card's sting plays then if it had not landed); a screen change or the window closing ends one silently.
The moments use each look's own kit (`phase`, `string`, `land`, `bow`, `cheer`, `move`, `reveal`, `chapter`,
`checkpoint`, `celebrate` and `rest`); no take was added, so the kits, `TRIM`, `DUR` and the sound library are
unchanged.

### The NieR art family

`src/js/54-art-nier.js` draws the fifth art family, the unit marionettes: small android units in the YoRHa spirit,
original figures with no likeness to any game character. A shield-shaped head crossed by a rigid visor band is each
unit's only face (a scan notch at rest, joy chevrons, rest dashes); there is a high stand collar, one coat silhouette
per variant, square marionette pins and square hands, and hairline strings tied to ink diamond knots. You, the one
unstrung figure, sits on a broken column and steers the Pod-like floating control unit by a stepped signal; a small
machine lifeform watches from the snapped corner of the ruin stage. The installed NieR parts gate decoration and
motion only, never the unit look or its visor. The stage API is one line: `A.troupe.enter`/`powerDown`/`wake`/`bow`/`rise`/`point`/`wave`/`snap`, with `A.curtainCall`, `A.createdAct` and `A.peek` around it; each performance plays its own foley and goes straight to its end state under Reduced Motion.

### Sound

Under NieR the window and the tour play the NieR kit through the same `O55.sound` (see Sound above): the hung cards'
`quest` is a chapter's one sting in the window and the tour, the troupe's landings play `land` on chord tones with
stereo pans, the name sign sings the Project's name through `string`'s step climb, and Show Me has its own
`showPointer` and `showInterrupt` takes. Every look gained a four-note motif over the chapter chords (Basic E G B D,
Friendly G A B D, Glass C G D A, Retro C E G C, and NieR's A C E G), one note per chapter, resolving at Ready.

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

## Performance rules (2026-09-27)

The onboarding and the tour have to hold 60 fps on a computer without a GPU, not only on a fast one. They run over
a page of about 15,000 elements, and on that page every frame the main thread renders costs a full layerize pass
(about 4–8 ms on the VM) before anything is drawn. So the rules are about keeping the main thread out of frames:

1. **No `:has()` on `html` or `body`.** Such a rule made every DOM change anywhere in the app restyle the whole page
   (the demo pill's narrow-window rules, the tour's drop-zone rules). Mirror the state onto the element that needs it
   with an attribute (`data-o55-narrow`, the drop zone's `data-hot`).
2. **Continuous motion is transform or opacity only**, as CSS animations or Web Animations, so the compositor runs it.
   An endless animation of `stroke-dashoffset`, `clip-path`, `background`, `left`/`top`, `box-shadow`, a filter or
   `offset-distance` is serviced by the main thread every frame. Marching dashes are phases shown one at a time by a
   stepped opacity animation (the tour ring); a light travelling along a curve is a transform through points sampled
   from the curve (Glass filaments); a pixel running round a box is a square turning in whole quarter turns (Retro).
3. **JavaScript-driven motion is rare and throttled.** The marionette rig redraws its slow idle sway at 30 Hz and waits
   between redraws on a timer: a `requestAnimationFrame` callback alone makes the browser render a whole frame. It runs
   at full rate only while props arrive and for cheers and plucks. It reads every hook before it writes any string (the
   look page has five live scenes), and it writes an attribute only when the value changes.
4. **A new screen is built held and released a frame later** (`O55.motion.release`): its entrances are paused and
   unseen while the frame that styles and lays out the new DOM runs, so motion never starts inside a long frame.
5. **Read theme tokens once per look** (`O55.art.tokens` caches by the owning `data-theme` and the root's inline
   variables); a `getComputedStyle` in every scene render forced a style pass of the page.
6. **The app beneath the window holds still.** It is inert and dimmed, so its own loops are paused while the window is
   open. On a computer that composites in software (WebGL reports SwiftShader or llvmpipe, or the first opening draws
   slower than about 48 fps) the app is not drawn at all while the window is open: the scrim lies over the page's own
   ground (`data-o55-solid`, `O55.solid`). A fast computer keeps the dimmed live app.
7. **An owner operation the gate refused is not dispatched again until the gate's context changes.** A screen whose
   `mounted()` started a post-commit command before the commit refreshed, mounted and re-dispatched in an endless
   promise chain that froze the page.

What the app itself costs, and the onboarding cannot change: its status pulses (`@keyframes pulse`, `pm6-chat-pulse`,
`pmTabGlow`) animate `box-shadow` and keep the main thread rendering every frame on every page; without a GPU the
Friendly skin composites at about 17 fps and the Glass skin at about 3 fps (a full-window live backdrop blur over a
wallpaper), before any onboarding or tour motion. The tour runs in the app, so on such a computer it inherits those
limits; the onboarding does not, because of rule 6.

## Slint 1.18.1 portability (checked 2026-09-27 against the v1.18.1 sources)

The onboarding and the tour use no effect that Slint 1.18.1 lacks outright. There are no CSS or SVG filters (hover
and disabled states are colour mixes, glows are wide faint strokes or radial gradients, the glove's paper shadow is an
offset copy of its outline). There is also no backdrop blur, blend mode, mask, canvas or WebGL. What each technique
becomes in Slint:

| In the concept | In Slint 1.18.1 |
|---|---|
| Inline SVG art: paths, circles, rects, text | `Path` (`commands`, `fill`, `fill-rule`, `stroke`, `stroke-width`, `stroke-line-cap`, `stroke-line-join`), `Rectangle` (per-corner `border-radius`, border), `Text` |
| SVG linear and radial gradients | `@linear-gradient` / `@radial-gradient` brushes on `Path` fill and stroke and on `Rectangle` background |
| SVG `<pattern>` grounds (Basic grid, Friendly dots, Retro scanlines) | a small tile `Image` with `horizontal-tiling: repeat; vertical-tiling: repeat` |
| `shape-rendering: crispEdges` (Retro) | `Path { anti-alias: false; }` on whole-pixel positions |
| Group transforms, `transform-box: fill-box` | `x`/`y`, `transform-rotation`, `transform-scale-x/-y`, `transform-origin` |
| Opacity | `opacity` (layered, as in CSS) |
| CSS transitions (props gliding between beats) | `animate x, y, transform-rotation { duration: …; easing: cubic-bezier(…); }` |
| Two-stop keyframe entrances with a delay | `animate` with `delay`, or `states` with transitions |
| Multi-stop keyframes and endless ambient loops | pure functions of `animation-tick()` (for example `y: sin(animation-tick() / 2.6s * 360deg) * 4px`), or `animate { iteration-count: -1; direction: alternate; }` for two-stop loops |
| `steps(n)` timing (Retro) | `floor(t * n) / n` on `animation-tick()`, or a `Timer` stepping a property (Slint easings have no steps) |
| Springy overshoot | `easing: spring(bounce)` or an overshooting `cubic-bezier` |
| `stroke-dasharray` / `stroke-dashoffset` (Basic lines that draw themselves on, dashed connectors, marching dashes on Retro connectors and on the Basic and Retro tour ring) | Slint's `Path` has no dash properties: dashes are segments emitted into the path's `commands`, or small elements placed with `point-at()` / `angle-at()` (new in 1.18) and shifted by `animation-tick()`; a draw-on builds the path up to a fraction of its length |
| `clip-path: inset()` wipes (Retro title typing, the window's CRT open, scene wipes) | a clipping `Rectangle { clip: true; }` whose width or height animates; the registered `--o55fx-cur` ink-bar slide is a child `Rectangle` whose width animates |
| Static `clip-path: polygon()` shapes (Friendly's pennant rail nodes, the QR viewfinder's corner brackets) | `Path` shapes |
| The circular look reveal (a View Transition from the chosen tile) | `Window::take_snapshot()` of the old and the new look shown as `Image`s; the new one grows inside a `Rectangle { clip: true; border-radius: self.width / 2; }` centred on the tile, then the overlay goes |
| The tour's scrim with a spotlight hole, and its ring | a `Path` with `fill-rule: evenodd` and a rounded-rectangle hole; the ring is a stroked `Path` or a bordered `Rectangle`, its glow two wider faint strokes |
| The click shield around the hole | input routing, not drawing: four `TouchArea`s around the hole |
| `box-shadow` (window, callout, cards) | `drop-shadow-*` on `Rectangle` (one per rectangle; a second shadow is a second rectangle); inset shadows `inner-shadow-*` (Skia renderer) |
| `text-shadow` on the Glass primary label | a second, offset `Text` beneath |
| `color-mix()` | `.mix()`, `.transparentize()`, `.brighter()`, `.darker()` |
| Confetti (Web Animations) | per-particle properties computed from `animation-tick()` since the spawn time |
| Synthesised sound (Web Audio) | not a Slint feature: played from Rust; nothing visual depends on it |
| Typewriter text (`FX.type`: the untyped half transparent, a block caret over it) | a `Text` whose string is a `Timer` substring over a transparent full-string `Text`; the caret is a `Rectangle` |
| Boot log lines (`FX.bootlog`: a paper block revealing each line in steps) | paper `Rectangle`s stepping x in `floor(t*8)/8` |
| Fold to a line (`FX.fold`: the window or callout collapsing to its centre line) | `transform-scale-y`, or a clipping `Rectangle` |
| Line travel and hops (`FX.lineTo`, `FX.hops`: the line moving, the Pod's held-hop flight) | a `Rectangle`'s x, y and width stepped |
| Hung cards (`FX.banner` hang: strings, knots, the card lowered and hauled up) | a clipping `Rectangle`, 1 px `Rectangle` strings and `Path` knots |
| Pod lanes (`FX.pod.say`: the strip placed clear of actors and subjects; in the narrow layout a line the band has no clear place for is spoken in a pane-top lane between the band's foot and the title rule) | geometry from layout rects; hit tests remain only on the tour's anchor path (`covers()`, 5 points) |
| A NieR scene change's cast (the old troupe, You, the control bar and the strings stepping out whole on the slice's first frame, so the slice cuts only the set) | `visible: false` on the old cast's elements at that frame; the slice is the clipping `Rectangle` above |
| The reboot plate's clip (the in-window and page-wide cover growing from the control pressed) | a clipping `Rectangle` stepping x, y, width and height; the compositor version is an overflow box with a counter-transformed inner |
| Ready's theatre curtain (two parchment panels closing and opening in held steps) | two `Path` panels whose `x` steps by `floor(t * n) / n` on a `Timer`; the edges stop only where no unit stands, so no clip is needed |
| A unit's bow (the upper body pitching about the hips in two held steps, the head dropping below its knot) | `transform-scale-y` with `transform-origin` on the hip line, plus the head's `y`, both stepped by a `Timer` |
| Two-line clamp with balanced wrap (`line-clamp: 2`, `text-wrap: balance`) | `Text { wrap: word-wrap; overflow: elide; }` with a fixed height |
| Glyph decode (`FX.decode`: short labels scrambling left to right) | a `Timer` stepping the shown string |
| The four looks' stage overlay (`.o55fm-layer`: one SVG in the scene's own viewBox and slice over the art panel, for the hero moments' cards, rule, curtain, veil and attract screen) | an element over the art panel with the scene's scale and offset; its `Path`, `Rectangle` and `Text` children in scene units |
| A drawing acting about its feet (the act card's old troupe bowing, Friendly's fold-up from flat, the troupe stepping back as the roses land: `scale` on the prop's drawing group, fill-box, origin 50 % 100 %) | `transform-scale-x/-y` with `transform-origin` at the feet |
| The curtain call's bow in the four looks (the helper's upper-body groups, `.o55-up`, scaled about the hip line, a little wider, while the legs stand; Friendly's rises past upright; the head's groups, `.o55-hd`, counter-scaled about the head's centre so it stays round and drops further, the face, `.o55-fc`, sliding toward the floor; keyframes sampled from the easing) | the upper body as one child element with `transform-scale-y`/`-x` and `transform-origin` on the hip line, animated; the head a child of it with the inverse scale (`1 / k`, `1 / sx`) about its own centre and its `y` lowered, driven by the same animation tick, and the face a child of the head whose `y` animates |
| Retro's sprite bow (two extra sprite frames swapped in for the standing one, 90 ms apart, the string's point and the pixel knot a block lower each frame) and its two-step hop (one step on the narrow band) | `visible` toggled on the frames by a `Timer`, the knot's `y` stepped with them; the hop as `y` stepped by the same `Timer` |
| Basic's wake reveal (a blank sheet in the paper colour and the parallel rule moving down together over the drawing) | a `Rectangle` in the paper colour over the art panel whose `y` animates with the rule's |
| Glass's comet down a filament (a tail stroked with a linear gradient, a radial-gradient head, moved and turned along the string) | a `Path` with a `@linear-gradient` stroke and a circle filled with `@radial-gradient`, `x`/`y` animated, `transform-rotation` set to the string's angle |
| Friendly's stage slot (the card on its stick rising from behind a paper strip: a static `clipPath` above the strip) | a clipping `Rectangle` ending at the strip, the card a child whose `y` animates |
| Glass's spotlights at the rise (a cone swelling about its top, its brighter copy fading in and out) | `transform-scale-x` with `transform-origin` at the cone's top, and `opacity`, animated |
| Retro's Ready arrow blinking (opacity in steps, endless; still when the drawings' loops are) | `visible` toggled by a `Timer` |
| A parallel rule sweeping down, a card on a stick rising and ducking, a sheet lifted off, a plate floating away | `y` (and `opacity`) animated with `animate y { duration; easing }` |
| A rubber stamp pressed on (scale from 1.7 to 1 with opacity, one-shot) | `transform-scale-x/-y` and `opacity` animated |
| Basic's stamp at Ready (the stamp drawn in plan moved in and pressed by one keyframed transform: translate and scale, its height above the sheet as its scale; the face's outline dashed over it; the impression in the composition shown at the contact) | an element over the art panel whose `x`, `y` and `transform-scale-x/-y` animate along keyframes; the dashed outline a `Path` of segments; the impression's `opacity` stepped at the contact |
| The grid brightening under Basic's stamp (the sheet's own 20-unit lines near it as thin rectangles, each filled with a gradient that fades toward its ends and dimmed by its distance; the group's opacity up once and back) | thin `Rectangle`s with `@linear-gradient` backgrounds and their own `opacity`, under the troupe, one parent `opacity` animated |
| Press lines spreading from a stamp's edges (outlines scaled out about its centre while they fade, one way) | a bordered `Rectangle` with `transform-scale` and `opacity` animated |
| The sheet giving under the stamp (the art panel 1.5 px down and back, added to its own transform) | the art panel's `y` animated |
| A light streak sweeping across a glass plate (a static SVG `clipPath` of the plate's rounded rectangle; the streak's transform moves) | a clipping `Rectangle { clip: true; border-radius }` with the streak a child whose `x` animates |
| A score or bonus tally stepping digits (five to eight writes) | a `Timer` stepping the `Text`'s number |
| Rail markers (Basic's dimension line drawing on, Friendly's pennant hop, Glass's light pulse, Retro's cursor hop) and Ready's re-stamp | a `Rectangle` (or `Path`) whose `x`, width or scale animate; the hop as `y` keyframes; the re-stamp a `transform-scale` or `opacity` pulse per node with a delay |

## Status

M1a (landed): the whole onboarding works end to end in pilot art. M2: the Guided Tour, t1–t5 passing with zero
network requests and unchanged usage counters, reviewed in all eight themes, at 760 and 390 px, and on slow-motion
films. 2026-10-08: the NieR showpiece pass landed (the NieR checkbox and Adjust where a look is chosen, the NieR
window, the hero moments, the NieR tour, the NieR puppets, the sound pass and library); canon in DL-152, F3-598,
F3-599 and SSYS-043. Next: the onboarding review at the same depth and more, including a full logic audit (does every
path work, is the order right, does what is shown and offered follow from earlier choices), then art, motion and
sound polish, `REPORT.md`, `RESEARCH.md` and the hub wrapper.
