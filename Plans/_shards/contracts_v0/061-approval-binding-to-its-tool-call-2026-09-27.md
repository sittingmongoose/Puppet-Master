# Shard 061: Approval binding to its tool call — 2026-09-27

Source: `Plans/Contracts_V0.md`

Source lines: L23490-L23537

Source SHA256: `ad950c7324da0d72952a48627bbafe6ba37541c473ebc6fd9a74c8feb05d99f7`

---

## Approval binding to its tool call — 2026-09-27

### CV-355 - Approval Requested Carries Its Tool Use Id

```yaml
plan_unit_id: CV-355
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  approval.requested carries an optional tool_use_id naming the tool call that waits for the
  decision, so a presenter can bind the wait to its subject (EP-128); it is present whenever the
  waiting action is a tool call and absent otherwise. approval.granted, approval.denied and
  approval.timeout echo the same tool_use_id when the request carried one. No other field of these
  events changes.
gui_related: false
gui_classification_reason: "A data-contract field used by the chat's waiting subject."
split_recommended: false
depends_on: []
unblocks: [EP-128]
acceptance_criteria:
  - "approval.requested includes tool_use_id whenever the waiting action is a tool call."
  - "The resolving approval events echo it."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: event_payload_gap
reasoning_tier: standard
context_scope: approval_events
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: event_payload_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-105"
preserved_exact_tokens:
  - "approval.requested"
  - "tool_use_id"
negative_constraints:
  - "Do not require tool_use_id for approvals that are not tool calls."
owner_hints:
  - Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-128
