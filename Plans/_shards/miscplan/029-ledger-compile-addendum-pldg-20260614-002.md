# Shard 029: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/MiscPlan.md`

Source lines: L6422-L6487

Source SHA256: `f8fc84123d35047959a219649c19f926e9f55dd1968eb089bc8e47a63650a67b`

---

## Ledger Compile Addendum - pldg-20260614-002

### M-083 - Runner Platform Specs Skill Injection Contract

```yaml
plan_unit_id: M-083
unit_type: requirement
status: accepted
owner_doc: Plans/MiscPlan.md
canonical_text: >-
  Skills integration with runners is governed by a versioned `platform_specs` injection contract rather
  than a stub. For each provider runner, the contract records platform_id, runner_id/runtime_identity,
  skill/package identity, injection timing, capability/permission boundary, environment/secret boundary,
  compatibility matrix, failure/fallback behavior, audit/evidence refs, override policy, and owner
  approval path. `list_skills_for_agent` may inject skills only after those fields validate for the
  target runner. Amended 2026-11-25: following Skills_System §4.5 and MS-134, that contract is the single
  provider-agnostic SkillRunnerBinding typed under M-083, not a per-platform platform_specs file, and
  list_skills_for_agent is its typed DRY helper.
gui_related: false
gui_classification_reason: Runner skill injection, capability, environment, and audit boundaries are backend/runtime contracts, not visual presentation.
depends_on: [M-082, MGAC-092, PS-113]
unblocks: []
acceptance_criteria:
  - Runner skill injection has a validated M-083 SkillRunnerBinding, the one provider-agnostic contract that replaced the per-platform contract on 2026-11-25, before skills are delivered to Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, or Gemini runners.
  - Injection validates runtime identity, capability/permission, environment/secret, compatibility, fallback, audit/evidence, override, and owner approval fields.
  - Skills runner integration is not described as stubbed in live canonical prose.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: runner_skill_injection_gap
reasoning_tier: high
context_scope: runner_platform_specs_skill_injection
implementation_surfaces: [Plans/MiscPlan.md, Plans/orchestrator-subagent-integration.md, Plans/Skills_System.md]
node_compile_hint: {mode: runner_platform_specs_skill_injection, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0118
  - pldg-20260614-002-part-3-fable-cleanup:atom-0119
preserved_exact_tokens: ["per-platform skill injection for runners", "is stubbed", "platform_specs", "list_skills_for_agent", "Cursor", "Claude Code", "OpenCode", "Codex", "GitHub Copilot", "Gemini"]
negative_constraints:
  - Do not inject skills into a runner without validating the `platform_specs` injection contract.
  - Do not let skill injection bypass capability/permission, environment/secret, compatibility, fallback, audit/evidence, override, or owner approval boundaries.
owner_hints: [Plans/MiscPlan.md, Plans/orchestrator-subagent-integration.md, Plans/Skills_System.md]
```

**M-083 runner skill binding (2026-11-25).** `Plans/Skills_System.md` §4.5 is the authority for runtime skill delivery: every runner receives skills through the PM registry, bundling and the `skill` tool, and there is no per-provider native loading matrix. MS-134 retires `platform_specs` and `platform_specs.rs` as a data source. The "versioned `platform_specs` injection contract" above is therefore one provider-agnostic, versioned `SkillRunnerBinding`, built the same way for Cursor, Claude Code, OpenCode, Codex, GitHub Copilot and Gemini runners; `platform_specs` survives only as that contract's lineage name. Each M-083 field maps to one typed binding field:

