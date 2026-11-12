# Shard 023: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/agent-rules-context.md`

Source lines: L2399-L2404

Source SHA256: `f1fcf46dfb4409ccfc30d507abf111d30631f8dbacfb9a44f5234344db24aa49`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime agent-rules rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-4008c76510d28b5c52ceedae`: `AgentRulesContextRequest` fields are `request_id`, `project_id?`, `application_rules_ref`, `project_rules_ref?`, `scoped_agents_enabled`, `max_bytes`, and `created_at_utc`. `AgentRulesContextResult` fields are `request_id`, `included_paths[]`, `formatted_block_ref`, `warnings[]`, `errors[]`, `byte_count`, and `schema_version`.
- Repairs `sfk-d708c289ede618386ed6a0fd`: GUI placement is `Settings > Rules & Commands > Instructions`. Commands are `cmd.rules.validate`, `cmd.rules.save_application`, `cmd.rules.save_project`, and `cmd.rules.revert`. Dirty states are `clean`, `dirty`, `validating`, `saving`, `saved`, and `save_failed`.
