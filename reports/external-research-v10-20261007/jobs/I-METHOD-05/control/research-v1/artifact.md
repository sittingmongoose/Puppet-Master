# Exact candidate-authored research-topic-a

# Proposed topic draft — A: Shared buffer, save and recovery state

**Status:** Research proposal for review; no product canon or code changed. **Product boundary:** Rust + Slint desktop app. No Iced restoration or UI framework recommendation is made. **Frozen topic ownership:** F-008, F-018, F-020, F-026, `definitions_and_transactions`, and `editing_and_save_context`. The other supplied refs remain relevant interactions and boundaries, not silently reassigned ownership.

## Recommendation

Retain the frozen choices and add one explicit state-transition rule to the shared-buffer / external-change contract: if an external disk change is observed while a buffer is dirty, preserve the local text and conflict fact; when a later local edit transition makes the buffer clean (notably undo back to its saved content), revalidate the current disk state before declaring the buffer synchronized. Route any still-current divergence through the existing changed-on-disk resolution. This closes a publicly demonstrated class of stale-buffer gap while preserving explicit Save, the current focus/Save checks, the combined dirty-plus-conflict prompt, and the prohibition on checking every keystroke.

Treat watcher events as prompts to reconcile state, not as durable truth. A watcher may miss or coalesce events; the FileManager path used at save/focus/clean-transition boundaries must be capable of revalidating against the current destination. The frozen slice does not define a stable cross-platform file revision token, so the specific comparison primitive remains a product/interface decision with FileSafe and storage owners. Do not copy Zed's mtime-only test as a sufficiency claim.

## Proposed replacement sections for topic A

### Shared buffer and transactions

A file path opened in an editor group has one tab; all groups, split panes, previews, and edit surfaces that refer to that file share one authoritative buffer, one last-saved buffer version, one dirty determination, one external-disk divergence record, and one save/retry authority. Dirty means in-memory content differs from the buffer's last-saved content; it does not mean disk is current. Read-only, degraded, change-marker, write-lock, stale-disk, changed-on-disk, transient save/reload failure, and recovery attention remain independently represented facts.

Every mutation enters this authority through a typed transaction source before dirty state, undo grouping, and save permissions change: user typing/paste/delete; preview patch; FileSafe/LSP apply-edit; agent write; restore/revert; recovery replay; or external-change resolution. Record whether an agent/FileSafe operation replaces, patches, formats, renames, or applies a code action. A single-file assistant batch may form one undo group for that buffer. A multi-file batch has a receipt plus one group per affected buffer; editor Ctrl+Z stays buffer-local. Hunk staging, rename, multi-file edits, repository/worktree restore, source-control conflict resolution, and runtime recovery anchors do not become ordinary editor undo groups. Revert-last-agent-edit remains a chat-owned backend restore, followed by a buffer refresh; editor surfaces do not invent restore points.

### Save and external change

Save remains explicit in MVP. Before replacing a destination, compare the current destination against the last-loaded/last-saved disk baseline. If local content is dirty and disk also diverged, show one combined resolution with Reload (discard local edits), Overwrite, Cancel, and the already-specified Show diff path; never queue two dialogs for this state. Continue checking at Save and when the editor pane or file tab gains focus; do not check on every keystroke. Preserve the existing revert confirmation when local edits would be discarded.

If an external change is detected while dirty, keep the user buffer intact and mark the buffer conflicted/stale. Keep enough pending evidence to revisit that divergence. When a later local transaction changes dirty from true to false, revalidate the destination. If disk still differs from the saved baseline, surface the ordinary changed-on-disk resolution before treating the buffer as synchronized or allowing a later save to silently replace disk. A conflict that disappeared before revalidation may be cleared only after a current-destination check. This also covers undo back to the previously saved text after an external write. Focus and Save remain reconciliation points if the watcher does not report a change.

