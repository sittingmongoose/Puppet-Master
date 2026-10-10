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

## Tab kinds (D9)

Each kind's own numbers, as its worker built and checked them. Shared sizes (24 px
header-row targets, 32 px document actions, nothing under 11 px) are in CONTRACT section 5.

### Editor (kinds/10-editor.js)

| What | Value |
|---|---|
| Metrics | line height = round(editor.font.size x editor.lineHeight) = 20 px at 13 px x 1.55; character width is measured, 7.8 px for JetBrains Mono at 13 px. |
| Gutter | max(3 digits, line count digits) x char width + 16 px for the numbers, plus a 16 px sign column (56 px for files under 1,000 lines); 10 px from the gutter to the text. |
| Header plate | 30 px row plus a 1 px hairline; blur 11 px with saturate 140 % at 72 %. No blur in Glass (90 % plate) or NieR (92 % paper plate). The row hides below 150 px body height (the core rule). |
| Scrollbar track | 22 px wide (13 px line lane, 4 px mark lane); 10 px marks-only below 420 px body width or with editor.minimap off. Minimum thumb 24 px, centred on the exact visible range. Bars map 80 columns across the lane. Files that fit draw at a 3 px pitch with no thumb; very long files are aggregated per pixel row. |
| Horizontal custom thumb | 6 px, shown while hovered or scrolling, fades after 900 ms. |
| Sticky scroll | editor.stickyScroll.maxLines = 3 (registered setting, range 1-5); off when the code area is under 240 px tall. |
| Diff layout | side by side from editor.diff.sideBySideMin = 900 px (registered setting), back to inline below 852 px (48 px hysteresis). A forced 'side' falls back to inline below 600 px. The switch waits for onResize final. |
| Changes view | 3 lines of context; never folds 1-2 lines at the file edges; word marks only when a pair is at least 40 % alike. |
| Find widget | min(440 px, body - track - 24 px), full-width bar below 440 px, toggles hidden below 340 px; 24 px targets; hits capped at 9,999 (shown as '9999+'). |
| Go to line box | min(320 px, body - 24 px). |
| Focus band | code.editing.goto-highlight-ms (default 5,000 ms), then a 600 ms fade (instant under Reduced Motion). |
| Motion | reveal 150 ms per row with an 8 ms stagger capped at 40 rows, first viewport only; caret blink 1.06 s; no thumb easing. |
| Undo groups | by kind within 900 ms on one line; 400 steps deep. |
| Rendering | visible lines plus 24 above and below; far-jump guess when more than 300 lines past the tokenized prefix; background tokenizing 1,200 lines per 12 ms slice; brace scopes wait for full tokenizing above 3,000 lines. |
| Saved state | serialize() = {path, line, top, mode[, diffLayout]}; buffers add {title, language, edit \| readOnly, text up to 12,000 chars}. A plain 'line' is a reveal target; 'top' restores the scroll position. |
| Settings read | editor.font.family, editor.font.size, editor.lineHeight, editor.minimap, editor.stickyScroll, editor.stickyScroll.maxLines, editor.diff.layout, editor.diff.sideBySideMin, and code.editing.goto-highlight-ms when present. |
| Ids and globals | tab ids file:<path> and buffer:<base36 time><n>. Untitled buffers are labelled 'Untitled 1', 'Untitled 2' and so on. Globals added: PMW.quickOpen, PMW.fileIndex, PMW.editorOf(tabId) (test handle exposing _debug). |
| Shortcuts | Ctrl+F, Ctrl+H, Ctrl+G, Ctrl+S, F3/Shift+F3, Alt+F5/Shift+Alt+F5 (next and previous change), Alt+C and Alt+R inside find. Alt+W stays the host's close key, so whole word has no shortcut. Ctrl+Shift+1 replaces one, Ctrl+Alt+Enter replaces all. |
| Performance with 10,000 lines | scroll step ~1.2 ms, far jump ~8 ms, keystroke ~8 ms (about 120 ms before the shadow root). |
| Demo ids | 34 project and chat files (`file:<path>`) |

### Browser and tools (kinds/20-browser.js, kinds/22-tools.js)

