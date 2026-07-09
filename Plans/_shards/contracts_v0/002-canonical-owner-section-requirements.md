# Shard 002: Canonical owner-section requirements

Source: `Plans/Contracts_V0.md`

Source lines: L224-L321

Source SHA256: `b92b70688010827e85ac852f0d1478d8d671338c8f364970e0601dbd77b96c21`

---

## Canonical owner-section requirements


These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Owner-first canonicalization order

Contracts_V0 owns only stable cross-surface record envelopes, shared primitive names, and typed payload minima. Domain-specific docs own their behavior and may reference these contracts without copying them. When an owner-specific section and a consumer note disagree, the owner section wins; compatibility/source-lineage tokens remain traceable but do not create peer canon.

### Requested/effective account identity contract


- Compatibility-only source vocabulary is noncanonical; live wording uses the owner terminology below.
- Account-bearing envelopes use `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `effective_provider_identity`, `execution_role`, and `operational_identity`. Provider-native labels such as login names or provider account ids are display/audit metadata and never replace the stable PM identity.
### Shared governance/runtime record envelope

Shared governance/runtime records carry `record_id`, `record_kind`, `schema_version`, `created_at`, `updated_at`, `owner_ref`, `source_event_refs[]`, `subject_ref`, `status`, `visibility_level`, `redaction_profile`, and `evidence_refs[]`. Records may project into multiple UI or audit surfaces, but the persisted record remains one typed family.

### Concern record family definition

`ConcernRecord` is the cross-surface record for user-visible or governance-visible concerns. Required fields are `concern_id`, `schema_version`, `concern_category`, `severity`, `visibility_level`, `attention_level`, `status`, `owner_ref`, `creator_ref`, `subject_ref`, `source_event_refs[]`, `summary`, `created_at`, and `updated_at`. Optional fields are `blocking_effect`, `resolution_kind`, `accepted_risk`, `resolver_ref`, `resolved_at`, `linked_record_refs[]`, `suggested_action_ids[]`, and `evidence_refs[]`.

### Concern lifecycle and resolution kinds

Allowed `ConcernRecord.status` values are `active`, `acknowledged`, `resolved`, `dismissed`, and `superseded`. Allowed `resolution_kind` values are `fixed`, `accepted_risk`, `not_reproducible`, `duplicate`, `replaced_by_new_record`, and `not_applicable`. `dismissed` requires a non-empty reason and resolver; `accepted_risk` requires `accepted_risk = true` plus an evidence ref.

### Concern action policy and authority model

Concern actions are authorized by `approval_scope_key`, `actor_ref`, `permission_snapshot_id`, and `allowed_action_ids[]`. User-visible actions such as acknowledge, resolve, dismiss, reopen, or link evidence must produce a typed command response and cannot mutate a concern record by editing projections directly.

### Concern linkage to adjacent families

Concern records may link to EventRecord, AuditFinding, AuditClosure, AuthEvent, UICommandResponse, RuntimeArtifact, PlanUnit, and storage projection refs through `linked_record_refs[]`. A linked record is evidence or routing context, not a second owner for the concern lifecycle.

### Promotion classes and gate evidence

Promotion classes are `informational`, `attention_required`, `blocking`, `security_blocking`, and `governance_blocking`. Promotion to any blocking class requires `gate_id`, `blocked_subject_ref`, `blocking_effect`, `owner_ref`, and at least one evidence ref. A projection may display a promoted concern only after these fields exist.

### Historical semantic consistency

Historical concerns preserve the original `summary`, `source_event_refs[]`, and source-lineage tokens. Later owner corrections append updates instead of rewriting history, and projections must display the current resolved state without erasing the prior concern id.

### Coverage blocker concern lifecycle owner section

Coverage blockers are concerns whose `concern_category = coverage_blocker`. They carry `missing_owner_ref?`, `missing_contract_ref?`, `blocked_validation_surface`, and `reopen_condition`. Closing a coverage blocker requires either a repaired owner section or an explicit source-lineage-only disposition.

### Concern owner vs creator vs resolver separation

`creator_ref` is the actor or validator that raised the concern. `owner_ref` is the accountable owner doc or runtime authority. `resolver_ref` is the actor or tool that changed the concern to a terminal state. These fields must not collapse into a single user label.

### Concern source-event vs record vs projection split

`source_event_refs[]` cite the events that caused or justified the concern. The `ConcernRecord` is the durable record. UI, ledger, audit, and history rows are projections of that record and may not invent fields not present in the durable family.

### Runtime attribution ownership split

Runtime attribution uses `package_id`, `run_id`, `node_id`, `attempt_id`, `execution_unit_context_ref`, and `provider_account_ref` where applicable. `package_id` is canonical; `work_package_id` is import/export compatibility only and must normalize before persistence.

### Approval scope key and approver identity

`approval_scope_key` is a stable string composed as `scope_kind:scope_id:action_family:normalized_subject_hash`. The approver identity is stored as `approver_ref`, with optional `approval_lease_id`, `permission_snapshot_id`, and `expires_at`. Approval keys are not reusable across different normalized command identities, projects, worktrees, or purpose strings.

### Concern update heuristics

Updates with the same `subject_ref`, `concern_category`, and `owner_ref` amend the existing concern while it is active or acknowledged. A terminal concern may be reopened only when its reopen condition is met or when owner/evidence hashes change. Otherwise a new concern id is required.

### Route/open compatibility-only fallback marking


  ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject
  - allowed_actions[]
  - Base route/open primitives landed, but missing:
  - Route/open auditing must stay focused on **refinement omissions**, not on re-claiming absence of primitives that already landed.
### Recommended minimum concern record shape

The minimum serialized shape is:

```json
{"concern_id":"concern_01","schema_version":"1.0.0","concern_category":"coverage_blocker","severity":"high","visibility_level":"user_visible","attention_level":"needs_action","status":"active","owner_ref":"Plans/Contracts_V0.md","creator_ref":"validator:pm-audit-closure","subject_ref":"Plans/Contracts_V0.md::owner-section","source_event_refs":[],"summary":"Owner section lacks typed fields.","created_at":"2026-07-07T00:00:00Z","updated_at":"2026-07-07T00:00:00Z","evidence_refs":[]}
```

### Concern ownership / authority direction

Concern ownership flows from source event to durable record to projections. Projections may request actions, but record mutation must go through the owning command/contract path and return a typed UICommandResponse or validator closure receipt.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
PUPPET MASTER -- CANONICAL CONTRACTS

Purpose:
- This file is the single source of truth for core, cross-cutting **contracts** referenced by other plan documents.
- Keep it DRY: define only stable envelopes + type contracts; other plans reference these contracts instead of redefining.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- Use "Puppet Master" naming consistently throughout this document.
-->