Only successful writes advance last-saved content and the disk baseline, clear dirty, and show success. On disk-full, permission-denied, missing path, read-only target, or unavailable remote destination, preserve the buffer and its dirty/recovery state, leave the saved baseline unchanged, explain the reason, and offer Retry and Save As. Revalidate remote destinations before reporting a remote save/flush success. This proposal does not choose an atomic-replacement implementation; see alternatives below.

### Unsaved recovery

Recover-unsaved remains required for local and remote-backed buffers. Persist recovery snapshots as local in-memory edit state, not proof that a destination write succeeded. On restart, restore the recovered text into the shared buffer with a visible recovery-attention fact and compare it with the current disk destination before save or flush. A recovered remote buffer uses the exact banner `Recovered local edits — remote destination not yet synchronized`; reconnect or revalidate the destination before remote success is claimed. Keep `recover-unsaved` coverage for `/quit` and `/later`. Remote offline editing remains cached-files-only, and remote terminal or `/run-debug` availability is not implied by file editing.

## Original-decision dispositions

| Input decision | Disposition | Proposed change / alternative / validation |
|---|---|---|
| F-008: typed transaction sources; one save authority per path; per-buffer undo; multi-file operations are not ordinary undo | **Retain; clarify boundary** | Keep all accepted scopes. Explicitly say external-change resolution and recovery replay enter as typed buffer transactions. Validate split-pane convergence, one-file undo, multi-file receipt plus per-file undo, and no cross-file Ctrl+Z. |
| F-018: orthogonal editor facts; explicit Save; failed save remains dirty with retry/Save As/reason | **Retain; supported addition** | Add an external-disk pending/conflict fact without flattening states, plus dirty-to-clean revalidation. Preserve no silent dirty clearing. Validate write failures and conflict state transitions. |
| F-020: local and remote recover-unsaved; recovered remote memory is not remote success; exact banner and revalidation | **Retain** | Clarify recovery snapshot vs destination baseline. No change to terminal/run-debug boundary. Validate restart with local and remote recovered edits while the destination is independently changed/unavailable. |
| F-026: one buffer per path; dirty means content differs from last save; revert confirmation; check on Save/focus; one combined dirty + disk-change prompt; no every-keystroke check | **Retain; add a third reconciliation trigger** | On observed external change while dirty, revalidate when local changes later make the buffer clean. Reuse existing changed-on-disk resolution; retain the combined prompt while still dirty. Validate dirty external write → undo to clean, update during undo, repeated update, and no duplicate dialogs. |
| `definitions_and_transactions`: transaction sources, layered histories, preview/LSP/restore routes, adapter input correctness | **Retain; already supplies the authority model** | Keep buffer-local undo separate from user restore, Git history, and internal recovery anchors. Preserve FileSafe/LSP/FinalGUISpec/storage owner references as dependencies, not asserted defects. Validate each transaction source through the shared buffer and capability checks. |
| `editing_and_save_context`: explicit save/failure, stable unsaved indicators, revert/history ownership, cached-only remote offline and remote states | **Retain; already covers core save/recovery behavior** | Add only the pending-divergence transition above. Keep feedback surfaces and remote copy exact. Verify remote failure never advances saved state. |
| F-027 text/encoding/read-only behavior | **Retain as adjacent interaction** | UTF-8-only editable text, binary/decode/read-only reasons, explicit Save, per-buffer undo, and line-ending preservation remain unchanged. Validate a dirty buffer whose target becomes read-only or undecodable externally. |
| F-028 large-file policy | **Retain as adjacent interaction** | Keep truncated read-only view + “Load full file”, default 10 000 lines, 5 MB hard cap, and no virtualized editing in MVP unless needed. Check recovery and conflict prompts do not bypass the hard cap. |
| F-082 nearest-existing newline policy | **Retain as adjacent interaction** | Keep surviving CRLF/LF/CR boundaries byte-preserved, newly inserted boundaries follow nearest surviving newline, paste normalization stays local to inserted text. Validate save, undo, reload, and recovery on mixed-ending fixtures. |

