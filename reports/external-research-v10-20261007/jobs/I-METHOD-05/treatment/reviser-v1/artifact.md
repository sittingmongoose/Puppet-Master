# I-METHOD-05 / treatment / reviser-v1 — complete revised proposal

**Artifact type:** Full-scope candidate revision for owner review. This proposal derives only from the declared same-arm discovery inventory, both topic comparisons, the complete critic and captured evidence. It is not a canon edit, implementation patch, build result or application validation.

## 1. Scope and decision summary

The product question is a local UTF-8 file opened in two panes, normal editing and explicit save, crash/quit recovery, outside-file changes, mixed CRLF/LF/CR, and large/read-only files. The frozen product direction remains Rust + Slint. This proposal covers F-008, F-018, F-020, F-026, F-027, F-028 and F-082, plus the supplied definitions/transaction, editing/save and text/size contexts.

The evidence supports retaining the existing product choices and adding bounded acceptance coverage and owner clarifications. It does not support replacing the shared-buffer/save model, changing save behavior, selecting an external-change detector, selecting a text-buffer crate, raising either large-file limit, adding virtualized editing or importing a new remote-storage contract. Options remain options unless identified below as retained product requirements.

**Proposed disposition:** retain all seven frozen unit decisions and copied contexts; add the dirty-external-update-to-undo-to-clean case to proposed F-026 validation; require byte-level F-082 and index-adapter tests; resolve listed threshold and newline edge semantics before implementation; leave filesystem, storage, UI and remote-owner choices to their named owners.

## 2. Proposed owner-facing text

### 2.1 One buffer and typed mutation authority — F-008 and copied definitions

Keep one authoritative in-memory buffer, dirty state, last-successful-save baseline, recovery state and save authority for each file path under the FileManager owner's existing path-identity contract. Each group keeps at most one tab per path. Tabs, split panes and preview handles are views of that shared buffer; they do not create independent content or save state. Editing from any view must not create a second dirty branch. Any preview that can mutate content enters the same typed transaction path.

Preserve the transaction-source distinctions in the supplied definitions: user edit, preview action, agent/FileSafe mutation, LSP edit, recovery replay and other named sources remain typed and attributable. Do not route around authorization or source-specific safeguards because a buffer library supports cloning or snapshots. Ordinary undo and redo remain per-buffer. Multi-file operations remain per-file transactions or receipts and do not become global editor undo. Backend restore/history and source-control actions remain distinct from editor undo and Revert.

The exact identity for path aliases, symlinks and hard links is not selected here. Keep the current “per file path” wording until the FileManager owner resolves whether and when paths are canonicalized. Do not silently change it to inode identity or a new alias rule. FileSafe, LSPSupport, storage, FinalGUISpec and remote FileManager contracts remain adjacent-owner dependencies; their absence from this bounded evidence is not a defect finding.

### 2.2 Explicit Save and orthogonal state — F-018 and editing/save context

Keep dirty, read-only, degraded, change-marker, write-lock, stale/changed-on-disk, transient operation error and recovery-attention facts separate. An error or read-only reason does not erase dirty state. Explicit Save remains the only ordinary write trigger in MVP; do not add auto-save through a buffer implementation choice.

Advance the last-saved baseline and clear dirty only after the selected save operation reports success. On failure, preserve the editable buffer and prior successful baseline, retain dirty state, show the failure reason, and offer the specified retry or Save As path. A retry operates under the same buffer/save authority. A permissions attribute may inform the visible read-only reason, but the operation result remains authoritative: platform permissions and races mean metadata alone cannot promise that a write will succeed or fail.

The write protocol remains an implementation choice for storage/FileSafe owners:

- A direct write avoids a replacement step and can preserve the target file object, but truncation or a later write error can leave a partial target.
- A same-directory temporary write followed by replacement can avoid exposing an incomplete new byte stream as the target, but replacement semantics vary by platform/filesystem and may affect metadata, permissions, symlinks, hard links, open handles, watcher attachment and cleanup.
- A staged replacement is not automatically durable. The supplied tempfile documentation says persist can replace atomically but does not synchronize file contents or the containing directory on return. Rust rename behavior is platform-specific and does not cross filesystems.
- Comparing the target and then writing has a check/use race. The comparison and save choices do not constitute compare-and-swap.

