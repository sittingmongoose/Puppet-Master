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
- Home menu: "Reset Layout" (on today's Home: resets and reloads) and "Run Onboarding Again".
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
- The stand-in chat (a scripted conversation that opens every tab kind, plus an Agent activity card that opens things
  in the background): on by default, setting `chat.standIn` (`PM_HOME.settings`), no visible switch.
- Named layouts and Restore home layout (`PMW.applyNamed`, `PMW.resetLayout`): in the panels' own menus.
- The terminal's agent API (`PMT.agent`: open a terminal as an agent, type a command, ask permission, take over): used
  by the chat and the harness only; nothing on the page shows it off.

### F. Looks and motion
- Title-bar theme menu: family (Basic, Friendly, Retro, Glass, plus Fun looks), Light / Dark / Auto, NieR Mode row and
  Adjust NieR look (the Plug-in Chips editor with Play reboot moment).
- Settings: Reduce animations (`general.visual.reduce-animations`), sound effects, Glass background and transparency.

### G. Notifications
- PMConcept7 has no way to fire sample notifications. The notifications thread's lab (eleven moments: quiet, notice,
  attention, approval, permission, FileSafe, concern, failure, repeat, burst, setup prompt) lives only on its own
  review page, and its branch adds `PM_TITLEBAR_NOTIFY.demo(name)` to the page.

### H. Liquid Glass (on the pm7-liquid-glass branch, not yet in PMConcept7)
- A "Liquid Glass" status-bar item with its own popover (`#lg-demo-btn`, `#lg-demo-pop`) and Alt+Shift+L (on or off).

### URL switches (reload the page with them)
| Switch | What it does |
|---|---|
| `?o55=off` | Skips onboarding (also what headless checks use) |
| `?o55=fresh` | Starts as a new install: onboarding from the start in Basic Dark |
| `?o55=tour` | Starts the Guided Tour |
| `?o55=screen=<id>` | Opens onboarding at one screen (46 screens, e.g. `nas-key`, `online-signin`, `ready`) |
| `?o55scenario=<id>[+<id>]` | Sets the situation, combinations allowed |
| `?home=current` | Today's Home instead of the panels (A/B in the review copy) |
| `?pmh=off` | Hover engine off |
| `?pmu-live=off` | Usage demo readings start paused |
| `?pmu-flags=live:0,hour:0,roll:0,light:0,ramp:0` | Usage's open questions to Jared, one switch each |
| `?pmu-soft=1` / `=0` | Usage forced to the no-GPU profile, or never |
| `?pmu-prewarm=0`, `?pmu-frost=0` | Usage A/B measurements |
| `?usagegallery=1` | Opens Usage with the chart gallery |
| `?bindings=github,gitlab` | Gives the page a Project with those online services (picker review) |

### Keyboard
- Ctrl+Shift+D: the demo director. Alt+Shift+L: Liquid Glass on or off (Glass branch only).

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
5. Workspace: stand-in chat on or off, named layouts, reset the layout, an agent driving a terminal.
6. Usage: demo readings on or paused, Play the next hour / Back to now, the chart gallery.
7. Notices: the notification moments.
8. Looks: the five looks in light and dark, NieR Mode, Reduced Motion, sound.
9. Reset: three sizes. Progress (onboarding, tour, situation); Workspace (the panel layout back to default); Everything
   (all of the above, the saved layouts, dashboards, chat column, terminal and Usage settings), shown item by item
   before it runs, then a reload into a fresh first run.
10. Switches: the URL switches above as toggles, with "Reload with these".

Ownership: the Studio is new files in the onboarding package (`src/js/9x-demo-studio*.js`,
`src/css/5x-demo-studio*.css`, `src/copy.d/75-demo-studio.json`) plus a rewrite of `90-demo.js` (agreed with
pm7-onboarding-art-glass, 2026-10-13). It calls onboarding and the tour through their public APIs and never restyles
them. Glass joins through pm7-liquid-glass's opt-in (asked).
