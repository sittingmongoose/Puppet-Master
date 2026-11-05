# DFM — review round 6: distinct schema rules and exact input types

Branch `plans/ea-w2-filemanager-20261104`; assessed content `aea78ea17bc38b19499758dbb7af9f2962fb8909`; incoming head `698327c61f5730f9de4580725a568d47f86b24d2`. This report/self-grade/compact guard table follow in a report-only commit.

Prepared without admission. Membership is **ABSENT**; event retention is **PARTIAL / PENDING_RETENTION_DECISION for Jared**; native execution is **NOT_RUN**. No feature, deletion policy, retention answer, admission, registry append, Decision Log entry or PlanUnit is added.

## Review round 6: findings and responses

1. **Fixed (aea78ea17bc38b19499758dbb7af9f2962fb8909) — distinct relied-on schema rules lacked authored isolating negatives.** `Plans/filemanager_event_contract_fixtures.json:28513` adds accepting controls plus exactly one JSON edit for each distinct bound, cardinality, uniqueness, enum, type, required set, closure and path rule. `scripts/pm-filemanager-event-contracts.py:323` validates both control and negative through the real referenced schema. **579 distinct assertion groups** are mapped per actual schema in [DFM.guard-table.json](DFM.guard-table.json). Six physical/reference groups use explicit controls or named duplicates; 35 explicit full-definition cases also prove phase/state dispatch, physical closure and required-header obligations. Every generated rule group additionally has a complete consumed-schema anchor (573 added controls/negatives), including its reference path and all parent constraints. The consumed shared exclusiveMinimum bound is also tested. Each own schema independently proves evidence count 1/64, uniqueness, reference length 320, path count 256, revision bounds, lengths 20/160/220, own enums and types. The independent path minimum uses a pattern-valid short handle and removes **only minLength**, not an unrelated pattern.
2. **Verification completed with baseline qualification (aea78ea17bc38b19499758dbb7af9f2962fb8909) — review verification stopped at its mandatory RAM floor.** `scripts/pm-filemanager-event-contracts.py:1037` supplies complete per-family runs. Every unfinished class is completed in this round: all explicit guards, all five implicit lookup groups, exact missing-pack reproduction, expanded Astra and 72-fault graph matrix, twelve actual false-success checker subprocesses, complete derived-file comparison and final top-level index validation. The full-worktree top-level index validation exits 1 with 22 failures: 21 historical ledger-record errors and missing DL-302 relative to origin/main. Every named path and the validator are byte-identical to the incoming head; no failure names a round-6 changed path. They are retained as integration qualifications, with exact hashes in index-baseline-qualification.json, rather than suppressed or repaired by this lane. The previous resource-stop record is preserved unchanged and pinned in the manifest; its results are not relabelled as this run.
3. **Fixed (aea78ea17bc38b19499758dbb7af9f2962fb8909) — sweep items 10 and 11.** `scripts/pm-filemanager-event-contracts.py:927` and `scripts/pm-filemanager-event-contracts.py:905` enforce the exact input domains. Exact booleans replace truthiness for trace receipt/source/access/restore/reader flags. Exact typed comparisons cover counters, semantic flags, descendant counts and profile numbers. Retry identity must be an array; a dictionary with the expected keys no longer passes tuple conversion. Identity tuple values must be strings; recovery epoch remains an exact nonnegative integer. Historical/body modes must be booleans, transition storage must be an object or the documented absent input, and inline payload must be an object. Each new refusal has a one-defect accepting-removal witness. Numeric spelling probes independently cover 1, 1.0, 1e0, -0, -0.0 and invalid JSON 01; accepted integer -0/0 yields identical models, keys, identities, semantic bytes and commitments.

## Family grades before and after

Before is the binding cycle-6 independent review. Counts are PASS / PARTIAL / ABSENT. Only Q upgrades; all other 132 cells retain current normative support.

| Family | Own unit | Before | After | Checker cases |
|---|---|---|---|---|
| file.copied | F-150 | 9 / 2 / 1 | 10 / 1 / 1 | 1098 |
| file.created | F-151 | 9 / 2 / 1 | 10 / 1 / 1 | 522 |
| file.deleted | F-152 | 9 / 2 / 1 | 10 / 1 / 1 | 514 |
| file.exported | F-153 | 9 / 2 / 1 | 10 / 1 / 1 | 519 |
| file.moved | F-154 | 9 / 2 / 1 | 10 / 1 / 1 | 521 |
| file.renamed | F-155 | 9 / 2 / 1 | 10 / 1 / 1 | 523 |
| folder.copied | F-156 | 9 / 2 / 1 | 10 / 1 / 1 | 526 |
| folder.created | F-157 | 9 / 2 / 1 | 10 / 1 / 1 | 521 |
| folder.deleted | F-158 | 9 / 2 / 1 | 10 / 1 / 1 | 529 |
| folder.exported | F-159 | 9 / 2 / 1 | 10 / 1 / 1 | 534 |
| folder.moved | F-160 | 9 / 2 / 1 | 10 / 1 / 1 | 534 |
| folder.renamed | F-161 | 9 / 2 / 1 | 10 / 1 / 1 | 534 |

