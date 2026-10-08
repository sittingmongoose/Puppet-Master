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
| `src/js/50–57` | Art: scene system, four family prop libraries (Basic blueprint, Friendly paper theatre, Glass light lab, Retro arcade), scene compositions. |
| `src/js/60–62` | The window, components, flow helpers (phased owner operations, countdowns, QR drawing). |
| `src/js/65–74` | Screens by chapter: Welcome, Computer (Connect, Server, Restore), Project (begin, folder, NAS/SSH, name, start-like, keep safe, online copy, away, review, creating, protect), AI (providers, Free Models), Ready. |
| `src/js/80–84` | The Guided Tour: engine (spotlight, callout, bar, Show Me pointer, snapshot/restore, checkpoints), the Teacher chat adapter (local answers, Explain this reply simply), the Planning Wizard practice run, and the 18 steps; then NieR Mode's Pod 042 chat adapter. |
| `src/js/90–95` | Concept demo pill; boot, shims for the shell's existing callers, driver switches (`?o55=fresh|off|screen=<id>`, `?o55scenario=<id>`). |
| `src/css/` | Window, components, motion, art. Colours come from the live theme tokens. |
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
| `tools/tour_scenarios.mjs <out> [--only t1,t2] [--snaps]` | Tour acceptance by real CDP input: t1 every step by hand then Restore, t2 every action through Show Me then Keep, t3 Skip restores, t4 reload recovery, t5 missing target. Every run also checks that no raw copy key shows and that a settled callout never covers its target. |
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

The vocabulary is 43 events. An event a kit lacks falls back to an older one: `chapter` to `next`,
`reveal`/`sheet`/`reboot`/`nierOn` to `open`, `unsheet`/`nierOff` to `close`, `phase`/`copy`/`move`/`pod` to `tap`,
`found`/`save` to `success`, `warn`/`missing`/`glitch` to `error`, `callout` to `spot`, `pointer` to `pickup`,
`arrive` to `drop`, `checkpoint`/`quest` to `step`, `interrupt` to `back`, `decode` to `type`. `hover` is silent
outside NieR; an unknown event is dropped and logged.

Frequent events are pools of related variants drawn by a shuffle that never repeats the last one. Pitches follow
the journey: each chapter has its chord (Welcome I, Computer IV, Project V, AI vi, Ready I up an octave; the tour's
ask, workspace and plan chapters IV, ii and V, resolving to I at the finish; NieR its own modal chords), forward
steps climb the chord with progress, Back descends, and choices rotate through it. The first forward move into a new
chapter becomes a chapter sting automatically, unless the window has only just opened. `setContext` tells the music
where the journey is; `chapter: 'tour'` follows the tour's own chapter.

Several events in the same moment (one task, or within 70 ms) play the most important one; three pairs layer by
design instead: decode chatter under anything, a celebration's sparkles over commit or finish, and the Pod just
after callout, quest, chapter or step. Very frequent events carry a minimum gap between two of the same. Nothing
plays before the first trusted gesture.

The mute control mirrors the current Project's `general.interaction.sound-effects` (factory default on, DL-107); a
refused or unavailable write changes nothing. With no Project the control starts on as a session-only preview: it
writes and stores nothing, and the Project's own value wins at the commit and at every rebind (canon F3-520).

The NieR Menu sounds part plays through `O55.sound.synth`, so there is one AudioContext and the blips sit under the
same mute and gesture rule. The blips ignore synthetic clicks and anything inside the onboarding window or the tour.

`O55.sound.CATALOG` lists all 310 kit, event and variant takes with names, styles and durations; `preview` plays one
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
own control, every card returns to its place and size), Chat's persona, ELI5, thread and draft. A same-page resume
revalidates the current owner state; a reload without an owner-resolvable restoration basis stops at an explicit
recovery panel instead of claiming the earlier layout or unsaved draft was restored. A missing target offers Take me there. Onboarding's Ready screen hands over by turning its window
into the tour's first callout.

Measured with `tools/tour_census.mjs`: 14 meaningful actions, 7 of them in Planning (50 %), and 4.5 minutes at 200
words a minute, 52 % of it in Planning (the packet asks for at least half of both).

Native durable owner snapshot admission remains to be implemented; the browser fixture cannot recover an unsaved
composer draft from a bounded reference after a full reload.

Narrow windows: the bar wraps and keeps every control; Open Planning goes through the pages menu when the tab strip
folds; below the width where the workspace stacks its docks, dragging cannot reach any dock (the right dock's hit band
spans the whole width), so the dock step offers Move Chat to the top, which sends the same move command; below 600 px
the planning chapter tucks Chat away through its real command (the shell lets Chat cover the Wizard there) and brings
it back at the end.

Canon check: the onboarding carries F3-520's exact eleven-stage main graph and six-stage connect graph
(`src/js/40-stages.js`). The full-reload resume capability in F3-521 remains unverified until the native owner can
resolve a bounded restoration reference; scenario t4 must verify the concept's explicit recovery state instead.

<!-- NIER-ONBOARDING-TOUR-ART: the lead adds the onboarding NieR row, window skin, tour and puppet sections here -->

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
| `clip-path: inset()` wipes (Retro title typing, the window's CRT open, scene wipes) | a clipping `Rectangle { clip: true; }` whose width or height animates |
| Static `clip-path: polygon()` shapes (Friendly's pennant rail nodes, the QR viewfinder's corner brackets) | `Path` shapes |
| The circular look reveal (a View Transition from the chosen tile) | `Window::take_snapshot()` of the old and the new look shown as `Image`s; the new one grows inside a `Rectangle { clip: true; border-radius: self.width / 2; }` centred on the tile, then the overlay goes |
| The tour's scrim with a spotlight hole, and its ring | a `Path` with `fill-rule: evenodd` and a rounded-rectangle hole; the ring is a stroked `Path` or a bordered `Rectangle`, its glow two wider faint strokes |
| The click shield around the hole | input routing, not drawing: four `TouchArea`s around the hole |
| `box-shadow` (window, callout, cards) | `drop-shadow-*` on `Rectangle` (one per rectangle; a second shadow is a second rectangle); inset shadows `inner-shadow-*` (Skia renderer) |
| `text-shadow` on the Glass primary label | a second, offset `Text` beneath |
| `color-mix()` | `.mix()`, `.transparentize()`, `.brighter()`, `.darker()` |
| Confetti (Web Animations) | per-particle properties computed from `animation-tick()` since the spawn time |
| Synthesised sound (Web Audio) | not a Slint feature: played from Rust; nothing visual depends on it |

## Status

M1a (landed): the whole onboarding works end to end in pilot art. M2: the Guided Tour, t1–t5 passing with zero
network requests and unchanged usage counters, reviewed in all eight themes, at 760 and 390 px, and on slow-motion
films. Next: the onboarding review at the same depth and more, including a full logic audit (does every path work,
is the order right, does what is shown and offered follow from earlier choices), then art, motion and sound polish,
`REPORT.md`, `RESEARCH.md` and the hub wrapper.
