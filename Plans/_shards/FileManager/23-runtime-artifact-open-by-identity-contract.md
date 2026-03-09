## Runtime Artifact Open-by-Identity Contract

Artifact-opening surfaces use canonical runtime identities only.

Rules:
- queue-analysis opens by `scheduler_pass_id`
- remediation details open by `remediation_root_id`
- safe-point history opens by `safe_point_id`
- blocked-detail pivots resolve through `detail_ref`
- legacy `analysis_id` may be accepted only as an alias equal to `scheduler_pass_id`
