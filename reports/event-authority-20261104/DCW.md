# DCW — fix round 2, Event Authority

Branch: `plans/ea-w2-chain-wizard-20261104`. Reviewed head: `b72cdbff1596b8e2724a31b43d9ea7d8dcbca083`. Assessed implementation head: `610d0a8a8eb092649dd386e1e9d1311f66ae5b1a`; the final report/self-grade commit changes no assessed source. Worker: DCW-FIX2, VM, detached sparse worktree `/home/sittingmongoose/pm-worktrees/DCW-fix2` from `/home/sittingmongoose/src/PuppetMaster`. This is the final fix round before the review cap.

**Self-grade: 0/6 drafted prepared passes before → 6/6 after (6/8 assigned).** No admission or exclusion. Membership ABSENT and pending retention PARTIAL remain the two instructed preparation exceptions. Native execution is NOT_RUN. The two owner holds remain unanswered, with their questions copied verbatim below.

## Family grades before and after

Before is the independent cycle-two re-grade, not the overstated previous worker self-grade. Every after cell cites current owner text/schema/checker evidence in DCW.self-grade.json.

| Exact family | Before | After | Outcome |
|---|---|---|---|
| bundle.revision_requested | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| bundle.revision_started | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| bundle.revision_completed | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| bundle.revision_interrupted | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| wizard.blocked | 6 PARTIAL / 6 ABSENT | 6 PARTIAL / 6 ABSENT | stopped for Jared |
| wizard.deferred_payload.loaded | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| wizard.opened | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared without admission |
| wizard.unblocked | 6 PARTIAL / 6 ABSENT | 6 PARTIAL / 6 ABSENT | stopped for Jared |

## Review round 2: findings and responses

1. **F1 — FIXED (`28cf1ebde930160f617398fbd097701ada73c19a`).** Where: all three `Plans/dcw/*.schema.json` source schemas, both `Plans/event_payloads/planning_wizard/*.schema.json` payload schemas, mirrored source schemas in `Plans/storage_value_registry.json`, and `scripts/pm_dcw_event_oracles.py:245`. Cause: Python JSON Schema's anchored `$` permits a trailing LF, and stored Wizard EventRecord payloads previously depended on equality without exact payload-schema dispatch. Fix: every original SHA256 pattern has minLength=maxLength=64; both stored Wizard payloads are independently dispatched to their exact family schema. Added 53 full-checker negatives: matching malformed original/owner hashes on append/publish/retry, each source hash site, both Wizard payload hashes and both stored payload copies. F2's three BLAKE3 reference IDs receive the same length guard and LF negatives. Verification: full checker PASS; direct schema and review-derived audit find zero LF acceptances at all 23 identifier-pattern sites (20 SHA256, three BLAKE3).
2. **F2 — FIXED (`610d0a8a8eb092649dd386e1e9d1311f66ae5b1a`).** Where: `Plans/storage-plan.md:29941` (SP-579), `:30007` (wizard.opened), `:30024` (wizard.deferred_payload.loaded), the three family_profiles/closed source schemas in `Plans/storage_value_registry.json`, and `scripts/pm_dcw_event_oracles.py:302`. Cause: the sources lacked physical profiles and only the EventRecord payload size was checked; SP-579 also mis-cited SP-338. Fix: independently bind each non-rebuildable source to canonical redb, runs_and_goals, its existing 4 GiB advisory canonical budget and max_value_bytes=16384 under SP-340. Replace the size citation with SP-337/SP-340. Closed inline/reference alternatives preserve the same typed key and value_revision CAS. Overflow stores the complete original canonical MessagePack source in SP-337 packs with BLAKE3, byte_size and an exact per-source media_type. Actual synthetic adapter inputs must prove matching content, key/identity, durable bytes/index and current access. Restore authenticates the physical source row and exact reachable payload inventory at the verified boundary. No truncation or retention/deletion policy was selected. Verification: 16383/16384-byte inline positives, 16385-byte inline refusals, 16385/24576-byte reference positives across writer/read/rebuild paths, invalid-reference and coherent/incomplete restore cases all pass. The unchanged repository profile checker falls from 44 to the same 41 missing profiles on origin/main: zero DCW additions.

