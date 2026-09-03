# Shard 028: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/newtools.md`

Source lines: L8607-L8669

Source SHA256: `ab70dbc2e26cad60cd86bb6344f3244b1b7a901e6a04e3b937ede665d1c3e7ec`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical newtools spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Framework And Tool Catalog Entry Schemas

Repairs row `sfk-88d1096d2627a98e841dc23e`.

`FrameworkEntry` fields: `framework_id`, `display_name`, `language_family`, `default_tool_ids[]`, `detection_patterns[]`, `install_strategy`, `support_state`, `owner_doc_ref`, and `schema_version`.

`ToolEntry` fields: `tool_id`, `display_name`, `framework_id?`, `command_ref?`, `capability_tags[]`, `default_enabled`, `support_classification`, `requires_credentials`, `health_check_id?`, `policy_refs[]`, and `schema_version`.

### Action Catalog And Scenario File Contract

Repairs row `sfk-4d4d2855408c239af5a00ef3`.

- Action catalog records use `action_id`, `display_name`, `scenario_file`, `trigger_kind`, `required_tool_ids[]`, `input_schema_ref`, `output_schema_ref?`, `permission_class`, `default_enabled`, and `owner_doc_ref`.
- Scenario files use JSON with top-level fields `scenario_id`, `schema_version`, `steps[]`, `fixtures[]?`, `expected_results[]`, and `cleanup[]?`.
- Step fields are `step_id`, `action_id`, `inputs`, `timeout_ms`, `retry_policy_ref?`, and `on_failure`.

### Doctor Check Registry

Repairs row `sfk-daa3fd5eb054bd8c6be82b8d`.

Canonical doctor check ids include `doctor.mcp.context7`, `doctor.registry.auth`, `doctor.dockerhub.auth.capability`, `doctor.docker.buildx`, `doctor.debug.launch_config`, `doctor.debug.browser_session`, and `doctor.debug.attach_pid`.

Each doctor check record fields: `check_id`, `owner_doc_ref`, `input_schema_ref?`, `success_state`, `failure_codes[]`, `remediation_action_ids[]`, `credential_scope?`, `network_required`, `cache_ttl_seconds`, and `support_state`.

### Preflight Failure Enums

Repairs row `sfk-8d03b002e270c0c2db010037`.

- `severity` values are `info`, `warning`, `blocked`, and `fatal`.
- `code` values are `dependency_missing`, `dependency_version_unsupported`, `credential_missing`, `permission_denied`, `network_unavailable`, `policy_blocked`, `host_unreachable`, `runtime_unavailable`, `schema_invalid`, and `unknown`.
- Preflight failure fields are `code`, `severity`, `dependency?`, `expected?`, `observed?`, `remediation`, `owner_doc_ref`, and `retryable`.

### Manifest Render Hints

Repairs row `sfk-181db601e331e0d9b1cd52c7`.

`manifest.json` fields are `manifest_id`, `schema_version`, `tool_ids[]`, `framework_ids[]`, `render_hints`, `policy_refs[]`, `credential_refs[]?`, and `generated_at_utc`.

`render_hints` fields are `group_by`, `sort_order`, `compact_labels`, `show_health_badges`, `default_filter?`, and `empty_state_copy_id?`.

### Shared Trust Proxy Deny Codes

Repairs row `sfk-c5e20efd85f389d003c5cf07`.

Canonical deny-code families are `permission_denied`, `credential_missing`, `trust_proxy_unavailable`, `network_forbidden`, `policy_blocked`, `registry_auth_failed`, `capability_unverified`, and `unsafe_target`. These deny codes must map to the corresponding permission or preflight reason before a tool action can surface as retryable.

### Instrumentation Scope And Debug Target Storage

Repairs rows `sfk-d832771f93a3e3541cd1b774` and `sfk-18048251633869d004e48189`.

- Instrumentation scope records use storage key `instrumentation_scope.v1:{project_id}:{scope_id}` with fields `scope_id`, `project_id`, `target_ref`, `status`, `temporary`, `cleanup_path?`, `created_at_utc`, `expires_at_utc?`, and `owner_doc_ref`.
- Debug target registry records use storage key `debug_target.v1:{project_id}:{target_id}` with fields `target_id`, `target_kind`, `launch_config_ref?`, `url?`, `attach_pid?`, `browser_session_ref?`, `permission_snapshot_id?`, `last_verified_at_utc?`, and `support_state`.

### Split Recommendation Closure And Deprecated Registry Auth Constraint

Repairs rows `sfk-69876bef3b441cb17b89d231` and `sfk-db7708202eb32b69931bb737`.

- `split_recommended: true` on N2-096 through N2-140 is a planning-quality signal, not a buildability claim. A row may remain unsplit only when it has an explicit `split_deferred_reason`, `owner_doc_ref`, and `reopen_condition`.
- The canonical registry auth constraint is: `doctor.registry.auth` is deprecated for DockerHub auth; use `doctor.dockerhub.auth.capability` for DockerHub-specific capability checks. Any N2-120/N2-141 duplicate wording must normalize to that single sentence.
