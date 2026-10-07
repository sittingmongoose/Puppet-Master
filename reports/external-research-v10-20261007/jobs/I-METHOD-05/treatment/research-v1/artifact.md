# Exact candidate-authored discovery

# I-METHOD-05 / treatment / discovery-v1 — discovery inventory and frozen-slice comparison

**Artifact type:** discovery-stage handoff for fresh topic researchers. It records candidate mechanisms, implementation evidence, alternatives, conditions, and an item-by-item comparison with the bounded frozen owner slice. It is not a canon edit, final product recommendation, independent critic review, or claim that the application was built or validated.

## Scope and boundaries

The brief asks about a local UTF-8 file opened in two panes, normal editing and explicit save, crash/quit recovery, outside-file changes, mixed CRLF/LF/CR, and large/read-only files. Product direction remains **Rust + Slint**. The owner slice is only F-008, F-018, F-020, F-026, F-027, F-028, F-082 and their copied definitions/transaction/save/text contexts. FileSafe, LSP, storage, and final UI contracts remain adjacent-owner dependencies; their absence from this bounded copy is not a defect finding. No repository, plan, runtime, or WorkNode was changed.

## Discovery inventory

### Topic group A — shared working copy, recovery, external changes, and save authority

**One document identity across panes.** The copied definitions distinguish a Buffer from a Tab and say groups have separate tab lists over a global shared buffer model. F-008 and F-026 already require one buffer/save authority per file path and no duplicate tabs per group. VS Code's public Working Copies architecture is a useful comparison: resource + type identify the editable entity; dirty/content/save events support centralized lifecycle; backups are resolved into a working copy/editor and removed after successful save. That shows a concrete separation between per-view presentation and per-resource state, but does not establish that Puppet Master should copy VS Code APIs or backup storage.

**Recovery is local unsaved state, not a remote write receipt.** The source copy already says recovery is required for local and remote-backed buffers, recovered remote state is local memory only, the banner is exact, and reconnect/revalidate must precede claims of remote save/flush success. VS Code is an analogous dirty-backup lifecycle. The broader persistence mechanism, retention, encryption, corruption handling, and backup owner belong to the named adjacent storage owner and are not answered here.

**Dirty-buffer external updates need a later state-transition check.** Zed issue #48697 documents a real sequence: an external update arrives while the buffer is dirty, reload is suppressed to preserve edits, then undo makes the buffer clean but leaves stale text. Zed PR #51037 merged commit `50aef1f` on 2026-03-10, checks disk mtime at dirty-to-clean in `did_edit()` for present files, adds `test_dirty_buffer_reloads_after_undo`, records 28 checks passing, and has a release note included in Zed 0.229.0. This is evidence for testing dirty→clean after a suppressed update; it does **not** prescribe a dirty-buffer conflict policy or prove the same metadata is reliable on every filesystem. The bounded plan already has on-save/on-focus checks and a combined dirty+changed prompt, so this case is a validation edge rather than an asserted omission.

**Watchers are hints, and path replacement is a distinct case.** `notify` 8.2.0 documents that NFS may emit no events and large watch sets may lose events; `PollWatcher` with content comparison is a documented alternative. Vim-style saves commonly replace via temporary path/rename, so watching a path, parent directory, or file identity can behave differently. A robust policy needs to separate event receipt from state reconciliation at the explicit save/focus points already present in F-026. Polling, content fingerprints, metadata tuples, and event-driven refresh have different latency and IO costs; no one method is established as the default by this discovery.

**Save replacement choices expose different failure modes.** A direct write to the target keeps the target inode and avoids a rename step but can expose truncation/partial output when open/write fails. A same-directory temporary file followed by replacement can avoid publishing an incomplete new byte stream at the target, but rename behavior is platform/filesystem-specific, cannot cross mounts, and replacement may change inode semantics, ACL/metadata, symlink/hardlink behavior, or watcher attachment. `tempfile::NamedTempFile::persist` documents atomic replacement but explicitly does not promise file/directory synchronization (durability) on return. An external-change check followed by save still has a check/use race. These are save-design questions beyond F-018's required UX guarantee (“failure stays dirty”); they are optional integrity hardening candidates, not requirements inferred from the slice.

### Topic group B — text storage, line endings, read-only, and large files

**Pinned Rust buffer candidate: Ropey 1.6.1.** The docs.rs package source identifies upstream commit `d41ee247f2f097c7f9c8e4730b7dd884734f1ee5`. In `src/rope.rs`, `Rope` is a shared `Arc<Node>` tree; documented editing/query operations are generally worst-case O(log N), cloning is O(1) with incremental divergence, `from_reader` streams valid UTF-8 into a builder, `write_to` writes chunks and can return after partial output, and edit/query indices are Unicode scalar (`char`) indices with byte/UTF-16 conversions available. The governing `src/tree/{node,node_children,node_text,text_info}.rs` files store tree and per-subtree text metrics; `src/crlf.rs` prevents splitting a UTF-8 codepoint or CRLF pair at chunk seams. Existing raw CR/LF bytes remain text content through chunk writes when callers do not normalize. Its default features enable Unicode line recognition; feature selection changes recognition semantics. This is a plausible mechanism for in-memory editing/line indexing, not an encoding detector, crash-safe file transaction, disk watcher, binary editor, or UI virtualization solution. It is in-memory and requires valid UTF-8; the upstream project itself warns that it cannot handle text beyond available memory and allocates kilobyte chunks.

