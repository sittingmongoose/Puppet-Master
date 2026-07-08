# Shard 027: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/usage-feature.md`

Source lines: L5323-L5406

Source SHA256: `869d189396611d1512a1c7b6cd4cc096fc646734f0570a91b4d9b7a92c2f54b1`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### UF-079 - P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE

```yaml
plan_unit_id: UF-079
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE (P1) is compiled as canonical Puppet Master intent for Context budget receipts by source family: Imported external-repo finding extrepo-20260703-0027 / P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE (P1). The preserved PM gap/delta is: Add ContextBudgetReceipt per source family: tool descriptions, MCP schemas, skill summaries/bodies, retrieved docs, terminal/tool outputs, provider-native replay metadata. The observed external-repo signal remains source-lineage evidence: Tool schemas, skills, git instructions, memory/docs, and MCP schemas are all separate token tax sources; Codex skills use progressive disclosure.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- GUI shows budget by source family
- Omitted/deferred catalog entries have reason receipts
- Compaction triggers use source-specific budgets
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- GUI shows budget by source family
- Omitted/deferred catalog entries have reason receipts
- Compaction triggers use source-specific budgets
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/usage-feature.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/MCP_Integration.md
node_compile_hint:
  mode: p1_context_budget_receipts_by_source
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0031
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0031
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0027/P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE@line=27
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0027/P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:7
source_atom_ids:
- atom-0031
external_atom_id: extrepo-20260703-0027
source_row_id: P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE
priority: P1
finding_family: Context budget receipts by source family
source_repos:
- anomalyco/opencode
- agent0ai/agent-zero
- openai/codex
target_docs:
- Plans/usage-feature.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/MCP_Integration.md
owner_hints:
- Plans/usage-feature.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/MCP_Integration.md
preserved_exact_tokens:
- extrepo-20260703-0027
- P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE
- P1
- Context budget receipts by source family
- anomalyco/opencode
- agent0ai/agent-zero
- openai/codex
negative_constraints: []
observed_signal: Tool schemas, skills, git instructions, memory/docs, and MCP schemas are all separate token tax sources; Codex skills use progressive disclosure.
pm_current_coverage: PM has usage/context/tool/skill planning and prior skill budget recommendation.
pm_gap_or_delta: 'Add ContextBudgetReceipt per source family: tool descriptions, MCP schemas, skill summaries/bodies, retrieved docs, terminal/tool outputs, provider-native replay metadata.'
compile_disposition: create_new_planunit
```
