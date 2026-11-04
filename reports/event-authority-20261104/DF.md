# DF — review round 2 fixes

Branch: `plans/ea-w2-filesafe-20261104`. Reviewed starting head: `0585dd597bf5811a7b321a9d8ee8e94ca6ed2992`. Assessed repair head: `655a0d97e82541939cf3320f3f72c5a2b9ed13b2`. This report/self-grade commit follows without changing the assessed source tree. Round 2 is the final fix round before the review cap; no additional review was spawned.

All nine families have the two reviewed oracle defects repaired. The self-grade is 11 PASS / 0 PARTIAL / 1 ABSENT for destructive_override_granted and policy_degraded, and 10 PASS / 1 PARTIAL / 1 ABSENT for the other seven. Every membership cell remains ABSENT; the seven retention cells remain pending. Native execution is NOT_RUN. No emission permission or 12/12 admission is claimed.

## Review round 2: findings and responses

- **B6 — fixed (`655a0d97e82541939cf3320f3f72c5a2b9ed13b2`). Where:** `scripts/pm_filesafe_event_authority.py:308` and `:433`, CV-550..558, ATS-275..279 and every family's own fixture suite. **Cause:** a semantically identical retry passed the Storage-owned digest while omitting the separate current-writer eligibility rule. **Fix:** materialization and current-writer/prepare/append/receipt/retry actions refuse `projector_replay_only` as `replay_only_not_appendable` before acknowledgement. The shared producer digest and retained-issued resolution remain unchanged. Each family has its own Project/application writer negative and protocol traces for initial acceptance, retry and retry after disposed original controls, plus metadata-only retry positives returning the exact original EventRecord/first receipt. Verify with the full authority checker and `fix2/standing-checks.json`; the pre-fix full checker records the counterexamples in `fix2/before-fixes.json`.
- **B7 — fixed (`655a0d97e82541939cf3320f3f72c5a2b9ed13b2`). Where:** `scripts/pm_filesafe_event_authority.py:246` and `:264`, `Plans/filesafe_event_sources/safe_point_restored.schema.json` application_restore_transaction, `Plans/Contracts_V0.md:25144` (CV-558), ATS-279. **Cause:** populated result pointers were not joined to the exact original event, and a staging-string test did not bind operation kind to present before/target entries. **Fix:** populated result_event_ref equals this exact original EventRecord.event_id; the original pre-append null capture remains supported. Create/delete/replace/metadata kinds join actual presence/type/content, normalize absent entries to null, and enforce stage/tombstone requirements. The complete journal, owner-required rollback material, holds and fences remain under their existing owners; no journal disposal authority was added. Twenty-five independently re-encoded/rehashed application negatives span all five restore outcomes, plus one metadata-content substitution negative. Five valid create/delete/metadata shapes and five null captures preserve supported compositions. Verify with the full authority checker and the controlled two-invalid-positive rejection in `fix2/failure-exit-control.json`.

No finding is disputed. Cycle-1 B1..B5 remain resolved in their reviewed scope: every one of the earlier 30 positives, 1,166 negatives and 396 protocol traces is unchanged and passes the full checker. The previous report and its source searches/retention audit remain available at the reviewed starting commit and in `drafts/DF/fix1/`.

## Family grades before and after

Before is the independent cycle-2 review. Counts are PASS / PARTIAL / ABSENT.

| Family | Before | After |
|---|---|---|
| `filesafe.command_denied` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.destructive_override_denied` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.destructive_override_granted` | 10 / 1 / 1 | 11 / 0 / 1 |
| `filesafe.destructive_override_requested` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.guard_init_failed` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.path_denied` | 9 / 2 / 1 | 10 / 1 / 1 |
| `filesafe.policy_degraded` | 10 / 1 / 1 | 11 / 0 / 1 |
| `safe_point.created` | 9 / 2 / 1 | 10 / 1 / 1 |
| `safe_point.restored` | 9 / 2 / 1 | 10 / 1 / 1 |

Only positive_negative_oracles changes PARTIAL → PASS for each family. All other independent-review statuses are carried after checking current own-owner evidence. The consolidated self-grade and nine individual files pin the repair head. All 108 cells and 316 exact citations, including file/quote hashes and current line numbers, were mechanically verified.

## All eight standing checks, separately across all nine families