**Alternatives are distinct tradeoffs, not rankings.** `crop` is a B-tree rope aimed at frequent edits/large buffers, shares data across threads, uses byte offsets like Rust `String`, and recognizes LF/CRLF. Ropey uses Unicode scalar offsets and broader configurable line recognition. A flat `String` keeps representation and save/read code simple but risks whole-buffer copying and edit costs for large documents. Gap buffers favor locality around one cursor and make distant/multi-cursor edits more expensive. Memory-mapped or piece-table designs are further alternatives for large-file handling but introduce lifetime/IO/cache and mutation complexity; they were not inspected as pinned implementations here. Any later choice must measure the actual Slint adapter, snapshot/undo policy, and requested thresholds, not only rope edit throughput.

**Exact mixed-ending policy is stronger than generic CRLF support.** F-027 already requires preserving CRLF/LF/CR on save; F-082 makes the more precise policy explicit: surviving boundaries remain byte-identical, inserted newline boundaries inherit the nearest existing boundary, and optional paste normalization touches only the inserted paste transaction. Ropey's CRLF boundary machinery supports safe storage/indexing, but does not implement F-082's nearest-existing insertion policy. A candidate buffer is applicable only if its edits and UI adapter preserve the per-boundary sequence, including lone CR and seams at slice/chunk boundaries. `len_lines()` or normalized line iteration alone cannot prove byte preservation.

**Read-only/oversize are product modes, not rope features.** F-027 requires UTF-8 editable text and binary/decode/read-only reasons; F-028 chooses truncated read-only preview above 10,000 lines, a 5 MB hard cap, explicit “Load full file” below cap, and system-editor/read-only alternatives above cap. Ropey can index line counts but loading the whole file into a rope is not the same as a bounded prefix preview; an implementation would need a bounded streaming read or a separate full-load action. Ropey’s large-text capability is not a reason to override the accepted 5 MB MVP cap. Rust permissions metadata is advisory across platforms; the actual save attempt can still fail, so the plan’s visible read-only reason and dirty-on-failure behavior remain meaningful. Slint issue #8147 reports long-text focus behavior on Slint 1.10; it does not establish applicability to the supplied Slint dependency/version or a custom editor adapter.

## Frozen-slice comparison and dispositions

| Item | Existing decision in supplied copy | Discovery comparison / disposition |
|---|---|---|
| F-008 | Typed transaction sources; one buffer, dirty flag, last-saved version and save authority per path; ordinary undo is per-buffer and cannot become global multi-file undo. | **Retain / already covered.** The VS Code resource-keyed working-copy pattern is compatible evidence for one resource identity across views. Zed's dirty→clean case supports a later buffer-state transition test. No evidence requires changing transaction classes or broadening ordinary undo. Keep FileSafe/LSP and recovery ownership external as stated. |
| F-018 | Orthogonal dirty/read-only/degraded/change/write-lock/stale/changed/error/recovery facts; explicit Save; failure retains dirty and last-saved state with retry/save-as/reason. | **Retain; optional integrity detail.** UX state/failure contract is clear. Atomic replacement vs direct write, metadata preservation, partial-write recovery, and check/use races remain implementation choices; add only if the designated owner wants stronger disk-integrity guarantees. Do not imply “atomic” means durable. |
| F-020 | Required local/remote unsaved recovery; remote recovery is local memory only; exact banner; reconnect/revalidate before remote success. | **Retain / already covered.** VS Code gives a concrete local working-copy backup analogy. Backup persistence, lifecycle, and remote transport contracts remain unresolved by this file slice and owned externally; do not claim those adjacent docs are defective. |
| F-026 | One buffer per path; one tab per group; dirty vs last-saved content; prompt on Save and pane/tab focus, not each keystroke; one combined dirty+changed prompt with Reload/Overwrite/Cancel. | **Retain / already covers core conflict workflow.** VS Code uses a save-conflict compare path; Zed history shows dirty suppression followed by clean transition as an important edge. Watchers may miss NFS/large-directory events and replacement saves can detach path watches. Optional acceptance coverage: clean external in-place write, atomic replacement, event loss followed by focus/save reconciliation, dirty update then undo-to-clean, deletion/recreation, and “overwrite” confirming the version being overwritten. This does not prescribe a detection algorithm. |
| F-027 | Per-buffer undo/redo, selection/clipboard, optional wrap, monospace, UTF-8 editable, preserve CRLF/LF/CR, explicit Save, binary/decode/read-only reasons, no hex view or auto-save. | **Retain / partly already covered by F-082.** Ropey 1.6.1 can retain UTF-8 byte content and CRLF seams; validity/feature settings matter. F-082 is the precise behavior, while a library’s general line iteration is insufficient evidence. Optional exact-byte fixtures should cover mixed LF/CRLF/CR on no-op save and edit/save. UI applicability for Slint remains version/adapter-specific; the 1.10 report is a lead only. |
| F-028 | Truncated read-only first-N preview; 10,000-line threshold; 5 MB hard cap; explicit load-full under cap; read-only/system editor over cap; settings. | **Retain as product choice.** Ropey supports large in-memory structures but doesn't decide editor usability, memory budget, startup latency, or the accepted limits. Optional measurement should separately observe preview IO, full-load memory, render/frame latency, and undo/snapshot overhead at boundaries; no evidence supports changing the chosen numbers. |
| F-082 | Nearest existing boundary for inserted newline; preserve all surviving CRLF/LF/CR boundaries; paste normalization restricted to inserted transaction. | **Retain unchanged; crucial product requirement.** Ropey's storage/splitting rules help not corrupt CRLF seams but do not implement nearest-existing inheritance. Add exact byte-sequence checks for insertion, replacement, no-op save, paste normalization on/off, and edits at line-ending/chunk boundaries. Do not collapse mixed endings to one file-level mode. |
| Copied definitions/transactions | Buffer is the file content authority; tabs are view handles; all user/preview/agent/FileSafe/LSP/recovery mutations route through typed transactions; preview patches and single-file operations have scoped undo; multi-file actions remain per-file/receipt; remote authority changes capability. | **Retain; clarify only with owner review.** These are product/owner contracts rather than consequences of the candidate data structure. A cloneable rope snapshot can help async save but does not itself define source ownership, mutation authorization, dirty status, or per-file undo. |
| Copied editing/save context | Explicit save, failure stays dirty, stable unsaved indicator, separate Revert/restore history, remote offline/reconnect language, changed-on-disk Show diff. | **Retain / already covered.** Product behavior is well specified. Atomic write protocol, durability, and file identity are optional implementation decisions; storage/FileSafe/UI boundaries remain external. |
| Copied text/size context | Explicit UTF-8, preserve endings, binary/decode/read-only reasons, truncation/load-full, 10k/5MB, UI alternatives. | **Retain / already covered.** Discovery informs mechanism fit and validation, not threshold/default changes. Slint version, rendering adapter, decode policy for BOM/invalid sequences, and byte-vs-line threshold interaction remain unknown. |

