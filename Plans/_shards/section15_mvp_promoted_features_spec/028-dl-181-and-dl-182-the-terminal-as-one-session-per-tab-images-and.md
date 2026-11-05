# Shard 028: DL-181 and DL-182 — The Terminal As One Session Per Tab, Images, And Agents Sharing Terminals (2026-10-09)

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L12645-L14266

Source SHA256: `dfb41d374455e729eb6463303a242b3e040ee9d6ed0f84906ed6cc3b61234032`

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

Amended 2026-10-10 (DL-187): Jared's answers of 2026-10-10 (D36 to D39, `/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md`, SHA-256 `ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9`) reach three of these units, with the terminal concept's build of them as source lineage only (`terminal-SPEC-01c5e78c42.md` in the same folder, SHA-256 `a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc`, sections 1, 2 and 7). SMPFS-180: a restored tab's notice says how many secrets were left out of its saved copy (D36), and the shell profiles are the shells installed on the computer plus SSH hosts (D39). SMPFS-181: saved images also give way under the total cap across terminals (D37). SMPFS-183: a program's notification raises a system notification while Puppet Master is in the background, at most one every 3 s per terminal, with a mute per terminal (D38). What is scrubbed from saved scrollback and how the 512 MiB total is trimmed are storage rules, `Plans/storage-plan.md#SP-332`.

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Decision_Log.md#DL-182, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-640, ContractName:Plans/storage-plan.md#SP-332, ContractName:Plans/Contracts_V0.md#CV-362

### SMPFS-180 - One Terminal Session Per Tab

