# Rail fixture schema (`PMR.data`)

Every concept renders the same content from one data model, so the three concepts can only differ in design, never in
what they show. The fixture lives in `src/js/05-data-files.js`, `06-data-source.js` and `07-data-docker.js`. Each file
declares exactly one top-level `const` (`FILES_DATA`, `SOURCE_DATA`, `DOCKER_DATA`) and is data only: no `window`,
no `document`, no functions. `src/js/08-data.js` assembles `PMR.data = { files, source, docker }`.

Source of the content: the three panels of `Concepts/PMConcept7.html` (`#panel-files`, `#panel-source`,
`#panel-docker`), carried over in full, plus the canon additions listed at the end. Every `data-demo-action` /
`data-demo-arg` pair of the original panels appears in the fixture exactly as written (the boot check verifies it).

## Writing rules

- Plain words, sentence case. No UPPERCASE labels in the data (a theme may still uppercase in CSS, e.g. NieR headers).
- Every label is complete. Never write an abbreviation for space ("Ctrs", "Regs", "n/c", "6 · 1"): the concepts solve
  space by layout, not by shortening words.
- A meta fact is a short phrase that reads on its own ("index vs working tree", "run #47 · lane B API"). Raw IDs
  (SHAs, change/commit/operation ids, digests) go in `facts` under a "Technical details" group, not in `name`/`meta`,
  except a commit's short SHA, which may stay in `facts` only.
- No emoji, no glyph characters used as icons. Icons are `PM_ICONS` names (see the list at the end).
- Anything added from Plans (not in the original panel) carries `canon: 'PlanUnit-id'` so it can be audited.

## Types

```
Panel = {
  id: 'files' | 'source' | 'docker',
  target: 'panel-files' | 'panel-source' | 'panel-docker',  // the original .side-panel-view id this replaces
  title: 'Files',                       // display title, sentence case
  icon: 'files',                        // PM_ICONS name
  hover?: { label, detail },            // hover tag for the title
  context: Context,                     // the identity line(s) under the title
  actions: Action[],                    // header icon actions (refresh, pop out, ...)
  menus: { [menuId]: Menu },            // named menus referenced by id from anywhere in the panel
  views: View[],                        // sub-views in their canonical order (today's tabs + canon additions)
  status?: Status,                      // one-line panel status for the activity bar status board / summaries
  footer?: string[],                    // quiet notes ("Watching 18 folders · .gitignore respected")
  // Source Control only:
  engines?: { current: 'git', options: [ { id: 'git'|'jj', label, hover, action: Action } ] },
  jjViews?: View[],                     // the Jujutsu presentation of the panel (shown when engine is jj)
}

Context = {
  lines: ContextLine[],                 // 1-2 lines, e.g. "tastebook · main" and "Git · GitHub · 2 to push"
  facts?: Fact[],                       // the disclosure ("Where this runs"): Home Server, environment, path, ...
  state?: Status,                       // readiness / freshness of the whole panel
}
ContextLine = { text, mono?: true, menu?: menuId, hover?: { label, detail } }

View = {
  id, label, icon,                      // label is the full tab name
  summary: string,                      // one line used by summary rows and dropdowns: "2 staged · 4 not staged"
  count?: number,                       // headline count (optional)
  attention?: { state, text },          // something here needs the person: "1 conflict needs you"
  conditional?: { shown: boolean, why: string, action?: Action },  // e.g. Kubernetes appears when manifests exist
  toolbar?: Action[],                   // view-level actions (New file, Collapse all, Filter, ...)
  filters?: Menu,                       // view filter menu (worktree owner filter etc.)
  sections: Section[],
  empty?: { kind: 'not_relevant'|'not_configured'|'unavailable'|'no_data'|'no_results', text, action?: Action },
  notes?: string[],
}

Section = {
  id, label,                            // "Staged", "Not staged", "Containers"
  count?: number | string,              // plain count, or a short phrase "6 active, 1 orphaned"
  open?: boolean,                       // default open state (expanders are collapsed by default except canon shelves)
  kind?: 'list' | 'tree' | 'facts' | 'chain' | 'form' | 'graph',
  actions?: Action[],                   // section actions (Stage all, Pull, Cleanup...)
  items: Item[],
  form?: Field[],                       // inputs (commit message, filter, dispatch inputs)
  note?: string,
}

Item = {
  id, kind,                             // see "Item kinds"
  name,                                 // the identifying text
  mono?: true,                          // name is code-like (paths, branches)
  icon?,                                // PM_ICONS name (file type icons: rust, ts, js, svelte, sql, toml, yml, xml, md, ...)
  path?,                                // full path for files and worktrees
  status?: Status,
  letter?: 'M'|'A'|'D'|'?'|'C',         // file status letter (F-074)
  meta?: string[],                      // short facts, most important first
  diff?: { add: number, del: number },
  time?: string,                        // "4 min ago"
  owner?: string,                       // "Thread: import fixes", "Orch: lane B API", "Manual"
  facts?: Fact[],                       // shown when the item is opened
  actions?: Action[],                   // primary first; destructive last with danger: true
  quick?: Action[],                     // the original hover quick actions
  blocked?: { code, reason, allowed: Action[] },   // stays visible while collapsed
  note?: string,
  children?: Item[],                    // tree folders, compose services, nested scopes
  open?: boolean,
  attrs?: { [k]: string },              // contract attributes to carry onto the rendered row (data-path, data-kind, ...)
  canon?: string,
}

Status = { state, word }               // state is one of the vocabulary below; word is the plain status word
Fact = [ label, value, { mono?, state?, group? } ]   // group "Technical details" collects raw IDs

Action = {
  label,                                // visible text, sentence case
  icon?,
  cmd,                                  // data-demo-action, exactly as the original (or the canon id for additions)
  arg?,                                 // data-demo-arg, exactly as the original
  commandId?, uiActionId?, availability?, disabledReason?,  // carried as data-command-id etc. when present
  disabled?: string,                    // human reason; renders aria-disabled + data-demo-reason
  danger?: true, primary?: true,
  key?: string,                         // shortcut hint ("F2", "Shift+Delete")
  menu?: menuId,                        // opens a menu instead of dispatching
  attrs?: { [k]: string },
  canon?: string,
}

Menu = {
  id, label,                            // label shown on the trigger / as the menu title
  value?,                               // selected value
  search?: true,                        // long lists get a search box
  groups: [ { label?, items: MenuItem[] } ],
}
MenuItem = { value?, label, meta?, icon?, cmd?, arg?, selected?: true, disabled?: string, danger?: true,
             submenu?: menuId, key?: string, attrs?: {}, canon?: string }

Field = { id, label, kind: 'text'|'textarea'|'toggle'|'select', placeholder?, value?, menu?: menuId, action?: Action }
```

