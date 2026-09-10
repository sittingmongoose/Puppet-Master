# Shard 049: Compaction completion envelope consumer (DL-039 and DL-040)

Source: `Plans/Contracts_V0.md`

Source lines: L21475-L21516

Source SHA256: `422ffbf1781a7698fb63a8c0fd7b71ac4744fc6739756586f8658b2a40b7e156`

---

## Compaction completion envelope consumer (DL-039 and DL-040)

`context.compaction.completed` uses the existing closed `EventRecord` envelope `pm.event.v0@2.0.0`; ACD-461 owns the event meaning and closed payload, SP-259 owns persistence/registry/retention, and SIR-038 owns its exact shared replay binding. This family is project-only, requires payload/envelope project and thread equality, uses `dedupe_by_idempotency_key`, and has inline payload with `payload_ref=null`. It is a commit marker and bounded content-free audit receipt projection, not a second transcript or detailed CompactionReceipt schema. No started/failed family, legacy alias or new envelope field is introduced. SP-259 supplies the exact ID derivations and producer semantic-digest inputs remain the existing EventRecord rule.

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-461, ContractName:Plans/storage-plan.md#SP-259, ContractName:Plans/Shared_Integration_Runtime.md#SIR-038, SchemaID:pm.event.v0, SchemaID:pm.context_compaction_completed.schema.v1
### CV-329 - Compaction Completion Envelope Consumer

```yaml
plan_unit_id: CV-329
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Compaction completion consumes the existing EventRecord v2 envelope and its scoped idempotency contract; Assistant Chat and Storage retain event payload, binding, retention and admission authority.
gui_related: false
gui_classification_reason: This unit defines persisted-event contracts and owner boundaries.
depends_on: []
unblocks: []
acceptance_criteria:
  - "No new envelope fields, started/failed family, alias, or transcript payload are introduced."
  - "Payload/envelope identity equality and inline-only payload are checked before append."
validation_surfaces:
  - Plans/context_compaction_completion_contract_fixtures.json
  - reports/event-authority-20260911/step-06-contract-validation.md
risk_class: compaction_completion_authority
reasoning_tier: high
context_scope: compaction_completion_event_authority
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/Decision_Log.md#DL-039
  - Plans/Decision_Log.md#DL-040
negative_constraints:
  - No runtime, buildability, independent-validator clearance, governance seal, WorkNodes, or NodeSeeds follows from this contract.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Shared_Integration_Runtime.md
```
