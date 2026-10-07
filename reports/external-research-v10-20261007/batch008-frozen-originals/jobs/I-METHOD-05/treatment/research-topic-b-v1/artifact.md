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