Do not label a save “atomic” without naming the guarantee and platform scope, and do not equate atomic visibility with durability. Do not promote either write strategy to product canon from these sources. Before choosing, responsible owners must state expected behavior for partial failure, metadata/link preservation, synchronization, recovery/cleanup and supported target platforms.

Keep the stable unsaved indicator, Revert versus restore-history distinction, cached-files-only offline wording, remote reconnect states and changed-on-disk Show diff path from the copied editing/save context. A local text-storage choice must not change these user-facing contracts.

### 2.3 Outside-file changes and conflict handling — F-026

Retain one buffer per path and the existing check points: check on explicit Save and editor/tab focus, not on every keystroke. Retain one combined decision when dirty local text and changed-on-disk state both apply, with Reload, Overwrite and Cancel, plus the already-specified Show diff path. Reconcile a watcher notification against current state; a notification is a hint, not proof that disk content is current. NFS may emit no events and large watch sets may lose events. Replacement saves can also change the file object a path watcher observes.

Keep detection as an owner-selected implementation option. Metadata tuples can be inexpensive but depend on identity and timestamp behavior; content fingerprints require reading and a collision/IO policy; event-driven notification reduces routine polling but still needs reconciliation at the specified Save/focus points. Polling/content comparison is another documented option. No supplied evidence establishes a universally reliable method for local, network and remote filesystems. Do not select mtime-only comparison, a watcher library or polling policy here.

Add the following **proposed acceptance edge** to the existing state machine: an outside update arrives while the shared buffer is dirty and reload is suppressed; the user then undoes to clean without another Save/focus check. Before presenting the buffer as current, reconcile or surface the stale/changed-on-disk fact. Do not silently discard dirty text. If disk still differs, use a deliberate reload/compare path consistent with the existing prompt. This is proposed coverage, not a finding that the frozen prompt is defective, and it does not require automatic reload.

The independent history supports this test edge: Zed issue #48697 records dirty external update followed by undo-to-clean with stale text; PR #51037 added a dirty-to-clean mtime check and the named regression test_dirty_buffer_reloads_after_undo; the PR reports 28 checks, and the same behavior appears in immutable v0.229.0 source. Attribute the count to upstream. Zed's conditional present-file/mtime behavior is not a Puppet Master default, nor evidence that mtime is reliable on all filesystems.

### 2.4 Recovery and remote-backed buffers — F-020

Retain the requirement for unsaved recovery for local and remote-backed buffers. Recovery restores into the same shared buffer authority used by every pane. Recovered local edits remain unsaved and dirty. For a recovered buffer aimed at a remote destination, preserve the exact banner:

**Recovered local edits — remote destination not yet synchronized**

Treat restored remote text as local memory only. Reconnect and revalidate the destination before Save or flush may claim remote success. Recovery replay remains a typed mutation; it does not silently become ordinary undo, a remote write receipt or a successful save.

This slice does not settle recovery storage format, encryption, retention, corruption handling, cleanup, durability or transport semantics. Those remain storage/remote-owner decisions. A cloneable text structure is not a recovery format or persistence guarantee.

### 2.5 Editable text, read-only reasons and newline preservation — F-027 and F-082

Keep valid UTF-8 as the editable text path. Binary or invalid/decode inputs remain visibly read-only with a reason; do not silently replace malformed bytes, choose an encoding or allow a lossy edit/save path. Exact binary-versus-malformed classification, BOM handling and any future encoding support remain owner decisions. Keep explicit Save, per-buffer undo/redo, selection/clipboard, optional wrap and monospace presentation; keep no auto-save and no hex view in MVP.

Preserve F-082 as a required byte-level policy:

