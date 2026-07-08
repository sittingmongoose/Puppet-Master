# Shard 019: Source Control, GitHub Actions, and Docker Manager Cost Attribution Addendum (2026-03-12)

Source: `Plans/usage-feature.md`

Source lines: L880-L897

Source SHA256: `72bdae3668eee969c2de469ca4d8ce227c67636de732ddbee56c90f385d2122e`

---

## Source Control, GitHub Actions, and Docker Manager Cost Attribution Addendum (2026-03-12)

Cross-surface receipts from Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator must not create feature-local cost views.

Rules:
- when a receipt or artifact carries `usage_event_ref` or equivalent canonical usage identity, `Show in Ledger` and `Show in Usage` open the canonical Usage surfaces with that event in scope
- if a user reruns workflows, tails logs, performs repeated registry refreshes, or executes other cost-bearing remote actions, the resulting cost attribution still resolves through canonical usage records
- any feature-local summary is secondary presentation only and must not replace the canonical Usage/Ledger pipeline

Reversibility and undo disclosure is part of user-facing `/accounting` for cost-bearing actions. Receipts and confirmations classify each action as immediately undoable, reversible with a compensating action, non-reversible but confirmable, or destructive and `non-undoable`; user copy may also show `non-reversible` when no practical reversal exists. If `/undo` exists, the UI records the undo-window duration, whether the undo is `local-only` or `remote-compensating`, what invalidates it, and whether a background refresh, `/poll`, or subsequent mutation closes the window. Non-reversible and non-undoable actions must disclose that before execution rather than only in `/history`.

Bulk-operation receipts preserve the parent/child shape for usage and history. A parent bulk receipt carries aggregate counts for `/failed/blocked/skipped` plus completed targets; child receipts carry `per-target` result, usage_event_ref, rollback or `/undo` expectation, and any blocked reason. Orchestrator and history must not flatten a bulk action into one ambiguous line item.

Potentially `high-cost` or repeated remote actions show cost forecast and warning semantics when platform/provider data allows it. Examples include rerun-many-workflows, bulk log retrieval, repeated registry refreshes, many `/Kubernetes` refreshes, and user-requested long-lived observation. Usage history distinguishes `user-requested` actions from automatic refresh or `/poll` overhead so the Ledger does not make background maintenance look like explicit user intent.

Small-sweep owner precedence is explicit for these hidden cross-cutting contracts. `usage-feature.md` owns cost_usage routing and cost attribution; `newtools.md` owns Docker/Actions readiness and deprecated-alias doctor IDs; Crosswalk owns `/precedence` between feature-owner docs; Docker, GitHub Actions, and Orchestrator owners keep their operational IDs rather than duplicating cost rules here. References hidden in `Crosswalk.md`, `newtools.md`, or `usage-feature.md` are still canonical when they are the named owner, including `/Docker/Orchestrator` readiness/cost links and `deprecated-alias` handling. Legacy `allowed_actions[]` remains compatibility-only; blocked/recovery flows use ordered `allowed_action_ids[]` without accidental global find/replace.

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md
