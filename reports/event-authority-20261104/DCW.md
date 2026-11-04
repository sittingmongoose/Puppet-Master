# DCW — fix round 3, Event Authority

Branch: `plans/ea-w2-chain-wizard-20261104`. Worker: **DCW-FIX3**, VM. Reviewed head: `9dd2bebf8c4dacd8e65ae254a94df6162c86372a`. Assessed implementation: `636befcbf78a8d059f0258675292f54f0a6f149b`. Citation/re-grade commit: `8670286d31ba7e114aec5dd93a46656051848be6`. This is the third and last fix round; the next independent review is final.

**Worker self-grade: 0/6 prepared passes before → 6/6 after (6/8 assigned).** Every drafted family now has 10 PASS / 1 PARTIAL / 1 ABSENT. Membership remains intentionally ABSENT; pending retention is the permitted PARTIAL. Native execution remains NOT_RUN. The two narrow owner holds remain unanswered.

## Review round 3: findings and responses

1. **F3 / blocking caller-retry admission — fixed (`636befcbf78a8d059f0258675292f54f0a6f149b`).** Location: `scripts/pm_dcw_event_oracles.py:73` (shared writer-policy guard), `:402` (incoming caller policy), `:517` (each successful caller retry); exact-family regressions in `Plans/dcw_event_contract_fixtures.json` and `scripts/pm_dcw_event_regressions.py:85`. Cause: the incoming policy was outside the semantic digest and received no independent admission check. Fix: validate every explicitly supplied caller policy before semantic dedupe, with `projector_replay_only` refused as `replay_only_not_appendable`; other unsupported/null policies refuse `writer_policy`. Omitted policy remains supported for semantic-only retry inputs. Storage-assigned observed/persisted times and sequence remain excluded from semantic comparison; original stored full-value receipt authentication still runs. All 12 exact review counterexamples now refuse, with unchanged original events/receipts. Add 72 explicit caller fixtures and rerun the incoming-policy negative over every successful authored retry, including restored, referenced-source, cutoff-drain and metadata-only variants. Verify with both checked-in commands below.

2. **Loaded-family evidence / should-fix — fixed (`8670286d31ba7e114aec5dd93a46656051848be6`).** Location: `reports/event-authority-20261104/DCW.self-grade.json`, `wizard.deferred_payload.loaded` producer, retention, custody, consumer and compatibility citations. Cause: duplicate wording allowed seven citations into the preceding opened-family section. Fix: all such evidence now lies within the loaded family’s own `Plans/storage-plan.md:30024–30037` section. The artifact checker verifies heading containment as well as exact quotes, and rejects the original wrong-heading mutation. No normative binding or additional grade was changed by this citation correction.

3. **Standing check 9 — fixed (`636befcbf78a8d059f0258675292f54f0a6f149b`).** Location: `scripts/pm_dcw_event_oracles.py:55` and `:492`. Cause: schema syntax/instance checks did not inspect unused definitions for dangling references. Fix: resolve every `$ref` in every registered input schema before fixture execution, including nested subresource bases, with `unresolved_schema_ref` on failure. All 80 existing refs resolve. For every exact family, dangling local/external refs in both source and payload schemas make the complete CLI exit 1. Source-registry mirrors are mutated consistently to isolate the reference defect. All 24 corresponding controls pass when only the new preflight is disabled.

No finding is disputed. No owner decision, admission, exclusion or registry append was made.

## Family grades before and after

Before is the independent cycle-three review; the earlier worker PASS claims are not the baseline. All 96 current cells and 210 exact source quotes are verified in the updated self-grade.

