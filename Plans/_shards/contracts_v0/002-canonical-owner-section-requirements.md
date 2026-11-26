# Shard 002: Canonical owner-section requirements

Source: `Plans/Contracts_V0.md`

Source lines: L224-L303

Source SHA256: `20b166e3f5825e366fd62bfebf5499ccb5000932011f62ef6e45b31412bb1aa5`

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

`ConcernRecord` is the cross-surface record for user-visible or governance-visible concerns. Its durable serialized form is `Plans/concern_created_contracts/concern_record.schema.json` (`pm.storage_value.concern_record.v1`, `additionalProperties: false`), and that schema is the authority for field names, types and presence. Every record carries all 33 keys: `schema_id`, `schema_version`, `record_id`, `record_kind`, `concern_id`, `project_id`, `revision`, `concern_category`, `severity`, `status`, `owner_kind`, `owner_ref`, `creator_ref`, `created_by_kind`, `created_by_ref`, `subject_ref`, `source_event_refs[]` (at least one), `evidence_refs[]`, `artifact_refs[]`, `lineage_refs[]`, `summary`, `created_at`, `updated_at`, `visibility_level`, `attention_level`, `chatworthy`, `blocking_effect_ref`, `resolution_kind`, `resolver_ref`, `resolved_at`, `run_ref`, `scope_ref` and `redaction_profile`. Six of them are nullable (`blocking_effect_ref`, `resolution_kind`, `resolver_ref`, `resolved_at`, `run_ref`, `scope_ref`) and carry `null`, never an omitted key, when they do not apply. Every ref, `summary` included, is a `pmref:<kind>:<id>` string (`redaction_profile` is always `secret_refs_only`, so summary text lives behind its ref). Earlier names in this document map onto those keys: `blocking_effect` is `blocking_effect_ref`; `linked_record_refs[]` are `lineage_refs[]` or `evidence_refs[]` entries whose pmref kind names the linked family; `accepted_risk` is `resolution_kind = accepted_risk`; `suggested_action_ids[]` are not stored on the record and come from the concern action policy below. Closed value sets (C-FIX79 decision, 2026-11-24): `concern_category` is `coverage_blocker | projection_trust | risk | weak_integration`; `severity` is `info | warning | error | critical`; `visibility_level` is `user_visible | project | restricted`; `attention_level` is `info | warning | needs_action`. `Plans/concern_created_contracts/concern_record.schema.json` carries all four enums on the record. In `concern_created_operation.schema.json` they are carried by the command and record fields only: `original_command` (`category`, `severity`, `visibility_level`, `attention_level`) and `candidate_record` (`concern_category`, `severity`, `visibility_level`, `attention_level`). The `concern.created` event payload schemas are not yet closed: `concern_created_operation.schema.json#/properties/payload/properties/category`, `Plans/event_payloads/concern/concern_created.schema.json#/properties/category` and their `Plans/storage_value_registry.json` copies still accept any snake_case reason-code string. Those payload schemas belong to Event Authority and their hashes are pinned by fixtures outside Plans, so closing them to the same `concern_category` set is a follow-up for Event Authority; until then the closed set binds the command and the record, and a `concern.created` payload validated on its own does not enforce it.

### Concern lifecycle and resolution kinds

Allowed `ConcernRecord.status` values are `active`, `acknowledged`, `resolved`, and `dismissed` (CV-063 and the record schema). Allowed `resolution_kind` values are `fixed`, `accepted_risk`, `superseded`, `merged`, `split`, `invalidated`, `obsoleted_by_patch`, and `obsoleted_by_recovery`, or `null` while the concern is `active` or `acknowledged`. Supersession is a `resolution_kind`, not a status. The older names `not_reproducible`, `duplicate`, `replaced_by_new_record` and `not_applicable` are retired lineage and never appear on a record: a duplicate resolves as `merged`, a replaced concern as `superseded`, and a concern found not reproducible or not applicable as `invalidated`. `dismissed` requires a non-null `resolver_ref` and an `evidence_refs[]` entry citing the dismiss command response that holds the non-empty reason; `resolution_kind = accepted_risk` requires at least one `evidence_refs[]` entry.

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

The minimum serialized shape is one complete `pm.storage_value.concern_record.v1` record: every key is required, the nullable keys carry `null`, and it validates against `Plans/concern_created_contracts/concern_record.schema.json`:

```json
{"schema_id":"pm.storage_value.concern_record.v1","schema_version":"1.0.0","record_id":"concern_01","record_kind":"concern","concern_id":"concern_01","project_id":"project_01","revision":1,"concern_category":"coverage_blocker","severity":"error","status":"active","owner_kind":"Runtime","owner_ref":"pmref:owner_doc:Plans/Contracts_V0.md","creator_ref":"pmref:validator:pm-audit-closure","created_by_kind":"Runtime","created_by_ref":"pmref:validator:pm-audit-closure","subject_ref":"pmref:owner_section:Contracts_V0.owner-section","source_event_refs":["pmref:source_event:evt_01"],"evidence_refs":[],"artifact_refs":[],"lineage_refs":[],"summary":"pmref:summary:concern_01","created_at":"2026-07-07T00:00:00Z","updated_at":"2026-07-07T00:00:00Z","visibility_level":"user_visible","attention_level":"needs_action","chatworthy":true,"blocking_effect_ref":null,"resolution_kind":null,"resolver_ref":null,"resolved_at":null,"run_ref":null,"scope_ref":"pmref:project:project_01","redaction_profile":"secret_refs_only"}
```
