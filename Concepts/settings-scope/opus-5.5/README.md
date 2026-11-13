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
  "Changed · Varies", Everyday building "Changed · This project" (main's one-model design retired Thinking depth, the
  example before the inventory alignment).
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
| Every Settings row follows Plans' inventory layering (`Plans/settings_inventory.json`, the per-row authority, SSYS-059): its places, Computer key, combine and the reasons for the places it doesn't offer. An owner-held row (`home: thing`) stays with its owner: no level, no Change, and a panel that names the owner (an action says it isn't a setting). The concept's own heuristic over id, control and scope decides only the rows the inventory doesn't list (`PSX.classReport()` names them) | every page | 1.3, SSYS-059 |
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
| `layer/world.js` | `window.PSX`: helpers, the host rule (`PSX.paths`, README table E2: the one answer to "is this pattern about one computer?"), the layer's storage (`psx.settings-scope.v1`, review options and the one-time tip only, with an in-memory fallback), the demo world (`PSX.W`, `PSX.freshWorld()`), world transactions with History and Undo, the note, sheets and menus |
| `layer/resolve.js` | `PSX.resolve(id, ctx)` (with `PER_ITEM`, each per_item row's owner rule, and `motionOr`, Reduce motion's OR) and `PSX.selfTest()` (BUILD-SPEC section 5's 16 cases, and 6 more from the fix pass: an AI service's own value, Changed under a limit, an adopted safety row and an adopted limit row) |
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

`--set only=strip|rows|shake|acct|head|where|detail|copy|always` runs one part. `rows` measures every section's control and
end-word x on Models and Services for the decided design and every Compare option, at Full (a 2560 window), 1920,
1280, 1024 and 860, in Basic Dark, Retro Light and NieR Dark. `shake` reads every painted frame while a switch changes
(the switch, the end word, the row, the next row, the header, the Changed mark, any “?” on screen, and the browser's
own layout shifts). Since round A-r3 it turns every switch on Models and on General, on and back off, in the three
looks at 1920, 1024 and 860 (`--set shakeWidths=` narrows the widths). A switch whose job is to change the page is
listed in `SHAKE_ALLOW` with what it may move and why. A row the base page redraws is judged until the redraw, and
the same redraw is then checked on bare PMConcept7. `head` measures the header's box, Change and the page under it.
`where` builds Where it applies for every adopted row and opens one panel of each kind. `detail` measures every
detail-card value against its widest word (round A-r4). `copy` covers Copy settings.
`always` keeps its own copy of the rule model's tables (above) and walks every 11.18 step × answer × run mode × same
run, new run and mode switch, reading what each row shows. Since the Sol max fixes, `always` also types the seven
host-dependent spellings the review found, tries the save guard with each, keeps portable controls offering Everywhere,
checks that a place the pattern no longer allows is cleared with a reason, and reads the one path reader through broad
detection, folder matching and the home read; `copy` walks Keep them fixed, an unticked row and kind, then the
computer's values, through the ticks, the counts, the preview and the write, and the other order. Since the S1 fix,
`where` and `always` read Plans' inventory layering (`Plans/settings_inventory.json`, or `--set inventory=<path>`): every
row whose value is an absolute path follows it first, so an owner-held row stays with its owner, with no ordinary level
and its owner's panel; an ordinary one still goes to each computer. Since the Astra max fixes (below), `where` compares
each row's combine with the inventory's exactly and resolves the per_item witnesses, every Reduce motion combination and
the three named actions' panels; `always` walks table E2 both ways through the editor and the save; `copy` walks Keep
them fixed with a device's own screen values to the committed destination. Every check they added prints "Astra".

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
  are the same everywhere now (`your_library`). *Since the inventory alignment:* the three libraries are owner-held
  actions in Plans' inventory, and "Start custom themes from" is a value it gives Everywhere and Device. Where the base page shows its own scope next to the layer's, the
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
  selected values”). Advanced lists the fixed rows under their kind, one tick each. Since the Sol max fixes, Copy what
  it gets from its computer obeys the same ticks: one selection by setting id covers all three lists. A device-bound account gets the
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

## Always allow: the rule model (rounds A-r3 and A-r4, 2026-11-11)

Moment 11.18 had a different defect in each round: host-dependence in r1, session lifetime and broad patterns in r2, and
rule carry-over in r3. So it is rebuilt from this one model, each cell resting on a line of
`Plans/Permissions_System.md`. `layer/moments.js` holds tables B, C and E as `MODEL`, table D as `covers()` and table F
as `isBroad()`. Every step is settled by the same code, with no exception of its own. The `always` part of
`feedback.check.mjs` carries its own copy of these tables. It walks every step × answer × run mode × same run, new run
and mode switch, with FileSafe on and off, and generates the cross-kind cases from table D.

Cells marked **Concept choice** are this concept's own careful narrowing where canon is silent or allows more. Each says
why. None loosens anything canon asks for.

**A. The steps in loom's run, and their kinds**

