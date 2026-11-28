# Shard 157: SP-2303 — Project chat-tool approval source record (newly authored, DL-411)

Source: `Plans/storage-plan.md`

Source lines: L78775-L78829

Source SHA256: `011a9501490dde39a1b11d82bf67e792cc604044560056d51b58776a6c9b8ca9`

---

## SP-2303 — Project chat-tool approval source record (newly authored, DL-411)

```yaml
plan_unit_id: SP-2303
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The Project counterpart of SP-353's chat_tool_approval_application record, so the Project editions of
  approval.chat_tool_requested and approval.chat_tool_resolved have a canonical source. Same fields, decisions,
  single writer, codec rules and RP-AUTHORITY-INDEFINITE protection, with scope_kind project and a Project key.
  The application record, its key and its resources are unchanged.
gui_related: false
gui_classification_reason: Defines data, identity, custody, version or source contracts; no presentation ownership.
depends_on:
- SP-353
- PS-145
- HITL-038
- CV-2301
- CV-2302
- DL-411
unblocks: []
acceptance_criteria:
- One record per Project chat-tool request, written only by the shared approval host, pending then exactly one terminal decision.
- The Project edition events join this record exactly as the application editions join chat_tool_approval_application.
validation_surfaces:
- python3 scripts/pm-s2-dl300-event-contracts.py
- python3 scripts/pm-plan-index.py validate
risk_class: scope_authority_and_custody_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s2
implementation_surfaces:
- Plans/storage-plan.md
- Plans/storage_value_registry.json
- Plans/event_payloads/s2/chat_tool_approval_project.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); reports/event-authority-20261114/s2-dl300-search-evidence.json
preserved_exact_tokens:
- chat_tool_approval_project
- pm.storage_value.chat_tool_approval.project.v1
- pm.approval.chat_tool.project.v1
negative_constraints:
- Never null-fills an Orchestrator node or blocked_sequence record; never reuses the application key.
- No new approval engine, feature, retention or deletion rule.
owner_hints:
- Plans/storage-plan.md
```

The search for the Project editions found no Project source record: SP-353 binds only `chat_tool_approval_application`, while HITL-038 and the wiring route Project chat-tool decisions to `approval.chat_tool_resolved` and the registry admits a project payload version of both families. This newly authored record fills that technical part and reuses the application record's definition with only the scope changed. Family `chat_tool_approval_project` uses `chat_tool_approval.project.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(thread_id)}:{hex(request_id)}` and `pm.storage_value.chat_tool_approval.project.v1` 1.0.0, a closed wrapper of `storage_instance_id`, `project_id`, `scope` (WorkflowScopeV2, `scope_kind` project) and `record` (`Plans/event_payloads/s2/chat_tool_approval_project.schema.json#/$defs/ChatToolApprovalProjectV1`: the fields of ChatToolApprovalApplicationV1 with `schema_id` `pm.approval.chat_tool.project.v1`). The shared approval host is its single writer; the record is created `pending` with null `resolution_ref` and moves once, by exact CAS, to `approved`, `declined`, `expired` or `cancelled` with its `resolution_ref`. It uses the Project physical codec and the 16 KiB cap with SP-337 references, `RP-AUTHORITY-INDEFINITE` with independent source, Stop, recovery, backup and legal holds, and Project Backup; restore keeps it as historical evidence until a fresh current admission and never revives a resolved ask. Missing dedupe, custody, integrity or recovery failures stay zero-effect unavailable.

ContractRef: ContractName:Plans/storage-plan.md#SP-353, ContractName:Plans/Contracts_V0.md#CV-2301, ContractName:Plans/Contracts_V0.md#CV-2302
