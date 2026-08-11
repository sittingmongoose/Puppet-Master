# Shard 004: Known-37 Case L owner materialization - requested/effective runtime and recovery unavailable

Source: `Plans/Contracts_V0.md`

Source lines: L316-L354

Source SHA256: `9f09a8ab2bed0549cd7c4954ecf837b31885e7dd3804026dc938334e4974dd04`

---

## Known-37 Case L owner materialization - requested/effective runtime and recovery unavailable

### requested-effective-runtime

`requested_effective_runtime` is the immutable, complete run-activation identity snapshot. Its sole new-writer schema is `Plans/requested_effective_runtime.schema.json`, schema ID `pm.requested_effective_runtime`, schema version `1.0.0`, and family ID `requested_effective_runtime`. The stable key and ref are both `requested_effective_runtime.v1:{scope_partition}:{snapshot_id}:{snapshot_sha256}`; `scope_partition` is the project partition and the canonical ref must match `^requested_effective_runtime\.v1:project~[A-Za-z0-9_-]+:[A-Za-z0-9][A-Za-z0-9._-]{0,127}:[0-9a-f]{64}$`. The SHA-256 covers the canonical complete record. A second write under the same identity with different bytes is `requested_effective_runtime_identity_conflict`, is quarantined, cannot replace the first record, and cannot append `run.started`.

The closed record requires exactly these fields: `schema_id`, `schema_version`, `snapshot_id`, `snapshot_ref`, `snapshot_sha256`, `project_id`, `run_id`, `thread_id`, `created_at_utc`, `requested_runtime_mode`, `runtime_mode`, `requested_mode_overlay`, `effective_mode_overlay`, `requested_strategy`, `strategy`, `strategy_resolution_reason`, `requested_platform`, `effective_platform`, `requested_model`, `effective_model`, `requested_account_id`, `requested_account_binding`, `requested_account_policy`, `effective_account_id`, `effective_provider_identity`, `account_switch_reason`, `requested_persona`, `effective_persona`, `run_modes_resolution_ref`, `models_resolution_ref`, `capability_snapshot_ref`, `multi_account_resolution_ref`, `persona_resolution_ref`, and `auth_resolution_ref`. Only `thread_id`, `requested_strategy`, `requested_account_id`, `effective_account_id`, and `account_switch_reason` admit `null`; all are required-present. `optional_fields` is empty.

Executor resolves and durably commits this snapshot after all named owners resolve and before activation. `run.started` then carries the required `requested_effective_snapshot_ref` plus the immutable minimum inline joins. The inline paths are exactly `requested_runtime_mode` / `runtime_mode`, `requested_mode_overlay` / `effective_mode_overlay`, `requested_strategy` / `strategy`, `requested_platform` / `effective_platform`, `requested_model` / `effective_model`, `requested_account_id` / `effective_account_id`, and `requested_persona` / `effective_persona`. They must equal the referenced snapshot. The EventRecord envelope repeats `project_id`, `run_id`, and optional `thread_id`; every repeated non-null value must equal the payload and snapshot, and envelope absence cannot weaken a required payload value. No `effective_runtime_mode`, `workflow_overlay`, `effective_strategy`, or Persona `_id` alias is emitted.

The exact strategy-resolution vocabulary is `read_only_mode_forces_hte | regular_hte_default | regular_hte_requested | regular_dae_allowed | regular_dae_disallowed | yolo_requires_dae`. Requested and effective identity may differ only when the named owner evidence and resolution reference establish the difference. Provider/model, account, and Persona consumers may not infer the mapping from display labels, string prefixes, focus, current preferences, or current credentials. Historical replay resolves the immutable snapshot, not current configuration. Missing, corrupt, mismatched, or incomplete snapshot authority blocks activation and `run.started`; it is never reconstructed from the event's inline subset.

### recovery-unavailable command and result contracts

The only new action IDs are `locate_and_verify_recovery` and `abandon_recovery`, mapping one-to-one to `cmd.runtime.locate_and_verify_recovery` and `cmd.runtime.abandon_recovery`. The governed `safe_point.recovery_unavailable` v2 payload requires one of the two exact ordered arrays: `[open_details, locate_and_verify_recovery, replan, abandon_recovery]`, or `[open_details, locate_and_verify_recovery, replan, start_fresh_attempt, abandon_recovery]` only when the existing isolated `historical_commit` or `worktree_head` fresh-attempt predicate is currently satisfied. The UI must preserve owner order. The reason enum is exactly `snapshot_missing | snapshot_corrupt | snapshot_scope_unsupported | snapshot_identity_stale | snapshot_unanchored`. Unknown values fail closed and do not map to a nearby value.

`LocateAndVerifyRecoveryRequest` and `AbandonRecoveryRequest` are closed `1.0.0` contracts. Both bind the current `project_id`, `run_id`, `node_id`, `blocked_sequence`, `safe_point_id`, `anchor_ref`, exact `expected_snapshot_refs`, exact `expected_recovery_unavailable_reason_code`, actor/idempotency identity, and the pre/post-attempt branch. Locate additionally requires `recovery_source_ref`; abandon additionally requires `confirmation = abandon_recovery_and_preserve_local_work`, a durable `confirmation_ref`, and `preserved_local_work_acknowledged = true`. A pre-attempt request omits `attempt_id`; a post-attempt request requires the exact prior attempt identity. Optional permission evidence is always revalidated.

`LocateAndVerifyRecoveryResult` and `AbandonRecoveryResult` are closed `1.0.0` domain results with `outcome = applied | replayed | refused | failed_recoverable` and `receipt_state = committed | not_committed`. Successful locate requires owner-verified refs, manifest hash and evidence, `anchor_state = released`, `release_reason = resolved`, and a committed `recovery_unavailable_resolution_receipt`. Successful abandonment requires `anchor_state = released`, `release_reason = abandoned_by_user`, and the same committed receipt family. Every nonsuccess leaves `anchor_state = recovery_unavailable`, has no release claim, and preserves work. `cleanup_performed` is always `false`. Replay returns the original result and receipt without a second transition. The shared `UICommandResponse` wraps the typed result; a generic acknowledgement is never domain success.

The receipt is `pm.storage_value.recovery_unavailable_resolution_receipt.v1`, not an EventRecord. No `runtime.command_applied`, `safe_point.recovery_resolved`, alias event, generic repair command, or second handler is created. Admission order is current identity and ordered-membership revalidation, command-specific owner verification or explicit confirmation, durable typed result and receipt, atomic anchor release, then projection refresh. Any identity drift, storage failure, receipt failure, or owner disagreement preserves the anchor, refs, holds, local work, worktree ownership, and no-cleanup invariant.

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
