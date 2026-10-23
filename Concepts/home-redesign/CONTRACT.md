# Home panels: tab-kind registry and host contract

Contract version **1.3** (2026-10-10; section 15 lists the changes). Owner: the panels concept thread (branch
`concept/home-panels-20261009`). Readers: the terminal thread (it plugs the Terminal kind in), the Plans thread (canon
follows this), and the later 5.6 Pro chat port (its `openEditor` contract maps onto section 6). Decisions D1-D28 are in
`/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md`, and D17a and D29-D41 are in the addenda
beside it (`DECISIONS-ADDENDUM-1.md` to `DECISIONS-ADDENDUM-3.md`); where this file and the decisions disagree, the
decisions win and this file is wrong.

Changes to this file are additive within a version. A breaking change bumps the version, is listed in section 15, and
is announced to the terminal and Plans threads before it is pushed.

## 1. Package, ownership, namespaces

```
Concepts/home-redesign/
  CONTRACT.md, README.md, concept-hub.json      panels thread
  tools/home_layer.py, tools/build_home.py       panels thread (apply / lint / syntax_check / published_problems,
                                                 the review copy)
  src/panels/css/*.css, src/panels/js/*.js       panels thread (engine, strip, menus, every kind except Terminal)
  src/terminal/{js,css,schemes,harness}/         terminal thread; also src/terminal/SPEC.md (its faces are the
                                                 page's own, opus-5.5 src/fonts, DL-161)
```

| Owner | JS global | CSS classes | Data attributes | Storage keys |
|---|---|---|---|---|
| Panels | `window.PM_HOME` (public API), `window.PMW` (engine internals, tests only) | `pmw-` | `data-pmw-*` | `pm.home.panels:v1:<project>`, `pm.home.settings:v1`, `pm.home.dashboards:v1:<project>` (custom dashboard names, section 3.1) |
| Terminal | `window.PMT` | `pmt-` | `data-pmt-*` | under `pm.home.terminal:v1:*` if it needs its own |

Nobody else's prefix is used in either tree. The hover thread owns `PMH` / `pmh-` / `data-pmh*`, Usage owns `PMU` /
`pmu-`, the rail owns `PMR` / `pmr-`.

### 1.1 How the layer assembles the page

`tools/home_layer.py` `apply(text, need)` is step 5 of `Concepts/onboarding/opus-5.5/tools/build.py`'s `build_text()`,
after Settings, Usage and the rail, so `build.py --publish-pm7` publishes it into `PMConcept7.html`. It adds, between
`<!-- HOME:CSS:START/END -->` and `<!-- HOME:BODY:START/END -->`:

1. `<style id="pm-home-css">`: `src/panels/css/*.css` sorted, then `src/terminal/css/*.css` sorted. Font refs
   `url("o55font:<file>")` are inlined as `data:` URIs from `src/panels/fonts/`; the terminal's faces and JetBrains
   Mono are the page's own (opus-5.5 `src/css/01-webfonts.css` and `src/fonts/`, DL-161).
2. `<script id="pm-home-js">`, in this order, each part in its own `try { (function () { 'use strict'; ... })(); }`:
   - the panels core: `src/panels/js/*.js` sorted, one shared scope, publishes `window.PM_HOME` and `window.PMW`;
   - the terminal: `src/terminal/js/*.js` sorted, one shared scope of its own, wrapped as
     `(function (PM_HOME) { ... })(window.PM_HOME)`. It publishes `window.PMT` and calls `PM_HOME.registerKind(...)`;
   - the panels kinds that depend on nothing else, then `PM_HOME.boot()`.
   A failure in one part logs `[pm-home] <part> failed` and leaves the others running.
3. The NieR selector-list patches for every new hook class (section 11).

`src/terminal/harness/**` and `*.md` are never inlined. The lint (section 13) runs over the whole of `src/`, the
terminal tree included.

## 2. Tab ids and kinds

A tab id is an opaque, stable string. Its prefix names its kind, so a caller that only has an id (the chat) still
lands in the right kind. One id is one tab in the whole workspace: opening an id that exists reveals it (D7).

