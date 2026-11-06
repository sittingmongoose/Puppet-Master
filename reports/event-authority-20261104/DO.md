# DO — technical fix round 8

Branch `plans/ea-w2-orchestrator-20261104`; reviewed head `f69bfd4629390c47a9f57e3f3e3c8268732d465a`. Assessed code/fixture head `23971fcea36d9b879f35e5ae1a984ebb6c2832e0`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DO-sol/REVIEW-cycle8.md`.

**25/25 prepared under the authorized membership/retention exceptions. Native NOT_RUN.** All three blocking findings are fixed. Independent cycle-8 grades **225 PASS / 50 PARTIAL / 25 ABSENT → 250 PASS / 25 PARTIAL / 25 ABSENT**, no conflicts. Each family changes **9 PASS / 2 PARTIAL / 1 ABSENT → 10 PASS / 1 PARTIAL / 1 ABSENT**. Membership stays ABSENT and retention PARTIAL. N1..N5 and P1..P3 remain open shared-sweep items; this report supersedes round 7’s blanket check-11 PASS.

## Review round 8: findings and responses

**DO-C8-01 — fixed (`445b6574d34551e739059e0a2fad2fd974f92d57`).** Where: `scripts/pm_orchestrator_event_oracles.py:107`, `:162`, `:454`, `:734`, `:743`, and `:1058`. Why: the numeric walk and fixture decoder treated Storage’s exact uint64 sequence as a producer JCS input, causing false refusals above the library safe-integer ceiling. Fix: producer admission/retry checks project only `SEMANTIC_FIELDS`; the decoder dispatches the exact EventRecord sequence paths to shared `storage_uint64`, and schema admission/retry enforce that owner’s exact type/range separately. The full original receipt is returned unchanged. No local numeric cap or serializer was added. Storage’s existing exact uint64 rule is `Plans/storage-plan.md:17294`; producer exclusions are `Plans/Contracts_V0.md:1031`.

The complete loader, append model and retry path cover **53 vectors × 10 sequence forms = 530 cases**. Positives: 2^53, 2^53+1, 2^60, 2^63, 2^64−1; negatives: 2^64, −1, boolean, 1.0, string. All **265** positive metadata changes also run as file-backed `retry_cases`, preserving exact MessagePack integers, the producer digest and original receipt bytes. Invalid values refuse without coercion. The original whole-file 2^53+1 retry control now exits 0; all five invalid whole-file forms exit 1.

Shared reuse is byte-exact from `plans/ea-numrule-20261105` at `883af36ba4a68230e14497df86a5e4edcd38f697`: `scripts/pm_event_numbers.py`, `scripts/pm_event_numbers_corpus.py`, `Plans/event_number_recipe_corpus.json`, and `scripts/pm_event_datetime.py`. The latter is the corpus’s unchanged dependency (`23971fcea36d9b879f35e5ae1a984ebb6c2832e0`). DO imports only the sequence-validation API; its existing number/identity/physical/history/date-time recipes retain their pending sweep disposition. The shared corpus passes; its own guard isolation status is SWEEP_PENDING.

**DO-C8-02 — fixed (`4ad3a39c4076deae2d6877b59fa512153f5396c9`; accepted-source regression supplement `5fca2287053362c2ccf8fe7f471161329ad1f3ca`).** Where: `scripts/pm_orchestrator_event_oracles.py:543`, `:558`, `:571`, `:901`; `board_custody_cases` and `board_successor_cases`. Why: Python equality identifies 1 and 1.0, while CV-366’s immutable typed commitments distinguish them. Fix: wrapper/original, accepted-source/original and claimed-stage/actual-witness comparisons use the existing owner `typed_tree`. No original primitive, signed zero, float, physical codec or commitment recipe is normalized.

All **six application V1/V2 paths** have synchronized single-defect controls: **12 wrapper mismatches** (both integer-original and retained-float-original directions), **60 stage mismatches** (revision and generation in every one of the five required stages), and **6 accepted-source witness mismatches**. Actual physical hashes and dependent custody/source commitments are synchronized; independent originals and witnesses stay fixed. Every control refuses for its one expected join. Legal retained integral floats still pass on all six paths and through the original compatibility loop and exact receipt recovery. The mutation builder flips the actual base primitive type, so a valid float original does not erase its negative. Full-entry wrapper and stage controls exit 1.

**DO-C8-03 — fixed (`1f438465b4ad3acaec9c2cf536e3b2772426db89`).** Where: `scripts/pm_orchestrator_event_oracles.py:1191` and `project_source_cases`. Why: the subject-null type cases were run as board negatives with an unchanged append subject, coupling the type predicate to `message_subject`. Fix: all **994** standalone Project adapter cases explicitly declare `boundary=project_original_input_adapter` and pass only the original `source` into the type validator. They contain no append payload at that boundary. The two posted subject-null cases flip when only that subject type predicate is removed. Separate full-board controls retain **four well-typed target mismatches** and add **two well-typed subject mismatches**. Type and equality predicates are distinct.

## Family regrade

All **300** cells were reread against current exact-family owner sections and closed schemas; all **427** prior evidence quotations and **29** new source quotations were verified. Each family ran its full relational oracle collection serially. Only `positive_negative_oracles` changes grade; membership and retention remain the authorized preparation exceptions.

| Family | Unit | Oracle before → after | Serial checks | Prepared before → after |
|---|---|---|---:|---|
| `config.validation.failed` | OSI-680 | PARTIAL → PASS | 708 | no → yes |
| `crew.board_message_posted` | OSI-681 | PARTIAL → PASS | 3680 | no → yes |
| `crew.board_message_read` | OSI-682 | PARTIAL → PASS | 2044 | no → yes |
| `crew.board_messages_archived` | OSI-683 | PARTIAL → PASS | 2048 | no → yes |
| `parser.error` | OSI-684 | PARTIAL → PASS | 639 | no → yes |
| `phase.force_completed` | OSI-685 | PARTIAL → PASS | 689 | no → yes |
| `subagent.budget_warning` | OSI-686 | PARTIAL → PASS | 1224 | no → yes |
| `subagent.cancelled` | OSI-687 | PARTIAL → PASS | 1220 | no → yes |
| `subagent.completed` | OSI-688 | PARTIAL → PASS | 1244 | no → yes |
| `subagent.context_warning` | OSI-689 | PARTIAL → PASS | 1224 | no → yes |
| `subagent.escalated` | OSI-690 | PARTIAL → PASS | 1208 | no → yes |
| `subagent.failed` | OSI-691 | PARTIAL → PASS | 1240 | no → yes |
| `subagent.message_received` | OSI-692 | PARTIAL → PASS | 1240 | no → yes |
| `subagent.message_sent` | OSI-693 | PARTIAL → PASS | 1240 | no → yes |
| `subagent.model_switched` | OSI-694 | PARTIAL → PASS | 1228 | no → yes |
| `subagent.output_truncated` | OSI-695 | PARTIAL → PASS | 1232 | no → yes |
| `subagent.paused` | OSI-696 | PARTIAL → PASS | 1188 | no → yes |
| `subagent.progress` | OSI-697 | PARTIAL → PASS | 1188 | no → yes |
| `subagent.resumed` | OSI-698 | PARTIAL → PASS | 1188 | no → yes |
| `subagent.retried` | OSI-699 | PARTIAL → PASS | 3916 | no → yes |
| `subagent.spawned` | OSI-700 | PARTIAL → PASS | 1208 | no → yes |
| `subagent.started` | OSI-701 | PARTIAL → PASS | 1188 | no → yes |
| `subagent.timeout` | OSI-702 | PARTIAL → PASS | 1200 | no → yes |
| `subagent.tool_called` | OSI-703 | PARTIAL → PASS | 1228 | no → yes |
| `subagent.tool_completed` | OSI-704 | PARTIAL → PASS | 1260 | no → yes |

S1..S10 pass on every family (application-key refusal for Project-only families). S6 includes the full uint64 metadata boundary. S11 is explicitly **PARTIAL / shared-tool sweep pending**, with the concrete fixture/product defects above repaired. No blanket complete-predicate-inventory claim is made.

## Targeted predicate isolation and shared proof sweep

These targeted product regressions cut one predicate while keeping peer predicates enabled. They supplement the ordinary full checker. The earlier 96-group table remains historical evidence of its declared bank and is superseded as a strict whole-lane proof by P1..P3. No replacement lane proof machinery was built.

| Predicate removed | Own negatives that pass | Other typed-copy negatives still refused |
|---|---:|---:|
| `wrapper_typed_copy` | 12 | 66 |
| `stage_typed_copy` | 60 | 18 |
| `accepted_source_typed_copy` | 6 | 72 |
| Original Project subject string type, adapter boundary only | 2 | Separate subject/target board joins remain enabled |

Exact occurrence names, mutant SHA-256 values and expected refusal labels are in `targeted-isolation.json`. A duplicate set must be the same field/predicate at multiple sites; shared refusal text, compound clauses and whole-schema cuts do not qualify.

## Shared-sweep items

All eight items remain open for the shared number/tool adoption sweep. They are not silently credited as fixed.

| ID | Location / remaining work |
|---|---|
| **DO-C8-N1** | `number_domain_errors`, `number_token_errors`, `fixture_loads`: adopt owner-declared integer slots and preserve general-number/original typed domains. The blocking Storage cap is fixed separately. |
| **DO-C8-N2** | `semantic_digest`, current `identity`/`observation_component`, `historical_identity`: adopt qualified JCS exactness for the actual owner purpose, preserving every frozen recipe label, tuple and prefix. |
| **DO-C8-N3** | `packed`, `pack_entry`, transport sizes, source hashes and physical commitments: select SP-236 EventRecord, app physical and SP-278 profiles separately. Keep original float types, signed zero and stored bytes. |
| **DO-C8-N4** | `number_rule_for_record`, recipe evidence, historical/checkpoint/recovery/retry paths: adopt the composition-installed authentic original-owner resolver and complete tuple-to-frozen-resource verifier map. Imported shared code does not establish DO’s sealed lookup. |
| **DO-C8-N5** | Carried `pm_coordination_events.py` canonical/identity/digest helpers: reconcile DCO once, preserving existing identity string recipes and DL-077/local hashes; distinguish payload-only and generic producer digests. |
| **DO-C8-P1** | External round-7 `guard_audit.py` emitter inventory is incomplete. Adopt `scripts/pm_guard_isolation.py` in the shared sweep. |
| **DO-C8-P2** | Its checkpoint/reference/wildcard/schema groups merge distinct predicates. Adopt individual predicate cuts and site-by-site duplicate proofs, keeping peer clauses enabled. |
| **DO-C8-P3** | Its whole-schema/whole-keyword cuts remove multiple assertions. Replace them with the shared tool’s predicate cuts. |

## Recurring-class probes

Own round-8 mutations cover all 25 families: forged event identity; Storage-only timestamps; forged/withdrawn history; dormant references; complete multibyte inline overflow followed by intact externalization and a durability refusal; wrong primitive types; malformed calendar/offset/LF formats; both authentic supported synthetic original recipes and exact receipt recovery. All six application paths also exercise synchronized owner-commit refusals. Typed contradictions and fixture isolation have the separate 78-control predicate proof above. Grades and source quotations are mechanically checked. Number-domain/profile/original-resource gaps remain N1..N5; proof inventory/cut gaps remain P1..P3. No blanket number, format-profile adoption or custody-authentication claim is made.

## Verification and limits

| Check | Exit / result |
|---|---|
| Complete final DO checker | 0; **25 families / 38373 checks** |
| Serial per-family relational suite | 0; 25/25, every fixture-list occurrence assigned to one family |
| Targeted predicate isolation | 0; 78 typed-copy refusals, flips 12/60/6, two isolated adapter subjects |
| Complete production entry controls | 0 harness; **9/9** expected child outcomes; exact input base retained |
| Shared number corpus | 0; 370 cases, 193 positives / 177 negatives; isolation SWEEP_PENDING |
| Event-index binding tests | 0; 14 tests |
| Shard check | 0; 99 sources / 3,096 shards |
| Index validation | 1; parsed top-level `fail`; see `index-disposition.json` |

The targeted harness initially assumed every inherited successor case had a `kind` label; the optional lookup was corrected and rerun without changing product guards. The initial shared corpus self-test exposed a missing `pm_event_datetime` dependency; its exact shared bytes were included and the complete corpus then passed. An earlier CLI run was stopped to correct the base-type assumption in the new mutation builder; its cancellation is recorded and no result from it is credited. The nine completed full-entry controls preserve the three-fix input bank at `1f438465b4`; the subsequently added six accepted-source witness controls run in the final complete checker and all-family suite. Production guard bytes are identical in both editions.

Index reports 24 failures: the same 21 legacy-ledger errors, DL-302 and readiness staleness from cycle 8, plus PLS-025 newly present only on the fetched main. All 24 named files are unchanged since the reviewed head. `index-disposition.json` records the exact added row and no removed rows. Legacy-ledger/DL-302/PLS-025 reconciliation and readiness/currentness refresh remain integration work. No deletion decision or governance reseal is invented. Unchanged coordination/runtime/storage companion failures retain the cycle-8 baseline disposition; they were not rerun for this fixture/checker-only fix.

## Scope, premises, IDs and procedure

No canonical Markdown owner document changed, so no shard/index generation was required. Generated shards/index, Spec Lock, evidence locks, auto-decisions, frozen validators, both registries, Decision Log and `.gitignore` are unchanged. The 15 ignored currentness inputs were copied, SHA-checked and retained externally before index validation. All original fixture values/typed prefixes remain; the standalone adapter boundary annotations are intentional. The exact shared helper/corpus provenance is in `scope-audit.json`.

DL-045’s exact-family technical scope remains the existing 25 families. DL-084 child history, DL-085 board retention/visibility, DL-086 diagnostic retention, and DL-087/088 retirement premises were reread against their unchanged current units and OSI-680..704. This round creates no new technical binding, feature or policy. Retention integration, linked-successor physical/admission work, Q1/Q3 and native authentication/assignment/first-append durability/CAS/restore/withdrawal races remain open or NOT_RUN.

**IDs used:** no new PlanUnit IDs. Retained **OSI-680..704, SP-720..723, CV-740, ATS-360** (31 allocated lane IDs). Shared CV-1100/SP-1100/SP-1101/CV-1101 and existing CV-366 are reused references, not lane allocations.

VM local sparse worktree `/home/sittingmongoose/pm-worktrees/DO-fix8`, created from the pinned branch after `git fetch origin`. Start: 116 GB root disk free / 8 GB RAM available. Runtime checker families run one at a time; the monitor suspends owned processes below 6 GB available and checks every two minutes until at least 7 GB. No pm-mail, subagents, admission, registry append, Decision Log entry, main push, browser or server. Only the named lane branch is pushed; the literal worktree is removed after the report and self-grade are copied and pushed.

## Retained evidence

Base: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-8/`. Exact full-byte SHA-256 values:

| Artifact | SHA-256 |
|---|---|
| `complete-checker-head.stdout` | `2b95a90b33fce56b88566d4c22ce52b6d84df1d1eb9c6195c15db3d05ee1a268` |
| `family-results.json` | `b9f81172f07ecc042eca04419f696729a18d03bcfa8130c07011aaac0c6166f3` |
| `family-coverage.json` | `b1f524394a3024f6b66b571946834238042a892138c947193549af7f1c89a5a0` |
| `targeted-isolation.json` | `038bf58fba33cc628ada946c92a8430b1c70cb865a986005a243935508d09a6b` |
| `full-entry-controls.json` | `12b3a14face9cb8e5e827326fa39e4162f9e8e1de2d81f33dfe7fa4ed355a286` |
| `full-entry-base-fixture.json.gz` | `7dd03108b341994998feb2342cd9d4221546e1f519b09a5fe5e372bd6e399d3f` |
| `full-entry-input-provenance.json` | `269c412156c4d249901c264386fc55f605e2a9478ec7ee6e97ef28cf829d1f68` |
| `astra-probes.json` | `8fb60d5854e2a775961040c8eb3f761c786e22283b4c612e8dc123f91c5e7f0c` |
| `shared-number-corpus-final.stdout` | `79f9c6b1f54a0810b4107cf74fed846d1c4abb8174a129aa626a2765350ac0d9` |
| `event-index-tests.stderr` | `4e9082bdce38ccbff7597923063fa0ff9d25cac57304c6ff4aa5c218cf029b84` |
| `shard-check.stdout` | `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85` |
| `index-validate.stdout` | `a849f8c7201739d2ef837a9206376a421efa9b97ce165fe855bb97e1c2cde423` |
| `index-disposition.json` | `b868eb3b5fb98d1f55dabaaee7eb9435dc90ac2a68f21e7f0ae214d843e04a89` |
| `regrade.json` | `4f345bb94f1745872e758e6baa3532241ce1baf75f5cc91d3b8133c40c401ec9` |
| `scope-audit.json` | `afd116c54470ffa74c1d20c700d0260abe78634b7357b3f0460a9817037262a7` |
| `fixture-preservation.json` | `067f4085870346752f0e4ea81f300ea42e92dbcc87dadb36e26626f95ec1721c` |
| `currentness.json` | `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b` |
| `currentness-inputs.tar.gz` | `6e5cf990d114fff75c66a2e47519b57267c2cd5733ae11df96c1d7184c26e985` |
| `commands.jsonl` | `a6ad9e26fcd3e2f6d25f5b240b6613459c80984ae48a997cce956c946ad63729` |

