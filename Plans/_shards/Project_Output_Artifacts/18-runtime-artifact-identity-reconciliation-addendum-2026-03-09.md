## Runtime Artifact Identity Reconciliation Addendum (2026-03-09)

Optional runtime artifacts MUST use canonical runtime identities.

Rules:
- queue-analysis artifacts are keyed by `scheduler_pass_id`
- attempt detail artifacts are keyed by `attempt_id`
- safe-point manifests are keyed by `safe_point_id`
- remediation lineage summaries are keyed by `remediation_root_id`
- artifacts for stale attempts MUST be visibly labeled historical/non-resumable
- blocked outcome artifacts MUST include `blocked_reason_code`, `allowed_action_ids[]`, and preserved-local-work state
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Graph_View.md
