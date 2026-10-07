# Independent semantic judgment — I-METHOD-05

**Source judgment: FAIL. Full declared scope assessed; this is not a localized diagnostic with an unassessed remainder.** The primary-source research is useful and the principal component/history claims check out. The final is a coherent proposal with source references, alternatives, criticism responses and validation proposals. It nevertheless misstates or weakens three consequential conditions of the frozen plan: the surviving-boundary rule, paste with normalization off, and the scope of the single-buffer hard cap. These prevent O4 and O6 from being fully satisfied.

This is a judgment about the authored research/proposal and its fidelity to accepted product decisions. It is not evidence that Puppet Master has an implemented defect, and the 10,000-line/5 MB product choices are not treated as scientific performance results.

## Fixed scope, evidence and assessment counts

The complete original [brief](sources/inputs/frozen/brief.md) and [frozen plan](sources/inputs/frozen/plan.md), all seven F units and all three copied contexts were read. The complete [original research](sources/inputs/authored/research-v1/artifact.md), [critic](sources/inputs/authored/critic-v1/artifact.md), [final](sources/inputs/authored/reviser-v1/artifact.md), their admitted source maps and captured source files were assessed. The research artifact is an exact composite of the discovery and two topic drafts. Its map points to original stage directories; those references were not used to open additional artifacts. The research `sources` directory supplied no additional files. The admitted final's copied discovery/topic/critic captures and the critic's own captures were read instead.

The source copies remain the comparison authority at frozen commit `ab121bf69197ebea81fa726d527062fbf13f9ec5`. Missing adjacent FileSafe, LSP, storage, UI, remote and source-control owners are external boundaries, not inferred whole-project defects. Scope remained the original brief's full declared scope throughout the assessment.

| Assessment domain | Declared | Complete assessments | Assessed | Unassessed |
|---|---:|---:|---:|---:|
| Six axes | 6 | 6 | 6 | 0 |
| O1–O6 | 6 | 6 | 6 | 0 |
| Frozen units/contexts | 10 | 10 | 10 | 0 |
| Owner decisions and product/proof boundaries | 65 | 65 | 65 | 0 |
| Consequential claim/condition checks | 23 | 23 | 23 | 0 |
| Preservation/criticism families | 17 | 17 | 17 | 0 |
| Proposed validation groups | 8 | 8 | 8 | 0 |

“Complete” counts completed assessments, not satisfied obligations. These domains overlap and are not additive. O1/O2/O3/O5 are semantically satisfied; O4/O6 are unsatisfied. Of the 65 owner-decision atoms, 62 are retained directly or by explicit incorporation and three have material defects. Of the 23 consequential checks, 20 are supported or appropriately limited and three are defective. **Material error count: 3 — D01, D02, D03. Unassessed obligations/findings: none.**

The compact status map is [coverage.json](coverage.json). Exact paths, URL/version/commit identities, source ranges, raw-byte hashes and source conclusions are in [source-checks.json](source-checks.json). [Input manifest](sources/input-manifest.json) preserves 27 admitted comparison/preservation files; [public retrieval manifest](sources/public/retrieval-manifest.json) records each independent HTTP capture, access time, headers and SHA-256. Candidate capture Markdown is authored interpretation/locator material, not upstream raw source truth. Independent captures were read to check those interpretations. Hashes establish byte identity, not correctness.

## Material findings and governing conditions

### D01 — A decided survivor condition is presented as unresolved

**Final locations:** lines 67, 71, 110, 146 and 165. The final says a new boundary inherits the nearest existing boundary and requires a still-needed decision for replacement that removes the nearest candidate separator.

**Governing frozen text:** [F-082](sources/inputs/frozen/source/F-082.md), copied lines 19–20 (original `Plans/FileManager.md` 5137–5138), requires insertion/replacement to inherit from the nearest **surviving** existing boundary. Frozen copy SHA-256: `b256763567a9d143c73b15eb40c74718c71a4446d352c184e2f69c81ea74ad5f`.

**Consequential condition:** a replacement removes the originally nearest CRLF, but another existing LF survives. The removed CRLF is already excluded by the accepted criterion. The final drops that qualification and groups the removed-neighbor case with genuinely unresolved choices. It therefore does not faithfully distinguish a decided rule from uncertainty. Distance units, equal-distance ties and a document with no surviving separator can still need clarification; their existence does not make the candidate population undecided when other boundaries survive.

The draft already called this case open (research lines 180, 232), and the critic repeated it (lines 34, 42). The final preserves that criticism disposition but does not correct its interpretation against the actual acceptance criterion. This is a false unresolved disposition, not a claim that a rope seam helper implements the policy.

### D02 — The explicit paste-off exception is not preserved in the proposed policy