## Status vocabulary

`ok` (clean, healthy, passed, current), `running`, `paused`, `stopped`, `pending` (queued, not started),
`warn` (degraded, needs attention, dirty), `failed` (error, crashed), `blocked` (policy, permission, protected),
`stale`, `unknown`, `info`, and the file states `modified`, `added`, `deleted`, `untracked`, `conflict`, `ignored`.
The `word` is the plain word a person reads ("running", "exited 1", "orphaned", "needs review").

## Item kinds

Files: `folder`, `file`, `changed` (Changed view rows), `open` (open editors), `recent`.
Source Control: `change` (a changed file), `worktree`, `commit`, `branch`, `stash`, `remote`, `review`, `gate`,
`conflict`, `operation`, `bookmark`, `current-change`, `fact`.
Docker: `container`, `image`, `service`, `scenario`, `registry`, `build-target`, `stage` (publish chain), `network`,
`volume`, `context`, `k8s`, `event`, `summary`.

## Canon additions (from Plans; mark each with `canon`)

Files (F3-529, F-074, F-079, F2-205, F-081): "Restore this file" action on files (`ui.source_control.backup_history.open`
style route via `cmd.backup.browse`, canon F3-529), a reveal-hidden notice example, folder rollup of the strongest child
status, the ops tray (one copy in progress with cancel), trash-first Delete (Delete = move to trash with undo,
Shift+Delete = permanent behind confirm), Open in Source Control / Open diff / Open compare in the context menu, Open in
Panel 1-4 submenu above the divider.

Source Control (SCS-005, SCS-023, SCS-024, W-075..079, JJI §4.1, FGI-004/018, DL-062): views Changes, Workspaces
(Git label "Worktrees" kept for Git, "Workspaces" for Jujutsu), History, Branches (Git) / Bookmarks (Jujutsu), Reviews;
Jujutsu adds Operation Log. Changes gets an Untracked group and a Conflicts group (one example conflicted file with Open
Conflict Assistant `cmd.source_control.open_conflict`); whole-file staging uses `cmd.git.stage` / `cmd.git.unstage`
(keep the original hunk actions where they were per-hunk); Fetch/Sync via `cmd.source_control.remote.fetch` /
`.sync` alongside the original pull/push/fetch; `cmd.source_control.status.refresh` in the header. Worktree rows:
lifecycle word (reserved, active, blocked_preserved, released, orphaned), owner, relative last activity, a main
worktree row that cannot be removed; expanded facts ahead/behind, last commit, dirty summary, absolute path; Lock,
Request prune (dry run first), Remove. Reviews view: Pull request #128 with draft/ready, merge strategy shown, and one
gate list (rows with source and enforcement: required / advisory / not enforced / unknown). Raw SHAs and Jujutsu
change/commit/operation ids in Technical details. Publish preview: one push target (fix the duplicate "plus Origin
mirror" to a single fan-out list per SCS-015). Jujutsu: Current Change with Describe and Abandon added, bookmark states
synced / unsynced / tracked per remote / combined / absent, Split disabled with "Needs an interactive editor session".

Docker (CRAU-095..103, F3-410): a context block naming Execution Host, Execution Environment and Source Location
(Home Server default) instead of "ctx default", readiness word (ready / setup_required / ...); container actions use
`cmd.docker.container.*` canon ids where the original used aliases (keep the original id in `attrs['data-legacy-cmd']`);
views Networks, Volumes, Contexts (each with 2-3 example rows, `canon`), Kubernetes as a conditional view (shown: false,
with "Show Kubernetes" action and why it is hidden); an "Open Docker/Hosts page" action (`cmd.docker.hosts.open`);
one daemon-state example in the Contexts view (a remote context "unreachable" with one recovery action).

## PM_ICONS names available

Rail set: folder, folderOpen, file, files, chevL, chevR, chevD, scissors, clipboard, eye, eyeOff, compose, chat, search,
source, actions, docker, tests, agents, artifacts, x, plus, minus, check, warn, info, refresh, external, diff, merge,
pr, trash, play, stop, pause, copy, terminal, cog, filter, clock, layers, flame, upload, link, user, spark, bell,
pull, push, fetch, branch, stash, globe, monitor, pin, key, book, camera, arrowUp, arrowDn, grip, edit, filePlus,
folderPlus, boxMinus, boxPlus, stepOver, stepInto, stepOut, bpLine, bpCond, bpLog, and the file types rust, ts, js,
svelte, sql, toml, yml, xml, md. Use only these names; pick the closest one rather than inventing a name.
