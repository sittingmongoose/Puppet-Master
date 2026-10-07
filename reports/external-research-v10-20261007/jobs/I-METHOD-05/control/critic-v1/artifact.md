# Independent critic report — I-METHOD-05/control/critic-v1

**Disposition:** Retain the central proposals in both drafts as options, carrying the corrections and open choices below into the final. Topic A's dirty-to-clean reconciliation is a narrow supported F-026 addition, not evidence of a Puppet Master defect. Topic B is right to consider Ropey only under the frozen size gates. Its Slint read-only claim needs version-pinned evidence that includes public paste and undo/redo paths. This is a critique, not a revised final plan.

## Scope and identity

I read the exact stage map; the full original brief, plan and all 13 source copies; both predecessor artifacts and maps; and all files in their two admitted source directories. Host SHA-256 values for all originals match the map. Both artifacts and both source maps match their recorded hashes; see source-map.json. The map declares A and B as predecessors and no separate candidate-inventory file. I did not inspect other stage maps/files.

The boundary is F-008, F-018, F-020, F-026, F-027, F-028, F-082 and three copied context files. FileSafe, LSP, storage, source control and GUI surfaces remain adjacent-owner dependencies, not inferred defects.

## Topic A: shared buffer, save and recovery

- **Retain shared authority and transaction routing.** Keep one buffer, dirty determination, saved baseline and save/retry authority per path; typed sources; pane/preview convergence; buffer-local undo; distinct restore, Git and internal recovery histories; no cross-file Ctrl+Z. These are frozen choices, not discoveries.
- **Retain dirty-to-clean revalidation as an optional F-026 clarification.** Zed issue #48697 documents the exact external-write-while-dirty, then undo-to-clean stale-buffer sequence. PR #51037 merged 2026-03-10; it describes the dirty-to-clean check, explains why it does not double reload, adds test_dirty_buffer_reloads_after_undo, and its pinned commit implements the guard in Buffer::did_edit. The same-commit integration test verifies local text/conflict survives the external write and undo then reloads external text and cleans the buffer. Strong analogous evidence; not proof PM has this bug.
- **Keep Zed's mtime as an example only.** Its guard checks Present and compares disk mtime with saved_mtime. That may miss same-timestamp writes and is not a sufficient local/remote/cached revision contract. A PM decision should choose a suitable revision/fingerprint with owners and protect the actual write boundary, where disk may change after preflight.
- **Keep release applicability cautious.** PR merge and test plan are established; the merge page reports 28 checks passed and carries release-note text. A search result surfaced #51037 at a /preview/0.192.5 URL, but direct open redirected to stable and did not confirm the version-specific note. Do not claim an exact shipped tag.
- **Retain save/recovery semantics and unchosen alternatives.** Preserve explicit Save; failures leave dirty and saved baseline unchanged; Retry/Save As/reason; local and remote recovery; exact banner “Recovered local edits — remote destination not yet synchronized”; reconnect/revalidate before remote success; no terminal or /run-debug implication. No storage schema or atomic write choice is established. In-place write and temp-file/rename remain alternatives, with no implementation history found.
- **Resolve A's timing contradiction.** The recommendation revalidates on dirty-to-clean and shows ordinary resolution before declaring synchronized; the open questions then ask whether the prompt is immediate or waits for focus/Save. Keep revalidation and the combined prompt; choose timing or mark it explicit. A clean-but-divergent buffer must not be called synchronized or overwrite silently.

## Topic B: representation, read-only and size

- **Retain Ropey 1.6.1 as an option.** Pinned Cargo/source supports UTF-8 validation, ordered chunk writes, O(1) length queries, caller-supplied inserted text, CRLF seam handling and line-recognition features. RopeBuilder consumes chunks incrementally but has its own working buffer; completed Rope is resident. Ropey does not choose nearest-ending insertion, atomic save, Slint responsiveness or a larger cap.
- **Keep history qualified.** Pinned changelog records a 1.5.1 RopeSlice.len_lines CRLF-split bug; 1.6.1 has randomized CRLF insertion/removal seam tests. This is useful release/test evolution, not an issue-to-PR chain or verified dedicated regression link. Preserve that limit.
- **Separate serialization from file safety.** Rope::write_to emits chunk bytes in order but can partially write before error. This supports a representation claim, not atomic Save. No-op identity and untouched-boundary preservation remain proposed PM acceptance criteria; FileSafe remains write-authority owner.
- **Strengthen and pin Slint read-only evidence.** Slint v1.12.0 TextEdit exposes text as in-out and binds read-only to TextInput. TextEditBase exposes public paste(). Pinned core checks read_only for keyboard insertion/Ctrl+V/Ctrl+X, but dispatches Undo/Redo without that guard; paste() reaches insertion without a read_only check. Programmatic text assignment is likewise not governed by the widget flag. Keep the draft's shared-buffer gate across typing, paste, undo/redo, preview, agent/FileSafe/LSP, restore and recovery. Add proposed adapter checks for programmatic assignment, public paste, and undo/redo after read-only is enabled. These are source observations, not runtime tests. Replace mutable latest docs as sole evidence with pinned wrapper/base/core sources.
- **Correct Slint issue #8877 wording.** It is one closed-as-duplicate report for Slint 1.12 / Rust / Windows 11 23H2 / wint+Skia. It reports selection/scroll lag with standard TextEdit and custom PlainTextEdit; exact size wording is “130,172 characters (specifically 130,172 × 3 in my case).” Preserve as a configuration-specific report, not a 130k benchmark or general widget limit. No fix/release was established. The draft's negative virtualized-TextEdit finding is appropriately bounded.
- **Keep size choices provisional.** Retain 10,000-line default, 5 MB hard cap, truncated read-only preview + explicit Load full, persisted settings/ranges, over-cap alternatives and no MVP virtualized editing. Incremental byte/line probing is a useful option, not measured performance. Clarify line definition, decimal MB/MiB and boundaries. Specify yielding/cancellation and recheck if file changes during scan or between preview and Load full. Measure actual Rust+Slint first paint, memory, selection, caret, scroll, paste, edit and save before choosing String or Ropey.

