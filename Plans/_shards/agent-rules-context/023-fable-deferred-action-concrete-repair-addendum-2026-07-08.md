# Shard 023: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/agent-rules-context.md`

Source lines: L2414-L2419

Source SHA256: `212cf76ee5e4a1c283b0d769c6a03a740e09169e4f0b29c03edfbf8d7c095c02`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime agent-rules rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-4008c76510d28b5c52ceedae`: `AgentRulesContextRequest` fields are `request_id`, `project_id?`, `application_rules_ref`, `project_rules_ref?`, `scoped_agents_enabled`, `max_bytes`, and `created_at_utc`. `AgentRulesContextResult` fields are `request_id`, `included_paths[]`, `formatted_block_ref`, `warnings[]`, `errors[]`, `byte_count`, and `schema_version`.
- Repairs `sfk-d708c289ede618386ed6a0fd`: GUI placement is `Settings > Rules & Commands > Instructions`. Commands are `cmd.rules.validate`, `cmd.rules.save_application`, `cmd.rules.save_project`, and `cmd.rules.revert`. Dirty states are `clean`, `dirty`, `validating`, `saving`, `saved`, and `save_failed`.
