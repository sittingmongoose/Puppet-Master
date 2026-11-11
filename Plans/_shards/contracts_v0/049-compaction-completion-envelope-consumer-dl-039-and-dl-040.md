# Shard 049: Compaction completion envelope consumer (DL-039 and DL-040)

Source: `Plans/Contracts_V0.md`

Source lines: L21732-L21775

Source SHA256: `b0faccd7f43f31183ee9b4191d56d84e1ddf7c541015b7156926cd416e080b92`

---

## Compaction completion envelope consumer (DL-039 and DL-040)

`context.compaction.completed` uses the existing closed `EventRecord` envelope `pm.event.v0@2.0.0`; ACD-461 owns the event meaning and closed payload, SP-259 owns persistence/registry/retention, and SIR-038 owns its exact shared replay binding. The original payload edition remains Project-only with exact payload/envelope Project/thread equality. CV-366/SP-349 retain a separately specified app payload/source candidate with null Project and actual Server/thread equality; it is not an admitted EventRecord edition. The registry remains `project_only`, DL-300 grants no app compaction edition, and app emission stays `missing_event_registration`/non-emitting until separate Event Authority admission and complete owner adoption. App owner operation/result receipts cannot enter the Project event checkpoint. The admitted Project event uses `dedupe_by_idempotency_key` and inline `payload_ref=null`; no historical byte or digest is reinterpreted. It is a commit marker and bounded content-free audit receipt projection, not a second transcript or detailed CompactionReceipt schema. No started/failed family, legacy alias or new envelope field is introduced. SP-259 supplies the exact ID derivations and producer semantic-digest inputs remain the existing EventRecord rule.

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-461, ContractName:Plans/storage-plan.md#SP-259, ContractName:Plans/Shared_Integration_Runtime.md#SIR-038, SchemaID:pm.event.v0, SchemaID:pm.context_compaction_completed.schema.v1
### CV-329 - Compaction Completion Envelope Consumer

```yaml
plan_unit_id: CV-329
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Project compaction completion consumes the existing EventRecord v2 envelope and its scoped idempotency contract; Assistant Chat and Storage retain event payload, binding, retention and admission authority. context.compaction.completed remains project_only in the registry and DL-300 grants no app edition. CV-366/SP-349 retain a separately specified application payload/source candidate, not an admitted event sibling. App operation/result receipts keep null project_id and actual thread/Server/Host/root identities without entering this Project event append/replay/checkpoint. App event emission remains missing_event_registration/non-emitting until separate Event Authority admission and complete payload/source/append/read/retention adoption; missing durable owner receipt/source custody is unavailable. Original Project resources and historical policy/receipts stay exact. This adds no app PRD/PlanningRun/WorkNode or Project-native SCM authority, no global nullable rewrite and no ambient cross-Project merge. This unit, not CV-334, remains the compaction envelope consumer.
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
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-work-packages;
  /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md; C-F01,C-F05,C-F06,C-F10,B-F06,D-F06
negative_constraints:
  - No runtime, buildability, independent-validator clearance, governance seal, WorkNodes, or NodeSeeds follows from this contract.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
  - Plans/Shared_Integration_Runtime.md
```