| Kind id | Tab id forms | Notes |
|---|---|---|
| `editor` | `file:<path>`, `buffer:<n>` | `file:` also carries diff mode (`state.mode = 'diff'`), the chat's diff views use it |
| `terminal` | `terminal:<session>` | one session per tab (D11); the terminal kind mints the session id |
| `browser` | `browser:<n>`, `link:<host>\|<title>` | `link:` is the chat's fetched-page record |
| `dashboard` | `dashboard:<board>` | `dashboard:home` is the pinned Home dashboard; the built-in boards are `home`, `metrics`, `monitoring` and `agents`, and a custom dashboard is `dashboard:dash-<n>` (section 3.1) |
| `plan` | `plan:<id>`, `plan-query`, `deep-discovery:<run>` | sticky Build / Revise / More footer |
| `document` | `teach:`, `memory:`, `revert:`, `debug:`, `lens-source:`, `lens-effective:`, `wonderer:`, `wonder-source:`, `doc:<path>` | rules, memory, revert, debug investigation, lens source, wonderer |
| `artifact` | `artifact:<id>`, `artifact:<id>@v<n>`, `artifact-revision:<encoded JSON>` (the chat's versioned route), and the chat's bare artifact ids passed with `kind: 'artifact'` | per-kind subtype in `state.subtype` |
| `run` | `collab-run:`, `crew-work:`, `review:`, `room:`, `brainstorm:`, `review-evidence:`, `brainstorm-evidence:` | Crew, Review, Chat Room, BrainStorm and their evidence |
| `transcript` | `thread-<agentId>` | read-only live feed |
| `context` | `context:<threadId>` | thread-keyed context detail |
| `record` | `search:`, `mcp:`, `app:`, `work-record:` | read-only tool-call records |
| `output` | `output`, `output:<channel>` | one Output tab, the channel is its view state (D31); a channel opened as its own tab from the picker is `output:<channel>`, fixed to that channel |
| `problems` | `problems` | one per workspace |
| `ports` | `ports` | one per workspace |
| `debug-console` | `debug-console` | one Debug Console tab with a sub-tab per debug session; the session on screen is its view state (`state.session`, D33). The sub-tabs are a tablist in the header row; the chosen one is filled on its own box and never underlined (the lead's ruling of 2026-10-10, DR-069, F3-648, D5), the chosen fill every segmented toggle shares (section 5.1): each look's neutral selection fill in Basic, Friendly and Glass, never an accent (the lead's ruling of 2026-10-11; Glass with its 1 px rim along the top edge), Retro's reverse video, NieR's ink block with or without the cursor part, moving in the look's own tab-change voice (a plain glide in Glass) and instant under Reduced Motion (NUMBERS has the values). `PM_HOME.open({ kind: 'debug-console', session })` reveals the tab and switches it. The ids of the old one-tab-per-session shape, `debug-console:<session>`, fold into this tab with that session chosen (section 3, `fold`) |

Retired, never registered: the chat's Goal tab (`goal-artifact`, DL-147), its lab-only workspaces (`order-export:`,
`b16-work:`, `b17-work:`, `bsd12:`, `eli5-evidence:`). Activity Detail stays inside the chat (D3) and is not a kind.

`PM_HOME.kindOf(id)` returns the kind for an id (`null` for an unknown prefix). A kind can claim more prefixes in its
registration (section 3); two kinds claiming one prefix is a boot error. `PM_HOME.kindOf('output')` returns `'output'`
for the bare id even before the Output kind registers, as it does for `problems`, `ports` and `debug-console`.

## 3. Registering a kind

```js
PM_HOME.registerKind('terminal', {
  label: 'Terminal',            // "+" menu row, empty-panel launcher, "+N" list group heading (plural from group)
  group: 'Terminals',           // "+N" list group
  icon: 'terminal',             // a PM_HOME.icons name, or an SVG string drawn at 14 px in a 16 px slot
  prefixes: ['terminal:'],      // ids this kind owns
  min: { w: 320, h: 120 },      // content minimum; a panel's minimum is the largest of its tabs' minimums
  dedicated: true,              // a panel holding only these tabs is skipped by file opens (D7) and its Ctrl+T makes one
  idFor(spec) { ... },          // stable tab id for an open spec; may mint one (terminal: a new session id)
  canonical(id, spec) { ... },  // optional: one tab per canonical id (plan-query -> plan:ap-index, collab-run:X -> room:X)
  fold(id) { ... },             // optional: an older id form -> { id, state } (debug-console:<s> -> debug-console, { session: s })
  labelFor(id, state) { ... },  // optional: the label of a tab not mounted yet (background, agent-opened, restored)
  iconFor(id, state) { ... },   // optional: its icon likewise (a PM_HOME.icons name)
  plus: {                       // optional: a row in the "+" menu and the empty-panel launcher
    order: 10,                  // rows sort by order; section 7 lists the built order
    shortcut: 'Ctrl+Shift+`',
    sub() { return PMT.profiles(); },   // optional sub-row: [{ id, label, detail, icon, group? }] (below)
    spec(subId) { return { kind: 'terminal', profile: subId || null }; }
  },
  tabMenu(state, tabId) {       // optional: rows appended to the tab's menu (right-click, Shift+F10) after a hairline
    return [{ id: 'notify-mute', label: 'Mute notifications', detail: 'System notifications from this terminal', checked: false, run() {} }];
  },
  mount(host, state, api) {     // build the tab's body; return the instance (below)
    return { unmount() {}, serialize() { return {}; } };
  }
});
```

`tabMenu(state, tabId)` gets the tab's state as its `serialize` gives it when the menu opens (the saved state for a
tab that is not mounted or has no `serialize`), so a row such as the mute shows its current check, and returns items
in `api.menu`'s shape (section 4): `detail` is the second line, `checked` is honoured, `run` is called; missing or `[]`
adds nothing.
The rows go last in the tab menu, after a hairline (the terminal's notification mute, D38).

`plus.sub()` returns one flat list. Entries without a `group` are the row's inline sub-row, every one of them unless
the kind caps them with `plus.subMax` (the Terminal row lists all the installed shells, D39). Entries with a `group` go
into one row of their own right under the kind's row, with a submenu of them; `'ssh'` renders as the row "SSH hosts"
(one submenu row per host: its `label`, its `detail` as the second line; the body opens it in this panel, the trailing
cell in a new panel). There is no group row when no entry has that group; the "+" field finds the entries by label and
detail. A group the panels do not know stays inline; the panels map groups to rows in one table (`PMW.SUB_GROUPS`,
`js/38-menus.js`). `plus.spec(id)` opens any of them.

`fold(id)` names an older id form the kind folds into one tab, with the view state that id carried: it returns
`{ id, state }` or `null`. Opens, saved layouts, saved named layouts, the reopen list and the tour's snapshots all pass
through it (`PMW.foldId`, `PMW.foldLayout`), so an old id never becomes a tab of its own; two old tabs that fold into one
keep the record of the one used most recently. The state rides in the open as kind fields, so it reaches a new tab's
state or an open tab's `reveal`.

`mount(host, state, api)` is called once per tab when the tab is first shown (lazily: a restored background tab is
not mounted until it is activated, unless the kind sets `eager: true`). The body is already attached to its panel and
laid out when `mount` runs, so `api.size()` is valid there (an eager background tab is attached hidden); the first
`onResize` after mount is still where size-dependent work belongs. Arguments:

- `host`: the tab body element. It is the tab's own box, sized by the panel, `container-type: size` and
  `container-name: pmw-body`, `overflow: hidden`, `position: relative`. Draw everything inside it. Never size
  against the window (`innerWidth`, viewport `@media` width queries): use `@container pmw-body (...)` or
  `api.size()`.
- `state`: the restored state from `serialize()`, or for a new tab the open spec (section 6) minus the host fields
  (`where`, `by`, `background`, `focus`, and `mode` when it is `'preview'` or `'keep'`). Any other `mode` (a view such
  as `'diff'`) reaches the kind as `state.mode`, and `title` reaches it as `state.title` (it stays the hover title).

A tab's strip label is, in order: the user's rename, the label the kind pushed with `api.update`, `labelFor(id,
state)`, the state's file name or `title`, the open's `title`, the kind's `label`. Its icon: one pushed with
`api.update`, `iconFor(id, state)`, the kind's `icon`; the strip, the "+N" list, the every-tab list and the recent-tabs
switcher all show it. `labelFor` and `iconFor` treat `state` as read-only; a throw or an empty value falls through.
- `api`: the per-tab host API (section 4).

The returned instance may implement any of:

| Method | When |
|---|---|
| `unmount()` | the tab closes, or its panel is destroyed; release timers, observers, sessions |
| `serialize()` | the layout is saved; return JSON-safe state, at most 16 KB (no scrollback, no buffers) |
| `onResize({ w, h, final })` | after the body's size changed, batched to one call per frame; also called once after mount. `final` is `false` while a divider drag or a layout animation is still moving the body and `true` on the last call, so costly work (a terminal's reflow and PTY resize) can wait for it |
| `onShow()` / `onHide()` | the tab became the active tab of a visible panel / stopped being visible (another tab, collapsed panel, maximized sibling, narrow switcher). Stop animation work while hidden |
| `onFocus()` / `onBlur()` | keyboard focus entered / left the tab body |
| `onLook(look)` | look changed (section 10); CSS does most of this, use it for canvases and computed colours |
| `wantsKey(event)` | asked before the host handles a shortcut while focus is inside the body; return `true` to keep the key (section 9) |
| `canClose()` | before a close; return `true`, `false` or a Promise of either (dirty editors confirm here; a running terminal says what it ends) |
| `focus()` | the host wants keyboard focus inside the body (activation by keyboard, `open` with focus) |
| `reveal(fields)` | an open of this tab's id while it is mounted: every kind field the open carries (`line`, `col`, `mode`, `url`, `channel`, `invocation`, `rerun`, `title` ...). It must tolerate keys it does not know. Without `reveal`, or while the tab is not mounted, the fields merge into its saved state |

### 3.1 The Dashboard kind (D10, D35; `kinds/30-dashboard.js`)

A dashboard tab holds one board of the Usage board engine (`PMU.boards.create`, `Concepts/usage-redesign/src/js/40-board.js`),
except Agents, which the kind draws itself. The tab serializes `{ board }` (plus `filter` on Agents); everything on the
board lives in the board's own store, written by the engine.

- **Boards and keys (D10 round two P5).** A board's contents belong to the project the panels' layout is bound to
  (`PMW.persist.boundId`): `widget_layout:v1:<project>:<board>`. Every board is created with `projectId` and never a
  `storeKey`; the Usage page's own key stays `widget_layout:v1:usage`. A board's unscoped key from before
  (`widget_layout:v1:<board>`) is adopted once, by the first project that shows that board, and removed. A project switch
  (16-persist.js `checkProject`, seen through the `'layout'` event and the project label) calls `board.setProject(id)` on
  every mounted board whose tab the new layout keeps, hidden ones too; a tab the new layout drops unmounts and writes
  its last state to the project it belonged to.
- **Custom dashboards (D35, PLN-4).** New dashboard mints `dash-<n>`: one more than the largest `n` over the open tabs,
  the reopen list, this project's keys, the unscoped `widget_layout:v1:dash-<n>` keys not adopted yet, the names and
  the live boards. It starts empty (P13). A custom dashboard has a name, kept per project in
  `pm.home.dashboards:v1:<project>` = `{ schema_id: 'pm.home.dashboards.v1', names: { 'dash-<n>': name } }` (trimmed,
  80 characters at most, never the name of a built-in board or another of this project's dashboards (' 2' is added);
  "Dashboard n" is the default and is not stored). Rename dashboard... sets it and renames the
  tab with `cmd.panel_tab.rename`; a rename of the tab sets it too, and clearing that rename clears it. The name shows on the
  tab, in the header facts, in the Board menu's dashboards, in the "+" menu's 'Your dashboards' row (the
  custom dashboards are `plus.sub()` entries with `group: 'dash'`, one submenu row under Dashboard, so the inline links
  stay the four built-ins and New dashboard) and in the catalog
  (`PM_HOME.catalog`, item `dashboard:dash-<n>`; an item for a dashboard that is deleted, or that belongs to the project
  left behind, is removed with `PM_HOME.catalog.remove`). A project lists only
  its own custom dashboards: the open ones, the stored ones (a closed one keeps its key while it is in the reopen list,
  P6) and the named ones. Delete dashboard... (custom only, confirmed) closes the tab, drops it from the reopen list and
  forgets it. Home, Metrics, Monitoring and Agents can be reset but never renamed as a board or deleted.
- **Forgetting.** `PMW.dashboard.forget(board, project?)` is the one place that drops a board's stores:
  `PMU.boards.forgetKey(board, project)` (the key and its `:quarantine`) and a custom dashboard's name. Delete
  dashboard and P6 (a custom dashboard leaving the reopen list while not open) go through it.
- **Header row.** Facts: the name (strong); the Live mark while Live readings are on and the board holds a Usage widget
  (the Usage page's indicator in each look's words: Live, `[LIVE]`, `LIVE`; one pulse per beat the board patches, from
  the board's `'beat'` event through `PMU.live.pulse`, none between beats, none under Reduced Motion); "Demo time HH:MM"
  (`PMU.boards.hour.label()`) while the demo hour runs, read on paint, on each beat and every 2 s while it plays and the
  tab is on screen; "N widgets" (or "No widgets"); the range, and the scope when it is not All. Actions: Add widget,
  Board, Maximize.
- **Add widget.** Every widget the board can be given (`board.catalog()`), one section per Usage room in room order,
  then one section per other widget source (P3: `PMU.boards.sources`; its widgets have no home room and a prefixed id
  such as `orch:<id>`) under the source's label; a widget on the board is checked and disabled. A pick is `board.add(id)`
  (`cmd.widget.add`).
- **The Board menu, in order.** Dashboards: Home, Metrics, Monitoring, Agents, each custom dashboard of this project by
  name (its widget count as the second line), New dashboard; the current one is checked and has focus. This dashboard:
  Range, Scope, Start from, Save as preset..., Tidy, Reset widgets. Live: Live readings (checked while on; one switch
  for the whole page, the Usage page's own, `PMU.boards.live.set(on)`), then Play the next hour
  (`PMU.boards.hour.play()`; disabled with a reason where `PMU.boards.hour.available()` is false) or, while the hour
  runs, Back to now (`PMU.boards.hour.back()`). Then, on a custom dashboard only, after a hairline: Rename dashboard...
  and Delete dashboard.... Agents has Dashboards and Show (its filters).
- **Start from (P4).** A submenu of `board.sets()` in four groups: This dashboard (`default`), Dashboard starter
  (`host:dashboard`), Usage rooms (the 13 `room:<id>` sets in room order), Your presets (`user:<id>`); each row its
  label, its detail as the second line (without the words its group already says; a preset adds the day it was saved),
  the active set checked and focused. With no presets, Your presets holds "Save this dashboard as a preset..."; with
  some, a last row "Rename or delete presets" opens them (each: Start from this preset, Rename preset..., Delete
  preset... with a confirm). A filter field appears once there are more than three presets. A pick is
  `board.startFrom(id)`: one `cmd.widget.reset_layout { scope: 'room', room: <board>, set_id: <id> }`. `null` (a set that
  is gone) says so; `dispatch_accepted: false` is left to the engine's own notice. Otherwise the board's committed
  layout revision just before the pick (`board.revision()`, the envelope's `committed_revision`) and its envelope at
  that revision (`PMW.dashboard.snapshot([board])`, flushed first) were kept, and an Undo notice offers to put them back
  for 8 s, held while the pointer or focus is on it, ended by any later change to the widgets (not by the preset hold's
  own resizes) and by Escape. Undo (Plans WS-030, the lead's ruling of 2026-10-11) is
  `board.restoreRevision(rev, envelope)`: one `cmd.widget.reset_layout { scope: 'room', room: <board>, restore_revision:
  <rev> }`, never with `set_id`, one receipt and no `workspace.layout_changed`; accepted, the engine writes that
  envelope back (under this project) and reads it, so the board's records are exactly that revision's. It runs only
  while `rev` is the revision the Start from came from and nothing else has been committed on the board since
  (`board.restoreWhy(rev, envelope)` is null; the preset hold's resizes settle the set and do not count); otherwise
  nothing is dispatched, and the notice's Undo is disabled (`aria-disabled`) with the reason as the notice's text and
  the button's hover detail ('stale': the widgets changed after this; 'envelope'; 'gone'), checked on a commit that
  leaves the notice up, on pointer or focus entering it and on the click. Reset widgets (`board.reset('room')`) goes
  back to the board's own default set, and when that changed anything it offers the same Undo, restoring the revision
  the reset came from (a custom dashboard's reset empties it).
- **Presets (P4).** Per user, shown on every dashboard: `PMU.boards.presets` (store `widget_presets:v1`). Save as
  preset... asks for a name in the package's prompt (`PMW.menu.prompt`, default the dashboard's name, made unique);
  rename uses the same prompt; delete is confirmed. Dashboards that started from a deleted preset keep their widgets.
- **An empty board** (count 0) shows the kind's invitation over the board, which stays laid out under it: a sketch of a
  board, "<Name> is empty", what to do, and Add widget and Start from... buttons; focus goes to its Add widget.
- **`PMW.dashboard`**: `reveal(board)`, `reset(board)`, `holder()`, `boards()` (the built-in ids, then this project's
  custom ones), `board(id)`, `name(board)`, `rename(board, name)`, `project()`, `key(board)`, `forget(board, project?)`,
  `snapshot(ids?)` (each listed board flushed, then its own key read: `b.STORE_KEY` for a mounted board, this project's
  key otherwise) and `restore(snap)` (each board's own key written, `null` removes it, mounted boards reloaded; an
  envelope saved in another project is written as this project's). The tour's snapshots and the named layouts' boards
  (P6) use these two, so both are per project. Applying a saved named layout puts back the boards it saved in this
  project only: an envelope saved in another project is skipped, a built-in board's included (board contents are per
  project, P5), and so is a custom dashboard that the applied layout does not hold (deleted or closed since); those
  keep what they hold (`26-actions.js` `namedBoards`).

## 4. The per-tab host API (`api` in `mount`)

Everything is push: the kind tells the host when its label or marks change; the host never polls.

| Call | What |
|---|---|
| `api.id`, `api.kind` | the tab id and kind id |
| `api.update({ label, title, icon, exitCode, agent, attention, dirty, busy })` | change the strip. `label`: short text (D12 terminal: process and folder); `title`: the full hover-tag text; `exitCode`: a number shows the failed-command mark and code after the label, `null` clears it; `agent`: an agent name shows the square agent mark and makes the tab's hover tag say who is driving, `null` clears it; `attention: true` shows the hollow square (cleared by the host when the user activates the tab); `dirty: true` shows the dot in the close slot; `busy: true` marks a running process (static glyph, never a spinner in Retro or NieR). Only the fields passed change |
| `api.size()` | `{ w, h }` of the body now |
| `api.isVisible()`, `api.isFocused()` | |
| `api.activate({ focus })` | make this tab active in its panel (and focus it when `focus: true`) |
| `api.close()` | close this tab (runs `canClose`) |
| `api.split(direction, spec)` | open `spec` (section 6) in a new panel beside this tab's panel. `direction`: `'right'`, `'down'` or `'auto'` (right when both halves stay at least the larger minimum wide, else down, else the new tab opens in this panel). Returns the open result |
| `api.toggleMaximize()`, `api.isMaximized()` | maximize is a flag outside the tree (D1); Esc in the strip or the same command restores |
| `api.open(spec)` | same as `PM_HOME.open` with this tab as the opener (its panel counts as the source for routing) |
| `api.menu(items, anchor, o?)` | open a host menu (the picker look every PM menu uses) at an element, or at a point (`{ x, y }` or a mouse event) for a context menu; items `{ id, label, detail, icon, shortcut, disabled, reason, checked, danger, sub, run }`, `'-'` for a hairline; `sub` is an item array or a function returning one; `o` may carry `title`, `search`, `width`, `align`, `onClose`; a second call on the same anchor closes it; a row whose `run` throws is logged and the menu stays usable; `checked: false` gives an empty check slot, only `checked: true` shows the check |
| `api.saveSoon()` | persist the layout soon (about 250 ms, coalesced) after an in-tab view change; `serialize()` is read then |
| `api.announce(text)` | polite live-region announcement |
| `api.command(id, args)` | run a host command (section 8) |
| `api.settings` | the settings model (section 12) |
| `api.look()` | `{ family, mode, nier, reduced }` (section 10) |
| `api.on(event, fn)` | `'look'`, `'settings'`; returns an unsubscribe function, released automatically on unmount |
| `api.headerRow` | the shared header-row helper (section 5) |

## 5. The shared header row (D12, DRY)

Every kind that needs a row of controls above its content uses the same component, so terminals, browsers, plan
viewers and the rest look and behave alike. The host renders it; the kind supplies content:

```js
const row = api.headerRow({
  left: [ { id: 'cwd', text: '~/tastebook/api', mono: true }, { id: 'branch', text: 'main' }, ... ],
  actions: [ { id: 'find', label: 'Find', icon: 'search', shortcut: 'Ctrl+F', run() {} },
             { id: 'split', label: 'Split', icon: 'split', run() {} },
             { id: 'max', label: 'Maximize', icon: 'maximize', run() { api.toggleMaximize(); } },
             { id: 'more', label: 'More', icon: 'more', menu: () => [...] } ]
});
row.set({ left: [...] });   row.setAction('max', { label: 'Restore' });   row.el   // the row element
```

A fact (`left`) is `{ id, text | el, icon, title, detail, mono, strong, dim, grow }`: `el` is drawn in place of text,
`title` and `detail` become its hover tag (the label is `title`, or `text` when only `detail` is given), `mono` keeps a path's case under NieR's headers part, `grow` takes the row's
free width. An action is `{ id, label, icon, shortcut, detail, primary, danger, pressed, disabled, run(e, button),
menu }`, or `{ id, el }`, a ready-made element adopted into the actions area as it is (never cloned or restyled; it
stays while `set()` sends back the same id and element). `row.set({ left, actions, labelsAt })` patches in place: a
fact or button whose id survives keeps its node, so focus, hover and an open menu stay, and only what changed is
created or removed. An element moved between two rows can be out of the document for a moment, so a kind that does
that keeps its own reference. `spec.labelsAt` (px of the body width) moves the icon-only step from its default 520 px;
the row then carries `.is-icons` below it and `.is-labels` at or above it. A button with the `hidden` attribute is not
shown.

An action's `menu` (an item list, a function returning one, or a whole menu spec) takes the same item shape as
`api.menu` (section 4) and toggles on its button, which carries `aria-haspopup="menu"`; PMW.menu's own row names (a
string `sub` as the detail line, `right`, `submenu`) are also accepted, so either shape works there.

| Rule | Value (provisional until the panels thread confirms it in its report) |
|---|---|
| Row height | 30 px; controls are 24 px targets with 12 px text (11 px for secondary facts) |
| Labels shown | body width at least 520 px (or the row's `labelsAt`); below that, icons only, each with its hover tag (label plus shortcut) |
| Row hidden | body height below 150 px (the panel then holds only the strip and the content) |
| Classes | `.pmw-hrow`, `.pmw-hrow-left`, `.pmw-hrow-actions`, `.pmw-hbtn`, `.pmw-hbtn-label`; style through these, not by restyling the row |

A kind may draw its own row only when nothing in the shared one fits; say so in a note to the panels thread so canon
records why.

### 5.1 Shared frames and helpers (DRY: a kind uses these instead of its own copy)

- `PMW.frames.doc(spec)`, `.run(spec)`, `.meta(items)`, `.seg(spec)`, `.section(spec)`, `.notice(spec)`,
  `.tiles(spec)`, `.code(spec)`, `.button(spec)`: the document and run frames every reading kind draws in. `doc` and
  `run` take button specs or ready-made elements in `actions` and return `frame.actionEls` (`{ id: button }`) and
  `frame.actionsEl`, so a kind can set `aria-pressed` on a toggle. A run without an `aside` is one full-width column.
  `meta` draws its separators before the following item, so a dot never ends a line. Paragraph defaults inside a
  document body have zero specificity (78ch, no colour), so the body's 12 px rhythm and a kind's own rules win.
  Frame controls never take a look's full radius: `min(--pmw-radius, 8px)`, 0 in Retro and in NieR's square part.
- The chosen fill (the Plans canon lead's ruling of 2026-10-11, DR-069, F3-648, D5): a one-of-several control marks
  its chosen option by filling the option's own box, never with an underline or any one-sided line. `.seg` toggles (a
  tablist; Left and Right wrap and choose) and the Debug Console's sub-tabs already draw it; a kind's own tablist or
  radiogroup puts `.pmw-ink-row` on the group and `.pmw-ink-opt` on each option (chosen by `aria-selected` or
  `aria-checked`), and calls `PMW.frames.ink(group).move(fromOption, toOption)` on a change for the one ink that
  carries the fill in the look's own tab-change voice (instant under Reduced Motion; `.stop()` on a resize or a look
  change). The fill is each look's neutral selection fill, never an accent (the lead's second ruling of 2026-10-11):
  in Basic and Friendly the surface their chosen rows use (`--pmw-press`), one step stronger in their light modes; in
  Glass its selection frost, its reading plate in Glass light, with Glass's 1 px rim along the box's top edge (its
  material, as on its panel plate, on the filled box, never a marker by itself); Retro's reverse video; NieR's ink
  with or without the cursor part. Every fill reads at least 1.3:1 against its row, the chosen words take the panel
  tab's active ink (`--pmw-tab-active`) at 4.5:1 or more, and a count or state dot 3:1 or more. The hover is a quieter
  step on the same box, about half the chosen fill's; the ink glides in Basic and Glass (no liquid stretch) and
  springs in Friendly; the focus ring goes round the fill with a 1 px gap; weight and size never change with the
  choice. A toggle in the shared header row takes the row's height and, as its first fact, starts 4 px from the
  panel's edge (the row marks it). NUMBERS ('Chosen fill') has the values.
- `PMW.fileRef({ path, line, col, label, view }, { api, source, inline, short, icon, cls })`: the one D7 file
  reference (32 px, 24 px inline): a click previews after 240 ms unless a double click arrives (a link inside a
  document opens its preview in the same panel, which would hide the link before the second click), a double click
  keeps, Alt opens in a new panel, Ctrl or Cmd in the background, Enter opens kept. `view: 'diff'` rides in the
  editor's state and stays a preview. Its hover tag names the file as written (`path:line`, detail "Click previews it.
  Double-click keeps it open.") and carries `data-pmh-tag="literal"`, the hover thread's opt-out: without it the
  page's tag controller swaps any text that looks like a path, a file name or host:port for generic copy. Tabs carry it
  too, and any element whose tag must show such text should. `PM_HOME.fileExists(path)` says whether the demo project has the file.
- `PM_HOME.catalog.add(kind, items)` / `.remove(kind, ids)` / `.list()` / `.find()` / `.open(id, o)` and `PMW.catalogPicker(anchor, { kind |
  kinds, title, placeholder, panelId, newPanel, sectionLabels })`: every openable thing a kind knows, and the one
  picker over them (`sectionLabels` names each kind's section).
- `PMW.registerIcon(name, svgPath, retroGlyph)` (also `PM_HOME.registerIcon`): a named icon in the 16 px stroke grammar
  with a one- or two-cell Retro glyph (no pictographs), for `api.update({ icon })`, `iconFor`, the strip, menus and
  header rows. Core icons are never replaced.

## 6. Opening things: `PM_HOME.open(spec)`

One module routes every open in the concept: the file tree (and its compatibility shim), chat file references, diff
views, search results, Ctrl+P, the "+" menu, the empty-panel launcher, agents, the terminal's links and command marks.

```js
PM_HOME.open({
  kind: 'editor',            // a kind id; omitted with a path = 'editor'; 'file' is accepted as an alias of 'editor'
  id: 'file:src/main.rs',    // optional; otherwise kind.idFor(spec)
  path: 'src/main.rs', line: 128, col: 14,      // editor
  text: '...', language: 'text', title: 'cargo test output',   // editor buffer (no path): read-only unless edit: true
  mode: 'preview' | 'keep',  // files only, D7: a person's single click opens 'preview' (the default for user file opens);
                             // a double click keeps; Ctrl+P with Enter, the "+" menu's recent files and agents open 'keep'.
                             // Any other mode is the kind's view ('diff'): it reaches state.mode and opens kept; a diff
                             // reference that should stay a preview passes view: 'diff' instead
  where: 'auto' | 'tab' | 'panel' | 'right' | 'down' | '<panelId>',   // default 'auto'
  by: 'user' | 'agent:<name>',  // default 'user'
  background: false,         // user-requested background open (Ctrl/Cmd+click); agents are always background
  ...kindFields              // anything else is passed to the kind as state (terminal: profile, cwd, session, invocation)
}) // -> { ok, tabId, panelId, created, reason? }
```

Rules, in order (D7, D8):

1. **One tab per id.** If the id is open, the existing tab is revealed: activated in its panel (scrolled into view,
   pulled out of "+N" if hidden there), and focused if the open focuses. If it is open in a collapsed panel, that panel
   expands. An open never moves an existing tab to another panel. The open's kind fields reach the open tab through
   its instance's `reveal(fields)` (section 3), or merge into its saved state while it is not mounted.
2. **Placement for a new tab** (`where: 'auto'`): the last-focused panel that accepts the kind. Documents (editor,
   plan, document, artifact, run, transcript, context, record) go to the last-focused panel that holds documents;
   panels holding only terminals, browsers or dashboards are skipped. A dedicated kind (terminal, browser, dashboard)
   goes to the last-focused panel holding that kind, else the last-focused document panel. With none, a new panel by
   the fit rule (right if both halves stay at least 280 px wide, else down, else the largest panel). Locked panels are
   skipped. `where: 'panel'` (Alt+click anywhere) is a new panel by the fit rule; `'right'` / `'down'` split the
   source panel; `'tab'` is the source panel itself.
3. **Preview** (files, D7, Jared: files referenced anywhere in the chat or its wizards "open the same way as the rules
   you stated for the file tree"): every file reference a person single-clicks opens as the panel's single preview tab
   (italic label), replacing the previous preview there: the file tree, file names and paths in chat messages and
   cards, the chat's diff views and Changes rows, transcript file records, search results, and the terminal's
   `path:line:col` links. A double click, editing, or dragging the tab keeps it. Ctrl+P with Enter and the "+" menu's
   recent files are deliberate opens and open kept tabs. Agent-opened files open kept, in the background (D8). So a
   user file open without `mode` is a preview; pass `mode: 'keep'` for a double click.
4. **Focus** (D8): `by: 'user'` opens and takes focus. `by: 'agent:<name>'` lands as a background tab with the
   hollow-square attention mark and an announcement, and never takes keyboard focus or changes the active tab of a
   panel the user is typing in.
5. **Narrow centre** (D4, below 600 px): new panels are not created; `where: 'panel'` and splits open in the next
   panel of the switcher instead, and say so in the announcement.

Convenience forms: `PM_HOME.openFile(path, { line, col, mode, where })`, `PM_HOME.reveal(id)`, and `PMW.fileRef`
(section 5.1) for a file reference drawn by a kind.

### 6.1 The chat contract (5.6 Pro `openEditor`)

| 5.6 Pro chat | Here |
|---|---|
| `openEditor(id)` (open or focus by stable id) | `PM_HOME.openEditor(id, { label, title, icon, render, kind, by })` returns the tab id. `render(body, ctx)` draws into a host-owned body (it is re-run when the chat calls `PM_HOME.refresh(id)`); `label` is a string or a function of the id; `kind` defaults to `kindOf(id)` |
| `editorTabLabel` slot | `label` as above, or `PM_HOME.update(id, { label })` |
| `closeEditor(id)` | `PM_HOME.close(id)` |
| `state.activeEditor` | `PM_HOME.active()` returns `{ tabId, panelId, kind }` for the focused panel; `PM_HOME.activeIn(panelId)` |
| close / active-tab events | `PM_HOME.on('close', fn)`, `PM_HOME.on('activate', fn)` with `{ tabId, panelId, kind, reason }` |
| narrow reveal | rule 5 above plus the narrow switcher; the chat is never a tab |

Other events: `'open'` (`{ tabId, panelId, kind, created, by }`), `'focus'` (focused panel changed), `'layout'`
(a structural commit: the page-side mirror of `workspace.layout_changed`), `'narrow'` (`{ step }`), `'look'`, and
`'chat'`: `{ floating }` when the chat pops out or docks back, `{ type: 'turn-finished', threadId }` when a reply
finishes (`threadId` is the chat's alias or History slug, not a title). `PM_HOME.on` returns an unsubscribe function.

Kinds reach the chat through `PM_HOME.chat`, never the chat surface directly:

| Call | What |
|---|---|
| `PM_HOME.chat.compose(text)` | shows the chat, puts the text into its composer (after an existing draft, on a new line) and focuses it with the caret at the end; empty text does nothing |
| `PM_HOME.chat.reveal({ thread, messageId })` | shows the chat, switches to the thread when the chat knows it, scrolls the message into view and marks it briefly; an unknown message shows the thread and announces "That message is not in this demo". Returns `{ ok, found, thread }` |
| `PM_HOME.chat.isOpen()` | the chat is docked, popped out, or open over the centre from its strip |

The chat column itself (D3, `js/46-chat.js`, `PMW.chatCol`): it shows and hides through `chatCol.setVisible(on)` (one
`cmd.panel.switch` with its receipt) and comes on screen through `chatCol.show()`, which follows the narrow ladder (where
the chat is folded to its strip it opens over the centre). The left rail's Chat entry (`#activityBar .icon[data-ab-id="chat"]`)
toggles the column on every page (D40): while the chat is on screen (`chatCol.isOpen()`) a click hides it, otherwise it
calls `show()`; it never changes the page in front, Enter and Space do the same when the page makes the entry
focusable, a press that becomes the rail's drag still reorders the rail (or hides the entry in More) and toggles nothing,
and the entry is lit while the column is shown (its folded strip counts), with the rail's own tile and accent, the same
mark as the open panel (concept D's `.d-abind-chat`, Jared 2026-10-14). The rail's Dashboard (HOME) toggle that sat under
it showed and hid the old dashboard, which the panels park; this layer removes it from the page (`APP_PATCHES` in
`tools/home_layer.py`). A popped-out chat starts back in its column
after a restart (D32): the float is never saved, while the column's visibility (`pm.home.chat:v1`) and its width (the
layout record's chat column `width_px`) are.

The column's saved state is the layout record's chat column, canon's v2 `chat_column` (SP-330, DL-180; the Plans canon
lead's rulings of 2026-10-10 and 2026-10-11): `{ width_px, history_pinned, keep_open }`, defaults `null`, `false`,
`false`. None of the three is a Settings value (SSYS-050), so no Settings row can show any of them.

- Width: `width_px` is the message area's width the user dragged (400-760, rounded; `null` is the default for the
  window). `chatCol.widthPx()` reads it. `chatCol.setWidth(width)` and
  `PM_HOME.command('cmd.workspace_layout.resize_surface', { surface: 'chat', width })` write it as one structural
  command (section 8): one `pm:command-dispatch`, one receipt, the one `workspace.layout_changed` event and a new
  revision, rolled back on a cancelled dispatch or a failed write. A drag on the resizer commits once on release (an
  Escape or a release with no movement commits nothing); its double-click (`chatCol.resetWidth()`) commits once with
  `width: null`. A width outside 400-760 is stored at the nearer bound; anything but a finite number or `null` is
  refused.