| Family | Before | After | Outcome |
|---|---|---|---|
| `bundle.revision_requested` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `bundle.revision_started` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `bundle.revision_completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `bundle.revision_interrupted` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `wizard.deferred_payload.loaded` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `wizard.opened` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| `wizard.blocked` | 6 PARTIAL / 6 ABSENT | unchanged | held for Jared |
| `wizard.unblocked` | 6 PARTIAL / 6 ABSENT | unchanged | held for Jared |

## Per-family standing checks, 1 through 9

**Fixed = `636befcbf78a8d059f0258675292f54f0a6f149b`. Pass = exercised successfully at that implementation.** Check 2 is an active refusal test: these are project-only families, so even a correctly shaped CV-366 application key cannot authorize an application writer. No standing-check cell is open.

| Exact family | 1 Writer/retry | 2 App key | 3 Partition | 4 Size/ref | 5 LF | 6 Semantic retry | 7 Checkpoint | 8 Failure exit | 9 Refs |
|---|---|---|---|---|---|---|---|---|---|
| `bundle.revision_requested` | Fixed | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Fixed |
| `bundle.revision_started` | Fixed | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Fixed |
| `bundle.revision_completed` | Fixed | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Fixed |
| `bundle.revision_interrupted` | Fixed | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Fixed |
| `wizard.deferred_payload.loaded` | Fixed | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Fixed |
| `wizard.opened` | Fixed | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Fixed |

The complete `verify` composition is invoked for checks 1–7. Checks 8–9 invoke the complete CLI in a fresh subprocess. The core negative for each check is recorded independently for all six exact families in `fix3-standing-checks.json`; the wider variants below are also recorded in the full suite and independent review audit, including exact boundary, restored, referenced-body and authenticated original cases.

| Check | Negative that catches it | Full-checker outcome for every family |
|---|---|---|
| 1 | Change only incoming `retry_request.replay_policy` to `projector_replay_only`; repeat for every successful caller-retry variant and ordinary/referenced sources. Independently mutate first-write/publish/prepared-event policies. | Event/caller policy: `replay_only_not_appendable`; prepared Wizard source: `latest_source_event`. The prior 12 invalid acceptances are gone. |
| 2 | Supply CV-366 `application@1:hex(server_id):hex(owner_operation_id)` with application scope; also try malformed `application:server:operation`. | Both refuse `identity`; no application or fabricated-Project fallback. |
| 3 | Replace the original custody `project~` base64url/no-padding partition with raw Project ID or another encoded Project. | `receipt_scope` on publish/retry/read; independently encoded positives match. |
| 4 | Store 16385 canonical MessagePack bytes inline; remove/corrupt/unsync/substitute a referenced body or restore inventory. | `refuse_oversized_source` or the specific payload/restore refusal. 16383/16384 inline and 16385/24576 authenticated SP-337 reference positives pass. |
| 5 | Add LF to a source hash and every corresponding trusted owner observation; also mutate event/stored payload hashes or BLAKE3 refs. | `schema`, including matching malformed originals and referenced bodies. All 23 identifier-pattern sites reject LF/CRLF/short/long forms. |
| 6 | Change only a caller semantic payload field, such as permission snapshot/source evidence; separately change stored original metadata. | `idempotency_conflict` for caller semantics; `original_full_value` for stored tampering. Semantic-only inputs and each Storage-only time/sequence change pass. |
| 7 | Move source, selected instance and authority together while leaving the original checkpoint, or mutate only token Storage identity. | `checkpoint_storage_instance`; matched positive event/token identities pass. |
| 8 | Deliberately make the runner accept the authored invalid 16385-byte inline case. | Complete CLI exits **1**, naming expected `refuse_oversized_source` versus actual `accept` (6/6). |
| 9 | Insert a dangling local/external `$ref` into an unused source/payload definition, with source registry mirror aligned. | Complete CLI exits **1** with `unresolved_schema_ref` (24/24); identical inputs pass with only preflight disabled (24/24 controls). |

Checked-in verification:

```bash
python3 scripts/pm_bundle_revision_events.py
python3 scripts/pm_dcw_event_regressions.py
```

## Earlier findings: mutation replay

| Finding | Negative replay and result |
|---|---|
| Cycle 1 F1: reader-only writers | Six-family append/publish/retry and prepared-source mutations still refuse; every successful writer path is re-mutated. Caller-retry hole is now closed separately. |
| Cycle 1 F2: deferred originals | Every family refuses a deferred source schema/status and deferred restore mode through the complete CLI. Missing/substituted first receipt, original commitment, source restore inventory and receipt admission refuse. Original intent/result/document and historical-source cases remain. |
| Cycle 1 F3: missing full oracles | Full suite retains every earlier scenario. Terminal conflicts/completed resume, cutoff/fence, withdrawn readers, replacement admission and incomplete rebuild mutations refuse. Check 8 proves accepted-invalid input cannot yield success. |
| Cycle 1 F4: false Wizard action-existence hold | Both existing current Wizard families pass valid original intake and all canonical seeds. Missing actual child/request, raw legacy seed, stale child/context, and loaded-family missing original open/receipt refuse. Artifact audit rejects reinstating the false prepared-family stop. |
| Cycle 1 F5: retired competing owner / broad questions | Current retired CWF is not reinstated. The artifact audit rejects `owner_doc=CONFLICT` for each of the four Wizard rows, broadening either exact Q1a/Q1b question, and reintroducing Q2. Current exact Q1a/Q1b holds are preserved verbatim; no Q2 action-existence question or answer is applied. These ownership-grade mutations are checked by the complete artifact audit, not presented as EventRecord fields. |
| Cycle 2 F1: LF hashes | All 36 exact original hash/size recipes pass on append/publish/retry. Source/owner hash matching cannot bypass validation. Full audit additionally covers stored payloads, reference bodies and all 23 direct identifier sites. |
| Cycle 2 F2: storage profiles/overflow | Unchanged profile checker: branch and current-main baseline both exit 1 with exactly the same 41 existing errors. All 9 mutations (delete, 16385-byte limit, derived placement for each of three profiles) are detected. Registry schema remains valid. |

The six original oversized values remain 23760 / 26927 / 30143 / 30157 / 24124 / 24548 bytes and refuse. Prior-finding contract audit: **119/119**; cycle-two audit: **461/461**; exact cycle-two recipes: **36/36**; final independent review audit: **991/991**. Artifact audit rejects four false owner conflicts, two false intake product stops, three broadened/reintroduced owner questions, and the original loaded-family wrong-heading citation (**10/10**). All six original positives, all 686 reviewed-head scenarios, all 357 cycle-two scenarios and every native obligation are unchanged.

## Questions for Jared — card-ready, no answer applied

**Q1a — wizard.blocked / current subject and emission predicate.** Under `Plans/Contracts_V0.md:14896` (CV-233) and `Plans/Contracts_V0.md:2686`, which exact existing PlanningRun or topic owner identity must `wizard_id` identify, and which existing blocked/remediation predicate emits this observation, including the current source of `round_count`? PWIZ-002 owns the current aggregate/topic model; shared route_target/blocked identity does not decide that subject or predicate.

**Review recommendation, unapplied:** retain an observation of the existing Planning Wizard blocked/remediation episode after Jared confirms its actual current subject/trigger. Use current route/blocked identity; do not resurrect a three-round threshold or separate wizard_status state machine. Subsequent identity/schema/checkpoint work is technical.

**Q1b — wizard.unblocked / matching current resolution predicate.** Under `Plans/Contracts_V0.md:14944` (CV-234), for that same confirmed current subject and blocked/remediation episode, which existing authorized resolution transition emits the corresponding observation, and how does `resolution_source` identify that actual resolution and preserve causality?

**Review recommendation, unapplied:** the corresponding observation when that same owner episode clears through an existing authorized resolution, preserving subject and causality. Confirm with Q1a; a route-open or replay never counts as resolution.

Current supporting evidence: `Plans/assistant-chat-design.md:3524`; `Plans/Planning_Wizard.md:116`. These holds do not reopen already-decided intake action existence or choose retirement/historical-only disposition. **Jared's answers: PENDING.**

## Scope, authority and IDs

The current semantic/physical/consumer bindings remain those already authored under DL-045: ACD-049/050 and ACD-571–574 for Deep Plan targeted revision; UCC-002/UCC-032, PWIZ-001/002 and PWIZ-097/098 for existing real-Project deferred Planning Wizard intake. Per-family search lineage remains `base-family-search.json` (SHA-256 `96832ddf6013b0116d2adff5ac939f365bb6928a4b2454d59435a1881d0f605a`) and `fix1-wizard-search.json` (SHA-256 `324dffe4d7426126626a8fe31fc4262d501880855d81d357a2c4441e5621180f`) in this evidence directory. No new family/consumer/projector/checkpoint/storage binding is authored this round.

Premises rechecked: DL-045 still includes all eight exact families and grants only bounded technical work. Current UCC 2.1A still normalizes the old command into the existing current intake, with actual Project/child identity. DL-076 still requires nine durable token fields and no persisted snapshot ID; SP-278 adoption is unchanged. Contracts EventRecord still excludes Storage-assigned metadata from semantic digest and independently refuses reader-only append. No older answer is used to choose retention, a blocked episode or a resolution. **Failed premise checks: none.**

**IDs used (existing): CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098. New IDs: none.**

Changed paths this round: `Plans/dcw_event_contract_fixtures.json`, `scripts/pm_dcw_event_oracles.py`, new `scripts/pm_dcw_event_regressions.py`, and this report/self-grade. No canonical owner markdown, schema, registry, physical profile or generated shard/index changed. Therefore owner-document regeneration was not required; read-only shard and parsed top-level index checks pass. All 15 ignored currentness files were copied and SHA-256 matched before index validation. No generated file was hand-edited.

No pm-mail, subagent, admission, exclusion, registry append, Decision Log, test-file, .gitignore, Spec Lock, auto-decisions, frozen validator, governance evidence, seal, landing lock or main push.

## Commands and exit codes

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_bundle_revision_events.py` | 0 | 1424 PASS: 179 original plus 1245 full-composition checks |
| `python3 scripts/pm_dcw_event_regressions.py` | 0 | 419/419 across checks 1-9; six failure-exit probes; 24 dangling-ref negatives and 24 otherwise-identical guard-disabled controls |
| `fix3-review-mutation-audit.py --before` | 1 | 967 cases: 955 expected; exactly the 12 review caller-policy acceptances reproduced |
| `fix3-review-mutation-audit.py (after)` | 0 | 991/991; zero unexpected acceptances; all 23 identifier sites guarded; six expected exit-1 failure probes |
| `fix3-prior-findings-audit.py` | 0 | 119/119 cycle-one F1-F4 contract mutations; six-family source/restore deferral full-CLI probes included |
| `fix3-cycle2-mutation-audit.py` | 0 | 461/461 review-derived cycle-two cases; 23 guarded identifier sites |
| `fix3-prior-counterexamples.py` | 0 | 36/36 exact cycle-two hash and original oversized-source recipes on append/publish/retry |
| `fix3-storage-audit.py` | 0 | Registry schema valid; unchanged profile checker has the identical 41 baseline failures; all 9 missing/over-limit/wrong-file profile mutants detected |
| `python3 scripts/pm-storage-recovery-contracts.py --self-test` | 0 | Parsed top-level pass, all 22 checks true |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | Parsed top-level pass |
| `python3 scripts/pm-plan-index.py validate` | 0 | Parsed top-level pass |
| `fix3-artifact-audit.py` | 0 | 96 cells, 210 exact current-source quotes, 10 artifact mutants refused; all original positives/scenarios/native obligations preserved |
| `git diff --check` | 0 | No whitespace errors |

