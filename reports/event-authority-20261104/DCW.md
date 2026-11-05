# DCW — fix round 7, Event Authority

Branch `plans/ea-w2-chain-wizard-20261104`; implementation `8d043b82e967f6f3e38962e91279fe83f85c3b97`; reviewed `e49ae0c5895909b428883478d1a69aaabbdd643f`. Worker DCW-FIX7, VM. This report-only follow-up changes no implementation.

**5/6 prepared passes before Astra 2 → 6/6 after.** Membership remains ABSENT, retention PENDING_RETENTION_DECISION and native execution NOT_RUN. Both held Wizard families remain held for Jared.

## Review round 7: findings and responses

- **F1 — fixed (8d043b82e967f6f3e38962e91279fe83f85c3b97). Where:** scripts/pm_dcw_event_oracles.py:348 and :660 (wizard_source/opened_source_custody); scripts/pm_dcw_opened_custody_cases.py:13. **Why:** loaded validation authenticated only the opened event's receipt and skipped its original owner source. **Fix:** every append, publish, retry, read, rebuild and compatibility read resolves the exact wizard_open_evidence source and runs the complete opened historical validator: closed logical/physical source schema, original request/child/seed/context/result observations, identity and full prepared event, recomputed semantic digest and full-value commitment, exact original receipt and durable group, Storage instance/restore inventory, original read access and reader withdrawal. Missing, forged, foreign and withdrawn originals refuse. Current writer CAS, effects, cutoff and write permission never reach the retained predecessor. Verify the family CLI suite, 24 focused plus 79 broader unchanged Astra counterexamples, and the SHA-bound guard table.

The predecessor's own physical overflow row, payload pack and restore inventory are separate from the loaded source. Synthetic controls now carry both exact reader-family admissions and an explicit opened-reader withdrawal observation; these are fixture inputs, never registry admissions. Read-access loss on a distinct original permission snapshot and missing predecessor source/pack restore inventory each refuse on all six paths. Retained valid history survives live writer eligibility changes.

Check 11 exposed 32 older loaded negatives whose newly inspected predecessor mirrors were stale. Those same facts now have coherent request/child/seed/result, Storage or restore observations; all original case IDs and expected refusals remain. Only the loaded fixture row changed. Every guard remains enforced in production. Five passing family fixture rows, all owner Markdown, payload/source schemas, registries, the legacy fixture and native obligations are byte-identical to the reviewed head.

## Family grades before and after

| Family | Before (Astra 2) | After |
|---|---|---|
| `bundle.revision_requested` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `bundle.revision_started` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `bundle.revision_completed` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `bundle.revision_interrupted` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `wizard.blocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared |
| `wizard.deferred_payload.loaded` | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `wizard.opened` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `wizard.unblocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared |

All 96 cells are rechecked against unchanged current canon and rerun companion evidence. Loaded producer, redaction_custody and positive_negative_oracles recover PARTIAL → PASS. All other cells retain Astra's grade. 286 current quotations are exact and at most 200 characters; Wizard Storage quotations remain under their exact family headings.

## Eleven standing checks and guard table

All 66 standing family/check cells pass (1,328 outcomes). Project-only application-key refusal is not application writer support. Checks 1–9 retain independent current replay-policy exclusion, exact encoded partitions, both SP-337 source/event routes, LF refusal, caller-semantic-only retry comparison, matching checkpoints, nonzero failure exits and eager references.

**Check 10:** the full opened validator is used as a historical read on every loaded operation. Original evidence and current read access/reader withdrawal remain mandatory; current writer CAS/effect/cutoff/write permission do not invalidate valid retained history. Compatibility changes only its passive replay view and authenticates every other original value.

**Check 11:** 133/133 require sites, 2,838/2,838 negatives, 1,037 configurations and 502,587 cross-tests; zero unrelated acceptances or unrelated refusal changes. Legacy: 182 negatives, 15 assertions and 8,356 fixed-configuration cross-tests. [Complete guard table](DCW.guard-removal.md) records the guard, exact named duplicates, flipping witnesses and complete rejected-ID complements. Family PARTIAL exports express global coverage pending aggregation; the verified aggregate alone claims whole-lane PASS.

## All recurring Astra defect classes

