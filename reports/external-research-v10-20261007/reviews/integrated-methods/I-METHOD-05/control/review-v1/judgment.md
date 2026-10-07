**Independent semantic source judgment: FAIL. Assessment of the declared scope is complete.**

The final contains useful, mostly accurate component research and a substantial integrated proposal. It preserves the main Rust + Slint, shared-buffer, explicit-save, recovery, UTF-8, mixed-ending and size choices. It nevertheless contains three material contract/preservation defects and one incomplete required history obligation. The three contract findings concern the written proposal; no Puppet Master runtime defect is inferred. No consequential public component behavior claim was confirmed false.

This is a full-scope judgment, not a grade extrapolated from a localized failure. All 6 original obligations, all 10 frozen owner records, 43 grouped owner decisions, 15 visible criticism dispositions and 22 consequential source checks were assessed. There are **0 unassessed required items**. Assessment completion does not mean candidate satisfaction: O3, O4 and O6 are not fully satisfied. The counts and enumeration are in coverage.json; every consequential check, source locator, URL, capture metadata and SHA-256 is in source-checks.json.

All paths below are relative to this review directory unless explicitly absolute:
`/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/integrated-methods/I-METHOD-05/control/review-v1`.

**Independence, admission and blinding.** I read the complete original brief, frozen plan, all ten copied source files, complete admitted research aggregate, complete critic and final artifacts, their source maps and admitted capture notes. The research aggregate's own sources directory is empty; its map points to topic directories outside the expressly admitted paths. Those references were not followed. The aggregate contains both complete drafts, and the final's admitted sources contain the topic evidence notes. Direct critic evidence and the copied critic notes were checked byte-identical. The admitted-input manifest and copies are preserved under sources/.

Arm names are visible in the paths. The two-topic structure and procedure prose can reveal method differences. Source maps contain author timing, counters, native Goal and provenance fields; these were ignored for scientific judgment. No other-arm output, scores, costs, speed targets, evaluator material, parent analysis, campaign state, locks, selections or other reviews were accessed. There is no comparative judgment or expected winner. Provider/family identity, lifecycle, historical execution logs and billing are not established by this source review; unknown fields remain null. No Goal, child agent, further review round or candidate feedback was created.

Public source pages were treated as data. Source truth came from inspecting the primary code, governing definitions/callers, tests, issues, PRs and released files, not from author assertions, file hashes, source-map identity or successful commands. Hashes identify evidence bytes only. Raw fetched source bytes and response metadata are preserved. Rendered .html.txt companions are convenience views derived from captured HTML. Six follow-up unauthenticated GitHub API requests hit a rate limit; public GitHub HTML and immutable raw files supplied the needed checks. Live Slint latest documentation has no independently pinned edition here; its retrieval time and bytes are captured, and pinned code governs the conclusions.

**One coherent six-axis assessment.**

| Axis | Result | Assessment |
|---|---|---|
| A1: required scope and frozen decisions | FAIL | All O1–O6 and all ten owners/context copies assessed. D1–D3 conflict with retained contracts; D4 leaves required release applicability unfinished. |
| A2: consequential truth, conditions and versions | PASS_WITH_LIMITATIONS | Zed, Ropey and Slint code observations are supported with governing context. Old reports are bounded, not asserted current PM defects. Final does not complete its own Zed release applicability; no latest/all-platform sweep was required or inferred. |
| A3: useful bounded discovery and alternatives | PASS_WITH_LIMITATIONS | Zed transition history, Ropey representation/features, Slint mutation paths and performance caution are useful discoveries beyond a plan defect list. String/Ropey and in-place/rename alternatives are kept. Known CRLF and format-on-save leads remain shallow; no exhaustive opportunity recall is claimed. |
| A4: correction/rejection and already-covered accuracy | FAIL | Slint input evidence is overextended into a blanket read-only rejection contract (D2); save-success wording becomes too broad (D1); F-028's conditional negative constraint becomes an unconditional prohibition labeled retain (D3). Other already-covered rows refer to the actual frozen contexts rather than inventing absent adjacent contracts. |
| A5: preservation through research, criticism and final | FAIL | All 15 criticism rows are visibly addressed, including uncertainty. Visibility does not cure D1/D2; the original necessity exception is lost (D3). Some secondary detail survives only through retention references. |
| A6: validation and witness applicability | PASS_WITH_LIMITATIONS | Eleven concrete PM checks/benchmarks are explicitly proposed, not executed. Inspected upstream tests, browsing and hashes do not validate PM, its Slint adapter, atomic Save or responsiveness. No positive build/runtime validation claim is made. |

**Material defect D1 — write-only baseline advancement conflicts with confirmed reload/restore.**

Claim locations: final artifact lines 21 and 39; the write-success invariant is reiterated in the validation at line 137. Line 21 is in the shared state contract, not merely a failure-path instruction. It says a successful destination write alone advances saved content/destination baseline and clears dirty. Line 39 repeats the only-successful-write condition. Meanwhile line 35 says Reload adopts the current destination, and lines 86/92 claim to retain revert and dirty semantics.