| Standing check | Result |
|---|---|
| Current writer/retry must refuse projector_replay_only | PASS. Own negatives in both scopes for every family; eligibility is checked independently of digest equality and disposed-control retry. |
| CV-366 application idempotency format | PASS. Every application positive is exactly application@1:hex(UTF-8 server_id):hex(UTF-8 operation_id). |
| Encoded Project partition | PASS. Every Project positive uses project~base64url(real project_id), without padding. |
| SP-337 references above 16 KiB | PASS. Every inline event body is at or below the bound. A new 16,385-byte actual blob is addressed by its BLAKE3 payload reference and independently verified SHA-256/length; no file body is in the event. Native physical packs remain NOT_RUN. |
| Identifier full matching / trailing LF | PASS. All 99 anchored identifier patterns in the authored source/payload schemas have exact-length or full-match guards; isolated pattern tests and 54 per-family/scope source/body/receipt LF negatives refuse. Imported original Project schemas remain byte-unchanged. |
| Retry compares caller semantic body | PASS. Shared event_producer_semantic_digest is byte-unchanged. Eighteen metadata-only retry traces change Storage-assigned sequence/observed/persisted fields and return the unchanged original complete result and first receipt. |
| Checkpoint positive/event storage identities | PASS for supplied surfaces. Each family explicitly has family_checkpoint=none_required; there are zero per-family checkpoint positives to misjoin. Every full original/receipt positive joins actual storage identity and partition, and 36 added cross-storage negatives refuse in both scopes. The unchanged generic SP-278 checkpoint/read-token contract is adopted separately in every SP-550..558 unit; native generic-token/CAS execution remains NOT_RUN. |
| Failure oracle rejects success exit | PASS. The actual full checker exits 1 with exactly 11 expected failures when all nine families receive a deliberately accepted negative and restored receives the two independently rehashed inconsistent originals as invalid positives. The control wrapper asserts exit 1 and fails on exit 0; the fixture is restored byte-for-byte. |

`fix2/standing-checks.json` records every positive, per-family/scope identity/eligibility assertion, all 99 pattern checks, the large body and preservation of every old fixture row. `fix2/failure-exit-control.stdout.json` retains the complete failure output.

## Checks and derived files

| Command | Exit | Result |
|---|---:|---|
| python3 scripts/pm_filesafe_event_authority.py | 0 | pass; 41 positives, 1,300 negatives, 468 protocol traces across all nine |
| python3 scripts/pm_filesafe_event_contracts.py | 0 | pass; 20 payload positives, 150 negatives, 18 identity vectors |
| python3 standing-checks.py | 0 | all eight standing checks audited across all nine; 99 guarded identifier patterns |
| Full checker with deliberate failure controls | 1 | expected refusal; exactly 11 failures, never a success exit |
| python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json | 0 | generated; changed shards belong only to Contracts and Automated Testing |
| python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json | 0 | pass |
| python3 scripts/pm-plan-index.py generate | 0 | pass; exact currentness edition and all 269 inventoried inputs present |
| python3 scripts/pm-plan-index.py validate | 0 | parsed top-level status pass; zero false currentness missing-source rows |
| Source scope and original-resource preservation | 0 | pass; protected resources/registries/governance/shared digest unchanged |
| Re-grade citation check and git diff --check | 0 | 108 cells / 316 exact citations; no whitespace defects |

Readiness remains blocked_runtime_certification_incomplete. Governance/currentness drift is preserved, without reseal or clearance. The two FileSafe checker entry points are the targeted checks found under scripts/tests; both ran in full. No test file or frozen validator was edited. No old check was weakened and no old fixture row changed or disappeared.

## Exact retention questions stopped for Jared

Each question is copied exactly from its own SP retention paragraph. The five security questions do not reopen a runtime class; the two snapshot-history questions explicitly separate already-governed originals. These are the remaining cells, not unfixed technical review findings.

- **`filesafe.command_denied`:** Does the retained command-denial EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.destructive_override_denied`:** Does the retained destructive-override refusal EventRecord constitute an authority decision receipt (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.destructive_override_requested`:** Does the retained destructive-override request EventRecord itself constitute approval/audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.guard_init_failed`:** Does the retained fail-closed guard-initialization EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.path_denied`:** Does the retained path-denial EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`safe_point.created`:** Is safe_point.created EventRecord history an authority/capture receipt (RP-AUTHORITY-INDEFINITE), non-authority recovery operational history (RP-OPERATIONAL-2555D), or runtime history (RP-RUNTIME-365D), independently of the already-governed released snapshot bodies?
- **`safe_point.restored`:** Is safe_point.restored EventRecord history an authority/outcome receipt (RP-AUTHORITY-INDEFINITE), non-authority recovery operational history (RP-OPERATIONAL-2555D), or runtime history (RP-RUNTIME-365D), independently of the already-governed original restore transaction and snapshot bodies?