## Open discovery, implementation evidence, alternatives and limits

Zed's public issue #48697 reports the exact transition gap: a dirty buffer preserves local edits when an external tool writes to disk, but undoing all local edits can return the buffer to clean while leaving it on old text. Its root-cause account says `file_updated()` records metadata but suppresses `ReloadNeeded` while dirty; the subsequent `did_edit()` dirty-to-clean path did not revisit the disk. The fix in merged PR #51037 adds a check in `crates/language/src/buffer.rs::did_edit`: when `was_dirty && !is_dirty`, and the file remains `DiskState::Present`, compare its disk mtime with `saved_mtime` and emit `ReloadNeeded` if changed. `undo()` calls `did_edit()` after undoing the text transaction. The same immutable commit adds integration test `test_dirty_buffer_reloads_after_undo`, using fake disk versions 1 and 2, checking conflict while dirty and the new disk content after undo. Zed release notes list #51037 as a bug fix; the public site redirects the queried version path to its channel listing, so this review records release-note inclusion but does not assert a precise stable tag. Evidence IDs S1–S4 in [source-map.json](source-map.json) link the public record and pinned code/test; excerpts are in [the saved capture](sources/zed-buffer-undo-reload.md).

This is evidence of a real analogous mechanism and bug history, not evidence Puppet Master has the same bug. Zed is a Rust editor with its own GPUI framework and its own buffer/file abstractions; no Zed UI or framework dependency is recommended. Its fix uses mtime as a local guard, which is a useful minimal pattern but not proof that timestamps distinguish same-tick rewrites, unusual/network filesystems, or remote destinations. Prefer a destination revision/fingerprint contract that is verified against the destination; the FileSafe/storage owners must decide whether that is metadata, content hash, identity+metadata, or another compare-and-swap token.

Two reconciliation strategies remain: reload automatically as soon as the buffer becomes clean, or expose the existing user resolution. Recommend the latter for this product slice: it respects the accepted explicit conflict choices and preserves user control over a changed file, while still preventing silent stale status. If the clean buffer can be proven byte-equal to current disk, clear the pending conflict without a dialog. If it is not equal, preserve the prompt/Show diff path. Whether Reload should retain a redo/recovery route is an open history detail, not a reason to make cross-file undo.

For saves, in-place truncate/write is simple and preserves the existing file object but can expose an empty/partial file if interrupted; temporary-file-plus-rename may provide a stronger replacement boundary on supported filesystems but can replace the watched inode, change permissions/metadata, or fail across devices. No save algorithm is selected here: platform behavior and FileSafe's write authority are outside the admitted owner slice. Keep explicit Save and failure semantics; ask those owners to choose and test the concrete mechanism. No atomic-save implementation history was established in this bounded stage.

## Cross-topic dependencies and unresolved questions

- FileSafe owns agent/apply-edit write authority and guards; LSPSupport owns LSP apply-edit behavior. This topic requires callers to enter the shared buffer, but does not specify their missing contracts.
- Storage-plan owns durable settings/session/editor-state persistence and remote identity; this topic requires recover-unsaved snapshots and baselines but does not select a storage schema or claim a remote write.
- FinalGUISpec owns visible status/prompt surfaces. FileManager owns the exact dirty/conflict/recovery facts and copy specified in its slice; the final arrangement and accessibility semantics need that owner's review.
- Git/source-control owns repo restore and hunk operations; preserve its separate history and avoid classifying it as editor undo.
- Product decisions still needed: what stable external revision primitive is available for local, remote, and cached files; whether the destination can change between preflight and actual write and how to make save conditional; what to do if a file is deleted/recreated under the same path; recovery snapshot cadence/retention/atomicity; whether a clean-but-disk-divergent buffer prompts immediately on transition or waits until focus/Save; and whether undo history survives reload.