## Opportunity, negative, rejected, and uncertain findings

- **Supported opportunity:** add implementation acceptance fixtures for dirty→clean after a suppressed outside write and for filesystem event loss/replacement followed by the already-required focus/save checks.
- **Supported optional opportunity:** compare direct writes and same-directory stage/replace with explicit metadata, symlink, open-handle, permissions, failure, and durability expectations before choosing a save implementation.
- **Supported opportunity:** verify F-082 by raw bytes, not displayed line count or normalized text; keep paste-normalization tests distinct from ordinary save.
- **Negative finding:** Ropey line-awareness is not proof of preserving F-082’s nearest-boundary policy; its `write_to` is not an atomic save; its in-memory performance is not a bound on Slint view/render costs.
- **Negative finding:** watcher callbacks are not reliable proof of current disk state across every filesystem; NFS and large watch sets are specifically documented limitations.
- **Rejected lead:** replacing the 10k/5MB product modes with a rope-backed editable/virtualized full file merely because Ropey advertises gigabyte-scale data is unsupported and contradicts the bounded product decision.
- **Rejected lead:** using a read-only attribute as the sole proof that save will succeed/fail is unsafe; OS/platform permissions and races differ.
- **Uncertain:** actual Ropey/crop compatibility with any frozen chosen product is not assumed; the supplied plan names no crate/version. Slint TextEdit issue applicability is unverified. Atomic replacement behavior for a particular OS/filesystem, metadata retention, timestamp granularity, remote destination, and link semantics require platform-scoped evidence.
- **Scope limitation:** discovery is broad and useful, not an exhaustive recall of all editor architectures or opportunity space. No flash-family independent critic or final reviser ran in this stage; preserve that as downstream work.

## Validation proposals (none executed here)

1. Use raw-byte fixtures with mixed CRLF/LF/CR; compare no-op save, edits on either side of each separator, newline insertion/replacement, chunk/slice boundary, paste normalization off/on, failed save, and re-open byte equality.
2. State-machine tests for two panes sharing one path: one edit updates both views, one dirty flag/save authority, correct per-file undo; close/reopen/crash recovery and recovered remote banner/revalidation.
3. External-change scenarios: clean in-place write, atomic replacement, deletion/recreation, metadata-only change, dirty write then undo-to-clean, dirty write then save, event loss/NFS-like reconciliation at focus/save; verify no silent stale overwrite and exactly one combined user decision.
4. Save-failure fault injection at temp creation/write/flush/replace/metadata/sync and at direct-write stages; confirm buffer stays dirty and that disk-visible outcomes match whichever documented guarantee is selected.
5. Large-file boundary measurements at 10,000 lines and 5 MB, separately for initial prefix preview, Load full, over-cap alternate actions, memory, and actual Slint rendering/input latency. Include long-line and invalid-UTF-8 inputs.

These are proposals only. The reported Zed PR checks and release notes are public upstream history, not checks run for Puppet Master. No application build or validation was performed.

## Provenance and handoff

- First useful saved finding: `sources/discovery-capture.md`, saved 2026-10-07 20:06:47 UTC.
- Full artifact completion: 2026-10-07 20:12 UTC (before the fixed 20:14:20.932703 UTC stage deadline), recorded to the second in `source-map.json`.
- Original map-listed inputs were read in full after broad discovery. Their observed SHA-256 values match `input-map.json`; the originals were not changed.
- Public source searches/opens were performed from 2026-10-07 20:04 to 20:12 UTC. Captured version/pin details are in `source-map.json`; citations there point to direct upstream/package/documentation URLs.
- No executable scientific checks or builds ran. Candidate-token usage and billing are unavailable to this stage and recorded `null`.
- Fresh downstream researchers should take this inventory plus the exact topic slices from the input map, independently adjudicate the listed uncertain applicability, and keep criticism/revision evidence separate from the present discovery record.


