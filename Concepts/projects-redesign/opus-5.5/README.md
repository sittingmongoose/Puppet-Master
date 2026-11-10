# Projects page and New Project (Opus 5.5)

Three concepts for PMConcept7's Projects page and for the way a project is added, shown inside the real PMConcept7 in all
ten looks. PMConcept7 itself is not edited: `index.html` frames it and adds this folder's layer at runtime, replacing the
Projects page's contents while a concept is shown ("Today" puts the page back as it was).

Jared's request (2026-10-30): restyle the page to match Home, Usage, the chat and the left rail; make the icons readable;
make the folder-missing project fixable; update its alerts and indicators; keep only New Project, working like the
onboarding wizard without its theatrics; account for every way a project can be added, and for backups and source
control. The review behind these concepts (Opus 5.5, GPT-6 Astra, Muse Wonder Full) is in
`/mnt/Cursor/share/puppet-master/2026-10-30-projects-refresh/`.

## Split v2 (pass 2, 2026-11-02): the chosen concept

Jared chose C: "I am leaning towards the Split option. Lets just focus on that for future passes." Split v2 keeps the
library grouped by machine and the chosen Project's own page, and rebuilds New Project as a **guided page**: one section
open at a time, finished sections folded to their answer with Change, a live Review beside them, and sections that are a
pure function of the answers (an abandoned answer never comes back, FO-22). The spec is
`/mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/BUILD-SPEC-split-v2.md`; the copy step follows
`SETTINGS-PROPOSAL.md` 5.1 to 5.4 and 5.7, and the chat entry point `NOPROJECT-PROPOSAL.md` 7 (pending Jared's
no-project decisions). The build report is `BUILD-REPORT-split-v2.md` in the same folder.

What v2 adds, in Jared's words' order:

- **Copy settings with providers and sign-ins** (Start like another Project?): what makes the source different (its own
  settings, its own things, its AI accounts), one honest readiness row per account on the computer that does the work
  (reused there only when this Project chose it; checked first on another computer; keys never sent), and
  **Advanced: choose what to copy** by kind, one setting at a time, thing by thing and account by account.
- **A look inside before adding**, on every route (this computer, Home NAS, SSH, SMB, NFS, a connected drive): history,
  branch, online copies and the original, unsaved changes, submodules, Git LFS, hooks, and a Project you already have.
  A found online copy is **Link it** (sign in, then checked), **Leave it unlinked** or **Make a new one instead**.
- **Where it lives**: the computer that does the work ("Computer", Jared's environment), where the files go (your
  Projects folder, another folder, a network drive or NAS, or on the Server), the full path live, free space, and the
  NAS rule over every route.
- **Online copy, done properly** for GitHub, GitHub Enterprise, GitLab, Azure DevOps, Bitbucket, and Forgejo and Gitea on
  your own server, with Advanced, and the plain answer to "Do Git and JJ work with all the source repositories?".
- **Backups**: eight destinations with the exact place before any sign-in, what is included and when (Advanced), then
  "Finish protecting your work" (sign in, test, Recovery Kit, check it, turn on) and a full Backup plate.
- **Contribute** (fork, keep the original as upstream, start a branch) or **Just copy it**, for someone else's Project.
- **Starter files explained**, apart from Saved setups, with the proposed Settings › New projects › Starters page.
- **From a chat with no project** (N2, both first-class): "Make this a project…" asks new or existing with nothing
  chosen and says what happens. The new path opens New Project filled in; the existing path picks the project, the files
  (New, Same, Different), where they go (a separate draft branch first; the main version under Advanced), then a plain
  statement, a live preview and **Move chat and files**, a report on the project's page and **Undo move**.
- **Run mode** (Regular or YOLO, on the review strip): every yes-point says what YOLO does instead. Pushes, publishing,
  making the online copy and forks go ahead and are reported, with Undo or plainly "can't be undone"; a force-push only
  with a lease on a branch Puppet Master made. Sign-ins, a new device's identity, the Recovery Kit, FileSafe, putting
  files back and deleting anything online or Puppet Master's data still ask. **More moments › An agent sets up a
  Project** shows the difference.

