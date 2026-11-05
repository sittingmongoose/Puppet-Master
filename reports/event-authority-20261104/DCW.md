# DCW — fix round 6, Event Authority

Branch `plans/ea-w2-chain-wizard-20261104`; implementation `65c1465f9ee495333943ef7881f960fe8f1cb972`; reviewed `2b1c118e7e52a3d1d8c3f82914599dbf67ce15c2`. Worker DCW-FIX6, VM. This is the second and last post-Astra technical round. Report/grade follow-up changes no implementation.

**0/6 prepared passes before (Sol cycle 6) → 6/6 after; 6/8 assigned.** Each prepared family moves from 8 PASS / 3 PARTIAL / 1 ABSENT to 10 PASS / 1 PARTIAL / 1 ABSENT. Membership remains ABSENT, retention PENDING_RETENTION_DECISION and native execution NOT_RUN. Both Wizard holds remain unanswered.

## Review round 6: findings and responses

- **F6-A — fixed (65c1465f9ee495333943ef7881f960fe8f1cb972). Where:** scripts/pm_dcw_event_oracles.py:245/248/251/304/349/472 and exact_equal; envelope/source/receipt integer domains; local predecessor sequence validation. **Why:** mathematical JSON Schema integer and Python numeric equality authenticated integral-float aliases. **Fix:** mandatory pm-uint representation validation, exact nested types plus canonical MessagePack bytes at original/prepared/source/receipt/owner joins; authenticate the supplied compatibility view before resolving the retained original. Retained history, read access/withdrawal and caller Storage-metadata exclusion remain independent. Verify the complete checker, numeric-probes, receipt/type sweep, fixed legacy replay and full guard table.
- **F6-B — fixed (65c1465f9ee495333943ef7881f960fe8f1cb972). Where:** canonical_json/digest/compact_digest/event_reference, local bundle identity, all six payload schemas and CV-590–595. **Why:** descriptor byte_size and phase_sequence admitted multiple numeric encodings. **Fix:** one integer-only JSON domain before hashing, compact UTF-8 encoding, sorted object keys and exact descriptor text. Decimal/exponent floats refuse, parsed -0 normalizes to integer 0, and 01/-01 fail JSON syntax. Original descriptor/digest/source/commitment observations remain coherent in the negatives. Six independent family recipes bind the same rule. Verify 36/36 integer descriptor paths accept, 36/36 float paths refuse, eight local float identities refuse, expanded spelling controls and the guard matrix.
- **F6-C — fixed (this report/grade follow-up). Where:** loaded-family Storage evidence under producer, retention, custody, consumers and compatibility in DCW.self-grade.json. **Why:** eight quotations routed to the opened-family heading. **Fix:** exact mappings 30011→30028, 30007→30024, 30013→30030, 30015→30032 and 30017→30034, including repeats. Every exact quote and owning heading is audited; a deliberately restored wrong heading refuses.

**Item 11 sweep:** exact boolean values, integer types, payload object types and list containers are exercised in all six families. Source/event pack readability and durability, writer cutoff, reader withdrawal, rebuild admission/completion, recovery epochs, CAS, original payloads/receipts, membership/permission/output/group lists all refuse wrong types. String booleans, string numbers, null, arrays, nested objects and integral floats are explicit controls. The local predecessor oracle checks the exact integer type before arithmetic. No production guard is weakened.

F5-A remains resolved: four bundle null lists still omit payload_ref, with independent SP-337 routes. F5-B remains resolved: the original 1,544 negatives, coherent secret/policy/child copies, all old case IDs, positives and native obligations are retained. Both original fixture files and the other three owner Markdown documents are byte-identical to the reviewed head. Astra's 183 exact probes and 306 independent byte/reference probes pass.

## Family grades before and after