# Exact candidate-authored research-topic-a

# I-METHOD-05 / treatment / research-topic-a-v1

## Proposed topic-A replacement section

**Topic:** Shared buffer, save and recovery state. **Owners:** F-008, F-018, F-020, F-026, `definitions_and_transactions`, `editing_and_save_context`. This is a bounded proposal against the exact frozen copies, not a canon edit or claim that Puppet Master is implemented. The product direction remains Rust + Slint. FileSafe, LSP, storage, and final UI contracts remain adjacent-owner dependencies; this review does not infer defects in those absent owner texts.

### A. Shared working-copy identity and transaction authority

Represent an opened local file as one authoritative in-memory buffer keyed by the resolved file identity/path contract selected by the FileManager owner. Split panes and previews hold views/handles to that buffer; they do not fork dirty state, saved baseline, save authority, recovery state, or ordinary undo history. Every edit/replay/revert/agent/LSP/preview mutation continues through the typed transaction sources already enumerated in `definitions_and_transactions.md`. A tab is a view handle, with one tab per path per group; a shared edit is visible in every view. Keep per-buffer undo local, keep multi-file actions out of ordinary editor undo, and preserve backend-owned restore/history flows.

This is a retain disposition for F-008 and the copied definitions. VS Code's working-copy model is useful analogy for centralizing dirty/save/backup lifecycle around a resource rather than a pane; it is not an API or implementation requirement and its design notes are not pinned to a commit. No evidence found here justifies changing the existing transaction taxonomy or choosing a new buffer crate.

### B. Explicit save and orthogonal facts

Keep F-018's facts distinct: dirty (buffer differs from last successful save baseline), changed-on-disk/stale-disk (disk identity or content no longer agrees with the comparison baseline), read-only/degraded/write-lock, transient operation error, and recovery attention. Explicit Save remains the only ordinary write trigger in MVP. Advance the saved baseline and clear dirty only after the chosen write operation reports success; any failure retains the buffer and dirty state and presents its reason plus Retry/Save As. Do not equate an atomic replacement with durable storage, and do not use a permissions bit as proof that a write will succeed.

**Implementation choice left open:** direct target write is simple and can preserve the target file object, but a failed/truncated write can expose partial contents. A same-directory temporary write then replace can avoid publishing a partial new byte sequence at the target, but behavior varies by OS/filesystem and can affect metadata, permissions, symlinks, hard links, open handles, watchers, and durability. `tempfile`'s `persist` API documents atomic replacement but not file or containing-directory synchronization. A pre-save comparison also has a check/use race. Retain F-018's user contract; ask the storage/FileSafe owners to decide guarantees, then document platform conditions. Do not promote either mechanism to product canon from this evidence.

### C. External changes, dirty conflict and clean transition

Retain F-026's one-buffer-per-path and one combined prompt for dirty + changed-on-disk cases, with Reload / Overwrite / Cancel and Show diff where already specified. Keep checks at Save and pane/tab focus, not on every keystroke. Treat watcher events as prompts to reconcile, not as proof of current disk state: the same-arm `notify` 8.2.0 evidence documents event loss for some NFS and large-watch-set conditions, and replacement saves can change the file object watched. Candidate comparison methods include metadata tuples (cheap but timestamp/identity limits), content fingerprints (stronger but require reads/collision policy), or event-triggered reconciliation plus explicit Save/focus checks. Select against local/remote and filesystem needs; do not claim any universally reliable detector.

**Supported optional addition to F-026 acceptance:** if an outside write is observed while dirty and the user later undoes to clean without changing pane/tab focus, reconcile before presenting the buffer as current. If disk still differs, set the existing stale/changed-on-disk fact and use a deliberate reload/compare action; never silently discard text while still dirty. This is a proposed coverage edge, not a necessary correction to the documented Save/focus prompt. Zed issue #48697 records exactly this stale-after-undo sequence. Its fix, merged as `50aef1f` in PR #51037, checks `DiskState::Present` and mtime on dirty-to-clean, emits `ReloadNeeded`, and adds `test_dirty_buffer_reloads_after_undo`; the PR reports 28 checks. Zed 0.229.0 release notes include #51037. This makes a concrete issue -> fix -> regression -> release history, but the mtime mechanism and automatic reload are not adopted here. Metadata may be coarse or unavailable, and Zed's conflict/product policy is not ours.

### D. Unsaved recovery and remote-backed buffers

Retain F-020 and `editing_and_save_context.md`: recovery is required for local and remote-backed buffers; a remote recovered buffer is local unsaved memory only; preserve exact banner `Recovered local edits — remote destination not yet synchronized`; reconnect/revalidate destination before Save/flush can claim remote success. Recovery replay remains a typed transaction and cannot silently masquerade as ordinary undo. A restored buffer must become the same shared authority for all panes. Recovery snapshot format, retention, corruption handling, redb/storage ownership, and transport semantics are unresolved dependencies; do not claim the copied slice defines them.

