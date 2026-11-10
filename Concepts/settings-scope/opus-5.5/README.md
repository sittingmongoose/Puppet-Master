# Settings that apply everywhere (Opus 5.5)

A concept over PMConcept7's real Settings page that shows the settings model Jared asked for on 2026-11-02: every setting
applies to every project and every computer by default; any one setting can be given its own value per computer and per
project; the row says when a value varies and when it was changed; the side panel is where you set it per place; managers
work the same way for what they hold; and copying settings brings providers and sign-ins, with Advanced to pick and
choose. It is built from `SETTINGS-PROPOSAL.md` and `BUILD-SPEC-settings-concept.md` (in
`/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/`). Nothing here is canon, and every value in
the demo is an example ([Demo only]).

PMConcept7 is not edited. `index.html` frames `../../PMConcept7.html?o55=off` and adds this folder's `layer/` at runtime.

## Open it

- **Concept Hub, or any local server** at the repository root: open `Concepts/settings-scope/opus-5.5/index.html`.
- **One file:** `python3 tools/build_standalone.py OUTDIR [PMConcept7.html]` writes `OUTDIR/settings-scope.html` (the
  page with the review strip; opens by double-click, about 38 MB) and `OUTDIR/settings-scope-app.html` (PMConcept7 with
  the layer and no strip, for the browser-check kit; review options come from the URL hash, for example
  `#psx=opt.end=origin,opt.changed=outline,ctx.project=tastebook,homenas=down,moment=11.1`).
- It opens on Settings › AI & Providers › Models with tastebook open on This computer: Everyday model reads
  "Changed · Varies", Thinking depth "Changed · This project".
- **Decided (Jared, 2026-11-03):** cards S1 to S16 as recommended. The page shows the decided design by default: the end
  of each row is the origin word (S5 A), and Changed is the word plus a 1px outline on the control (S6 A). The
  alternatives stay under the strip's **Compare options**.

## The review strip

Under the frame; not part of the design. Its third line says what is shown, which proposal section it is, and what is
NEW CANON.