**Final locations:** lines 64–69, 110 and validation line 146. The proposed policy unconditionally says a newly inserted newline boundary inherits the nearest existing boundary. It confines optional normalization to inserted paste text, but never states the distinct required outcome when normalization is off.

**Governing frozen text:** [F-082](sources/inputs/frozen/source/F-082.md), copied lines 23–24 (original `Plans/FileManager.md` 5141–5142), explicitly requires normalization-off paste to preserve pasted endings; only newly normalized boundaries under the selected normalization follow the nearest-ending rule. Same frozen-copy hash as D01.

**Consequential condition:** the surrounding file uses LF, a paste contains CRLF, and normalization is off. The accepted outcome keeps pasted CRLF. The final's unqualified new-boundary rule admits an interpretation that changes it to nearby LF even with normalization off. “Only inserted text may change” is a locality constraint; it does not establish the required off-state byte fidelity. Likewise, an on/off validation matrix that only checks locality does not cover that outcome.

The final retains useful no-op/save byte-fidelity checks and forbids whole-buffer normalization. Those are positive findings, but they do not supply the missing transaction condition. This is a material ambiguity/loss in the replacement sections, not an executed corruption result. General “retain F-082 unchanged” labels cannot resolve a narrower explicit policy that omits its governing exception.

### D03 — The hard cap is narrowed to editable buffers

**Final locations:** lines 81–82, 86, 109 and validation line 148. The final describes 5 MB as the hard cap for an editable full buffer and blocks making over-cap full content editable. It leaves the preview byte budget open.

**Governing frozen text:** [text/size context](sources/inputs/frozen/source/text_and_size_context.md), copied line 26 (original `Plans/FileManager.md` 359), limits loading into **any single buffer**, with read-only truncated/system-editor alternatives above cap. Frozen copy SHA-256: `44dad53614033d8660ef892dd559bf83c8c784086f46c3818e383b23b76d66f7`. [F-028](sources/inputs/frozen/source/F-028.md), copied lines 8–10 and 34–46, retains the hard cap/modes and configurable settings. Its copy SHA-256 is `dc6e71c3e801d5352b3a9629a7c0c18fd70e48212e98c7ba46318b7bf77e6e65`.

**Consequential condition:** with the active configured cap at 5 MB, a full or preview backing buffer exceeding it is read-only. The final's editable-only wording does not exclude that load, whereas the frozen rule does. A stricter independent preview budget is a useful optional implementation clarification; it must operate within the already-selected upper bound, not replace an absolute buffer bound with an editable-mode bound.

The proposal keeps the default number, threshold, disabled Load full above cap and visible alternatives. The defect is the predicate's scope, not a numeric increase or a demand to fix absent UI/storage owners. Topic B already compressed the cap into editable loading (research lines 172–176); the critic's retention summary did not catch that distinction. The final repeats it despite claiming all modes/caps were retained.

The assessed final's SHA-256 is `2a08cbdc82ec56955024600f106908f232e11d9cec35a3d76686b11547e038e8`. The line locations above refer to those exact frozen authored bytes, preserved under `sources/inputs/authored/reviser-v1/artifact.md`.

## Six-axis assessment

### 1. Original obligations and owner scope

| Obligation | Outcome and evidence |
|---|---|
| O1 | Satisfied semantically. Research lines 11–33 investigate working-copy/recovery analogy, an external-write history, watcher loss, save mechanisms, representation alternatives and a conditional Slint lead. Final sections 2–3 and 7 preserve this bounded useful discovery. No chronological/source-selection authentication is inferred from the source-map counters. |
| O2 | Satisfied. Actual Ropey 1.6.1 source at the immutable package commit, its governing tree/feature definitions, builder caller and edit/index APIs were independently inspected; see S01–S06. Documentation alone was not substituted for code. |
| O3 | Satisfied. The pertinent Zed issue, actual merged fix, governing `File`/`DiskState`/dirty definitions and undo caller, added regression source and released commit presence were checked; see S08–S10. Ropey's changelog remains an explicitly incomplete secondary history lead. |
| O4 | Unsatisfied. All ten scope inputs and all 65 decision atoms were compared; D01–D03 prevent a correct complete comparison. Other retained/optional/rejected/uncertain dispositions were assessed, not presumed satisfactory from the table labels. |
| O5 | Satisfied semantically. Complete substantive critic content and its dispositions are visible in the final; 17 preservation families are assessed below. Family identity/actual operational independence are host-authentication fields and were not inferred from prose or lifecycle receipts. This does not excuse the critic's carried-forward contract misreadings. |
| O6 | Unsatisfied. The final really contains coherent replacement sections, rationale, options, retained/rejected matters, critique response, eight validation groups and uncertainty. It is more than a patch outline or critique, but the replacement's three material condition errors prevent complete fidelity. |