No finding is disputed. The six cycle-one resolutions/preservations remain intact; all six original positive fixtures, all 357 authored scenarios underlying the original 808 checks, and every native obligation are unchanged. No prior negative was removed or relaxed. Retry-candidate and checkpoint coverage added during the required standing audit is in the F2 commit, with full-checker positives and negatives.

## All eight standing checks — independently run on every drafted family

| Check | Result |
|---|---|
| 1. Current writers/retries never select projector_replay_only | PASS. Every successful authored writer variant is rerun with reader-only replay and refuses as replay_only_not_appendable; prepared-source negatives and passive compatibility contracts remain. |
| 2. CV-366 application idempotency format | NOT APPLICABLE to all six project-only contracts. Each has a full-checker application-scope refusal; no application identity recipe/fallback was added. |
| 3. Encoded project partition | PASS. Original receipts use project~ plus canonical base64url/no-padding Project ID; raw and other-Project partitions refuse. |
| 4. 16 KiB / SP-337 | PASS. All source representations have exact canonical-MessagePack size boundaries and full referenced-payload admission/restore negatives; existing EventRecord inline admission remains. |
| 5. Pattern guards and trailing LF | PASS. All 23 local identifier patterns are exactly 64 lowercase hex characters, mirrored in the registry. Payload, stored-copy, original-source and referenced-body LF negatives refuse. |
| 6. Caller semantic retry body only | PASS. Storage-assigned observed/persisted times and sequence changes on the retry input pass; a changed caller payload refuses idempotency_conflict. The original full stored event still undergoes independent full-value receipt authentication. |
| 7. Event/checkpoint Storage identity | PASS. Positive fixtures match. A different source/authority/selected Storage instance with the original checkpoint now refuses checkpoint_storage_instance (`pm_dcw_event_oracles.py:383`). |
| 8. Failure oracle rejects success | PASS. For each family, a subprocess deliberately reintroduces acceptance of the 16385-byte direct source; the complete runner exits 1 on its negative oracle. |

Full suite: **1262 cases**, comprising the retained 179 original local checks and 1083 full-composition checks. The latter retain the original 629, add 53 F1 cases and 276 F2/standing cases, and add 125 reader-policy regressions over every successful writer variant. A separately retained adaptation of the blind review's mutation harness passes **437/437** with no unexpected acceptance. It adds only the current fixture's exact-size/base-case setup; the review's expectations and original mutations are preserved. The standalone standing audit passes all eight checks on all six families and six intentional nonzero-exit probes.

## Questions for Jared — card-ready, no answer applied

**Q1a — wizard.blocked / current subject and emission predicate.** Under `Plans/Contracts_V0.md:14896` (CV-233) and `Plans/Contracts_V0.md:2686`, which exact existing PlanningRun or topic owner identity must `wizard_id` identify, and which existing blocked/remediation predicate emits this observation, including the current source of `round_count`? PWIZ-002 owns the current aggregate/topic model; shared route_target/blocked identity does not decide that subject or predicate.

**Review recommendation, unapplied:** retain an observation of the existing Planning Wizard blocked/remediation episode after Jared confirms its actual current subject/trigger. Use current route/blocked identity; do not resurrect a three-round threshold or separate wizard_status state machine. Subsequent identity/schema/checkpoint work is technical.

**Q1b — wizard.unblocked / matching current resolution predicate.** Under `Plans/Contracts_V0.md:14944` (CV-234), for that same confirmed current subject and blocked/remediation episode, which existing authorized resolution transition emits the corresponding observation, and how does `resolution_source` identify that actual resolution and preserve causality?

**Review recommendation, unapplied:** the corresponding observation when that same owner episode clears through an existing authorized resolution, preserving subject and causality. Confirm with Q1a; a route-open or replay never counts as resolution.

