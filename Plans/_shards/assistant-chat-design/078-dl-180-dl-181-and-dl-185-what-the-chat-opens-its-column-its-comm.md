# Shard 078: DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)

Source: `Plans/assistant-chat-design.md`

Source lines: L27370-L27721

Source SHA256: `6f2d9606bc3bf1588c9eeae93a990485dff0e5e590c57bc1d4ff4b7f6cfcedac`

---

## DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)

This addendum carries the universal panels redesign into this owner (`Plans/Decision_Log.md#DL-180`, `#DL-181`, `#DL-185`). The chat no longer brings a workspace of its own: everything it opens lands in the home centre through the one opening module (`Plans/FinalGUISpec.md#F3-634`), its column is the fixed column of `Plans/FinalGUISpec.md#F3-637`, its inline "Shell" box becomes a compact command card, and its terminal cards hand off to terminal tabs. ACD-500 owns what the chat opens where, the chat column as this document reads it, the command card and how Teacher explains commands; ACD-501 owns what the 5.6 Pro chat has to meet when it is ported; ACD-502 re-homes the chat's terminal cards. They supersede the "left editor/document tab system" and the Return to chat control of ACD-455 and v3 item 15 for Home, the "beside the chat" placement of ACD-480 and ACD-485, the 360 px chat minimum of ACD-458 and v3 item 19, the chat's Goal tab, the terminal card's Detach/Pop-Out (ACD-128) and ACD-211's editor-stack mirroring. ACD-039, ACD-041, ACD-077, ACD-108, ACD-127, ACD-128, ACD-131, ACD-132, ACD-134 to ACD-142, ACD-145, ACD-207, ACD-210, ACD-214, ACD-416, ACD-443, ACD-444, ACD-448, ACD-453, ACD-455, ACD-458, ACD-474, ACD-480 and ACD-485 are amended in place, ACD-211 is superseded, and section 13.1's command card row, sections 13.3 and 22, the thread identity model, the PM7 floating-mount clarification and v3 items 15 and 19 carry dated notes. The 5.6 Pro concept, the panels concept and the terminal concept are source lineage only.

### ACD-500 - What The Chat Opens Where, Its Column, Its Command Card And Teacher's Command Explanations