```yaml
plan_unit_id: SMPFS-180
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  The terminal is one tab kind of the universal panels (`Plans/FinalGUISpec.md#F3-635`), and each
  terminal tab holds exactly one terminal session. Presentation and `terminal_session_id` stay
  separate (SMPFS-015): the terminal kind mints a new session when it opens a tab, the tab id is
  `terminal:<session>` taken from that first session and stays the same for the life of the tab, and
  the tab's domain reference is the session it shows now. There are no splits inside a terminal: Split
  opens a new panel beside this one with a new session in the same folder and shell profile. Terminal
  sections, workgroups, sub-tabs, in-tab pane splits, the editor terminal stack, the Quadrant layout,
  the pane layout families and the four-section and four-pane caps are retired; Terminals 2x2 is a
  named layout of four panels (`Plans/FinalGUISpec.md#F3-630`). A session survives every view change:
  moving a terminal tab to another panel, collapsing or maximizing its panel, hiding it behind another
  tab or in the "+N" list, applying a named layout and narrowing the window never end, restart or mint
  a session. Closing the tab ends its session, after the tab first says what is still running ("Close
  this terminal? <process> is still running and will be stopped."). When a session ends by itself the
  tab stays and shows an inline "Session ended" row (with the exit code when it is not zero), Restart
  and Close tab, and its screen dims (the rows and the 72 % dim are `Plans/FinalGUISpec.md#F3-640`'s);
  Restart starts a new session in the same tab. Reopen closed tab opens a new session in the same
  folder and profile. After Puppet Master restarts, a terminal tab never pretends to be the old
  session (F3-226, F3-228): a session verified live is reattached (`restored_live`, SMPFS-063,
  SMPFS-128); otherwise the tab loads its saved scrollback (SMPFS-181, `Plans/storage-plan.md#SP-332`)
  before a new local session starts in the same folder and profile, draws the dim rule `── Restored
  <time> · the earlier session ended ──`, then the new prompt, and says so in an inline notice: "This
  terminal was restored with its scrollback (N images were not kept). Its earlier session ended when
  the page reloaded; this is a new session." The part in parentheses appears only when images were not
  kept; a reopened tab's notice says it was reopened and that the earlier session ended when the tab
  closed; a local terminal tab whose saved copy did not load within SP-332's load budget starts
  without its scrollback and says so. The restore outcome of SMPFS-063 is recorded for the earlier
  session: `restored_live` only for a verified reattach; `restored_exited` when that session had
  already ended before the restart, `restored_disconnected` when it was still running and did not
  survive, and `restored_without_history` when its saved scrollback did not load. For local profiles
  in those three cases the restored scrollback is the review part, the new session below it is live
  with its own `terminal_session_id`, and the tab is never left review-only; Restart and rerun stay
  the actions for a session that ends while the tab is open. A command still running when the earlier
  session ended comes back ended and indeterminate ("ended with the earlier session"), never done,
  through this document's abnormal or indeterminate finalisation of command blocks. There is no
  broadcast input to several terminals. The per-tab role setting `code.terminal.tab-role` retires;
  shell profiles (zsh, bash, pwsh and SSH hosts) replace it. No AI feature lives in the terminal
  surface: no explain, fix, suggest, ask or completion action. Explaining commands is the Teacher
  persona's job in the chat (`Plans/Personas.md` section 11.8), and `code.terminal.explanations`
  retires. Restoring a terminal tab whose profile is an SSH host asks first (Reconnect / Close tab),
  as privileged attachments do (F3-228); a restore never reconnects to a remote host by itself.
  Amended 2026-10-10 (DL-187): when the saved copy left secrets out (D36,
  Plans/storage-plan.md#SP-332), the restore notice ends "N secrets were left out of the saved copy.";
  the restored lines show each left-out secret's label, while a program's output in the new session is
  shown as printed. The shell profiles a terminal can start are the shells installed on the computer
  and the SSH hosts (D39); the "+" menu lists them (Plans/FinalGUISpec.md#F3-632). This same
  one-session tab model works in No project with an exact Computer/chat or granted cwd and host-local
  shell profile. Settings resolves future defaults; a chat conversion never moves its PTY, process,
  port or scrollback owner to another Computer, and future sessions resolve the destination. Protected
  remote reconnect and every earlier restore/secret notice rule remain.
gui_related: true
gui_classification_reason: Owns the terminal's session and tab model that every visible terminal surface presents.
split_recommended: false
depends_on:
- DL-181
- DL-187
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
- "A restored tab whose saved copy left N secrets out ends its notice with N secrets were left out of the saved copy., and one whose copy left none out does not."
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D11, D19)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md,
  SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (sections 1 and 7; concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3
  (worklist)
- Plans/Decision_Log.md#DL-187
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md,
  SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D36, D39)
- '/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md,
  SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc (sections 1 and 7: the restore notice''s
  secrets sentence, the shell list; concept lineage only)'
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N6/N12/N24/N25; latest Goal/Crew/Plan/schedule rulings
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens:
- "SMPFS-180"
- "N secrets were left out of the saved copy."
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
- "Amended 2026-10-10 (DL-187): the restore notice says how many secrets the saved copy left out (D36); shell profiles are the installed shells and SSH hosts (D39)."
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
  shared-memory names are at most 2048 bytes, relative placements nest at most 8 levels, each screen buffer holds at most 4,096 placements (past that, the
  oldest placements that no other placement hangs from are dropped first), one placement (`c=`, `r=`) covers at most
  10,000 cells, and the fastest animation
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
  per frame, written once and reused by later saves. Amended 2026-10-31 (DL-270, SP-337): each saved frame's PNG bytes are kept as is, since SP-337 stores already-compressed media unchanged, but as a payload-store entry referenced by BLAKE3 id, so identical frames are stored once and the scrollback record holds only the reference; SP-332 still owns the quota and the backup exclusion, and the storage owner must give saved-scrollback payloads a class that backups skip. Placeholder cells on restored lines resolve only to restored
  images, so a program in the new session that reuses an image id never paints into the old scrollback. Saved
  images follow the saved scrollback's own storage, retention and backup rules (SP-332): they stay on this machine
  and are excluded from backups, exports and sync; they are part of the bounded `best_effort_durable` transcript
  tier (SMPFS-061, SMPFS-109). The accessible buffer and agent reads describe an image as `[image W×H px]` (with ",
  animated" when it is), a Unicode-placeholder run as `[image]`, and an image saved scrollback could not keep by its
  placeholder label; agent reads never return image bytes and images never enter model context (SMPFS-133). This
  is the decision DL-035 left out, and DL-035's own-engine rule stands: an image decoder is not a terminal
  emulator, terminal parser or PTY-abstraction library, while every protocol parser, placement model and image
  store is Puppet Master's own code (SMPFS-184).
  Amended 2026-10-10 (DL-187, D37): saved images also count toward the 512 MiB total of every terminal's saved
  copy together (Plans/storage-plan.md#SP-332). When deleting other terminals' saved copies cannot make room for
  a full per-terminal quota, the terminal being saved keeps fewer of its images, dropped oldest first by the rule
  above and leaving their placeholder labels; text still never gives way to images.
gui_related: true
gui_classification_reason: Admits the image protocols the terminal tab draws and sets the limits and refusals users see.
split_recommended: false
depends_on:
- DL-182
- DL-187
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
- "A screen buffer keeps at most 4,096 placements, and the 4,097th drops the oldest placement that no other placement hangs from; no placement covers more than 10,000 cells."
- "Every file-medium read failure answers exactly EBADF:Failed to read image file; /proc, /sys and /dev (except /dev/shm) are refused; symlink loops fail; temporary files are deleted only inside /tmp or /dev/shm and only with tty-graphics-protocol in the path; shared memory is unlinked after reading."
- "A remote (SSH) session and a command an agent typed can send images only by direct transmission; their file, temporary-file and shared-memory media get EBADF."
- "Every error reply is one of the fixed strings and never echoes program data."
- "Output after an image waits for it; images anchor, scroll, reflow and clip with their cells; text written over sixel and iTerm2 images cuts them out; tmux passthrough works through Unicode placeholders."
- "Saved scrollback keeps images within the SP-332 quota; text never gives way to images; an evicted image leaves its placeholder label; a restored placeholder id never resolves to an image of the new session; saved images are never backed up, exported or synced."
- "The accessible buffer and agent reads use [image W×H px], [image] and the placeholder label and never return image bytes; under Reduced Motion an animated image holds its first frame; while the terminal is hidden it pauses."
- "When the 512 MiB total cannot be met by deleting other terminals' saved copies, the terminal being saved drops its oldest images first, each leaving its placeholder label, and keeps all of its text."
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
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-e741dfbc6c.md, SHA-256 5fe7d1e04e5e54c47013c503254527265b94420239772ac711f760f43f96674d (R36; concept lineage only)"
- Plans/Decision_Log.md#DL-187
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D37)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md, SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc (section 7, the total cap's last step; concept lineage only)"
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
- "Amended 2026-10-10 (DL-187, D37): saved images count toward the 512 MiB total across terminals, and the terminal being saved gives up its oldest images when other copies cannot make room."
- "Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): Adds the placement limits, at most 4,096 placements per screen buffer (the oldest placements nothing hangs from drop first) and at most 10,000 cells per placement."
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
  `Plans/Tools.md#T-007`, `Plans/Tools.md#T-171`, `Plans/Permissions_System.md#PS-041`, `#PS-129`, `#PS-130`), and no wording in the permission row, its
  hover tags or the Agent input menu suggests that commands are pre-approved.
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
- "No text in the permission row, its hover tags or the Agent input menu says or implies that commands are pre-approved."
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
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-e741dfbc6c.md, SHA-256 5fe7d1e04e5e54c47013c503254527265b94420239772ac711f760f43f96674d (R36; concept lineage only)"
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
- "Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): States that no wording in the permission row, its hover tags or the Agent input menu suggests commands are pre-approved."
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
  `bell` field is Follow look or Off, DL-213, so there is no audible bell). A bell, or an OSC 9, OSC 777 or OSC 99
  notification, in a terminal tab the user is not looking at sets that tab's attention mark (the hollow square,
  cleared when the user activates the tab) and is announced politely. Notification text is program text shown as
  plain text; it creates no new notification family and is routed through the attention model (SMPFS-031,
  SMPFS-032). This is the policy for other notification protocols that SMPFS-162 refers to. Find
  searches the retained scrollback with regular expressions, case, whole word and highlight-all, under SMPFS-020's
  search rules. Copy mode is keyboard selection over the grid, with character, line and block selection as
  explicit choices (a plain pointer drag stays linear, SMPFS-020, and Alt+drag is the pointer's explicit block choice; amended
  2026-10-17, DL-228); quick select labels the URLs, paths, hashes and IP
  addresses in view so one key copies, inserts at the prompt or opens. IME composition stays at the cursor cell
  (SMPFS-136, SMPFS-158). The accessible plain-text buffer is SMPFS-126's text mirror shown as plain text with each
  command as a heading and moved through command by command; images read as SMPFS-181 says. The sticky command
  header, command jumps and the scrollbar's command, failure and search marks resolve from command blocks and
  degrade honestly when backing is pruned (SMPFS-023). Effects idle stop: the effects, their frame budget and the
  idle rule are `Plans/FinalGUISpec.md#F3-643`'s; on the engine side every effect goes idle within 10 s of the last
  output or keystroke, after which the engine draws no effect frame until the next output or keystroke (SMPFS-073).
  Amended 2026-10-10 (DL-187, D38): system notifications. An OSC 9, OSC 777 notify or OSC 99 notification from a
  terminal raises a system notification while Puppet Master is in the background; in the foreground it is
  announced and an unfocused tab gets its attention mark, as above. At most one notification every 3 s per
  terminal reaches the system; clicking one brings that terminal forward. Each terminal can be muted: the mute is
  that tab's state, set by the typed local action ui.terminal.mute_notifications with no receipt and no event, and
  kept with the tab (Plans/storage-plan.md#SP-330); a muted terminal raises no system notification. Where the
  platform has no system notifications there is no mute and nothing is raised. Where the platform asks the user's
  permission first (the web client's browser, for example), it is asked only after a notification has arrived, once, in an
  inline notice when the user is back: Allow, Mute this terminal, Not now. The notification's text is the
  program's text, shown as plain text, and a system notification is still no new notification family. The menu
  rows and the notice's look are Plans/FinalGUISpec.md#F3-641's.
  Under Full CRT a command mark sits beside its row as the tube shows it, inset by the case and bent by the
  curvature; when the shell redraws a prompt, including Ctrl+L or a completion list, the prompt keeps its
  mark (F3-641).
  Amended 2026-10-17 (DL-228): OSC 52: a program may write the clipboard only while its terminal has focus,
  never read it (a read request is not answered), and a write over 1 MiB is ignored; the P1 allow, ask and
  deny policy then applies on top, a remote session or an agent-typed command asking first where that policy
  says. What the terminal tells programs: TERM=xterm-256color, COLORTERM=truecolor and
  TERM_PROGRAM=PuppetMaster, PM_AGENT=<name> on a command an agent ran (so programs such as git can turn their
  pager off), XTVERSION answers "PuppetMaster <version>", and the dark or light report (CSI ? 996 n) follows
  the drawn scheme's ground.
gui_related: true
gui_classification_reason: Owns the engine behaviour behind the terminal's visible marks, links, find, copy mode, bell and accessible buffer.
split_recommended: false
depends_on:
- DL-181
- DL-187
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
- "While Puppet Master is in the background, an OSC 9, OSC 777 notify or OSC 99 notification from an unmuted terminal raises one system notification, at most one every 3 s per terminal, and clicking it brings that terminal forward; a muted terminal raises none; the mute moves and reopens with its tab and takes no receipt or event; where the platform has none, there is no mute row and nothing is raised."
- "Where the platform asks permission, the request comes only after a notification arrived, once, as an inline notice with Allow, Mute this terminal and Not now, never at startup."
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
- Plans/Decision_Log.md#DL-187
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D38)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md, SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc (sections 1 and 2: notifications, the 3 s limit, the mute and the permission notice; concept lineage only)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/terminal-SPEC-dbffa7a1b2.md, SHA-256 a9578d34c425186b4213ea2117ac19ea6393220efc173861a7beb4afeb7b12a8 (small-round concept lineage only)"
preserved_exact_tokens:
- "SMPFS-183"
- "ui.terminal.mute_notifications"
- "Mute this terminal"
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
- "Do not raise more than one system notification every 3 s per terminal, raise one from a muted terminal, or ask notification permission before a notification has arrived."
compatibility_only_notes:
- "The OSC 6973 sequences and the pmn parameter are the concept's lineage, not product names; the native engine chooses its own private sequence."
stale_retired_dispositions:
- "Amended 2026-10-10 (DL-187, D38): terminal notifications raise system notifications while Puppet Master is in the background, at most one every 3 s per terminal, with a per-terminal mute (lead ruling F5)."
- "Closes 2026-10-09 (DL-181) the terminal audit's Section 15 gaps on OSC 8, bell and OSC 9, 777 and 99 notifications that SMPFS-162 cited as an existing policy."
- "Amended 2026-10-11 (wave 2, terminal SPEC dbffa7a1b2): Command marks stay with their displayed Full CRT row and survive a shell-redrawn prompt."
- "Amended 2026-10-16 (DL-213, Jared's P14): the bell field is Follow look or Off; it read follow, visual or off."
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


### SMPFS-310 — browser.context_captured owner contract

```yaml
plan_unit_id: SMPFS-310
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  browser.context_captured 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/browser_context_captured-search.json. Reused sources: Plans/assistant-chat-design.md:508,894-900, Plans/storage-plan.md:1154-1166, Plans/Section15_MVP_Promoted_Features_Spec.md:757, Plans/UI_Command_Catalog.md:824-846. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Assistant chat capture handoff for cmd.browser.pick_element_for_chat, cmd.browser.add_selection_to_chat and the two selection+screenshot commands (UCC-064). Resolve the explicitly selected thread first, else the owning chat surface (including hidden chat), else require visible explicit new-thread creation. Never automatically create a thread, choose a focused unrelated thread, or send. Only after the resolved composer has committed its typed pending chip may the capture outcome append. A missing writable target stays an explicit unresolved interaction with no chip/event success. Screenshot variants additionally require RAP-054 admission, real Project/run/attempt and original artifact custody; otherwise handler_unavailable without capture/append/checkpoint. Protected auth content refuses before capture.
  Scope: actual ordinary browser namespace = kind(project/app), project_id(real or null only for app), user_id, computer_id, profile_id; all scope fields are required. EventRecord.project_id equals scope.project_id; never fabricate a Project for app chat. scope_key is SHA-256 of canonical MessagePack scope map, sorted by UTF-8 keys. A resolved thread must belong to that actual namespace; optional command thread_id becomes required resolved thread_id in the successful durable capture. AuthBrowserSession is forbidden.
  Identity: stable original event_id allocated once; Idempotency key is application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)} from the immutable OriginalBrowserTransitionSource.original_operation_id; Project scope: sha256(canonical MessagePack array ["browser.context_captured", "1.0.0", actual scope map with UTF-8 sorted keys, thread_id, chip_id]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_browser_context_captured.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.browser_context_captured.v1@1.0.0, operating as Assistant chat browser capture history reader, reads only browser.context_captured@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.browser_context_captured:{scope_key}, value Plans/ds15_browser_context_captured_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Chip value binding: Plans/ds15_browser_capture_chip_v2.schema.json governs the typed browser entry inside composer_prep_state.v1:{thread_id}. No browser-owned composer or separate chip storage family. Migration validates actual thread/namespace and preserves sibling entries and draft bytes; unresolved legacy chip stays visibly unavailable, never silently reassigned. Append/passive replay cannot recreate a chip that the user sent or removed. Read/serialization rechecks current permissions, source deletion and chip blocked/expired/scrubbed/revoked state; unavailable chips may remain visible but never serialize as successful attachments.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-327 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Application source binding: resolve the authentic original application Server and immutable capture-operation identity from Plans/application_workflow_sources.schema.json#/$defs/OriginalBrowserTransitionSource, interface owner.browser.transition.application@1.0.0. Its server_id and original_operation_id (the owner_operation_id in CV-366) yield the exact UTF-8 lowercase-hex key application@1:{hex(server_id)}:{hex(owner_operation_id)}. Resolve this source at admission, retain its identity and original outcome with the composer chip under SP-286, and compare immutable original source/thread/actual ordinary user/Computer/profile/BrowserSession joins on retry. A current Server/focus/timestamp cannot remint it. Project scope retains its separately specified canonical MessagePack recipe unchanged. scope_key remains only a checkpoint namespace hash, never the application envelope idempotency key. Reject raw hashes and wrong/missing Server or original-operation identity. Schema-shaped source fixtures establish no native owner authority.
  Round 2 exact-family boundaries for browser.context_captured: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for browser.context_captured: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax. Browser source authentication: independently resolve accepted_source_ref to retained owner bytes (static bank browser_owner_records; native owner still NOT_RUN), validate closed Plans/ds15_browser_owner_record.schema.json, and recompute every CV-366 accepted_source semantic digest. The closed preimage is {schema_id, schema_version, scope, record: complete selected semantic record, identity: {server_id: scope.server_id, original_operation_id: record.original_operation_id or null, workspace_id: record.workspace_id or null}}. Input/output cover the full selected BrowserWorkspaceApplicationV1 including controller evidence; accepted_source covers the separate complete owner record; source_sha256 covers the complete OriginalBrowserTransitionSource with only source_sha256 omitted. These are semantic commitments, not SP-337 addresses or physical record digests. Owner evidence binds the independently resolved accepted record by ref, recomputed hash and exact method/revision/generation. Every stage must be accepted and join its original operation, owner method, request/result and evidence to that record. Original input/output must agree on scope/profile/workspace/session and retained source. The complete capture payload, including provenance_ref, must match the owner record; current composer observations also join provenance_ref. A source copy or well-shaped digest grants no authority.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority. The independently retained Browser owner record additionally binds the complete original_input_body and original_output_body, omitting only their derived controller_evidence. Full input/output semantic digests include that evidence; no other workspace field can be changed behind a recomputed hash.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-310
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-311 — dev.session.started owner contract

```yaml
plan_unit_id: SMPFS-311
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  dev.session.started 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/dev_session_started-search.json. Reused sources: Plans/Section15_MVP_Promoted_Features_Spec.md:209,244-247,9433, Plans/storage-plan.md:1071,18287,18343, Plans/Shared_Integration_Runtime.md:259, Plans/UI_Command_Catalog.md:919-921. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Section15 managed developer-workflow service handles cmd.dev.start_session and successful replacement launch under cmd.dev.restart_session. After actual managed workflow launch/attachment succeeds, commit running workflow outcome with the same aggregate dev_session_id and next workflow_revision. previous_state is created or restarting; workflow_state is running. No event on failed launch and no fabricated dap_session_id for a non-debug workflow.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["dev.session.started", "1.0.0", actual project_id, dev_session_id, workflow_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_dev_session_started.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.dev_session_started.v1@1.0.0, operating as Developer workflow history reader, reads only dev.session.started@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.dev_session_started:{project_id}, value Plans/ds15_dev_session_started_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-328 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for dev.session.started: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for dev.session.started: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-311
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-312 — dev.session.stopping owner contract

```yaml
plan_unit_id: SMPFS-312
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  dev.session.stopping 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/dev_session_stopping-search.json. Reused sources: Plans/Section15_MVP_Promoted_Features_Spec.md:209,244-247,9433, Plans/storage-plan.md:1071,18287,18343, Plans/Shared_Integration_Runtime.md:259, Plans/UI_Command_Catalog.md:919-921. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Section15 managed developer-workflow service accepts cmd.dev.stop_session. Commit the accepted stopping intent from running or restarting with workflow_state stopping and next workflow_revision before terminal stop publication. This is managed workflow intent, not proof a PTY or DAP process terminated.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["dev.session.stopping", "1.0.0", actual project_id, dev_session_id, workflow_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_dev_session_stopping.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.dev_session_stopping.v1@1.0.0, operating as Developer workflow history reader, reads only dev.session.stopping@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.dev_session_stopping:{project_id}, value Plans/ds15_dev_session_stopping_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-328 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for dev.session.stopping: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for dev.session.stopping: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-312
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-313 — dev.session.stopped owner contract

```yaml
plan_unit_id: SMPFS-313
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  dev.session.stopped 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/dev_session_stopped-search.json. Reused sources: Plans/Section15_MVP_Promoted_Features_Spec.md:209,244-247,9433, Plans/storage-plan.md:1071,18287,18343, Plans/Shared_Integration_Runtime.md:259, Plans/UI_Command_Catalog.md:919-921. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Section15 managed developer-workflow service records the actual stop/detach outcome after cmd.dev.stop_session or cmd.browser.stop_agent_keep_browser. Managed resources must be settled under their own owners before workflow_state stopped; previous_state may be stopping, running or restarting for the already specified direct browser keep-open path. The BrowserSession may remain open. Never turn a workflow stop into a fabricated terminal exit or DAP termination.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["dev.session.stopped", "1.0.0", actual project_id, dev_session_id, workflow_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_dev_session_stopped.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.dev_session_stopped.v1@1.0.0, operating as Developer workflow history reader, reads only dev.session.stopped@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.dev_session_stopped:{project_id}, value Plans/ds15_dev_session_stopped_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-328 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for dev.session.stopped: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for dev.session.stopped: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-313
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-314 — dev.session.restarting owner contract

```yaml
plan_unit_id: SMPFS-314
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  dev.session.restarting 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/dev_session_restarting-search.json. Reused sources: Plans/Section15_MVP_Promoted_Features_Spec.md:209,244-247,9433, Plans/storage-plan.md:1071,18287,18343, Plans/Shared_Integration_Runtime.md:259, Plans/UI_Command_Catalog.md:919-921. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: Section15 managed developer-workflow service accepts cmd.dev.restart_session from running or stopped. Commit workflow_state restarting and next workflow_revision for the accepted operation before replacement launch. Preserve dev_session_id aggregate continuity; a concrete replacement PTY/DAP gets its owner-resolved identity. Restart intent is not successful replacement launch; dev.session.started records that later outcome separately.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["dev.session.restarting", "1.0.0", actual project_id, dev_session_id, workflow_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_dev_session_restarting.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.dev_session_restarting.v1@1.0.0, operating as Developer workflow history reader, reads only dev.session.restarting@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.dev_session_restarting:{project_id}, value Plans/ds15_dev_session_restarting_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-328 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for dev.session.restarting: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for dev.session.restarting: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-314
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-315 — preview.session.started owner contract

```yaml
plan_unit_id: SMPFS-315
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  preview.session.started 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/preview_session_started-search.json. Reused sources: Plans/rewrite-tie-in-memo.md:231-302, Plans/FinalGUISpec.md:3584, Plans/storage-plan.md:1180-1187, Plans/FileManager.md:616-626, Plans/UI_Command_Catalog.md:463-464,9570-9588. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: PreviewSession owner consumes cmd.orchestrator.preview_open after resolving the document/artifact subject and actually creating/loading the runtime. Commit runtime_state loading with actual preview_session_id and revisions before publication. A reveal or placement change of an existing live session emits no new start. Restore reconstructs a fresh verified runtime, never treats cached running as liveness.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["preview.session.started", "1.0.0", actual project_id, preview_subject_id, preview_session_id, preview_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_preview_session_started.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.preview_session_started.v1@1.0.0, operating as Preview subject history reader, reads only preview.session.started@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.preview_session_started:{project_id}, value Plans/ds15_preview_session_started_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-329 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for preview.session.started: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for preview.session.started: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-315
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-316 — preview.session.refreshed owner contract

```yaml
plan_unit_id: SMPFS-316
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  preview.session.refreshed 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/preview_session_refreshed-search.json. Reused sources: Plans/rewrite-tie-in-memo.md:231-302, Plans/FinalGUISpec.md:3584, Plans/storage-plan.md:1180-1187, Plans/FileManager.md:616-626, Plans/UI_Command_Catalog.md:463-464,9570-9588. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: PreviewSession owner commits an actual refresh/hot-reload outcome for a refreshable visible subject (FileManager sections 13/14.6). A browser-backed ordinary session uses production cmd.browser.reload (UCC-117), preserving BrowserSession identity/class and recovery identity. Non-browser refresh uses the existing FileManager subject refresh/hot-reload action, producer hook filemanager.preview_refresh; this is an internal producer label, not a new public command. Never dispatch a browser command without a browser subject. Emit only after the owner commits the new preview_revision and ready output, not watcher notification or queue acceptance. Preserve or replace preview_session_id according to the existing continuity tuple; resolve actual runtime after source changes, never guess from the old tab.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["preview.session.refreshed", "1.0.0", actual project_id, preview_subject_id, preview_session_id, preview_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_preview_session_refreshed.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.preview_session_refreshed.v1@1.0.0, operating as Preview subject history reader, reads only preview.session.refreshed@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.preview_session_refreshed:{project_id}, value Plans/ds15_preview_session_refreshed_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-329 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for preview.session.refreshed: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for preview.session.refreshed: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-316
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-317 — preview.session.stopped owner contract

```yaml
plan_unit_id: SMPFS-317
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  preview.session.stopped 1.0.0 — newly authored owner contract, prepared without admission.
  Search: independently searched top-level Plans/*.md, Plans/*.json and scripts/*.py at e237aebb940767dbb323010fcf029a4df25391a5, excluding ledgers and generated artifacts; per-family exact results and negative binding search are pinned in /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix1/preview_session_stopped-search.json. Reused sources: Plans/rewrite-tie-in-memo.md:231-302, Plans/FinalGUISpec.md:3584, Plans/storage-plan.md:1180-1187, Plans/FileManager.md:616-626, Plans/UI_Command_Catalog.md:463-464,9570-9588. DL-045 explicitly includes this family. Missing technical bindings are newly authored here for existing behavior; no sibling contract substitutes.
  Producer: PreviewSession owner consumes cmd.orchestrator.preview_stop and records actual runtime closure as runtime_state closed after managed resources settle. UI restore intent stays subject-owned; stop does not change build/run state. A closed/historical session cannot stop again on replay; browser overlay closure, where required, remains BrowserRuntimeService-owned.
  Scope: project_only; EventRecord.project_id equals actual payload.project_id; EventRecord.run_id equals payload.run_id when linked and is null when no actual Run is linked. Optional thread/terminal/DAP/browser ids are actual owner joins, never guessed or invented.
  Identity: stable original event_id allocated once; Idempotency key is sha256(canonical MessagePack array ["preview.session.stopped", "1.0.0", actual project_id, preview_subject_id, preview_session_id, preview_revision]). Changed bytes at the same identity refuse. Revisions track actual committed owner transitions, never delivery attempts. Resolve cross-owner identity and current permission at admission and again at final publication.
  Payload: Plans/ds15_preview_session_stopped.schema.json is the exact closed 1.0.0 payload. Only bounded identifiers and opaque owner-resolved non-secret refs: no page/DOM, local absolute paths, cookies, config bodies, credentials, screenshot bytes, command arguments or raw output.
  Ordering and custody: explicitly adopt SP-286 / CV-339 full-value v2 successor and Case L-2/SP-026/SP-236 ordinary SeglogFrameV2 append/read. Check current exact family admission/producer/codec/source and original input custody before work; registry absence fences production today. Commit the authentic owner outcome first, freeze its complete immutable result/event identity, append through the single writer, retain original first AppendReceipt and frozen full value under SP-286, then publish success or terminal result. An interrupted owner outcome is not reconstructed from current UI state. Missing or ambiguous original outcome stays fenced.
  Replay: lost acknowledgement returns original receipt, event_id and frozen payload; retry uses original outcome custody without repeating capture, thread creation, launch, stop, restart or refresh. If original outcome exists but append/receipt is unresolved, inspect single-writer dedupe and recover append using original identity; no new effect. SP-286 stores frozen transition outcome/receipt, not a new DS15 receipt family.
  Consumer: reader.ds15.preview_session_stopped.v1@1.0.0, operating as Preview subject history reader, reads only preview.session.stopped@1.0.0. It adopts SP-278 by name and DL-076 nine-field durable token. Checkpoint key projector.checkpoint.ds15.preview_session_stopped:{project_id}, value Plans/ds15_preview_session_stopped_checkpoint.schema.json. Capture CURRENT-selected complete generic-index coverage, scan the whole selected global sequence range in order with exact family and actual scope filter, and CAS complete prior checkpoint plus new value in one redb transaction. through_sequence_id is last globally scanned sequence, last_event_id last matching event; no checkpoint until first match. Gaps, omitted matches, partial scan, changed source/token/live snapshot/access/deletion/reader or stale full previous value preserve prior checkpoint. Rejoin live redb_snapshot_id at each read/advance/recovery; never persist it. Rebuild captures fresh complete retained source; missing prefix is unavailable, never reset to zero or claimed current. Resolve original event refs for history; replay never replays user actions.
  Redaction/custody: original seglog/first-receipt owner keeps original event bytes; source owners keep original composer/workflow/preview outcomes and refs with verified coherent backup/restore of the full original source/log/receipt closure. Checkpoints are derived and grant no access. Every read rechecks current subject/thread/Project permissions and source deletion/tombstones before disclosure; denied/deleted sources return unavailable without copying content into history.
  Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Retention: retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint. RT candidates are Case L-3 chat content for capture, Runtime/run/node/attempt only when an actual Run exists, approval/receipt/audit authority, or ordinary telemetry; no assignment/expiry/deletion is selected. Do not admit until RT resolves both. Existing value policies remain where unchanged; a broadened schema is held for RT rather than extending a DAP policy to workflow content.
  Compatibility and withdrawal: exact 1.0.0 event/reader only; refuse unknown fields/version before effects or checkpoint. No alias or deployed event predecessor is assumed. Value migrations are explicit coordinator transactions with source backup, validation, owner joins, complete codec verification and store version written last, never lazy rewrite-on-read. Withdrawal fences new writer admissions at committed source frontier under coordinator exclusion, drains original admitted results/receipts, then fences reader/checkpoint advance. In-flight old-reader CAS fails. Mark existing checkpoint withdrawn; preserve canonical originals under their owner policies. Reinstall requires current owner authorization and a fresh SP-278 complete rebuild, never old permission/publication authority.
  Oracles: ATS-329 and exact family cases in Plans/ds15_event_contract_fixtures.json execute via scripts/pm-ds15-event-contracts.py: valid/invalid transition, scope joins, original receipt/outcome recovery, no repeat effect, full coverage/CAS, permission/deletion, rebuild and writer/reader withdrawal. Versioned value cases use Plans/ds15_value_contract_fixtures.json. Static reference models prove no native behavior; native execution NOT_RUN.
  Round 2 exact-family boundaries for preview.session.stopped: current writers and append recovery require EventRecord 2.0.0 with replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and normal append refuses as replay_only_not_appendable. Bind the actual storage instance and app or Storage-encoded project~base64url partition to the complete original EventRecord. Adopt CV-339 exact eleven-field AppendReceipt, stored custody_v2 and full_value_result, with the domain/version/codec-bound complete original EventRecord commitment; a four-field test surrogate is insufficient. Retry equality compares only the CV-317 producer-supplied semantic fields and stable event_id, excluding Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; original full-value custody still commits those original fields immutably. Final publication rechecks current owner authorization, permission, deletion and applicable sharing; denial preserves receipt custody and never reruns the old effect. Pure retained-receipt resolution remains independent of retired source controls under SP-286. Bind scan low/high and every global row to independently verified CURRENT-selected complete source and its exact storage/token identity. A complete later suffix with zero family matches advances the global frontier while retaining the verified prior last_event_id; before the first match no checkpoint exists. SP-337 caps inline body at 16384 bytes; larger content stays in owner-resolved payload references with BLAKE3 id, size and media type, never an enlarged inline body. Identifier patterns require an actual full match, including trailing-LF rejection. These static oracles grant no native proof; NOT_RUN remains.
  Round 7 authenticated history for preview.session.stopped: retained read, checkpoint and rebuild accept supported 1.0.0 originals written with projector_replay_only as well as dedupe_by_idempotency_key. Only current writes/retries enforce replay_only_not_appendable. Authenticate original payload/version and original transition against retained original_context, complete committed outcome, coherent backup closure and SP-286 full-value receipt on every path, before checkpoint equality/advance. Current live transition state is not original authority; current exact-boolean owner authorization, disclosure, source deletion, sharing and withdrawal still fence every historical read/advance. Every selected matching global-index row resolves its own original event/receipt/source and must agree on event_id, event_type, actual scope, scope_partition and Storage-assigned sequence; missing or contradictory sources preserve the prior checkpoint. Authority context is closed by the exact family definition in Plans/ds15_authority_context.schema.json. Check exact boolean and bounded integer types before interpreting flags, comparing revisions/frontiers or hashing. Malformed values refuse with zero effects, never an uncaught comparison exception. All eleven standing checks and item-11 type probes are executable, not inferred from schema syntax.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-317
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-318 — catalog.install.started owner contract

```yaml
plan_unit_id: SMPFS-318
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.install.started 1.0.0 — newly authored owner contract, prepared without admission. Independent search of current top-level Plans Markdown/JSON and scripts Python found required names at UI_Command_Catalog.md:936 and existing install routing at Wiring_Matrix.md:448, but no exact versioned producer/consumer/checkpoint/identity/withdrawal binding; full per-family negative evidence: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix7/catalog_install_started-search.json. Reuse Section15 §3.13, Commands §6.6/CS-066 and Shared Runtime §4.5. DL-045 authorizes only these missing technical bindings.
  Producer: catalog lifecycle controller records the existing subsystem owner beginning actual installation work after current consent/policy/source validation, with the immutable owner start outcome committed; dispatch, admission, queued or accepted-only command state is insufficient. Keep cmd.catalog.install_item as the existing route; item_type is command, skill, plugin, hook, theme or mcp_config. No update/remove admission, active-item/deferred outcome or deletion choice is made. Existing owners resolve item, version, source and actual namespace; an unavailable or ambiguous owner outcome stays unavailable without a fabricated install success.
  Scope: actual Project or application namespace as selected by the existing item owner, including actual user/Computer/profile. Project ids are real; application project_id is null, never synthetic. Project partition is Storage project~base64url. Scope key for checkpoint namespace is SHA-256 of canonical MessagePack scope map in UTF-8 key order. Identity: stable original event_id allocated once; Idempotency key is application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.install.started", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id come from the immutable existing owner operation source, never focus/time. Compare caller-supplied CV-317 semantic body only on retries, excluding Storage-assigned sequence/timestamps; changed semantic bytes conflict with no new effect.
  Payload: exact closed Plans/ds15_catalog_install_started.schema.json; bounded refs only, no executable/config/command bodies, local paths, secrets or installation content. outcome_ref and optional installation_ref resolve the existing owner original transition. Context catalog_owner_payload is the immutable resolved owner outcome, not caller assertion; phase and all fields must match. SP-337 keeps content above 16384 bytes in owner-resolved payload refs, never oversized metadata.
  Ordering: adopt SP-286 / CV-339 full-value original outcome, append and first AppendReceipt. Commit existing owner outcome, freeze original event, single writer append/dedupe, retain original receipt/value, then publish. Missing outcome or coherent backup closure is unavailable; no repeat install on retry or replay. Current writes/retries use dedupe_by_idempotency_key and refuse projector_replay_only as replay_only_not_appendable. Retained supported replay-only history remains readable after authenticating original transition, outcome, source and full-value commitment, independently of current live install state. Current permission, owner authorization, deletion/sharing and withdrawal still fence disclosure.
  Consumer: reader.ds15.catalog_install_started.v1@1.0.0, Catalog installation history reader for only catalog.install.started@1.0.0, adopts SP-278 by name and DL-076 nine-field token. Checkpoint key projector.checkpoint.ds15.catalog_install_started:{scope_key}, value Plans/ds15_catalog_install_started_checkpoint.schema.json. Capture CURRENT-selected complete global range and live redb_snapshot_id; persist only nine-field durable token, never the live snapshot. Scan every global row, resolve each matching event original custody and join id/type/scope/partition/Storage sequence. CAS complete previous checkpoint and new checkpoint in one redb transaction; gaps/omissions, changed token/snapshot/source/access or any contradictory original preserve previous. through_sequence_id is globally scanned frontier; last_event_id is last verified matching event. No checkpoint before first match; zero-match suffix retains prior last event. Rebuild requires complete retained prefix and fresh current access.
  Compatibility and withdrawal: supported exact 1.0.0 event/reader only; unknown version/field refuses before effects/checkpoint. Withdrawal fences new admissions at committed source frontier, drains only original admitted outcomes/receipts, then fences reader CAS/marks checkpoint withdrawn. Reinstall requires authorization and a complete fresh rebuild; no replay dispatch. Original source/log/receipt backup and redaction/deletion owners remain authoritative. Authority inputs use closed exact-family context schema and exact boolean/bounded integer types before interpretation; malformed values refuse with zero effects.
  Retention: event and checkpoint retention_policy_ref=PENDING_RETENTION_DECISION; RT must choose between existing receipt/audit or telemetry classes; no policy, expiry or deletion is selected. Registry membership remains absent.
  Oracles: ATS-329 and own family fixtures in Plans/ds15_event_contract_fixtures.json, numeric fixtures and scripts/pm-ds15-event-contracts.py cover start/terminal source, false-success queue/admission refusals, semantic retry, full-value custody, Storage joins, replay-only history, permission/deletion, complete coverage/CAS, rebuild and writer/reader withdrawal. Native execution NOT_RUN; static preparation is no production admission.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Event identity, original outcome custody and reader contracts.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family positive and negative static oracles pass; no production admission or native proof.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-318
negative_constraints:
- No admission, retention/deletion decision, update/remove policy, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-319 — catalog.install.completed owner contract

```yaml
plan_unit_id: SMPFS-319
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.install.completed 1.0.0 — newly authored owner contract, prepared without admission. Independent search of current top-level Plans Markdown/JSON and scripts Python found required names at UI_Command_Catalog.md:936 and existing install routing at Wiring_Matrix.md:448, but no exact versioned producer/consumer/checkpoint/identity/withdrawal binding; full per-family negative evidence: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/fix7/catalog_install_completed-search.json. Reuse Section15 §3.13, Commands §6.6/CS-066 and Shared Runtime §4.5. DL-045 authorizes only these missing technical bindings.
  Producer: catalog lifecycle controller records the existing subsystem owner effective installation commit. For an executable installation this is verified activation/ready under Shared Runtime §4.5; commands, skills, plugins/hooks, themes and MCP configs use their own canonical install commit. Never substitute download, queue acceptance, a UI acknowledgement or a universal executable machine for that owner outcome. Keep cmd.catalog.install_item as the existing route; item_type is command, skill, plugin, hook, theme or mcp_config. No update/remove admission, active-item/deferred outcome or deletion choice is made. Existing owners resolve item, version, source and actual namespace; an unavailable or ambiguous owner outcome stays unavailable without a fabricated install success.
  Scope: actual Project or application namespace as selected by the existing item owner, including actual user/Computer/profile. Project ids are real; application project_id is null, never synthetic. Project partition is Storage project~base64url. Scope key for checkpoint namespace is SHA-256 of canonical MessagePack scope map in UTF-8 key order. Identity: stable original event_id allocated once; Idempotency key is application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.install.completed", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id come from the immutable existing owner operation source, never focus/time. Compare caller-supplied CV-317 semantic body only on retries, excluding Storage-assigned sequence/timestamps; changed semantic bytes conflict with no new effect.
  Payload: exact closed Plans/ds15_catalog_install_completed.schema.json; bounded refs only, no executable/config/command bodies, local paths, secrets or installation content. outcome_ref and optional installation_ref resolve the existing owner original transition. Context catalog_owner_payload is the immutable resolved owner outcome, not caller assertion; phase and all fields must match. SP-337 keeps content above 16384 bytes in owner-resolved payload refs, never oversized metadata.
  Ordering: adopt SP-286 / CV-339 full-value original outcome, append and first AppendReceipt. Commit existing owner outcome, freeze original event, single writer append/dedupe, retain original receipt/value, then publish. Missing outcome or coherent backup closure is unavailable; no repeat install on retry or replay. Current writes/retries use dedupe_by_idempotency_key and refuse projector_replay_only as replay_only_not_appendable. Retained supported replay-only history remains readable after authenticating original transition, outcome, source and full-value commitment, independently of current live install state. Current permission, owner authorization, deletion/sharing and withdrawal still fence disclosure.
  Consumer: reader.ds15.catalog_install_completed.v1@1.0.0, Catalog installation history reader for only catalog.install.completed@1.0.0, adopts SP-278 by name and DL-076 nine-field token. Checkpoint key projector.checkpoint.ds15.catalog_install_completed:{scope_key}, value Plans/ds15_catalog_install_completed_checkpoint.schema.json. Capture CURRENT-selected complete global range and live redb_snapshot_id; persist only nine-field durable token, never the live snapshot. Scan every global row, resolve each matching event original custody and join id/type/scope/partition/Storage sequence. CAS complete previous checkpoint and new checkpoint in one redb transaction; gaps/omissions, changed token/snapshot/source/access or any contradictory original preserve previous. through_sequence_id is globally scanned frontier; last_event_id is last verified matching event. No checkpoint before first match; zero-match suffix retains prior last event. Rebuild requires complete retained prefix and fresh current access.
  Compatibility and withdrawal: supported exact 1.0.0 event/reader only; unknown version/field refuses before effects/checkpoint. Withdrawal fences new admissions at committed source frontier, drains only original admitted outcomes/receipts, then fences reader CAS/marks checkpoint withdrawn. Reinstall requires authorization and a complete fresh rebuild; no replay dispatch. Original source/log/receipt backup and redaction/deletion owners remain authoritative. Authority inputs use closed exact-family context schema and exact boolean/bounded integer types before interpretation; malformed values refuse with zero effects.
  Retention: event and checkpoint retention_policy_ref=PENDING_RETENTION_DECISION; RT must choose between existing receipt/audit or telemetry classes; no policy, expiry or deletion is selected. Registry membership remains absent.
  Oracles: ATS-329 and own family fixtures in Plans/ds15_event_contract_fixtures.json, numeric fixtures and scripts/pm-ds15-event-contracts.py cover start/terminal source, false-success queue/admission refusals, semantic retry, full-value custody, Storage joins, replay-only history, permission/deletion, complete coverage/CAS, rebuild and writer/reader withdrawal. Native execution NOT_RUN; static preparation is no production admission.
  Round 7 type/source refinement: original_context retains the complete writer transition schema; retained read/checkpoint/rebuild require only current scope and exact-boolean owner authorization, plus the existing disclosure/deletion/share/withdrawal fences. They do not require disposed live transition controls. Plans/ds15_index_inputs.schema.json closes the independent selected global source rows before partition/sequence work. Checkpoint schema/byte validation is the shared checkpoint_value_ok used by actual advance and the static checkpoint_boundary oracle; the boundary grants no advance or append authority.
  Round 7 closed evidence carrier: Plans/ds15_original_evidence.schema.json validates original/outcome wrappers, source-map shape and exact carrier metadata types before interpretation; only fields consumed by the operation are required. Original source controls remain frozen, and retained current disclosure context needs only actual subject scope and exact owner authorization. Every envelope joins the complete requested subject scope to the authenticated payload namespace. Candidate semantic body equality is checked before identity/hash construction. Unchanged checkpoint/rebuild results also verify complete selected source and each original Storage join. Pure stored receipt recovery still does not require disposed live transition controls. These are newly authored technical validation bindings, not a native admission.
gui_related: false
gui_classification_reason: Event identity, original outcome custody and reader contracts.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family positive and negative static oracles pass; no production admission or native proof.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SMPFS-319
negative_constraints:
- No admission, retention/deletion decision, update/remove policy, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-320 — browser.context_shared deck-2 owner contract

```yaml
plan_unit_id: SMPFS-320
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  browser.context_shared 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-433 on origin/plans/ea-cards2-answers-20261105, presented deck item 4.c, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: Keep a separate sharing grant for each recipient chat. Sharing with another chat keeps earlier grants. Stop sharing with a named chat removes only that grant; Stop sharing without a chat removes every grant for the selected browser session. Sharing itself never copies page contents into chat.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:830-831`; `MAIN:Plans/UI_Command_Catalog.md:843-846`; `DS15:reports/event-authority-20261104/DS15.md:91-94`; `evidence:reviews/DS15-sol/REVIEW.md:55-61`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:99-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/browser_context_shared-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-433 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: Browser session sharing controller for cmd.browser.share_with_agent commits one recipient-chat grant. The resolved recipient must have the same actual subject scope. Preserve every prior grant, including grants to other chats. There is one grant per recipient chat; an already-held grant retains its existing grant identity. This records sharing authority only; no page body, screenshot, DOM, selection, capture chip, message send or browser.context_captured effect follows.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["browser.context_shared", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_browser_context_shared.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. This exact family uses the existing DS15 integer boundary unchanged pending the shared CV-1100/SP-1100/SP-1101 sweep; no new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.browser_context_shared.v1@1.0.0 is the exact operating browser.context_shared history reader and reads only browser.context_shared@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.browser_context_shared:{scope_key}, closed value Plans/ds15_browser_context_shared_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event retention adopts DL-401 G10 / RP-CHAT-THREAD-LIFETIME@1.0.0 from the Storage retention owner branch: the payload thread_id is the governing recipient chat, including No project. At most 250000 per chat then linked successor; no records dropped, holds and chat deletion deadlines apply. The policy object must be integrated before admission. Checkpoint retention_policy_ref=PENDING_RETENTION_DECISION. Exact question: What retention and deletion rule governs the scope-wide browser.context_shared reader checkpoint when its source events belong to different recipient chats? Current chat permissions and deletion fences apply even while this assignment is pending. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in origin/plans/ea-retention-cards2-20261105:Plans/storage-plan.md, commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact browser.context_shared section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family browser.context_shared. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family browser.context_shared
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md#DL-433
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/browser_context_shared-search.json
preserved_exact_tokens:
- SMPFS-320
- browser.context_shared
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-321 — browser.context_share_revoked deck-2 owner contract

```yaml
plan_unit_id: SMPFS-321
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  browser.context_share_revoked 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-433 on origin/plans/ea-cards2-answers-20261105, presented deck item 4.c, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: Keep a separate sharing grant for each recipient chat. Sharing with another chat keeps earlier grants. Stop sharing with a named chat removes only that grant; Stop sharing without a chat removes every grant for the selected browser session. Sharing itself never copies page contents into chat.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:830-831`; `MAIN:Plans/UI_Command_Catalog.md:843-846`; `DS15:reports/event-authority-20261104/DS15.md:91-94`; `evidence:reviews/DS15-sol/REVIEW.md:55-61`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:99-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/browser_context_share_revoked-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-433 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: Browser session sharing controller for cmd.browser.revoke_share_with_agent commits removal. Normalize an omitted recipient to thread_id=null in this event; a named recipient removes only that grant, leaving all other grants intact; null removes every grant for the selected browser_session_id. Other browser sessions remain untouched. This revokes sharing authority only and never creates a capture or page-content record.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["browser.context_share_revoked", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_browser_context_share_revoked.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. This exact family uses the existing DS15 integer boundary unchanged pending the shared CV-1100/SP-1100/SP-1101 sweep; no new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.browser_context_share_revoked.v1@1.0.0 is the exact operating browser.context_share_revoked history reader and reads only browser.context_share_revoked@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.browser_context_share_revoked:{scope_key}, closed value Plans/ds15_browser_context_share_revoked_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: DL-401 G10 assigns this event family to Chat, but an omitted-chat revoke can affect several recipient chats. Event retention_policy_ref=PENDING_RETENTION_DECISION. Exact question: For one browser.context_share_revoked record that removes every session grant across several chats, which chat or combination of chat deletion/hold lifetimes governs that record? Do not silently select a chat, split one command into new event behavior, or keep it indefinitely. Checkpoint retention_policy_ref=PENDING_RETENTION_DECISION. Exact question: What retention and deletion rule governs the scope-wide browser.context_share_revoked reader checkpoint when its source events belong to different recipient chats? Current chat permissions and deletion fences apply even while this assignment is pending. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in origin/plans/ea-retention-cards2-20261105:Plans/storage-plan.md, commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact browser.context_share_revoked section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family browser.context_share_revoked. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family browser.context_share_revoked
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md#DL-433
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/browser_context_share_revoked-search.json
preserved_exact_tokens:
- SMPFS-321
- browser.context_share_revoked
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-322 — catalog.update.started deck-2 owner contract

```yaml
plan_unit_id: SMPFS-322
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.update.started 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-434 on origin/plans/ea-cards2-answers-20261105, presented deck item 4.d, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: For the listed uses, keep the current verified version and queue the update until the next safe reload or start allowed by the component that uses it. Save completion only when the new version takes effect. You keep using the old version until it is safe to switch.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:936-938`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:563-564`; `DS15:reports/event-authority-20261104/DS15.md:97-100`; `evidence:reviews/DS15-sol/REVIEW.md:63-69`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:100-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:98-104`; `MAIN:Plans/Commands_System.md:505-514`; `MAIN:Plans/Commands_System.md:7089-7102`; `MAIN:Plans/Skills_System.md:35-35`; `MAIN:Plans/Skills_System.md:157-189`; `MAIN:Plans/Skills_System.md:315-325`; `MAIN:Plans/Plugins_System.md:511-519`; `MAIN:Plans/Plugins_System.md:43-48`; `MAIN:Plans/Plugins_System.md:4288-4292`; `MAIN:Plans/MCP_Integration.md:119-149`; `MAIN:Plans/MCP_Integration.md:161-174`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:561-565`; `MAIN:Plans/FinalGUISpec.md:2322-2326`; `MAIN:Plans/Skills_System.md:152-169`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_update_started-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-434 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: catalog lifecycle controller, cmd.catalog.update_item, records the existing item owner beginning actual update work at its permitted safe reload/start. Queuing preserves the verified previous_version and is not a started or completed transition. The original source must prove the owner permits this boundary and stage=applying; effective_version remains previous_version until activation.
  Exact approved listed uses (technical labels only, not new persisted product states): {"command": ["open_edit_session", "component_reference"], "skill": ["selected_request", "instructions_loaded_or_invoked", "persona_reference"], "plugin": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "hook": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "mcp_config": ["configured_or_connected", "persona_reference"]}. Existing stricter outcomes are excluded. Removing an open-editor command remains refused; active theme edits remain immediate; every selected skill request keeps its exact selected version before loading/invocation; plugin renewed approval/recovery, MCP credentials/current connection version, personal customizations and external-service data remain governed by their existing owners. No extra item type or use is covered. A component must supply its already-owned safe-boundary proof; missing or ambiguous proof remains unavailable, never guessed.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.update.started", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_catalog_update_started.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. This exact family uses the existing DS15 integer boundary unchanged pending the shared CV-1100/SP-1100/SP-1101 sweep; no new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.catalog_update_started.v1@1.0.0 is the exact operating catalog.update.started history reader and reads only catalog.update.started@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.catalog_update_started:{scope_key}, closed value Plans/ds15_catalog_update_started_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and checkpoint adopt DL-401 G11 / RP-AUTHORITY-INDEFINITE@1.0.0: creation anchored, metadata/references only, no age/count expiry or count cap, holds and Storage pressure/fail-closed budget rules remain. Neither retained installation history nor a removal event retains executable, configuration, skill, theme, user override or external-service content forever. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in origin/plans/ea-retention-cards2-20261105:Plans/storage-plan.md, commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact catalog.update.started section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family catalog.update.started. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family catalog.update.started
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md#DL-434
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_update_started-search.json
preserved_exact_tokens:
- SMPFS-322
- catalog.update.started
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-323 — catalog.update.completed deck-2 owner contract

```yaml
plan_unit_id: SMPFS-323
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.update.completed 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-434 on origin/plans/ea-cards2-answers-20261105, presented deck item 4.d, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: For the listed uses, keep the current verified version and queue the update until the next safe reload or start allowed by the component that uses it. Save completion only when the new version takes effect. You keep using the old version until it is safe to switch.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:936-938`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:563-564`; `DS15:reports/event-authority-20261104/DS15.md:97-100`; `evidence:reviews/DS15-sol/REVIEW.md:63-69`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:100-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:98-104`; `MAIN:Plans/Commands_System.md:505-514`; `MAIN:Plans/Commands_System.md:7089-7102`; `MAIN:Plans/Skills_System.md:35-35`; `MAIN:Plans/Skills_System.md:157-189`; `MAIN:Plans/Skills_System.md:315-325`; `MAIN:Plans/Plugins_System.md:511-519`; `MAIN:Plans/Plugins_System.md:43-48`; `MAIN:Plans/Plugins_System.md:4288-4292`; `MAIN:Plans/MCP_Integration.md:119-149`; `MAIN:Plans/MCP_Integration.md:161-174`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:561-565`; `MAIN:Plans/FinalGUISpec.md:2322-2326`; `MAIN:Plans/Skills_System.md:152-169`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_update_completed-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-434 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: catalog lifecycle controller, cmd.catalog.update_item, records the existing item owner's verified effective update commit. Require stage=effective, target_version=effective_version, actual owner safe-reload/start proof and installed availability. Download, validation, queue acceptance, start, UI acknowledgement or merely selecting a target cannot produce completion.
  Exact approved listed uses (technical labels only, not new persisted product states): {"command": ["open_edit_session", "component_reference"], "skill": ["selected_request", "instructions_loaded_or_invoked", "persona_reference"], "plugin": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "hook": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "mcp_config": ["configured_or_connected", "persona_reference"]}. Existing stricter outcomes are excluded. Removing an open-editor command remains refused; active theme edits remain immediate; every selected skill request keeps its exact selected version before loading/invocation; plugin renewed approval/recovery, MCP credentials/current connection version, personal customizations and external-service data remain governed by their existing owners. No extra item type or use is covered. A component must supply its already-owned safe-boundary proof; missing or ambiguous proof remains unavailable, never guessed.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.update.completed", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_catalog_update_completed.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. This exact family uses the existing DS15 integer boundary unchanged pending the shared CV-1100/SP-1100/SP-1101 sweep; no new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.catalog_update_completed.v1@1.0.0 is the exact operating catalog.update.completed history reader and reads only catalog.update.completed@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.catalog_update_completed:{scope_key}, closed value Plans/ds15_catalog_update_completed_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and checkpoint adopt DL-401 G11 / RP-AUTHORITY-INDEFINITE@1.0.0: creation anchored, metadata/references only, no age/count expiry or count cap, holds and Storage pressure/fail-closed budget rules remain. Neither retained installation history nor a removal event retains executable, configuration, skill, theme, user override or external-service content forever. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in origin/plans/ea-retention-cards2-20261105:Plans/storage-plan.md, commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact catalog.update.completed section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family catalog.update.completed. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family catalog.update.completed
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md#DL-434
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_update_completed-search.json
preserved_exact_tokens:
- SMPFS-323
- catalog.update.completed
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-324 — catalog.remove.started deck-2 owner contract

```yaml
plan_unit_id: SMPFS-324
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.remove.started 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-435 on origin/plans/ea-cards2-answers-20261105, presented deck item 4.e, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: For the listed uses, refuse removal until the person releases or disables every current use or saved reference. Keep the installed item available. A refused request is not completed and is never silently queued. You decide when to release its uses and try again.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:936-938`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:563-564`; `evidence:reviews/DS15-sol/REVIEW.md:63-69`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:100-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:98-104`; `MAIN:Plans/Commands_System.md:505-514`; `MAIN:Plans/Commands_System.md:7089-7102`; `MAIN:Plans/Skills_System.md:35-35`; `MAIN:Plans/Skills_System.md:157-189`; `MAIN:Plans/Skills_System.md:315-325`; `MAIN:Plans/Plugins_System.md:511-519`; `MAIN:Plans/Plugins_System.md:43-48`; `MAIN:Plans/Plugins_System.md:4288-4292`; `MAIN:Plans/MCP_Integration.md:119-149`; `MAIN:Plans/MCP_Integration.md:161-174`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:561-565`; `MAIN:Plans/FinalGUISpec.md:2322-2326`; `MAIN:Plans/Skills_System.md:152-169`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_remove_started-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-435 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: catalog lifecycle controller, cmd.catalog.remove_item, records the existing item owner beginning actual removal after every current use and saved reference is released or disabled. Require stage=removing and no uses. A refused request keeps the installed item available, emits neither removal lifecycle event, queues nothing and requires an explicit later retry.
  Exact approved listed uses (technical labels only, not new persisted product states): {"command": ["component_reference"], "skill": ["selected_request", "instructions_loaded_or_invoked", "persona_reference"], "plugin": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "hook": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "mcp_config": ["configured_or_connected", "persona_reference"], "theme": ["current_or_saved_theme"]}. Existing stricter outcomes are excluded. Removing an open-editor command remains refused; active theme edits remain immediate; every selected skill request keeps its exact selected version before loading/invocation; plugin renewed approval/recovery, MCP credentials/current connection version, personal customizations and external-service data remain governed by their existing owners. No extra item type or use is covered. A component must supply its already-owned safe-boundary proof; missing or ambiguous proof remains unavailable, never guessed.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.remove.started", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_catalog_remove_started.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. This exact family uses the existing DS15 integer boundary unchanged pending the shared CV-1100/SP-1100/SP-1101 sweep; no new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.catalog_remove_started.v1@1.0.0 is the exact operating catalog.remove.started history reader and reads only catalog.remove.started@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.catalog_remove_started:{scope_key}, closed value Plans/ds15_catalog_remove_started_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and checkpoint adopt DL-401 G11 / RP-AUTHORITY-INDEFINITE@1.0.0: creation anchored, metadata/references only, no age/count expiry or count cap, holds and Storage pressure/fail-closed budget rules remain. Neither retained installation history nor a removal event retains executable, configuration, skill, theme, user override or external-service content forever. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in origin/plans/ea-retention-cards2-20261105:Plans/storage-plan.md, commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact catalog.remove.started section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family catalog.remove.started. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family catalog.remove.started
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md#DL-435
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_remove_started-search.json
preserved_exact_tokens:
- SMPFS-324
- catalog.remove.started
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-325 — catalog.remove.completed deck-2 owner contract

```yaml
plan_unit_id: SMPFS-325
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  catalog.remove.completed 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-435 on origin/plans/ea-cards2-answers-20261105, presented deck item 4.e, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: For the listed uses, refuse removal until the person releases or disables every current use or saved reference. Keep the installed item available. A refused request is not completed and is never silently queued. You decide when to release its uses and try again.
  Card **Sources:** `MAIN:Plans/UI_Command_Catalog.md:936-938`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:563-564`; `evidence:reviews/DS15-sol/REVIEW.md:63-69`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:100-104`; `evidence:reviews/DS15-sol/REVIEW-cycle5.md:203-218`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:98-104`; `MAIN:Plans/Commands_System.md:505-514`; `MAIN:Plans/Commands_System.md:7089-7102`; `MAIN:Plans/Skills_System.md:35-35`; `MAIN:Plans/Skills_System.md:157-189`; `MAIN:Plans/Skills_System.md:315-325`; `MAIN:Plans/Plugins_System.md:511-519`; `MAIN:Plans/Plugins_System.md:43-48`; `MAIN:Plans/Plugins_System.md:4288-4292`; `MAIN:Plans/MCP_Integration.md:119-149`; `MAIN:Plans/MCP_Integration.md:161-174`; `MAIN:Plans/Section15_MVP_Promoted_Features_Spec.md:561-565`; `MAIN:Plans/FinalGUISpec.md:2322-2326`; `MAIN:Plans/Skills_System.md:152-169`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_remove_completed-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-435 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: catalog lifecycle controller, cmd.catalog.remove_item, records only the existing item owner's completed removal commit, stage=removed and installed_available=false. Every current use and saved reference must already be released or disabled. A refused, queued, merely accepted or in-progress request never publishes completion; no silent later removal.
  Exact approved listed uses (technical labels only, not new persisted product states): {"command": ["component_reference"], "skill": ["selected_request", "instructions_loaded_or_invoked", "persona_reference"], "plugin": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "hook": ["enabled_not_loaded", "loaded_or_hook_running", "persona_reference"], "mcp_config": ["configured_or_connected", "persona_reference"], "theme": ["current_or_saved_theme"]}. Existing stricter outcomes are excluded. Removing an open-editor command remains refused; active theme edits remain immediate; every selected skill request keeps its exact selected version before loading/invocation; plugin renewed approval/recovery, MCP credentials/current connection version, personal customizations and external-service data remain governed by their existing owners. No extra item type or use is covered. A component must supply its already-owned safe-boundary proof; missing or ambiguous proof remains unavailable, never guessed.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=application_or_project. Original event_id is allocated once and retained. Idempotency recipe: application scope: application@1:{hex(server_id)}:{hex(owner_operation_id)}; Project scope: sha256(canonical MessagePack array ["catalog.remove.completed", "1.0.0", actual scope map with UTF-8 sorted keys, operation_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_catalog_remove_completed.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. This exact family uses the existing DS15 integer boundary unchanged pending the shared CV-1100/SP-1100/SP-1101 sweep; no new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.catalog_remove_completed.v1@1.0.0 is the exact operating catalog.remove.completed history reader and reads only catalog.remove.completed@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.catalog_remove_completed:{scope_key}, closed value Plans/ds15_catalog_remove_completed_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and checkpoint adopt DL-401 G11 / RP-AUTHORITY-INDEFINITE@1.0.0: creation anchored, metadata/references only, no age/count expiry or count cap, holds and Storage pressure/fail-closed budget rules remain. Neither retained installation history nor a removal event retains executable, configuration, skill, theme, user override or external-service content forever. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in origin/plans/ea-retention-cards2-20261105:Plans/storage-plan.md, commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact catalog.remove.completed section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family catalog.remove.completed. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family catalog.remove.completed
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md#DL-435
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/catalog_remove_completed-search.json
preserved_exact_tokens:
- SMPFS-325
- catalog.remove.completed
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```


### SMPFS-326 — tool.custom_headless.skipped deck-2 owner contract

```yaml
plan_unit_id: SMPFS-326
unit_type: contract
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: |-
  tool.custom_headless.skipped 1.0.0 — newly authored owner contract, prepared without admission. This exact family independently adopts the following bindings, not a sibling's contract. Source: DL-436 on origin/plans/ea-cards2-answers-20261105, presented deck item 4.f, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30. Jared's words alone: "i approve all of it". The deck's fast-reply rule selects A; the option below is the card author's wording, not a Jared quotation.
  Approved option A: Save the notice the first time Doctor’s readiness check finds the setting for that optional custom browser tool absent for that Project. An earlier run with the setting present leaves the chance unused. Once issued, the notice never resets for configuration edits or removing/re-adding the setting. A clone or import gets a fresh chance only if it creates a separate new Project with its own saved ID. Restoring the same Project preserves whether the notice was already shown. If an older backup cannot prove that, do not guess and show a duplicate. Later checks still save their ordinary check result.
  Card **Sources:** `MAIN:Plans/newtools.md:498-511`; `DT:reports/event-authority-20261104/DT.md:272-273`; `evidence:reviews/DT-sol/REVIEW.md:118-122`; `evidence:reviews/DT-sol/REVIEW-cycle3.md:86-92`; `evidence:reviews/DS15-sol/REVIEW-cycle4.md:45-50`; `evidence:reviews/DT-sol/REVIEW-cycle4.md:93-103`; `evidence:reviews/DT-sol/REVIEW-cycle4.md:93-107`; `evidence:reviews/DT-sol/REVIEW-cycle5.md:7-7`.
  Search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/tool_custom_headless_skipped-search.json; scope current top-level Plans Markdown/JSON and scripts Python at 30dc9245bc753dbe80693977a1b03e3278d73b85, excluding source ledgers/generated artifacts. Required behavior exists; no complete exact-family technical binding was found. DL-045 permits newly authored technical bindings; DL-436 resolves only the stated behavior choice. Reuse SP-278/SP-286/CV-339/CV-366/SP-337 and actual existing command/Doctor owner outcomes.
  Producer: Doctor readiness handler for tools.custom_headless in the actual Project configuration. Claim the Project's unused notice chance atomically with the original absent-check outcome; the first readiness check finding the setting absent is eligible, even after any earlier configured run. A present key, invalid-but-present setting, issued chance or unknown legacy backup state cannot emit this event. Once issued, edits and removal/re-addition never reset it. Clone/import gets an unused chance only under a separate newly saved Project ID; same-ID restoration preserves issued/unused evidence, and uncertain evidence suppresses a duplicate. Later checks still emit their ordinary doctor.custom_headless.checked result. This new contract supersedes only the withdrawal status in retired N2-218/SP-641/CV-661/ATS-321; those IDs remain retired and are not reused. DS15 owns this contract; DT cites it.
  Scope and identity: actual Project or application namespace selected by the owning component, never current focus, time or a fabricated Project. This family has scope_policy=project_only. Original event_id is allocated once and retained. Idempotency recipe: sha256(canonical MessagePack array ["tool.custom_headless.skipped", "1.0.0", actual project_id]). Application server_id and original_operation_id resolve from the immutable owner operation source; Project partition is encoded project~base64url, app partition is app. scope_key is SHA-256 of the canonical MessagePack scope map in UTF-8 key order. Retried caller-supplied CV-317 semantic body must equal the original; Storage-assigned sequence and timestamps are excluded from retry comparison and independently authenticated by full-value original custody.
  Closed payload: Plans/ds15_tool_custom_headless_skipped.schema.json; closed original transition/source schemas: Plans/ds15_deck2_context.schema.json and Plans/ds15_deck2_sources.schema.json, own definitions by exact event name. No raw content, credentials, file paths, executable/configuration bodies, cookies, captures or provider data. All string identifiers/ref fields fully match their schema at the real boundary, including LF refusal. This exact family uses the existing DS15 integer boundary unchanged pending the shared CV-1100/SP-1100/SP-1101 sweep; no new cap, number codec or date-time grammar is introduced. SP-337 resolves bodies over the 16384-byte inline boundary by original owner payload references; this bounded metadata schema grants no oversized-inline exception. Measure complete encoded envelope payload and checkpoint.
  Original source and custody: outcome_ref resolves independently retained owning-component record bytes, never a caller's matching assertion. Reparse and validate the closed exact-family source; join original payload, event_type, scope, Storage instance, original operation identity and original transition observations field by field. The source bank in static fixtures models this owner resolver, not a new production database. Adopt SP-286 / CV-339 full-value original/first-AppendReceipt custody. Commit original transition/source, freeze event, single-writer append/dedupe, retain first receipt and full-value commitment, then publish. Missing original, incoherent closure or unavailable source blocks publication/recovery. Backup/restore preserves original source/log/receipt/consumption closure together. Current authorization, Project/chat permissions, deletion/redaction and sharing withdrawal are rechecked on read; a checkpoint grants no access.
  Replay and transitions: retry/lost acknowledgement returns original event_id, immutable outcome and first receipt with zero repeated effects. Recover a missing append with original identity only; never regrant, revoke again, update, remove or issue another notice. Current writer/retry refuses projector_replay_only as replay_only_not_appendable; retained supported 1.0.0 replay-only originals remain readable after authenticating their original transition and source, whatever today's live state. Retained history never requires a disposed current transition control; current disclosure/access/deletion and withdrawal still fence it. Ordinary replay dispatches no command.
  Consumer and checkpoint: reader.ds15.tool_custom_headless_skipped.v1@1.0.0 is the exact operating tool.custom_headless.skipped history reader and reads only tool.custom_headless.skipped@1.0.0. Adopt SP-278 and DL-076 nine-field durable read token; key projector.checkpoint.ds15.tool_custom_headless_skipped:{project_id}, closed value Plans/ds15_tool_custom_headless_skipped_checkpoint.schema.json. Physical proposed value: derived redb, coordination_and_storage budget, messagepack_canonical, full encoded value at most 16384 bytes (SP-339/SP-340). This task appends no storage-value registry row and authorizes no physical write/advance. Capture CURRENT-selected complete global range and live snapshot; persist only the nine-field token, never redb_snapshot_id. Scan every global row, resolve each matching original, join event id/type/scope/partition/Storage sequence. Advance by atomic CAS of complete prior and new checkpoint in one redb transaction. Missing rows, contradictions, mismatched token/Storage/snapshot/source, changed access or reader version preserve prior. through_sequence_id is the global scanned frontier and last_event_id the last verified match; no checkpoint before first match, a zero-match suffix keeps the earlier last event. Rebuild requires complete retained prefix and fresh permissions.
  Retention: Event and derived checkpoint adopt DL-401 G14 / RP-OPERATIONAL-2555D@1.0.0: 2555 days from the original committed absent-check transition, unchanged 2000000/Project cap, only expired unheld/unreferenced history compacts, overflow fails closed, retries/recovery never reset the clock. The original Project readiness source preserves whether this Project's chance was consumed; it remains an active protected reference while needed to enforce DL-436 and travels in the coherent same-ID backup. Expiry or rebuilding a derived history checkpoint never makes an issued/unknown chance unused. No app-scope bucket or synthetic Project is introduced. Retention premise evidence is DL-401 and G10/G11/G14 as named for this exact family in origin/plans/ea-retention-cards2-20261105:Plans/storage-plan.md, commit 9b76338594c6f1ca75de6c757e7a8b98ab68e229; none of items 4.c-4.f changes that grouping. Referenced content follows its own independently approved lifetime, redaction and read access.
  Compatibility and withdrawal: exact 1.0.0 writer/reader/schema only. Unknown version/field fails closed. Writer withdrawal uses committed admission frontier, refuses new admissions and drains only already-admitted original outcomes/receipts; reader withdrawal fences CAS and marks checkpoints withdrawn. Reinstallation needs current authorization and a complete retained-source rebuild. No fabricated old recipe selector; shared number/format historical-selector defects remain explicit sweep work.
  Oracles: ATS-329's exact tool.custom_headless.skipped section, Plans/ds15_deck2_fixtures.json own family row, and python3 scripts/pm-ds15-deck2-contracts.py --family tool.custom_headless.skipped. Each negative has one declared defect and explicit coherent derived observations; fixture source/custody joins are verified against actual retained values. Native execution NOT_RUN. Registry membership remains ABSENT; no admission, new feature, Decision Log entry or readiness claim.
gui_related: false
gui_classification_reason: Typed event/source identity, persistence, custody and reader contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family static positive and negative oracles pass; membership remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-deck2-contracts.py --family tool.custom_headless.skipped
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_deck2_preparation
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- origin/plans/ea-cards2-answers-20261105:Plans/Decision_Log.md#DL-436
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DS15/r9/tool_custom_headless_skipped-search.json
preserved_exact_tokens:
- SMPFS-326
- tool.custom_headless.skipped
negative_constraints:
- No admission, registry append, new retention choice, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
```
