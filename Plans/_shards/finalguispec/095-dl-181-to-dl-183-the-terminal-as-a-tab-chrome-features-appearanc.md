# Shard 095: DL-181 to DL-183 — The Terminal As A Tab: Chrome, Features, Appearance, Effects, Fonts, Images And Agents (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L44889-L45660

Source SHA256: `89af5d625a93f858e09bc08d43719674417e38d5c55a34e9f6e16b5befe66d81`

---

## DL-181 to DL-183 — The Terminal As A Tab: Chrome, Features, Appearance, Effects, Fonts, Images And Agents (2026-10-09)

This addendum compiles the owner decisions DL-181 (the terminal rebuilt as one session per tab, its chrome, what it helps you do, and agents and people sharing a terminal), DL-182 (images) and DL-183 (schemes, backgrounds, effects and fonts), with the lead rulings those cards record. The terminal is one tab kind of F3-635 and lives in the panels of F3-630; its session model is `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180`, and its engine stays DL-035's own (SMPFS-184). The units below own the terminal tab's presentation only. They supersede F3-062 (the bottom runtime workgroup strip) and F3-450 (the four-pane split guard), and retire the workgroup, sub-tab and editor-terminal-stack parts of F3-063 and F3-064, Appendix B's locked decision 12, the section 16 "4-split terminal" mapping and section 7.4.1's quadrant and explanations wording. They amend F3-065, F3-083, F3-120, F3-121, F3-194, F3-221, F3-226, F3-228, F3-245, F3-431, F3-449, F3-544, F3-546, F3-549 and the DL-035 consumer preamble. F3-193, F3-216, F3-238, F3-249, F3-357 to F3-361, F3-372, F3-412 to F3-416, F3-545, F3-547, F3-548, F3-582 and F3-583 stand unchanged. The rules stay with their owners: SMPFS-181 (image protocols, hardening and quotas), SMPFS-182 (agents and people), SMPFS-183 (marks, links, find, copy mode, progress, the bell, IME and the accessible buffer), SP-331 and SP-332 (storage), SSYS-051 (the Settings rows), UCC-201 (the commands) and DR-068 (one appearance model). General code text across the app stays with DL-161, F3-426 and F3-430. The terminal concept (branch `concept/home-terminal-20261009`, its SPEC and its architecture) is source lineage only: its class names, data attributes, script globals, settings keys, storage keys and harness hooks are not canon.

### F3-640 — The Terminal Tab's Chrome

