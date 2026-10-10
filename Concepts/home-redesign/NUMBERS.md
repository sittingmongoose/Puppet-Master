# Home panels: the numbers as built

Every number, breakpoint, id, key and command the concept settles, for the Plans thread (canon must match the concept
when it is published). "Provisional" marks a value waiting on Jared. Source files are under `src/panels/`.

## Layout model (D1, D2)

| What | Value | Where |
|---|---|---|
| Tree | n-ary split tree, leaves are panels (tab groups); sizes are fractions summing to 1 per split | `js/10-model.js` |
| Invariants | every leaf a panel; a split has 2+ kids and never the same direction as its parent; sizes > 0.02; a tab in exactly one panel; an empty panel survives only when it is the only panel or locked; pinned tabs first; one preview tab per panel | `model.normalize`, `model.validate` |
| Insertion | the new panel takes `ratio` (default 0.5) of the target's share only; nothing else changes size | `model.insertBeside` |
| Removal | the share goes to the previous sibling, else the next | `model.detach` |
| Root dock | a new panel along the centre's edge takes 0.34 of the root | `model.insertAtRoot` |
| Gap between panels | 6 px (the divider line in its centre); 6 px inset from the rail, the chat and the bars | `js/20-geometry.js` `GAP`, `js/22-render.js` `CENTRE_PAD` |
| Divider hit target | 8 px | `DIVIDER_HIT` |
| Panel minimum | 280 x 120; a panel's minimum is the largest of its tabs' kind minimums | `js/12-kinds.js` `PANEL_MIN` |
| Kind minimums | terminal 320 x 120, browser 360 x 200, dashboard 320 x 120, run 360 x 200, the rest 280 x 120 | each kind's `min` |
| Collapse to strip | a panel dragged below half its minimum along the divider's axis collapses to 35 px (its strip); dragged out, it expands | `js/24-dividers.js` |
| Maximize | a view flag outside the tree; the maximized panel fills the centre; Shift+Escape toggles; Escape in a strip restores | `PMW.toggleMaximize` |
| Divider keys | arrows 8 px, Shift+arrows 48 px, Home/End to a neighbour's minimum, Enter evens; double click evens | `js/24-dividers.js` |
| Split fit rule | right if both halves stay at least the larger minimum wide, else down, else none (no split offered) | `geom.splitFits` |
| Drag edge bands | clamp(15 % of the body axis, 32, 72) px; the centre's outer edge band 12 px | `js/33-tabdrag.js` |
| Tear-off | the pointer leaves the strip band by 14 px vertically (40 px horizontally) | `TEAR_BAND` |
| Drag threshold, dwell, hysteresis | 4 px; 100 ms dwell (skipped on release and under Reduced Motion); a zone holds while the pointer is within 12 px of it | `js/30-gesture.js` |
| Motion | panel glide 180 ms (Friendly 220, Glass 260, Basic 200, Retro 140 stepped, NieR 200); landing preview glide 160 ms, fade 140 ms; neighbour slide 250 ms (.22,1,.36,1); tab settle 160 ms (.17,.84,.29,.99); drop settle critically damped spring k 520 c 45.6; cancel 300 ms; all 0 under Reduced Motion | `js/08-motion.js`, CSS tokens |

## Named layouts (D2)

| Name | Tree | Slots and default tabs |
|---|---|---|
| Home (default) | col [ row [dash 0.5, docs 0.5] 0.6, tools 0.4 ] | dash: Home (pinned), Agents; docs: src/main.rs, src/routes/recipes.rs, Plan "Tenant-scoped analytics read path" (plan:ap-index); tools: two terminals, Output |
| Build | col [ row [docs 0.66, side 0.34] 0.62, row [term 0.6, tools 0.4] 0.38 ] | docs; side: browsers and dashboards; term: terminals; tools: Output, Problems |
| Terminals 2x2 | col [ row [t1, t2], row [t3, t4] ], all 0.5 | one terminal per slot (new ones made as needed); other tabs join t1 in the background |
| Focus | one panel | every tab |

