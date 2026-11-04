# Lane DC: per-family binding search for the 18 collaborative workflow families (DL-090, DL-091)

Run on 2026-11-04 against a `git archive` export of `origin/main` `be4766513f` (the branch's base), before any owner text was written. Raw results: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/search/search-per-family-be4766513f.json`, SHA-256 `b35de49b9c13d8388474302deb325f972e1e2254abe155b8720f70ac02ad0f2c`.

## Scope and method

- **Scope.** Every `.md`, `.json` and `.jsonl` file under `Plans/` (897 files), excluding `Plans/_shards` (derived copies of the documents searched), `Plans/ledgers` and every dot-directory (`.plan_index`, `.evidence`, `.plan_migration`, `.audits`). `scripts/` and `tests/` are not owner text; a `git archive` of both at the base was searched with one pattern for the 18 names, and no file names any of them, so no checker or test exists for them.
- **Per family**, five line searches: the literal event name; the snake-case token (`collaboration_created`); the CamelCase name with an optional `Event`, `Payload` or `Record` suffix; the registry family ID form (`event-family-collaboration-created`); and an event schema ID prefix (`pm.collaboration.event`, `pm.collaboration_event`, `pm.brainstorm_event`, `pm.review_event`).
- **Per binding**, the binding-term searches below, run once over the same scope; each result applies to every family, because a binding that existed for one family under these terms would have matched.
- **Reading.** The owner documents that the hits point to were read for each family (`Plans/Collaborative_Workflows.md` in full, DL-084 to DL-093 and DL-287 to DL-300, Contracts CV-339, CV-353 and CV-366, Storage SP-278, SP-286, SP-320 and SP-351, EP-129 to EP-131, Tools section 15.9 and Commands_System's candidate inventory).

## Binding-term searches (negative evidence for every family)

| Binding | Pattern | Hits at the base |
|---|---|---|
| append admission or producer component | `collaboration_append|storage\.collaboration|owner\.collaboration\.|CollaborationRuntime` | none |
| projector or reader identity | `collaboration_projector|collaboration projector|collaboration_reader` | none |
| projector checkpoint key or value | `projector\.checkpoint\.collab|collaboration_projector_checkpoint|collaboration_read_model` | none |
| event payload schema file or id | `collaboration_event_payloads|pm\.collaboration_event|pm\.brainstorm_event|pm\.review_event` | none |
| identity recipe | `evt_collaboration|collaboration@1|collabop_` | none |
| retention assignment to the 18 | `RP-CHAT-THREAD-LIFETIME` | none |
| admission ledger | `collaboration_event_admission` | none |

A first, broader search (`search-base-be4766513f.json` in the same folder) also matched the phrase "collaboration runtime": its one hit is CWR-045's prose "use the one collaboration runtime" (`Plans/Collaborative_Workflows.md`), a description, not a component identity. No append admission, projector, reader, checkpoint key or value, payload schema, identity recipe, retention assignment or admission ledger exists for any of the 18 on `main`. The retention assignment exists only on the unlanded branch `origin/plans/ea-storage-retention-20261104` (`Plans/storage-plan.md` lines 17423 to 17433 there), which this lane does not edit.

## Existing definitions reused by name

Each is reused in the role, version and scope its owner defines, never because of a sibling name:
- SP-278's generic EventRecord index checkpoint and `reader.storage.event_record_index@1.0.0`, with DL-076's nine-field durable read token (copied by value from `Plans/coordination_projection_contracts.schema.json#/$defs/durable_read_token`, which projects `Plans/event_record_index_checkpoint.schema.json#/$defs/read_token`).
- SP-286/CV-339's `storage.first_append_receipt.resolve.v2` for first-receipt custody; SP-336's commit-group durability.
- Storage's `scope_partition` rule (`app` or `project~{base64url_no_pad(UTF8(project_id))}`) and the dedupe identity `(scope_partition, event_type, idempotency_key)` (`Plans/storage-plan.md`, EventRecord persistence).
- CV-366's application producer key form `application@1:{hex(server_id)}:{hex(owner_operation_id)}`, its `.application.v1` edition naming and its ordered source-graph roles.
- CV-353 rule 6's `non_secret_ref` form.
- The closed enumerations Collaborative Workflows section 12 owns, from `Plans/collaborative_workflows_contracts.schema.json`.
- `RP-PROJECTION-3GEN@1.0.0`; and `RP-CHAT-THREAD-LIFETIME@1.0.0` once the Storage retention landing records it.
- BRS-033's application backup custody for application scope.

Not reused, with the reason: SP-320's `storage.coordination_append.v1`, `storage.coordination_projector.v1` and `projector.checkpoint.coordination:{project_id}` bind the seven agent coordination families; SP-351's `app.coordination_append.v1` and `storage.coordination_append.application@1.0.0` bind application coordination records (AgentMessage). Their role and scope are not these families', and DL-090 forbids reuse from a sibling name or role.

## 1. `collaboration.created`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 435; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2056, 9467, 9517.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 1: "A `Collaboration` is the durable configuration identity"; section 3: "Committing the modal writes or bumps the `CollaborativeDefinition` revision and returns it with the run start request"; MODAL-001..005: opening and configuring write nothing; "Cancel or close discards the draft and emits no domain event"; CWR-018: the close path "emits no domain event"; section 12: `pm.collaboration.definition.v1` (record shape only).
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.created`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.admit_run(StartAdmission)` (CW-101); payload definitions `pm.collaboration_event.collaboration_created.v1` and `pm.collaboration_event.collaboration_created.application.v1` (CV-461); subject `collaboration_id, definition_revision` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `definition`, its readers and its withdrawal effects (SP-461); its oracle cases (ATS-231).

## 2. `collaboration.started`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 436; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2056, 9467, 9518.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 2.6 and section 10 `cmd.collaboration.start`: idempotent start returns the original run and receipt; MODAL-006..008: a card appears only after one run is durably admitted; MODAL-013..014 and CWR-023: Build With Crew is one transaction; CWR-021: `admission_source` and `crew_auto_revision`; section 7.2 and MODAL-009..010: the Review pack freezes at Start; section 12: `pm.collaboration.run.v1` (record shape only).
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.started`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.admit_run(StartAdmission)` (CW-102); payload definitions `pm.collaboration_event.collaboration_started.v1` and `pm.collaboration_event.collaboration_started.application.v1` (CV-462); subject `collaboration_run_id, lifecycle_seq` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `run`, `participant`, its readers and its withdrawal effects (SP-462); its oracle cases (ATS-232).

## 3. `collaboration.paused`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 437; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2056, 9468, 9519.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 2.6: Pause reaches a safe boundary and preserves state; section 10 `cmd.collaboration.pause`; section 6.3 and CWR-044: Chat Room Pause at the next safe turn boundary; `pause_between_rounds` waits are `waiting`; section 15: manual Stop, Pause and Cancel outrank automatic continuation.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.paused`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.record_paused(PauseReached)` (CW-103); payload definitions `pm.collaboration_event.collaboration_paused.v1` and `pm.collaboration_event.collaboration_paused.application.v1` (CV-463); subject `collaboration_run_id, lifecycle_seq` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `run`, its readers and its withdrawal effects (SP-463); its oracle cases (ATS-233).

## 4. `collaboration.resumed`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 438; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2056, 9468, 9520.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 2.6: Resume continues the same run without duplicating delivered work; section 10 `cmd.collaboration.resume`: fails closed while an owner condition blocks; section 15: a stopped run does not resume on a quota reset; CWR-044: Resume continues the round in progress.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.resumed`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.record_resumed(ResumeAdmitted)` (CW-104); payload definitions `pm.collaboration_event.collaboration_resumed.v1` and `pm.collaboration_event.collaboration_resumed.application.v1` (CV-464); subject `collaboration_run_id, lifecycle_seq` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `run`, its readers and its withdrawal effects (SP-464); its oracle cases (ATS-234).

## 5. `collaboration.cancelled`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 439; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2056, 2100, 9468, 9521, 9556, 9595.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 2.1 and CWR-029: limit stops settle `cancelled` with `stop_reason`; section 2.6: cancellation receipt; section 10 `cmd.collaboration.cancel`; PART-016..020: Cancel fences every attempt and synthesis callback; CWR-019: the face never changes after cancel.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.cancelled`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.record_cancelled(CancelSettled)` (CW-105); payload definitions `pm.collaboration_event.collaboration_cancelled.v1` and `pm.collaboration_event.collaboration_cancelled.application.v1` (CV-465); subject `collaboration_run_id, lifecycle_seq` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `run`, its readers and its withdrawal effects (SP-465); its oracle cases (ATS-235).

## 6. `collaboration.completed`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 440; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2056, 2100, 9469, 9522, 9555, 9594.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** PART-016..020: the completion predicate, required dispositions, outputs and pending decisions; CWR-029: `clean_completion`; section 10 `cmd.chat_room.end` and CWR-024: End discussion settles completed; Plans/Contracts_V0.md effect dispositions: "never the normal completed event while required slots or outputs are unresolved".
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.completed`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.record_completed(CompletionSettled)` (CW-106); payload definitions `pm.collaboration_event.collaboration_completed.v1` and `pm.collaboration_event.collaboration_completed.application.v1` (CV-466); subject `collaboration_run_id, lifecycle_seq` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `run`, its readers and its withdrawal effects (SP-466); its oracle cases (ATS-236).

## 7. `collaboration.failed`

- **Literal name:** `Plans/Decision_Log.md` lines 2100, 9554, 9557, 9569, 9570, 9593, 9599, 9601.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** DL-091: the recorded ending of a run that fails, with its reason; section 2.1: `failed` is a closed run state; section 11: the closed typed error enumeration; CWR-019: the failed face; CWR-029: a limit stop is never failed.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.failed`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers; `collaboration.failed` is not yet in section 13 at the base.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.record_failed(FailureSettled)` (CW-107); payload definitions `pm.collaboration_event.collaboration_failed.v1` and `pm.collaboration_event.collaboration_failed.application.v1` (CV-467); subject `collaboration_run_id, lifecycle_seq` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `run`, its readers and its withdrawal effects (SP-467); its oracle cases (ATS-237).

## 8. `collaboration.participant_started`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 441; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2057, 9469, 9523; `Plans/Tools.md` lines 2429.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 2.2: distinct participant, attempt and session identities; requested and effective stored apart; PART-001..006: retries are new attempts, replacement a new assignment revision; PART-021..024: configuration alone creates no runtime participant; Plans/Tools.md section 15.9: "Tools must not emit a To-Do or collaboration semantic event on the owner's behalf".
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.participant_started`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers, Tools section 15.9's refusal to emit.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.admit_attempt(AttemptAdmission)` (CW-108); payload definitions `pm.collaboration_event.collaboration_participant_started.v1` and `pm.collaboration_event.collaboration_participant_started.application.v1` (CV-468); subject `collaboration_run_id, participant_slot_id, assignment_revision, attempt_id` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `participant`, its readers and its withdrawal effects (SP-468); its oracle cases (ATS-238).

## 9. `collaboration.participant_completed`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 442; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2057, 2100, 9470, 9524, 9561, 9571, 9596; `Plans/Tools.md` lines 2429.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** PART-001..006: one explicit terminal outcome per slot, waivers with actor, reason and currentness; section 15: exactly one terminal result per attempt; replay idempotent on attempt identity; DL-091: a failed participant is recorded by its participant-completed event; Plans/Contracts_V0.md effect dispositions: "Participant disposition | admitted collaboration participant event or owner attempt receipt"; section 12 `pm.collaboration.participant_disposition.v1` (record shape only).
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.participant_completed`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers, Tools section 15.9's refusal to emit.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.record_outcome(ParticipantOutcome)` (CW-109); payload definitions `pm.collaboration_event.collaboration_participant_completed.v1` and `pm.collaboration_event.collaboration_participant_completed.application.v1` (CV-469); subject `collaboration_run_id, participant_slot_id, assignment_revision, attempt_id` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `participant`, its readers and its withdrawal effects (SP-469); its oracle cases (ATS-239).

## 10. `collaboration.message_added`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 443, 456; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2058, 9470, 9525; `Plans/Executor_Protocol.md` lines 8913, 8953.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 2.3: one durable transcript record, a user message written once and referenced twice; section 13: emitted once per written message; Plans/Executor_Protocol.md EP-129, EP-130, EP-131: written once, sequence at write, idempotent on the allocated id, no gap; CWR-013: blind-phase protection at read; section 12 `pm.collaboration.message.v1` (record shape only).
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.message_added`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers, EP-130 and section 13's emit-once sentence.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.write_message(MessageWrite)` (CW-110); payload definitions `pm.collaboration_event.collaboration_message_added.v1` and `pm.collaboration_event.collaboration_message_added.application.v1` (CV-470); subject `collaboration_run_id, collaboration_message_id` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `run`, `participant`, its readers and its withdrawal effects (SP-470); its oracle cases (ATS-240).

## 11. `collaboration.artifact_added`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 444; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2058, 9471, 9526.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 2.4: ordinary artifacts through the artifact owners; deleting a card cannot purge a shared artifact; section 7.6: the Review artifact; section 9.2 and CWR-041: a Wonderer pass is one artifact; section 10 `cmd.chat_room.summarize`.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.artifact_added`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.attach_artifact(ArtifactAttached)` (CW-111); payload definitions `pm.collaboration_event.collaboration_artifact_added.v1` and `pm.collaboration_event.collaboration_artifact_added.application.v1` (CV-471); subject `collaboration_run_id, artifact_version_ref` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `artifact`, `run`, its readers and its withdrawal effects (SP-471); its oracle cases (ATS-241).

## 12. `collaboration.configuration_changed`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 445; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2058, 9471, 9527.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 3: committing writes or bumps the revision; section 10 `cmd.collaboration.reconfigure`: expected-revision check, system transcript entry, no attribution rewrite; CWR-031: change kinds and `accept_stale_target`; CWR-044: `set_pause_between_rounds`; `reconfigure_change` in Plans/collaborative_workflows_contracts.schema.json (command shape only).
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `collaboration.configuration_changed`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.commit_revision(RevisionCommit)` (CW-112); payload definitions `pm.collaboration_event.collaboration_configuration_changed.v1` and `pm.collaboration_event.collaboration_configuration_changed.application.v1` (CV-472); subject `collaboration_id, definition_revision` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `definition`, `run`, its readers and its withdrawal effects (SP-472); its oracle cases (ATS-242).

## 13. `brainstorm.proposal_added`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 446; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2059, 9472, 9528.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 8.5 phases 2 and 3: blind proposals and normalization; section 12 `pm.brainstorm.proposal.v1` (record shape only); CWR-013: no existence metadata leaks in blind phases; section 17: migration never fabricates a proposal; DL-090: proposals carry their own text.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `brainstorm.proposal_added`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.release_proposal(ProposalNormalized)` (CW-113); payload definitions `pm.collaboration_event.brainstorm_proposal_added.v1` and `pm.collaboration_event.brainstorm_proposal_added.application.v1` (CV-473); subject `collaboration_run_id, proposal_id` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `proposal`, its readers and its withdrawal effects (SP-473); its oracle cases (ATS-243).

## 14. `brainstorm.vote_added`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 447; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2059, 9472, 9529.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 8.5 phase 6 and section 8.6: vote fields, hard constraints; PART-011..015, WONV-003..006: the Wonderer never votes; only the current attempt votes; CWR-027: hard constraints by id; section 12 `pm.brainstorm.vote.v1` (record shape only).
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `brainstorm.vote_added`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.record_vote(VoteCast)` (CW-114); payload definitions `pm.collaboration_event.brainstorm_vote_added.v1` and `pm.collaboration_event.brainstorm_vote_added.application.v1` (CV-474); subject `collaboration_run_id, vote_id` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `vote`, `proposal`, its readers and its withdrawal effects (SP-474); its oracle cases (ATS-244).

## 15. `brainstorm.plan_synthesized`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 448; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2059, 9472, 9530.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 8.1: exactly one Deep Plan document; section 8.7 and section 10 `cmd.brainstorm.synthesize_plan`: returns the Plan owner's create result; section 9.2 and CWR-041: synthesis waits and closes lead admission; PART-011..015 and CWR-027: coordinator tie resolution, preserved dissent.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `brainstorm.plan_synthesized`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.record_synthesis(PlanCreated)` (CW-115); payload definitions `pm.collaboration_event.brainstorm_plan_synthesized.v1` and `pm.collaboration_event.brainstorm_plan_synthesized.application.v1` (CV-475); subject `collaboration_run_id` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `run`, its readers and its withdrawal effects (SP-475); its oracle cases (ATS-245).

## 16. `review.finding_added`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 449; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2060, 9473, 9531.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 7.4: blind concurrent initial passes; section 7.5: normalization under `finding_key` keeps every originating reviewer; section 7.2 and section 15: differing target hashes never merge; section 12 `pm.review.finding.v1` (record shape only); DL-090: findings carry their own text.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `review.finding_added`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.release_finding(FindingNormalized)` (CW-116); payload definitions `pm.collaboration_event.review_finding_added.v1` and `pm.collaboration_event.review_finding_added.application.v1` (CV-476); subject `collaboration_run_id, finding_id` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `finding`, its readers and its withdrawal effects (SP-476); its oracle cases (ATS-246).

## 17. `review.finding_dispositioned`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 450; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2060, 9473, 9532.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 7.5: the coordinator's final disposition; severity a separate axis; dissent preserved; PART-007..010: only current completed attempts corroborate; CWR-026: follow-on selection reads confirmed findings.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `review.finding_dispositioned`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.record_adjudication(FindingAdjudicated)` (CW-117); payload definitions `pm.collaboration_event.review_finding_dispositioned.v1` and `pm.collaboration_event.review_finding_dispositioned.application.v1` (CV-477); subject `collaboration_run_id, finding_id` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `finding`, its readers and its withdrawal effects (SP-477); its oracle cases (ATS-247).

## 18. `review.artifact_finalized`

- **Literal name:** `Plans/Collaborative_Workflows.md` lines 451; `Plans/Commands_System.md` lines 6500; `Plans/Decision_Log.md` lines 2060, 9473, 9533.
- **Token, CamelCase, family ID and schema ID forms:** none.
- **Partial contracts found:** section 7.6: one versioned read-only Review artifact; PART-007..010: single-pass results and partial coverage; section 7.2, CWR-026 and CWR-031: `finish_stale` with `accept_stale_target`.
- **Negative evidence.** Within this scope no producer entry point, payload schema, identity recipe, transition rule, consumer, projector, checkpoint, first-receipt adoption, retention assignment on `main` or withdrawal rule names `review.artifact_finalized`; the literal hits are section 13's list, the Commands_System candidate inventory (`requires_central_adjudication`), the Decision Log answers.
- **Newly authored here (labelled so in the owner text):** entry point `CollaborationRuntime.finalize_review(ReviewArtifactFinalized)` (CW-118); payload definitions `pm.collaboration_event.review_artifact_finalized.v1` and `pm.collaboration_event.review_artifact_finalized.application.v1` (CV-478); subject `collaboration_run_id` for SP-460's recipe, its admission checks and conflict kinds, its projection effects on `run`, its readers and its withdrawal effects (SP-478); its oracle cases (ATS-248).