## Current premises, bindings and scope

- **DL-045 / F2-213 / CV-366:** the exact nine families remain authorized for technical completion of already specified behavior. The new eligibility paragraphs adopt the existing EventRecord envelope rule at Contracts_V0:1030–1033; they create no new event, producer or public command. B7 makes the already-required CV-558/FileSafe 11.1.2b exact-replace journal relationships executable; create/replace/delete/metadata were already in its source schema.
- **Storage:** shared semantic-digest field selection, SP-286/CV-339 full-value v2 custody, SP-278/DL-076 generic token and SP-336/SP-347 barriers remain unchanged. Every own family contract retains its independent source, recovery, withdrawal and consumer bindings. Original Project resources remain byte-identical.
- **Retention:** existing exact-kind assignments remain RP-AUTHORITY-INDEFINITE for destructive_override_granted and RP-OPERATIONAL-2555D for policy_degraded. The seven original narrowed questions above are copied verbatim. No original journal, snapshot, body or checkpoint lifetime was changed.
- **Shared owner hunks:** only the own CV-550..558 writer-eligibility paragraphs, CV-558 application-journal clarification and ATS-275..279 own-family regressions changed. Storage owner prose did not change in this round. The 18 own schemas/graphs, two safe-point payload schemas, fixture and authority checker are companions. All derived shards and six index outputs were generated, never hand-edited.

IDs used: existing **CV-550..558, SP-550..558, ATS-275..279**. No new IDs; CV-559/SP-559 remain unused. No admission, registry append, Decision Log entry, retention choice, storage-value addition, .gitignore edit, governance edit, frozen-validator edit, main push, landing, subagent or additional blind review.

## Resources, procedure and cleanup

Before creating the required sparse detached worktree at /home/sittingmongoose/pm-worktrees/DF-fix2 from the pinned origin branch, free -g reported 16 GiB available RAM and df -BG / reported 108 GB available. A later check reported 14 GiB and 109 GB. All stop thresholds were satisfied. The exact 15-file ignored currentness edition matches the shared copy by SHA-256 and every one of its 269 inventoried source paths exists. No pm-mail after reading its prohibition; an initial read-only inbox/who call preceded loading the brief, and no message or registration was sent. The source repair was pushed before this report. After the report/self-grades are pushed and copied, the exact temporary worktree is removed with a literal path; no branch is landed.

## Evidence custody

All round-2 reproducibility scripts, complete outputs and the technical manifest are under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/. The current report and consolidated/individual self-grades are copied to drafts/DF/. Each retained technical artifact is inventoried in the manifest; key path/hash pairs follow.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/authority.json` | `bce2df7447e6f856c22ff92c4ba14207fc681b994d07fdda24eef5a92112dec2` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/payload.json` | `8f7d3c1856e3d51f2147aa2f9833ff0158a30678adcf3ea5b526f21861d688ad` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/standing-checks.json` | `781d8c4bbd19fcab5fdc961b44e20f9a8382dc3784d2db2472e2291facc24ec9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/failure-exit-control.json` | `12740986c2379195c17bc9cdc8eb734ce0fd2476b0d19964b3fa55eb03d05947` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/shards.json` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/index-validate.json` | `35b232002c68070c4a76b81c7f484da638505101b55977fa05a600509e445d5e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/input-completeness.json` | `b6156d2341a66203059c86d992908d9b262638a112640d554a9eade1a7726c73` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/scope.json` | `8b6e1643b95494bef13a919e620b9fb2f1f6d841e7893102cc1145f7247af889` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/grade-citations.json` | `46b0cd67ef40ea900daaaf3c0dd0cafaefc453a61d1acef05148a7b71602c8c3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/checks.json` | `6fdd2cf3084276d6fd498f6377ea5be18677dea1aa6914c9269eebb6eeeec24d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix2/manifest.json` | `2fddeaac85b131b554bfdd0794d476d43278ec25e9a5394b1be51831319e5947` |
