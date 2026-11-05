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

The last review's family grades are carried unchanged per the sweep instruction: Astra `LANDING_READY_WITH_NOTES`, 6/6 families PASS as prepared, each 11 PASS + membership ABSENT (66 PASS / 6 ABSENT). This lane's own review of its timestamp fields is interim only until the shared date-time gate passes. No lane is READY on timestamp fields before that gate; native execution remains NOT_RUN and membership remains ABSENT until separate admission.

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
