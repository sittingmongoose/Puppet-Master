# Shard 022: Runner Preparation/Cleanup and Safe-Point Canonical Alignment (2026-03-08)

Source: `Plans/MiscPlan.md`

Source lines: L1285-L1306

Source SHA256: `a73dd314c5af43c8c41a8d6ea1c08fc6bcd8dbb280e72ba72772c2ed0b733605`

---

## Runner Preparation/Cleanup and Safe-Point Canonical Alignment (2026-03-08)

Any runner prepare/cleanup flow must respect runtime safe points and remediation lineage.

Required rule:
- prepare/cleanup logic must not erase or invalidate the baseline needed for `retry_from_safe_point`
- cleanup after failed runs must preserve enough state for scheduler/runtime recovery until the attempt is terminal or superseded
- temporary cleanup behavior must not collapse blocked/remediation states into generic failure cleanup
- `Plans/MiscPlan.md` / `/MiscPlan.md` cleanup states distinguish retained, cleanup_eligible, archived, and removed lane or `/worktree` states; `removed` is a backing-object or storage-presence state, while `revoked` is semantic validity state.
- Worktree plan cleanup removes worktree directories after merge or `/completion`; MiscPlan cleanup removes files inside a workspace or worktree. The `/state` model must separate lane lifecycle from cleanup actions.
- Runtime governance must preserve Architecture_Invariants, Architecture_Invariants.md, FileSafe.md, MiscPlan.md, `/crew`, `/failure`, run-scoped requested/effective snapshots, `/effective` identity, execution-role identity, graph-lock degradation boundaries, role-scoped account-pool contamination, attempt-scoped evidence retention, safe-point versus restore-point immutability, context_files write-scope constraints, remote side-effect integration, DAE enforcement, and silent-disable or bypass prevention.
- Normalized cleanup/run envelopes include `CLI_Bridged_Providers`, `CLI_Bridged_Providers.md`, `{ run_id, seq, type, payload }`, run_id, thread_id, attempt_id, node_id, snapshot IDs, remediation lineage, `/node/attempt/lineage`, `/event`, `/trust`, rewrite-era correlation, actor kind, effective account, switch reason, lane/worktree identity, and pressure/trust context.
- Live cleanup must never erase run, lane, or worktree lineage from `History`, `Ledger`, graph-linked inspection, or `/lane/worktree` records.
- Cleanup artifact boundaries are node-level, not tier-scoped; tier-era state file names such as `progress.txt`, `AGENTS.md`, and `prd.json` are compatibility inputs for `/cleanup`, not canonical scoping anchors.
- Sorting and `/grouping` defaults are explicit: `Seams` sort by most operationally problematic first, while `History` and `Ledger` sort newest first.
- Lane lifecycle verbs are separate: recover, archive, prune, remove, and `Clean all worktrees` must not blur together, and cleanup actions may expose prune or recover without implying remove.
- `persona_override_owner_id` requires owner-level cleanup so `tier_id` no longer teaches a canonical scope anchor.
- Cleanup command payloads with generic `page: string` or tier-bound filters must be constrained with native-surface ownership so they cannot undermine route/open or cleanup commands.

Acceptance criteria:
- runner cleanup and safe-point recovery are compatible
- remediation/retry lineage is not lost by generic cleanup routines
