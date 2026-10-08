# Shard 077: Chat Tweaks Addendum (2026-10-08)

Source: `Plans/assistant-chat-design.md`

Source lines: L27042-L27106

Source SHA256: `284326628056f4106d8107cd25d46608b0264d0d974da3feefaddb8ef84f1728`

---

## Chat Tweaks Addendum (2026-10-08)

This addendum carries DL-147's subagent decision into this owner. What opening a subagent does is ACD-485's; how the live transcript looks is FinalGUISpec F3-593's. The 5.6 Pro concept is source lineage only, and its lab tools stay excluded by ACD-474.

### ACD-485 - A Subagent Opens As A Read-Only Live Child Transcript

```yaml
plan_unit_id: ACD-485
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Opening a subagent (its Activity Detail row or that row's Open live transcript, a Subagents preview row, a
  working-activity satellite, or a row of the live agents card) opens that child run's history, the direct child
  history navigation of section 14.1, as one editor document per child run beside the chat through the ACD-480
  document mechanism: an open document is focused, never duplicated, and at narrow widths it follows the Plan tab's
  rules (DL-147). The document is read-only for the user: it has no composer and no control that acts on the child or
  on the parent thread, and while the child runs it follows new items live. Its items are projections of the child
  run's persisted records, and its status is section 14's child-run status projection, never a second lifecycle. Its
  messages, events and needs-you items render as the main chat renders them (ACD-469), and between messages each
  stretch of the child's work records (tool calls, file changes, tests) is one collapsed row that states what the
  stretch did and opens in place to list those records (decision card 7). The inline subagent card keeps section 14's
  expanded panel (work stream, thought stream, state, context and result).
gui_related: true
gui_classification_reason: Defines what opening a subagent does in the assistant chat.
split_recommended: false
depends_on: [DL-147, ACD-480, ACD-469, ACD-473]
unblocks: [F3-593]
acceptance_criteria:
  - "Opening a subagent twice focuses one document and never duplicates it."
  - "The document has no composer and no control that changes the child or the parent thread."
  - "Its status words come from the child-run status projection, and each stretch of work records is one collapsed row until opened."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_transcript_authority_drift
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-147"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "read-only"
  - "direct child history navigation"
  - "collapsed row"
negative_constraints:
  - "Do not give the subagent document a composer or a mutation control."
  - "Do not invent a subagent-only status in the document."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-147, ContractName:Plans/assistant-chat-design.md#ACD-480, ContractName:Plans/FinalGUISpec.md#F3-593