1. Existing CRLF, LF and CR separators that survive an edit remain byte-identical.
2. A newly inserted newline boundary inherits the nearest existing boundary under the still-to-be-defined deterministic semantics.
3. Optional paste normalization affects only the inserted paste transaction. Ordinary Save does not normalize surrounding text or convert the file to one dominant line-ending mode.
4. A no-op Save preserves all existing mixed separators byte-for-byte.

Define deterministic behavior before implementation for an equal-distance tie, insertion at either file edge, a document with no existing separator, and replacement that removes the nearest candidate separator. The frozen wording does not decide these cases. Do not invent a dominant-ending fallback and call it “nearest.”

Specify one canonical index unit at the editor-buffer boundary and explicit round-trip conversions at Slint, clipboard, IME, LSP and other adapter boundaries. Ropey uses Unicode scalar indices and exposes byte and UTF-16 conversions; that fact makes adapter tests necessary rather than selecting Ropey or defining the product index unit.

### 2.6 Large-file modes — F-028

Retain the accepted MVP values and modes:

- Keep the configurable 10,000-line default.
- Above that default, show a truncated read-only preview and the explicit “Load full file” action when loading is allowed.
- Keep 5 MB as the hard cap for an editable full buffer.
- Above the hard cap, do not make the full file editable; retain the specified truncated read-only and/or system-editor route.
- Preserve the existing settings ownership and persisted threshold behavior.
- Do not add virtualized editing or change either threshold because a data structure can represent larger text.

Before implementation, clarify whether 5 MB means decimal MB or MiB, which mode wins if line and byte limits are crossed together, and whether the read-only preview has its own byte budget. A line-only preview can encounter an extremely long first line, so a separate byte bound is a supported safety clarification. Keep “File too large to edit,” “View read-only (truncated)” and “Open in system editor” distinguishable. Do not present Load full as enabled when the hard cap blocks it.

Measure preview IO, full-load memory, undo/snapshot growth and actual Slint input/render latency separately if a later implementation study is authorized. No supplied performance result justifies changing the product mode.

## 3. Mechanism options and evidence limits

Ropey 1.6.1 is a plausible Rust in-memory UTF-8 buffer candidate, not a selection. The supplied pinned source identifies commit d41ee247f2f097c7f9c8e4730b7dd884734f1ee5. Its Rope uses an Arc-backed shared tree; general edits and queries are documented as O(log N), and clone is O(1) until edits diverge. from_reader validates UTF-8 and streams construction; public edit indices are Unicode scalar indices with byte and UTF-16 conversions; chunked write_to can return an error after bytes have been emitted. Its CRLF helper prevents a UTF-8 scalar or CRLF pair from being split at a chunk seam. The pinned default feature set includes unicode_lines, which includes cr_lines, so lone CR is recognized under those defaults. If later selected, the app must pin the actual feature set.

Those mechanics do not provide a binary/invalid-byte viewer, bounded preview, durable recovery, watcher, save transaction, Slint virtualization/rendering solution, F-082 nearest-boundary insertion policy or application responsiveness guarantee. Ropey's project guidance warns that it is in-memory and limited by available memory. Its large-text capability does not override the 5 MB MVP cap.

Keep alternatives visible without ranking them: a flat String may simplify representation and uses byte offsets but can make whole-buffer edits/copies/snapshots costly; a gap buffer favors edits near one cursor but makes distant edits more expensive; crop is a byte-oriented B-tree rope lead whose README describes LF/CRLF tracking and sharing, but its implementation was not pinned and reviewed here; piece tables and memory-mapped/file-backed designs add different mutation, lifetime, caching and IO tradeoffs and were not inspected as pinned implementations. No benchmark or Slint adapter study was performed. Selection requires measurements at the accepted modes and owner review of index, snapshot, save and undo semantics.

The discovery inventory's VS Code Working Copies material remains a mutable resource-oriented analogy, not a product API. Slint issue #8147 reports a long-text focus problem on Slint 1.10/Windows; supplied app version/control/adapter applicability is unknown. Do not treat either as a requirement or defect.

