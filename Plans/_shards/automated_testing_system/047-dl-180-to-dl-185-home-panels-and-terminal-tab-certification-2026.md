# Shard 047: DL-180 to DL-185 — Home Panels And Terminal Tab Certification (2026-10-09)

Source: `Plans/Automated_Testing_System.md`

Source lines: L5906-L6255

Source SHA256: `64e6a3029903f00d5196febde4ed1ceb65d332cece93552c030c6488fa84a9e1`

---

## DL-180 to DL-185 — Home Panels And Terminal Tab Certification (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180` to `#DL-184`) replaces Home's four fixed editor panels, its
singleton dashboard, its movable chat and its docked terminal sections with one universal panel system, and rebuilds
the terminal as one session per tab with images, a layered appearance model, effects, faces and safe agent use. This
addendum adds ATS-075, the certification of the home panels, and ATS-076, the certification of the terminal tab. It
supersedes ATS-029 (the four-panel matrix and its exact 72-case visual matrix) and amends ATS-047 (images are approved
by DL-182, and input protection follows a session across tab moves), each with a dated note. Both units consume the
owner units they cite and restate none of their rules. They are required future fixtures and evidence, not executed
passes: a missing runner or an unrun native client stays `not_run` with its reason, never an inferred pass. They create
no WorkNodes, NodeSeeds, executable queues, implementation files or production build tasks.

### ATS-075 - Home Panels Certification

