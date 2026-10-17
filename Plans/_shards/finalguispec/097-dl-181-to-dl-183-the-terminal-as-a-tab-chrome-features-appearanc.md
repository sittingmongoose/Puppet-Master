# Shard 097: DL-181 to DL-183 — The Terminal As A Tab: Chrome, Features, Appearance, Effects, Fonts, Images And Agents (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L46955-L49320

Source SHA256: `46e4f7e518b4eee59e453c5fc1fcf5e43e6c43f0db5648ab420f21f97a89a63b`

---

## DL-181 to DL-183 — The Terminal As A Tab: Chrome, Features, Appearance, Effects, Fonts, Images And Agents (2026-10-09)

This addendum compiles the owner decisions DL-181 (the terminal rebuilt as one session per tab, its chrome, what it helps you do, and agents and people sharing a terminal), DL-182 (images) and DL-183 (schemes, backgrounds, effects and fonts), with the lead rulings those cards record. The terminal is one tab kind of F3-635 and lives in the panels of F3-630; its session model is `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180`, and its engine stays DL-035's own (SMPFS-184). The units below own the terminal tab's presentation only. They supersede F3-062 (the bottom runtime workgroup strip) and F3-450 (the four-pane split guard), and retire the workgroup, sub-tab and editor-terminal-stack parts of F3-063 and F3-064, Appendix B's locked decision 12, the section 16 "4-split terminal" mapping and section 7.4.1's quadrant and explanations wording. They amend F3-065, F3-083, F3-120, F3-121, F3-194, F3-221, F3-226, F3-228, F3-245, F3-431, F3-449, F3-544, F3-546, F3-549 and the DL-035 consumer preamble. F3-193, F3-216, F3-238, F3-249, F3-357 to F3-361, F3-372, F3-412 to F3-416, F3-545, F3-547, F3-548, F3-582 and F3-583 stand unchanged. The rules stay with their owners: SMPFS-181 (image protocols, hardening and quotas), SMPFS-182 (agents and people), SMPFS-183 (marks, links, find, copy mode, progress, the bell, IME and the accessible buffer), SP-331 and SP-332 (storage), SSYS-051 (the Settings rows), UCC-201 (the commands) and DR-068 (one appearance model). General code text across the app stays with DL-161, F3-426 and F3-430. The terminal concept (branch `concept/home-terminal-20261009`, its SPEC and its architecture) is source lineage only: its class names, data attributes, script globals, settings keys, storage keys and harness hooks are not canon.