| Step | Kind | Target the answer is bound to |
|---|---|---|
| Run npm test · Run npm test again, after the fix | command | `npm test` |
| Run the release script | command (a script by its path) | `./scripts/release.sh v1.4.0` |
| Push to GitHub · Publish the image | remote effect | `git push origin feature/tags` · `docker push ghcr.io/jared/loom:1.4.0` |
| Read a folder outside loom | path, outside the home folder | `/mnt/team-share/release-notes` |
| Read your release checklist | path, a home-folder read the task needs (not a secret, not on PS-145's exclusion list) | `~/Documents/release-checklist.md` |
| Delete a branch on GitHub | destructive remote action | `git push origin --delete old-ui` |
| Use the looser rule open-recipes brings | not an ask: held (moment 11.13) | — |

**B. What each kind offers, and what YOLO does**

| Kind | Regular offers | YOLO | A rule may cover it | Rests on |
|---|---|---|---|---|
| command | Allow once · For this session · Always allow… · Don't allow | runs without asking | a command rule | §6.1 "The approval UI preserves deny, once, for session and always." §8.0 step 2: "`yolo` clamps tool permissions to `allow`". |
| path | the same four | **still asks** (all four), unless a folder rule covers it or it is the home read below | a folder rule | §3.3 `external_directory` "Default remains `ask`, including YOLO." "Paths on the allowlist bypass the `external_directory` guard." |
| path: a home-folder read the task needs, while FileSafe is on | **doesn't ask**, and is listed in Activity | **doesn't ask** | (not needed) | §3.3 "PS-145 permits only FileSafe-on task-needed listed home-folder reads through its explicit exclusions". §4.2: the guard's trigger has "only the explicit PS-145 FileSafe-on listed home-read exception". PS-026 "task-needed, visibly listed non-secret home-folder reads while FileSafe is on … FileSafe off removes the home-read exception". PS-145 lists the exclusions: "all registered Project folders wherever stored, PM private data …, secrets/.env/key/certificate files, cloud/service/AI sign-in roots, browser profiles, mail, keychains and password managers". |
| the same read, FileSafe off | the four, as any path | **still asks** | a folder rule | PS-026 "FileSafe off removes the home-read exception." |
| remote effect | Allow once · For this session · Don't allow | runs without asking | none | PS-146 "yolo authorizes ordinary Git/Jujutsu remote push, package/image/template publication … without an extra publication yes. Regular retains its exact-effect approvals." **Concept choice: no Always.** A push approval is bound to its branch and commit ("SCM approvals carry … `branch`, and `commit`"), so a kept rule could never be reused. For a publish, canon would allow a bounded one (Docker's `image_ref` is optional; §12A.2: never "an unbounded global publication grant"). The concept leaves it out because a publication can't be taken back, and Regular keeps it an exact-effect yes. |
| destructive remote action | Allow once · Don't allow | **still asks** (the same two) | none, ever | PS-146 "Prune, remote branch/repository deletion … still ask with exact targets in ordinary YOLO". **Concept choice: no For this session.** Canon asks with the exact target and doesn't forbid a session answer for that same target. A deleted branch can't be deleted again, so a session answer would never be used, and leaving it out keeps a deletion one yes at a time. |
| looser rule from a repository | held | held | — | PS-144 "This S15 acceptance remains required in YOLO". |

**C. How long each answer lasts**

| Answer | This step | Same request later in this run | New run (Run it again) | Switch of Run mode | After the app session | Rests on |
|---|---|---|---|---|---|---|
| Allow once | allowed | asks | asks | asks | — | §6.1 "Once authorizes one invocation". |
| For this session | allowed | allowed | asks | asks | gone | §6.1 "for session is ephemeral under approval_scope_key". PS-113: the key holds "thread/run/actor/account and operation/target/mode identity"; "Default carryover remains narrow lane/run/actor scope". §2 Rules 3: "Drift invalidates the prior approval instead of silently reusing it." |
| Always allow (a rule) | allowed | allowed where the rule covers it (D) | allowed where it covers it | allowed where it covers it (in YOLO this matters only for a path; the rest run anyway) | kept until you remove it | §6.1 "Always is the durable person-choice path". PS-144 "Explicit rules stay inspectable and revocable and do not silently expand with mode changes." |
| Don't allow | refused | asks | asks | asks | — | §2.3 "The tool invocation is blocked … returns an error to the agent." |

A run keeps the permission snapshot it started with (§2 Rules 1 and 2), so a change of FileSafe takes effect in the
next run.

**D. Which rule may cover which step**

| Rule (made by Always allow on) | a command | a path | a push or publish | a deletion on the remote | Rests on |
|---|---|---|---|---|---|
| command rule (a command step) | yes, when its pattern matches the command | never | never | never | "Domain classes remain separate from generic tool allow." PS-146: "No generic tool allow … is substitute for target/capability/domain authority." |
| folder rule (a path step; it goes on the outside-folder list) | never | yes, when its pattern matches the path | never | never | §3.3 allowlist. PS-144 "The external-directory row remains `safety.protection.external-dir-allowlist`; do not invent a second list." |

Matching follows §3.1: "`*` Matches zero or more characters", "`?` Matches exactly one character", and "A pattern
ending with ` *` (space + wildcard) makes the trailing portion optional". **Concept choice:** a folder rule's trailing
`/**` also covers the folder itself. §3.1 is silent on it; §3.4 suggests "The directory prefix (`<dir>/**`)" for a
path, and that suggestion is meant to cover the folder it names.

**E. Where a rule may apply** (nothing is preselected; Add the rule waits for both choices)

