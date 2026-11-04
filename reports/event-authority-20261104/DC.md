# Lane DC: the 18 collaborative workflow families, prepared without admission (2026-11-04)

Branch `plans/ea-collab-prep-20261104`, cut from `origin/main` `be4766513f` in `~/pm-worktrees/ea-dc` on Nas1. The Plans tree graded and checked is `b8d010d974`; the last commit adds only this report and the self-grade. It prepares full contracts for the 18 families that DL-090 and DL-091 select:

- run lifecycle: `collaboration.created`, `collaboration.started`, `collaboration.paused`, `collaboration.resumed`, `collaboration.cancelled`, `collaboration.completed`, `collaboration.failed`
- participants, transcript, artifacts and configuration: `collaboration.participant_started`, `collaboration.participant_completed`, `collaboration.message_added`, `collaboration.artifact_added`, `collaboration.configuration_changed`
- BrainStorm: `brainstorm.proposal_added`, `brainstorm.vote_added`, `brainstorm.plan_synthesized`
- Review: `review.finding_added`, `review.finding_dispositioned`, `review.artifact_finalized`

It admits nothing. No row is added to `Plans/event_family_registry.json`, no checkpoint or pin moves, no Decision Log entry or DL-077 admission record is written, and no governance file is touched. Each family is admitted later in its own Storage admission landing, one family per landing.

**Status.** Owner text, both schemas, the admission ledger, fixtures and a static checker are written and pushed. `scripts/pm_collaboration_events.py` passes with 0 failures and its self-test passes; `pm-plan-index.py validate` passes. Self-grade: every family 9 PASS, 2 PARTIAL (producer, retention), 1 ABSENT (membership, by design before admission). Not done: the blind form-driven review, the Storage retention landing this branch depends on, and the integration steps listed under "Open items".

## What changes

| Surface | Paths | What | Commit |
|---|---|---|---|
| Per-family search | `reports/event-authority-20261104/DC-binding-search.md` | DL-090's documented search, one section per family: literal, token, CamelCase, family-ID and schema-ID searches, partial contracts, scoped negative evidence, what is newly authored; binding-term searches and the definitions reused | `13a4ed5508` |
| Semantic owner | `Plans/Collaborative_Workflows.md` | Section 13 gains `collaboration.failed` and a paragraph citing DL-090 to DL-092 and DL-292; the Collaborative Event Authority Addendum: premise checks, CW-100 shared rules, CW-101 to CW-118 one per family | `54e9183f10` |
| Payload owner | `Plans/Contracts_V0.md`, `Plans/collaboration_event_payloads.schema.json` | CV-460 shared rules, CV-461 to CV-478 one per family; 36 closed definitions (project and application edition per family) | `f4c0f55b02` |
| Storage owner | `Plans/storage-plan.md`, `Plans/collaboration_projection_contracts.schema.json`, `Plans/collaboration_event_admission.json` and `.schema.json` | SP-460 shared mechanisms, SP-461 to SP-478 one per family; checkpoint, seven projection values and the binding record; 18 prepared registry rows with their DL-077 SHA-256 | `a4a140edf3` |
| Oracles | `Plans/Automated_Testing_System.md`, `Plans/collaboration_event_contract_fixtures.json`, `scripts/pm_collaboration_events.py` | ATS-230 shared, ATS-231 to ATS-248 one per family; fixtures; checker with `--self-test` | `b8d010d974` |
| Report | `reports/event-authority-20261104/DC.md`, `DC-selfgrade.json` | this report and the self-grade | last commit |
| Derived | `Plans/_shards/contracts_v0` (67), `storage-plan` (92), `automated_testing_system` (52), `Plans/.plan_index` | regenerated with each Plans edit; `Collaborative_Workflows.md` is not sharded; no other document's shards changed | with each edit |

PlanUnits: 7,421 at the base, 7,497 at the head (76 new: CW-100 to CW-118, CV-460 to CV-478, SP-460 to SP-478, ATS-230 to ATS-248).