- History pinned or a flyout (D3): `history_pinned` is the typed UI action `ui.chat_column.pin_history` with
  `{ history_pinned }` (true or false; without it, a toggle), written like view state with the layout (no receipt,
  event or revision; UCC-203). `chatCol.historyPinned()` reads it and `chatCol.setHistoryPinned(on)` writes it. The chat
  surface that draws the History dispatches it: the hosted 5.6 Pro chat's pin in its History list's header and its
  header menu's "Keep History open" row (`data-ui-action-id="ui.chat_column.pin_history"`). The bus event
  `'chat:column'` `{ history_pinned }` tells the surface to repaint; a layout event (a project switch, a restore) does
  too. While the narrow ladder takes pinned History's width back (`narrow.state.histDropped`, section 7) the chat shows
  the History as its flyout and keeps `history_pinned`; it is pinned again when the room comes back.
- History width: pinned History adds its own width to the column, beside the message area (`chatCol.historyW(mw)`):
  the width the chat draws it at, which the surface works out (`historyWidth(mw)`: 240 px, 200 px while the whole column
  is under 540 px, or the width the person dragged the History's edge to, within the chat's own 170-360 px and 42 % of
  its pane), else `LADDER.chatHistoryW`. A drag of the History's edge moves only the History while it lasts; on
  release the column takes the new width, so the messages keep theirs (DL-233).
