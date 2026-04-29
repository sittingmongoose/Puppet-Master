## Scheduler Runtime, Safe-Point, and Remediation Storage Addendum (2026-03-08)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0654
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - strongest owner for switch/pressure behavior, but still lacks durable switch-history storage and does not align cleanly with scheduler dispatch or usage/storage identity fields
  - storage and UI consumers now have no single obviously-canonical payload block for scheduler, safe point, and remediation lineage
  - `MiscPlan.md` still embeds sequential tier-era cleanup/remediation assumptions, including a cleanup-remediation loop outside the canonical runtime failure matrix and prepare/cleanup ordering that can erase safe-point baselines.
  - MiscPlan.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Required storage support for the runtime scheduler feature cluster.

### Event ingestion

The storage layer MUST ingest and project the following canonical events (using canonical names, not legacy aliases):

**Scheduler events:**
- `scheduler.pass` (canonical; legacy alias: `run.scheduler_analysis`)
- `node.blocked` (canonical; legacy alias: `run.node_blocked`)
- `node.unblocked` (canonical; legacy alias: `run.node_unblocked`)

**Safe-point events:**
- `safe_point.created`
- `safe_point.restored`

**Remediation events:**
- `remediation.spawned` (canonical; legacy alias: `run.remediation_started`)
- `remediation.resolved` (canonical; legacy alias: `run.remediation_completed`)

> **Migration rule:** Storage consumers MUST accept both canonical and legacy event names during migration but MUST normalize to canonical names before writing projections. New storage code MUST NOT emit legacy names.

### redb key projections

```
scheduler_pass.{run_id}.{scheduler_pass_id}
blocked_projection.{run_id}.{node_id}.{blocked_sequence}
remediation.{run_id}.{remediation_root_id}
safe_point.sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}
```

Canonical note:
- `blocked_projection.{run_id}.{node_id}.{blocked_sequence}` is superseded by canonical `blocked_projection.v1:{project_id}:{node_id}`
- canonical blocked-projection values include `{ blocked_reason_code, blocked_at, blocked_family, approval_scope_key?, allowed_action_ids[] }`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
