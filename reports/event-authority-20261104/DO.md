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
| Date-time gate | adopt the shared date-time gate; `scripts/pm_event_datetime.py` (byte-exact from `plans/ea-numrule-20261105` at `883af36ba4a68230e14497df86a5e4edcd38f697`) is the corpus dependency | envelope/payload format validators in `scripts/pm_orchestrator_event_oracles.py` and `scripts/pm-orchestrator-event-contracts.py` |

## Grades

The last review's family grades are carried unchanged; this pass re-graded nothing (no checker, fixture or schema file changed). Cycle-8 independent regrade: **225 PASS / 50 PARTIAL / 25 ABSENT / 0 CONFLICT**; every family **9 PASS / 2 PARTIAL / 1 ABSENT** with membership ABSENT, retention PARTIAL and oracles PARTIAL (`reviews/DO-sol/REVIEW-cycle8.md` twelve-criterion table), verdict NOT_READY. Membership stays ABSENT pending admission; retention stays PARTIAL pending integration; native execution stays NOT_RUN.

This lane's own review of its timestamp fields is interim only until the shared date-time gate passes.