| Item | Fresh probe / ruling |
|---|---|
| 1 Forged / contradictory inputs | Foreign predecessor request Project, frozen event substitution, semantic digest, full commitment, receipt and missing original result all refuse on six paths. Owner joins are field-by-field and typed. |
| 2 Payload-supplied Storage metadata | Predecessor sequence aliases and forged receipt sequence refuse; metadata authenticates against retained Storage originals. Caller-only retry metadata remains excluded. |
| 3 Historical readers | Retained controls survive changed live writer eligibility; predecessor withdrawal and distinct original read-permission loss refuse. Both compatibility and rebuild are included. |
| 4 One field read two ways | Exact nested-type/canonical-byte joins and schema formats now also reach the prerequisite opened source. Original-result integer/string/boolean aliases refuse. |
| 5 Unvisited schema refs | Every family's unused local/external source/payload reference probes fail the complete CLI; only the exact preflight control flips them. |
| 6 Partial sizes / contradictory prose | Original and loaded sources and event packs remain independent, with exact full-value byte boundaries, readable/durable pack controls and separate restore inventories. Canonical prose is unchanged; the earlier payload_ref contradiction stays removed. |
| 7 Custody on every path | All six operations validate the complete separately owned opened chain. The review's 103 counterexamples now refuse through real Refusal outcomes, with valid controls preserved. |
| 8 Masked negatives | 32 prior loaded witness mirrors repaired, all old IDs retained; every negative flips for its named guard/set and all other negative complements remain rejected for their own invariant. |
| 9 Inflated grades | Three loaded cells recover only after complete path, source, history and guard proof. Missing proof/case/family and false PASS artifacts are checked; held/native/admission/retention limits remain explicit. |
| 10 Two number encodings | Decimal/exponent integral floats in predecessor source/event and original owner observations now refuse. Existing canonical descriptor/digest recipes remain unchanged; parsed -0 equals integer 0, while float and invalid leading-zero spellings refuse. |
| 11 Types confused | Predecessor source/sequence/result and readable/durable/withdrawal controls include string booleans/numbers, null, arrays, nested objects, booleans and floats. Exact schemas and guards refuse the wrong types. |

## Questions for Jared — card-ready, no answer applied



**Q1a — wizard.blocked / current subject and emission predicate.** Under `Plans/Contracts_V0.md:14896` (CV-233) and `Plans/Contracts_V0.md:2686`, which exact existing PlanningRun or topic owner identity must `wizard_id` identify, and which existing blocked/remediation predicate emits this observation, including the current source of `round_count`? PWIZ-002 owns the current aggregate/topic model; shared route_target/blocked identity does not decide that subject or predicate.

**Review recommendation, unapplied:** retain an observation of the existing Planning Wizard blocked/remediation episode after Jared confirms its actual current subject/trigger. Use current route/blocked identity; do not resurrect a three-round threshold or separate wizard_status state machine. Subsequent identity/schema/checkpoint work is technical.

**Q1b — wizard.unblocked / matching current resolution predicate.** Under `Plans/Contracts_V0.md:14944` (CV-234), for that same confirmed current subject and blocked/remediation episode, which existing authorized resolution transition emits the corresponding observation, and how does `resolution_source` identify that actual resolution and preserve causality?

**Review recommendation, unapplied:** the corresponding observation when that same owner episode clears through an existing authorized resolution, preserving subject and causality. Confirm with Q1a; a route-open or replay never counts as resolution.

Current supporting evidence: `Plans/assistant-chat-design.md:3524`; `Plans/Planning_Wizard.md:116`. These holds do not reopen already-decided intake action existence or choose retirement/historical-only disposition. **Jared's answers: PENDING.**




## Scope, authority and IDs

No new PlanUnit, product behavior, retention/deletion choice, identity recipe or owner decision. Existing IDs only: **CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098** (17); no new IDs used. Both exact Wizard holds are unchanged. DL-045 scope, current PWIZ/UCC intake, ACD targeted revision, SP-278/DL-076 reader tokens and SP-286/CV-339 custody premises remain unchanged in this branch. Canonical owner/schema/registry evidence was compared byte-for-byte and every quoted source rechecked.

No registry append, admission, exclusion/application record, Decision Log, test-file/.gitignore, frozen validator, Spec Lock, governance evidence/auto-decision, main push or reseal. No owner Markdown changed in this round, so no shard/index regeneration was needed; existing generated files remain untouched and the shard body/path check passes. The ignored currentness edition's 15 files were copied and hash-matched before index validation. Moving-main index diagnostics are recorded without changing a baseline or any guard; integration owns concurrent-main reconciliation.

## Commands and exit codes