## Validation proposals (not executed)

1. Open one path in two groups. Edit/save in either pane; assert both render the same buffer and the single save result/baseline is shared.
2. Exercise user, paste/delete, preview patch, single-file FileSafe/LSP apply-edit, agent batch, revert and recovery replay. Assert each has its typed source, expected undo group, and no alternate save authority; multi-file edits remain per-file undo.
3. Matrix clean/dirty × disk unchanged/changed/deleted/read-only × local/remote-connected/remote-disconnected; assert orthogonal facts and Save failure retention.
4. External write while dirty → conflict without replacing local text → undo to clean. Assert current disk is revalidated and no stale “clean and synchronized” state remains. Repeat with two external writes, a write between focus and Save, and a change that is reverted before resolution. Assert the dirty-plus-changed prompt occurs once, with Reload/Overwrite/Cancel and Show diff; no keystroke polling.
5. Interrupt or fail save at write/open/replace/reconnect boundaries. Assert last-saved content and disk baseline advance only on verified success; Retry and Save As preserve the original buffer.
6. Crash/restart around unsaved snapshot creation and recovery replay. Assert no partial recovery is presented as successful disk save; remote recovered text uses the exact banner and revalidates before remote success.
7. Keep F-027/F-028/F-082 regression fixtures: UTF-8 decode failure and binary/read-only states; 10 000-line/5 MB limits; mixed CRLF/LF/CR save, edit, paste-normalization, undo, reload and recovery preserving unaffected boundaries.

**Executed checks:** none of the candidate implementation or validation proposals above were run. Input files were read and their declared SHA-256 identities were checked against `input-map.json`; public sources were inspected in browser. This is not an application build, test run, or product validation.


# Exact candidate-authored research-topic-b

# Topic B research draft — Text representation, read-only and size behavior

Stage: I-METHOD-05/control/research-topic-b-v1
Topic owner refs: F-027, F-028, F-082, text_and_size_context
Source boundary: exact inputs listed in input-map.json plus public sources below; no predecessor files admitted.
State: proposed topic replacement sections for coordinator integration. Product canon unchanged. No application build or acceptance test run.

## Open discovery and recommendation

Open discovery identified Ropey as a Rust text-buffer candidate: published version 1.6.1 is designed for editor buffers, stores valid UTF-8, edits with Unicode-scalar indices, exposes byte/character/line counts, and writes ordered UTF-8 chunks. It treats CRLF as one logical break while retaining the original text characters. Its docs also state that Ropey is in-memory, has kilobyte-scale allocation overhead for tiny files, and cannot handle texts larger than available memory. RopeBuilder can construct incrementally without staging a whole input String, but a completed Rope remains resident.

This supports evaluating Ropey behind the existing size gates; it does not support removing the 5 MB cap. The library does not choose a nearest-existing line ending for inserted text: callers supply inserted text, so F-082 remains an application contract. Slint TextEdit exposes an in-out string and a read-only input. Official docs say read-only blocks keyboard/mouse editing but still permits selection and programmatic edits. Therefore the widget flag alone is not the read-only authorization boundary; a rope backend may also lose its segmented-storage advantage if edits require flattening/rebinding the full string. Slint issue #8877 reports lag at roughly 130k characters (the reporter describes an additional ×3 multiplier) on Slint 1.12 and is closed as duplicate of #2306. I did not establish a fix or released correction, so this is a cautionary report, not a confirmed regression or benchmark.

Recommendation: retain the frozen UX and safety choices, clarify measurement and mode boundaries, and benchmark the actual Rust+Slint adapter before choosing String or Ropey. A flat String is simpler and may be adequate under the hard cap. Ropey 1.6.1 is a credible research exemplar if chunk access and edits do not require flattening on every UI event. Do not make a package version or data structure a product requirement from this evidence.

## Proposed replacement sections

### Text identity and encoding

