# DCW — fix round 5, Event Authority

Branch: `plans/ea-w2-chain-wizard-20261104`. Worker **DCW-FIX5**, VM. Reviewed head `a40804394229feeed0719be388bec80cf16a9561`; implementation `de555ce0387eb3875e52a174e61fed6e97a2564a`. This is the first of the two post-Astra technical rounds. Report/grade follow-up changes no implementation.

**0/6 prepared passes before → 6/6 after (6/8 assigned).** Before is Sol cycle 5, not the prior worker claim. Each prepared family has 10 PASS / 1 PARTIAL / 1 ABSENT. Membership remains ABSENT, retention PENDING_RETENTION_DECISION and native execution NOT_RUN. `wizard.blocked` and `wizard.unblocked` remain held for Jared.

## Review round 5: findings and responses

- **F5-A — fixed (`de555ce0387eb3875e52a174e61fed6e97a2564a`). Where:** `Plans/Contracts_V0.md` CV-590/591/592/593, lines 24509, 24586, 24663, 24740–24741. **Why:** unconditional payload_ref=null contradicted the SP-337 descriptor route. **Fix:** the null list now contains only node_id/requested_account_ref/effective_account_ref. Each family's inline/reference alternatives alone decide payload/payload_ref. Both Wizard CV units, six independent family bindings and shared envelope remain unchanged. Verify the four unit bodies and `python3 scripts/pm_bundle_revision_events.py`; independent MessagePack boundaries and referenced transports still pass.
- **F5-B — fixed (`de555ce0387eb3875e52a174e61fed6e97a2564a`). Where:** `Plans/dcw_event_contract_fixtures.json`, `scripts/pm_dcw_event_fixtures.py`, both existing runners/standing checks, and `scripts/pm_dcw_event_isolation.py`. **Why:** policy, secret, child, receipt, hash and terminal negatives left unrelated observations stale, while the old 264-witness subset did not cover them. **Fix:** rebuild from valid originals and align every relevant observational copy. wrong_writer_policy_append_once/dedupe_by_event_id align prepared originals and recorded commitments; payload_raw_secret uses a body field with coherent owner/source/event copies; stale_child_revision now changes source.child.revision and the authenticated child copy, failing child_currentness. A separate current_child_join negative tests a foreign child identity. Receipt sequence/commitment mirrors, caller semantic changes, original document/seed joins, source/event reference fingerprints, trailing-LF copies and extra-field copies are coherent. Distinct second terminals have sequence 3, their own identities/results/receipts and a common consumed start; their duplicate guards are named and restricted to that fork. Generated writer/caller negatives and original local bundle schema negatives are repaired too. The 87 duplicate Wizard opened-source observations are aligned. Verify `python3 scripts/pm_dcw_event_isolation.py --output <evidence>.json` and the legacy proof program below.

Astra F1 compatibility-view authentication and F2 canonical byte/reference behavior remain fixed: 183/183 exact Astra probes and 306/306 independently encoded MessagePack/transport cases pass. All 131 production require predicates and legacy validate AST are unchanged. No guard or schema was weakened; counterfactual controls run only in a separate module copy.

## Family grades before and after

