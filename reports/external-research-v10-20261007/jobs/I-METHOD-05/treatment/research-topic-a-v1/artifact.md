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
