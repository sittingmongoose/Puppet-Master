# Demo Studio (PMConcept7)

One Demo Studio gathers every demo control of PMConcept7 behind the status bar's bottom-left "Concept demo" item
(Jared, 2026-10-13: "finish bringing in the different demo controls into one system", modelled on the Demo Studio of
`Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html`, with Run onboarding and Start
guided tour in it). It is concept scaffolding, never part of the product. This file records what it gathers (the
inventory taken on main d6afa4b281 before the Studio was built) and how it is put together.

## Inventory: every demo control in PMConcept7 today (main d6afa4b281)

PMConcept7 has demo controls in eight places, plus URL switches and two keyboard shortcuts. Only the first is easy to
find.

### A. The "Concept demo · Opus 5.5" item (status bar, bottom left)
Source: `Concepts/onboarding/opus-5.5/src/js/90-demo.js`, styles in `src/css/12-components.css` (157-176), docked
into the status bar by the Home layer (`Concepts/home-redesign/src/panels/js/50-pageshell.js`, `css/20-shell.css`).
A small menu titled "Try a situation" with:
- 17 situations (the pretend world onboarding runs against), one at a time: Fresh computer, Returning user, Home NAS
  already runs Puppet Master, Flaky network, GitHub name taken at creation, A key already works with Home NAS, No SSH
  keys on this computer, Home NAS ID changed, Wrong NAS password first, Home NAS refuses the key once, Read-only NAS
  folder, Claude not installed, Claude installed (signed out), Copied account unavailable here, AI on a remote
  Server, No AI account anywhere, Low-resource computer. Picking one restarts onboarding.
- The fixtures also have an 18th situation the menu never lists: "Key added by hand is not there yet"
  (`selfKeyMissing`). Situations can be combined (`fresh+flaky`), but only through the URL.
- Restart onboarding.
- Reset everything: clears onboarding progress, the tour's progress and the situation, then opens onboarding as a new
  install. It does not reset the saved panel layout, saved named layouts, dashboards, the chat column, terminal
  settings or the Usage page's boards and readings (the known gap).
- The copy has a "Start the Guided Tour" string (`demo.tour`) that no control uses. The item hides while the tour runs.

### B. Onboarding and Guided Tour entry points outside the demo item
- Home menu: "Restore home layout" (restores the panel layout without reloading; open tabs stay open) and
  "Run Onboarding Again".
- Settings › Settings Home › Essential setup: Run Onboarding Again, Resume the Guided Tour (only when there is one),
  Start the Guided Tour over.
- Settings search "Restore home layout" (`general.startup.reset-home-layout`): Reset the Home layout, no reload.
- Two title-bar chips: "Continue setup" (onboarding closed early) and "Resume the Guided Tour" (a tour interrupted by
  a reload).
- APIs: `PM_O55_ONBOARDING` (= `PM7_ONBOARDING_CINEMATIC`): open, replay, resume, scenario(id), plan, snapshot.
  `PM7_GUIDED_TOUR`: start, resume, restart, resumable. Chapters: Ask and understand, Make the workspace yours, Plan
  before building (20 steps).

### C. The demo director (hidden: Ctrl+Shift+D)
Source: the base page's demo engine (`PM_DEMO`, script `pm6-js-demo-engine`). A small unstyled box in the bottom
right titled "Demo director":
- Play or pause the story's virtual clock, speed 1x, 2x, 4x, the clock readout.
- Jump the story forward to one of five points: Wizard done and plan approved; Compiled, run executing; Run #47
  complete; PR #88 merged; Published to Unraid. (One way: a jump fills in everything before it.)
- Reset (reload), and the last eight story beats.
The tour pauses this clock while it runs.

### D. The Usage page's demo readings
Source: `Concepts/usage-redesign/src/js/15-film.js` (`PMU.live`), `36-charts-gallery.js`.
- "Live" mark in the Usage header: demo readings change about every 6 seconds; click to pause or resume. Its menu
  has "Play the next hour" (the demo clock runs an hour ahead, two demo minutes per tick) and "Back to now".