## 4. Complete comparison and disposition ledger

| Scope | Existing decision carried forward | Proposal disposition and boundary |
|---|---|---|
| F-008 — transactions and save authority | Typed mutation sources; one buffer, dirty flag, last-saved version and save authority per path; per-buffer ordinary undo; multi-file work remains separate. | Retain unchanged. Views share the same authority. Keep path-alias identity with FileManager owner; do not introduce inode/canonical-path semantics. Buffer choice does not grant mutation authority. |
| F-018 — save state | Orthogonal dirty/read-only/degraded/change/write-lock/stale/error/recovery facts; explicit Save; failed save remains dirty with retry, Save As and reason. | Retain user contract. Direct write versus same-directory staged replacement, durability, metadata/link behavior and check/use race remain owner implementation choices. “Atomic” does not mean durable. |
| F-020 — unsaved recovery | Local and remote-backed recovery; remote recovery is local unsaved memory; exact banner and reconnect/revalidate before remote success. | Retain unchanged. Recovery persistence, retention, corruption and remote transport remain unresolved dependencies. Reattach to the one shared buffer. |
| F-026 — external change | Check Save/focus, not every keystroke; combined dirty + changed prompt with Reload/Overwrite/Cancel; Show diff. | Retain core. Add dirty external update then undo-to-clean as proposed acceptance coverage. Do not adopt Zed's mtime check, automatic reload or any watcher policy. |
| F-027 — text and read-only | UTF-8 editable text; binary/decode/read-only reason; mixed-ending preservation; explicit Save; per-buffer edit behavior; no auto-save or hex view. | Retain. Clarify malformed/binary classification, BOM behavior and index unit/adapters before implementation; do not create lossy conversion. |
| F-028 — size modes | 10,000-line default; truncated read-only preview; explicit Load full when allowed; 5 MB hard cap; read-only/system-editor routes; persisted settings. | Retain values and modes. Clarify decimal MB/MiB, threshold precedence and preview byte budget. Reject virtualized editing or threshold increases based only on a rope's capacity. |
| F-082 — mixed endings | Preserve surviving CRLF/LF/CR; inserted boundary inherits nearest existing boundary; paste normalization affects inserted paste only. | Retain unchanged as required policy. Define tie, edge, no-existing-boundary and removed-neighbor behavior; validate raw bytes. A CRLF-safe rope seam is not this rule. |
| Definitions and transactions | Buffer is file-content authority; tabs are view handles; mutations enter typed transactions; scoped undo, restore/source-control distinction and remote authority remain. | Retain. FileSafe, LSPSupport, storage, FinalGUISpec and remote contracts remain dependencies, not defects inferred from omitted owner documents. |
| Editing and save context | Explicit save/failure behavior, stable unsaved indicator, Revert versus restore, cached-files-only offline copy, remote reconnect states and Show diff. | Retain. Keep save, recovery and remote success semantics independent of text representation. |
| Text and size context | UTF-8/read-only reason, raw mixed endings, line/byte modes, preview and full-load affordance. | Retain. Supplied Slint version, decode classification and renderer costs remain unknown. |

### Cross-topic seams to preserve

- One shared buffer must remain the source for edits, save, recovery, panes, undo and external-change reconciliation.
- A text snapshot or Rope clone must not fork dirty/save/recovery authority.
- Failed output can leave visible partial bytes unless the chosen save layer documents a stronger guarantee; dirty remains set on failure.
- External-change reconciliation cannot silently overwrite or discard recovered/local dirty content.
- F-082 fidelity applies through load, edit, snapshot, save, reopen and UI/index adaptation; line counts do not prove byte fidelity.
- F-028 read-only/truncated modes cannot be bypassed by Ropey or another buffer's capacity.
- FileSafe/LSP mutation authorization, storage recovery guarantees, remote receipts and FinalGUISpec affordances stay with their named owners.

## 5. Critique response and comparison decisions

