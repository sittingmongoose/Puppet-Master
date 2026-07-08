# Shard 018: Permission Snapshot Storage and Safe-Point Namespace Addendum

Source: `Plans/storage-plan.md`

Source lines: L2220-L2251

Source SHA256: `054a1b0ada712f317e9f0aef6574e4e1a3f969e5c2c72be181a75b7dcded8530`

---

## Permission Snapshot Storage and Safe-Point Namespace Addendum


### Permission snapshot storage

`Plans/storage-plan.md` owns only the durable storage binding for permission snapshots. `Plans/Permissions_System.md` owns the snapshot schema, enums, approval-surface expectations, and blocked-action semantics.

**Canonical storage binding:**
- durable family: `permission_snapshot_record.v1:{project_id}:{snapshot_id}`
- immutable link from attempt state: `attempt_record.permission_snapshot_id`
- projector/query fields MAY cache `blocked_family`, `approval_scope_key`, `approval_target_ref`, and `revalidation_required` for indexing, but they MUST NOT redefine the nested snapshot schema locally

**Rules:**
1. The snapshot record is written before the corresponding attempt becomes durable/dispatchable.
2. The snapshot payload is immutable after creation. Later approval or policy changes create a new snapshot and a new attempt lineage entry; they do not rewrite the old one.
3. Snapshot retention follows attempt lineage and any stronger preservation/hold rule.
4. storage-plan MUST reference the owner-doc schema instead of embedding a competing schema copy.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### Safe-point vs restore-point namespace separation

Safe points and restore points use distinct storage key prefixes:

| Type | Key prefix | Scope |
|------|-----------|-------|
| Safe point | `sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}` | Runtime-internal, scoped to run/node/attempt |
| Restore point | `rp:{project_id}:{restore_point_id}` | User-facing, scoped to project |

These namespaces MUST NOT overlap. Queries for safe points MUST use the `sp:` prefix; queries for restore points MUST use the `rp:` prefix.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/newfeatures.md, ContractName:Plans/Contracts_V0.md
