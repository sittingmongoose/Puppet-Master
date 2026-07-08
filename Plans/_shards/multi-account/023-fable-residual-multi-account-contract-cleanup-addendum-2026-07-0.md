# Shard 023: FABLE Residual Multi-Account Contract Cleanup Addendum - 2026-07-07

Source: `Plans/Multi-Account.md`

Source lines: L5020-L5081

Source SHA256: `2c97f1c991901e3d089fdc3426f437c9ce4dce541900acf0b70427dc69ffd91c`

---

## FABLE Residual Multi-Account Contract Cleanup Addendum - 2026-07-07

This addendum closes only residual FABLE Critical/High Multi-Account schema/default rows for retry budgets, credential-route epoch ownership, and token-store locking. It intentionally excludes GUI behavior rows outside the named FABLE gaps.

### MA-068 - Retry Budget, Credential Route Epoch, And Token Store Defaults

```yaml
plan_unit_id: MA-068
unit_type: schema_contract
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  Multi-Account owns retry budget defaults, token-store structure, and CredentialRouteEpoch boundaries for account
  and provider routing. Retry budgets are counted attempts per route epoch, token stores are locked encrypted records
  with atomic replacement, and MA-057 remains scoped to account/provider selection while MA-067 owns credential route,
  proxy, quota, entitlement, refresh, and failure-class epochs.
gui_related: false
gui_classification_reason: Account routing, retry budget, and token-store fields are backend credential and provider-routing contracts.
depends_on: [MA-054, MA-057, MA-067, PS-131]
unblocks: []
acceptance_criteria:
  - retry_budget defaults to max_attempts = 3 per credential_route_epoch_id per request_family, decrements on retryable provider_error, transport_error, timeout, and rate_limited, and never decrements on auth_required or permission_scope_denied.
  - Retry refill occurs on new credential_route_epoch_id, explicit user retry, or refill_after_ms elapsed; refill_after_ms defaults to 600000.
  - TokenStoreRecord includes account_id, provider_id, credential_ref, credential_kind, encrypted_blob_ref, keyring_service, created_at_ms, updated_at_ms, expires_at_ms?, refresh_state, lock_owner?, lock_expires_at_ms?, and credential_route_epoch_id.
  - Token-store writes use an exclusive lock, write temp encrypted blob, fsync, atomic rename, epoch increment, and stale-lock recovery after lock_expires_at_ms.
  - MA-057 selection records reference credential_route_epoch_id but do not redefine MA-067 route, quota, entitlement, refresh, or failure-class fields.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact residual_feature_contract_findings.jsonl
risk_class: fable_residual_multi_account_contract_drift
reasoning_tier: high
context_scope: residual_feature_contract_cleanup
implementation_surfaces:
  - Plans/Multi-Account.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: residual_multi_account_schema_defaults
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md:892
  - fablereport.md:894
  - fablereport.md:895
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "retry_budget"
  - "MA-057"
  - "MA-067"
  - "CredentialRouteEpoch"
  - "TokenStoreRecord"
  - "token store"
negative_constraints:
  - Do not close GUI row behavior outside the named schema/default gaps.
  - Do not store raw tokens in Plans, logs, receipts, or generated audit artifacts.
  - Do not create provider adapter implementation, runtime certification evidence, WorkNodes, NodeSeeds, executable queues, implementation files, or production build tasks.
owner_hints:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Permissions_System.md
```