- Keep open: "Keep the chat open in narrow windows" (D4's pin) is the typed UI action `ui.chat_column.keep_open`
  (section 8), saved as `keep_open`. `chatCol.keepOpen()` reads it and `chatCol.setKeepOpen(on)` writes it like view
  state (no receipt, event or revision); `PM_HOME.command('ui.chat_column.keep_open', { keep_open })` is the same
  (without `keep_open` it toggles). Two menus carry it as the same checked row, `chatCol.keepOpenRow()`: the title
  bar's Home options and the chat's own header menu (the hosted 5.6 Pro chat's). With it on, the narrow ladder never
  folds the chat to its strip.

A named layout and Restore home layout keep the whole chat column; a project switch shows that project's own (a project
with no saved layout starts at the defaults). The settings `chat.width`, `chat.history` and `chat.pinOpen` stored
before are carried once at boot (`persist.migrateChatColumn`): a finite width (rounded into 400-760), `'pinned'` and
`true` go into this project's layout and every other project's saved layout, each only where that record still holds
the field's default, and the keys are dropped once this project's layout is written (nothing is carried or dropped
while an unreadable record waits to be set aside); a stored default is just dropped.
Settings' Chat Layout row (`general.visual.chat-layout-mode`) is retired (the planner's ruling on D3 and D32): the
opus-5.5 build draws it nowhere, its paint sends no `chat.layout`, and a stored value is cleared on first read with no
pop out and no notice, so nothing replays a pop out at start; `PM_HOME_WORKSPACE.popOutChat()` is `chatCol.popOut()`.

