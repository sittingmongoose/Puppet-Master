# Projects page and New Project (Opus 5.5)

Three concepts for PMConcept7's Projects page and for the way a project is added, shown inside the real PMConcept7 in all
ten looks. PMConcept7 itself is not edited: `index.html` frames it and adds this folder's layer at runtime, replacing the
Projects page's contents while a concept is shown ("Today" puts the page back as it was).

Jared's request (2026-10-30): restyle the page to match Home, Usage, the chat and the left rail; make the icons readable;
make the folder-missing project fixable; update its alerts and indicators; keep only New Project, working like the
onboarding wizard without its theatrics; account for every way a project can be added, and for backups and source
control. The review behind these concepts (Opus 5.5, GPT-6 Astra, Muse Wonder Full) is in
`/mnt/Cursor/share/puppet-master/2026-10-30-projects-refresh/`.

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

- **Concept**: A, B, C, and Today (keys 1, 2, 3 and 0).
- **Look**: all ten, switched through PMConcept7's own theme menu.
- **Projects**: the demo set, first run with none yet, or 40 projects.
- **Window width**: full, 1280, 1024, 860 or 640 px.
- **New Project**, **Folder missing**, **Setup didn't finish**: jump to those moments.
- **Reset demo** puts every project back. **Reduced motion**.

## Open it

- In the Concept Hub, or from any local server: `index.html` frames `../../PMConcept7.html?o55=off`.
- As one file: `python3 tools/build_standalone.py OUTDIR [PMConcept7.html]` writes `OUTDIR/projects-concepts.html`
  (about 33 MB) with PMConcept7 and the layer inside; it opens by double-click.

## How it reaches PMConcept7

`index.html` adds, in order: `layer/core.css`, `layer/core.js`, `layer/flow.js`, `layer/parts.js`, each concept's CSS
and JS, and `layer/boot.js`. The page and PMConcept7 talk only by `postMessage` (`{source: 'pjx-host', cmd}` in,
`{source: 'pjx', type, state}` out), so the strip also works in a sandboxed preview.

| File | What |
|---|---|
| `layer/core.js` | `window.PJX`: the demo world, the status vocabulary and precedence, the Safe line, owner-routed actions (each names its Plans command and changes the world only after its simulated result), toasts through PM Notify, menus through `PMR.menu`, dialogs, mounting into `#panel-projects`, looks through PMConcept7's theme menu. |
| `layer/flow.js` | `PJX.flow`: the New Project flow (ways in, steps, validation, review, the phases with their owner commands, commit and the failure path, link and path recognition). |
| `layer/parts.js` | `PJX.parts`: the status slot, Safe line, attention notices, Find the folder, Continue setup, Remove, Delete data, Rename, the undo strip. |
| `layer/core.css` | The mount, dialogs and the flow's parts. Everything else is Usage's and Home's own CSS: the concept root is `[data-pmu-host]` (Usage's rules are anchored on `:is(#panel-usage,[data-pmu-host])`) and `.pmw-scope` (Home's tokens and buttons). |
| `concepts/a|b|c.*` | Each concept's layout. |

## What it would touch in Plans

See `review-opus.md` §4 and §5 in the share folder: Project_System §4 (the button, equal ways in, labelled actions,
attention vocabulary, the folder repair through SIR-026), §3.1 (a New Project draft and review outside onboarding),
the stale `init_git: true` and argument rows, reverse consumers and `touch_closure.json` rows for every control, a DRY
rule for one setup-draft engine, and the open decisions (starting files, "use settings from", online copies on
services other than GitHub, rename, import).