- A hidden chart gallery (every chart in every state): `PMU.charts.gallery()` or `?usagegallery=1`. Nothing links to it.

### E. The Home workspace
Source: `Concepts/home-redesign/src/panels/**`.
- The scripted stand-in chat that opened every tab kind before the 5.6 Pro chat port, with its `chat.standIn` setting
  and its Workspace row here, was removed on 2026-10-23 (DL-233). The assistant chat's own controls open the panels
  (section I), and Agents open things plays the six background opens its Agent activity card had.
- Named layouts and Restore home layout (`PMW.applyNamed`, `PMW.resetLayout`): in the panels' own menus.
- The terminal's agent API (`PMT.agent`: open a terminal as an agent, type a command, ask permission, take over): used
  by the chat and the harness only; nothing on the page shows it off.

### F. Looks and motion
- Title-bar theme menu: family (Basic, Friendly, Retro, Glass, plus Fun looks), Light / Dark / Auto, NieR Mode row and
  Adjust NieR look (the Plug-in Chips editor with Play reboot moment).
- Settings: Reduce animations (`general.visual.reduce-animations`), sound effects, Wallpaper and Glass transparency.

### G. Notifications
- PMConcept7 has no way to fire sample notifications. The notifications thread's lab (eleven moments: quiet, notice,
  attention, approval, permission, FileSafe, concern, failure, repeat, burst, setup prompt) lives only on its own
  review page, and its branch adds `PM_TITLEBAR_NOTIFY.demo(name)` to the page.

### H. Liquid Glass
- Glass always uses Liquid Glass with a wallpaper. The Studio keeps its graphics-card/processor and wallpaper controls.
- The old material switch, `?lg=off` and Alt+Shift+L are retired. `PM_LG.set` off/null requests keep Liquid Glass on.
- Without a Studio host, the Liquid Glass status popover keeps Look, Path and Motion controls.

### I. The assistant chat (the 5.6 Pro chat, ported in on 2026-10-22, D26 and D27)
The chat brought its own lab Demo Studio (a header chip opening a dialog, `Concepts/chat-assistant-concepts/5.6 Pro/app.js`
`renderDemoDialog`): curated recipes and a theme list, the NieR Mode section, a working-activity and motion-voice pair, seven
take families, 22 recorded-example sections that the feature modules chain onto `PM56_REPAIR_DEMOS.gallery`, Assistant
refinements (27) and Feature demonstrations (7), eight trigger groups (95 triggers) and Reset all. The full inventory, with
what each control does and whether it is product demo content or lab-only, is
`/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/DEMO-INVENTORY.md`. In PMConcept7 the lab chip is gone (hosted
mode) and everything that shows a product behaviour moved into this Studio's Chat section: 55 recorded examples in 18
feature groups, 93 triggers and 34 single-surface demos as 127 moments in 12 groups, the seven take families, recipes and
the motion voice as lab pickers (never persisted), and Reset the chat demo. Dropped: the theme list and the NieR section
(Looks owns them), Edit and branch and Restore from point (each only toasted what it would do), the dialog's drag and
resize. The lab-only workspaces the examples open (`order-export:`, `b16-work:`, `b17-work:`, `bsd12:`,
`eli5-evidence:`) stay and open through the Home panels like any other chat tab: each explains its feature and the
recordings press controls inside them.

### URL switches (reload the page with them)
| Switch | What it does |
|---|---|
| `?o55=off` | Skips onboarding (also what headless checks use) |
| `?o55=fresh` | Starts as a new install: onboarding from the start in Basic Dark |
| `?o55=tour` | Starts the Guided Tour |
| `?o55=screen=<id>` | Opens onboarding at one screen (46 screens, e.g. `nas-key`, `online-signin`, `ready`) |
| `?o55scenario=<id>[+<id>]` | Sets the situation, combinations allowed |
| `?pmh=off` | Hover engine off |
| `?pmu-live=off` | Usage demo readings start paused |
| `?pmu-flags=live:0,hour:0,roll:0,light:0,ramp:0` | Usage's open questions to Jared, one switch each |
| `?pmu-soft=1` / `=0` | Usage forced to the no-GPU profile, or never |
| `?pmu-prewarm=0`, `?pmu-frost=0` | Usage A/B measurements |
| `?usagegallery=1` | Opens Usage with the chart gallery |
| `?bindings=github,gitlab` | Gives the page a Project with those online services (picker review) |