**Fix pass (2026-11-03)**: five full reviews fixed and Jared's decisions applied (P5 a copy you already have is said,
never blocked; P7 folder names keep spaces; P8 retention is Standard or "Choose how many to keep"; P9 archived Projects
pause their backups; P12 "Notifications and limits"; Q8 chat folders in `~/Puppet Master Chats`). See the "Fix pass"
section of `BUILD-REPORT-split-v2.md`.

New layer files: `layer/words.js` (every word), `layer/rules.js` (the service and backup rule tables), `layer/np.js` (the
engine, no DOM), `layer/np-ui.js` (the section renderers, shared with the Project page's in-place forms) and
`layer/np.css`. A and B are frozen: they keep pass 1's `layer/flow.js` and still load with no console errors.

## Fix pass 3 (2026-11-10): Jared's #12 and #13, and the guided-flows check

Jared reviewed Split v2 on 2026-11-09 (`/mnt/Cursor/share/puppet-master/2026-11-09-settings-feedback/FEEDBACK.md`), and
pm7-build checked every guided flow against current onboarding and canon (`GUIDED-FLOWS-CHECK.md` there, "Changes for P").
The report is `CONCEPT-FIX-REPORT-B.md` in the same folder.

- **#13, chats with no project, inside the app** (ACD-508, ACD-510, ACD-511 on main; the settled N2, N20 and N27 are not
  reopened). New is a split on Home's board bar and beside the chat's New thread (this Project, With no project, another
  Project). The title-bar switcher has its fixed No project row. History has a No project group with New chat with no
  project and each row's More. A no-project chat says "No project · This computer"; its Where chip and its More menu offer
  **Make a project from this chat** and **Move this chat into a project**, its header **Make this a project…** (the
  chooser, neither preselected), and the three workflows that still need a project (Planning Wizard, PRD Builder,
  Orchestrator) say Needs a project with the same two choices. A first message mints a new no-project chat.
- **Both conversions, complete** (GUIDED-FLOWS 7.02 to 7.05, 7.09 to 7.11, 7.13, 7.15): picked files on the new path, a
  waiting approval settled first, a live preview family by family (settings, AI accounts, permissions, active work,
  online, Undo), blockers settled in place (unsaved work in the destination, Git without a name on its Computer, a history
  graft), a report for every result (moved, stayed, held, didn't move, with Try again), and an Undo that ends at the first
  new message, work or changed moved file, or 7 days, and says so when it has ended.
- **#12, where work runs** (SIR-056, F3-668, F3-664, SRV-006 and SSYS-059 on `plans/where-work-runs-20261109`, not on
  `main` yet): the Project page's **Where work runs** plate names the records home, the work choice (Auto by default, or
  "Chosen: Studio Mac by Jared"), the default Computer, the allowed Computers and the ones working now; each work row says
  "Auto → Home NAS" or "Chosen: Studio Mac by Jared" with **Why this computer** (the measures, their age, and why the
  others were left out or ranked lower). New Project › Where it lives offers the work choice, the default Computer and
  the allowed set, apart from where the files go. Auto's presets and each Computer's level are linked to Settings, not
  built. Nothing says "<Project> works on <one Computer>" any more.
- **Guided flows**: one place world with onboarding (Home NAS is a Synology DS920+ at home-nas.local; Media server is a
  TrueNAS SCALE with SSH off, reached over NFS; each Computer resolves its own home and Projects folder); NAS pairing
  instead of SSH, SSH-off guidance by brand, username first and each key's state on the device (works already, locked,
  needs adding), a changed identity shown side by side, an uncertain key install checked before retrying; partial and
  unknown looks inside, and a native look after an online copy; an unfinished setup kept out of the Project rows; restore
  in dependency order (Kit or no Kit, reach and sign in, unlock, Project, recovery point and coverage); Notifications &
  limits, fixed values that obey the picked kinds, a device-bound account that can't move, and a re-check at copy time;
  token permissions for making versus reaching a Project per service, each service's code lifetime, Open the page and
  Copy address, sign-up turned off; Public and Private as the real Forgejo and Gitea choice; README, ignore list and
  licence in the online copy's Advanced; a backup's time zone, NAS identity checked by the owner, the pairing reused at
  Protect, a real sign-in or access step there, a protected Kit handoff, and "on" kept apart from a completed backup; an
  uncertain fork checked before Continue setup, and the original's changes fetched and brought in here before a separate
  send to your fork.

