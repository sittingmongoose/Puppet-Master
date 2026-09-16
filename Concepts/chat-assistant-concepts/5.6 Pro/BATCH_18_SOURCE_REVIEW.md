# Batch 18 source and preservation review

Implementation review, not an independent formal audit.

## Starting evidence

Current main was read through the GitHub connector at `f9effd40420e496647a3af6cb2902de1ea08b9d7`. The applied B17 cumulative archive was independently reopened; its 318 source/test files supply the local baseline. A bounded workspace check found no newer implementation to preserve here. The working branch is a private snapshot worktree based on local commit d8b26fc7cfef6ad67ae86e36cb1cb5b63a66a128, not falsely represented as an upstream clone. The upstream source identity is recorded separately. No shared checkout, index or remote was written.

Affected preexisting source was compared with upstream Git blobs: scheduling.js c994e41f0972863d902648cb5a0377ad360c4dc5; composer-state.js c3e9f2d3c7c11a2123fb1639c870902f0f4a2914; build.py 8b2b586af7e91164b91b4e0464e459370c495bf2; app.js a85d95bbf203d3cbcf7db9e73c7414ed1045a6a2; plans.js 852c16f1adcbcbc8b411eadc5b5cb9ce89694439. Current repository instructions at the same pin retain isolated worktree, no raw evidence in source, no Plans/native/governance changes and protected concept preservation.

## Consumed owners

Scheduling_and_Quota_Resume.md owns schedule records, exact snapshots, manual precedence, IANA calendar policy, missed-time policy and two-point eligibility. SMSG-001..018 supplies message projection and history; PSCHED-001..014 supplies frozen topology and recurring run identity; SQR-009/010 supplies four categories and atomic editing. No second timer or schedule authority was added.

Assistant_Plan_Runtime.md owns PlanRun admission, four Build labels, immutable document/version and completion. ToDo_Runtime.md remains sole outcome/progress writer. Goal_Runtime_System.md owns explicit goal-driven creation at dispatch and continuation. Composer capture/consume and transactions reuse the existing concept owners. Artifact identity/version is retained by the shared artifact owner. Collaborative_Workflows.md requires one durable user message referenced twice and an atomic configured Crew admission; missing corresponding adapters are explicit open coverage, not fixture success.

## Repairs and negative cases

Scheduled-message source capture was previously lossy, edits could miss expected-revision fencing and recurrence was demonstrated through stage controls rather than calendar predicates. B18 replaces those paths with typed existing-owner operations. Revalidation includes early dispatch, Stop after decision, version/route/scope/permissions, unknown destination, unavailable V1, duplicate delivery, stale edit/cancel, publication failure and scope changes during helpers. A failed shared transaction restores message and schedule state before a current record receives its named failed-attempt receipt.

Window admission uses explicit UTC instants resolved from IANA local declarations. Tests exercise folds, gaps, half-hour transitions, overnight days, wind-down, exclusive close, the same run across occurrences, manual controls, quota conjunction, cancellation versus Stop, exact-version topology and atomic invalid payload refusal. Unsupported Crew admission fails before runtime effects.

Visual inspection found a genuine attention-key mismatch: a new window_wait value had no shared renderer. The final code uses the existing window attention kind, preserving Building… plus visible pause reason. It also replaces Time not set with a recurring-day/time/timezone summary and removes duplicate guide presentation only in B18 demo threads. Ordinary-control driver corrections use the actual existing wand Scheduling submenu, scoping duplicate projections to their owning dialog. Fault injection targets the actual shared transaction append seam, not a transient context copy.

## B17 follow-up provenance

The user relayed VM results: 36 handlers/133 assertions, nine scenes/204 checks, and four print-observation recording jobs/95 checks plus 15 infrastructure tests. Those are agent-reported external results, not raw VM receipts independently read here. The reported exact git archive export omitted only the preexisting handoff/node_modules symlink; 716 matching regular files is that export's census, not the 318-file delivery corpus. The exception is compatible with application-byte tests but does not prove an unchanged whole tree or the link's target. Original failed receipts remain failures. Native uninstrumented print-dialog behavior is still not verified.

## Preservation and evidence

No old source or concept is removed. Historical reports remain history. No production command, native EventRecord, PlanUnit, WorkNode, governance artifact or acceptance status is minted. New tests and source are saved in nonempty independently reopened UNVERIFIED checkpoints before final verification. Raw evidence and scratch repositories are external and never a source of false native claims. Refer to the separate final report for executed final-byte and archive results.

Final API negative testing found that host Intl accepts numeric-offset identifiers and an omitted time zone. The shared pure calendar boundary now requires a nonempty named-zone token before Intl validation. Named Etc/GMT zones remain valid. Both message and window owner commands refuse offset/missing-zone inputs without any schedule or composer mutation. Earlier verification belongs to its earlier raw hash and is preserved separately.

## B15 recurring-window test alignment

The original B15 `recurring_reuses_run` case assumed every automatic window pause was the generic manual `paused` attention kind. B18 instead projects the exact `window` reason and `PlanRun.state=waiting_window`; the bound Goal stays active while its run waits. A fresh characterization proved the original first-admission, same-run resume, and manual-pause protections still hold. The adapted test now requires all of those window-specific fields plus the original run identity, rather than merely changing a label check. No application code changes for this adaptation. The original failed receipts and exact driver diff are retained in separate evidence. Final regression reporting distinguishes the original chain from the complete adapted B15 rerun.
