# B-FINAL-G-01: Rsync staged asset mirror

Case ID: ER12-B-FINAL-G-01-FRESH

Role: Criticism adjudication and complete bounded finalization

## Equal arm policy and time boundary
This complete assignment and its listed corpus are identical for both arms. Fresh context; same permitted tools and effort policy. You have 900 seconds total, including saving the output. Spend at most 600 seconds investigating and reserve the final 300 seconds for writing. No delegation or communication with other arms. Read local fixture files and retrieve public primary documentation with web search/open or HTTPS retrieval; at most eight additional primary pages. Do not read other cases, campaign results, assessor files, repository canon, or old answers. Do not execute downloaded code, install software, log into services, or modify this fixture. Any local probe must be tiny, use already installed tools, and run only in the arm's root-assigned output directory. Cite source URLs plus section/version and distinguish source statements from inference. Document retrieval failures and unresolved evidence rather than inventing observations. Root supplies an arm-specific writable output directory; if absent, return the complete output in your response. Do not write in the input directory.

## Exact original obligations
O1. Complete section title `Staged asset mirror`; rsync 3.2.7 on both ends; mirror source directory contents into a staging directory.
O2. Preserve exact tokens `protected_dir=local-notes`, `publish_mode=explicit`, and `preview_required=true`.
O3. Remove obsolete received assets inside synchronization scope while preserving the destination local-notes directory.
O4. Require an inspectable dry-run deletion preview before the destructive run; do not execute a command in this task.
O5. Treat rsync completion and the product’s explicit publish step separately; no claim of whole-tree atomicity from per-file behavior.
O6. Include cancellation/failure handling, three prospective checks and evidence still needed.

## Complete draft section
### Staged asset mirror
The tool mirrors a completed build’s asset directory into a receiver staging directory using rsync 3.2.7 at both peers. The declared controls are `protected_dir=local-notes`, `publish_mode=explicit`, and `preview_required=true`. Source and destination are selected paths displayed to the operator. The stage remains unpublished until the tool reports completion.

The source argument has a trailing slash so its contents become direct children of staging. To remove obsolete assets, use recursive transfer and --delete. The suggested global filter excludes local-notes/ and also enables --delete-excluded; this guarantees local notes survive while stale assets disappear. A dry run is optional because global exclusions make deletion safe in all cases.

When rsync returns success, the tool immediately publishes the staging directory. Adding --delay-updates gives the operation an atomic whole-directory transaction even if it fails midway. No separate publication control is needed. Cancellation stops rsync and reports an interrupted mirror. A failed transfer retains its diagnostic and does not claim the stage is complete.

Prospective checks cover source contents landing at the intended depth, stale asset removal, and retaining local notes. Remote path and filter behavior still require an isolated fixture run. None of those checks has run, and the supplied commands are illustrative rather than executed.

## Received critique
1. --delete-excluded undermines the proposed exclusion-based deletion protection for local-notes.
2. Drop the dry-run requirement because operators can restore deleted notes from memory.
3. The publication trigger violates explicit publication and the atomic-tree claim needs correction.
4. Remove the source trailing slash: rsync always treats source directories identically.
5. A preflight preview and destructive run may see different trees; bind/recheck the intended inputs rather than claiming preview is a lock.
6. --delete removes obsolete files from the sender, so do not worry about receiving-side notes.

## Required output
Save `final-section.md`: a complete standalone replacement section of 400–650 words satisfying every original obligation, followed by a numbered disposition for every critique item (accept, reject, or qualify with reason and primary citation). Keep the entire deliverable below 1100 words. No patch-only response, missing subsection, silent obligation deletion, or automatic acceptance of all criticism. Preserve exact tokens where required. Evidence may correct draft facts, but does not authorize changing the original product constraints. Include a short remaining-uncertainty statement. This is a bounded finalization role, not a whole-pipeline qualification.

## Navigable primary corpus

Read [corpus/index.json](corpus/index.json). Primary passages are in [S1](corpus/S1.md), [S2](corpus/S2.md). Local text is deliberately short; retrieve surrounding sections and history as needed.