### E. Topic-A disposition of every supplied decision

| Decision | Disposition and proposed change | Alternatives / validation |
|---|---|---|
| F-008 typed transaction sources; one buffer/dirty flag/saved version/save path per path; per-buffer undo | Retain unchanged. Resource/view distinction already covers split-pane authority. | Alternative per-pane buffers rejected because they create competing save/dirty/recovery state. Validate two panes, preview, LSP/agent single-file edits, per-file undo, and multi-file receipt boundaries. |
| F-018 orthogonal state facts; explicit Save; failure stays dirty; retry, Save As, reason | Retain user contract; optional implementation note for chosen write atomicity/durability and baseline advancement only on success. | Direct write vs same-directory stage/replace remain options. Inject create/write/flush/replace/metadata failure and verify buffer/disk outcome against the selected guarantee. |
| F-020 local + remote unsaved recovery; exact remote banner; reconnect/revalidate | Retain unchanged; clarify recovery reattaches to the one shared buffer identity. | Persistence/retention and remote save receipt are owner decisions. Validate recovered local text stays dirty and cannot claim remote success before revalidation. |
| F-026 one buffer/path; dirty vs saved content; focus/Save checks; one combined prompt, no keystroke checks | Retain core policy. Add optional dirty-to-clean reconciliation when stale state was recorded and no existing focus/save check ran. | Automatic reload vs stale badge/explicit diff prompt is a product choice; recommend preserve edits and surface stale state. Validate dirty external write then undo, save, focus, event loss, atomic replacement, deletion/recreation, and changed again between compare and write. |
| `definitions_and_transactions` | Retain source classes, preview/FileSafe/LSP boundaries, single-file vs multi-file undo, restore history and remote authority distinction. | Buffer implementation cannot define mutation authorization or backend restore semantics; owner review needed. |
| `editing_and_save_context` | Retain save failures, stable dirty indicator, Revert/restore separation, `Show diff`, remote offline/reconnect copy, and cached-file-only wording. | No new UI copy proposed except the optional stale-on-undo path; validate state visibility when tab strip is crowded. |

### F. Explicit cross-topic seams and non-changes

F-027 owns UTF-8/editable-vs-binary/decode/read-only modes and mixed-ending preservation. F-082 depends on F-008/F-027 and owns nearest-existing newline insertion plus byte-preservation of surviving CRLF/LF/CR boundaries. A rope's CRLF-safe chunk seam is not proof of that policy. Topic A must save the same buffer bytes without normalization and must not alter F-082's insertion rule. F-028 owns the 10,000-line default, 5 MB hard cap, truncated read-only preview and Load full affordance; no save/recovery proposal here overrides those limits. Ropey 1.6.1 (immutable crate source commit `d41ee247f2f097c7f9c8e4730b7dd884734f1ee5`) is a possible UTF-8 in-memory rope with chunked `write_to`; the source reports writer errors can occur after partial output and its data structure does not supply save transactions, filesystem monitoring, recovery, F-082's nearest-boundary policy, or Slint rendering. It is not selected.

FileSafe owns agent mutation and write safeguards; LSPSupport owns LSP edits; storage-plan owns durable state and recovery persistence; FinalGUISpec owns detailed UI presentation; remote FileManager contracts own reconnect/write semantics. These are named dependencies in the copied references, not defects inferred from missing copies. Rust std rename, tempfile persistence, watcher choice, Slint adapter behavior, and actual target OS/filesystem remain implementation-specific unknowns.

## Opportunities, negative findings and rejected leads

- Supported opportunity: acceptance coverage for dirty -> external update suppressed -> undo to clean; event loss/replacement followed by the already-required Save/focus reconciliation.
- Supported optional opportunity: explicitly choose save replacement, metadata preservation and durability guarantees after platform review.
- Negative finding: a watcher callback is not a complete disk-consistency oracle; a changed-on-disk check is not an atomic compare-and-swap.
- Negative finding: Ropey storage/read/write helpers do not define shared save authority, remote recovery, durable save, or the Slint view cost.
- Rejected lead: using a rope to erase the existing 10k/5MB choices or introduce virtualized editing; this contradicts F-028 and is not supported by the inspected evidence.
- Rejected lead: use mtime alone as universal conflict identity or automatically reload a dirty buffer; the Zed fix is conditional and its policy is not transferable as a product default.
- Uncertain: path identity across symlinks/hardlinks, timestamp granularity, external writers racing the save, target filesystem semantics, remote snapshots, and the concrete storage/UI adapters need owner and platform decisions. Discovery is useful but not exhaustive.

## Proposed validation (none executed for Puppet Master)

1. Two panes of one path: shared mutation, one dirty flag/save authority, per-buffer undo, and one save result.
2. External-change matrix: clean in-place write, atomic replacement, delete/recreate; update while dirty followed by undo-to-clean, Save, and focus; event missed; file changes again between compare and write. Verify no stale buffer is presented as current and exactly one combined dirty+changed prompt is offered where the existing contract applies.
3. Save failure injection at staging/create/write/flush/replace/metadata/sync or direct-write stages; verify dirty and saved-baseline behavior and disk-visible state for the selected guarantee.
4. Recovery on quit/crash and remote recovery: snapshot restores one shared local buffer, dirty status remains, exact banner appears, no remote success claim until reconnect/revalidation.
5. Byte fixtures shared with F-082: no-op save preserves existing mixed endings; topic-A save path does not normalize; cross-boundary insertion fixtures remain owned/validated with F-082.