The first prior-counterexample invocation raced its helper creation and exited 2 (missing helper); the rerun after creation exits 0 and its 36 results above are complete. No production/checker failure was hidden. The initial baseline mutation audit’s exit 1 is expected reproduction of the review, and each deliberate failure probe’s exit 1 is a required PASS outcome.

Native authentication, redb CAS, sync/pack/index issuance, actual append/recovery/restore and OS codecs remain **NOT_RUN**. Synthetic authority inputs verify static composition only. Open integration items: the two exact Jared holds, pending retention, individual admissions and the unchanged 41 baseline storage-profile errors. No native writer/readiness activation follows.

## Resources and cleanup

Entry: 18 GB available RAM; 148 GB root disk free. Before final report: 16 GB available RAM; 119 GB disk free. The 6 GB RAM and stricter 50 GB disk thresholds were met. Work used the requested detached sparse worktree `/home/sittingmongoose/pm-worktrees/DCW-fix3` from `/home/sittingmongoose/src/PuppetMaster`. After the final push, remove that literal worktree path; `fix3-completion.json` records the remote heads, clean state and removal. No temporary branch, server or browser was created. Temporary report/grade authoring helpers are removed; retained audit programs and outputs are pinned below.

## Retained evidence

All evidence below is under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/`. Reports/self-grade are copied there after final commit. Completion is recorded separately because it names that final commit. Each retained audit path is cited by this absolute directory plus filename and SHA-256.

| File | SHA-256 |
|---|---|
| `fix3-after-review-mutations.json` | `0369b4e6bcf2e2fdcfb31559f60f3c9a7e1209ce27169518252d498e61ce4ff6` |
| `fix3-after-review-mutations.txt` | `9fd891d1a291898889742d8dbebde071bc936157a437aa90329e63112d332aed` |
| `fix3-artifact-audit.json` | `69fc4b550f36c8f836485e4d09f0f44625033cbc55dc4e561f9ec93a03e702de` |
| `fix3-artifact-audit.py` | `bb0b756b58f3a22a02a01caed02bd9598562ab905f878bc194e50fdc0dd66c00` |
| `fix3-artifact-audit.txt` | `69fc4b550f36c8f836485e4d09f0f44625033cbc55dc4e561f9ec93a03e702de` |
| `fix3-before-review-mutations.json` | `70c3af0fabec965787a9924782771ada18c797efbe7ef0379e8998ca1672c3e6` |
| `fix3-before-review-mutations.txt` | `f8a0678c576a1be613f3bf4baa2bfd4ad9ecb92ed43755d936f806114ca62584` |
| `fix3-check-results.json` | `6df252b5b2ad0d6c02d24fa07389dbc30a6144a03592f8cd02422432ac524f4d` |
| `fix3-contract-check.txt` | `3aa85befaeffedd38c97bae6a4e3a659e22a8867e94437c8dfe01650818647a6` |
| `fix3-currentness-sha256.json` | `d16f37ebaecb14d83b684c606224b84a970c34fc7864933e98e28354bf172e34` |
| `fix3-cycle2-mutation-audit.py` | `6dfe0d3f874077a1856243a58afe622187d1767b929ed9d5acf8d2fe5e1e82f6` |
| `fix3-cycle2-mutations.json` | `60b37098e5480f01569395f176a7c63e4cba38cfca743c997fc862c3ba60b2f7` |
| `fix3-cycle2-mutations.txt` | `c4d492cab876ec4a1695136b1e51d310da205ef85304451c03642cfd6fd3970a` |
| `fix3-index-validate.txt` | `ff1e96f7461d55392b3ce15dad7d0d023087c01b89db7a0aecb6e5ef00510fd2` |
| `fix3-prior-counterexamples.json` | `0b82b6f6a7398d6f99030ba84ff94c2853f5992b12d441c4ab6587c3f1482ea7` |
| `fix3-prior-counterexamples.py` | `bad51d98e7b966a840e0d23320a9dff13d877266b2bf5a1ab3aa31f1bd54ea51` |
| `fix3-prior-counterexamples.txt` | `1437e4841ee8eb7af271d618bf32d508ffa2fc0e6d2dafc5165864dbcd8f6542` |
| `fix3-prior-findings-audit.py` | `6ad3cc56833ab38fb261ed68e6cb0988a96a9738d42d5dcf03029d4f71154a1d` |
| `fix3-prior-findings.json` | `4a7b0998968c5f61607f0c0f369ba27906315383223c15fcbb43e3099a37e378` |
| `fix3-prior-findings.txt` | `bc40bd97bd006e18adfb8db4fd473c970e6c915aa16f6589e35162265e8dbc23` |
| `fix3-review-mutation-audit.py` | `1064a4c377329582a9b9fcf560579404a131160a7280f5fe530c2a715be40fc2` |
| `fix3-shard-check.txt` | `353b434b8f99c23e82801aee68941ecef36e9fc71638a6bce463523cd6b01ade` |
| `fix3-standing-checks.json` | `686452a725213a8c6ee1bebae03889583cbdc8f21efdd9d200949d84134201b1` |
| `fix3-standing-checks.txt` | `0120d0f29f7dd61cfc3cf5c151f4cf174418d0e6d00cc751624af005e34d3d8a` |
| `fix3-storage-audit.py` | `7e28f667038725cfaf0980908a6cced067f225cb341cc555bb327912be6c6264` |
| `fix3-storage-audit.txt` | `e13a391a36b9dd8a0ca8ac2b616a12607673f3a59cf9acd95d17d09cada6323a` |
| `fix3-storage-recovery.txt` | `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
| `fix3-storage-regression.json` | `487d6cb10ca00399265fa081f5dd0f6ecde1fdf90831e0b02851251e86e04b5a` |