The chat takes the browser kind's bus events: `'browser:capture'` `{ tabId, capture: { kind, w, h, comp, at, title,
url } }` becomes an attachment card in its composer (a 1 px box with the look's corner, never a pill), and
`'browser:send'` `{ tabId, how: 'send' | 'list' | 'insert' | 'capture', what }` posts, lists or inserts it. The chat
surface on screen registers `PMW.chatCol.surface = { drawsHistory(), shown(), compose(text), reveal(o),
historyWidth(mw) }`: the hosted 5.6 Pro chat does (app.js `claimSurface`, over `pm7-port/js/00-host.js`). The column
widens for a pinned History only while `drawsHistory()` is true. The scripted stand-in chat that held this slot before
the port (`kinds/95-standin-chat.js`) was removed on 2026-10-23 (DL-233).

### 6.2 Compatibility shims (kept until the callers move)

- The left rail's plain file click (today straight into editor pane 1) goes to `PM_HOME.open({ path, mode: 'preview' })`;
  its double click to `mode: 'keep'`.
- `revealBottomTab(name)` / `switchBottomTab(name)` for Terminal, Problems, Output, Ports, Debug: reveal or open the
  tab of that kind under rule 2.
- `PM_HOME_WORKSPACE` keeps the members the tour and other modules call (`layout`, `reset`, `o55RestoreSnapshot`,
  `failNextPersistenceWrite`, `setSurfaceVisible('chat', ...)`, `popOutChat`) as thin wrappers; the rest return
  `{ ok: false, reason: 'retired' }`.

### 6.3 The left rail (agreed with the left rail lead, 2026-10-09)

- **File opens from the rail.** The rail's concept D is a skin over the shell's own nine panels and never opens files
  itself; every click goes through the shell rows' `data-demo-action` / `data-path` handlers. The panels reroute behind
  those handlers: they re-register the demo engine's `cmd.file.open` action (the router hands it the click event, so a
  double click keeps, Alt+click opens a new panel, Ctrl/Cmd+click opens in the background) and never replace a row
  element or its `data-*` attributes (D's undo registry restores the shell byte for byte).
- **The narrow hook.** The ladder writes `data-pm-rail-fold="eased"` or `data-pm-rail-fold="overlay"` on
  `#sidePanelSlot` (removed when docked) and dispatches the document event `pm:rail-fold` with
  `{ mode: 'eased' | 'overlay' | 'docked', width }` (240 eased, 280 as an overlay, at least 240). Never on `<html>`.
  The home layer only places the overlay (position, width, stacking, dismiss); the rail's concept D gives it its look
  per family (an opaque plate, a hairline, the family's shadow and entrance) and refits on the event (main
  37de861164).
