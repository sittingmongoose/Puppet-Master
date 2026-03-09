## Runtime Artifact Navigation Alignment Addendum (2026-03-09)

File/artifact browsing must support the new runtime entities.

### Required navigation targets
- queue-analysis snapshots
- attempt-scoped evidence and reports
- safe-point manifests / restore logs
- remediation lineage summaries

UI and file browsing affordances must use stable identities (`attempt_id`, `safe_point_id`, `remediation_root_id`) rather than ambiguous node-only labels.
