# Shard 027: PlanUnits

Source: `Plans/Tools.md`

Source lines: L2258-L2317

Source SHA256: `61442f37cdfa57232b47b3bc3043b1e9fdc6e838a83cfbc2d09198245f4af352`

---

## PlanUnits

### T-002 - Tools Document Authority And Owner Boundary

```yaml
plan_unit_id: T-002
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: Plans/Tools.md is the canonical owner for built-in tools, custom tools, MCP registry and policy integration,
  permission-model context, provider routing, and thin runtime tool contracts; per-platform MCP config remains in Plans/newtools.md
  and AGENTS.md, while live MCP naming, authentication, and availability remain in Plans/MCP_Integration.md.
gui_related: false
gui_classification_reason: This PlanUnit does not primarily concern GUI, UI, layout, styling, or visual presentation.
split_recommended: false
depends_on: []
unblocks:
- T-003
- T-004
- T-012
acceptance_criteria:
- Compliance, scope, SSOT references, and owner/consumer boundaries remain preserved.
- Tool/search contracts remain canonical here rather than a parallel chat-thread-only tool model.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_drift
reasoning_tier: standard
context_scope: tools_phase2b_batch_181
implementation_surfaces:
- Plans/Tools.md
node_compile_hint:
  mode: tool_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Tools-S0003
preserved_exact_tokens:
- Puppet Master
- built-in tools
- custom tools
- MCP
- allow/deny/ask
- '`question`'
- '`todowrite`'
- '`todoread`'
- '`web*`'
- '`skill`'
- '`task`'
- '`lsp`'
- '`/tool/search`'
negative_constraints:
- Do not use `tool.invoked.index_used` for fuzzy/path discovery; it remains only grep/Search sparse-n-gram disclosure.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Tools.md
```
