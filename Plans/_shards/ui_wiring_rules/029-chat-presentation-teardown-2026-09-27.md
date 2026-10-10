# Shard 029: Chat presentation teardown — 2026-09-27

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1782-L1829

Source SHA256: `247c222314e6786e7bd4c7ea141db12a5b42c89181f170a3b79cb9fe840504bd`

---

## Chat presentation teardown — 2026-09-27

### UIW-024 - Chat Presentation Teardown On Thread Switch Reset And Close

```yaml
plan_unit_id: UIW-024
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Extending UIW-020's working activity timer teardown, a chat thread switch, reset or close releases
  every presentation resource the transcript owns for the view: the reply word-release loop, send
  flight layers, the fold height hold, the spine's observers and redraw, the card birth animation,
  and the audio context's pending cues. Releasing them invalidates only the view's callbacks: runs
  and replies continue on the server and are complete when the thread is shown again (ACD-470). Each
  resource is released exactly once and none is duplicated when the view returns.
gui_related: true
gui_classification_reason: "Prevents stale chat presentation work after a thread switch."
split_recommended: false
depends_on: [UIW-020, ACD-470]
unblocks: []
acceptance_criteria:
  - "After a thread switch no word-release loop, flight layer, height hold or spine observer of the old view remains active."
  - "Returning to the thread does not duplicate any of them."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_view_resource
reasoning_tier: high
context_scope: chat_view_lifecycle
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: wiring_rule
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "UIW-020"
negative_constraints:
  - "Do not cancel a run or reply because its view was torn down."
owner_hints:
  - Plans/UI_Wiring_Rules.md
```

ContractRef: ContractName:Plans/UI_Wiring_Rules.md#UIW-020, ContractName:Plans/assistant-chat-design.md#ACD-470
