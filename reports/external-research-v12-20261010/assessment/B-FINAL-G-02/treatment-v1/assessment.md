# ER12 B-FINAL-G-02 treatment — independent bounded semantic assessment

**Source judgment: PASS_WITH_LIMITATIONS.** The complete finalization satisfies O1–O6 and correctly adjudicates all six critiques. Independent Git 2.43.0 primary documentation supports every consequential adopted or rejected scientific claim. No remaining material error, omission, or unsupported consequential decision was identified. The candidate openly left its live-manual version provenance unverified; the reviewer resolved factual applicability against the exact target tag. That candidate citation-provenance limitation remains recorded rather than silently credited as candidate work.

This judgment applies to the assigned **criticism adjudication and complete bounded finalization** role. It is not full-pipeline qualification, a discovery-role score, a rescore of ER11, or a paired performance/billing comparison. Native, effective route, billing, protocol, coverage, delivery and time findings are separately recorded below and in [assessment.json](assessment.json).

## Inspection and primary evidence

The full rubric, role input-map/assignment/freeze, mapped shared assignment and fixture, every corpus member (S1, S2 and index), manifest, complete authored final-section, candidate source-map, every saved sources member, two saved native receipt files, and required terminal-science-freeze-root were read. No alternate arm, roster, external outcome/status file, history, backup invocation, or unrelated case was reviewed. The mandated fixture/freezes themselves contain route and terminal metadata; those fields were not treated as semantic verdicts.

The candidate artifact is [final-section.md](ER12_RUNTIME/runs/B-FINAL-G-02/treatment/stages/role/final-section.md). Its line numbers below refer to the exact frozen file. Source-map JSON locators refer to the exact frozen one-line JSON document using JSON pointers.

Independent HTTPS GETs saved the exact tagged upstream [Git v2.43.0 sparse-checkout manual](primary-evidence/P1-sparse-v2.43.0-numbered.txt) (P1) and [Git v2.43.0 clone manual](primary-evidence/P2-clone-v2.43.0-numbered.txt) (P2), as well as the target/manual redirect and live manuals used by the candidate. [The evidence index](primary-evidence/index.md) provides local numbered text, original URLs, versions, retrieval operations/times and hashes. [source-map.json](source-map.json) connects candidate statements, critique dispositions, target conditions and reviewer discoveries to exact primary line ranges. P1/P2 are authoritative for target-version adjudication; the corpus is a locator aid rather than complete primary evidence.

The Git sparse-checkout 2.43 URL returned HTTP 200 with a meta-refresh/canonical destination of 2.42.0, not substantive target text (P3). The live history says no sparse manual changes from 2.42.1 through 2.51.1 (P5 lines 146–160). The direct v2.43.0 source removes redirect/version ambiguity. The current live manual includes a later `clean` subcommand absent from the target source; the candidate did not import it. The clone 2.43.0 manual (P4) also corroborates target text. These are independent reviewer retrievals, not retroactively attributed to the candidate.

## Exact obligations and delivery

| Obligation | Judgment | Exact candidate locator and reason |
| --- | --- | --- |
| O1 | Met | Lines 1, 3 and 5: exact title `Sparse workspace onboarding`, Git 2.43, one disposable clone, cone mode. No changed target or added clone. |
| O2 | Met | Line 3 preserves `selected_dir=packages/editor`, `history_policy=full`, `network_budget=unproven` verbatim; later passages retain their meanings. |
| O3 | Met | Line 5 specifies recursive editor contents plus immediate packages/ and root files. The false only-selected-files claim is removed. P1 lines 63–71, 308–324 and 377–425. |
| O4 | Met | Lines 3 and 7 separate tracked-file presence, filtered blob transfer, and shallow commit history; no shallow-depth/since/exclude option is retained. P1 lines 18–31; P2 lines 174–188 and 245–268. |
| O5 | Met | Line 9 requires inspection and preservation or stopping before selection changes; reapply follows cleanup, disable remains, and changes/conflicts must not be discarded to enforce sparsity. P1 lines 99–116 and 174–196. |
| O6 | Met | Line 11 contains three prospective checks and diagnostics, explicitly reports no Git command/test and no real-repository alteration, and leaves byte-transfer/runtime unmeasured. Line 22 preserves remaining uncertainty. |

The replacement section has **490 whitespace-delimited words excluding its four-word Markdown heading, 494 including it**, within 400–650 either way. The entire deliverable has **772 words**, below 1100. It is a complete standalone replacement followed by six numbered dispositions and a short uncertainty statement. Word/token checks support delivery accounting; they are not the basis of semantic correctness.

## Consequential factual applicability

