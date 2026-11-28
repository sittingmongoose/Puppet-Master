# Shard 126: CV-2302 — `approval.chat_tool_resolved` producer, pairing, identity and replay (newly authored, DL-411)

Source: `Plans/Contracts_V0.md`

Source lines: L57553-L57620

Source SHA256: `db4fb67e04f99e422d8746b5734456e0ef82b4f225a06789579a0de4841790a4`

---

## CV-2302 — `approval.chat_tool_resolved` producer, pairing, identity and replay (newly authored, DL-411)

```yaml
plan_unit_id: CV-2302
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Exactly approval.chat_tool_resolved@1.0.0, registered by DL-300 with application and project editions
  of pm.chat_tool_approval_result.v1, takes its producer, request pairing, ordering, identity, replay and withdrawal
  from this unit and its storage custody from SP-2302. request_sha256 is newly defined here. Payload schema and
  registry row are unchanged; the native producer must adopt this contract first (requires_owner_adoption).
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; the approval host owns presentation.
depends_on:
- CV-2301
- PS-145
- HITL-038
- SP-353
- CV-317
- CV-339
- CV-366
- CV-1100
- DL-300
- DL-411
unblocks: []
acceptance_criteria:
- Exactly one resolution per approval, appended only after its request is settled, with the exact pairing joins below.
- Approved and declined carry an actual human decision; expired and cancelled follow the time and Stop rules below.
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
- approval.chat_tool_resolved
- pm.chat_tool_approval_result.v1
- ApprovalHost::resolve_chat_tool_request
- request_sha256
negative_constraints:
- No registry change, admission, new approval engine, feature, retention or deletion rule.
- Never node.unblocked; no agent, mode or grant answers a person's ask.
owner_hints:
- Plans/Contracts_V0.md
```

**Producer.** The producer is the shared approval host, `ApprovalHost::resolve_chat_tool_request`, calling `storage.s2.approval_chat_tool_resolved.append.v1@1.0.0`: the chat_tool branch of `RuntimeApproveV3Request` and `RuntimeDeclineV3Request` (HITL-038) for `approved` and `declined`, the host's expiry for `expired`, and Stop or revoke through the existing owners for `cancelled`. Chat-tool decisions never emit `node.unblocked`.

**Ordering and pairing.** Admission first, as CV-2300. The paired `approval.chat_tool_requested` original must exist and be `settled` (its first receipt resolved) before this append. The host commits the record's terminal `decision` and its `resolution_ref` together with the prepared SP-2302 journal in one body transaction; SP-286 and CV-339 append; the journal advances prepared, appended, settled; the result returns to `return_context_ref` only after `settled`.

**Payload joins.** `approval_id` equals the paired request's `approval_id` and the record `request_id`. Newly defined here: `request_sha256` is the lowercase SHA-256 of the CV-1100 qualified RFC 8785 bytes (`qualified_jcs`) of the exact paired `approval.chat_tool_requested` payload. `decision` is the record's terminal decision, never `pending`, and the record carries this resolution's `resolution_ref`. The envelope `causation_event_id` is the paired request's `event_id`; partition, Project, thread and run equal the request's. `expired` is chosen exactly when the accepted resolution time is at or after the request's `expires_at_utc`; `approved`, `declined` and `cancelled` are accepted only before it (instants compared on the shared CV-1101 calendar). `approved` and `declined` carry an actual human decision in `person_evidence`; an agent never answers its own ask, and mode authority or a build grant never stands in for a person (HITL-038). `return_context_ref` is the request's `context.return_context_ref`. Exactly one resolution exists per approval.

**Identity.** `owner_operation_id` is allocated from the resolution with the declared component `approval.chat_tool_resolved` and the exact `request_id`, so a second, different resolution of the same approval has the same scoped identity and a different producer digest and is refused as `identity_conflict`. Keys, `event_id`, partition, redaction, replay policy and migration follow CV-2301; the actor is the person for `approved` and `declined` and the approval host for `expired` and `cancelled`.

**Replay, compatibility and withdrawal.** As CV-2301. A retry returns the original resolution; no retry re-dispatches the tool or re-answers the ask.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-2301, ContractName:Plans/human-in-the-loop.md#HITL-038, ContractName:Plans/storage-plan.md#SP-2302, ContractName:Plans/storage-plan.md#SP-2303
