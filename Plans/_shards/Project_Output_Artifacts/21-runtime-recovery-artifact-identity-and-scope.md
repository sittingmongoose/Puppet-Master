## Runtime Recovery Artifact Identity and Scope

Required artifact rules:
- queue-analysis artifacts are keyed by `scheduler_pass_id`
- blocked outcome artifacts include `blocked_reason_code`, ordered `allowed_action_ids[]`, `preserved_local_work`, and `detail_ref?`
- remediation artifacts are keyed by `remediation_root_id`
- safe-point restore artifacts are keyed by `safe_point_id` and `restore_sequence`
- degraded draft planning artifacts retain lineage to the eventual graph-lock artifact and resulting `replan_generation`

Legacy `analysis_id` may appear only as a compatibility alias where it exactly equals `scheduler_pass_id`.