These are proposals. The reported Zed test/PR check results are upstream-reported; no Puppet Master test, build, storage experiment or UI validation was run. This stage provides no SourcePASS or speed claim.


# Exact candidate-authored research-topic-b

# I-METHOD-05 / treatment / research-topic-b-v1

## Topic B proposed change artifact — text representation, read-only and size behavior

**Assignment:** Fresh topic comparison for B, owner refs F-027, F-028, F-082 and `text_and_size_context`. This is a research proposal against the exact frozen copy, not product canon, an implementation selection, or an application validation. The product boundary remains Rust + Slint. No repository or Plans files were edited.

## Proposed topic text for owner review

### Text identity, encoding, and edit boundaries

Keep the existing requirement that an editable buffer represents valid UTF-8 text and that an invalid-UTF-8 or binary input opens in a visible read-only mode with its reason. Do not silently replace invalid bytes, guess a new encoding, or enable editing after a lossy decode. Keep the selected bytes/text available for an explicit revert/reopen after an external repair. The detection rule that distinguishes binary from malformed text, BOM treatment, and any future encoding support remain product decisions; this research does not select them.

Represent existing line separators as part of the source text. A no-op explicit Save must preserve each existing CRLF, LF, and CR boundary byte-for-byte. Editing must preserve all surviving separators outside the edited range. New newline boundaries follow F-082's nearest-existing-ending policy. Optional paste normalization remains confined to the inserted paste transaction; it does not normalize surrounding text or change ordinary Save. Do not infer this policy from a buffer's dominant line-ending label or from line iteration alone.

Specify one canonical index unit at the editor-buffer boundary and explicit conversions at Slint, clipboard, IME, LSP and other adapter boundaries. If Ropey is selected, its native editing indices are Unicode scalar (`char`) indices; byte and UTF-16 conversions exist, but those conversions do not prove that every adapter uses the right unit. A flat `String` or another buffer may make different indexing tradeoffs. Keep this as a technical selection and acceptance-test obligation, not a new user-visible product choice.

Preserve per-buffer undo/redo, selection and clipboard behavior, optional word wrap, monospace typography, explicit Save only, no auto-save in MVP, and no hex view in MVP. Read-only state remains orthogonal to dirty, degraded, changed-on-disk, write-lock and recovery facts. A permission bit is not a promise that a later write will succeed; the save result remains authoritative, and an unsuccessful Save keeps the buffer dirty under F-018.

### Large-file behavior

Retain the accepted MVP modes and values: above the configurable 10,000-line default, show a truncated read-only preview and an explicit “Load full file” action; permit an editable full buffer only below the hard cap; above the 5 MB hard cap, block editable loading and offer the accepted truncated read-only view and/or system-editor path. Persist the configurable line threshold and hard cap in the existing settings owner. Do not replace these product modes with full-file or virtualized editing merely because a candidate structure can represent more text.

Clarify three boundary details before implementation: whether “MB” means decimal MB or MiB; whether the 5 MB cap takes precedence when a file crosses both the line threshold and size cap; and whether the preview has an independent byte bound as well as a line bound. A line-only preview can still encounter a single extremely long line, so a bounded byte window is a supported safety opportunity. These clarifications must preserve the current user-facing modes and numbers; they do not justify raising either threshold. Keep startup IO, full-load memory, render/input latency and snapshot/undo memory as separate measurements.

Do not implement read-only virtualized editing in MVP unless an owner later demonstrates the need. Keep “File too large to edit,” “View read-only (truncated)” and “Open in system editor” as distinguishable outcomes. If Load full is not available because the hard cap would be exceeded, do not present it as an enabled route.

### Mixed line endings and F-082

Retain F-082 as a required policy, not a library default: inserted newline boundaries inherit the nearest existing boundary; surviving CRLF/LF/CR boundaries remain exact; optional paste normalization affects only the inserted transaction. Define deterministic behavior for ties, insertion at either file edge, a document with no existing line ending, and replacement that removes the nearest candidate boundary. The frozen copy does not select those tie/no-neighbor cases, so the implementation must not silently choose a dominant file mode and call it “nearest.”

Keep raw-byte acceptance fixtures for no-op Save, insertion and replacement around each of CRLF/LF/CR, boundaries at rope/chunk seams, pasted CRLF/LF/CR with normalization on and off, and save/reopen equality. Test displayed line counts separately from byte preservation. A candidate's safe chunk splitting is useful but is not evidence that it implements nearest-boundary inheritance.

## Complete comparison and dispositions