Current supporting evidence: `Plans/assistant-chat-design.md:3524`; `Plans/Planning_Wizard.md:116`. These holds do not reopen already-decided intake action existence or choose retirement/historical-only disposition. **Jared's answers: PENDING.**

## Scope, authority, bindings and IDs

Current owner/premise basis remains ACD-049/050 and ACD-571–574 for the existing Deep Plan targeted revision path; UCC-002/UCC-032, PWIZ-001/002 and PWIZ-097/098 for the existing real-Project deferred Planning Wizard intake. CWF remains retired. The six current semantic/emitter/history-reader contracts, per-family identity recipes, SP-278 generic checkpoint adoption, DL-076 nine-field durable token and SP-286/CV-339 full-value original receipt contract are preserved. Neither held event gets a producer, subject, trigger or resolution by inference. No older decision selects retention.

Per-family current-canon search and lineage remain in the prior report's retained evidence: `base-family-search.json` SHA-256 `96832ddf6013b0116d2adff5ac939f365bb6928a4b2454d59435a1881d0f605a` and `fix1-wizard-search.json` SHA-256 `324dffe4d7426126626a8fe31fc4262d501880855d81d357a2c4441e5621180f`, in this lane's evidence directory. This round repairs those exact existing source families; no sibling-derived behavior or new product action is introduced. SP-337/SP-340 are re-read current technical storage owners. The new physical binding is independently stated in SP-579 and each Wizard's named source section; the canonical and payload group budgets are existing owner defaults, with no new group or policy.

Shared-file hunks this round: SP-579 plus the two exact-family custody sections in `Plans/storage-plan.md`; only the three DCW value-schema rows and three new family_profiles in `Plans/storage_value_registry.json`. Companion changes are the three source schemas, two Wizard payload schemas (F1), six-family full fixtures and `pm_dcw_event_oracles.py`. Contracts, semantic owners and all other registry families/profiles are unchanged. Derived owners are **storage-plan and storage_value_registry only**, plus generated global `.plan_index` outputs. Currentness edition: all 15 ignored files copied before generation and SHA-256 matched. Top-level index validation is parsed, never a nested status. Generator timestamps retain the previously documented clock-metadata exception.

**IDs used:** existing CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098. **New IDs this round: none.** No event registry append, admission, exclusion, Decision Log entry, Spec Lock, auto-decisions, frozen validator, governance evidence, test file or .gitignore edit. No subagents, main push, landing lock, reseal or aggregate governance/landing check. An initial environment probe ran pm-mail inbox/who before the no-mail instruction was read; no messages/registration were sent, and there were no further mailbox calls.