### Keyboard
- Ctrl+Shift+D: the demo director.

### What this browser keeps (what a real full reset must clear)
`pm.o55.onboarding.v1`, `pm.o55.tour.v1`, `pm.o55.tour-basis.v1`, `pm.o55.scenario.v1` (onboarding and tour);
`pm.home.panels:v1:<project>`, `pm.home.panels:quarantine:v1:<project>`, `pm.home.panels.saved:v1`,
`pm.home.chat:v1`, `pm.home.dashboards:v1:<project>`, `pm.home.settings:v1`, `pm.home.recent:v1`,
`pm.home.terminal:v1:*` and the terminal's saved-scrollback database (Home); `pm7:usage:live:v1` and the Usage boards
(`pm.usage.widget_layout.v1`, presets); `pmr.state.v1` (left rail); the activity bar order; Settings' project
values. The exact list is checked in a live browser before the Reset group is built.

## Design

One Demo Studio, opened from the same bottom-left status item (renamed "Concept demo" with the current situation
beside it). It rises out of the item as one sheet anchored to the bottom-left corner, in every look. Sections:

1. Start: the three big actions (Run onboarding, Start the Guided Tour, Reset) and what the world is set to now.
2. Onboarding: the situation picker (grouped, and combinable), open at any screen, run from the start.
3. Guided Tour: start, resume where it stopped, start over; the three chapters and their steps.
4. Story: the demo director (clock, speed, the five story points, recent beats), no longer a hidden shortcut.
5. Workspace: named layouts, reset the layout, agents opening things, an agent driving a terminal.
6. Chat (added 2026-10-22): the assistant chat's recorded examples, moments and takes (section I).
7. Usage: demo readings on or paused, Play the next hour / Back to now, the chart gallery.
8. Notices: the notification moments.
9. Looks: the five looks in light and dark, NieR Mode, Reduced Motion, sound.
10. Reset: three sizes. Progress (onboarding, tour, situation); Workspace (the panel layout back to default); Everything
   (all of the above, the saved layouts, dashboards, chat column, terminal and Usage settings), shown item by item
   before it runs, then a reload into a fresh first run.
11. Switches: onboarding start mode, the current situation, hover engine off, Usage readings paused, no-GPU Usage and
    the chart gallery, with "Reload with these".

Ownership: the Studio is new files in the onboarding package (`src/js/9x-demo-studio*.js`,
`src/css/5x-demo-studio*.css`, `src/copy.d/75-demo-studio.json`) plus a rewrite of `90-demo.js` (agreed with
pm7-onboarding-art-glass, 2026-10-13). It calls onboarding and the tour through their public APIs and never restyles
them. Glass always uses the Liquid Glass package with a wallpaper.

## How it is built

| Path | What |
|---|---|
| `src/js/90-demo.js` | The Concept demo item: `#o55-demo` (a child of `<body>`, the one the onboarding window leaves usable) and its toggle button, which the Home layer docks into the status bar (`Concepts/home-redesign/src/panels/js/50-pageshell.js`). |
| `src/js/91-demo-studio.js` | `O55.studio`: the model and every action. Each control calls its owner's public API and nothing else; an owner missing from the page makes its control say "Not on this page" instead of failing. |
| `src/js/92-demo-studio-ui.js` | The sheet: eleven sections, search, keyboard, look sync, the motion voices, the Start page's three scenes. |
| `Concepts/chat-assistant-concepts/5.6 Pro/pm7-port/js/50-demo-bridge.js` | `PM56_PORT.demo`, the chat's side of the Chat section (the port's demo lane): the lists come from the chat itself, and every run goes through the chat's own click path. |
| `src/css/50-demo-studio.css` | Structure and the Basic look. |
| `src/css/51-demo-studio-looks.css` | Friendly, Retro, Glass and NieR, and Reduced Motion. |
| `src/copy.d/75-demo-studio.json` | Every word (the `studio` key). |