| What | Value |
|---|---|
| Browser | min 360x200; idFor 'browser:<n>' (n = max of open and closed browser ids + 1); link: label = decoded title. Plus row: order 20, Ctrl+Shift+B, sub-rows localhost:5173 and app.internal/dashboards/query-performance. |
| Browser DevTools dock | right when the tab body is at least 900 px wide, else below. Right width defaults to 340 px, range 240 px to min(60% of body, body - 200 px). Below height defaults to 42%, range 25-70%. Keyboard resize: 8 px steps, 48 px with Shift. |
| Browser header thresholds | (container pmw-body): capture labels at >= 1100 px; session label at >= 620 px; core icons-only below 520 px; below 480 px Full, Region and Select (unless armed) and Forward move into More. Address field minimum 96 px. |
| Browser timing | load line 320 ms (0 under Reduced Motion); shutter flash 240 ms (off under Reduced Motion). History cap 30 (20 saved). Captures cap 24 (12 saved). Region minimum 8x8 px. |
| Browser serialize keys | url, session ('ordinary'\|'protected'), devtools, railTab ('details'\|'devtools'\|'captures'), toolTab ('elements'\|'console'\|'network'\|'access'), dockW, dockH, history, hIndex, ordinaryUrl, captures, policy (diffs from the defaults only), pageTitle. |
| Agent access policy defaults | (14 rows): Navigation On, Tabs and frames On, Page structure and components On, Styles On, Console On, Network Ask, Source maps and files On, Performance Ask, Storage and cookies Ask, Screenshots and recording On, Form input Ask, Downloads Ask, Viewport and device sizes On, Request simulation Off. Rows cycle Off -> Ask -> On. |
| Bus events emitted | (PMW.bus, readable via PM_HOME.on): 'browser:capture' {tabId, capture:{kind, w, h, comp, at, title, url}} and 'browser:send' {tabId, how:'send'\|'list'\|'insert'\|'capture', what}. |
| Tools | all four min 280x120, dedicated true. Plus rows order 70/71/72/73 in group 'tools'. |
| Output | Output is one tab, id `output`; the channel (build, tests, language-server, puppet-master) is view state, switched inside the tab; a channel opened as its own tab is `output:<channel>`, labelled 'Output · <Channel>'. Line cap 600. Streaming starts 700 ms after the tab is shown, then one line every 260-680 ms, with scripted pauses of 1.8-5 s. Follow turns off more than 24 px from the end. Time column hidden below 520 px. Serialize: channel, follow, wrap. |
| Problems | id 'problems'; demo counts 2 errors, 4 warnings, 1 note across 4 files. Source column hidden below 520 px; line/column and folder hidden below 360 px. Row height 28 px. Serialize: show {error, warn, info}, collapsed {path: bool}. |
| Ports | id 'ports'; columns 96 px / 1fr / 1.3fr / 140 px / 220 px; at < 760 px the Origin column goes and buttons are icon-only (actions 108 px); at < 480 px rows stack. Row action buttons are 32 px; rows at least 44 px. Serialize: extra (added ports), removed (port numbers). |
| Debug Console | idFor 'debug-console:' + (session \|\| 'main'); label 'Debug Console' (other sessions 'Debug Console · <name>'). Console cap 400 lines; input history 30 (20 saved); input row 34 px. Continue re-hits the breakpoint after 1.9 s; Restart pauses after 1.7 s (60 ms under Reduced Motion). Serialize: session, history. |
| Demo ids | `web:tastebook`, `web:query-dashboard`, `link:postgresql.org\|PostgreSQL%2016%20%C2%B7%20Multicolumn%20Indexes`, `link:postgresql.org\|PostgreSQL%2016%20%C2%B7%20Index-Only%20Scans`, `link:wiki.postgresql.org\|Locking%20notes%20for%20concurrent%20index%20builds`, `output`, `problems`, `ports`, `debug-console:main` |

### Dashboard (kinds/30-dashboard.js)

