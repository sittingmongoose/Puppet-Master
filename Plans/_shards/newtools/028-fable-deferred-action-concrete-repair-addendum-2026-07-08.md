# Shard 028: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/newtools.md`

Source lines: L8612-L8739

Source SHA256: `c6c1769ab799a3aa121280b5544f668ba7b65fc92936caaa06504b41e6ac9ee3`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical newtools spec text for deferred non-runtime FABLE rows. It creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

### Framework And Tool Catalog Entry Schemas

Repairs row `sfk-88d1096d2627a98e841dc23e`.

`FrameworkEntry` fields: `framework_id`, `display_name`, `language_family`, `default_tool_ids[]`, `detection_patterns[]`, `install_strategy`, `support_state`, `owner_doc_ref`, and `schema_version`.

`ToolEntry` fields: `tool_id`, `display_name`, `framework_id?`, `command_ref?`, `capability_tags[]`, `default_enabled`, `support_classification`, `requires_credentials`, `health_check_id?`, `policy_refs[]`, and `schema_version`.

Field types (added 2026-11-25). These two records are the entry shapes of `GuiToolCatalog` (§6.1, N2-061); the §6.1 content list (description, install/setup summary, doc URL, custom headless default), the MCP tags of §6 (`requires_mcp`, `mcp_servers`), the overlay provenance of §6.1 persistence (`source`, `last_updated`), and N2-100's capability flags are fields of the same records, not a second shape. `?` marks an optional field; every other field is required.

`FrameworkEntry`:

| Field | Type | Values and rules |
|---|---|---|
| `framework_id` | string | Stable ID, `^[a-z][a-z0-9_-]{0,63}$` (for example `web`, `iced`, `dioxus`, `qt`, `flutter`, `tauri`, `electron`). |
| `display_name` | string | 1 to 128 characters. |
| `language_family` | string | Lowercase token (for example `rust`, `typescript`, `dart`, `cpp`). |
| `default_tool_ids[]` | array of string | Unique; each resolves to a `ToolEntry` in the merged catalog whose `framework_id` is this framework or absent. May be empty. |
| `detection_patterns[]` | array of `{ kind, value }` | `kind` is the closed enum `cargo_crate`, `npm_dependency`, `file_glob`, and `manifest_key`; `value` is a non-empty string. |
| `install_strategy` | enum | `pm_native` (PM ships the path, such as Browser Program for `web`), `project_dependency`, `user_toolchain`, or `build_custom_headless` (no existing tool; plan the §9 custom headless tool). |
| `custom_headless_default` | boolean | §6.1 "Custom headless default". |
| `support_state` | enum | `supported`, `degraded`, `experimental`, `unsupported`, or `retired`. The doctor check and debug target records of this addendum use the same enum. |
| `owner_doc_ref` | string | A `Plans/<doc>.md` path with an optional `#anchor`. |
| `source` | enum | `base`, `overlay`, or `research`. |
| `last_updated?` | RFC 3339 UTC string | Required when `source` is `overlay` or `research`. |
| `schema_version` | string | `1.0.0`. |

`ToolEntry`:

| Field | Type | Values and rules |
|---|---|---|
| `tool_id` | string | Stable ID, same pattern as `framework_id`. |
| `display_name` | string | 1 to 128 characters. |
| `description` | string | 1 to 1024 characters. |
| `framework_id?` | string | Absent for a framework-independent tool. |
| `command_ref?` | string | The tool's launch command reference. |
| `install_summary` | string | §6.1 install/setup summary; may be empty for `pm_native` tools. |
| `doc_url?` | string | Absolute `https` URL. |
| `capability_tags[]` | array of string | Unique lowercase tokens (for example `hot_reload`, `web_preview`, `headless_test`, `real_time_dev_ui`). |
| `capability_flags` | object | The six N2-100 booleans `supports_visible_run`, `supports_attach_existing`, `supports_recording`, `requires_display_server`, `supports_browser_program_visible`, and `supports_browser_program_focus_or_reopen`; each defaults to `false`. |
| `default_enabled` | boolean | |
| `support_classification` | enum | `pm_native` (Browser Program and Expert Browser Program), `project_native` (an in-repo tool such as a headless runner), or `external_runner` (an independently managed external test tool). |
| `requires_mcp` | boolean | `false` for every `pm_native` tool; Browser Program never routes through MCP. |
| `mcp_servers[]` | array of string | Non-empty only when `requires_mcp` is `true`. |
| `requires_credentials` | boolean | The record never holds a secret; credentials resolve through the secret store at use time. |
| `health_check_id?` | string | A doctor check ID from the Doctor Check Registry below. |
| `policy_refs[]` | array of string | Permission or policy references; may be empty. |
| `source` | enum | `base`, `overlay`, or `research`. |
| `last_updated?` | RFC 3339 UTC string | Required when `source` is `overlay` or `research`. |
| `schema_version` | string | `1.0.0`. |