| Check | Exit | Result |
|---|---:|---|
| pm_bundle_revision_events.py --family, six sequential runs | 0 | 3,225 full / 3,404 total static cases |
| pm_dcw_event_regressions.py --family, six sequential runs | 0 | 1,328 outcomes; all 66 cells |
| pm_dcw_event_isolation.py --family and strict --merge | 0 | Every corpus row/site and complement verified; whole-lane PASS |
| Fixed legacy-recheck.py, four sequential runs | 0 | 182 negatives / 8,356 cross-tests |
| Unchanged Astra focused and broader reproduction | 0 | 24 + 79 actual Refusal results; six valid controls |
| pm-shard-plans.py --check | 0 | Parsed top-level pass |
| pm-plan-index.py validate | 1 | Top-level fail; 22 inherited diagnostics, 0 additional moving-main/infrastructure diagnostics (index-comparison.json) |
| Preservation / quote / aggregate integrity audits; git diff --check | 0 | Old cases, five family rows, native obligations and both holds preserved |

## Evidence, resources and cleanup

Evidence directory `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/fix7`. Raw evidence remains outside the repository. All family checkers ran one family at a time with memory sampled before each checker; entry memory/disk were 16 GB / 83 GB and subsequent recorded samples stayed above 6 GB / 50 GB. No subagent, browser or server was started. A read-only mailbox check overlapped the first brief read; after its prohibition was read there was no registration, sent mail or further mailbox use.

Push only the assigned branch, copy the report/grade/table to drafts/DCW, then remove the literal detached sparse worktree `/home/sittingmongoose/pm-worktrees/DCW-fix7`. Completion records the final remote head and removal. Native execution and eventual admissions/governance remain separate.

| Evidence file | SHA-256 |
|---|---|
| `isolation-final.json` | `445b33f6e64522be7eb159fb015a2a4e308a4b153ecf00576d05e7a0583e6489` |
| `family-suite-results.json` | `d5f47c93e04ad679f306c49579ad6dc9c1779c434cb444e598ec1e37aa0d3b18` |
| `review-focused-replay.json` | `42dca57b795514eff4a1a62bf214d43b1e00eca0b3f67f2e50277cdf7e9d9ad2` |
| `review-replay.json` | `ea91ae1e36db0faa1c952e77b03b8f122e2d5edc68e74ff8de3437c98cb8947e` |
| `observation-repairs.json` | `cc3f93ec0051d11452b7bc95e4f8d60eac8a8631396ec7578542ef188b798fcb` |
| `preservation.json` | `2316cfd018ad13cbda2c631ea51b4aab5151ad69cc23c6772f7de64f2d0b36f3` |
| `canonical-evidence-audit.json` | `a2f4367452788e15d43508f35211bb32198e2bda3b704f2aa08f2db15c542093` |
| `currentness-sha256.json` | `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84` |
| `index-validate.json` | `aa4d1a6c968d75488d688992a1e175641331fe99b71988a26c7c4117f13e014b` |
| `index-comparison.json` | `c2d60f09280fc11ea9812551a3bccd37a75a6e66688082e9239382c06c64d287` |
| `shard-check.txt` | `353b434b8f99c23e82801aee68941ecef36e9fc71638a6bce463523cd6b01ade` |
| `post-suite-results.json` | `3eb98e33acd167fadca0ca26d12446ed7ebc1d2606815b22b16bdf59b4649730` |
| `wizard_deferred_payload_loaded-standing.json` | `808ab6885920bc55028449ac3ea7a81f616204f4e5054f36ac2d5bc1d181e8d8` |
| `bundle_revision_requested-standing.json` | `df15ec4d56903403040a9eb6f80ec2013dc207cedeff0c695f41d4f583515ba9` |
| `bundle_revision_started-standing.json` | `25d9cd5b60bcbf6855dad116091d593799ca7c9485773876e64e2c1ae3d1bb0a` |
| `bundle_revision_completed-standing.json` | `ea3d6ba71da087ea1289009f5d2fbe289431ecd0452914043bc3f725f49542ad` |
| `bundle_revision_interrupted-standing.json` | `ec95ca971b88d65a985c3f8ceac39c2ce57c8efaf4359a5fe551c5339b2996d0` |
| `wizard_opened-standing.json` | `6c360e6eb82bba5d6672f7dd4e8b75e50a5cf01cef629b348a69bd61ece5a84f` |
| `bundle_revision_requested-legacy.json` | `ee4c50a045808058faa54ebf417813e9eabc7b78eb0152f64b3b928b0ba62dd4` |
| `bundle_revision_started-legacy.json` | `03299f5b674a59748d9db5fef40a8306e9a7709b132194f85123df070ed63756` |
| `bundle_revision_completed-legacy.json` | `d2d5d77d1f9ceb1838ecccfa5cdd8ce9ea4dc30a77f090d3a01746d46074e5bb` |
| `bundle_revision_interrupted-legacy.json` | `3f1125044f0226b4e18cb0c9dbd4ec44dc8f591bb02ef9997bafcae960d99874` |
| `integrity-controls.json` | `cd47c400ff182d779b2ad7971958953f416a55c0860b00914129d54d4b08fa40` |
