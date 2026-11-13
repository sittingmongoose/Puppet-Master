# Shard 018: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Prompt_Pipeline.md`

Source lines: L4100-L4192

Source SHA256: `e06820f39984155b76fbf5b529767c6b2fc416edbdc50469b1909fe8f248050f`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### PP-059 - P1-CONTEXT-SKILL-BUDGETS

```yaml
plan_unit_id: PP-059
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  P1-CONTEXT-SKILL-BUDGETS retains internal ContextCatalogBudget enforcement for skills, MCP tools,
  provider models, memories and terminal transcript summaries. Catalog listings cannot crowd out run
  context, selected skills load full instructions only when chosen, and omission/defer reasons
  remain internal for enforcement/debugging. Chat retains basic capacity/cost/model and useful
  compaction status without a context source inspector or per-run inclusion/omission receipt.
gui_related: true
gui_classification_reason: >-
  Defines retained context-budget enforcement and removal of ordinary source/omission inspection.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
  - "Skill/tool/catalog budgets prevent crowding out run context; omission/defer reasons remain internally attributable, with no user-facing context inspector or inclusion receipt."
  - "Selected skill loads full instructions only when chosen."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created."
validation_surfaces:
  - "python3 scripts/pm-plan-index.py validate"
  - "python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake"
  - "Internal catalog-budget/omission records and selected-skill progressive loading."
risk_class: p1_context_cache_hardening
reasoning_tier: standard
context_scope: context_cache
implementation_surfaces:
- Plans/Prompt_Pipeline.md
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Models_System.md
node_compile_hint:
  mode: p1_context_skill_budgets
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0018
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0018
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0014/P1-CONTEXT-SKILL-BUDGETS@line=14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0014/P1-CONTEXT-SKILL-BUDGETS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:14
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
- "DL-475; settings batch 2 round r2 complete context-inspection sweep, 2026-11-12"
source_atom_ids:
- atom-0018
external_atom_id: extrepo-20260703-0014
source_row_id: P1-CONTEXT-SKILL-BUDGETS
priority: P1
finding_family: Skill/context catalog progressive disclosure
source_repos:
- openai/codex
- cline/cline
- earendil-works/pi
target_docs:
- Plans/Prompt_Pipeline.md
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Models_System.md
owner_hints:
- Plans/Prompt_Pipeline.md
- Plans/Skills_System.md
- Plans/Tools.md
- Plans/Models_System.md
preserved_exact_tokens:
- extrepo-20260703-0014
- P1-CONTEXT-SKILL-BUDGETS
- P1
- Skill/context catalog progressive disclosure
- openai/codex
- cline/cline
- earendil-works/pi
negative_constraints:
  - "Do not restore user-facing context source inspection or per-run inclusion receipts through a legacy title, preserved token, shared projection or saved view state."
observed_signal: Codex official skills docs use progressive disclosure and cap initial skill listing at 2% context or 8k chars; Cline/Agent Zero/Pi all hit compaction/context/provider issues.
pm_current_coverage: PM Prompt Pipeline owns skill bundling and compaction algorithms.
pm_gap_or_delta: >-
  Historical imported GUI-omission-warning delta; DL-475 retains skill/tool/catalog listing budgets
  and omission reasons internally, with ordinary chat showing basic capacity/cost/model and useful
  compaction status only.
proposal_or_recommendation: Add ContextCatalogBudget for skills, MCP tools, provider models, memories, and terminal transcript summaries.
compile_disposition: create_new_planunit
```
