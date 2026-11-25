# Shard 031: Terminal Protocol Fixture Rows And Terminal Record Wire Contract — 2026-11-25

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L19143-L19232

Source SHA256: `9f35a27645e1fe187283a3a6056ecc702c6c3399b05763002707d5b1e7820ecf`

---

## Terminal Protocol Fixture Rows And Terminal Record Wire Contract — 2026-11-25

This addendum completes `### Terminal Fixture Matrix And Record Minima` (FABLE Deferred Action Concrete Repair Addendum) for `#SMPFS-124` and `#SMPFS-125` through `#SMPFS-136`. It supplies the fixture rows that the matrix format only described, and gives each of the eleven record minima a closed wire shape and an owner. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, storage families or EventRecord families, and it changes no behaviour that `#SMPFS-127`, `#SMPFS-129`, `#SMPFS-130`, `#SMPFS-158`, `#SMPFS-162`, `#SMPFS-181` or `#SMPFS-183` already state; each expected result below is that unit's rule applied to one byte stream.

### Terminal protocol fixture rows

**Replay inputs.** The `input_bytes` column is the replay byte stream itself. It is written with C escapes: `\e` is 0x1B, `\a` is 0x07, `\\` is one backslash, `\xHH` is the byte HH, and every other character is its ASCII byte. `<S>` stands for the fixture session's shell-integration secret, which the harness mints per run and substitutes before replay. A row whose input is a user action (paste, focus change, mouse click, pasteboard content) states the action and the bytes Puppet Master must write to the PTY. The reference corpus holds one replay file per `fixture_id` whose bytes are exactly the decoded `input_bytes`; `input_bytes_ref` names that file. `expected_screen_hash` is the SHA-256 of the reference parser's screen state after replay; it is pinned on the first run that passes every assertion in the row and may never be pinned from a run that fails one. The assertions in `expected_result` are normative; the hash only detects later drift.

**Harness defaults.** 80 columns by 24 rows, main screen, terminal focused, user looking at the tab, local session typed by the user, OSC 52 policy `allow`, bracketed paste, focus reporting, mouse reporting and synchronized output off until the stream enables them. A row states any change to these.

**Every row three ways.** Each row is replayed (1) whole, (2) split at every byte boundary into two reads (`#SMPFS-130`), and (3) on the macOS, Linux, Windows and WSL builds of the parser. All replays of a row must give the identical screen state, records and PTY replies; no byte of a control sequence may appear in the grid in any of them.

