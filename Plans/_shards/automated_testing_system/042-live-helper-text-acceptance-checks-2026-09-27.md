# Shard 042: Live helper text acceptance checks — 2026-09-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L5559-L5625

Source SHA256: `14c48908f1df9c8a95c6beb438dc36ef8cb16c6208b697c422e5c7a09ab3a988`

---

## Live helper text acceptance checks — 2026-09-27

### ATS-063 - Live Helper Text Acceptance Checks

```yaml
plan_unit_id: ATS-063
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The collaboration acceptance suite covers live helper text (Plans/Collaborative_Workflows.md
  CWR-040, Plans/Executor_Protocol.md EP-129..EP-131, DL-137) by reading painted pixels, stored
  records and what each participant received, never dispatch counts. It checks that a helper's lane
  text grows word by word while its message is in progress and its word count only grows; that three
  helpers streaming at once each stay in their own lane; that a lane's verb changes at most about
  once every 1.2 seconds while words stream; that while a message is in progress no
  CollaborationMessage, partial record or collaboration event exists for it and no other participant
  or the coordinator has received it; that when the turn completes exactly one CollaborationMessage
  exists under the allocated id, its text equals the last streamed frame, and each recipient
  received it once; that a replayed completion writes nothing; that a cancelled, failed or
  timed-out attempt, an attempt that loses a permission, and an attempt superseded by a retry or a
  replacement each write no message, its unfinished text leaves the lane, the lane shows the
  participant's outcome and its last complete quote, and a retry streams under a new id; that a
  writer whose tool call waits on an approval keeps the text streamed so far and shows needs_you;
  that an abstention written as a vote lands once and a default abstention writes nothing; that
  lanes folded into the +N more row stream nothing on the card; that Pause lets a message in progress finish
  and be written first; that after a restart in the middle of a message no text in progress is shown
  and the message appears once or not at all; and that a provider tier without streaming events
  shows the message whole, with no pseudo-streaming.
gui_related: true
gui_classification_reason: "Defines the tests that gate the live text in collaboration lanes."
split_recommended: false
depends_on: [CWR-040, EP-129, EP-130, EP-131, ATS-061]
unblocks: []
acceptance_criteria:
  - "Each listed behaviour has at least one automated check that reads pixels, stored records or received inputs."
  - "No check counts dispatches in place of painted or stored state."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: live_helper_text_regression
reasoning_tier: high
context_scope: collaboration_presentation_tests
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/Collaborative_Workflows.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: test_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-137"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 B-CW-22"
preserved_exact_tokens:
  - "word by word"
  - "1.2 seconds"
  - "last streamed frame"
  - "pseudo-streaming"
negative_constraints:
  - "Do not assert dispatch counts in place of painted or stored state."
  - "Do not treat a streamed frame as a written message in any check."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md#CWR-040, ContractName:Plans/Executor_Protocol.md#EP-130, ContractName:Plans/Automated_Testing_System.md#ATS-061
