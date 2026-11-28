# Shard 125: CV-2301 — `approval.chat_tool_requested` producer, identity and replay (newly authored, DL-411)

Source: `Plans/Contracts_V0.md`

Source lines: L57486-L57553

Source SHA256: `621171da165c9602332236e4074ff39f307bcf230c732031310e7a1d0c7bc4f4`

---

## CV-2301 — `approval.chat_tool_requested` producer, identity and replay (newly authored, DL-411)

```yaml
plan_unit_id: CV-2301
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Exactly approval.chat_tool_requested@1.0.0, registered by DL-300 with application and project editions
  of pm.chat_tool_approval_request.v1, takes its producer, ordering, identity, replay and withdrawal from this unit
  and its storage custody from SP-2301 (source record SP-353 or SP-2303). Payload schema and registry row are
  unchanged; the native producer must adopt this contract first (requires_owner_adoption).
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; the approval host owns presentation.
depends_on:
- PS-145
- HITL-038
- SP-353
- CV-317
- CV-339
- CV-366
- DL-300
- DL-411
unblocks: []
acceptance_criteria:
- Only the shared approval host opens the request, after the pending source record commits, with the exact joins below.
- Identity, replay and withdrawal follow the recipes below for both editions.
- ATS-2301's checker passes every positive and refuses every single-defect negative at its own guard row.
validation_surfaces:
- python3 scripts/pm-s2-dl300-event-contracts.py
- python3 scripts/pm-plan-index.py validate
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s2
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411) and DL-300; exact answers and deck SHA-256 in Plans/Decision_Log.md
- reports/event-authority-20261114/s2-dl300-search-evidence.json
preserved_exact_tokens:
- approval.chat_tool_requested
- pm.chat_tool_approval_request.v1
- ApprovalHost::open_chat_tool_request
- s2dl300@1:{hex(owner_operation_id)}
negative_constraints:
- No registry change, admission, new approval engine, feature, retention or deletion rule.
- Never an Orchestrator node approval event, approval.requested, node.blocked or node.unblocked.
owner_hints:
- Plans/Contracts_V0.md
```

**Producer.** The producer is the shared approval host (HITL-038), `ApprovalHost::open_chat_tool_request`, calling `storage.s2.approval_chat_tool_requested.append.v1@1.0.0` when a typed PS-145 tool ask needs an actual human decision. An action that task-scoped mode authority or a previously approved build grant covers opens no request (HITL-038: truthful provenance, no duplicate human prompt). This family is distinct from the Orchestrator node approval and from DT's `approval.requested` (SP-580).

**Ordering.** Admission first, exactly as CV-2300 lists it, for the selected edition (application or project). The host then commits the canonical approval record with `decision` `pending` and null `resolution_ref` (application: `chat_tool_approval_application`, SP-353; project: `chat_tool_approval_project`, SP-2303) together with the prepared SP-2301 journal in one body transaction; SP-286 and CV-339 append and return the first receipt; the journal advances prepared, appended, settled by CAS. The host presents the ask only after `settled`.

**Payload joins.** `approval_id` is the record `request_id`; `run_id`, `tool_id` and `target_sha256` are the record's; `normalized_target_ref` is the record `target_ref`. `context.scope` is exactly the record scope, and its `scope_kind` and `project_id` are the event's. `context.thread_id` is the record thread; `context.storage_instance_id` is the Storage instance that holds the record; `context.scope_stop_epoch` and `context.task_stop_epoch` are the record's; `context.permission_evidence.source_ref` names the record `permission_snapshot_ref`; `request_evidence.source_ref` names the record `request_source_ref`; `context.actor_ref` is the requesting actor and equals the envelope actor. `expires_at_utc` (CV-1101, event_record profile) is after the accepted request time.

**Identity.** The host allocates one lifetime-unique immutable effect id from the accepted request, with the declared component `approval.chat_tool_requested` and the exact `request_id` included before issuance; that is `owner_operation_id`. The application idempotency key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}`; the Project key is `s2dl300@1:{hex(owner_operation_id)}`; `event_id` is `s2dl300@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`; the partition is `app` or Storage's `project~{base64url_no_pad(UTF8(project_id))}`. The envelope `thread_id` and `run_id` are the record's, `project_id` follows the scope, and the actor is the requesting actor. The registry row's legacy identity pointer `/payload/scope/project_id` does not resolve in this payload; Case L-5 uses such pointers only to normalize EventEnvelopeV1, so this family's identity comes from the envelope and `context.scope`. The row is left unchanged. Redaction, replay policy and migration are as CV-2300.

**Replay.** As CV-2300: the same scoped identity and producer digest returns the original receipt with no effect, a different digest is `identity_conflict`, a missing dedupe owner is `dedupe_unavailable`, and no retry opens a second ask or reprompts a person.

**Compatibility and withdrawal.** 1.0.0 is the only edition in each scope, with no fallback between scope editions (`exact_scope_and_schema_id_no_fallback`), no alias and no extension. Withdrawal is as CV-2300; a withdrawn writer leaves pending asks to resolve through CV-2302.

ContractRef: ContractName:Plans/Permissions_System.md#PS-145, ContractName:Plans/human-in-the-loop.md#HITL-038, ContractName:Plans/storage-plan.md#SP-2301, ContractName:Plans/storage-plan.md#SP-2303