**108 PASS / 24 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT.** Retention remains pending for Jared; no family is admitted.

## Guard table

**6875 expected outcomes: 432 authored positive outcomes and 6443 negatives.** Every schema/API negative additionally runs its accepting control. All 2,775 prior outcomes and their twelve payloads/traces are preserved unchanged. The serial main checker passes once for each complete family, with all shared owner/registry gates enabled.

The complete machine table lists the guard, full family/case IDs that flip, and the complement that stays rejected: [DFM.guard-table.json](DFM.guard-table.json). **87 explicit guards, 613 schema removal groups, five implicit lookup groups, fourteen actual harness assertions; zero own residuals.** Three implicit lookup/identity pairs and the schema duplicate sets are named in that table. The 96 implicit missing-key negatives are included; additional duplicate-identity flips overlap explicit cases and are not double-counted.

Every removal is in memory, one guard or named duplicate set at a time, one family at a time. Other negatives retain an unchanged earlier first-refusal prefix or complete schema-error tree; every affected schema candidate is rerun. This is an explicit complement proof, not a claim of rerunning the whole suite for every deletion. No product validator is stubbed or weakened. Restored guards reject their negatives again.

| Explicit guard | Negatives that flip | Other negatives stay rejected |
|---|---|---|
| `validate_schema_graph:40` | 48 | 6395 |
| `validate_project_scope:102` | 12 | 6431 |
| `validate_original_payload:107` | 24 | 6419 |
| `validate_payload_reference:133` | 12 | 6431 |
| `resolve_payload:140` | 36 | 6407 |
| `resolve_value:146` | 48 | 6395 |
| `resolve_value:151` | 12 | 6431 |
| `event_body:160` | 84 | 6359 |
| `event_body:164` | 12 | 6431 |
| `event_body:167` | 12 | 6431 |
| `validate_writer:177` | 36 | 6407 |
| `validate_writer:179` | 12 | 6431 |
| `validate_profile:186` | 336 | 6107 |
| `validate_profile:189` | 48 | 6395 |
| `validate_profile:192` | 24 | 6419 |
| `validate_path_coverage:612` | 36 | 6407 |
| `validate_path_custody:625` | 48 | 6395 |
| `validate_path_custody:632` | 48 | 6395 |
| `validate_snapshot_subjects:644` | 56 | 6387 |
| `validate_snapshot_subjects:671` | 10 | 6433 |
| `validate_complete_event:692` | 96 | 6347 |
| `validate_complete_event:698` | 24 | 6419 |
| `validate_operation_edge:708` | 36 | 6407 |
| `validate_operation_immutables:714` | 24 | 6419 |
| `validate_operation_immutables:716` | 12 | 6431 |
| `validate_transition_storage:721` | 156 | 6287 |
| `validate_operation_transition:730` | 12 | 6431 |
| `validate_operation_transition:741` | 12 | 6431 |
| `validate_operation_transition:750` | 12 | 6431 |
| `validate_control_transition:763` | 12 | 6431 |
| `validate_control_transition:766` | 12 | 6431 |
| `validate_control_transition:770` | 24 | 6419 |
| `validate_control_transition:772` | 12 | 6431 |
| `validate_control_transition:776` | 96 | 6347 |
| `validate_control_transition:780` | 12 | 6431 |
| `validate_control_transition:782` | 12 | 6431 |
| `validate_control_transition:785` | 24 | 6419 |
| `validate_control_transition:790` | 12 | 6431 |
| `validate_original_models:796` | 96 | 6347 |
| `validate_original_models:807` | 24 | 6419 |
| `validate_original_models:809` | 12 | 6431 |
| `validate_original_models:812` | 12 | 6431 |
| `validate_original_models:814` | 12 | 6431 |
| `validate_original_models:816` | 12 | 6431 |
| `validate_historical_operation:833` | 12 | 6431 |
| `validate_historical_operation:836` | 12 | 6431 |
| `validate_historical_operation:838` | 12 | 6431 |
| `validate_historical_operation:844` | 24 | 6419 |
| `validate_historical_operation:849` | 36 | 6407 |
| `validate_historical_operation:853` | 12 | 6431 |
| `validate_historical_operation:855` | 12 | 6431 |
| `validate_historical_operation:864` | 12 | 6431 |
| `validate_historical_operation:866` | 60 | 6383 |
| `validate_historical_operation:868` | 12 | 6431 |
| `validate_historical_operation:872` | 24 | 6419 |
| `validate_historical_operation:876` | 24 | 6419 |
| `validate_historical_operation:880` | 60 | 6383 |
| `validate_historical_operation:886` | 12 | 6431 |
| `validate_historical_operation:888` | 24 | 6419 |
| `validate_historical_operation:891` | 12 | 6431 |
| `validate_historical_operation:894` | 36 | 6407 |
| `validate_historical_operation:898` | 12 | 6431 |
| `validate_historical_operation:902` | 36 | 6407 |
| `identity:909` | 168 | 6275 |
| `identity:922` | 336 | 6107 |
| `validate_case:934` | 2 | 6441 |
| `validate_case:939` | 12 | 6431 |
| `validate_case:941` | 12 | 6431 |
| `validate_case:944` | 12 | 6431 |
| `validate_case:946` | 96 | 6347 |
| `validate_case:949` | 264 | 6179 |
| `validate_case:953` | 324 | 6119 |
| `validate_case:955` | 24 | 6419 |
| `validate_case:957` | 96 | 6347 |
| `validate_case:961` | 228 | 6215 |
| `validate_case:975` | 272 | 6171 |
| `validate_case:981` | 120 | 6323 |
| `validate_snapshot_subjects:648` | 2 | 6441 |
| `validate_snapshot_subjects:651` | 2 | 6441 |
| `validate_snapshot_subjects:655` | 4 | 6439 |
| `validate_snapshot_subjects:660` | 4 | 6439 |
| `validate_snapshot_subjects:664` | 6 | 6437 |
| `validate_case:936` | 2 | 6441 |
| `validate_snapshot_subjects:679` | 2 | 6441 |
| `validate_case:964` | 2 | 6441 |
| `validate_snapshot_subjects:686` | 6 | 6437 |
| `validate_case:978` | 55 | 6388 |

