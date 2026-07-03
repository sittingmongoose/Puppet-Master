# Shard 010: PlanUnits

Source: `Plans/MCP_Integration.md`

Source lines: L191-L242

Source SHA256: `0ac70d1c057a983e27f8c879257a48dabb7d21c49ae77c93dbe0e16d4e0eed4d`

---

## PlanUnits

### MI-002 - MCP Owner Scope And ContractRefs

```yaml
plan_unit_id: MI-002
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP_Integration is the single-owner SSOT for Puppet Master MCP configuration, naming, availability, credential binding, and invalidation, with Tools, storage-plan, and Permissions_System as named consumers.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-002 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_owner_scope_and_contractrefs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0001
preserved_exact_tokens:
- MCP Integration
- single-owner SSOT
- PM MCP configuration
- naming
- availability
- credential binding
- invalidation
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
```
