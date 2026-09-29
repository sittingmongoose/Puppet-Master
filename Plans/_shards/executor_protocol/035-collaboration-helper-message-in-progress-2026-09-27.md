# Shard 035: Collaboration helper message in progress (2026-09-27)

Source: `Plans/Executor_Protocol.md`

Source lines: L8759-L8965

Source SHA256: `7a1eafa8989ffd2cab6c9a85bb29f93b001a791de71b6eaa6f0986a301fdf601`

---

## Collaboration helper message in progress (2026-09-27)

A collaboration helper's message streams live in its lane (DL-137). This section fixes what a helper message in progress is beyond the assistant turn presentation stream of EP-128, which it reuses and never redefines: who is writing, in which run and lane, how the streamed text relates to the one finished message, and what happens when the message does not finish. The lane itself is owned by Plans/Collaborative_Workflows.md (CWR-040).

### EP-129 - Collaboration Helper Message In Progress

```yaml
plan_unit_id: EP-129
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  A collaboration participant or coordinator that is writing a message presents it as a message in
  progress with the assistant turn presentation vocabulary of EP-128, which it references and never
  redefines: the coalescer's ordered partial_delta and tool_call_fragment phases (7.2B), subjects
  keyed by tool_use_id with their statuses, and the segment roles narration and answer. Each message
  in progress is bound to exactly one writer and one place: its collaboration_run_id; its
  sender_kind, which is participant or coordinator, because user and system messages never stream;
  its sender_id; for a participant, its participant_slot_id and the attempt_id of the attempt that
  is writing; and the collaboration_message_id allocated when that turn starts streaming. An attempt
  writes at most one message in progress at a time, and each message it writes gets its own
  allocated id. The message in progress is shown only in its writer's own lane and transcript
  (Plans/Collaborative_Workflows.md CWR-040), never under another participant. Only the user sees
  it: no other participant, the coordinator included, receives or reads a message in progress, and
  participants receive the message only once it is written (EP-130). Several writers may stream at
  once, each in its own lane. A coordinator who is not a participant receives its own derived
  activity row from CWR-030, keyed by coordinator_run_ref, so its lane has state, verb and
  live_message_id without borrowing a participant row (DL-138).
gui_related: true
gui_classification_reason: The runtime binding also governs visible coordinator and participant lanes, including their state, verb and message in progress.
split_recommended: false
depends_on: [EP-128]
unblocks: [EP-130, EP-131, CWR-040]
acceptance_criteria:
  - A nonparticipant coordinator stream binds to its own activity row and lane.
  - "Every message in progress names its run, its sender_kind (participant or coordinator), its sender, and, for a participant, its slot and attempt."
  - "Every message in progress carries the collaboration_message_id allocated when its turn starts streaming."
  - "No participant or coordinator receives another writer's message in progress."
  - "The EP-128 phases, subject statuses and segment roles are consumed without redefinition."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: helper_stream_binding_drift
reasoning_tier: high
context_scope: collaboration_helper_stream
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: stream_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md sha256:345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c (DL-138)"
  - "Plans/Decision_Log.md#DL-137"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json sha256:33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5 p14"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-22"
preserved_exact_tokens:
  - "coordinator_run_ref"
  - "message in progress"
  - "collaboration_message_id"
  - "sender_kind"
  - "participant_slot_id"
  - "attempt_id"
negative_constraints:
  - "Do not redefine the EP-128 phases, subject statuses or segment roles."
  - "Do not stream a user or system message."
  - "Do not deliver a message in progress to another participant or the coordinator."
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Collaborative_Workflows.md
```

### EP-130 - One Finished Message Per Helper Message In Progress

