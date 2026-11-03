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
| Runs on | Its own computer, or view the project as if it worked on another (the same as Change view › Another computer) | `{cmd: 'ctx', on}` |
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
| The head line with Change view (another project, computer or device, or No project) | the top of Settings | 3.6 (NEW CANON) |
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
| `layer/rows.js`, `rows.css` | the end of the row (five options), the Changed mark (four options), lines under rows, the head line and Change view, the row menu (option D, right-click, long-press), the Projects folder row |
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