New files: `layer/chat.js` (the no-project chat surfaces), `layer/work.js` (where work runs), `layer/fix.css`, and
`tools/checks/` (browser-check: `noproject.check.mjs`, `work.check.mjs`; run them with
`browser-check run Concepts/projects-redesign/opus-5.5/tools/checks --set page=<dir>/projects-concepts.html` after
`python3 tools/build_standalone.py <dir>`).

## The concepts

| | Concept | Idea |
|---|---|---|
| A | **Polish** | Today's page kept and brought up to Home and Usage: a Usage-style head, the same grid of cards rebuilt as Usage plates with a status mark and word, a Safe line (history, online copy, backup), the fix for anything that needs you on the card itself, and labelled Open, Details and More. New Project is a centred stepped window. |
| B | **Ledger** | Usage's own layout: a side list of views with counts (All, Need you, Working, This computer, Other devices, Not backed up, Archived), a header of controls, and one ledger row per project with its status, place, history, online copy and backup. A row opens Usage's inspector beside it. New Project is one scrolling sheet from the right. |
| C | **Split** | A library of projects grouped by where they live, and the chosen project's own page: what it is doing, where it lives, how it is kept safe, what needs you, with the folder fix shown in place. New Project is a launcher: paste a link, a folder or an address, or pick a way, then one page with a live review. |

All three share one demo world, one status vocabulary, one set of owner-routed actions and one New Project flow, so they
differ only in layout and presentation:

- **Status.** One state per project, drawn as PMConcept7's shared status mark and a word (no pills), by the precedence
  in FinalGUISpec 7.5: blocked, then needs you, then advisory, then activity.
- **Safe line.** History (Git or Jujutsu, with Jujutsu's bookmark and workspaces), Online copy, Backup (the last complete
  backup; a late or failed newer one is said beside it).
- **Labelled actions everywhere.** The More menu is the chat's picker menu with every item labelled. Delete data is
  never next to Remove from list.
- **Folder missing** (experiment): Find the folder (pick a likely place or browse; Puppet Master checks it is the same
  project, then only the place changes), Get a fresh copy from GitHub, Restore from the last backup, It's on a drive that
  isn't connected, or Remove from list.
- **Other states**: harbor needs a GitLab sign-in, docs-site is not backed up and has 3 newer changes online, legacy-app's
  backup is 9 days old, garden-notes lives on a Home NAS that isn't answering, recipe-app's setup didn't finish (Continue
  setup does only what is left; the GitHub repository is never made twice), two projects are archived.
- **New Project** asks what onboarding's Project chapter asks, in its words: how it begins (new, a folder on this
  computer, a project stored online, files on another computer or a NAS, restore from a backup; importing from another
  app is shown as not here yet), its source, its name and where its files live, whether to start like another project,
  how it is kept safe (Git, Jujutsu or no history; an online copy; a backup), a review, then creating, done or setup
  didn't finish. No stage, puppets, scenes, sounds or look changes.

## The review strip

The strip under PMConcept7 is for reviewing and is not part of the design.

- **Concept**: C · Split v2 and Today; A and B (pass 1, frozen) sit behind **More concepts** (keys 1, 2, 3 and 0 still work).
  The strip opens on C.