| Control | What it does | Message |
|---|---|---|
| Run mode | **Regular** (every yes-point asks) or **YOLO** (the run mode `yolo`; an ordinary yes is skipped and the preview becomes the report, with Undo; the guards YOLO never skips still ask, and say so) | `{cmd: 'runmode', mode}` |
| Compare options | Opens a row with the alternatives (and turns on keys 1 to 4, 0 and C); closing it puts the decided design back | `{cmd: 'compare', open}` |
| End of the row (keys 1 to 4, 0) | A origin word (decided, S5 A) · B second mark · C sentence line · D More menu · Today's "?" | `{cmd: 'opt', end}` |
| Changed mark | A word and outline (decided, S6 A) · B word only · C framed row · Today | `{cmd: 'opt', changed}` |
| Compare board (key C) | The four end-of-row options and the three Changed options on the same four rows, each specimen in a real row's geometry, in the page's look | `{cmd: 'board'}` |
| Moments | 11.1 to 11.18 (11.5 with its two variants; 11.18 is What asks you: Always allow, git push and publish), plus Copy settings in Settings and in New Project. Each starts from a fresh demo | `{cmd: 'moment', id}` |
| Reset demo | A fresh world, the opening context, every sheet closed | `{cmd: 'reset'}` |
| Project | tastebook, harbor, loom, docs-site, legacy-app, experiment, garden-notes and recipe-app (they work on Home NAS), lighting-rig (Studio Mac), No project | `{cmd: 'ctx', project}` |
| Runs on | Its own computer, or view the project as if it worked on another (the same as the header's Change › Look at another computer) | `{cmd: 'ctx', on}` |
| You're using | This computer, Studio Mac, iPhone, Sam's iPad (a Member's device) | `{cmd: 'ctx', device}` |
| Home NAS | Answering or Not answering (moment 11.1) | `{cmd: 'ctx', homenas}` |
| Studio Mac | Answering or Not answering (moment 11.17's Finish) | `{cmd: 'ctx', studio}` |
| Look | All ten, through PMConcept7's own theme menu; the change lands where the look lives, silently | `{cmd: 'look', look}` |
| Window width | Full, 1920, 1280, 1024, 860 | the frame's width |
| Reduced motion | Stands for the operating system's setting: `html[data-motion="reduced"]` is kept on after each paint | `{cmd: 'motion', reduced}` |

The layer answers `{source: 'psx', type: 'ready' | 'state' | 'look-done', state: {opt, ctx, look, moment}}`. Until it
answers, the host sends `{cmd: 'hello'}` every 300 ms. The Concept Hub's look and Reduced Motion reach the frame as in
projects-redesign.

## What it shows, and where it is NEW CANON

| What | Where | SETTINGS-PROPOSAL |
|---|---|---|
| The settings ladder: default, Everywhere, the computer (or the device for screen rows), the project, owner rungs; one resolver (`PSX.resolve`); more careful wins on safety rows; a computer's own value caps a project's on limit rows | every row, panel and manager line | 1.1 to 1.4 (NEW CANON) |
| Every Settings row follows the ladder, not only the demo rows: 842 inventory rows are adopted (the fix pass keeps 14 fields of one thing off the ladder and no longer takes the token-budget rows for credentials) with a rule from 1.3 (a concept heuristic over id, control and scope; the reviewed classification is a Plans task) | every page | 1.3 |
| The end of the row: origin word, Details, Varies, This project, Home NAS, Studio Mac, Each account | rows | 2.3, 2.4, S5 |
| Changed: the word at 11.5px and a 1px outline on the control | rows | 2.2, S6 |
| Lines under a row: Limited to 3 on This computer; For safety, Home NAS's Plan only is used; May differ in garden-notes · Home NAS isn't answering | rows | 2.3 |
| The header: “tastebook on This computer” and Change (another project, look at another computer or another device’s screen, all the differences); the viewing state, framed, with Stop viewing (Jared #11, 2026-11-10) | the top of Settings | 3.6 (NEW CANON for looking at another computer or device; the header’s design is the concept’s) |
| The panel: Close as a word; Now with where it comes from and one action named for what it does; Where it applies (sentence, groups, only what differs, Change and Same as everywhere per line, + Set for a computer… and + Set for a project… menus with greyed reasons, power actions with previews); Choosing here changes; Recent changes; For experts' Can differ by and Kept on | the Details panel | 3.1 (NEW CANON SSYS-063) |
| Change it where it comes from, and the one note: "Saved for everywhere. docs-site keeps its own." · Only for tastebook · Undo; the first-change tip | after any change | 3.2, S4 |
| An everywhere change is checked against every project that follows it, and safety rows are previewed first | Switch when this much is left; Profile in use; FileSafe | 1.7 |
| Things: home, where it's available, a project's switches, a version for one project, a state on each computer | Providers & Accounts (accounts), MCP servers (list rows and each server's panel) | 4.1 to 4.3 (NEW CANON SSYS-061) |
| Keeps your settings, recent setting changes per computer, and moving the settings home | Servers | 7.2 (NEW CANON SRV-016) |
| The Projects folder, each computer's own | Servers › Home & Location | Split v2 11.2 (NEW CANON row) |
| Copy settings: what makes a project different, its own things, its AI accounts with readiness on the destination computer, Advanced pick-and-choose, Keep them fixed, Never copied | Settings Transfer; the New Project moment | 5.1 to 5.6, S9 to S11 (NEW CANON MA-074) |
| No queue when Home NAS isn't answering; Just this computer for now; back-online review | moment 11.1 | 7.5 |
| Conflicts, two setups joining, a new computer, the assistant's narrow writes, a limited device, an update's new defaults, rules a project brings, the fold, first start, the Differences view, a batch that can't finish | moments 11.2 to 11.17 | 7.6 to 7.14, 3.6, 4.4, 5.6, 8 |

## How it reaches PMConcept7

`index.html` adds, in order (its `STEPS`, which `tools/build_standalone.py` parses): `layer/core.css`, `world.js`,
`resolve.js`, `guard.js`, `feed.js`, `rows.css`, `rows.js`, `panel.css`, `panel.js`, `managers.js`, `copy.js`, `moments.js`,
`board.js`, `boot.js`.

| File | What |
|---|---|
| `layer/world.js` | `window.PSX`: helpers, the layer's storage (`psx.settings-scope.v1`, review options and the one-time tip only, with an in-memory fallback), the demo world (`PSX.W`, `PSX.freshWorld()`), world transactions with History and Undo, the note, sheets and menus |
| `layer/resolve.js` | `PSX.resolve(id, ctx)` and `PSX.selfTest()` (BUILD-SPEC section 5's 16 cases, and 6 more from the fix pass: an AI service's own value, Changed under a limit, an adopted safety row and an adopted limit row) |
| `layer/guard.js` | The one guarded write path, `PSX.write` (first start, the device in use, the level, the value's type and range, the writer answering, pairing; atomic or a batch that names what it couldn't change), `PSX.simulate` (what a transaction does to every project, deletions included), `PSX.confirm` (each yes-point in Regular and YOLO), and the command list with each command's Plans owner or named gap |
| `layer/feed.js` | adopts every inventory row; feeds each project's resolved values into `PM_SETTINGS_PROJECT_SNAPSHOTS` and switches project with `PM_ACTIVE_PROJECT_ID` + `PM12_KIMI.reloadProject()`; pushes single values with `PM12_KIMI.setSettingFromHost`; the router that routes a person's change to its level; the note's words; the hold on the engine's own Saved toast |
| `layer/rows.js`, `rows.css` | the end of the row (five options) in a fixed column, the Changed mark (four options), lines under rows, the header and its Change menu, the row menu (option D, right-click, long-press), the Projects folder row |
| `layer/panel.js`, `panel.css` | the panel's blocks, the 1.7 checks and previews, the inline Change editor, Esc order |
| `layer/managers.js` | Providers & Accounts, MCP servers, Servers |
| `layer/copy.js` | the copy-settings sheet, with Split v2's strings (`tools/diff_strings.py` diffs them) |
| `layer/moments.js` | the 17 moments and History |
| `layer/board.js` | the compare board |
| `layer/boot.js` | start, host messages, looks, keys, the URL-hash config |

### The hooks, checked at a80334c086 (`Concepts/PMConcept7.html`, 33.4 MB)

Every line number in BUILD-SPEC section 3 matched the built page; nothing had moved. In the source, `kit.d/10-values.js`
draws the rows, `kit.d/30-inspector.js` the panel, `kit.d/45-scoped.js` the per-thing rows.

| Hook | Found | Used for |
|---|---|---|
| `button.o55-about` (17 in the built page) | rows, scoped rows, compact fields, provider fields | the end word; its `data-*` and `aria-expanded` stay the engine's |
| `aside.detail-inspector`, `PM51.syncInspector` | `kit.d/30-inspector.js:147` | the wrap takes the layer's blocks out before the engine's patch and puts them back after, restoring focus by `data-psx-key`; a MutationObserver catches the first open |
| `PM12_KIMI` (built page 116684) | `getState, setState, reloadProject, setSettingFromHost, navigate, renderApp, dispatchAction` | the write path and the project switch |
| `PM_SETTINGS_PROJECT_SNAPSHOTS` (110766) | read before localStorage while `PM_SETTINGS_REGISTRY` is absent (it is) | the feed; `getState().settingsProjectionSource` reads `supplied_concept_fixture` |
| `PM_ACTIVE_PROJECT_ID` (110676) | any id loads; the title bar's label is set by the layer for projects not in its menu | every demo project, live |
| `PM_TITLEBAR_NOTIFY.push` (showToast reads it on every call) | wrapped | a Saved toast for a demo row is held 400 ms and dropped when the router routes that change: one note per change |
| The in-place patcher (`commitSettingsShell`, `O55C_FOREIGN`) | patches nodes and keeps unknown classes and attributes | every node the layer inserts into Settings carries `data-o55-foreign`, and every decoration re-checks that it is still drawn |
| `PM51.panel` (drawers), the kit's `.pm51-popout.pm51-menu` on `document.body` | the MCP server panel; Home NAS's More menu | the layer's sections and the "Keep your settings on another computer…" item |

**Fallbacks used.** `PM_ACTIVE_PROJECT_ID = 'none'` gives the engine's ephemeral context, which refuses every write, so
for **No project** the engine is given a hidden stand-in project, `psx-none`, and the title bar reads "No project"
(concept mechanic: the product never uses a stand-in project id). First start (11.15) uses the engine's real `'none'`.
`PM7_SETTINGS_TOME.dispatch` is never used to write a value.

**The Changed outline's real classes** (BUILD-SPEC 7.3): a list is `span.pm51-dd > button.pm51-dd-trigger`; a number
`label.o55-num > input.text-control`; text and paths `input.text-control` (`div.path-control.o55-path` for paths); a
switch `button.toggle[role=switch]`; segmented choices `.segmented` or `.o55-seg`; chips `.o55-chips button`.

## Checks

`Concepts/pm7-tools/browser-check/checks/settings-scope.check.mjs` (it skips on a page without `html[data-psx-layer]`):

```sh
python3 Concepts/settings-scope/opus-5.5/tools/build_standalone.py $OUT
browser-check run Concepts/pm7-tools/browser-check/checks/settings-scope.check.mjs --set page=$OUT/settings-scope-app.html --set lookShots=1
```

It asserts no pills, no side stripes, text at least 11px, labelled buttons, a word with every status mark, no viewport
`@media`, plain words; the 16 resolver cases and their end words; routing, the note, Only for tastebook, the held toast;
Home NAS away queues nothing; the panel through five changes; Esc order and focus; the copy sheet's totals and Tab
trap; the board in all ten looks; 1920, 1280, 1024 and 860 wide; Reduced Motion; every moment.
The fix pass added two parts, `--set only=fixes` (one guarded write path on every path, what Copy commits, Differences,
batches, the settings home, the editor, the note's keyboard Undo, fresh moments, the MCP version, the board's geometry,
the classification report) and `--set only=yolo` (each yes-point in Regular and in YOLO, Always allow, git push and
publish).
`python3 tools/diff_strings.py` reports the copy sheet's strings against Split v2's.

Jared's review fixes have their own check file in this folder, run with the kit's config:

```sh
browser-check run Concepts/settings-scope/opus-5.5/tools/checks/feedback.check.mjs \
  --config Concepts/pm7-tools/browser-check/browser-check.config.mjs --set page=$OUT/settings-scope-app.html
```

`--set only=rows|shake|head|where|copy|always` runs one part. `rows` measures every section's control and end-word x
on Models and Services for the decided design and every Compare option, at Full (a 2560 window), 1920, 1280, 1024 and
860, in Basic Dark, Retro Light and NieR Dark. `shake` reads every painted frame while a switch changes (the switch,
the end word, the row, the next row, the header, the Changed mark, any “?” on screen, and the browser's own layout
shifts). `head` measures the header's box, Change and the page under it in six views. `where` builds Where it applies
for every adopted row and opens one panel of each kind. `copy` and `always` cover the guided-flows rows.

## Jared's review fixes (2026-11-10)

Jared reviewed the concept on 2026-11-09 (`/mnt/Cursor/share/puppet-master/2026-11-09-settings-feedback/FEEDBACK.md`,
items 3, 4, 8 and 11) and the guided-flows check named what this concept must change (`GUIDED-FLOWS-CHECK.md`,
"Changes for P": Copy settings and Always allow). The report with before and after pictures is
`CONCEPT-FIX-REPORT-A.md` in that folder. Checks: `tools/checks/feedback.check.mjs` (below).

- **#3, rows line up.** The end of the row is a fixed column (`--psx-end-w`, 124px; 172px while “Show where each setting
  comes from” is on), so every control in a section ends at the same x whatever its end word says, and a row with no
  end word keeps the column empty. Lists take one width (`--psx-list-w`, 220px; a wider list keeps its own), so their
  left edges line up too. End words start at one x. Changed option C (framed row) takes its padding back with a negative
  margin, so a framed row's control lines up with the rest. Narrow Settings keeps the base page's own narrow layout
  (copy and end word on the first line, the control under the copy) with the fixed end column.
- **#4, toggling shook the page.** On bare PMConcept7 a toggle moves nothing. With the layer, the base page redraws a
  changed row and puts its round “?” back into the end button; the layer's word came back on a later frame, so the
  control could jump 40px sideways and back, and the base page's Changed mark went on, off (the layer's world had not
  taken the change yet) and on again. Now: the end column is fixed, the rows a mutation touched are decorated again
  inside the observer callback (a microtask after the base page's change, before any paint, with no row cap), and
  while a change is on its way (the base page holds a value the layer hasn't routed yet) Changed stays as the base page
  drew it. A row never shows Changed twice (the old build showed “Changed · Changed” after a redraw, as in Jared's
  screen 02).
- **#8, Where it applies is the same everywhere (Jared chose “Keep per device”).** Every panel has the same three parts
  in the same order: Everywhere, then Computers (Devices on a screen row), then Projects. A part a row doesn't offer
  keeps its place with one plain line (“Not per project: it belongs to each computer.”). Screen rows list Devices with
  one line: “This is about the screen in front of you, so it can differ per device.” (sound and keyboard rows say
  sound and keyboard). The sentence at the top says only what is in use. An account's or a service's own row (Each
  account) keeps the base page's list of each one's value and takes the same three parts. Libraries (Your own themes,
  Start custom themes from, Sound library, Add a sound) were on the device rule and offered “Set for a device”; they
  are the same everywhere now (`your_library`). Where the base page shows its own scope next to the layer's, the
  layer's wins: the MCP server panel's “Where it applies” line and the server list's scope word are hidden. No row
  keeps the base page's own sentence any more: rows the reference doesn't list (Animation speed, Accent color,
  Autosave and the rest) are adopted at start with the same rule; rows the reference marks only “for a single run”
  follow the ladder for the value each run starts with, and say a run can choose its own; the look's details (Light or
  dark, the wallpaper, glass, the colour scheme, the chat layout) say they follow Theme, with Open Theme; keys and
  sign-ins say they stay on the computer where they were entered; a row that belongs to one thing takes the per-thing
  parts.
- **#11, the top of Settings.** One calm header names the Project and the Computer once: “tastebook on This computer”,
  with Change. Your own view is the open project on the computer that does its work, with your device's screen; Change ›
  Project opens another project (as the base page's project button did, which is hidden here, with the rail's
  “Project:” line). Looking at another Computer or another device's screen is the viewing state: the same line in the
  same box, framed and tinted, with the word Viewing and Stop viewing (before Change, so Change never moves). Nothing
  says “my view”. The header is one row of 32px in every view, so changing the view never moves the page. YOLO is a
  word in that row; notices that are not about the view (the settings home not answering, first start, a Member's
  device) are lines under it. Looking at another device's screen no longer repaints your own screen with that device's
  text size and look (the iPhone's 17px used to re-render the whole app): your screen keeps your own screen values, and
  each screen row shows the other device's value in the control's place, with Change (it opens Where it applies, where
  that device's line is changed).
- **Copy settings (guided flows 3.02-3.07, 3.12, 3.17).** The kind reads **Notifications & limits** (NEW CANON:
  Settings_System's P12 label). Keep them fixed adds only rows of the kinds you selected and never a row you unticked;
  a deselected kind stays deselected when Keep them fixed is turned off and on (NEW CANON: “freezes only eligible
  selected values”). Advanced lists the fixed rows under their kind, one tick each. A device-bound account gets the
  real `cannot_move` result, “Can’t be used on Home NAS”, with Split v2's reason, and stays the intended choice (NEW
  CANON: MA-074 and Settings_System's outcome list); in the New Project moment tastebook also uses a Copilot seat tied
  to This computer, which shows it. The account
  lines say only which accounts are copied, never a sign-in, key or token. Copy checks each account on the destination
  computer again at the moment it copies, and shows the preview again if one changed (NEW CANON: “a different Computer
  or account invalidates the readiness preview”). About its own files, Keep them fixed and Copy what it gets from its
  computer still start off. The stronger copy UI (folder, things, accounts, Advanced by kind, setting and thing) is
  kept.
- **Always allow (guided flows 8.03-8.04, moment 11.18).** Always allow opens under the step: you choose the exact
  pattern (three suggestions or your own, `*` matches anything) and its place; nothing is chosen for you, the preview
  says what the pattern matches and what still asks, and the rule is written only then. Everywhere is hidden, not
  greyed, for any host-dependent rule (a path, a folder, a script or program by its location), with one line saying
  why; the run now has a release script to show that. Ordinary YOLO git push and publish still run without asking and
  never become an Always rule (NEW CANON: Permissions_System's Always and YOLO rules).

## Fix round A-r1 (2026-11-10)

A blind review of the branch (`REVIEW-concept-A-r1-opus-high.md` in the share folder) found these; each is fixed:

- **The strip's script** died on two captions that used a plain apostrophe inside single-quoted strings (`index.html`
  11.5 and 11.16); every caption now uses ’, and `feedback.check.mjs --set only=strip` opens `settings-scope.html`,
  picks Moments › 11.18, Compare options and a window width, and fails on any uncaught error.
- **The viewing header** cut the device's name at 1280 and 860. The header now has shorter wordings, tried in order
  until one fits with nothing cut: "harbor on Studio Mac, with iPhone’s screen", "…, with iPhone", the same without
  the word Viewing (the frame, the tint and Stop viewing still say it), then "harbor · Studio Mac · iPhone". It refits
  when the window changes; the box never changes size.
- **The end column** is sized from the widest end word the concept can show, measured in the current look's own font
  once per look (Retro's monospace cut "Each AI service" at 124px). Every control in a section still lines up.
- **Libraries** (Your own themes, Sound library, Add a sound) open a library; they are not values. Their panel says
  "Your library · Kept with your settings", and Where it applies has the three parts with their reasons only, with no
  value line and no Change. "Start custom themes from" has a value and stays same-everywhere.
- **Always allow:** whether Everywhere is offered comes from the step's own target (a script or a folder) as well as
  from the pattern, so your own pattern never brings it back on the release step; a bare `*`, and a shell or an
  interpreter followed by `*`, are flagged broad. Each ask also offers **For this session** (Permissions_System 6.1
  keeps deny, once, for this session and always): it lasts until the chat session ends and makes no rule; a deletion
  on the remote is answered one at a time.
- **Where work runs:** the panel's Now card, the Change menu and the project lists say "Auto → This computer" (each
  Project has a default computer and its work is Auto by default, SIR-056 on `plans/where-work-runs-20261109`), not
  "works on This computer". The Change menu's search reads "Find a project, computer or device".
- **The New Project moment** puts tastebook's accounts back when its sheet closes.
- **The strip's Look** now always stores the look it paints. Choosing only light or dark (the family already chosen)
  happened in the theme menu, outside Settings, so the router never heard it and the next change of project or view
  painted the old look again. `setLook` now writes the painted look where the look lives.
- **Account switches on Services** redraw the whole Settings page on bare PMConcept7 too: that is the base page's
  (stream F's). `--set only=shake` now checks an account switch, with the layer and on bare PMConcept7, and moves rows
  into view by scrolling the Settings scroller itself, never with `scrollIntoView`.

## Fix pass (2026-11-03)

Five reviews (`pass2/reviews/settings-full-{astra,sol}.md`, `REVIEW-settings-full-wonder.md`, `settings-{astra,sol}.md`)
and Jared's YOLO rulings. The full table of findings and outcomes is in `pass2/BUILD-REPORT-settings.md`, "Fix pass".

- **One write path.** Every write (a row, the panel, the power actions, Differences, Copy, batches and Finish, the
  back-online review, Undo, the managers' things, the moments) goes through `PSX.write`, so the safety look, a Member's
  device, first start, a computer that isn't answering and the value's own range hold on every path.
- **YOLO.** The strip's Run mode shows each yes-point both ways: the assistant's everywhere change (11.10), safety
  previews, Make it everywhere and Use this everywhere, Copy, joining two setups (11.6), the back-online review, and
  Always allow, git push and publish (11.18). YOLO never skips: FileSafe off, a looser rule from someone else's
  repository, which computer keeps your settings, pairing and sign-ins, a path outside the project, a deletion on the
  remote. A project that can't take a change refuses it in both modes.
- **Copy commits what it previews:** the AI account choices (`W.uses`), Filesystem MCP as the project's own copy (never
  ready by copying), the persona's version, Figma's reach, and Keep them fixed (every setting the project may own, in
  the preview and the count). A source that changed since the preview is shown again, never copied blind.
- **The settings home** is one record (`W.home`): Move and Join change it, and the head line, Computers, For experts and
  every refusal name it.
- **Rows:** the reviewed classification of the rows the reviews named (`feed.js` `REVIEWED`), safety rows on the more
  careful rule, the token-budget rows no longer mistaken for credentials, `PSX.classReport()`; an AI service's own value
  decides for that service; Changed follows the value in use.

## Known limits

- **Supplied snapshots are read only to some engine paths:** with the feed on, PMConcept7's own "Restore project
  defaults" and the Glass wallpaper picker say the supplied snapshot is read only.
- **The Projects folder row** is the layer's own (not in the inventory); its panel is a Settings side sheet, not the
  Details panel.
- **Accounts open in place** in this PMConcept7 build (an accordion), so the account parts are added to the open account,
  not to a side panel. OpenRouter has no account entry in PMConcept7's providers data, so it shows only in the copy sheet.
- **PMConcept7's Servers page** draws its own example servers; the layer renames them to the demo world's (Home NAS,
  MacBook Pro) and adds Studio Mac through the manager's own state. Its Devices tab still lists PMConcept7's devices.
- **Counts:** tastebook has 11 settings of its own here, not Split v2's 13: its Theme, Everyday model and Profile in use
  would contradict BUILD-SPEC 4.4's world. harbor has 2, not 6.
- **The plain specimen row on the board is Speed or power**, not Text size: Text size varies by device in this world.
- **Reduce motion's operating-system part** is the strip's checkbox; a device's or project's own value is fed to the engine,
  which paints it.
- **YOLO is shown, not run:** the strip's Run mode stands for the chat's run mode; a person's own click in a sheet stands
  for an agent's request with a clear target. Real tool execution, pushes and publishing are simulated in 11.18.
- **The classification** of the 842 adopted rows is still a concept heuristic beyond the reviewed list; the reviewed
  classification of all 1010 rows is a Plans task (`PSX.classReport()` prints what this concept did).
- **"MCP server" and "language server"** keep their protocol names; only the work machine is renamed Computer
  (decision S1). Whether the product renames MCP's own word is Jared's call.
- **Glass transparency, the wallpaper and the Basic colour scheme** stay outside the ladder: the engine paints them on its
  own paths.