| Frozen item | Existing decision | Topic B disposition and proposed delta |
|---|---|---|
| F-027 — text behavior, encoding and read-only reason | UTF-8 editable text; invalid UTF-8 and binary are read-only with a reason; preserve CRLF/LF/CR; explicit Save; per-buffer undo/redo and clipboard; optional wrap; no auto-save; no hex view. | **Retain.** Add owner-review clarifications for binary/decode classification, BOM behavior and the canonical index unit/adapters. Keep current explicit-save and read-only modes. Add byte-level line-ending and malformed-input fixtures. These are refinements, not a claim that the frozen choices are defective. |
| F-028 — large-file limits | Truncated read-only preview plus Load full above the 10,000-line default; 5 MB hard cap; read-only/system-editor alternatives above cap; configurable and persisted settings; virtualized editing deferred unless needed. | **Retain product choice and values.** Clarify MB/MiB, precedence when both thresholds trip, and preview byte bound. Propose separate boundary measurements. Reject changing the limit because a rope advertises large-text performance. |
| F-082 — nearest existing newline | Newline insertion uses nearest existing line ending; ordinary Save preserves all surviving CRLF/LF/CR boundaries; optional paste normalization only affects inserted paste. | **Retain unchanged as a product requirement.** Specify deterministic tie/no-existing-boundary cases before implementation. Keep per-boundary byte fixtures. Ropey's CRLF seam behavior is supporting storage machinery only; it does not implement this policy. |
| F-008 — shared buffer and save authority | One shared buffer, dirty flag, last-saved version and save/retry authority per path; typed transaction sources; scoped per-buffer undo. | **Retain / dependency.** Any Rope clone or snapshot used for asynchronous output must remain under this path's single save authority and must not create another dirty branch or ordinary undo scope. Buffer data structures do not own source authorization. |
| F-018 — save-state facts | Dirty/read-only/degraded/change/stale/write-lock/error/recovery facts are orthogonal; explicit Save; failure keeps dirty with retry/save-as/reason. | **Retain / dependency.** `write_to` or any writer may report failure after emitting bytes; a candidate buffer API is not a disk transaction guarantee. The file-save owner must define visibility/durability and failure handling. Do not claim atomicity or durability from an in-memory rope. |
| F-020 — recovery | Required local and remote-backed unsaved recovery; remote recovery is local memory only; exact banner and destination revalidation before remote-success claims. | **Retain / dependency.** A cloneable text snapshot may help a recovery or async-save path, but is not a recovery format, persistence policy, encryption/retention contract, or remote write receipt. Keep those adjacent storage/remote-owner decisions external. |
| F-026 — external change prompts | Check on Save and focus, not each keystroke; one combined dirty + changed-on-disk prompt. | **Retain / cross-topic validation seam.** Add a test where an external update arrives while dirty and the user then undoes to clean; ensure the current disk state is reconciled or surfaced without silently retaining stale clean text. Zed's issue/fix history supports this as a test edge, not a new conflict policy or detection algorithm. |
| Copied definitions and transactions | Buffer is source-canonical across panes; typed user/preview/agent/FileSafe/LSP/recovery transactions; per-file undo; remote authority and capabilities are distinct. | **Retain / dependencies.** The adapter's offset conversions and requested/effective read-only modes must fit the shared-buffer authority. FileSafe, LSPSupport, storage-plan and FinalGUISpec remain adjacent owners; their absent text here is not a defect. |
| Copied editing/save context | Explicit save, failure stays dirty, recovery and remote/offline states, external-change checks, restore/revert separation. | **Retain / dependency.** Keep text mode changes from changing save, recovery, dirty-state or remote-success semantics. Any changes to save replacement, persistence or remote transport must be decided by their owners. |

## Public technical evidence and applicability

### Pinned text-buffer candidate: Ropey 1.6.1

The inspected package source identifies upstream commit `d41ee247f2f097c7f9c8e4730b7dd884734f1ee5`. Relevant immutable source paths are `src/rope.rs`, `src/crlf.rs`, `src/rope_builder.rs`, and `src/tree/{node,node_children,node_text,text_info}.rs`.

- `src/rope.rs` defines `Rope` over a shared `Arc<Node>`, with edits and queries generally documented as worst-case O(log N); `Clone` shares the root until edits diverge. `from_reader` streams valid UTF-8 through `RopeBuilder` and returns `InvalidData` on malformed UTF-8. Edit/slice indices use Unicode scalar values, with byte and UTF-16 conversion methods. `write_to` walks chunks and explicitly allows that some data may already have been written when the writer errors.
- `src/rope_builder.rs` is the governing builder/caller for streamed construction and uses the CRLF helper when splitting incoming text into chunks.
- `src/crlf.rs` defines valid split/seam checks so chunks do not split a UTF-8 code point or CRLF pair; its unit tests exercise seams and split selection. The tree's `TextInfo` records byte/char/line-break metrics and supports line indexing.
- Default Unicode line recognition is configurable by Cargo features. Feature choice affects which characters count as line breaks, so it is a build decision that should be pinned and tested if Ropey is adopted.

**Fit:** plausible Rust UTF-8 in-memory editor buffer for bounded editable files, line lookup and snapshots. **Limits:** it is not a binary/invalid-UTF-8 viewer, storage/watch/save transaction, virtualized Slint renderer or implementation of F-082. Its own project guidance says it is in-memory and unsuitable when text exceeds available memory. Its performance claims do not establish application responsiveness or suitability for Puppet Master's 5 MB/10,000-line modes. Adoption remains undecided.

### Release and defect-history evidence

Ropey's upstream changelog records a 1.5.1 bug fix: `len_lines()` could return incorrect counts on `RopeSlice`s that split CRLF pairs. The pinned 1.6.1 `crlf.rs` has focused seam/split tests and `rope.rs` checks the no-CRLF-split chunk invariant. This is useful implementation-evolution evidence for why slices and CRLF seams deserve explicit fixtures. In this bounded research, no exact issue ID or trace from that reported slice-count bug to its specific regression test was established; do not claim that lineage is complete.