```yaml
plan_unit_id: F3-640
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A terminal is one tab kind of F3-635 with one session per tab (DL-181, SMPFS-180): the terminal kind mints the
  session, the tab id is `terminal:<session>`, and moving, collapsing, maximizing or hiding the tab never touches its
  session. There are no splits, sections, workgroups or sub-tabs inside a terminal. Split opens a new panel beside
  this one holding a new terminal in the same folder and shell profile (`cmd.workspace_layout.split` with a terminal
  spec), placed by F3-630's split fit rule; the More menu adds Split down. The tab label is `<process> · <folder>`:
  the foreground program, else `ssh` inside an SSH session, else the shell's name, then the last component of the
  folder. A failed last command adds its exit code after the label, a terminal an agent is driving shows the 7 px
  square agent mark, and a running process shows the static busy mark, all from the strip's one mark set (F3-631,
  DL-141). The hover tag is the label, plus "(ended)" once the session has ended and "· <agent> is driving" while an
  agent drives it. A label the user sets with `cmd.panel_tab.rename` replaces the label until it is cleared. Under the
  strip the tab draws F3-635's shared header row with no terminal-specific thresholds: 30 px tall, 24 px targets,
  12 px text and 11 px for secondary facts, labels when the tab body is at least 520 px wide and icons with hover tags
  below that, and the row hidden when the body is under 150 px tall. Its left side shows the folder in the code face
  with `~` for home, the branch when the folder is in a repository, and, only while a command runs, that command cut
  at 48 characters with an ellipsis (the full text in its hover tag) and its elapsed time as `m:ss`. Its right side
  shows Find, Split, Maximize (Restore while maximized; `ui.workspace_layout.maximize`) and More. Nothing is drawn
  below the screen: there is no bottom bar. No session id, tab id or nonce ever appears as text. Notices are inline
  rows above the screen, never modals: at least 30 px tall, with 12 px text and 24 px text buttons, a warning shown as
  a tinted surface and never as a side stripe. An ended session shows the row "Session ended" (with "with exit code
  N" when the code is not zero), Restart and Close tab, and dims the screen to 72 % opacity; Enter in an ended
  terminal restarts it. Closing a terminal whose process still runs asks inline, through the kind's close check:
  "Close this terminal? <process> is still running and will be stopped.", with Close terminal and Keep it open. A tab
  with no live session (restored after a restart or a reload, or a closed tab reopened) loads its saved scrollback
  before its new session starts (F3-645, SP-332), draws the dim rule `── Restored <time> · the earlier session ended ──`
  above the new prompt, starts a new session in the same folder and shell profile (at once for a local profile; a tab
  whose profile is an SSH host asks first, Reconnect / Close tab, as below), never presents itself as the old
  session (F3-226, F3-228), and says so: "This terminal was restored with its scrollback (N images were not kept).
  Its earlier session ended when the page reloaded; this is a new session.", the parenthesis shown only when images
  were dropped, and for a reopened tab "This terminal was reopened with its scrollback" with "Its earlier session
  ended when the tab closed; this is a new session.". A command still running when the earlier session ended comes
  back ended and indeterminate, "ended with the earlier session", never as done. When the saved scrollback cannot be
  loaded within its load budget (SP-332), a local terminal tab starts without it and says so; an SSH-host tab still waits for Reconnect / Close tab. The gutter is 20 px wide (18 px
  when the body is under 400 px wide) and draws one 12 px glyph per prompt line with a 20 x 24 px hit target, never
  a stripe (F3-641). The scrollbar is 14 px wide (10 px when the body is under 400 px wide) and speaks the editor
  minimap's language: a viewport box with a 2 px radius and a 1 px border, command marks 55 % of the track wide in a
  neutral tone, failed commands the full width in the failure colour, find matches 45 % wide in the search colour
  and the current match in the link colour; marks widen on hover. The sticky command header: when the top of the
  view is inside a command's output, a one-line header one cell plus 8 px tall shows that command's prompt line and
  its state (Running, Exit 0, Exit N), and clicking it jumps to the command; it hides when the body is under 150 px
  tall and in the alternate screen. The More menu, in order: New terminal (a submenu of the shell profiles and SSH
  hosts), Split down, a hairline, Appearance..., Text size (Bigger, Smaller, Reset), a hairline, Copy mode, Quick
  select, Select all, Clear, Clear scrollback, Plain-text buffer, a hairline, Agent input (Ask each time, then one
  row per agent allowed in this terminal, each of which revokes that agent's grant), Send signal (Interrupt SIGINT,
  Terminate SIGTERM, Kill SIGKILL), Restart session. The screen's context menu opens on a right click, or a
  Shift+right click while a program reports the mouse: Open in editor and Copy path on a file reference, Open link
  and Copy link on a URL, then Copy, Paste, Select all, Find and Clear. The command-mark menu opens on a click on a
  gutter glyph: a header row with the command, its state, its duration and who typed it ("You typed this" or
  "<agent> typed this"), then Copy command, Copy output, Rerun, Insert command (without Enter), Open output in an
  editor tab and Select output. Every menu opens in the one overlay root (DR-067). Keys while a terminal has focus,
  macOS in brackets: Find Ctrl+Shift+F (Cmd+F), and in the find bar Enter for the previous match (upward),
  Shift+Enter for the next, Alt+C case, Alt+W whole word, Alt+R regular expression and Esc to close; Copy and Paste
  Ctrl+Shift+C and Ctrl+Shift+V (Cmd+C, Cmd+V); Select all (Cmd+A), from the menu on other platforms; previous and
  next command Ctrl+Up and Ctrl+Down (Cmd+Up, Cmd+Down); a page Shift+PageUp and Shift+PageDown; top and bottom
  Ctrl+Shift+Home and Ctrl+Shift+End (Cmd+Home, Cmd+End); Copy mode Ctrl+Shift+X (Cmd+Shift+X); Quick select
  Ctrl+Shift+E (Cmd+Shift+E); the plain-text buffer Alt+F2; text size Ctrl+=, Ctrl+- and Ctrl+0 (Cmd+=, Cmd+-,
  Cmd+0); Clear Ctrl+Shift+K (Cmd+K); Split Ctrl+Shift+5 (Cmd+D). A focused terminal gives these keys back to the
  host (F3-635): Alt+1..9, Alt+Shift+1..9, Alt+arrows, Alt+Shift+arrows, Ctrl+PageUp and Ctrl+PageDown,
  Ctrl+Shift+PageUp and Ctrl+Shift+PageDown, Alt+PageUp and Alt+PageDown (next and previous tab in a browser, where
  Chrome keeps Ctrl+PageUp and Ctrl+PageDown), Ctrl+\ and Ctrl+Shift+\, Shift+Escape,
  Ctrl+Shift+Space, Ctrl+Shift+`, Ctrl+Tab, and in a browser the stand-ins Alt+T, Alt+W, Alt+Shift+T and Alt+`. The
  host takes F6 and Shift+F6 before the terminal sees them, and ignores keys during IME composition. The
  shell therefore loses zsh's Alt+digit arguments, Alt+arrow word moves (Ctrl+Left and Ctrl+Right still move by
  word), Alt+T and Alt+W, and a program that needs Ctrl+\ (SIGQUIT) gets it from Send signal; every other Ctrl+key
  belongs to the shell. Split dispatches `cmd.workspace_layout.split` with a terminal spec and Clear scrollback
  `cmd.terminal.clear_scrollback`; Appearance... opens the Appearance popover (F3-642); Find, Copy mode, Quick
  select, Plain-text buffer and Text size are the typed local actions `ui.terminal.find`, `ui.terminal.copy_mode`,
  `ui.terminal.quick_select`, `ui.terminal.a11y_buffer` and `ui.terminal.zoom`; the command-mark items are
  `ui.terminal.mark.copy_command`, `ui.terminal.mark.copy_output`, `ui.terminal.mark.rerun` (which dispatches the
  catalogue's rerun command), `ui.terminal.mark.insert` and `ui.terminal.mark.open_output` (which dispatches
  `cmd.panel_tab.open` with an editor buffer); the agent controls are F3-646's; New terminal, Select all, Clear, Send
  signal and Restart session map to the ids UCC-201 records. Restart and Restart session start a new session in the
  same tab by the explicit replacement of F3-548, Copy and Paste follow F3-238's clipboard rules, and the screen is
  the terminal core's own grid (F3-193, F3-216). The header row's buttons are the hover engine's icon kind, a static
  tint only, and the screen is never a hover target (DR-059, F3-465).
  Restoring a terminal tab whose profile is an SSH host asks first (Reconnect / Close tab), as privileged attachments do (F3-228); a restore never reconnects to a remote host by itself.
gui_related: true
gui_classification_reason: Defines the terminal tab's label, header row, notices, gutter, scrollbar, sticky header, menus and keys in the universal panels.
split_recommended: false
depends_on: [DL-181, F3-635, F3-630, F3-631, F3-634, SMPFS-180, SMPFS-183, DR-067]
unblocks: [F3-641, F3-646, UCC-201, ATS-076]
acceptance_criteria:
  - "Every terminal tab holds one session; Split opens a new panel with a new terminal in the same folder and shell profile, and no terminal tab draws a split, section, workgroup, sub-tab or bottom bar."
  - "The tab label reads `<process> · <folder>` by the rule above, shows the exit code of a failed last command and the square agent mark while an agent drives it, and its hover tag adds \"(ended)\" and \"· <agent> is driving\" when they apply."
  - "The header row is F3-635's shared row with the folder, branch and, while a command runs, the command cut at 48 characters and its `m:ss` time on the left, and Find, Split, Maximize or Restore, and More on the right."
  - "At body widths of 399 and 400 px the gutter is 18 and 20 px and the scrollbar 10 and 14 px wide; below 150 px of body height the header row and the sticky command header are hidden."
  - "An ended session shows \"Session ended\" with Restart and Close tab and dims the screen to 72 %; closing a running terminal asks \"Close this terminal? <process> is still running and will be stopped.\" inline."
  - "A restored or reopened terminal shows its saved scrollback, the dim rule and the restored notice above a new local session in the same folder and profile; an SSH-host tab asks Reconnect / Close tab before reconnecting, and a command that was running reads \"ended with the earlier session\"."
  - "The More, context and command-mark menus show exactly the items above in that order, and every menu opens in the one overlay root."
  - "Each key above does its action in a focused terminal, each key in the given-back list reaches the host, and every other Ctrl+key reaches the shell."
  - "Alt+PageUp and Alt+PageDown reach the host from a focused terminal, F6 and Shift+F6 reach the host before the terminal sees them, and the host acts on no key during IME composition."
  - "No session id, tab id or nonce appears as text, and no notice is a modal or carries a coloured side stripe."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-181"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D11, D12)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, sections 1 to 3 and 7 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, sections 3 to 5 and 9 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-e741dfbc6c.md, SHA-256 5fe7d1e04e5e54c47013c503254527265b94420239772ac711f760f43f96674d (R36; concept lineage only)"
preserved_exact_tokens:
  - "terminal:<session>"
  - "<process> · <folder>"
  - "Session ended"
  - "Close this terminal? <process> is still running and will be stopped."
  - "Keep it open"
  - "This terminal was restored with its scrollback"
  - "ended with the earlier session"
  - "Plain-text buffer"
  - "Agent input"
  - "Send signal"
  - "Restart session"
  - "You typed this"
  - "Insert command (without Enter)"
  - "Open output in an editor tab"
  - "ui.terminal.find"
  - "cmd.terminal.clear_scrollback"
negative_constraints:
  - "Do not draw a bottom bar, an in-tab split, a section, a workgroup or a sub-tab in a terminal tab."
  - "Do not show a session id, tab id or nonce as text."
  - "Do not present a restored or reopened terminal as its earlier live session."
  - "Do not draw a notice as a modal or with a coloured side stripe."
  - "Do not keep a key from the given-back list in the terminal, or take any other Ctrl+key from the shell."
compatibility_only_notes:
  - "The concept's kind registration, its script globals, its class and data-attribute prefixes and its terminal settings keys are lineage only; the concept's example profiles (zsh, bash, pwsh and one SSH host) and the agent name in its mark menu are demo data."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): The keys given back to the host add Alt+PageUp and Alt+PageDown, and the host takes F6 and Shift+F6 before the terminal sees them and ignores keys during IME composition."
  - "Amended 2026-10-10 (lead ruling L14): SSH-host terminal restore asks Reconnect / Close tab before any remote reconnection."
  - "Amended 2026-10-10 (lead ruling L14, review): The general restore sentence names the SSH-host exception in place, so only a local-profile tab starts its new session at once."
  - "Supersedes F3-062's bottom runtime workgroup strip and F3-450's four-pane split guard, and retires the workgroup, sub-tab and editor-terminal-stack parts of F3-063 and F3-064 (DL-181)."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/DRY_Rules.md#DR-067

### F3-641 — What The Terminal Helps You Do

```yaml
plan_unit_id: F3-641
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The terminal tab (F3-640) helps around commands (DL-181). The engine side, shell integration with its per-terminal
  secret, command records, OSC 8 links, OSC 7, OSC 9;4, the bell and notifications, copy mode, quick select, IME and
  the accessible buffer, is `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-183`; only a mark that carries the
  terminal's secret becomes a command boundary, and any other mark is plain output. Command marks: each prompt line
  gets one glyph in the gutter, never a stripe, showing its command's state (running, exit 0, exit N, or ended with
  the earlier session), and a command an agent typed shows the agent's square mark in the gutter. A click on the
  glyph opens the command-mark menu (F3-640), whose header names who typed the command from its `by` record ("You
  typed this" or "<agent> typed this"). Copy command and Copy output copy; Rerun dispatches the catalogue's rerun
  command (F3-360); Insert command puts the command line at the prompt without Enter and executes nothing (F3-547);
  Open output in an editor tab opens the output as an editor buffer, never a preview; Select output selects it. The
  sticky command header (F3-640) names the command you are scrolled into, and Ctrl+Up and Ctrl+Down (Cmd+Up,
  Cmd+Down) jump to the previous and next command. Links: `path:line:col` references, file paths, URLs and OSC 8
  hyperlinks are links. A plain click selects text, as in every terminal. Ctrl+click (Cmd+click) is the terminal's
  single click on a link: on a file reference it opens the panel's preview tab at that line and column by F3-634's
  rule, a Ctrl+double-click keeps that tab, and Ctrl+Alt+click opens it in a new panel; on a URL it opens a Browser
  tab placed by F3-634. Find (Ctrl+Shift+F, Cmd+F) opens a find bar inside the tab with case, whole word and regular
  expression switches, highlights every match, and puts the matches and the current match on the scrollbar beside
  the command and failure marks (F3-640). Copy mode (Ctrl+Shift+X) moves a keyboard cursor through the screen and
  the scrollback with the arrows or h j k l, w b e, 0 $, g G, PageUp and PageDown or Ctrl+U and Ctrl+D, selects with
  v, V (lines) or Ctrl+V (a block), copies and leaves with y or Enter, finds with /, and leaves with Esc or q. Quick
  select (Ctrl+Shift+E) puts short labels over the URLs, paths, hashes and IP addresses in view: typing a label
  copies its text, Shift with the label inserts it at the prompt, Alt with the label opens it, and Esc cancels.
  Terminals you are not in are dimmed by their look (F3-643). Progress a program reports with OSC 9;4 shows inside
  its own tab as advisory progress that completes nothing (F3-546). The visual bell, when the bell setting asks for
  it, flashes the tab in its look's form (F3-643), and the attention it raises follows SMPFS-183. Input methods
  (IME) work at the prompt (SMPFS-183). The plain-text buffer (Alt+F2, or More, Plain-text buffer) shows the screen
  and the scrollback as plain text for screen readers; Ctrl+Up and Ctrl+Down move between commands and Esc returns
  to the screen; images read as their text descriptions (F3-645). There is no AI feature in the terminal: no explain,
  fix, suggest or ask action and no inline completion; explaining commands is the Teacher persona's job in the chat
  (D19, SMPFS-180), and the terminal stays a user shell and agent surface, not Puppet Master's control plane (F3-413).
gui_related: true
gui_classification_reason: Defines the visible command marks, links, find, copy mode, quick select, progress, bell and accessible buffer of the terminal tab.
split_recommended: false
depends_on: [DL-181, F3-640, F3-634, F3-546, F3-547, SMPFS-183, SMPFS-180]
unblocks: [ATS-076]
acceptance_criteria:
  - "Every prompt line with a verified mark has one gutter glyph showing its command's state, no mark is drawn as a stripe, and a mark without the terminal's secret creates no glyph."
  - "The command-mark menu names who typed the command, Insert command sends no Enter, and Open output in an editor tab opens a buffer, never a preview."
  - "A plain click on a link selects text; Ctrl+click (Cmd+click) on a `path:line:col` reference opens the panel's preview tab at that line and column, Ctrl+double-click keeps it, Ctrl+Alt+click opens a new panel, and a URL opens a Browser tab."
  - "Find supports case, whole word and regular expressions, highlights every match and marks the matches on the scrollbar."
  - "Copy mode and quick select work with the keys above and leave with Esc."
  - "The plain-text buffer opens with Alt+F2, moves between commands with Ctrl+Up and Ctrl+Down, and reads images as their text descriptions."
  - "No explain, fix, suggest or ask action and no inline completion appears anywhere in the terminal tab."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-181"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D7, D13, D19)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, sections 1 to 3 and 8 (concept lineage only)"
preserved_exact_tokens:
  - "path:line:col"
  - "OSC 9;4"
  - "Ctrl+Alt+click"
  - "Copy mode"
  - "Quick select"
  - "plain-text buffer"
negative_constraints:
  - "Do not draw a command mark as a stripe or treat a mark without the terminal's secret as a boundary."
  - "Do not open a link on a plain click; a plain click selects."
  - "Do not add an AI action or an inline completion to the terminal."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-183, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-546, ContractName:Plans/FinalGUISpec.md#F3-547

### F3-642 — The Terminal's Appearance

```yaml
plan_unit_id: F3-642
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The terminal's appearance is one layered model (DL-183, DR-068), resolved field by field: the look's defaults
  ("Follow look") under the app default (Settings > Terminal, SSYS-051) under the project default (written through Settings transactions, in the Project's settings) under this tab's override; a field left unset falls through to the layer
  below. Every field applies live, and no terminal appearance setting carries a restart badge; the terminal draws its
  own glyphs (DL-035), so section 6.4's restart rule for the app's font families does not reach it. "Follow look"
  resolves per look, light and dark: Friendly Catppuccin Latte and Mocha; Glass Tokyo Night Day and Storm, drawn at
  70 % (light) and 74 % (dark) opacity over the shell's existing glass blur, the terminal adding no backdrop blur of
  its own (F3-431); Retro PM Paper Teletype and PM Phosphor Green, with PM Phosphor Amber as Phosphor Green's
  sibling; Basic One Half Light and Dark; NieR Mode PM YoRHa Parchment and PM YoRHa Ink. Thirty-four schemes ship: 27
  third-party schemes in 13 families, each read from the project's own terminal port pinned to a commit, and 7 Puppet
  Master originals. Puppet Master originals: PM Phosphor Green, PM Phosphor Amber, PM Paper Teletype, PM YoRHa
  Parchment, PM YoRHa Ink, PM High Contrast Light, PM High Contrast Dark. Catppuccin (MIT): Latte, Frappé, Macchiato,
  Mocha. Tokyo Night (Apache-2.0): Day, Storm, Night. One Half (MIT): Light, Dark. Rosé Pine (MIT): Dawn, Moon,
  Main. Solarized (MIT): Light, Dark. Gruvbox (MIT): Light, Dark. Dracula (MIT): Dark. Nord (MIT): Dark. Kanagawa
  (MIT): Wave, Lotus. Everforest (MIT): Light, Dark. Flexoki (MIT): Light, Dark. GitHub (MIT): Light, Dark. Ayu
  (MIT): Mirage. Every third-party scheme ships with its licence text and its source address and SHA-256; the
  iTerm2-Color-Schemes collection (no single licence) and Modus (GPL-3.0) are not bundled, and import covers them.
  These schemes are one code colour-scheme catalog that serves the editor and the terminal (Addendum 2 D27, amending
  D15 and D21): each of the 34 schemes carries the terminal palette and the editor's 17 syntax tokens. Each catalog scheme's 17
  editor syntax colours are authored to 4.5:1 for every syntax token, comments included, against the scheme's background (7:1
  throughout on PM High Contrast Light and Dark), and the editor and the terminal both draw the catalog values as they are; an imported scheme takes its editor syntax colours from its
  ANSI 16 by a fixed map. Each surface's
  scheme choice defaults to "Follow look" — the terminal's "Follow look" per-look scheme above, the editor's
  per-look syntax colours (F3-426, F3-639) — and each surface keeps its own scheme choice. The Appearance popover is
  one component, opened from the terminal's ⋮ menu and from the editor's ⋮ menu (F3-639); opened from the editor, it offers only
  scheme, font and size; no surface keeps a scheme
  list or popover of its own (DR-068).
  "Switch with light and dark", on by default, swaps a chosen scheme for its family's other appearance when the app
  changes between light and dark. A minimum-contrast floor applies per cell to the text colour against its cell
  background by moving OKLab lightness only, keeping hue and chroma: default 4.5:1, with the choices Off, 3:1, 4.5:1
  and 7:1; block elements, powerline and sextant glyphs are exempt, because they are shapes that meet their
  neighbours, and a selection uses the scheme's selection text colour. Phosphor schemes (PM Phosphor Green and PM Phosphor Amber)
  map colours outside their 16 (the 256-colour cube and truecolor), and any colour a program sets (OSC 4, 10, 11 and
  12), onto the phosphor by brightness, so a program's `38;5;196` never paints red on a green tube; the scheme's own
  16 stay as authored. Import reads iTerm2 `.itermcolors`, Windows
  Terminal JSON (one scheme, or a settings file's list of schemes), kitty `.conf`, Ghostty themes, Alacritty TOML and
  its legacy YAML, base16 and base24 YAML, and Xresources; input is capped at 256 KB, nothing in a file is evaluated,
  and every error message is fixed and never echoes the file. The fields and their defaults: scheme (Follow look,
  or a scheme); Switch with light and dark (on); minimum contrast (4.5:1); font (Follow look, JetBrains Mono,
  Atkinson Hyperlegible Mono, VT323, Departure Mono, Sixtyfour, Sixtyfour Raster or the system monospace; F3-644);
  font size and line height (the face's defaults, F3-644); weight (400); letter spacing (0); ligatures (on); bold as bright (off); cursor
  shape (Follow look, block, bar or underline); cursor blink (on); cursor trail (Follow look, off, soft, glow,
  phosphor or trace); background (Follow look, theme surface, solid colour, gradient or image) with its colour, its
  gradient (dusk, dawn, deep or paper), its image (hills, grid, paper or a custom image), image dim (0.45) and image
  blur (0 px, baked once into the image and never a backdrop blur); opacity (Glass); padding (8 px across, the
  vertical padding 60 % of it); effects (Follow look, off or custom) with the effect fields of F3-643; inactive
  dimming; smooth scrolling; bell (Follow look, visual or off); sticky header (on); copy on select (off); and
  Sixtyfour's scan and bleed axes. Cell geometry: a cell is a whole number of device pixels, its width
  round((advance + letter spacing) x device pixel ratio) and its height round(font size in px x line height x device
  pixel ratio), never less than 90 % of the font's ascent plus descent, with the baseline centred; the padding is
  painted in the cell background, so the remainder smaller than a cell never shows as a stripe. The Appearance
  popover (More, Appearance...) previews every change live on the terminal and writes either This terminal (the
  tab's override) or All terminals (enabled, the project default through the same Settings transaction Settings uses over SSYS-051's rows); This terminal commits with `cmd.terminal.appearance.set` (UCC-201). Settings > Terminal binds the same model with the same fields
  (SSYS-051) and writes the project layer through that same Settings transaction. The app and project layers are Settings values and the
  tab's override lives in the terminal tab's serialized state; a custom background image is kept as SP-331 says.
  There is one model: the look's defaults, the popover and Settings read and write it, and no second terminal theme
  or font store exists (DR-068).
  The Retro scheme choice also colours Retro's editor syntax: Phosphor Green or Amber, with Amber turning the
  Retro editor amber. Retro syntax stays monochrome, using brightness and weight in dark and the black and red
  ribbon in light. This choice is stored once in the terminal's appearance model; the editor reads it and keeps
  no copy (F3-639, F3-647).
  The popover's All terminals is enabled and writes the project default row of SSYS-051 through the same Settings transaction Settings uses, so it changes every terminal while this Project is open; its hover tag says in this project; no surface writes an app-wide value until q-035 admits one.
gui_related: true
gui_classification_reason: Defines the terminal's visible schemes, contrast floor, import, appearance fields, cell geometry and Appearance popover.
split_recommended: false
depends_on: [DL-183, F3-640, F3-431, DR-068, SSYS-051, SP-331]
unblocks: [F3-643, F3-644, UCC-201, ATS-076]
acceptance_criteria:
  - "Every field resolves tab override, then project default, then app default, then the look's default, and an unset field falls through."
  - "Each look's Follow look scheme is the one listed for its light and dark variant, and Glass draws its scheme at 70 % and 74 % opacity with no backdrop blur of the terminal's own."
  - "Exactly the 34 schemes listed ship, each third-party scheme with its licence and source record, and the iTerm2-Color-Schemes collection and Modus are not bundled."
  - "The minimum-contrast floor defaults to 4.5:1, offers Off, 3:1, 4.5:1 and 7:1, changes only OKLab lightness, and leaves block, powerline and sextant glyphs alone."
  - "Under PM Phosphor Green or Amber, a 256-colour or truecolor colour and a colour a program sets with OSC 4, 10, 11 or 12 draw on the phosphor by brightness, and the scheme's own 16 colours draw as authored."
  - "Import accepts the seven formats listed, refuses input over 256 KB, evaluates nothing and shows fixed errors that never echo the file."
  - "Every field changes the terminal at once, from the popover and from Settings, and no terminal appearance setting shows a restart badge."
  - "Cells are whole device pixels by the geometry rule, and no stripe shows between the last cell and the padding."
  - "The popover's All terminals is enabled and writes the project default row of SSYS-051 through the same Settings transaction Settings uses, so it changes every terminal while this Project is open; its hover tag says in this project; no surface writes an app-wide value until q-035 admits one."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
  - "The editor and terminal list the same catalog, each curated scheme carries terminal and syntax colours, both scheme choices default to Follow look and remain separate, and both menus open the same Appearance popover component."
  - "Retro editor syntax remains monochrome in dark and keeps the black and red ribbon in light; Phosphor Green or Amber follows the one terminal Retro scheme choice, Amber turns the editor amber, and the editor stores no copy."
  - "Every catalog scheme's 17 editor syntax colours meet 4.5:1 for every syntax token, comments included, against its background (7:1 throughout on PM High Contrast Light and Dark), an imported scheme's editor syntax colours come from its ANSI 16 by the fixed map, and the popover opened from the editor offers only scheme, font and size."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/storage-plan.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS-ADDENDUM-2.md, SHA-256 a7cf9f8cea26ad50df796f5b7ac1472c1468a92ee511ea954a3f8e2505b28be2 (Addendum 2 D27)"
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D15)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, sections 5 and 6 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-e741dfbc6c.md, SHA-256 5fe7d1e04e5e54c47013c503254527265b94420239772ac711f760f43f96674d (R36; concept lineage only)"
preserved_exact_tokens:
  - "Follow look"
  - "Switch with light and dark"
  - "Thirty-four schemes"
  - "4.5:1"
  - "256 KB"
  - "This terminal"
  - "All terminals"
  - "cmd.terminal.appearance.set"
negative_constraints:
  - "Do not mark a terminal appearance setting as needing a restart."
  - "Do not keep a second terminal theme or font store beside the one appearance model."
  - "Do not add a backdrop blur of the terminal's own, or bundle a scheme without its licence and source record."
  - "Do not echo an imported file's content in an error message or evaluate anything in it."
compatibility_only_notes:
  - "The concept's field names and its settings keys under a terminal prefix are lineage only; the product ids are SSYS-051's rows."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): Phosphor schemes map colours outside their 16 and colours a program sets (OSC 4, 10, 11, 12) onto the phosphor by brightness, and the scheme's own 16 stay as authored."
  - "Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): Catalog editor syntax colours are authored to 4.5:1 for every syntax token, comments included (7:1 on PM High Contrast), and both surfaces draw them as they are, an imported scheme maps its ANSI 16 to editor colours by a fixed map, and the popover opened from the editor offers only scheme, font and size."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): States that each of the 34 shared schemes carries 17 editor syntax tokens."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses Follow look for editor and terminal appearance defaults."
  - "Amended 2026-10-10 (Addendum 2 D27, DL-183): Retro editor syntax reads the terminal Retro scheme choice once and keeps no copy."
  - "Amended 2026-10-10 (Addendum 2 D27, DL-183): Shares the code colour-scheme catalog and Appearance popover with the editor and terminal."
  - "Amended 2026-10-10 (lead ruling L16): All terminals writes the project default through the Settings transaction and shows in this project; no app-wide value is written until q-035 admits one."
  - "Makes F3-083's terminal colour-scheme catalogue, preview and instant apply real, and replaces the restart badges on the old terminal theme and font rows (DL-183)."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-183, ContractName:Plans/DRY_Rules.md#DR-068, ContractName:Plans/Settings_System.md#SSYS-051, ContractName:Plans/storage-plan.md#SP-331, ContractName:Plans/FinalGUISpec.md#F3-431, ContractName:Plans/UI_Command_Catalog.md#UCC-201

### F3-643 — Terminal Effects

```yaml
plan_unit_id: F3-643
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The terminal's effects are Puppet Master's own (DL-183) and follow one policy. They are event-driven: the effect
  pass runs only after the screen repainted or while something is still animating. Only the focused, visible
  terminal animates; every effect goes idle within 10 s of the last output or keystroke; motion is off on battery
  saver; and where no GPU draws the terminal (on the desktop, the Skia CPU raster of F3-582), the effects layer
  stays off, no effects frames run, and plain static fallbacks paint (a static
  scanline pattern and a static glow), curvature, burn-in and noise are not drawn, and the Appearance popover says
  what it could not draw. Under Reduced Motion every moving part is off (cursor blink, cursor trail, smooth
  scrolling, burn-in, noise, flicker, degauss, bell flashes, progress sweeps and image animation) and the static looks
  stay (scanlines, glow, curvature and the parchment grain). The catalogue: inactive dimming, the focus ring, cursor
  blink and trail, smooth scrolling, backgrounds (F3-642), Glass's blur (the shell's existing blur; the terminal adds
  none, F3-431), Retro scanlines and phosphor glow, an opt-in Full CRT tier (curvature, burn-in and noise), flicker,
  the visual bell, progress (F3-546), attention marks, and an on-demand Retro degauss, an action in the Appearance
  popover rather than a setting, which runs to its end and stops. Scanlines and phosphor glow are Retro's: on by
  default in Retro dark and off by default elsewhere. Full CRT is off by default in every look, and the user turns it
  on. Flicker is off by default in every look; its amount defaults to 0.02 and is capped at 0.03 of relative
  luminance, against the 0.10 change that WCAG 2.3.1 counts as a flash, so flicker can never be a flash. The effect
  fields (F3-642) default to: effects Follow look; scan strength 0.30; glow strength 0.45; Full CRT off; curvature
  0.08; burn-in on within Full CRT; noise 0.035; flicker off; flicker amount 0.02, capped at 0.03. NieR Mode's
  terminal has a parchment texture under the text and ink focus brackets, and no glow. By the NieR rule for new
  surfaces (DL-152, SSYS-043, F3-598, DR-056), NieR paints the terminal only while NieR Mode is on and each touch only
  with its own installed part: the parchment with the `ground` part and the focus brackets with the `brackets` part,
  never a new part; its colours come only from NieR's token tables or the theme tokens NieR repaints; its motion is
  stepped, with no glow, filter or blur, and loops only by transform or opacity; no surface larger than 340x256 px
  reverses its opacity more than once a second; and Reduced Motion and the Still and Colors only presets show end
  states at once. Motion voices belong to the theme family (DR-043).
  An effects frame takes at most 2 ms of CPU at DPR 2 on P1000-class hardware (R34).