| fixture_id | protocol_family | input_bytes | negative_case | expected_result |
| --- | --- | --- | --- | --- |
| `tpf-osc52-write` | `clipboard` | `\e]52;c;aGVsbG8=\a` | false | Clipboard write of `hello` is requested under the OSC 52 policy; `TerminalOscEvent{osc_code: "52", allowed: true}`; grid unchanged. |
| `tpf-osc52-unfocused` | `clipboard` | `\e]52;c;aGVsbG8=\a` with the terminal unfocused | true | No clipboard write; `TerminalOscEvent{osc_code: "52", allowed: false, blocked_reason_code: osc52_unfocused}` (DL-228 in `#SMPFS-183`). |
| `tpf-osc52-read` | `clipboard` | `\e]52;c;?\a` | true | No reply is written to the PTY; `blocked_reason_code: osc52_read_refused`. |
| `tpf-osc52-oversize` | `clipboard` | `\e]52;c;` + base64 of 1,048,577 bytes of `A` + `\a` | true | Write ignored; `blocked_reason_code: osc52_over_size`; the parser returns to ground state and the next text byte prints normally. |
| `tpf-osc52-policy-deny` | `clipboard` | `\e]52;c;aGVsbG8=\a` with OSC 52 policy `deny` | true | No clipboard write; `blocked_reason_code: osc52_policy_denied`. |
| `tpf-osc8-link` | `hyperlink` | `\e]8;;https://example.com/\e\\link\e]8;;\e\\` | false | Cells 0–3 of row 0 hold `link` with link target `https://example.com/`; cell 4 has no link; nothing opens. |
| `tpf-osc8-remote-file` | `hyperlink` | `\e]8;;file://otherhost/etc/hosts\e\\x\e]8;;\e\\` | true | The cell holds `x` with target host `otherhost`; the target is never resolved as a local path (`#SMPFS-183`). |
| `tpf-osc9-4-progress` | `progress` | `\e]9;4;1;42\a` | false | Determinate session-advisory progress 42; no notification and no attention mark (`#SMPFS-162`). |
| `tpf-osc9-4-invalid` | `progress` | `\e]9;4;1;250\a` | true | Ignored or diagnosed as invalid progress; it never falls through to a notification. |
| `tpf-osc9-notify` | `notification` | `\e]9;Build done\a` with the user not looking at the tab | false | The tab's attention mark is set and announced politely; the text is shown as plain text; no new notification family. |
| `tpf-osc777-notify` | `notification` | `\e]777;notify;Title;Body\a` with the user not looking at the tab | false | Same result as `tpf-osc9-notify`. |
| `tpf-osc99-notify` | `notification` | `\e]99;;Hello\e\\` with the user not looking at the tab | false | Same result as `tpf-osc9-notify`. |
| `tpf-bel` | `notification` | `\a` with the user not looking at the tab | false | Visual bell per the look and the tab's attention mark; no audible bell. |
| `tpf-osc133-secret` | `shell_integration` | `\e]133;A;pmn=<S>\a$ \e]133;B;pmn=<S>\als\r\n\e]133;C;pmn=<S>\aout\r\n\e]133;D;0;pmn=<S>\a` | false | Exactly one command block: prompt `$ `, command `ls`, output `out`, exit status 0. |
| `tpf-osc133-forged` | `shell_integration` | `\e]133;A\a$ \e]133;B\a` | true | No command block or boundary; the sequences are consumed and not shown; grid shows `$ `. |
| `tpf-osc133-wrong-secret` | `shell_integration` | `\e]133;A;pmn=wrong\a` | true | Same result as `tpf-osc133-forged`. |
| `tpf-osc133-bare-key` | `shell_integration` | `\e]133;A;k\a` | true | No crash and no boundary (`#SMPFS-129`). |
| `tpf-osc633-foreign` | `shell_integration` | `\e]633;A\a` | true | No command boundary: a mark without the session secret is never a boundary (`#SMPFS-183`); consumed and not shown. |
| `tpf-osc6973-command` | `shell_integration` | `\e]6973;<S>;E;bHMgLWxh\a` | false | The current command block records the command line `ls -la`. |
| `tpf-osc6973-forged` | `shell_integration` | `\e]6973;bad;E;bHMgLWxh\a` | true | No command line and no attribution recorded. |
| `tpf-osc7-cwd` | `cwd_report` | `\e]7;file://<local hostname>/home/u/proj\a` | false | The session's current folder is `/home/u/proj`. |
| `tpf-osc7-remote` | `cwd_report` | `\e]7;file://otherhost/srv\a` | true | The local current folder is unchanged; `/srv` on `otherhost` is never treated as a local path. |
| `tpf-bpaste-on` | `bracketed_paste` | stream `\e[?2004h`, then the user pastes `abc` | false | PTY receives `\e[200~abc\e[201~`. |
| `tpf-bpaste-off` | `bracketed_paste` | stream `\e[?2004h\e[?2004l`, then the user pastes `abc` | false | PTY receives `abc`. |
| `tpf-bpaste-controls` | `bracketed_paste` | stream `\e[?2004h`, then the user pastes `x\e[201~rm -rf ~\r` | true | Nothing is written until the control-character confirmation (`#SMPFS-127`); the pasted ESC byte is never written raw, so the paste cannot close the bracket early. |
| `tpf-focus` | `focus` | stream `\e[?1004h`, then focus out, then focus in | false | PTY receives `\e[O` then `\e[I`; with `?1004` never set, no bytes. |
| `tpf-mouse-sgr` | `mouse` | stream `\e[?1000h\e[?1006h`, then a left press and release at column 5, row 3 (1-based) | false | PTY receives `\e[<0;5;3M` then `\e[<0;5;3m`. |
| `tpf-mouse-utf8` | `mouse` | stream `\e[?1000h\e[?1005h` on a 400-column grid, then a left press at column 300, row 2 | false | PTY receives `\e[M \xc5\x8c"`. |
| `tpf-sync-update` | `sync_update` | `\e[?2026hAB\e[?2026l` | false | No frame shows `A` without `B`; one frame after `\e[?2026l` shows `AB`. |
| `tpf-sync-query` | `sync_update` | `\e[?2026$p` | false | PTY receives `\e[?2026;2$y`. |
| `tpf-alt-screen` | `alt_screen` | `main\e[?1049hALT\e[?1049l` | false | The main screen shows `main` with the cursor where it was; `ALT` is in no scrollback and in no saved copy (`Plans/storage-plan.md#SP-332`). |
| `tpf-xtversion` | `negotiation` | `\e[>0q` | false | PTY receives `\eP>\|PuppetMaster <version>\e\\`. |
| `tpf-scheme-report` | `negotiation` | `\e[?996n` | false | PTY receives `\e[?997;1n` when the drawn scheme's ground is dark and `\e[?997;2n` when it is light. |
| `tpf-csi-u-stack` | `kitty_keyboard` | `\e[?u\e[>1u\e[?u\e[<u\e[?u` | false | PTY receives `\e[?0u`, `\e[?1u`, `\e[?0u` in that order; input stays legacy until the push (`#SMPFS-158`). |
| `tpf-csi-u-alt-stack` | `kitty_keyboard` | `\e[>1u\e[?1049h\e[?u\e[?1049l\e[?u` | false | PTY receives `\e[?0u` then `\e[?1u`: the alternate screen has its own stack. |
| `tpf-kitty-chunked` | `kitty_graphics` | `\e_Ga=T,f=24,s=2,v=1,i=1,m=1;AAAA\e\\\e_Gm=0;AAAA\e\\` | false | One 2 by 1 px black image placed at the cursor; PTY receives `\e_Gi=1;OK\e\\` once, after the last chunk. |
| `tpf-kitty-proc-file` | `kitty_graphics` | `\e_Ga=T,t=f,i=2;L3Byb2Mvc2VsZi9lbnZpcm9u\e\\` | true | No file is opened; PTY receives `\e_Gi=2;EBADF:Failed to read image file\e\\` (`#SMPFS-181`). |
| `tpf-kitty-remote-file` | `kitty_graphics` | a valid `t=f` transmission in an SSH session or in a command an agent typed | true | Same `EBADF` reply; only direct transmission is accepted there. |
| `tpf-kitty-oversize` | `kitty_graphics` | one APC `\e_Ga=T,f=24,s=1,v=1,i=3;` + 8 MiB + 1 byte of base64 payload + `\e\\` | true | Command dropped; PTY receives `\e_Gi=3;EFBIG:Too much data\e\\`; no freeze. |
| `tpf-kitty-delete` | `kitty_graphics` | after `tpf-kitty-chunked`, one case per delete selector `a A i I n N c C f F p P q Q r R x X y Y z Z`, each `\e_Ga=d,d=<selector>…\e\\` with that selector's keys | false | Each case removes exactly the placements its selector names; an uppercase selector also frees image data with no remaining placement; other images are untouched. |
| `tpf-sixel` | `sixel` | `\ePq#0;2;100;0;0#0!6~\e\\` | false | One 6 by 6 px red image at the cursor; the cursor moves below it. With `\e[?80h` first, the image sits at the top left and the cursor stays where it was. |
| `tpf-sixel-oversize` | `sixel` | one DCS sixel sequence of 24 MiB + 1 byte | true | Sequence dropped; parser back in ground state; no freeze. |
| `tpf-iterm2-single` | `iterm2_image` | `\e]1337;File=inline=1;size=70:iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\a` | false | One 1 by 1 px image at the cursor. |
| `tpf-iterm2-multipart` | `iterm2_image` | `\e]1337;MultipartFile=inline=1;size=70\a`, the same base64 in two `\e]1337;FilePart=…\a` parts, then `\e]1337;FileEnd\a` | false | Same image as `tpf-iterm2-single`. |
| `tpf-iterm2-part-oversize` | `iterm2_image` | a `FilePart` over 1 MiB | true | The upload is refused; no image; no freeze. |
| `tpf-utf8-zwj` | `c0_text` | `\xf0\x9f\x91\xa9\xe2\x80\x8d\xf0\x9f\x92\xbb` | false | One grapheme in two cells; no crash, also when split inside any of its bytes. |
| `tpf-unknown-osc` | `osc` | `\e]4242;x\a` | true | Consumed and not shown; `TerminalOscEvent{osc_code: "4242", allowed: false, blocked_reason_code: unsupported_sequence}`. |
| `tpf-paste-flavours` | `pasteboard` | the user pastes from a pasteboard holding `text/plain` `a.txt` and `text/uri-list` `file:///tmp/a.txt` | false | `a.txt` is inserted as plain text; the file flavour is used only through an explicit URI action (`#SMPFS-127`, `#SMPFS-136`). |

