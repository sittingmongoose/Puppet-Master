# Shard 022: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L5977-L5985

Source SHA256: `0be86b25e53eb4e94f36845b4bb84451ea5a6689a18d56bd0f5eff0af17a13e2`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime container rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-7b9d615ae9afdde05c7a903e`: container reason-code aliases normalize to the canonical set `runtime_context_missing`, `compose_file_missing`, `container_unreachable`, `port_unbound`, `auth_expired`, `permission_denied`, and `unknown`.
- Repairs `sfk-cf0cd10a899404f5be291961`: template repo state transitions are `unknown -> clean -> dirty -> committed -> ready_to_push -> pushed`; failure states are `conflict`, `auth_required`, and `remote_rejected`. UI labels map `dirty` to `dirty`, `committed` to `committed`, and `ready-to-push` to `ready_to_push`.
- Repairs `sfk-30416f5cbd6db8016051db19`: Docker Manager cockpit controls are enabled only when target runtime is reachable, permission snapshot allows the operation, no conflicting operation is active, and required auth is valid. Disabled reason codes are `runtime_unreachable`, `permission_denied`, `operation_in_progress`, `auth_required`, and `unsupported_runtime`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