```yaml
plan_unit_id: ACD-500
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Everything the chat and its wizards open lands in the home centre through the one opening module
  (Plans/FinalGUISpec.md#F3-634, Plans/DRY_Rules.md#DR-071); the chat keeps no placement or dedupe rule of its own
  (DL-180, D7, D8). Files open by F3-634's file rules from every place a person clicks one in the chat: a file name
  or path in a message or card, a diff view, a Changes row of Activity Detail, a transcript file record, and a Read:
  or Edited: entry of the files-touched strip. A single click opens the panel's one preview tab, with an italic label,
  which the next single click replaces; a double click, an edit or dragging the tab keeps it; a file already open
  anywhere is revealed where it is, never opened twice; Alt+click opens it in a new panel. A diff opens the editor in
  its diff mode at the file and line it names, never a diff drawn by the chat. Everything else the user clicks in the
  chat opens and takes focus, each as its tab kind (F3-635): a plan revision, a Deep Plan document or its discovery
  rounds as a plan tab (ACD-455); a collaboration run view and its evidence as a run tab (ACD-480); a subagent's or a
  helper's history as a transcript tab (ACD-485); the thread's More Details as that thread's context tab, one per
  thread (ACD-448); a fetched page or a link as a browser tab; a search, MCP, app-inspector or work record as a record
  tab; the rules list, Gist Review, a revert's files, a debug investigation, a lens source and Wonderer results as
  document tabs; an artifact card's Open, an attachment's Open and an artifact embedded in a plan as the artifact
  viewer tab (Plans/Runtime_Artifacts_Panel.md#RAP-065), or the editor for a file; a Mermaid diagram card's Open
  in editor as an editor buffer tab holding the diagram's source, and its Open detached preview as the artifact
  viewer tab showing the rendered diagram, never a separate window (section 28); a command's session as its
  terminal tab (ACD-502). Each open dispatches the route Plans/UI_Command_Catalog.md#UCC-200 lists for the thing
  opened, with the placement fields of Plans/Contracts_V0.md#CV-360. What an agent opens by itself, for example a
  Deep Plan document it wrote (ACD-041) or a terminal it started (ACD-502), lands as a background tab with the hollow
  square and a polite announcement, never takes keyboard focus and never changes the active tab of a panel the user
  is typing in; files an agent opens open kept, and terminals, browsers, dashboards and the tool tabs go where
  F3-634's kind affinity puts them. These stay out of the panels: Activity Detail stays inside the chat (D3,
  F3-637, v3 item 2); the wand's setup sheets, the debug-target prompt and the thread dialogs are app modals in the one overlay
  root (Plans/DRY_Rules.md#DR-067); Plan Export and PDF are a download or a print window; Send to Planning Wizard goes
  to the Planning Wizard page; an attachment's More Info stays a popover. The chat's Goal tab is gone (DL-147): View
  goal shows the Goal panel of Activity Detail. The concept's lab-only workspaces open nowhere (ACD-474). The 5.6 Pro
  chat's contract with its editor pane maps onto the module this way. Open or focus by a stable identity is the
  module's one id, one tab rule: the chat names the thing by its domain identity (a plan revision, a run, a child
  run's thread, a thread's context, a file path, an artifact and its version, a terminal session), the tab kind
  derives the tab id, and aliases resolve to one tab, so a plan's query form and its plan id open one tab. The chat
  supplies the label of a tab whose body it draws and may change it. It draws into a body the host owns and redraws
  it when asked; the host owns the strip, the panel and the placement (F3-635's host contract). Closing is
  cmd.panel_tab.close (cmd.editor.close_tab is its alias), and the host tells the chat when a tab it draws has
  closed, so a run card gets its controls back. The host tells the chat which tab is active in each panel, so
  Plans/FinalGUISpec.md#F3-569's run-card rule holds while a run tab is active. Narrow reveal is F3-634's narrow rule
  and Plans/FinalGUISpec.md#F3-636's panel switcher. The chat is never a tab. Return to chat retires for Home: no tab
  ever covers the chat, and when the chat has folded to its narrow edge strip that strip opens it again (F3-636). The
  chat column is F3-637's: fixed on the right from the title bar to the status bar, never a tab, never in the split
  tree and never moved inside the window; Pop out in the desktop app is its only way to move and Dock back returns it to its column; the web client offers no Pop out and the chat stays in its column (F3-637)
  (Plans/UI_Command_Catalog.md#UCC-203). Showing and hiding the chat are F3-637's (cmd.panel.switch with chat,
  UCC-203). Its default width, drag range, the limit that keeps the centre wide enough,
  how it eases and folds in narrow windows, and the setting Keep the chat open in narrow windows are F3-637's and
  F3-636's; they replace every chat minimum this document stated (ACD-458, ACD-480, v3 item 19). The chat sizes itself
  by its own column, never by the window (ACD-501). The History list is the 5.6 Pro chat's and the only thread-history
  list (ACD-444's Chats rail goes when the chat is ported). It opens as a flyout over the chat by default; pinning it
  widens the column by the list's own width instead of narrowing the messages. The pin is kept in the chat column state
  of the home layout record (Plans/storage-plan.md#SP-330), and the setting general.interaction.chat-history-list
  (Plans/Settings_System.md#SSYS-050) gives only its starting value where no choice is saved. Activity Detail stays
  inside the chat (F3-637, ACD-453, v3 item 2), never a panel tab. The 5.6 Pro chat's inline Shell box is replaced by a compact
  command card (D27). It shows the command, the folder it ran in, its status as a glyph and words (Running, Exit 0,
  Exit <code>, Failed when a failed command has no exit code, Interrupted, Needs input, Ended with the earlier session), so the exit code is part of the status, how long it ran (counting while it
  runs), the last lines of its output as plain text with the number of earlier lines (ACD-126's 5-line collapsed and
  15-line expanded preview; expanded also shows the whole command and folder), and who ran it: You, or the agent by
  name, from the command record's by (Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-183). Its states
  read the command card states of ACD-146 and are never a second lifecycle: running for starting, running and
  restoring while the restore is under way; ok for exited with exit code 0; failed for failed and exited with any
  other code; interrupted for terminated; waiting for attention_required; ended for disconnected before the command
  finished and for a restore that did not bring its session back. Ended is honest about what is not known: a command
  whose session ended while it still ran (the page reloaded, the app restarted or its session disconnected) is
  neither done nor failed, so the card shows the words Ended with the earlier session, with no exit code, never Running, Exit 0 or Failed, as the
  terminal's own command mark does (SMPFS-180's indeterminate finalisation, Plans/FinalGUISpec.md#F3-641). Its actions are text buttons: Open in Terminal, only
  while the command has a terminal session, opens or reveals that session's terminal tab through F3-634 (ACD-502);
  Rerun in Terminal once the command has stopped (ACD-108, ACD-502); View output when there is no session (ACD-129).
  View output, and View output log in the card's menu, open the command's retained output as an editor buffer tab:
  read-only, kept and never a preview, titled with its command line, opened and taking focus through F3-634 by
  cmd.panel_tab.open with an editor buffer spec, the same tab the terminal's Open output in an editor tab opens
  (Plans/FinalGUISpec.md#F3-641, Plans/UI_Command_Catalog.md#UCC-201). The chat never draws the output in a viewer
  of its own. Output
  lines keep their spacing, never wrap and scroll sideways. The card has no pill, no coloured side stripe and no box
  nested inside a card, and the chat never draws a terminal of its own. Explaining commands is the Teacher persona's
  job in the chat (Plans/Personas.md section 11.8, DL-181, D19): when the user asks about a command or its output,
  Teacher answers as an ordinary reply in the thread. The command card and the terminal carry no Explain action, and
  Teacher never reads a terminal on its own and never types into one. This supersedes the 5.6 Pro chat's own editor
  pane as the host of what it opens and its inline Shell box (concept lineage), the left editor/document tab system
  and Return to chat of ACD-455 and v3 item 15 for Home, the "beside the chat" wording of ACD-480 and ACD-485, the
  360 px chat minimum of ACD-458 and v3 item 19, and the chat's Goal tab.
gui_related: true
gui_classification_reason: Defines where everything the chat opens lands, the chat column as the chat reads it, the compact command card and how Teacher explains commands.
split_recommended: false
depends_on: [DL-180, DL-181, DL-185, F3-634, F3-635, F3-636, F3-637, F3-569, F3-641, DR-071, CV-360, UCC-200, UCC-201, UCC-203, SP-330, SSYS-050, SMPFS-180, SMPFS-183, ACD-126, ACD-146]
unblocks: [ACD-039, ACD-041, ACD-416, ACD-444, ACD-453, ACD-455, ACD-458, ACD-485, ACD-501, ATS-075]
acceptance_criteria:
  - "Every file reference a person clicks in the chat (message and card paths, diff views, Changes rows, transcript file records, files-touched entries) opens the preview tab on a single click and a kept tab on a double click, reveals a file already open anywhere, and opens a new panel on Alt+click, all through F3-634."
  - "Plans, run views, transcripts, the thread's context, browsers, records, documents, artifacts and terminals the user opens from the chat open as their F3-635 tab kinds and take focus; nothing the chat opens is drawn in a pane of its own or as a centred modal."
  - "A Mermaid diagram card's Open in editor opens its source in an editor tab and its Open detached preview opens the artifact viewer tab, never a separate window (DL-180)."
  - "What an agent opens by itself lands as a background tab with the hollow square and an announcement and never takes keyboard focus."
  - "Activity Detail, the wand's setup sheets, Plan Export and Send to Planning Wizard never become panel tabs, and no Goal tab exists."
  - "Opening the same plan, run, child transcript or thread context twice reveals one tab; closing a tab the chat draws tells the chat, and the active tab in each panel is reported to it."
  - "The chat's width, drag range and narrow behaviour are F3-637's and F3-636's; no unit of this document states another chat minimum, and no tab covers the chat at any width."
  - "History is a flyout by default, pinning it widens the column by the list's width, the pin is saved in the home layout record, and only one thread-history list exists after the port."
  - "The command card shows the command, folder, status words with the exit code, elapsed time, the last lines with the count of earlier lines, and who ran it; Open in Terminal appears only with a session and reveals its terminal tab; Rerun in Terminal and View output follow ACD-108 and ACD-129."
  - "View output and View output log on a command with no terminal session open its output as a read-only, kept editor buffer tab through F3-634 (cmd.panel_tab.open with an editor buffer spec), never a preview and never a viewer drawn by the chat (DL-180, F3-641)."
  - "A command whose session ended while it still ran shows Ended with the earlier session with no exit code, never Running, Exit 0 or Failed (SMPFS-180, F3-641)."
  - "The command card has no pill, no coloured side stripe and no nested box, and no terminal is drawn inside the chat."
  - "Teacher explains a command only when the user asks, in the chat; no Explain action exists on the card or in the terminal."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
  - Plans/Personas.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-181"
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D3, D7, D8, D9, D19, D27)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (sections 6 and 6.1; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/chat56-audit.md, SHA-256 6d1563bd1776860739e6be272b191c419aba3c38b9dd9fe8ba44fd1ebb3231b5 (sections 2, 3, 4, 9 and 10)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8 (section 5)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-ARCHITECTURE-542703c07c.md, SHA-256 b6daf31a8953b3d7b633dd0db0a7b8a0ecba41f4533e8d6db6df5fa0f08bf476 (section 7, the chat command card; concept lineage only)"
  - "Concepts/home-redesign/src/terminal/js/80-card.js at 2851bfcd9e on concept/home-terminal-20261009, SHA-256 16f3f3f478787f272cb26dde233cdb41e755db33e6e07f536dc1e00f83dfeba9 (concept lineage only)"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Open in Terminal"
  - "Rerun in Terminal"
  - "View output"
  - "View output log"
  - "Ended with the earlier session"
  - "Needs input"
  - "Keep the chat open in narrow windows"
  - "general.interaction.chat-history-list"
  - "cmd.panel_tab.close"
negative_constraints:
  - "Do not give the chat a placement, dedupe or preview rule of its own; every open goes through F3-634."
  - "Do not open anything the chat shows in a pane of the chat's own, a window-edge drawer or a centred modal when its kind is a panel tab."
  - "Do not let an agent's open take keyboard focus or change the active tab of a panel the user is typing in."
  - "Do not make the chat, Activity Detail or the wand's setup sheets a panel tab, and do not restore the chat's Goal tab."
  - "Do not state a chat width, minimum or breakpoint here; F3-637 and F3-636 own them."
  - "Do not draw a terminal, or a box of terminal output, inside the chat."
  - "Do not add an Explain action to the command card or the terminal."
compatibility_only_notes:
  - "The 5.6 Pro chat's editor pane, its tab strip and its Return to chat control are concept lineage; the tab ids the concept uses are not canon names."
stale_retired_dispositions:
  - "Amended 2026-10-10 (lead ruling L6): Pop out is desktop only and the web chat stays in its column (F3-637)."
  - "Superseded 2026-10-09 (DL-180): the left editor/document tab system and Return to chat of ACD-455 and v3 item 15 for Home, the beside-the-chat placement of ACD-480 and ACD-485, the 360 px chat minimum of ACD-458 and v3 item 19, and the chat's Goal tab."
  - "Superseded 2026-10-09 (DL-185): the 5.6 Pro chat's inline Shell box, by the compact command card."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/Personas.md

### ACD-501 - What The 5.6 Pro Chat Must Meet When It Is Ported

```yaml
plan_unit_id: ACD-501
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The 5.6 Pro chat is ported into PMConcept7 after this redesign is published, which comes after the NieR showpiece,
  the 5.6 Pro chat round with its fonts, the Usage port, the left rail and the hover polish (DL-185, D28). When it is
  ported it meets these requirements (D27). Colours: its Basic, Friendly and Glass colours are fixed to PMConcept7's
  (Retro and NieR already match); it follows PMConcept7's one look setting and NieR Mode setting and keeps no theme
  store of its own, and its own names for colours, radii, surfaces and the code face map onto PMConcept7's, so the
  look settings reach every chat surface. General code text follows Plans/Decision_Log.md#DL-161,
  Plans/FinalGUISpec.md#F3-426, #F3-430 and Plans/DRY_Rules.md#DR-050. Under NieR Mode it follows the rule for new
  surfaces of DL-152, Plans/Settings_System.md#SSYS-043, Plans/FinalGUISpec.md#F3-598 and DR-056 (existing parts
  only, colours from the NieR tables, stepped motion), and it draws no NieR scene, ground layer, NieR Mode editor or
  reboot plate of its own: PMConcept7's are the only ones. Names: its class names, element ids and token names are
  namespaced so none of them collides with PMConcept7's. Size: it sizes itself by its own column, and by its own
  window when popped out, never by the app window: every width tier, breakpoint and pin rule it has (History,
  Activity Detail, the composer's selector row) keys on its own container. Layers: its menus, popouts, sheets,
  drawers, toasts and drag ghosts open in the page's one overlay root, in its one stacking order
  (Plans/DRY_Rules.md#DR-067); it appends no overlay of its own to the page. Hover: PMConcept7's hover controller
  owns every hover tag in the chat (Plans/DRY_Rules.md#DR-059, Plans/FinalGUISpec.md#F3-465); the chat draws no
  second tag and keeps no native titles, and its Activity Bar previews stay its own bounded previews (ACD-453). Bans:
  its pills and coloured side stripes are removed (Plans/DRY_Rules.md#DR-069, Plans/FinalGUISpec.md#F3-648),
  among them the meta chips, the goal and to-do chips, the Ask Card's capsule buttons, the attachment chips, the
  activity bar's capsule outline, the Read-only marker, the browser's session tabs, the working card's left rail in
  the step colour, the model picker's active provider tab and the browser's stale row; selection shows by the
  surface itself. Openings: its editor pane goes, everything it opened there opens through ACD-500, and its inline
  Shell box becomes ACD-500's command card. Demo controls: its Demo Studio, its guided examples and every other demo
  control fold into the one Demo Studio of PMConcept7 (Plans/DRY_Rules.md#DR-070, Plans/FinalGUISpec.md#F3-649),
  which stays lab only (ACD-474). Keys: keys the chat answers without a modifier act only while focus is inside the
  chat, and Escape closes the innermost open thing and stops there (F3-635, F3-568). Start: the ported chat opens no
  tab at start; the home layout is the layout record's (SP-330). Pop out keeps the chat's History and Activity Detail
  with it (F3-637); the web client offers no Pop out and the chat stays in its column (F3-637, UCC-203). This adds the port's
  requirements to the binding-by-reference of the 5.6 Pro concept and supersedes nothing else.
gui_related: true
gui_classification_reason: Lists what the 5.6 Pro chat's colours, names, sizing, layers, hover tags, bans, demo controls and keys must meet when it moves into PMConcept7.
split_recommended: false
depends_on: [DL-180, DL-185, DR-067, DR-069, DR-070, F3-635, F3-637, F3-648, F3-649, ACD-474, ACD-500]
unblocks: [ATS-075]
acceptance_criteria:
  - "The ported chat's Basic, Friendly and Glass colours equal PMConcept7's, and PMConcept7's look settings reach every chat surface."
  - "No class name, element id or token of the chat collides with PMConcept7's."
  - "No chat layout rule reads the app window's width or height; every tier keys on the chat's own container."
  - "Every chat menu, popout, sheet, drawer, toast and drag ghost opens in the page's one overlay root, and every hover tag in the chat comes from PMConcept7's hover controller."
  - "No pill and no coloured side stripe remains in the chat in any look."
  - "Every demo control of the chat is a section of the one Demo Studio and none is a product control."
  - "Under NieR Mode the page draws one scene and one ground layer, and the chat adds none."
  - "The port happens after this redesign is published."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-185"
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D26, D27, D28)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/chat56-audit.md, SHA-256 6d1563bd1776860739e6be272b191c419aba3c38b9dd9fe8ba44fd1ebb3231b5 (sections 5, 6, 8 and 10)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/NIER-RULES-for-new-surfaces.md, SHA-256 4634aba3abe147493c0f71de49419e63ba667a6784ca4b36967b537abb231728"
  - "Concepts/chat-assistant-concepts/5.6 Pro/ (concept lineage only)"
preserved_exact_tokens:
  - "Demo Studio"
  - "Basic, Friendly and Glass"
negative_constraints:
  - "Do not port the chat before this redesign is published."
  - "Do not keep a chat theme store, a second NieR scene or ground layer, a second overlay root or a second hover tag system."
  - "Do not size the chat by the app window."
  - "Do not carry a pill, a coloured side stripe or a chat-only demo panel into PMConcept7."
compatibility_only_notes:
  - "The 5.6 Pro chat's class names, element ids, theme attribute and storage keys are concept lineage and never canon names."
stale_retired_dispositions:
  - "Amended 2026-10-10 (lead ruling L6): The web client offers no Pop out (F3-637)."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-185, ContractName:Plans/DRY_Rules.md#DR-067, ContractName:Plans/DRY_Rules.md#DR-059, ContractName:Plans/DRY_Rules.md#DR-069, ContractName:Plans/DRY_Rules.md#DR-070, ContractName:Plans/FinalGUISpec.md#F3-649

### ACD-502 - The Chat's Terminal Cards Hand Off To Terminal Tabs

```yaml
plan_unit_id: ACD-502
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The chat's terminal cards hand off to terminal tabs, one session per tab
  (Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, DL-181). Each card action names the terminal tab it opens
  or reveals. Open in Terminal reveals the tab showing the command's exact terminal_session_id wherever it is
  (activated in its panel, pulled out of the "+N" list, its collapsed panel expanded), or gives a session that has
  no tab yet its tab through the one opening module (cmd.terminal.open, Plans/UI_Command_Catalog.md#UCC-201;
  Plans/FinalGUISpec.md#F3-634); it never starts a new shell. Show Terminal reveals the same tab (ACD-128), so the
  compact card shows Open in Terminal only. Rerun in Terminal runs the command again in that session's tab as a new
  invocation, never in a new shell unless the user asks for one (ACD-108). On a command with no terminal session, a
  completed inline command (ACD-129), Rerun in Terminal opens a new terminal tab in the command's folder by the same
  route as New terminal here, takes focus and runs the command there, as a new terminal session with a new invocation
  card (section 13.3's retry rule). New terminal here is the one action that
  opens a new terminal tab, in the folder it names, through cmd.panel_tab.open with the terminal kind and that folder
  (Plans/UI_Command_Catalog.md#UCC-200); it is never labelled Open in Terminal. A session the agent starts by itself,
  for a command that needs stdin or a TTY or for a background, watch or server action (ACD-127), shows as a terminal
  tab that lands in the background with the hollow square and the agent mark, placed beside other terminals by
  F3-634's kind affinity, and never takes keyboard focus (Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182,
  Plans/FinalGUISpec.md#F3-646); a terminal the user opens from the chat opens and takes focus. Detach/Pop-Out of a
  terminal, and its old alias Pop Out Terminal, retire with no replacement: a terminal tab moves between panels like
  every tab, its session survives every view change (SMPFS-180), and no panel tab pops out to a window (UCC-203).
  Keeping a process running after Puppet Master closes is the bash tool's detach (Plans/Tools.md#T-018), a different
  thing. There is no AI in the terminal: the terminal surface has no explain, fix, suggest, ask or completion action
  (SMPFS-180), and explaining commands is Teacher's in the chat (ACD-500). The terminal product canon this document
  held now belongs to the terminal owners: fidelity (ACD-132), the terminal workspace and its controller APIs
  (ACD-135), search (ACD-136), command blocks (ACD-137), empty and restore states (ACD-138), status badges (ACD-139),
  transcript and reset actions (ACD-140), labels (ACD-141) and diagnostics (ACD-142) are owned by Section15
  (SMPFS-180, Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-183) and FinalGUISpec
  (Plans/FinalGUISpec.md#F3-640, #F3-641). Each of those units stays here as the chat's consumer record, read in the
  terminal tab's words (a pane is the terminal tab, a section or workgroup is a panel, a dock entry is the tab's
  attention mark), and where one differs from its owner the owner wins. ACD-211's editor-stack mirroring and
  bottom-workspace placeholder retire. The chat still owns only preview, audit and reveal (ACD-131).
gui_related: true
gui_classification_reason: Defines which terminal tab each chat card action opens or reveals, how agent-started terminals appear, and which terminal canon leaves the chat document.
split_recommended: false
depends_on: [DL-181, DL-180, SMPFS-180, SMPFS-182, SMPFS-183, F3-634, F3-640, F3-641, F3-646, UCC-200, UCC-201, UCC-203]
unblocks: [ACD-077, ACD-108, ACD-127, ACD-128, ACD-131, ACD-132, ACD-134, ACD-135, ACD-136, ACD-137, ACD-138, ACD-139, ACD-140, ACD-141, ACD-142, ACD-145, ACD-207, ACD-210, ACD-211, ACD-214, ATS-076]
acceptance_criteria:
  - "Open in Terminal reveals the exact session's terminal tab wherever it is, or gives a tabless session its tab, and never starts a new shell."
  - "New terminal here opens a new terminal tab in its folder, and no action that opens a new terminal is labelled Open in Terminal."
  - "Rerun in Terminal on a command with a session reruns it in that session's tab; on a command with no session it opens a new terminal tab in the command's folder, takes focus and runs the command there (DL-181)."
  - "A terminal an agent started by itself lands as a background tab with the hollow square and the agent mark and never takes focus."
  - "No chat card offers Detach/Pop-Out or Pop Out Terminal, and no terminal tab pops out to a window."
  - "The terminal surface offers no AI action."
  - "ACD-132 and ACD-135 to ACD-142 name their terminal owners, and ACD-211 is superseded."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-181"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D8, D11, D18, D19, D27)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3 (section 6, Chat row; Appendix F.1 and F.5)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/chat56-audit.md, SHA-256 6d1563bd1776860739e6be272b191c419aba3c38b9dd9fe8ba44fd1ebb3231b5 (section 4)"
preserved_exact_tokens:
  - "Open in Terminal"
  - "Show Terminal"
  - "Rerun in Terminal"
  - "New terminal here"
  - "terminal_session_id"
negative_constraints:
  - "Do not label an action that opens a new terminal Open in Terminal."
  - "Do not offer Detach/Pop-Out, Pop Out Terminal or any pop-out of a terminal tab."
  - "Do not let a terminal an agent started take keyboard focus."
  - "Do not put an explain, fix, suggest, ask or completion action in the terminal."
  - "Do not restate terminal product canon here; cite its terminal owner."
compatibility_only_notes:
  - "Pop Out Terminal and Detach/Pop-Out remain readable in older records as retired labels only."
stale_retired_dispositions:
  - "Retired 2026-10-09 (DL-181): Detach/Pop-Out and Pop Out Terminal on chat terminal cards; ACD-211's editor-stack mirroring and bottom-workspace placeholder."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/FinalGUISpec.md#F3-634
