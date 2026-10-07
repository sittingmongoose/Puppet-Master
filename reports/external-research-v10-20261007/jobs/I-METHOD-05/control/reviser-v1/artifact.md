# Integrated revised proposal — I-METHOD-05/control/reviser-v1

**Stage status:** Complete, research proposal only. This is one coherent full-scope revision integrating topic A, topic B, and every disposition in the critic report. It does not change product canon, code, repository files, schemas, or WorkNodes. Product direction remains Rust + Slint.

**Scope:** F-008, F-018, F-020, F-026, F-027, F-028, F-082, definitions_and_transactions, editing_and_save_context, and text_and_size_context, including their cross-topic seams and adjacent owner boundaries. The exact input map declares the two topic artifacts/source maps and the full critic artifact/source map as predecessors. It declares no separate same-arm candidate-inventory file; no other inventory or stage history was inspected.

## 1. Integrated recommendation

Retain the accepted single-buffer, explicit-save, recovery, UTF-8, line-ending, read-only, and size-limit choices. Add a narrow external-change rule: when an external divergence was observed while a buffer was dirty and a later local transaction makes it clean, immediately revalidate the current destination before treating the buffer as synchronized. If the destination is still different, keep a pending divergence fact and show the existing changed-on-disk resolution once. Do not silently replace disk or claim that the old buffer is current. This is a proposed F-026 clarification supported by an analogous Zed issue, merged fix, pinned code, and regression test; it is not evidence that Puppet Master has the same defect.

Route user edits, programmatic edits, preview/apply edits, recovery, conflict resolution, and saves through one authority per file path. Keep read-only, size/encoding mode, dirty, stale-disk, changed-on-disk, write failure, recovery attention, and degraded/locked status as separate facts. A UI widget flag is not that authority. Slint v1.12.0 source observations include public paste, undo/redo dispatch, and programmatic text assignment paths that require adapter/backend enforcement. This identifies a boundary to validate; it does not assert an application defect.

Keep the 10,000-line default, independent 5 MB hard cap, truncated read-only preview, explicit Load full file, and no MVP virtualized editing. Keep flat String as the simplest baseline and Ropey 1.6.1 as an optional representation to evaluate. Neither a rope nor incremental construction establishes acceptable Rust + Slint responsiveness or memory use. Do not select a library version, save algorithm, file-revision token, or implementation architecture from this bounded evidence.

## 2. Complete proposed product contract

### 2.1 Shared buffer, transactions, and histories

A file path has one canonical buffer, one saved-content version, one dirty determination, one destination baseline/revision record when available, one pending external-divergence record, and one save/retry authority. Tabs, split panes, groups, previews, and other edit surfaces for that path share this buffer. A preview is a read-only projection until an explicit Load full file or an authorized edit operation enters the shared buffer.

Dirty means the in-memory buffer differs from its last successfully saved content. Dirty does not prove that disk or a remote destination is current. A successful destination write alone advances the saved-content and destination baseline, clears dirty, and permits a success indication. A destination change is independent of whether the in-memory text is dirty.

Every mutation must pass a typed transaction source through the shared authority before content, undo grouping, dirty state, or save permissions change. Sources include typing, paste, delete, preview patch, FileSafe/LSP apply-edit, agent write, restore/revert, recovery replay, and external-change resolution. Record whether an agent/FileSafe action replaces, patches, formats, renames, or applies a code action. One single-file assistant batch may form one undo group for that buffer. A multi-file batch has a receipt and one group per affected buffer; editor Ctrl+Z remains buffer-local. Hunk staging, rename, repository/worktree restore, source-control conflict resolution, and runtime recovery anchors remain outside ordinary editor undo. Revert-last-agent-edit remains a chat-owned backend restore followed by a buffer refresh; editor surfaces do not invent restore points.

Read-only authorization belongs at this same mutation boundary. Reject mutation before it can alter content, dirty state, undo history, recovery state, or save authority. Check typing and paste as well as preview, agent, FileSafe/LSP, programmatic assignment, undo/redo, restore, recovery, and external resolution paths. Slint's TextEdit read-only property is a UI affordance, not a shared-buffer security or correctness gate. OS/Git read-only continues to block Save while permitting Save As. A permission change or write error after open is a save failure; it does not authorize clearing dirty state.