1. Treat the loaded source text as the canonical per-path buffer. Require valid UTF-8 for editable text. Never lossy-decode and permit ordinary Save; show the existing Cannot decode as UTF-8 reason until external correction and reload produce valid UTF-8.
2. Keep original UTF-8 code points, including each existing LF, CRLF, and CR boundary, in order. No-edit Save must be byte-identical to opened UTF-8 bytes. After an edit, bytes outside the edited range, including surviving line-ending boundaries, stay unchanged. Do not normalize on load, render, copy, save, or recovery.
3. Preserve explicit Save only and no auto-save in MVP. Preserve the optional paste-normalization choice. With it off, retain pasted line endings; with it on, normalize only the inserted paste transaction. Surviving surroundings remain byte-identical; keep the edit one typed transaction and one undo group.
4. BOM handling, Unicode scalar versus grapheme cursor behavior, embedded NUL/binary classification, and Unicode separators in line-threshold counting remain decisions. Do not infer a binary heuristic from Ropey. Invalid UTF-8 takes the decode-failed path; valid UTF-8 may still be binary only under a separately stated and tested policy.

### Mixed line endings (F-082)

Retain the required nearest-existing-boundary policy. Each inserted newline uses the closest surviving existing line-ending boundary in buffer context; separators outside the replacement range are unchanged. No-edit Save preserves the entire sequence. Optional paste normalization applies only to new pasted boundaries and follows the selected policy.

Before implementation, resolve equal-distance tie-breaking, behavior when no surviving newline exists, and whether a multi-newline insertion recomputes the nearest source boundary per newline or uses one transaction-level choice. Candidate rule: nearest boundary by character distance; ties use preceding boundary; if none exists, use explicit configured new-file default. This is a proposal, not a settled product choice. Test CRLF/LF/CR mixtures, split points, replacement that removes the nearest boundary, beginning/end insertions, empty files, equal-distance ties, multi-newline paste, paste normalization on/off, undo/redo, and byte identity on no-op Save.

Ropey 1.6.1 default unicode_lines recognizes LF, CRLF, CR, VT, FF, NEL, LS, and PS; CRLF counts as one line break and is not split across chunks, though a slice can split it. If F-028 counts only LF/CRLF/CR, set explicit features (for example disable defaults and enable cr_lines plus simd) or use a separate product-defined counter. If broader Unicode line counting is intended, state it. Ropey warns that disabling defaults also disables SIMD unless explicitly restored. Verify line-count policy without altering text bytes.

### Read-only and buffer authority

1. Keep requested/effective modes explicit: editable UTF-8; truncated read-only preview; too-large read-only; binary read-only; decode-failed read-only; disk/read-only-on-disk; and degraded/write-locked. Show a user-visible reason for each read-only result.
2. Enforce read-only at the shared mutation authority for typing, paste, preview patch, FileSafe/LSP, agent write, recovery and revert. Slint read-only is a UI affordance only: programmatic assignment remains possible by documented contract. A read-only view cannot mutate dirty state, undo history, recovery state, or save authority.
3. OS/Git read-only continues to block Save and allow Save As. A permission change or write error after open is a save failure, not permission to clear dirty state. Keep explicit Save and preserve dirty state with reason, Retry and Save As.
4. One buffer per path remains shared across panes. Read-only reason, encoding mode, original line-ending sequence, size classification, dirty state, disk-change state and recovery attention are separate facts.

### Size and loading