---

# DO — sweep part 1 text pass (2026-11-05)

Task: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/SWEEP-P1-GLM.md`. Rebase base `origin/main` at `2989975e8f8a4a1e49235e8ae2095b3df7ea0321` (fetched 2026-11-05); pre-rebase lane head `24ce3d263ade839103a3cc4ce369c34be864a972` replayed as `3da3984336`. This pass is text only: rebase, landed citations, checker runs, regeneration, report. No checker, fixture, schema, proof, Decision Log, registry or governance edit was made.

## Sweep part 1 (text pass): findings and responses

| Item | What changed | How to verify |
|---|---|---|
| **Rebase onto `origin/main`** | 23 lane commits replayed from base `be4766513f` (297 main commits since). Conflicts at four replayed commits (`deb76fa034`, `02c957356b`, `f982f7341f`, `8b1db698e8`): 117, 5, 1 and 67 files — **every one under `Plans/_shards/**` or `Plans/.plan_index/**`**, resolved by regeneration in `1e9185506d`, never hand-merged. No non-derived conflict occurred, so nothing was aborted or adjudicated. All lane code/fixture/report files are byte-identical to `24ce3d263a`; every branch-added line of `Plans/orchestrator-subagent-integration.md` (951), `Plans/storage-plan.md` (136) and `Plans/storage_value_registry.json` (568) survives. Round-8 fix ids replay as: C8-01 `445b6574d3`→`0a27411bf1`, C8-02 `4ad3a39c40`→`4d7866afe3` (supplement `5fca228705`→`0d5c6cfc0e`), C8-03 `1f438465b4`→`759203cff5`, shared-dependency `23971fcea3`→`17a2a73958`, report `24ce3d263a`→`3da3984336`. | `git diff 24ce3d263a 3da3984336 -- scripts/ Plans/orchestrator_event_contract_fixtures.json Plans/orchestrator_event_payloads.schema.json Plans/orchestrator_historical_read.schema.json reports/event-authority-20261104/` is empty; per-file line-survival checks listed in the pass log. |
| **Landed citations — 79 changes in `c43ae4d0c9`** | Every DO-owned citation of the then-unlanded `origin/plans/ea-storage-retention-20261104` (landed in batch 1 at `4d52bd2758526cd0e8a56358baaa73049c1d4bdd`, `reports/event-authority-20261105/BATCH1.md` row 94) now cites the landed materialization. `Plans/orchestrator-subagent-integration.md:32191,32247,32301,32355,32407,32457,32507,32557,32607,32657,32707,32757,32807,32857,32907,32957,33007,33057,33107,33157,33207,33257,33307,33355,33407` (25×): "as materialized on \`origin/plans/ea-storage-retention-20261104\`, report" → "as materialized in the landed `Plans/storage_value_registry.json` (Storage retention landing `4d52bd2758526cd0e8a56358baaa73049c1d4bdd`), report" — the DL-084/085/086 Decision Log entries stay named in the same sentences, and the report pin `reports/event-authority-20260911/step-09-storage-retention-20261104.md` is kept. `Plans/storage-plan.md:29607,29652,29697` (3×): "cited to origin/plans/ea-storage-retention-20261104" → "as landed in `Plans/storage_value_registry.json` (Storage retention landing `4d52bd2758526cd0e8a56358baaa73049c1d4bdd`)". `Plans/storage_value_registry.json:10996` (1×): "remains on origin/plans/ea-storage-retention-20261104" → "is landed in this registry (Storage retention landing `4d52bd2758526cd0e8a56358baaa73049c1d4bdd`)". `reports/event-authority-20261104/DO.self-grade.json` (50×, lines 180–11054): the same quote words updated so every self-grade quotation still matches owner text byte-for-byte. Lineage SHA `4d52bd2758526cd0e8a56358baaa73049c1d4bdd` kept in every replacement; no other word changed. `Plans/Decision_Log.md`, `reports/CA-*`, `reports/BATCH1*` and the `step-09` reports carry other lanes' branch citations and were not touched. `plans/ea-numrule-20261105` at `883af36ba4a68230e14497df86a5e4edcd38f697` (DO.md:13) stays: that branch is still unlanded and in review, so its pin is accurate lineage. | `grep -rn "origin/plans/ea-storage-retention-20261104" Plans/orchestrator-subagent-integration.md Plans/storage-plan.md Plans/storage_value_registry.json reports/event-authority-20261104/DO.self-grade.json` → 0 hits; `grep -c "Storage retention landing \`4d52bd2758526cd0e8a56358baaa73049c1d4bdd\`"` → 25/3/1/50 per file; both JSON files still parse. |
| **Deck items** | None assigned to DO in this task. | — |
| **Regeneration (commit `1e9185506d`)** | `pm-shard-plans.py --generate` exit 0; `pm-plan-index.py generate` exit 0 (7,519 plan units); `pm-shard-plans.py --check` exit 0 (99 sources / pass). Derived churn is confined to `Plans/_shards/**` and `Plans/.plan_index/**` (907 modified, 2 deleted, 4 added — the storage_value_registry shard boundary moved with the registry text); the 15 ignored currentness inputs were copied from `/mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness` and match by SHA-256 (aggregate `d802038d2ec9702ae1582a3f192f7e1ae1894f2c1ddb9ac5c4117d8b60d1093e`). | Commands and stdout/stderr retained in `drafts/DO/sweep-p1/`. |

### Checker runs (this pass, serial, unchanged code)

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-orchestrator-event-contracts.py` | **1** | `AssertionError: ['successor_resource_selection']` at `scripts/pm-orchestrator-event-contracts.py:205`. First lines of output: `Traceback ... File "scripts/pm-orchestrator-event-contracts.py", line 205, in main` / `assert not oracles.successor_errors(ROOT), oracles.successor_errors(ROOT)` / `AssertionError: ['successor_resource_selection']`. **New since the rebase, not present at `24ce3d263a`** (round 8 recorded exit 0): `Plans/application_board_message_v2_graph.json` pins SHA-256 of `Plans/application_workflow_contracts.schema.json` and `Plans/shared_integration_runtime.schema.json`, and both advanced on `origin/main` (guard at `scripts/pm_orchestrator_event_oracles.py:665-671`). It reproduces identically at pure rebase head `3da3984336` (before any citation edit), so no sweep edit caused it. Listed below for the Opus worker; not fixed here because re-pinning is a hash restamp outside this pass. |
| `python3 scripts/pm_event_numbers_corpus.py` | 0 | Silent pass, as in round 8. |
| `python3 -m unittest tests.test_pm_event_index_binding` | 0 | 14 tests, OK. |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | pass |
| `python3 scripts/pm-plan-index.py generate` | 0 | 7,519 plan units |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | 99 sources / pass |
| `python3 scripts/pm-plan-index.py validate` (branch head) | 0 | **pass, 0 findings.** The cycle-8 index findings (21 legacy-ledger rows, DL-302, readiness staleness; PLS-025 on fetched main) are gone from this tree — cleared by main's landings (`2989975e8f` and the snapshot/baseline refresh), not by this branch. |
| `python3 scripts/pm-plan-index.py validate` (`origin/main` clean worktree) | 0 | **pass, 0 findings** with the standard currentness edition copied in. Without those ignored inputs it reports one `stale_generated_index_artifact` row — an environment artifact of the missing edition, not a branch or main defect. **No index finding is new on this branch.** |

Round-8's ad-hoc harnesses (serial per-family suite, targeted predicate isolation, full-entry controls) live in the evidence folder, not the repository; they were not rerun, consistent with round 8's own companion disposition. The shared companions (coordination, coordination tests, runtime-canon, storage-profile) keep their cycle-8 baseline disposition on main and were not rerun.

## For an Opus or Sol worker

Open items from `reviews/DO-sol/REVIEW-cycle8.md` that are **not** number-handling or proof-machinery items, plus one new item from this pass. The cycle-8 review's product blockers were all fixed in round 8 at the pre-rebase head `24ce3d263a`; no review has seen those fixes yet, so each is listed **fixed, awaiting review**:

1. **DO-C8-01 — Storage uint64 metadata cap — fixed, awaiting review** (`0a27411bf1`, pre-rebase `445b6574d3`). Current locations: `scripts/pm_orchestrator_event_oracles.py:107`, `:162`, `:454`, `:734`, `:743`, `:1058`. The review asked (`REVIEW-cycle8.md` §DO-C8-01): keep Storage's exact uint64 sequence outside the producer JCS/current-identity gate, preserve the original full receipt on metadata-only retry, and add uint64 boundary controls through the complete loader and retry path, using the shared rule rather than another local cap. Verify with the complete checker once item 4 below is resolved.
2. **DO-C8-02 — cross-type wrapper/stage equality — fixed, awaiting review** (`4d7866afe3`, supplement `0d5c6cfc0e`; pre-rebase `4ad3a39c40`, `5fca228705`). Current locations: `scripts/pm_orchestrator_event_oracles.py:543`, `:558`, `:571`, `:901` (`board_custody_cases`, `board_successor_cases`). The review asked: compare immutable copies with the owner `typed_tree`, add V1/V2 single-defect mismatches with synchronized commitments, and keep legal retained integral floats readable.
3. **DO-C8-03 — stale subject copies in Project type negatives — fixed, awaiting review** (`759203cff5`, pre-rebase `1f438465b4`). Current locations: `scripts/pm_orchestrator_event_oracles.py:1191` and the `project_source_cases` in `Plans/orchestrator_event_contract_fixtures.json`. The review asked: separate standalone adapter type inputs from full-board join inputs, with no stale relational observation at the declared boundary, and separate well-typed subject/target mismatch controls.
4. **NEW — stale successor resource pins (checker exit 1).** `Plans/application_board_message_v2_graph.json` pins SHA-256 for `Plans/application_workflow_contracts.schema.json` and `Plans/shared_integration_runtime.schema.json`; both schemas advanced on `origin/main` after the pin, so `successor_resource_selection` (`scripts/pm_orchestrator_event_oracles.py:665-671`) refuses on the rebased tree. The pin and the graph are owner lineage records; refreshing them is a restamp that needs the successor-graph owner's verification that the two newer schema editions still satisfy the graph's contract (or a decision to extend the pin mechanism). This text pass changed neither file.
5. **Carried integration items (reviewed, open, not blocking the text pass):** retention integration and Q1/Q3 follow-ups (`Plans/storage-plan.md` Case L-3 / SP-349/SP-351 reading, `reports/event-authority-20260911/step-09-storage-retention-20261104.md`); linked-successor physical/admission work; native authentication, assignment, first-append durability, CAS, restore and withdrawal races remain NOT_RUN. The four shared-companion baselines (coordination 2 failures; coordination tests 14/50; runtime-canon 161; storage-profile 41) are unchanged on main and stay with their owners.

## Sweep part 1 (fixture pass): findings and responses

Task: `lanes/SWEEP-P1-OPUS.md`. Worker head before the report commit: `b0e7f5fa35`. Base stays `origin/main` `2989975e8f`: the text pass finished its rebase, so no second rebase was made. Evidence: `drafts/DO/sweep-p1/fixture-pass/`. No Decision Log entry, registry append, admission, seal or reseal; `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore` and the frozen validator are unchanged.

**Result:** the complete checker exits 0 again (25 families, 38,391 checks). One new blocker is stopped for a decision: DO-P1F-03 below.

| Item | Result | Commit, path:line | How to verify |
|---|---|---|---|
| **1. DO-C8-01** Storage uint64 cap | Fixed, awaiting review. Not changed in this pass. | `0a27411bf1`; `scripts/pm_orchestrator_event_oracles.py:107`, `:162`, `:454` | Round 8's `probes.py cli-controls`, rerun at this head: the five `metadata_retry` entries end as round 8 recorded. |
| **2. DO-C8-02** typed copy equality | Fixed, awaiting review. Not changed in this pass. | `4d7866afe3`, `0d5c6cfc0e`; `scripts/pm_orchestrator_event_oracles.py:543`, `:558`, `:571` | `probes.py responses`, rerun: flips 12 / 60 / 6, stays rejected 66 / 18 / 72, the same case lists as round 8. `typed_wrapper:0` and `typed_stage:0` exit 1. |
| **3. DO-C8-03** stale subject copies | Fixed, awaiting review. Not changed in this pass. | `759203cff5`; `project_source_cases` | `probes.py responses`, rerun: the two standalone subject type cases flip. |
| **4. Stale successor pins** | **Fixed, re-pinned after verification.** | `b0e7f5fa35`; `Plans/application_board_message_v2_graph.json:13`, `:18`, `:163` | Pin section below. |
| **5. Carried integration items** | No lane action. Retention integration and Q1/Q3 stay with integration: this pass neither changes retention nor picks a reading of SP-349/SP-351, and the Storage retention review found the Q1 reading defensible and the Q3 confirmation carrying over (`reports/event-authority-20260911/step-09-storage-retention-20261104.md:187-189`, `:222`). Linked-successor physical and admission work stays with admission. Native cases stay NOT_RUN. | none | The four companion baselines are rerun below against current `main`. |
| **New: DO-P1F-01** expected row out of step | **Fixed.** Where: `scripts/pm_coordination_events.py:898-900`. Why: the text pass moved one sentence of the `coordination_event_records` row (`c43ae4d0c9`, `Plans/storage_value_registry.json:10996`) but this script keeps its own expected copy, so the checker refused at `actual_coordination_storage_member_drift`. The stale pin aborted the checker first, which hid this; the text pass's "no sweep edit caused it" is true of the pin only. Fix: same words in the expected row. Negative added. | `50840e5030`; `scripts/pm-orchestrator-event-contracts.py:149-155` | `row-drift-controls.json`: putting the old sentence back on either side alone exits 1 at that assertion. |
| **New: DO-P1F-02** blind spot under a re-synced pin | **Fixed.** Where: `scripts/pm_orchestrator_event_oracles.py:662-679`, `:697`. Why: tightening `CoordinationProjectionApplicationV1`, `WorkflowCommandContextV1` or `WorkflowRootRefV1` with the pin re-synced still exited 0, because all 66 board fixture sources carry `original_output: null` and no value reaches them. A re-pin alone would have been a restamp. Fix: `successor_errors` also compares a content digest of the seven selected shared definitions, taken from the edition the reviews saw. Negatives added. | `4905a334d1`; `scripts/pm-orchestrator-event-contracts.py:108-132`, `:241` | `mutation-probes-before-guard.log` shows the three exit 0; `mutation-probes-after-guard.log` shows all seven exit 1 at `successor_selected_definitions`, and edits to the definitions main really changed still exit 0. |
| **New: DO-P1F-03** board members break a landed Storage rule | **Stopped for a decision; question below.** The lead answered at 21:43Z: conform. See "DO-P1F-03: findings and responses". | none; `Plans/storage-plan.md:530` against SP-720..722 | `python3 -m unittest tests.test_shared_runtime_storage_contracts` exits 0 on `main` and 1 here. |

### Pin update

| Resource | Old SHA-256 | New SHA-256 |
|---|---|---|
| `Plans/application_workflow_contracts.schema.json` | `1b64728552d4b7b4d514ebb3dd870d784dd7b2b69ad6b3cf1fb46d852764bdf0` | `79275341460c3779f5f82bf3063b1c433d64b7db34a007d09e02377040436ea4` |
| `Plans/shared_integration_runtime.schema.json` | `5293dd1e8d403a6e8da103bcd93e2811ddaec67aaa277541c26ede13064d3008` | `0e41d89065463e0581357a514ad3d2510d6db8a3e9356dcd23f717f5db4118f5` |
| `graph_sha256` (own recipe) | `ac6340a74ba70449226f94029b93b8cb42eedfeab84ba6393f7a58ba33bdd831` | `189b68da1fac653edc7908c7196bee9265995931cd093423440b67e93409cc89` |

**Why the pins moved:** one main commit, `3a93424300`. It changed `GoalCommandRequestApplicationV1` and `mcp_server_copy_request`, `persona_save_as_override_request`, `skill_copy_request`, and added their v2 and legacy editions. Neither file's `$id` nor any other top-level key changed. The other two pinned resources did not move.

**What DO relies on, and why it still holds:**
- **Selected definitions unchanged.** The checker's own resolver walks 12 selected roots and follows 76 `$ref` edges. Every edge and target is byte-identical in the old and new editions (`selected-edges.old.json` and `.new.json`, SHA-256 `109e2f5e33a7d47f4031ef9a09837be8e82d507ff9943074a58a7ea29647a08a` for both). They reach three definitions in the workflow file and four in the runtime file, and none is one main changed.
- **Checker result unchanged.** The old edition with old pins and the new edition with new pins both exit 0 with byte-identical stdout (`B2.out`, `C.out`).
- **Selected-definition digests unchanged.** `e6c9cdf3f042…` and `e61828e2206f…` come out the same on both editions.
- **Pin guard still refuses.** 16 controls and 2 clean-tree checks pass (`pin-controls.json`): moved content, forged pin and stale digest for each of the four resources, then new pin over the old edition and old pin over the new edition for each of the two moved files.

No DO contract or fixture needed to change. Both pins also match current `origin/main` `6861d332de`.

### DO-P1F-03: decision needed

_Answered by the lead at 21:43Z: conform. The text below is the question as it was asked; "DO-P1F-03: findings and responses" records the fix._

**Where:** the three members `crew_board_message_posted`, `crew_board_message_read` and `crew_board_messages_archived` in `coordination_event_records` (`Plans/storage_value_registry.json`, copied from `Plans/orchestrator_event_payloads.schema.json`), described by SP-720..722.

**Why it breaks:** landed SP-320 says an event-record member "carries `schema_version` and no `schema_id`, because the envelope's `payload_schema_id` names it" (`Plans/storage-plan.md:530`). SP-720 says this member's literal `schema_id` is stored. Readiness enforces the landed rule at `scripts/pm-implementation-readiness.py:6655` and refuses all three members. The same sentence of SP-320 also says members are copies from the file `value_schema_ref` names, and these come from a second file. No earlier round or review ran this test, so this is new to the lane's record, not caused by the rebase.

**Exact question:** should the three members drop their stored `schema_id` and conform to SP-320, or should SP-320 and the readiness guard be amended to allow it for exactly these three?

**Recommendation:** conform. The envelope already names the member, and amending would relax a landed rule. The cost is new payload schemas and regenerated board fixtures for three families, then a review. Either way the three member names and key shapes must join `STORAGE_VALUE_KEYED_COMPOSITION_MEMBERS` and `_KEY_SHAPES` (`scripts/pm-implementation-readiness.py:979`, `:1001`). Those tables are exact lists, so that adds nothing permissive.

### Census derivation

| Count | `main` | DO adds | Merged | Pin today |
|---|---:|---|---:|---:|
| Families | 344 | `crew_board_message_application_v2` | **345** | 344 |
| Materialized | 320 | same family | **321** | 320 |
| Deferred / alias | 23 / 1 | none | 23 / 1 | 23 / 1 |
| Tier-0 launch-critical | 61 | same family | **62** | 61 |
| Later / migration-only | 273 / 10 | none | 273 / 10 | 273 / 10 |
| Retention policies | 35 | none | 35 | 35 |

_Superseded by "DO-P1F-03: findings and responses", which moves these pins so the storage contract test can exit 0._

**Pins left at `main`'s values.** The rebase did not conflict on them, and `Plans/storage-plan.md:533` says readiness re-pins "only to landed, recorded registry changes". Most family-adding lane branches carry the same gap. So `scripts/pm-implementation-readiness.py:793`, `:797-806` and `tests/test_shared_runtime_storage_contracts.py:225-233` move to these numbers at landing.

### Checker runs (serial, this head)

| Command | Exit | Result | `origin/main` |
|---|---:|---|---|
| `python3 scripts/pm-orchestrator-event-contracts.py` | **0** | 25 families, 38,391 checks: round 8's 38,373 plus 1 row-drift negative and 17 selected-definition checks | not applicable |
| `probes.py family-suite` (round 8, relocated) | 0 | 25 families, the same per-family counts as round 8 (35,672) | not applicable |
| `probes.py responses` | 0 | as items 2 and 3 | not applicable |
| `probes.py cli-controls` | 0 | 9 of 9 entries end as round 8 recorded | not applicable |
| `python3 scripts/pm_event_numbers_corpus.py` | 0 | pass | not applicable |
| `python3 scripts/pm_event_numbers.py --self-test` | 0 | pass | not applicable |
| `python3 -m unittest tests.test_pm_event_index_binding` | 0 | 14 tests | not applicable |
| `python3 scripts/pm_coordination_events.py` | 1 | 2 baseline failures | same, byte-identical stdout |
| `python3 -m unittest discover -s tests -p test_pm_coordination_events.py` | 1 | 50 tests, 14 failures | same counts |
| `python3 scripts/pm-runtime-integration-canon-validate.py validate` | 1 | 161 failures | same, byte-identical stdout |
| `python3 scripts/pm-storage-profile-check.py` | 1 | 41 errors | same errors; differs only in families 345 and profiles 304 |
| `python3 -m unittest tests.test_shared_runtime_storage_contracts` | **1** | 16 tests, 2 failures: census counts and DO-P1F-03 | **0, new here** |
| `python3 scripts/pm-implementation-readiness.py validate` | 1 | 69 rows | 1, 59 rows. The 10 extra rows are the census, composition and self-test rows of the two items above |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | no change | not applicable |
| `python3 scripts/pm-plan-index.py generate` | 0 | timestamps only, so not committed | not applicable |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | 99 sources, 3,104 shards | not applicable |
| `python3 scripts/pm-plan-index.py validate` | **1** | 24 rows, below | 0, no rows |

### Index findings

All 24 rows appear only because `main` moved past this branch's base, and `main` itself has none of them.
- **3 rows, `plan_unit_removed_without_ledger_decision`:** DL-337, DL-338 and DL-339. Main added them after `2989975e8f`, so validate reads them as removed here.
- **21 rows, `plan_unit_removal_ledger_invalid`:** legacy ledgers, read only once a removal needs adjudicating.

**Check:** a trial merge of this head into `origin/main` `6861d332de` conflicted only in 66 generated files. After regeneration: validate exits 0 with no rows and the complete checker exits 0 with 38,391 checks. The trial was discarded, and nothing from it is on the branch.

### Open note for review

No fixture carries a non-null `original_output`, so the non-null branch at `scripts/pm_orchestrator_event_oracles.py:547` and the output root are never exercised by a value. DO-P1F-02 catches drift in that root; it does not prove a real output validates. Not on this pass's list, and not fixed.

## DO-P1F-03: findings and responses

Task: `lanes/DO-P1F03.md`. Branch start `075f07920f`. No rebase. The fix commits are `ad933eede3`, `52a498fa1d`, `7ca810a424`, `182035cfd5`, `f7990a7b45` and `f0d610eb32`. Evidence: `drafts/DO/sweep-p1/p1f3/`.

**Result:** the three `crew.board_*` members carry no stored `schema_id`. `tests.test_shared_runtime_storage_contracts` exits 0. Each family has a refusal negative with the specific readiness code. SP-320 and the readiness guard (`scripts/pm-implementation-readiness.py:6664`) are unchanged. No Decision Log entry, event registry append, admission, seal or reseal; `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore` and the frozen validator are unchanged.

### What changed per family

| | `crew.board_message_posted` | `crew.board_message_read` | `crew.board_messages_archived` |
|---|---|---|---|
| **Owner text** | SP-720, OSI-681 | SP-721, OSI-682 | SP-722, OSI-683 |
| **Orchestrator definition** | loses `schema_id` | loses `schema_id` | loses `schema_id` |
| **New payload schema, `Plans/coordination_event_payloads.schema.json`** | `$defs/crew_board_message_posted` | `$defs/crew_board_message_read` | `$defs/crew_board_messages_archived` |
| **Envelope `payload_schema_id`, unchanged value** | `pm.event_payload.crew_board_message_posted.v1@1.0.0` | `pm.event_payload.crew_board_message_read.v1@1.0.0` | `pm.event_payload.crew_board_messages_archived.v1@1.0.0` |
| **Fixture items regenerated** | 264 | 117 | 117 |
| **New `stored_schema_id` fixture negatives** | 4 | 3 | 3 |

**Why a second definition file.** SP-320 says members are copies from the file `value_schema_ref` names, and the row names `Plans/coordination_event_payloads.schema.json`. The members came from the Orchestrator file, the second half of this finding. Each new definition equals the Orchestrator one apart from `$schema` and `$id`, and sits outside the root `oneOf` of agent rows, like the `*ApplicationV1` editions already there. OSI-681..683 keep naming the Orchestrator definition, so two files now hold one definition. `board_member_failures` and the complete checker refuse drift between them.

**Registry row `coordination_event_records`.** Three fields change, all from the existing `expected_svr_rows()`:
- `value_schema`: three members lose `schema_id`, and `$comment` is rewritten.
- `optional_fields`: `schema_id` is removed. No other member has it.
- `migration`: one sentence follows the new source.

`required_fields` stays `["schema_version"]`. The key shapes are unchanged.

**Fixtures.** The lane has no standalone generator: rounds 1..8 evolved the file with scripts in the evidence folder. `tools/regen_board_fixtures.py` drives the same builders. Its gate replays them over the old file with no change, which must reproduce it byte for byte, and it did. No non-board item changes. All 97 digests of old board positives are gone.
- **Boundary vectors:** the 9 SP-337 vectors stay at exactly 16,384 and 16,385 encoded bytes.
- **Exact-family negatives:** the 20 that named a sibling through the stored `schema_id` now name it on the envelope, with the same one defect.

**Member separation.** `schema_id` used to tell the members apart. The composition's `oneOf` still accepts each value exactly once, because the members are closed and have different required fields. Every `board_storage_cases` and `body_cases` value runs through it.

### Census

The brief says to keep the census unchanged and also to make the test exit 0. The test pins 344 while the registry holds 345, so it cannot exit 0 with the pins left alone. I read "unchanged" as its own explanation says: no family is added or removed. The family set is identical before and after this round. The pins move to the numbers already derived in the fixture pass:

| Count | `main` | DO adds | Pin before | Pin after |
|---|---:|---|---:|---:|
| Families | 344 | `crew_board_message_application_v2` | 344 | **345** |
| Materialized | 320 | same family | 320 | **321** |
| Tier-0 launch-critical | 61 | same family | 61 | **62** |
| Deferred / alias | 23 / 1 | none | 23 / 1 | 23 / 1 |
| Later / migration-only | 273 / 10 | none | 273 / 10 | 273 / 10 |
| Retention policies | 35 | none | 35 | 35 |

Locations: `scripts/pm-implementation-readiness.py:796`, `:801`, `:806`; `tests/test_shared_runtime_storage_contracts.py:227`; `tests/test_pm_onboarding_phases.py:368`, `:369`, `:377`. Other lanes already re-pin this way (`ea-w2-filemanager` at 346, `ea-collab-prep` at 353).

The readiness tables `STORAGE_VALUE_KEYED_COMPOSITION_MEMBERS` and `_KEY_SHAPES` gain the three names and key shapes (`:992`, `:1017`). The fixture-pass recommendation named this. They are exact lists, so they add nothing permissive. The guard itself is untouched.

### Checks, before and after

Before is `075f07920f`. The round-8 controls' before column is the fixture-pass run at `b0e7f5fa35`, which differs from `075f07920f` only in this report. Main is `origin/main` `b78a5957fd`.

| Command | Before | After | `main` |
|---|---|---|---|
| `python3 -m unittest tests.test_shared_runtime_storage_contracts` | **1**: 16 tests, 2 failures | **0**: 17 tests | 0: 16 tests |
| `python3 -m unittest tests.test_pm_onboarding_phases` | 1: 50 tests, 1 failure | 0: 50 tests | not run |
| `python3 scripts/pm-orchestrator-event-contracts.py` | 0: 38,391 checks | **0: 38,535 checks** | not applicable |
| `probes.py family-suite` | 0: 35,672 | 0: 35,682 (posted 3,680 to 3,684; read 2,044 to 2,047; archived 2,048 to 2,051; the other 22 unchanged) | not applicable |
| `probes.py responses` | 0: flips 12/60/6, stays 66/18/72 | 0: same | not applicable |
| `probes.py cli-controls` | 0: 9 of 9 as recorded | 0: 9 of 9 as recorded | not applicable |
| `python3 scripts/pm_coordination_events.py` | 1: 2 baseline failures | 1: the same 2; the census detail lists the 3 new names | baseline |
| `python3 -m unittest discover -s tests -p test_pm_coordination_events.py` | 1: 50 tests, 14 failures | 1: the same 14 by name | baseline |
| `python3 scripts/pm-implementation-readiness.py validate` | 1: 69 rows | 1: 61 rows | 1: 59 rows |
| `python3 scripts/pm-storage-profile-check.py` | 1: 41 errors | 1: byte-identical stdout | baseline |
| `python3 scripts/pm-runtime-integration-canon-validate.py validate` | 1: 161 failures | 1: byte-identical stdout | baseline |
| `python3 -m unittest tests.test_pm_event_index_binding` | 0: 14 tests | 0: 14 tests | not applicable |
| `python3 scripts/pm_event_numbers_corpus.py` | 0 | 0 | not applicable |
| `python3 scripts/pm_event_numbers.py --self-test` | 0 | 0 | not applicable |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | not run | 0: churn only in the three edited documents | not applicable |
| `python3 scripts/pm-plan-index.py generate` | not run | 0: 7,519 plan units, none added or removed | not applicable |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | not run | 0: 99 sources | not applicable |
| `python3 scripts/pm-plan-index.py validate` | 1: 25 rows | 1: the same 25 rows | 0: no rows |

The 144 new complete-checker checks are 152 added minus 8 removed: the 8 board `valid_payloads` no longer have a missing-`schema_id` negative, because the field is gone.

**Readiness, 69 to 61.**
- **Gone, 9 rows:** family, status and tier counts; two member-order rows; the three stored-header rows; the self-test row.
- **New, 1 row:** `event_authority_currentness_source_drift` for `Plans/coordination_event_payloads.schema.json`, which this round edits.
- **Against `main`:** two more rows, both that class: this file and `Plans/Automated_Testing_System.md`. `main` has no row that this head lacks.

**Index, 25 rows, none caused by this round.** `main` moved past this branch's base, and `main` has none of them.
- **4 rows, `plan_unit_removed_without_ledger_decision`:** DL-337..340, added on `main` after `2989975e8f`.
- **21 rows, `plan_unit_removal_ledger_invalid`:** legacy ledgers, read once a removal needs adjudicating.

The fixture pass showed the same class clears on a trial merge. I did not repeat the trial, because the batch-2 integration rebases.

### Negatives

| Boundary | Defect | Refusal | Cases |
|---|---|---|---|
| **Readiness** | stored header on the member, optional form | `storage_value_registry_keyed_composition_payload_member_has_stored_header`, that code alone, naming the member | 1 per family, in `tests/test_shared_runtime_storage_contracts.py:239` and the complete checker |
| **Readiness** | stored header, required form | same | 1 per family, complete checker |
| **Coordination checker** | header in both definition files | `board_member_stored_header` | 1 per family |
| **Coordination checker** | drift, wrong `$id`, missing definition | `board_member_copy_drift`, `board_member_schema_id`, `board_member_definition_missing` | 3 per family |
| **Closed definition and stored composition** | value with a stored header | additional property | 2 per board event case |
| **Append, history** | same, with digests recaptured so it is the only defect | exactly `logical_payload_schema` | 2 per board event case |
| **Retry** | same | `retry_value_schema` | 1 per board event case |
| **Board join** | value with a stored header | exactly `board_member_stored_header` | 10 fixture cases |
| **Board join** | envelope names a sibling member | `board_family_payload_join` | 20 fixture cases, plus a foreign value on each of 10 storage cases |
| **Event join** | envelope names a sibling member | exactly `event_join_payload_schema_id` | 53 cases, all 25 families. This guard had no negative before |

The 40 wrong-type `schema_id` entries for the board families in `type_cases` stay (20 posted, 10 read, 10 archived). They now prove a wrong-typed stored header is refused as well.

**Full-entry controls through the real `main()`:** the clean tree exits 0. A stored header on the registry member exits 1 for each family, at `actual_coordination_storage_member_drift`. A stored header on an appended value exits 1 for each family, at the closed definition.

### Targeted guard isolation

One predicate cut at a time, for the guards this round adds or changes. This supplements the complete checker, as round 8's table did. It is not the whole-lane proof: that stays on the Part 2 list as P1..P3, and nothing here claims it. `targeted-isolation.json` holds the case names and mutant hashes.

| Guard cut | Own negatives that pass | Others still refused |
|---|---:|---:|
| Readiness stored-header refusal (landed, unchanged) | 6 | 2 |
| `board_join_errors`, stored header | 10 | 20 |
| `board_join_errors`, envelope names this member | 20 | 10 |
| `event_errors`, `payload_schema_id` join | 53 | 53 |
| Closed definition, `additionalProperties: false` | 8 | not cut for other members |
| `board_member_definition_failures`, stored header | 3 | 9 |
| `board_member_definition_failures`, `$id` | 3 | 9 |
| `board_member_definition_failures`, copy drift | 3 | 9 |
| `board_member_definition_failures`, missing definition | 3 | 9 |

### `closed_payload_schema` grades

| Family | Recorded before | At `075f07920f`, by the rubric | After |
|---|---|---|---|
| `crew.board_message_posted` | PASS (carried) | CONFLICT | **PASS** |
| `crew.board_message_read` | PASS (carried) | CONFLICT | **PASS** |
| `crew.board_messages_archived` | PASS (carried) | CONFLICT | **PASS** |

**Why it holds at PASS.** The rubric asks for a closed root at the registered version, compatible with current owner precedence. The roots were always closed, but the stored header broke landed SP-320, so the carried PASS claimed more than the tree showed. No earlier round ran this test. Now the member follows SP-320 and copies the right file, and the negatives above catch the defect. No other cell was re-graded, and the status counts stay 250 PASS / 25 PARTIAL / 25 ABSENT. Native execution stays NOT_RUN.

### Recurring classes

| Class | How it was ruled out, or not |
|---|---|
| **Forged or contradictory inputs** | The envelope's name is recomputed from the definition, never read from the payload. **Not ruled out for the frontier copies: see DO-P1F3-N1.** |
| **One field read two ways** | No check reads a payload `schema_id` now. `event_errors` uses one derivation for all 25 families. |
| **Unresolved references** | The three definitions contain no `$ref`; the eager closure on the composition still runs. |
| **Size limits** | The boundary vectors were resized and each asserted at its exact byte count. |
| **Historical readers** | The families were never admitted, so no retained value has a stored header. A value with one is refused on history. Retained positives keep their original recipes and number types. |
| **Masked negatives** | Each new negative changes one thing, with digests and field lists kept in step; the exact-list assertions and the table above show it. |
| **Grades** | The cell above says what the tests show. |
| **Types** | The guard tests key presence, so any value type is refused. The wrong-type `type_cases` still run. |
| **Number and date-time domains** | Not touched. They stay on the Part 2 list. |

### Open notes

- **DO-P1F3-N1, for the lead: a contradictory frontier is accepted.**
  - Where: `scripts/pm_orchestrator_event_oracles.py:991` (`recapture_history`) and `:843` (`checkpoint_errors`).
  - Why: `frontier.coverage.last_frame.frame_end_offset` and the segment's `scanned_through_offset`, `source_durable_end_offset` and `source_durable_bytes_sha256` all copy the event's bytes. The builder does not refresh them and no guard reads them. The 406 retained and 154 compatibility positives of the other 22 families, and their negatives, carry values from a different event.
  - Fix: refresh them in the builder, compare them in `checkpoint_errors`, and regenerate those families.
  - Status: not done here, because this round regenerates three families only. The board positives are already consistent. It predates this round, and a review could read it as a product guard accepting what it should refuse.
- **DO-P1F3-N2, for integration: census text.** `Plans/storage-plan.md:533` still says 344 and says readiness re-pins "only to landed, recorded registry changes". These pins land with the registry change they count, and they follow the lane branches above. At batch integration, recompute them from the merged registry and update that sentence.
- **DO-P1F3-N3, for integration: currentness.** The readiness row for `Plans/coordination_event_payloads.schema.json` clears with the currentness refresh, like the other drift rows. `reports/event-authority-20261104/census-recount-20261104/RECEIPT.json` also records that file's old hash, as a record of its own time; no script reads it.
- **The other 22 families keep their payload `schema_id`.** They are not keyed-composition members, so SP-320 does not reach them. The decision covers the three board members only.

## DO-P1F04: findings and responses

Task: `lanes/DO-P1F04.md`. Branch start `35ba68b6d0`. No rebase, and the census pins are unchanged. The fix commits are `13a0753acb` (builder and regenerated history) and `a0b3c1695a` (guard); this report and the self-grade are the next commit. Evidence: `drafts/DO/sweep-p1/p1f4/`. The JSON records named below are in its `after/` folder, and the tools are in `tools/`.

**Result:** DO-P1F3-N1 is fixed on both sides. `checkpoint_errors` now calls `coverage_copy_errors`, which recomputes the four coverage copies from the covered event and refuses each one that differs, each with its own code. `recapture_history` refreshes the copies. The 560 stale positives of the 22 non-board families, and the 1,110 history negatives built from them, are regenerated with the lane's builders. Only the four copies and the read token's frontier digest changed. The three board families' fixtures are byte-identical. No Decision Log entry, event-registry append, admission, seal or reseal. `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, the frozen validator and the census pins are unchanged.

### The defect

- **Where the copies went stale:** `scripts/pm_orchestrator_event_oracles.py`, `recapture_history` (now `:1135`). It refreshed every copied Storage observation except four, all copies of the event's bytes:
  - `frontier.coverage.last_frame.frame_end_offset`;
  - the segment's `scanned_through_offset`, `source_durable_end_offset` and `source_durable_bytes_sha256`.
- **Why nothing caught it:** `checkpoint_errors` read none of the four.
- **Effect, measured at `35ba68b6d0`:** every one of the 406 retained and 154 compatibility positives of the 22 non-board families held the bytes of its family's base event in the same partition, not its own. So did the 450 retained and 660 compatibility history negatives built from them. The 53 event positives and all board items were already consistent.

Under this round's guard, the base fixture file gives (`stale-base-fixture.json`):

| Items at `35ba68b6d0` | Under the new guard |
|---|---|
| 406 retained + 154 compatibility positives, non-board | refused, each with exactly the four copy codes |
| 53 event, 72 + 21 board retained and compatibility positives | accepted |
| 270 retained negatives, non-board (`forged_id`, `forged_key`, `withdrawn`) | own code **plus** the four copy codes: masked |
| 180 retained and 660 compatibility negatives, non-board | own code only; the recipe check refuses before the checkpoint is read |
| 80 + 90 board negatives | own code only |

### Guard

`coverage_copy_errors(event, coverage)` (`scripts/pm_orchestrator_event_oracles.py:921`) is called at the end of `checkpoint_errors` (`:910`). It recomputes `packed(event)`, the event's complete canonical MessagePack bytes, and compares by exact type (`typed_tree`), so `1344.0`, `"1344"` or `true` never equals `1344`. In this lane's one-event model the coverage holds one segment, the one the last frame names, and its one frame is the event's bytes from the segment's scan start. The four copies are read from that frame and segment, so four more predicates check that the frame and segment are the ones the copies describe.

| Predicate | Refusal code | Reads |
|---|---|---|
| one segment | `index_coverage_segment_count` | `len(segments) == 1` |
| segment is the frame's: generation | `index_coverage_segment_generation` | `segments[0].segment_generation` = `last_frame.segment_generation` |
| segment is the frame's: name | `index_coverage_segment_name` | `segments[0].segment_name` = `last_frame.segment_name` |
| frame starts at the scan start | `index_coverage_frame_byte_offset` | `last_frame.byte_offset` = `segments[0].scan_start_offset` |
| **copy 1** | `index_coverage_frame_end_offset` | `last_frame.frame_end_offset` = `len(packed(event))` |
| **copy 2** | `index_coverage_scanned_through_offset` | `segments[0].scanned_through_offset` = `len(packed(event))` |
| **copy 3** | `index_coverage_source_durable_end_offset` | `segments[0].source_durable_end_offset` = `len(packed(event))` |
| **copy 4** | `index_coverage_source_durable_bytes_sha256` | `segments[0].source_durable_bytes_sha256` = `sha256(packed(event))` |

The codes are the exported tuple `COVERAGE_COPY_CODES`. Each predicate is its own `if` line with its own append, so each can be cut alone.

### Negatives

**Single-defect negatives, one per predicate on every positive.** `coverage_copy_negatives(case)` (`:954`) builds eight from a valid case. Each changes exactly one field and re-digests the frontier into the read token's `frontier_sha256`, the one dependent copy, so the predicate is the only defect. `coverage_copy_checks` (`:1012`), run from `check_oracles`, applies them to every event, retained and compatibility positive of all 25 families.

| Predicate | The one change | Positives | Refused by |
|---|---|---:|---|
| `segment_count` | a second copy of the segment appended | 706 | `checkpoint_errors` and the historical reader, exactly this code |
| `segment_generation` | segment generation + 1 | 706 | same |
| `segment_name` | another schema-valid name: first-sequence field + 1 | 706 | same |
| `frame_byte_offset` | frame start + 1 | 706 | same |
| `frame_end_offset` | event size + 1 | 706 | same |
| `scanned_through_offset` | event size + 1 | 706 | same |
| `source_durable_end_offset` | event size + 1 | 706 | same |
| `source_durable_bytes_sha256` | SHA-256 of other bytes | 706 | same |

So 5,648 negatives, each asserting `checkpoint_errors(bad) == [code]` and `historical_read_errors(bad) == [code]`. On the 53 event positives, `recover_original` also returns `historical_original_unverified` with no receipt. Per family: 8 × the family's positives, from 8 × 17 = 136 (`parser.error`, `phase.force_completed`) to 8 × 67 = 536 (`subagent.retried`). The board families are covered too, without any change to their fixtures, because the negatives are built at run time from each positive.

**Wrong representations (Astra items 5 and 11).** On each event positive, every copy the guard reads takes each other form: float, string or bool for the integers; null or a trailing LF for the name; null, upper case or a trailing LF for the digest. That is 17 forms × 53 = 901.
- `coverage_copy_errors` alone refuses each with the copy's own code.
- Through `checkpoint_errors`, the strict checkpoint schema (exact type, full-match patterns) refuses every non-float form first, as `checkpoint_schema`.
- An integral float passes the schema's `integer` type, but SP-278's binding codec takes no float, so `checkpoint_errors` cannot digest the frontier and raises. The checker asserts that it raises. Recorded as sweep item DO-P1F4-S1 below.

### Builder and regeneration

**`recapture_history`** (`:1135`) now writes the four copies from `packed(event)` before it digests the frontier. It asserts the one-segment model.

**Regeneration.** `p1f4/tools/regen_coverage_fixtures.py` extends DO-P1F-03's `p1f3/tools/regen_board_fixtures.py` to the 22 non-board families. It drives the same lane builders: `recapture_history` and `numeric_history_case`, plus the round-6 and fix-round-7 negative builders with their logic unchanged. Nothing is edited by hand. Its gates:
1. **Faithfulness:** the base commit's builders, replayed over the base file, reproduce it byte for byte. So every difference comes from this round's change.
2. **Board families:** no board item changes. The new `recapture_history` is a fixpoint on all 8 + 72 + 21 board positives.
3. **Only the copies:** every changed item differs at exactly the four copies and `read.read_token.frontier_sha256`, and nowhere else.
4. **All consistent:** every checkpoint in the new file holds its own event's bytes: 53 + 478 + 175 positives and 530 + 750 negatives.

| Family | Retained positives | Compatibility positives | Retained negatives | Compatibility negatives |
|---|---:|---:|---:|---:|
| `config.validation.failed` | 10 | 7 | 10 | 30 |
| `parser.error` | 9 | 7 | 10 | 30 |
| `phase.force_completed` | 9 | 7 | 10 | 30 |
| `subagent.budget_warning` | 18 | 7 | 20 | 30 |
| `subagent.cancelled` | 18 | 7 | 20 | 30 |
| `subagent.completed` | 18 | 7 | 20 | 30 |
| `subagent.context_warning` | 18 | 7 | 20 | 30 |
| `subagent.escalated` | 18 | 7 | 20 | 30 |
| `subagent.failed` | 18 | 7 | 20 | 30 |
| `subagent.message_received` | 18 | 7 | 20 | 30 |
| `subagent.message_sent` | 18 | 7 | 20 | 30 |
| `subagent.model_switched` | 18 | 7 | 20 | 30 |
| `subagent.output_truncated` | 18 | 7 | 20 | 30 |
| `subagent.paused` | 18 | 7 | 20 | 30 |
| `subagent.progress` | 18 | 7 | 20 | 30 |
| `subagent.resumed` | 18 | 7 | 20 | 30 |
| `subagent.retried` | 54 | 7 | 60 | 30 |
| `subagent.spawned` | 18 | 7 | 20 | 30 |
| `subagent.started` | 18 | 7 | 20 | 30 |
| `subagent.timeout` | 18 | 7 | 20 | 30 |
| `subagent.tool_called` | 18 | 7 | 20 | 30 |
| `subagent.tool_completed` | 18 | 7 | 20 | 30 |
| **Total, 22 families** | **406** | **154** | **450** | **660** |

**Board fixtures unchanged.** Every board item in every list is byte-identical to `35ba68b6d0`. The per-list SHA-256 values of the board items are in `regen-manifest.json`, as before = after.

**Every other item unchanged except the copies.** Independently of the tool, `git diff -U0 35ba68b6d0 13a0753acb -- Plans/orchestrator_event_contract_fixtures.json` changes exactly 1,670 lines of each of five keys and no other line: `frame_end_offset`, `scanned_through_offset`, `source_durable_end_offset`, `source_durable_bytes_sha256` and `frontier_sha256`. 1,670 = 406 + 154 + 450 + 660. The file stays 53,997,925 bytes. 22 of its 26 lists are untouched. SHA-256 goes from `9b51b091…ef157` to `f9eaa667…7e489`.

### Checks, before and after

Before is `35ba68b6d0`; after is `a0b3c1695a`, the guard commit, whose code and fixtures this report commit does not change. Run serially on the VM.

| Command | Before, `35ba68b6d0` | After, `a0b3c1695a` |
|---|---|---|
| `python3 scripts/pm-orchestrator-event-contracts.py` | 0: 38,535 checks | **0: 52,763 checks** |
| `python3 -m unittest tests.test_shared_runtime_storage_contracts` | 0: 17 tests | 0: 17 tests |
| `python3 -m unittest tests.test_pm_onboarding_phases` | 0: 50 tests | 0: 50 tests |
| round 8 `probes.py family-suite` | 0: 35,682 | 0: 49,910; every family gains, from +331 (`parser.error`, `phase.force_completed`) to +1,391 (`subagent.retried`) |
| round 8 `probes.py responses` | 0: flips 12/60/6, stays 66/18/72 | 0: the same |
| round 8 `probes.py cli-controls` | 0: 9 of 9 as recorded | 0: 9 of 9 as recorded |

Other checks at the new head, against DO-P1F-03's run of the same code at `35ba68b6d0`:

| Command | After | Against DO-P1F-03's run |
|---|---|---|
| `python3 -m unittest tests.test_pm_event_index_binding` | 0: 14 tests | same |
| `python3 scripts/pm_event_numbers_corpus.py`, `pm_event_numbers.py --self-test` | 0, 0 | same |
| `python3 scripts/pm_coordination_events.py` | 1: the 2 baseline failures | stdout byte-identical |
| `python3 scripts/pm-implementation-readiness.py validate` | 1: 61 rows | stdout identical apart from `generated_at_utc` |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0: 99 sources, 3,104 shards, no file changed | n/a |
| `python3 scripts/pm-plan-index.py generate` | 0: 7,519 plan units; four index files differ only in `generated_at_utc`, so nothing is committed | n/a |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0: 99 sources, 3,104 shards | same |
| `python3 scripts/pm-plan-index.py validate`, `origin/main` `0adb197992` | 1: 25 rows, 4 `plan_unit_removed_without_ledger_decision` (DL-337..340) and 21 `plan_unit_removal_ledger_invalid` | the same 25 rows, none caused by this round |

The 14,228 new complete-checker checks are 706 positive copy checks, 11,296 negatives through the checkpoint and the historical reader, 424 refused recoveries and 1,802 wrong-representation checks. The intermediate commit `13a0753acb` (builder and fixtures, no guard) also exits 0 with 38,535 checks.

### Guard cut

`p1f4/tools/p1f4_controls.py isolation` cuts one predicate at a time by deleting its `if` line and its append line. Each cut then runs the lane's whole complete checker, `main()` of `scripts/pm-orchestrator-event-contracts.py`, against the mutant. Only the new negatives' assertions are turned into records: own negatives must now pass, and the other seven predicates' negatives must still be refused with exactly their code. Every other assertion in the checker still runs, and `main()` must complete. So each row shows that removing the predicate flips its own negatives and nothing else in the lane. `guard-isolation.json` holds the removed lines and mutant hashes.

| Predicate cut | Own negatives that now pass | Other predicates' negatives, still refused with exactly their code | Own wrong forms that now pass | Other wrong forms still refused | Complete checker under the cut |
|---|---:|---:|---:|---:|---|
| `segment_count` | 706 | 4,942 | 0 | 901 | completes; every other assertion holds |
| `segment_generation` | 706 | 4,942 | 159 | 742 | completes; every other assertion holds |
| `segment_name` | 706 | 4,942 | 106 | 795 | completes; every other assertion holds |
| `frame_byte_offset` | 706 | 4,942 | 159 | 742 | completes; every other assertion holds |
| `frame_end_offset` | 706 | 4,942 | 106 | 795 | completes; every other assertion holds |
| `scanned_through_offset` | 706 | 4,942 | 106 | 795 | completes; every other assertion holds |
| `source_durable_end_offset` | 706 | 4,942 | 106 | 795 | completes; every other assertion holds |
| `source_durable_bytes_sha256` | 706 | 4,942 | 159 | 742 | completes; every other assertion holds |

Own negatives are the 53 event, 478 retained and 175 compatibility positives' negatives for that predicate. Under every cut all 706 positives still pass. `segment_count` has no field form.

**Builder cut.** Removing the refresh from `recapture_history` makes the complete checker fail: `main()` stops at `scripts/pm-orchestrator-event-contracts.py:194`, the stored-`schema_id` history negative of `crew.board_message_posted:application:1`. Its case is built at run time and now carries stale copies. Run directly, that case gives the four copy codes plus `logical_payload_schema`, where production gives `logical_payload_schema` alone. `numeric_history_case` on `config.validation.failed:project:0` with `1.0` gives the four copy codes, where production gives none (`builder-cut.json`).

The predicates are distinct fields, with no duplicates, so each has a flipping negative. This is targeted proof for the guard this round adds. It supplements the complete checker, as rounds 8 and P1F-03 did; the whole-lane proof stays on the Part 2 list as P1..P3.

### Cells re-graded

Only `retention` and `consumers_checkpoints` of the 22 non-board families. Every other cell, and both cells of the three board families, are carried.

| Cell, 22 families | Recorded before | At `35ba68b6d0`, by the rubric | After | Why |
|---|---|---|---|---|
| `consumers_checkpoints` | PASS (carried) | PARTIAL | **PASS** | At `35ba68b6d0` the oracle read none of the four copies, and the retained and compatibility positives held another event's bytes, so the PASS claimed more than the tests showed. The guard now refuses each copy with its own code and negative, the builder refreshes them, the positives are true, and each cut flips only its own negatives. Holds PASS. |
| `retention` | PARTIAL (carried) | PARTIAL | **PARTIAL** | The regenerated retained positives are now true fixtures, but the cell is PARTIAL for the unlanded Storage retention integration and Q1/Q3, which no fixture reaches. Holds. |

Status counts stay **250 PASS / 25 PARTIAL / 25 ABSENT**. The board families' `consumers_checkpoints` is not re-graded per the brief. Their positives were already consistent, and the new negatives cover them. Native execution stays NOT_RUN.

### Recurring classes

| Class | How it was ruled out |
|---|---|
| **Forged or contradictory inputs** | The four copies are recomputed from the event, never read as supplied. The 560 contradictory positives are refused at the base. DO-P1F3-N1 is closed. The sequence copies are open: see DO-P1F4-N1. |
| **Masked negatives** | Each negative changes one field and keeps the frontier digest in step. Each cut flips only its own 706, under the whole checker. The 270 retained negatives that would have been masked are rebuilt and refuse with their own code alone. |
| **One field read two ways / types** | Exact-type comparison. Every non-float form is refused by the schema and by the guard. Floats: DO-P1F4-S1. |
| **Formats** | Name and digest with a trailing LF are refused by the strict schema's full match and by the guard. |
| **Historical readers** | Retained and compatibility positives keep their original recipes, number types and receipts. Only the four copies and the frontier digest changed. |
| **Grades** | `consumers_checkpoints` says what the tests show. |

### Open notes

- **DO-P1F4-N1, for the lead: sequence copies in the frontier and anchor are still not read.**
  - Where: `checkpoint_errors` (`scripts/pm_orchestrator_event_oracles.py:843`) checks the coverage-level sequence facts, but not their copies at `segments[0].first_sequence_id`, `last_sequence_id` and `retained_event_count`, at `anchor.first_retained_sequence_id`, `through_sequence_id` and `retained_event_count`, or the first-sequence field of `segment_name`.
  - Why: no builder changes `sequence_id`, so all 706 positives agree (probe in `sequence-copies.json`). A forged one is still accepted.
  - Fix: the same pattern as this round, a predicate per copy with its own negative.
  - Not done: the brief scoped this round to the four byte copies. It is the same class as standing check 7.
- **DO-P1F4-S1, sweep item (number domain): integral float copies.** The checkpoint schema's `integer` admits `1344.0`. `binding_bytes` (`scripts/pm_event_index_binding.py:40`) then raises `TypeError` on the frontier digest, before any coded refusal. The guard itself refuses it by exact type, and the checker asserts the raise. Owner-declared integer slots belong to the shared number rule (CV-1100/SP-1100), so this is left for the sweep.
- **Null `last_frame`, pre-existing.** The schema allows `last_frame: null`. `index_complete_source_coverage` (`:907`) indexes it before this guard runs, so a null raises `TypeError` rather than a code. Nothing accepts it. Recorded for the guard-table work.
- **DO-P1F3-N2 and N3** (census text, currentness) stand as written.

## DO-P1F05: findings and responses

Task: `lanes/DO-P1F05.md`. Branch start `37c1176bec`. No rebase, and the census pins are unchanged. The fix commits are `05a18b3a05` (guard, negatives and wrong forms) and `593ad58879` (builder); this report and the self-grade are the next commit. Evidence: `drafts/DO/sweep-p1/p1f5/`. The JSON records named below are in its `after/` folder, and the tools are in `tools/`.

**Result:** DO-P1F4-N1 and the null `last_frame` crash are fixed.
- **The guard:** `checkpoint_errors` now calls `sequence_copy_errors`. It recomputes every frontier and birth-anchor copy of the covered event's sequence number from the event and compares each by exact type. Each of the twelve copies has its own refusal code.
- **The null frame:** a null `last_frame` is refused as `index_coverage_last_frame_null` instead of raising `TypeError`.
- **The last-event-id:** it moves out of the shared code into `index_coverage_frame_last_event_id`.
- **Negatives:** every positive of all 25 families gets a single-defect negative per predicate, refused with exactly its code by `checkpoint_errors` and the historical reader. Wrong-type forms are added.
- **The builder:** `recapture_history` derives every copy from the event. The fixture file is byte-identical.
- **Records not touched:** no Decision Log entry, event-registry append, admission, seal or reseal. `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, the frozen validator and the census pins are unchanged.

### The defect

**Where:** `checkpoint_errors` (`scripts/pm_orchestrator_event_oracles.py:843` at `37c1176bec`).
- **Never read:** the segment's `first_sequence_id`, `last_sequence_id` and `retained_event_count`, the birth anchor's `first_retained_sequence_id`, `through_sequence_id` and `retained_event_count`, and the sequence fields of the segment name.
- **Read, but loosely:** the coverage-level `first_retained_sequence_id`, `through_sequence_id`, `retained_event_count` and `last_frame.last_sequence_id`. They shared the one code `index_complete_source_coverage` with `complete_to_captured_boundary` and `last_frame.last_event_id`. They were compared with Python `!=`, and no negative reached that code.

**Effect:** the base checker, run against this round's negatives (`defect-at-base.json`):

| This round's case, on all 706 positives | Base checker at `37c1176bec` (`historical_read_errors`, which runs `checkpoint_errors` first) |
|---|---|
| `coverage_first_retained_sequence_id` | refused: `index_complete_source_coverage` |
| `coverage_through_sequence_id` | refused: `index_complete_source_coverage` |
| `coverage_retained_event_count` | refused: `index_complete_source_coverage` |
| `coverage_frame_last_sequence_id` | refused: `index_complete_source_coverage` |
| `coverage_segment_first_sequence_id` | **accepted** |
| `coverage_segment_last_sequence_id` | **accepted** |
| `coverage_segment_retained_event_count` | **accepted** |
| `coverage_segment_name_first_sequence` | **accepted** |
| `coverage_segment_name_last_sequence` | **accepted** |
| `anchor_first_retained_sequence_id` | **accepted** |
| `anchor_through_sequence_id` | **accepted** |
| `anchor_retained_event_count` | **accepted** |
| `empty_source_null_frame` | **raises `TypeError`** |
| `bare_null_frame` | refused: `checkpoint_schema` |
| `last_event_id` | refused: `index_complete_source_coverage` |
| `incomplete_coverage` | refused: `checkpoint_schema` |
| `closed_segment_control` (a positive) | accepted |

All 706 positives agree on every copy (`builder-fixpoint.json`), so no positive was false. A forged copy was accepted, as DO-P1F4-N1 said.

**The null last frame.** The schema's `allOf` admits a null `last_frame` only in the empty-retained-source form: `empty_retained_source` true, null first and through, and a zero count. Any other null is `checkpoint_schema`.
- **At `37c1176bec`:** the empty form raised `TypeError` at `scripts/pm_orchestrator_event_oracles.py:937`, the first frame read of DO-P1F04's `coverage_copy_errors`.
- **Where the crash came from:** DO-P1F04's note placed it in `index_complete_source_coverage`. That is not where it happens. That compound short-circuits on the null through-sequence. At `35ba68b6d0` the same input was refused as `index_complete_source_coverage`, so the crash came with DO-P1F04's guard (`a0b3c1695a`).

### Guard

**The call:** `sequence_copy_errors(event, anchor, coverage)` (`scripts/pm_orchestrator_event_oracles.py:971`) is called at the end of `checkpoint_errors` (`:915`), after `coverage_copy_errors`.

**What it recomputes:** in this lane's one-event model, the generation's birth anchor and its current frontier each retain exactly the covered event, in the one segment the last frame names. So each first, through and last sequence is the event's Storage-assigned `sequence_id`, and each retained count is one. The name's sequence fields follow `storage-plan.md:460-461`: `seg-{generation:06}-{start_seq:020}.active`, or `…-{end_seq:020}.seglog` when closed. Each predicate is its own `if` line with its own append.

**Exact type:** values are compared with `typed_tree`, so `7.0`, `"7"`, `true` or null is not 7, and `true` is not 1. The name is read from the last frame, and DO-P1F04's `index_coverage_segment_name` keeps the segment's name equal to it.

| Predicate | Refusal code | Reads |
|---|---|---|
| coverage first | `index_coverage_first_retained_sequence_id` | `coverage.first_retained_sequence_id` = `sequence_id` |
| coverage through | `index_coverage_through_sequence_id` | `coverage.through_sequence_id` = `sequence_id` |
| coverage count | `index_coverage_retained_event_count` | `coverage.retained_event_count` = 1 |
| last frame | `index_coverage_frame_last_sequence_id` | `last_frame.last_sequence_id` = `sequence_id` |
| segment first | `index_coverage_segment_first_sequence_id` | `segments[0].first_sequence_id` = `sequence_id` |
| segment last | `index_coverage_segment_last_sequence_id` | `segments[0].last_sequence_id` = `sequence_id` |
| segment count | `index_coverage_segment_retained_event_count` | `segments[0].retained_event_count` = 1 |
| name, first field | `index_coverage_segment_name_first_sequence` | the last frame's name matches the grammar in full, and its 20-digit first-sequence field = `sequence_id` zero-padded |
| name, last field | `index_coverage_segment_name_last_sequence` | a closed name's 20-digit last-sequence field = `sequence_id` zero-padded |
| anchor first | `index_anchor_first_retained_sequence_id` | `anchor.first_retained_sequence_id` = `sequence_id` |
| anchor through | `index_anchor_through_sequence_id` | `anchor.through_sequence_id` = `sequence_id` |
| anchor count | `index_anchor_retained_event_count` | `anchor.retained_event_count` = 1 |

The codes are the exported tuple `SEQUENCE_COPY_CODES`.

**In `checkpoint_errors` itself:**

| Predicate | Refusal code | Reads |
|---|---|---|
| null last frame (`:907`) | `index_coverage_last_frame_null` | `last_frame is None`. It returns at once, because every frame and segment copy after it reads the frame. |
| last event id (`:912`) | `index_coverage_frame_last_event_id` | `last_frame.last_event_id` = `event_id`, by exact type; it used to share `index_complete_source_coverage` |
| coverage complete (`:910`) | `index_complete_source_coverage`, unchanged | `complete_to_captured_boundary is True`. It duplicates the schema's `const: true`; see the pair proof below. |

Not weakened: each clause of the old compound is still refused, each now under its own code and by exact type.

### Negatives

`sequence_copy_negatives(case)` (`:1151`) and `frame_negatives(case)` (`:1188`) build them from a valid case. `sequence_copy_checks` (`:1245`), run from `check_oracles`, applies them to every event, retained and compatibility positive of all 25 families: 53 + 478 + 175 = 706.
- **One change each:** each changes one copy (or one count).
- **Digests in step:** each keeps the read token's `generation_anchor_sha256` and `frontier_sha256` in step, the dependent copies. So the predicate is the only defect.
- **Values:** first-sequence copies move down by one, and through and last copies move up by one, so first ≤ through still holds. Counts become 2.
- **The name:** it changes in both of its copies, which DO-P1F04's predicate keeps equal.
- **The closed name:** the last-field negative is built on a closed-segment control. That control is the positive with its segment closed: a closed name in both copies whose two sequence fields are the event's, and state `closed`. Every control must be accepted by `checkpoint_errors` and the historical reader, so 706 more positives.

| Negative | The one change | Expected | Per positive | Total |
|---|---|---|---:|---:|
| 12 sequence predicates | the copy, as above | exactly its own code | 12 | 8,472 |
| `empty_source_null_frame` | the schema's empty-retained-source form (the only schema-valid null frame) | `index_coverage_last_frame_null` | 1 | 706 |
| `bare_null_frame` | `last_frame` null alone | `checkpoint_schema` (the schema's `allOf`) | 1 | 706 |
| `last_event_id` | another event's id | `index_coverage_frame_last_event_id` | 1 | 706 |
| `incomplete_coverage` | `complete_to_captured_boundary` false | `checkpoint_schema` (the schema's `const`) | 1 | 706 |

So there are 11,296 negatives, each asserting `checkpoint_errors(bad) == [code]` and `historical_read_errors(bad) == [code]`. On the 53 event positives, `recover_original` also returns `historical_original_unverified` with no receipt (848). Per family: 16 × the family's positives, from 16 × 17 = 272 (`parser.error`, `phase.force_completed`) to 16 × 67 = 1,072 (`subagent.retried`).

**The empty-source negative changes five fields.** The schema forces all five together: a null frame needs empty true, null first and through, and a zero count. Changing fewer fields than this is a different negative, the bare null, which the schema refuses. Only `index_coverage_last_frame_null` refuses the empty form. With that predicate cut, the form raises `TypeError` again, and no other guard refuses it with a code (see the cut table).

**Wrong representations (Astra items 4, 5 and 11).** On each event positive, every sequence copy takes each other form:
- **Numbers and counts:** float, string, bool and null.
- **The name:** null, a trailing LF, or its first-sequence field without zero padding.

That is 43 forms × 53 = 2,279.
- **The guard alone:** `sequence_copy_errors` refuses each with the copy's own code.
- **Forms the schema admits:** a null segment first or last, and a null anchor first or through. Through `checkpoint_errors` and the historical reader these are refused with exactly the copy's own code (212 forms, 424 checks).
- **Other non-float forms:** the strict schema refuses them first, as `checkpoint_schema` (1,537 forms, 3,074 checks).
- **Integral floats:** the schema's `integer` admits them, and SP-278's binding codec raises `TypeError` digesting the frontier or anchor. The checker asserts the raise (530). This stays sweep item DO-P1F4-S1.

### Builder

**No builder wrote these copies before.** `recapture_history` refreshed the row key and retained prefix from the event's sequence. It left the sequence copies, and the row's `sequence_id`, as they were. No builder changes `sequence_id`, so every fixture agrees. But a builder that moved a sequence would have left them stale, the class DO-P1F04 closed for the bytes.

**The change:** `refresh_sequence_copies` (`:1380`), called from `recapture_history` (`:1412`) before the frontier and anchor are digested, writes:
- the coverage, last-frame, segment and anchor copies;
- both name copies (keeping the generation and the name's form);
- the index row's `sequence_id`.

**Fixtures unchanged** (`builder-fixpoint.json`):
- **The file:** the fixture file's SHA-256 is the same at `37c1176bec` and at the head, and the commits do not touch it.
- **The refresh:** `refresh_sequence_copies` is a fixpoint on all 1,986 checkpoint-holding cases in the file: 53 event, 478 retained and 175 compatibility positives, and 530 retained and 750 compatibility history negatives.
- **The builder:** the new `recapture_history` gives the same value and MessagePack bytes as the base one on all 706 positives.

So regenerating the fixtures with the new builder would change nothing.

**Builder control.** On each event positive, Storage assigns the event the next sequence number and `recapture_history` recaptures it. `checkpoint_errors`, the historical reader and `recover_original` must accept it (159 checks).

**Builder cut** (`builder-cut.json`): removing the `refresh_sequence_copies(case)` call makes the complete checker fail at the resequenced control. Run directly, each of the 53 resequenced cases is then refused with exactly `index_row_sequence_id`, `index_coverage_first_retained_sequence_id`, `index_coverage_through_sequence_id`, `index_coverage_frame_last_sequence_id`, `index_coverage_segment_first_sequence_id`, `index_coverage_segment_last_sequence_id`, `index_coverage_segment_name_first_sequence`, `index_anchor_first_retained_sequence_id`, `index_anchor_through_sequence_id` (53 of 53); production gives none.

### Checks, before and after

Before is `37c1176bec`. After is `593ad58879`, whose code and fixtures this report commit does not change. Run serially on the VM.

| Command | Before, `37c1176bec` | After, `593ad58879` |
|---|---|---|
| `python3 scripts/pm-orchestrator-event-contracts.py` | 0: 52,763 checks | **0: 84,787 checks** |
| `python3 -m unittest tests.test_shared_runtime_storage_contracts` | 0: 17 tests | 0: 17 tests |
| `python3 -m unittest tests.test_pm_onboarding_phases` | 0: 50 tests | 0: 50 tests |
| round 8 `probes.py family-suite` | 0: 49,910 | 0: 81,934; every family gains, from +733 (`parser.error`, `phase.force_completed`) to +3,173 (`subagent.retried`) |
| round 8 `probes.py responses` | 0: flips 12/60/6, stays 66/18/72 | 0: the same |
| round 8 `probes.py cli-controls` | 0: 9 of 9 as recorded | 0: 9 of 9 as recorded |

The intermediate commit `05a18b3a05` (guard, no builder change) also exits 0, with 84,628 checks.

**The 32,024 new complete-checker checks:**
- 706 positive copy checks;
- 1,412 closed-segment control checks;
- 22,592 negatives through the checkpoint and the historical reader;
- 848 refused recoveries;
- 6,307 wrong-representation checks;
- 159 resequenced builder-control checks.

**Other checks at the head,** against DO-P1F04's run at `a0b3c1695a`:

| Command | After | Against DO-P1F04's run |
|---|---|---|
| `python3 -m unittest tests.test_pm_event_index_binding` | 0: 14 tests | same |
| `python3 scripts/pm_event_numbers_corpus.py`, `pm_event_numbers.py --self-test` | 0, 0 | stdout identical |
| `python3 scripts/pm_coordination_events.py` | 1: the 2 baseline failures | stdout byte-identical |
| `python3 scripts/pm-implementation-readiness.py validate` | 1: 61 rows | stdout identical apart from `generated_at_utc` |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0: 99 sources, 3,104 shards | same |
| `python3 scripts/pm-plan-index.py validate`, `origin/main` `0adb197992` | 1: the same 25 rows (4 `plan_unit_removed_without_ledger_decision`, 21 `plan_unit_removal_ledger_invalid`) | identical apart from `generated_at_utc`; none caused by this round |

No `Plans/*.md` file changed, so shards and the index were not regenerated.

### Guard cut

**The tool:** `p1f5/tools/p1f5_controls.py isolation` cuts one new predicate at a time by deleting its `if` line and its refusal line.

**What each cut runs:** the lane's whole complete checker, `main()` of `scripts/pm-orchestrator-event-contracts.py`, against the mutant. Only this round's negatives' assertions are turned into records:
- its own negatives must now pass (the null cut: raise again);
- the other fifteen negatives must still be refused with exactly their code;
- the closed and resequenced controls must still be accepted.

Every other assertion in the checker still runs, DO-P1F04's eight coverage predicates and their 5,648 negatives included, and `main()` must complete. `reference_errors`, a pure schema-closure check, is memoized with the cycle-8 review's `pure_cache` to halve the run time. Every instance, guard, digest and expectation still runs. `guard-isolation.json` holds the removed lines and mutant hashes.

| Predicate cut | Own negatives under the cut | Other 15 negatives, still refused with exactly their code | Own wrong forms now passing the guard | Own schema-admitted forms now passing the checkpoint | Complete checker under the cut |
|---|---:|---:|---:|---:|---|
| `index_coverage_first_retained_sequence_id` | 706 pass | 10,590 | 212 | 0 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_through_sequence_id` | 706 pass | 10,590 | 212 | 0 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_retained_event_count` | 706 pass | 10,590 | 212 | 0 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_frame_last_sequence_id` | 706 pass | 10,590 | 212 | 0 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_segment_first_sequence_id` | 706 pass | 10,590 | 212 | 53 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_segment_last_sequence_id` | 706 pass | 10,590 | 212 | 53 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_segment_retained_event_count` | 706 pass | 10,590 | 212 | 0 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_segment_name_first_sequence` | 706 pass | 10,590 | 159 | 0 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_segment_name_last_sequence` | 706 pass | 10,590 | 0 | 0 | completes; all 52,763 checks outside this round's block hold |
| `index_anchor_first_retained_sequence_id` | 706 pass | 10,590 | 212 | 53 | completes; all 52,763 checks outside this round's block hold |
| `index_anchor_through_sequence_id` | 706 pass | 10,590 | 212 | 53 | completes; all 52,763 checks outside this round's block hold |
| `index_anchor_retained_event_count` | 706 pass | 10,590 | 212 | 0 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_last_frame_null` | 706 raise `TypeError` again | 10,590 | 0 | 0 | completes; all 52,763 checks outside this round's block hold |
| `index_coverage_frame_last_event_id` | 706 pass | 10,590 | 0 | 0 | completes; all 52,763 checks outside this round's block hold |

**Zeros in the table:**
- **Name last field:** it has no wrong forms of its own. A malformed name fails the full grammar match and is refused by the first-sequence predicate.
- **Last event id and null frame:** they are not sequence copies, so they have no forms.
- **Name first field:** it has three forms (159), against four for the numbers (212).
- **Schema-admitted forms:** only the null segment and anchor sequence fields are admitted by the schema.

**Reading the table:**
- **Own negatives:** these are the 53 event, 478 retained and 175 compatibility positives' negatives for that predicate.
- **Positives:** under every cut, all 706 positives, 706 closed controls and 53 resequenced controls still pass.
- **Own wrong forms (guard):** under each cut the guard alone stops refusing them.
- **Own schema-admitted forms:** forms the schema admits that, through the whole checkpoint, now pass.

**The coverage-complete flag** (`complete-flag-pair.json`) is one input invariant, `complete_to_captured_boundary` is true, at two sites: the schema's `const: true` and the runtime clause. Cut site by site on all 706 `incomplete_coverage` negatives, through `checkpoint_errors` and the historical reader:

| Sites cut | `checkpoint_errors` and the historical reader, all 706 | Positives |
|---|---|---|
| none (production) | `checkpoint_schema` | 706 pass |
| runtime clause only | `checkpoint_schema` | 706 pass |
| schema const only (all four inline copies of the coverage object) | `index_complete_source_coverage` | 706 pass |
| both | **accepted** | 706 pass |

Only the copy under `#/$defs/checkpoint` is on the checkpoint validator's path; the other three are the same const in the schema's other inline copies of the coverage object. So neither site alone lets the defect through, and with both cut it passes.

### Cells re-graded

**Which cell:** only `consumers_checkpoints`, now for all 25 families. The guard, the null refusal, the builder and the negatives are checkpoint joins run on every positive of every family, the three board families included.

**Cells carried:**
- **`retention`:** no fixture, retention rule or retained recipe changed.
- **`compatibility_withdrawal`:** no compatibility or withdrawal rule changed.
- **`positive_negative_oracles`:** the family-level oracle claims are unchanged.

| Cell, 25 families | Recorded before | At `37c1176bec`, by the rubric | After | Why |
|---|---|---|---|---|
| `consumers_checkpoints` | PASS (22 `held_after_fix` by DO-P1F04, 3 board `carried`) | PARTIAL | **PASS** | See below. |

**Why `consumers_checkpoints` holds PASS:**
- **At `37c1176bec`:** the oracle accepted a forged segment, anchor or name sequence copy. It compared the coverage-level ones with `!=` under a shared code with no negative, and it crashed on the schema-valid null frame. So the PASS claimed more than the tests showed.
- **Now:** each copy is refused with its own code and a single-defect negative on every positive. The null frame and last event id have codes and negatives. The builder derives the copies, and each cut flips only its own negatives.

Status counts stay **250 PASS / 25 PARTIAL / 25 ABSENT**. Native execution stays NOT_RUN.

### Recurring classes

| Class | How it was ruled out |
|---|---|
| **Forged or contradictory inputs** | Every sequence copy in the frontier and anchor is recomputed from the event. DO-P1F4-N1 is closed. The segment's identity copies are not sequence copies (open note DO-P1F5-N1). |
| **Storage-assigned metadata** | The event's `sequence_id` is the one source. Every copy is checked against it, and the builder derives them from it. |
| **Masked negatives** | Each negative changes one copy and keeps both digests in step. Each cut flips only its own 706, under the whole checker. The coverage-complete pair is proved site by site. |
| **One field read two ways / types** | Exact-type comparison. A name with an unpadded first field, a trailing LF or null is refused by the full-grammar match. String, bool and null are refused by the schema, or by the guard where the schema admits null. Floats: DO-P1F4-S1. |
| **Historical readers** | No retained or compatibility positive changed. Each new negative is refused by the historical reader with the same single code. |
| **Grades** | `consumers_checkpoints` says what the tests show. |

### Open notes

- **DO-P1F5-N1, for the lead: segment identity copies are still not read.**
  - **Where:** `checkpoint_errors`. These are copies of the segment's identity, not of the event's sequence:
    - the generation field of the segment name, against `segment_generation`;
    - the name's form (`.active` or `.seglog`), against `segments[0].state`;
    - `selected_segment_generation` in both source selections.
  - **Why it stays open:** all 706 positives agree (`seg-000001-…`, generation 1, state `active`, selected generation 1), but no guard compares these copies. Even this round's closed-segment control sets `state` only for coherence.
  - **Fix:** the same pattern, a predicate per copy with its own negative.
  - **Not done:** this round's brief names the sequence copies only.
- **Sequence gaps are not copies of the event's sequence.**
  - **What they are:** `coverage.sequence_gaps` and the anchor's `sequence_gaps_sha256` record ranges the source lacks. Their semantics belong to SP-278.
  - **Why no rule was added:** a one-event retained source can have gaps before its first sequence, so no equality with the event follows. No guard compares the anchor digest with the coverage list either. Recorded for the guard-table work, without a rule invented here.
- **DO-P1F4-S1 stays on the part-2 list.** Integral float copies are admitted by the schema's `integer` and make SP-278's binding codec raise `TypeError` before a coded refusal. That now covers the sequence copies too. Both guards refuse them by exact type, and the checker asserts the raise.
- **DO-P1F4's null-frame note is corrected above.** The crash was at `:937` (DO-P1F04's guard), not at `index_complete_source_coverage`.

## DO-P1F06: findings and responses

Task: `lanes/DO-P1F06.md`. Branch start `12fb322ceb`. No rebase, and the census pins are unchanged. The fix commits are `cc7c6839e4` (inventory, guards, negatives, builder and regenerated fixtures) and `01bded7d7a` (exact-integer gap bounds, and wrong-type forms for the predicates `cc7c6839e4` left without them); this report and the self-grade are the next commit. Evidence: `drafts/DO/sweep-p1/p1f6/`. The JSON records named below are in its `after/` folder, and the tools are in `tools/`.

**Result:** the class is closed by an inventory, not by one more copy.
- **The inventory:** `Plans/orchestrator_checkpoint_field_inventory.json` gives every field of every checkpoint value the lane writes one row: 167 fields, 108 derived and 59 free.
- **The checker:** it regenerates the field list from the schemas and fails on an unrowed field, a stale row or a stale bound. It also checks that every derived row names a guard with a registered single-defect negative, and every free row a bound, a reason and refused forms.
- **Unguarded derived fields:** the inventory found 27, DO-P1F5-N1's segment identity copies among them. 25 had no guard at all and 2 gain a further one. Each is now guarded by one of 29 new predicates, each with its own code, a single-defect negative on every positive (refused with exactly that code by `checkpoint_errors` and the historical reader) and, for 28 of them, wrong-type forms of their own. The 29th, `index_coverage_sequence_gap_retained`, reads only integer bounds; a bound in another type is `index_coverage_sequence_gap_order`'s.
- **Older guards proved:** most guards the checker already had carried no exact-code negative. 64 backfilled single-defect negatives now prove them.
- **Stale fixtures:** the inventory found three stale derived values in the fixtures. The builder now derives every derived field, and the fixtures are regenerated with it, never by hand.
- **Records not touched:** no Decision Log entry, event-registry append, admission, seal or reseal. `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, the frozen validator and the census pins are unchanged.

### Why rounds kept finding one more field

DO-P1F04 guarded the byte copies and DO-P1F05 the sequence copies; each left the next unread field (DO-P1F3-N1, DO-P1F4-N1, DO-P1F5-N1). Nothing listed the fields, so nothing could say a field was unread. The inventory is that list, and the checker keeps it complete.

### The inventory

**Which values:** the four values each read holds, plus the read's other keys:

| Value path | Schema |
|---|---|
| `read.checkpoint` | `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint` (generation, anchor, frontier, coverage, segments, last frame, gaps, translation, all inlined) |
| `read.read_token` | the same file, `#/$defs/read_token` |
| `read.current_source_selection` | the same file, `#/$defs/source_selection` |
| `read.row` | `Plans/storage_value_registry.json`, the `event_record_index` family's value schema |
| `read.row_key`, `read.snapshot_id`, `read.source_event`, `read.source_value_sha256`, `read.claim` | leaf fields; the key list is taken from every positive's read |

**What counts as a field:** every property at every depth whose schema is not a closed object, that is:
- leaves;
- nullable objects (`last_frame`, `translation`), whose null is a value;
- arrays and maps, with their items and the map key (`generations{key}`).

A closed object is a container: its members are the fields.

**What the checker regenerates** (`schema_fields`, `scripts/pm_orchestrator_event_oracles.py:2120`):
- **The field list:** walked from the schemas, following `properties`, `patternProperties`, `items`, `anyOf`, `allOf` and `if`/`then`.
- **Each field's bound:** the sorted constraint keywords the schema puts on that path.
- **Closure:** every value object is closed (`additionalProperties: false`, every listed property required), the map is closed, and every conditional branch names only declared properties. So no instance can hold a field outside the list.

**What it fails on** (`checkpoint_inventory_errors`, `:2189`):

| Failure | Code |
|---|---|
| a field with no row | `inventory_unrowed_field` |
| a row with no field | `inventory_stale_row` |
| a row whose bound differs from the schema's, compared by exact type | `inventory_stale_bound` |
| an open object or an undeclared conditional field | `inventory_open_object`, `inventory_conditional_undeclared` |
| a derived row without a source or a guard | `inventory_derived_without_source`, `inventory_derived_without_guard` |
| a guard whose function is unknown, whose code the checker never emits, or whose named negative is not registered with that code | `inventory_unknown_guard`, `inventory_unknown_code`, `inventory_unproved_guard` |
| a free row without a reason or refused forms | `inventory_free_without_reason`, `inventory_free_without_refused_form` |

The totals in the file must equal the counted rows.

**Rows.** Each derived row names:
- its **source**, with the owner line;
- each **guard**: function, refusal code, and the registered negative that is refused with exactly that code;
- the **builder**: `recapture_history`, or null with a reason (four rows: the state, two state-fixed timestamps, the segment list and the null frame, whose values no builder chooses).

Each free row names:
- its **bound**;
- a **reason** a reviewer checks;
- **refused forms** with the code that refuses them;
- optionally, runtime **guards** that bound it beyond the schema.

The checker applies every free row's refused forms on every event positive (`checkpoint_inventory_checks`, `:2244`).

| Class | Rows | Guarded since |
|---|---:|---|
| derived | 108 | 8 DO-P1F04, 13 DO-P1F05, 60 before DO-P1F06 (now with exact-code negatives), **25 DO-P1F06**, **2 further guarded in DO-P1F06** (`current_generation_id`: the recipe; the frame's `segment_name`: its generation field and form) |
| free | 59 | 21 schema consts, 33 opaque Storage or owner evidence the value does not carry (CURRENT, manifest and manifest-array digests, the birth manifest generation and recovery epoch, the seed, translation evidence, revision, transaction, times, predecessor digest, health), the segment generation and state roots, origin, gaps and holds; 4 of them carry runtime bounds (see below) |
| **total** | **167** | |

### The defect and the stale values

**Unguarded derived fields at `12fb322ceb`** (`defect-at-base.json`: the base checker against this round's negatives):

| Field | Source | Base checker |
|---|---|---|
| segment name's generation field (DO-P1F5-N1) | the frame's `segment_generation` | accepted |
| segment name's form (DO-P1F5-N1) | the segment's state | accepted |
| `selected_segment_generation`, birth and frontier (DO-P1F5-N1) | the frame's `segment_generation` (`storage-plan.md:17330`, `:17293`) | accepted |
| the frontier's CURRENT digest, recovery epoch, excluded ranges, retired inputs | the birth selection's (`:21293`) | accepted |
| the anchor's gap digest | the empty array's binding digest (`:21279`) | accepted |
| a node's `generation_id`, `index_dataset_name` | its map key | accepted |
| the map key and `current_generation_id` | SP-278's recipe (`:21269`) | accepted |
| `translation` on a non-compaction generation, and its target selection | origin; the birth selection's digest (`:21297`, `:21275`) | accepted |
| the row's `source_locator` (generation, name, offset, sequence) | the frame cursor and the event (`:20886`, `:24710`; the registry row) | accepted |
| the row's `payload_sha256`, `correlation_id`, `causation_event_id`, `persisted_at_utc`, `redaction_profile`, `source_schema_id`, `source_schema_version`, `projector_replay_only` | the event (the registry row; the readiness projector) | accepted |
| the row's translation ref | the generation's translation | accepted |
| a gap holding the event's own sequence, a gap whose first is after its last | contradicted by the value itself | accepted |

**Older guards without a proof.** Of the guards `checkpoint_errors` already had, only `checkpoint_storage_identity` had a fixture negative (standing check 7). The read-token loop asserted only a non-empty refusal. Several also compared one copy with another copy, or with Python `!=` (see "Older guards" below).

**Stale fixtures.** Three derived values in the fixtures were stale (`regen-manifest.json`):

| Stale copy | Why | Positives | History negatives |
|---|---|---:|---:|
| the generation id, its map key and every copy | `recapture_history` changes the birth selection (its survivor prefix) but never re-derived the id SP-278's recipe gives it | 8 event (board) + 478 retained + 175 compatibility | 530 + 750 |
| the row's `payload_sha256` | DO-P1F-03 regenerated the board payloads without it, and the builders left the base event's digest on originals whose payload differs. At `7ca810a424~1` all 53 event rows held `sha256(RFC 8785(payload))`. | 8 + 163 + 65 | 80 + 266 |
| the row's `projector_replay_only` | false on every `projector_replay_only` original | 106 retained + 175 compatibility | 750 |

### Guards

**New predicates, 29.** Each is its own `if` line with its own refusal, compared with its source by exact type (`typed_tree`), so `1.0`, `"1"`, `true` or null never equals `1`. `checkpoint_errors` calls them at its end (`:934`). The codes are the exported tuple `P1F06_CODES` (`:1158`).

| Guard function | Codes | Reads |
|---|---|---|
| `row_event_copy_errors` (`:985`) | `index_row_payload_sha256`, `_correlation_id`, `_causation_event_id`, `_persisted_at_utc`, `_redaction_profile`, `_source_schema_id`, `_source_schema_version`, `_projector_replay_only` | the row against the event: the RFC 8785 payload digest, the four event copies, the event's schema (or the migrated-from pair, Case L-5), and whether its replay policy is `projector_replay_only` |
| `segment_identity_errors` (`:995`) | `index_coverage_segment_name_generation`, `index_coverage_segment_name_state` | the frame's name's generation field is `f'{segment_generation:06}'`, so a seven-digit `0000001` is refused; the name is `.active` exactly when the segment's state is `active` |
| `selection_copy_errors` (`:1028`) | `index_anchor_selected_segment_generation`, `index_frontier_selected_segment_generation`, `index_frontier_current_bytes_sha256`, `index_frontier_recovery_epoch`, `index_frontier_excluded_ranges_sha256`, `index_frontier_retired_inputs_sha256`, `index_anchor_sequence_gaps_sha256` | both selections' generation against the frame's; the four within-generation facts against the birth selection; the anchor gap digest against `EMPTY_GAPS_SHA256` (`:1025`) |
| `sequence_gap_errors` (`:1065`) | `index_coverage_sequence_gap_retained`, `index_coverage_sequence_gap_order` | no gap holds the event's sequence; no gap's first is after its last. Only exact integer bounds are compared; a bound in another type is an unordered gap. |
| `row_locator_copy_errors` (`:1087`) | `index_row_source_segment_generation`, `_segment_name`, `_byte_offset`, `_sequence_id`, `index_row_translation_ref` | the row cursor against the frame's generation and name, the segment's scan start and the event's sequence; the translation ref is null, or the generation's translation manifest |
| `generation_copy_errors` (`:1132`), over every node | `index_generation_id`, `index_generation_dataset_name`, `index_generation_id_recipe`, `index_generation_translation_origin`, `index_translation_target_selection` | each node's id and dataset name against its key; the key against `generation_identity` (`:1122`); a translation only on `compaction_shadow`; its target selection is the binding digest of the node's birth selection |

**Older guards, now by exact type and against their sources** (`checkpoint_errors`, `:844`). None is weakened; every input refused before is still refused.

| Guard | What changed |
|---|---|
| `checkpoint_storage_identity` | `typed_tree`; the checkpoint's and the token's sites are separate lines. The token's site and the token join are one invariant at two sites: see the pair proof. |
| `checkpoint_read_token_join` | the token and the read's current selection are compared whole by `typed_tree`, on two lines. Before, it was Python `!=`, so a token `frontier_revision` of `3.0` passed. |
| `checkpoint_source_storage_identity` | `typed_tree` |
| `index_row_<field>` | the eight older row copies by `typed_tree` (was `!=`), in `row_event_copy_errors` with the eight new ones |
| `index_row_locator_join` | two lines; the row's checkpoint ref is compared with the ref computed from the root, not with the token's copy |
| `index_original_source_join` | two lines, `typed_tree` |
| `index_complete_row_set` | two lines, `typed_tree` (the count was `!= 1`) |
| `index_source_prefix` | four lines; the prefix is recomputed from the event's own bytes, not from the read's copy of their hash |
| `index_birth_anchor_join` | three lines, `typed_tree`; the row's survivor prefix is compared with the recomputed prefix, not with the anchor's copy |

Comparing each copy with its source, never with another copy, is what lets a single changed copy draw exactly one code.

### Negatives and controls

`identity_copy_checks` (`:2048`), run from `check_oracles`, applies them to every event, retained and compatibility positive of all 25 families: 53 + 478 + 175 = 706.

**Every negative is built the same way:** from a valid case, it changes one derived copy, keeps its source, and keeps every dependent copy in step. The dependent copies are:
- the row-set digest and the token's anchor and frontier digests (`redigest`, `:1365`);
- the token's and the read's copies of a changed frontier selection;
- for a change to the birth selection, the recipe's generation id and every copy of it (`rekey`, `:2481`).

`set_segment_name` (`:1377`) now also writes the row's copy of the name, so DO-P1F05's name negatives stay single-defect.

| Set | Built by | Per positive | Through | Total |
|---|---|---:|---|---:|
| new predicates | `identity_copy_negatives` (`:1630`) | 29 | `checkpoint_errors` and the historical reader, all 706; `recover_original` on the 53 event positives | 40,948 + 1,537 |
| older guards (backfill) | `join_negatives` (`:1722`) | 64 | `checkpoint_errors`, all 706; the historical reader, the 53 event positives | 45,184 + 3,392 |
| controls that must be accepted | `compaction_control` (suffix row, translated row), `gap_control` | 3 | both, all 706 | 4,236 |

**The 64 backfilled negatives** cover:
- the checkpoint's storage instance;
- each read-token member: storage instance (refused with both codes of its pair), key, ref, generation id, anchor and frontier digests, revision, dataset name and snapshot id;
- 11 members of the token's selection copy and all 13 of the read's;
- both selections' storage instances;
- the eight older row copies, the row key and the row's checkpoint ref;
- the source event and its hash;
- an unregistered row member (`index_row_schema`);
- the row count and row-set digest;
- the four prefix sites and the three birth-triple copies;
- a missing, a second and a staged current node (`checkpoint_not_current`);
- a retired time, a successor and the empty flag alone on the current node (the schema).

**Registry.** `checkpoint_field_negatives` (`:1848`) registers every single-defect checkpoint negative of the lane by round: 8 DO-P1F04, 16 DO-P1F05, 93 DO-P1F06. Every derived row's guard names one of them, and the checker refuses a row whose negative is missing or carries another code.

**Wrong representations** (`p1f06_type_form_checks`, `:2002`). On each event positive, each new guard's copy takes each other form:
- float, string, bool or null for integers;
- null, upper case or a trailing LF for digests and ids;
- an int, a trailing LF or the string `"null"` for row strings;
- a seven-digit generation field for the name;
- a null, upper-case or LF-suffixed state, origin or target selection, and an upper-case or LF-suffixed generation id;
- a float, string, bool or null gap bound.

That is 90 forms × 53 = 4,770. Forms whose holder the positives leave null or empty are built on a control:
- the translation's target selection and the origin on the compaction control;
- the gap bounds on the gap control;
- the generation id rewritten in every copy (`type_form_case`, built by one helper shared with the cut tool).

**One predicate has no form of its own.** `index_coverage_sequence_gap_retained` compares only exact integer bounds. Each gap bound in another type (the 8 gap forms) is an unordered gap, refused by `index_coverage_sequence_gap_order` alone, and the gap-retained guard accepts it, so one wrong form draws one code. `01bded7d7a`'s commit message says each of the six predicates `cc7c6839e4` left without forms now has them; for the gap pair, the forms are `index_coverage_sequence_gap_order`'s.

Each form is checked three ways:
- **The guard alone:** it refuses each with exactly its own code.
- **Through `checkpoint_errors`:** the strict checkpoint schema refuses what it does not admit. For row copies, the weaker row schema adds `index_row_schema` beside the guard's code, and forms that schema admits are refused by the guard alone; those also go through the historical reader with the same codes.
- **Integral floats:** they make the binding codec raise (DO-P1F4-S1, part 2), and the checker asserts the raise.

**Free rows.** Each free row's refused forms run on every event positive: 83 forms × 53 = 4,399 checks.

**Builder repair.** On every event positive, `recapture_history` restores the positive (or its control) from every repairable negative of every round: 105 per positive, 5,565 checks. The 12 negatives no builder repairs add or remove a source, or change a free root, rather than change a copy. The checker also requires every one of the 103 builder-derived rows to name at least one repairable negative, so each is shown written from its source.

**Migrated control.** A migrated-from-EventEnvelopeV1 original is projected with `pm.event.envelope_v1` and a null version, and accepted by `checkpoint_errors` (53).

### Builder and regeneration

**The builder.** `recapture_history` (`:2501`) now calls `refresh_identity_copies` (`:2436`) after the event, sequence, byte and prefix copies and before the row set and digests. It writes every derived copy the earlier refreshes did not:
- the storage instances;
- the segment's generation and the frame's offset (DO-P1F04's copies);
- both selected generations and the four within-generation facts;
- the gap digest, the empty flag and the row count;
- the name, from its sources (`derive_segment_name`, `:2423`: generation, sequence and the state's form; it used to keep the old name's generation and form);
- the row's event copies, cursor, birth triple and translation ref;
- a translation only on a compaction shadow, with its target selection;
- the generation id from the recipe, and every copy of it (`rekey`).

**Regeneration.** `p1f6/tools/regen_identity_fixtures.py` extends DO-P1F04's and DO-P1F-03's tools to all 25 families and the 53 event positives. It drives the same lane builders and the same round-6 and fix-round-7 negative builders, with their logic unchanged. Nothing is edited by hand. Its gates:
1. **Faithfulness:** the base commit's builders, replayed over the base file, reproduce it byte for byte.
2. **Only the stale copies:** every changed item differs only at the generation-id copies (map key, `current_generation_id`, node id and dataset name, token id, ref and dataset name, row ref), the row's `payload_sha256` and `projector_replay_only`, and the row-set and frontier digests over them.
3. **All consistent:** every positive is a fixpoint of the new builder and passes `checkpoint_errors`, and every history negative passes every new predicate.
4. **No old id survives** anywhere in the file.

| List | Items changed | Generation id | `payload_sha256` | `projector_replay_only` |
|---|---:|---:|---:|---:|
| `event_cases` | 8 | 8 | 8 | 0 |
| `retained_event_cases` | 478 | 478 | 163 | 106 |
| `compatibility_event_cases` | 175 | 175 | 65 | 175 |
| `retained_history_negatives` | 530 | 530 | 80 | 0 |
| `compatibility_history_negatives` | 750 | 750 | 266 | 750 |
| **Total** | **1,941** | **1,941** | **582** | **1,031** |

**Board families.** DO-P1F04 required them unchanged. This round they change, because their positives carried two of the stale copies. The brief allows regeneration when a stale value turns up. Their event positives' 8 changed items are exactly the 8 board event cases.

**Independent check:** `git diff -U0 12fb322ceb cc7c6839e4 -- Plans/orchestrator_event_contract_fixtures.json` (`01bded7d7a` does not touch the file) changes exactly these lines and no other:
- 3,882 of each of `generation_id`, `index_dataset_name` and `checkpoint_ref` (two copies per item);
- 1,941 of each of `current_generation_id`, `index_row_set_sha256` and `frontier_sha256`, and the 1,941 map-key lines;
- 1,031 `projector_replay_only`;
- 582 `payload_sha256`.

21 of the 26 lists are untouched. The file goes from 53,997,925 to 53,996,894 bytes (1,031 × `false` → `true`). SHA-256 goes from `f9eaa667…7e489` to `13028aa2…9137b`.

### Checks, before and after

Before is `12fb322ceb`; after is `01bded7d7a`, whose code and fixtures this report commit does not change. Run serially on the VM.

| Command | Before, `12fb322ceb` | After, `01bded7d7a` |
|---|---|---|
| `python3 scripts/pm-orchestrator-event-contracts.py` | 0: 84,787 checks | **0: 203,296 checks** |
| `python3 -m unittest tests.test_shared_runtime_storage_contracts` | 0: 17 tests | 0: 17 tests |
| `python3 -m unittest tests.test_pm_onboarding_phases` | 0: 50 tests | 0: 50 tests |
| round 8 `probes.py family-suite` | 0: 81,934 | 0: 207,211; every family gains, from +2,991 (`parser.error`) to +11,986 (`subagent.retried`) |
| round 8 `probes.py responses` | 0: flips 12/60/6, stays 66/18/72 | 0: the same |
| round 8 `probes.py cli-controls` | 0: 9 of 9 as recorded | 0: 9 of 9 as recorded |

The intermediate states are not committed separately: the guards, builder, inventory and regenerated fixtures land in one commit. `regen-manifest.json` and `defect-at-base.json` show the states between.

**The 118,509 new complete-checker checks:**
- 1,412 positive agreement and builder-fixpoint checks;
- 4,236 compaction and gap control checks;
- 42,485 new-predicate negatives (both readers, plus the event positives' refused recoveries);
- 48,576 backfilled join negatives;
- 5,565 builder repairs and 53 migrated controls;
- 11,501 wrong-representation checks (90 forms on 53 positives: the guard alone, then `checkpoint_errors` or the codec raise, and the historical reader where the schema admits the form);
- 4,681 inventory checks (freshness, totals, builder rows, the 4,399 free-row forms and the checker's own negatives).

**Other checks.** `coordination`, `readiness` and `index-validate` exit 1 at the head. On the lead's note (04:06Z) all three were also run at the base `12fb322ceb` in the scratch worktree, with the same currentness audit copy and `origin/main` `0adb197992`:

| Command | At `01bded7d7a` | At `12fb322ceb` | Pre-existing or new |
|---|---|---|---|
| `python3 -m unittest tests.test_pm_event_index_binding` | 0: 14 tests | 0: 14 tests (DO-P1F05's run) | — |
| `python3 scripts/pm_event_numbers_corpus.py`, `pm_event_numbers.py --self-test` | 0, 0 | 0, 0 | — |
| `python3 scripts/pm_coordination_events.py` | 1: `payload_schema_definition_census` (the `agent_*` and other definitions) and `coordination_storage_family_mismatch` (`coordination_read_model_projections`) | stdout and stderr byte-identical | **pre-existing**: DO-P1F05's 2 baseline failures |
| `python3 scripts/pm-implementation-readiness.py validate` | 1: 61 rows (33 `event_authority_currentness_source_drift`, 18 `pnc019_source_hash_stale`, 5 spec-lock hash stale, 4 event denominator or depth unresolved, 1 buildability report stale) | identical apart from `generated_at_utc` | **pre-existing**: currentness and spec-lock rows a currentness refresh or reseal clears |
| `python3 scripts/pm-plan-index.py validate`, `origin/main` `0adb197992` | 1: 25 rows (21 `plan_unit_removal_ledger_invalid`, 4 `plan_unit_removed_without_ledger_decision`, DL-337..340) | identical apart from `generated_at_utc` | **pre-existing** |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0: 99 sources, 3,104 shards | same | — |

**The stale artifact row the lead saw.** It came from a first after-run made before the ignored currentness audit was copied into the worktree. Without the audit folder, both commands give, identically at the base and the head:
- `readiness`: 29 rows, with `event_authority_currentness_audit_unavailable`;
- `index-validate`: 26 rows, the extra one being `stale_generated_index_artifact` for `Plans/.plan_index/node_readiness_report.json`.

That generated index artifact is stale in the checkout itself, and only a reseal refreshes it; this commit does not cause it (`no-audit/` in the evidence). No `Plans/*.md` file changed, so shards and the index were not regenerated. The new `Plans/orchestrator_checkpoint_field_inventory.json` adds no readiness or index row.

### Guard cut

**The tool:** `p1f6/tools/p1f6_controls.py isolation` cuts one new predicate at a time. Its refusal becomes `pass`; for a row event copy, only that one field leaves the comparison. Against each mutant it runs:
- **own negatives:** the predicate's negatives on all 706 positives, through `checkpoint_errors` and the historical reader; they must now pass;
- **other new predicates:** the other 28 predicates' negatives on all 706 positives, through `checkpoint_errors`; they must keep exactly their codes;
- **older and backfilled negatives:** DO-P1F04's, DO-P1F05's and the backfilled join negatives on the 53 event positives; they must keep exactly their codes;
- **positives:** all 706 must still be accepted;
- **own wrong forms:** the guard alone stops refusing them.

`guard-isolation.json` holds the removed and replacement lines; `guard-isolation-part-*.json` hold the four parts it sums.

Every cut flips exactly its own 706 negatives (20,474 in all, through both readers) and nothing else: the other new predicates' negatives, the older and backfilled negatives and all 706 positives keep their results. Each guard alone stops refusing its own wrong forms (4,770 in all); `index_coverage_sequence_gap_retained` has none of its own. The run was split by positive into parts of under 30 minutes each: 0–50 (796 s), 50–250 (845 s), 250–500 (1,006 s), 500–706 (853 s); `isolation-merge` sums them and checks that they cover the 706 positives once, in order, with the same cut lines. A first, single-command run at this head was stopped at the 2-hour limit on background commands at positive 600, without a failure (`isolation-capped-0710.log`).

| Cut | Own negatives now pass | Other 28 new, unchanged | DO-P1F04 / DO-P1F05 / backfilled, unchanged | Positives accepted | Own wrong forms the guard now admits |
|---|---:|---:|---:|---:|---:|
| `index_row_payload_sha256` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_row_correlation_id` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_row_causation_event_id` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_row_persisted_at_utc` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_row_redaction_profile` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 106 |
| `index_row_source_schema_id` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 106 |
| `index_row_source_schema_version` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_row_projector_replay_only` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_coverage_segment_name_generation` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_coverage_segment_name_state` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_anchor_selected_segment_generation` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 212 |
| `index_frontier_selected_segment_generation` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 212 |
| `index_frontier_current_bytes_sha256` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_frontier_recovery_epoch` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 212 |
| `index_frontier_excluded_ranges_sha256` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_frontier_retired_inputs_sha256` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_anchor_sequence_gaps_sha256` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_coverage_sequence_gap_retained` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 0 (none of its own; see "Wrong representations") |
| `index_coverage_sequence_gap_order` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 424 |
| `index_row_source_segment_generation` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 212 |
| `index_row_source_segment_name` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_row_source_byte_offset` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 212 |
| `index_row_source_sequence_id` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 212 |
| `index_row_translation_ref` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 106 |
| `index_generation_id` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_generation_dataset_name` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 106 |
| `index_generation_id_recipe` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 106 |
| `index_generation_translation_origin` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |
| `index_translation_target_selection` | 706 | 19,768 | 424 / 848 / 3,392 | 706 | 159 |

**Combined cut** (`combined-cut.json`): every new predicate cut at once, with every lane checkpoint negative on all 706 positives.
- The 29 × 706 new negatives pass.
- Every DO-P1F04, DO-P1F05 and backfilled negative keeps exactly its codes: 5,648 DO-P1F04, 11,296 DO-P1F05 and 45,184 backfilled.
- So no older negative's refusal rests on a new guard, on any positive. The 1,280 history negatives give the same historical-reader result as production.

**The token's storage instance** (`token-storage-pair.json`) is one invariant (the token's storage instance is the payload's) at two sites: `checkpoint_storage_identity`'s token line, and the token join's storage member. Cut site by site on all 706 `token_storage_instance_id` negatives:

| Sites cut | `checkpoint_errors` and the historical reader, on each of the 706 |
|---|---|
| none | `checkpoint_storage_identity`, `checkpoint_read_token_join` |
| the token line of `checkpoint_storage_identity` | `checkpoint_read_token_join` |
| the token join's storage member | `checkpoint_storage_identity` |
| both | accepted |

Each site alone still refuses the forged storage instance; only cutting both admits it.

**Inventory freshness** (`inventory-freshness.json`) runs `checkpoint_inventory_checks` as the complete checker runs it, with files replaced in memory:

| Change | `checkpoint_inventory_checks` |
|---|---|
| none (production) | passes: 4,681 checks |
| row removed: `read.checkpoint.current_generation_id` | fails: `inventory_unrowed_field:read.checkpoint.current_generation_id` |
| row removed: `read.checkpoint.generations` | fails: `inventory_unrowed_field:read.checkpoint.generations` |
| row removed: `read.checkpoint.generations.*.frontier.coverage.last_frame.segment_name` | fails: `inventory_unrowed_field:read.checkpoint.generations.*.frontier.coverage.last_frame.segment_name` |
| row removed: `read.row.source_locator.byte_offset` | fails: `inventory_unrowed_field:read.row.source_locator.byte_offset` |
| row removed: `read.source_value_sha256` | fails: `inventory_unrowed_field:read.source_value_sha256` |
| a row added for `read.checkpoint.withdrawn_field`, which no schema has | fails: `inventory_stale_row:read.checkpoint.withdrawn_field` |
| a required field added to the checkpoint schema's coverage | fails: `inventory_unrowed_field:read.checkpoint.generations.*.frontier.coverage.added_field` |
| a required field added to the registry's row schema | fails: `inventory_unrowed_field:read.row.added_field` |
| a key added to one positive's read | fails: `inventory_unrowed_field:read.added_key` |

Inside the complete checker, the same check also:
- removes every one of the 167 rows in turn (each fails with exactly its `inventory_unrowed_field`);
- adds a field to each of the four value schemas and a key to the read;
- adds a stale row, changes a bound, opens an object, unproves a guard and blanks a reason.

Each must fail it.

**Builder cut** (`builder-cut.json`): with `refresh_identity_copies(case)` removed from `recapture_history`:
- each event positive's original rebuilt with occurrence 2 is refused with `index_row_payload_sha256` and `index_generation_id_recipe` (53 of 53), where production refuses none;
- the complete checker fails: exit 1. It first fails in `board_member_refusal_checks` (`scripts/pm-orchestrator-event-contracts.py:194`): a board member negative rebuilt through the cut builder, `crew.board_message_posted:application:1`, is no longer refused with exactly `logical_payload_schema`.

### Cells re-graded

**Which cells:** `consumers_checkpoints` of all 25 families, because the inventory and guards are checkpoint joins on every positive; `compatibility_withdrawal` and `retention` of all 25, because their positives were regenerated.

**Cells carried:** every other cell. No owner text, payload schema, identity recipe, retry, redaction or transition rule changed.

| Cell, 25 families | Recorded before | At `12fb322ceb`, by the rubric | After | Why |
|---|---|---|---|---|
| `consumers_checkpoints` | PASS (DO-P1F05) | PARTIAL | **PASS** | At the base the oracle accepted every forged copy in the table above, most of its guards had no exact-code negative, and the positives held stale generation ids. Now all 167 fields are rowed, the 27 unguarded derived fields are guarded with negatives on every positive, the older guards are proved, the builder derives every derived field, and each cut flips only its own negatives. |
| `compatibility_withdrawal` | PASS (carried) | PARTIAL | **PASS** | Each family's seven compatibility positives, all replay-only originals, carried rows saying `projector_replay_only` false, stale generation ids and (65 of 175) payload digests of another payload, and nothing read them. Regenerated and guarded; compatibility readers, withdrawal and the replay-only append refusal are unchanged. |
| `retention` | PARTIAL | PARTIAL | **PARTIAL** | The retained positives are regenerated and true, but the cell stays PARTIAL for the unlanded Storage retention integration and Q1/Q3. |

Status counts stay **250 PASS / 25 PARTIAL / 25 ABSENT**. Native execution stays NOT_RUN.

### Recurring classes

| Class | How it was ruled out |
|---|---|
| **Forged or contradictory inputs** | Every derived field is recomputed from its source (the event, the payload's storage instance, the frame, the birth selection or SP-278's recipe) and compared with it, never with another copy. A gap holding the event's sequence and a translation on a non-compaction generation are refused. DO-P1F5-N1 is closed. |
| **Storage-assigned metadata** | The event's sequence, the frame's segment generation and the segment's state are the roots; every copy is checked against them. |
| **Historical readers** | Each new negative is refused by the historical reader with the same single code. Regenerated retained and compatibility originals keep their recipes, number types and receipts; only the stale copies changed. The compaction controls show a compacted current generation does not make history unreadable. |
| **One field read two ways / types** | Exact-type comparison everywhere `checkpoint_errors` compares. The token join no longer accepts a `3.0` revision; the row-copy forms the row schema admits (a trailing LF, `"null"`) are refused by their guards. Integral floats: DO-P1F4-S1. |
| **Masked negatives** | Copy-to-source comparison and dependent-copy resync give each negative exactly one code (two for the declared pair). Each cut flips only its own 706. The combined cut shows no older negative rests on a new guard. |
| **Unresolved references / formats** | The walked schemas carry no `$ref`; every bound is regenerated and compared by exact type. Times keep the strict UTC grammar; their ordering is the date-time gate's. |
| **Grades** | The three cells say what the tests show. |

### Open notes

- **`sealed_degraded` naming, an interpretation for the lead.**
  - **The gap:** the owner names `.active`, `.opening` and `.seglog` (`storage-plan.md:24306`), but gives no name for a `sealed_degraded` segment.
  - **The reading taken:** the guard ties only `.active` to `active`. Both `closed` and `sealed_degraded` take `.seglog`, as immutable segments.
  - **If the owner rules otherwise:** the predicate is one line, `segment_identity_errors`.
- **Rules not invented.** These relations are plausible, but the owner text does not state them, so they are free rows with their reasons and no rule was added:
  - the predecessor frontier digest being null exactly at revision zero;
  - indexed and activation times against the event's;
  - a translation's counts against the anchor prefix (the active segment is carried outside the translation set, `:21295`);
  - the frontier's manifest generation, digest, retained inventory and watermarks (an ordinary append may move them, `:21291`).
- **Non-current nodes.** Their identity copies are guarded (`generation_copy_errors` runs over every node). Their other fields are read by no lane reader, and the one-event fixtures hold one node.
- **DO-P1F4-S1 stays on the part-2 list.** Integral float copies are admitted by the schema's `integer` and make SP-278's binding codec raise before a coded refusal. That now covers the new copies too. Every guard refuses them by exact type, and the checker asserts the raise.
- **`payload_sha256` number spelling (DO-C8-N2).** The recipe is RFC 8785 over the decoded payload, as every original row and the readiness projector use. Whether `1` and `1.0` should digest apart is the shared number rule's, not a lane serializer's.

## Part 2 items

Number-handling, date-time, guard-table and proof-machinery items, parked for the shared-tool sweep (locations from `reviews/DO-sol/REVIEW-cycle8.md`, unchanged by this pass):

| ID | Kind | Location |
|---|---|---|
| DO-C8-N1 | number domains by field owner | `scripts/pm_orchestrator_event_oracles.py:86-179` (`number_domain_errors`, `number_token_errors`, `fixture_loads`) |
| DO-C8-N2 | qualified JCS for identity/digests | `scripts/pm_orchestrator_event_oracles.py:230` (`semantic_digest`); identity/`observation_component`/`historical_identity` in `scripts/pm-orchestrator-event-contracts.py` |
| DO-C8-N3 | per-profile physical number codecs | `scripts/pm_orchestrator_event_oracles.py:219-228` (`packed`, `pack_entry`, transport sizes, source hashes, wrapper commitments) |
| DO-C8-N4 | composition-installed original-recipe resolver | `scripts/pm_orchestrator_event_oracles.py:106-138` (`number_rule_for_record`, `record_number_errors`) plus `historical_read_errors`, `checkpoint_errors`, `recover_original`, `retry_outcome` |
| DO-C8-N5 | coordination helper reconciliation with DCO | `scripts/pm_coordination_events.py` (`canonical`, `event_id_preimage`, `producer_digest`) |
| DO-C8-P1 | proof emitter inventory incomplete | `drafts/DO/fix-round-7/guard_audit.py:494-509`; adopt `scripts/pm_guard_isolation.py` |
| DO-C8-P2 | merged predicate groups | same script `:442-446`, `:481-493` |
| DO-C8-P3 | whole-schema/whole-keyword cuts | same script `:69`, `:567-578` |
| Guard tables | restructure lane guards as named predicate functions in a table | whole `scripts/pm_orchestrator_event_oracles.py` guard set, once `plans/ea-guardtool-20261105` passes |
| Fixture-pass guards | `selected_definition_errors` and the row-drift negative join the guard table with the rest | `scripts/pm_orchestrator_event_oracles.py:672`; `scripts/pm-orchestrator-event-contracts.py:149` |
| DO-P1F-03 guards | `board_member_stored_header`, the envelope join, `event_join_payload_schema_id` and `board_member_definition_failures` join the guard table with the rest | `scripts/pm-orchestrator-event-contracts.py:85`, `:89`; `scripts/pm_orchestrator_event_oracles.py:492`; `scripts/pm_coordination_events.py:419` |
| DO-P1F04 guard | the eight `coverage_copy_errors` predicates join the guard table with the rest | `scripts/pm_orchestrator_event_oracles.py:926` |
| DO-P1F05 guards | the twelve `sequence_copy_errors` predicates, the null-last-frame refusal, the last-event-id predicate and the coverage-complete clause (a duplicate of the schema const) join the guard table with the rest | `scripts/pm_orchestrator_event_oracles.py:971`; `:907`, `:912`, `:910` |
| DO-P1F06 guards | the 29 identity-copy predicates (`row_event_copy_errors`, `segment_identity_errors`, `selection_copy_errors`, `sequence_gap_errors`, `row_locator_copy_errors`, `generation_copy_errors`) and the older guards the 64 backfilled negatives prove join the guard table with the rest; the field inventory already names each guard, code and negative | `scripts/pm_orchestrator_event_oracles.py:985`, `:995`, `:1028`, `:1065`, `:1087`, `:1132`; `Plans/orchestrator_checkpoint_field_inventory.json` |
| DO-P1F4-S1 | integral float coverage, sequence and identity copies (DO-P1F05 adds the sequence copies, DO-P1F06 the identity copies) refused by the SP-278 binding codec's `TypeError`, before a coded refusal; adopt the shared integer slots | `scripts/pm_event_index_binding.py:40`; `scripts/pm_orchestrator_event_oracles.py:843` |
| Date-time gate | adopt the shared date-time gate; `scripts/pm_event_datetime.py` (byte-exact from `plans/ea-numrule-20261105` at `883af36ba4a68230e14497df86a5e4edcd38f697`) is the corpus dependency | envelope/payload format validators in `scripts/pm_orchestrator_event_oracles.py` and `scripts/pm-orchestrator-event-contracts.py` |

## Grades

The last review's family grades are carried unchanged; this pass re-graded nothing (no checker, fixture or schema file changed). The fixture pass also carries them unchanged: its fixes change no cell. DO-P1F-03 bore on the `closed_payload_schema` cell of the three `crew.board_*` families. The lead answered it, the members now conform, and that cell alone was re-graded: PASS, with the reasons in "DO-P1F-03: findings and responses". The review still judges it. DO-P1F04 bore on the `consumers_checkpoints` and `retention` cells of the 22 non-board families. `consumers_checkpoints` holds PASS after the fix, where by the rubric it read PARTIAL at `35ba68b6d0`. `retention` holds PARTIAL. The reasons are in "DO-P1F04: findings and responses", and the review still judges them. DO-P1F05 bore on the `consumers_checkpoints` cell of all 25 families. It holds PASS after the fix, where by the rubric it read PARTIAL at `37c1176bec`. The reasons are in "DO-P1F05: findings and responses", and the review still judges them. DO-P1F06 bore on the `consumers_checkpoints`, `compatibility_withdrawal` and `retention` cells of all 25 families. `consumers_checkpoints` and `compatibility_withdrawal` hold PASS after the fix, where by the rubric they read PARTIAL at `12fb322ceb`; `retention` holds PARTIAL. The reasons are in "DO-P1F06: findings and responses", and the review still judges them. Cycle-8 independent regrade: **225 PASS / 50 PARTIAL / 25 ABSENT / 0 CONFLICT**; every family **9 PASS / 2 PARTIAL / 1 ABSENT** with membership ABSENT, retention PARTIAL and oracles PARTIAL (`reviews/DO-sol/REVIEW-cycle8.md` twelve-criterion table), verdict NOT_READY. Membership stays ABSENT pending admission; retention stays PARTIAL pending integration; native execution stays NOT_RUN.

This lane's own review of its timestamp fields is interim only until the shared date-time gate passes.