Keep layered histories separate: per-buffer editor undo, user-requested restore, Git/source-control history, and internal crash/recovery anchors are not interchangeable. Preserve a single-file undo group and the multi-file receipt/per-buffer grouping. No cross-file Ctrl+Z is proposed.

### 2.2 Save, external change, and conflict timing

Save remains explicit in MVP; there is no auto-save. Before replacing a destination, compare the current destination to the last-loaded/last-successful-save baseline. Continue reconciling at Save and when the file tab or editor pane gains focus. Watcher events are prompts to reconcile state, not durable proof: events can be missed, delayed, or coalesced. Do not poll on every keystroke.

If disk changed while the buffer is dirty, preserve local text and record the external divergence. Use one combined dirty-plus-changed resolution with Reload (discard local edits), Overwrite, Cancel, and the existing Show diff path; never queue separate dialogs for the same state. Preserve the existing confirmation before any revert that discards edits.

Resolve the topic A timing contradiction in this proposal as follows: if a known pending divergence crosses a local dirty-to-clean transition, immediately reread/revalidate the current destination. If the current buffer and destination are demonstrably byte-equal, clear the pending fact without a dialog. If the destination remains different, surface one ordinary changed-on-disk resolution at that transition, before calling the buffer synchronized or permitting a later save to silently replace disk. Reload adopts the current destination; Overwrite is explicit user choice; Cancel leaves the pending/stale fact visible and defers resolution until the next focus or Save reconciliation; Show diff remains available. A current-destination check is required before clearing a conflict that may have disappeared. This proposed timing preserves user control while making the no-stale/no-silent-overwrite condition testable; an owner may refine the prompt mechanics, but not remove current revalidation or silently declare synchronization.

A watcher is not a concurrency primitive. The revision/fingerprint method for local, remote, cached, same-tick, deleted, or replaced-path destinations remains an owner decision. The save operation also needs an agreed way to detect or handle a change between preflight and the actual write. Do not assume mtime alone is sufficient: the cited Zed repair uses mtime as a local guard, which is useful mechanism evidence but does not prove timestamp uniqueness or cover remote and unusual filesystems.

Only a verified successful write advances saved content and the destination baseline, clears dirty, and displays success. On disk-full, permission denied, missing path, read-only target, unavailable remote destination, open/write/replace failure, or failed reconnect, preserve the buffer and dirty/recovery facts, leave the baseline unchanged, state the reason, and offer Retry and Save As. Revalidate a remote destination before reporting remote save/flush success.

No save algorithm is selected. In-place truncate/write preserves the existing file object but may expose an empty or partial file if interrupted. Temporary-file-plus-rename may create a stronger replacement boundary on supported filesystems but can replace the watched inode, alter metadata/permissions, or fail across devices. Atomic replacement, failure recovery, conditional write, and platform-specific behavior remain with FileSafe/storage owners. The bounded evidence establishes no atomic-save implementation history.

### 2.3 Unsaved recovery and remote state

Recover-unsaved remains required for local and remote-backed buffers. Recovery snapshots represent local edit state, not proof of destination success. On restart, restore recovered text into the shared buffer with a visible recovery-attention fact, preserve its exact text and line-ending bytes, and compare the current destination before save or flush. A recovered remote buffer uses the exact banner: “Recovered local edits — remote destination not yet synchronized”. Reconnect/revalidate before remote success is shown.

Keep recover-unsaved coverage for /quit and /later. Remote offline editing remains cached-files-only. File editing does not imply remote terminal or /run-debug availability. Storage-plan owns durable snapshot schema, identity, cadence, retention, and atomicity; this proposal selects none of them and does not claim a remote write.

### 2.4 Text identity, encoding, and line endings

Editable text must be valid UTF-8. Do not lossily decode and then permit ordinary Save. Keep the existing Cannot decode as UTF-8 reason until external correction and a reload yield valid UTF-8. Valid UTF-8 may still be binary only under a separately stated and tested recognition policy; do not infer a binary heuristic from Ropey.

Preserve original UTF-8 code points and each existing LF, CRLF, and CR boundary in order. A no-edit Save must be byte-identical to the opened UTF-8 bytes. After an edit, bytes outside the edited range, including surviving line-ending boundaries, remain unchanged. Do not normalize on load, render, copy, save, or recovery. Keep optional paste normalization: with it off, retain pasted endings; with it on, normalize only newly inserted paste boundaries in that transaction and one undo group. Surrounding content remains byte-identical. Preserve undo/redo, clipboard behavior, wrap off, and monospace choices.

