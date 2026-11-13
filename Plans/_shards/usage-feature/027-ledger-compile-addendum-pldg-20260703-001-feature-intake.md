# Shard 027: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/usage-feature.md`

Source lines: L5388-L5479

Source SHA256: `360ee72cf6d6f5d0f1af9d7d19e0b02650903fb7f48ad3ccba901491031f557d`

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
  P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE / extrepo-20260703-0027 remains the source lineage for
  internal ContextBudgetReceipt records by source family: tool descriptions, MCP schemas, skill
  summaries/bodies, retrieved docs, terminal/tool outputs and provider-native replay metadata. Keep
  source-specific budgets, omission/defer reasons and compaction accounting internally for
  enforcement and debugging, with existing source restrictions. DL-475 keeps basic
  capacity/cost/model facts and useful compaction status visible while retiring user-facing
  source-composition charts and per-run inclusion/budget receipts.
gui_related: true
gui_classification_reason: "Defines visible basic context status while retiring source-family GUI receipts and retaining internal budget enforcement."
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
  - "Internal ContextBudgetReceipt records preserve source-family budgets and omitted/deferred catalog-entry reasons under existing source restrictions."
  - "Compaction triggers continue to use source-specific budgets internally; retiring their GUI disclosure does not remove enforcement or debugging records."
  - "Chat keeps basic capacity, cost, effective model information and useful compaction status, with no source-family chart or per-run inclusion/budget receipt."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile."
validation_surfaces:
  - "python3 scripts/pm-plan-index.py validate"
  - "python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake"
  - "Internal ContextBudgetReceipt records, omission/defer reasons and source-specific compaction budgets."
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
- "DL-475; settings batch 2 review R1, quiet context display reconciliation, 2026-11-12"
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
negative_constraints:
  - "Do not expose assembled-source composition, raw source payloads or per-run inclusion receipts in the chat context ring, menu or Context Detail Pane."
observed_signal: Tool schemas, skills, git instructions, memory/docs, and MCP schemas are all separate token tax sources; Codex skills use progressive disclosure.
pm_current_coverage: PM has usage/context/tool/skill planning and prior skill budget recommendation.
pm_gap_or_delta: 'Historical imported delta, retained as internal accounting under DL-475: Add ContextBudgetReceipt per source family: tool descriptions, MCP schemas, skill summaries/bodies, retrieved docs, terminal/tool outputs, provider-native replay metadata.'
compile_disposition: create_new_planunit
stale_retired_dispositions:
  - "DL-475 supersedes the imported GUI shows budget by source family requirement. The finding title, source-row IDs and imported gap text are historical lineage; internal source-specific accounting remains required."
```