```yaml
plan_unit_id: ATS-075
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The home panels (DL-180) are certified by one matrix that replaces ATS-029's four-panel matrix. Every case drives
  the visible production control, by pointer and by keyboard where both exist, and asserts the visible outcome: the
  rendered geometry, the tab and its rendered body, the mark shown, never only a dispatch count or a global marker.
  Each case records the layout before and after, every command, receipt, event and saved write, and the console and
  page errors from listeners installed before navigation; a case passes only with zero errors. The cases cover: the
  split tree and its invariants after every structural change (every leaf a panel, a split with two or more children
  and never its parent's direction, sizes above 0.02, each tab in exactly one panel, pinned tabs first, one preview tab
  per panel), the fit rule, the insertion and removal shares, the 0.34 share of a panel docked at the centre's edge, the
  6 px gaps, the 8 px divider hit target and the divider keys, collapse below half a panel's minimum to its 35 px strip
  with its state kept, maximize and restore, locked panels, and closing the last tab
  (Plans/FinalGUISpec.md#F3-630); the tab strip's heights, gaps, widths and shrink order, the active tab's 120 px
  minimum, pinned tabs, close targets and every mark, with the fused silhouette as the only active-tab marker in every
  look (F3-631); the "+" menu's rows in their order, the row body, the trailing cell, Alt+click and Alt+Enter, Ctrl+T,
  and the empty-panel launcher (F3-632); the "+N" list, its search, its grouping by kind and its use as a drop target
  (F3-633); the opening rules from every caller, the file tree (Plans/FileManager.md#F-090), chat file references, diff
  views and Changes rows, transcript file records, search results and everything else the chat opens
  (Plans/assistant-chat-design.md#ACD-500), Ctrl+P, the "+" menu, agents, the terminal's links and the artifact viewer
  (Plans/Runtime_Artifacts_Panel.md#RAP-065): one id one tab with reveal, preview and keep, placement of document,
  dedicated and tool kinds including the tools fallback (the last-focused panel holding that tool kind, then the
  last-focused panel holding a terminal, then the last-focused document panel, then a new panel by the fit rule), locked
  panels skipped, Alt+click, and an agent's open landing in the background with the hollow square and an announcement
  without taking focus (F3-634); the narrow ladder at the panels concept's seven measured window widths, 1920, 1680,
  1470, 1440, 1280, 1024 and 900 px, each matching F3-636's rail, chat and centre widths with the default rail and chat,
  its 48 px hysteresis, and none of its states ever saved (F3-636); the chat column's default width, its drag range, the
  960 px centre floor, Pop out and its return, and its height from the title bar to the status bar (F3-637); dashboard
  tabs and their boards (Plans/Widget_System.md#WS-030, F3-638); the four named layouts' exact trees and proportions,
  applying one keeping every tab with no terminal ended and no unsaved buffer dropped, Restore home layout, and saved
  layouts (F3-630); the keyboard map in the desktop app and the web-client mapping, with every label, menu shortcut and
  hover tag showing the key that works where the app runs (F3-635); the tab kinds: each of F3-635's fifteen kinds
  registered once with its id prefixes and content minimum (terminal 320 x 120 px, browser 360 x 200, dashboard 320 x
  120, run 360 x 200, plan/document/artifact/transcript/context 280 x 160, editor/record/tools 280 x 120), an unknown prefix opening no tab, a restored background tab mounted
  only when it is first shown, and each tab body sized by its own box, never the window (F3-635); the shared header row,
  30 px tall with 24 px targets, 12 px text and 11 px secondary facts, labels from a 520 px body width and icons with
  hover tags below it, and hidden under 150 px of body height (F3-635, Plans/DRY_Rules.md#DR-065); every menu, the "+"
  menu, the "+N" list, panel menus, drag ghosts and landing previews opening in the one overlay root in its fixed
  stacking order, with no kind appending an overlay of its own (Plans/DRY_Rules.md#DR-067); the artifact viewer's own
  behaviour: a subtype per artifact type, the metadata record and owner routes for a type with no subtype, the version
  list opening or revealing `artifact:<artifact_id>@v<n>`, the unversioned tab following the current version, and the
  loading, stale, error and retention tombstone states, never an empty tab (RAP-065); the editor tab: the contact-aware
  strip, the minimap as the code pane's only scrollbar with its change marks, sticky scroll, find and replace, go to
  line, preview tabs, and the diff side by side when the tab body is wide and inline when it is narrow, decided by the
  body's own width (Plans/FinalGUISpec.md#F3-639); the migration from `home_workspace_layout.v1` and
  the Home part of `layout:v1` into the v2 record, converted on first read and never reset, including corrupt and
  unknown inputs (Plans/storage-plan.md#SP-330); every look, Friendly, Glass, Retro and Basic in light and dark, NieR
  Mode with each part installed and absent, and Reduced Motion (F3-647); the bans, enforced by a lint that fails the
  build on a pill (a fully rounded capsule used as a tab, tag, badge, button or status chip), on a coloured side
  border or inset side shadow of 2 px or wider, and on an emoji in Puppet Master's chrome (Plans/DRY_Rules.md#DR-069,
  F3-648); and no internal id, tab, panel, session or nonce, appearing as text anywhere. Command and event truth: a
  changed release or a structural action dispatches exactly one command of Plans/UI_Command_Catalog.md#UCC-200 and
  appends exactly one `workspace.layout_changed` naming the change (Plans/Contracts_V0.md#CV-361); a reveal, a `ui.*`
  view action, opening a menu, hovering and dragging dispatch nothing and append nothing; a cancelled, invalid or
  unchanged gesture restores the model exactly and dispatches and saves nothing; a rejected commit rolls back. The
  control census is the closed lists of Plans/UI_Wiring_Rules.md#UIW-040 and #UIW-041 and the wiring is
  Plans/Wiring_Matrix.md#WM-090's rows: a control with no row fails. Identity fixtures prove that no case duplicates a
  buffer, browser session, chat identity, terminal session or PTY. The visual matrix is the full cross product of the
  eight look variants and NieR Mode, the four named layouts and the seven measured widths, each capture from a fresh
  context with seeded storage, look and motion, and a screenshot counts only beside its harness result and error log.
  Checks run against the panels concept and its harness are concept evidence only: they never certify the native
  desktop or web client, which needs its own run's receipts naming the revision, platform, toolkit and renderer
  (ATS-067). This supersedes ATS-029.
gui_related: true
gui_classification_reason: The certification exercises and captures every visible behaviour of the home panels across looks, widths, layouts, motion and failures.
split_recommended: false
depends_on: [DL-180, DL-184, F3-630, F3-631, F3-632, F3-633, F3-634, F3-635, F3-636, F3-637, F3-638, F3-639, F3-647, F3-648, WS-030, F-090, RAP-065, SP-330, CV-361, UCC-200, UIW-040, UIW-041, WM-090, DR-065, DR-067, DR-069]
unblocks: [GRRC-040]
acceptance_criteria:
  - "After every structural command the split tree satisfies each invariant listed, and the fit rule, the shares, the gaps, the divider target and keys, collapse, maximize, locking and last-tab closing each have a passing case that asserts rendered geometry."
  - "The strip, \"+\" menu, empty-panel launcher and \"+N\" list each have cases for every size, mark, row and key their owner units give, in every look."
  - "Every caller listed opens through the one opening module, and cases cover reveal, preview, keep, each kind's placement including the tools fallback, locked panels, Alt+click and agent background opens without focus change."
  - "At each of the seven measured widths the rail, chat and centre widths match F3-636, each ladder step undoes only 48 px past its threshold, and no ladder state is saved."
  - "Each named layout applies with its exact tree and proportions and keeps every tab, terminal session and unsaved buffer."
  - "Every key of the desktop map does its action, and in the web client the four browser-owned chords are answered as Alt+T, Alt+W, Alt+Shift+T and Alt+` with labels showing those keys."
  - "Each of the fifteen tab kinds is registered once with its id prefixes and content minimum, an unknown prefix opens no tab, a restored background tab mounts only when first shown, and every tab body sizes by its own box."
  - "The shared header row has the stated height, targets, text sizes, 520 px label threshold and 150 px hide threshold in every kind that uses it, and every menu, list, drag ghost and landing preview opens in the one overlay root in its fixed stacking order."
  - "The artifact viewer shows each type in its subtype or, without one, its metadata record and owner routes; choosing a version opens or reveals `artifact:<artifact_id>@v<n>` while the unversioned tab follows the current version; loading, stale, error and tombstone states each show, never an empty tab."
  - "The editor tab has the contact-aware strip, the minimap as the only code-pane scrollbar, sticky scroll, find and replace, go to line and preview tabs, and its diff is side by side when the tab body is wide and inline when narrow, decided by the body's width."
  - "A v1 Home layout and the Home part of `layout:v1` convert into the v2 record on first read with every tab kept and nothing reset; corrupt and unknown inputs follow SP-330."
  - "The bans lint fails the build on a pill, a coloured side border or inset side shadow of 2 px or wider, or an emoji in chrome, and a census finds no internal id shown as text."
  - "Each structural commit appends exactly one `workspace.layout_changed`; reveals, `ui.*` actions, menus, hover and drags append none; a cancelled, invalid or unchanged gesture restores the model exactly with zero dispatches and zero writes; a rejected commit rolls back."
  - "Every control in UIW-040's and UIW-041's lists has a WM-090 row, and the control census finds no control without one."
  - "The visual matrix holds every combination of the eight look variants and NieR Mode, the four named layouts and the seven widths, each with zero console and page errors."
  - "No result from the panels concept or its harness is reported as native certification."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
  - "Editor and terminal list the same code colour-scheme catalog and open the same Appearance popover component."
  - "In every look and in NieR, text and state colours (dim text, accent, ok, warn, bad and inactive tabs) mixed from the page's own colours reach 4.5:1 while the Settings accent flows through, and primary buttons choose black or white ink from fill luminance with at least 4.5:1 contrast."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - "Future home panels live matrix and visual matrix receipts; native and visual execution remain not_run"
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: home_executable_matrix
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS-ADDENDUM-2.md, SHA-256 a7cf9f8cea26ad50df796f5b7ac1472c1468a92ee511ea954a3f8e2505b28be2 (Addendum 2 D27)"
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-184"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1-D10, D22, D23)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (sections 9, 13 and 14; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (the measured widths and the named layouts; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8 (section 3.7 and gap C19; audit lineage only)"
preserved_exact_tokens:
  - "workspace.layout_changed"
  - "ui.*"
  - "home_workspace_layout.v1"
  - "layout:v1"
  - "not_run"
  - "zero console and page errors"
  - "artifact:<artifact_id>@v<n>"