| M-083 field | `SkillRunnerBinding` field | Type |
| --- | --- | --- |
| platform_id | `runtime_platform_id` | string; the same id as Skills_System `skill_runtime_readiness.runtime_platform_id` |
| runner_id/runtime_identity | `runner_id`, `account_id`, `connection_profile_id`, `request_id` | string; string or null; string or null; string. All four are copied from the caller's `SkillRunnerContext` (below), so two runners or requests on one platform get distinct bindings |
| skill/package identity | `entries[].skill_id`, `entries[].content_hash` | string; string (SHA-256 of the resolved `SKILL.md`) |
| injection timing | `delivery_stage`, `selected_skill_ids[]` | closed: `l0_catalog_slice`, `l1_selected_metadata`, `l2_selected_instructions`, `l3_resources_on_demand`, one per Skills_System §4.2A materialization level L0 to L3; array of string, empty at `l0_catalog_slice` |
| capability/permission boundary | `permission_snapshot_id`, `entries[].permission_class` | string; closed `allow` or `ask` (`deny` entries are never listed) |
| environment/secret boundary | `secret_policy` | constant `no_raw_secrets`: entries never carry resolved credentials (Skills_System §4.2A) |
| compatibility matrix | `entries[].readiness_state` | closed: `ready`, `needs_setup`, `needs_permission`, `has_problems`, `warning` (Skills_System `skill_runtime_readiness`) |
| failure/fallback behavior | `on_registry_unavailable` | constant `empty_slice_with_omission`: the runner starts with no Skill slice and the CapabilityMaterializationReceipt records the omission |
| audit/evidence refs | `materialization_receipt_ref` | string; the CapabilityMaterializationReceipt of `request_id`, copied from the caller's context |
| override policy | `override_source` | closed: `none`, `run_override`, `persona_default_skill_refs`; copied from the caller's context |
| owner approval path | `approval_route` | constant `permissions_review`: an `ask` Skill pauses on the Permissions approval surface (Skills_System §4.3) |
| (version) | `schema_version` | integer, `1` |

Each `entries[]` item is the addendum's `skill_catalog_entry` with types: `skill_id` string, `display_name` string (Skills_System `skill_record.label`), `source` string (`skill_record.source_kind`: `pm_bundled`, `imported_disk`, `catalog` or `github`), `permission_class` (`allow` or `ask`), `enabled` boolean (always `true` in a binding), `owner_doc_ref` string (`Plans/Skills_System.md`), `schema_version` integer, plus `readiness_state` and `content_hash` above, `description` string (the bounded description of Skills_System §4.2A L0), and `required_tool_refs[]`, `optional_tool_refs[]`, `missing_required_tool_refs[]` and `missing_optional_tool_refs[]` (arrays of tool-ref strings; the last two from the matched `skill_runtime_readiness` row).

What the runner receives at each `delivery_stage` (2026-11-26): `l0_catalog_slice` sends only `skill_id`, `display_name` and `description` of every listed entry. `l1_selected_metadata` adds, for the entries in `selected_skill_ids[]` only, the provenance, readiness and dependency metadata of L1: `source`, `content_hash`, `readiness_state`, `permission_class` and the four tool-ref arrays. `l2_selected_instructions` adds the `SKILL.md` instructions of the selected entries that may advance (below). `l3_resources_on_demand` adds a selected entry's resources or examples only when the runner asks for them through the `skill` tool. Each stage includes everything the earlier stages send; a stage is never skipped for a selected entry. `selected_skill_ids[]` lists only Skills the caller has already moved to `selected_for_request` (Skills_System §4.2A stage 4), and every id in it must be a listed entry.

`list_skills_for_agent(ctx: SkillRunnerContext) -> Result<SkillRunnerBinding, SkillListError>` is the DRY helper of task 8.9.6 (signature amended 2026-11-26; the earlier three-argument form could not name the runner or request). It is not a GUI command and not a command alias. The runner integration that is building one request supplies `SkillRunnerContext`, the owner context: `project_root` (path or None), `runtime_platform_id` (string), `runner_id` (string), `account_id` (string or null), `connection_profile_id` (string or null), `request_id` (string), `delivery_stage` and `selected_skill_ids[]` (as in the table), `override_source` (as in the table), `permission_snapshot_id` (string) and `materialization_receipt_ref` (string, the receipt that request is building). The binding copies these fields unchanged. `project_root = None` means No project: only app and global roots are read. Each entry's readiness comes from the one `skill_runtime_readiness` row whose `skill_id`, `runtime_platform_id`, `account_id` and `connection_profile_id` all equal the entry's and the context's values, null matching only null; with no such row the entry is listed with `readiness_state = needs_setup`, which cannot advance past `l1_selected_metadata`. It lists the Skills at capability stage `policy_available` or later for that runtime, with `validation_state = valid` and `permission_class` other than `deny`, ordered by `skill_id`, then content hash, in ascending UTF-8 byte order. Only entries whose `readiness_state` is `ready`, or `warning` when the Skill is explicitly selected, may advance to `l2_selected_instructions`. `SkillListError` is closed: `registry_unavailable` and `permission_snapshot_stale`. On `permission_snapshot_stale` the caller re-reads the permission snapshot and calls once more; a second stale result is handled as `registry_unavailable`, which applies `on_registry_unavailable`. A binding validates only when every field above is present with its type and every id in `selected_skill_ids[]` is a listed entry; skills are delivered to a runner only from a validated binding.