`#SMPFS-124`'s criterion that weak or unknown protocol support downgrades requested-versus-effective state rather than fabricating command blocks is checked by `tpf-osc133-forged`, `tpf-osc133-wrong-secret`, `tpf-osc633-foreign` and `tpf-unknown-osc`, with `#SMPFS-129`'s confidence tiers: a stream whose marks cannot be verified records degraded confidence and never yields a command block.

### Terminal record wire contract

The eleven records of `### Terminal Fixture Matrix And Record Minima` are values of the Puppet Master terminal engine (`#SMPFS-184`). Their owner is the engine instance of the one terminal session named by `terminal_session_id` (`TerminalProfileResolution`: the engine instance that is starting that session); they live in memory for that session and are dropped when it ends. None of them is a storage family, a storage value, an EventRecord or a seglog row. What a terminal keeps across restarts is exactly what `Plans/storage-plan.md#SP-332` keeps (the session record and the saved scrollback with its command records); none of these eleven is added to it, and a restored tab mints new anchors rather than reading old ones.

**Wire shape.** When a record leaves the engine it is one JSON object (RFC 8259, UTF-8) with exactly the record's minimum fields plus `record_type`, a constant equal to the record name, and `schema_version`, the constant `"1.0.0"`. Unknown fields, missing required fields and values outside the types below are refused; a field marked `?` may be absent but is never `null`. A record leaves the engine only over the boundaries its row names: the web GUI terminal transport (DL-139, `Plans/FinalGUISpec.md#F3-583`), the user-requested diagnostic bundle (`#SMPFS-076`, which never carries shell content), the in-process accessibility bridge (`#SMPFS-126`, `#SMPFS-131`), and agent reads (`#SMPFS-182`).

