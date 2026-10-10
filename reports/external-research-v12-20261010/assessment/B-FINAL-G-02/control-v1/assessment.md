# ER12 B-FINAL-G-02/control — independent bounded finalization review

**Source judgment: FAIL.** One material finding affects the expressly assigned criticism-adjudication axis: the deliverable rejects valid critique item 5 while its reason and replacement section endorse that critique. The replacement section's Git behavior is otherwise supported. Delivery passes; all assigned semantic axes were assessed. This is a bounded Track B FINAL judgment, not full-pipeline qualification, a cross-arm comparison, or an ER11 rescore.

Reviewer: `codex-er12-bfinalg02-review-10681257`. Authority: the user's exact review assignment and FULL [RUBRIC-v1.md](ER12_RUNTIME/assessment/RUBRIC-v1.md). The reviewer created one actual native Goal at 2026-10-10T05:26:06Z; its [activation response](reviewer-native-goal-activation.json) is saved. This judgment is saved before completing that Goal. No delegation, candidate contact/repair, account operations, Git operations, publication, other-arm inspection, shared roster inspection, or history inspection occurred. Only this reviewer's own pm-mail inbox was checked.

## Material finding F1: wrong disposition of valid critique 5

The frozen common [assignment, line 33](ER12_RUNTIME/runs/B-FINAL-G-02/inputs/assignment.md:33) asks: “Remove --depth=1 to satisfy history_policy=full; explain recovery without discarding user changes.” O4 and O5 (lines 14–15) independently require full commit history and safe recovery. The required output at line 37 expressly requires an accept/reject/qualify disposition, reason, and primary citation for every critique.

The candidate's [final-section.md, line 21](ER12_RUNTIME/runs/B-FINAL-G-02/control/stages/role/final-section.md:21) instead says: “5. **Reject.** Removing `--depth=1` is required by `history_policy=full`; retain complete history and explain its distinction from working-tree sparsity.” There is no source-backed reason to reject either component of critique 5. The stated reason endorses its depth correction; the section at lines 7 and 9 actually preserves full history and safe recovery.