| What | Value |
|---|---|
| Kind 'dashboard' | label 'Dashboard', group 'Dashboards', icon 'dashboard', prefixes ['dashboard:'], min {w:320,h:120}, dedicated true, plus order 40 with sub rows Home/Metrics/Monitoring/Agents. idFor(spec) returns 'dashboard:' + (spec.board or 'home'). |
| Board to page grid | home -> #dashGridMain (internal tab 'Main'), metrics -> #dashGridMetrics ('Metrics'), monitoring -> #dashGridMonitoring ('Monitoring'), agents -> drawn by the kind (no page node). |
| Tab state saved per tab | { board } plus { filter } on the Agents board when not 'all'. Filters: all, working, needs, waiting, done. |
| Shared node | one holder at a time. Rules: holder = the grid tab shown when no other grid tab is visible; a grid tab opened while another is visible shows the note; an explicit activation or reveal claims; a hide hands over to another visible grid tab; close parks in #panel-dashboard. |
| Header row | Add widget (the page's #pm6DashAddBtn, 24 px), Board menu, Maximize/Restore (Shift+Escape). Left side: board name plus 'N widgets' (grids) or '7 agents · 3 working · 2 need you' (agents). Agents board header: Show menu instead of Add/Board. |
| Note button | 'Show it here' and 'Open transcript': 32 px document actions (.pmw-act). |
| Tab-body sizes | scroll padding 12/12/16 px, and 8/8/12 px below 420 px wide. Agents cards in a grid of minmax(240px, 1fr), one column below 420 px. The note drops its sub-line and icon below 200 px tall. The header row goes icon-only below 520 px and hides below 150 px (core). |
| Type inside the tab | --fs-2xs is raised from 10 to 11 px, and the page's .pm7-dash-extra 9 px becomes 11 px. Chips are 11 px/16 px with 10 px glyphs. Lane dots are 8 px. The agent progress bar is 4 px tall with a 1 px radius. |
| Card buttons | (.pm6-dash-btn) have an 8 px radius inside the tab (0 in Retro and NieR). The header Add widget has a 6 px radius (0 in Retro and NieR). |
| Agents clock | 1 s tick while shown. Working progress gains 1 % every 9 s, capped at 96 %. The bar transition is --pmw-t-slow (260 ms), stepped in NieR and none under Reduced Motion. |
| Reset | the starting widgets per board are captured from markup at load time. Home: orchestrator-progress 2x2, active-lanes 2x1, recent-results 2x1, custom-metrics 2x1. Metrics: quota_summary 2x1, budget_donuts 1x1, analytics_chart 1x1. Monitoring: lane_health 2x1, containers 2x1. Saved through PM7_DASH_WIDGETS.persist() 240 ms after the reset (key pm7:home-widgets:v3, unchanged). |
| Engine hook | PMW.dashboard = { reveal(board), reset(board), holder(), boards() }. |
| Agent transcript ids used | thread-agent-query, thread-agent-schema, thread-agent-rollback, thread-agent-fallback, thread-agent-bench, thread-agent-orphan, thread-agent-migration. Opened with { kind: 'transcript', agentId, label, mode: 'keep' }, or the transcript catalog item's spec when one is registered. |
| Demo ids | `dashboard:home`, `dashboard:metrics`, `dashboard:monitoring`, `dashboard:agents` |

### Plan and documents (kinds/40-plan.js, kinds/42-document.js)

| What | Value |
|---|---|
| Kind 'plan' | min 280 x 160; prefixes plan:, plan-query, deep-discovery:; canonical plan-query -> plan:ap-index; idFor(spec) = spec.run ? 'deep-discovery:'+run : 'plan:'+(spec.plan\|\|'ap-index'); plus row order 50, label 'Plan or document...'. |
| Kind 'document' | min 280 x 160; prefixes teach:, memory:, revert:, debug:, lens-source:, lens-effective:, wonderer:, wonder-source:, doc:; idFor(spec) = spec.path ? 'doc:'+path : null. |
| Plan footer | 32 px controls in one row; padding 10 px 0; inner column max 960 px with 28 px sides, 16 px below a 720 px body; Revise hidden and moved into More below 420 px; footnote hidden below 520 px. |
| Document column (frames) | max 960 px, padding 24/28 px at 720 px and wider, 16 px below; titles 22 px (18 px below 420); body text 13/20; meta 12/18; fine print 11.5/17; nothing under 11 px. |
| Steps | 20 px mark column with 16 px SVG marks (empty ring = not admitted, check = done, ring with an arc = working, clock = waiting); title 13/20 600; text 12.5/19; meta 12/18 with ids in the code face at 11.5; child steps indented 32 px; file references 24 px tall. |
| Table | min-width 440 px, scrolls sideways inside its wrapper below that; cell padding 7 x 12. |
| Markdown view | code face 12 px / 1.65; 14 px rail; 6 px dot (ok = done, accent = current); blank line between blocks. |
| D7 double-click wait | 240 ms (a single click opens the preview after it, unless a double click arrives). |
| Demo build | one step every 2600 ms while the tab is visible; pauses when hidden. |
| Embed previews | 320 x ~116 SVG at natural size, scrolling sideways below that; tick text 11 px. |
| Documents | memory panes side by side at 720 px and wider (list 300 px, gap 28 px), stacked with Back below 720 px; debug phases 4 columns at 640 px and wider, 2 below, 1 below 340; debug check rows drop the arguments column below 520; revert file state moves under the path below 520; Wonderer aside column at 900 px and wider (core), a top hairline below. |
| Text actions in document rows | 32 px tall (.pmw-docu-tbtn), 24 px inline; frame buttons 32 px with radius capped at 8 px. |
| Checking delays | in the demo (Memory verify, Wonderer check, discovery recheck): 1100-1200 ms; 300 ms under Reduced Motion. |
| serialize shapes | Plan: { plan, view: 'rich'\|'markdown', scrolls: { rich, markdown }, version? (only when an older version is shown), live? { status, done, waiting } }. Discovery: { scrollTop, run: { grillOn, created, preview, choices, asked } }. Documents: { scrollTop, view: { per-document UI state: preview, filter, note, pane, modes, open disclosures, raw … }, data: the document's model (rules / notes / revert state / debug phase / wonderer leads) }. All well under 16 KB. |
| Tab labels | plan = the plan title; deep-discovery = 'Deep Plan · discovery'; teach 'Your rules'; memory 'Gist Review'; revert 'Revert · files'; debug 'Debug · r1'; lens-source 'Lens source'; lens-effective 'What it would read'; wonderer 'Wonderer’s ideas'; wonder-source 'Wonderer · source'; doc: = basename. Hover titles, e.g. 'Your rules · Query performance', 'Tenant-scoped analytics read path · Plan V5'. |
| No settings keys | were added; all view state is per tab through serialize. |
| Class prefixes | pmw-plan-*, pmw-docu-*. NieR hook classes used: .pmw-cur (picker-like rows: memory notes, discovery options, the evidence row), .pmw-chosen (the chosen memory note). |
| Demo ids | `plan:ap-index`, `plan:ap-cache`, `plan:ap-auth`, `plan:ap-flags`, `plan:ap-embeds`, `deep-discovery:b14-thorough-1`, `plan:ap-export (added only after Create this Plan in discovery)`, `teach:query`, `memory:query`, `revert:turn-1`, `debug:dbg-investigation-1`, `lens-source:query:m-12`, `lens-effective:query`, `wonderer:w-1`, `wonder-source:dashboard-query`, `doc:docs/query-performance.md` |

### Artifact and runs (kinds/44-artifact.js, kinds/46-run.js)

| What | Value |
|---|---|
| Kind ids and minimums | artifact (min 280x160, document) with prefixes artifact:, artifact-revision:; run (min 360x200, document) with prefixes collab-run:, crew-work:, review:, room:, brainstorm:, review-evidence:, brainstorm-evidence:. |
| Canonical ids | artifact:<id> and artifact:<id>@v<current> become the chat's bare id; artifact:<id>@v<older> stays its own tab; collab-run:<run> becomes crew-work:, review:, room: or brainstorm: by run type; unknown ids stay as given. idFor: { artifact \| artifactId, version } and { run \| runId }. |
| Labels | artifact = its title. Versioned = '<title> · V<n>'. Unavailable = 'Unavailable artifact · V<n>'. Crew = 'Crew · Query Performance Rollout' (the chat's doubled prefix is removed). Review = 'Multi-Pass Review · Orchestrator Boundary Changes'. Room = 'Chat Room · Onboarding Redesign Options'. BrainStorm = 'BrainStorm · Provider Failover Strategy'. Evidence = 'Review evidence' or 'BrainStorm evidence'. |
| Plus row | order 60, 'Artifact...', with a pick(ctx) that opens PMW.catalogPicker titled 'Open an artifact'. |
| Artifact status words | Ready, Stale (warn), Needs retry (bad), Rendering, Pinned. Meta row: '<subtype word> · Version N[ of M] · <status> · <updated> · from <thread>'. Subtype words: dashboard, chart, data table, diagram, architecture map, flowchart, quiz, capability table, image, test evidence, report, code. |
| Charts | columns when the body is at least 520 px, horizontal bars below that. Plot height 200 px (170 below 520). Bars 24 px wide with a 4 px rounded data end and a square foot, one series colour (--pmw-accent). The target line is a 1 px dash with a label. The line chart uses a 2 px stroke, 8 px dots with a 2 px surface ring, and a 10 % area wash. Money shows 2 decimals; null values print 'not reported'. |
| Diagrams | node height 38 (52 with a sub-label), row gap 48, node gap 22, text sizes 13 / 12 / 12 (label / sub / edge). Fit shrinks to at most 92 % (smallest text 11 px); narrower bodies scroll sideways and start centred. Actual size is 100 %. |
| Loading and retry | the forecast starts at progress 0.4 with a 2400 ms ETA (about 1.44 s left), updating every 120 ms. Retry takes 900 ms (300 ms under Reduced Motion). |
| Run layout | a 220 px aside at a body of 900 px and up, otherwise below it in an auto-fit grid of at least 180 px. BrainStorm options in 3 columns at 900 and up, 2 at 600 and up, 1 below. The vote table stacks below 640. The plate is one row at 720 and up (1200 and up when there are 5 or more seats; below that the input card takes its own row), wraps from 420 to 719, and becomes a caption line below 420. The Chat Room's head actions take their own row below 900. Team rows move the outcome under the name below 520. The cost list drops the model column below 520. |
| Run timing | (only while the tab is visible and not paused): the Crew clock ticks every 1 s. Review readers finish at 3, 6 and 8 s visible and the report arrives at 10 s. Chat Room streaming adds 2 words every 60 ms; under Reduced Motion, or when the tab is hidden, messages arrive whole. Write the plan takes 1400 ms (400 ms reduced). |
| Puppets | 28 px in the plate (26 px for the hub and You), 22 px in team rows, 20 px in timelines, 34 px in the participant view. State corner marks are 12 px. Seat hue tokens --pmw-run-h1..h5 = accent-blue, accent-magenta, accent-lime, accent-orange, --pmw-accent (all ink in NieR); the hub and You are neutral. |
| Persisted tab state | artifact { view: 'fit'\|'actual'\|'source', metric: 'p95'\|'s0'..'s3', filter: 'all'\|'hit'\|'miss', sort: { col, dir }\|null, answers: { qIndex: choiceIndex } }; run { tab: 'overview'\|'conv'\|'team'\|'cost', person, filter }. Live run state (paused, progress, rounds, ticks, promotions) is kept only for the session, per run. |
| Header-row action ids | artifact uses versions, newpanel, more, with left facts view (the text toggle) and path. Run More menu ids: cancel (yes/no submenu), setup, again (review only), transcript (disabled), newpanel. |
| Demo ids | `dashboard-query`, `mermaid-runtime`, `render-forecast`, `test-evidence`, `data-explorer`, `architecture-map`, `report-query`, `flow-plan`, `chart-cost`, `quiz-indexes`, `periodic-capabilities`, `generated-image`, `transcript-summary`, `lens-receipt`, `crew-board`, `broken-viz`, `chart-latency`, `deep-plan-sources`, `artifact-revision:%7B%22artifact_id%22%3A%22dashboard-query%22%2C%22artifact_version%22%3A4%2C%22project_id%22%3A%22pm%22%2C%22thread_id%22%3A%22query%22%7D`, `crew-work:crew-query-perf`, `review:review-orchestrator-boundary`, `room:chatroom-onboarding`, `brainstorm:brainstorm-provider-failover`, `review-evidence:review-orchestrator-boundary:ev-1` |

### Transcript, context and records (kinds/48-transcript.js, kinds/50-context.js, kinds/52-record.js)

| What | Value |
|---|---|
| Transcript | min 280 x 160; feed column max 760 px; padding 18/24/44 px, 14/14/40 below 720 px; spine 1 px line with 6 px dots, the live dot an 8 px ring. |
| Transcript stretches | toggle row at least 30 px; step-rail discs 16 px with 10 px glyphs; the rail folds after 10 discs into '+N'; record rows use 13 px glyphs. |
| Transcript text sizes | prose 13/21; record title 12.5/19; detail 12/18; time 11.5. |
| Transcript timing | streaming interval 3400 + ((delivered*7) % 4) * 700 ms (3.4-5.5 s); word reveal 2 words every 55 ms; follow-bottom threshold 28 px; elapsed ticks every 1 s; live breathe 1.6 s (Retro/NieR stepped blink 1-1.2 s); new-item slide uses --pmw-t-slow. |
| Transcript container breakpoints | step-rail discs hidden below 420; model fact hidden below 700; Parent fact hidden below 560; 'Read-only · live' words hidden below 440 (lock stays); agent name hidden below 360. |
| Transcript serialize | { agentId, follow, open: [stretchIds], scrollTop }. Status words: working Working, blocked Stalled, waiting Waiting, complete Complete, failed Failed, queued Queued, retrying Retrying, fallback Fallback route. Elapsed ticks for working, retrying, fallback and waiting. |
| Context | min 280 x 160; column max 720 px, 960 px at 960 px and wider; Source composition and Context growth side by side, and open by default, at 960 px and wider until the reader toggles a section. |
| Context sizes | hero number 32 px; bar 6 px; disclosure rows 34 px; tiles 3 columns at 360 px and wider, 1 below; four-tile groups 4 columns at 600 px and wider, 2 below, 1 below 300 px; plan-limit rows 3 columns (name, bar, 128 px figure) with the bar on its own line below 460 px; '64% used' fact hidden below 380 px. |
| Context chart and tone | growth chart 168 px tall, y axis to 140,000, gridlines at 0/50K/100K, ceiling at the 131,000 limit, ticks at turns 1/5/9. Limit tone: ok under 70, warn at 70 and above, bad at 90 and above. |
| Context serialize | { threadId, view: 'curated'\|'raw', open: [sectionIds] or null (null while the width decides), scrollTop }. Section ids: tokens, sources, growth, route, limits, caps, cost, compaction. |
| Context composition palette | (categorical slots 1-6, validated with the dataviz validator, all checks pass): dark #3987e5 #d95926 #199e70 #c98500 #d55181 #008300; light #2a78d6 #eb6834 #1baf7a #eda100 #e87ba4 #008300. NieR uses ink at .92/.72/.56/.42/.30/.20 with hatching on even segments under the 'charts' part. |
| Record | min 280 x 120; column max 960 px (shared doc frame); result rows padding 10 px; tables scroll sideways with nowrap cells and a notes column at least 160 px; label = the query cut at 27 characters + '…' when longer than 28, else 'Search'; mcp label = the tool, else 'MCP'; serialize { scrollTop }. |
| Shared | header-row actions are 24 px targets (core); document actions are 32 px (PMW.frames.button and .pmw-rec-srcbtn); nothing under 11 px. |
| Demo ids | `thread-agent-query`, `thread-agent-schema`, `thread-agent-bench`, `thread-agent-migration`, `thread-agent-rollback`, `thread-agent-motion`, `thread-agent-test`, `thread-agent-tokens`, `thread-agent-orphan`, `thread-agent-theme`, `thread-agent-plan`, `thread-agent-probe`, `thread-agent-fallback`, `thread-agent-evidence`, `context:query`, `search:postgres%20composite%20index%20write%20amplification\|8%20results`, `search:index%20only%20scan%20visibility%20map\|3%20results`, `search:autovacuum%20analyze%20threshold%20after%20create%20index\|6%20results`, `mcp:grafana.query-range\|Called%20grafana.query-range%20%E2%80%94%20p95%20series%2C%20last%2024h`, `mcp:linear.update-issue\|Called%20linear.update-issue%20%E2%80%94%20PERF-218%20%E2%86%92%20%22index%20landed%22`, `app:inspector`, `work-record:m-7` |

### Stand-in chat (kinds/95-standin-chat.js)

| What | Value |
|---|---|
| Settings keys | 'chat.standIn' (boolean, default true; registered by the stand-in) and 'chat.history' ('flyout' \| 'pinned', default 'flyout', already in core 04-settings.js), read and written by the History pin. |
| Layer | div#pmw-chat.pmw-scope.pmw-sc, the last child of #chatPanel, position absolute, inset 0, z-index 40, isolation isolate. While on, it sets data-pmw-sc="on" on #chatPanel. Hidden under html[data-o55-tour] and when 'chat.standIn' is false. |
| Container | pmw-sc (inline-size). Breakpoints: max-width 479.98 px is compact (12 px side padding, status word hidden, card icons hidden, user bubble 92%); 480-639 px uses 16 px padding; min-width 640 px uses 24 px padding. Message column max-width 720 px. |
| Column widths exercised | 400, 600 (the default at 1920), 681 (760 requested, capped by the core's centre budget at 1920), 440 floating, 32 px folded strip (layer hidden by the core's strip rule). |
| Header | 44 px. Header icon buttons 28 x 28 px (context ring button 32 x 28, ring 26 px, number 11 px). Document action buttons 32 px tall. Work rows at least 30 px. History rows at least 40 px. Send button 32 x 32 px. |
| Type | body 13/20 px, secondary 12/18 px, meta 11.5 px, smallest 11 px (kickers, section heads, 'when' lines, ring number). Card title 13.5 px / 650. Inline code 12 px. Command output 11.5/17 px. |
| History | flyout width min(300 px, 82cqw); pinned column 240 px (200 px under 540 px). |
| Timing | scripted reply delay 650 ms (120 ms under Reduced Motion); 'Play all' gap 260 ms (0 under Reduced Motion). Smooth scrolling is off under Reduced Motion. Nothing in the layer animates. |
| Corner radius | buttons calc(var(--pmw-radius) * .6), which is 8.4 px in Friendly, 0 in Retro and in NieR with the square part. Rows use --pmw-row-radius. |
| Ids opened | (digest 05 section 13): plan:ap-index, plan-query, plan:ap-cache, deep-discovery:b14-thorough-1, file:src/analytics/queries.rs (line 128), file:migrations/0043_tenant_created_index.sql (line 1), file:src/analytics/legacy_rollup.rs, thread-agent-query, thread-agent-schema (agent:Query Performance), dashboard-query, mermaid-runtime, test-evidence, data-explorer, chart-cost, quiz-indexes, periodic-capabilities, architecture-map, flow-plan, generated-image, report-query, broken-viz, render-forecast, the artifact-revision:{dashboard-query, v6, pm, query} id, search:postgres%20composite%20index%20write%20amplification\|8%20results, mcp:grafana.query-range\|..., app:inspector, link:postgresql.org\|PostgreSQL%2016%20%C2%B7%20Multicolumn%20Indexes, room:chatroom-onboarding, review:review-orchestrator-boundary, brainstorm:brainstorm-provider-failover, crew-work:crew-query-perf, collab-run:chatroom-onboarding, review-evidence:review-orchestrator-boundary:ev-1, teach:query, memory:query, revert:turn-1, debug:dbg-investigation-1, lens-source:query:m-12, lens-effective:query, wonderer:w-1, wonder-source:dashboard-query, context:query, browser:1 (https://app.internal/dashboards/query-performance). |
| Command card terminal | id terminal:cmd-bench, session cmd-bench, cwd ~/tastebook/api, invocation 'cargo bench'. |
| Agent opens | (D8, all background): terminal:agent-bench (agent:Query Analyzer, cargo bench --bench analytics), browser:2 (agent:Query Analyzer), plan:ap-embeds (agent:Builder), file:src/analytics/index_hints.rs kept (agent:Builder), crew-work:crew-query-perf (agent:Builder), thread-agent-schema (agent:Query Performance). |

### Guided Tour workspace chapter (js/52-tour.js)

| What | Value |
|---|---|
| Tour step ids | new order in chapter 'workspace': workspace_orientation, open_from_plus, open_file_from_rail, split_by_drag, widget_action. Retired: move_or_dock_chat. Total steps 20 (was 18). Workspace-chapter actions: 4 (was 2). |
| TR.minutes | 6 (estimate; the census tool should measure it at publish). |
| Done-conditions | open_from_plus = menus.plus used and then a created 'open' event or a new tab id. open_file_from_rail = an editor tab created since the step began. split_by_drag = an applied cmd.panel_tab.move with args.split since the step began, and the panel count grew. |
| Split Show Me drop point | 34 px inside the documents panel's right edge, or 30 px above its bottom edge. This keeps the drop clear of the centre's 12 px outer root band. Ready when PMW.gesture.active.zone.type is 'split'. |
| Fit at 1920x1080 | in the Home layout (rail open, chat about 600 px): documents panel 511x598, editor minimum 280x120, so only Split down fits and the copy names Split down. |
| widget_action | waits up to 1500 ms for #pm6DashAddBtn after revealing dashboard:home. The file step waits up to 900 ms for a file row. |
| Restore sources | 'guided_tour_restore' (Skip or Finish, through PM_HOME_WORKSPACE.o55RestoreSnapshot) and 'guided_tour_back' (Back). |

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