The independent critic found no supported basis to change the Rust + Slint direction, frozen owner decisions or user-facing modes. This proposal accepts that conclusion and carries each actionable criticism forward:

- **Malformed Ropey locator:** corrected to commit d41ee247f2f097c7f9c8e4730b7dd884734f1ee5 for crlf.rs; all Ropey implementation links below use this commit.
- **Redirecting Zed release locator:** use the immutable v0.229.0 source path and release tag rather than relying on a moving stable/preview route.
- **Ropey default feature nuance:** state that default unicode_lines includes cr_lines, recognizing lone CR; preserve feature pinning as a future selection condition.
- **Ropey 1.5.1 history:** keep the CRLF RopeSlice len_lines() changelog item as a limited history lead. The supplied evidence does not identify the exact issue ID or fix-specific test ancestry, so it is not presented as a complete issue-to-regression-to-release witness.
- **Zed witness:** retain issue #48697 -> PR #51037 / merge 50aef1f -> test_dirty_buffer_reloads_after_undo -> v0.229.0 source/release as a complete upstream witness. The 28 checks are PR-reported, not locally executed; mtime behavior is not adopted.
- **Comparison coverage:** retain already-covered decisions, reject unsupported adoption/threshold changes, preserve alternatives and mark uncertain applicability explicitly. The proposal does not call absent adjacent-owner contracts defects.
- **Full-scope obligation:** this is the complete candidate owner-review proposal, not a patch outline or critic summary. It contains retained product text, conditional additions, rationale, options, dependencies, validation proposals and open questions for all admitted F units and copied contexts.

## 6. Proposed validation plan — none executed

All checks below are proposals for a later implementation owner. None was run for Puppet Master.

1. **Shared authority and transactions:** open one path in two panes and a preview; edit through each permitted typed source; verify one content authority, dirty flag, saved baseline and save result. Verify per-buffer undo, multi-file receipt boundaries, agent/LSP authorization, recovery replay and restore/Revert separation.
2. **Save state and failures:** inject failures at direct-write or staging/create/write/flush/replace/metadata/sync steps, depending on the selected protocol. Verify dirty state and last-successful baseline remain correct; record target bytes and cleanup/recovery outcome against the documented platform guarantee. Test permissions changes and Save As separately. Do not infer durability from rename/persist success.
3. **External-change matrix:** clean in-place write, replacement/rename, delete/recreate, metadata-only change, missed notification/NFS-like event loss and update racing the save. Include dirty external update then undo-to-clean without intervening focus/Save. Verify stale state is reconciled or surfaced, dirty text is not silently discarded, and the combined prompt appears only under existing conditions.
4. **Recovery:** quit/crash with unsaved local and remote-backed buffers; restore to the same shared buffer, retain dirty state, show the exact remote banner, and prohibit remote-success claims until reconnect/revalidation. Test corrupted/missing recovery data only after storage owners define expected behavior.
5. **Raw mixed-ending bytes:** no-op Save and save/reopen on CRLF/LF/CR mixtures; insertion/replacement/deletion around every boundary; final and absent final newline; lone CR; empty text; Unicode; edits at rope/slice/chunk seams. Compare raw bytes, not rendered line counts.
6. **F-082 insertion policy:** table-driven tests for nearest-ending inheritance, ties, file edges, no existing separator and deletion of the nearest candidate after the owner defines these cases. Paste normalization on/off must alter only the inserted transaction.
7. **Encoding and index adapters:** valid UTF-8, invalid sequences, binary-like input and BOM cases after classification is selected; verify read-only reason and no lossy save. Exercise non-BMP and combining text through caret, selection, clipboard, IME, LSP and Slint conversions; assert index round trips.
8. **Large-file mode boundaries:** immediately below/at/above 10,000 lines and the selected decimal/MiB cap; a very long first line; both thresholds tripped. Verify truncated preview bounds, allowed Load full behavior, hard-cap block and system-editor/read-only routes. Measure preview IO, full-load memory, undo/snapshot growth and Slint input/render latency separately.