**Cone inclusion.** Line 5 matches Git 2.43's directory-input, recursive-pattern and parent-pattern semantics: editor descendants at every depth, files immediately in packages/, and root files. Parent inclusion is not recursively all sibling directory contents. Empty cone selection still includes root files. P1 lines 63–71, 308–324 and 377–425 directly support this. The intended domain is tracked superproject working-tree files, rather than automatic initialization of independent submodules.

**Working tree, objects, commits and units.** Line 7 correctly treats sparse checkout as selection of tracked files to materialize (P1 lines 18–31, 201–214), blob filtering as requesting fewer reachable object payloads until needed (P2 lines 180–188), and depth as truncating the commit graph (P2 lines 245–258). Blob demand fetching can occur later; a sparse working tree is not a selected-file-size bound on total transferred bytes. The byte-bound rejection is a supported inference from the different operations and the absent workload measurements, not a supposed numerical promise in the manual. A meaningful future byte measurement needs a defined workload; no traffic number, unit conversion, efficiency percentage or runtime gain is invented. Full commit history remains the product constraint, without conflating it with a complete current tree or all historical blob payloads already downloaded.

**Recovery and safety.** Line 9 accurately allows materialization by merge/rebase and failed sparsification of modified/conflicted files, and puts reapply after resolving, committing or undoing affected changes (P1 lines 99–112). Disable restores ordinary tracked working-tree coverage (P1 lines 114–116, 174–177). The preserve-or-stop rule is normative helper behavior; the candidate does not claim Git itself backs up every local file. Neither reapply nor disable is asserted to recover deleted local user data or to override unresolved changes.

**Sparse index.** Line 20's optional/default-off/experimental characterization is explicitly in the target manual, with index-size and command-performance purpose (P1 lines 78–91). Non-cone has different support, some commands can be slower, and external/older tools can be incompatible. The candidate rejects sparse index as a mandatory no-download mechanism; it does not improperly rule out its documented optional local-performance use. The rejected critique supplies no support for a network guarantee.

## Every critique disposition

1. **Accept — correct** (candidate line 15). Cone includes immediate leading-directory/root files; P1 lines 63–71, 308–324 and 377–425. The selected-only assertion is corrected.
2. **Accept — correct** (line 16). Worktree scoping and filtered object transfer are distinct, and no defined-workload byte evidence establishes the bound; P1 lines 18–31 and P2 lines 174–188. Network uncertainty is preserved.
3. **Reject — correct** (line 17). `--depth=1` truncates commit history; completeness of the current tree does not satisfy O4; P2 lines 245–268.
4. **Reject — correct** (line 18). Target Git explicitly documents extra materialized/unsparsified paths and reapply after cleanup; P1 lines 99–116 and 186–196. The required recovery scope survives.
5. **Accept — correct** (line 19). Removing shallow depth honors the full-history constraint, while inspect/preserve/stop and recovery remain; P2 lines 245–258 and P1 lines 99–116.
6. **Reject — correct** (line 20). Sparse index is an optional index representation/performance feature, not mandatory network prevention; P1 lines 73–91.

Each disposition includes a reason and primary source/section locator. The S1/S2 URLs are given immediately before the numbered list; the source-map adds the corresponding passages. No critique is automatically accepted and none is omitted.

## Supported scope, useful mechanisms and checks

The final preserves one disposable clone, the selected path and exact policies, full commit history, local-change protection, reapply/disable, failure exit status and chosen-directory diagnostics, the ready-only-on-success condition, all three planned checks, and the need for measured transfer evidence and a recovery fixture. False exclusivity, false byte bound and false shallow/full-history equivalence are corrected rather than used to narrow the original obligations. Optional partial-clone filtering and sparse-index performance remain separate useful mechanisms; no mandatory filtering choice or extra deployment is invented.

The three proposed checks have applicable primary oracles: (1) selected, immediate parent and root inclusions; (2) an operation that materializes an extra path, safe cleanup then reapply; (3) disabling sparse checkout restores complete tracked coverage. P1 lines 63–71 and 99–116 support those intended outcomes. The candidate says none ran (line 11 and source-map `/proposed_vs_executed`). Page retrieval is research, and formatting/JSON validation would not be a runtime Git test. This bounded role does not require executing a nonexistent deployment or altering a real repository. The recovery fixture and network/runtime measurements correctly remain prospective.

Useful reviewer discoveries delimit future integration without inventing new assigned obligations:

