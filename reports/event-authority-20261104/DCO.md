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
- **DL-095:** inspected `origin/plans/ea-s09-decisions-hb-scope-20261104` at `c94f437e93a5fd2f85a9565f831878cf1b995569`, Decision_Log's DL-095 narrative and unit. Its premise still matches today's OSI-438/Gap #30: 30-second runtime liveness, same crash detector and heartbeat_expired reason. OSI-650 applies 300000 ms, strictly greater, with observed heartbeat_age_ms and independent process/worktree evidence. Sleep handling stays technical work, as answered. The decision branch must integrate before/with this amendment; no decision entry was copied or rewritten here.
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

**Questions for Jared: none.** Integration lead: integrate the recorded DL-095 answer before/with OSI-650; arrange the separately authorized ignored-test pin correction; run independent review and the prescribed Sol/Astra reviews; admit each exact family later, independently. The all-seven native activation gate remains. No app contract closure or debug_mirror_exported admission is claimed.

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
5. **Finding 5 — integration item.** Integrate the DL-095 recorded answer from `plans/ea-s09-decisions-hb-scope-20261104` before/with OSI-650 and before `coordination.agent_crashed` admission. `Plans/orchestrator-subagent-integration.md:3969` and `Plans/storage-plan.md:27339` retain that dependency. No answer or Decision Log entry is changed here.

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