For F-082, retain the nearest-surviving-existing-boundary policy: each inserted newline follows the closest surviving line-ending boundary in buffer context, while separators outside the replacement range remain unchanged. Ropey does not choose this policy; callers supply inserted text. Before implementation, settle equal-distance tie, no-surviving-boundary behavior, and whether a multi-newline insertion chooses per newline or per transaction. A candidate rule is nearest by character distance, tie to the preceding boundary, and an explicit configured new-file default when no boundary exists. That remains a proposal, not a product decision. Test beginning/end insertion, empty files, removed nearest boundaries, equal ties, mixed endings, paste-normalization on/off, multi-newline paste, undo/redo, and no-op byte identity.

BOM behavior, binary recognition, Unicode scalar versus grapheme cursor behavior, embedded NUL, Unicode separators, and the exact line-count definition remain unresolved. Keep these distinct from byte preservation and do not silently infer them from a text library.

### 2.5 Read-only modes and large-file behavior

Keep requested/effective modes explicit: editable UTF-8, truncated read-only preview, too-large read-only, binary read-only, decode-failed read-only, disk/read-only-on-disk, and degraded/write-locked. Show the user a reason for each read-only result. Keep dirty, recovery, encoding, size, disk divergence, marker, and lock facts independent.

Retain the 10,000-line default and 5 MB hard cap as provisional MVP choices. Above the line threshold, open a truncated noneditable preview with explicit Load full file. Only a within-cap file that the user explicitly loads may become editable. Above the hard cap, retain a truncated read-only view and offer Open in system editor. Do not add virtualized read-only editing to MVP. Keep line count primary and the byte cap independently hard; neither a rope nor a faster scan may bypass the cap.

Probe raw bytes and product-defined logical line boundaries incrementally before allocating the editable buffer; retain only bounded preview content and scan state. Recheck size and file identity if the destination changes during scanning or between preview and Load full. A huge single line, slow disk, malformed UTF-8, growth during scan, and boundary races need explicit handling. Preserve the existing persisted settings and ranges, including Large file threshold (lines), Hard cap (MB), and redb; do not invent replacement values here. Clarify decimal MB versus MiB and inclusive boundary rules.