gui_related: true
gui_classification_reason: Defines the terminal's visible effects, their defaults and the policy that limits when they run.
split_recommended: false
depends_on: [DL-183, F3-642, F3-431, F3-582, DR-043, DL-152, DR-056]
unblocks: [ATS-076]
acceptance_criteria:
  - "Only the focused, visible terminal animates; an idle terminal draws no ambient frames; battery saver turns motion off."
  - "Where no GPU draws the terminal, the effects layer stays off with zero effects frames, plain static scanlines and glow are drawn, curvature, burn-in and noise are not, and the Appearance popover names what it could not draw."
  - "Under Reduced Motion no part of the terminal moves, and the static looks stay."
  - "A fresh Retro dark terminal shows scanlines and phosphor glow; no other look shows them by default; Full CRT and flicker are off by default in every look."
  - "The flicker amount defaults to 0.02 and cannot exceed 0.03 of relative luminance."
  - "Degauss is a one-shot action in Retro, not a setting, and stops at its end."
  - "With NieR Mode on, the parchment shows only with the ground part and the focus brackets only with the brackets part, NieR's own terminal look has no glow, filter or blur, and no surface larger than 340x256 px reverses its opacity more than once a second."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
  - "An effects frame takes at most 2 ms of CPU at DPR 2 on P1000-class hardware; every effect, including Full CRT ambient noise and flicker, stops within 10 s of the last output or keystroke; without a GPU the effects layer stays off with zero effects frames and plain fallbacks paint."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-wave2-numbers-5e549d6961.md, SHA-256 f9d7756f94f26c5285b35400a380afed57fb27dfaee6d29683c3916604b4a15a (R34, adopted effects budgets; concept lineage only)"
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D16)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, section 6 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-ARCHITECTURE-542703c07c.md, SHA-256 b6daf31a8953b3d7b633dd0db0a7b8a0ecba41f4533e8d6db6df5fa0f08bf476, section 6 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/NIER-RULES-for-new-surfaces.md, SHA-256 4634aba3abe147493c0f71de49419e63ba667a6784ca4b36967b537abb231728"
preserved_exact_tokens:
  - "10 s"
  - "P1000-class"
  - "DPR 2"
  - "2 ms"
  - "Full CRT"
  - "WCAG 2.3.1"
  - "0.02"
  - "0.03"
  - "degauss"
  - "ground"
  - "brackets"