**Field types.** `id`: string matching `^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$`. `utc`: RFC 3339 instant ending in `Z`. `count`: integer 0 to 2^64−1. `ref`: opaque string of 1 to 256 bytes naming an in-memory buffer of the same session; it is never a path and never carries the content. `hash`: `^[0-9a-f]{64}$` (SHA-256). `path`: absolute path string as the host reports it. `bool`: JSON boolean.

| Record | Fields and types | Leaves the engine over |
| --- | --- | --- |
| `TerminalIngestionReceipt` | `receipt_id` id; `terminal_session_id` id; `byte_count` count; `protocol_family` enum below (the family the parser is in when the read ends, `c0_text` in ground state); `accepted` bool; `rejected_reason_code?` `over_sequence_cap` \| `malformed` \| `deferred_queue_full` \| `session_closed`, present exactly when `accepted` is false; `created_at_utc` utc | diagnostic bundle |
| `TerminalBackpressureState` | `terminal_session_id` id; `queue_depth` count; `dropped_frame_count` count (painted frames skipped, never bytes); `throttle_state` `normal` \| `throttled` \| `reader_paused`; `last_transition_at_utc` utc | web GUI transport (status), diagnostic bundle |
| `TerminalRenderFrame` | `frame_id` id; `terminal_session_id` id; `dirty_region_refs[]` array of ref; `screen_hash` hash; `rendered_at_utc` utc | web GUI transport |
| `TerminalInputEvent` | `event_id` id; `terminal_session_id` id; `input_kind` `key` \| `text_commit` \| `ime_preedit` \| `mouse` \| `focus` \| `paste` \| `resize`; `payload_ref` ref; `permission_snapshot_id?` id; `created_at_utc` utc | web GUI transport (client to Server); the diagnostic bundle carries it without `payload_ref` content |
| `TerminalPasteReceipt` | `receipt_id` id; `terminal_session_id` id; `paste_kind` `bracketed` \| `unbracketed` \| `confirmed_with_controls` \| `refused`; `byte_count` count; `sanitized` bool; `created_at_utc` utc | diagnostic bundle |
| `TerminalOscEvent` | `event_id` id; `terminal_session_id` id; `osc_code` string matching `^[0-9]{1,5}(;[0-9]{1,3})?$`; `payload_ref` ref; `allowed` bool; `blocked_reason_code?` `osc52_read_refused` \| `osc52_unfocused` \| `osc52_over_size` \| `osc52_policy_denied` \| `mark_secret_missing` \| `over_sequence_cap` \| `file_medium_refused` \| `unsupported_sequence` \| `malformed`, present exactly when `allowed` is false | diagnostic bundle, without `payload_ref` content |
| `TerminalScrollbackAnchor` | `anchor_id` id; `terminal_session_id` id; `line_offset` count (lines from the oldest retained line); `screen_hash` hash; `created_at_utc` utc | agent reads, web GUI transport |
| `TerminalProfileResolution` | `resolution_id` id; `profile_id` id; `shell_path` path; `cwd` path; `env_summary_ref` ref (names and counts only, never values); `created_at_utc` utc | diagnostic bundle |
| `TerminalSessionRestoreDecision` | `decision_id` id; `terminal_session_id` id; `restore_state` `restored_live` \| `restored_exited` \| `restored_disconnected` \| `restored_without_history` (`#SMPFS-063`); `reason_code` `live_session_survived` \| `process_exited` \| `host_unreachable` \| `saved_copy_missing` \| `saved_copy_load_timeout`; `created_at_utc` utc | web GUI transport (restore notice), diagnostic bundle |
| `TerminalAccessibilitySnapshot` | `snapshot_id` id; `terminal_session_id` id; `screen_reader_text_ref` ref (the visible range or the asked range only, never the whole scrollback); `focus_cell` object `{row: count, col: count}`; `created_at_utc` utc | accessibility bridge, web GUI transport |
| `TerminalDiagnosticsEnvelope` | `diagnostic_id` id; `terminal_session_id` id; `category` `lifecycle` \| `parser` \| `renderer` \| `input` \| `clipboard` \| `restore` \| `host_provenance` \| `performance`; `severity` `info` \| `warning` \| `error` \| `critical`; `message_ref` ref; `created_at_utc` utc | diagnostic bundle |

`protocol_family` is the closed enum `c0_text` \| `csi` \| `osc` \| `dcs` \| `apc` \| `clipboard` \| `hyperlink` \| `progress` \| `notification` \| `shell_integration` \| `cwd_report` \| `bracketed_paste` \| `focus` \| `mouse` \| `sync_update` \| `alt_screen` \| `negotiation` \| `kitty_keyboard` \| `kitty_graphics` \| `sixel` \| `iterm2_image` \| `pasteboard`; the fixture rows above use the same values.

Acceptance: every record serialized at any boundary validates against its row and is refused otherwise; no record is found in any storage family, backup, export or sync; a bundle or agent read never contains the content behind a `payload_ref`, `env_summary_ref` or `message_ref` unless `#SMPFS-076` labels transcript content as included; and every fixture row above passes whole, split at every byte, and on all four parser builds.
