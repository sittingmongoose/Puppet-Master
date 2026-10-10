# B-FINAL-G-02: Git sparse workspace onboarding

Case ID: ER12-B-FINAL-G-02-FRESH

Role: Criticism adjudication and complete bounded finalization

## Equal arm policy and time boundary
This complete assignment and its listed corpus are identical for both arms. Fresh context; same permitted tools and effort policy. You have 900 seconds total, including saving the output. Spend at most 600 seconds investigating and reserve the final 300 seconds for writing. No delegation or communication with other arms. Read local fixture files and retrieve public primary documentation with web search/open or HTTPS retrieval; at most eight additional primary pages. Do not read other cases, campaign results, assessor files, repository canon, or old answers. Do not execute downloaded code, install software, log into services, or modify this fixture. Any local probe must be tiny, use already installed tools, and run only in the arm's root-assigned output directory. Cite source URLs plus section/version and distinguish source statements from inference. Document retrieval failures and unresolved evidence rather than inventing observations. Root supplies an arm-specific writable output directory; if absent, return the complete output in your response. Do not write in the input directory.

## Exact original obligations
O1. Complete section title `Sparse workspace onboarding`; target Git 2.43, one disposable clone, cone mode.
O2. Preserve exact tokens `selected_dir=packages/editor`, `history_policy=full`, and `network_budget=unproven`.
O3. Explain expected working-tree inclusions, including parent-level files; no claim that only selected_dir exists.
O4. Distinguish sparse checkout from partial-clone blob filtering and shallow history. Keep full commit history.
O5. Include recovery with reapply/disable and protect users from losing local changes during changes of selection.
O6. State three prospective checks, diagnostics and unmeasured network/runtime limitations. Do not alter any real repository.

## Complete draft section
### Sparse workspace onboarding
The onboarding helper creates one disposable Git 2.43 clone. Its recorded choices are `selected_dir=packages/editor`, `history_policy=full`, and `network_budget=unproven`. It applies cone-mode sparse checkout to packages/editor and presents the selected directory to the user. All commit history is retained.

Cone mode materializes only files below packages/editor; top-level and parent-level files are absent. The sparse-checkout command itself prevents all nonselected blobs from being downloaded, so the clone’s network traffic has a strict upper bound equal to selected file sizes. No partial-clone filter or network measurement is needed. To retain full history efficiently, the command also adds --depth=1, which preserves history for all normal work.

Changing the selection must inspect local changes first and preserve or stop for them. The helper uses reapply when an operation has materialized extra paths. Disable returns to a normal complete checkout. Failed operations retain the exit status and chosen directories, and the helper avoids announcing a ready workspace until the command succeeds.

Prospective checks inspect included directory files, exercise reapply after a merge-like operation, and disable sparsity. The integration needs measured byte-transfer evidence and a local-change recovery fixture. No Git command or test has run for this section.

## Received critique
1. Cone mode also includes files immediately inside ancestor directories, so revise the only-selected-files claim.
2. Sparse checkout and blob filtering are different controls; neither proves the stated byte bound without workload evidence.
3. Keep --depth=1: full history only means the current tree is complete.
4. Delete recovery commands because sparsity cannot leave extra materialized paths after operations.
5. Remove --depth=1 to satisfy history_policy=full; explain recovery without discarding user changes.
6. Enable a sparse index as a mandatory way to stop all network downloads.

## Required output
Save `final-section.md`: a complete standalone replacement section of 400–650 words satisfying every original obligation, followed by a numbered disposition for every critique item (accept, reject, or qualify with reason and primary citation). Keep the entire deliverable below 1100 words. No patch-only response, missing subsection, silent obligation deletion, or automatic acceptance of all criticism. Preserve exact tokens where required. Evidence may correct draft facts, but does not authorize changing the original product constraints. Include a short remaining-uncertainty statement. This is a bounded finalization role, not a whole-pipeline qualification.

## Navigable primary corpus

Read [corpus/index.json](corpus/index.json). Primary passages are in [S1](corpus/S1.md), [S2](corpus/S2.md). Local text is deliberately short; retrieve surrounding sections and history as needed.
