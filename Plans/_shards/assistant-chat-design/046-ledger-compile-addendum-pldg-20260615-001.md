# Shard 046: Ledger Compile Addendum - pldg-20260615-001

Source: `Plans/assistant-chat-design.md`

Source lines: L21846-L21943

Source SHA256: `e81a1b2254c51808535a1a8c94fda81112f74a0bf6245577b79295469a8f96fc`

---

## Ledger Compile Addendum - pldg-20260615-001

### ACD-415 - Extract Block Semantics Normalization

```yaml
plan_unit_id: ACD-415
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  assistant-chat-design extract-style `Fields:`, `Labels and values:`,
  `Permission rules:`, and `Rules:` lists must be read through their sentence-level
  Core rules, tables, ContractRefs, and fine-grained PlanUnits. Items such as
  `questionnaire`, `single_question`, `chat.plan_todo_updated`,
  `continue_on_error: false`, `blocked_reason_code`, `allowed_action_ids[]`,
  `requested_persona_id`, `projection_trust`, `Copy source`, and
  `Open detached preview` preserve exact source tokens, but each token must keep
  its typed role as a payload field, display label, enum/status value, permission
  state, retired alias, compatibility alias, lifecycle transition, command/action,
  or consumer-boundary note. Chat owns chat modes, activity transparency, question
  cards, TODO/review, operation cards, slash commands, web-family chat behavior,
  persona display, and inline visualizer presentation without taking over Tools,
  Contracts_V0, storage, Models_System, Permissions_System, or FinalGUISpec owner
  schemas.
gui_related: true
gui_classification_reason: This unit governs user-visible chat cards, panels, controls, commands, labels, visual modules, and planning surfaces.
depends_on: []
unblocks: []
acceptance_criteria:
  - Assistant Chat implementers can classify each preserved token by typed role instead of treating every list entry as a schema field.
  - Question-card, TODO, operation-card, web/provenance, persona, Markdown/Mermaid, and inline visualizer behavior remains implementation-ready through Core rules and PlanUnits.
  - Owner boundaries prevent chat prose from replacing Tools, Contracts_V0, storage, provider/model, permission, or FinalGUISpec contracts.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, or production build tasks are created; explicit governance/index/evidence refreshes are recorded in the repair/seal artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260615-001-part-4-fable-cleanup
risk_class: assistant_chat_extract_semantic_loss
reasoning_tier: high
context_scope: assistant_chat_extract_block_cleanup
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: assistant_chat_extract_block_semantics_normalization
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0008
  - pldg-20260615-001-part-4-fable-cleanup:atom-0009
  - pldg-20260615-001-part-4-fable-cleanup:atom-0010
  - pldg-20260615-001-part-4-fable-cleanup:atom-0011
  - pldg-20260615-001-part-4-fable-cleanup:atom-0012
  - local:Plans/assistant-chat-design.md:237
  - local:Plans/assistant-chat-design.md:287
  - local:Plans/assistant-chat-design.md:411
  - local:Plans/assistant-chat-design.md:516
  - local:Plans/assistant-chat-design.md:608
  - local:Plans/assistant-chat-design.md:740
  - local:Plans/assistant-chat-design.md:1265
  - local:Plans/assistant-chat-design.md:1368
  - local:Plans/assistant-chat-design.md:1505
  - local:Plans/assistant-chat-design.md:2368
  - local:Plans/assistant-chat-design.md:2502
preserved_exact_tokens:
  - "Fields:"
  - "Rules:"
  - "Labels and values:"
  - "questionnaire"
  - "single_question"
  - "chat.plan_todo_updated"
  - "continue_on_error: false"
  - "blocked_reason_code"
  - "allowed_action_ids[]"
  - "requested_persona_id"
  - "effective_persona_id"
  - "projection_trust"
  - "Copy source"
  - "Open detached preview"
  - "sendPrompt"
negative_constraints:
  - Do not delete exact tokens or compatibility aliases during cleanup.
  - Do not leave token-only lists as sufficient typed schema where Core rules and owner contracts are needed.
  - Do not move tool, storage, contract, provider/model, permission, or FinalGUISpec ownership into assistant-chat-design.
compatibility_only_notes:
  - Remaining source extract lists marked as compatibility/source-lineage token banks preserve exact terms while typed field, label, action, and rule semantics route through Core rules and owner docs.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
```
