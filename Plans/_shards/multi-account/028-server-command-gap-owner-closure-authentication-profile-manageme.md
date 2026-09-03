# Shard 028: Server command-gap owner closure - authentication-profile management (2026-09-01)

Source: `Plans/Multi-Account.md`

Source lines: L5293-L5333

Source SHA256: `1769da806f49028e344a75438045ab181b017f323574d63f24a1a714003feaad`

---

## Server command-gap owner closure - authentication-profile management (2026-09-01)

`AuthenticationProfileRegistry` extends the existing single closed `AuthProfileCommandRequest|Result|Error|Availability|PermissionDecision` family for `cmd.auth_profile.rename`, `cmd.auth_profile.revoke`, `cmd.auth_profile.transfer.preview`, and `cmd.auth_profile.transfer.apply`. Their sole future handlers are respectively `handlers::multi_account::rename`, `handlers::multi_account::revoke`, `handlers::multi_account::transfer_preview`, and `handlers::multi_account::transfer_apply`; all four remain `handler_unavailable` pending full central and native integration. Source token `cmd.auth_profile.open_details` is retained only as the adjudicated spelling for `ui.auth_profile.open_details`, the only local details action: it is bounded, redacted, lazy, non-mutating, has an owner-local typed UI controller only, and emits no domain EventRecord.

The exact consumers are Settings > Integrations > Profiles, Product Onboarding owner handoff, Doctor remediation, authentication handoff surface, and palette/API. Rename preserves stable profile/account/provider/route authority. Revoke fences auth/profile generations and returns an explicit dependent-use disposition rather than silently breaking connections. Transfer preview produces a content-addressed plan covering destination Host/Environment compatibility, reauthentication, reuse, omissions, and secret exclusions. Apply accepts only that current approved preview and reuses compatible destination profiles; secret material remains non-exportable by default and may cross only an explicitly admitted encrypted transfer path with human authorization and destination binding. Protected `AuthBrowserSession` content, cookies, storage state, tokens, raw codes, raw secrets, and credential values are never exportable or inspectable through preview, apply, details, receipts, logs, or GUI projections.

Duplicate preview/apply requests converge by idempotency key and plan hash. A restart reloads the durable transfer journal and either resumes the exact phase, rolls back, or reports `recovery_required`; a stale source/destination/profile/auth/topology generation, changed permission snapshot, plan-hash mismatch, reused authorization, or competing apply fails closed. Every terminal result settles the exact initiating return context and never chooses another active Client or surface.

### MA-071 - Authentication Profile Management And Transfer Closure

```yaml
plan_unit_id: MA-071
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  AuthenticationProfileRegistry owns four exact rename, revoke, transfer-preview, and transfer-apply commands in the
  existing closed auth-profile family plus one local details action. Commands remain handler_unavailable until their
  named sole handlers exist; transfer is preview-bound, generation-fenced, encrypted-path-only when separately admitted,
  and never exports protected authentication or raw credential material.
gui_related: true
gui_classification_reason: Five named GUI/API consumers display profile actions, transfer plans, blockers, and exact return.
depends_on: [MA-045, MA-054, MA-070]
unblocks: []
acceptance_criteria:
  - The existing schema family covers all four exact IDs, operations, handlers, payload/result branches, availability, disabled reasons, permission scopes, and receipt-only disposition.
  - ui.auth_profile.open_details has no domain handler or EventRecord and exposes only a redacted projection.
  - Preview/apply fixtures cover reuse, incompatible destination, reauthentication, secret exclusion, encrypted-path authorization, stale plan/generation, duplicate/race, restart, rollback, and exact return.
  - AuthBrowserSession content, storage state, cookies, tokens, raw codes, raw secrets, and credential values remain structurally non-exportable.
validation_surfaces: [Plans/multi_account_contracts.schema.json, Plans/multi_account_contract_fixtures.json, focused Server owner-bundle-A validator]
risk_class: auth_profile_transfer_secret_or_authority_escape
reasoning_tier: high
context_scope: server_command_gap_auth_profile
implementation_surfaces: [Plans/Multi-Account.md, Plans/multi_account_contracts.schema.json, future AuthenticationProfileRegistry handlers]
node_compile_hint: {mode: auth_profile_command_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-1-5]
negative_constraints:
  - Do not create a second authentication-profile command family or handler.
  - Do not export protected AuthBrowserSession content or raw credential material.
  - Do not apply a stale, unapproved, mismatched, or replayed transfer plan.
```