negative_constraints:
  - "Do not certify Home with a dispatch count, a global marker or a screenshot alone."
  - "Do not substitute an internal API for a missing visible production control."
  - "Do not report a concept or harness result as native certification."
  - "Do not keep ATS-029's four-panel targets, terminal section limits, terminal-max layout or 72-case matrix as certification."
compatibility_only_notes:
  - "The panels concept's harness hooks and storage keys are concept lineage and are not product test names."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Matches the 960 px chat-drag centre floor in the wrapped certification prose."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Certifies the per-kind document content minima adopted from NUMBERS."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Certifies both text/state contrast and primary-button ink across looks and NieR."
  - "Amended 2026-10-10 (Addendum 2 D27, DL-183): Shares the code colour-scheme catalog and Appearance popover with the editor and terminal."
  - "Superseded 2026-10-09 (DL-180): ATS-029's four-panel live matrix and its exact 72-case visual matrix."
owner_boundary_notes:
  - "This unit tests the owner units it cites and adds no rule of its own; F3-630 to F3-639, F3-647 and F3-648, WS-030, F-090, RAP-065, SP-330, CV-361, UCC-200, UIW-040, UIW-041, WM-090, DR-065 and DR-067 own the behaviour."
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-639, ContractName:Plans/Runtime_Artifacts_Panel.md#RAP-065, ContractName:Plans/DRY_Rules.md#DR-067, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/Automated_Testing_System.md#ATS-029

