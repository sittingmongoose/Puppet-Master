# Shard 034: Assistant turn presentation stream (2026-09-27)

Source: `Plans/Executor_Protocol.md`

Source lines: L8683-L8757

Source SHA256: `7a1eafa8989ffd2cab6c9a85bb29f93b001a791de71b6eaa6f0986a301fdf601`

---

## Assistant turn presentation stream (2026-09-27)

The chat presents a live assistant turn from the stream coalescer's ordered phases (7.2B) and the turn's tool-call records. This section fixes the presentation vocabulary once; the chat (ACD-470, ACD-473) and other presenters such as collaboration runs reference it.

### EP-128 - Assistant Turn Presentation Stream

```yaml
plan_unit_id: EP-128
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  A live assistant turn is presented from the coalescer's ordered partial_delta and
  tool_call_fragment phases, the tool_use and tool_result records paired by tool_use_id (INV-001),
  the approval events, and the final_assistant_turn. Segment roles are derived by the presenter, not
  supplied by providers: a text segment followed by a tool call in the same turn is narration; a
  text segment that grows past about 160 characters, or that the turn ends with, is the answer.
  Subjects are keyed by tool_use_id and carry a status of running, completed, failed (tool_result ok
  false or tool.denied) or waiting (an approval.requested bound to that tool_use_id, CV-355);
  several may be running at once when a provider makes parallel tool calls. A turn's reply ends in
  exactly one terminal state: complete, stopped, steered or error. A stopped, steered or errored
  partial reply is persisted as a partial transcript record for display only and, as 7.2B requires,
  is never replayed as a complete assistant turn. Narration is a durable user-facing progress
  summary attributed to its turn. A provider tier that does not report streaming events, tool
  boundaries or internal visibility (PROVIDER-004, PROVIDER-005) degrades to showing only what it
  reported: its reply appears whole and no subject or narration is invented.
gui_related: false
gui_classification_reason: "Defines the stream vocabulary the chat's live turn presentation consumes."
split_recommended: false
depends_on: [CV-355]
unblocks: [ACD-470, ACD-473, DR-043]
acceptance_criteria:
  - "Segment roles narration and answer are derived by the presenter from phase order."
  - "Subjects are keyed by tool_use_id with statuses running, completed, failed and waiting."
  - "Terminal states are complete, stopped, steered and error; partial replies are never replayed as complete turns."
  - "Degraded tiers invent no subjects or narration."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: stream_vocabulary_drift
reasoning_tier: high
context_scope: assistant_turn_stream
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: stream_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-105"
  - "Plans/Decision_Log.md#DL-106"
preserved_exact_tokens:
  - "narration"
  - "answer"
  - "tool_use_id"
  - "running"
  - "completed"
  - "failed"
  - "waiting"
  - "complete"
  - "stopped"
  - "steered"
  - "error"
negative_constraints:
  - "Do not require providers to label narration."
  - "Do not replay a partial reply as a complete turn."
  - "Do not invent subjects or narration for a provider tier without that visibility."
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-355, ContractName:Plans/assistant-chat-design.md#ACD-470