Amended 2026-10-10 (DL-187): F3-640 and F3-641 add a program's notifications and the per-terminal mute (D38), the installed shells and SSH hosts under New terminal (D39), no terminal tab colours or icons (D34) and the restore notice's left-out secrets (D36), and F3-644 follows terminal SPEC 01c5e78c42 section 4 (every face the page's own, its script slices and its italics). F3-646 was checked against that SPEC's section 8, which did not change.

### F3-640 — The Terminal Tab's Chrome

```yaml
plan_unit_id: F3-640
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A terminal is one tab kind of F3-635 with one session per tab (DL-181, SMPFS-180): the terminal kind
  mints the session, the tab id is `terminal:<session>`, and moving, collapsing, maximizing or hiding the
  tab never touches its session. There are no splits, sections, workgroups or sub-tabs inside a terminal.
  Split opens a new panel beside this one holding a new terminal in the same folder and shell profile
  (`cmd.workspace_layout.split` with a terminal spec), placed by F3-630's split fit rule; the More menu
  adds Split down. The tab label is `<process> · <folder>`: the foreground program, else `ssh` inside an
  SSH session, else the shell's name, then the last component of the folder. A failed last command adds
  its exit code after the label, a terminal an agent is driving shows the 7 px square agent mark, and a
  running process shows the static busy mark, all from the strip's one mark set (F3-631, DL-141). The
  hover tag is the label, plus "(ended)" once the session has ended and "· <agent> is driving" while an
  agent drives it. A label the user sets with `cmd.panel_tab.rename` replaces the label until it is
  cleared. No colour or icon of the person's choosing is drawn on a terminal tab (D34): terminal tab
  colours and icons are redesigned as F3-658's terminal family: an uncoloured terminal kind glyph, lit on hover,
  with state only through the shared mark slot (amended 2026-10-17, DL-228; it read: wait for their redesign within
  Puppet Master's neon glyph system (F3-449, F3-631)).
  Under the strip the tab draws F3-635's shared header row with no terminal-specific thresholds: 30 px
  tall, 24 px targets, 12 px text and 11 px for secondary facts, labels when the tab body is at least 520
  px wide and icons with hover tags below that, and the row hidden when the body is under 150 px tall. Its
  left side shows the folder in the code face with `~` for home, the branch when the folder is in a
  repository, and, only while a command runs, that command cut at 48 characters with an ellipsis (the full
  text in its hover tag) and its elapsed time as `m:ss`. Its right side shows Find, Split, Maximize
  (Restore while maximized; `ui.workspace_layout.maximize`) and More. Nothing is drawn below the screen:
  there is no bottom bar. No session id, tab id or nonce ever appears as text. Notices are inline rows
  above the screen, never modals: at least 30 px tall, with 12 px text and 24 px text buttons, a warning
  shown as a tinted surface and never as a side stripe. An ended session shows the row "Session ended"
  (with "with exit code N" when the code is not zero), Restart and Close tab, and dims the screen to 72 %
  opacity; Enter in an ended terminal restarts it. Closing a terminal whose process still runs asks
  inline, through the kind's close check: "Close this terminal? <process> is still running and will be
  stopped.", with Close terminal and Keep it open. A tab with no live session (restored after a restart or
  a reload, or a closed tab reopened) loads its saved scrollback before its new session starts (F3-645,
  SP-332), draws the dim rule `── Restored <time> · the earlier session ended ──` above the new prompt,
  starts a new session in the same folder and shell profile (at once for a local profile; a tab whose
  profile is an SSH host asks first, Reconnect / Close tab, as below), never presents itself as the old
  session (F3-226, F3-228), and says so: "This terminal was restored with its scrollback (N images were
  not kept). Its earlier session ended when the page reloaded; this is a new session.", the parenthesis
  shown only when images were dropped, and for a reopened tab "This terminal was reopened with its
  scrollback" with "Its earlier session ended when the tab closed; this is a new session.". When
  well-known secrets were left out of the saved copy (D36; the saved copy and its scrub are SP-332's), the
  notice ends "N secrets were left out of the saved copy.", and in the restored lines each left-out secret
  reads `[API key · not saved]` (or token, secret or private key) in its own cells, followed by blank
  cells, or `•` where the secret was shorter than that label, so the line keeps its width and every mark
  and image stays where it was; a private key keeps its BEGIN and END lines, its first body line carrying
  the label and the rest of its body empty. The live screen never shows these labels: it keeps what the
  program printed. A command still running when the earlier session ended comes back ended and
  indeterminate, "ended with the earlier session", never as done. When the saved scrollback cannot be
  loaded within its load budget (SP-332), a local terminal tab starts without it and says so; an SSH-host
  tab still waits for Reconnect / Close tab. The gutter is 20 px wide (18 px when the body is under 400 px
  wide) and draws one 12 px glyph per prompt line with a 20 x 24 px hit target, never a stripe (F3-641).
  The scrollbar is 14 px wide (10 px when the body is under 400 px wide) and speaks the editor minimap's
  language: a viewport box with a 2 px radius and a 1 px border, command marks 55 % of the track wide in a
  neutral tone, failed commands the full width in the failure colour, find matches 45 % wide in the search
  colour and the current match in the link colour; marks widen on hover. The sticky command header: when
  the top of the view is inside a command's output, a one-line header one cell plus 8 px tall shows that
  command's prompt line and its state (Running, Exit 0, Exit N), and clicking it jumps to the command; it
  hides when the body is under 150 px tall and in the alternate screen. The More menu, in order: New
  terminal (a submenu of the shell profiles and SSH hosts), Split down, a hairline, Appearance..., Text
  size (Bigger, Smaller, Reset), a hairline, Copy mode, Quick select, Select all, Clear, Clear scrollback,
  Plain-text buffer, a hairline, Agent input (Ask each time, then one row per agent allowed in this
  terminal, each of which revokes that agent's grant), Mute notifications (a check, absent where the
  platform has no system notifications; F3-641), Send signal (Interrupt SIGINT, Terminate SIGTERM, Kill
  SIGKILL), Restart session. New terminal's submenu lists the installed shells, then, after a hairline,
  SSH hosts, a submenu of the hosts (D39). The tab's menu ends, after a hairline, with Mute notifications
  too (F3-631). The screen's context menu opens on a right click, or a Shift+right click while a program
  reports the mouse: Open in editor and Copy path on a file reference, Open link and Copy link on a URL,
  then Copy, Paste, Select all, Find and Clear. The command-mark menu opens on a click on a gutter glyph:
  a header row with the command, its state, its duration and who typed it ("You typed this" or "<agent>
  typed this"), then Copy command, Copy output, Rerun, Insert command (without Enter), Open output in an
  editor tab and Select output. Every menu opens in the one overlay root (DR-067). Keys while a terminal
  has focus, macOS in brackets: Find Ctrl+Shift+F (Cmd+F), and in the find bar Enter for the previous
  match (upward), Shift+Enter for the next, Alt+C case, Alt+W whole word, Alt+R regular expression and Esc
  to close; Copy and Paste Ctrl+Shift+C and Ctrl+Shift+V (Cmd+C, Cmd+V); Select all (Cmd+A), from the menu
  on other platforms; previous and next command Ctrl+Up and Ctrl+Down (Cmd+Up, Cmd+Down); a page
  Shift+PageUp and Shift+PageDown; top and bottom Ctrl+Shift+Home and Ctrl+Shift+End (Cmd+Home, Cmd+End);
  Copy mode Ctrl+Shift+X (Cmd+Shift+X); Quick select Ctrl+Shift+E (Cmd+Shift+E); the plain-text buffer
  Alt+F2; text size Ctrl+=, Ctrl+- and Ctrl+0 (Cmd+=, Cmd+-, Cmd+0); Clear Ctrl+Shift+K (Cmd+K); Split
  Ctrl+Shift+5 (Cmd+D). A focused terminal gives these keys back to the host (F3-635): Alt+1..9,
  Alt+Shift+1..9, Alt+arrows, Alt+Shift+arrows, Ctrl+PageUp and Ctrl+PageDown, Ctrl+Shift+PageUp and
  Ctrl+Shift+PageDown, Alt+PageUp and Alt+PageDown (next and previous tab in a browser, where Chrome keeps
  Ctrl+PageUp and Ctrl+PageDown), Ctrl+\ and Ctrl+Shift+\, Shift+Escape, Ctrl+Shift+Space, Ctrl+Shift+`,
  Ctrl+Tab, and in a browser the stand-ins Alt+T, Alt+W, Alt+Shift+T and Alt+`. The host takes F6 and
  Shift+F6 before the terminal sees them, and ignores keys during IME composition. The shell therefore
  loses zsh's Alt+digit arguments, Alt+arrow word moves (Ctrl+Left and Ctrl+Right still move by word),
  Alt+T and Alt+W, and a program that needs Ctrl+\ (SIGQUIT) gets it from Send signal; every other
  Ctrl+key belongs to the shell. Split dispatches `cmd.workspace_layout.split` with a terminal spec and
  Clear scrollback `cmd.terminal.clear_scrollback`; Appearance... opens the Customize screen (F3-650)
  (F3-642); Find, Copy mode, Quick select, Plain-text buffer and Text size are the typed local actions
  `ui.terminal.find`, `ui.terminal.copy_mode`, `ui.terminal.quick_select`, `ui.terminal.a11y_buffer` and
  `ui.terminal.zoom`; Mute notifications is the typed local action `ui.terminal.mute_notifications`, that
  tab's own state with no command (F3-641); the command-mark items are `ui.terminal.mark.copy_command`,
  `ui.terminal.mark.copy_output`, `ui.terminal.mark.rerun` (which dispatches the catalogue's rerun
  command), `ui.terminal.mark.insert` and `ui.terminal.mark.open_output` (which dispatches
  `cmd.panel_tab.open` with an editor buffer); the agent controls are F3-646's; New terminal, Select all,
  Clear, Send signal and Restart session map to the ids UCC-201 records. Restart and Restart session start
  a new session in the same tab by the explicit replacement of F3-548, Copy and Paste follow F3-238's
  clipboard rules, and the screen is the terminal core's own grid (F3-193, F3-216). The header row's
  buttons use F3-465's small-control marker; the screen is never a hover target (DR-072, F3-465). Restoring a terminal tab whose profile is an SSH host asks first (Reconnect / Close
  tab), as privileged attachments do (F3-228); a restore never reconnects to a remote host by itself.
  Amended 2026-10-17 (DL-228): pasting several lines into a program that has not turned on bracketed paste
  asks first, in an inline warning row, "Paste N lines? Each line will run as a command.", with Paste, Paste
  as one line (the lines joined with spaces) and Cancel; code.terminal.paste-protection turns the check off. A
  notice takes keyboard focus only when the person's own action caused it (the paste check, closing a running
  terminal); program, agent and restore notices never pull focus. A notice with the same purpose replaces the
  earlier one in place; a warning is announced as an alert and an informational notice as status; restore and
  agent notes carry OK, which dismisses them, view-local. Below 150 px of body height notices are 26 px tall.
  A restored tab always says it is a new session: past its load budget, "This terminal was restored without
  its scrollback, which took too long to load. Its earlier session ended when the page reloaded; this is a new
  session.", and with nothing saved (Saved Terminal Output on Session Only), "This terminal was restored. Its
  earlier session ended when the page reloaded; this is a new session.", each with OK and a reopened variant
  ending "when the tab closed". Text size writes neither code.terminal.font-size nor the tab's appearance
  override: it is a view zoom over the appearance size, and Reset returns the tab to following its layers
  (UCC-201); the concept's write of the tab's font size is not adopted. Until the deferred Home glyph adoption
  (DL-208) the square agent mark and static busy mark above are the interim; F3-658's agent-driving,
  agent-cursor and working marks then replace them.
gui_related: true
gui_classification_reason: Defines the terminal tab's label, header row, notices, gutter, scrollbar, sticky header, menus and keys in the universal panels.
split_recommended: false
depends_on: [DL-181, DL-187, F3-635, F3-630, F3-631, F3-634, SMPFS-180, SMPFS-183, DR-067]
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
  - "No terminal tab shows a colour or an icon the person chose."
  - "Mute notifications shows in the More menu between Agent input and Send signal and at the end of the tab's menu after a hairline, and is absent where the platform has no system notifications; New terminal lists the installed shells and, after a hairline, the SSH hosts submenu."
  - "A restored terminal whose saved copy left secrets out shows each label in the secret's own cells with the line's width, marks and images unchanged, and its notice ends with the count; the live screen never shows the labels."
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
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D34, D36, D38, D39)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md, SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc, sections 1, 2 and 7 (concept lineage only)"
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
  - "Mute notifications"
  - "ui.terminal.mute_notifications"
  - "N secrets were left out of the saved copy."
  - "[API key · not saved]"
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
  - "Amended 2026-10-10 (DL-187; terminal SPEC 01c5e78c42): no tab colour or icon (D34); Mute notifications in the More menu and the tab menu (D38); installed shells and an SSH hosts submenu under New terminal (D39); the restore notice's secrets count and the left-out secret labels (D36)."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/DRY_Rules.md#DR-067, ContractName:Plans/Decision_Log.md#DL-187, ContractName:Plans/storage-plan.md#SP-332

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
  its own tab as advisory progress that completes nothing (F3-546). With the Bell setting (code.terminal.bell, Follow
  look or Off, DL-213) on Follow look, the look's bell (F3-643) shows in the tab, and the attention it raises follows
  SMPFS-183. Notifications (D38,
  DL-187): a notification a program sends (OSC 9, OSC 777 `notify` or OSC 99; OSC 9;4 stays progress) raises a system
  notification while Puppet Master is in the background; while it is in front the notification is announced
  instead, and the terminal's tab, when it is not the focused one, takes its attention mark. A terminal raises at most
  one notification every 3 s, and clicking a system notification brings that terminal forward. Each terminal can be
  muted: Mute notifications, a check in the More menu (F3-640) and at the end of the tab's menu (F3-631), is that
  tab's own state, saved with the tab, and the typed local action `ui.terminal.mute_notifications`, with no command
  (lead ruling F5); it is absent where the platform has no system notifications. Where the platform asks the
  person's permission for notifications, as a web browser does, Puppet Master asks only after a notification has
  arrived, once, in an inline notice row (F3-640) when the person is back: Allow, Mute this terminal, Not now. The
  engine side is SMPFS-183's. Input methods
  (IME) work at the prompt (SMPFS-183). The plain-text buffer (Alt+F2, or More, Plain-text buffer) shows the screen
  and the scrollback as plain text for screen readers; Ctrl+Up and Ctrl+Down move between commands and Esc returns
  to the screen; images read as their text descriptions (F3-645). There is no AI feature in the terminal: no explain,
  fix, suggest or ask action and no inline completion; explaining commands is the Teacher persona's job in the chat
  (D19, SMPFS-180), and the terminal stays a user shell and agent surface, not Puppet Master's control plane (F3-413).
  Under Full CRT, a command mark sits beside its row as the tube shows it, inset by the case and bent by the
  curvature; a prompt the shell redraws (Ctrl+L or a completion list) keeps its mark (SMPFS-183).
  Amended 2026-10-17 (DL-228): a failed command is announced politely with its exit code ("<command> failed
  with exit code N"), and a command that ran over 10 s and finishes while its terminal is not focused is
  announced ("<command> finished") and sets that tab's attention mark. Pointer selection: a double click
  selects a word, a triple click a logical line with soft wraps joined, Shift+click extends, a drag past the
  top or bottom edge scrolls, a plain drag stays linear and Alt+drag is the pointer's explicit block choice
  (SMPFS-183), and Shift bypasses a program's mouse reporting for selection and the context menu; a link's
  hover tag reads "Ctrl+click to open <target>", cut at 70 characters. Find matches logical lines, so a match
  may span a soft wrap, across the whole scrollback; the count reads "N of M", capped at 10,000 and shown with
  "+" past it; a pattern that does not parse reads "Invalid pattern" and none found "No results"; matches
  refresh as output arrives while the bar is open. Command marks follow F3-658's terminal family: running is
  working, exit 0 complete, exit N failed, a prompt awaiting input idle, and exit 130 (interrupted) or a
  command that ended with the earlier session skipped, never failed, alike in the gutter, the chat's command
  card and the sticky header. Authorship never hides state: a command an agent typed keeps its 12 px state
  mark and adds the 8 px agent seat beside it; the agent's square mark above is the interim until the Home
  adoption (DL-208). Gutter marks take the terminal scheme's inks and hold 3:1 on every scheme, Retro's
  monochrome ones included; a mark's act plays once at its state change, never on scroll, and replaces the old
  per-look gutter settle.
gui_related: true
gui_classification_reason: Defines the visible command marks, links, find, copy mode, quick select, progress, bell and accessible buffer of the terminal tab.
split_recommended: false
depends_on: [DL-181, DL-187, F3-640, F3-634, F3-546, F3-547, SMPFS-183, SMPFS-180]
unblocks: [ATS-076]
acceptance_criteria:
  - "Every prompt line with a verified mark has one gutter glyph showing its command's state, no mark is drawn as a stripe, and a mark without the terminal's secret creates no glyph."
  - "The command-mark menu names who typed the command, Insert command sends no Enter, and Open output in an editor tab opens a buffer, never a preview."
  - "A plain click on a link selects text; Ctrl+click (Cmd+click) on a `path:line:col` reference opens the panel's preview tab at that line and column, Ctrl+double-click keeps it, Ctrl+Alt+click opens a new panel, and a URL opens a Browser tab."
  - "Find supports case, whole word and regular expressions, highlights every match and marks the matches on the scrollbar."
  - "Copy mode and quick select work with the keys above and leave with Esc."
  - "The plain-text buffer opens with Alt+F2, moves between commands with Ctrl+Up and Ctrl+Down, and reads images as their text descriptions."
  - "No explain, fix, suggest or ask action and no inline completion appears anywhere in the terminal tab."
  - "A program's OSC 9, OSC 777 notify or OSC 99 notification raises a system notification only while Puppet Master is in the background, at most one every 3 s per terminal, and clicking it brings that terminal forward; in front it is announced and an unfocused terminal tab takes its attention mark."
  - "Mute notifications is a per-tab check saved with the tab, in the More menu and the tab menu, dispatching no command; a muted terminal raises no notification; the item is absent where the platform has no system notifications."
  - "Where the platform needs the person's permission, it is asked once, only after a notification arrived, in an inline notice with Allow, Mute this terminal and Not now."
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
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D38)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md, SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc, sections 1 and 2 (notifications; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/terminal-SPEC-dbffa7a1b2.md, SHA-256 a9578d34c425186b4213ea2117ac19ea6393220efc173861a7beb4afeb7b12a8 (small-round concept lineage only)"
preserved_exact_tokens:
  - "path:line:col"
  - "OSC 9;4"
  - "Ctrl+Alt+click"
  - "Copy mode"
  - "Quick select"
  - "plain-text buffer"
  - "OSC 777"
  - "OSC 99"
  - "Mute notifications"
  - "ui.terminal.mute_notifications"
  - "Mute this terminal"
negative_constraints:
  - "Do not draw a command mark as a stripe or treat a mark without the terminal's secret as a boundary."
  - "Do not open a link on a plain click; a plain click selects."
  - "Do not add an AI action or an inline completion to the terminal."
  - "Do not raise a system notification while Puppet Master is in front, more than once every 3 s for one terminal, or from a muted terminal, and do not ask for notification permission before a notification arrived."
compatibility_only_notes: []
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-187, D38; terminal SPEC 01c5e78c42): adds system notifications from OSC 9, OSC 777 and OSC 99 in the background, the 3 s limit, the per-tab mute and the permission notice."
  - "Amended 2026-10-11 (wave 2, terminal SPEC dbffa7a1b2): Full CRT marks follow their shown rows and survive prompt redraw."
  - 'Amended 2026-10-16 (DL-213): the bell sentence points to F3-643''s per-look bell; it read: the visual
    bell, when the bell setting asks for it, flashes the tab in its look''s form.'
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-183, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-546, ContractName:Plans/FinalGUISpec.md#F3-547, ContractName:Plans/Decision_Log.md#DL-187

### F3-642 — The Terminal's Appearance

```yaml
plan_unit_id: F3-642
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The terminal's appearance is one layered model (DL-183, DR-068), resolved field by field: the
  look's defaults ("Follow look") under the app default (Settings > Terminal, SSYS-051) under the
  project default (written through Settings transactions, in the Project's settings) under this
  tab's override; a field left unset falls through to the layer below. Every field applies live, and
  no terminal appearance setting carries a restart badge; the terminal draws its own glyphs
  (DL-035), and section 6.4's restart rule for the app's font families is retired (DL-230). "Follow
  look" resolves per look, light and dark: Friendly Catppuccin Latte and Mocha; Glass Tokyo Night
  Day and Storm, drawn at 70 % (light) and 74 % (dark) opacity over the shell's existing glass blur,
  the terminal adding no backdrop blur of its own (F3-431); Retro PM Paper Teletype and PM Phosphor
  Green, with PM Phosphor Amber as Phosphor Green's sibling; Basic One Half Light and Dark; NieR
  Mode PM YoRHa Parchment and PM YoRHa Ink. Thirty-four schemes ship: 27 third-party schemes in 13
  families, each read from the project's own terminal port pinned to a commit, and 7 Puppet Master
  originals. Puppet Master originals: PM Phosphor Green, PM Phosphor Amber, PM Paper Teletype, PM
  YoRHa Parchment, PM YoRHa Ink, PM High Contrast Light, PM High Contrast Dark. Catppuccin (MIT):
  Latte, Frappé, Macchiato, Mocha. Tokyo Night (Apache-2.0): Day, Storm, Night. One Half (MIT):
  Light, Dark. Rosé Pine (MIT): Dawn, Moon, Main. Solarized (MIT): Light, Dark. Gruvbox (MIT):
  Light, Dark. Dracula (MIT): Dark. Nord (MIT): Dark. Kanagawa (MIT): Wave, Lotus. Everforest (MIT):
  Light, Dark. Flexoki (MIT): Light, Dark. GitHub (MIT): Light, Dark. Ayu (MIT): Mirage. Every
  third-party scheme ships with its licence text and its source address and SHA-256; the
  iTerm2-Color-Schemes collection (no single licence) and Modus (GPL-3.0) are not bundled, and
  import covers them. These schemes are one code colour-scheme catalog that serves the editor and
  the terminal (D30, amending D15 and D21): each of the 34 schemes carries the terminal palette and
  the editor's 17 syntax tokens. Each catalog scheme's 17 editor syntax colours are authored to
  4.5:1 for every syntax token, comments included, against the scheme's background (7:1 throughout
  on PM High Contrast Light and Dark), and the editor and the terminal both draw the catalog values
  as they are; an imported scheme takes its editor syntax colours from its ANSI 16 by a fixed map.
  Each surface's scheme choice defaults to "Follow look" — the terminal's "Follow look" per-look
  scheme above, the editor's per-look syntax colours (F3-426, F3-639) — and each surface keeps its
  own scheme choice. The shared Customize presentation, its two entry points, scope memory, live
  previews, quick sets, trials and docking rule are F3-650's; the editor's field behavior is
  F3-651's. No surface keeps a separate scheme catalog (DR-068). "Switch with light and dark", on by
  default, swaps a chosen scheme for its family's other appearance when the app changes between
  light and dark. A minimum-contrast floor applies per cell to the text colour against its cell
  background by moving OKLab lightness only, keeping hue and chroma: default 4.5:1, with Off, 3:1,
  4.5:1 and the existing higher 7:1 choice for program output only under F3-654; block elements,
  powerline and sextant glyphs are exempt, because they are shapes that meet their neighbours, and a
  selection uses the scheme's selection text colour. Phosphor schemes (PM Phosphor Green and PM
  Phosphor Amber) map colours outside their 16 (the 256-colour cube and truecolor), and any colour a
  program sets (OSC 4, 10, 11 and 12), onto the phosphor by brightness, so a program's `38;5;196`
  never paints red on a green tube; the scheme's own 16 stay as authored. Import reads iTerm2
  `.itermcolors`, Windows Terminal JSON (one scheme, or a settings file's list of schemes), kitty
  `.conf`, Ghostty themes, Alacritty TOML and its legacy YAML, base16 and base24 YAML, and
  Xresources; input is capped at 256 KB, nothing in a file is evaluated, and every error message is
  fixed and never echoes the file. The fields and their defaults: scheme (Follow look, or a scheme);
  Switch with light and dark (on); minimum contrast (4.5:1); font (Follow look, JetBrains Mono,
  Atkinson Hyperlegible Mono, VT323, Departure Mono, Sixtyfour, Sixtyfour Raster or the system
  monospace; F3-644); font size and line height (the face's defaults, F3-644); weight (400); letter
  spacing (0); ligatures (on); bold as bright (off); cursor shape (Follow look, block, bar or
  underline); cursor blink (on); cursor trail (Follow look, off, soft, glow, phosphor or trace);
  background (Follow look, theme surface, solid colour, gradient or image) with its colour, its
  gradient or image from Plans/terminal_background_catalog.json, or a custom image; image dim (Auto,
  the least dim needed for readable text) and image blur (0 px, baked once into the image and never
  a backdrop blur); opacity (Glass); padding (0 px by default, the vertical padding 60 % of the
  selected horizontal padding); effects (Follow look, off or custom) with the effect fields of
  F3-643; inactive dimming; smooth scrolling; bell (Follow look or off, F3-643); sticky header (on);
  copy on select (off); and Sixtyfour's scan and bleed axes. Cell geometry: a cell is a whole number
  of device pixels, its width round((advance + letter spacing) x device pixel ratio) and its height
  round(font size in px x line height x device pixel ratio), never less than 90 % of the font's
  ascent plus descent, with the baseline centred; the padding is painted in the cell background, so
  the remainder smaller than a cell never shows as a stripe. The Customize screen (F3-650) (More,
  Appearance...) previews every change live on the terminal and writes either This terminal (the
  tab's override) or All terminals (enabled, the project default through the same Settings
  transaction Settings uses over SSYS-051's rows); This terminal commits with
  `cmd.terminal.appearance.set` (UCC-201). Settings > Terminal binds the same model with the same
  fields (SSYS-051) and writes the project layer through that same Settings transaction. The app and
  project layers are Settings values and the tab's override lives in the terminal tab's serialized
  state; a custom background image is kept as SP-331 says. There is one model: the look's defaults,
  the Customize screen and Settings read and write it, and no second terminal theme or font store
  exists (DR-068). The Retro scheme choice also colours Retro's editor syntax: Phosphor Green or
  Amber, with Amber turning the Retro editor amber. Retro syntax stays monochrome, using brightness
  and weight in dark and the black and red ribbon in light. This choice is stored once in the
  terminal's appearance model; the editor reads it and keeps no copy (F3-639, F3-647). The Customize
  screen’s All terminals is enabled and writes the project default row of SSYS-051 through the same
  Settings transaction Settings uses, so it changes every terminal while this Project is open; its
  hover tag says in this project; no surface writes an app-wide value until q-035 admits one.
  Hovering a scheme previews it on this terminal only after the pointer rests on that row for 110
  ms; arrow keys preview at once, with a 110 ms wait while a key repeats, so passing over rows or
  scrolling them beneath a stationary pointer never flashes through the schemes. Hover previews a
  scheme exactly as named, regardless of light/dark pairing. Choosing a scheme of the opposite
  appearance keeps that scheme and turns pairing off in the chosen scope, with a visible
  explanation. Scheme hints read the catalog's actual Light/Dark appearance. Font Rendering offers
  Auto (renderer default), Crisp (whole device-pixel text placement with hard pixel edges, as a
  terminal with anti-aliasing off) and Smooth (unhinted outlines);
  unsupported capabilities are disclosed, not silently mislabeled. Sixtyfour Scanlines and Bleed are
  static face-axis choices, not a native-only promise. Off and 3:1 remain valid program-output
  choices and are not rewritten on read. The look's app-default layer remains the bundled inventory
  default until an app-wide store is admitted; Project and tab writes keep SSYS-002/SP-331
  ownership. Plans/terminal_background_catalog.json is the one finite catalog of 64 designs, in
  Tonal, Wash, Pattern, Scene, Glass, Retro, Mark and Moving categories. Tonal/Wash ids use the
  gradient field, other design ids use the image field; defaults are fade and hills. Existing
  dusk/dawn/deep/paper gradients and hills/grid/paper image values retain their meaning through the
  catalog's explicit compatibility map. Every design is offered in every look; Suggested for <look>
  is a suggestion, never a filter, and Show includes All. The catalog includes plain Clear, Frosted,
  Tinted and Reeded glass and plain Phosphor glow, Tube glass, Aperture grille and Static. The Lens
  refracts the currently selected shared wallpaper print through F3-653/DR-073, or the scheme's
  light where no wallpaper shows, never a page-computed background or independent backdrop blur.
  Designs use the current scheme and remain visibly distinct while respecting the selected output
  contrast floor; low-headroom light schemes use a lighter-than-ground version rather than veiling
  different choices into an identical plain surface. Strength is 0–1, default 1; pattern Size is
  Fine/Medium/Coarse, default Medium; Motion is Off/Gentle/Lively, default Gentle and active only
  for moving designs under F3-643; a custom picture offers Cover/Contain/Tile/Centre, default Cover,
  and desaturation 0–1, default 0.5. Auto dim is not an explicit zero; an explicit dim never defeats
  the readability floor. Look's own and Solid colour always appear in Plain. Theme surface appears
  separately only when it differs from Look's own (Friendly in the landed design); an existing saved
  Theme surface remains valid and selects Look's own where their drawing coincides. F3-643 owns the
  independent bezel and CRT fields; F3-650 owns saved presets. Amended 2026-10-16 (DL-213, terminal
  rounds 4 and 5): every choice a field offers draws visibly apart from every other in every look,
  an inheritance choice (Follow look, Auto, the style's or face's own) aside. A custom picture is
  prepared at its own size, at most 1920 x 1200, so Tile and Centre differ for a small picture; Blur
  is a custom picture's own and the built-in designs take none; on a scheme with no contrast to
  spare (Glass light's Tokyo Night Day) the picture is veiled in white, or in black under light
  text, and shows as a pale print at the same text contrast, rather than being covered by the
  scheme's ground; under a dim of 85 % it offers full colour or grey only, and under 90 % Dim stays
  at 90 %, Blur offers 0 or 12 px and desaturation is not offered, the screen saying why in one line.
  Pattern Size applies to every Pattern design but Paper, whose fibre looks alike at any scale: on
  Waves it is the swell and on Scanline field the pitch. Lively is a motion of its own, not only a
  faster Gentle: Drifting aurora's curtains sweep twice as far, lean and pulse; Lava climbs further
  and swells; Running rain runs four times as fast and a run clears a pale pane's fog. Solid colour
  with no colour picked is the scheme's ground a visible step away from its text, so it always shows
  and only gains contrast. Bold as bright takes a more intense colour where a
  scheme's bright colour is within a small step of its normal one (on NieR's two-tone schemes,
  toward the text). In NieR Mode the YoRHa scheme of the other mode keeps its own colours. Glass
  Opacity in Glass light is offered only over a wallpaper, where its stops differ. The Glass light
  uploaded-picture case the options audit found wholly hidden is closed by the veil (40 cases,
  lowest text contrast 4.78:1 in the concept); that is concept evidence, not native certification.
  Plans/terminal_background_catalog.schema.json validates the catalog's closed finite-data shape;
  scripts/pm7-canon-check.py checks unique ids, choices and defaults against the Settings rows.
  Amended 2026-10-17 (DL-222): a design or scheme already previewed by hover stays shown through the
  pick's frame, and the preview ends only with the write, so the old ground is never drawn between the
  preview and the pick.
  Amended 2026-10-17 (DL-228): Switch with light and dark swaps by an explicit pair: Catppuccin Frappé and
  Macchiato go light to Latte, and Latte goes dark to Mocha; Tokyo Night Night and Storm go light to Day, and
  Day goes dark to Storm; Rosé Pine Moon and Main go light to Dawn, and Dawn goes dark to Main; Kanagawa Wave
  and Lotus pair; PM YoRHa Parchment and Ink pair, as do the PM High Contrast schemes; the other families swap
  within the family; Phosphor Green and Amber go light to PM Paper Teletype, and going dark from Paper
  Teletype returns to the phosphor last chosen, Green when none was (PM-ORIGINALS section 4; the concept
  always returns Green, which is not adopted). Dracula, Nord, Ayu Mirage and every imported scheme have no
  sibling and stay as chosen. With a PM High Contrast scheme the program-output floor is 7:1 unless the person
  set a floor in some layer. The floor holds as drawn: the look's own ground (Friendly's stage) and Retro's
  scanlines and glow raise each cell's target by what they take, so every word meets the chosen floor on
  screen. PM YoRHa Parchment and Ink map colours outside their 16, and program-set colours, onto the
  ink-parchment line by brightness, as the phosphor schemes do; in NieR Mode the YoRHa scheme of the current
  mode takes its colours from NieR's token tables, its catalog values being the fallback. A scheme change,
  previewed or chosen, crosses the terminal in the look's motion from the chosen tile (Basic fades, Friendly
  and Glass grow, Retro steps, NieR wipes only with its part, and Glass changes the tint and lays only the
  text over), the terminal's text never moving; under Reduced Motion it is a short cross-fade and on battery
  saver it is immediate (ACD-475). Background designs preview on hover after the same 110 ms rest, in
  Suggested and in Show, and revert on leaving or Escape, as schemes do (CS-102). Choose a picture takes PNG,
  JPEG or WebP under 4 MB and says "Choose a picture under 4 MB", "There is no room to keep that picture on
  this computer" or "That picture could not be read"; a picture is kept once by its content hash (SP-331). An
  import needs a background and a foreground; missing ANSI 0-7 take the xterm defaults and missing 8-15 copy
  the normal colours, with a warning; light or dark is read from the background; a Windows Terminal settings
  file with several schemes imports the first and names the others in a warning; an import with the same name
  replaces the earlier one; an imported scheme has no sibling and is then chosen in the current scope by a
  separate write.
gui_related: true
gui_classification_reason: >-
  Defines the terminal's visible schemes, contrast floor, import, appearance fields, cell geometry and
  Customize screen (F3-650).
split_recommended: false
depends_on: [DL-183, F3-640, F3-431, DR-068, SSYS-051, SP-331]
unblocks: [F3-643, F3-644, UCC-201, ATS-076]
acceptance_criteria:
- Every field resolves tab override, then project default, then app default, then the look's default,
  and an unset field falls through.
- Each look's Follow look scheme is the one listed for its light and dark variant, and Glass draws its
  scheme at 70 % and 74 % opacity with no backdrop blur of the terminal's own.
- Exactly the 34 schemes listed ship, each third-party scheme with its licence and source record, and
  the iTerm2-Color-Schemes collection and Modus are not bundled.
- The program-output minimum defaults to 4.5:1, offers Off, 3:1, 4.5:1 and 7:1, changes only OKLab lightness
  when enabled, and leaves block, powerline and sextant glyphs alone; interface text still consumes F3-654.
- Under PM Phosphor Green or Amber, a 256-colour or truecolor colour and a colour a program sets with
  OSC 4, 10, 11 or 12 draw on the phosphor by brightness, and the scheme's own 16 colours draw as authored.
- Import accepts the seven formats listed, refuses input over 256 KB, evaluates nothing and shows fixed
  errors that never echo the file.
- Every field changes the terminal at once, from Customize and from Settings, and no terminal appearance
  setting shows a restart badge.
- Cells are whole device pixels by the geometry rule, and no stripe shows between the last cell and the
  padding.
- The Customize screen’s All terminals is enabled and writes the project default row of SSYS-051 through
  the same Settings transaction Settings uses, so it changes every terminal while this Project is open;
  its hover tag says in this project; no surface writes an app-wide value until q-035 admits one.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build
  tasks are created by this unit.
- The editor and terminal list the same catalog, each curated scheme carries terminal and syntax colours,
  both scheme choices default to Follow look and remain separate, and both menus open the same Customize
  component (F3-650).
- Retro editor syntax remains monochrome in dark and keeps the black and red ribbon in light; Phosphor
  Green or Amber follows the one terminal Retro scheme choice, Amber turns the editor amber, and the editor
  stores no copy.
- Every catalog scheme's 17 editor syntax colours meet 4.5:1 for every syntax token, comments included,
  against its background (7:1 throughout on PM High Contrast Light and Dark), an imported scheme's editor
  syntax colours come from its ANSI 16 by the fixed map, and the editor opens F3-650/F3-651's full Customize
  screen.
- A fresh terminal has zero padding and the one catalog supplies all background choices without per-look
  exclusions.
- All 64 designs are reachable in every look, shared with Settings; compatibility ids resolve through
  the same catalog and Theme surface aliases only visually where identical.
- Lens follows wallpaper changes and keeps text readable; distinct designs remain distinct on light and
  dark schemes.
- Every offered choice of every field draws apart from every other in all ten looks, inheritance choices aside;
  Paper offers no Size; a custom picture stays visible as a pale print on a scheme with no contrast to spare,
  at the selected text contrast; Picture Desaturation defaults to 0.5; the built-in designs offer no Blur.
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D30)
- Plans/Decision_Log.md#DL-183
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D15)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md,
  SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, sections 5 and 6 (concept
  lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-e741dfbc6c.md,
  SHA-256 5fe7d1e04e5e54c47013c503254527265b94420239772ac711f760f43f96674d (R36; concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/terminal-SPEC-dbffa7a1b2.md,
  SHA-256 a9578d34c425186b4213ea2117ac19ea6393220efc173861a7beb4afeb7b12a8 (small-round concept lineage
  only)
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256
  1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0 (approved campaign source lineage;
  not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/CONTRAST-CLARIFICATION-20261014.md, SHA-256
  1c5654b46b6ed160a34466c9df083681cc179815b658c0acce593698680b8493 (decision/source lineage; not native
  implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round2--CANON-PROPOSALS.md,
  SHA-256 809ba3f1959a9349500fd6f3682650d348d38f0f1776f727f461202c60d36080 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--CANON-PROPOSALS.md,
  SHA-256 4a4b91f257467e76ec6d43e37a04a81cf5f9dee515242177f0d08db04483700d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--home-redesign--src--terminal--js--42-appearance.js,
  SHA-256 60379cc762cb98e4fbc4d6fb0a44751cbc7447da3c1e9ff4a04589c8186fefc9 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--home-redesign--src--terminal--js--43-grounds.js,
  SHA-256 617315678ff086bf94d334774384cbe93997d2afcbd753c048644ca5cae77b11 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-terminal-options-audit--NOTES.md,
  SHA-256 7cb5f1b3977e3923b4773260376626ac56827754ea663519a023b510065fc5ff (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round4--CANON-PROPOSALS.md,
  SHA-256 6be6e2e0743fe3af41ba338d508573eab7d0c60e42ee7517cd18bb77ee35ade7 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round5--NOTES.md,
  SHA-256 77c878854cf0c02b0612ce422a5f68797b3646f6d2aee2b316059d35be342541 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/Concepts--home-redesign--src--terminal--js--43-grounds.js,
  SHA-256 1dcede78aa98198b87661a64d6012c1ef420a1ec5573b9cccd48cb143b226b05 (round-5 head f1042f7d3e; source
  lineage; not native certification)
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
- 'Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): Phosphor schemes map colours outside their 16 and
  colours a program sets (OSC 4, 10, 11, 12) onto the phosphor by brightness, and the scheme''s own 16
  stay as authored.'
- 'Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): Catalog editor syntax colours are authored to 4.5:1
  for every syntax token, comments included (7:1 on PM High Contrast), and both surfaces draw them as
  they are, an imported scheme maps its ANSI 16 to editor colours by a fixed map, and the popover opened
  from the editor offers only scheme, font and size.'
- 'Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): States that each of the 34 shared schemes carries
  17 editor syntax tokens.'
- 'Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses Follow look for editor and terminal appearance
  defaults.'
- 'Amended 2026-10-10 (D30, DL-183): Retro editor syntax reads the terminal Retro scheme choice once and
  keeps no copy.'
- 'Amended 2026-10-10 (D30, DL-183): Shares the code colour-scheme catalog and Appearance popover with
  the editor and terminal.'
- 'Amended 2026-10-10 (lead ruling L16): All terminals writes the project default through the Settings
  transaction and shows in this project; no app-wide value is written until q-035 admits one.'
- Makes F3-083's terminal colour-scheme catalogue, preview and instant apply real, and replaces the restart
  badges on the old terminal theme and font rows (DL-183).
- 'Amended 2026-10-11 (wave 2, terminal SPEC dbffa7a1b2): Scheme hover previews wait 110 ms, with immediate
  arrow-key previews and delayed repeats.'
- A scheme or design already shown by hover stays through the pick, so the old ground is not drawn between
  the preview and the pick.
- 'Amended 2026-10-14: The compact editor popover retires; F3-650 owns both Customize screens. Off and
  3:1 remain program-output choices (DL-197).'
- 'Amended 2026-10-16 (PM7 pass 2): The old small background list and final-catalog hold are superseded
  by the landed round-3 catalog; later terminal rounds remain separate.'
- 'Amended 2026-10-16 (DL-213, terminal rounds 4 and 5): Desaturation defaults to 0.5 (it read 0.3); Blur is
  a custom picture''s own; the no-contrast veil closes the Glass light uploaded-picture defect; Size, Lively,
  Solid colour, Crisp and Bold as bright draw apart; Bell is Follow look or off.'
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
  The terminal's effects are Puppet Master's own (DL-183) and follow one policy. They are
  event-driven: the effect pass runs only after the screen repainted or while something is still
  animating. Only the focused, visible terminal animates; every effect goes idle within 10 s of the
  last output or keystroke; motion is off on battery saver; and where no GPU draws the terminal (on
  the desktop, the Skia CPU raster of F3-582), the effects layer stays off, no effects frames run,
  and plain static fallbacks paint (a static scanline pattern and a static glow), curvature, burn-in
  and noise are not drawn, and the Customize screen (F3-650) says what it could not draw. Under
  Reduced Motion every moving part is off (cursor blink, cursor trail, smooth scrolling, burn-in,
  noise, flicker, degauss, bell flashes, progress sweeps and image animation) and the static looks
  stay (scanlines, glow, curvature and the parchment grid). The catalogue: inactive dimming, the
  focus ring, cursor blink and trail, smooth scrolling, backgrounds (F3-642), Glass's blur (the
  shell's existing blur; the terminal adds none, F3-431), Retro scanlines and phosphor glow, an
  opt-in Full CRT tier (curvature, burn-in and noise), flicker, the visual bell, progress (F3-546),
  attention marks, and an on-demand Retro degauss, an action in the Customize screen (F3-650) rather
  than a setting, which runs to its end and stops. Scanlines and phosphor glow are Retro's: on by
  default in Retro dark and off by default elsewhere. Full CRT is off by default in every look, and
  the user turns it on. Flicker is on or off, off by default in every look, and draws at one faint
  level, 0.02 of relative luminance, under a cap of 0.03, against the 0.10 change that WCAG 2.3.1
  counts as a flash, so flicker can never be a flash; there is no amount to choose (DL-213: within
  the cap no two amounts look different), and a stored amount is read once as SSYS-051 says. The
  effect fields (F3-642) default to: effects Follow look; scan strength 0.30; glow strength 0.45;
  Full CRT off; curvature 0.04, active only with Full CRT; burn-in on within Full CRT; noise 0.035;
  flicker off. The bell is Follow look or Off (DL-213): Follow look rings the look's own bell,
  Friendly's flash, Glass's rim and Retro's inverse video. Basic draws a 2 px warn marker on the tab's
  header and NieR a motion-only bracket glitch (only while its brackets and glitch parts are on), and
  under Reduced Motion every look's bell is a still 1 px warn outline; these are deliberately
  near-invisible, and no flash, rim or inverse is added to them (Jared, 2026-10-16, DL-216). Off draws
  nothing in any look. There is no separate Visual choice. NieR
  Mode's terminal has the page's parchment grid behind the text, never a texture, and ink focus brackets, and no
  glow (amended 2026-10-17, DL-228; it read: a parchment texture under the text). By the
  NieR rule for new surfaces (DL-152, SSYS-043, F3-598, DR-056), NieR paints the terminal only while
  NieR Mode is on and each touch only with its own installed part: the parchment grid with the `ground`
  part and the focus brackets with the `brackets` part, never a new part; its colours come only from
  NieR's token tables or the theme tokens NieR repaints; its motion is stepped, with no glow, filter
  or blur, and loops only by transform or opacity; no surface larger than 340x256 px reverses its
  opacity more than once a second; and Reduced Motion and the Still and Colors only presets show end
  states at once. Motion voices belong to the theme family (DR-043). An effects frame takes at most
  2 ms of CPU at DPR 2 on P1000-class hardware (R34). The cursor trail never fires while a program
  hides the cursor, including while a progress bar redraws its line. The default look has no bezel
  or visible curvature. Bezel is independent of Full CRT: Off (default), Slim (stored rim, width 6
  px) or Monitor (stored case, width 24 px); explicit width is 2–48 px. Material offers Follow look,
  Graphite, Black gloss, Platinum, Putty, Brushed aluminium, Gunmetal, Glass and Accent. Follow look
  is Graphite/Aluminium for Basic dark/light, Graphite/Putty for Friendly, Glass for Glass, Black
  gloss/Platinum for Retro, and NieR's flat ink frame. In NieR Mode, Follow look is that flat ink
  frame, which has no reflection and offers none; a material chosen in NieR is drawn as that
  material, as in every other look. Reflection is Off, Low, Medium or High, each material starting
  at its own level, which Auto stores: Low for Platinum, Putty and Accent, and for Brushed aluminium
  on a dark screen; Medium for Graphite, Black gloss, Gunmetal and Glass, and for Brushed aluminium
  on a light screen. Choosing the material's own level stores nothing, so the choice keeps following
  the material, and a stored number reads as the nearest level on SSYS-051's scale. Every level draws visibly apart
  from its neighbours on every material in every look, and a case paler than a dark screen shows the
  mirror as a gloss over its face. Width is offered at 2, 4, 6, 9, 12, 16, 20, 24, 30, 36, 42 and 48
  px. The housing has a flat outer frame, sloped corner-joined faces, a
  bright lip and dark inner ring, with screen light/reflection following actual output at no more
  than 15 updates/s and zero updates while the picture is still. Full CRT's curved inner edge meets
  the housing without clipping selection or text. A bezel adds 3 px Slim or 6 px Monitor breathing
  room beyond selected padding. Curvature is 0–0.2, default 0.04, with each edge's bow one eighth of
  that value independent of aspect ratio and the text centre stationary. Phosphor mask is Off by
  default and is Full CRT's own choice: an aperture grille of three device pixels to a triad, drawn
  at every display density, so it shows at 1x as at 2x. Without a GPU the static
  rounded glass/edge/vignette and housing can remain, but curvature and moving effects do not run.
  Moving designs are opt-in and obey the same focus, visibility, activity, ten-second idle, battery
  and Reduced Motion policy; they stop under a full-screen terminal program too. This adopts the
  approved round-3 housing and plain-background direction and the landed round-4 and round-5
  levels, stops and mask (DL-213). Degauss is the one-shot action among the
  Customize screen's Try it actions beside the preview (F3-650; amended 2026-10-17, DL-228, it read: in the effects
  group), offered only in Retro and not in NieR Mode; it runs once on the real terminal and the preview together, and
  under Reduced Motion or without GPU effects it does nothing and says why, with the same existing command and no
  stored setting.
  The shared Follow look caret voices, the editor's (F3-651; amended 2026-10-17, DL-228: not the terminal's), are
  Basic line with on/off blink, no trail and no
  smooth scrolling; Friendly line with smooth blink, soft trail and smooth scrolling; Glass line
  with smooth blink, glow trail and smooth scrolling; Retro reverse-video block with stepped blink,
  phosphor trail and no smooth scrolling; NieR ink line with blink, Trace only with its Scan sweep
  part and no smooth scrolling. F3-651 owns editor-specific jump motion and trail triggers; this
  shared voice never forces terminal output to animate.
  Amended 2026-10-17 (DL-222): idle preparation of Terminal Customize (ACD-475) does not change this
  bezel's look.
  Amended 2026-10-17 (DL-228): the terminal's own Follow look per look is: Basic a block with stepped blink,
  no trail, smooth scrolling and no inactive dimming (turned on, it dims as Friendly does); Friendly a block
  with eased blink, soft trail, smooth scrolling and dimming; Glass a bar with eased blink, glow trail, smooth
  scrolling and dimming; Retro a reverse-video block with stepped blink, phosphor trail, no smooth scrolling
  and dimming; NieR a block with stepped blink, Trace only with its Scan sweep part, smooth scrolling and
  dimming. The cursor blinks in phases of about half a second and rests solid after 15 s without input; an
  unfocused terminal shows a hollow outline cursor; a program's own cursor shape and blink requests (DECSCUSR,
  mode 12) win while it runs; Reduced Motion and battery saver keep it steady. The trail fires only when the
  cursor jumps more than two cells on either axis after resting, so typing and redrawn progress lines never
  trail. A terminal draws at most one bell a second (WCAG 2.3.1); with Bell Off it draws nothing, and a bell
  in an unfocused terminal still sets that tab's attention mark. A terminal that is not on screen, its tab
  hidden or another page covering Home, draws no frames at all, grid included; its session and output carry
  on, and it repaints once, fully, when it shows again. NieR's terminal uses only installed parts: square,
  cursor, headers, ground, brackets, icons and blocks, and glitch, sweep, decode, slice and wipe for motion,
  each touch gated by its own part.
gui_related: true
gui_classification_reason: Defines the terminal's visible effects, their defaults and the policy that limits when they run.
split_recommended: false
depends_on: [DL-183, F3-642, F3-431, F3-582, DR-043, DL-152, DR-056]
unblocks: [ATS-076]
acceptance_criteria:
- Only the focused, visible terminal animates; an idle terminal draws no ambient frames; battery saver
  turns motion off.
- Where no GPU draws the terminal, the effects layer stays off with zero effects frames, plain static
  scanlines and glow are drawn, curvature, burn-in and noise are not, and the Customize screen (F3-650)
  names what it could not draw.
- Under Reduced Motion no part of the terminal moves, and the static looks stay.
- A fresh Retro dark terminal shows scanlines and phosphor glow; no other look shows them by default;
  Full CRT and flicker are off by default in every look.
- Flicker is on or off and draws at 0.02, never above 0.03 of relative luminance; no control offers an amount.
- Bell offers Follow look and Off; Follow look shows Friendly's flash, Glass's rim, Retro's inverse video,
  Basic's 2 px marker and NieR's motion-only bracket glitch (deliberately near-invisible, nothing added), a
  still 1 px outline under Reduced Motion, and Off draws nothing in any look.
- Degauss is a one-shot action in Retro, not a setting, and stops at its end.
- With NieR Mode on, the parchment shows only with the ground part and the focus brackets only with the
  brackets part, NieR's own terminal look has no glow, filter or blur, and no surface larger than 340x256
  px reverses its opacity more than once a second.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build
  tasks are created by this unit.
- An effects frame takes at most 2 ms of CPU at DPR 2 on P1000-class hardware; every effect, including
  Full CRT ambient noise and flicker, stops within 10 s of the last output or keystroke; without a GPU
  the effects layer stays off with zero effects frames and plain fallbacks paint.
- Bezel is independently removable, defaults off, uses the declared dimensions/materials/reflection, stops
  updating at rest and does not enable CRT implicitly.
- Curvature, mask and moving backgrounds respect the specified GPU, density, activity and Reduced Motion
  fallbacks.
- Reflection offers Off, Low, Medium and High from each material's own level, every pair visibly apart; NieR's
  own ink frame offers no reflection and a material chosen in NieR draws as itself; Width offers the twelve
  listed stops; the phosphor mask shows at 1x and at 2x.
- Idle preparation of Customize does not change the bezel's look.
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
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LANDING.md,
  SHA-256 066a115952b170ef50b5ca77bcc4b771428d2195ccc548e7955a656fed588d7e (landing source recheck; approved
  direction, not native implementation evidence)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-wave2-numbers-5e549d6961.md,
  SHA-256 f9d7756f94f26c5285b35400a380afed57fb27dfaee6d29683c3916604b4a15a (R34, adopted effects budgets;
  concept lineage only)
- Plans/Decision_Log.md#DL-183
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D16)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md,
  SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, section 6 (concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-ARCHITECTURE-542703c07c.md,
  SHA-256 b6daf31a8953b3d7b633dd0db0a7b8a0ecba41f4533e8d6db6df5fa0f08bf476, section 6 (concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/NIER-RULES-for-new-surfaces.md,
  SHA-256 4634aba3abe147493c0f71de49419e63ba667a6784ca4b36967b537abb231728
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/terminal-SPEC-dbffa7a1b2.md,
  SHA-256 a9578d34c425186b4213ea2117ac19ea6393220efc173861a7beb4afeb7b12a8 (small-round concept lineage
  only)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--JARED-FEEDBACK.md,
  SHA-256 8fe51092727cd7d2a319228114448e4bf8ac42e673461aff6968ac46ecf53d5a (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round2--CANON-PROPOSALS.md,
  SHA-256 809ba3f1959a9349500fd6f3682650d348d38f0f1776f727f461202c60d36080 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--CANON-PROPOSALS.md,
  SHA-256 4a4b91f257467e76ec6d43e37a04a81cf5f9dee515242177f0d08db04483700d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--home-redesign--src--terminal--js--42-appearance.js,
  SHA-256 60379cc762cb98e4fbc4d6fb0a44751cbc7447da3c1e9ff4a04589c8186fefc9 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-terminal-options-audit--NOTES.md,
  SHA-256 7cb5f1b3977e3923b4773260376626ac56827754ea663519a023b510065fc5ff (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round4--NOTES.md,
  SHA-256 2c1ec6ce72a08a6b4bbbe3b8256d713571379fef7e3a39a5fb927e992e685fcf (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round5--NOTES.md,
  SHA-256 77c878854cf0c02b0612ce422a5f68797b3646f6d2aee2b316059d35be342541 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-terminal-round5--CANON-PROPOSALS.md,
  SHA-256 9d55ddc569405b468fcad2c51aed61540563eea3d89d9402a891e071a0547d93 (P10 and P14 decided by Jared
  2026-10-16; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/Concepts--home-redesign--src--terminal--js--71-bezel.js,
  SHA-256 a360d1f65e2d5bd5007b4dbb7f450e4f5cab5b641532ad633c6ecf93e20885b1 (round-5 head f1042f7d3e; source
  lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-p1000-decision--JARED-DECISIONS.md,
  SHA-256 a1dedd6e70bfa51ec0b07c34a86bfa65583439b18ff4ace266c4fe9e2a0aa3a6 (Jared's decisions of
  2026-10-16 ~12:10Z; decision lineage)
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
- 'Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses Follow look for the terminal appearance default
  in surviving amendment prose.'
- 'Amended 2026-10-10 (R34, DL-183): Adopts the effects CPU budget, idle deadline and no-GPU fallback
  rule.'
- 'Amended 2026-10-11 (wave 2, terminal SPEC dbffa7a1b2): A hidden program cursor never triggers a cursor
  trail.'
- 'Amended 2026-10-16 (PM7 pass 2): The old 0.08 curvature and held round-two bezel direction are replaced
  by approved round-3 values. Round-4/5 proposals remain outside this pass.'
- 'Amended 2026-10-16 (DL-213, terminal rounds 4 and 5, Jared''s P10 and P14): Flicker is on or off at one
  level (the amount retires); Bell is Follow look or Off (Visual retires); Reflection is four levels from the
  material''s own; NieR draws chosen materials; Width has twelve stops; the mask draws at every density. The
  round-5 holds and the DPR-1 and NieR-material acceptance findings close.'
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
  These are the faces of the home redesign's editor and terminal only (DL-183, with Jared's answer
  of 2026-10-10 on Retro code text, D17a). The editor's code face is JetBrains Mono in every look,
  Retro included (F3-639). The terminal's default face is JetBrains Mono in every look except Retro,
  where it is VT323; Sixtyfour, Sixtyfour Raster and Departure Mono are Retro options and JetBrains
  Mono stays selectable there; Atkinson Hyperlegible Mono is offered for readability in every look;
  and the system monospace is also a choice (F3-642). Every one of these faces is the page's own,
  embedded once through DL-161's pipeline as one set of files shared with the rest of the page
  (DR-050), and the terminal carries no font file of its own (amended 2026-10-10, DL-183, terminal
  SPEC 01c5e78c42 section 4). JetBrains Mono's upright non-Latin slices reuse NieR Mode's PM NieR
  Mono files; its Latin face uses the full 100–800 source under the general family name 'JetBrains
  Mono', which the 5.6 Pro fonts work builds through DL-161's pipeline, and its italic is JetBrains
  Mono's own italic, which the page's code face embeds with the same script slices (DL-161, F3-430),
  so italic code and a program's italic text (SGR 3) are drawn, not slanted; VT323, Sixtyfour and
  Departure Mono have no italic, and theirs is synthesised. Each face comes as script slices with
  its Latin file last: JetBrains Mono as per-script slices and Latin, upright and italic; VT323 as
  Vietnamese, Latin Extended and Latin; Sixtyfour as Latin Extended and Latin; Sixtyfour Raster as
  Latin only; Atkinson Hyperlegible Mono as Latin Extended and Latin, upright and italic; and
  Departure Mono as the whole font, 1,186 glyphs, in one file. The faces, with licence, Latin bytes,
  axes and default size and line height in CSS px: JetBrains Mono, the code face of the editor and
  the terminal, OFL-1.1, 40,404 bytes upright and 42,964 bytes italic, weight 100 to 800, 13 px and
  1.30; VT323, Retro's terminal default, OFL-1.1, 17,936 bytes, no axes, 19 px and 1.05; Sixtyfour,
  a Retro option whose own axes give a CRT look without motion, OFL-1.1, 4,236 bytes, SCAN -53 to
  100 and BLED 0 to 100, 10 px and 1.45; Sixtyfour Raster, a Retro option that is Sixtyfour baked at
  SCAN 45 and BLED 40, OFL-1.1, 3,068 bytes, no axes; Atkinson Hyperlegible Mono, for readability,
  OFL-1.1, 17,752 bytes upright and 19,084 bytes italic, weight 200 to 800, 13 px and 1.35;
  Departure Mono, a Retro option, OFL-1.1 (its v1.500 release ships the SIL Open Font License, not
  MIT), 22,496 bytes, no axes, 13.75 px and 1.20; and the system monospace, 13 px and 1.30. The
  terminal-only faces total 84,572 bytes of Latin files before base64, plus 47,780 bytes of Latin
  Extended and Vietnamese slices. Box drawing (U+2500 to U+257F), block elements (U+2580 to U+259F),
  braille (U+2800 to U+28FF), powerline (U+E0B0 to U+E0BF) and sextants (U+1FB00 to U+1FB3B) are
  drawn by the terminal, so no patched font is needed, and the terminal's faces are never mirrored
  into PM Symbols. Licence rule: only permissively licensed faces are built in, under the SIL Open
  Font License, Apache or MIT, each with its licence text and its source and SHA-256 record; every
  terminal face is OFL-1.1. A face change applies live in the terminal (F3-642). Terminal text keeps
  its own fidelity fixtures, separate from rendered GUI text (F3-414). General code text across the
  chat and PMConcept7 (JetBrains Mono in Basic, Glass and Friendly, IBM Plex Mono in Retro, PM NieR
  Mono in NieR) is not this unit's: it belongs to DL-161, F3-426 and F3-430 as the 5.6 Pro fonts
  work amends them under D17a, and Retro's interface and its code text outside the editor and the
  terminal stay IBM Plex Mono. The system face exposes weights the selected face can draw; a
  fixed-weight face does not imply distinct variable weights. Terminal bold stays heavier: 700, or
  800 when regular weight is at least 600, within the supported face range. Jared reaffirmed the
  full JetBrains Mono 100–800 promise on 2026-10-14: the shared embedding pipeline now includes the
  40,404-byte full-axis Latin upright for JetBrains Mono, so Thin, ExtraLight and Light have real
  outlines. PM NieR Mono retains its own earlier Latin file. This source delivery closes the asset
  hold; native text-rendering verification is still required. Amended 2026-10-16 (DL-213, terminal
  round 4): JetBrains Mono's stored 600 and 700 are drawn at 580 and 720 on the variable axis, so
  Semibold and Bold read apart as every other adjacent pair does; all eight weights remain, stored
  as 100–800. For the system face, Customize offers only the weights this computer's face actually
  draws differently.
  Amended 2026-10-17 (DL-228): VT323, Sixtyfour, Sixtyfour Raster and Departure Mono have no bold weight
  either; their bold is synthesised, so SGR bold still reads heavier in them.
gui_related: true
gui_classification_reason: Defines the built-in faces, defaults and licence rule of the editor's and the terminal's visible text.
split_recommended: false
depends_on: [DL-183, DL-161, F3-642, F3-639, DR-050]
unblocks: [ATS-076]
acceptance_criteria:
  - The shared JetBrains Mono assets support the promised upright and italic 100–800 range, including upright 100–300; missing weights are not silently clamped.
  - "The editor draws JetBrains Mono in every look, Retro included."
  - "A new terminal draws JetBrains Mono in every look but Retro and VT323 in Retro, and each face listed above can be chosen."
  - "Each face that has a default size and line height listed above opens at them."
  - "JetBrains Mono's bytes are the page's code-face files, never a second copy inside the terminal, and the terminal-only faces total 84,572 bytes of Latin files before base64, plus 47,780 bytes of Latin Extended and Vietnamese slices."
  - "Every face the terminal draws is the page's own, embedded once through DL-161's pipeline, the terminal package carries no font file, and each face ships the script slices listed here."
  - "A program's italic text draws JetBrains Mono's own italic and Atkinson Hyperlegible Mono's own italic, and is synthesised in VT323, Sixtyfour and Departure Mono."
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
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LATE-DECISIONS.md,
  SHA-256 126ae52840c8e5a30d2c1788b5427e6dc219cd2804d7cbd43f94d25aa0de2d07 (Jared decisions at lines 296
  and 306; not implementation evidence)
- Plans/Decision_Log.md#DL-183
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D17)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS-ADDENDUM-1.md, SHA-256
  1651ae9c41a61f215ee960288b27bb78ee8d9ad804c741495e3313ff4a33e299 (D17a)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md,
  SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, section 4 (concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md,
  SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc, section 4 (every face the
  page's own, the slices and the italic; concept lineage only)
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256
  1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0 (approved campaign source lineage;
  not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--onboarding--opus-5.5--src--fonts--SOURCE.md,
  SHA-256 76985bc806939e214326c3bfd498e377cb868bfda68ed4b641b24599e57cf97b (source lineage; not native
  certification)
preserved_exact_tokens:
  - "JetBrains Mono"
  - "VT323"
  - "Sixtyfour Raster"
  - "Departure Mono"
  - "Atkinson Hyperlegible Mono"
  - "84,572 bytes"
  - "47,780 bytes"
  - "PM Symbols"
  - "OFL-1.1"
negative_constraints:
  - "Do not build in a face whose licence is not the SIL Open Font License, Apache or MIT."
  - "Do not carry a second copy of JetBrains Mono inside the terminal."
  - "Do not amend DL-161, F3-426 or F3-430 from this unit, or change Retro's general code text."
compatibility_only_notes:
  - "The concept's font file names are lineage; the product's files are the embedding pipeline's (DL-161, DR-050)."
  - "Terminal SPEC ac63b1f467 gave JetBrains Mono's upright file the weight axis 400 to 800 and its italic 100 to 800; SPEC 01c5e78c42 lists the family as one row with weight 100 to 800, which this unit follows."
stale_retired_dispositions:
- 'Amended 2026-10-10 (DL-183; terminal SPEC 01c5e78c42, section 4): every face is the page''s own through
  DL-161''s pipeline and the terminal carries no font file; the script slices (Latin Extended and Vietnamese
  among them), JetBrains Mono''s italic and the synthesised italic of VT323, Sixtyfour and Departure Mono
  are stated; the 47,780 bytes of non-Latin slices are added to the 84,572 bytes of Latin.'
- 'Amended 2026-10-14: The reviewed prototype lacked distinct JetBrains Mono upright weights 100–300.
  Jared reaffirmed 100–800 and directed adding the light files; the asset delivery remains to be verified,
  not a product question.'
- 'Amended 2026-10-16 (PM7 pass 2): The upright Latin delivery hold is closed; the full-axis JetBrains
  Mono file is separate from unchanged PM NieR Mono Latin.'
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
  Amended 2026-10-17 (DL-228): the Permission row shows the whole command it approves, wrapped over as many
  lines as it needs and never cut or ellipsized, so the person sees exactly what they allow. A secret prompt's
  row shows the key concept glyph (F3-658), with the waiting mark when a state is shown; the lock shape is
  blocked's and never means a secret. The padlock cursor while a program reads a secret is a cursor shape, not
  a status mark, and stays. Until the deferred Home glyph adoption (DL-208) the 7 px square agent mark and the
  6 px hollow square above are the interim marks; F3-658's agent-driving, agent-cursor and news marks then
  replace them.
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

### F3-650 - The Editor And Terminal Customize Screens

```yaml
plan_unit_id: F3-650
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The editor and terminal share one Customize presentation and the code scheme catalog of F3-642.
  Their More menu's Appearance... and Settings > Editor & Terminal > Editor look or Terminal look >
  Open Customize reach the corresponding screen. The menu defaults to This editor or This terminal
  and remembers the scope last chosen for that tab; Settings opens All editors or All terminals for
  that visit only and never overwrites the tab's remembered scope. All means the open Project,
  disclosed as in this project; a tab's own overrides remain above it and the screen explains when
  they mask an All change. SSYS-002 forbids a persistent write without a Project. The screen has a
  live preview rendered by the real editor or terminal renderer, a change meter, quick sets, Try it
  actions and grouped controls. It sits beside the real surface without covering it and frames the
  live target. One rule decides docking on both screens: the preview follows scrolling only when the
  real editor or terminal is not visible beside the screen, including narrow or maximized layouts.
  From Settings, the terminal screen routes to Home beside the real target and the editor screen opens
  over Settings itself, Settings kept beneath, with no detour to Home (amended 2026-10-16, DL-217, the
  editor lane); an editor's More menu still opens it beside the real editor. Origin in Settings alone does
  not force docking. Opening the screen never starts a shell, runs a command or changes a file. Without a
  suitable target the All scope remains useful through the isolated renderer preview, and This is
  unavailable with a reason. Close and Escape undo uncommitted previews, keep committed choices and
  return focus to the invoking control. Quick sets change only their named fields through the
  selected scope's writer, as one atomic change. Plans/appearance_quick_sets.json is the single
  exact field/value patch registry for Calm, Easy reading, Old monitor (terminal) and Show structure
  (editor), plus the exact reset field sets. This scope clears only the registered overrides; All
  uses SSYS-009 restore_defaults over that same exact set. A set patch never resets an unmentioned
  token map, indentation, autosave or behavior value. The look's own is a reset, not a set patch.
  Old monitor remains an explicit opt-in to F3-643's CRT and housing. Try it moves the sample
  cursor/caret, rings the sample bell or types and visits a sample problem; Step back shows, on the sample only, how
  this terminal or editor looks when you are not in it (the scope's inactive dimming), held about 1.6 s, then returns,
  and turning Dim terminals I'm not in on plays it once; it is not an undo and never touches the real buffer or session
  (amended 2026-10-17, DL-228; it read: Step back restores the sample). The editor groups are Colors, Text, Caret, Lines &
  guides, Motion & effects and Behavior. Every selector consumes F3-438; neither Customize screen
  defines another fitting or highlight grammar. Scope, search, scrolling, sample trials and hover
  are view-local; committed fields and reset/quick sets use UCC-204's writers. Schemes and fonts
  have truthful names, Light/Dark hints and supported capabilities. Dense Glass controls use
  F3-652's readable menu material. Each look draws the screen with its own material and motion.
  Reduced Motion shows end states and explains which movement it calms. While the screen is open,
  Tab and Shift+Tab wrap within it; arrows choose within one-of-several groups, except the scheme tiles, where arrows preview and Enter or Space
  keeps the scheme; Up and Down move by a row of tiles; each tile group is one tab stop on its chosen tile; Escape
  first ends an active preview and a second Escape closes the screen and returns focus, while naming a preset Escape
  cancels only the name (amended 2026-10-17, DL-228). Its layout remains usable down to 360 px, including beside-target and narrow
  states. Scheme-hover intent is deliberately surface-specific: terminal F3-642 waits 110 ms and
  editor F3-651 waits 160 ms; keyboard and cancellation use those owners. Jared approved saving
  terminal looks as user presets on 2026-10-14. This is distinct from the shipped fixed quick sets.
  Save this look captures the selected scope's committed choices above the look layer, including
  inherited Project choices for This terminal, never a hover trial or renderer sample. A preset
  keeps a stable id, name and sparse appearance fields, with a tiny truthful terminal preview. Save
  and Rename collapse whitespace, use My look for an empty name, and disambiguate names
  case-insensitively with numeric suffixes; the base name input is limited to 40 characters. The
  personal library retains at most 40 newest-first entries; saving past that cap drops the oldest.
  Rename preserves the id, Delete leaves already configured terminals unchanged, and Undo restores
  that entry and its list position within the cap. Enter confirms naming and Escape cancels naming
  without closing Customize. Applying a saved preset replaces the selected scope's appearance field
  set atomically: use its stored values and clear every unmentioned tab override for This; for All
  use the inventory defaults for unmentioned Project fields in the same set transaction. Existing
  inheritance still applies to cleared tab fields; a preset is not a permanent linked theme. A
  missing preset or invalid field is refused without a partial change. SP-331 owns the
  computer-local library beside imported schemes, independent of Project; UCC-204/CS-102 own its
  local save/rename/delete/Undo actions and existing scope apply routes. The library is not a
  Settings row, an app-wide default layer or a new scheme catalog; import/export of preset libraries
  is not introduced. A group’s Reset control clears only that group’s registered field set;
  whole-scope reset and The look’s own use the separately registered full set. Both scopes adapt
  those exact sets through the existing writers. A save that fails storage/readback shows its
  failure and creates no apparent saved entry. SP-331 owns missing-image/scheme refusal and library
  backup/Undo reachability. Amended 2026-10-16 (DL-213, terminal rounds 4 and 5): the terminal
  screen's sliders offer stops, each measured to draw apart from its neighbours in every look, and a
  value stored between two stops still shows as itself: letter spacing and line height move one
  device pixel of cell at a time; Size's Smaller and Bigger go to the next whole pixel whose cell is
  drawn a different number of device pixels, ending at 8 and 32; Strength 35, 65 and 100 %;
  desaturation full colour, half and grey; Blur 0, 3, 6, 12 and 24 px; Grain 0, 0.035, 0.075 and
  0.12; Curvature steps of 0.02; Bezel width and Reflection as F3-643 lists. Settings rows keep their
  own ranges (SSYS-051). Ligatures is not offered while letters are spaced: it shows Needs letter
  spacing 0 and returns at spacing 0. A field shows only where it draws (SSYS-051's visibility
  amendment lists the Settings side).
  Amended 2026-10-17 (DL-222): Terminal Customize, and the editor's Customize sheet, are prepared at idle
  under ACD-475 so a click is answered by the frame it paints and the screen comes in on the next frame
  already drawn. If preparation is not finished, what remains is finished after the click's frame and
  before the screen is revealed. Preparation does not change the screen's or the bezel's look (F3-643).
  A pick on either screen shows its new state on the control in the click's frame; the write follows
  (ACD-475). An open that fails or shows nothing is reported as an error, not only a toast. Toast words
  are unchanged and no new command is added.
  Amended 2026-10-17 (DL-230, Jared): while the editor's Customize sheet is opening under a resting pointer, a press
  or wheel that arrives before the pointer has moved reaches neither the sheet nor the page beneath, so
  the second press of a double-click on the opener is not taken as a choice in the sheet. The sheet is
  live once the pointer moves, the entrance ends, or about 500 ms after it opens. Keyboard and
  assistive-technology use is unaffected.
  Amended 2026-10-17 (DL-228): the editor's screen also has Import a scheme... ("Adds a colour scheme from a
  file to the catalog the editor and the terminal share"): it adds to F3-642's one shared catalog through the
  existing cmd.terminal.appearance.import_scheme, so an imported scheme appears on both screens; it announces
  "Imported <name>" and reports "Could not import that scheme: <reason>" in F3-642's fixed wording. A choice
  whose meaning is motion (caret blink, caret movement, trail) shows it as a small moving picture on its tile,
  playing only while that tile is hovered or focused, never at idle, in the look's own motion (stepped in
  NieR) and still under Reduced Motion; each choice keeps its plain second line ("On and off", "A fade", "From
  its middle", "Never blinks"; "Jumps", "A quick glide", "A slower glide"; "A short fade", "A bright streak",
  "An afterglow", "A thin ink line").
gui_related: true
gui_classification_reason: The editor and terminal Customize screens.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Both entry points use the same screen, model and scope writers; Settings entry never changes a tab's
  remembered scope.
- At narrow, maximized and beside-target widths the shared visibility rule alone decides whether the preview
  docks.
- Every selector fits without clipped words or a highlight spanning lines in every look and both motion
  modes.
- Sample trials, hover, close and Escape never modify a real file or send terminal input.
- Tab wraps inside the open screen, group arrows work, Escape restores invoking focus and the layout holds
  to 360 px in every look and Reduced Motion.
- Both scopes adapt each quick set from the same exact registry patch and leave all unrelated values unchanged;
  reset is distinguished from setting values.
- Save captures committed choices only; apply atomically replaces exactly the selected scope fields, retaining
  normal inheritance and every unrelated setting.
- Rename/Delete/Undo preserve identity, ordering and the 40-entry bound; cancellation, unavailable assets
  or a rejected apply never partially change a terminal.
- Terminal Customize is prepared at idle so the screen comes in already drawn, and that preparation does
  not change the bezel's look. A pick shows on its control in the click's frame.
- A Customize open that fails or shows nothing is reported as an error, not only a toast.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: the_editor_and_terminal_customize_screens
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256
  1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0 (approved campaign source lineage;
  not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-642
- Plans/Settings_System.md#SSYS-002
- Plans/UI_Command_Catalog.md#UCC-204
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/EDITOR-QUICKSETS.js, SHA-256 3e41e8ae1594be81401985bebaa2a4917e066593236fca04e54f02f9b7e7f7f6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/TERMINAL-QUICKSETS.js, SHA-256 351b7a4234021f745188a26cb97f8f6a1402235267596c47059e25c76e532879
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/CUSTOMIZE-RESET-GROUPS.md, SHA-256 f875b1dfdfe5e81386358fb5d92463fbfaeccb85bb186ef50ab3bcd5309b7753
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--home-redesign--src--terminal--js--42-appearance.js,
  SHA-256 60379cc762cb98e4fbc4d6fb0a44751cbc7447da3c1e9ff4a04589c8186fefc9 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--home-redesign--src--terminal--js--77-customize.js,
  SHA-256 688b8a4ec7d55b6f40ddc6ce2687b851778a75500590e4b6d63b72f5d74ae6e0 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/COORDINATOR-PRESET-CUSTODY-1016001056-4c95.md,
  SHA-256 ad3b14eebf173550efe88a594b4a869588e3175e7e1277120e86405753bc7f3f (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-fixes--pm7-motion-editor--NOTES.md,
  SHA-256 a9d113635287031b45c99d01df04710b80b6812f2a6f00838ec57462b3f448e5 (editor lane, head d6647a2fc1
  landed unchanged on main a0f844455c (L1), B6; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/Concepts--home-redesign--src--panels--kinds--11-editor-customize.js,
  SHA-256 7bd2cb58747e1d064ae91a82763d76d948262c64bc1a939a1123efce27ab7701 (main 6a3ee2fe90; a failed
  Customize open is reported, and the opening pass-through, proposed then and kept by Jared on 2026-10-17 (DL-230); source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/BRIEF.md,
  SHA-256 a6c5152164942a26cba5b0216a339578ee13c47a3ba39ffbeced793203c2dece (editor reopen and Terminal
  Customize prepared at idle; decision lineage)
preserved_exact_tokens:
- This editor
- All editors
- This terminal
- All terminals
- Open Customize
negative_constraints: []
stale_retired_dispositions:
- 'Amended 2026-10-16 (DL-217): the editor screen opened from Settings opens over Settings; it read:
  Settings entry routes to Home beside the real target.'
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/UI_Command_Catalog.md#UCC-204

### F3-651 - Editor Appearance, Token Colors, Caret And Indentation

```yaml
plan_unit_id: F3-651
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Each editor appearance field resolves from this tab's appearance override, then the open Project's
  code.editing rows, then Follow look. All editors and Settings write the same rows (SSYS-052); This
  editor writes through cmd.editor.appearance.set. SP-333 owns storage. The 17 token kinds are kw,
  fn, ty, var, prop, str, num, esc, com, op, pun, mac, tag, attr, head, link and code. Token Colors
  maps <scheme key>/<kind> to #rrggbb; a catalog scheme uses its resolved id after light/dark
  pairing and Follow look uses look:<look>-<mode>. A tab's map overlays the Project map token by
  token; clearing a tab entry reveals the Project entry and clearing that entry reveals the scheme.
  Colors > Token colours offers the scheme's kinds, hue, saturation, lightness and hex, with
  labelled numeric/text equivalents to color dragging. The stored requested color remains available
  for editing; drawing adjusts lightness with hue retained to the selected 4.5:1 or 7:1 floor and
  explains any adjustment. The floor also covers Follow look and dimmed inactive editors, line
  numbers, diff marks and bracket-pair colors on every ground: the code background, changed-row
  tint, current line and focused or blurred selections over them. Line numbers stay quieter through
  size rather than sub-floor color. Scheme hover after 160 ms rest, or keyboard selection, previews
  without transition on the sample and real editor; leaving or Escape restores the committed scheme.
  A commit uses Basic fade, Friendly bloom from the tile, Glass glide, Retro steps or NieR wipe,
  with continuous readable code even on slow frames. Follow look consumes the shared cursor/caret
  voices in F3-643. Editor movement is instant in Basic and Retro, gliding in Friendly and Glass,
  and instant with an eight-step jump treatment in NieR. Snappy movement lasts 80 ms and Gliding 150
  ms; typing and undo land immediately. A trail marks only a non-pointer jump of at least three rows
  or 24 columns, such as find, Go to line, changes or page navigation, and is clipped to the visible
  area. Typing and clicks make none. Reduced Motion suppresses blink, glide, trails, smooth
  scrolling and line reveal; still guides, scanlines and glow retain their state. Lines Arrive When
  a File Opens continues across resize and redraw instead of restarting or vanishing. Indentation
  reads applicable .editorconfig first, otherwise the file's dominant step of 2, 4 or 8 and its
  spaces/tabs while detection is on; absent a file choice, Tab Size and Indent With supply defaults.
  With detection off, Tab Size and Indent With govern every file regardless of its existing
  indentation. Guides, active guide, Tab, Shift+Tab, Backspace in leading whitespace and Enter after
  an opener share that unit. Real tabs remain tabs and display to the next tab stop, including
  pasted tabs; Show Spaces marks tabs with an arrow. Indentation... in More names the file's unit
  and provenance and opens these choices. Wrap Long Lines applies to ordinary files and inline diff,
  never side-by-side diff; the chosen column is bounded by the viewport, breaks prefer a space after
  one third of the width, continuation indent is capped at one third, and vertical movement follows
  visual rows. Problem Highlighting draws the file's Problems entries as severity-filtered wavy
  underlines with minimap marks and a message/source card after Hover Tip Delay. Automatic save uses
  the chosen pause (500 ms or 1 s), focus exit or tab hide, never saves untitled or read-only
  buffers, clears the dirty mark and announces saved without a toast. While Customize has focus
  beside a visible editor, that target still draws its caret and current-line treatment so those
  choices remain visible. Choosing a current-line treatment clears the isolated sample selection
  that would hide it. Smooth scrolling Try it goes to the sample's last line and back, gliding for
  On and jumping for Off; it ends cleanly and never scrolls a real file as a trial. Rust and
  JavaScript samples visibly exercise Variables, Properties and Escapes, and copying sample tabs
  preserves tab characters. The live editor remains subject to its ordinary selection and focus
  ownership.
  Amended 2026-10-17 (DL-228): the editor's More menu checks Word wrap, Minimap and Sticky scroll write the
  scope their value comes from: this editor's override when the tab keeps its own choice
  (cmd.editor.appearance.set), otherwise the All editors Project row through cmd.settings.transaction.preview
  then apply, so a quick toggle never silently creates or overwrites a tab override
  (Plans/pm7_control_bindings.json editor.more.*).
gui_related: true
gui_classification_reason: Editor appearance, token colors, caret and indentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every one of the 17 kinds can be edited independently for two schemes and both scopes, survives reload
  and falls through token by token when cleared.
- All effective text colors meet the selected floor, including Follow look, comments, line numbers, diff
  marks, bracket-pair colors and inactive dimming, on changed/current rows and focused or blurred selections.
- Typing and undo never wait for caret motion; Reduced Motion removes every moving caret/reveal effect.
- Spaces, tabs, pasted tabs, .editorconfig and 2/4/8-space files share one indentation rule without converting
  file bytes.
- With detection off, Tab Size and Indent With control new indentation even in a file whose existing unit
  differs.
- Wrap, problems and automatic save respect the named exceptions and preserve input/focus.
- Caret/current-line choices remain inspectable beside Customize, token samples show their named kinds,
  and the isolated smooth-scroll trial distinguishes On and Off without touching real content.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: editor_appearance_token_colors_caret_and_indentation
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/EDITOR-PROPOSAL-20261014-LANDING.md,
  SHA-256 aa15b3ba9605fb8efcf36486f3a3978af011e90d33096f463f7b21510c414ed4 (landing source recheck; approved
  direction, not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-639
- Plans/FinalGUISpec.md#F3-650
- Plans/Settings_System.md#SSYS-052
- Plans/storage-plan.md#SP-333
- Plans/UI_Command_Catalog.md#UCC-204
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-editor-customizer--NOTES.md,
  SHA-256 fa7c61fc1d449161225fc0399bae2843c41855853e91bf3f442380432edb17d6 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-editor-customizer--PROPOSAL-canon.md,
  SHA-256 05acff6232e20f4d1f480400708c64d915b51237c1a4ce9789c5364a98829f79 (source lineage; not native
  certification)
preserved_exact_tokens:
- Token Colors
- 4.5:1
- '7:1'
- cmd.editor.appearance.set
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-639, ContractName:Plans/FinalGUISpec.md#F3-650, ContractName:Plans/Settings_System.md#SSYS-052, ContractName:Plans/storage-plan.md#SP-333, ContractName:Plans/UI_Command_Catalog.md#UCC-204

### F3-652 - Liquid Glass Material And Motion

```yaml
plan_unit_id: F3-652
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Liquid Glass is the Glass look in Light and Dark, not a new theme family. Jared approved
  publication after the round-three corrections; the combined concept and wallpaper publication
  landed on 2026-10-15. That publication is source evidence, not native certification. Sheets read
  as glass over the chosen wallpaper: a refracting rounded bevel, a frosted readable core, a
  top-left specular rim and a quieter exit light. Selection lenses enlarge sharp text, carry moving
  reflections and gently bend their rim; color fringing, tearing letters and opaque flashes are
  defects. One shared lens grammar serves page selection, rail and panel tabs, Usage, onboarding
  steps, Orchestrator views, customizer choice rows and, by Jared’s 2026-10-14 direction, the
  title-bar theme selector. It starts on activation without waiting for content work, never doubles
  or reverses mid-flight, and keeps its resting glass. Scrubbing is selection, never text selection.
  Pointer beads travel only between neighbouring controls. Switches use curved ends and a rounded
  lens knob with slower, settling movement; action buttons may be rounded under F3-648. Menus grow
  from their invoking control; fields such as Find a scope and Find a panel read as one seamless
  field; the theme menu has room for its labels. Usage changes are calm, with no full-board sweep or
  opaque-then-clear flash. Glass Dark’s hover light stays near the shared control scale, about 96 px
  radius, without veiling text. Jared decided on 2026-10-14 that Glass Light draws its hover light
  beneath the content, so the text stays readable; the surface-edge glow stays. F3-465 owns the
  reduction of the pointer’s central glow while retaining that edge light. Settings
  rail/index/sections, onboarding window, tour callout/bar and the Wizard/Orchestrator columns use
  the same sheet hierarchy; nested cards and controls are fills on sheets, not independent
  full-scene effects. Dense Customize and notification surfaces use the more opaque menu material
  needed for F3-654's settled contrast. Moving/leaning sheets carry coherent frost, and wallpaper,
  refraction and frost change together (F3-653). The renderer may precompute static wallpaper optics
  and use bounded live optics on small lenses and menus; F3-427's old one-shell-blur and F3-431's
  blanket Glass restrictions are superseded for this material. It must not create arbitrary nested
  live blur or redraw idle static sheets every frame. Reduced Motion preserves end-state material,
  selection and focus without spring, sweep, magnification travel or condensation; a renderer
  without live-optics capability uses a truthful static readable equivalent. Publication of this
  look and the wallpaper gallery is one coordinated boundary, including retiring F3-428's old
  background modes. A standalone selection such as the activity bar or Usage navigation uses accent
  glass with white ink while the window is focused and grey treatment while unfocused; the whole
  glass treatment recedes when the window becomes inactive. Press feedback flexes/glows from the
  press point; a moving lens stretches with speed and settles on arrival, with press-and-drag
  settling into the nearest available choice. Unavailable, disabled or non-interactive items never
  capture the lens; onboarding progress moves it only when the selected step changes. Existing
  selection is placed before the first visible frame on page entry; navigation produces one
  highlight, with no slow reset, duplicate lens or trailing shadow that lags behind it. Settings
  chapter changes do not flash the chrome, wallpaper changes keep the chosen print and frost
  coherent, and ordinary scrolling does not visibly rebuild card edges. Both Settings search bars,
  in the left rail and centre, have a seamless input field that blends into their containing bar.
  The shared switcher has one selection authority and one track/lens/label component, adopted
  through family material tokens. It serves the page tabs, rail tabs, Usage navigation and range,
  Orchestrator views, Settings chapters, section/index/manager tabs, Wizard work type, theme menu
  and both Customize screens. Choices in scrolling content (Settings service lists and Home segmented rows/panel tabs) use its
  material in place without a travelling lens; Settings' segmented choices keep that material in place at rest and show the switcher's chip only while
  the choice moves, inside the control under its labels, in every look, Retro and NieR stepped per F3-438
  (amended 2026-10-16, DL-217, the seg plate lane, main 2b5ed6092d). Adopting
  the switcher does not enable Glass sheets or optics in another look. A newly shown strip, restored hidden strip or opened
  theme menu places its selected state before the first visible frame. A title-bar menu never
  removes the page selection; remeasure a hidden strip on reveal without a visible zero-position
  reset. The component replaces competing fills, dots, underlines and sliding highlights rather than
  painting a second selected marker. Glass Settings headers, Home lists, manager tabs, footer/help
  rows and search results have readable glass beneath their words. The editor and terminal Customize
  screens share dense menu material; their sticky section bar stays above the lenses of rows
  scrolling underneath. All consume F3-438 layout and F3-654 contrast. These rules add no primary
  action or stored switcher state. The concept-only Liquid Glass status-bar toggle (html[data-lg],
  window.PM_LG) is demonstration machinery and is not a product setting, command or native alternate
  material mode.
  Amended 2026-10-16 (DL-214, the consistency pass Q16): every look adopts the switcher, each in its own
  material, so every tab, segment and list selection in a look is one component drawn one way. Glass keeps
  its approved clear lens unchanged. Basic draws a precise tinted chip: an accent tint, a crisp accent
  hairline, a 6 px corner and a faint top catch light, gliding with a little give and a slight label
  swell. Friendly draws its page tabs' soft mint plate everywhere: a mint tint, hairline and glow, a 10 px
  corner, never a pill, mint chosen words, gliding as Glass's drop does but softer; the Orchestrator's
  capsule is gone. Retro draws reverse video: an opaque square phosphor block under the labels, every
  word, icon and count on it inverted to the screen colour, blooming on Retro dark and a step deeper with
  a printed hard shadow on Retro light. NieR Mode draws its ink bar: opaque ink under the labels, paper
  words, square, its hover ink bars, cursor square and brackets unchanged. Retro and NieR keep F3-438's
  stepped motion (Jared, 2026-10-16), never gliding. Reduced Motion places the chip at once. The same material serves
  the activity bar's tile, the theme menu's family rows and the project picker's chosen row, in place. A
  pressed item's words, icons and counts take the chip's ink in the press's own frame, and the item it
  leaves takes its resting ink in that frame, so no label lags the chip; a hovered resting label stays at
  4.5:1 or more on the bare ground. This adds no stored switcher state or command.
  Amended 2026-10-16 (DL-217, the Glass lane): static optics are prepared off the input path: a sheet's
  rim is baked in a worker from its size and place read after layout, and arrives a frame or more later.
  At idle after start-up, paused while the shared busy signal reports a cover or transition, after any
  input and while the page is hidden, Glass draws each kind of box once, nearly invisibly, so first-use
  GPU programs are compiled before the first page or chapter change rather than during it. A switcher
  strip defers its sync only under a look's cover and resyncs as the cover begins to lift.
  Amended 2026-10-17 (DL-222): Glass's warm-up is best effort under ACD-475 and changes no Glass look.
  The idle gates are ACD-475's, and a switcher strip waits only under a look's cover (amended 2026-10-17, review r1).
  Amended 2026-10-17 (DL-226): while a widget plate is carried on a board in Glass, the resting plates
  hold a pre-painted frost instead of live blur. At rest that frost looks the same.
  Amended 2026-10-17 (DL-228): Glass condenses into place only when Glass is switched on, never on a page, tab
  or room change, and moving items never turn opaque and then clear as they settle (DL-229: Jared's words
  are about Usage's tab changes, and the concept applies the rule on every page). Tab strip items, segmented choices and rail icons get no press bloom or flex: the lens moving
  to the pressed item is their press feedback. Settings' floating search results use the dense menu material,
  near opaque without live optics, so page words never read through them. The terminal Customize screen's
  choice rows take the travelling lens; the editor Customize screen's in-flow choices take the material in
  place, without a lens. Glass Transparency (general.visual.glass-transparency, SSYS-010) moves the panel,
  card and bar tints around the published look, which is its default .55: up to near opaque at 100 %, and down
  to the mode's floor, where the frost still keeps text at F3-654's floor; menus and dense surfaces keep their
  own tints, and without live optics the sheets are near opaque. The concept's pre-publication clarity slider
  is not a product control. What the rebuild honours of the 2026-10-16 Glass-lane amendment is its outcome:
  static optics are prepared off the input path, a sheet's rim is coherent on arrival (it may arrive a frame
  later, never wrong), and a first page, chapter or wallpaper change never stalls on first-use drawing work;
  the worker bake and the near-invisible warm draws are how the concept met it, lineage rather than
  requirements. Amended 2026-10-17 (DL-230, Jared): no requirement is set for how Glass reads when the
  operating system asks for reduced transparency or more contrast; the proposed static near-opaque form and
  near-opaque tints were withdrawn when Jared answered "Don't worry about it", and no Settings row is added.
gui_related: true
gui_classification_reason: Liquid Glass material and motion.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Glass Light draws its hover light beneath content, retains edge glow and preserves F3-654 text contrast
  during resting hover.
- Every named selector has one legible resting and moving lens, with immediate activation feedback and
  no chromatic tearing or duplicate highlight.
- Dense menus, moving sheets and wallpaper swaps preserve settled contrast and coherent material.
- All material and selection remain usable in Light, Dark, Reduced Motion and the static capability fallback.
- The specification does not assert that a source-only Glass landing published the look.
- Focused/unfocused standalone selections, inactive windows, press-origin feedback and unavailable steps
  obey the shared state rules in both motion modes.
- Entering Usage/Settings starts with one placed selector; subsequent tab changes, scrolling and wallpaper
  changes show no duplicate lens, chrome flash, lagging shadow or rebuilding edge.
- Every listed strip enters and re-enters with one correctly placed selection, keeps it while a title-bar
  menu is open, and clears competing markers.
- Both Customize screens use dense Glass material and keep scrolling lenses below the sticky section bar.
- In every look every tab, segment and list selection is the one switcher in that look's material (Basic
  tinted chip, Friendly mint plate, Retro reverse-video block, NieR ink bar, Glass lens unchanged); Retro
  steps and NieR cuts, never gliding; a pressed label changes ink with the chip; hovered resting labels keep
  4.5:1.
- Glass's warm-up is best effort under ACD-475 and changes no Glass look.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: liquid_glass_material_and_motion
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LATE-DECISIONS.md,
  SHA-256 126ae52840c8e5a30d2c1788b5427e6dc219cd2804d7cbd43f94d25aa0de2d07 (Jared decisions at lines 296
  and 306; not implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-glass-v3/README.md, SHA-256 0e424cba2f2d03932159b6e25977959f23d8f65cbcca57ca1d067b505f61db54
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-11-liquid-glass-v2/README.md, SHA-256 ed0f7ebed280627aba47197a0c8a9273bb4b17373f79cd3fcb6c0b44344f6fb9
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-427
- Plans/FinalGUISpec.md#F3-431
- Plans/FinalGUISpec.md#F3-653
- Plans/FinalGUISpec.md#F3-654
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--JARED-FEEDBACK.md,
  SHA-256 8fe51092727cd7d2a319228114448e4bf8ac42e673461aff6968ac46ecf53d5a (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--LANDING.md,
  SHA-256 4585c89ab98c4ee6c88f0683ac8d00244725047fe2637fe657371ec42cff17bd (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--liquid-glass--opus-5.5--CONTRACT.md,
  SHA-256 84a12b3c917ab557ae0478b2158be1146294900b1a10b5bacdc684cdcf11f74e (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-consistency-pass--NOTES.md,
  SHA-256 3065192be40e317876ab989ca939d0d016faeec1f8592628a3a2d1edfb5de5ae (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/aec2916c94--Concepts--onboarding--opus-5.5--src--css--60-switcher-looks.css,
  SHA-256 a8ac22dc61024049cc814dcddac1b06e4ffa46d351704cbed8affe000282756d (Q16 landed on main as aec2916c94;
  source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/pm-mail-1016075014-d904.txt, SHA-256
  c47ba9668ab4537387f255ce3c05384c84c114d4f27eb04a1572a1adf337dcf6 (Jared's 2026-10-16 stepped-motion
  ruling; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/aec2916c94--Concepts--liquid-glass--opus-5.5--src--glass.js,
  SHA-256 782352b2f604875dcb16ae6683a033b5a8bd0bbd0af39d3de70300b4dadc6593 (Q16 landed on main as
  aec2916c94, Retro's two-jump step and NieR's cut; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/554b3d3a65--Concepts--liquid-glass--opus-5.5--CONTRACT.md, SHA-256
  acd64cd195435ff1bb143d2dd00dab6f0cc7420a7dc8132ee8703f185ebab629 (Glass lane head 554b3d3a65, landed unchanged on main a0f844455c (L1), worker bakes and shader warm-up; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/e7f4a4fa8d-seg-plate-commit.txt, SHA-256
  e5d22ffe6fb3afab65144b8da3742d32adf0b7bfbcf3653d5288cf903b879128 (seg plate head e7f4a4fa8d, landed on main 2b5ed6092d (L2); source
  lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2b5ed6092d--Concepts--liquid-glass--opus-5.5--CONTRACT.md,
  SHA-256 eccaf9ec55718c72256e45a0b92575688f7305b6b79c1dd954868de05f095d24 (main 2b5ed6092d after L2, the
  seg plate and frost overlay; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/BRIEF.md,
  SHA-256 a6c5152164942a26cba5b0216a339578ee13c47a3ba39ffbeced793203c2dece (Glass warm-up changes no
  look; decision lineage)
preserved_exact_tokens:
- Liquid Glass
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
stale_retired_dispositions:
- 'Amended 2026-10-16 (PM7 pass 2): The combined Glass/wallpaper publication hold is closed by ad37be9a23;
  native implementation evidence is still required.'
- 'Amended 2026-10-16 (DL-214): the non-Glass consistency pass is adopted; it read: the non-Glass
  consistency pass remains a separate adoption decision.'
- 'Amended 2026-10-16 (DL-217): Settings'' segmented choices slide their chip; it read: Settings segmented
  choices use the material in place without a travelling lens.'
- 'Amended 2026-10-17 (DL-222): Glass warm-up is best effort. It read: first-use GPU programs are compiled
  before the first page or chapter change rather than during it.'
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-427, ContractName:Plans/FinalGUISpec.md#F3-431, ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/FinalGUISpec.md#F3-654

### F3-653 - One Wallpaper Gallery For Every Look

```yaml
plan_unit_id: F3-653
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Wallpaper is one Project choice for every look, not one stored choice per theme. Settings > App &
  Input > Theme & colors places its gallery immediately after Light or dark. Look's own comes first,
  followed by families in the shared catalog's order; thumbnails have names, checked state and full
  accessible names. It is one radiogroup whose one tab stop is the chosen tile: Left and Right move through
  every tile, Up and Down move to the nearest tile in the next row as drawn, Home and End reach the ends,
  and the arrows choose as they move (selection follows focus); Space or Enter also chooses. The tile an
  arrow reaches becomes the checked choice and is written through the same transaction as a pointer pick,
  the most recent accepted change winning (SSYS-054); preparation of its print begins after the next frame
  and a short pause after the last arrow step (the concept's 160 ms), so tiles passed over are not
  prepared. Pointer and keyboard write the same value. Amended 2026-10-17 (DL-230, Jared): arrows choose
  as they move; this replaces the earlier proposal that arrows only move and Space selects.
  Five columns reduce to two where needed,
  with the look's control corners and no animated tiles. Basic offers Blueprint, Contour, Folds,
  Sheets and Arcs; Friendly offers Dot Wave, Channels, Bubbles, Hills and Soft Stripes, each with
  its dot pattern; Retro offers Horizon, Peaks, Circuit, Dither and Stars; Jared withdrew NieR’s
  Archive, Signal, Fragments, Hatch and Flora on 2026-10-14. The approved replacement family is the
  NieR customizer’s six ink scenes: city (City Ruins), bunker (The Bunker), desert (Desert), forest
  (Forest Castle), park (Amusement Park) and flooded (Flooded City), selectable from every look.
  None becomes a family default. Their Dark and Light prints and thumbnails are packaged from the
  same six scene drawings; Plans/wallpaper_catalog.json names all 29 admitted wallpapers. The six
  scenes retain no family default. Glass's catalog includes Ribbons, Prism, Orbs, Aurora, Dunes,
  Bloom, Pool and Facets. Every item has a Dark and Light print selected by effective mode and every
  item is selectable in every look. Look's own means Ribbons in Glass and the existing ground in
  Basic, Friendly and Retro; in NieR it restores the selected ink-scene background. An explicit
  gallery choice replaces the currently displayed background without erasing the NieR background
  preference. Jared’s same-day follow-up requires the most recent accepted change to win from either
  control: selecting a gallery wallpaper sets general.visual.wallpaper; selecting a NieR background
  resets that shared choice to look so the chosen NieR scene shows. A committed choice of Follow the
  page or Parchment is a NieR background change and resets the shared wallpaper the same way. A preview
  does not. SSYS-054 owns the one-writer
  transaction; SP-333 owns persistence. Wallpapers show around opaque panels in the other looks;
  Usage and Settings Home may use the approved light veil. Glass optics derive from the same chosen
  print and change with it: a wallpaper change crossfades the old print and its full frost into the
  new print and its frost together, never switching the frost once partway through or showing a
  print under another print's frost (Jared, 2026-10-16, DL-216). The gallery's final space is present in Settings' first
  frame; thumbnail loading never displaces following rows. Missing/stale stored catalog ids display
  Look's own with a clear fallback, never a broken image. The Project's committed wallpaper applies
  with its look before first paint. Prints and thumbnails are shared packaged assets, not
  per-surface embedded copies. SSYS-054 owns the setting and SP-333 its storage boundary; DR-073
  owns catalog reuse. W1 through W4 remain approved except for the withdrawn NieR print set; W5
  retired Mesh/Depth/Minimal at the combined Glass/wallpaper publication on 2026-10-15; those
  choices are compatibility lineage only. Friendly's content ground extends its dot pattern through
  Settings, Usage, rail panels and the chat transcript, moving with content rather than as a second
  fixed overlay.
  Amended 2026-10-16 (DL-217, the frost crossfade lane): every shown frosted sheet crossfades its frost
  from the old print to the new one in step with the print's fade, under the sheet's content; under
  Reduced Motion, on a look change and without a GPU the print and its frost swap at once.
  Amended 2026-10-17 (DL-223): Jared's later choice, option (c), "fade is fine" (2026-10-16), replaces
  the together-only crossfade when the new frost is not ready. A prepared pick still fades the print and
  its frost together in one step. A pick whose frost is not ready starts the print's fade as soon as the
  print is decoded; the sheets keep the old frost during that fade, then crossfade to the new frost once
  it is ready. No frame is blank. While that fade has not committed, a newer choice fades from the print
  currently fading. A look or mode change that changes the print ends it at once; one that keeps the same
  print lets it finish. Reduced Motion, a print change that a look change causes, and no GPU keep the immediate swap (amended 2026-10-17, review r1). The setting
  still writes at the pick (SSYS-009, SSYS-054); only the frost drawing lags. Consumers of the selected
  print, the terminal Lens included, follow when the frost commits (DR-073).
  Amended 2026-10-17 (DL-228): Look's own carries a one-line note saying what the current look shows ("<Look>
  shows <default> until you choose another." or "<Look> keeps its own background until you choose one."), and
  a chosen wallpaper's note says it shows in every look, in its light or dark print, Home and Usage showing
  the most of it; Look's own's thumbnail is the look's default print or a picture of its own ground. Each tile
  shows its description in its hover tag, and its accessible name adds its family. The row shows Settings'
  Changed mark while a wallpaper is chosen, and choosing Look's own clears it. A NieR scene chosen here looks
  exactly as NieR Mode's own background draws it, faint ink on parchment with the paper fade at the top, and
  its thumbnail is drawn in full ink, like the customizer's tiles.
gui_related: true
gui_classification_reason: One wallpaper gallery for every look.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every catalog wallpaper works in every look and both modes; Look's own restores the correct default
  and NieR preference.
- Keyboard selection, reload, Project switching and unknown stored ids preserve the one-setting contract.
- Each arrow step checks and writes the tile it reaches as a pointer pick would; preparation waits for the
  next frame and the short pause after the last step, so a tile passed over is never prepared (DL-230).
- Gallery loading never shifts a reader's anchor. A prepared wallpaper change fades print and frost
  together. A pick whose frost is not ready fades the print first under the old frost, then crossfades
  the frost, and never shows a blank frame.
- Reduced Motion, a look change and no GPU swap print and frost at once. A newer choice during an
  uncommitted fade starts from the print currently fading.
- The five withdrawn prints are not offered; the six packaged replacement scenes and both selection orders
  follow SSYS-054. Concept publication is complete; native asset/rendering verification remains required.
- All 29 catalog ids have packaged Dark/Light assets, including the six NieR scenes, and no withdrawn
  print or Mesh/Depth/Minimal choice is offered.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: one_wallpaper_gallery_for_every_look
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-11-liquid-glass-v2/README.md, SHA-256 ed0f7ebed280627aba47197a0c8a9273bb4b17373f79cd3fcb6c0b44344f6fb9
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/Settings_System.md#SSYS-054
- Plans/storage-plan.md#SP-333
- Plans/DRY_Rules.md#DR-073
- Plans/FinalGUISpec.md#F3-652
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/NIER-WALLPAPER-DECISION-20261014.md,
  SHA-256 56a7389f1fa9e6f6e0535f09525945f590b6ef44dfd8f72d1f3c844a7e21b816 (decision/source lineage; not
  native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/NIER-WALLPAPER-CONTRACT-201d602f7d.md,
  SHA-256 6550b3e5d31dbeca5e9d5cf11f7c06db13f37e189da270ac25e6504a5ec4a3da (decision/source lineage; publication
  remains held where specified)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--LANDING.md,
  SHA-256 4585c89ab98c4ee6c88f0683ac8d00244725047fe2637fe657371ec42cff17bd (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--wallpapers--opus-5.5--CONTRACT.md,
  SHA-256 6550b3e5d31dbeca5e9d5cf11f7c06db13f37e189da270ac25e6504a5ec4a3da (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-p1000-decision--JARED-DECISIONS.md,
  SHA-256 a1dedd6e70bfa51ec0b07c34a86bfa65583439b18ff4ace266c4fe9e2a0aa3a6 (Jared's decisions of
  2026-10-16 ~12:10Z; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-frost-crossfade--NOTES.md,
  SHA-256 a90acd28ecc0d3930fa26091b69a55ff3f484a78c150a501a4784c388b3e7d2f (frost crossfade lane
  10ba7d6427 with seam c17316f6cf, landed on main 2b5ed6092d (L2); source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2b5ed6092d--Concepts--liquid-glass--opus-5.5--CONTRACT.md,
  SHA-256 eccaf9ec55718c72256e45a0b92575688f7305b6b79c1dd954868de05f095d24 (main 2b5ed6092d after L2, the
  frost crossfade; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-motion-fixes/pm7-liquid-glass/F6-NOTES.md,
  SHA-256 86b0f12a17d3eab6becf2410e1c5950a6c619066c8a6d683ba57328a9fef7899 (Jared approved option (c),
  fade is fine, 2026-10-16; decision lineage)
preserved_exact_tokens:
- Look's own
- Ribbons
- fade is fine
negative_constraints: []
stale_retired_dispositions:
- 'Amended 2026-10-16 (DL-216): a wallpaper change crossfades print and frost together; it read: Glass
  optics swap in the same painted frame.'
- 'Amended 2026-10-17 (DL-223): a pick whose frost is not ready may fade the print first, under the old
  frost, then crossfade the frost. It read: never showing a print under another print''s frost, and
  crossfading print and frost together in every case.'
owner_hints:
- Plans/FinalGUISpec.md

```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-054, ContractName:Plans/storage-plan.md#SP-333, ContractName:Plans/DRY_Rules.md#DR-073, ContractName:Plans/FinalGUISpec.md#F3-652

### F3-654 - Settled Text Contrast

```yaml
plan_unit_id: F3-654
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every enabled settled interface text state, at any size, reads at least 4.5:1 against the actual
  composited background. Placeholder text, captions, hints, secondary text, editor token colors,
  selected states and a pointer resting on a hovered control all count; a resting hover is not an
  animation exemption. Disabled controls are exempt from 4.5:1 but their text remains legible at at
  least 3:1 against its actual background; their disabled state and reason remain accessible. A
  scheme thumbnail is illustrative imagery, exempt from the text floor, only when hidden from
  assistive technology and accompanied by its scheme name label at at least 4.5:1; it cannot replace
  readable control labels or convey necessary text available nowhere else. The terminal's Minimum
  Text Contrast choice governs program output only, defaulting to 4.5:1 and permitting the user's
  lower choice under F3-642. Terminal chrome, hints, labels and Customize controls retain the
  interface floor. Editor token colors retain F3-651's selected floor. A brief transition under 0.4
  s is recorded with its duration and frames rather than failed solely for an intermediate
  contrast/overlap reading; an incorrect end state, a longer transition or a looping low-contrast
  resting state still fails. Tests use the worst background beneath the glyph, including wallpaper,
  transparency, hover tint and glow, rather than comparing text to a nominal surface token. Color
  and semantic marks retain their applicable non-text contrast and redundant shape/name
  requirements. This is the shared contrast interpretation consumed by acceptance checks, not
  permission to conceal controls or omit hard-to-measure looks. The contrast landing's dimmed
  Projects background is the bounded modal-scrim interpretation: Search projects beneath the inert
  New Project sheet is not an enabled interactive text state while covered. Its observed 2.95/1.95
  readings do not relax this floor for the active sheet or for the page when the sheet closes. A
  dimmed background must not retain interactive focus or conceal a required enabled control. The
  reported five Glass Light Details words at 4.01–4.48 and unresolved editor-description findings
  remain failures against the settled floor, not new exemptions.
  Amended 2026-10-17 (DL-228): where a state's hue cannot reach 4.5:1 for its word without coming too close to
  the body text to read as that state (Glass Light's failure red over its darkest backdrop reads 3.9 to 4.3:1
  in the concept), the word is drawn in the text ink at full contrast and the glyph carries the hue at its 3:1
  non-text floor; the floor is not relaxed.
gui_related: true
gui_classification_reason: Settled text contrast.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Contrast is measured in all ten looks with normal and Reduced Motion at rest, selection and resting hover,
  including placeholders.
- Under-0.4-second intermediate states are recorded separately; disabled text is separately tested at 3:1, never
  counted as passing enabled text.
- A translucent or dimmed enabled label is tested against its actual worst background.
- Program-output Off and 3:1 choices never lower interface contrast; scheme thumbnails qualify as imagery only
  with hidden decorative content and a readable scheme-name label.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: settled_text_contrast
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-648
- Plans/Automated_Testing_System.md#ATS-077
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/ASSIGNMENT-CONTRAST.md, SHA-256 ce5acb947b15065d1193ca5eff1f43a9f1bc82ad7e8f3a230f7377fb18504044
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/CONTRAST-CLARIFICATION-20261014.md, SHA-256
  1c5654b46b6ed160a34466c9df083681cc179815b658c0acce593698680b8493 (decision/source lineage; not native
  implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-contrast-round--LANDING.md,
  SHA-256 bd74e229ad94e1530936561b5c237b0d92c16498eb5b496a3d976c86ed9b53fa (source lineage; not native
  certification)
preserved_exact_tokens:
- 4.5:1
- 0.4 s
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md

```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-648, ContractName:Plans/Automated_Testing_System.md#ATS-077

### F3-655 - Planning Wizard And Orchestrator Match The Look

```yaml
plan_unit_id: F3-655
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Planning Wizard and Orchestrator receive minor fixes and theme matching while their full
  redesign remains deferred. Their layout, planning/execution owners and flows are not replaced.
  Statuses are a mark and word, facts a small square and words, and counts plain numbers under
  F3-648. Work types use joined cells with a filled choice; answers remain the approved stacked
  reply rows in one box. Friendly widgets keep the white Light and plum Dark plates shared by Home
  and Usage. Chosen views fill their own boxes, stronger than hover, using the neutral family
  selection grammar; the title-bar Light/Dark/Auto menu follows the family selection grammar, with
  the later Glass lens and rim treatment owned by F3-652, Retro reverse video and NieR ink. Primary
  actions and complete text remain readable; placeholders stay inside rows and inputs do not clip
  their hints. Reduced Motion removes moving, popping and blinking treatments. LIVE pulses only
  while the run is running. Liquid Glass columns are sheets with inner-card fills, and Orchestrator
  title, plan picker and tabs share an aligned header sheet under F3-652. OP-033 owns explicit retry
  confirmation and OP-037 owns current/historical scope truth; choosing a page or scope must not
  open a retry confirmation or fabricate a historical banner. Jared's three answers retain the
  Friendly plates, retain the answer rows and adopt the neutral mode-menu selection. Its joined
  work-type and view choices consume F3-438's shared no-wrap selector grammar. A Wizard stage
  handover retains readable stage content through the transition: the outgoing stage is inert
  beneath the incoming stage until it leaves, and it cannot accept a click or focus meant for the
  new stage. The incoming entrance keeps its own clock. Rapid reversal, navigation away and back,
  guided-practice start/removal and narrow scrolling leave one live stage, no stale inert layer, and
  current answers on return to PRD. This is continuity of the existing flow, not a new Wizard stage
  or transition-time performance guarantee. F3-637 owns the landed 6 px Glass inset for the
  Orchestrator header and board; it changes no planning flow.
gui_related: true
gui_classification_reason: Planning Wizard and Orchestrator match the look.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All ten looks render the two pages with readable actions, no pill labels and a chosen state stronger
  than hover.
- Opening Orchestrator or changing scope does not open retry confirmation; paused runs have no LIVE pulse.
- All three recorded answers are preserved without a full page redesign.
- Every stage change, rapid reversal and exit clears the retained outgoing stage; narrow views scroll
  the active stage, and edits remain current on PRD return.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: planning_wizard_and_orchestrator_match_the_look
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-wizard-orch-theme/NOTES.md, SHA-256 ca7f206e6b92440d26972e4eb4113348722fb45245ba8429dad46633b56b49b8
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/Planning_Wizard.md#PWIZ-021
- Plans/Orchestrator_Page.md#OP-033
- Plans/Orchestrator_Page.md#OP-037
- Plans/FinalGUISpec.md#F3-648
- Plans/FinalGUISpec.md#F3-652
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-mech-fixes--wizard-stage-blank--ROUND2.md,
  SHA-256 7360f8f9058c19824fc4be64fd2d255c458e2211356869f4fc9dead33e8b2bad (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-mech-fixes--wizard-stage-blank--LANDING.md,
  SHA-256 c95281d78ea2d46661242f40b0d1f0b3a6250f1e0fa409b472edeccd927cf679 (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
stale_retired_dispositions:
- 'Amended 2026-10-16 (PM7 pass 2): The older neutral-mode-menu answer remains source lineage; the later
  published Glass selection material is owned by F3-652.'
```

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-021, ContractName:Plans/Orchestrator_Page.md#OP-033, ContractName:Plans/Orchestrator_Page.md#OP-037, ContractName:Plans/FinalGUISpec.md#F3-648, ContractName:Plans/FinalGUISpec.md#F3-652

### F3-656 - Onboarding Art And Glass Controls

```yaml
plan_unit_id: F3-656
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Onboarding's art has connected bodies, limbs, joints and strings through the whole motion, not merely a
  correct resting pose. Basic draws the joints; Friendly uses felt/paper puppets with two-part sleeves and legs
  connected to their shoes; Glass uses ball-jointed crystal marionettes with light through the limbs, layered
  Ribbons-like waves, a glass stage and lens droplets. Waving bends at the elbow and strings remain attached to
  their hooks. Glass captions sit on a shelf of light without capsule boxes, signs are cut-glass plates, and
  Friendly captions are stitched paper cards and squiggles. Jared chose GLY-4 option B on 2026-10-14:
  onboarding scenes keep their own drawings in each look's material; the scenes do not adopt the neon
  interface-icon shapes. Onboarding controls continue to consume F3-658's shared set. The project-name field
  is a large nameplate with centered words and a reserved hint line so typing never shifts the layout. Glass
  main actions, choice rows, step selector, switch, tour bar and callouts consume F3-652. Guided example and
  Teacher tags in practice chat are a small square and plain words on their own line. The chosen onboarding look
  remains in force during Create Project and checks, with no temporary reset of the app's theme; PWIZ-021's
  draft/commit boundary is unchanged. All art captions and Ready states consume F3-654. Motion respects the
  existing skip/end-state and Reduced Motion contracts; connected geometry and meaningful end states remain.
  This amends the presentation of F3-520, F3-521 and F3-600 without adding onboarding commands, steps
  or approval flows.
gui_related: true
gui_classification_reason: Onboarding art and Glass controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Scene drawings retain their own shapes and per-look material under GLY-4 option B; interface controls retain the shared glyph set.
- Every animated and still pose keeps limbs and strings connected in all looks and both motion modes.
- Name/hint geometry stays stable while typing; Guided example and Teacher are plain labels.
- Create Project never paints a different look, and settled captions/Ready text meet F3-654.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: onboarding_art_and_glass_controls
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- "/mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LATE-DECISIONS.md, SHA-256 126ae52840c8e5a30d2c1788b5427e6dc219cd2804d7cbd43f94d25aa0de2d07 (Jared decisions at lines 296 and 306; not implementation evidence)"
- /mnt/Cursor/share/puppet-master/2026-10-13-onboarding-art-glass/README.md, SHA-256 ce5e5e90df41f180e54b89e4fb3fe0087164039728a902aa481cbcc3adacb088
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-11-onboarding-no-pills/README.md, SHA-256 1ab0aedc5910ab03097439cf9cd48da77eb7cefad458ca705a556727d327fd1a
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-520
- Plans/FinalGUISpec.md#F3-521
- Plans/FinalGUISpec.md#F3-600
- Plans/Planning_Wizard.md#PWIZ-021
- Plans/FinalGUISpec.md#F3-654
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-520, ContractName:Plans/FinalGUISpec.md#F3-521, ContractName:Plans/FinalGUISpec.md#F3-600, ContractName:Plans/Planning_Wizard.md#PWIZ-021, ContractName:Plans/FinalGUISpec.md#F3-654

### F3-657 - Resize Feedback On Every Divider

```yaml
plan_unit_id: F3-657
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every resizer shares one feedback grammar: panel dividers in both directions, panel/chat and panel/rail edges
  and the browser DevTools split. Near a bar a faint glint invites then relaxes; on it a weighted light follows
  the pointer and stretches with speed; pressing catches it and lights the whole held bar; fast motion warms it
  and leaves a short wake; pushing a minimum-size limit strains the mark; release drains to the release point
  and settles once. Focus places the mark at the middle and each keyboard resize step settles it. Basic is a
  precise fine rod and endpoint ticks; Friendly a mint bead over swelling dots with bubbles and a settling ring;
  Glass neutral white light caught on both facing panel edges, with dark refraction beside the Light highlight
  and no color splitting or extra bar blur; Retro a cell-stepped cursor and phosphor persistence, ink/dither in
  Light; NieR an ink ruler, gated square/brackets and stepped ticks with no glow. Reduced Motion keeps calm
  appearance/disappearance and held/released state, without spring, streak, trail, blink or bounce; NieR snaps
  to its end state. The light tracks the actual resize lifecycle even if the bar's owner captures input
  elsewhere. It never changes the resize command, minimum or transaction, and does no animation work when idle
  away from a bar. This replaces the older unrelated per-divider hover line and first-pass blob/release-sparks
  treatment.
gui_related: true
gui_classification_reason: Resize feedback on every divider.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All five bar classes show hover, grab, held, limit and release feedback in all ten looks and both motion modes,
  including the chat edge.
- Keyboard steps and cancellation leave correct state, and idle bars do no animation work.
- Glass and NieR obey their material constraints; feedback never changes geometry or command counts.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: resize_feedback_on_every_divider
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-resize-glow/NOTES.md, SHA-256 0a20256d730c5b51cda138b14845a5dc2e7dfdda04385a3956721a73fb657c16
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/DND-NOTES-20261014-FOLLOWUP.md, SHA-256 b5b883caeef6d774fbca250e5c7b6c82dd31eee05af8da207727179baa21b5c3
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-630
- Plans/FinalGUISpec.md#F3-652
- Plans/UI_Wiring_Rules.md#UIW-012
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-652, ContractName:Plans/UI_Wiring_Rules.md#UIW-012

### F3-658 - Shared Glyph Vocabulary And Presentation

```yaml
plan_unit_id: F3-658
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The chat's neon/tube glyph language is the default shared set for the rail, Settings, Usage, chat,
  panel and terminal tabs, notifications and onboarding controls (D44, GLY-0 through GLY-3).
  Plans/glyph_catalog.json owns the status keys, meanings, tones and mappings; object/control/panel
  glyphs use the same shared catalog grammar and no surface draws a competing icon for the same
  meaning. Planning Wizard and Orchestrator may consume the catalog but this approval does not
  require their full glyph adoption or redesign. Warning is the triangle; failed is a ring with a
  cross everywhere. The rail's solid badges become these shared tube marks. Changed is violet in
  every look, NieR excepted: NieR keeps its near-monochrome ink tones, told apart by shape (GLY-2 option A, D44); the
  concept's Retro Light magenta for changed is not adopted (amended 2026-10-17, DL-228). Status glyph inks preserve each look's hue, moving lightness to meet at least 3:1
  against their actual composited field in all ten looks; labels remain text governed by F3-654.
  Shape plus the accessible state name carries meaning without color. Working, reviewing, needs-you,
  dependency-wait, idle, complete, blocked, failed, paused, recovering, queued, skipped and mixed
  keep the shared semantics; warning, offline, off, info and five file-change marks complete the
  vocabulary. Off is the power symbol for disabled/not configured, never the blocked mark;
  file-change marks describe changes, not execution state. Domains keep their status words and
  resolution authority and map them to the shared presentation. A busy tab uses working; competing
  tab marks rank waiting, failed, agent driving (the agent holds the keyboard), agent paused (an agent is at this
  terminal but a person took over: the hollow agent-cursor mark), working, info (amended 2026-10-17, DL-228; it read:
  agent at the keyboard), preserving
  the other states in the accessible description. The terminal agent cursor is a spark and cursor
  cell, solid while the agent types and hollow when a person takes over; terminal command marks use
  shared status marks. Glyph hover ignition follows F3-465's existing card/row/control target, with
  stepped NieR and Retro phosphor power-on, never another hover engine. Reduced Motion keeps a
  still, lit, recognizable end state. Onboarding scene illustrations are outside this
  interface-glyph vocabulary: F3-656 owns Jared's separate GLY-4 option B decision. F3-631 owns the
  tab mark's visibility and clearing lifecycle. Its working mark is still, with one act at start and
  completion rather than a continuous busy loop; a dashboard Live mark is still between beats and
  acts once for a live beat. The priority and full accessible description above remain
  authoritative. Flat dense card tools use the same glyph shapes without a halo; calm status
  presentations do not replay a mount act. Publication status is separate from this approved
  vocabulary: the 2026-10-15 rollout covers chat, rail, Usage, notification and onboarding adoption;
  Home panel/tab/terminal and Settings content-icon adoption remain deferred. F3-656 continues to
  own scene illustrations.
  Amended 2026-10-17 (DL-228): F3-584's anatomy, roles, acts, size gate, tones, per-look voices and Reduced
  Motion rule govern every consumer of this vocabulary, not only the chat, with these rules applied
  everywhere: colour is for status only, so concept and control glyphs take the host's ink; needs-you is the
  loudest loop and no new loop out-moves it; file-change marks never glow like alarms; NieR draws ink with
  square caps and no glow; a glyph on an inverted fill (Retro reverse video, NieR's ink bar or cursor) takes
  the fill's paper ink. Status marks are lit and still in lists, rails, Settings rows, toasts and Usage, with
  one act when they appear or change (none on Usage, whose room entrance owns arrival); only live states
  (working's bead, needs-you) keep moving, and the chat's placements keep F3-585. Position markers (the rail's
  current item, the current step in onboarding and backup lists, tour pips) are not states: they never take a
  status mark and use the ring-dot marker, earlier steps reading complete and later ones pending. A secret
  prompt's row shows the key concept glyph, since the lock is blocked's drawing. Usage card-head tools light
  only on their own hover, never with the card's. The terminal family: running is working, exit 0 complete,
  exit N failed, a prompt awaiting input idle, and exit 130 or a command that ended with the earlier session
  skipped; an agent-typed command keeps its 12 px state mark with the 8 px agent seat beside it; gutter marks
  take the scheme's inks and hold 3:1 on every scheme; a mark acts once at its change, never on scroll
  (F3-641). The deferred Home adoption follows these panels-family rules: find toggles (match case, whole
  word, regular expression, wrap) are glyphs, and a pressed toggle keeps its lit state; a breakpoint keeps one
  shape, enabled in the blocked tone, disabled paused and unverified idle; a Debug Console session shows
  running working, paused paused, ended complete, and failed or skipped when stopped, never idle; hovering a
  tab plays only its kind glyph, never its state mark. The glyph artwork's source of truth is the concept's
  two registries (the chat's neon icons and the shared PMG registry), ported once; the concept's neon grammar
  (its stroke-weight ladder by size, its two-moving-part cap and its travel minimums) is the drawing
  reference; fitted inks are re-derived per look by the 3:1 rule above, the concept's fitted values being
  reference only.
  Amended 2026-10-17 (DL-228): where one semantic name in Plans/glyph_catalog.json maps to two glyphs, each
  mapping row names the surfaces it serves (the panels' browser tab is the globe, Settings' browser row the
  browser window); a status meaning always maps to its status glyph, so failed is st-failed and a card's
  waiting is st-waiting, never the close or terminal glyph.
gui_related: true
gui_classification_reason: Shared glyph vocabulary and presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All consumers use the same shape for the same state; warning and failed are distinct in grayscale.
- Every status mark meets 3:1 in all ten looks; its label meets F3-654.
- Tab priority, agent cursor, hover and Reduced Motion preserve state names and domain authority.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: shared_glyph_vocabulary_and_presentation
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LATE-DECISIONS.md,
  SHA-256 126ae52840c8e5a30d2c1788b5427e6dc219cd2804d7cbd43f94d25aa0de2d07 (Jared decisions at lines 296
  and 306; not implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-10-glyph-catalog-addendum/README.md, SHA-256 3d0497f01c878e8aa6f99fa8f602b9b3dbf887aead2a24d62c12969bd47a1d31
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-585
- Plans/FinalGUISpec.md#F3-619
- Plans/FinalGUISpec.md#F3-465
- Plans/FinalGUISpec.md#F3-654
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-glyph-rollout-landing--LANDING.md,
  SHA-256 9bd8e1ed3deb6d61e516a42f0f524a36639ee098f7ce7496cb50434c9ca4ce90 (source lineage; not native
  certification)
preserved_exact_tokens:
- GLY-4
negative_constraints: []
owner_hints:
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/FinalGUISpec.md#F3-619, ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/FinalGUISpec.md#F3-654