Validation rejects the whole catalog update when any record breaks a rule above, when an ID is duplicated within base or within overlay, or when a `default_tool_ids[]` entry does not resolve. Overlay wins over base by `framework_id` and `tool_id`; research writes only `source = research` overlay entries.

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

The `manifest.json` of N2-080 is the per-run GUI automation evidence manifest at `.puppet-master/evidence/gui-automation/<run_id>/manifest.json` (§13.1). Its schema is `Plans/gui_automation_manifest.schema.json` (`SchemaID:pm.gui_automation_manifest.schema.v1`), as N2-081 and §13.1 "Schema contract" state, and that schema is the field list's authority:

- Required top-level fields: `schema_id` (constant `pm.gui_automation_manifest.schema.v1`), `run_id`, `scenario_id`, `started_at_utc`, `ended_at_utc` (date-time), `status` (closed enum `PASS`, `FAIL`, `WARN`, `SKIPPED`), `tool_name`, `tool_version`, `timeline_path`, `summary_path`, `checks_path`, `browser_sessions[]`, and `artifacts[]`. Optional: `recording_disabled_reason` and `chat_cards[]`. No other top-level field is allowed.
- Each `artifacts[]` entry requires `artifact_id`, `kind` (closed enum `screenshot`, `recording`, `trace`, `state`, `log`, `browser_screenshot`, `browser_pdf`, `console`, `network`, `other`), `relative_path`, `mime_type`, `sha256` (64 lowercase hex), and `size_bytes` (integer ≥ 0). The browser kinds also require `redaction_status`.
- The render hints are the optional per-artifact fields `width`, `height`, `duration_ms` (integers ≥ 0) and `poster_path`; the linking fields are `step_id`, `test_id`, `timeline_seq`, and `created_at_utc`.
- Each `chat_cards[]` entry requires `title`, `artifact_id`, `reason`, and `priority` (integer 0 to 100), with optional `step_id`; every `artifact_id` it names must exist in `artifacts[]`.

A manifest that fails the schema is not rendered as evidence: §13.2's deterministic fallback message applies. A field added to the manifest is a schema change in that file, never prose here.

The earlier text of this subsection described a different record (`manifest_id`, `tool_ids[]`, `framework_ids[]`, and a `render_hints` object with `group_by`, `sort_order`, `compact_labels`, `show_health_badges`, `default_filter?`, `empty_state_copy_id?`) under the same file name. It was never the evidence manifest and is retired; the catalog's JSON export carries `FrameworkEntry` and `ToolEntry` records (above).

### Shared Trust Proxy Deny Codes

Repairs row `sfk-c5e20efd85f389d003c5cf07`.

Canonical deny-code families are `permission_denied`, `credential_missing`, `trust_proxy_unavailable`, `network_forbidden`, `policy_blocked`, `registry_auth_failed`, `capability_unverified`, and `unsafe_target`. These deny codes must map to the corresponding permission or preflight reason before a tool action can surface as retryable. The correspondence is fixed, and it uses the blocked-state payload of `Plans/Permissions_System.md` (section 2, Recovery-option payloads): the deny code is carried verbatim as `blocked_reason_code`, the check that raised it is `guard_name`, `executed` is `false`, and `blocked_family` is set as follows. `permission_denied` → `blocked_approval` (the permission is missing, an `ask` was declined, or headless `ask` became deny). `policy_blocked` → `blocked_governance` when the denying check is one of the governance checks named in this document's shared trust/proxy/governance preflight rule (GitHub, registry, Kubernetes, runtime host policy), and `blocked_policy` when a Permissions rule or policy field (for example `network_access_policy = deny`) denies. `registry_auth_failed` and `trust_proxy_unavailable` → `blocked_governance`. `network_forbidden` (undeclared host, domain, proxy target or remote authority), `credential_missing`, `capability_unverified` and `unsafe_target` → `blocked_preflight`. Retry follows the family and nothing else: `blocked_approval` becomes retryable only through an approval action in `allowed_action_ids[]`, which creates a new permission snapshot; `blocked_preflight` becomes retryable when its named precondition is met (host declared in the tool profile, credential supplied, capability verified, target refreshed after `state_changed_refresh_required`) and the retry re-runs the whole preflight; `blocked_policy` and `blocked_governance` are never retried by the actor and become retryable only after the rule, policy field or governance source changes, which also creates a new permission snapshot. A deny code outside these eight, or one that reaches a consumer without its `blocked_family`, is refused as non-conforming and is never shown as retryable.