- **Ignored local files:** target selection changes can delete excluded directories containing only ignored untracked files; nonignored untracked files can preserve the directory and produce warnings (P1 lines 163–172, 326–334). A future fixture implementing the already broad preserve-or-stop rule should cover valued ignored files. The candidate neither limits its inspection to ordinary status nor prescribes an unsafe destructive implementation, so this is an implementation lead rather than an exact supported material failure.
- **Submodule/shallow-source boundaries:** sparse changes do not automatically initialize/deinitialize submodules (P1 lines 444–472); a clone source can itself be shallow, for which Git documents reject-shallow (P2 lines 157–160). No such source or submodule was supplied. Full-history language is the intended superproject policy, not a claim that absent upstream/unreachable history can be conjured.
- **Implementation/history:** skip-worktree state and recursive/parent patterns explain the file-presence oracle (P1 lines 201–214, 377–425). Modern set handles setup; deprecated init reflects historical setup behavior (P1 lines 119–136). Target-version applicability was independently verified. Exhaustive unfamiliar discovery and implementation archaeology are not separate obligations of this FINAL role.

## Limitation and unknowns

**L1 — nonmaterial candidate version provenance.** Candidate line 22 and source-map `/applicability/version_note` explicitly admit that each cited option was not checked against pinned 2.43 sources. That is an investigation/provenance limitation. P1/P2 independently verify every consequential statement and disposition for Git 2.43.0, so no material version error or unsupported consequential decision remains. The reviewer does not describe this missing candidate work as executed. Measured runtime/transfer and the unexecuted fixture remain honest implementation uncertainties, not semantic failures.

**No material findings.** In particular, there is no evidence-backed reason to fail on the ignored-file/submodule/source-shallow discoveries while the candidate preserves the broad safety constraint, makes no unsafe implementation prescription, and has no asserted execution in those unprovided domains.

## Separate native, route, protocol and time accounting

**Native:** frozen saved JSON receipts report the exact required objective and the same goal ID `goal-01a12441-3dce-7d23-9d87-ff8fb6fba7d1`, active at 05:20:17.870 UTC and complete at 05:22:52.761 UTC. Science artifact mtimes precede that recorded completion: final 05:21:53.388418, sources 05:22:31.988660, source-map 05:22:42.653726. These are saved receipt/mtime observations. Independent authenticity of the original native tool invocation and activation-before-actual-input-read/inference ordering are **UNKNOWN** because the assigned evidence contains no provider transport/read trace. The terminal root report separately records T3 completed/result_available/no pending child runs; it is not native Goal proof. Absence of that trace is not evidence of fabrication or a semantic fail.

**Route/billing:** freeze requests Muse / `muse-spark-1.3-contributor` / max; root T3 terminal metadata records the same provider/model route. These routing fields and the fixture's display labels do not establish an effective serving backend, account or reasoning setting; those are **UNKNOWN**. Completion receipt reports `tokens_used=1869776`; billing semantics, per-request usage and cost are **UNKNOWN**. No reported occupancy or native token counter is converted into inference/billing savings.

**Protocol:** all inspected science/input hashes match the applicable freezes; no candidate science or input was edited. No assistance, repair, account switch, Git operation, publication, downloaded-code execution, other-arm/history/roster/outcome consultation or reviewer delegation occurred in this review. Only the reviewer's own mailbox was checked. Candidate source-map reports live page reads; the primary content was independently checked, while original HTTP execution trace and unobservable execution ordering remain unknown. No unauthorized candidate assistance was observed in the bounded evidence, without claiming global proof of absence.

**Time:** prepared time is 05:20:06.159 UTC and deadline 05:35:06.159 UTC. Last saved science was 156.494726 seconds after preparation; recorded native completion was 166.602 seconds after it. Root observed completed/no pending at 05:23:58.881330, 232.72233 seconds after preparation and before the deadline. Delivery is on time by root terminal/frozen-artifact evidence; exact investigation work and actual inference latency are not measured. Early completion is allowed and does not establish paired speed or billing effects. The reviewer activated one actual native Goal at 05:24:11 UTC with this exact review in its objective, and saves this judgment before completing it within the 25-minute review bound.

## Integrity and retained assessment

[inspected-hashes.json](inspected-hashes.json) records every fully inspected rubric/input/science/native/terminal artifact with SHA-256 and byte count, plus applicable input/terminal freeze comparisons. Only inspected members were checked: unrelated backup/dispatch/clarification files listed by the mandatory terminal freeze were not read or treated as inspected. Hash equality identifies reviewed bytes; primary source analysis supplies the judgment. Primary retrieval raw bytes have their own SHA-256 in source-map/retrievals and the evidence index.

The candidate final hash is `932786a3f7d86488cc9d2fed43ca5233f1ef1b55236e8bf8ee03dde718d90e4e`; candidate source-map hash is `2e4ab7c983df62903f48888890f6a29f1eb2d3b654499a32b7d73e22ba29c23a`. The original judgment and evidence are retained here; any later dispute disposition belongs to a separate edition, not a silent rewrite.
