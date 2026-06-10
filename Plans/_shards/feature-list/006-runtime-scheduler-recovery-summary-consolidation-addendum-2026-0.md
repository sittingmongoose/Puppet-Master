# Shard 006: Runtime Scheduler Recovery Summary Consolidation Addendum (2026-03-09)

Source: `Plans/feature-list.md`

Source lines: L180-L197

Source SHA256: `0390ce7b79dff02042ca161249fd663705f94cc6c735cb0e4122604267595863`

---

## Runtime Scheduler Recovery Summary Consolidation Addendum (2026-03-09)
This scheduler recovery addendum standardizes how retry, blocked, remediation, and safe-point behavior must be summarized across rewrite docs. It exists to prevent regressions back to older lexical-dispatch phrasing and to ensure every related feature description speaks in terms of canonical scheduler lineage, wakeups, and blocked-state handling.

**Key capabilities**
- deterministic scored ready-set scheduling instead of pure lexical dispatch
- event-driven queue-analysis passes keyed by `scheduler_pass_id`
- immutable attempt lineage with new `attempt_id` per dispatch and explicit runtime fields for retry/blocking/remediation/safe points
- blocked outcomes with explicit recovery actions instead of generic failures, with distinct `attention_required` vs `blocked` wizard/thread/dashboard states
- safe-point-backed recovery distinct from user-facing restore points
- remediation child execution with explicit lineage and shared failure-class retry/backoff policy
- pre-lock-only draft decomposition fallback and post-lock graph-integrity stop behavior

Remove or revise older summary phrasing that implies lexical dispatch, node-centric retry commands, or `attention_required` as the only paused clarification state.

**Detailed spec:** `Plans/Executor_Protocol.md`, `Plans/Run_Graph_View.md`, [storage-plan](#storage-plan-ref)

**Artifacts panel and panels (from GUI/Artifacts/Usage scope):** Artifacts panel (runtime artifacts, 19 types, cost_usage, Show in Ledger/Usage); side-panel toggling for Git, Docker, Unraid, Artifacts, Chat, Files (single slot, last-click wins); layout save per project; OpenCode-style usage-on-message reference; AI in Git; multi-repo source control (or explicit deferral).