### Instrumentation Scope And Debug Target Storage

Repairs rows `sfk-d832771f93a3e3541cd1b774` and `sfk-18048251633869d004e48189`.

- Instrumentation scope records use storage key `instrumentation_scope.v1:{project_id}:{scope_id}` with fields `scope_id`, `project_id`, `target_ref`, `status`, `temporary`, `cleanup_path?`, `created_at_utc`, `expires_at_utc?`, and `owner_doc_ref`.
- Debug target registry records use storage key `debug_target.v1:{project_id}:{target_id}` with fields `target_id`, `target_kind`, `launch_config_ref?`, `url?`, `attach_pid?`, `browser_session_ref?`, `permission_snapshot_id?`, `last_verified_at_utc?`, and `support_state`.

### Split Recommendation Closure And Deprecated Registry Auth Constraint

Repairs rows `sfk-69876bef3b441cb17b89d231` and `sfk-db7708202eb32b69931bb737`.

- `split_recommended: true` on N2-096 through N2-140 is a planning-quality signal, not a buildability claim. A row may remain unsplit only when it has an explicit `split_deferred_reason`, `owner_doc_ref`, and `reopen_condition`.
- Every unit in that range that carries `split_recommended: true` stays unsplit on the row below (added 2026-11-25). `owner_doc_ref` is `Plans/newtools.md` for every row.

| Unit | `split_deferred_reason` | `reopen_condition` |
|---|---|---|
| N2-097 | Visible Browser Program path, `runtime_unavailable`, `forced_visible` fail-fast and headless validity are one admission decision; splitting them would let one part pass without the others. | A second visible browser product model is admitted, or `forced_visible` gains a fallback. |
| N2-098 | `requested_visual_mode`, `effective_visual_mode` and `fallback_reason` are one audit triple; none is meaningful alone. | A visual mode beyond `auto`, `forced_visible` and `forced_headless` is added. |
| N2-116 | BUILD status, profile resolution, artifact list and chat summary are one build-control surface with one owner. | Build controls move to a different owner surface, or a build profile beyond native, web, mobile and container is added. |
| N2-117 | `build_result` is one payload; its fields are not separately buildable. | `build_result` gains a second producer or a schema version beyond its first. |
| N2-118 | The output examples and the two reserved command IDs describe one build-output contract. | `cmd.orchestrator.build_run` or `cmd.orchestrator.open_build_artifact` is wired in the wiring matrix, or the installer output layout changes. |
| N2-137 | The Docker/Unraid matrix is one gating table keyed by action scope; splitting rows would separate a check from the side effect it gates. | A new action scope or validation check is added to the matrix. |
| N2-138 | `after_build` dispatch and the `*.blocked` versus `*.failed` outcome split are one push-step rule. | A `push_policy` value other than `after_build` is added. |
| N2-139 | `requested_auth_mode` and its resolution into effective state, capabilities, identity and degraded reason are one validation step. | An auth mode beyond `browser` and `pat` is admitted. |
| N2-140 | Capability-gated discovery and repository creation share one effective-capability set and one PS-146/147 writer. | PS-146/147 changes the repository-creation writer or its confirmation rule. |
- The canonical registry auth constraint is: `doctor.registry.auth` is deprecated for DockerHub auth; use `doctor.dockerhub.auth.capability` for DockerHub-specific capability checks. Any N2-120/N2-141 duplicate wording must normalize to that single sentence.
