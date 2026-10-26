# Shard 051: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31391-L31439

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### OSI-429 - Ambient Orchestrator Discovery For Agent Context

```yaml
plan_unit_id: OSI-429
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: >-
  Orchestrator agent context acquisition routes no-exact-path bug fixes, ambiguous module ownership, read/search misses, broad repo scan avoidance, remote or SSH project orientation, and planning/source context assembly through discover_paths when locating repo code is materially needed. Orchestrator uses ranked candidates to guide reads and delegation, records fallback and selected candidates, and requires exact verification before root-cause claims, Executor handoff, or edits. It skips discovery for pure chat, already verified exact paths, user-forbidden discovery, policy-blocked context, disabled or kill-switch states, unsupported surfaces, or over-budget/backpressure states where existing exact tools are safer.
gui_related: false
gui_classification_reason: This is agent orchestration/tool-selection behavior, not GUI presentation.
depends_on: [T-160, T-161, T-162, CV-291]
unblocks: [EP-106, ATS-011]
acceptance_criteria:
  - Orchestrator uses discover_paths for materially needed repo/source orientation without broad ad hoc scans.
  - Discovery receipts link to exact verification before root-cause claims, Executor handoff, or edits.
  - Ambient discovery is bounded by explicit trigger and skip rules.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future orchestrated no-path bug-fix test.
  - Future SSH-backed project context discovery test.
  - Future ambient trigger/skip rule tests.
risk_class: ambient_agent_overreach
reasoning_tier: standard
context_scope: orchestrator_agent_context
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, future Orchestrator discovery routing]
node_compile_hint: {mode: orchestrator_discovery_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0012
  - pldg-20260622-001-fff:atom-0027
  - pldg-20260622-001-fff:atom-0030
  - pldg-20260622-001-fff:atom-0037
  - pldg-20260622-001-fff:atom-0032
  - pldg-20260622-001-fff:atom-0043
  - pldg-20260622-001-fff:atom-0058
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:atom-0094
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#orchestrator_agent_context
source_atom_ids: [atom-0012, atom-0027, atom-0030, atom-0032, atom-0037, atom-0043, atom-0058, atom-0059, atom-0092, atom-0094]
preserved_exact_tokens: ["no-exact-path bug fixes", "ambiguous module ownership", "read/search misses", "broad repo scan avoidance", "discover_paths", "exact verification", "pure chat tasks", "already verified exact paths", "user-forbidden discovery", "over-budget/backpressure"]
negative_constraints:
  - Do not interpret ambient discovery as search-everything-every-turn behavior.
  - Do not silently bypass shared discovery with broad local scans when discovery should apply.
  - Do not bypass user or policy denial with discovery fallbacks.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Tools.md, Plans/Executor_Protocol.md]
```