**Execution status:** no Puppet Master test, build, benchmark, UI run or application behavior was executed. The 28-check count belongs to the upstream Zed PR only. No SourcePASS, speed or completeness-of-discovery claim is made.

## 7. O1–O6 obligation audit

| Obligation | Final treatment |
|---|---|
| O1 — brief-led public discovery beyond a defect checklist | Preserves working-copy/recovery analogy, dirty-to-clean history, watcher limits, save alternatives, text-buffer options and Slint lead, while calling discovery bounded and non-exhaustive. |
| O2 — pinned code/mechanism | Uses Ropey 1.6.1 at the verified immutable commit; describes governing Rope, builder, CRLF helper, feature nuance and limits. It remains unelected and is not treated as save/UI policy. |
| O3 — issue through fix, regression and release | Carries Zed #48697 -> #51037 / 50aef1f -> named regression -> v0.229.0 immutable source/release identity; attributes upstream checks and limits transfer. |
| O4 — full frozen-slice comparison | Dispositions F-008/F-018/F-020/F-026/F-027/F-028/F-082 and all three copied contexts, including seams and adjacent-owner boundaries. |
| O5 — substantive independent critique | Accepts source-locator/default-feature corrections; records limited Ropey history, conditional mtime, existing F-026 coverage, threshold/newline unknowns, and retained/rejected/uncertain dispositions. |
| O6 — complete proposed-change deliverable | Provides coherent owner-facing retained/proposed text, rationale/evidence, all product choices/options, critic response, proposed validation and remaining uncertainty. No canon patch is claimed. |

## 8. Remaining questions and source locators

**Owner decisions still needed:** path alias identity; direct versus staged save guarantee and metadata/durability policy; external-change detector/platform coverage; recovery persistence and remote-write receipt semantics; invalid/binary/BOM classification; canonical editor index unit; F-028 decimal MB/MiB, threshold precedence and preview-byte bound; F-082 tie/edge/no-existing-separator/removed-neighbor rules; actual Slint version/control and adapter performance. These remain open because supplied sources do not settle them.

**Rejected or unsupported:** selecting Ropey/crop by description; using mtime as a universal conflict oracle; assuming watcher events are complete; claiming atomic replacement means durable save; relying on permissions metadata as sole write authority; treating rope seams as F-082; changing the 10,000-line or 5 MB modes; enabling virtualized editing from capacity claims; claiming application validation or a performance winner.

Direct source locators captured in the admitted same-arm records:

- Ropey 1.6.1 at pinned commit: [Rope](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/src/rope.rs), [builder](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/src/rope_builder.rs), [CRLF helpers](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/src/crlf.rs), [Cargo features](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/Cargo.toml), [changelog](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/CHANGELOG.md).
- Zed [issue #48697](https://github.com/zed-industries/zed/issues/48697), [PR #51037](https://github.com/zed-industries/zed/pull/51037), [regression diff](https://github.com/zed-industries/zed/pull/51037/files), [merged source](https://github.com/zed-industries/zed/blob/50aef1f115493aab506df9d5b33da5435dc36bfc/crates/language/src/buffer.rs), [v0.229.0 source](https://github.com/zed-industries/zed/blob/v0.229.0/crates/language/src/buffer.rs), [release tag](https://github.com/zed-industries/zed/releases/tag/v0.229.0).
- [notify 8.2.0](https://docs.rs/notify/8.2.0/notify/), [tempfile 3.27.0 TempPath](https://docs.rs/tempfile/3.27.0/tempfile/struct.TempPath.html), [Rust rename](https://doc.rust-lang.org/std/fs/fn.rename.html), [Slint issue #8147](https://github.com/slint-ui/slint/issues/8147), [VS Code Working Copies](https://github.com/microsoft/vscode/wiki/Working-Copies), and the [crop project README](https://github.com/nomad/crop).

Exact same-arm capture bytes copied under this stage's sources/input-captures/. The companion source map records predecessor/capture hashes, source operation windows, pin/version identities, validation status and unknown usage/billing. Originals were not changed.