1. Keep the 10,000-line default and 5 MB hard cap pending measured evidence. Above line threshold, open truncated non-editable view with Load full file; only explicit load and within-cap files may become editable. Above cap, keep truncated read-only view and offer Open in system editor. Do not add virtualized read-only editing to MVP.
2. Probe size before allocating the editor buffer. Count raw bytes and product-defined logical line boundaries incrementally while retaining only preview content and bounded scan state; do not require a whole-file String merely to decide mode. Beyond cap, remain truncated/read-only even if backend storage could hold the file.
3. Preserve settings and persistence choices (Large file threshold (lines), Hard cap (MB), redb) and stated ranges. Clarify decimal MB versus MiB. Keep line count primary and byte cap independently hard. Treat both numbers and the settings range as product choices until UX/performance measurements justify change.
4. Ropey counts bytes/chars/lines in O(1) and gives chunk access, but from_reader creates a resident Rope. RopeBuilder avoids a whole-input staging String. Neither establishes acceptable memory, Slint latency, render responsiveness, or end-to-end load time. Do not advertise large-file support from rope choice alone.

## Frozen decision disposition

| Reference and choice | Disposition | Proposed change or option | Validation |
|---|---|---|---|
| F-027 / text §2.6: UTF-8 editable, invalid UTF-8 read-only with reason | Retain. Ropey construction is UTF-8-valid and from_reader rejects malformed input. | Clarify BOM and malformed-byte/reload behavior; no lossy edit/save. | Valid multibyte UTF-8, invalid sequences at chunk boundaries, BOM, external correction then reload. |
| F-027 / §2.6: preserve CRLF/LF/CR | Retain; strengthen as byte identity on no-op Save and untouched-range preservation. Ropey write_to emits existing chunks; line indexing is not normalization. | Keep newline serialization in the source-canonical buffer. | Byte compare no-op and local edit fixtures for CRLF/LF/CR/mixed. |
| F-082: nearest existing ending, paste normalization limited to inserted transaction | Retain; settle tie/no-boundary/multi-newline semantics before implementation. | Candidate rule above; preserve all acceptance criteria and cross-ref limits. | Focused fixtures above, property-based edit sequences, untouched-boundary byte invariant. |
| F-027 / §2.6: explicit Save/no auto-save; binary read-only; no hex view | Retain all. | Specify binary recognition separately; no lossy replacement. Hex stays out of scope. | No write before explicit Save; binary reason; no auto-save. |
| F-027 / §2.6: OS/Git read-only reason, Save blocked, Save As allowed | Retain. | Enforce in buffer authority; widget read-only cannot block programmatic mutation. Keep filesystem write pipeline in FileSafe boundary. | Mutation attempts in read-only; permission race; dirty remains after save error. |
| F-027 / §2.6: undo/redo, clipboard, optional paste normalize, wrap off, monospace | Retain. | No representation-level change. Verify adapter keeps one undo group and correct selection/caret. | Keyboard/context menu, IME, clipboard, Unicode supplementary/combining chars, both paste modes, undo/redo. |
| F-028: truncated read-only + Load full above 10,000 lines; 5 MB cap; over-cap alternatives | Retain as provisional MVP choices, not performance-proven values. | Specify incremental probe, line semantics, MB unit, inclusive boundaries. Ropey does not justify raising cap. | Just-below/equal/above each limit; huge line; invalid UTF-8; multibyte; target machine memory/time/latency. |
| F-028: configurable persisted thresholds; no virtualized read-only edit unless needed | Retain. | Persist in redb and retain example ranges; virtualization is future option only after need is shown. | Settings survive restart; preview never loads full editable buffer. |
| text_and_size_context §2.5 / F-026: one buffer per path; dirty vs last-saved; check on Save/focus; combined prompt; no keystroke polling | Already covered; retain with exact section reference. | Preview remains a read-only projection until Load full, never a second authority. | Two panes; external edits while clean/dirty; Save/focus; combined prompt; no per-keystroke check. |
| F-018: orthogonal dirty/read-only/degraded/markers/lock/stale/change/failure/recovery states | Already covered; retain. | Add size/encoding reason distinctly; preserve Retry/Save As. | Cross product of size/encoding/read-only and save failure without clearing dirty. |
| F-020: local/remote unsaved recovery, exact banner, revalidate before claiming remote success | Already covered; retain. | Snapshot exact text and endings; no inferred remote success. Storage protocol stays with owner. | Local/remote recovery, exact mixed endings, disconnected and revalidated cases. |
| F-008 / definitions: typed sources, one save authority per path, editor input correctness | Already covered; retain; dependency on F-008 and adjacent owners. | String/Rope is below shared authority; no separate dirty/history/save branches. | Mutation source convergence, shared panes, undo scope, Save authority. |