- **The Chat entry.** A click on the rail's Chat icon shows or hides the chat column and never changes the page in front
  (D40, section 6.1); the panels answer it in the window's capture phase, ahead of the page's own handlers, and leave a
  press that becomes the rail's drag to the rail.
- **Build order.** Settings, Usage, the rail (`rail_layer.apply_published`, step 4 of opus `build_text()`), then the home
  layer (`home_layer.apply`, step 5), which inserts just before `</head>` and `</body>` and never rewrites the rail's
  band markup. `build.py` and `--publish-pm7` write the published page with it; `build.py --check` adds the layer's
  lint and `home_layer.published_problems()` (both scripts parse, the HOME markers and the tour's
  `failNextPersistenceWrite` anchor exactly once, the app patches in place, the Home block after the rail's).

## 7. The "+" menu and the empty panel (D6)

The "+" sits right after the last tab and opens the menu; it never creates a tab by itself. Ctrl+T makes a new tab of
the panel's usual kind (its dedicated kind, else its active tab's kind, else Editor buffer). Each row's body opens a new
tab in this panel; its trailing cell opens a new panel (fit rule); Alt+click or Alt+Enter does the same anywhere.
Kinds join through `plus` (section 3). Built order:

| Order | Row | Shortcut | Sub-row |
|---|---|---|---|
| 10 | Terminal | Ctrl+Shift+` | profiles from `PMT.profiles()`: `[{ id, label, detail, icon, group? }]`; every entry without a group inline (all the installed shells), each clickable |
| (10) | SSH hosts (only when an entry has `group: 'ssh'`) | | one row with a submenu, right under Terminal: one row per host (label, detail as the second line), the body opens it here, the trailing cell in a new panel (D39) |
| 20 | Browser | Ctrl+Shift+B | |
| 30 | File... | Ctrl+P | three recent files inline, each clickable |
| 40 | Dashboard | | Home, Metrics, Monitoring, Agents, this project's custom dashboards by name, New dashboard (section 3.1) |
| 50 | Plan or document... | | |
| 60 | Artifact... | | |
| 70 | Output, Problems, Ports, Debug Console | | one row with a submenu |
| hairline | Split right (Ctrl+\\), Split down (Ctrl+Shift+\\), Reopen closed tab (Ctrl+Shift+T; Alt+Shift+T in a browser) | | |

A type-to-filter field heads the menu ("Open anything: kinds, files, URLs"); typing lists a group row's entries
themselves (an SSH host is found by its label or its detail, and Enter opens it). The empty-panel launcher shows the same
rows as full-width list rows (no tiles, no pills), each row's inline sub-row under it, a submenu row opening its list
from the row, then Recent. A sub-row that wraps starts its new line with an entry, never with the separator dot.

## 8. Commands

Every committed structural change is one command with a receipt and emits the one existing event
`workspace.layout_changed` (no new event family); an open that only reveals an existing tab emits nothing. Previews
(hover, drag, menu open, the "+" menu, the "+N" list, panel menus) dispatch nothing; a changed release commits once; a
failed commit rolls back. Activation, maximize and the chat column's two pins (keep open, History pinned) are view
state: typed local UI actions (`ui.panel_tab.activate`, `ui.workspace_layout.maximize`, `ui.chat_column.keep_open`,
`ui.chat_column.pin_history`) with no receipt and no event, written with the layout's view-state block or its chat
column. The chat column's width is a structural commit (`cmd.workspace_layout.resize_surface` with `surface: 'chat'`).
Names agreed
with the Plans thread on 2026-10-09; the concept keeps them in one table (`src/panels/js/02-commands.js`).

| Command | Args | Notes |
|---|---|---|
| `cmd.panel_tab.open` | open spec | `cmd.file.open`, `cmd.nav.open_subject`, `cmd.browser.open_workspace_preview` and `cmd.terminal.open` keep their ids, carry the same placement fields (`where`, `mode`, `by`, `background`) and resolve through this one module |
| `ui.panel_tab.activate` | `tabId` | view state (no receipt, no event) |
| `cmd.panel_tab.close` | `tabId` | `cmd.editor.close_tab` is an alias |
| `cmd.panel_tab.rename` | `tabId, label` | a user label that the kind's own label no longer overrides; empty restores the kind's |
| `cmd.panel_tab.move` | `tabId, panelId, index` or `tabId, split: { panelId, edge }` | reorder, move to panel, drag-to-edge split |
| `cmd.panel_tab.keep` | `tabId` | preview to kept |
| `cmd.panel_tab.pin` / `.unpin` | `tabId` | |
| `cmd.panel_tab.reopen_closed` | | |
| `cmd.workspace_layout.split` | `panelId, direction, spec?` | |
| `cmd.workspace_layout.move_surface` | `panelId, target: { panelId, edge }` | whole-panel drag by its corner grip |
| `cmd.workspace_layout.resize_surface` | `splitId, sizes`, or `surface: 'chat', width` | one commit on release. For the chat, `width` is the message area's width (400-760; `null` is the default for the window, the resizer's double-click), saved as the layout record's chat column `width_px`, never a Settings value (section 6.1) |
| `cmd.workspace_layout.set_collapsed` | `panelId, collapsed` | collapse to strip, any panel (D2) |
| `ui.workspace_layout.maximize` | `panelId` or `null` | view state, a flag outside the tree (D1) |
| `cmd.workspace_layout.close_panel` | `panelId` | tabs close (with `canClose`) |
| `cmd.workspace_layout.lock` | `panelId, locked` | |
| `cmd.workspace_layout.apply_named` / `.save_named` / `.reset` | `name` | `reset` is "Restore home layout" (`general.startup.reset-home-layout`) |
| `cmd.workspace_layout.restore` | `source` | a whole saved layout back in one command (the tour's snapshot, `source: 'guided_tour_restore'`); the id still needs the Plans thread's agreement |
| `cmd.panel.undock` | `'chat'` | the chat's Pop out, its only way to move (D3) |
| `ui.chat_column.keep_open` | `{ keep_open }` (true or false; without it, a toggle) | view state (no receipt, no event), saved in the layout record's chat column as `keep_open`: "Keep the chat open in narrow windows" (D4's pin), never a Settings row; dispatched by the title bar's Home options and the chat's own header menu (section 6.1) |
| `ui.chat_column.pin_history` | `{ history_pinned }` (true or false; without it, a toggle) | view state (no receipt, no event; UCC-203), saved in the layout record's chat column as `history_pinned`: the chat's History pinned beside the messages (the column widens by it) or a flyout, never a Settings row; dispatched by the chat's History button, its list's pin and its More menu's "Keep History open" (section 6.1) |

`PM_HOME.command_log`, `PM_HOME.receipt_log` and `PM_HOME.event_log` hold the last 200 of each for checks and the tour.

## 9. Keyboard

The page already owns Ctrl+1..9 (activity-bar pages) and Ctrl+K (Settings search; canon's command palette), so the
panels use neither: there are no Ctrl+K chords and tab N is Alt+N. In a browser six chords belong to the browser and
a page cannot take them (Ctrl+T, Ctrl+W, Ctrl+Shift+T, Ctrl+Tab, Ctrl+PgDn, Ctrl+PgUp); the concept, like the later
web client, answers the Alt column for those, and every label shows the key that works where the page runs
(`PMW.KEYS`, one table).

The host owns these while focus is in the centre or the chat, unless the focused tab's `wantsKey(e)` returns `true` (a
terminal keeps the shell's keys; it should still give back Alt+1..9, Alt+arrows, Alt+Shift+arrows, Alt+PgUp/PgDn
(Ctrl+PgUp/PgDn in the app), Ctrl+\\ and Shift+Escape). F6 is taken before `wantsKey` and from every region. Text
inputs keep their own keys; on a Mac, Option+letter and Option+\` type characters in a text field, so the Alt
stand-ins never fire from one there (on Windows and Linux Alt+T still works from a field). Keys during IME composition
are ignored, and a held Alt+\` does not reopen the recent-tabs list. An open menu owns its keys while focus is inside
it; a menu left open behind the focus closes on the first real key outside it, which then goes on as usual. Tab in a
menu closes it.

A text field marked `data-pmw-keys="host"`, on itself or an ancestor (`data-pmw-host-keys` is an alias), is not a text
field for the host's navigation keys: once the focused tab's `wantsKey(e)` returns false, Alt+1..9, Alt+Shift+1..9,
Alt+arrows, Alt+Shift+arrows, Alt+PgUp/PgDn, Ctrl+P, Ctrl+Shift+A and, on Windows and Linux, Alt+W reach the host from
it (a terminal's input textarea and the editor's IME textarea are marked). The Mac typing rule still treats it as a
text field: on a Mac, Alt+T, Alt+Shift+T, Alt+\` and Alt+W never fire from a marked field, and a `Dead` key never fires
them on any platform.

| Action | Native app | In a browser |
|---|---|---|
| New tab of the panel's usual kind | Ctrl+T | Alt+T |
| Close tab | Ctrl+W | Alt+W |
| Reopen closed tab | Ctrl+Shift+T | Alt+Shift+T |
| Recent tabs across panels and kinds (hold, step, release) | Ctrl+Tab / Ctrl+Shift+Tab | Alt+\` / Alt+Shift+\` |
| "+" menu | Ctrl+Shift+Space | same |
| New terminal / browser | Ctrl+Shift+\` / Ctrl+Shift+B | same |
| Open a file | Ctrl+P | same |
| Every tab, searchable | Ctrl+Shift+A | same |
| Next / previous tab in the panel | Ctrl+PgDn / Ctrl+PgUp | Alt+PgDn / Alt+PgUp |
| Tab 1-8 / last tab in the panel | Alt+1..8 / Alt+9 | same |
| Move tab left / right | Ctrl+Shift+PgUp / Ctrl+Shift+PgDn | same |
| Focus the panel in a direction | Alt+arrows | same |
| Focus panel N | Alt+Shift+1..9 | same |
| Move the tab to the panel in a direction (splits that way when there is none and it fits) | Alt+Shift+arrows | same |
| Cycle regions: rail (the whole left panel), panels, chat | F6 / Shift+F6, from any region | same |
| Split right / down | Ctrl+\\ / Ctrl+Shift+\\ | same |
| Maximize / restore | Shift+Escape (Escape also restores while focus is in a strip) | same |
| Resize | Tab to a divider, then arrows 8 px, Shift+arrows 48 px, Home/End, Enter evens | same |
| In a strip (ARIA tabs) | arrows, Home/End, Enter/Space, Delete closes, Shift+F10 the tab menu | same |
| Panel grip | Enter opens Move panel | same |

No bare letters or digits, and Escape stays scoped to the innermost open thing.

## 10. Looks

Read the look from the page, never store it: `html[data-theme="<family>-<mode>"]` (`friendly`, `glass`, `retro`,
`basic`; `light`, `dark`), `html[data-o55-nier="on"]` with `data-o55-nier-parts` (NieR Mode, a setting over Basic),
`html[data-motion="reduced"]` (Reduced Motion, set by the Settings switch or the system preference).
`PM_HOME.look()` returns `{ family, mode, nier, reduced }`; `'look'` fires after any of them changes.

Shared tokens the panels CSS defines on `#pm-home-centre` (use them so every kind changes with the look):