negative_constraints:
  - "Do not animate a terminal that is not focused and visible, or keep ambient motion running on an idle terminal."
  - "Do not turn on Full CRT or flicker by default in any look, or let flicker exceed 0.03 of relative luminance."
  - "Do not add a NieR part, or give NieR's terminal look a glow, filter or blur."
compatibility_only_notes:
  - "The concept's per-look effect parameters, its GPU frame times, its battery-saver threshold and its measured performance are lineage only; R34 adopts the 2 ms CPU budget at DPR 2 on P1000-class hardware and the 10 s idle deadline as canon."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses Follow look for the terminal appearance default in surviving amendment prose."
  - "Amended 2026-10-10 (R34, DL-183): Adopts the effects CPU budget, idle deadline and no-GPU fallback rule."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-183, ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/FinalGUISpec.md#F3-431, ContractName:Plans/FinalGUISpec.md#F3-582, ContractName:Plans/DRY_Rules.md#DR-056

### F3-644 — The Editor's And The Terminal's Faces

```yaml
plan_unit_id: F3-644
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  These are the faces of the home redesign's editor and terminal only (DL-183, with Jared's answer of 2026-10-10 on
  Retro code text, D17a). The editor's code face is JetBrains Mono in every look, Retro included (F3-639). The
  terminal's default face is JetBrains Mono in every look except Retro, where it is VT323; Sixtyfour, Sixtyfour
  Raster and Departure Mono are Retro options and JetBrains Mono stays selectable there; Atkinson Hyperlegible Mono
  is offered for readability; and the system monospace is also a choice (F3-642). JetBrains Mono is provided by the
  page, not by the terminal: its upright bytes are NieR Mode's PM NieR Mono files under the general family name
  'JetBrains Mono', which the 5.6 Pro fonts work builds through DL-161's pipeline, and its italic is synthesised
  unless the page's code face adds the italic file (42,964 bytes, offered). The faces, with licence, bytes, axes and
  default size and line height in CSS px: JetBrains Mono, the code face of the editor and the terminal, OFL-1.1, the
  page's face (31,432 bytes), weight 400 to 800, 13 px and 1.30; VT323, Retro's terminal default, OFL-1.1, 17,936
  bytes, no axes, 19 px and 1.05; Sixtyfour, a Retro option whose own axes give a CRT look without motion, OFL-1.1,
  4,236 bytes, SCAN -53 to 100 and BLED 0 to 100, 10 px and 1.45; Sixtyfour Raster, a Retro option that is Sixtyfour
  baked at SCAN 45 and BLED 40, OFL-1.1, 3,068 bytes, no axes; Atkinson Hyperlegible Mono, for readability, OFL-1.1,
  17,752 bytes upright and 19,084 bytes italic, weight 200 to 800, 13 px and 1.35; Departure Mono, a Retro option,
  OFL-1.1 (its v1.500 release ships the SIL Open Font License, not MIT), 22,496 bytes, no axes, 13.75 px and 1.20;
  and the system monospace, 13 px and 1.30. The terminal's own faces total 84,572 bytes before base64. Box drawing
  (U+2500 to U+257F), block elements (U+2580 to U+259F), braille (U+2800 to U+28FF), powerline (U+E0B0 to U+E0BF)
  and sextants (U+1FB00 to U+1FB3B) are drawn by the terminal, so no patched font is needed, and the terminal's faces
  are never mirrored into PM Symbols. Licence rule: only permissively licensed faces are built in, under the SIL Open
  Font License, Apache or MIT, each with its licence text and its source and SHA-256 record; every terminal face is
  OFL-1.1. The files go through DL-161's embedding pipeline as one set of files shared with the rest of the page
  (DR-050). A face change applies live in the terminal (F3-642). Terminal text keeps its own fidelity fixtures,
  separate from rendered GUI text (F3-414). General code text across the chat and PMConcept7
  (JetBrains Mono in Basic, Glass and Friendly, IBM Plex Mono in Retro, PM NieR Mono in NieR) is not this unit's: it
  belongs to DL-161, F3-426 and F3-430 as the 5.6 Pro fonts work amends them under D17a, and Retro's interface and
  its code text outside the editor and the terminal stay IBM Plex Mono.
gui_related: true
gui_classification_reason: Defines the built-in faces, defaults and licence rule of the editor's and the terminal's visible text.
split_recommended: false
depends_on: [DL-183, DL-161, F3-642, F3-639, DR-050]
unblocks: [ATS-076]
acceptance_criteria:
  - "The editor draws JetBrains Mono in every look, Retro included."
  - "A new terminal draws JetBrains Mono in every look but Retro and VT323 in Retro, and each face listed above can be chosen."
  - "Each face that has a default size and line height listed above opens at them."
  - "JetBrains Mono's bytes are the page's code-face files, never a second copy inside the terminal, and the terminal's own faces total 84,572 bytes before base64."
  - "Box drawing, block, braille, powerline and sextant glyphs are drawn by the terminal and meet their neighbours with no gaps."
  - "Every built-in face is under the SIL Open Font License, Apache or MIT and ships with its licence and source record."
  - "DL-161, F3-426 and F3-430 are cited for general code text and are not amended by this unit."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D17)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS-ADDENDUM-1.md, SHA-256 1651ae9c41a61f215ee960288b27bb78ee8d9ad804c741495e3313ff4a33e299 (D17a)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, section 4 (concept lineage only)"
preserved_exact_tokens:
  - "JetBrains Mono"
  - "VT323"
  - "Sixtyfour Raster"
  - "Departure Mono"
  - "Atkinson Hyperlegible Mono"
  - "84,572 bytes"
  - "PM Symbols"
  - "OFL-1.1"
negative_constraints:
  - "Do not build in a face whose licence is not the SIL Open Font License, Apache or MIT."
  - "Do not carry a second copy of JetBrains Mono inside the terminal."
  - "Do not amend DL-161, F3-426 or F3-430 from this unit, or change Retro's general code text."
compatibility_only_notes:
  - "The concept's font file names are lineage; the product's files are the embedding pipeline's (DL-161, DR-050)."
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-183, ContractName:Plans/Decision_Log.md#DL-161, ContractName:Plans/DRY_Rules.md#DR-050, ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/FinalGUISpec.md#F3-639

### F3-645 — Images In The Terminal

```yaml
plan_unit_id: F3-645
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A terminal tab draws kitty graphics, sixel and iTerm2 inline images, all from the first release (DL-182). What the
  protocols accept, their limits, the hardening and the fixed error replies are
  `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-181`; this unit owns how images look and behave in the tab.
  Paint order, from the back: the default background, images with z below -1,073,741,824, cell backgrounds, images
  with negative z, text and the glyphs the terminal draws, decorations, selection and the cursor, then images with z
  of 0 or more; Unicode-placeholder images draw in their own cells at the under-text tier, which is how an image
  survives a program such as tmux that redraws cells. An image anchors to the cell it was placed on: it scrolls with
  that cell, follows it when the grid reflows, clips to the tab, and goes when the screen is cleared or its lines
  leave the scrollback. Text written over a sixel or iTerm2 image cuts the image out of those cells. While an image
  decodes or a file is read, later output waits, so text after an image always lands after it. Animation plays no
  faster than SMPFS-181's fastest frame; under Reduced Motion an animated image holds its first frame; while the terminal is hidden it pauses. The desktop draws the tiers through Skia (F3-582) and the web client draws
  the same tiers over its text rows, positioned by row, so images scroll and clip with the rows (F3-583). Images
  persist with the terminal's saved scrollback inside its storage quota (SP-332), the separate terminal scrollback
  cap F3-416 asks for, so a restored terminal's
  scrollback looks as it did; placeholder cells on restored lines resolve only to restored images, so a program in
  the new session that reuses an image id never paints into the old scrollback. When the quota drops an image
  (oldest first, text never giving way to images, and a frame that cannot be read back counting the same), its
  cells show a dashed hairline box with `[<name> <W>×<H> · not kept]`, the name being the file name a kitty file
  transfer or iTerm2's name gave, else `kitty image`, `sixel image` or `inline image`; a Unicode-placeholder run
  shows that label in its first cell; and the restore notice counts the images not kept (F3-640). Images on the
  alternate screen are never saved. The accessible plain-text buffer and agent reads describe an image as
  `[image W×H px]`, with ", animated" when it is animated, a Unicode-placeholder run as `[image]`, and an image the
  saved scrollback could not keep by its placeholder label; agent reads never return image data (SMPFS-182). An image
  that a limit, a quota or a transfer rule refuses (a file, temporary-file or shared-memory image from a remote
  session or from a command an agent typed is one) is not drawn, and the program receives SMPFS-181's fixed error
  reply, which never echoes what it sent.