| Family | Before (Sol 6) | After |
|---|---|---|
| `bundle.revision_requested` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `bundle.revision_started` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `bundle.revision_completed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `bundle.revision_interrupted` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `wizard.blocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared |
| `wizard.deferred_payload.loaded` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `wizard.opened` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `wizard.unblocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared |

All 96 cells are reassessed. The twelve recovered cells are producer and positive_negative_oracles for the six prepared families. No admission or retention answer follows from these grades.

## Eleven standing checks and full guard table

All 66 standing family/check cells pass (1,328 outcomes). Check 2 covers Project-only refusal of application keys, not application writer support. Checks 1–10 retain independent writer-policy admission, encoded partitions, complete canonical bytes and SP-337 transport, LF refusal, semantic-only retry comparison, checkpoint identity, nonzero failure exit, eager references and retained-history/withdrawal behavior.

Check 11: **132/132 require sites; 2,330/2,330 full-checker negatives (786 new); 1,015 configurations / 394,263 cross-tests; zero unrelated acceptances or unrelated refusal changes.** The 155 changed labels still name the same invariant's duplicate. Legacy: 182/182 negatives, 15 assertions and 8,356 fixed-configuration cross-tests; 21 added local predecessor-type controls. [Complete guard table](DCW.guard-removal.md) names every site and duplicate set, with exact flip/reject complements in the SHA-bound external JSON.

The numeric schema and exact-authentication/descriptor guards intentionally repeat one invariant. Their older original-value, receipt or descriptor witnesses also flip when that named set is removed. The proof now labels those three numeric duplicate groups explicitly. It does not change the input, production guard, mutation result or rejected-ID matrix. No global verify=accept, no-op legacy validator, blanket schema bypass or skipped relational check establishes guard acceptance.

## Every recurring Astra defect class

| Item | Fresh probe / evidence |
|---|---|
| 1 Forged/contradictory inputs | Existing identity, digest, original-owner/source joins and repaired full-value witnesses all pass; exact original sequence/payload substitutions are added. Authority maps are synthetic adapters, native issuer authentication NOT_RUN. |
| 2 Payload-supplied Storage metadata | Integral-float event and receipt sequences refuse; typed receipt/group joins use actual recorded originals. Caller-only Storage fields remain outside semantic comparison. |
| 3 Historical readers in both directions | Fresh valid retained reads survive cutoff, obsolete CAS, unknown effect and lost current write access; withdrawal refuses. Numeric forged compatibility views refuse before original substitution. |
| 4 One value read two ways | Exact nested types/canonical bytes and mandatory integer representation format; numeric/string/boolean aliases refuse. |
| 5 Unvisited dangling refs | All unused local/external source/payload reference CLI probes refuse; preflight-only counterfactual controls pass. |
| 6 Partial sizes / contradictory prose | 306 independent MessagePack/boundary/reference checks pass. All stored parts are measured independently; the old payload_ref null contradiction stays removed. |
| 7 Custody / wrong family | Existing six-operation original custody, predecessor, restore inventory, wrong-family dispatch and checkpoint witnesses pass. |
| 8 Masked negatives | Entire prior pool plus 786 new witnesses flip for only their guard/named duplicate invariant; exact other-negative complements retained. |
| 9 Inflated grades | Current 96-cell/quote/heading audit rejects missing proof, unsupported PASS, stale quotes and a falsely resolved hold. |
| 10 Numbers written two ways | Decimal, exponent, extra decimals, exponent sign/case, negative exponent, normalized -0 and invalid 01/-01 controls; no float descriptor or local float identity accepts. |
| 11 Types confused | 858 independent production-path probes and new isolated whole-checker witnesses; exact booleans, integers, object payloads and list containers. Unsupported payload types remain schema domain controls, not invented accepted EventRecords. |

## Questions for Jared — card-ready, no answer applied


**Q1a — wizard.blocked / current subject and emission predicate.** Under `Plans/Contracts_V0.md:14896` (CV-233) and `Plans/Contracts_V0.md:2686`, which exact existing PlanningRun or topic owner identity must `wizard_id` identify, and which existing blocked/remediation predicate emits this observation, including the current source of `round_count`? PWIZ-002 owns the current aggregate/topic model; shared route_target/blocked identity does not decide that subject or predicate.

**Review recommendation, unapplied:** retain an observation of the existing Planning Wizard blocked/remediation episode after Jared confirms its actual current subject/trigger. Use current route/blocked identity; do not resurrect a three-round threshold or separate wizard_status state machine. Subsequent identity/schema/checkpoint work is technical.

**Q1b — wizard.unblocked / matching current resolution predicate.** Under `Plans/Contracts_V0.md:14944` (CV-234), for that same confirmed current subject and blocked/remediation episode, which existing authorized resolution transition emits the corresponding observation, and how does `resolution_source` identify that actual resolution and preserve causality?

**Review recommendation, unapplied:** the corresponding observation when that same owner episode clears through an existing authorized resolution, preserving subject and causality. Confirm with Q1a; a route-open or replay never counts as resolution.

Current supporting evidence: `Plans/assistant-chat-design.md:3524`; `Plans/Planning_Wizard.md:116`. These holds do not reopen already-decided intake action existence or choose retirement/historical-only disposition. **Jared's answers: PENDING.**



## Scope, authority and IDs

No new PlanUnit, family, product feature, identity domain or owner decision is invented. Existing IDs only: **CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098** (17). No registry append, admission/exclusion/application record, Decision Log, .gitignore/test-file edit, Spec Lock/governance evidence/auto-decision edit, frozen-validator change, main push or reseal.

The pinned main/review base is c76d1cf756d504a91655a978dcee9f3ead7562d3. During this round origin/main advanced to bc399e19742ddc6afd1a1cb1d77a33845341d565. All twelve applied premise units are byte-identical there (main-premises.json); concurrent UI/onboarding edits stay for integration to reconcile, without rebasing this reviewed fix branch. The four relevant owner documents at the pinned review base remain prefixes of this branch's owner documents. DL-045's scope, ACD-049/050 targeted Deep Plan revision, current PWIZ/UCC real-Project intake with its three canonical seeds, DL-076/SP-278 token model and SP-026/SP-337 byte/overflow premises remain as previously verified. No old retention answer or held predicate is applied; no premise failed. Per-family search lineage: drafts/DCW/base-family-search.json SHA-256 96832ddf6013b0116d2adff5ac939f365bb6928a4b2454d59435a1881d0f605a; drafts/DCW/fix1-wizard-search.json SHA-256 324dffe4d7426126626a8fe31fc4262d501880855d81d357a2c4441e5621180f.

Only CV-590–595 owner prose changes. Shared integer schema annotations and the three source-schema mirrors are consistent; derived changes belong only to contracts_v0, event_record.schema and storage_value_registry, plus the aggregate index. Fifteen copied ignored currentness files matched by SHA-256 before generation. Generated artifacts are regenerated, never hand-edited.

## Commands and exit codes

| Check | Exit | Result |
|---|---:|---|
| pm_bundle_revision_events.py | 0 | 2,869 static cases; 2,690 full composition |
| pm_dcw_event_regressions.py | 0 | 1,328 outcomes; all 66 cells |
| pm_dcw_event_isolation.py (no author diagnostics) | 0 | Complete matrix above |
| Fixed legacy-recheck.py / local-phase-types.py | 0 / 0 | 182 negatives, 15 assertions, 8,356 cross-tests / 21 type cases |
| Reviewer numeric / descriptor / local identity probes | 0 / 0 / 0 | Zero unexpected accepts; integer controls preserved |
| type-sweep.py | 0 | 858 production-path cases |
| astra-exact-replay.py / independent-event-bytes.py | 0 / 0 | 183 / 306 exact cases |
| storage audit / storage recovery self-test | 0 / 0 | Same 41 pre-existing profile errors on branch/main; all nine profile mutants; recovery top-level pass |
| shard/index generate; shard check | 0 | Only expected owners; parsed top-level pass |
| index validate, pinned review base / moving main | 0 / 1 | Pinned pass; moving-main DL-302 absence plus 21 unrelated legacy-ledger diagnostics |
| preservation and final artifact audits; git diff --check | 0 | No fixture/native/hold loss; quotes and headings current |

The index validator hardcodes origin/main. Both unmodified checks are retained: the moving-main run detects DL-302 added after this reviewed branch, then reads 21 malformed pre-existing removal-ledger records; the immutable reviewed-base run passes against the identical worktree using a temporary private Git object view. No shared ref, checker, schema or guard was changed. Integration must reconcile the concurrent main changes.

The old Astra CLI harness replaced a valid positive with a forgery. Its replay now keeps the positive valid and expresses the same forgery as explicit mutations, so newly generated valid-base witnesses are not built from a forged precursor. Early runner setup errors and duplicate-label diagnostics were corrected before final runs; no failing intermediate result supports a PASS claim.

## Evidence, resources and cleanup

Evidence directory `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/fix6`. Every cited raw result is outside the repository and bound by path plus SHA-256 below. The result includes the final replay programs and complete exact guard matrices. Native issuance/authentication, actual append/CAS/restore/durability and individual admissions remain NOT_RUN. Integration items: the two exact Jared holds, retention, admissions/native evidence, unchanged 41 profile baseline errors and eventual governance reseal.

Entry resources: 8 GB available RAM / 85 GB disk free. Subsequent samples stayed above the 6/50 GB stop thresholds. A read-only mailbox command overlapped the first brief read; after reading its explicit prohibition there was no registration, coordination, sent mail or further mailbox use. No subagent, browser or server was started. After the final push/copy, remove the literal detached sparse worktree /home/sittingmongoose/pm-worktrees/DCW-fix6. Completion records final remote SHA and removal.

| Evidence file | SHA-256 |
|---|---|
| `isolation-final.json` | `454f402a99324cd0bbc7ccce3502689375c9417872a3248002e09a8a3e216882` |
| `legacy-recheck.json` | `68fc955ec22e752964b20e4aaa5dee7cdcfb53f225595e087862c6630dff12bb` |
| `standing-final.json` | `aa4d761f695b3d96aa162c229d15ec8c0449531507a808810bb5eb485b4a1bbd` |
| `numeric-probes.json` | `43f6b3eae469a923d2bf6ec431106b7171766aaa026488bd89f8b2542250c42f` |
| `reference-numbers.json` | `a4baa0ac21ce67f0190661359cc701aca0b453e6909488b352969c4ef2d27384` |
| `local-number-identities.json` | `b393376e103d1440312b58b99f6b5b341e7938733c6ad506e0a3176b361b6dee` |
| `type-sweep.json` | `7e05a9d9796651728c595033654b14698986c8baf852c1781b22182458c67176` |
| `local-phase-types.json` | `e4dbe16f6b361c2b7b0edbd0e8b10398543567c794fa607c18753c756f09edde` |
| `astra-exact-replay.json` | `9ef1bb5a494da7ba7a59aece019148a9cb49f893c9a4fa5a3e45b909691df4f9` |
| `cycle5-event-bytes.json` | `09405ab6d73a9916e5677eabbe195cebeccfb46bcd9111f37766ca639586c60d` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `preservation.json` | `4b6bbd218a7527c30f0316db89415f7e9bd9f42f4dcd3b3410f6b30e6e881192` |
| `cycle6-storage-regression.json` | `487d6cb10ca00399265fa081f5dd0f6ecde1fdf90831e0b02851251e86e04b5a` |
| `main-premises.json` | `2fb9446c6863436fbfa15fa7837a1626ad31bed3718965cca61e1e6a865da2d3` |
| `index-baseline-comparison.json` | `e28b4329b73723ccb755db51288699eb0377b82bbf33b3b0be5c9f72d89c6334` |