| Implicit lookup / named duplicate | Implicit negatives | Total flips | Residuals |
|---|---|---|---|
| operation | 24 | 36 | 0 |
| append | 12 | 24 | 0 |
| control | 24 | 36 | 0 |
| pack | 12 | 12 | 0 |
| profile | 24 | 24 | 0 |

The prior 1,647-site inventory is assessed at **rule level**, as the review rules; a consumed shared exclusiveMinimum site omitted from that inventory is also covered. Structurally identical repetitions map to their actual per-schema proof. Selectors/conjunctions/references are assessed through their dispatched obligations and eager target resolution; they are not fictitious separate refusals. Unconsumed compatibility/group definitions have explicit graph-only relevance entries. Full-value result/EventRecord required sets and closure, accepted command/path/operation/control sets, and private separator/opaque traversal rules have their own proofs. Conditional obligations are exercised at the full owning definition. Embedded repetitions are bound to their companion by the real main equality gates, whose independent harness faults are removal-proved.

**Environment limit retained:** date-time is not registered in this interpreter FormatChecker. The 16 distinct per-schema format groups are disclosed, not claimed as executed PASS. JSON Schema’s mathematical integer domain and the stored integer-only MessagePack domain are distinct: the complete identity/storage routes refuse floats; schema type proofs use non-integral 0.5 and wrong-type forms.

## Standing checks and Astra sweep

| Check / class | Result and evidence |
|---|---|
| Current replay-only refusal / historical policy | Current writer, retry and terminal refusals pass in all twelve; retained replay-only/compatibility controls accept and withdrawn/forged/foreign history refuses. |
| Application keys / Project partitions | Project-only families; application substitutions refuse. Encoded project~ partition positives and raw-partition negatives pass; CV-366 is unchanged. |
| 16 KiB / custody on every path | Body/whole-companion packing, missing/changed/late/backup references, original start custody, settlement and terminal fences pass. Actual Storage metadata, identities and commitments are checked against original custody. |
| Lexical guards / schema graph | All 39 lane identifier patterns retain isolated lexical negatives. Distinct path length/traversal and private separator rules now have proofs. The 72-fault consumed/embedded graph matrix and unvisited own conditionals refuse dangling references. |
| Retry semantics / checkpoint joins | Storage-only retry metadata controls accept; semantic/identity changes refuse. Matching checkpoints accept and all four Storage identity substitutions refuse. |
| Failure oracles | Fourteen actual harness assertions have accepting removal witnesses. Twelve real checker subprocesses reject injected successful return 0 at their family’s exact failure assertion. |
| Isolation / grades | Complete explicit/schema/implicit tables; every new negative has a single-guard or named-duplicate witness. Q upgrades only after completed coverage. Native NOT_RUN, pending retention and absent membership remain explicit. |
| Numeric spelling / types | Per-family numeric and exact-type cases cover string booleans/numbers, null, arrays and nested objects where invalid. Inline objects remain permitted and are checked by their own closed payload schema. All accepted integer normalization controls retain identical committed bytes. |