Which owner each section calls:

| Section | Owner and call |
|---|---|
| Onboarding | `PM_O55_ONBOARDING.replay` and `.resume`, `O55.ui.open({ fresh, screen })`, `O55.fixtures.make` and `O55.store` `scenario` (a situation is a start plus twists joined by `+`; twists that describe the same thing two ways replace each other) |
| Guided Tour | `PM7_GUIDED_TOUR.restart`, `.resume`, `.resumable`; a chapter start restarts the tour and then calls `O55.tour.go` on the chapter's first step (internal to the tour, guarded) |
| Story | `PM_DEMO.clock` (play, pause, speed), `PM_DEMO.director.ensure`, `PM_DEMO.state.story`, `PM_DEMO.log`. No shortcut opens the Studio: Ctrl+Shift+D is left to Readiness & Doctor (Jared, 2026-10-14), and the engine's old unstyled director box it used to toggle is hidden, since this section replaces it |
| Workspace | `PMW.NAMED`, `PMW.savedLayouts`, `PMW.applyNamed`, `PMW.resetLayout`; Agents open things on `PM_HOME.open` for the terminal, browser and file and `PM56_PORT.open(id, { by, background })` for the plan, Crew run and agent chat the assistant chat draws (D8, each in the background); `PMT.agent.open` and `.run` |
| Chat | `PM56_PORT.demo`: `guided()` and `runGuided(id)` (the recorded examples by feature), `groups()` and `run(group, item)` (the moments), `families()`, `take`, `setTake`, `recipes`, `recipe`, `setRecipe`, `voices`, `voice`, `setVoice` (the takes), `reset()`, `showChat()`, `now()`, `avail()`. Each run brings the chat on screen on the Home page first (`PM_PAGES.go('dashboard')`, `PMW.chatCol.show()`), then clicks a hidden `<section class="demo-dialog"><button class="demo-trigger" data-action data-flow>` in `#pmOverlayRoot`, exactly as the lab gallery's buttons were clicked: modules chain `demo-trigger` and `reset-all`, two examples play their recording only from `.demo-dialog .demo-trigger`, and `recorded-play.js` stops the example already playing on that click. Without the chat on the page the section says so and its controls are unavailable |
| Usage | `PMU.live.pause`, `.resume`, `.hour.play`, `.hour.back`; `PMU.charts.gallery`; `PM_PAGES.go('usage')` |
| Notices | `PM_TITLEBAR_NOTIFY.demo(name)` when pm7-notifications' engine is on the page, else `window.toast` and `toast.important` with the same words; `PM_TITLEBAR_NOTIFY.clearAll` |
| Looks | `PM7_SETTINGS_TOME.setChromeThemeFamily` and `.setChromeThemeMode` (the title-bar menu's path, saved to the Project), `PM_NIER.set`, `PM_NIER_CHIPS.popup`, `PM12_KIMI.setSettingFromHost('general.visual.reduce-animations')`, `O55.sound.setMuted`; with Liquid Glass on the page, `PM_LG.set` and `PM_LG.wall` (and `data-lg-demo-host` on `<html>` so Glass's own status button steps aside) |
| Reset | Progress: `O55.tour.reset`, then onboarding as a new install in a Fresh computer. Workspace layout: `PMW.resetLayout`. Everything: every key this concept keeps in the browser (`pm…`, `o55…`, `widget_layout:`, `widget_presets:`, `home_workspace_layout:`, the 5.6 Pro chat demo's `pm56…` included, since that chat is ported in next, and the Studio's own place) and the terminal's saved-scrollback database, then a reload without the onboarding switches. Each size asks a second press within five seconds. |
| Switches | Builds the address from the page's own switches and reloads with it. |