```yaml
plan_unit_id: EP-130
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  A helper message in progress becomes durable exactly once. When the writer's turn ends in the
  EP-128 terminal state complete, its final_assistant_turn with the matching receipt (7.2B) is
  written as one CollaborationMessage under the allocated collaboration_message_id. Its sequence is
  assigned at that write, its recipients receive it then and exactly once, and
  collaboration.message_added (Plans/Collaborative_Workflows.md section 13, once that event is
  registered) is emitted once for it and never for a streamed frame. The written text is the text
  that streamed: the settled lane shows the same text as the last streamed frame, and presentation
  pacing never delays, reorders or drops text (ACD-470). Nothing else of a message in progress is
  persisted, emitted, replayed or delivered: no partial_delta, streamed frame or partial text
  becomes a record or a message, because the streamed text is presentation of a message in
  progress, never a second record (DL-137). Writing is idempotent on the allocated id: a replayed
  completion for an id that is already written returns the existing message and writes nothing.
  An allocated id that is never written leaves no record, no transcript gap and no sequence number,
  and it is never reused.
gui_related: false
gui_classification_reason: "Defines when a helper message becomes durable; the lanes present the result."
split_recommended: false
depends_on: [EP-128, EP-129]
unblocks: [CWR-040]
acceptance_criteria:
  - "A completed helper turn writes exactly one CollaborationMessage under its allocated id, with its sequence assigned at that write."
  - "The written text equals the last streamed frame."
  - "No streamed frame or partial text is persisted, emitted or delivered."
  - "A replayed completion writes nothing, and an allocated id that is never written leaves no record and is never reused."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: helper_message_double_write
reasoning_tier: high
context_scope: collaboration_helper_stream
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Collaborative_Workflows.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: stream_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-137"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-22"
preserved_exact_tokens:
  - "final_assistant_turn"
  - "CollaborationMessage"
  - "collaboration.message_added"
  - "last streamed frame"
  - "never a second record"
negative_constraints:
  - "Do not persist, emit or deliver a streamed frame or partial text of a helper message."
  - "Do not write a helper message more than once, or reuse an allocated id."
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Collaborative_Workflows.md
```

### EP-131 - A Helper Message In Progress That Does Not Finish

```yaml
plan_unit_id: EP-131
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  A helper message in progress whose turn does not end complete is never written. This differs on
  purpose from the chat's partial transcript record of EP-128: a collaboration keeps one durable
  record per finished message and no partials. When the writer's attempt is cancelled with its run
  (by the user or at the run's own limit), fails, times out, loses a permission, or is superseded by
  a retry or a replacement (Plans/Collaborative_Workflows.md PART-001..006), the unfinished text
  leaves the writer's lane, no CollaborationMessage and no partial record is written, and the lane
  shows the participant's outcome and its last complete quote, if it has one (CWR-030). The
  attempt's outcome, failure evidence and Usage are recorded as before; the discarded text is not
  evidence and is never quoted. A retry streams under a new allocated id. A helper message is never
  steered mid-message: a message the user sends into a running round lets the writer who is talking
  finish (CWR-024), so steered is never an outcome of a helper message in progress. Pause reaches a
  safe boundary (Plans/Collaborative_Workflows.md section 2.6), so a message in progress finishes
  and is written before the run pauses. A writer whose tool call waits on an approval keeps the
  text streamed so far while its lane shows needs_you, and continues after the decision. An
  abstention that is written as a vote message lands once like any other message, and a
  participant that abstains by default writes nothing and shows no message in progress for that
  vote (PART-011..015). After a restart no message in progress is restored: the executing owner
  reports the attempt's terminal result (Plans/Collaborative_Workflows.md section 15), and its
  message lands once if the turn completed and not at all otherwise. A provider tier that does not
  report streaming events (PROVIDER-004, PROVIDER-005) shows each helper message whole when it is
  written, never pseudo-streams it and invents no text.
gui_related: false
gui_classification_reason: "Defines the runtime outcomes of an unfinished helper message; the lanes present them."
split_recommended: false
depends_on: [EP-128, EP-129, EP-130]
unblocks: [CWR-040]
acceptance_criteria:
  - "A cancelled, failed, timed-out, denied or superseded attempt writes no message and no partial record for its message in progress."
  - "A retry streams under a new allocated id."
  - "Pause lets a message in progress finish and be written before the run pauses."
  - "After a restart no message in progress is shown, and its message appears once or not at all."
  - "A tier without streaming events shows the message whole and never pseudo-streams it."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: helper_partial_persisted_or_quoted
reasoning_tier: high
context_scope: collaboration_helper_stream
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: stream_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-137"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-22"
preserved_exact_tokens:
  - "never written"
  - "partial transcript record"
  - "needs_you"
  - "pseudo-streams"
negative_constraints:
  - "Do not write a partial record for a helper message that did not finish."
  - "Do not quote or keep as evidence the discarded text of an unfinished helper message."
  - "Do not restore a message in progress after a restart."
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-128, ContractName:Plans/Collaborative_Workflows.md#CWR-040, ContractName:Plans/Decision_Log.md#DL-137