## Verification

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_bundle_revision_events.py` | 0 | PASS: 1262 cases, including 1083 full-composition cases; original 179 also retained |
| `review-derived mutation audit` | 0 | PASS: 437/437; zero unexpected acceptances |
| `all eight standing checks on each drafted family` | 0 | PASS: six families; 23 guarded patterns; six injected-defect subprocesses exit 1 |
| `python3 scripts/pm-storage-profile-check.py` | 1 | 41 pre-existing missing profiles; identical to current origin/main; zero DCW errors |
| `storage_value_registry.schema.json validation` | 0 | PASS, including all three closed source-schema mirrors and physical profiles |
| `python3 scripts/pm-storage-recovery-contracts.py --self-test` | 0 | top-level status pass; failures=[] |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | PASS; only storage-plan and storage_value_registry derived owners |
| `python3 scripts/pm-plan-index.py generate` | 0 | top-level status pass |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | top-level status pass |
| `python3 scripts/pm-plan-index.py validate` | 0 | top-level status pass |
| `original fixtures/native obligations and forbidden-path audit` | 0 | PASS; all 357 original authored scenarios and six positives unchanged; no new IDs or forbidden paths |
| `git diff --check` | 0 | PASS |

The profile check's 41 baseline failures are explicitly retained, not fixed by this lane or hidden by a changed checker. The two Wizard holds and pending event/source retention remain integration items. Static fixtures use synthetic trusted owner/Storage/payload observations. Actual native authentication, redb CAS, sync/pack/index issuance, coherent backup/restore and OS codec adapters remain **NOT_RUN**; no writer/buildability activation follows.

Entry resource checks: 14 GB available RAM, 104 GB free root disk; before final checks: 12 GB RAM, 108 GB disk. The 6 GB RAM and 50 GB disk thresholds were met. Sparse worktree only; cleanup of `/home/sittingmongoose/pm-worktrees/DCW-fix2` after the pushed report commit is recorded in `fix2-completion.json`. No server, browser or temporary branch was created.

## Retained evidence

All paths below are relative to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/`. Report and self-grade are copied there after the report commit. The source review is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DCW-sol/REVIEW-cycle2.md`. The quote verification and completion manifest accompany the final copies; authoring helpers and unused intermediate outputs are removed.

| File | SHA-256 |
|---|---|
| `fix2-check-results.json` | `3beacd59ceea07aea0f9ffa3b91653fadf094858594cd8a350e9536d73405e27` |
| `fix2-contract-check.txt` | `9d51b64b629c14be0d02d3ec4a4db6423304c8b13e7a98eb24043de5563d4e8b` |
| `fix2-independent-mutation-audit.py` | `1b5c8ed15a088b8072f08a073eaa4a1f7d980346eac8350b2b23ec62e7fa62c7` |
| `fix2-independent-mutations.json` | `119dd6359c501b9a93f5bf0e1fef10eced135ddee12168cc7017b173bd664bdd` |
| `fix2-standing-checks.py` | `7b0263d51493c80616d54512018741afbe95dcebb4d553c7b55728a18f0f58e1` |
| `fix2-standing-checks.json` | `4c01b61a14ca9af0af2a9d25ce5a069413c35d2aa70a2dccf1393a31bb25dbc2` |
| `fix2-storage-profile-before.json` | `79ee2f8f504b4413ab49edb5bcb020ac187f646bd3ae04f6da8a094ead5cdbbe` |
| `fix2-storage-profile-after.json` | `0d92677ea417d13c91fa23807cdd08fa4781ba1f9ac0786d396a885393d6e6a2` |
| `fix2-storage-profile-regression.json` | `b9fc89f51b2a12eea07acf864ce9814d82592342076e00cab73df60062411237` |
| `fix2-storage-recovery-check.txt` | `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
| `fix2-currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `fix2-shard-generate.txt` | `8c69184b47a3633087138322660fd620b900339e49e603fbc29230e5ade7a015` |
| `fix2-index-generate.txt` | `354d5f3d21b5cf22b71105038a4bfbdd4185480276f83ea053a4beafaf3924cc` |
| `fix2-shard-check.txt` | `353b434b8f99c23e82801aee68941ecef36e9fc71638a6bce463523cd6b01ade` |
| `fix2-index-validate.txt` | `2a2dfff3a637f464486ae15b80f4217dfda22224587cbbd56911af405ee9bc25` |
| `fix2-structural-checks.json` | `2993dd88f37b562b20dbeef6eeacdee8470f9de459a7b78891b3ea7107e9c044` |
| `fix2-f1-contract-check.txt` | `63053804ac53c92fa80f14286dbae642b62e5b9bdc8435024368f46097ad407a` |
| `fix2-f1-index-validate.txt` | `86e90f94d6e1b312fe3c1bb35349b129a433d6bad19dab8ea7a58355da02a9d2` |
| `fix2-f1-shard-check.txt` | `a715ce384c99d89a8b5576fb6a07f92786372746197d08d9bad57c619fec35c1` |
| `fix2-quote-check.json` | `d515bf41574a87b43c1ccac280aa97d589c948d908c523e6e710a9c961dccfa5` |
| `fix2-independent-mutation-check.txt` | `db159941a982e54139a6c87d77f4f59b097274f1f802fc234897deb89f005d68` |
| `fix2-standing-checks.txt` | `1437ac5faca3ba1afbfca3b409363a77a3368f037c782d51c50d76a2d540aac7` |