Independent governing evidence: the [Git v2.43.0 clone documentation, lines 245–250](https://github.com/git/git/blob/v2.43.0/Documentation/git-clone.txt#L245-L250) defines depth as history truncation. The [Git v2.43.0 sparse-checkout documentation, lines 99–116](https://github.com/git/git/blob/v2.43.0/Documentation/git-sparse-checkout.txt#L99-L116) documents recovery after affected paths are handled; lines 163–172 and 326–334 identify the ignored-file deletion condition. Local inspected copies are [P4](primary/git-clone-v2.43.0.txt) and [P3](primary/git-sparse-checkout-v2.43.0.txt).

This finding is material to the assigned adjudication output: an explicit rejection of a valid correction is a wrong decision on one of the six required items, rather than a locator or incidental prose issue. Its scope is narrow. It does **not** establish that the revised helper uses shallow history or discards work; the replacement section endorses the correct behavior. The contradictory label and reason prevent a correct complete adjudication. No second material source error or obligation omission was identified. The original assessment stands independently; any later dispute disposition belongs in a separate artifact.

## Original obligations and delivery

| Obligation | Assessment | Exact candidate locator and basis |
| --- | --- | --- |
| O1: title, Git 2.43, one disposable clone, cone mode | PASS | Lines 1 and 3 name the exact section and target, specify one clone, and give a cone-mode selection example. P3 lines 43–71 and P4 lines 174–178 support the operations. |
| O2: exact tokens | PASS | Line 3 preserves `selected_dir=packages/editor`, `history_policy=full`, and `network_budget=unproven` verbatim. |
| O3: inclusions and ancestor files | PASS | Line 5 includes the selected subtree, root files, and immediate files in `packages/`, without recursively including other sibling directories. P3 lines 63–71, 308–324, and 377–415 support this. |
| O4: sparse/partial/shallow distinction; full history | PASS | Line 7 distinguishes working-tree selection, requested blob filtering, and history truncation; it omits shallow options. P4 lines 174–188 and 245–268 support the distinctions. Avoiding single-branch is conservative branch-coverage preservation; it is not described as itself a shallow option. |
| O5: reapply/disable and local-work safety | PASS | Line 9 inspects tracked edits, conflicts, untracked and ignored files, preserves affected work or stops, and retains both recovery commands. P3 lines 99–116, 163–172, and 326–334 support the relevant conditions. |
| O6: three prospective checks, diagnostics, unmeasured limits; no real-repository alteration | PASS | Lines 3, 9, 11, and 13 limit the design to the disposable clone, retain failure diagnostics, specify three prospective checks, and disclaim executed checks and measured transfer/runtime. No execution is inferred. |

The complete replacement is 582 whitespace-separated words including its title (577 excluding the five title tokens), within 400–650. The entire deliverable is 748 words, below 1100. It is a standalone replacement, followed by six numbered dispositions and a remaining-uncertainty statement. Delivery is **PASS**, independently of F1.

## Critique adjudication

| Item | Candidate | Independent assessment |
| --- | --- | --- |
| 1 | Accept | Correct; P3 lines 63–71 and 308–324 support ancestor-level inclusions. |
| 2 | Accept | Correct; P4 lines 174–188 distinguish sparse checkout and object filtering. A selected-file-size network cap does not follow from either documented mechanism. |
| 3 | Reject | Correct; P4 lines 245–250 contradict retaining depth 1 under the frozen full-history obligation. |
| 4 | Reject | Correct; P3 lines 99–107 and 186–196 expressly allow out-of-cone materialization and document reapply. |
| 5 | Reject | **Incorrect; F1.** Its proposed correction agrees with O4/O5 and the primary evidence. The candidate's reason and body agree with the critique despite the rejection. |
| 6 | Reject | Correct; P3 lines 78–91 identify optional index representation/performance and compatibility concerns, while P4 lines 180–188 identify the separate network-object filter. Mandatory sparse index cannot supply the promised network prohibition. |

## Factual applicability, scope preservation, discoveries, and alternatives

The sources govern Git's working-tree population, object-transfer requests, commit-history depth, and index representation as distinct subjects. Directory recursion and immediate ancestor-file inclusion use paths/files as their domain; neither specifies transferred-byte or elapsed-runtime units. Merge/rebase conflicts and unstaged changes explain why reapply is conditional rather than an unconditional cleanup guarantee. Ignored-file removal occurs for an out-of-cone directory without tracked or nonignored untracked files remaining; nonignored untracked files instead prevent deletion and cause a warning. The candidate's broad warning and inspect/preserve-or-stop policy encompass that condition without promising automatic safety.

Submodule population is a separate state: P3 lines 444–472 support the candidate's line 5 caveat that selection changes do not automatically initialize/deinitialize submodules. Consequently, the file-set oracles must respect submodule state; the final already records that exception. This is not an obligation to deploy or initialize unspecified submodules.

Version applicability was independently checked. The official [2.42.0 sparse-checkout manual](https://git-scm.com/docs/git-sparse-checkout/2.42.0) lists no manual changes from 2.42.1 through 2.51.1, covering 2.43. The reviewer also retrieved the exact v2.43.0 upstream documentation (P3), rather than relying solely on that history. The [2.43.0 clone manual](https://git-scm.com/docs/git-clone/2.43.0) and exact-tag upstream source (P4) agree on the governing options. A documentation no-change interval is evidence of manual applicability, not proof of unchanged implementation or measured compatibility.

Useful bounded discoveries retained in the final include the ignored-file deletion risk, separate submodule initialization, and optional sparse index. Useful alternatives are differentiated: a partial-clone filter may defer initial blob transfer while retaining commit history; shallow history is incompatible with the accepted policy; sparse index concerns optional command/index performance. There is no requirement to switch away from the originally mandated cone mode or enable filtering/indexing. The candidate does not supply a implementation-history investigation, but this FINAL assignment does not require one; its target-version manual history and prospective compatibility caveat meet the bounded need.

Supported draft meaning is preserved: one disposable clone, exact choices, selection safety, reapply/disable, failure status/path diagnostics, readiness gating, the three prospective checks, and the need for actual transfer/recovery evidence. The original draft's three false mechanisms—only-selected materialization, an automatic byte bound, and full history via depth 1—are corrected. F1 does not erase those successful corrections. Factual applicability and supported-scope preservation each **PASS**.

## Proposed versus executed checks

Line 11 proposes three meaningful discriminators: compare the materialized tracked set against cone inclusions; exercise a preserved local edit and merge-like out-of-cone materialization followed by reapply; and disable sparsity and compare with the complete tracked tree. It requests path/status/exit/command diagnostics. These address inclusion, local-work protection, recovery, and return to full checkout. The proposed recovery scenario is an outline, not an executable fixture; that is appropriate to this bounded writing role.

The final and source map expressly say none were executed. Candidate source retrieval is not Git validation. Actual Git 2.43 compatibility, data safety, byte transfer, and runtime remain unverified. No deployment, real-repository change, or executed benchmark was required. No additional failure is assigned for not performing prospective checks. This axis **PASS**.

## Frozen integrity and primary evidence

FULL reads covered the rubric, role input-map/assignment/freeze, shared assignment, fixture, manifest, all corpus members, authored final, source map, and every actual member of `sources/` (discovered by directory enumeration). Candidate activation/completion receipts and the root terminal freeze were also read. [inspected-hashes.json](inspected-hashes.json) records SHA-256 and byte counts for all inspected local inputs/science/provenance. All inspected entries covered by the input or terminal freezes match, including:

| Science artifact | SHA-256 |
| --- | --- |
| final-section.md | `b4d525027019c2694cd6c2f1144152fe53d9a8923a4b1239693ac8f1251b26af` |
| source-map.json | `94e4f2ab0878958ae5a3542b41b1fa00ba77ff5eed3c1161df05df3d67a43aab` |
| sources/git-clone.md | `3a7f3101f4117ae1b14bd958a8b7cdb99d879e5d17399f23c9a2f39462aa72ac` |
| sources/git-sparse-checkout.md | `482686b1c0e8ffac70ebc3df471eb1f0bff98482d72488d825c70ca5e8c17d20` |

The root [terminal-science-freeze-root.json](ER12_RUNTIME/runs/B-FINAL-G-02/control/stages/role/terminal-science-freeze-root.json) hashes to `c59f237e7db245943878e584f77d0df71c6cf2fc6d0772e303867ffabca0512c`. Its `terminal_task` records T3 completed/result_available/no pending, observed at 05:25:41.399238Z. This is the permitted terminal coordination evidence, not a native Goal receipt or semantic grade.

Primary evidence, retrieval UTC/operation, versions, conditions, exact line/section navigation, and file hashes are in [source-map.json](source-map.json), [retrievals.json](primary/retrievals.json), and the saved `primary/` documents. The sparse-checkout 2.43 web route returned only a redirect page; official 2.42 history and exact-tag 2.43 text supply substantive evidence. Optional HTML extraction first failed because `bs4` was unavailable; recovery used installed Python's HTMLParser on the already saved bytes. No installation or downloaded-code execution occurred.

## Native, protocol, and time — kept separate

Candidate saved native response files identify the same Goal thread `01a12441-1dfa-74f1-9294-3781c8e831dc`, exact frozen objective, active then complete status, creation 05:20:20Z and completion 05:24:30Z. The completion file reports `tokensUsed=94780` and `timeUsedSeconds=250`. These are **receipt-supported native fields**, not billing or effective-model evidence. Provider/model and billed-token/service-tier provenance are **UNKNOWN** in those responses. No provider event history was inspected, so independent authentication of the candidate's native invocation and activation-before-every-input ordering remains **UNKNOWN**.

The request and actual T3 dispatch/terminal records label provider instance `AUTHORIZED_PROVIDER_INSTANCE`, model `gpt-6-luna`, requested reasoning `max`, and requested service tier `default`. Those establish requested/orchestrator route labels. Actual effective backend model, effective effort/tier, account identity, and billing remain **UNKNOWN**; the fixture's labels are not substituted for telemetry.

All scientific deliverable mtimes in the terminal freeze precede the native completion timestamp: final 05:23:54.480504Z, source map 05:24:19.952184Z, latest source 05:24:19.952482Z. This supports saved-before-completion ordering, without independently proving all candidate actions. No unauthorized assistance or other protocol violation is evidenced in the permitted artifacts; full behavioral compliance is **UNKNOWN** without a permitted action trace. These unknowns do not replace the independent semantic diagnostic.

The arm deadline was 05:35:06.159Z. The root observed terminal completion at 05:25:41.399238Z, 335.240238 seconds after the 05:20:06.159Z request, well inside 900 seconds. This is a request-to-terminal-observation upper bound, not exact worker occupancy. Exact T3 completion/delivery latency and investigation-versus-writing allocation remain **UNKNOWN**. The 250-second Goal field is a different interval. No latency comparison, inference savings, billing savings, or speed claim is made. Review completion time is recorded in assessment.json; this independent review finishes within its separate 25-minute limit.
