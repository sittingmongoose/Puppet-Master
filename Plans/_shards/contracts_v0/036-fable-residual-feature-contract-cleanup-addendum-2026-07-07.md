# Shard 036: FABLE Residual Feature-Contract Cleanup Addendum - 2026-07-07

Source: `Plans/Contracts_V0.md`

Source lines: L19934-L20002

Source SHA256: `d75342a0adf56068a535bc560b486459d6bc630978d13cd73972912ee05c6462`

---

## FABLE Residual Feature-Contract Cleanup Addendum - 2026-07-07

This addendum closes the residual FABLE feature-contract rows assigned to Contracts_V0 for empty owner-section bodies and the explicit WebSocket auth, runtime-surface readiness, and session-prompt admission inbox gaps. It does not reopen the earlier contract-runtime core closure and does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime certification evidence, production build tasks, generated governance artifacts, or a buildability pass claim.

### CV-314 - FABLE Residual Contracts Feature Boundary

```yaml
plan_unit_id: CV-314
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 closes the residual FABLE feature-contract gaps for owner-section bodies, remote/tunnel
  WebSocket authentication, runtime-surface readiness probing, and session-prompt admission inbox events.
  Remote or tunneled WebSocket setup uses a proof-of-possession bearer session token bound to
  runtime_id, project_id, session_id, origin, csrf_nonce, and permission_snapshot_id; the server rejects
  missing, expired, mismatched, replayed, or origin-invalid handshakes before initialize and emits redacted
  auth receipts. Runtime readiness is a typed probe with request fields, result states, reasons, and roundtrip
  evidence refs. Session-prompt admission is a typed inbox event family with idempotency derived from
  session_id, prompt_id, target_thread_id, and normalized prompt hash.
gui_related: true
gui_classification_reason: WebSocket/session readiness errors and session-prompt admission are visible to runtime/chat surfaces, while the fields themselves are backend contracts.
depends_on: [CV-306, CV-307, CV-308, CV-313]
unblocks: []
acceptance_criteria:
  - Owner-section headings in Contracts_V0 either carry live typed contract text or are explicitly source-lineage only.
  - WebSocket handshake requests carry runtime_id, project_id, session_id, origin, csrf_nonce, token_binding, permission_snapshot_id, requested_capabilities, protocol_version, and client_nonce.
  - WebSocket rejections use closed error codes: missing_token, expired_token, invalid_signature, origin_mismatch, csrf_mismatch, runtime_id_mismatch, insufficient_scope, replay_detected, and protocol_version_unsupported.
  - Runtime-surface readiness probes use request fields probe_id, runtime_id, session_id, surface_id, requested_checks, timeout_ms, and trace_level.
  - Runtime-surface readiness results use state = not_ready, model_visible, ui_visible, roundtrip_ready, degraded, or failed, with reason_code, checked_at, evidence_refs, and retry_after_ms when applicable.
  - Session-prompt inbox events include session_prompt.admitted, session_prompt.rejected, session_prompt.cancelled, and session_prompt.expired with prompt_id, target_thread_id, admission_state, idempotency_key, source_session_id, and redacted_prompt_ref.
  - None of these records stores raw credentials, raw prompts beyond redacted refs, or runtime certification evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status
risk_class: fable_residual_contract_feature_gap
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: residual_contract_feature_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:505
  - fablereport.md:517
  - fablereport.md:518
  - fablereport.md:519
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "Canonical owner-section requirements"
  - "P0-security WS-auth contract"
  - "runtime-surface readiness probe"
  - "session-prompt-admission-inbox"
  - "wrong Origin/CSRF/runtime id"
  - "session_prompt.admitted"
negative_constraints:
  - Do not treat this residual feature-contract cleanup as contract-runtime core, FileSafe, storage, GUI wiring, Slint/web, runtime certification, or buildability closure.
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, runtime certification evidence, production build tasks, generated governance artifacts, or governance seal outputs.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
```
