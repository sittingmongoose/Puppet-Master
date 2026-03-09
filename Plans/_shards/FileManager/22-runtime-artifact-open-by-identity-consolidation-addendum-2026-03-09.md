## Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)

Runtime recovery artifacts are not ordinary workspace files and MUST be openable by stable identity.

### Canonical artifact targets
- queue-analysis snapshot by `scheduler_pass_id`
- attempt detail/evidence bundle by `attempt_id`
- safe-point manifest / restore log by `safe_point_id`
- remediation lineage summary by `remediation_root_id`

### Routing rules
- artifact-open commands resolve canonical identities first and paths second
- missing or compacted artifacts show an explanatory recovery-safe error state
- runtime artifact navigation MUST NOT silently redirect to an unrelated file with a similar node label
- runtime artifacts may open in preview/document surfaces even when no repo file path exists