| Token | Meaning |
|---|---|
| `--pmw-surface`, `--pmw-surface-2`, `--pmw-strip` | tab body, raised parts inside it, the strip |
| `--pmw-text`, `--pmw-text-2`, `--pmw-text-3` | primary, secondary, dim text |
| `--pmw-line`, `--pmw-accent`, `--pmw-ok`, `--pmw-warn`, `--pmw-bad` | hairlines and state colours |
| `--pm-font-ui`, `--pm-font-code` | UI face of the look; code face: `'JetBrains Mono'` first in every look (D17) |
| `--pmw-ease`, `--pmw-t-fast`, `--pmw-t-med` | motion; all durations are 0 under Reduced Motion |

Every moving part is off under Reduced Motion (instant, no blink). Retro and NieR renderings follow
`research-ide-layout.md` section 11.

### 10.1 Code colour schemes (D30, agreed with the terminal thread 2026-10-10)

One scheme catalog serves the editor and the terminal. It is one data module in the terminal package
(`src/terminal/schemes/*.json`, compiled into the terminal's JS), reached through `window.PMT`:

| Call | Returns |
|---|---|
| `PMT.Appearance.schemes()` | `[{ id, name, mode, pair }]`, the curated schemes (D15) and the user's own |
| `PMT.Appearance.editorTokens(id)` | the editor's 17 syntax colours as hex: `kw str num com fn ty var prop op pun tag attr esc mac link head code` (the editor's `--pmw-ed-s-*` tokens); imported and user schemes get them derived from their ANSI 16 by a fixed map, so every scheme supplies all 17 |
| `PMT.Appearance.palette(id)` | `{ background, foreground, cursor, selection, ansi: [16] }`; the editor takes its code-area background, text, caret, selection and gutter tone from it (a scheme's syntax colours keep contrast only on its own background) and derives its diff tints from ANSI green, red and yellow |
| `PMT.Appearance.retroPhosphor()`, `PMT.Appearance.on('retro-phosphor', fn)` | `'green'` or `'amber'`: the Retro scheme choice, stored once in the terminal's look record; the editor's monochrome Retro dark follows it and never writes it |
| `PMT.AppearancePopover.open(anchor, { surface, get, set, onClose })` | the one Appearance popover, floating in `#pmw-overlay`; returns `{ el, close, refresh }`. `get()` returns `{ scheme, font, size }` (`'follow'` for Follow look; `size: null` is the default) and `get(key)` one of them; `set(key, value)` takes the keys `'scheme'`, `'font'` and `'size'`. `surface: 'editor'` shows Scheme (Follow look first), font and size only |

Both surfaces word the default "Follow look" (D30; D16 had "Follow theme"). Each surface has its own pick and both
default to it (D21's per-look syntax colours for the editor, the
look's default scheme for the terminal): `editor.scheme` (`'follow'` or a scheme id) and the terminal's own key under
`terminal.*`. The editor opens the popover from its More menu ("Appearance..."). In a build without `src/terminal`
the editor keeps Follow look, its Retro dark stays green and the Appearance row is absent. Settings > Editor and >
Terminal bind the same catalog when Settings is ported.

## 11. NieR hooks

Hook classes join the Settings script's NieR selector lists through the layer (one patch per list, anchors not shared
with the Usage or rail layers): `.pmw-cur` (menu and list rows that take the square cursor), `.pmw-chosen` (chosen
items), `.pmw-strip` (strips that get the ink rule). A kind tags its own rows with these classes instead of growing the
lists. The terminal's parchment and ink are its own CSS under `html[data-o55-nier="on"]`.

## 12. Settings model (one model, Settings binds later)

`PM_HOME.settings.get(key)`, `.set(key, value)`, `.on(key | '*', fn)`, `.defaults()`, `.schema()`. Stored in
`pm.home.settings:v1`; every choice a user will later make in Settings reads from here with a default. Panels keys:
`panels.layout.named`, `panels.tabs.preview` (true), `panels.plus.default` ('menu'), `panels.tabs.sizing` ('shrink'),
`editor.font.family`, `editor.font.size` (13), `editor.minimap` (true), `editor.stickyScroll` (true),
`editor.scheme` ('follow', D30; registered by the editor kind). The chat column registers no keys: its width, its
History pinned or a flyout, and "Keep the chat open in narrow windows" are the layout record's chat column (`width_px`,
`history_pinned`, `keep_open`; section 6.1), never Settings values (SSYS-050), so no Settings row can show them; the
former `chat.width`, `chat.history` and `chat.pinOpen` keys are carried into the record once and dropped. A pinned
History widens the chat column by 240 px (the chat draws it at 200 while its whole column is under 540); `width_px`
and the 400-760 drag range stay the message area's. The widening
counts in the narrow ladder, the peek (400 plus History) and the popped-out window (440 plus History), and is never
saved. The terminal's appearance model (D15) lives under `terminal.*`,
registered by the terminal with `PM_HOME.settings.register('terminal', schema, defaults)`; its Appearance popover reads
and writes through the same model, so Settings > Terminal only binds controls.

## 13. Bans and checks (D22, D24)

