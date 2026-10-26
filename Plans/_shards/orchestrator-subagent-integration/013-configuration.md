# Shard 013: Configuration

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L650-L756

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## Configuration

### Subagent Configuration

The `subagentConfig` block is a compatibility import/export surface. Runtime
admission reads `SubagentPolicy`; legacy fields remain searchable aliases and
must not become active execution vocabulary.

```yaml
subagentConfig:
  enable_tier_subagents: true
  persona_override_mode: simple
  tier_overrides:
    phase: []
    task: []
    subtask: []
    iteration: []
  disabled_subagents: []
  required_subagents: []
  advanced_raw_registry_controls: false
  subagentPolicy:
    schema_id: pm.subagent_policy.v1
    schema_version: "1.0.0"
    enabled: true
    mandatory_when:
      broad_stage: true
      high_risk: true
      audit_or_closure: true
      owner_conflict: true
      user_requested: true
    fanout_thresholds:
      min_plan_units_for_wave: 8
      min_owner_docs_for_wave: 3
      min_independent_lanes_for_wave: 2
      min_changed_files_for_wave: 6
      min_risk_class_for_wave: high
    limits:
      max_parallel_subagents: 4
      hard_max_parallel_subagents: 8
      max_subagents_per_wave: 8
      hard_max_subagents_per_wave: 12
      max_waves_per_goal: 3
      max_estimated_cost_microusd_per_wave: 2000000
      hard_max_estimated_cost_microusd_per_wave: 10000000
      max_estimated_tokens_per_wave: 16000
      hard_max_estimated_tokens_per_wave: 20000
      max_input_refs_per_subagent: 12
      hard_max_input_refs_per_subagent: 24
      max_input_bytes_per_subagent: 200000
      hard_max_input_bytes_per_subagent: 1000000
      max_prompt_tokens_per_subagent: 6000
      hard_max_prompt_tokens_per_subagent: 12000
      max_result_tokens_per_subagent: 2000
      hard_max_result_tokens_per_subagent: 4000
      max_write_targets_per_subagent: 0
      hard_max_write_targets_per_subagent: 1
      max_wall_clock_ms_per_child: 900000
      hard_max_wall_clock_ms_per_child: 3600000
      max_tool_rounds_per_child: 12
      hard_max_tool_rounds_per_child: 30
    retry_policy:
      max_retry_attempts_per_child: 2
      max_retry_attempts_per_wave: 1
      retry_backoff_ms: 30000
      retryable_reasons:
        - provider_transient
        - rate_limit
        - tool_timeout
        - coordination_conflict
      non_retryable_reasons:
        - permission_denied
        - filesafe_denied
        - authority_scope_denied
        - validation_failed
        - scope_mismatch
        - repeated_same_read
    compatibility_aliases:
      enable_tier_subagents: enabled
      subagentConfig: subagentPolicy
      tier_overrides: scope_overrides
      tier_overrides.phase: legacy_phase_lane_defaults
      tier_overrides.task: legacy_package_or_work_type_defaults
      tier_overrides.subtask: legacy_work_unit_defaults
      tier_overrides.iteration: legacy_bounded_work_unit_defaults
```

### SubagentPolicy runtime defaults and compatibility aliases

`SubagentPolicy` with `schema_id = pm.subagent_policy.v1` is the canonical runtime policy record for delegated
SubagentWave admission. It is evaluated before any child_goal, bounded_work_unit,
or delegated thread is spawned and is recorded in the parent GoalRun receipt.

Field contract:
- `schema_id`: string const `pm.subagent_policy.v1`.
- `schema_version`: string, default `1.0.0`.
- `enabled`: boolean, default `true`; compatibility alias `enable_tier_subagents`.
- `mandatory_when`: booleans for `broad_stage`, `high_risk`, `audit_or_closure`, `owner_conflict`, and `user_requested`; all default `true`.
- `fanout_thresholds`: integer thresholds `min_plan_units_for_wave = 8`, `min_owner_docs_for_wave = 3`, `min_independent_lanes_for_wave = 2`, `min_changed_files_for_wave = 6`, and enum `min_risk_class_for_wave = high`.
- `limits`: `max_parallel_subagents = 4` with hard limit `8`; `max_subagents_per_wave = 8` with hard limit `12`; `max_waves_per_goal = 3`; `max_estimated_cost_microusd_per_wave = 2000000` with hard limit `10000000`; `max_estimated_tokens_per_wave = 16000` with hard limit `20000`; `max_input_refs_per_subagent = 12` with hard limit `24`; `max_input_bytes_per_subagent = 200000` with hard limit `1000000`; `max_prompt_tokens_per_subagent = 6000` with hard limit `12000`; `max_result_tokens_per_subagent = 2000` with hard limit `4000`; `max_write_targets_per_subagent = 0` for read-only waves with hard limit `1` unless parent write policy explicitly grants more; `max_wall_clock_ms_per_child = 900000` with hard limit `3600000`; `max_tool_rounds_per_child = 12` with hard limit `30`.
- `parent_budget_ceiling`: every numeric limit must be less than or equal to the parent run envelope from `Plans/Run_Modes.md`; narrower parent remaining budget wins over the defaults above.
- `retry_policy`: retry only `provider_transient`, `rate_limit`, `tool_timeout`, and `coordination_conflict`; default `max_retry_attempts_per_child = 2`, `max_retry_attempts_per_wave = 1`, and `retry_backoff_ms = 30000`; never retry `permission_denied`, `filesafe_denied`, `authority_scope_denied`, `validation_failed`, `scope_mismatch`, or `repeated_same_read`.
- `write_policy`: child units default to `read_only` or `proposal_only`; live canonical writes require an explicit parent-owned `leased_writer` or `parent_writer` grant.
- `compatibility_aliases`: maps `tier_overrides.phase`, `tier_overrides.task`, `tier_overrides.subtask`, and `tier_overrides.iteration` into compatibility import hints only. These aliases can seed lane or role defaults, but active runtime prose and receipts use node/package/seam/lane/phase, WorkNode, capability_lane, agent_role, and bounded_work_unit terms.

SubagentPolicy receipts include the evaluated thresholds, selected child count,
parallelism cap, cost ceiling, retry budget, assigned capability_lane values,
write policy, and the exact compatibility aliases consumed, if any.
