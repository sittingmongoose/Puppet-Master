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
| Date-time gate | adopt the shared date-time gate; `scripts/pm_event_datetime.py` (byte-exact from `plans/ea-numrule-20261105` at `883af36ba4a68230e14497df86a5e4edcd38f697`) is the corpus dependency | envelope/payload format validators in `scripts/pm_orchestrator_event_oracles.py` and `scripts/pm-orchestrator-event-contracts.py` |

## Grades

The last review's family grades are carried unchanged; this pass re-graded nothing (no checker, fixture or schema file changed). The fixture pass also carries them unchanged: its fixes change no cell. DO-P1F-03 bore on the `closed_payload_schema` cell of the three `crew.board_*` families. The lead answered it, the members now conform, and that cell alone was re-graded: PASS, with the reasons in "DO-P1F-03: findings and responses". The review still judges it. Cycle-8 independent regrade: **225 PASS / 50 PARTIAL / 25 ABSENT / 0 CONFLICT**; every family **9 PASS / 2 PARTIAL / 1 ABSENT** with membership ABSENT, retention PARTIAL and oracles PARTIAL (`reviews/DO-sol/REVIEW-cycle8.md` twelve-criterion table), verdict NOT_READY. Membership stays ABSENT pending admission; retention stays PARTIAL pending integration; native execution stays NOT_RUN.

This lane's own review of its timestamp fields is interim only until the shared date-time gate passes.
