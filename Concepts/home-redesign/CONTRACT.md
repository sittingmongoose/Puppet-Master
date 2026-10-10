# Home panels: tab-kind registry and host contract

Contract version **1** (2026-10-09). Owner: the panels concept thread (branch `concept/home-panels-20261009`). Readers:
the terminal thread (it plugs the Terminal kind in), the Plans thread (canon follows this), and the later 5.6 Pro chat
port (its `openEditor` contract maps onto section 6). Decisions D1-D28 are in
`/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md`; where this file and DECISIONS.md
disagree, DECISIONS.md wins and this file is wrong.

Changes to this file are additive within a version. A breaking change bumps the version, is listed in section 15, and
is announced to the terminal and Plans threads before it is pushed.

## 1. Package, ownership, namespaces

```
Concepts/home-redesign/
  CONTRACT.md, README.md, concept-hub.json      panels thread
  tools/home_layer.py, tools/build_home.py       panels thread (apply / lint / syntax_check, review build)
  src/panels/css/*.css, src/panels/js/*.js       panels thread (engine, strip, menus, every kind except Terminal)
  src/terminal/{js,css,fonts,schemes,harness}/   terminal thread; also src/terminal/SPEC.md
```

| Owner | JS global | CSS classes | Data attributes | Storage keys |
|---|---|---|---|---|
| Panels | `window.PM_HOME` (public API), `window.PMW` (engine internals, tests only) | `pmw-` | `data-pmw-*` | `pm.home.panels:v1:<project>`, `pm.home.settings:v1` |
| Terminal | `window.PMT` | `pmt-` | `data-pmt-*` | under `pm.home.terminal:v1:*` if it needs its own |

Nobody else's prefix is used in either tree. The hover thread owns `PMH` / `pmh-` / `data-pmh*`, Usage owns `PMU` /
`pmu-`, the rail owns `PMR` / `pmr-`.

### 1.1 How the layer assembles the page

`tools/home_layer.py` `apply(text, need)` starts from `Concepts/onboarding/opus-5.5/tools/build.py`'s `build_text()`
and adds, between `<!-- HOME:CSS:START/END -->` and `<!-- HOME:BODY:START/END -->`:

1. `<style id="pm-home-css">`: `src/panels/css/*.css` sorted, then `src/terminal/css/*.css` sorted. Font refs
   `url("o55font:<file>")` are inlined as `data:` URIs, looked up in `src/terminal/fonts/` then `src/panels/fonts/`
   (file names must be unique across the two).
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
| `dashboard` | `dashboard:<board>` | `dashboard:home` is the pinned Home dashboard |
| `plan` | `plan:<id>`, `plan-query`, `deep-discovery:<run>` | sticky Build / Revise / More footer |
| `document` | `teach:`, `memory:`, `revert:`, `debug:`, `lens-source:`, `lens-effective:`, `wonderer:`, `wonder-source:`, `doc:<path>` | rules, memory, revert, debug investigation, lens source, wonderer |
| `artifact` | `artifact:<id>`, `artifact:<id>@v<n>`, `artifact-revision:<encoded JSON>` (the chat's versioned route), and the chat's bare artifact ids passed with `kind: 'artifact'` | per-kind subtype in `state.subtype` |
| `run` | `collab-run:`, `crew-work:`, `review:`, `room:`, `brainstorm:`, `review-evidence:`, `brainstorm-evidence:` | Crew, Review, Chat Room, BrainStorm and their evidence |
| `transcript` | `thread-<agentId>` | read-only live feed |
| `context` | `context:<threadId>` | thread-keyed context detail |
| `record` | `search:`, `mcp:`, `app:`, `work-record:` | read-only tool-call records |
| `output` | `output:<channel>` | |
| `problems` | `problems` | one per workspace |
| `ports` | `ports` | one per workspace |
| `debug-console` | `debug-console:<session>` | |

Retired, never registered: the chat's Goal tab (`goal-artifact`, DL-147), its lab-only workspaces (`order-export:`,
`b16-work:`, `b17-work:`, `bsd12:`, `eli5-evidence:`). Activity Detail stays inside the chat (D3) and is not a kind.