gui_related: true
gui_classification_reason: Defines how terminal images are layered, anchored, animated, saved, replaced by placeholders and described in the terminal tab.
split_recommended: false
depends_on: [DL-182, F3-640, SMPFS-181, SMPFS-182, SP-332, F3-582, F3-583]
unblocks: [ATS-076]
acceptance_criteria:
  - "Images draw in the paint order above, and Unicode-placeholder images draw in their cells under the text."
  - "An image scrolls, reflows and clips with its anchor cell, and text written over a sixel or iTerm2 image cuts it out of those cells."
  - "Output after an image never paints before the image is decoded."
  - "Under Reduced Motion an animated image holds its first frame; while the terminal is hidden it pauses."
  - "A restored terminal shows its saved images where they were; an image the quota dropped shows the dashed placeholder with its name and size, and the restore notice counts it."
  - "The accessible buffer and agent reads show `[image W×H px]`, `[image]` or the placeholder label, and never image data."
  - "A refused image is not drawn, and the program's error reply is one of SMPFS-181's fixed strings."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-182"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D14)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, section 7 (concept lineage only)"
preserved_exact_tokens:
  - "kitty graphics"
  - "sixel"
  - "iTerm2"
  - "-1,073,741,824"
  - "[<name> <W>×<H> · not kept]"
  - "[image W×H px]"
  - "[image]"
