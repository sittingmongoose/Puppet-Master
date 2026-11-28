# Shard 040: FABLE Residual Feature-Contract Cleanup Addendum - 2026-07-07

Source: `Plans/Contracts_V0.md`

Source lines: L25503-L25601

Source SHA256: `28617626ccd6d54b6e3eb20652369a54e066fb0691f7ace7c415ed043859e7b2`

---

## FABLE Residual Feature-Contract Cleanup Addendum - 2026-07-07

This addendum closes the residual FABLE feature-contract rows assigned to Contracts_V0 for empty owner-section bodies and the explicit WebSocket auth, runtime-surface readiness, and session-prompt admission inbox gaps. It does not reopen the earlier contract-runtime core closure and does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime certification evidence, production build tasks, generated governance artifacts, or a buildability pass claim.

### CV-314 - FABLE Residual Contracts Feature Boundary

```yaml
plan_unit_id: CV-314
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Contracts_V0 closes the residual FABLE feature-contract gaps for owner-section bodies, remote/tunnel WebSocket authentication, runtime-surface readiness probing, and session-prompt admission inbox events. Remote or tunneled WebSocket setup uses a proof-of-possession bearer session token bound to runtime_id, project_id, session_id, origin, csrf_nonce, and permission_snapshot_id; the server rejects missing, expired, mismatched, replayed, or origin-invalid handshakes before initialize and emits redacted auth receipts. Runtime readiness is a typed probe with request fields, result states, reasons, and roundtrip evidence refs. The handshake request, probe request and probe result fields are typed in the CV-314 field tables directly after this unit; a degraded or failed readiness result's reason_code is one of unavailable, disabled_by_policy, auth_required, restart_required, namespace_mismatch or timed_out (drafted; the CV-314 field tables keep its relation to the CV-307 status words open). Session-prompt admission is a typed inbox event family with idempotency derived from session_id, prompt_id, target_thread_id, and normalized prompt hash. An admitted app WebSocket session binds the explicit scope, owning Server, runtime/session/Client/origin/CSRF and permission refs through a versioned successor. Conversion reissues target-authorized credentials/routes; source tokens never carry across as destination authority. Historical Project auth bindings stay exact.
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
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-work-packages;
  /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md; C-F01,C-F04,A-F07
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

CV-314 field types. Basis is `canon` where canon states the type, and `drafted` where the type is chosen from the field's name and its neighbours and stays open for the Contracts owner to narrow.

`WebSocketHandshakeRequest` (every field required):

| Field | Type | Basis |
| --- | --- | --- |
| `runtime_id`, `project_id`, `session_id`, `permission_snapshot_id` | string id, 1 to 256 characters | drafted: identity fields, typed like the CV-306 `WSAuthSession` and other runtime ids |
| `origin` | string, the request's Origin value | drafted: the field is checked for `origin_mismatch` |
| `csrf_nonce` | string | drafted: checked for `csrf_mismatch`; never stored raw (CV-306 keeps only `csrf_token_hash`) |
| `token_binding` | string carrying the proof-of-possession binding, never the bearer token itself | drafted: the token is a proof-of-possession bearer session token |
| `requested_capabilities` | array of unique nonempty strings | drafted: refused as `insufficient_scope`; canon lists no capability values |
| `protocol_version` | string | drafted: refused as `protocol_version_unsupported`; canon states no version format |
| `client_nonce` | string | drafted: used for `replay_detected` |

`RuntimeSurfaceReadinessProbeRequest` (every field required):

| Field | Type | Basis |
| --- | --- | --- |
| `probe_id`, `runtime_id`, `session_id`, `surface_id` | string id, 1 to 256 characters | drafted: identity fields; `surface_id` is the CV-307 surface |
| `requested_checks` | nonempty array of unique nonempty strings | drafted: CV-307 says a surface proves started, injected, model-visible, UI-visible and roundtrip-ready, but canon does not close the list of check names |
| `timeout_ms` | positive integer, milliseconds | drafted: from the `_ms` suffix |
| `trace_level` | string | drafted: canon states no values for this probe (the `trace_level` list in Plans/CLI_Bridged_Providers.md belongs to another contract and is not adopted) |

`RuntimeSurfaceReadinessResult`:

| Field | Type | Required | Basis |
| --- | --- | --- | --- |
| `state` | enum `not_ready`, `model_visible`, `ui_visible`, `roundtrip_ready`, `degraded`, `failed` | yes | canon: CV-314 acceptance criteria |
| `reason_code` | enum `unavailable`, `disabled_by_policy`, `auth_required`, `restart_required`, `namespace_mismatch`, `timed_out` | yes for `degraded` and `failed`, otherwise optional | drafted: the first five are the non-ready words of the CV-307 readiness status, reused exactly; `timed_out` is a probe that passes its `timeout_ms` |
| `checked_at` | RFC 3339 UTC timestamp | yes | drafted: the time of the check |
| `evidence_refs` | array of refs | yes | drafted: canon names roundtrip evidence refs without a type |
| `retry_after_ms` | non-negative integer, milliseconds | when applicable | drafted: CV-314 acceptance criteria name it without a type |

CV-307 gives the same probe a different status list (`ready`, `degraded`, `unavailable`, `disabled_by_policy`, `auth_required`, `restart_required`, `namespace_mismatch`). How that list relates to `state` above is an open question for this owner; the drafted `reason_code` values follow the reading in which CV-314's `state` is how far the probe got and CV-307's non-ready words are its reasons.