| Family | Before (Sol cycle 5) | After | Full-checker isolated negatives |
|---|---|---|---:|
| `bundle.revision_requested` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 249 |
| `bundle.revision_started` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 254 |
| `bundle.revision_completed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 255 |
| `bundle.revision_interrupted` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 253 |
| `wizard.opened` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 265 |
| `wizard.deferred_payload.loaded` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 268 |
| `wizard.blocked` | 6 PARTIAL / 6 ABSENT | unchanged; Q1a held | — |
| `wizard.unblocked` | 6 PARTIAL / 6 ABSENT | unchanged; Q1b held | — |

All 96 cells are reassessed against current evidence. Only the four bundle producer cells and six oracle cells recover from PARTIAL to PASS; the two held rows, membership and retention do not change.

## Eleven standing checks

All 66 family/check cells pass. Check 2 is Project-only refusal coverage, not application writer support. Writer/caller replay-only admission rejects independently; exact CV-366 foreign keys and encoded project~ partitions are tested; source and event overflow use separate SP-337 references; identifier syntax, caller semantic-only dedupe, checkpoint identity, nonzero failure exit, eager refs and retained history all pass.

Check 11 covers **1,544/1,544** full-checker negatives: 973 authored negatives, 272 generated required-property negatives and 299 generated writer/caller admission negatives. **131/131 require sites** have a flipping witness: 104 single removals and 27 named duplicate configurations. There are **970 configurations / 249,745 cross-tests**, zero unrelated acceptances and zero changes to an unrelated refusal. The 155 changed labels are still refusal by the same invariant's named duplicate. All **182/182 local legacy negatives**, all 15 semantic assertions and 8,356 legacy cross-tests pass. The 45 prefix/profile/codec controls pass; complete-CLI exit/ref probes retain 30 valid controls. Counts overlap; they are not unique runtime executions.

[The guard-removal table](DCW.guard-removal.md) names every require site, duplicate pair, exact schema keyword/property, flipping IDs and the exact complementary rejected-ID matrix. It explains absence/required-field continuations and codec-only domain controls. The full JSON table is retained externally with a SHA-256 binding below. Earlier composite cases have been repaired, not exempted from isolation.

## Every recurring Astra defect class, all six prepared families

| Class | Fresh mutation and how it is ruled out |
|---|---|
| 1 Forged/contradictory inputs | A foreign recomputed-key claim and arbitrary original commitment fail identity/original_commitment for every family, with isolated disabled-guard controls. Event identity, producer digest, full commitment and source/event pack hashes are recomputed. Document/seed/context joins compare independently supplied original owner observations field by field. Those observations are synthetic adapter inputs; native issuer authentication remains NOT_RUN. |
| 2 Payload-supplied Storage metadata | Change the first receipt's sequence and its observational copy coherently: receipt_event_sequence refuses against the original event. Caller-only sequence/observed/persisted changes still accept because they are outside the semantic domain. Direct and compatibility Storage-time/sequence forgeries remain refused in Astra's exact probes. |
| 3 Historical readers in both directions | Retained read/rebuild/compatibility positives survive writer cutoff, obsolete CAS, unknown effects and lost current write permission; later valid source progression remains readable. One further withdrawal change refuses for its own guard. Forged views, foreign partitions and missing original custody still refuse. Live writer eligibility never reaches the retained original. |
| 4 One value read two ways | Coherent CRLF hashes and numeric hashes refuse at exact string/length/pattern rules, with accepting syntax-only counterfactuals. Existing 29 guarded identifier sites, LF negatives and exact digest comparisons remain. No implicit coercion/case/whitespace normalization is used. |
| 5 Unvisited dangling references | A fresh unused ROUND5_NO_SUCH_DEFINITION ref fails eager resolution for each family. All 24 complete-CLI unused local/external source/payload refs exit nonzero; corresponding preflight-only-disabled controls exit zero. |
| 6 Partial byte limits / contradictory prose | Independently encoded 16,385-byte inline bodies refuse; 21,001-byte referenced bodies accept for all six operations. Every stored part is measured separately: event stub 1 byte, descriptor 167–184, EventRecord 1,107–7,079, physical source row 372–6,198. Logical sources are 44,435–49,717 bytes and separately referenced. CV-590–593 have no surviving unconditional payload_ref null rule. Independent 16,384 boundaries and 306 transport probes pass. |
| 7 Missing custody / wrong family | All six operation paths recheck their required original: first-write intent/request or predecessor receipt for append; selected original receipt for publish/retry/read/rebuild/compatibility. Removing that one observation refuses and its isolated absence control accepts. Restore inventories and exact-family schema/envelope dispatch have their own whole-pool witnesses. |
| 8 Masked negatives | Every authored/generated negative now has a valid witness and a successful own-invariant counterfactual; the complete matrix verifies other negatives retain their own refusals. Duplicate pairs are named instead of silently deleting unrelated joins. |
| 9 Inflated grades | PASS oracle cells require the complete guard table, standing results and exact current quotes. The grade audit checks all 96 cells and deliberately rejects missing/failed proof, fake PASS cells, stale quotes and a falsely resolved held row. Membership/retention/native limits stay explicit. |

Fresh class mutations and single-invariant counterfactuals are in `astra-classes.py/json`; classes 8/9 bind the final complete proof and grade audit, rather than inventing additional coverage.

## Questions for Jared — card-ready, no answer applied

**Q1a — wizard.blocked / current subject and emission predicate.** Under `Plans/Contracts_V0.md:14896` (CV-233) and `Plans/Contracts_V0.md:2686`, which exact existing PlanningRun or topic owner identity must `wizard_id` identify, and which existing blocked/remediation predicate emits this observation, including the current source of `round_count`? PWIZ-002 owns the current aggregate/topic model; shared route_target/blocked identity does not decide that subject or predicate.

**Review recommendation, unapplied:** retain an observation of the existing Planning Wizard blocked/remediation episode after Jared confirms its actual current subject/trigger. Use current route/blocked identity; do not resurrect a three-round threshold or separate wizard_status state machine. Subsequent identity/schema/checkpoint work is technical.

**Q1b — wizard.unblocked / matching current resolution predicate.** Under `Plans/Contracts_V0.md:14944` (CV-234), for that same confirmed current subject and blocked/remediation episode, which existing authorized resolution transition emits the corresponding observation, and how does `resolution_source` identify that actual resolution and preserve causality?

**Review recommendation, unapplied:** the corresponding observation when that same owner episode clears through an existing authorized resolution, preserving subject and causality. Confirm with Q1a; a route-open or replay never counts as resolution.

Current supporting evidence: `Plans/assistant-chat-design.md:3524`; `Plans/Planning_Wizard.md:116`. These holds do not reopen already-decided intake action existence or choose retirement/historical-only disposition. **Jared's answers: PENDING.**


## Scope, authority and IDs

No new binding, identity, family, schema or PlanUnit ID is authored in round 5. Existing IDs: **CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098** (17). No registry append, admission/exclusion/application record, Decision Log entry, .gitignore/test-file edit, governance lock/evidence/shard hand-edit or main push occurs. The four bundle CV units are the sole Markdown owner edits; derived shards stay under contracts_v0 plus the aggregate plan index.

Current branch owner premises still match origin/main `16acf7594a3fe8559af89491b895f440b314b99e`: DL-045's eight-family scope; ACD-049/050 and ACD-571–574 for targeted Deep Plan revision; UCC-002/UCC-032 and PWIZ-001/002/097/098 for real-Project deferred intake and its three canonical seeds; DL-076/SP-278's nine durable token fields with no persisted redb snapshot; SP-026/SP-337 canonical bytes and overflow. No retired CWF authority, old retention answer or new owner decision is applied. Original per-family search lineage remains `base-family-search.json` (96832ddf6013b0116d2adff5ac939f365bb6928a4b2454d59435a1881d0f605a) and `fix1-wizard-search.json` (324dffe4d7426126626a8fe31fc4262d501880855d81d357a2c4441e5621180f) under drafts/DCW. Failed premise checks: none.

## Commands and exit codes

| Command/check | Exit | Final result |
|---|---:|---|
| python3 scripts/pm_bundle_revision_events.py | 0 | 2,083 PASS: 179 local + 1,904 full composition |
| python3 scripts/pm_dcw_event_regressions.py --output …/standing-final.json | 0 | 1,328 outcomes, all 66 cells, 264 standing witnesses |
| python3 scripts/pm_dcw_event_isolation.py --output …/isolation-final.json | 0 | 131/131 sites, 1,544 negatives, 249,745 cross-tests; no unrelated acceptance/refusal change |
| legacy-proof.py <worktree> | 0 | 182 negatives, 15 assertions, 8,356 cross-tests |
| standing-isolation.py + complete-CLI controls | 0 | 234 direct / 30 CLI witnesses; 5,616 subset cross-tests; zero unrelated accepts |
| astra-exact-replay.py | 0 | 183/183 exact earlier Astra probes |
| independent-event-bytes.py <worktree> | 0 | 306/306 independent byte/reference cases |
| astra-classes.py <worktree> | 0 | all nine classes per family; exact per-case results retained |
| preservation/grade audits | 0 | 1,076 original case IDs, six positives and native obligations preserved; 131 predicates/legacy validate unchanged; all current grade quotes match |
| python3 scripts/pm-storage-recovery-contracts.py --self-test | 0 | parsed top-level pass |
| shard generate / index generate | 0 / 0 | only contracts_v0 owner shards and aggregate index |
| shard check / index validate | 0 / 0 | parsed top-level pass; no failures |
| git diff --check | 0 | no whitespace errors |

The review's unchanged 41 storage-profile baseline errors are not repaired here; source registry/schemas/profiles are untouched. No seal or landing check is attempted. Generated files are regenerated, not hand-edited. An initial mutation-harness schema branch choice and prepared-source continuation were corrected before the final pass; no failing intermediate result supports a PASS claim.

## Resources, cleanup and limits

Entry capacity: 14 GB available RAM / 116 GB disk free. Latest recorded capacity: 17 GB RAM / 88 GB disk free, above the 6/50 GB stop thresholds. The requested detached sparse worktree is `/home/sittingmongoose/pm-worktrees/DCW-fix5`, from the local clone `/home/sittingmongoose/src/PuppetMaster`. Fifteen ignored currentness files matched the shared edition by SHA-256 before generation.

No pm-mail, subagent, browser or server is used. After the report/grade commit and branch push, copy this report, self-grade and guard table to drafts/DCW and remove that literal worktree. Completion records the final remote SHA and removal. Retained evidence is the task result; temporary authoring programs and intermediate logs are removed.

Native authentication, actual Storage issuance, durability, CAS, append/recovery/restore and OS codec execution remain **NOT_RUN**. Open integration items: two exact Jared holds, retention, individual admissions/native evidence, unchanged baseline profile errors and the expected later governance reseal. No writer activation follows from these static results.

## Retained evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/fix5/`. `evidence.sha256` binds final programs/results/logs; `completion.json` separately records the final head. The report/self-grade/guard table are copied to the parent drafts/DCW directory. Key evidence hashes follow.

