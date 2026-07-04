# Shard 021: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Plugins_System.md`

Source lines: L4038-L4117

Source SHA256: `f74358e512cec51f70525720a4b1dd2d46f701a46c8438828994eb0004453a73`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PLUG-063 - P1-PLUGIN-EXTENSION-POINT-CONTRACTS

```yaml
plan_unit_id: PLUG-063
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  P1-PLUGIN-EXTENSION-POINT-CONTRACTS (P1) is compiled as canonical Puppet Master intent for Typed plugin/UI extension points to avoid monkey patching: Imported external-repo finding extrepo-20260703-0034 / P1-PLUGIN-EXTENSION-POINT-CONTRACTS (P1). The preserved PM gap/delta is: Define typed UI slots and stable context object fields for MCP/tool/session/model/runtime rows; forbid monkey patching privileged surfaces; mutation hooks produce receipts and rechecks. The observed external-repo signal remains source-lineage evidence: Agent Zero added per-row extension points because plugins otherwise used MutationObserver/DOM scanning/store monkey-patching; settings hooks added for credential scanning.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Plugin can add MCP row badge through typed slot only
- Private store monkey-patch rejected on privileged surfaces
- Hook writes trigger permission re-evaluation
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Plugin can add MCP row badge through typed slot only
- Private store monkey-patch rejected on privileged surfaces
- Hook writes trigger permission re-evaluation
risk_class: p1_ui_projection_and_hard_gates_hardening
reasoning_tier: standard
context_scope: ui_projection_and_hard_gates
implementation_surfaces:
- Plans/Plugins_System.md
- Plans/Permissions_System.md
- Plans/MCP_Integration.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p1_plugin_extension_point_contracts
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0038
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0038
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0034/P1-PLUGIN-EXTENSION-POINT-CONTRACTS@line=34
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0034/P1-PLUGIN-EXTENSION-POINT-CONTRACTS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:14
source_atom_ids:
- atom-0038
external_atom_id: extrepo-20260703-0034
source_row_id: P1-PLUGIN-EXTENSION-POINT-CONTRACTS
priority: P1
finding_family: Typed plugin/UI extension points to avoid monkey patching
source_repos:
- agent0ai/agent-zero
target_docs:
- Plans/Plugins_System.md
- Plans/Permissions_System.md
- Plans/MCP_Integration.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Plugins_System.md
- Plans/Permissions_System.md
- Plans/MCP_Integration.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0034
- P1-PLUGIN-EXTENSION-POINT-CONTRACTS
- P1
- Typed plugin/UI extension points to avoid monkey patching
- agent0ai/agent-zero
negative_constraints: []
observed_signal: Agent Zero added per-row extension points because plugins otherwise used MutationObserver/DOM scanning/store monkey-patching; settings hooks added for credential scanning.
pm_current_coverage: PM has Plugins_System and post-hook permission recheck concept.
pm_gap_or_delta: Define typed UI slots and stable context object fields for MCP/tool/session/model/runtime rows; forbid monkey patching privileged surfaces; mutation hooks produce receipts and rechecks.
compile_disposition: create_new_planunit
```
