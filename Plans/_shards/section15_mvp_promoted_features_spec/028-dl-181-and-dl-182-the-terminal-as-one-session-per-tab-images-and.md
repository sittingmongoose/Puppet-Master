# Shard 028: DL-181 and DL-182 — The Terminal As One Session Per Tab, Images, And Agents Sharing Terminals (2026-10-09)

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L12362-L12991

Source SHA256: `4cc5a7fe8548cb91049b01ecf42590cf828a52fb5f9e9f4d7778583fb43e9c59`

---

## DL-181 and DL-182 — The Terminal As One Session Per Tab, Images, And Agents Sharing Terminals (2026-10-09)

<a id="dl-181-dl-182-terminal-session-per-tab-20261009"></a>

This addendum compiles `Plans/Decision_Log.md#DL-181` and `Plans/Decision_Log.md#DL-182`, Jared's decisions of
2026-10-09 on the terminal (SourceRef
`/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md`, SHA-256
`0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64`, decisions D11, D13, D14 and D18 to D20). The
terminal becomes one tab kind of the universal panels (`Plans/FinalGUISpec.md#F3-635`) with one session per tab. Its
presentation is `Plans/FinalGUISpec.md#F3-640` to `#F3-646`; this document keeps the session, engine, protocol and
agent rules. New units: SMPFS-180 (one session per tab), SMPFS-181 (image protocols and their safety rules),
SMPFS-182 (people and agents in one terminal), SMPFS-183 (command marks, links, find and accessibility in the
engine) and SMPFS-184 (the engine stays Puppet Master's own).

Superseded here: section 1.6's section, tab-pane grid, layout-family and bottom-default rules, SMPFS-138, SMPFS-170
(`terminal.workgroup_moved` is withdrawn under that unit's own rule), the Pane Layout Family Transform and the
orphaned grid sentence of section 3.14's acceptance criteria. Amended in place: SMPFS-014, SMPFS-015, SMPFS-016,
SMPFS-025, SMPFS-026, SMPFS-029, SMPFS-030, SMPFS-057, SMPFS-065, SMPFS-067, SMPFS-068, SMPFS-069, SMPFS-073,
SMPFS-108, SMPFS-124, SMPFS-134, SMPFS-158, SMPFS-162 and SMPFS-165, SMPFS-062 and SMPFS-128 (a restored terminal
tab is not left review-only: a new session starts below its saved scrollback), section 1.6's settings-tier passage,
its restore-label, `terminal_tab` state and `restored_without_history` bullets, the `/spectacle` row of section 3.14
and the image sentence of the DL-035 addendum's P3 row. Kept unchanged and cited: SMPFS-017 to SMPFS-024, SMPFS-031,
SMPFS-032, SMPFS-061, SMPFS-063, SMPFS-064, SMPFS-066, SMPFS-070 to SMPFS-072, SMPFS-074 to SMPFS-078, SMPFS-107,
SMPFS-109, SMPFS-110, SMPFS-125 to SMPFS-127, SMPFS-129 to SMPFS-133, SMPFS-135 to SMPFS-137, SMPFS-159 to
SMPFS-161, SMPFS-163 and SMPFS-164.

The terminal concept (branch `concept/home-terminal-20261009`, its rules and numbers in
`/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md`,
SHA-256 `4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b`, and its builders' contract
`terminal-ARCHITECTURE-542703c07c.md` in the same folder, SHA-256
`b6daf31a8953b3d7b633dd0db0a7b8a0ecba41f4533e8d6db6df5fa0f08bf476`) is source lineage only: these units adopt its
settled rules and numbers, never its code names. Numbers the concept has not settled (native performance targets,
effect parameters per look) are not set here. This compile is planning only: it creates no WorkNodes, NodeSeeds,
executable queues, implementation files or runtime, security, visual or performance acceptance.

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Decision_Log.md#DL-182, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-640, ContractName:Plans/storage-plan.md#SP-332, ContractName:Plans/Contracts_V0.md#CV-362

### SMPFS-180 - One Terminal Session Per Tab

```yaml
plan_unit_id: SMPFS-180
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  The terminal is one tab kind of the universal panels (`Plans/FinalGUISpec.md#F3-635`), and each terminal tab
  holds exactly one terminal session. Presentation and `terminal_session_id` stay separate (SMPFS-015): the
  terminal kind mints a new session when it opens a tab, the tab id is `terminal:<session>` taken from that first
  session and stays the same for the life of the tab, and the tab's domain reference is the session it shows now.
  There are no splits inside a terminal: Split opens a new panel beside this one with a new session in the same
  folder and shell profile. Terminal sections, workgroups, sub-tabs, in-tab pane splits, the editor terminal stack,
  the Quadrant layout, the pane layout families and the four-section and four-pane caps are retired; Terminals 2x2
  is a named layout of four panels (`Plans/FinalGUISpec.md#F3-630`). A session survives every view change: moving
  a terminal tab to another panel, collapsing or maximizing its panel, hiding it behind another tab or in the "+N"
  list, applying a named layout and narrowing the window never end, restart or mint a session. Closing the tab ends
  its session, after the tab first says what is still running ("Close this terminal? <process> is still running
  and will be stopped."). When a session ends by itself the tab stays and shows an inline "Session ended" row (with
  the exit code when it is not zero), Restart and Close tab, and its screen dims (the rows and the 72 % dim are
  `Plans/FinalGUISpec.md#F3-640`'s); Restart starts a new session in the same tab. Reopen closed tab opens a new session in the same folder and profile. After Puppet Master restarts, a
  terminal tab never pretends to be the old session (F3-226, F3-228): a session verified live is reattached
  (`restored_live`, SMPFS-063, SMPFS-128); otherwise the tab loads its saved scrollback (SMPFS-181,
  `Plans/storage-plan.md#SP-332`) before a new local session starts in the same folder and profile, draws the dim rule
  `── Restored <time> · the earlier session ended ──`, then the new prompt, and says so in an inline notice: "This
  terminal was restored with its scrollback (N images were not kept). Its earlier session ended when the page
  reloaded; this is a new session." The part in parentheses appears only when images were not kept; a reopened tab's
  notice says it was reopened and that the earlier session ended when the tab closed; a local terminal tab whose saved copy did not load within SP-332's load budget starts without its scrollback and says so. The restore outcome of SMPFS-063
  is recorded for the earlier session: `restored_live` only for a verified reattach; `restored_exited` when that
  session had already ended before the restart, `restored_disconnected` when it was still running and did not
  survive, and `restored_without_history` when its saved scrollback did not load. For local profiles in those three cases the restored scrollback is the review part, the new session below it is live with its own `terminal_session_id`, and the tab
  is never left review-only; Restart and rerun stay the actions for a session that ends while the tab is open. A
  command still running when the
  earlier session ended comes back ended and indeterminate ("ended with the earlier session"), never done, through
  this document's abnormal or indeterminate finalisation of command blocks. There is no broadcast input to several
  terminals. The per-tab role setting `code.terminal.tab-role` retires; shell profiles (zsh, bash, pwsh and SSH
  hosts) replace it. No AI feature lives in the terminal surface: no explain, fix, suggest, ask or completion
  action. Explaining commands is the Teacher persona's job in the chat (`Plans/Personas.md` section 11.8), and
  `code.terminal.explanations` retires.
  Restoring a terminal tab whose profile is an SSH host asks first (Reconnect / Close tab), as privileged attachments do (F3-228); a restore never reconnects to a remote host by itself.
gui_related: true
gui_classification_reason: Owns the terminal's session and tab model that every visible terminal surface presents.
split_recommended: false
depends_on:
- DL-181
- SMPFS-015
- SMPFS-022
- SMPFS-024
- SMPFS-063
- SMPFS-107
unblocks:
- F3-640
- UCC-201
- SP-332
- ATS-076
acceptance_criteria:
- "Moving a terminal tab between panels, collapsing or maximizing its panel, hiding it in \"+N\", applying each named layout and narrowing the window keep the same terminal_session_id, PTY, transcript, input-protection state and agent lease; no session is minted, restarted or ended."
- "Split from a terminal opens a new panel with a new session in the same folder and shell profile; no terminal tab ever holds two sessions."
- "Closing a tab whose session runs a process shows the inline close row first, and closing ends the session; Reopen closed tab opens a new session in the same folder and profile."
- "An ended session keeps its tab with the Session ended row; Restart starts a new session in that tab and the tab id does not change."
- "After a restart, a local terminal tab whose session did not survive loads its saved scrollback, draws the dim rule, shows the notice and starts a new session; it is never shown as the earlier live session, and a command that was running comes back ended and indeterminate."
- "The earlier session's restore outcome is restored_live only for a verified reattach, and otherwise restored_exited, restored_disconnected or restored_without_history; for local profiles in each of those three the tab has a new live session below the restored scrollback and is never left review-only."
- "No active unit describes terminal sections, workgroups, sub-tabs, in-tab splits, the editor terminal stack, the Quadrant layout, the pane layout families or the four-section and four-pane caps."
- "The terminal surface offers no AI action and no broadcast input; code.terminal.tab-role and code.terminal.explanations are retired."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-076 (future execution)
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-181
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D11, D19)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (sections 1 and 7; concept lineage only)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3 (worklist)"
preserved_exact_tokens:
- "SMPFS-180"
- "terminal:<session>"
- "terminal_session_id"
- "Close this terminal? <process> is still running and will be stopped."
- "Session ended"
- "Restart"
- "Close tab"
- "── Restored <time> · the earlier session ended ──"
- "This terminal was restored with its scrollback (N images were not kept). Its earlier session ended when the page reloaded; this is a new session."
- "ended with the earlier session"
- "Terminals 2x2"
- "code.terminal.tab-role"
- "code.terminal.explanations"
negative_constraints:
- "Do not split a terminal tab into panes or let one tab hold two sessions."
- "Do not mint, end or restart a session on a view change."
- "Do not present a restored tab as the earlier live session, or a command from the earlier session as done."
- "Do not add explain, fix, suggest, ask or inline AI completion actions to the terminal surface."
- "Do not send one input to several terminals at once."
compatibility_only_notes:
- "Section 1.6's section, tab-pane grid, layout-family and bottom-default rules, SMPFS-138 and SMPFS-170 remain only as lineage."
- "terminal_section_id, terminal_workgroup_id and terminal_pane_id survive only as read-only migration inputs (Plans/storage-plan.md#SP-332)."
stale_retired_dispositions:
- "Amended 2026-10-10 (lead ruling L14): SSH-host terminal restore waits for Reconnect / Close tab and never reconnects by itself."
- "Amended 2026-10-10 (lead ruling L14, scope): L14 covers restore only; a session verified live is reattached whatever its profile (reattaching a live session reconnects to no remote host, SSYS-050), and Reopen closed tab, a user action, opens a new session in the same folder and profile with no Reconnect / Close tab prompt."
- "Supersedes 2026-10-09 (DL-181): section 1.6's four-section, one-to-four-pane, quadrant, layout-family and bottom-default rules, SMPFS-138, the Pane Layout Family Transform and SMPFS-170's producer."
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-640, ContractName:Plans/storage-plan.md#SP-332, ContractName:Plans/UI_Command_Catalog.md#UCC-201

### SMPFS-181 - Terminal Image Protocols And Their Safety Rules

```yaml
plan_unit_id: SMPFS-181
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  The first terminal release has three image protocols at once, with no phases (DL-182): the complete kitty
  graphics protocol (direct, file, temporary-file and shared-memory transmission; chunking; image ids, image
  numbers and placement ids; placements with source rects, cell boxes and pixel offsets; relative placements; the
  three z tiers; every delete selector; Unicode placeholders; animation frames, frame control and composition;
  queries), sixel, and iTerm2 inline images (single and multipart). Limits: each screen buffer (the main and the
  alternate screen each have one) keeps at most 320 MiB of decoded RGBA (width x height x 4); over that, images
  without placements go first, then transient images, then the least recently used. Animation frames use a
  separate pool of 5 x 320 MiB per buffer. One image is at most 10,000 px a side. One kitty command (APC) is at
  most 8 MiB, one iTerm2 sequence (OSC) 24 MiB and one sixel sequence (DCS) 24 MiB; a sequence over its cap is
  dropped and kitty gets `EFBIG`. iTerm2: 1 MiB per `FilePart`, 16 MiB of base64 per image, at most 255 rows tall
  and at most the columns right of the cursor wide. Sixel: 10,000 x 10,000 px, 16,777,216 pixels, 1024 colour
  registers private to each image and 16 MiB of data; with DECSDM (mode 80) set the image does not scroll, sits at
  the top left and leaves the cursor where it was, and mode 8452 puts the cursor right of the image. File and
  shared-memory names are at most 2048 bytes, relative placements nest at most 8 levels, and the fastest animation
  frame shown is 20 ms. Hardening (all of kitty's 2026-09-14 hardening): file media accept regular files only; the
  resolved path is checked before opening, and `/proc`, `/sys` and `/dev` (except `/dev/shm`) are refused;
  symlinks are followed and loops fail; every read failure of any file medium (missing, unreadable, not regular,
  sensitive, shorter than claimed) answers exactly `EBADF:Failed to read image file`; temporary files are deleted
  only inside `/tmp` or `/dev/shm` and only when the path contains `tty-graphics-protocol`; shared memory is
  unlinked after reading. Remote (SSH) sessions and commands an agent typed may use direct transmission only, and
  their file, temporary-file and shared-memory media get the same `EBADF` answer. Every error reply is a fixed
  string that never echoes anything the program sent: `EINVAL:Invalid graphics command`, `ENOENT:Image not
  found`, `ENODATA:Insufficient image data`, `EFBIG:Too much data`, `ENOSPC:Storage quota exceeded`,
  `ENOMEM:Image too large`, `EBADPNG:Image could not be decoded`, `EILSEQ:Continuation for an upload that is not in
  progress`, `ETOODEEP`, `ECYCLE` and `ENOPARENT`. A program that sends too much is refused; it never freezes the
  app, and the image stores count toward the terminal's bounded memory (SMPFS-073). Images anchor to the cell they
  were placed on: they scroll with it, follow it when the grid reflows, clip to the tab, and go when the screen is
  cleared or their lines leave scrollback. Text written over a sixel or iTerm2 image cuts the image out of those
  cells. While an image decodes or a file is read, later output waits, so text after an image always lands after
  it. Under tmux, kitty images pass through as Unicode placeholders, which tmux carries as text. Under Reduced Motion an animated image holds its first frame; while the terminal is hidden it pauses. How images draw in a tab is `Plans/FinalGUISpec.md#F3-645`; the Leptos web
  client (DL-139) receives images as a separate image-store update beside its row updates and keeps SMPFS-072's
  fixed-row rule. Saved scrollback (the planning thread's rule of 2026-10-09, which replaces the concept SPEC's
  "never enter saved scrollback" sentence): images persist with the terminal's saved scrollback within its storage
  quota (`Plans/storage-plan.md#SP-332`). Text is bounded by the scrollback limit and never gives way to images;
  images that do not fit are dropped oldest first (highest in the scrollback), and a frame that cannot be read back
  is treated the same. An evicted image's cells show a dashed hairline box with `[<name> <W>×<H> · not kept]`,
  where the name is the file name (kitty file transfer, iTerm2 `name=`) or `kitty image`, `sixel image` or `inline
  image`; a Unicode-placeholder run shows the label in its first cell. Saved images are stored as PNG, one record
  per frame, written once and reused by later saves. Placeholder cells on restored lines resolve only to restored
  images, so a program in the new session that reuses an image id never paints into the old scrollback. Saved
  images follow the saved scrollback's own storage, retention and backup rules (SP-332): they stay on this machine
  and are excluded from backups, exports and sync; they are part of the bounded `best_effort_durable` transcript
  tier (SMPFS-061, SMPFS-109). The accessible buffer and agent reads describe an image as `[image W×H px]` (with ",
  animated" when it is), a Unicode-placeholder run as `[image]`, and an image saved scrollback could not keep by its
  placeholder label; agent reads never return image bytes and images never enter model context (SMPFS-133). This
  is the decision DL-035 left out, and DL-035's own-engine rule stands: an image decoder is not a terminal
  emulator, terminal parser or PTY-abstraction library, while every protocol parser, placement model and image
  store is Puppet Master's own code (SMPFS-184).
gui_related: true
gui_classification_reason: Admits the image protocols the terminal tab draws and sets the limits and refusals users see.
split_recommended: false
depends_on:
- DL-182
- SMPFS-180
- SMPFS-061
- SMPFS-109
- SMPFS-125
- SMPFS-130
unblocks:
- F3-645
- ATS-076
acceptance_criteria:
- "The kitty graphics protocol with every listed feature, sixel and iTerm2 inline images all ship in the first terminal release; none is phased or left behind an off flag."
- "Every limit holds at its stated number; a sequence over its cap is dropped and kitty gets EFBIG; an over-quota image store evicts images without placements, then transient images, then the least recently used."
- "Every file-medium read failure answers exactly EBADF:Failed to read image file; /proc, /sys and /dev (except /dev/shm) are refused; symlink loops fail; temporary files are deleted only inside /tmp or /dev/shm and only with tty-graphics-protocol in the path; shared memory is unlinked after reading."
- "A remote (SSH) session and a command an agent typed can send images only by direct transmission; their file, temporary-file and shared-memory media get EBADF."
- "Every error reply is one of the fixed strings and never echoes program data."
- "Output after an image waits for it; images anchor, scroll, reflow and clip with their cells; text written over sixel and iTerm2 images cuts them out; tmux passthrough works through Unicode placeholders."
- "Saved scrollback keeps images within the SP-332 quota; text never gives way to images; an evicted image leaves its placeholder label; a restored placeholder id never resolves to an image of the new session; saved images are never backed up, exported or synced."
- "The accessible buffer and agent reads use [image W×H px], [image] and the placeholder label and never return image bytes; under Reduced Motion an animated image holds its first frame; while the terminal is hidden it pauses."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-076 (future execution)
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-182
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D14)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (section 7; concept lineage only)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-ARCHITECTURE-542703c07c.md, SHA-256 b6daf31a8953b3d7b633dd0db0a7b8a0ecba41f4533e8d6db6df5fa0f08bf476 (concept lineage only)"
preserved_exact_tokens:
- "SMPFS-181"
- "kitty graphics protocol"
- "sixel"
- "iTerm2"
- "Unicode placeholders"
- "tty-graphics-protocol"
- "EBADF:Failed to read image file"
- "EINVAL:Invalid graphics command"
- "ENOENT:Image not found"
- "ENODATA:Insufficient image data"
- "EFBIG:Too much data"
- "ENOSPC:Storage quota exceeded"
- "ENOMEM:Image too large"
- "EBADPNG:Image could not be decoded"
- "EILSEQ:Continuation for an upload that is not in progress"
- "ETOODEEP"
- "ECYCLE"
- "ENOPARENT"
- "[<name> <W>×<H> · not kept]"
- "kitty image"
- "sixel image"
- "inline image"
- "[image W×H px]"
- "[image]"
negative_constraints:
- "Do not phase the three protocols or ship one without the others."
- "Do not read device files, FIFOs, sockets, /proc or /sys, and do not accept file, temporary-file or shared-memory media from a remote session or for a command an agent typed."
- "Do not echo program-supplied data in an error reply."
- "Do not let saved images exceed the saved scrollback quota or push text out of it."
- "Do not return image bytes to an agent or put images into model context."
- "Do not adopt a third-party terminal emulator, terminal parser or PTY-abstraction library for images."
compatibility_only_notes:
- "The concept SPEC's section 7 sentence that images never enter saved scrollback does not hold for canon; the planning thread's rule of 2026-10-09 replaces it."
- "The concept caps one transmission at 64 MiB of decoded payload; the native cap comes with the next SPEC installment."
stale_retired_dispositions:
- "Amended 2026-10-10 (lead ruling L15): Under Reduced Motion an animated image holds its first frame; while the terminal is hidden it pauses."
- "Replaces 2026-10-09 (DL-182): the image sentence of the DL-035 addendum's P3 row and SMPFS-158's negative constraint that image protocols are not approved."
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
- Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-182, ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/FinalGUISpec.md#F3-645, ContractName:Plans/storage-plan.md#SP-332, ContractName:Plans/Automated_Testing_System.md#ATS-076

### SMPFS-182 - People And Agents In One Terminal

```yaml
plan_unit_id: SMPFS-182
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  People and agents share a terminal with one writer at a time: the human, or one agent holding the terminal's
  writer lease. The human can always type: any keystroke in a terminal an agent is driving takes over at once, the
  agent's next write is refused as `preempted`, and the agent receives a notice that it has been paused. An agent
  opens its own terminals as background tabs with the hollow-square mark that never take keyboard focus
  (`Plans/FinalGUISpec.md#F3-634`), and it types into a terminal a human opened only with the human's grant, asked
  in an inline row ("<agent> wants to type in this terminal: `<command>`") that offers Allow once, Allow in this
  terminal and Deny. Allow once lets that one command through; an agent's one-off run in a human's terminal ends
  its turn there, and its driving row, its mark and the writer lease go back to the human. Allow in this terminal
  (lead ruling of 2026-10-10 in DL-181; the concept's "Always allow here", renamed because Always in PS-041's
  approval choices means a stored rule) is a write grant to one agent in one terminal session. It is held in memory
  only and never stored, and it ends when the terminal closes, when the human takes over (a keystroke, Take over or
  Stop), when the human revokes it (that agent's row in the terminal's Agent input menu, `Plans/FinalGUISpec.md#F3-646`)
  or when that agent's run ends; Hand back after a take-over grants it again for the rest of that run. Deny
  refuses the write and the agent is told. A grant decides who may type, never what may run: every command an
  agent types still passes the Tools policy engine with its own approval over that exact invocation (SMPFS-024,
  `Plans/Tools.md#T-007`, `Plans/Tools.md#T-171`, `Plans/Permissions_System.md#PS-041`, `#PS-129`, `#PS-130`).
  While a program reads a password or another secret with echo off, the terminal refuses all agent input as
  `secret_input`, the cursor becomes a padlock, and the row says "Password needed. Only you can answer this
  prompt; <agent> is waiting." with Type it, which focuses the terminal. While an agent drives, the row says
  "<agent> is driving this terminal · step N of M · <label>" with Take over (the human takes the lease), Interrupt
  (SIGINT to the foreground job) and Stop (ends the agent's run and returns the lease to the human); after a
  take-over it says "You took over. <agent> is paused and has been told." with Hand back and Stop <agent>. Every
  command record carries `by`, the user or the agent by name, written through shell-integration records that only
  carry weight with that terminal's secret (SMPFS-183); a mark without the secret is plain output and never
  attributes a command. Agent reads return rendered text with a read state (`final` for a finished command, and the
  known-empty, complete-so-far, partial and unavailable states of this document's terminal output read
  semantics), never raw bytes and never images (SMPFS-181). Input protection (SMPFS-165, DL-037, DL-038) outranks
  every grant: while it is on, user and agent input are both blocked and the agent receives an explicit blocked
  result. Back Seat Driver never drives a terminal, reads a terminal's screen or saved scrollback, or holds a grant
  (`Plans/Back_Seat_Driver.md#BSD-011`).
  A control API for the user's own scripts comes later; nothing here admits one. The rows' look is
  `Plans/FinalGUISpec.md#F3-646`, and the fields that carry `by`, the grant and the refusals are
  `Plans/Contracts_V0.md#CV-362`.
gui_related: true
gui_classification_reason: Sets who may write into a visible terminal tab and the rows, marks and refusals the user and agent see.
split_recommended: false
depends_on:
- DL-181
- SMPFS-180
- SMPFS-023
- SMPFS-024
- SMPFS-064
- SMPFS-165
- T-007
- T-171
- PS-041
- PS-129
- PS-130
unblocks:
- F3-646
- CV-362
- ATS-076
acceptance_criteria:
- "A human keystroke while an agent drives takes over before the agent's next write, which is refused as preempted; the agent receives its notice; Hand back resumes it."
- "An agent write into a human-opened terminal without a grant writes nothing to the session; Allow once admits exactly one command, after which the driving row, the agent's mark and the writer lease return to the human; Deny writes nothing and the agent is told."
- "Allow in this terminal is never written to storage, settings, the layout record or a permission rule, and it ends when the terminal closes, the human takes over (keystroke, Take over or Stop), the human revokes it from the Agent input menu or the agent's run ends; Hand back restores it for that run only."
- "Every command an agent types under any grant still gets its own Tools policy decision and approval over that exact invocation."
- "During a secret prompt every agent write is refused as secret_input with zero bytes reaching the PTY; the padlock cursor and the Password needed row show."
- "Every command record carries by; a shell-integration mark or record without the terminal's secret creates no command boundary and no attribution."
- "Agent reads return rendered text with a read state, never raw bytes or image data."
- "Interrupt sends SIGINT to the foreground job; Stop ends the agent's run and returns the writer lease to the human."
- "Input protection blocks agent input whatever grant is held, with an explicit blocked result."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-076 (future execution)
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Contracts_V0.md
- Plans/Tools.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-181
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D18)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (sections 2 and 8; concept lineage only)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3 (Appendix C, gaps G2 to G8)"
preserved_exact_tokens:
- "SMPFS-182"
- "preempted"
- "secret_input"
- "by"
- "<agent> is driving this terminal · step N of M · <label>"
- "You took over. <agent> is paused and has been told."
- "<agent> wants to type in this terminal: `<command>`"
- "Password needed. Only you can answer this prompt; <agent> is waiting."
- "Take over"
- "Interrupt"
- "Stop"
- "Hand back"
- "Stop <agent>"
- "Allow once"
- "Allow in this terminal"
- "Deny"
- "Type it"
- "final"
negative_constraints:
- "Do not store an agent's terminal write grant, keep it after the terminal closes, the human takes over, the human revokes it or the agent's run ends, or let it stand in for command approval."
- "Do not let an agent answer a password or secret prompt."
- "Do not let an agent write after a human keystroke until the human hands back."
- "Do not attribute a command, or treat output as a command boundary, from a mark that lacks the terminal's secret."
- "Do not give agents raw PTY bytes or image data."
- "Do not admit a control API for the user's own scripts in this release."
compatibility_only_notes:
- "The concept's \"Always allow here\" label is lineage only; the product label is Allow in this terminal."
stale_retired_dispositions:
- "Closes 2026-10-09 (DL-181) the terminal audit's gaps on takeover, agent writes into a human's terminal, attribution and agent-tab placement (G2, G5 to G8); the field shapes are CV-362's."
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Contracts_V0.md
- Plans/Tools.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/FinalGUISpec.md#F3-646, ContractName:Plans/Contracts_V0.md#CV-362, ContractName:Plans/Permissions_System.md#PS-041, ContractName:Plans/Tools.md#T-007, ContractName:Plans/Decision_Log.md#DL-038

### SMPFS-183 - Command Marks, Links, Find And Accessibility In The Engine

```yaml
plan_unit_id: SMPFS-183
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  This unit is the engine side of the terminal's features (D13); their look and keys are
  `Plans/FinalGUISpec.md#F3-640` and `#F3-641`. Shell integration: OSC 133 prompt, command, output and end marks
  carry a secret minted for that terminal session, so program output cannot fake them. Puppet Master's shell
  integration also sends two PM-private records under the same secret: the exact command line and who typed it
  (concept lineage: `OSC 133;...;pmn=<secret>`, `OSC 6973;<secret>;E;<base64 command line>` and
  `OSC 6973;<secret>;W;<who>`; the native sequences are the engine's choice). A mark or record without the right secret is plain output, never a
  command boundary and never attribution; the confidence tiers stay SMPFS-021 and SMPFS-129. Each command record
  (the command block of SMPFS-022) holds `by` (the user or the agent by name), the exit status, the folder it ran
  in, and its start and end times, and records persist with saved scrollback (`Plans/storage-plan.md#SP-332`).
  Links: OSC 8 hyperlinks are program output, so link text is never trusted as the target. The hover tag shows the
  real target before any open; Ctrl+click (Cmd+click) opens and a plain click selects text. `file://` targets and
  detected `path:line:col` references pass FileSafe's path checks and open through the one opening module
  (`Plans/FinalGUISpec.md#F3-634`: the panel's preview tab, Ctrl+double-click keeps it, Ctrl+Alt+click opens a new
  panel); other URLs open a Browser tab under the browser's own navigation rules; a `file://` link naming another
  host is never opened as a local path. "Open output in an editor tab" opens a buffer, never a preview. OSC 7 reports the
  current folder, which the header row, the tab label, Split and path detection use. OSC 9;4 is advisory progress
  under SMPFS-162. Bell and notifications: BEL shows the look's visual bell (`Plans/FinalGUISpec.md#F3-643`; the
  `bell` field is follow, visual or off, so there is no audible bell). A bell, or an OSC 9, OSC 777 or OSC 99
  notification, in a terminal tab the user is not looking at sets that tab's attention mark (the hollow square,
  cleared when the user activates the tab) and is announced politely. Notification text is program text shown as
  plain text; it creates no new notification family and is routed through the attention model (SMPFS-031,
  SMPFS-032). This is the policy for other notification protocols that SMPFS-162 refers to. Find
  searches the retained scrollback with regular expressions, case, whole word and highlight-all, under SMPFS-020's
  search rules. Copy mode is keyboard selection over the grid, with character, line and block selection as
  explicit choices (pointer selection stays linear, SMPFS-020); quick select labels the URLs, paths, hashes and IP
  addresses in view so one key copies, inserts at the prompt or opens. IME composition stays at the cursor cell
  (SMPFS-136, SMPFS-158). The accessible plain-text buffer is SMPFS-126's text mirror shown as plain text with each
  command as a heading and moved through command by command; images read as SMPFS-181 says. The sticky command
  header, command jumps and the scrollbar's command, failure and search marks resolve from command blocks and
  degrade honestly when backing is pruned (SMPFS-023). Effects idle stop: the effects, their frame budget and the
  idle rule are `Plans/FinalGUISpec.md#F3-643`'s; on the engine side every effect goes idle within 10 s of the last
  output or keystroke, after which the engine draws no effect frame until the next output or keystroke (SMPFS-073).
gui_related: true
gui_classification_reason: Owns the engine behaviour behind the terminal's visible marks, links, find, copy mode, bell and accessible buffer.
split_recommended: false
depends_on:
- DL-181
- SMPFS-180
- SMPFS-020
- SMPFS-021
- SMPFS-022
- SMPFS-023
- SMPFS-031
- SMPFS-126
- SMPFS-129
- SMPFS-162
unblocks:
- F3-641
- ATS-076
acceptance_criteria:
- "OSC 133 marks and the PM-private command-line and who-typed records count only with the terminal session's secret; the same sequences without it are drawn as output and change no command block."
- "Every command record holds by, exit status, folder, start and end, and survives a restore with saved scrollback."
- "OSC 8 link text never replaces the target: the hover tag shows the target, only Ctrl+click (Cmd+click) or a menu action opens it, file:// targets and detected paths pass FileSafe's path checks and open through the opening module, and a file:// link naming another host never opens as a local path."
- "A detected path:line:col link passes FileSafe's path checks before it opens; Ctrl+click, Ctrl+double-click and Ctrl+Alt+click open the preview tab, a kept tab and a new panel, and a plain click selects text."
- "A bell or an OSC 9, OSC 777 or OSC 99 notification in an unseen terminal tab sets its attention mark and a polite announcement, creates no new notification family, and never also counts as OSC 9;4 progress."
- "Copy mode offers character, line and block selection by keyboard while pointer selection stays linear; quick select copies, inserts or opens the labelled item."
- "The accessible buffer shows the scrollback as plain text with each command as a heading and images as their text descriptions."
- "Every effect, the Full CRT tier's ambient noise and flicker included, goes idle within 10 s of the last output or keystroke, and no effect frame is drawn after that until the next output or keystroke."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-076 (future execution)
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileSafe.md
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-181
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D13, D18)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (sections 1 to 3 and 8; concept lineage only)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-ARCHITECTURE-542703c07c.md, SHA-256 b6daf31a8953b3d7b633dd0db0a7b8a0ecba41f4533e8d6db6df5fa0f08bf476 (section 3, shell integration; concept lineage only)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-wave2-numbers-5e549d6961.md, SHA-256 f9d7756f94f26c5285b35400a380afed57fb27dfaee6d29683c3916604b4a15a (the 10 s effects idle stop, adopted by the lead as R34; concept lineage only)"
preserved_exact_tokens:
- "SMPFS-183"
- "OSC 133"
- "OSC 8"
- "OSC 7"
- "OSC 9;4"
- "OSC 9"
- "OSC 777"
- "OSC 99"
- "path:line:col"
- "file://"
- "by"
- "Open output in an editor tab"
negative_constraints:
- "Do not treat a shell-integration mark or record without the terminal's secret as a command boundary or as attribution."
- "Do not open a link from its visible text, from a plain click, or a file:// link naming another host as a local path."
- "Do not create a new notification family from terminal output."
- "Do not add an audible bell."
compatibility_only_notes:
- "The OSC 6973 sequences and the pmn parameter are the concept's lineage, not product names; the native engine chooses its own private sequence."
stale_retired_dispositions:
- "Closes 2026-10-09 (DL-181) the terminal audit's Section 15 gaps on OSC 8, bell and OSC 9, 777 and 99 notifications that SMPFS-162 cited as an existing policy."
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/FileSafe.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/FinalGUISpec.md#F3-641, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-643, ContractName:Plans/storage-plan.md#SP-332