`PM_HOME.kindOf(id)` returns the kind for an id (`null` for an unknown prefix). A kind can claim more prefixes in its
registration (section 3); two kinds claiming one prefix is a boot error.

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
  plus: {                       // optional: a row in the "+" menu and the empty-panel launcher
    order: 10,                  // rows sort by order; section 7 lists the built order
    shortcut: 'Ctrl+Shift+`',
    sub() { return PMT.profiles(); },   // optional sub-row: [{ id, label, detail, icon }]
    spec(subId) { return { kind: 'terminal', profile: subId || null }; }
  },
  mount(host, state, api) {     // build the tab's body; return the instance (below)
    return { unmount() {}, serialize() { return {}; } };
  }
});
```

`mount(host, state, api)` is called once per tab when the tab is first shown (lazily: a restored background tab is
not mounted until it is activated, unless the kind sets `eager: true`). Arguments:

- `host`: the tab body element. It is the tab's own box, sized by the panel, `container-type: size` and
  `container-name: pmw-body`, `overflow: hidden`, `position: relative`. Draw everything inside it. Never size
  against the window (`innerWidth`, viewport `@media` width queries): use `@container pmw-body (...)` or
  `api.size()`.
- `state`: the restored state from `serialize()`, or for a new tab the open spec (section 6) minus the host fields
  (`where`, `mode`, `by`, `background`, `focus`).
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
| `api.menu(items, anchor)` | open a host menu (the picker look every PM menu uses) at an element; items `{ id, label, detail, icon, shortcut, disabled, checked, danger, sub, run }`, `'-'` for a hairline |
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

| Rule | Value (provisional until the panels thread confirms it in its report) |
|---|---|
| Row height | 30 px; controls are 24 px targets with 12 px text (11 px for secondary facts) |
| Labels shown | body width at least 520 px; below that, icons only, each with its hover tag (label plus shortcut) |
| Row hidden | body height below 150 px (the panel then holds only the strip and the content) |
| Classes | `.pmw-hrow`, `.pmw-hrow-left`, `.pmw-hrow-actions`, `.pmw-hbtn`, `.pmw-hbtn-label`; style through these, not by restyling the row |

A kind may draw its own row only when nothing in the shared one fits; say so in a note to the panels thread so canon
records why.

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
                             // a double click keeps; Ctrl+P with Enter, the "+" menu's recent files and agents open 'keep'
  where: 'auto' | 'tab' | 'panel' | 'right' | 'down' | '<panelId>',   // default 'auto'
  by: 'user' | 'agent:<name>',  // default 'user'
  background: false,         // user-requested background open (Ctrl/Cmd+click); agents are always background
  ...kindFields              // anything else is passed to the kind as state (terminal: profile, cwd, session, invocation)
}) // -> { ok, tabId, panelId, created, reason? }
```

Rules, in order (D7, D8):

1. **One tab per id.** If the id is open, the existing tab is revealed: activated in its panel (scrolled into view,
   pulled out of "+N" if hidden there), and focused if the open focuses. If it is open in a collapsed panel, that panel
   expands. An open never moves an existing tab to another panel.
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

Convenience forms: `PM_HOME.openFile(path, { line, col, mode, where })`, `PM_HOME.reveal(id)`.

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
(a structural commit: the page-side mirror of `workspace.layout_changed`), `'narrow'` (`{ step }`), `'look'`.
`PM_HOME.on` returns an unsubscribe function.

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
- **Build order.** Settings, Usage, the rail (`rail_layer.apply_published`, step 4 of opus `build_text()`), then the home
  layer, which inserts just before `</head>` and `</body>` and never rewrites the rail's band markup.

## 7. The "+" menu and the empty panel (D6)

The "+" sits right after the last tab and opens the menu; it never creates a tab by itself. Ctrl+T makes a new tab of
the panel's usual kind (its dedicated kind, else its active tab's kind, else Editor buffer). Each row's body opens a new
tab in this panel; its trailing cell opens a new panel (fit rule); Alt+click or Alt+Enter does the same anywhere.
Kinds join through `plus` (section 3). Built order:

| Order | Row | Shortcut | Sub-row |
|---|---|---|---|
| 10 | Terminal | Ctrl+Shift+` | profiles from `PMT.profiles()`: `[{ id, label, detail, icon }]`, each clickable |
| 20 | Browser | Ctrl+Shift+B | |
| 30 | File... | Ctrl+P | three recent files inline, each clickable |
| 40 | Dashboard | | |
| 50 | Plan or document... | | |
| 60 | Artifact... | | |
| 70 | Output, Problems, Ports, Debug Console | | one row with a submenu |
| hairline | Split right (Ctrl+\\), Split down (Ctrl+K Ctrl+\\), Reopen closed tab (Ctrl+Shift+T) | | |

A type-to-filter field heads the menu ("Open anything: kinds, files, URLs"). The empty-panel launcher shows the same
rows as full-width list rows (no tiles, no pills), then Recent.

## 8. Commands

Every committed structural change is one command with a receipt and emits the one existing event
`workspace.layout_changed` (no new event family); an open that only reveals an existing tab emits nothing. Previews
(hover, drag, menu open, the "+" menu, the "+N" list, panel menus) dispatch nothing; a changed release commits once; a
failed commit rolls back. Activation and maximize are view state: typed local UI actions (`ui.panel_tab.activate`,
`ui.workspace_layout.maximize`) with no receipt and no event, written with the layout's view-state block. Names agreed
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
| `cmd.workspace_layout.resize_surface` | `splitId, sizes` | one commit on release |
| `cmd.workspace_layout.set_collapsed` | `panelId, collapsed` | collapse to strip, any panel (D2) |
| `ui.workspace_layout.maximize` | `panelId` or `null` | view state, a flag outside the tree (D1) |
| `cmd.workspace_layout.close_panel` | `panelId` | tabs close (with `canClose`) |
| `cmd.workspace_layout.lock` | `panelId, locked` | |
| `cmd.workspace_layout.apply_named` / `.save_named` / `.reset` | `name` | `reset` is "Restore home layout" (`general.startup.reset-home-layout`) |
| `cmd.panel.undock` | `'chat'` | the chat's Pop out, its only way to move (D3) |

`PM_HOME.command_log`, `PM_HOME.receipt_log` and `PM_HOME.event_log` hold the last 200 of each for checks and the tour.

## 9. Keyboard

The page already owns Ctrl+1..9 (activity-bar pages) and Ctrl+K (Settings search; canon's command palette), so the
panels use neither: there are no Ctrl+K chords and tab N is Alt+N. In a browser four chords belong to the browser and
a page cannot take them (Ctrl+T, Ctrl+W, Ctrl+Shift+T, Ctrl+Tab); the concept, like the later web client, answers
the Alt column for those, and every label shows the key that works where the page runs (`PMW.KEYS`, one table).

The host owns these while focus is in the centre, unless the focused tab's `wantsKey(e)` returns `true` (a terminal
keeps the shell's keys; it should still give back Alt+1..9, Alt+arrows, Alt+Shift+arrows, Ctrl+PgUp/PgDn, Ctrl+\\,
Shift+Escape and F6). Text inputs keep their own keys.

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
| Next / previous tab in the panel | Ctrl+PgDn / Ctrl+PgUp | same |
| Tab 1-8 / last tab in the panel | Alt+1..8 / Alt+9 | same |
| Move tab left / right | Ctrl+Shift+PgUp / Ctrl+Shift+PgDn | same |
| Focus the panel in a direction | Alt+arrows | same |
| Focus panel N | Alt+Shift+1..9 | same |
| Move the tab to the panel in a direction (splits that way when there is none and it fits) | Alt+Shift+arrows | same |
| Cycle regions: rail, panels, chat | F6 / Shift+F6 | same |
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
`chat.width` (null = the default for the window). The terminal's appearance model (D15) lives under `terminal.*`,
registered by the terminal with `PM_HOME.settings.register('terminal', schema, defaults)`; its Appearance popover reads
and writes through the same model, so Settings > Terminal only binds controls.

## 13. Bans and checks (D22, D24)

- No pills (no fully rounded capsules, no class names containing `pill`), no box with a coloured side border (no
  `border-left` / `border-inline-start` of 2 px or more, no inset side shadows standing in for one), no emoji in source
  or output chrome (a program's own output may contain them). The layer lint fails the build on each.
- No `:has(` in the layer CSS. No viewport width `@media` queries inside a tab body. No internal ids in the UI
  (session ids, tab ids, panel ids never appear as text).
- Hover (the hover thread's merged engine `PMH`, opus-5.5 `src/js/18-hover.js`): it never targets tabs, `[role="tab"]`,
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
  hides the tag layer. The full hover contract (the look per family) follows from the hover thread.
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