Ropey 1.6.1 provides valid UTF-8 handling, chunk-ordered serialization, O(1) byte/character/line queries, and incremental RopeBuilder append. RopeBuilder has its own working buffer, and the completed Rope remains resident. Rope::write_to can partially write before an error. Default unicode_lines recognizes more separators than LF/CRLF/CR. If product threshold counts only LF/CRLF/CR, explicitly configure features (the draft's example is cr_lines plus simd with defaults disabled) or provide a separate product counter. If broader Unicode line counting is intended, state that. Neither choice changes source bytes. Disabling Ropey's default features also disables SIMD unless explicitly restored.

Flat String is simpler and may be adequate under the current cap; repeated flattening/rebinding and Slint latency are unknown. Ropey may retain segmentation advantage only if the actual UI adapter can consume chunks without materializing a full string on each event. Keep String as baseline and Ropey 1.6.1 as an option, not a package/version requirement. Ropey 2.0.0-beta.1 was mentioned but not assessed. Piece table/tree, mmap, virtualization, alternate encodings, hex view, and other editors are not deeply studied and are unassessed, not rejected as an exhaustive opportunity set. Slint TextEdit as sole canonical buffer is not recommended without proof of adapter and performance behavior; retaining it as a renderer of bounded content remains possible.

### 2.6 Evidence limits for Slint and performance

Pinned Slint v1.12.0 sources expose TextEdit text as in-out, bind read-only to the input, expose a public paste path, guard some keyboard insertion/cut/paste paths, dispatch Undo/Redo without the same read-only guard, and allow programmatic text assignment by documented contract. These are source observations, not runtime tests. They support a proposed shared-authority gate and adapter tests for programmatic assignment, public paste, undo/redo after read-only is enabled, and backend rejection for all mutation sources. They do not establish a Puppet Master defect.

Slint issue #8877 is one closed-as-duplicate report for Slint 1.12, Rust, Windows 11 23H2, and wint+Skia. It reports selection/scroll lag with standard TextEdit and custom PlainTextEdit; its exact size wording is “130,172 characters (specifically 130,172 × 3 in my case).” Treat it as one configuration-specific report, not a benchmark, general widget limit, or confirmed regression. No fix/release was established. Issue #12343 about CRLF paste on Slint 1.17.0 was mentioned in topic B but not deeply inspected; retain it as uncertain, not a confirmed defect. Mutable latest Slint docs are not the sole evidence; pinned v1.12.0 sources ground the code observations.

Before choosing String/Ropey or asserting a cap is responsive, measure the actual Rust + Slint adapter on target OS/renderers: load-to-first-paint, memory, caret, selection, scrolling, paste, one-character edit, undo/redo, save, and clone/rebind volume at boundary sizes. No candidate benchmark or build ran in this stage.

## 3. Complete frozen-decision comparison and dispositions

| Reference | Disposition | Integrated proposal and condition |
|---|---|---|
| F-008 | Retain; clarify routing | Keep typed mutation sources, one buffer/save authority per path, pane convergence, per-buffer undo, and no cross-file Ctrl+Z. Route recovery replay, external resolution, programmatic assignment, preview, FileSafe/LSP, and agent writes through that authority. Keep multi-file receipt plus one group per affected buffer. FileSafe/LSPSupport behavior remains an adjacent dependency, not an inferred defect. |
| F-018 | Retain; add distinct external-divergence fact | Preserve independent dirty/read-only/degraded/change-marker/write-lock/stale-disk/changed-on-disk/failure/recovery facts, explicit Save, failure reason, Retry and Save As. Add pending divergence and dirty-to-clean revalidation without flattening state or clearing dirty on failure. |
| F-020 | Retain | Keep local and remote recover-unsaved, local-memory snapshot semantics, exact remote recovery banner, revalidation before remote success, cached-files-only remote offline editing, and no terminal or /run-debug implication. Storage design stays open. |
| F-026 | Retain; add one reconciliation trigger | Keep one buffer per path, dirty as difference from last saved content, revert confirmation, Save and focus checks, one combined dirty-plus-disk-change prompt, and no every-keystroke polling. Add current-destination revalidation at an observed-conflict dirty-to-clean transition, with immediate resolution if divergence persists. Do not use mtime alone as an adequate universal token. |
| F-027 | Retain | Keep valid UTF-8 editing, no lossy Save, decode/binary/read-only reasons, undo/redo, clipboard, optional paste normalization, wrap off, monospace, explicit Save, no auto-save, no hex view, and OS/Git read-only Save-blocked/Save-As-allowed behavior. Clarify BOM, binary policy, scalar/grapheme behavior, and shared-authority enforcement. |
| F-028 | Retain provisionally | Keep 10,000-line default, independent 5 MB hard cap, truncated read-only view plus Load full, over-cap system-editor option, persisted settings/ranges, and no MVP virtualization. Define line units, decimal MB/MiB, and boundary semantics. A cap is not proof of acceptable performance. |
| F-082 | Retain; leave insertion edge rules open | Keep nearest surviving ending, preservation of all existing CRLF/LF/CR bytes, and paste normalization limited to inserted text. Settle tie, no-boundary, multi-newline selection, and per-line-count semantics before implementation. Ropey does not supply this policy. |
| definitions_and_transactions | Already covered; retain authority model | Keep typed sources, one save authority, layered histories, preview/LSP/restore routes, and adapter input correctness. FileSafe, LSPSupport, FinalGUISpec, storage, and source-control remain owners/dependencies; do not invent missing-contract defects. |
| editing_and_save_context | Already covered; retain save/recovery model | Keep explicit save/failure, stable unsaved indicators, revert/history ownership, cached-only remote offline behavior, and remote states. Add only the pending-divergence transition; no storage schema or remote write claim. |
| text_and_size_context | Already covered; retain shared F-026/F-027/F-028 behavior | Keep exact dirty definition, combined prompt, no keystroke checks, UTF-8/newline/no-auto-save, read-only reasons, and size limits. Preview is not a second authority. Keep product line-count semantics separate from Ropey's defaults. |

No frozen decision is silently reassigned to a different owner. FinalGUISpec owns final visible arrangement/accessibility; FileManager owns editor status/prompt facts and copy; Git/source-control owns hunk and repository operations; storage-plan owns durable state and remote identity.

## 4. Critic dispositions, disagreements, and unresolved comparison choices

| Critic finding or objection | Disposition in this revision |
|---|---|
| Zed's dirty-to-clean mechanism is relevant but does not prove a Puppet Master bug | Retained as bounded analogous evidence; the proposal is conditional and does not assert an app defect. |
| Zed mtime comparison is insufficient for a universal revision contract | Accepted. Treat mtime as an example only. Stable local/remote/cached revision token, replacement/deletion identity, and compare-at-write remain open. |
| Exact Zed shipped release tag was not established | Preserve uncertainty. PR merge, code, test, and release-note inclusion are supported; exact release applicability is not claimed. |
| Topic A recommendation conflicted with its open prompt-timing question | Resolved at proposal level: immediate revalidation and one existing resolution on a persistent dirty-to-clean divergence. User remains in control. The owner may refine mechanics but cannot permit stale synchronization or silent overwrite. |
| Atomic save and concrete FileSafe/storage behavior were not established | Keep in-place write and temp-file-plus-rename as alternatives, state their tradeoffs, and make no algorithm or history claim. |
| Ropey is useful only as a qualified option | Retain 1.6.1 as an option under current gates, not a product requirement. Keep flat String as the simpler baseline; actual adapter/performance decides. |
| Ropey history lacks an issue-to-PR chain and dedicated regression link | State only the 1.5.1 changelog defect and 1.6.1 seam/property tests as release-and-test evolution; no causal linkage is invented. |
| Rope::write_to may partially write | Accepted; representation serialization is not FileSafe atomicity. Save-failure semantics stay separate. |
| Slint read-only evidence omitted paste, undo/redo, and programmatic paths | Corrected with pinned v1.12.0 wrapper/base/core source observations. Add proposed adapter/backend tests; no runtime claim. |
| Slint #8877 wording could overstate performance | Corrected to one configuration-specific report and exact reported wording, not a benchmark or widget limit; no fix/release claim. |
| F-028 line/byte thresholds and performance need sharper conditions | Retain current values provisionally; clarify line definition, decimal MB/MiB, inclusive edges, scan cancellation/yielding and recheck on mutation; require actual target measurements before changing values. |
| Cross-topic conflict, recovery, representation, read-only and line-ending seams were missing | Integrated in sections 2.1–2.6 and the validation plan below. |
| Piece trees, mmap, virtualization, alternate encodings, hex, and other editors were not examined comprehensively | Mark unassessed, not rejected, and do not claim exhaustive discovery. |
| Slint TextEdit as sole canonical model is unsupported by this evidence | Do not recommend as sole authority without adapter proof. It may still render bounded content. |
| Topic drafts/critic were not themselves a complete final | This artifact is the integrated full-scope proposal. It includes all nine references, all cross-topic seams, O1–O6, alternatives, conditions, criticism dispositions, and open questions. |

### O1–O6 inherited assessment

| Objective | Evidence and disposition |
|---|---|
| O1 — discovery beyond frozen PlanUnits | Bounded discoveries: Zed's analogous dirty-to-clean issue/fix/test; Ropey 1.6.1 representation and CRLF/test history; Slint read-only adapter and one performance report. Not exhaustive and not a Puppet Master defect finding. |
| O2 — code/mechanism | Pinned Zed commit grounds did_edit/undo and its regression; pinned Ropey v1.6.1 code grounds UTF-8, chunk write, builder, and line features; pinned Slint v1.12.0 wrapper/base/core grounds the read-only observations. No production version or implementation is selected. |
| O3 — history | Zed issue → merged PR → pinned guard/test is established, but exact shipped tag is uncertain. Ropey release/test evolution is established without issue/PR or dedicated linkage. Atomic-save history is absent in this bounded evidence. |
| O4 — comparison | All F-008/F-018/F-020/F-026/F-027/F-028/F-082 and all three context copies are individually dispositioned in section 3. |
| O5 — criticism and unresolved objections | Every critic objection is dispositioned above; remaining revision-token, save, line-ending, encoding, size, recovery, UI, and performance uncertainties stay visible. |
| O6 — complete proposal | Sections 1–5 provide integrated contract, mechanisms, choices, alternatives, comparisons, conditions, dependencies, proposed validations, and executed-work limits. No canon change or validation result is claimed. |

## 5. Cross-topic seams and proposed validation

The integrated contract specifically covers: conflict × recovery × representation (recovered text/endings do not advance disk state); F-082 × F-027 × Ropey (byte preservation is separate from line-count policy and nearest-ending insertion); read-only × undo (paste, programmatic edit, undo/redo, and backend origins share the gate); size × conflict/recovery (a prompt or restored snapshot cannot bypass the 5 MB cap); and destination races (watchers trigger reconciliation but are not durable proof).

**Proposed only; not executed in this stage:**

1. Open one path in two groups; edit/save in either pane; verify both render one buffer, one dirty state, one destination baseline, and one save outcome.
2. Exercise user typing/paste/delete, preview patch, single-file FileSafe/LSP edit, agent batch, revert, recovery replay, external resolution, and programmatic widget assignment. Verify typed source, one authority, correct undo grouping, mutation rejection in read-only, and no cross-file Ctrl+Z.
3. Test editable/read-only × clean/dirty × disk unchanged/changed/deleted/replaced/read-only × local/remote-connected/remote-disconnected. Verify independent facts, current-destination checks, one combined prompt, immediate dirty-to-clean reconciliation, no stale “synchronized” status, and no keystroke polling.
4. Test two external writes, a write between focus and Save, divergence that disappears before resolution, and a destination change between preflight and write. Confirm no silent overwrite and exercise the eventual compare-at-write contract once owners choose it.
5. Fail or interrupt open/write/replace/reconnect. Verify saved content and baseline advance only on verified success; Retry/Save As preserve buffer and recovery state. Compare in-place and temporary-file/rename implementations only after FileSafe/platform owners define the test boundary.
6. Crash/restart around local and remote recovery snapshots. Verify exact text and line endings, recovery attention, exact remote banner, cached-only offline scope, and revalidation before remote success.
7. Keep F-027 fixtures for valid multibyte UTF-8, invalid sequences, binary/read-only reasons, BOM policy once chosen, clipboard, undo/redo, and optional paste normalization. Assert no lossy Save.
8. Keep F-082 fixtures for CRLF/LF/CR mixtures, no-op byte identity, untouched-boundary preservation, nearest-boundary rules, tie/no-boundary behavior after those are chosen, paste normalization, undo/redo, and recovery.
9. Test F-028 just-below/equal/above each line and byte threshold, huge single lines, malformed UTF-8, growth/replacement during scan and Load full, cancellation/yielding, system-editor option, and settings persistence. Do not infer the line-count rule from Ropey's defaults.
10. Benchmark the actual Rust + Slint adapter on target OS/renderers for load-to-first-paint, memory, caret, selection, scroll, paste, one-character edit, undo/redo, save, and string clone/rebind volume. Use these measurements to choose String or Ropey and to revisit limits; a library property or issue report is not a substitute.
11. Review visible reasons, prompt copy, keyboard and accessibility behavior with FinalGUISpec/FileManager owners. Keep GUI layout and ownership decisions in their canonical slice.

**Executed in this stage:** bounded local reads of the exact map, its six declared predecessors, and their mapped source-evidence notes; prior browser-captured public source notes were read and preserved under this stage's sources directory. No new broad web discovery, application test, benchmark, build, source execution, candidate validation, repository/canonical edit, external action, or SourcePASS determination was performed. The public-source files are human-readable excerpt/capture notes, not complete byte-for-byte upstream archives. Usage and billing are unavailable and remain null, not zero.

## 6. Remaining decisions and limits

The following remain open because the admitted sources do not decide them:

- Stable revision/fingerprint and compare-at-write behavior for local, remote, cached, same-tick, replaced, deleted, and re-created paths; watcher semantics and cache freshness.
- Whether destination replacement uses in-place write or temporary-file-plus-rename; metadata, permissions, watcher identity, cross-device behavior, and crash recovery.
- Recovery cadence, retention, persistence schema, and whether undo history survives reload.
- F-082 tie-breaking, no-existing-boundary default, per-newline versus per-transaction selection, and exact product line-count separators.
- Decimal MB versus MiB, inclusive threshold boundaries, preview byte/line budget, cancellation/yield policy, and behavior during file changes.
- UTF-8 BOM, embedded NUL/binary heuristic, Unicode scalar/grapheme cursor behavior, Unicode separators, and valid-UTF-8 binary classification.
- Flat String versus Ropey after measured Rust + Slint adapter behavior; Ropey feature set only after line semantics are chosen.
- Final status/prompt layout and accessibility, which belong to FinalGUISpec/FileManager owners.

No claim is made that these evidence captures establish exact upstream raw-page bytes, that the alternative set is exhaustive, that any proposal has been implemented, or that any proposed validation has run.