| Rule | This project | This computer | Everywhere | Rests on |
|---|---|---|---|---|
| command rule that isn't host-dependent (`npm test *`, `git status`, `cargo build`, `pytest -q`) | offered | offered | offered | PS-144 "Always requires a person to choose the exact pattern and `This project`, `This computer` or `Everywhere`; nothing is preselected." |
| host-dependent command rule: any row 1 to 6 of table E2 below holds for one of its words (a web address, an image or registry reference and a git ref are not paths) | offered | offered | **never** | PS-144 "Rules about a file, directory, executable location, root or other host-dependent target never offer Everywhere." |
| …and, as a **concept choice**, rows 7 and 8 of E2: a pattern whose program is a file command (`read *`, `rm -rf *`) or a wildcard (`*`, `./scripts/*`) | offered | offered | **never** | Canon names targets, not commands. A file command acts on files of one computer, and a wildcard program can match a program by its path on one computer, so these are treated as about a location. |
| folder rule | offered | offered | **never** | §6.1 "paths never offer Everywhere". |
| (no project open) | hidden | | | §6.1 "no-project hides This project". |

Host-dependence comes from the pattern, which is what the rule is about (PS-144), never from the step it is typed on
(round A-r4, N2): `git push origin *` typed on the release step offers Everywhere.

