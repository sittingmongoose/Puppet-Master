# DCO drafting report — Event Authority wave 2, 2026-11-04

Branch: `plans/ea-w2-coordination-20261104`. Base: `be4766513f` (origin/main at checkout). Initial contract commit: `58e68620d2dbad2dbd9554d396538f9577ea29d7`. Current self-grade assesses round 1 checker commit `21e4dede26ba23a8374f42cb7873c8d23111db7d`. No landing or admission. Worktree left for integration: `/home/sittingmongoose/pm-worktrees/ea-w2-dco`.

| Family | Outcome | Self-grade | Own owner units |
|---|---|---|---|
| `coordination.agent_aborted` | register (prepared), Project 1.0.0 only | 11 PASS; membership ABSENT | SP-540 |
| `coordination.agent_crashed` | register (prepared), Project 1.0.0 only | 11 PASS; membership ABSENT | SP-541; OSI-650 |
| `coordination.agent_file_ownership_updated` | register (prepared), Project 1.0.0 only | 11 PASS; membership ABSENT | SP-542 |
| `coordination.agent_operation_updated` | register (prepared), Project 1.0.0 only | 11 PASS; membership ABSENT | SP-543 |
| `coordination.agent_status_updated` | register (prepared), Project 1.0.0 only | 11 PASS; membership ABSENT | SP-544 |
| `coordination.agent_unregistered` | register (prepared), Project 1.0.0 only | 11 PASS; membership ABSENT | SP-545 |

Each row reuses its own existing OSI-438 producer and CV-353 closed payload, prepared ledger entry, SP-320 identity/transition/custody/replay/withdrawal contract and ATS-058 fixtures. Its new unit separately adopts SP-286/CV-339 first receipt and SP-278 projector/checkpoint mechanics, records its exact producer and transition, retention, compatibility, custody and proof boundary. The six are not aliases of registered agent_registered. No row is excluded or blocked on a new Jared decision. Native execution remains NOT_RUN; no runtime or readiness proof is claimed. Self-grade evidence is `DCO-self-grade.json`, 72 cells with mechanically verified exact quotations.

## Search and newly authored owner contracts

`DCO-search.json` records a separate exact-token search for each family across current Plans, scripts, tests and reports. Generated shards/indexes, migration snapshots, evidence and ledger memory do not supply independent authority. Reused definitions are OSI-438/CV-353/SP-320/ATS-058, each family's own schema, cases and prepared row. For each family the negative search found no family-specific application of DL-270's mirror-reader retirement; each new SP unit supplies that explicit adoption.

**Newly authored bindings:** SP-540..545 are individual owner adoption contracts. Each reuses `storage.coordination_projector.v1@1.0.0`, `projector.checkpoint.coordination:{project_id}`, its existing checkpoint schema, five existing reader identities and the SP-320 identity recipe. Each binds `storage.coordination_reader.mirror_export.v1@1.0.0` solely to on-request export under SP-339, with current authorization/coverage and live-server access while running. No automatic mirror, new runtime consumer/projector/checkpoint identifier, physical key, storage family or event schema is invented. OSI-650 applies the already answered threshold, without extending it. `coordination_wave2_oracles.json` and `pm_coordination_wave2.py` add boundary and fail-closed regression oracles, not runtime bindings.

The generic static checker now recognizes exactly the seven existing ApplicationV1 payload names while leaving the Project root union unchanged. Project no-null validation excludes those separately governed definitions only after enforcing Project reference isolation; it rejects direct and indirect Project references into the nullable application edition. Its projection census permits only the 18 named Project definitions and their 18 known app counterparts. Composition filtering excludes only those exact app names; unknown definitions still fail storage composition. Its expected Project storage composition copies Project definitions only, matching the existing stored composition rather than adding unused application definitions. Unknown-definition, null, extension and composition regressions are exercised by the DCO checker. Application admission remains governed separately; this wave grants none.

## Premise checks

- **DL-045:** the six exact names remain in the original coordination scope and OSI-438/CV-353. Only technical contracts for existing behavior are authored. No new product choice.
- **DL-093:** current `Plans/Decision_Log.md` still names these coordination families and their future individual admission decision entries. This preparation writes no decision entry or admission record.
- **DL-095:** the recorded answer is landed on `main` as `Plans/Decision_Log.md`#DL-095; at drafting time it was inspected on `origin/plans/ea-s09-decisions-hb-scope-20261104` at `c94f437e93a5fd2f85a9565f831878cf1b995569` (lineage pin), Decision_Log's DL-095 narrative and unit. Its premise still matches today's OSI-438/Gap #30: 30-second runtime liveness, same crash detector and heartbeat_expired reason. OSI-650 applies 300000 ms, strictly greater, with observed heartbeat_age_ms and independent process/worktree evidence. Sleep handling stays technical work, as answered. The landed answer precedes this amendment, as the entry requires; no decision entry was copied or rewritten here.
- **DL-270:** current SP-339 explicitly retires always-on mirrors and preserves on-request inspect/export. The September automatic mirror behavior cannot carry forward. Each SP amendment adopts the current rule; no mirror authority is restored.
- **Application scope:** current OSI-440 says original Project sources and keys remain exact, and CV-366/SP-351 define the distinct app edition. This draft does not convert Project payloads to nullable app payloads or admit application writes.

No decision premise failed for the applied answer. The older mirror assumption failed currentness and was superseded by the already decided SP-339 behavior, not by a new product choice.

## Retention

**Pending retention cells: none.** Case L-3 (`Plans/storage-plan.md`, Coordination class, line 17416 at assessed head) explicitly specifies 180 days after run completion and 1,000,000/project. SP-320 already assigns these seven agent events `RP-COORDINATION-180D@1.0.0`, with Run completion, unresolved-anchor protection and holds, and derived projections/checkpoints `RP-PROJECTION-3GEN@1.0.0`. Each SP-540..545 repeats its own binding. No retention policy or deletion choice changes; no PENDING marker is replaced by an inference.

## Shared-file hunks and ids

- `Plans/storage-plan.md`: one insertion before “Unknown, prepared and sibling families” in the coordination section; six new individual units **SP-540..545**. Existing prose is neither reordered nor reflowed.
- `Plans/orchestrator-subagent-integration.md`: one insertion after OSI-438's unit, **OSI-650**, superseding only pending/no-number heartbeat wording.
- No Contracts, Automated Testing, storage value registry, central event registry, decision log, admission ledger or admission record was edited.
- No CV or ATS ids used. SP-546..549 and OSI-651..679 remain unused. Before minting, every available origin remote branch was searched for exact plan_unit_id collisions in these two owner files; none held SP-540..545 or OSI-650.
- Generated shards changed only for those two owner documents; their manifests and the common Plan index were regenerated with the ignored currentness edition copied and hash-matched first.

## Verification

| Check | Exit | Result |
|---|---:|---|
| Memory prerequisite | 0 | 14 GB available, above 6 GB floor |
| Shard generate | 0 | pass; no other owner's shards changed |
| Plan index generate | 0 | parsed top-level status pass |
| Shard check | 0 | status pass, 3092 shards |
| Coordination static checker | 0 | status pass, no admission claimed |
| DCO static checker | 0 | threshold and fail-closed probes pass |
| Coordination unittest module | 1 | 50 tests; one helper-pin test has two failing subtests |
| Base checker / same helper-pin test | 1 | same two failures reproduced using origin/main checker |
| git diff --check | 0 | clean |

The helper failures are a TestingSession registry fingerprint mismatch and a GitHub helper count of 6 versus expected 3 after later admissions. None of their inputs was changed by this branch. `git check-ignore --no-index -v tests/test_pm_coordination_events.py` reports `.gitignore:50:/tests/*`, with no `!` exception. The needed update to that test is therefore reported, not made. No ignored test was force-added and .gitignore was untouched. All static checker regressions authored here pass. Native obligations remain NOT_RUN.

Plan index validate exited **0**, with parsed top-level status **pass**. Governance reseal, aggregate landing checks and main push were not run; this is a drafting branch. Canon edits will need the designated integration/reseal workflow later.

## Open items and questions