| File | SHA-256 |
|---|---|
| `isolation-final.json` | `5914dd5eea4c426932b9cdf57e704a8963ad942efd67b9d499b20d3f4bac8ab0` |
| `legacy-proof.json` | `926450ad51c7cfa393853e30cb46fee8d823797de0aedd20baf58e6649a8da34` |
| `standing-final.json` | `aa4d761f695b3d96aa162c229d15ec8c0449531507a808810bb5eb485b4a1bbd` |
| `standing-isolation-combined.json` | `775d448c5cd11ae592c94d2d7893327515886b75b0d18259312c95985a1cf15c` |
| `astra-exact-replay.json` | `72386ae6abcbd7b3fbc2235d987a0fbe6913bd6dc556d7bea7613b139634a3d4` |
| `cycle5-event-bytes.json` | `09405ab6d73a9916e5677eabbe195cebeccfb46bcd9111f37766ca639586c60d` |
| `astra-classes.json` | `f2d2179a0bbc04bdb92f5a64f3357aa8bd5bb9a88dc62b8ab5f8e79b70b1ad80` |
| `grade-audit.json` | `06b57ed7a6eb9a014d2737e50c07681a3aa0a14a25de83e341b0522819871010` |
| `preservation.json` | `c3662c78ebcbaace907b37812500d3e0ef87c648c7694f42b2d728affa8d797e` |
| `currentness-sha256.json` | `fb7ebba7b311391f97777bcd646ff126f4a04b3d29a81075401b45286f3b601d` |
| `check-results.json` | `2f54ed081101f992ef5cdc0a5d09bdbebf08371b83220f484dd308837f91c79f` |
| `evidence.sha256` | `27cc4c31f2308e4b54d12f86978508eb81403c82e8a992e86a63d61f0c32a6da` |