## Alternatives, negative findings, open questions

- Flat String: simple Slint integration, perhaps adequate below cap; risk is full-string copying/rebinding and unknown widget scaling. Keep as baseline, not assume adequate.
- Ropey 1.6.1: UTF-8 and chunk/line support with concrete released test history; it is in-memory and may materialize into Slint string. It does not supply nearest-ending insertion or filesystem save policy. Ropey 2.0.0-beta.1 exists, but this review did not assess its behavior.
- Streaming preview and thresholded editable buffer fit F-028, but do not prove acceptable performance below cap. Test huge single line, slow disk, growth during scan and external changes.
- Slint widget as sole canonical model is not recommended without proof: text is in-out string, read-only allows programmatic assignment, and issue reports create a performance risk. It can render a bounded preview if edits/saves stay at backend authority.
- Piece table/tree, mmap, virtualization, alternate encodings and hex view were not adopted or deeply studied; no claim the opportunity set is complete.
- Negative: issue #8877 has no demonstrated fix/release in this evidence set. No reviewed source establishes Slint TextEdit as a virtualized large-file editor.

Open decisions: equal-distance tie and no-boundary rule; Unicode separator line counting; MB versus MiB; UTF-8 BOM; binary heuristic; String versus Ropey after end-to-end target measurements; preview byte/line budget; file mutation during preview.

## Cross-topic dependencies

F-008 owns typed mutation sources and single buffer/save authority. F-018 owns orthogonal state and save failure; F-026 owns one buffer per path and external-change prompts. F-020/storage-plan own recovery; snapshots should preserve exact text but this draft defines no storage design. FileSafe, LSPSupport, FinalGUISpec, storage-plan and source-control owners retain adjacent mutation, LSP, UI, persistence and Git behavior. No absent-contract defect is inferred outside the supplied slice. Rust + Slint is retained; no Iced, WorkNode, NodeSeed, runtime or readiness implication follows.

## Evidence, validation and critic handoff

See source-map.json and sources/public-evidence.md. Ropey’s 1.5.1 release notes report incorrect RopeSlice.len_lines counts when slices split CRLF; the 1.6.1 published crate includes randomized CRLF seam tests and property tests for slices/line iterators. This is a release-and-test evolution, not a located issue-to-PR chain. Current tests are not proven to be a dedicated regression for that exact changelog defect; issue/PR identity and targeted linkage remain uncertain. No issue or shipped fix is invented.

Executed: public browsing, local reads, authored files and host SHA-256 fingerprints. No tests, benchmark, build, app validation, source execution, repository/canonical edits or external operation.

Proposed validation: focused owner acceptance fixtures; actual Rust+Slint adapter on target OS/renderers. Measure load-to-first-paint, caret, select/scroll, paste, one-character edit, undo, save, peak memory, clone/rebind volume at threshold boundaries. Property tests should assert untouched ending bytes remain unchanged and no-op Save equals source bytes. Test size overflow and threshold races. These are proposals, not executed checks.

Critic handoff: no critic predecessor admitted and no criticism round run in this stage. The later coordinator-selected flash-family critic must check pinned code/history, Slint adapter limitations, each disposition and full user scope. Preserve disagreement and unresolved objections in final artifact.

## Stage record

First useful saved finding: sources/first-finding.md, 2026-10-07 20:07:06 UTC.
Artifact written during stage; exact completion time is recorded in source-map.json.
Usage and billing telemetry unavailable: null; not zero.
No SourcePASS, exhaustive opportunity recall, build or validation claim.