Untouched, as required: `Plans/event_family_registry.json`, `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `Plans/Decision_Log.md`, `.gitignore`, the frozen validator `Plans/.audits/event-authority-2026-08-12/independent-validator/**`, `scripts/pm_pnc019_currentness.py`, `Plans/storage_value_registry.json` and every test file.

## Authority, read exactly

- **DL-090** (2026-09-25, option 2): all 17 names of section 13 are registered, each through its own Storage admission landing, and the Collaborative Workflows, Contracts and Storage owners get a bounded technical-binding permission for exactly these names on DL-045's terms. The permission covers "identity and scope joins, versioned checkpoint values and cursors, atomic projection and advancement, replay, currentness, recovery and withdrawal for existing behavior", after a per-family search with partial-contract citations and scoped negative evidence, reuse first, new definitions labelled newly authored. It does not choose features, user-visible integrations, retention or deletion policy, or which owner wins a conflict. It also requires that "the contracts of the events that carry [proposal or finding text] say how that text is protected and deleted", and says registering the events does not register the run, message, proposal and finding records. It does not extend to the Orchestrator owner, so no `Plans/orchestrator-subagent-integration.md` text was written and the OSI block was not used.
- **DL-091**: section 13 gains `collaboration.failed`, registered on DL-090's terms; no event for waiting or blocked; a failed participant is recorded by `collaboration.participant_completed`.
- **DL-092** (superseded in part by DL-292): the recorded events are kept as long as the run's chat exists; policy object `RP-GOAL-THREAD-LIFETIME` subject to the Storage owner's reuse check; records' own lifetimes not set.
- **DL-039, DL-045, DL-046, DL-078**: no bulk registration, no sibling inference, one family per landing; preparing together is not admission (DL-046's wording, applied by analogy as the coordination preparation did).

## Premise checks

| Answer | Premise | Today's text | Result |
|---|---|---|---|
| DL-090 (Decision_Log.md lines 2010-2064 and 9457-9543) | Section 13 names 17 events of one shared runtime; none registered | Section 13 still lists the same 17 names (Collaborative_Workflows.md lines 432-452 at the base); CWR-001 still "one runtime with four protocols"; registry has none of them; CWR-045 and DL-292 add application scope to all four kinds; DL-300 admits other families only | Holds. Application scope is handled by two payload editions per family (CW-100, CV-460) |
| DL-091 (lines 2066-2104) | `failed` is a closed run state with no event; the Crew "disbanded" event is retired | Section 2.1 and section 12 still list `failed`; CWR-029 still makes a limit stop `cancelled`; DL-087 retired `crew.disbanded` | Holds. `collaboration.failed` added to section 13 |
| DL-092 (lines 2106-2149) | Every run belongs to a chat; history kept as long as the chat; chat deletion within 24 hours unless held | Section 2.1 and section 12 (definition carries the thread), CWR-032, CWR-045 (application chats), DL-292's supersession note ("the chat-lifetime/deletion/hold policy is unchanged and conversion cannot erase independently retained custody"), DL-287 (no chat auto-archives) | Lifetime holds and is applied. The policy object is not settled on `main`: the reuse check that materializes `RP-CHAT-THREAD-LIFETIME@1.0.0` and assigns the 18 families is only on `origin/plans/ea-storage-retention-20261104` (storage-plan.md lines 17423-17433 there). Each prepared row names that object, and retention stays PARTIAL until that landing |
| DL-087 (lines 1875-1920), used for compatibility | Six crew lifecycle families retired; Crew recorded only by the shared events | Unchanged; `Plans/Contracts_V0.md` line 3078 still lists `crew.disbanded` (its removal is another branch's) | Holds; CW-100 forbids aliasing or back-filling them |

No premise check failed. One premise is partly unmet on `main` (DL-092's policy object), and it is reported rather than worked around: no retention decision was taken here, and the count rule for a very busy chat and the record lifetimes stay open.

## Newly authored bindings

All are labelled "newly authored owner contract under DL-090" in their units; the search evidence is `DC-binding-search.md` (section "Binding-term searches": zero hits on `main` for each binding term, and per-family sections).

| Identifier | Kind | Unit |
|---|---|---|
| `CollaborationRuntime` and 17 entry points (`admit_run(StartAdmission)`, `record_paused(PauseReached)`, `record_resumed(ResumeAdmitted)`, `record_cancelled(CancelSettled)`, `record_completed(CompletionSettled)`, `record_failed(FailureSettled)`, `admit_attempt(AttemptAdmission)`, `record_outcome(ParticipantOutcome)`, `write_message(MessageWrite)`, `attach_artifact(ArtifactAttached)`, `commit_revision(RevisionCommit)`, `release_proposal(ProposalNormalized)`, `record_vote(VoteCast)`, `record_synthesis(PlanCreated)`, `release_finding(FindingNormalized)`, `record_adjudication(FindingAdjudicated)`, `finalize_review(ReviewArtifactFinalized)`) | Producer component and entry points | CW-100, CW-101 to CW-118 |
| Owner commit, append, first receipt, result order; the prepared event; run and definition fences | Producer ordering and recovery | CW-100, SP-460 |
| `pm.collaboration_event.<token>.v1` and `pm.collaboration_event.<token>.application.v1` (36 definitions) | Payload schemas | CV-460 to CV-478 |
| `storage.collaboration_append.v1@1.0.0` | Append admission | SP-460 |
| `storage.collaboration_projector.v1@1.0.0` | Projector | SP-460 |
| `storage.collaboration_reader.{run_view,completion,participant_activity,composer_destination,review_followon,inspection}.v1@1.0.0` | Readers | SP-460 |
| `projector.checkpoint.collaboration:{scope_partition}`, `pm.storage_value.collaboration_projector_checkpoint.v1@1.0.0` | Checkpoint key and value | SP-460 |
| Seven projection key shapes and values (`collaboration_{definition,run,participant,artifact,proposal,vote,finding}_projection.v1`) in table `collaboration_read_model_projections` | Projection rows | SP-460, each family's SP unit |
| `owner_operation_id` (`collabop_` + SHA-256), `idempotency_key` (`collaboration@1:`; CV-366's `application@1:` form adopted), `event_id` (`evt_collaboration_` + SHA-256) and each family's subject | Identity recipe | SP-460, SP-461 to SP-478 |
| `collaboration_conflict` with 37 `conflict_kind`s, `collaboration_projection_unavailable` | Diagnostics | SP-460 |
| Per-family admission checks and transition rules, projection effects, withdrawal effects | Transitions, consumers, withdrawal | SP-461 to SP-478 |
| `pm.collaboration_event_admission.v1`, ledger `COLLABORATION-DL090-PREP-20261104`, family IDs `event-family-<event_type>` | Admission ledger | SP-460 |
| `pm.collaboration_event_contract_fixtures.v1`; native obligations `COLLAB-START-01` to `COLLAB-APP-01` | Fixtures and oracle IDs | ATS-230 |

Reused by name (each in its owner's role, version and scope): SP-278 and `reader.storage.event_record_index@1.0.0` with DL-076's nine-field durable token; SP-286/CV-339 `storage.first_append_receipt.resolve.v2`; SP-336 commit-group durability; Storage's `scope_partition` and dedupe identity; CV-366's application key form, edition naming and ordered roles; CV-353 rule 6's `non_secret_ref`; Collaborative Workflows section 12's closed enumerations; `RP-PROJECTION-3GEN@1.0.0`; BRS-033. Not reused: SP-320's coordination append, projector and checkpoint and SP-351's `app.coordination_append.v1`, which bind other families.

## Design choices a reviewer should check

1. **Two scope editions per family.** CWR-045 and DL-292 put all four kinds in application chats, so each family has a project edition (`producer_admission` `existing_project_policy`) and an application edition (`requires_owner_adoption`, as DL-300 did for its families), selected by exact scope and schema ID.
2. **No text in events.** Proposal, finding, vote, message, waiver and definition text stay in their records; events carry references, closed codes, counts and hashes. This is how DL-090's "say how that text is protected and deleted" is answered: the event never holds it, and deleting the chat deletes the event; the text's own lifetime is the record's, which DL-092 leaves open.
3. **Owner commit before append, with a prepared event.** The event follows the owner record commit (CV-366's role order), and the commit persists the prepared event so recovery retries only that identity. This is why producer is PARTIAL: the record families are not registered Storage families yet.
4. **`currentness_hash` in every payload**, because section 13 lists currentness among the envelope contents.
5. **`collaboration.created` vs `collaboration.configuration_changed`.** Created is revision 1 of a `collaboration_id`, committed only in a Start admission (MODAL-003..005); every later committed revision is `configuration_changed`, from a mid-run reconfigure or a Start that bumps the revision (section 3).
6. **Proposals and findings are added at normalization**, after the blind phase, which keeps event existence from leaking (CWR-013).
7. **Same-subject duplicates.** Within one recovery epoch the scoped identity makes them an exact retry or `idempotency_conflict`; the `already_*` conflicts refuse them under a later epoch.
8. **`collaboration.completed` requires required slots resolved** (Contracts effect dispositions, PART-016..020). For `cmd.chat_room.end` this means a failed required member must be waived (CWR-024) before the room settles completed; CW does not say End discussion bypasses that, so no owner conflict was found, but a reviewer may read it differently.

## Per family

Each family has: its CW unit (semantics, emission and non-emission, entry point, order, text custody, withdrawal), its CV unit (fields and rules, both editions), its SP unit (subject, ordered checks, projection effects, readers, custody, retention, withdrawal), its ATS unit (its own case list), its prepared registry row and its own fixture cases.

| Family | Units | Entry point | Positive / negative payloads | Join negatives | Sequences (appended / refused steps) | Self-grade |
|---|---|---|---|---|---|---|
| `collaboration.created` | CW-101, CV-461, SP-461, ATS-231 | `admit_run(StartAdmission)` | 4 / 9 | 5 | 15 (15 / 2) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.started` | CW-102, CV-462, SP-462, ATS-232 | `admit_run(StartAdmission)` | 6 / 14 | 15 | 15 (16 / 2) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.paused` | CW-103, CV-463, SP-463, ATS-233 | `record_paused(PauseReached)` | 4 / 10 | 5 | 3 (2 / 3) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.resumed` | CW-104, CV-464, SP-464, ATS-234 | `record_resumed(ResumeAdmitted)` | 4 / 9 | 5 | 1 (1 / 3) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.cancelled` | CW-105, CV-465, SP-465, ATS-235 | `record_cancelled(CancelSettled)` | 3 / 11 | 5 | 4 (4 / 1) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.completed` | CW-106, CV-466, SP-466, ATS-236 | `record_completed(CompletionSettled)` | 4 / 10 | 5 | 7 (6 / 4) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.failed` | CW-107, CV-467, SP-467, ATS-237 | `record_failed(FailureSettled)` | 4 / 10 | 5 | 2 (1 / 3) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.participant_started` | CW-108, CV-468, SP-468, ATS-238 | `admit_attempt(AttemptAdmission)` | 4 / 10 | 5 | 10 (19 / 3) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.participant_completed` | CW-109, CV-469, SP-469, ATS-239 | `record_outcome(ParticipantOutcome)` | 6 / 12 | 5 | 9 (21 / 7) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.message_added` | CW-110, CV-470, SP-470, ATS-240 | `write_message(MessageWrite)` | 6 / 11 | 5 | 6 (6 / 7) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.artifact_added` | CW-111, CV-471, SP-471, ATS-241 | `attach_artifact(ArtifactAttached)` | 4 / 9 | 5 | 3 (3 / 2) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `collaboration.configuration_changed` | CW-112, CV-472, SP-472, ATS-242 | `commit_revision(RevisionCommit)` | 5 / 13 | 5 | 4 (5 / 2) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `brainstorm.proposal_added` | CW-113, CV-473, SP-473, ATS-243 | `release_proposal(ProposalNormalized)` | 3 / 10 | 5 | 2 (2 / 5) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `brainstorm.vote_added` | CW-114, CV-474, SP-474, ATS-244 | `record_vote(VoteCast)` | 3 / 10 | 5 | 1 (2 / 4) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `brainstorm.plan_synthesized` | CW-115, CV-475, SP-475, ATS-245 | `record_synthesis(PlanCreated)` | 4 / 10 | 5 | 1 (1 / 2) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `review.finding_added` | CW-116, CV-476, SP-476, ATS-246 | `release_finding(FindingNormalized)` | 3 / 10 | 5 | 4 (4 / 5) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `review.finding_dispositioned` | CW-117, CV-477, SP-477, ATS-247 | `record_adjudication(FindingAdjudicated)` | 3 / 9 | 5 | 2 (2 / 3) | 9 PASS, 2 PARTIAL, 1 ABSENT |
| `review.artifact_finalized` | CW-118, CV-478, SP-478, ATS-248 | `finalize_review(ReviewArtifactFinalized)` | 4 / 10 | 5 | 2 (2 / 8) | 9 PASS, 2 PARTIAL, 1 ABSENT |

Self-grade file: `reports/event-authority-20261104/DC-selfgrade.json` (step-09 depth row format; every quote located mechanically at the branch head and an exact substring of its line). Each family: PASS on owner_doc, closed_payload_schema, scope_identity, replay_idempotency, redaction_custody, transitions, consumers_checkpoints, compatibility_withdrawal, positive_negative_oracles; PARTIAL on producer (prepared-event custody waits on the record families' registration) and retention (`RP-CHAT-THREAD-LIFETIME@1.0.0` not on `main`); ABSENT on membership (not admitted). consumers_checkpoints carries a stated risk: the Storage value registry rows for the new key shapes are not materialized.

## Ids used

| Block assigned | Used |
|---|---|
| CW-100 to CW-199 | CW-100 to CW-118 |
| SP-460 to SP-499 | SP-460 to SP-478 |
| CV-460 to CV-499 | CV-460 to CV-478 |
| ATS-230 to ATS-249 | ATS-230 to ATS-248 |
| OSI-600 to OSI-649 | none (DL-090's permission does not cover the Orchestrator owner) |

None of these ids exists on `main` or any `origin` branch (checked across `git branch -r` before minting). Note on the CW block: `CW-` is the existing prefix of `Plans/chain-wizard.md` (CW-001 to CW-009), while `Plans/Collaborative_Workflows.md` uses `CWR-`. The assigned block was used as given; no validator rejects it (`pm-plan-index.py validate` passes), but the lead should confirm it or have the 19 units renumbered to `CWR-1xx` before integration.

## Checks

Branch checks ran in the lane worktree at `b8d010d974` (the tip before this report commit, which changes only `reports/`); base checks ran in a detached worktree at `be4766513f` with the same currentness edition (15 files, SHA-256 matched to `/mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness`) and the ignored `tests/agent_packet_restrictions` symlink. Outputs and `exit_codes.txt` are in the evidence folder.

| Check | Base `be4766513f` | Branch | Reading |
|---|---|---|---|
| `python3 scripts/pm_collaboration_events.py` | absent (exit 2) | exit 0, 0 failures | 74/187 payloads, 36/100 events, 54 vectors, 15 sequences (178 steps), 11/15 projection values, 23 native `NOT_RUN`; admission blocker reported: `RP-CHAT-THREAD-LIFETIME@1.0.0` absent |
| `... --self-test` | absent | exit 0 | 9 planted defects, all caught |
| `pm-shard-plans.py --check` (after each regeneration) | | exit 0, `pass` | only the edited documents' shards changed: Contracts 67, storage-plan 92, Automated Testing 52 |
| `pm-plan-index.py validate` | | exit 0, top-level `status` `pass` | 7,497 PlanUnits |
| `pm-plans-verify.py json-syntax` | exit 0 | exit 1, then exit 0 (`pass`) | the first branch run lacked the ignored `tests/agent_packet_restrictions` symlink (`raw_capture_link_missing`); rerun with it |
| `pm-plans-verify.py lint-contractrefs` | exit 1 | exit 1 | identical single failure: `Plans/00-plans-index.md` line 255, an ignored audit input absent from fresh worktrees |
| `pm-plans-verify.py lint-path-refs` | exit 0 | exit 0 | |
| `pm-plans-verify.py validate-new-contracts` | exit 1 | exit 1 | both runs hit the wrapper's 180 s subprocess bound while two suites shared the CPU; the direct `python3 scripts/pm-new-contracts-verify.py` on the branch: exit 0, `pass` |
| `pm-plans-verify.py validate-browser-event-admission` | exit 0 | exit 0 | registry gate unaffected |
| `pm-plans-verify.py validate-projects-refresh-contracts` | exit 0 | exit 1 (180 s bound) | direct `python3 scripts/pm-projects-refresh-contracts.py`: exit 0 on both |
| `pm-runtime-integration-canon-validate.py validate` | exit 1 | exit 1 | 157 failures on each, identical sets |
| `pm-prd-planning-runtime-validate.py` | exit 0 | exit 0 | |
| `pm_coordination_events.py` | exit 1 | exit 1 | identical two failures (coordination application editions and a coordination Storage row) |
| `pm-implementation-readiness.py validate` | exit 1, 50 rows | exit 1, 52 rows | new: `event_authority_currentness_source_drift` for `Plans/Collaborative_Workflows.md` and `Plans/Automated_Testing_System.md`, and one `pnc019_source_hash_stale` row changing value; Contracts and storage-plan already drift on `main`. All governance staleness from editing canon |
| `tests.test_pm_browser_event_admission` | 30 of 38 fail | 30 of 38 fail | identical (D1b's stale `upstream40` fingerprint) |
| `tests.test_pm_assistant_contract_closure` | 3 of 41 fail | 3 of 41 fail | identical |
| `tests.test_pm_coordination_events` | 14 of 50 fail | 14 of 50 fail | identical |
| `tests.test_pm_pnc019_currentness` | 1 of 9 fail | 1 of 9 fail | identical (drift rows) |
| `tests.test_event_authority_holding_bucket` | 2 of 34 fail | 2 of 34 fail | identical |
| `tests.test_pm_testing_session_events` | 2 of 11 fail | 2 of 11 fail | identical |
| `tests.test_pm_github_project_integration` | 15 OK | 15 OK | |
| `tests.test_shared_runtime_storage_contracts` | 3 of 16 fail | 3 of 16 fail | identical |
| `tests.test_pm_emit_only_event_boundaries` | 1 of 13 fail | 1 of 13 fail | identical |

No check fails on the branch for a reason the base does not share, apart from the expected currentness drift. The landing check (`pm-landing-check.py`) was not run: it needs the shared checkout at landing and is the lead's.

## Open items

1. **Retention object (blocks every admission).** `RP-CHAT-THREAD-LIFETIME@1.0.0` and the Case L-3 assignment of the 18 families exist only on `origin/plans/ea-storage-retention-20261104`. The prepared rows already name it; the checker reports its absence as an admission blocker and starts checking its values (indefinite, explicit_delete, 250,000 per thread, roll_successor, hold eligible) once it lands. That landing also has to define the successor's physical form ("technical work for the first admission of a family bound to this policy", its own text).
2. **Record families and the prepared event (producer PARTIAL for all 18).** CW-100 puts the prepared event in the owner record commit. The Project-scope run, message, proposal, finding and disposition records are still shape-only (CW section 12; DL-090: they "still need their own contracts schema and fixture pair before anything can be stored"), and the application editions SP-351 materialized do not carry a prepared event. Until those record families are registered with that custody, producer stays PARTIAL. Defining their storage was outside this lane.
3. **Storage value registry rows (risk on consumers_checkpoints).** SP-460 names the event-record and read-model key shapes but `Plans/storage_value_registry.json` does not materialize them, because that moves the readiness census pins (`scripts/pm-implementation-readiness.py`, `tests/test_pm_onboarding_phases.py`, `tests/test_shared_runtime_storage_contracts.py`, `tests/test_pm_runtime_vocabulary_migration.py`) that the retention landing also moves, and section 2.3.1's keyed-composition rule is written for the coordination rows only. Recommended at integration, after the retention landing, as one Storage change.
4. **CW id prefix.** `CW-` belongs to `Plans/chain-wizard.md` (CW-001 to CW-009); the Collaborative Workflows prefix is `CWR-`. The assigned block was used as given; confirm, or renumber CW-100 to CW-118 to `CWR-1xx` (mechanical: 19 units plus references in CV, SP, ATS, the ledger rows, the schemas' descriptions and the checker's `UNITS`).
5. **`.gitignore` line for a unit test.** `/tests/*` ignores new test files, so no unittest module was added; the checker's `--self-test` stands in. A later `tests/test_pm_collaboration_events.py` needs `!/tests/test_pm_collaboration_events.py` in `.gitignore`, which only Jared can approve.
6. **Closed-world guards.** `scripts/pm-browser-event-admission.py` and the registry tests that pin the family list (`tests/test_pm_testing_session_events.py`, `tests/test_pm_github_project_integration.py`, `tests/test_event_authority_holding_bucket.py`) accept only Browser and coordination ledger rows. The first collaboration admission needs them generalized to this ledger (as the coordination preparation did) and the DL-078 pins moved. Not done here: the test files are not editable under the brief, and the guard change belongs with the admission design.
7. **Decision entry for each admission (D-02).** DL-093 answers it for the seven coordination families only; DL-096 on an unlanded branch is reported (by L8) to cover these admissions. Each admission record needs a `decision_ref` the procedure accepts.
8. **Application editions.** Every application payload version is `requires_owner_adoption`; the Collaborative Workflows owner must adopt the CV-366 application source graph for these families (with the coherent source, read and backup graph DL-292 requires) before any application append.
9. **Commands_System inventory.** `Plans/Commands_System.md` lines 6496-6504 list the 17 names under "sixty-seven semantic event names" and not `collaboration.failed`. Not edited here (another owner's count sentence); the owner should add the name and adjust the count.
10. **PRODUCT (Jared, via the card process).** How long the run, message, proposal, vote, finding and disposition records themselves are kept is not set: DL-092 leaves it open and these contracts take no position. The events never hold or extend that text.
11. **Blind form-driven review** of this branch, then one per admission landing (DL-090), with the rebase onto current `main` (it moved 4 commits after this branch was cut, none in `Plans/`).
12. **Reseal request at the preparation landing.** Newly stale documents: `Plans/Collaborative_Workflows.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Automated_Testing_System.md` (Spec Lock hashes, evidence and shard rows, currentness drift); the five new Plans JSON files and the checker are not in Spec Lock.
13. **Native obligations** `COLLAB-START-01` to `COLLAB-APP-01` stay `NOT_RUN`.

## Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/`: `search/` (both search outputs), `checks/branch-b8d010d974/` and `checks/base-be4766513f/` (each check's output and `exit_codes.txt`), `generator/` (the generator used to write the schemas, fixtures, ledger and owner sections, kept for repairs), and copies of this report and the self-grade. `SHA256SUMS` lists every file.