The Chat section (2026-10-22): one rail entry after Workspace, so the rail stays one list and search reaches every item.
Its head carries Show the chat and Reset the chat demo; a run bar says which chat is on screen and holds a joined choice
row for the three views, in the order the brief set: Guided examples (recipe tiles, one block per feature; a click runs
the example and the Studio steps aside, as Run onboarding does), Moments (onboarding's screen rows in wider columns; a
click puts the chat in that moment and the Studio stays open beside it), and Takes (recipes and the seven families as
choice cards, the motion voice as a joined choice row; concept review only, never kept). Every item carries the chat's
own action and dataset as `data-chat-action`, `data-chat-flow` (or `-trigger`, `-scenario`, `-target`), which the
port's tests click, and its words are `studio.chat.*` in `75-demo-studio.json`, keyed by the bridge's ids; an example
the copy does not know yet keeps the chat's own words under More examples. The section reuses primitives every look
already styles (tiles, screen rows, choice cards, the joined choice row), so the five looks, light and dark, Reduced
Motion and the legibility floor carry over; `50-demo-studio.css` adds only the moments' column width, the one-line
take card and the head actions in the flow (Retro's wide title ran under them), and `51-demo-studio-looks.css` gives
the take card Glass's and Friendly's control radius, so the 32-36 px card never rounds into a capsule. The Start page's recipes gain two chat ones: Watch the assistant work (a live agent turn, the Studio stays
open) and Grill Me, then a Crew (the Wonderer and Grill Me recorded example, which plays on its own).

Looks: the sheet carries `data-pmds-look` (basic, friendly, retro, glass, nier) and `data-pmds-mode`. Basic is quiet and
exact; Friendly draws on the DS, 3DS, Wii and Wii U menus and iisu (a pinstriped ground, channel tiles with a white bezel
and a lit screen, buttons that sink); Retro is a phosphor terminal (a double rule, scanlines, reverse video, an arcade face);
Glass is one frosted plate (`data-lg-surface="menu"` for Liquid Glass); NieR follows
`/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/NIER-RULES-for-new-surfaces.md`, each touch gated by its
part. No pills, no side stripes, no emoji: every control is the look's rectangle and every mark a square. Hover is the
app's engine (`data-pmh`); labelled controls carry `data-pm-hover-exempt` so the page's hover tags do not repeat them.

Motion: each look has its own voice for opening (out of the item, bottom left), closing, changing section and the rail's
selection (`VOICE` in `92-demo-studio-ui.js`): Basic eases, Friendly springs and lands, Retro reveals in scan steps, Glass
rises with depth, NieR opens from a line in steps. Under Reduced Motion every one is a short fade with no travel.

Moving (Jared, 2026-10-14): the sheet is dragged by its header so it never blocks what someone wants to see. While it is
carried, its corner shows as a dashed outline that lights when a drop would put it back there. Its place is kept in
`pm.o55.demo-studio.v1` and pulled back inside the window on every resize. From the keyboard, the header's Move handle
takes the arrow keys (Shift for bigger steps) and Home; Put back (shown while the sheet is away) and a double-click on the
header return it to its corner with the look's own glide. In onboarding's narrow layout the sheet fills the window and
does not move.

Grounds: Friendly's sheet stands on Friendly's own ground (the dot grid and three pastel corner glows of its body and
chat), and NieR's page carries the app's faint grid with NieR Mode's background scene drawn behind it, as the app does.

Legibility (the landing's floor, 2026-10-14): every word the Studio paints holds 4.5:1 against the worst pixel under it, in
every look, light and dark, with and without Reduced Motion, at rest, under the pointer and with keyboard focus. Three text
tiers are each look's ink mixed toward an opaque ground (`--pmds-ref`), never the theme's faint muted grey. The same
holds for the words outside the text tree: the search field's hint sits on the muted tier, the dot in the status-bar item
on the secondary one, and Retro's drawn prompts in their chapter's tone, pressed darker on the light ground. Selected words get the Studio's own ink on an opaque
accent wash, and reverse video in Retro and NieR. A control whose owner the build lacks is shown as unavailable: the plain
ground with a dashed edge, greyed marks and muted words. It is not faded as a whole, and it does not light under the
pointer.