For the adjacent external-change seam, Zed issue #48697 describes an external update received while a buffer is dirty, then an undo-to-clean transition leaving stale content. Zed PR #51037 fixes this in `crates/language/src/buffer.rs` `did_edit()` by checking the mtime on dirty-to-clean for present files and emitting `ReloadNeeded`; the PR identifies `test_dirty_buffer_reloads_after_undo`, merged commit `50aef1f`, 28 passing checks and a release note. This is upstream-reported evidence, not a local test. It supports adding that F-026 seam to proposed validation; it does not prove mtime is universally reliable or prescribe Puppet Master's conflict behavior.

### Alternatives and rejected leads

- A flat `String` is simpler and uses byte offsets, but should be compared for whole-buffer edits/copies and snapshot cost at the actual cap. No benchmark was run here.
- `crop` is an alternative text rope with byte-oriented offsets and LF/CRLF line tracking according to its upstream README. This stage did not inspect a pinned implementation, so it is a lead only, not a candidate recommendation.
- Gap buffers, piece tables and memory-mapped/file-backed designs trade cursor locality, distant edits, snapshots and IO complexity differently; no pinned implementations were examined in this stage.
- **Rejected:** adopting a full-file or virtualized editor solely because Ropey can represent very large in-memory texts. This conflicts with the accepted MVP cap and ignores rendering, memory headroom and user-mode decisions.
- **Rejected:** treating Ropey's CRLF-safe chunk seams as proof of no-op save fidelity or F-082 nearest-boundary insertion. These are different properties.
- **Negative finding:** a rope's large-buffer capability is not a bound on Slint's rendering/input latency; the supplied Slint version and editor adapter are not specified here.

## Cross-topic dependencies and open decisions

1. **F-008/F-026/F-018:** define one shared buffer/save authority, stale-disk reconciliation, conflict prompt and dirty-on-failure state. The topic B text model must not make independent dirty state or write around that authority. Dirty-to-clean after a suppressed external update is an added validation edge.
2. **F-020 and storage-plan:** own recovery persistence, lifecycle and local-versus-remote claims. Rope cloning is not durable recovery, and the B stage does not specify backup storage or remote writes.
3. **FileSafe and LSPSupport:** own mutation source authorization and protocol/edit integration. If chosen index units differ from their APIs, adapters and round-trip offsets require owner review.
4. **FinalGUISpec / Slint:** owns visible read-only reasons, truncated preview, load-full and system-editor affordances. Exact Slint version, control choice and render/input performance remain unknown; the Slint 1.10 long-text report in the shared inventory is a lead, not applicable evidence.
5. **F-082 unresolved semantics:** tie-breaking, file-edge insertion, no-existing-ending documents, and replacement that removes nearby separators need a product decision or explicit owner contract before implementation.
6. **F-028 unresolved semantics:** decimal MB versus MiB; precedence when line and byte limits trip together; preview byte budget and behavior for an extremely long first line.

The Rust + Slint direction, explicit-save behavior, no-auto-save constraint, existing user modes, owner assignments and lack of canon authority are preserved. No Iced app, WorkNodes, runtime, or plan-gate claims are introduced.

## Proposed validation (not executed)

1. **Raw-text fixtures:** round-trip mixed CRLF/LF/CR without edits; insert, replace and delete around each separator; include lone CR, Unicode non-ASCII and non-BMP characters, final newline/no final newline, empty document, and separators at internal chunk seams. Compare bytes after save/reopen.
2. **F-082 policy table:** normalize paste off/on with CRLF/LF/CR inputs; confirm only inserted text can change; test nearest-boundary tie, beginning/end, no-existing-separator, and replacement deleting an adjacent separator once those semantics are selected.
3. **Encoding/read-only:** valid UTF-8, invalid sequence, binary-like bytes, BOM, externally repaired file plus revert; verify read-only reason and that no lossy edit/save path occurs. Keep classification thresholds as an explicit test matrix after their owner chooses them.
4. **Index adapters:** non-BMP and combining text through insert, selection, caret, clipboard, IME and protocol ranges; assert byte/char/UTF-16 round trips at every adapter boundary.
5. **Large-file boundaries:** 9,999/10,000/10,001 lines and immediately below/at/above the selected byte cap; single very long line; separately measure bounded preview IO, Load full memory, edit/undo snapshot growth, and Slint render/input latency. Verify over-cap mode never becomes editable and never presents enabled Load full.
6. **Shared buffer/save seams:** two panes, one path and one dirty flag; failed save retains dirty state; recovery restores local unsaved text without claiming a remote write; external update while dirty then undo-to-clean is reconciled or made visible at the F-026 check points.

These are proposed checks only. No local scientific test, benchmark, build, or application validation was run. Public PR test results above are attributed to upstream history.

## Handoff state

This artifact completes the fresh topic B comparison stage. The separate flash-family critic and final reviser are downstream assignments; their work is not represented here. The discovery-stage inventory is useful shared same-arm evidence, not an exhaustive architecture/opportunity catalog. See the accompanying `source-map.json` for exact input hashes, source pins/URLs, capture timing, stage accounting fields and unknown usage/billing values.