Affected condition: a buffer was loaded from version A, has local edits, disk becomes version B, and the user confirms Reload. There is no destination write in this operation. A literal application of the final's only-write rule keeps the prior baseline while adopting B, so dirty can remain true against A, or dirty is cleared contrary to the stated invariant. A confirmed revert/restore is likewise not necessarily a new write by the editor.

The frozen definition expressly permits owner-confirmed restore/revert adoption to clear or replace dirty state (sources/frozen-inputs/definitions_and_transactions.md:18–19), and the copied text explicitly says dirty clears after reload (sources/frozen-inputs/text_and_size_context.md:4–5). These are supplied contracts, not assumptions about missing FileSafe/storage owners. As analogous implementation context, pinned Zed Buffer::did_reload updates saved_version and saved_mtime and resets its unsaved-edit record (sources/zed-buffer.rs:1658–1673; [immutable source](https://raw.githubusercontent.com/zed-industries/zed/426a5666dc12e37b2441f135388b683be8ade481/crates/language/src/buffer.rs)).

A narrower Save-only interpretation could avoid this conflict, but the final does not state that condition in the shared-state invariant. This is graded as a material specification contradiction/ambiguity, not an observed application error. Research line 27 already used the broad successful-write wording; the critic retained save failure semantics at line 17 without distinguishing baseline adoption; the final strengthens it with alone/only. Preservation therefore carried a defect forward rather than settling it. Check C19 records exact source hashes and locations.

**Material defect D2 — blanket read-only rejection lacks the required authorized recovery/reload path.**

Claim locations: final line 25 includes restore, recovery and external resolution among mutation paths, then requires rejection before content, dirty, undo, recovery or save state can change. Validation line 134 calls for mutation rejection in read-only across the listed sources. Line 51 simultaneously promises that external UTF-8 correction plus reload can make the file editable.

Affected condition: a decode-failed read-only view has been repaired externally and must reload the corrected file, or a recovered unsaved buffer is being adopted while the destination remains read-only. Under the blanket rejection wording, the shared authority cannot adopt corrected/recovered content or update its mode/recovery facts. A discretionary authorized-adoption exception is not defined. Gating every origin is appropriate; treating every such transaction as forbidden is a different contract.

Frozen sources distinguish blocked user/preview edits from owner-confirmed restore/revert/recovery adoption (definitions_and_transactions.md:16–18). UTF-8 correction followed by reload is an explicit allowed path (text_and_size_context.md:15), and local/remote recover-unsaved is required (editing_and_save_context.md:16–21; F-020.md:9). OS/Git read-only blocks Save and allows Save As (text_and_size_context.md:19); it does not state that every backend buffer adoption is forbidden.

The Slint evidence is accurate but narrower. At v1.12.0 / commit 37fb91fafced9e117597a9a1825a641a8c3ea541, public paste reaches insert without the keyboard read_only guard, and undo/redo dispatch/implementations lack that guard. The wrapper/base expose writable text bindings and programmatic calls. This establishes the need for owner authorization and adapter checks, not a prohibition on authorized initialization, recovery and reload. See [pinned core](https://raw.githubusercontent.com/slint-ui/slint/37fb91fafced9e117597a9a1825a641a8c3ea541/internal/core/items/text.rs), sources/slint-37fb91-text.rs:775–811,1523–1569,1680–1698,1861–1950; C13/C14/C20 also capture the public callers and guarded context menus.

Research lines 113–118 introduced the broad read-only rule. The critic's line 25 asks for a shared gate including restore/recovery and correctly pins the widget paths. Final line 108 accepts the correction, but line 25/134 turns the gate into unqualified rejection. This is a material proposal ambiguity and overcorrection; no PM runtime behavior is asserted.

**Material defect D3 — the accepted necessity exception is removed from F-028.**

Claim locations: final lines 13, 63 and 88 state no MVP virtualized editing / do not add virtualized read-only editing to MVP; the comparison labels this retain. The frozen negative constraint is conditional: do not implement read-only virtualized editing in MVP unless needed (sources/frozen-inputs/F-028.md:42–43; text_and_size_context.md:24).

Affected condition: actual adapter measurements establish a need for a read-only virtualized approach within the existing MVP product boundary. The frozen text allows that necessity exception; the final's unconditional prohibition does not. The research aggregate explicitly retained unless needed at lines 44 and 137. The final removes the condition without identifying a policy change, supported rejection or outstanding owner decision. Treating virtualization as an unassessed alternative at line 69 does not restore the accepted exception. No benchmark ran that could justify narrowing it. This is a material preservation loss and incorrect retain disposition, independent of whether virtualization is ultimately chosen. Check C21 contains the evidence identities.

**Material defect D4 — the required issue history does not complete release applicability.**

Claim locations: final lines 102 and 122 acknowledge that exact shipped Zed applicability is unresolved; O3 is nevertheless presented as inherited history coverage. The source claim is cautious rather than false. The defect is incomplete required work: brief.md:29–35,65 requires the pertinent issue through fix, regression evidence and release applicability. A release-note search inclusion plus a merged commit does not establish which released source contains the behavior.

Independent primary checks establish that published [Zed v0.228.0](https://github.com/zed-industries/zed/releases/tag/v0.228.0), released 2026-03-18T15:31:37Z, lists #51037 and points to commit 8421009ef8a022df1196d54bb42fd94366ec0988. Its immutable buffer file contains the guard, and its immutable integration-test file contains test_dirty_buffer_reloads_after_undo. See sources/zed-release-v0.228.0.html.txt:84–98,136; sources/zed-8421009-buffer.rs:2857–2884; sources/zed-8421009-tests.rs:5691–5759; C04. Tag bytes and immutable released bytes were compared directly.

This does not identify the earliest release, prove every later version, select Zed for PM, or establish current PM behavior. Those claims are unnecessary here. It does show a feasible released applicability check omitted from the authored final. Reviewer discovery is not credited as candidate completion. Honest uncertainty does not automatically satisfy this required obligation.

**Other consequential limits, assessed without inventing additional material errors.**

L1: F-082's required per-boundary result is retained at final line 55, but the same paragraph reopens per-newline versus per-transaction selection. Frozen F-082.md:19 requires the nearest surviving boundary for each newly created newline. A transaction-level computation can be an implementation choice only if it preserves that result for every boundary; it cannot be an option to replace the required policy when different boundaries have different nearest surviving contexts. Tie distance and no-survivor default are genuinely unspecified and may remain decisions. Since the final first retains the required result and chooses no violating implementation, this is an ambiguity/condition limit, not a confirmed policy change.

L2: The admitted Slint CRLF lead is not deeply researched in the final. Primary follow-through shows discussion #12343 reports Bun/TypeScript with Slint 1.17.0, and the maintainer links a fix. [PR #12347](https://github.com/slint-ui/slint/pull/12347) addresses parley paragraph ranges and cursor positions between CR and LF. Published [v1.17.1](https://github.com/slint-ui/slint/releases/tag/v1.17.1), 2026-07-07, points to cf62c975c311e7036d599ed8ed0b7e6a8386a934; its sharedparley.rs contains paragraph_ranges, its governing create_text_paragraphs caller, the cursor clamp and CRLF/cursor/range tests (sources/slint-cf62c9-sharedparley.rs:400–455,988–990,1067–1084,1771–1813). Released tag/commit bytes match. This is a useful missed depth/opportunity, not proof that v1.12.0 or all renderers are affected. It does not justify source-text normalization or a framework change. The final's statement that its research did not investigate the lead is truthful; uncertainty alone is not research of this mechanism. C16 records the bounded discovery, without rescuing the candidate answer.

L3: Some detail is carried only by the named retention references: one tab/path/group, stable secondary unsaved feedback, exact cached-only live copy and no-cache gating, remote state labels/roundtrip blocking, chat revert target resolution, intermediate conflict-result edits, IME/cursor-drift/editor-wrapper acceptance and compatibility aliases. The retained source references really contain those rules, so their mere absence as repeated prose is not counted as a false whole-project coverage claim. The complete-product-contract label is stronger than its standalone detail. The original automatic-clean-reload alternative and Ropey tiny-file allocation caveat also disappear while user prompting and String baseline remain. These are preservation/detail limits, not a claim that every draft sentence must be copied verbatim. Final line 114's all-nine count is clerical: the actual comparison has ten rows.

The linked Zed follow-up [PR #52855](https://github.com/zed-industries/zed/pull/52855) reports that format-on-save can return text to clean and trigger an inappropriate reload during Save. It contains a regression-test patch and a formatting-in-progress guard proposal. It was closed as an inactive/conflicting draft on 2026-05-24, not merged. Pinned patch commits b2dd8d32c3a091b0ee2e5e457800a12dbfdfe87a and 7ed49280da799eac87dc962621918284cbf7280f are preserved; the latter adds the governing LspStore query and Project event-handler check (C05). This is a consequential applicability condition omitted from the research. The PM proposal uses a prompt rather than Zed's auto-reload, so the follow-up is not proof of the same PM defect, and no released fix is inferred.

**Consequential source truth and useful bounded discovery.**

C01–C06 establish the Zed issue/fix/undo-caller/test chain and its exact conditions. Buffer::file_updated records the new File and suppresses reload while dirty; did_edit emits ReloadNeeded after a real dirty-to-clean edit only for a present file with differing saved mtime. The implementation uses known file metadata; it does not itself perform the final's proposed destination reread. The fake local-FS regression verifies retained local edits/conflict followed by external content after undo. PM's user-controlled prompt and byte-equality reconciliation remain proposed product behavior, not behavior established by that upstream test.

C07–C12 confirm Ropey 1.6.1 at d41ee247f2f097c7f9c8e4730b7dd884734f1ee5: valid-UTF-8/scalar APIs, reader rejection, ordered chunk output, partial-output error behavior, metadata counts and incremental builder. The count callers reach Node::text_info and bounded root-child metadata aggregation or a bounded leaf scan (C09), rather than a full document traversal. CRLF seam helpers reject splitting a pair; slices may split it. Features distinguish LF/CRLF/CR from additional Unicode separators; disabling defaults also drops SIMD unless enabled explicitly. Caller-supplied inserted text does not choose F-082's nearest ending. The changelog lists the CRLF-split len_lines fix in 1.5.1, and 1.6.1 contains seam/property and directly matching slice tests. No causal commit-to-test link was proved. These are representation/history facts, not atomic-save, whole-app memory or Slint responsiveness evidence.

C13–C16 ground Slint observations in v1.12.0 sources and separate the newer CRLF history. #8877 is a closed-as-duplicate configuration-specific 1.12 / Rust / Windows 11 23H2 / wint+Skia report with a roughly 130,172 x3 input description. It supplies a reason to measure, not a measured widget limit or a demonstrated shipped fix. Programmatic writable text is deliberate in the documented API; source read-only gates do not replace the shared authority.

C17–C18 check the watcher/save cautions against primary platform definitions. Linux man-pages 6.19, inotify(7) dated 2026-02-14 (live HTML rendering 2026-09-09), documents event coalescing and queue loss; this is concrete support for reconciliation, not a cross-platform watcher contract. POSIX.1-2024 Issue 8 defines regular-file O_TRUNC and rename replacement visibility/EXDEV conditions. The in-place versus replacement tradeoffs are coherent, but no Windows/FileSafe crash-durability implementation was established. Fingerprints, compare-at-write, recovery cadence/schema/retention, size units, scan cancellation and target adapter performance may remain adjacent-owner or implementation decisions; absence of those owners was not treated as a product defect.

String baseline, optional Ropey, explicit feature decisions, unchanged UTF-8 limits, bounded streaming preview and save algorithm alternatives are useful coverage. Piece table/tree, mmap, virtualization, alternate encodings, hex, other editors and Ropey 2.0 beta are explicitly unassessed approaches. Their omission is not declared an exhaustive missed-opportunity count; hex remains outside MVP. Required scope was derived from the original brief and frozen bytes, not reduced to the final's discoveries.

**Original obligations and all in-scope owners.**

| Obligation | Assessment | Candidate result |
|---|---|---|
| O1 | ASSESSED | Satisfied as useful bounded primary discovery beyond plan entries; discovery chronology is reported rather than independently evidenced by permitted historical logs. No exhaustive recall claim. |
| O2 | ASSESSED | Satisfied: immutable code with definitions/callers was inspected and accurately described. Source observations remain distinct from runtime checks. |
| O3 | ASSESSED | Not fully satisfied: real issue/fix/regression present, release applicability incomplete (D4). Ropey qualified evolution is useful additional history. |
| O4 | ASSESSED | Not fully satisfied: all ten records are compared, but retain/clarify dispositions do not preserve D1–D3 conditions. |
| O5 | ASSESSED | Scientific content satisfied: substantive admitted critique and all 15 visible dispositions checked. Actual flash-family/provider identity is external provenance, not independently established here. |
| O6 | ASSESSED | Not fully satisfied: artifact has replacement sections, alternatives, dependencies, criticism, validations and uncertainty, but its contract conflicts/narrowing prevent a coherent complete revision. |

| Frozen record | Final comparison row | Source judgment within this record |
|---|---|---|
| F-008 | 83 | Not fully satisfied: baseline-adoption and all-origin read-only conditions need D1/D2 qualifications. Shared authority, typed sources and undo boundaries are otherwise retained. |
| F-018 | 84 | Satisfied for the supplied orthogonal save-state/failure contract. The cross-context adoption conflict D1 is separately accounted for. |
| F-020 | 85 | Not fully satisfied because blanket read-only gate conflicts with required recovery (D2); remote banner and no-success/no-terminal boundaries are retained. |
| F-026 | 86 | Not fully satisfied: D1 conflicts with retained reload/dirty semantics. New pending-conflict transition is a bounded supported addition; focus/Save/combined prompt remain. |
| F-027 | 87 | Not fully satisfied: external repair/reload path conflicts with D2. UTF-8, endings, clipboard, font/wrap, reasons, explicit Save/no hex are otherwise retained. |
| F-028 | 88 | Not fully satisfied: necessity exception lost (D3). Thresholds, cap, Load full, alternatives, settings and need for measurement remain. |
| F-082 | 89 | Satisfied with L1 ambiguity. Required boundary preservation and inserted-only normalization retained; tie/no-survivor choices and exact counting remain open. |
| definitions_and_transactions | 90 | Not fully satisfied because D1/D2 affect owner-confirmed adoption; layered histories and adjacent authority references retained. |
| editing_and_save_context | 91 | Not fully satisfied because D2 affects recover-unsaved. Feedback, failure, chat/history ownership and cached-only remote states are retained by reference. |
| text_and_size_context | 92 | Not fully satisfied due D1–D3. Combined prompts, no keystroke polling, encoding/ending constraints and thresholds otherwise preserved. |

The following P01–P43 inventory groups every supplied product/owner clause, including definitions, modes, negative/compatibility/proof boundaries and dependencies. Repeated source clauses are grouped for assessment, not treated as independent new requirements. Source shorthand definitions/editing/text maps respectively to the three frozen *_context / definitions_and_transactions copies; all ten full copies and SHA-256 identities are preserved in sources/frozen-inputs and the admitted manifest. Every row is ASSESSED.

| ID | Frozen decision bundle | Frozen locator | Final lines | Result / defect |
|---|---|---|---|---|
| P01 | Rust + Slint, no Iced/framework substitution | brief:16-18 | 3,11,77 | RETAINED |
| P02 | No canon/WorkNode/NodeSeed/runtime/event/storage-admission/automatic-activation/readiness inference | all units acceptance/negative constraints; F-082:42-44 | 3,145,160 | RETAINED_BY_REFERENCE |
| P03 | FileSafe, LSP, storage, GUI and source-control remain adjacent boundaries, not missing-project defects | definitions:27; editing:8,14,23; brief Frozen scope | 83,90,94,147-158 | RETAINED |
| P04 | redb settings/session/editor persistence; seglog optional analytics; Preset and FileSafe definitions | definitions:7-10 | 65,90,94,153 | RETAINED_BY_REFERENCE |
| P05 | One buffer/path; one tab/path/group; independent group tabs/active tab with shared model | definitions:3-5; F-026:9; text:3 | 19,83,86,92,133 | RETAINED_BY_REFERENCE |
| P06 | All typed user/preview/agent/FileSafe/LSP/revert/recovery/disk/generated-write sources; no alternate dirty/save/restore authority | definitions:14,19-20; F-008:9 | 19,23,25,83,90,134 | RETAINED_WITH_CONFLICT (D2) |
| P07 | User/preview undo/dirty subject to read-only, write-lock, active recovery; agent edits do not silently join user group | definitions:16-18 | 23,25,27,61,83,134 | NOT_FULLY_PRESERVED (D2) |
| P08 | Single-file in-place preview/FileSafe/LSP coherent undo; multi-file/rename/hunk/repo/conflict flows broader than editor undo | definitions:22; F-008:47 | 23,27,83,90 | RETAINED_BY_REFERENCE |
| P09 | Assistant single-file group, multi-file thread/run receipt and group/file; no cross-file Ctrl+Z | definitions:23; F-008:48 | 23,27,83,134 | RETAINED |
| P10 | Separate buffer undo, backend restore, Git history and internal blocked safe points; safe points are not restore points | definitions:21; F-008:49 | 23,27,90 | RETAINED_BY_REFERENCE |
| P11 | Conflict buttons are structured result-buffer edits until final resolve/stage; Git hunk stage/unstage/discard remains Git history | definitions:23 | 23,27,90,94 | RETAINED_BY_REFERENCE_WITH_AMBIGUITY |
| P12 | Previews derive from source buffers and return bounded patches; remote SSH changes authority/capabilities, not conceptual buffer | definitions:24 | 19,23,47,90,94 | RETAINED_BY_REFERENCE |
| P13 | Adapter accessibility, IME, selection/caret, clipboard, cursor drift, paste/editor-wrapper input correctness are acceptance-level | definitions:25 | 53,73,90,134,143 | RETAINED_BY_REFERENCE |
| P14 | Dirty compares memory to saved baseline, independent of disk; owner-confirmed adoption can replace/clear state | definitions:6,18-19; text:4; F-026:9 | 21,35,39,86,92 | CONTRACT_CONFLICT (D1) |
| P15 | Explicit Save only, no MVP auto-save, success feedback | editing:4,6; text:17; F-018:9; F-027:47 | 21,31,39,53,84,87 | RETAINED |
| P16 | Failure preserves dirty and baseline with reason/Retry/optional Save As including disk full, permissions, deleted/read-only/disconnected target | editing:4; F-018:9,47 | 25,39,84,137 | RETAINED |
| P17 | Unsaved indicator per tab plus at least one stable secondary shell location | editing:5 | 91,133 | RETAINED_BY_REFERENCE |
| P18 | Orthogonal dirty/conflicted/read-only/degraded/marker/lock/stale/change/failure/recovery facts; BufferReverted events and convergent OpenFile callers | editing:6; F-018:9 | 11,21,61,84,91,135 | RETAINED_BY_REFERENCE |
| P19 | Revert reloads disk, confirms dirty discard and clears dirty after reload | text:5; editing:10; definitions:18 | 33,35,39,86,92 | CONTRACT_CONFLICT (D1, D2) |
| P20 | Chat-owned cmd.chat.revert; omitted target selects latest persisted assistant turn; whole-turn multi-file restore and buffer refresh | editing:10-11 | 23,90-91 | RETAINED_BY_REFERENCE |
| P21 | Restore to/History fetches backend points and invokes same pipeline; surfaces do not manufacture independent points | editing:12; definitions:21 | 23,27,90-91 | RETAINED_BY_REFERENCE |
| P22 | Required local/remote recover-unsaved, /quit and /later, local memory semantics and exact recovered-remote banner | editing:16-21; F-020:9,34-39; definitions:20 | 45,47,85,138 | CONTRACT_CONFLICT (D2) |
| P23 | Reconnect/revalidate before remote save/flush success; file editing does not imply remote terminal/run-debug | editing:19-21; F-020:9,43 | 39,45,47,85,138 | RETAINED |
| P24 | Work offline (cached files only) exact live copy; validated cache required, no-cache disables/no-files state; legacy shorthand not live copy | editing:27-29 | 47,85,91 | RETAINED_BY_REFERENCE |
| P25 | Connected/reconnecting/unavailable/pending-write/remote-read-only states; unavailable services and confirmed-roundtrip blocking unless queued | editing:31 | 47,61,91,135 | RETAINED_BY_REFERENCE |
| P26 | Changed-on-disk checks on Save and any focused editor window/tab; no keystroke polling | text:7; F-026:9,45 | 31,35,86,135 | RETAINED_WITH_SUPPORTED_ADDITION |
| P27 | Reload/Overwrite/Cancel and Show diff; dirty+disk divergence gets one combined prompt | text:7; editing:6; F-026:39-44 | 33,35,86,135-136 | RETAINED |
| P28 | Per-buffer Undo/Redo with standard Ctrl+Z/Ctrl+Shift+Z/Ctrl+Y and no cross-file undo | text:11; F-027:34-38 | 23,27,53,87,134 | RETAINED_BY_REFERENCE |
| P29 | System clipboard Copy/Cut/Paste via keyboard/context menu; optional paste normalization | text:12; F-027:38 | 25,53,55,87,139-140 | RETAINED_BY_REFERENCE |
| P30 | Wrap off by default for code with optional toggle; monospace family/size from theme/editor setting | text:13-14; F-027:9 | 53,87 | RETAINED_BY_REFERENCE |
| P31 | UTF-8 editable; decode-failed read-only with clear reason until external repair and reload | text:15; F-027:9,40 | 25,51,87,134,139 | CONTRACT_CONFLICT (D2) |
| P32 | Preserve LF/CRLF/CR on ordinary Save; no-edit sequence identity and surviving boundaries after local edit | text:16; F-082:8-11,19-24 | 45,53,55,87,89,140 | RETAINED |
| P33 | Binary read-only with clear reason; MVP hex view excluded | text:18; F-027:42,48 | 51,61,87,139 | RETAINED |
| P34 | OS/Git read-only reason, block Save, permit Save As; do not equate presentation/read-only disk with every authorized buffer adoption | text:19; definitions:16-18 | 25,39,61,87,134 | CONTRACT_CONFLICT (D2) |
| P35 | Requested/effective editable/truncated/load-full/too-large/binary/decode/disk/degraded modes and user-visible reasons | definitions:25; text:19; F-028:9 | 61,63,87-88 | RETAINED |
| P36 | Each newly created newline inherits nearest surviving existing boundary for insertion/replacement; outside survivors byte-preserved | F-082:8-11,19-20 | 55,89,140,154 | RETAINED_WITH_AMBIGUITY |
| P37 | Paste off preserves inserted endings; selected normalization applies only to new paste boundaries, nearest policy, never whole buffer | F-082:10-11,23-24; text:12 | 53,55,89,140 | RETAINED |
| P38 | F-082 does not alter undo grouping, explicit Save, dirty failure, encoding or FileSafe; depends on F-008/F-027 and gives no runtime/readiness proof | F-082:14-17,25-26,42-44 | 53,55,83-89,129,145,160 | RETAINED_BY_REFERENCE |
| P39 | Above line threshold truncated read-only first-N preview, explicit Load full permits editing only within cap | text:24; F-028:9 | 63,65,88,141 | RETAINED |
| P40 | 10,000-line default primary UX metric; independent 5 MB cap; over-cap truncated view/system-editor alternatives | text:25-26; F-028:9 | 13,63,65,88,141 | RETAINED |
| P41 | Large file threshold (lines) and Hard cap (MB), example 5k-50k/2-10 settings ranges persisted in redb | text:26; F-028:40-41 | 65,88,141,155 | RETAINED_BY_REFERENCE |
| P42 | Do not implement MVP read-only virtualized editing unless needed: retain necessity exception | text:24; F-028:42-43 | 13,63,88,110,112 | NOT_PRESERVED (D3) |
| P43 | Legacy unsaved-content maps to recover-unsaved on /quit and /later, not a distinct recovery contract | definitions:20; F-008:50-51 | 47,83,90 | RETAINED_BY_REFERENCE |


**Preservation and criticism dispositions.** Both admitted drafts and all critic paragraphs/tables were assessed; no counterpart material was used. All 15 final disposition rows are visible. Their presence is credited separately from whether the accepted correction is sound.

| ID | Criticism | Final line | Preservation / scientific check |
|---|---|---|---|
| K01 | Zed analogy is not PM defect | 100 | Analogy and no-PM-defect limit preserved; primary chain confirmed. |
| K02 | mtime not universal revision | 101 | Mtime and local/remote/cache/write-race limits preserved. |
| K03 | Zed shipped-release uncertainty | 102 | Exact-release uncertainty preserved faithfully; required O3 remains incomplete (D4). |
| K04 | Prompt timing contradiction | 103 | Immediate revalidation and one prompt now explicit; owner prompt mechanics remain open. |
| K05 | Atomic save/adjacent owner limits | 104 | No algorithm/history selected; in-place/rename options and adjacent boundaries preserved. |
| K06 | Ropey only a qualified option | 105 | Ropey option, String baseline and adapter/performance conditions preserved. |
| K07 | Ropey qualified release/test history | 106 | Qualified evolution retained without invented issue/PR or dedicated causal regression linkage. |
| K08 | Partial Rope serialization | 107 | Partial output warning retained; serialization distinguished from FileSafe atomicity. |
| K09 | Pinned Slint paste/undo/programmatic paths | 108 | Pinned wrapper/base/core observations retained, but backend rejection overextended (D2). |
| K10 | Configuration-specific Slint lag wording | 109 | Exact environment/size meaning and no-benchmark/no-fix limits preserved. |
| K11 | F-028 metrics, conditions, scan/performance | 110 | Values/metrics/measurement and scan rechecks retained; frozen necessity exception lost (D3). |
| K12 | Cross-topic seams | 111 | Seams are addressed; baseline/recovery authorization remain internally conflicted (D1/D2). |
| K13 | Unassessed alternative set | 112 | Unresearched alternatives remain unassessed, not broadly rejected/exhaustive. |
| K14 | TextEdit sole authority unsupported | 113 | Sole-widget authority not recommended without proof; renderer option remains. |
| K15 | Need an integrated final artifact | 114 | Integrated final format supplied; full-scope correctness claim fails D1–D4. |


**Validation, execution and proof limits.** Final lines 131–143 propose shared-pane/source-authority, state/conflict/revision-race, save-failure, recovery, encoding/endings, threshold/scan, adapter performance and accessibility checks. Lines 145/160 explicitly deny that these ran. The research/critic records likewise report source reads/browsing, not PM runtime validation. No executed PM witness is presented. Host hashes establish identity, upstream test source establishes intended assertions, and PR text/CI totals do not establish that a PM app passed any acceptance check.

I executed retrieval, parsing, byte comparisons and source-file hashing to verify evidence. I did not execute downloaded code, build an app, run upstream tests, run a candidate benchmark, operate infrastructure, modify canon/inputs, create WorkNodes, contact third parties or start browser/server/worktree resources. Historical candidate execution absence cannot be independently proven without inadmissible logs; the judgment concerns the absence of a claimed positive runtime witness and the actual applicability of available source evidence. Proposed acceptance coverage is useful but cannot settle D1/D2 until the written contract's conditions are coherent. No readiness/runtime/storage admission follows from the proposal or this review.

**Evidence identity and delivery.** source-checks.json enumerates C01–C22 with final claim locations, precise source ranges/symbols, versions/conditions, URLs, complete raw byte paths, SHA-256 values and capture times. The frozen inputs below are exact comparison evidence; their hashes are identities, not correctness proofs.

| Frozen input | SHA-256 |
|---|---|
| sources/frozen-inputs/F-008.md | `228a3d6d2f5f5dd76fbaad1a11101059b5f903e9886caee0473b12ca740b2254` |
| sources/frozen-inputs/F-018.md | `2aaa9d7050de3d76d758491049c5d89f5fe61d1194d9592fd4b6c8e8e7a8f146` |
| sources/frozen-inputs/F-020.md | `0d154458faf3f2d6173dcf7b84355d81490badfbc1bebcc9b9a9a67c07374874` |
| sources/frozen-inputs/F-026.md | `3dbb57e9cd4b912dd92d3000ae8fe77e14c269094a98ea4cfe7a6f8515376dea` |
| sources/frozen-inputs/F-027.md | `770088fd11b971154c27104ded235673da2d4f6b24666db6dd95ca3f6e51be7c` |
| sources/frozen-inputs/F-028.md | `dc6e71c3e801d5352b3a9629a7c0c18fd70e48212e98c7ba46318b7bf77e6e65` |
| sources/frozen-inputs/F-082.md | `b256763567a9d143c73b15eb40c74718c71a4446d352c184e2f69c81ea74ad5f` |
| sources/frozen-inputs/brief.md | `9b0b141cb8bc3a2ba86a7225cf836437fc9640d6f935f45b14d8be3103e22d3d` |
| sources/frozen-inputs/definitions_and_transactions.md | `322473f02b7bb409cf9aac8cffdcd7bfcd14b6d3ee77d2036473de6c1597d608` |
| sources/frozen-inputs/editing_and_save_context.md | `e2202206c9b219e8413fdfba639e91c6cd3d5ac720f3dac4f5afd787ce912440` |
| sources/frozen-inputs/plan.md | `9f8047bac292088091eafb543251bc79662fe52f1c265c6a54aa0b041abedfd4` |
| sources/frozen-inputs/text_and_size_context.md | `44dad53614033d8660ef892dd559bf83c8c784086f46c3818e383b23b76d66f7` |


| Primary check evidence | SHA-256 | Version / governing range |
|---|---|---|
| sources/zed-buffer.rs | `000c461be379974adcda33ecbfc2e464d21f05b4e4014aea6fad1a0dc86a99de` | 426a5666; definitions/mtime 106–111,434–455; file_updated 1676–1708; did_edit 2847–2870; undo 3126–3138 |
| sources/zed-project-tests.rs | `e0964a72fd365bab92ab9aa66c03779f6266c2d0fcda2c6bb74ab9402d660fb8` | 426a5666; dirty-buffer undo test 5691–5759 |
| sources/zed-release-v0.228.0.html | `47a26a19c5cde8ccfc48fdd7a2c64edf6080bdf7465a1245b91df8ef9bf626a9` | published v0.228.0; release commit 8421009 and #51037 note |
| sources/zed-8421009-buffer.rs | `1bb5e7cde64b3ad96152eb461dec58f070d399d75d39b11df15bce72630c1a0b` | immutable published release; did_reload 1668–1681; did_edit 2857–2884 |
| sources/zed-8421009-tests.rs | `735598d63ff1334a15c30c8a868a616f6314a7a7dabbf32971184d92e2306742` | immutable published release; dirty-buffer undo test 5691–5759 |
| sources/zed-pr-52855.patch | `c0c55c87f107d1d99fac993d3d94e42dcc41452fd26459008265d74457fdbfa0` | unmerged b2dd8d32 / 7ed49280; test + formatting guard caller |
| sources/ropey-immutable-rope.rs | `273f11c4f756a6a4555b156a1a1d3b85aa0eeb2e12e056839810a731f702dbee` | v1.6.1 d41ee247; from_reader 107–193; write_to 197–222; counts 227–249; insert 333–347 |
| sources/ropey-immutable-lib.rs | `85c0533bfc2d990e6eca7b94115a1cd501e2a366c0c3de33aead624325a59f3a` | same release; scalar unit 1–7; line features/SIMD 115–162 |
| sources/ropey-immutable-builder.rs | `a72043e453041cbc8948998f78b6c0bb8a9e0cd99bcd77153778378167b97398` | same release; fields/append/finish 40–81; append_internal 120 onward |
| sources/ropey-immutable-changelog.md | `cb39bd9b0d622a83d18a4ada0f384e9067a07c57023cf5058a842d35e1bbec63` | same release; versioned fix/evolution entries 7–33 |
| sources/slint-37fb91-text.rs | `5603082f0ec16f7d6c68d8f13283e6e32cdf415a922d05c9fd956dcba3277db0` | v1.12.0; read_only 503; keyboard 775–811; insert/paste/undo/redo C14 |
| sources/slint-immutable-textedit.slint | `c1e9fac8f764de40b99072d74b6ae7f2f11a80fb8202e471d214f6e8f3921dd8` | same release; public text/read-only and paste caller |
| sources/slint-immutable-base.slint | `d9fb982b5dfb72ad737f6f3806bd6b40229717c0b5db2532849620cf0d47bd26` | same release; underlying binding/caller and context-menu guards |
| sources/slint-cf62c9-sharedparley.rs | `1e3c277e6c9e18090b1570846950cecc55497a3f5de16d1b517954e69dc3dc28` | published v1.17.1; paragraph/cursor governing context and tests C16 |
| sources/posix-open.html | `57b770918aa3e0c25186972675df8c96da119cf4b973335ed4487405e260dc3a` | POSIX.1-2024 Issue 8; O_TRUNC |
| sources/posix-rename.html | `06671610134b0a52cdf4dcdaf382f72fef85ef51088b8a52b8679c7f03829318` | POSIX.1-2024 Issue 8; replacement visibility/EXDEV |
| sources/inotify.html | `79f5ab18e2fc423631cf4949ef82ca1384844353ea11a4dba42e1a77e8fdd8fd` | Linux man-pages 6.19; coalescing/queue loss |


The original authored final is preserved byte-for-byte as sources/admitted-control/reviser-v1/artifact.md (SHA-256 aa54c03322cb723962a158b9a00020a5e0d5dfa9c4c581fc88a7ac2cf45da841). Research and critic artifacts/maps/captures are preserved in the sibling admitted-control directories; their exact original paths and hashes are in sources/admitted-input-manifest.json.

Counts are exact within the declared inventory: primary required scope 16/16 assessed, 0 unassessed; axes 6/6; owner bundles 43/43; criticism dispositions 15/15; consequential checks 22/22. Four material findings are D1–D4, comprising three contract/preservation defects and one required history gap; three additional limitations are L1–L3. These categories overlap and are not summed into a manufactured score. Optional approaches, missing adjacent owners and unexecuted future tests are identified as limits, not silently used to redefine the original scope or excuse a required obligation. Usage, billing, quota and host lifecycle/provenance judgments remain null.