Each family retains independent cases for Astra classes 1–11: original identity/digest/snapshot contradictions; Storage-assigned metadata; both directions of historical reading; alternate representations; unvisited references; every stored part’s size; every custody path; isolated negatives; grade limits; numeric spelling; exact types. Earlier original/cycle-2/cycle-3, settlement and expanded Astra drivers are rerun unchanged apart from output locations and resource checks.

## Completed verification

Every family’s main checker and guard audit exits 0. Remaining commands:

| Driver | Exit |
|---|---|
| `keys-file.copied` | 0 |
| `keys-file.created` | 0 |
| `keys-file.deleted` | 0 |
| `keys-file.exported` | 0 |
| `keys-file.moved` | 0 |
| `keys-file.renamed` | 0 |
| `keys-folder.copied` | 0 |
| `keys-folder.created` | 0 |
| `keys-folder.deleted` | 0 |
| `keys-folder.exported` | 0 |
| `keys-folder.moved` | 0 |
| `keys-folder.renamed` | 0 |
| `review-lookup-isolation-cycle6` | 0 |
| `review_probes` | 0 |
| `review-probes-cycle2` | 0 |
| `review-probes-cycle3` | 0 |
| `review-probes-cycle6` | 0 |
| `review-settlement-cycle6` | 0 |
| `review-numeric-cycle6` | 0 |
| `review-astra-cycle6` | 0 |
| `review-graph-cycle6` | 0 |
| `review-harness-refined-cycle6` | 0 |
| `false-success-file.copied` | 1 |
| `false-success-file.created` | 1 |
| `false-success-file.deleted` | 1 |
| `false-success-file.exported` | 1 |
| `false-success-file.moved` | 1 |
| `false-success-file.renamed` | 1 |
| `false-success-folder.copied` | 1 |
| `false-success-folder.created` | 1 |
| `false-success-folder.deleted` | 1 |
| `false-success-folder.exported` | 1 |
| `false-success-folder.moved` | 1 |
| `false-success-folder.renamed` | 1 |
| `derived` | 1 |
| `keys-restored` | 0 |

False-success exits 1 are the expected real assertion failures, not passing exits. Derived regeneration occurs only in disposable inputs: all shard bytes match; index bodies match with only generator timestamps differing. Pinned index timestamps are restored in scratch before its final validation. Fifteen ignored currentness inputs are copied and SHA-256 matched first. The worktree’s derived artifacts are not edited. Reproduction requires jsonschema, referencing and blake3; the latter was installed only in a disposable dependency directory, which is removed on cleanup.

The review’s unrelated 41 storage-profile omissions and three 346-versus-344 aggregate count diagnostics remain integration notes. The dedicated FileManager shared gates pass; no repository-wide profile/governance PASS is claimed. The 22 pre-existing full-worktree index failures are likewise reported explicitly; all shard/index generation bodies match the incoming head.

## Scope, prior fixes, premises and IDs

All confirmed earlier fixes remain: exact original command/root/path custody; strict full-value and first-receipt proofs; physical packing/profiles; copy/create identity; cutoff and withdrawal; matching checkpoints; settlement coverage; historical writer-policy separation; and integer recovery identity. The prior repair `891d0b2e875434960cefac1d8e1d75fe4e36dedb` is preserved. Canonical owner Markdown and all twelve schemas remain byte-identical to the incoming head. No governance reseal or aggregate landing check is attempted by this lane.

Current citations are re-read and checked; the existing DL-045/UCC, DL-076/SP-278, SP-286/CV-339, SP-337/SP-340, F2-205 and Case L-3 premises are unchanged. No old or unlanded answer is extended to event-history retention. Jared’s exact open question remains: which event-history retention class should each exact file/folder completed family use?

**IDs used:** F-150–F-161, SP-560, CV-560, ATS-280. **New PlanUnit IDs: none.** Fixture case IDs are enumerated in the compact table. No subagent, pm-mail coordination, admission, registry append, Decision Log, main push, landing lock, browser or server is used. Before the no-mail brief was read, inherited instructions caused one empty inbox read; no message or registration was sent. Initial disk/RAM checks passed (495 GB / 10 GiB); all checker jobs stayed serial and obeyed the 6 GiB floor.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix6/`, pinned by path and SHA-256 in `evidence-manifest.json` (SHA-256 `21bfe7d9e406e99da7413114409b41769408908bc998c2952745d38fffc11a4b`). The report/self-grade/compact table are copied beside this evidence and to the DFM drafts root. Unneeded progress logs, temporary dependencies, disposable inputs and the sparse worktree are removed after the branch is pushed.