negative_constraints:
  - "Do not draw text after an image before the image is decoded."
  - "Do not let a restored placeholder resolve to an image from the new session."
  - "Do not return image data in an agent read, or echo a program's input in an image error."
compatibility_only_notes:
  - "The concept's image store, renderer layers and demo images are lineage only."
stale_retired_dispositions:
  - "Amended 2026-10-10 (lead ruling L15): Under Reduced Motion an animated image holds its first frame; while the terminal is hidden it pauses."
  - "Replaces F3-544's sentence that no image protocol is approved (DL-182)."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-182, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-181, ContractName:Plans/storage-plan.md#SP-332, ContractName:Plans/FinalGUISpec.md#F3-582, ContractName:Plans/FinalGUISpec.md#F3-583

### F3-646 — Agents And People In One Terminal

```yaml
plan_unit_id: F3-646
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  An agent and a person can share one terminal (DL-181). The rules are
  `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182`; this unit owns how they show. While an agent works in a
  terminal or asks to, an inline row above the screen (F3-640's notice row) shows one of four states. Driving: "<agent>
  is driving this terminal · step N of M · <label>", with Take over, Interrupt and Stop. Paused, after a take-over:
  "You took over. <agent> is paused and has been told.", with Hand back and Stop <agent>. Permission: "<agent> wants
  to type in this terminal: `<command>`", with Allow once, Allow in this terminal and Deny; Allow once's hover tag
  reads "<agent> types this one command" and Allow in this terminal's reads "<agent> may type here until its run
  ends or you take over. Each command still needs its own approval." Secret input: "Password
  needed. Only you can answer this prompt; <agent> is waiting.", with Type it, which focuses the terminal. The person
  can always type: any keystroke in a terminal an agent is driving takes over at once, the row turns to Paused and
  the agent is told, and the agent's next write is refused as `preempted`. Take over does the same from the row
  (`cmd.terminal.take_over`); Interrupt sends SIGINT to the foreground job (`cmd.terminal.interrupt`); Stop and Stop
  <agent> end the agent's run and return the terminal to the person (`cmd.terminal.stop_agent`). An agent cannot type
  into a terminal a person opened unless the person allows it. Allow once lets that one command through, and the
  agent's turn there ends with it: its row, its mark and its lease go back. Allow in this terminal is a write grant to
  that agent in that terminal session only; it is held in memory and never stored, and it ends when the terminal
  closes, when the person takes over (a keystroke, Take over or Stop) or when that agent's run ends. Hand back returns
  the terminal to the agent, and in a terminal the person opened it grants Allow in this terminal again for the rest
  of that run. While Allow in this terminal lasts, the agent keeps the Driving row between commands. The grant decides who may type, never what may run: every command the agent types still passes the
  Tools policy engine with its own approval of that exact invocation (SMPFS-024, PS-041). The concept's label "Always
  allow here" is not used, because Always in PS-041's approval choices means a stored rule that outlives the session
  (lead ruling of 2026-10-10 in DL-181). Deny refuses the write. Allow once and Allow in this terminal dispatch
  `cmd.terminal.allow_agent_input` with their scope (CV-362). More, Agent input lists Ask each time and then one row
  per agent holding Allow in this terminal, each reading "Allowed in this terminal: <agent>" with Revoke, which revokes
  that agent's grant (`cmd.terminal.revoke_agent_input`); UCC-201 records these commands. Password and secret prompts always go to the
  person: while one is open the cursor is a padlock and every agent input is refused as `secret_input`. Each command records who typed it (`by`): a
  command an agent typed shows the agent's square mark in the gutter, and the command-mark menu says "<agent> typed
  this" or "You typed this" (F3-641). A terminal an agent is driving shows the 7 px square agent mark on its tab, and
  its hover tag adds "· <agent> is driving" (F3-640). A terminal an agent opened by itself lands as a background tab
  with the 6 px hollow square and a polite announcement, never takes keyboard focus and never changes the active tab
  of a panel the person is typing in (F3-634). Agent reads return rendered text with a read state, never raw bytes and
  never images (SMPFS-182, F3-645). Input protection (F3-549) still blocks the person's and the agent's input alike.
  A control API for the user's own scripts comes later and is not part of this unit.
gui_related: true
gui_classification_reason: Defines the visible agent row, take-over, permission and secret-prompt states, attribution marks and background opens of a shared terminal.
split_recommended: false
depends_on: [DL-181, F3-640, F3-641, F3-634, SMPFS-182, SMPFS-024, PS-041, CV-362]
unblocks: [UCC-201, ATS-076]
acceptance_criteria:
  - "Each of the four row states shows its exact text and actions, as an inline row above the screen and never a modal."
  - "A keystroke in a terminal an agent is driving takes over at once, shows the Paused row and refuses the agent's next write as `preempted`."
  - "An agent's write into a terminal a person opened waits for the Permission row; Allow once lets exactly one command through and then returns the row, mark and lease."
  - "Allow in this terminal is never stored and ends when the terminal closes, the person takes over or that agent's run ends; every command under it still asks for its own approval."
  - "No control in the terminal is labelled Always allow here."
  - "Hovering Allow once shows \"<agent> types this one command\" and hovering Allow in this terminal shows \"<agent> may type here until its run ends or you take over. Each command still needs its own approval.\"; while the grant lasts the Driving row stays between commands, and More, Agent input lists \"Allowed in this terminal: <agent>\" with Revoke."
  - "While a secret prompt is open the cursor is a padlock and agent input is refused as `secret_input`."
  - "Agent-typed commands carry the square mark in the gutter, the mark menu names who typed each command, and an agent-driven tab shows the square agent mark."
  - "A terminal an agent opens lands in the background with the hollow square and never takes focus."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-181 (the lead ruling of 2026-10-10 on Allow in this terminal)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D8, D18)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, section 8 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-e741dfbc6c.md, SHA-256 5fe7d1e04e5e54c47013c503254527265b94420239772ac711f760f43f96674d (R36; concept lineage only)"
preserved_exact_tokens:
  - "is driving this terminal · step N of M · <label>"
  - "You took over. <agent> is paused and has been told."
  - "wants to type in this terminal:"
  - "Password needed. Only you can answer this prompt; <agent> is waiting."
  - "Allow once"
  - "Allow in this terminal"
  - "Hand back"
  - "Type it"
  - "preempted"
  - "secret_input"
  - "Always allow here"
negative_constraints:
  - "Do not store an agent's terminal write grant, keep it after the terminal closes, the person takes over or the agent's run ends, or let it stand in for command approval."
  - "Do not let an agent answer a password or secret prompt."
  - "Do not let a terminal an agent opened take keyboard focus."
  - "Do not label the grant Always allow here."
compatibility_only_notes:
  - "SPEC ac63b1f467 kept the third action behind a flag that was off; from e741dfbc6c the concept shows Allow in this terminal, as canon does."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): Adds the Allow once and Allow in this terminal hover tags, keeps the Driving row between commands while the grant lasts, and names the Agent input row \"Allowed in this terminal: <agent>\" with Revoke; the compatibility note on the third action is now history (SPEC e741dfbc6c shows Allow in this terminal)."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-024, ContractName:Plans/Permissions_System.md#PS-041, ContractName:Plans/Contracts_V0.md#CV-362, ContractName:Plans/UI_Command_Catalog.md#UCC-201
