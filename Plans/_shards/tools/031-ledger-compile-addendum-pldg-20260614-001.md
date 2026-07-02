# Shard 031: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/Tools.md`

Source lines: L10877-L10916

Source SHA256: `f5e37cdfdac714882358eb9c9862de6ff8ffd290346a10def36d323e39472e7b`

---

## Ledger Compile Addendum - pldg-20260614-001

### T-157 - Tool Section And Subagent Registry Reference Recovery

```yaml
plan_unit_id: T-157
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools.md must repair missing Section 9 and duplicate Section 10 through Section 14 numbering as structural anchor cleanup, and task-tool
  subagent validation must consume the live subagent_registry instead of a stale inline or count-based subagent list. Count phrases such as
  42 subagent types are compatibility/source-lineage until registry generation proves them current.
gui_related: false
gui_classification_reason: Tool schema and section numbering are backend/tooling documentation contracts, not visual presentation.
depends_on: [T-055, T-056, T-104]
unblocks: []
acceptance_criteria:
  - Section references such as Tools.md Section 12 resolve unambiguously after cleanup.
  - task tool subagent_type validation routes through subagent_registry.
  - Stale count-based subagent lists do not become live registry authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Tools heading/anchor review
risk_class: tool_anchor_and_registry_drift
reasoning_tier: standard
context_scope: tools_doc_structure_and_subagent_validation
implementation_surfaces: [Plans/Tools.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: tools_anchor_registry_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0020
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0034
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0040
  - source_ref:Plans/Tools.md:884
preserved_exact_tokens: ["Tools.md is missing §9", "duplicate §10–§14 numbering", "Tools.md §12", "subagent_type", "subagent_registry", "42 subagent types"]
negative_constraints:
  - Do not promote stale inline subagent lists over subagent_registry.
  - Do not change tool permission semantics during numbering repair.
owner_hints: [Plans/Tools.md, Plans/orchestrator-subagent-integration.md]
```