- No pills (no fully rounded capsules, no class names containing `pill`), no box with a coloured side border (no
  `border-left` / `border-inline-start` of 2 px or more, no inset side shadows standing in for one), no emoji in source
  or output chrome (a program's own output may contain them). The layer lint fails the build on each.
- Friendly's page rule rounds every `button` to 14 px, which turns small and 32 px buttons into capsules. The core
  restates header-row, menu, launcher, frame and file-reference radii; a kind restates its own buttons the same way
  (inside `:where()`, so its own rules still win, and skipped under NieR's square part).
- No `:has(` in the layer CSS. No viewport width `@media` queries inside a tab body. No internal ids in the UI
  (session ids, tab ids, panel ids never appear as text).
- Hover (the hover thread's merged engine `PMH`, opus-5.5 `src/js/18-hover.js`, settled 2026-10-10 on
  concept/pm7-hover-polish-20261009, canon F3-465 and DR-072): per kind, `card` is a 2-3.5 px magnet on translate
  with a small pointer light and a faint edge line near the pointer; `row` and `tile` are light and glow with no
  magnet; `icon` is state classes only. Basic is crisp, Friendly warm, Glass clear, Retro "Raise", NieR "Lock-on"
  (gated by the brackets part). A kind's own CSS may use the state classes `.pmh-on`, `.pmh-near`, `.pmh-out` and
  tune only the `--pmh-*` tokens; it never restates the effect and never writes inherited custom properties on a hover
  target. The engine rests under `body.pm-resizing`, `pmw-dragging` and `pm-ab-dragging`, and nothing runs at idle.
  It never targets tabs, `[role="tab"]`,
  resizers and dividers (`-divider` in the class), inputs, textareas, selects, contenteditable or `.xterm`; it skips
  everything inside `[data-pm-hover-exempt]` (no magnet, light, glow, state class or kind tag); `data-pmh="off"` takes
  one element out; `data-pmh="card|row|tile|icon"` opts an element in. So: list rows opt in with `data-pmh="row"` (the
  "+" menu rows, the "+N" list, the empty-panel launcher and its Recent rows, the recent-tabs switcher: the engine puts
  it on the row wrapper, `.pmw-mrow`, so the trailing new-panel cell moves with its row); header-row buttons and other
  small icon buttons are `data-pmh="icon"` (a static tint only, DR-059); text surfaces (the editor, a terminal screen)
  carry `data-pmh="off"` or sit inside `[data-pm-hover-exempt]`; strips and dividers get nothing. Dashboard cards come
  through the Usage board. Hover TAGS (the page's tag controller) stay off rows whose label is already visible with
  `data-pm-hover-visual-suppressed="true"`, never with `data-pm-hover-exempt` (that would also take them out of the
  hover engine). While the user drags a divider or a tab the host sets `body.pm-resizing`, which rests the engine, and
  hides the tag layer. A field (input, textarea, select) carries its own `data-pm-hover-label` and
  `data-pm-hover-detail`, or `data-pm-hover-visual-suppressed="true"`: the tag controller otherwise gives an unlabelled
  field the generic detail "Change this setting." (the controller checks the element itself, not its ancestors).
- No chosen-state underline (the Plans canon lead's ruling of 2026-10-11: DR-069 and F3-648 count a one-sided coloured
  line as a side stripe, and D5 bans underline markers): a selected, checked, pressed, current or active option is the
  chosen fill (section 5.1), never a 0-3 px `::after` or `::before` at its top or bottom, a top or bottom border or an
  inset line. The layer lint fails the build on each.
- Fonts: faces in `src/terminal/fonts/` are not mirrored into PM Symbols; the layer exempts them from the
  face/symbol pairing check. Box-drawing, block, braille and powerline glyphs are drawn by the terminal.

## 14. Overlays and stacking

One overlay root, `#pmw-overlay` (body-level, fixed), holds the "+" menu, "+N" list, panel menus, drag ghosts and
landing previews. Z ladder: panel content 0-10; strip and dividers 20; #pmw-overlay at 2147481800 (above the page's
status bar at 2147481700, below the demo pill at 2147482600 and the hover tags and the tour at 2147483000); inside it
menus, then the drag chip and the landing preview. Menus from a kind (`api.menu`) open in this
root. A kind never appends its own overlay to `document.body`.

## 15. Change log

- v1 (2026-10-09): first publication. Same day: section 6 rule 3 corrected to D7 as Jared worded it (every person-clicked
  file reference opens a preview tab, not only the file tree); the keyboard table is replaced (PM7's Ctrl+1..9 and Ctrl+K are taken;
  browser-owned chords get Alt stand-ins). Additive: command names agreed with the Plans thread (activation and
  maximize are `ui.*` view-state actions, `cmd.panel_tab.rename`, one `workspace.layout_changed` event), `onResize` gains
  `final`. Hover section rewritten for the merged hover engine (data-pmh rows, visual-suppressed tags).
- v1.1 (2026-10-10): after the engine review. Keyboard: next/previous tab is Alt+PgDn/PgUp in a browser (Chrome keeps
  Ctrl+PgDn/PgUp), so six chords get stand-ins; Mac Option typing, IME and key repeat are left alone; F6 works from
  every region and before `wantsKey`; menu key ownership written down. Commands: `cmd.workspace_layout.restore` added
  (pending the Plans thread). `api.menu` gains point anchors, `reason`, function submenus and `o`.
  Same day: a header-row action's `menu` and `PMW.frames.button`'s `menu` map items through the same mapping as
  `api.menu` (the terminal thread found contract items printed "[object Object]" there).
- v1.2 (2026-10-10): D29-D31 (published then as Addendum 2's D26-D28) and the integration round. Section 2: Output is
  one tab, `output`, with the channel as view state, and `output:<channel>` for a channel opened as its own tab (D31). Section 3: `labelFor` and `iconFor`, the
  body attached before `mount`, view modes and `title` reach the state, `reveal(fields)` tolerates any key. Section 4:
  `api.saveSoon()`, empty check slots. Section 5: fact `el`/`detail`/`grow`, `{ id, el }` actions, in-place `set()`,
  `labelsAt`; new 5.1 (frames, `PMW.fileRef`, the catalog and picker, `registerIcon`). Section 6: the open's fields
  reach `reveal`; 6.1 `PM_HOME.chat`, the `'chat'` events, browser captures, the chat surface slot; 6.3 the rail's own
  overlay look. Section 9: `data-pmw-keys="host"`. Section 10.1: the shared code colour-scheme catalog and popover
  (D30, agreed with the terminal thread). Sections 12-13: `editor.scheme`, pinned History widening, Friendly radius
  restatements, the settled hover contract, field hover tags.
- v1.3 (2026-10-10): Addendum 3. D41: Addendum 2's items are D29 (tab strip visuals), D30 (code colour schemes) and D31
  (Output channels) everywhere here; `DECISIONS.md`'s own D26-D28 keep their numbers. Section 2 (D33): the Debug Console
  is one tab, `debug-console`, with a sub-tab per debug session and the session as its view state; `kindOf` knows the
  bare id. Section 3: `fold(id)` for older id forms (`debug-console:<session>` folds into `debug-console` with that
  session) across opens, saved and named layouts and the reopen list; `plus.sub()` entries may carry `group` (D39,
  agreed with the terminal thread), `'ssh'` drawing one "SSH hosts" submenu row, and ungrouped entries are no longer
  capped. Section 6.1: the chat column's API, the rail's Chat entry toggling the column on every page (D40), and a
  popped-out chat starting back in its column after a restart (D32). Section 7: the SSH hosts row, the filter finding
  hosts, the launcher's inline sub-rows.
  Same version, D10 round two (dashboards, D35/PLN-4): new section 3.1, the Dashboard kind: board keys per project
  (`widget_layout:v1:<project>:<board>`, adopted once from the unscoped key, re-keyed on a project switch), custom
  dashboards made, named per project (`pm.home.dashboards:v1:<project>`) and deleted, Start from with `set_id`, saved
  presets, Live readings and Play the next hour, other widget sources in Add widget, the empty board, and the Board
  menu's rows in order; sections 2 and 7 name the custom dashboards. Section 3: the `tabMenu(state, tabId)` hook
  (rows after a hairline; asked by the terminal for D38). Section 5: `PM_HOME.catalog.remove`. A named layout keeps at most 64 KB of dashboard contents (canon); a larger save keeps the layout
  without them and says so.
- v1.4 (2026-10-10): the publish. Sections 1, 1.1 and 6.3: the home layer is step 5 of opus `build_text()` and publishes
  into `PMConcept7.html`; the review copy is the same bytes; the terminal's faces are the page's own. Section 6.1:
  Settings' Chat Layout row is retired, so nothing replays a pop out at start and `popOutChat()` is `chatCol.popOut()`.
  The Guided Tour's workspace steps are native to the tour (opus-5.5 `83-tour-steps.js`); the panels keep their tour
  hooks on `PMW.tour` (`js/52-tour.js`).
  Same version (2026-10-10), two rulings of the Plans canon lead: Section 2: the Debug Console's chosen sub-tab is filled on its
  own box (DL-162's tab ink, Retro's reverse video, NieR's ink block), with no underline. Sections 6.1, 8 and 12: "Keep
  the chat open in narrow windows" is the typed UI action `ui.chat_column.keep_open`, saved in the layout record's chat
  column as `keep_open`, dispatched by the title bar's Home options and the chat's own header menu; the `chat.pinOpen`
  setting is gone (carried over once). Menu rows may carry `action`, written as `data-ui-action-id`.
  Same version (2026-10-11), the Plans canon lead's ruling on the rest of canon's v2 `chat_column` (SP-330, DL-180,
  SSYS-050): sections 6.1, 8 and 12. The chat column's width is the layout record's `width_px`, committed by
  `cmd.workspace_layout.resize_surface` `{ surface: 'chat', width }` (a drag once on release, the double-click reset
  with `null`); History pinned or a flyout is `history_pinned`, the typed UI action `ui.chat_column.pin_history`. The
  `chat.width` and `chat.history` settings are gone (carried over once with `chat.pinOpen`); a named layout and Restore
  home layout keep all three fields.
  Same version (2026-10-11), the Plans canon lead's ruling on chosen-state underlines: sections 5.1 and 13. Every
  segmented toggle (`PMW.frames.seg`: the Plan viewer, Context, the document, artifact, run and DevTools toggles) and
  the artifact's Fit / Actual size / Source take the Debug sub-tabs' chosen fill (one grammar, `.pmw-ink-row`,
  `.pmw-ink-opt`, `.pmw-ink`, and one mover, `PMW.frames.ink`); the 2 px underlines are gone, and the layer lint
  refuses a chosen-state underline.
