## Runtime Recovery Artifact Identity and Scope Consolidation Addendum (2026-03-09)

Optional runtime artifacts MUST align with canonical runtime identities and state scope.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md

### Canonical artifact families
- queue-analysis snapshot keyed by `scheduler_pass_id`
- attempt detail export keyed by `attempt_id`
- safe-point manifest / restore log keyed by `safe_point_id`
- remediation lineage summary keyed by `remediation_root_id`
- degradation report keyed by planning-stage identity and explicitly marked pre-lock only

### Artifact rules
- artifacts may summarize canonical state but must not contradict canonical event/projection history
- blocked outcome artifacts MUST include `blocked_reason_code`, `allowed_action_ids[]`, and `preserved_local_work`
- stale attempts from older generations remain historical-only artifacts and MUST be labeled non-resumable
- canonical execution artifacts MUST NEVER present degraded graph structure as valid canonical runtime truth
ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
