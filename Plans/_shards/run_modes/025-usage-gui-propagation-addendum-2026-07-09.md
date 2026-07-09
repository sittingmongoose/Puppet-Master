# Shard 025: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/Run_Modes.md`

Source lines: L1113-L1171

Source SHA256: `8fbb20f19c293128bb9f79d8e14be0b565e02aeaf0ee804723207fd778e0eb8e`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds run-mode outcomes to UsageRecord settlement projection. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### RM-049 - Usage Settlement And Background Contribution Run-Mode Projection

```yaml
plan_unit_id: RM-049
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: >-
  Run-mode outcomes preserve UsageRecord settlement lifecycle and hidden/background contribution identity across ask, plan, regular, yolo, HTE, and DAE surfaces. Partial streams, aborted streams, retries, escalations, blocked outcomes, permission denials, FileSafe blocks, runtime_disabled, provider failures, and adjusted settlements keep their usage_event_ref, provider_attempt_ref, attempt_id, dedupe_key, parent_usage_record_id, settlement_status, partial_reason, failure_class, and accepted/ignored rollup state. GUI consumers render streaming_partial, failed, adjusted, blocked, unknown, and settled distinctly and do not treat blocked != failed runtime outcomes as zero usage or final settled cost.
gui_related: false
gui_classification_reason: Run-mode outcome semantics feed GUI projections but are backend policy/state contracts.
depends_on: [RM-024, RM-048, UF-087, UF-088]
unblocks: []
acceptance_criteria:
  - Partial/aborted stream fixtures preserve UsageRecord refs and settlement_status without showing settled/final copy.
  - Retry/escalation fixtures count accepted usage once through dedupe_key while preserving failed or superseded attempts for audit.
  - Blocked outcomes such as permission_denied, filesafe_blocked, runtime_disabled, runtime_unavailable, capability_unavailable, host_untrusted, host_unreachable, and test_gap_policy render blocked state rather than execution failure or zero usage.
  - Hidden/background contribution refs remain attributable across run modes and are not folded into parent totals without drill-through.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future run-mode Usage settlement fixture suite
risk_class: run_mode_usage_settlement_drift
reasoning_tier: high
context_scope: run_mode_usage_settlement_projection
implementation_surfaces:
  - Plans/Run_Modes.md
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: run_mode_usage_settlement_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Run_Modes.md:843-1030"
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/Runtime_Artifacts_Panel.md:281-290"
preserved_exact_tokens:
  - streaming_partial
  - failed
  - adjusted
  - blocked != failed
  - dedupe_key
  - parent_usage_record_id
  - partial_reason
  - runtime_disabled
negative_constraints:
  - Do not erase failed, aborted, or superseded usage records just because a retry later settles.
  - Do not display blocked run-mode outcomes as zero usage or final settled cost.
  - Do not treat run-mode policy as permission to fabricate missing provider usage.
owner_hints:
  - Plans/Run_Modes.md
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
```