## Full frozen-decision comparison

| Input | Critic disposition |
|---|---|
| **F-008** | Retain typed sources, one authority/path, pane sharing, undo scope and no cross-file undo. Gate external resolution and programmatic widget operations through authority; FileSafe/LSP remain dependencies. |
| **F-018** | Retain orthogonal dirty/read-only/degraded/marker/lock/stale/change/failure/recovery facts, explicit Save and dirty retention on failure. Do not flatten size/encoding/conflict/recovery. |
| **F-020** | Retain local/remote recovery, exact banner, local-memory-only semantics and revalidation before remote success. No terminal/run-debug promise or storage design. |
| **F-026** | Retain one buffer/path, dirty-vs-last-saved, revert confirmation, Save/focus checks, combined prompt and no keystroke polling. Add only observed-conflict → dirty-to-clean revalidation; settle timing and revision token. |
| **F-027** | Retain UTF-8, no lossy save, binary/read-only reasons, undo/redo, clipboard, wrap/font choices, explicit Save, no auto-save and no hex. Clarify BOM, binary heuristic, scalar/grapheme behavior and shared-authority enforcement. |
| **F-028** | Retain 10,000-line default, independent 5 MB cap, truncated view + Load full, over-cap alternatives, persisted thresholds and no MVP virtualization. Define units/boundaries; cap is not performance proof. |
| **F-082** | Retain nearest-existing policy, surviving CRLF/LF/CR, no-op identity and paste normalization limited to inserted text. Ropey does not choose policy; settle tie, no-boundary, removed-nearest and per-newline rules. |
| **definitions_and_transactions** | Retain user/preview/FileSafe/LSP/agent/restore/recovery routes and layered histories. External resolution remains shared-buffer transaction; preserve owner references. |
| **editing_and_save_context** | Retain explicit Save/failure, stable unsaved indication, revert/history ownership, remote recovery, cached-only offline copy and remote states. No storage/FileSafe defect established. |
| **text_and_size_context** | Retain exact dirty definition, combined prompt, no keystroke checks, UTF-8/newline/no-auto-save, read-only reasons and size limits. Do not silently broaden line counts from Ropey defaults. |

## Cross-topic omissions and opportunities

1. **Conflict × recovery × representation:** recovery preserves exact buffer text/endings without implying disk/remote baseline advanced. External change while dirty and later dirty-to-clean should converge on one current-destination reconciliation path.
2. **F-082 × F-027 × Ropey:** CRLF seams are structurally preserved, but Ropey's default Unicode line features may count beyond PM's LF/CRLF/CR examples. Keep byte preservation, product line-count policy and nearest-ending insertion independent.
3. **Read-only × undo:** proposed checks need public paste and undo/redo plus backend rejection for all origins. No app tests were run.
4. **Destination races:** revision token, same-path replacement/deletion, local vs remote identity, cache freshness and compare-at-write remain open. Watchers prompt reconciliation; they are not durable truth.
5. **Alternatives:** flat String is baseline; Ropey is optional. Slint TextEdit as sole canonical model is unsupported here without proof. Piece tree/table, mmap, virtualization, alternate encodings, hex and other editors remain unassessed, not rejected. Atomic replace and in-place writes remain alternatives. No exhaustive-opportunity claim.
6. **Boundaries:** preserve Rust + Slint and product/owner/safety choices. FileSafe, LSPSupport, storage-plan, FinalGUISpec and source-control are dependencies; do not infer absent-contract defects, Iced, WorkNodes, NodeSeeds, runtime, readiness or canon changes.

## O1–O6 assessment

- **O1 discovery:** Zed issue, Ropey source and Slint read-only/performance evidence go beyond frozen defects. Bounded, not exhaustive.
- **O2 code:** Zed commit/caller/test and Ropey v1.6.1 are pinned; Slint v1.12.0 wrapper/base/core sources ground read-only. No production version recommended.
- **O3 history:** Zed issue → merged fix → regression source established; exact release tag uncertain. Ropey changelog/tests useful but lack issue/PR and dedicated linkage. Atomic-save history absent and correctly open.
- **O4 comparison:** both drafts cover every PlanUnit and context copy; table confirms. Resolve A prompt timing.
- **O5 criticism:** final must preserve Slint correction, Zed release uncertainty and remaining objections.
- **O6 complete proposal:** neither draft nor this critique replaces the final. Final must synthesize sections, rationale, options, already-covered/rejected/uncertain matters, owner boundaries, critic dispositions, validation proposals and uncertainties without claiming tests/canon changes.

## Validation and record

**Executed by critic:** declared reads, host SHA-256 checks, public primary-source searches/opens/finds. These establish file identity and what the cited sources say, not application behavior.

**Proposed only:** read-only mutation matrix; pane/save/conflict/recovery state matrix; destination race checks; mixed-ending fixtures; size boundaries/scan races; target Rust+Slint performance and memory checks. No app, test, benchmark, build or product validation ran.

First useful finding preceded this artifact. Source operations, capture versions, hashes and full completion time are in source-map.json. Usage and billing are unavailable and remain null. No final rewrite, repo/canon edits, nested delegation, other-case reads or external actions occurred.