All seven F units retain accepted status/owner boundaries; no crate or detector is selected and no new runtime/build authority is claimed. Product definitions including redb/seglog, detailed restore/offline contracts, read-only Save blocking, exact UI defaults and metadata/source lineage are credited where the final explicitly incorporates the copied contexts. I do not demand redundant verbatim restatement of each unchanged clause. The 35 “retained by incorporation” atoms below identify that basis rather than pretending the final independently reproduces all exact tokens. The three explicit weakened/misclassified conditions still conflict with its retention claims.

### 2. Consequential claims, governing code and version conditions

S01–S20 in `source-checks.json` are the complete assessed non-defect claim families. Their decisive independent evidence is:

| Checks | Checked result and precise primary evidence |
|---|---|
| S01–S02 | Ropey package version and pin agree. `Rope` is a derived-clone `Arc<Node>` tree; cloning shares data, and edits use copy-on-write. General complexity is correctly attributed to project documentation; arbitrary insertion additionally depends on inserted length M. [Cargo.toml](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/Cargo.toml), raw saved lines 1–18; package VCS metadata saved lines 50–55; [rope.rs](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/src/rope.rs), 17–84, 334–357; `tree/node.rs` 13–21, 94–109. |
| S03–S04 | `from_reader` validates bytes and builds through `RopeBuilder`; `write_to` sends chunk bytes through `write_all`, with no rollback or file transaction. Partial-output failure is documented and visible in code. Same `rope.rs` 107–222; saved builder 189–245. |
| S05–S06 | CRLF/scalar seam checks are governed by helpers and builder callers; default `unicode_lines` implies `cr_lines`, and scalar/byte/UTF-16 conversion APIs exist. Slices can still split CRLF. [crlf.rs](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/src/crlf.rs) 1–24, 97–150; [builder](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/src/rope_builder.rs) 202–222; Cargo 14–18; `str_utils.rs` 7–22; `lib.rs` 119–150; `rope.rs` 620–728. A UTF-16 position inside a surrogate pair maps to its scalar, so a round-trip witness needs valid-boundary conditions. |
| S07 | [Pinned changelog](https://github.com/cessen/ropey/blob/d41ee247f2f097c7f9c8e4730b7dd884734f1ee5/CHANGELOG.md) 22–31 records the 1.5.1 CRLF-slice count fix. The final rightly stops short of specific issue/test ancestry. |
| S08 | [Zed #48697](https://github.com/zed-industries/zed/issues/48697) and [PR #51037](https://github.com/zed-industries/zed/pull/51037) establish the report and merge. At `50aef1f115493aab506df9d5b33da5435dc36bfc`, `buffer.rs` 384–398, 429–455, 1674–1707, 2348–2388, 2847–2876, 3131–3143 establish the governing file/dirty state, suppressed notification and undo caller. This compares last-known file metadata, not fresh filesystem IO. |
| S09–S10 | [Merged regression source](https://github.com/zed-industries/zed/blob/50aef1f115493aab506df9d5b33da5435dc36bfc/crates/project/tests/integration/project_tests.rs) 5690–5757 uses FakeFs and asserts external content/clean state after undo. [Release](https://github.com/zed-industries/zed/releases/tag/v0.229.0) identifies `7c07887d9555953bca7fe78417602114092ef8c8`; its [immutable buffer source](https://github.com/zed-industries/zed/blob/7c07887d9555953bca7fe78417602114092ef8c8/crates/language/src/buffer.rs) 2857–2886 retains the fix, and its regression is at 5781–5848. Tag-addressed and commit-addressed captures match. The release page need not list #51037: released code, not the draft's redirecting release-note claim, establishes inclusion. This does not establish the first fixed release. PR saved text 163–169 reports 28 checks; none were run here. |
| S11 | [notify 8.2.0](https://docs.rs/notify/8.2.0/notify/) saved text 127–160 supports NFS no-event and large-watch-set loss conditions, editor save/replacement differences and polling/content comparison options. Those are conditions, not a universal detector choice or proof that an old issue is a current defect. |
| S12–S13 | [tempfile 3.27.0 TempPath](https://docs.rs/tempfile/3.27.0/tempfile/struct.TempPath.html) saved text 160–178 distinguishes atomic replacement from synchronization. [Rust rename](https://doc.rust-lang.org/std/fs/fn.rename.html) saved text 1–33, [Permissions](https://doc.rust-lang.org/std/fs/struct.Permissions.html) 46–69 and [File::create](https://doc.rust-lang.org/std/fs/struct.File.html#method.create) 172–175 support the stated platform/permission/truncation limits. Live captures identify std 1.99.0 (`b940084d7`, 2026-09-28). |
| S14–S16 | [VS Code Working Copies](https://github.com/microsoft/vscode/wiki/Working-Copies), saved text 90–124, supports the lifecycle analogy. [Slint #8147](https://github.com/slint-ui/slint/issues/8147), 99–127, is a Windows/1.10 TextEdit report with wrap/key-handler context, not a current PM defect. [crop README](https://github.com/nomad/crop), raw 12–28, 143–154, supports byte/B-tree/sharing/LF–CRLF claims as an unpinned lead. [String](https://doc.rust-lang.org/std/string/struct.String.html#method.insert), saved text 921–944, and [Emacs gap description](https://www.gnu.org/software/emacs/manual/html_node/elisp/Buffer-Gap.html), 3–11, support the limited alternative tradeoffs. No benchmark ranking follows. |
| S17–S20 | Full frozen/source-to-final comparisons support the proposed dirty-to-clean edge, most owner uncertainties, criticism corrections and honest execution separation. Exact admitted-file locations are recorded per check. They do not establish runtime correctness or repair D01–D03. |

The raw Rust source files were captured as data and not executed. The API returned rate limits for three metadata requests; HTML release/Slint captures and commit-addressed source supplied successful primary alternatives. These retrieval failures leave no scientific scope item unassessed. Mutable wiki/README/live-doc captures have retrieval timestamps and remain analogies or versioned documentation rather than pinned implementation claims.

### 3. Bounded discovery, mechanisms, alternatives and opportunity coverage

Discovery usefully reaches beyond the frozen plan: working-copy versus view lifecycle, dirty external change followed by undo, missed/replacement events, direct versus staged save, atomic visibility versus durability, rope storage versus rendering, offset adapters, preview byte budgets and a conditional native-control failure lead. Useful negatives survive: watchers do not establish disk truth; conditional mtime is not universal identity; a rope clone is not durable recovery; safe CRLF seams do not implement nearest-ending insertion; large-text capacity is not a Slint responsiveness result.

The final keeps String, gap buffer, crop, piece-table and file-backed/mapped categories visible without ranking them. Only Ropey is a pinned inspected representation candidate. The other named categories are not treated as selected implementations, exhaustive discovery or completed benchmarks. Direct target writes and same-directory stage/replace remain options for the named save/storage owners. The evidence supports useful additional validation without changing Rust + Slint or accepted user modes. Recovery persistence/platform/UI applicability remain bounded unresolved dependencies; their omission from the slice is not counted as a defect.

This is useful bounded opportunity coverage, not exhaustive recall. I do not certify that all possible architectures, issue histories, integrity hardening or UI opportunities were discovered.

### 4. Rejections, corrections and already-covered/uncertain dispositions

The final's already-covered dispositions are generally precise at the unit/context level: F-008/shared authority, F-018/failure state, F-020/local-versus-remote recovery, F-026/Save-focus combined prompts, F-027/UTF-8 and visible reasons, F-028/visible modes and F-082/byte preservation are all present in the actual copies. The working-copy analogy and code mechanisms support compatibility without claiming equivalence to a third-party API. Missing neighboring owners are correctly treated as dependencies.

Rejecting universal mtime truth, complete watcher-event assumptions, durability from rename/persist, automatic threshold increases and crate selection from descriptions is warranted in the stated form. These rejections do not forbid owner-selected conditional mtime, polling or a rope. The dirty-to-clean test is an addition, not an assertion that the existing combined prompt is wrong. Malformed source and release locators are corrected without treating a merged fix as automatically shipped.

D01 is the material incorrect uncertainty disposition: the surviving candidate set is already governed. D02 and D03 are supposedly retained decisions compressed into weaker/ambiguous conditions. Legitimate tie/distance/no-survivor, encoding/BOM, alias, durability/metadata and stricter preview-budget questions remain open. “Threshold precedence” cannot permit bypassing the already-stated single-buffer cap; similarly, unresolved implementation choices cannot excuse paste-off or survivor fidelity.

### 5. Preservation through draft, critique and final

The entire original research composite, critic and final were compared. The following 17 families account for the critic's source table, complete owner comparison, cross-topic findings and downstream deliverable obligation. Retention does not mean that a carried-forward interpretation is correct.

| ID | Draft/criticism family | Critic lines | Final disposition/locations | Assessment |
|---|---|---|---|---|
| P01 | Ropey malformed immutable locator | 22 | Corrected commit and all implementation links, 129/171 | Preserved correction |
| P02 | Redirecting Zed release locator; actual release inclusion | 16/22 | Tagged/released source plus release record, 48/130/133/172 | Corrected basis preserved; no reliance on moving release route |
| P03 | Default unicode_lines implies cr_lines | 14 | Explicit default CR recognition, 92/131 | Preserved correction |
| P04 | Ropey 1.5.1 history lacks exact issue/test lineage | 15 | Limited history only, 132 | Preserved uncertainty |
| P05 | Zed dirty-to-clean condition, present file/mtime, upstream checks, no PM reload adoption | 16/31/41 | 42–48/107/133/143/150 | Conditions and optional test preserved |
| P06 | Watcher loss/replacement, polling and fingerprint options; old issue is not current proof | 17/41/44 | 42–44/143/167 | Preserved options/limits |
| P07 | Direct versus staged save, metadata/links, platform scope, durability and TOCTOU | 18/29/41/44 | 27–36/105/142/165/167 | Preserved options/limits |
| P08 | Working-copy/backup analogy rather than product API | 19/41 | 98/156/173, supported recovery/authority sections | Preserved as a compact linked analogy |
| P09 | Slint Windows/1.10 lead; app version/control applicability unknown | 19/45 | 98/165/173 | Preserved limited lead |
| P10 | Unranked String/crop/gap/piece/mapped options; only Ropey code pinned | 20/44–45 | 92–98/167 | Preserved alternatives and no-benchmark limit |
| P11 | Shared transactions, save/recovery truth, history/remote boundaries | 28–32/35–37 | 15–58/104–113/141–144 | Preserved directly or by incorporation |
| P12 | Cross-topic same-authority, no snapshot dirty fork, no silent recovery overwrite, no UI/storage proof | 43–45 | 115–123/137–150 | Preserved seams and proof limits |
| P13 | Encoding/BOM/index/adapter clarifications and exact-byte checks | 32/35/42 | 62–74/145–147/165 | Preserved proposals/unknowns |
| P14 | F-082 complete required policy and purportedly open neighbor cases | 34/42 | 64–71/110/146/165 | Carried forward with material D01/D02; not a satisfactory retained-policy disposition |
| P15 | F-028 product limits/modes and boundary measurements | 33/42 | 75–88/109/148/165 | Visible modes/values preserved, absolute cap scope lost: D03 |
| P16 | Proposals versus executed upstream/local checks; no app validation | 58–62 | 137–150 | Preserved attribution and execution limit |
| P17 | A downstream final must be coherent complete owner proposal, not the critic itself | 56 | Full authored sections, 13–175, including critique response | Deliverable structure supplied; substantive fidelity still fails O4/O6 |

The final visibly responds to all seven bullets in its critique-response section. There was no ignored explicit objection demanding an implementation selection or current PM defect claim. The principal preservation problem is accepted overcompression of conditions, partly already present in draft/critic prose; it cannot be dismissed merely because the reviser faithfully copied them.

### 6. Proposed versus executed validation and witness applicability

All eight final validation groups were assessed:

1. Shared panes/preview authority and typed transaction/undo/restore seams: useful and product-compatible; adjacent mutation owners remain dependencies.
2. Save failure injection: useful after the actual protocol is chosen; disk-visible bytes/cleanup/durability are separate from dirty state. No failure experiment was executed.
3. External-change matrix: useful in-place/replacement/deletion/event-loss/race and dirty-to-clean scenarios; the Zed FakeFs test does not validate these real platforms.
4. Recovery: useful local/remote dirty recovery, exact banner and destination-success boundary; corruption expectations depend on storage decisions.
5. Raw ending bytes: useful no-op/edit/save/reopen/CRLF/LF/CR/seam/Unicode cases; rendered line counts are insufficient.
6. F-082 insertion/paste matrix: incomplete outcome predicates for D01/D02. The accepted survivor and paste-off conditions are not future owner choices.
7. Encoding/index adapters: useful malformed/BOM/non-BMP/combining/IME/clipboard/LSP/Slint cases after classifications/index contracts are chosen. Round trips need scalar/code-unit boundary preconditions; conversions alone are not a UI witness.
8. Large-file boundaries: useful line/cap/long-first-line/Load full/renderer-memory measurements; its full acceptance oracle must preserve the any-buffer cap identified in D03.

No candidate PM test, build, benchmark or application run is claimed. The admitted maps and artifacts consistently describe proposals; I did not infer actual execution merely from them. The independently inspected upstream test source establishes what FakeFs assertions target, and the PR reports passing checks. Neither was executed by this reviewer, neither supplies a PM application witness, and code inclusion in a released Zed commit does not transfer its automatic reload or mtime policy to Rust + Slint.

## Full owner-decision inventory

The 65 rows below explicitly enumerate the assessed obligation/boundary atoms. Source locators are copied-file lines under `sources/inputs/frozen/`; `plan.md` maps each copy to original `Plans/FileManager.md` ranges. Detailed machine rows are in `source-checks.json:owner_decision_checks`.

| ID | Decision/boundary assessed | Frozen locator | Final lines | Disposition |
|---|---|---|---|---|
| B01 | Rust + Slint product boundary; no removed Iced app | brief.md:16-18 | 7, 9, 98 | retained |
| B02 | Read-only proposal, no canon/WorkNodes/runtime/readiness authority | brief.md:70-75; F-082.md:35-44; all seven unit acceptance/compile metadata | 3, 7-11, 135, 150 | retained_by_incorporation |
| A01 | One buffer/path; edits remain in memory until Save | definitions_and_transactions.md:3; F-008.md:8-10 | 17-19 | retained |
| A02 | Per-group tab identity, active tab/group lists, shared global model | definitions_and_transactions.md:4-5; text_and_size_context.md:3; F-026.md:8-10 | 17, 104, 111 | retained |
| A03 | Dirty compares memory with last-saved content, not current disk | definitions_and_transactions.md:6; text_and_size_context.md:4 | 17, 27, 42, 107 | retained |
| A04 | Preset definition remains language/framework run/debug configuration | definitions_and_transactions.md:7 | 11, 111 | retained_by_incorporation |
| A05 | redb remains selected durable settings/session/project/editor store | definitions_and_transactions.md:8; text_and_size_context.md:26 | 11, 58, 83, 111-113 | retained_by_incorporation |
| A06 | seglog remains canonical append-only ledger; editor analytics events optional | definitions_and_transactions.md:9 | 11, 111 | retained_by_incorporation |
| A07 | FileSafe remains agent patch/apply/verify guards, adjacent owner | definitions_and_transactions.md:10,27; F-008.md:52-56 | 19, 21, 123 | retained |
| A08 | Every named mutation source enters typed transaction before state changes | definitions_and_transactions.md:14; F-008.md:8-10 | 17-19, 56, 104, 141 | retained |
| A09 | Read-only/write-lock/active recovery replay constrain user and preview mutation | definitions_and_transactions.md:16 | 19, 25, 62, 111, 141 | retained_by_incorporation |
| A10 | Agent/FileSafe/LSP paths record operation class and do not merge user undo | definitions_and_transactions.md:17 | 19, 104, 111, 141 | retained_by_incorporation |
| A11 | Restore/recovery confirmation/context, applied-version authority and undo explanation | definitions_and_transactions.md:18 | 19, 56, 104, 111, 141 | retained_by_incorporation |
| A12 | One dirty/saved version/save-retry authority across panes and mutation flows | definitions_and_transactions.md:19; F-008.md:36-41 | 17-19, 27, 117-120 | retained |
| A13 | Typing/paste/delete, preview patches, LSP/FileSafe, restore, disk resolution, agent stream source classes | definitions_and_transactions.md:20 | 19, 104, 111, 141 | retained_by_incorporation |
| A14 | No new restore/dirty branches or bypass; quit/later recovery; legacy unsaved-content alias | definitions_and_transactions.md:20; F-008.md:50-51 | 17-19, 52, 104, 111 | retained_by_incorporation |
| A15 | Undo/restore/git histories remain distinct; runtime safe points are not restore points | definitions_and_transactions.md:21; F-008.md:46-49 | 19, 104, 111, 141 | retained_by_incorporation |
| A16 | In-place single-buffer preview/LSP group eligibility; multi-file/rename/hunk/repo/conflict broader flow | definitions_and_transactions.md:22 | 19, 104, 111, 141 | retained_by_incorporation |
| A17 | Assistant one-file undo group; multi-file receipt and one undo/file; no global Ctrl+Z | definitions_and_transactions.md:23 | 19, 104, 141 | retained |
| A18 | Stage/unstage/discard are git; conflict choices edit result until resolve/stage | definitions_and_transactions.md:23 | 19, 104, 111, 141 | retained_by_incorporation |
| A19 | Tree/targets, previews and diff share source authority; SSH changes capabilities, not buffer model | definitions_and_transactions.md:24 | 17-21, 104, 111, 117-123 | retained |
| A20 | Accessibility/IME/selection/caret/clipboard/drift/paste/wrapper/input acceptance | definitions_and_transactions.md:25 | 73, 111, 147 | retained_by_incorporation |
| A21 | Normal/truncated/load-full/too-large/binary/decode/disk-read-only/degraded effective modes | definitions_and_transactions.md:25 | 25, 62, 75-88, 111, 147-148 | retained |
| A22 | Named adjacent owner contracts/owner hints are dependencies; absence not a whole-project defect | definitions_and_transactions.md:27; editing_and_save_context.md:8,14,23; F-082.md:45-48 | 21, 58, 104-113, 123, 134 | retained_by_incorporation |
| A23 | Orthogonal dirty/conflict/read-only/degraded/change/write-lock/stale/error/recovery facts | F-018.md:8-10; editing_and_save_context.md:6 | 25, 105, 119-120 | retained |
| A24 | Explicit Save and visible success feedback; no auto-save | editing_and_save_context.md:4,6; text_and_size_context.md:17 | 25-27, 38, 62, 105, 112 | retained_by_incorporation |
| A25 | Failure retains buffer/dirty/prior saved state; disk/permission/path/read-only/remote reason and Retry/Save As | editing_and_save_context.md:4; F-018.md:8-10,46-47 | 27, 105, 142 | retained |
| A26 | Per-tab dirty indicator plus other stable shell location under crowded strip | editing_and_save_context.md:5-6 | 38, 112 | retained_by_incorporation |
| A27 | Chat/tree/quick-open OpenFile callers converge on common open path | editing_and_save_context.md:6 | 11, 112 | retained_by_incorporation |
| A28 | Backend recovery/history refresh via BufferReverted events | editing_and_save_context.md:6 | 19, 38, 112, 141 | retained_by_incorporation |
| A29 | Disk Revert distinct from chat-owned cmd.chat.revert; editor never fabricates restore | editing_and_save_context.md:10 | 19, 38, 112, 141 | retained_by_incorporation |
| A30 | Omitted target_message_id selects latest mutating assistant turn; full-turn multi-file restore and refresh | editing_and_save_context.md:11 | 19, 38, 112, 141 | retained_by_incorporation |
| A31 | Restore to/History fetch backend restore points; editor/document pane use same pipeline and create none | editing_and_save_context.md:12 | 19, 38, 112, 141 | retained_by_incorporation |
| A32 | Required MVP recovery for local and remote-backed buffers | F-020.md:8-10; editing_and_save_context.md:16,21 | 52-58, 106, 144 | retained |
| A33 | Remote recovery is local unsaved memory; exact banner, never remote write receipt | F-020.md:36-42; editing_and_save_context.md:17-18 | 52-56, 106, 144 | retained |
| A34 | Reconnect or destination revalidation before remote Save/flush success | editing_and_save_context.md:19,21,29; F-020.md:8-10 | 56, 106, 144 | retained |
| A35 | Remote editing MVP does not imply remote terminal/run-debug availability | editing_and_save_context.md:20; F-020.md:43-46 | 11, 38, 112 | retained_by_incorporation |
| A36 | Exact Work offline (cached files only); validated cached snapshot; old label compatibility only | editing_and_save_context.md:27 | 38, 112 | retained_by_incorporation |
| A37 | No cache means disabled/no-cached-files state; no full-project offline implication | editing_and_save_context.md:29 | 38, 112 | retained_by_incorporation |
| A38 | Connected/reconnecting/unavailable/pending/read-only states; retain buffers; block unconfirmed round-trips unless queued | editing_and_save_context.md:31 | 38, 112 | retained_by_incorporation |
| A39 | Disconnected listings/search/diff/git/shell/LSP/write unavailable or pending, never fake-live | editing_and_save_context.md:31 | 38, 112 | retained_by_incorporation |
| A40 | Dirty disk-Revert confirmation Discard/Cancel; reload clears dirty | text_and_size_context.md:5; F-026.md:8-10,37-40 | 11, 19, 38, 107, 113, 141 | retained_by_incorporation |
| A41 | Save before overwrite and editor/window/tab focus checks; not every keystroke | text_and_size_context.md:7; F-026.md:8-10,41-49 | 42, 107, 143 | retained |
| A42 | Single combined dirty+changed prompt Reload/Overwrite/Cancel and Show diff; no two dialogs | text_and_size_context.md:7; editing_and_save_context.md:6; F-026.md:41-49 | 38, 42, 46, 107, 143 | retained |
| A43 | Per-buffer undo/redo; Ctrl+Z/Ctrl+Shift+Z or Ctrl+Y; no cross-file undo | text_and_size_context.md:11; F-027.md:35-38 | 19, 62, 108, 141 | retained_by_incorporation |
| A44 | Copy/Cut/Paste keyboard/context menu/system clipboard; optional paste normalization | text_and_size_context.md:12; F-027.md:39 | 62, 68, 108, 147 | retained_by_incorporation |
| A45 | Code wrap off by default, optional toggle; monospace/theme or editor font settings | text_and_size_context.md:13-14; F-027.md:8-10 | 62, 108, 113 | retained_by_incorporation |
| A46 | UTF-8 editable; invalid decode read-only with reason until external repair/revert | text_and_size_context.md:15; F-027.md:40-41 | 62, 108, 147 | retained |
| A47 | Preserve CRLF/LF/CR; explicit Save only; no auto-save | text_and_size_context.md:16-17; F-027.md:8-10,46-48 | 62, 64-69, 108, 145 | retained |
| A48 | Binary read-only with clear reason; no hex view MVP | text_and_size_context.md:18; F-027.md:43,48 | 62, 108, 147 | retained |
| A49 | OS/Git read-only indicator/reason, block Save, allow Save As; no metadata bypass | text_and_size_context.md:19; F-027.md:44-45 | 25-27, 62, 108, 113, 142 | retained_by_incorporation |
| A50 | Configurable 10,000-line default, settings editor labels/ranges and redb persistence | text_and_size_context.md:25-26; F-028.md:8-10,34-43 | 79, 83, 109, 148 | retained_by_incorporation |
| A51 | Above line threshold truncated read-only by default; explicit full load subject to active cap | text_and_size_context.md:24-25; F-028.md:8-10 | 80, 86, 109, 148 | retained |
| A52 | Active 5 MB hard cap is an absolute single-buffer load cap, not editable-only | text_and_size_context.md:26; F-028.md:8-10 | 81-82, 86, 109, 148 | material_defect D03 |
| A53 | Above cap File too large to edit, View read-only (truncated), Open in system editor | text_and_size_context.md:26; F-028.md:34-41 | 82, 86, 109, 148 | retained |
| A54 | Read-only virtualized editing not MVP unless needed; no threshold changes from library capacity | text_and_size_context.md:24; F-028.md:45-46 | 84, 94, 109, 167 | retained |
| A55 | Insertion/replacement inherit nearest surviving existing boundary per new newline | F-082.md:19-20 | 67, 71, 110, 146, 165 | material_defect D01 |
| A56 | Surviving CRLF/LF/CR boundaries outside edit remain exact bytes | F-082.md:9-11,19-22 | 66, 68-69, 110, 121, 145 | retained |
| A57 | No-op Save preserves entire ending sequence; local edit Save changes no surviving outside boundary | F-082.md:21-22 | 66-69, 110, 121, 145 | retained |
| A58 | Paste normalization OFF preserves pasted endings | F-082.md:23 | 67-68, 110, 146 | material_defect D02 |
| A59 | Paste normalization ON follows nearest policy for new normalized boundaries and never surrounding buffer | F-082.md:23-24 | 67-68, 110, 146 | retained |
| A60 | F-082 changes no shared undo, explicit Save, failed-save dirty state, encoding or FileSafe authority | F-082.md:25-26 | 19, 25-27, 62-69, 104-110, 117-123 | retained |
| A61 | F-082 dependencies/owner hints retained; no runtime/event/storage/activation/readiness proof | F-082.md:14-16,35-48 | 3, 11, 21, 123, 150 | retained_by_incorporation |
| A62 | All seven accepted units owner/classification/risk/dependency/metadata stay frozen; no conversion or compilation claim | all seven unit metadata | 3, 11, 100-113, 135, 150 | retained_by_incorporation |
| A63 | Source lineage, exact tokens/negatives/compatibility and static validation references stay available; no gate commands executed | all seven unit acceptance/source-lineage/validation metadata; plan.md | 3, 11, 100-113, 150 | retained_by_incorporation |

## Blinding and operational limits

Admitted paths visibly identify the arm, and the composite/topic/critic/reviser structure and method-specific prose can reveal procedure. Source maps exposed lifecycle/Goal identifiers, timing, counters and quota/accounting assertions; those fields were ignored for scientific judgment. No other-arm output/grade, expected winner, cost/speed targets, parent analysis, evaluator answers, campaign state, locks, selection material or other reviews were consulted. This is no comparative judgment.

Only admitted source/preservation inputs and current public primary data were used. No children, extra graders, new review round or native Goal was created. No candidate feedback was sent, no source input/canon/repository was edited, and no account/infrastructure operation, installer or downloaded-code execution occurred. All written files are under the assigned review directory.

Provider/family authentication, delivery identity, lifecycle state, elapsed time/quota compliance and billing are not scientific evidence of source correctness. Distinct unknown usage and billing fields are `null`; no cost is invented. The grade is not inferred from source-map hashes, exit codes, delivery or terminal identity.

**Disposition:** complete semantic assessment saved. FAIL follows from three material authored-policy/comparison defects after full-scope assessment, despite supported primary mechanisms/history and mostly preserved criticism. No rewritten candidate answer or case-specific rescue is proposed.
