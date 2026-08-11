# Shard 019: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/UI_Command_Catalog.md`

Source lines: L8138-L8206

Source SHA256: `675341194e15f562897bd18f552ac6582a1198cc4095730f8d4ab219e0c87b88`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds Usage route/open commands to object-first UsageRecord identity. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### UCC-109 - Usage Route Payload And Legacy Chat Usage Alias Contract

```yaml
plan_unit_id: UCC-109
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Usage navigation commands normalize to object-first route/open identity. `cmd.nav.open_usage_subject`, `cmd.artifacts.show_in_usage`, and `cmd.artifacts.show_in_ledger` carry route_target and OpenSubject plus usage_event_ref, usage_record_id, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, artifact_id, run_id, thread_id, source_class, source_confidence, source_authority, settlement_status, projection_freshness, and projection_health where available. When usage_event_ref is present, route_target.object_kind is `usage_event` and route_target.object_id is the canonical usage event id. The retired `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, and `cmd.chat.close_thread_usage` tokens are compatibility aliases only; production wiring must not register them as canonical UICommand rows, and legacy callers normalize to `cmd.nav.open_usage_subject` or the thread Context Detail Pane command family before dispatch.
gui_related: true
gui_classification_reason: Usage route/open commands determine user-visible navigation from chat, artifacts, ledger, and command palette surfaces.
depends_on: [UCC-060, UCC-086, ACD-434, F3-418, UF-087, RAP-043, CV-316]
unblocks: [WM-043]
acceptance_criteria:
  - "`cmd.nav.open_usage_subject` and artifact Usage/Ledger commands preserve usage_event_ref, usage_record_id, provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, raw_payload_ref, artifact_id, run_id, thread_id, source_class, source_confidence, source_authority, settlement_status, projection_freshness, and projection_health when present."
  - Payload validation fails when a Usage route with usage_event_ref does not normalize to route_target.object_kind = usage_event and a stable object_id.
  - Legacy callers citing `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, or `cmd.chat.close_thread_usage` normalize before dispatch and never emit those IDs as canonical production command_id values.
  - "`cmd.chat.open_thread_context_details`, `cmd.chat.focus_thread_context_details`, and `cmd.chat.close_thread_context_details` remain the thread Context Detail Pane commands; they are not aliases for app-wide Usage."
  - Timestamp, run-only, thread-only, or tier-only payloads may narrow filters but cannot satisfy the primary Usage route identity when usage_event_ref is available.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - future UI command payload fixture suite
risk_class: usage_command_route_identity_drift
reasoning_tier: high
context_scope: usage_route_command_contract
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: usage_route_payload_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/UI_Command_Catalog.md:786-801"
  - "Plans/UI_Command_Catalog.md:1119-1123"
  - "Plans/UI_Command_Catalog.md:8088-8116"
  - "Plans/Runtime_Artifacts_Panel.md:281-316"
  - "Plans/runtime_artifact_cost_usage.schema.json:510"
  - "Plans/runtime_artifact_tool_llm_trace.schema.json:122-225"
  - "Plans/Wiring_Matrix.production.json:2674"
  - "Plans/Wiring_Matrix.production.json:3664"
  - "Plans/Wiring_Matrix.production.json:4819"
preserved_exact_tokens:
  - cmd.nav.open_usage_subject
  - cmd.artifacts.show_in_usage
  - cmd.artifacts.show_in_ledger
  - cmd.chat.open_thread_usage
  - cmd.chat.focus_thread_usage
  - cmd.chat.close_thread_usage
  - route_target.object_kind
  - usage_event
  - OpenSubject
  - raw_payload_ref
negative_constraints:
  - Do not register retired chat usage IDs as canonical production UICommands.
  - Do not route Usage by timestamp, run-only, thread-only, or tier-only filters when usage_event_ref is available.
  - Do not drop provider_attempt_ref, attempt_id, node_id, tool_call_id, trace_ref, receipt refs, or raw_payload_ref during artifact/usage drill-through.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
```