### ATS-076 - Terminal Tab Certification

```yaml
plan_unit_id: ATS-076
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The terminal tab (DL-181, DL-182, DL-183) is certified by its own matrix, under ATS-075's rules of evidence: every
  case asserts the visible or recorded outcome, records commands, receipts, events and writes, and passes only with
  zero console and page errors. Sessions (Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180,
  Plans/FinalGUISpec.md#F3-640): one session per tab; moving, reordering, collapsing, maximizing or hiding the tab,
  splitting beside it, applying a named layout and revealing it with `cmd.terminal.reveal` in any panel keep the same
  terminal_session_id, with no restart, no replayed input, no second PTY and no change to shell-failure counting; Split
  opens a new panel with a new session in the same folder and shell profile; closing a running terminal asks inline
  first and closing ends its session; Reopen closed tab and a tab restored after a restart start a new session in the
  same folder and profile and say so with the restored notice, never pretending to be the old session; an ended
  session shows its inline row and dims the screen to 72 %. Chrome (F3-640): the tab label, the exit code of a failed
  command and the agent mark; the header row's content, labels from a 520 px body width and icons below, hidden under
  150 px of body height; the gutter and scrollbar widths at 399 and 400 px; the More, context and command-mark menus
  with exactly their items in order, opening in the one overlay root; notices as inline rows, never modals and never
  side stripes; no session id, tab id or nonce as text. Features (F3-641, SMPFS-183): command marks carry the
  terminal's secret, and a mark with a missing or wrong secret stays output and draws no glyph; every command record
  carries `by` and the mark menu names who typed it; a plain click on a link selects text, Ctrl+click (Cmd+click) on a
  `path:line:col` reference opens the panel's preview tab at that line and column by F3-634, Ctrl+double-click keeps
  it, Ctrl+Alt+click opens a new panel, a URL opens a Browser tab, and Open output in an editor tab opens a buffer,
  never a preview; find with case, whole word, regular expressions, highlight-all and its scrollbar marks; copy mode
  and quick select with their keys; the plain-text buffer; the terminal's keys, the host keys it gives back, and every
  other Ctrl+key reaching the shell; and no explain, fix, suggest or ask action and no inline completion anywhere in
  the tab. Appearance (F3-642, Plans/storage-plan.md#SP-331, Plans/Settings_System.md#SSYS-051,
  Plans/DRY_Rules.md#DR-068): each field resolves this tab, then the project default, then the app default, then the
  look's default, an unset field falling through; every field applies live from the Appearance popover and from
  Settings and none shows a restart badge; the popover writes This terminal or All terminals, All terminals is enabled
  and writes the project default through the same Settings transaction Settings uses, its hover tag says in this
  project, and no surface writes an app-wide value; each look's Follow look scheme in light and dark; the minimum-contrast floor at 4.5:1 by
  default with Off, 3:1, 4.5:1 and 7:1, moving OKLab lightness only and leaving block, powerline and sextant glyphs
  alone; import of the seven formats with the 256 KB cap, no evaluation and fixed errors that never echo the file; and
  cells of whole device pixels with no stripe at the padding. Effects (F3-643): only the focused, visible terminal
  animates; every effect stops within 10 s of the last output or keystroke, after which no effects frames run
  until the next output or keystroke; an effects frame takes at most 2 ms of CPU at DPR 2 on P1000-class hardware;
  battery saver turns motion off; where no GPU draws the terminal the effects layer stays off, zero effects frames
  run, plain static scanlines and glow paint and the popover names what it could not draw; Reduced Motion
  stops every moving part and keeps the static looks; Retro dark shows scanlines and phosphor glow by default, and Full
  CRT and flicker are off by default in every look; flicker defaults to 0.02 and never exceeds 0.03 of relative
  luminance; degauss is a one-shot action; NieR's terminal touches follow their installed parts. Faces (F3-644): the
  six faces, JetBrains Mono, VT323, Sixtyfour, Sixtyfour Raster, Departure Mono and Atkinson Hyperlegible Mono;
  JetBrains Mono in every look but Retro, where VT323 is the default; each face at its default size and line height;
  JetBrains Mono's bytes from the page's code face, never a second copy, and the terminal's own faces 84,572 bytes
  before base64; box drawing, block, braille, powerline and sextant glyphs drawn by the terminal; every face under a
  permissive licence. Images (SMPFS-181, F3-645): the complete kitty graphics protocol (direct, file,
  temporary-file and shared-memory transmission, chunking, ids and placement ids, placements, relative placements, the
  three z tiers, every delete selector, Unicode placeholders, animation frames, control and compose, queries), sixel,
  and iTerm2 inline images single and multipart; the paint order; images anchored to their cell through scroll, reflow
  and clipping; text over a sixel or iTerm2 image cutting it out; output after an image waiting for its decode. The
  hardening cases, each asserting its exact reply: a file medium that is not a regular file, a path under `/proc`,
  `/sys` or `/dev` other than `/dev/shm`, a symlink loop, and a missing, unreadable or short file each answer exactly
  `EBADF:Failed to read image file`; a temporary file is deleted only inside `/tmp` or `/dev/shm` and only with
  `tty-graphics-protocol` in its path; shared memory is unlinked after reading; a remote (SSH) session and a command an
  agent typed get the same `EBADF` for every file medium and may use direct transmission; every error reply is one of
  SMPFS-181's fixed strings and never echoes what the program sent; a sequence over its escape-sequence cap gets
  `EFBIG`; the per-screen-buffer image quota with its eviction order (images without placements, then transient ones,
  then the least recently used), the animation-frame pool, the per-side, iTerm2 and sixel limits, 2048-byte names,
  relative placements deeper than allowed (`ETOODEEP`) and in a cycle (`ECYCLE`), and the fastest frame shown. An
  animated image pauses while its terminal is hidden and under Reduced Motion. The accessible
  buffer and agent reads show `[image W×H px]` (", animated" when it is), `[image]` for a Unicode-placeholder run, or a
  dropped image's placeholder label, never image data. Saved scrollback (SP-332, SMPFS-181, F3-640, F3-645): what is
  saved and what never is (the alternate screen, the command line being typed, selections and find highlights); a
  restored terminal showing its lines, marks and images where they were, then the dim restored rule, then the new
  prompt, with the restored notice; the 64 MiB quota per terminal, with text never giving way to images and images
  dropped oldest first, an unreadable frame treated the same; each dropped image's cells showing the dashed placeholder
  `[<name> <W>×<H> · not kept]` and the notice counting the images not kept; placeholder ids on restored lines resolving
  only to restored images, so a new program reusing an image id never paints into the old scrollback; a command still
  running when the page went away coming back ended and indeterminate, "ended with the earlier session", never done;
  the write cadence (1.5 s after output settles, at most every 5 s while output streams, and when the page hides,
  never rewriting an unchanged terminal); Clear scrollback emptying the saved copy at the next save; a closed tab's
  copy kept while the tab can be reopened and for at most 7 days; the 5 s load budget, past which the tab starts
  without its scrollback and says so; and saved scrollback staying on this machine, excluded from backups, exports and
  sync. Agents (SMPFS-182, F3-646, Plans/Contracts_V0.md#CV-362): the four inline rows with their exact text and
  actions; a keystroke in a terminal an agent drives taking over at once, the Paused row, and the agent's next write
  refused as `preempted`; Allow once letting exactly one command through, after which the row, the mark and the writer
  lease go back to the human; Allow in this terminal held in memory only and never stored, ending when the terminal
  closes, when the human takes over by a keystroke, Take over or Stop, and when that agent's run ends, given again by
  Hand back for the rest of that run, and never replacing command approval: every command typed under it still passes
  the Tools policy engine with its own approval over that exact invocation
  (Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-024, Plans/Permissions_System.md#PS-041); Deny refusing the
  write and telling the agent; no control labelled Always allow here; a secret prompt showing the padlock cursor and
  refusing agent input as `secret_input`; Interrupt sending SIGINT and Stop ending the agent's run and returning the
  lease; agent-typed commands carrying the square gutter mark; an agent-opened terminal landing in the background with
  the hollow square and never taking focus; input protection outranking every grant and blocking an agent with an
  explicit blocked result and zero child writes across tab moves, collapse, maximize, hide, layout apply and restore
  (ATS-047 P10); and agent reads returning rendered text with a read state, never raw bytes and never images. Commands
  and wiring: each terminal control dispatches its command of Plans/UI_Command_Catalog.md#UCC-201 and is in
  Plans/UI_Wiring_Rules.md#UIW-042's census with its Plans/Wiring_Matrix.md#WM-091 row. Concept checks of the
  terminal concept are concept evidence only, as ATS-075 says; native receipts name the revision, platform, toolkit,
  renderer and transport, and a missing runner stays `not_run`. This amends ATS-047, whose image exclusion DL-182
  replaces, and takes over ATS-029's terminal identity fixtures.
gui_related: true
gui_classification_reason: The certification exercises every visible behaviour of the terminal tab, its images, its appearance, its saved scrollback and its agent rows.
split_recommended: false
depends_on: [DL-181, DL-182, DL-183, SMPFS-180, SMPFS-181, SMPFS-182, SMPFS-183, F3-640, F3-641, F3-642, F3-643, F3-644, F3-645, F3-646, SP-331, SP-332, CV-362, UCC-201, UIW-042, WM-091, ATS-047, ATS-075]
unblocks: [GRRC-040]
acceptance_criteria:
  - "Moving, reordering, collapsing, maximizing, hiding, splitting beside, layout-applying and revealing a terminal tab keep one terminal_session_id with no restart, replayed input or second PTY; Split, close, Reopen closed tab and restore each behave as SMPFS-180 says, with the restored notice."
  - "The label, header row, gutter and scrollbar widths at 399 and 400 px, the three menus and the inline notices match F3-640, and no internal id appears as text."
  - "A mark without the terminal's secret draws no glyph, every command record carries `by`, and the link, find, copy mode, quick select, plain-text buffer and key cases pass as F3-641 and SMPFS-183 say; no AI action exists in the tab."
  - "Each appearance field resolves through the four layers, applies live with no restart badge, and the contrast floor, import limits and cell geometry cases pass."
  - "Only the focused, visible terminal animates, idle terminals draw no ambient frames, the no-GPU and Reduced Motion cases keep only the static looks, and flicker never exceeds 0.03 of relative luminance."
  - "The six faces load with their default sizes and line heights, JetBrains Mono is never a second copy, and the terminal's own faces total 84,572 bytes before base64."
  - "Each kitty graphics feature, sixel and iTerm2 single and multipart images render in the paint order and stay anchored to their cells."
  - "Every hardening case returns its exact fixed reply, including `EBADF:Failed to read image file` for every file-medium failure and for file media from a remote session or an agent-typed command, and no reply echoes program input."
  - "Quota, eviction order, frame pool, size, name, depth and cycle limits each refuse or evict as SMPFS-181 says, and animation pauses while hidden and under Reduced Motion."
  - "A screen buffer keeps at most 4,096 image placements, the 4,097th dropping the oldest placement that no other placement hangs from, and no placement covers more than 10,000 cells (SMPFS-181)."
  - "Saved scrollback restores with its images, drops images oldest first with the dashed placeholder and a counted notice, resolves restored placeholder ids only to restored images, brings back a running command as ended and indeterminate, honours the write cadence, Clear scrollback, the 7-day closed-tab limit and the 5 s load budget, and never leaves this machine."
  - "The four agent rows show their exact text; take-over refuses the agent's next write as `preempted`; Allow once lets one command through; Allow in this terminal is never stored, ends on close, take-over or run end, returns on Hand back, and every command under it still asks for its own approval; Deny refuses; secret prompts refuse agent input as `secret_input` with the padlock; no control reads Always allow here."
  - "Hovering Allow once shows \"<agent> types this one command\" and Allow in this terminal shows \"<agent> may type here until its run ends or you take over. Each command still needs its own approval.\"; while that grant lasts the Driving row stays between commands and More, Agent input lists \"Allowed in this terminal: <agent>\" with Revoke, which ends it; no text in the row, its hover tags or the menu suggests commands are pre-approved (F3-646, SMPFS-182)."
  - "Input protection blocks an agent with an explicit blocked result and zero child writes across tab moves, collapse, maximize, hide, layout apply and restore, and outranks every grant."
  - "Agent reads return rendered text with a read state and never raw bytes or images; the accessible buffer reads images as `[image W×H px]`, `[image]` or the placeholder label."
  - "Every terminal control has its UCC-201 command, UIW-042 census entry and WM-091 row."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
  - "Editor and terminal list the same code colour-scheme catalog and open the same Appearance popover component."
  - "An effects frame takes at most 2 ms of CPU at DPR 2 on P1000-class hardware; every effect, including Full CRT ambient noise and flicker, stops within 10 s of the last output or keystroke; without a GPU the effects layer stays off with zero effects frames and plain fallbacks paint."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - "Future terminal tab, image hardening, saved scrollback and agent matrix receipts; native and visual execution remain not_run"
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-wave2-numbers-5e549d6961.md, SHA-256 f9d7756f94f26c5285b35400a380afed57fb27dfaee6d29683c3916604b4a15a (R34, adopted effects budgets; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS-ADDENDUM-2.md, SHA-256 a7cf9f8cea26ad50df796f5b7ac1472c1468a92ee511ea954a3f8e2505b28be2 (Addendum 2 D27)"
  - "Plans/Decision_Log.md#DL-181"
  - "Plans/Decision_Log.md#DL-182"
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D11-D18)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (sections 1-8; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3 (the ATS rows and gap G16; audit lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-e741dfbc6c.md, SHA-256 5fe7d1e04e5e54c47013c503254527265b94420239772ac711f760f43f96674d (R36; concept lineage only)"
preserved_exact_tokens:
  - "10 s"
  - "P1000-class"
  - "DPR 2"
  - "2 ms"
  - "EBADF:Failed to read image file"
  - "EFBIG"
  - "ETOODEEP"
  - "ECYCLE"
  - "tty-graphics-protocol"
  - "/dev/shm"
  - "preempted"
  - "secret_input"
  - "Allow once"
  - "Allow in this terminal"
  - "[image W×H px]"
  - "[<name> <W>×<H> · not kept]"
  - "ended with the earlier session"
  - "cmd.terminal.reveal"
negative_constraints:
  - "Do not certify a terminal case by a dispatch count or a screenshot alone, or report a concept result as native certification."
  - "Do not accept an image error reply that echoes program input or differs from SMPFS-181's fixed strings."
  - "Do not accept a stored Allow in this terminal grant, or a grant that lets a command skip its own approval."
  - "Do not accept a restored terminal that presents the old session as live, or a running command restored as done."
compatibility_only_notes:
  - "The terminal concept's harness hooks and its demo agents are concept lineage and are not product test names."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): Adds criteria for the image placement limits (4,096 per screen buffer, 10,000 cells each) and for the permission row's hover tags, the Driving row kept between commands, the Agent input row with Revoke and no pre-approval wording."
  - "Amended 2026-10-10 (lead ruling L16): Certifies that All terminals is enabled and writes the project default through the Settings transaction with the in this project hover tag and no app-wide value, replacing 'only Settings writes the project default'."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses Follow look for editor and terminal appearance defaults."
  - "Amended 2026-10-10 (R34, DL-183): Adopts the effects CPU budget, idle deadline and no-GPU fallback rule."
  - "Amended 2026-10-10 (Addendum 2 D27, DL-183): Shares the code colour-scheme catalog and Appearance popover with the editor and terminal."
  - "Amended 2026-10-09 (DL-182): ATS-047's 'images remain outside approval' is replaced; image protocols, their hardening and saved scrollback with images are certified here."
owner_boundary_notes:
  - "SMPFS-180 to SMPFS-183, F3-640 to F3-646, SP-331, SP-332, CV-362, UCC-201, UIW-042 and WM-091 own the behaviour; this unit only tests it. Effect parameters per look and GPU frame measurements remain concept lineage; R34's adopted CPU budget, idle deadline and no-GPU rule are certified here."
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Decision_Log.md#DL-182, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-181, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182, ContractName:Plans/FinalGUISpec.md#F3-640, ContractName:Plans/Automated_Testing_System.md#ATS-047