**Questions for Jared: none.** Integration lead: the recorded DL-095 answer is landed on `main` (`Plans/Decision_Log.md`#DL-095) and precedes OSI-650's landing as required; arrange the separately authorized ignored-test pin correction; run independent review and the prescribed Sol/Astra reviews; admit each exact family later, independently. The all-seven native activation gate remains. No app contract closure or debug_mirror_exported admission is claimed.

## Evidence copies

Report and self-grade copies live in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO`. Check outputs are retained there as requested. Evidence paths and SHA-256:

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/shard-generate.txt` — `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/shard-check.txt` — `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/index-generate.json` — `8af77f2caf23d88e41ce586035c2907232c0dbf2e3c2ecfb0ce674e0a5e20550`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/coordination.json` — `c185c7e97808849b6fa80f414fd76c41dadadab90340a73dcff327f41cc7b04e`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/wave2.json` — `a961a9428b5d3f2793445c89e18d0a4b0ede30e672083f105eb23fcd025796c6`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/unittest.txt` — `a894536272b0b4ad8660791cd84dbaa1707f4dae1ed365481d9a39a8c0434b95`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/baseline-pin-test.txt` — `daa7db16b92146a08cd64210ad86a6d00143611ccba2dac64e017354659041a7`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/currentness-sha256.txt` — `76fa6f4657ab818ac61ef422c10a66ef11906f79a736374dc2e6e4da4d5acce9`

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/index-validate.json` — `4d2ee842e837d8077ca2c28655b3e038551391276dd8545dc18639410a3e455e`

## Review round 1: findings and responses

Reviewed input: `8640c26f84341687138ba8265a0682cf627e6334`; fixes: `21e4dede26ba23a8374f42cb7873c8d23111db7d`. All three actionable findings accepted and fixed. No owner prose, schema, fixture, admission, registry or decision was changed in this round; no regeneration was needed. The existing fixture already has all three correct boundaries. Only two checkers and this report/self-grade change. No pm-mail or subagent was used.

1. **Finding 1 — fixed (`21e4dede26ba23a8374f42cb7873c8d23111db7d`).** `scripts/pm_coordination_events.py:142` enumerates the exact projection definitions; `:522` rejects unknown definitions before composition filtering; `:836` excludes only the exact application set. Unknown `rogue` and `rogueApplicationV1` definitions reach the full checker and must yield both `projection_schema_definition_census` and `coordination_storage_family_mismatch`. Verify with `python3 -B scripts/pm_coordination_wave2.py` (negative probes in `schema_regression_failures`). Legitimate application definitions and the unchanged Project composition pass.
2. **Finding 2 — fixed (`21e4dede26ba23a8374f42cb7873c8d23111db7d`).** `scripts/pm_coordination_events.py:422` enforces reference isolation across every retained Project subtree, including shared helpers, before accepting the pruned null scan. Project references may name only known Project/shared payload definitions in the same schema. Direct nullable application-field and indirect shared-helper reference mutations must fail this helper with `project_payload_reference_not_isolated`, and fail the complete coordination checker. Verify with the same wave2 command. Existing direct-null and unknown-definition probes also run through the full checker.
3. **Finding 3 — fixed (`21e4dede26ba23a8374f42cb7873c8d23111db7d`).** `scripts/pm_coordination_wave2.py:23` requires exactly the ages 299999/300000/300001 with boolean false/false/true before evaluation. Missing, empty, incomplete, wrong-expectation and integer-as-boolean mutations run through the complete fixture checker and must report `threshold_oracle_census`. Verify with the same wave2 command. The shipped fixture remains unchanged.
4. **Finding 4 — integration item.** The ignored `tests/test_pm_coordination_events.py:745–752` is unchanged. This round again ran 50 tests: only the two known TestingSession fingerprint / GitHub count helper subtests fail (exit 1). Separate authorized maintenance must update those helper expectations. This is not an unresolved DCO checker fix.
5. **Finding 5 — integration item.** The DL-095 recorded answer this finding cited from `plans/ea-s09-decisions-hb-scope-20261104` is now landed on `main` as `Plans/Decision_Log.md`#DL-095, satisfying the before/with-OSI-650 order; `coordination.agent_crashed` admission still follows OSI-650's landing. `Plans/orchestrator-subagent-integration.md:3969` and `Plans/storage-plan.md:27448` cite the landed entry. No answer or Decision Log entry is changed here.

### Round 1 validation and re-grade

At `21e4dede26ba23a8374f42cb7873c8d23111db7d`, each of the six families was re-graded: aborted, crashed, file_ownership_updated, operation_updated, status_updated and unregistered each remain **11 PASS + membership ABSENT → 11 PASS + membership ABSENT**. Total **66 PASS / 6 ABSENT → 66 PASS / 6 ABSENT**. All 72 current quoted cells and source-file hashes were rechecked. Prepared contracts remain separate; no admission or native execution claim follows from passing static probes.

| Check | Exit | Result |
|---|---:|---|
| Resource preflight | 0 | 21 GB available RAM; 19 GB available disk |
| Coordination checker | 0 | top-level pass |
| Wave2 checker with full-checker negative probes | 0 | top-level pass |
| Shard check | 0 | pass |
| Plan index validate | 0 | JSON-parsed top-level pass |
| Coordination unit module | 1 | 50 tests; only the two known helper-pin failures |
| Currentness copy | 0 | all 15 files hash-matched |
| git diff --check | 0 | clean |

No new IDs. Existing lane IDs remain **SP-540..545, OSI-650**; no CV/ATS IDs. The detached `/home/sittingmongoose/pm-worktrees/DCO-fix1` worktree is removed after both commits are pushed, as required by FIX-ROUND.md. No main push, landing, reseal or governance mutation.

Round 1 outputs are retained under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/fix-round1/`; SHA-256 pins follow.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/fix-round1/checks.json` — `2a3cf6a7b9c81b5859c15bd4321f42db8beccb30dc7f56870d457f8d98ecb4dd`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/fix-round1/coordination.json` — `c185c7e97808849b6fa80f414fd76c41dadadab90340a73dcff327f41cc7b04e`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/fix-round1/currentness-sha256.txt` — `76fa6f4657ab818ac61ef422c10a66ef11906f79a736374dc2e6e4da4d5acce9`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/fix-round1/index-validate.json` — `76e92f8847b5b176a2268971591f10a0e3143b5d1a1bade1474d6bb8d98b3503`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/fix-round1/regrade-verification.json` — `fb6f67f417517ed981e96ac01d87ec62d7d7390ddbcc24ee90a0de25ddca9d49`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/fix-round1/shard-check.txt` — `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/fix-round1/unittest.txt` — `2213029598cbda77e7964bcc2d1b3af719e1f72386f3e02edaf283107b78fc4e`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCO/fix-round1/wave2.json` — `a961a9428b5d3f2793445c89e18d0a4b0ede30e672083f105eb23fcd025796c6`

## Sweep part 1 (text pass): findings and responses

Sweep part 1 for DCO was text-only: rebase, landed citations, checkers, regeneration. No deck-2 item was assigned to this lane. No checker, fixture, schema, proof, registry, admission, Decision Log or governance file was edited, no number helper or guard machinery was written, and no hash was re-pinned. The branch's four commits were rebased from `855df1ccc1c38d57ea2c2204d610eaf8538bb6e7` onto `origin/main` `451738fc0b869f5958d205e96b513af5290f7e5f` (replayed as `4fbcef483e`, `1f5ad4938b`, `206ac460e6`, `327619181d`); both owner documents auto-merged and all 157 conflicts were derived-only.

| Item | Response and location | How to verify |
|---|---|---|
| Rebase | All 157 conflicts were in `Plans/_shards/**` and `Plans/.plan_index/**`; resolved by regenerating at the replayed contract commit `4fbcef483e`, never hand-merged. No non-derived conflict occurred, so nothing was handed to the Opus worker for conflict resolution. | `git diff --name-only origin/main...HEAD` lists only lane paths; shard check passes below. |
| Landed citation, SP-541 threshold | `Plans/storage-plan.md:27448` now reads "OSI-650 applies DL-095 from the landed `Plans/Decision_Log.md` (at drafting time recorded on branch `plans/ea-s09-decisions-hb-scope-20261104`)". Commit `d212ce609f`. | `git show d212ce609f -- Plans/storage-plan.md`; the landed entry is `Plans/Decision_Log.md:2188` (DL-095) on `main`. |
| Landed citation, OSI-650 | `Plans/orchestrator-subagent-integration.md:3969` now reads "(recorded in the landed `Plans/Decision_Log.md`; at drafting time on branch `plans/ea-s09-decisions-hb-scope-20261104`)". The `source_lineage` pin at `Plans/orchestrator-subagent-integration.md:3996` is kept verbatim. Commit `d212ce609f`. | `git show d212ce609f -- Plans/orchestrator-subagent-integration.md`. |
| Landed citations, this report | `reports/event-authority-20261104/DCO.md:28` (DL-095 premise check), `:66` (open items) and `:91` (round-1 finding 5) now cite the landed DL-095 entry; the `c94f437e93a5fd2f85a9565f831878cf1b995569` lineage pin at `:28` is kept. Report commit (this section's commit). | `git diff 327619181d HEAD -- reports/event-authority-20261104/DCO.md`. |
| Self-grade relocation | All 91 evidence pins in `reports/event-authority-20261104/DCO-self-grade.json` (85 cell quotes + 6 disposition pins) were mechanically relocated to the rebased owner-text commit `d212ce609f`: 90 line-number shifts, 1 quote rewritten (the OSI-650 DL-095 citation prefix), every `file_sha256` refreshed, zero mismatches. `assessed_tree` now pins `d212ce609f`; `prior_assessed_tree` keeps `21e4dede26`. The crashed family's `remaining_gaps` citation words were updated to the landed entry. | Every `quote` is a substring of its file at `line_start`, and every `file_sha256` matches the file blob at `d212ce609f`. |
| Citations left as evidence | `reports/event-authority-20261104/DCO-search.json:280` quotes another document's mention of the older `plans/ea-s09-decisions-hb-scope-20260925` branch inside captured search output; that is search evidence, not this lane's citation, and stays byte-identical. `Plans/storage-plan.md:18181` and `:27197` ("unlanded" browser proposals; SP-319 lineage) are pre-existing `main` text outside this lane's insertions and are untouched. | `git diff 327619181d HEAD -- reports/event-authority-20261104/DCO-search.json` is empty; both storage-plan lines are unchanged by the lane diff. |

### Sweep part 1 verification

Checkers ran one at a time at the final head; none was modified (`scripts/pm_coordination_events.py` and `scripts/pm_coordination_wave2.py` are byte-identical to the reviewed `21e4dede26` versions; the rebase brought no change to them).

| Check | Exit | Result |
|---:|---:|---|
| `python3 -B scripts/pm_coordination_events.py` | 0 | top-level `pass`; 45 positive / 69 negative payloads, 7 valid / 32 negative events, 24 transition sequences (91 steps), 11 positive / 20 negative projection cases |
| `python3 -B scripts/pm_coordination_wave2.py` | 0 | top-level `pass`, no failures; threshold census and fail-closed probes |
| `python3 -B -m unittest discover -s tests -p test_pm_coordination_events.py -v` | 1 | 50 tests; only the two known ignored-helper subtest failures (TestingSession fingerprint; GitHub count 6 vs 3), unchanged from `origin/main` |
| `python3 -B scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `pass`, 99 sources; only the two edited owner documents' shards changed |
| `python3 -B scripts/pm-plan-index.py generate` | 0 | 7495 plan units |
| `python3 -B scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 99 sources |
| `python3 -B scripts/pm-plan-index.py validate` | 0 | parsed top-level `pass`, **0 findings** — nothing to classify as new versus `origin/main` |

Memory stayed at 7–11 GB available throughout; no heavy command was paused.

### Family grades (carried, not re-graded)

The last review's family grades are carried unchanged per the sweep instruction: Astra `LANDING_READY_WITH_NOTES`, 6/6 families PASS as prepared, each 11 PASS + membership ABSENT (66 PASS / 6 ABSENT). This lane's own review of its timestamp fields is interim only until the shared date-time gate passes. That interim sentence is superseded by "Sweep part 2B" below: the shared `date_time` predicate now covers the fields named there, so the timestamp review is no longer interim for those fields. `datetime_validator` and the inventory gate run at batch-2 integration. No lane is READY on timestamp fields before that gate; native execution remains NOT_RUN and membership remains ABSENT until separate admission.

## For an Opus or Sol worker

Open items from `reviews/DCO-sol/REVIEW-astra.md` and `REVIEW-cycle2.md` that are not number-handling or proof-machinery items:

1. **Ignored helper-pin test maintenance** (Astra note 2; cycle-2 note 1; round-1 finding 4). `tests/test_pm_coordination_events.py:745-752` (`test_pinned_helpers_count_admitted_coordination_rows_and_nothing_else`) still fails its two helper subtests: the TestingSession registry fingerprint and the GitHub helper's admitted-row count (6 today vs the pinned 3). Both reproduce with the `origin/main` checker; neither input changed on this branch. The review asked for the correction in its authorized scope only: the test is ignored (`.gitignore:50:/tests/*`, no `!` exception), so the pin update needs separate authorization and is not made here. Today's run: 50 tests, exit 1, exactly those two failures.
2. **DL-095/OSI-650 landing order** (Astra note 1; cycle-2 note 2). The recorded answer is landed on `main` (`Plans/Decision_Log.md:2188`), and both citations now name it (`Plans/orchestrator-subagent-integration.md:3969`, `Plans/storage-plan.md:27448`). What remains is the batch action the reviews described, not a text change: land OSI-650 with or after the landed answer and before `coordination.agent_crashed`'s admission. No new product answer is needed or written.

## Part 2 items

Number-handling, date-time, guard-table and proof-machinery items, left for part 2 per the sweep plan:

| Item | Location and required work |
|---|---|
| NUMRULE adoption | Adopt CV-1100/CV-1101 and SP-1100/SP-1101 from `plans/ea-numrule-20261105` for this lane's numbers: integer payload fields in `Plans/coordination_event_payloads.schema.json` (`:102`, `:106`, `:225`, `:298`, `:322`, `:384`, `:468`, `:550`), the required `heartbeat_age_ms` at `:517`, and the exact boundary constants 299999/300000/300001 in `scripts/pm_coordination_wave2.py:24` and `Plans/coordination_wave2_oracles.json:4` (`heartbeat_expiry_vectors`). No lane-local number cap or serializer was added here. |
| Date-time gate | The 15 `"format": "date-time"` fields in `Plans/coordination_event_payloads.schema.json` (`:181`, `:253`, `:337`, `:424`, `:486`, `:569`, `:705`, `:764`, `:916`, `:1017`, `:1135`, `:1240`, `:1318`, `:1411`, `:1494`) take their grammar from the shared date-time gate; none was tightened in place, and retained schemas are not edited here. |
| Guard tables + shared proof tool | Restructure the lane checkers' guard sites into named predicate guard tables and prove them with `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105` (method B): `scripts/pm_coordination_events.py:142` (projection definition census), `:422` (Project reference isolation), `:522` (unknown-definition rejection), `:836` (application-set composition filtering), plus the boundary/vector guards in `scripts/pm_coordination_wave2.py:20-28`. The lane's proof machinery is not rebuilt in part 1. |

## Sweep part 1 (fixture pass): findings and responses

**Fix commit:** `96418dcb51`. **Start:** text-pass head `0a8a2b4298`. **Rebase:** none; the text pass did not abort its rebase, so this round stayed on base `451738fc0b`. `Plans/` and `scripts/` are unchanged from `0a8a2b4298`.

This lane's own review of its timestamp fields is interim only until the shared date-time gate passes. Superseded by "Sweep part 2B" below for every field that section's table names.

| # | Item | Result | Commit |
|---|---|---|---|
| 1a | TestingSession helper pin | **Fixed.** | `96418dcb51` |
| 1b | GitHub helper count | **Not fixed; the file may not be edited under the brief's rule.** Exact change below. | none |
| 2 | DL-095/OSI-650 landing order | No text change needed. Facts confirmed; the batch action remains. | none |
| + | The 91 self-grade pins | **Confirmed.** Numbers below. | none |

### Item 1: the two helper-pin subtests

The earlier report treated both as one ignored file needing authorization. They have different causes and different rules.

**1a. TestingSession, fixed.**
- **Where:** `tests/test_pm_testing_session_events.py:39`, `:48`. `.gitignore:76` has a `!` rule for this file, so the brief allows the edit.
- **Why it broke:** the fingerprint of the 40 upstream rows has been stale since 2026-10-10, and the helper never learned the three families DL-300 registered. The module failed two tests, on `origin/main` too.
- **Fix:** re-froze the pin, and copied the GitHub helper's DL-300 rule, including its `requires_owner_adoption` check.
- **Negative:** `test_registry_helper_refuses_each_one_defect` (`:58`).

**Stale pin record:**

| | SHA-256 | True at |
|---|---|---|
| Old | `b59cc61d0f6569d1389256157d29d80f88516644b70c029809d4543405be52ea` | through `d86090abd9` |
| New | `d78354d22eef69af1ccfe7762ab49b347049f2fd764d7f07fcc29349f21aecac` | `102a7e99e8`, this head, `origin/main` |

Every registry commit between them was walked (`fixture-pass/pin-history.py`, `pin-diff.txt`). Three moved the 40 rows:

| Commit | Rows changed | What changed |
|---|---|---|
| `c0d688db9f` (DL-188, D42) | `workspace.layout_changed`, `terminal.workgroup_moved` | layout edition 1.1.0 to 2.0.0; `source_refs` |
| `634412b3ac` | `terminal.workgroup_moved` | `source_refs` only |
| `102a7e99e8` (CV-366) | 11 `goal.*` rows | `application_or_project` scope with exact selectors; app editions `requires_owner_adoption` |

**Properties still holding:** no Testing Session row is among the 40. `gate.validate()` reports no failures, and that includes the shared `preexisting_registry_unchanged`, whose own digest pin is independent of this literal. `python3 -B scripts/pm_coordination_events.py` and `pm_coordination_wave2.py` exit 0. No lane contract relies on the changed rows.

**Census derivation for the helper's return, `Plans/event_family_registry.json` at this head and on `origin/main`:** 46 families = 40 upstream + 2 admitted Browser + 1 admitted coordination (`agent_registered`) + 3 DL-300 (`settings.layer.changed`, `approval.chat_tool_requested`, `approval.chat_tool_resolved`). The helper returns 6, matching the test's `40 + admitted_count` and `EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT` 46.

**Guard removal (`fixture-pass/helper-removal.json`):**

| Removed | Flips |
|---|---|
| fingerprint pin | `changed_upstream` |
| `requires_owner_adoption` check | `adopted_proposed` |
| set equality alone / family count alone | nothing; same invariant at two sites |
| set equality and family count together | `unknown_family` |

`missing_proposed` refuses at the `live[ident]` lookup as `KeyError`, and at set equality and the count if that lookup is bypassed; no separate removal row was run for it.

**1b. GitHub count, not fixed.**
- **Where:** `tests/test_pm_coordination_events.py:752-754`. The helper is correct; main fixed it at DL-300, and its module passes 15 of 15.
- **Why it fails:** the test still expects `browser + coordination` (3), but both helpers now count DL-300's three families (6).
- **Why it stays:** `.gitignore:50` (`/tests/*`) covers this file with no `!` exception. The brief says to report the change.
- **Needed change:** `fixture-pass/needed-test_pm_coordination_events.patch` adds `dl300 = 3` and adds it to the three expected counts. Applied in the worktree and reverted, not committed: 50 of 50 tests pass.
- **Question for the lead (not a DL-045 choice):** may this three-line patch go into `tests/test_pm_coordination_events.py`, or should the file get a `!` rule?

### Item 2: DL-095 and OSI-650

No text change. Confirmed at this head and on `origin/main`: DL-095 is on `main` at `Plans/Decision_Log.md:2188`. `Plans/orchestrator-subagent-integration.md:3969` and `Plans/storage-plan.md:27448` cite the landed entry. `coordination.agent_crashed` is absent from `Plans/event_family_registry.json` and is `prepared_not_admitted` in `Plans/coordination_event_admission.json`. So the answer already precedes OSI-650, and what remains is the batch action: land OSI-650 before that family's admission.

### The 91 self-grade pins

`reports/event-authority-20261104/DCO-self-grade.json`, read at `0a8a2b4298` against owner blobs at its `assessed_tree` `d212ce609f`. **Verify:** `fixture-pass/verify91.py`, row results in `verify91.json`.

| Check | Result |
|---|---|
| Pins found | 91, same keys as before the refresh (`327619181d`) |
| `file_sha256` equals the owner blob's hash at `d212ce609f` | 91 of 91 |
| Same blob at the lane head | 91 of 91 |
| `quote` is a byte-exact substring of the cited lines | 91 of 91 |
| `excerpt_sha256` equals SHA-256 of the quote | 91 of 91 |
| `quote_check` | `exact` on all 91 |
| Quote byte-identical to before the refresh, and present in the new blob | 90 of 91 |
| Rewritten quote | 1: OSI-650, `Plans/orchestrator-subagent-integration.md:3969`; only the DL-095 citation words changed, and the new text is byte-exact at that line |
| Prior `file_sha256` true at `21e4dede26` | 91 of 91 |

**Two precisions.** Only 85 `file_sha256` values actually changed (84 `Plans/storage-plan.md`, 1 orchestrator): the 6 on `Plans/coordination_event_payloads.schema.json` are unchanged because that file is. And this confirms the end state: the worker's order of operations is not observable, but no value could have passed these checks as a blind restamp, since each quote is independently re-found in the blob the hash names.

### Checks (one at a time)

| Command | Exit | Result |
|---|---|---|
| `python3 -B scripts/pm_coordination_events.py` | 0 | top-level `pass`, no failures |
| `python3 -B scripts/pm_coordination_wave2.py` | 0 | top-level `pass`, no failures |
| unittest `test_pm_coordination_events.py` | **1** | 50 tests, 2 subtests fail, both `6 != 3` at `:752` (item 1b). Same test before this round: 2 subtests failed, one on the pin and one on the count. |
| unittest `test_pm_testing_session_events.py` | 0 | 12 tests; before this round 11 tests, 2 failures, also on `origin/main` `6861d332de` |
| unittest `test_pm_github_project_integration.py` | 0 | 15 tests |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 | |
| `pm-plan-index.py generate` | 0 | only four `generated_at_utc` clock lines change, so nothing derived is committed |
| `pm-plan-index.py validate` | **1** | top-level `fail`, 24 findings |

### Index findings

All 24 are **new here and not on `origin/main`**; `origin/main` `6861d332de` validates with exit 0, no findings.

- **Where:** 3 x `plan_unit_removed_without_ledger_decision` (DL-337, DL-338, DL-339), and 21 x `plan_unit_removal_ledger_invalid` (legacy ledger records, read only when a removal is detected).
- **Why:** `pm-plan-index.py` compares against `origin/main`, which gained those three units after this lane's base. This lane removes nothing.
- **Check:** the same validation with the baseline set in memory to the merge base `451738fc0b` exits 0, no findings.
- **Fix:** the next rebase onto `origin/main` clears them.

### Grades and other records

Family grades are carried unchanged: 6 of 6 families PASS as prepared, 66 PASS / 6 ABSENT. Membership ABSENT, native NOT_RUN. The self-grade file is unchanged. Part 2 items above are unchanged. No Decision Log entry, registry append, admission, seal, `Spec_Lock`, `.evidence`, `auto_decisions`, `.gitignore` or frozen-validator edit. No pm-mail or subagent.

## Sweep part 2A: findings and responses

Tool merge: `9f115dbf1a` merges gated guard tool `004bdedd632d9463f3535190a6ed5772338cdce1` (its 11 files only; none edited). No rebase. Implementation: `a6ad77775e`.

Each refusal of `scripts/pm_coordination_events.py` and `scripts/pm_coordination_wave2.py` is a named row. The checker records the failing observation and returns only what that row's table refuses. Predicates are one flag each, in `scripts/pm_coordination_table_*.py`. Witnesses are real single-defect edits; `scripts/pm_coordination_guard_run.py` feeds the resulting one-false observation to the gated tool.

### Guard-table result (gated tool `004bdedd63`, credited exactly as reported)

14 tables **PASS**, **116/116 rows proved**, 0 unproved inside those tables. Each row has one real single-defect witness. A cut of that row flips its witness and the other witnesses in the table stay refused. No masked negatives and no unrelated changes.

| Table | Proved |
|---|---:|
| payload_schema | 17/17 |
| payload_instance | 7/7 |
| projection_schema | 13/13 |
| projection_value | 11/11 |
| ledger | 9/9 |
| registry | 4/4 |
| preflight | 1/1 |
| svr | 3/3 |
| envelope | 10/10 |
| fixtures | 22/22 |
| validation | 5/5 |
| ats | 2/2 |
| transition | 8/8 |
| wave2 | 4/4 |

**Rows that cannot be proved alone**, each in its own table, still enforced:

| Row | Why it cannot fail alone |
|---|---|
| `retired_checkpoint_scope_partition` | A retired core whose scope is not the partition of its project also differs from the parent scope, so `checkpoint_retired_core_other_key` fails on the same edit. |
| `retired_checkpoint_publication_reused` | The nested checkpoint call clears `retired_generations`, so a retired core cannot report publication reuse. |
| `coordination_storage_value_schema_invalid` | An invalid `value_schema` also differs from the SP-320 materialization, so `coordination_storage_family_mismatch` fails too. |
| `prepared_registry_row_schema` | A family-schema failure also differs from `expected_registry_row`. |
| `ledger_owner_join` | The ledger schema rejects a different owner ref before the join. |
| `prepared_payload_schema_unresolved` | Changing the payload pointer moves the prepared row off `expected_registry_row`. |
| `prepared_registry_row_ref_unresolved` | A bad source ref was observed together with `prepared_registry_row_mismatch`. |
| `ledger_retention_binding` | Retention edits that were tried fail the ledger schema or the row mismatch first. |
| `mirror_owner_ref_unresolved` | The ledger schema rejects the alternate mirror owner ref first. |
| `threshold_oracle_evaluation` | The required map `{299999: false, 300000: false, 300001: true}` is exactly `age > 300000`, so once the census matches, the evaluation cannot fail. |
| `schema_mutation_*`, `full_checker_mutation_*`, `projection_mutation_*`, `threshold_mutation_*` | These probes fire only when the underlying proved row stops refusing. |
| `project_null_probe`, `extension_probe`, `application_definition_in_project_composition` | A schema edit that trips them also changes the SP-320 composition, so `project_registry_composition_mismatch` fails too. |

**4,400-digit integer.** Present and fixed in `a6ad77775e`. `key_recovery_epoch` (`scripts/pm_coordination_events.py:244`) and `canonical` (`:190`) were raising Python's 4300-digit conversion limit. Parsing and rendering now allow the full token. A 4,400-digit `agent_revision` on `coordination.agent_status_updated` is accepted (`payload_rejection` returns None). `progress_pct` of `1.0` is refused as `payload_integer_slots` only.

**Verify:** `PYTHONPATH=scripts python3 -B scripts/pm_coordination_guard_run.py` (14 PASS lines, no MISSING rows). `python3 -B scripts/pm_coordination_events.py` and `python3 -B scripts/pm_coordination_wave2.py` exit 0. Unittest `tests.test_pm_coordination_events` is 50 tests, exit 0.

## Sweep part 2B numbers: findings and responses

Number merge: `59a4250e2e` merges `58c2816ff33365384d4039553f5efdb5370930e6`. Its number files match the gated scope `a16f67c1ef21796758f4209ff12c0f4d12b86ce9`. 163 generated conflicts, all under `Plans/_shards/**` and `Plans/.plan_index/**`, were regenerated. No other conflict. NUMRULE files are unedited. Date-time modules are merged and **not adopted** in this number pass: no `pm_event_datetime.datetime_validator`, `date_time`, or inventory gate is called. Sweep part 2B below adopts `date_time`. `datetime_validator` and the inventory gate stay uncalled in this tree; they run at batch-2 integration.

- **Integer slots.** `scripts/pm_coordination_numbers.py:94` (`integer_slot_code`) calls `current_integer` at every integer slot of the payload definition, including `const` integers, with that slot's own minimum and maximum. `1.0` is refused after JSON Schema accepts it. Application-edition bounds must match the Project copy (`application_integer_bounds_match`).
- **SP-320 preimage.** `event_id_preimage` (`scripts/pm_coordination_events.py:255`) still emits the string array. Epoch and revision are exact integers before decimalization (`decimal_integer`). The heartbeat comparison stays 300000 (`scripts/pm_coordination_wave2.py:39`); it is not a maximum.
- **Local hash versus producer JCS.** `canonical` / `producer_digest` stay the local payload hash. `producer_semantic_digest` is a separate call on the EventRecord projection. Recipe id `coordination-sp320-string-array-v1`.
- **Retained recipe.** `retained_retry_matches` (`scripts/pm_coordination_numbers.py:173`) resolves an exact retry through `RetainedDispatcher` and the frozen SP-320 recipe. A forged recipe id is not an exact retry. Current writes do not use this path.
- **Owner citations.** SP-540..545 identity paragraphs in `Plans/storage-plan.md` cite CV-1100, SP-1100, and SP-1101. OSI-650 (`Plans/orchestrator-subagent-integration.md:3969`) says 300000 is the policy comparison, not a numeric maximum.
- **Self-test.** `python3 scripts/pm_event_numbers.py --self-test --scope numbers` exits 0 and prints `"status": "pass"`. Credited exactly: number recipes only; CV-1101 stays separately required.
- **Lane corpus.** `python3 scripts/pm_coordination_number_corpus.py` exits 0, `"status": "pass"`: 16 agreements, 3 coordination-domain refusals, 0 disagreements, 0 crashes. History and date-time corpus cases are skipped.

**Grades:** unchanged, 6 of 6 families **66 PASS / 6 ABSENT**. Membership ABSENT. Native NOT_RUN. The sweep strengthens proof; it does not move a cell. Self-grade quotes were re-found (91/91 still present); 84 line numbers and the file hashes for the two edited owner documents were refreshed. `assessed_tree` is `a6ad77775e974a4e2ac5c55cdd40850dc6fd164a`.

Shards regenerated only for `Plans/storage-plan.md` and `Plans/orchestrator-subagent-integration.md`. Shard check: pass, 3100 shards. `python3 -B scripts/pm-plan-index.py validate` at `origin/main` `b4013202fa50d380621914e9373a183d780f5fb5` exits 1 with 59 findings: 38 `plan_unit_removed_without_ledger_decision` and 21 `plan_unit_removal_ledger_invalid`. None name SP-540..545, OSI-650, `storage-plan.md`, or `orchestrator-subagent-integration.md`. This pass did not rebase; the findings are fork drift of current main against this lane's base, not a DCO removal.

## Part 2B items

These three items are the date-time list left at the end of the number pass. Items 1 and 2 are closed in "Sweep part 2B" below. Item 3 stays open for batch integration. The timestamp review is no longer interim for the fields that section names.

1. **CV-1101 date-time adoption.** Was open at `scripts/pm_coordination_events.py:313` (`valid_utc`) and the 15 `"format": "date-time"` fields in `Plans/coordination_event_payloads.schema.json` (`:181`, `:253`, `:337`, `:424`, `:486`, `:569`, `:705`, `:764`, `:916`, `:1017`, `:1135`, `:1240`, `:1318`, `:1411`, `:1494`). Closed by `date_time` in the next section. `datetime_validator` and the inventory gate run at batch-2 integration.
2. **SP-1101 timestamp profile on the frozen recipe.** Number-recipe selection stays `coordination-sp320-string-array-v1`. The sealed `coordination_utc_z` profile joins that verifier in the next section.
3. **DO's copy of `pm_coordination_events.py` — still open for batch integration.** NUMRULE says DO carries another modified copy. These edits were made once, on this lane. The other consumer is not in this worktree.

## Sweep part 2B: findings and responses

Branch `plans/ea-w2-coordination-20261104`. Part 2A head `2ec9d21d70`. Implementation `9a779cbabc`. The report commit's SHA is in the external `HEAD.txt`. No rebase. No `Plans/*.md` edit, so shards and the index were not regenerated.

**6/6 families stay 11 PASS + membership ABSENT (66 PASS / 6 ABSENT), before and after.** Readiness: prepared for the batch-2 review. The timestamp review is no longer interim for the fields in the table below. `datetime_validator` and the inventory gate run at batch-2 integration. Membership stays ABSENT. Native execution stays NOT_RUN. This is not READY.

### The merge

Skipped. `58c2816ff33365384d4039553f5efdb5370930e6` is already an ancestor of `2ec9d21d70` (`git merge-base --is-ancestor` exits 0). The part 2A number merge is `59a4250e2e` ("merge the gated NUMRULE number scope (58c2816ff3) for sweep part 2B numbers"). There is no new part 2B merge commit. Neither addendum resolution was needed. `git diff 58c2816ff3 HEAD --` the NUMRULE paths (`scripts/pm_event_numbers.py`, `scripts/pm_event_numbers_corpus.py`, `scripts/pm_event_datetime.py`, `scripts/pm_event_datetime_inventory.py`, `Plans/event_datetime_inventory.json`, `scripts/pm_event_datetime_exclusions.json`, `Plans/event_number_recipe_corpus.json`) is empty.

### Item 1: CV-1101 date-time

`valid_utc` (`scripts/pm_coordination_events.py:319`) is now `coordination_timestamp` (`scripts/pm_coordination_numbers.py:196`), which is `pm_event_datetime.date_time` with the sealed profile `coordination_utc_z` (`SEALED_TIMESTAMP_PROFILE`, `scripts/pm_coordination_numbers.py:34`). A `Refusal` is false. The spelling is not rewritten. A `str` subclass refuses (`valid_utc_datetime`). The owner pattern on each of the 15 nodes is unchanged, so a lowercase `t`, a lowercase `z`, an offset, and more than nine fraction digits still refuse as `schema` before this predicate. jsonschema `format` is not installed.

The same predicate covers projection copies (`projection_timestamp_bad`, `scripts/pm_coordination_events.py:662`; row `projection_timestamp`). Envelope `occurred_at_utc` uses `event_record` (`envelope_occurred_at`, `:1382`). Envelope `observed_at_utc` and `persisted_at_utc` use `storage_utc_z` (`envelope_storage_time`, `:1384`). Payload `observed_at_utc` is the producer observation time (CV-353 rule 8), so it stays `coordination_utc_z`, not the Storage profile.

**Verify:** `python3 -B scripts/pm_coordination_events.py` exits 0, `"status": "pass"`, `failures: []`. The probe is `timestamp_profile_failures` (`:1610`), folded into `validate` at `:1774`.

| Field | Where | Shared check and profile |
|---|---|---|
| `agent_registered.started_at_utc` and `agent_registeredApplicationV1.started_at_utc` | payload schema `:181`, `:1318` | `date_time`, **coordination_utc_z**, after the owner pattern. Code `valid_utc_datetime` (`:338`) for the Project event. The ApplicationV1 node is the same string check in the census; it is not an event type. |
| `agent_status_updated.observed_at_utc` and its ApplicationV1 copy | `:253`, `:1411` | `date_time`, **coordination_utc_z** |
| `agent_operation_updated.observed_at_utc` and its ApplicationV1 copy | `:337`, `:1240` | `date_time`, **coordination_utc_z** |
| `agent_file_ownership_updated.observed_at_utc` and its ApplicationV1 copy | `:424`, `:1135` | `date_time`, **coordination_utc_z** |
| `agent_unregistered.finished_at_utc` and its ApplicationV1 copy | `:486`, `:1494` | `date_time`, **coordination_utc_z** |
| `agent_crashed.detected_at_utc` and its ApplicationV1 copy | `:569`, `:1017` | `date_time`, **coordination_utc_z** |
| `agent_aborted.aborted_at_utc` and its ApplicationV1 copy | `:705`, `:916` | `date_time`, **coordination_utc_z** |
| `debug_mirror_exported.exported_at_utc` | `:764` | `date_time`, **coordination_utc_z**. No ApplicationV1 copy. |
| Projection timestamps: every property that refs `#/$defs/timestamp` or `timestampApplicationV1` (`started_at_utc`, `occurred_at_utc`, `observed_at_utc`, `first_observed_at_utc`, `last_observed_at_utc`, `updated_at_utc`, `withdrawn_at_utc`, `published_at_utc`), including `agent_terminal.occurred_at_utc` and `agent_terminalApplicationV1.occurred_at_utc`. **Corrected in fix round 1:** the part 2B hand list omitted `occurred_at_utc` (DCO-1) and named four payload-only fields no projection definition has. | `projection_time_fields`, derived from the schema by `projection_timestamp_sites` (`scripts/pm_coordination_events.py:678`, `:707`) | `date_time`, **coordination_utc_z**. Null `withdrawn_at_utc` is the absence, not a timestamp. Row `projection_timestamp`. |
| EventRecord `occurred_at_utc` | envelope `:1382` | `date_time`, **event_record**. The join to the payload family timestamp is unchanged, so a live coordination event's `occurred_at_utc` stays uppercase Z. |
| EventRecord `observed_at_utc`, `persisted_at_utc` | envelope `:1384` | `date_time`, **storage_utc_z** |

**Leaks, each in `timestamp_profile_failures`:** `2026-09-25T24:00:00Z` and a trailing LF refuse as `valid_utc_datetime` on every Project payload family timestamp, as `projection_timestamp` on a file projection, and as `envelope_occurred_at` or `envelope_storage_time` on the envelope. February 30, a non-leap second 60, and minute 60 refuse the same way. The owner pattern still admits those strings; `date_time` is what refuses them.

**Widening, stated plainly.** The previous `valid_utc` (regex plus `datetime.datetime`) refused every leap second and year 0000, and it accepted a `str` subclass. `date_time` accepts `2016-12-31T23:59:60Z` and `0000-01-01T00:00:00Z`, and it refuses a `str` subclass. Hour 24 and a trailing LF were already refused and stay refused. Lowercase `t` and a 13-digit fraction stay `schema` refusals even though `coordination_utc_z` would accept them.

**Fixture expectations that changed:** none. `registered_offset_timestamp` stays `schema`. `registered_invalid_calendar_date` stays `valid_utc_datetime`. No `expected_rejection` value was edited.

### Item 2: SP-1101 profile on the frozen recipe

The recipe id stays `coordination-sp320-string-array-v1`. `RecipeTuple` has no date-time field. The frozen verifier (`_retained_dispatcher`, `scripts/pm_coordination_numbers.py:239`) requires `item.recipe is recipe`, `SEALED_TIMESTAMP_PROFILE == COORDINATION_UTC_Z`, and `timestamps_match_sealed_profile` (`:206`). A JSON field named `date_time_profile` is not a selector. `retained_override_refused` (`:272`) expects `caller_recipe_override`. The digest-only retry body is `b"{}"` (`retained_retry_matches`, `:297`), so an exact digest retry still resolves and a forged recipe id does not. `RetainedDispatcher` itself is the NUMRULE type and was not edited.

**Verify:** the same checker command. Probes `retained-profile`, `retained-retry`, and `retained-forged` are inside `timestamp_profile_failures`.

### Item 3: DO's copy

Still open for batch integration. This lane edited `scripts/pm_coordination_events.py` once. DO's other copy is not in this worktree and was not edited.

### Inventory gate and the combined self-test

`datetime_validator` is not called in this tree. `python3 scripts/pm_event_datetime.py --self-test` is not credited: it has no entry point.

`python3 -B scripts/pm_event_datetime_inventory.py` on this tree exits **1**. Nodes 233, unclassified nodes 0, **238 failure rows**, and **0** `inventory_node_changed`. None name a coordination file. The inventory and the exclusions file were not edited.

| Rows | Error | Where |
|---:|---|---|
| 133 | `unclassified_mentioning_container` | `Plans/.plan_migration` |
| 14 | `unclassified_mentioning_container` | `Plans/.plan_index` |
| 41 | `stale_scan_exclusion` | `Plans/_shards` |
| 38 | `unreadable_mentioning_container` | `Plans/_shards` |
| 2 | `stale_scan_exclusion` | `Plans/.plan_index` |
| 2 | `stale_scan_exclusion` | `Plans/Decision_Log.md` |
| 2 | `unreadable_mentioning_container` | `Plans/Decision_Log.md` |
| 2 | `stale_scan_exclusion` | `Plans/usage-feature.md` |
| 2 | `unreadable_mentioning_container` | `Plans/usage-feature.md` |
| 1 | `stale_scan_exclusion` | `Plans/Contracts_V0.md` |
| 1 | `unreadable_mentioning_container` | `Plans/Contracts_V0.md` |

`python3 scripts/pm_event_numbers.py --self-test` (scope all), run on this committed tree after `9a779cbabc`, exits **1** before any case: `case_execution: NOT_RUN_ADMISSION_REFUSED`, its only failing check `datetime_inventory_complete_and_classified`. Its `datetime_inventory.failures` are the same 238 rows as the inventory script above (0 coordination paths, 0 `inventory_node_changed`). `datetime_validator` and the inventory gate run at batch-2 integration.

`python3 scripts/pm_event_numbers.py --self-test --scope numbers` exits **0**, `"status": "pass"`, 580/580 (276 positives, 304 negatives), failures `[]`. Credited exactly: number recipes only. DCO is not one of the six lanes that still owed numbers; those were adopted at `a6ad77775e`.

### Guard tables

The gated tool `scripts/pm_guard_isolation.py` at `004bdedd63` was not edited. `python3 -B scripts/pm_coordination_guard_run.py` exits **0**. The `MISSING` list is empty. 14 tables **PASS**, **119/119 rows proved**. Failure kinds empty on every table.

| Table | Part 2A | Part 2B |
|---|---:|---:|
| payload_schema | 17/17 | 17/17 |
| payload_instance | 7/7 | 7/7 |
| projection_schema | 13/13 | 13/13 |
| projection_value | 11/11 | **12/12** |
| ledger | 9/9 | 9/9 |
| registry | 4/4 | 4/4 |
| preflight | 1/1 | 1/1 |
| svr | 3/3 | 3/3 |
| envelope | 10/10 | **12/12** |
| fixtures | 22/22 | 22/22 |
| validation | 5/5 | 5/5 |
| ats | 2/2 | 2/2 |
| transition | 8/8 | 8/8 |
| wave2 | 4/4 | 4/4 |
| **Total** | **116/116** | **119/119** |

New rows, each with one witness: `projection_timestamp` (hour 24 on a file projection, `scripts/pm_coordination_guard_run.py:207`), `envelope_occurred_at` (hour 24 on `occurred_at_utc`, `:274`), `envelope_storage_time` (`+00:00` on `observed_at_utc`, `:275`). `payload_instance` was re-proved because `valid_utc` changed; its `valid_utc_datetime` witness is still February 30 (`:145`) and still returns only that code. The by-construction rows listed in the part 2A section stay in their own tables.

### Grades

| Cell | Before | After |
|---|---|---|
| All 11 graded cells, 6 families | 66 PASS | 66 PASS |
| `membership_version`, 6 families | 6 ABSENT | 6 ABSENT |

Timestamps were an interim caveat, not a PARTIAL cell. They are no longer a caveat for the fields in the table. No cell moves. Self-grade: 91 pins, 0 mismatches, 0 hash mismatches, against the worktree. `assessed_tree` stays `a6ad77775e974a4e2ac5c55cdd40850dc6fd164a`. Owner documents were not edited in this pass, so the pins were not rewritten.

### Readiness

Prepared for the batch-2 review. Not READY.

- Done in this tree: the 15 payload date-time fields, their projection copies, and the three envelope times go through `date_time` with the profiles above. The frozen SP-320 verifier seals `coordination_utc_z`. Guard tables 119/119. Checker and wave2 exit 0.
- At batch-2: refresh the inventory for the 238 rows above, then run `datetime_validator` and the inventory gate, and the combined self-test must pass. Item 3 (DO's other copy of this checker) is integrated there. Index fork drift stays with the integration rebase.
- Unchanged: membership ABSENT, native execution NOT_RUN. Ids remain **SP-540..545** and **OSI-650**. No new PlanUnit, Decision Log entry, registry admission, or governance edit.

**Stopped for Jared:** none.

### Commands

| Command | Exit | Result |
|---|---:|---|
| `python3 -B scripts/pm_coordination_events.py` (after `9a779cbabc`) | 0 | `"status": "pass"`, `failures: []` |
| `python3 -B scripts/pm_coordination_wave2.py` | 0 | `"status": "pass"`, `failures: []` |
| `python3 -B scripts/pm_coordination_guard_run.py` | 0 | 14 PASS, 119/119, MISSING empty |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `"status": "pass"`, 580/580 |
| `python3 scripts/pm_event_numbers.py --self-test` (after `9a779cbabc`) | 1 | `NOT_RUN_ADMISSION_REFUSED`; only `datetime_inventory_complete_and_classified`; 238 rows, same as the inventory script |
| `python3 -B scripts/pm_event_datetime_inventory.py` | 1 | 238 rows, table above; 0 `inventory_node_changed` |
| `python3 scripts/pm_event_datetime.py --self-test` | — | not run; no entry point; not credited |

## Fix round 1 after the Opus recheck

Recheck: `reviews/GROK-RECHECK/DF-DCO.md` (Opus 5.5, NOT_READY: DCO-1 and DCO-2 blocking). Brief: `lanes/GROK-FIX-DF-DCO.md`. Worked on Nas1 in a trimmed worktree (no plan-migration snapshot runs other than 001, 002 and the current run). Old head `7da6d92bb52afcd54884ac914f0cfd64b20ab70e`.

| Commit | What |
|---|---|
| `fbce30148a` | DCO-1, DCO-2, DCO-N1, DCO-N2, DCO-N3: checker, fixtures, guard witnesses, tests |
| `1fb0a004d0` | DCO-N4: one CV-1101 sentence per owner unit; shards and index regenerated for the two documents |
| this commit | report, self-grade pin hashes |

### Findings and fixes

| Finding | Fix | Where | Evidence |
|---|---|---|---|
| **DCO-1** (blocking) projection `agent_terminal.occurred_at_utc` and `agent_terminalApplicationV1.occurred_at_utc` never reached `date_time` | The hand list `PROJECTION_TIME_FIELDS` is gone. `projection_timestamp_sites` walks the projection document, and the application-workflow definitions its ApplicationV1 entries `$ref`, for every property whose schema is a `$ref` to `#/$defs/timestamp` or `timestampApplicationV1` (directly or as a `oneOf`/`anyOf`/`allOf` branch). `projection_time_fields` is the set of those names; `projection_value_failures` passes it to `projection_timestamp_bad`. New positives `projection_agent_terminal_application` (definition `agent_terminalApplicationV1`) and `checkpoint_withdrawn`. New negatives `agent_terminal_occurred_hour_24`, `agent_terminal_occurred_trailing_lf`, `agent_terminal_application_occurred_hour_24`, `checkpoint_withdrawn_at_hour_24`, each `projection_timestamp`. Guard witness: one hour-24 witness per instance site (14), all required to return exactly `["projection_timestamp"]` (`Witnesses.add_all`). | `scripts/pm_coordination_events.py:678`, `:707`, `:712`; `Plans/coordination_event_contract_fixtures.json`; `scripts/pm_coordination_guard_run.py:61`, `:215` | On `projection_agent_crashed`, `terminal.occurred_at_utc` set to `2026-09-25T24:00:00Z`, `2026-02-30T04:17:00Z`, `2026-09-25T23:59:60Z`, `2026-09-25T04:60:00Z` or `"2026-09-25T04:17:00Z\n"` now returns `["projection_timestamp"]`; the same five on `agent_terminalApplicationV1` too; a real leap second is accepted (`ProjectionTimestampTests.test_terminal_occurred_at_reaches_date_time`). The derived set is `first_observed_at_utc`, `last_observed_at_utc`, `observed_at_utc`, `occurred_at_utc`, `published_at_utc`, `started_at_utc`, `updated_at_utc`, `withdrawn_at_utc`. The four payload-only names the old list carried (`finished_at_utc`, `detected_at_utc`, `aborted_at_utc`, `exported_at_utc`) are not properties of any projection definition, and every projection definition is closed, so dropping them weakens nothing. |
| **DCO-2** (blocking) the `envelope_occurred_at` witness and the `envelope/hour-24` probe left the payload family time stale | Both set `occurred_at_utc` and the payload family time (`FAMILY_TIME[event_type]`) to `2026-09-25T24:00:00Z`, so the CV-353 rule 8 join holds and only the `event_record` check refuses. | `scripts/pm_coordination_guard_run.py:285`; `scripts/pm_coordination_events.py:1879` | Cut the `event_record` check in the real checker: the rebuilt witness returns `None` (accepted); the stale form still returns `occurred_at_join` (`ProjectionTimestampTests.test_envelope_occurred_at_witness_is_single_defect`). Recheck mutation M12 now fails the probe with detail `None` (the input is accepted), not with a code. |
| **DCO-N3** (note) projection fields only partly witnessed | `PROJECTION_TIMESTAMP_INSTANCE_PROBES` (14 sites: each runs the full projection check on its positive with one field changed, five refused forms, three accepted forms and a `str` subclass) and `PROJECTION_TIMESTAMP_NODE_PROBES` (12 ApplicationV1 sites in definitions this offline registry cannot instantiate, because they need `application_context` or the application-workflow document; probed as nodes). A census compares the written site list with the schema walk, so a new timestamp `$ref` or a dropped site fails. | `scripts/pm_coordination_events.py:1667`, `:1694`, `:1720`, called at `:1904` | M7 and M9 caught (below). A new `$ref` to `timestamp` joins the set and fails the census (`test_a_new_timestamp_ref_joins_the_set_and_fails_the_census`). |
| **DCO-N4** (note) owner units did not cite CV-1101 | One sentence per unit (SP-540..545 in the "Payload and scope" paragraph, OSI-650 at the end of its prose): payload family time and projection copies `coordination_utc_z`, EventRecord `occurred_at_utc` `event_record`, Storage-assigned `observed_at_utc` and `persisted_at_utc` `storage_utc_z`. | `Plans/storage-plan.md:27487`, `:27559`, `:27633`, `:27705`, `:27777`, `:27849`; `Plans/orchestrator-subagent-integration.md:3969` | `pm-shard-plans.py --generate`, `pm-plan-index.py generate`, `pm-shard-plans.py --check` pass (3,100 shards). Regeneration touched only `Plans/_shards/storage-plan` (91 files), `Plans/_shards/orchestrator-subagent-integration` (60) and five index files; in `plan_units.jsonl` 791 units of those two documents changed, each only in `source_doc_sha256`. No `canonical_text` changed. |
| DCO-N1 (note, fixed because it is in this lane's code) a `str` subclass skipped the projection check | `isinstance(item, str)`; `date_time` refuses the subclass (`date_time_type`). | `scripts/pm_coordination_events.py:719` | `test_str_subclass_is_refused_at_a_projection_field`; added mutation M15 caught. |
| DCO-N2 (note, fixed because it is in this lane's code) the SP-1101 frozen verifier checked only the six payload fields | On a full EventRecord (a nested `payload`), `timestamps_match_sealed_profile` also requires `occurred_at_utc` under `event_record` and `observed_at_utc`, `persisted_at_utc` under `storage_utc_z`, each present. The retry path still hands the verifier `b"{}"`; giving it the authenticated original's bytes waits for native custody integration (unchanged open item). | `scripts/pm_coordination_numbers.py:222`; probes `retained-envelope-good` and `retained-envelope/*` in `timestamp_profile_failures` | The lane's valid record verifies; `observed_at_utc` `+00:00`, `persisted_at_utc` hour 24, `occurred_at_utc` Feb 30 and a missing `occurred_at_utc` do not. Added mutation M14 caught. |
| Not this round | `pm_coordination_events.py` is not reconciled with lane DO; that union is batch-2 integration (`state/INTEGRATION-NOTES.md`). | — | — |

### Guard-witness cuts in the real checker (check 11 for every changed row)

Each new or changed date-time guard was cut in the real checker (monkeypatch, nothing edited) and its witness rerun. Output: `real-cuts.txt` in the evidence folder.

| Row | Witness | Guard present | Guard cut |
|---|---|---|---|
| `envelope_occurred_at` | `occurred_at_utc` and payload `started_at_utc` hour 24 | `envelope_occurred_at` | `None` (accepted) |
| `envelope_storage_time` | `observed_at_utc` `+00:00` | `envelope_storage_time` | `None` |
| `valid_utc_datetime` | `started_at_utc` Feb 30 | `valid_utc_datetime` | `None` |
| `projection_timestamp` | hour 24 at each of the 14 instance sites | `["projection_timestamp"]` (14/14) | `[]` (14/14) |

### Guard tool

- **Witness collection on Nas1:** `Witnesses().collect()` and `gaps()` at `fbce30148a`: `MISSING` is empty; rows found per phase are unchanged from part 2B (payload_schema 17, payload_instance 7, projection_schema 13, projection_value 12, ledger 9, registry 4, preflight 1, svr 3, envelope 12, fixtures 22, validation 5, ats 2, transition 8, wave2 4 = 119). 2 min 14 s, 130 MB.
- **Gated tool run: still to do, on the VM.** `scripts/pm_coordination_guard_run.py:583` hard-codes `MemoryGate(max_rss=8192, pause_when_low=10, resume_at=13.5)`. Nas1 has about 12 GB and never reaches 13.5 GB available, and the brief says not to edit that file's gate, so the line is unchanged. Command, in a VM worktree at this branch's head, started at 13.5 GB available or more:
  `long-job start dco-guard-fix1 -- env PYTHONPATH=scripts python3 -B scripts/pm_coordination_guard_run.py`
  Expected: `MISSING` empty, 14 tables PASS, 119/119, failure kinds empty. The witness edits are in `Witnesses` only; `run_tool` and the tables are unchanged.

### Checks (Nas1, at `1fb0a004d0`)

| Command | Exit | Result |
|---|---:|---|
| `python3 -B scripts/pm_coordination_events.py` | 0 | `"status": "pass"`, `failures: []`; 45/69 payloads, 7/32 events, 24 sequences (91 steps), **13 positive / 24 negative projection cases** |
| `python3 -B scripts/pm_coordination_wave2.py` | 0 | `"status": "pass"` |
| `python3 -B -m unittest -v tests.test_pm_coordination_events` | 0 | 57 tests, OK (50 before, 7 new in `ProjectionTimestampTests`) |
| `python3 -B scripts/pm_coordination_number_corpus.py` | 0 | pass, 16 agree / 3 refusals / 0 crash; retained exact True, forged False |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `"status": "pass"`, **580/580**, failures `[]` |
| `python3 scripts/pm_event_numbers.py --self-test` (scope all) | 1 | `NOT_RUN_ADMISSION_REFUSED`, only `datetime_inventory_complete_and_classified` |
| `python3 -B scripts/pm_event_datetime_inventory.py` | 1 | In this trimmed worktree the gate stops at `scan_exclusions_invalid` (`exclusion_purpose_citation_unreadable: Plans/.plan_migration/pds-20260906-017-current-planunit-snapshot/span_map.jsonl`, a snapshot run the brief leaves out of the sparse tree) and reports the 233 nodes as `inventory_node_missing`. Not comparable with the full-tree 238 rows above. |
| `pm-shard-plans.py --check` | 0 | pass |

`datetime_validator` and the inventory gate run at batch-2 integration (addendum 2). Nas1 lacked `blake3` and `rfc8785`; every command ran in a scratch venv with `--system-site-packages` plus `blake3 1.0.11`, `rfc8785 0.1.4`, `msgpack 1.2.4`.

### Recheck mutations (in memory, through `validate()`)

The recheck's harness `dco_mut.py` re-pointed at this worktree. M7 and M9 edited the old hand list, which no longer exists; they now drop the same names from the derived set. M13-M15 are new.

| # | Mutation | Result | Caught by |
|---|---|---|---|
| — | baseline | clean | — |
| M1 | payload profile `event_record` | caught (5) | `timestamp_profile` census, 4 transition fixtures |
| M2 | Storage accepts lowercase `z` | caught | `envelope/lowercase-z` |
| M3 | `persisted_at_utc` dropped from the envelope check | caught | `envelope/lowercase-z`, `envelope/trailing-lf` |
| M4 | hour 24 accepted | caught (56) | the four new projection negatives, profile and payload probes |
| M5 | trailing LF accepted | caught (52) | `agent_terminal_occurred_trailing_lf`, probes |
| M6 | `str` subclass accepted | caught (22) | payload subclass probes |
| M7 | projection `updated_at_utc` dropped | **caught (14)** (survived at `7da6d92bb5`) | `projection/checkpoint/updated_at_utc/*`, `projection/checkpoint_core/updated_at_utc/*` |
| M8 | every second 60 refused | caught (52) | accept probes |
| M9 | projection `first_observed_at_utc`, `last_observed_at_utc` dropped | **caught (14)** (survived at `7da6d92bb5`) | `projection/operation_projection/*` |
| M10 | frozen verifier ignores timestamps | caught (5) | `retained-profile`, `retained-envelope/*` |
| M11 | year 0000 refused | caught (49) | accept probes |
| M12 | envelope `occurred_at_utc` check removed | **caught on acceptance** (was reason code only) | `envelope/hour-24`, detail `None` |
| M13 | projection `occurred_at_utc` dropped (the DCO-1 defect) | caught (15) | the three new `agent_terminal*` negatives, site probes |
| M14 | frozen verifier ignores envelope times | caught (4) | `retained-envelope/*` |
| M15 | projection check skips a `str` subclass | caught (14) | `projection/*/subclass` |

**15 of 15 caught.**

### Grades and self-grade

No cell moves: 66 PASS / 6 ABSENT. The projection timestamp copies were already counted under the timestamp caveat removed in part 2B; DCO-1 was a miss inside that claim and is now closed with negatives. Self-grade: 91 pins, every quote still exact at its lines; 85 pins point into `Plans/storage-plan.md` and `Plans/orchestrator-subagent-integration.md`, whose bytes changed with DCO-N4, so their `file_sha256` was rewritten to the new file hashes (quotes and `excerpt_sha256` unchanged).

### Readiness

Prepared for re-review. Not READY. Open: the gated guard-tool rerun on the VM (command above); batch-2 items unchanged (inventory refresh, `datetime_validator`, the combined self-test, DO union, index fork drift). Membership ABSENT, native NOT_RUN. No new ids, no Decision Log entry, no registry append. **Stopped for Jared:** none.