Applying a layout keeps every open tab (no terminal is ended, no unsaved buffer dropped). "Restore home layout"
(`general.startup.reset-home-layout`) applies Home and keeps tabs. Saved layouts keep shape, sizes and the kinds each
slot holds.

## The strip and tabs (D5)

| What | Value |
|---|---|
| Strip height | 35 px for every panel (provisional: Jared set 35 for editors in rev 19; research suggested 32) |
| Tab height | 31 px (the plate overlaps the body by 1 px: tab and body are one surface) |
| Glass dark active tab | no tinted plate: the active tab fuses with its panel's own surface, as in the other looks (Jared, 2026-10-10: the purple plate is dropped) |
| Gap between tabs | 8 px (Retro 2 px) so the concave shoulders show mid-strip (approved by Jared, 2026-10-10) |
| Silhouette contact | measured to the neighbour's content: its box inset by 8 px; morph window 20 px, linear |
| Widths | natural 96-200; inactive tabs shrink to 72; then 36 px icons; the active tab keeps at least 120 and never hides; then a contiguous window around the active tab stays and "+N" counts the rest |
| Pinned tab | 36 px, icon only, left, never hidden |
| Close target | 24 x 24 (12 px glyph); hidden on inactive tabs under 96 px (middle click and Delete still close) |
| Dirty | a 7 px dot in the close slot until hover (Retro: an asterisk; NieR: a 6 px square) |
| Preview | italic label |
| Attention (opened in the background) | a 6 px hollow square |
| Failed command (terminal) | the exit code after the label, in the error colour |
| Agent | a 7 px square agent mark |
| "+N" | plain text "+7" (Retro "[+7]", NieR small caps after a hairline); opens a searchable list grouped by kind |
| "+" | 28 x 28 after the last tab; opens the menu (D6); never creates a tab by itself |
| Shrunk file names | middle ellipsis ("rec…es.rs") |
| Crown / shoulder / flare per look | Friendly 16/16/25, Glass 16/16/25, Retro 6/8/14 (stepped profile), Basic 9/14/22, NieR 9/14/22 (6/0/14 chamfer with the `square` part) |
| Active marker | the fused silhouette only (Basic's old 2 px accent crown strip removed under D5) |

## The "+" menu (D6), exact order and labels

1. Filter field "Open anything: kinds, files, URLs" (typing also finds files and an address)
2. Terminal · Ctrl+Shift+\` · sub-row: the terminal thread's profiles
3. Browser · Ctrl+Shift+B · sub-row: localhost:5173, Query dashboard
4. File... · Ctrl+P · sub-row: three recent files
5. Dashboard · sub-row: Home, Metrics, Monitoring, Agents
6. Plan or document...
7. Artifact...
8. Output, Problems, Ports, Debug Console (one row with a submenu)
9. (hairline) Split right · Ctrl+\\ ; Split down · Ctrl+Shift+\\ ; Reopen closed tab · Alt+Shift+T in a browser (Ctrl+Shift+T native)

Each row's body opens a new tab in this panel; its trailing cell (34 x 34) opens a new panel; Alt+click or Alt+Enter
does the same. The empty-panel launcher shows the same rows (32 px list rows), then five recent files, then a hint.

## Opening (D7, D8)

| Rule | As built |
|---|---|
| One id, one tab | an open of an existing id reveals it (activates, expands a collapsed panel), never moves it |
| Preview | every file reference a person single-clicks opens the panel's single preview tab; double click, editing or dragging keeps it; Ctrl+P with Enter, the "+" recent files and agent opens are kept |
| Placement | documents: the last-focused panel that holds documents (panels holding only terminals, browsers, dashboards or tools are skipped); terminals, browsers, dashboards: the last-focused panel holding that kind, else documents; tools (Output, Problems, Ports, Debug Console): the last-focused panel holding that kind, then one holding a terminal, then documents; none: a new panel by the fit rule; locked panels are skipped |
| Agent opens | background tab with the hollow square, an announcement, never focus |
| Narrow centre | no new panels below C 600: "new panel" opens in the next panel of the switcher |
| Canonical ids | a kind may map aliases to one tab (plan-query and plan:ap-index) |

## Chat column (D3) and the narrow ladder (D4)

| What | Value |
|---|---|
| Default width | clamp(400, 0.26667 x window + 88, 640): 480 at 1470, 600 at 1920, 640 from 2070 |
| Drag range | 400-760, and never so wide that the centre drops below 960 (where the ladder starts easing the chat back) |
| Pop out | the only way to move it; in the browser concept it floats at 440 x min(720, window - 140) with Dock back |
| Ladder (on C, the centre width) | C < 960: the rail side panel eases to 240, then folds to its icon bar below 760 (opens as an overlay), then the chat eases toward 400; C < 600: one panel column with a panel switcher ("2/3") in the strip; C < 480: the chat folds to a 32 px strip unless "Keep the chat open in narrow windows" is on |
| Hysteresis | 48 px per step; nothing is ever saved |
| Measured | 1920: rail 240, chat 600, C 1041. 1680: chat 441, C 960. 1470: rail folded, chat 473, C 960. 1440: chat 443. 1280: chat 400, C 847. 1024: one column, C 567. 900: chat strip, C 811 |

## Keyboard (CONTRACT section 9)

PM7 owns Ctrl+1..9 and Ctrl+K, so tab N is Alt+N and there are no Ctrl+K chords. In a browser, Ctrl+T, Ctrl+W,
Ctrl+Shift+T, Ctrl+Tab and Ctrl+PgDn/PgUp belong to the browser: the concept (and the web client) answers Alt+T, Alt+W,
Alt+Shift+T, Alt+\` and Alt+PgDn/PgUp instead. On a Mac the Alt stand-ins never fire from a text field (Option types
there). F6 cycles rail, panels and chat from any of them. Full table: CONTRACT section 9 and `js/42-keyboard.js`
(`PMW.KEYS`).

## Commands and keys

| Kind | Ids |
|---|---|
| Tab commands | cmd.panel_tab.open / close / move / keep / pin / unpin / rename / reopen_closed |
| Layout commands | cmd.workspace_layout.split / move_surface / resize_surface / set_collapsed / close_panel / lock / apply_named / save_named / reset / restore (restore pending the Plans thread) |
| View actions (no receipt, no event) | ui.panel_tab.activate, ui.workspace_layout.maximize, ui.workspace_layout.focus_panel |
| Chat | cmd.panel.switch (show/hide), cmd.panel.undock / cmd.panel.redock (pop out / dock back), cmd.workspace_layout.resize_surface with { surface: 'chat', width } |
| Aliases | cmd.editor.close_tab -> cmd.panel_tab.close; cmd.file.open, cmd.nav.open_subject, cmd.browser.open_workspace_preview, cmd.terminal.open -> cmd.panel_tab.open |
| Event | workspace.layout_changed per structural commit; plus the page's pm:command-dispatch (cancelable: a cancel rolls back) and pm:dispatch-receipt |
| Storage (concept) | pm.home.panels:v1:<project> (layout), pm.home.panels:quarantine:v1:<project> (the newest set-aside record plus an `earlier` list of up to 2), pm.home.panels.saved:v1 (named layouts), pm.home.settings:v1 (settings model), pm.home.recent:v1, pm.home.chat:v1 (chat visibility) |
| Settings keys | panels.layout.named, panels.tabs.preview, panels.tabs.sizing, panels.tabs.closeOnLeft, panels.plus.default, panels.files.revealIfOpen, panels.empty.closePanel, editor.font.family, editor.font.size, editor.lineHeight, editor.minimap, editor.stickyScroll, editor.diff.layout, editor.wordWrap, chat.width, chat.history, chat.pinOpen (the terminal registers terminal.*) |
| Serialize cap | 16 KB of state per tab |
| Z ladder | panel content 0-10; strip and dividers 20; #pmw-overlay 2147481800 (menus, "+N" list, drag chip and landing preview inside it: above the page's status bar 2147481700, below the demo pill 2147482600 and the hover tags and tour 2147483000) |
