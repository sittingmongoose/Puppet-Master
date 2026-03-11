## Runtime Artifact Open-by-Identity Consolidation Addendum (2026-03-09)
File/artifact browsing must support the new runtime artifacts and reports produced by scheduler/remediation flows while preserving canonical runtime identity.

### Required support
- open scheduler analysis exports/reports when materialized
- open remediation reports/details when materialized
- open degradation reports when materialized
- open generated non-repo drafts without treating them as normal workspace files

### Required navigation targets
- queue-analysis snapshots by `scheduler_pass_id`
- attempt-scoped evidence and reports by stable `attempt_id`
- safe-point manifests / restore logs by `safe_point_id`
- remediation lineage summaries by `remediation_root_id`
- blocked-detail pivots through `detail_ref`

Rules:
- runtime reports opened from Dashboard/Assistant/Orchestrator surfaces must preserve identity and not silently redirect to unrelated files
- UI and file browsing affordances must use stable identities (`attempt_id`, `safe_point_id`, `remediation_root_id`) rather than ambiguous node-only labels
- legacy `analysis_id` may be accepted only as an alias equal to `scheduler_pass_id`

**Runtime Artifacts alignment:** Open by artifact identity and the Artifacts panel MUST align with Plans/Runtime_Artifacts_Panel.md (artifacts_index:v1:{project_id}, 19 artifact types, navigation).