**E2. When a command pattern is host-dependent** (Astra max A2, 2026-11-13; refined the same day). Two max reviews found
a spelling the path reader missed (Sol: a path behind `=`, in quotes, `C:/`, `.\`, a UNC share; Astra: a relative folder
or script with no dots or extension, `node scripts/release`, and a folder flag's single-name value, `git -C repo
status`), so the reader is rebuilt as one rule over the pattern's words, from this table. `PSX.paths.host(pattern)` in
`layer/world.js` holds the table as `HOST_ROWS` (one entry per row, in the table's order) and `NOT_A_PATH` (the three
kinds below), and nothing else decides. The pattern is split as a shell splits it (quotes keep a word together and come
off). The program word is the first word after `sudo`, `env` (with their flags) and any `NAME=value`; every other word,
a `NAME=value` before the program included, is an argument, and the value of `--flag=value` or `NAME=value` (each part
of a `,` `;` or `:` list) or of a glued `-I/usr/include` is read as its own part. The pattern is host-dependent when any
row holds for any word; the editor's line names the first such word, in pattern order, with its row's reason.

| Row | A word… | Examples (each one is a case in `feedback.check.mjs --set only=always`) | Why it is about one computer |
|---|---|---|---|
| 1 | is the program word, and holds `/` or `\`, starts with `~`, `.` or a drive, or is a variable then a separator | `./scripts/release.sh v1.4.0`, `scripts/release`, `"/opt/tools/runner" test`, `C:/Tools/runner test`, `\\nas\share\runner test`, `$HOME/bin/runner` | a shell runs it by its location, not from `PATH` (PS-144 "executable location") |
| 2 | is an argument that starts at a root or the home folder: `/`, `\\host` or `//host`, `~` (`~user`), a drive (`C:`, `C:\`, `C:/`), `$HOME`, `${HOME}`, `%USERPROFILE%`, `%HOMEPATH%`, `$env:USERPROFILE`, `$env:HOME` (alone or then a separator), another variable then a separator, or `file:` | `npm --prefix=/opt/release test`, `gcc -I/usr/include x`, `PATH=/opt/bin npm test`, `npm --prefix ~/x test`, `cd ~`, `cd $HOME`, `dir C:`, `git diff /etc/hosts`, `curl file:///etc/hosts` | a root, a drive, a share or the home folder of one computer |
| 3 | is an argument that is `.` or `..`, or starts with `./`, `../`, `.\` or `..\` | `prettier --write .`, `cd ..`, `git diff ./src` | a place relative to the folder it runs in |
| 4 | is any other argument holding `/` or `\`: a bare relative path, unless it is one of the three kinds below | `node scripts/release`, `npm --prefix=packages/app test`, `git -C repos/loom status`, `git diff -- src/app`, `node .venv/bin/tool`, `npm install @types/node`, `docker push jared/loom:1.4.0` | a file or a folder relative to where it runs |
| 5 | is the value of a directory or file flag (below), written `--flag=value` or `--flag value` | `npm --prefix=release test`, `git -C repo status`, `git -C repo push origin feature/tags`, `tsc -p tsconfig.json`, `cargo build --manifest-path Cargo.toml`, `docker build -f Dockerfile` | the flag says its value is a folder or a file |
| 6 | names a script or program file by its extension: `.sh .bash .zsh .fish .ps1 .psm1 .bat .cmd .exe .py .js .mjs .cjs .ts .rb .pl .php .lua` | `python3 build.py`, `bash deploy.sh *`, `release.sh`, `git log deploy.sh` | a file in the folder it runs in |
| 7, **concept choice** | is the program word and a file command: `read write edit list open cat less head tail ls cp mv rm rmdir mkdir touch chmod chown find grep tar zip unzip` | `read *`, `rm -rf *` | it works on the files of one computer |
| 8, **concept choice** | is the program word and holds `*` | `*`, `*-cli build` | it can match a program by its location |
| none | no row holds for any word | `npm test *`, `git status`, `cargo build`, `pytest -q`, `git push origin *`, `npm run build`, `NODE_ENV=production npm test`, `make -j8 test`, and the kinds below | portable: Everywhere is offered |

**Not a path (row 4 doesn't hold for these).** PS-144 bars Everywhere for "a file, directory, executable location, root
or other host-dependent target". A web address, an image or registry reference and a git ref are none of those (the
lead's canon call, 2026-11-13, refining the first version of this table, which read every `/` as a path):

| Kind | What it is | Examples (portable controls in the check) |
|---|---|---|
| a web address | a word or value with a scheme, `scheme://…`; `file:` is not one (it names a file: row 2) | `curl -fsSL https://bun.sh/install`, `npm publish --registry=https://registry.npmjs.org`, `curl https://example.com/a/b?c=d/e` |
| an image or registry reference | its first segment, before the first `/`, is a host name: dot-separated labels ending in two or more letters (`ghcr.io`, `registry.npmjs.org`), or a name or address with a port (`localhost:5000`) | `docker push ghcr.io/jared/loom:1.4.0`, `docker pull localhost:5000/app:dev` |
| a git ref | an argument of a git subcommand that takes refs (`push pull fetch checkout switch merge rebase branch tag log diff reset cherry-pick`), after the subcommand and before `--`; after `--` the words are paths again | `git push origin feature/tags`, `git push -f origin feature/tags`, `git rebase origin/main`, `git diff main..feature/tags`, `git checkout -b feature/x`, `git -c core.pager=less log feature/tags` |

These lift row 4 only. Rows 2, 3 and 6 still hold for a git ref position (`git diff /etc/hosts`, `git diff ./src`,
`git log deploy.sh`), and `file:` is row 2. For git, `-C` is a directory flag only before the subcommand (git's own "run
in this folder"; after it, `git commit -C` names a commit), and `-f` is never one (git's `-f` is force). A Docker Hub
image with no registry host (`jared/loom:1.4.0`) and a package scope (`@types/node`) can't be told from a relative path
by their spelling, so they stay row 4: **concept choice**, choose This project or This computer for them.

**The directory and file flags (row 5):** `-C`, `--prefix`, `--cwd`, `--dir`, `--directory`, `--root`, `--workdir`,
`--chdir`, `-chdir`, `--git-dir`, `--work-tree`, `-f`, `--file`, `--config`, `--manifest-path`, `--project`; `-p` only
after `tsc` or `vue-tsc` (elsewhere `-p` names a package, a port or a plugin); and any other long flag whose name ends in
`dir`, `directory`, `path`, `folder` or `root`, or in `-file` or `_file` (`--target-dir`, `--env-file`, `--rootdir`,
`--project-directory`; `--profile` is not one), except a `--no-…` switch. Its value is the word after it, unless that
word starts with `-`; a wildcard value counts (`git -C * status`). `--project` given an ID still reads as a folder.

**One rule everywhere it is asked.** The editor's places, its line saying why, the line saying a chosen place was
cleared, and the save guard (the same call on the exact pattern it would keep) read `PSX.paths.host`. Broad detection
(F) reads the same words: a "named script" is a word rows 1, 2, 3, 4 or 6 make host-dependent, and a flag's value
counts with its flag (`git -C repo *` is a program word, flags, then `*`). The home read (B) asks the same row 2 words
(`PSX.paths.rootOf`), and so does `feed.js` for a Settings row whose value is an absolute path. Folder rules and the
paths they are matched against are each written one way first (`PSX.paths.norm`: quotes off, `\` as `/`, one separator
at a time, none at the end), so `/mnt/team-share/release-notes/` covers the folder it names.

**F. What counts as broad** (the preview warns "This one is broad"; the rule can still be made). **The whole table is
a concept choice:** canon names no list. It is the lead's r3 definition ("A bare `*`, a shell, interpreter or package
runner, `sudo`, or `rm -rf` followed by `*` is broad. A specific script path followed by `*` … is not"), kept inside
§3.4's bound that a suggestion "never grants a whole command prefix outside that guard". §3.4's own bash suggestion is
"first word + space + `*`" (`git *`), so the page still offers that shape as its third suggestion and warns on it.

| Pattern | Broad? |
|---|---|
| a wildcard program: `*`, `./scripts/*`, `*.sh` | broad: it runs programs nobody named |
| `sudo` with any `*` (`sudo *`, `sudo apt install *`) | broad |
| a shell or interpreter running `*` or inline code (`bash -c *`, `python3 *`, `node *`) | broad |
| one program word, with or without flags (and a directory flag's value, E2 row 5), then ` *`: a package runner or any command (`npm *`, `npx *`, `git *`, `rm -rf *`, `read *`, `git -C repo *`) | broad |
| a named script or subcommand then ` *` (`./scripts/release.sh *`, `npm test *`, `git push origin *`, `python3 tools/build.py *`) | not broad |
| a folder rule reaching past the file or folder the step asked for (`/mnt/team-share/**`, `~/Documents/**`, `*`) | broad |
| a folder rule inside it (`/mnt/team-share/release-notes`, `/mnt/team-share/release-notes/**`) | not broad |

**What YOLO still asks:** a path outside the project that no folder rule covers and that isn't PS-145's FileSafe-on
home read (§3.3, §4.2, PS-026, PS-145), a deletion on the remote (PS-146), and a looser rule from a repository, which
stays held (PS-144). Nothing YOLO runs without asking becomes an Always rule (PS-144 "YOLO ordinary auto-allow creates
neither an Always rule nor a FileSafe approved-command entry").

## Inventory alignment (2026-11-13)

Plans' inventory layering is now the source of truth for every row, as SSYS-059 makes it ("The inventory layering
object, not legacy scope, is the reviewed per-row authority"). The branch was rebased onto `origin/main` first, so the
concept runs over main's PMConcept7 and main's inventory.

- **Where it comes from.** The layer reads the tree's own `Plans/settings_inventory.json`. The served `index.html` fetches
  it before the layer starts. `tools/build_standalone.py` inlines it into both single files, with the file's SHA-256
  (`--inventory PATH` reads another copy). There is no copy of it in the package, so a change to Plans reaches the
  concept at the next build.
- **On the ladder.** `classify()` reads the inventory first (`feed.js` `placesOf`). A row takes its places from
  `may_differ_by`, its Computer key from `computer_key` (an execution host, or the server itself), and its `combine` and
  `careful_order` (a switch's `on` and `off` read as its true and false). `per_item` is kept, and each item resolves by
  its owner's own rule (`resolve.js` `PER_ITEM`, Astra max A1). The reasons for the places it doesn't offer come from
  `not_offered` (`resolve.js` `reasons`). The
  concept's own treatment stays: the safety preview and a run's own choice. The demo world's hand-written rows take
  their places from it too. Main Branch name became project-only, as the inventory says.
- **Owner-held.** A row the inventory gives `home: thing` is off the ladder, and the guard refuses it at every ordinary
  level. Its panel names its owner in the same three parts, with no Change, and the base page's own choices are hidden
  (`panel.js` `ownerWhere`). Owners are named from what each row is, in words:
  - each AI account, each MCP server, each skill, each persona;
  - the language server list, your publisher profile;
  - this wizard session, each chat.

  An action says "An action, not a setting: it runs when you choose it, so it has no place to set", then names its
  owner: "It belongs to your company registry list" (`panel.js` `ACTION_OWNERS`, one entry per action the inventory
  lists, Astra max N1). Where that owner has a place of its own, the panel opens it. A key or sign-in
  also says it stays on the computer where you entered it. A row a project may choose inside its owner says so
  ("A project can choose its own, inside each skill"). An account's own field keeps the base page's list of each
  one's value.
- **Outside it, named.** The six look details the engine paints keep their "follows Theme" view, with the inventory's
  places. Rows the inventory doesn't list fall back to the heuristic (`PSX.classReport().fallback`): the layer's own
  Projects folder, `safety.approvals.bsd-stage-bindings` and four crew rosters.
- **Main's one-model design** (Settings batch 3) retired Thinking depth (`ai.models.reasoning-effort`; depth lives inside
  the model picker now). The demo's "This project" example moved to Everyday building (`ai.models.worker-model`).
  Moment 11.10's narrow assistant write, 11.12's update defaults and 11.6's joining setups moved with it. The kit's
  `checks/settings-scope.check.mjs` moved every Thinking depth assertion to Everyday building, and dropped none.
- **Checks.** `feedback.check.mjs --set only=where` reads the same inventory and its SHA-256. It walks every drawn row:
  its places, reasons, combine (exactly, since Astra max A1) and Computer key, or for an owner-held row no ladder, no
  write and an owner view that names its owner (an action too, since Astra max N1). It then opens a real panel for an
  owner-held action, field, key, the Rules file, and a row a project may choose.

## Astra max fixes (2026-11-13)

The blind Astra max review (`REVIEW-concept-A-max-astra.md`) found four should-fix defects and one note. Each was
reproduced on `7150f6c5bc` before it was fixed, by a check that fails there and passes now (`CONCEPT-FIX-REPORT-A.md`
has the numbers and the pictures).

- **A1, permission maps lost per_item.** `feed.js` dropped the inventory's `per_item`, so the resolver kept the most
  specific whole map: This computer's Block and tastebook's Allow for the same tool gave Allow. Now `per_item` is kept
  and `resolve.js` resolves each item by its owner's own rule (`PER_ITEM`), never by a generic merge. Answer for each
  tool and Answer for each web ability follow PS-144: each exact key on its own; when this computer's own and this
  project's own answer for it both exist, the more careful is used (Block, then Ask me first, then Allow); otherwise
  the most specific own answer, then Everywhere's, then the default. Ordered rules keep Permissions' own behaviour
  (§2.4, §3.1): every place's rules apply together, a more specific place's same rule shadowing the others, last match
  wins, with no careful reordering. The row, the panel's Now, each line of Where it applies (which items it decides,
  which it loses for safety) and a rule line say so. The `where` check compares the inventory's combine exactly; it used
  to rewrite `per_item` to `most_specific`.
- **A2, relative host paths could be saved Everywhere.** Table E2 above, and `PSX.paths.host`, built from it.
- **A3, Keep them fixed copied a device's screen values into a project.** The source is read on the device in front of
  you, so Theme and Reduce motion could be in use from that device's own values, and Keep them fixed counted, ticked,
  previewed and wrote them. Now a value in use from a device is left out before anything counts it, and the preview
  names it: "Not kept fixed: Reduce motion (On) and Theme (Retro Light). They come from This computer's own screen
  settings, and screen settings belong to each device." The source project's own values still travel under their own
  contract.
- **A4, Reduce motion ignored an Everywhere request when the device said Off.** SSYS-059's named rule is now explicit
  (`resolve.js` `motionOr`): the own requests here (Everywhere, the device, the project) are ORed, the default only
  when none exists, and the operating system's preference is ORed after as its own input. The panel says who asks for
  what ("This screen asks for full motion. Everywhere asks for less, and less motion wins.").
- **N1, owner-held actions didn't name their owner.** Every action now does, from one table, and opens its owner where
  it has a place of its own: Other registry sign-ins opens your company registry list, Search all settings goes to the
  search box.
- **Found with A1 and A4: FileSafe's careful order.** The inventory writes it as `on`, `off`; the row's values are true
  and false, so the comparison matched neither and fell back to the computer's own: This computer Off and a project On
  gave Off, the less careful. A switch's careful order is now read as its values, and the check asserts every
  more-careful row's order is made of values it can hold.

**Follow-up, the same day (the lead's canon calls).**

- **Not every `/` is a path.** PS-144 bars Everywhere for "a file, directory, executable location, root or other
  host-dependent target". A web address, an image or registry reference whose first segment is a host name, and a git
  ref are none of those. Table E2 now lists them under "Not a path": they lift row 4, the bare relative path, and
  nothing else. The four controls the first version read as paths (`git push origin feature/tags`, the ghcr push, the npm
  registry address, `curl -fsSL https://bun.sh/install`) offer Everywhere again. The review's five witnesses still don't.
- **Computer-effective freeze is off by default** (SSYS-062: "project_only_rows is off by default, as are copied
  instructions/build files/remotes and Computer-effective freeze"). Keep them fixed alone no longer freezes a value the
  source has in use from its own computer; only "Copy what … gets from …" brings it. The preview names what it held
  ("Not kept fixed: … recipe-app gets them from Home NAS, and only “Copy what recipe-app gets from Home NAS” brings
  them"), and Keep them fixed's own line says so. This overturns Sol max F2's accepted design, in which Keep them fixed
  froze those values too (its check said FileSafe "was already kept fixed").

## Sol max fixes (2026-11-12)

The blind max review (`REVIEW-concept-A-max-sol.md`) found two defects; each was reproduced on `b5e34f24a5` by a new
check before it was fixed, and the same checks pass now. `CONCEPT-FIX-REPORT-A.md` has the numbers and pictures.

- **F1, host-dependent patterns could be saved Everywhere.** 11.18's `hostText` saw a path only at the start of a
  word and only as `/`, `~`, `./`, `../` or `C:\`, so `npm --prefix=/opt/release test`, `npm --prefix=../other test`,
  `"/opt/tools/runner" test`, `"../tools/runner" test`, `C:/Tools/runner test`, `.\tools\runner test` and
  `\\nas\share\runner test` offered Everywhere, and Add the rule kept one there. Now one path reader (`PSX.paths`,
  described under table E) decides, through one classifier, `hostOf()`: the editor's places, its line saying why (which
  now names the path it found), and the save guard. The guard reads the exact pattern it is about to keep; a place that
  pattern doesn't allow is never kept, the place is cleared and a note says why. When a change of pattern takes away
  the place you chose, the editor clears it and says so ("Your choice, Everywhere, was cleared"); choosing a place again
  takes the line away. The same weakness elsewhere, each now on the same reader: broad detection (a program named past
  `NAME=value` or `env`, so `NODE_ENV=production npm *` is broad), folder-rule matching (a trailing separator, quotes or
  a doubled separator still name the same folder), the home read (PS-145's exception needs a home-folder path), and
  Settings rows whose value is an absolute path (`feed.js`: such a row is each computer's own, "a path names a place on
  one computer", but only after the reviewed owner-held rows; see the S1 fix below).
- **S1 (the Sol-high recheck of these fixes), the Rules file belongs to Permissions.** The fixes above first made Rule
  Storage Location (`safety.rules.storage-format`, `~/.config/puppet-master/permissions.toml`) an ordinary Computer
  value. Plans' inventory layering, which SSYS-059 makes the per-row authority, keeps it inside its owner (`home: thing`,
  every ordinary level `set_inside_a_thing`), and Permissions_System §9 with PS-144 make that file a read-only projection
  of the Everywhere rules, never a second writer. It is now on the reviewed owner-held list (`REVIEWED.thing`), which
  `classify()` reads before any host-path rule, as SSYS-059 orders it: it is off the ladder, the guard refuses it at
  everywhere, a computer, a device and a project, and its panel keeps its owner's words, in the same three parts and
  with no Change: "Your rules are kept by Permissions. This file is a read-only copy of your everywhere rules: change a
  rule in Permissions, never in the file", a computer's own rules stay with that computer's rules, a project's are in
  its own `.puppet-master/permissions.toml`. It was the only row the path rule reached; Plans' inventory has no other
  row with an absolute-path value. The old global/project ladder is not back.
- **F2, Copy what it gets from its computer restored a setting you had unticked.** (*Since the Astra follow-up:* Keep
  them fixed alone no longer freezes the computer's values at all, by SSYS-062; the tick rules below still hold.) The plan added the computer's values
  after the source's own values and before Keep them fixed's filter, so they skipped every kind and row exclusion:
  Profile in use, unticked and showing "Stays as usual", came back in the plan and the preview. Now the copy has one
  list of every setting it can bring, one row per setting id (its own values, then the computer's, then Keep them
  fixed's), and one tick per id: yours if you gave one, otherwise its kind's. Advanced lists the computer's values under
  their kind with that tick; the counts, What comes along, the button, the preview, the commit and the receipt read the
  same list; the opt-in says "(1 of 3)" and names what stays as usual, and the preview says "Stays as usual, as you
  chose". Ticking one row in a deselected kind now brings only that row (it used to re-select the kind's fixed rows).
  Found while proving the write: Keep them fixed counted two settings that have no value (`code.terminal.sixtyfour-*`),
  which a write can't keep; they are no longer counted, previewed or written.

## Fix round A-r4 (2026-11-11)

The narrow r4 recheck (`REVIEW-concept-A-r4-opus-high.md`) found these; each is fixed:

- **F1, the path cell missed PS-145's exception.** With FileSafe on, a task-needed, listed, non-secret home-folder read
  doesn't ask, in Regular or YOLO (§3.3, §4.2, PS-026, PS-145). Table B says so. 11.18's outside folder moved off the
  home folder to `/mnt/team-share/release-notes`, so it still asks in both modes. Another Project's folder would have
  been the wrong example: PS-145 reads it through `other_projects_read`, which YOLO with an explicit task scope can
  allow. A new step reads `~/Documents/release-checklist.md`. With FileSafe on it doesn't ask and is listed; with
  FileSafe off it asks like any path. The run reads loom's FileSafe as it starts.
- **F2, a detail card's value one letter wide.** In a narrow list the layer put the control under the copy but kept
  it in the first column, beside an empty end column. In Web & Research › Abilities › Browser at 860 that left 129px,
  and "Change" squeezed the value to 36px. The control's line now spans the whole row. The new `detail` part measures
  every detail-card value against its widest word, in every workspace, tab and list item, in three looks at 1024, 860
  and 640. It picks each item by its id after every redraw and waits until the pick is current and the pane has held
  still for three frames; an item that never settles fails by name. A value that is narrower than its widest word is
  measured again on bare PMConcept7 in the same look and width, and is excluded only when bare gives it no more room
  than the shell's own measured difference in Settings' width (the base page draws its left-panel resizer unless its
  rail is folded with `data-pmw-home="on"`, so the two pages can differ by a few pixels outside Settings). Each
  exclusion is written to `run.log` with both widths; they go to stream F.
- **The model's own choices are labelled.** No Always for push and publish, no For this session for a deletion,
  `/**` covering the folder itself, the file-command and wildcard-program parts of host-dependence, and the whole
  broad list are marked "Concept choice", each with its reason.
- **N2:** host-dependence comes from the pattern, never from the step it is typed on.
- **The walk** now covers FileSafe on and off (38 step × answer × run-mode cases), and its cross-kind cases are
  generated from table D: for each rule kind, a rule whose pattern is exactly another kind's target, plus `*`.
- **The two copy guards** r3 dropped are back: no line says "Allowed. Allowed", and a kept rule is listed with its
  kind and place.
- **R3-5 under load.** The look watcher compared the painted look with the last one it saw itself, so a look seen during
  a change and reported by nobody left the strip naming an older look. It now compares with the look last reported. One
  look change runs at a time; the latest waiting one wins, and each answer names its request. The strip's Look is
  greyed and names the change only while its own latest request is on its way; otherwise it names the painted look. The
  `strip` part repeats the reviewer's case under a busy-loop load, at three loads and spacings (busy 70 of every 90ms
  with picks 1.2s apart, then 150 of every 170ms with picks 600ms and 250ms apart), so the race shows on a fast GPU
  too: the heaviest fails `5614c4fbf7` on the RTX 3090, where the lightest didn't.
- **Real-pointer clicks** on Think between tool steps, Tidy up, Caching for browser sign-ins and Show where each setting
  comes from: a pointer at each switch's centre lands on other content, on bare PMConcept7 too. That is stream F's.

## Round A-r3: the other fixes (2026-11-11)

- **R3-2, a row grew when Changed appeared.** In Retro Light at 860 the layer's label column is 330px (bare
  PMConcept7's is 408px, where nothing wraps), so Changed wrapped under the label and the rows below moved 20px. A
  label with no Changed mark now keeps the mark's place (an `::after` the mark's own size, measured per look), so it
  wraps the same way either way. A switch whose job is to change the page (names beside the activity-bar icons, where
  each setting comes from) reflowed everything above it, and the clicked row could jump 850px away (168px on bare
  PMConcept7). That row is now held where it was on screen for a moment after the click, to within half a pixel
  (scroll positions are whole pixels). The base page draws Settings sections from the third on with
  `content-visibility: auto`, so a section out of view keeps an estimated height; the hold also covers a section above
  that takes its real height after a click.
- **R3-3, "Hide the built-in presets" scrolled the page.** It doesn't. The Settings scroller has
  `scroll-behavior: smooth` (the base page's), so a scroll a probe sets keeps moving for up to a second. Measured with
  and without the click, 100, 300 and 1000ms after such a scroll, on the layer and on bare PMConcept7: the page moves
  the same with or without the click, and not at all once the scroll has settled. The check's scroll helper now
  jumps instead, so a toggle is never measured inside its own scroll.
- **R3-4:** `./scripts/release.sh *` is not broad (table F).
- **R3-5, a Look that never lands.** It is asked for once more, and the strip's Look always shows the look on screen:
  the layer reports any change of the painted look, and the strip takes it when its Look isn't waiting for a change.
- **R3-6, the strip showed the previous moment's caption.** The moment is set before the demo reset reports.

## Fix round A-r2 (2026-11-11)

The blind r2 recheck (`REVIEW-concept-A-r2-opus-high.md`) found these; each is fixed:

- **For this session** belongs to this run and this run mode (Permissions_System PS-113 keys `approval_scope_key` to
  the run and the mode; §2 Rule 3: drift invalidates it). A second `npm test` in 11.18's run shows what it covers;
  Run it again or a switch of Run mode starts a new run with no session answers, so YOLO asks for the folder outside
  the project again (§3.3). Always rules you make apply to every later run they match.
- **The header's last wording** always fits: the dot form may take two lines in the same box, a name never split.
- **Broad patterns:** any command followed only by `*` (`rm -rf *`, `sudo *`, `npx *`, `git *`, `read *`); a rule
  about files is host-dependent, so it never offers Everywhere.
- **"Auto (default: This computer)"** shows the setting; the arrow only names where work actually ran.
- **The session line** no longer repeats "Allowed"; the outside step has its own report line.
- **A pattern's trailing `*`** also matches nothing after it (`npm test *` covers `npm test`, `…/taxes/*` covers the
  folder), so a later run honours the rule and the preview says so.
- **The strip's Look** stores the look only once it has really painted, and stores the look asked for: under load a
  paint can outlast the wait, and storing the base page's state then stored the look it was leaving.

## Fix round A-r1 (2026-11-10)

A blind review of the branch (`REVIEW-concept-A-r1-opus-high.md` in the share folder) found these; each is fixed:

- **The strip's script** died on two captions that used a plain apostrophe inside single-quoted strings (`index.html`
  11.5 and 11.16); every caption now uses ’, and `feedback.check.mjs --set only=strip` opens `settings-scope.html`,
  picks Moments › 11.18, Compare options and a window width, and fails on any uncaught error.
- **The viewing header** cut the device's name at 1280 and 860. The header now has shorter wordings, tried in order
  until one fits with nothing cut: "harbor on Studio Mac, with iPhone’s screen", "…, with iPhone", the same without
  the word Viewing (the frame, the tint and Stop viewing still say it), then "harbor · Studio Mac · iPhone", and last
  (round A-r2) the same words on two lines inside the same box, a name never split across them, so the last step
  always fits. It refits when the window changes; the box never changes size.
- **The end column** is sized from the widest end word the concept can show, measured in the current look's own font
  once per look (Retro's monospace cut "Each AI service" at 124px). Every control in a section still lines up. A
  compact field's end word (the 210px fields beside a service) never shrinks; its label wraps instead.
- **Libraries** (Your own themes, Sound library, Add a sound) open a library; they are not values. Their panel says
  "Your library · Kept with your settings", and Where it applies has the three parts with their reasons only, with no
  value line and no Change. "Start custom themes from" has a value and stays same-everywhere.
- **Always allow:** whether Everywhere is offered comes from the step's own target (a script or a folder) as well as
  from the pattern, so your own pattern never brings it back on the release step; a bare `*`, and a shell or an
  interpreter followed by `*`, are flagged broad; round A-r2 adds any command followed only by `*` (`rm -rf *`,
  `sudo *`, `npx *`, `git *`, `read *`), and a rule about files (`read *`, `rm -rf *`) is host-dependent, so it never
  offers Everywhere. Each ask also offers **For this session** (Permissions_System 6.1
  keeps deny, once, for this session and always). *Corrected in round A-r2:* a session answer belongs to this run and
  this run mode (PS-113's approval_scope_key holds the run and the mode; §2 Rule 3: drift invalidates it), so it
  covers the same request later in the run (the run's second npm test) and ends with a new run or a switch of Run
  mode; YOLO still asks for a folder outside the project (§3.3). It makes no rule; a deletion on the remote is
  answered one at a time. An Always rule you make does apply to every later run it matches.
- **Where work runs:** the panel's Now card, the Change menu and the project lists show the setting, "Auto (default:
  This computer)" (each Project has a default computer and its work is Auto by default, SIR-056 on
  `plans/where-work-runs-20261109`), not "works on This computer". The arrow "Auto → X" names where a piece of work
  actually ran, so Settings never shows it (round A-r2). The Change menu's search reads "Find a project, computer or
  device".
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
- **Counts:** tastebook has 8 settings of its own here (and 3 about its own files), not Split v2's 13: its Theme,
  Everyday model and Profile in use would contradict BUILD-SPEC 4.4's world, and main's one-model and Memory rulings
  retired Thinking depth and one memory row it set. harbor has 1, not 6.
- **The plain specimen row on the board is Speed or power**, not Text size: Text size varies by device in this world.
- **Reduce motion's operating-system part** is the strip's checkbox, the preference of the device in use. The resolver
  ORs it after your own requests (`motion.effective`); the setting's own value, which the engine paints, is the OR of
  your requests alone, and the layer keeps the page reduced while the checkbox is on.
- **YOLO is shown, not run:** the strip's Run mode stands for the chat's run mode; a person's own click in a sheet stands
  for an agent's request with a clear target. Real tool execution, pushes and publishing are simulated in 11.18.
- **The classification** follows Plans' inventory layering for every row it lists. Three kinds of row stay outside it,
  each named: the six look details the engine paints itself (they follow Theme, with the inventory's places in their
  panel) and the rows the inventory doesn't list (the heuristic decides them; `PSX.classReport().fallback`). Its
  `per_item` rows resolve by Permissions' rules in the concept's own resolver: a picture of those rules, not the
  native permission engine.
- **"MCP server" and "language server"** keep their protocol names; only the work machine is renamed Computer
  (decision S1). Whether the product renames MCP's own word is Jared's call.
- **Glass transparency, the wallpaper and the Basic colour scheme** stay outside the ladder: the engine paints them on its
  own paths.
