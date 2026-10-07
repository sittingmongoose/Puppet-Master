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