- **Look**: all ten, switched through PMConcept7's own theme menu.
- **Projects**: the demo set, first run with none yet, or 40 projects.
- **Window width**: full, 1280, 1024, 860 or 640 px.
- **New Project**, **Folder missing**, **Setup didn't finish**: jump to those moments.
- **Run mode**: Regular or YOLO (C's yes-points say what YOLO does instead).
- **More moments (C)**: A chat with no project (in the chat), Home: New chat with no project, Where work runs (tastebook), From a chat (the chooser), From a chat › Move it into a project I have, An agent sets up a
  Project (Regular asks, YOLO goes ahead), Contribute, Found online copy, Submodules and Git LFS, Jujutsu limits, Same
  online copy as loom, Connect a new device, Backup setup, A fork (photo-sorter), Found not linked (legacy-app), Waiting
  for Media NAS (garden-notes). Disabled for A, B and Today.
- **Reset demo** puts every project back. **Reduced motion**. At 640 px New Project offers to set the chat aside for as
  long as it is open.

## Open it

- In the Concept Hub, or from any local server: `index.html` frames `../../PMConcept7.html?o55=off`.
- As one file: `python3 tools/build_standalone.py OUTDIR [PMConcept7.html]` writes `OUTDIR/projects-concepts.html`
  (about 39 MB) with PMConcept7 and the layer inside; it opens by double-click.

## How it reaches PMConcept7

`index.html` adds, in order: `layer/core.css`, `layer/np.css`, `layer/core.js`, `layer/words.js`, `layer/rules.js`,
`layer/flow.js`, `layer/np.js`, `layer/parts.js`, `layer/np-ui.js`, `layer/work.js`, `layer/chat.js`, `layer/fix.css`, each concept's CSS and JS, and `layer/boot.js`. The page and PMConcept7 talk only by `postMessage` (`{source: 'pjx-host', cmd}` in,
`{source: 'pjx', type, state}` out), so the strip also works in a sandboxed preview.

| File | What |
|---|---|
| `layer/core.js` | `window.PJX`: the demo world, the status vocabulary and precedence, the Safe line, owner-routed actions (each names its Plans command and changes the world only after its simulated result), toasts through PM Notify, menus through `PMR.menu`, dialogs, mounting into `#panel-projects`, looks through PMConcept7's theme menu. |
| `layer/flow.js` | `PJX.flow`: the New Project flow (ways in, steps, validation, review, the phases with their owner commands, commit and the failure path, link and path recognition). |
| `layer/parts.js` | `PJX.parts`: the status slot, Safe line, attention notices, Find the folder, Continue setup, Remove, Delete data, Rename, the undo strip. |
| `layer/core.css` | The mount, dialogs and the flow's parts. Everything else is Usage's and Home's own CSS: the concept root is `[data-pmu-host]` (Usage's rules are anchored on `:is(#panel-usage,[data-pmu-host])`) and `.pmw-scope` (Home's tokens and buttons). |
| `layer/words.js` | `PJX.W` and `PJX.w(key, vars)`: every Split v2 word (np.* New Project, pg.* the Project page). |
| `layer/rules.js` | `PJX.rules`: the services rule table (kinds, sign-in, owners, who can see it, name rules), the backup families with their access fields and checks, the branch, link and folder-name checks. |
| `layer/np.js` | `PJX.np`: the Split v2 engine (no DOM): the draft, sections and their problems, `set()` with the FO-22 clearing, cached simulated owner results, the Review, the steps and the commit, `detect()`, `toPlan()`, and the settings adapter `PJX.np.SETTINGS`. |
| `layer/np-ui.js` | `PJX.npui`: one renderer per guided section and the parts they share (the look inside, connect a device, sign in, the service cards, copy settings, backup, protect steps), also drawn inside the Project page's plates. |
| `layer/np.css` | The guided sections and their parts, in Usage's and Home's material. |
| `layer/work.js` | `PJX.work`: where work runs (records home, work choice, default and allowed Computers, work rows, Why this computer, the change form, New Project's block). |
| `layer/chat.js` | `PJX.chat`: chats with no project inside PMConcept7 (Home's and the chat's New split, the title-bar row, History's No project group, the no-project chat view) and the hand-off to both conversions. |
| `layer/fix.css` | The fix pass's parts, in the chat's, Home's and Usage's own material. |
| `concepts/a|b|c.*` | Each concept's layout (C is Split v2). |

## What it would touch in Plans

See `review-opus.md` §4 and §5 in the share folder: Project_System §4 (the button, equal ways in, labelled actions,
attention vocabulary, the folder repair through SIR-026), §3.1 (a New Project draft and review outside onboarding),
the stale `init_git: true` and argument rows, reverse consumers and `touch_closure.json` rows for every control, a DRY
rule for one setup-draft engine, and the open decisions (starting files, "use settings from", online copies on
services other than GitHub, rename, import).