### SMPFS-184 - The Terminal Engine Stays Puppet Master's Own

```yaml
plan_unit_id: SMPFS-184
unit_type: constraint
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  DL-035 stands (D20): Puppet Master writes its own VT parser, cell grid and scrollback, renderer and PTY host on
  operating-system APIs (section 3.14, SMPFS-070, SMPFS-072). Ghostty, kitty, WezTerm, Rio and Alacritty are design
  references only, never reused code, and no third-party terminal emulator, terminal parser or PTY-abstraction
  library enters the engine or the host. The lessons the engine takes from them are designs built in its own code:
  8-byte cells; page-based scrollback; a per-row dirty render model shared by the Skia renderer on the desktop and
  the Leptos renderer of the web client (DL-139), in which only rows whose content, overlays or cursor changed
  repaint and the default background is painted once by the screen box, never per cell; and kitty's graphics
  hardening (SMPFS-181). Two rules from the concept's renderer stay: output after an image waits while the image
  decodes, and an image change repaints only the visible rows. An image decoder is
  not a terminal emulator, parser or PTY library (DL-182), so DL-035 does not forbid one. The HTML concept terminal
  is a design reference for the native port, not its architecture (SMPFS-072). The native engine's performance
  targets (throughput, latency, frame times and memory) come with the terminal's next SPEC installment and are not
  set here.
gui_related: false
gui_classification_reason: Engine ownership and design-reference boundary; the visible terminal is owned by FinalGUISpec.
split_recommended: false
depends_on:
- DL-181
- DL-035
- SMPFS-070
- SMPFS-072
- SMPFS-073
unblocks: []
acceptance_criteria:
- "No third-party terminal emulator, terminal parser or PTY-abstraction library and no code from Ghostty, kitty, WezTerm, Rio, Alacritty or another reference terminal enters the engine or host."
- "The engine uses 8-byte cells, page-based scrollback and per-row dirty painting shared by the Skia and Leptos renderers; the default background is painted once per screen."
- "Output after an image waits while it decodes, and an image change repaints only visible rows."
- "No performance target is claimed until the terminal's next SPEC installment sets it."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Decision_Log.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-181
- Plans/Decision_Log.md#DL-035
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D20)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (sections 7 and 10, the renderer rules only; concept lineage only)"
preserved_exact_tokens:
- "SMPFS-184"
- "8-byte cells"
- "page-based scrollback"
- "per-row dirty render model"
- "Ghostty"
- "kitty"
- "WezTerm"
- "Rio"
- "Alacritty"
negative_constraints:
- "Do not reuse code from a reference terminal or adopt a third-party terminal emulator, terminal parser or PTY-abstraction library."
- "Do not treat the HTML concept terminal as the engine's architecture."
- "Do not claim a native performance target before the terminal's next SPEC installment sets it."
compatibility_only_notes: []
stale_retired_dispositions:
- "Restates 2026-10-09 (DL-181, D20) that DL-035 stands; amends nothing in DL-035's own-engine rule."
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Decision_Log.md#DL-139
