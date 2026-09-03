# Shard 018: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/Prompt_Pipeline.md`

Source lines: L4038-L4121

Source SHA256: `3f9935cd79f5973c014f4cea35fbad846c6f83b724e0da357b0c653b5b1dfa80`

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
  P1-CONTEXT-SKILL-BUDGETS (P1) is compiled as canonical Puppet Master intent for Skill/context catalog progressive disclosure: Add ContextCatalogBudget for skills, MCP tools, provider models, memories, and terminal transcript summaries. The preserved PM gap/delta is: Need explicit skill/tool/catalog listing budgets and omission warnings in GUI. The observed external-repo signal remains source-lineage evidence: Codex official skills docs use progressive disclosure and cap initial skill listing at 2% context or 8k chars; Cline/Agent Zero/Pi all hit compaction/context/provider issues.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Skill list cannot crowd out run context; omitted skills/tools are visible in context inspector with reason.
- Selected skill loads full instructions only when chosen.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Skill list cannot crowd out run context; omitted skills/tools are visible in context inspector with reason.
- Selected skill loads full instructions only when chosen.
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
negative_constraints: []
observed_signal: Codex official skills docs use progressive disclosure and cap initial skill listing at 2% context or 8k chars; Cline/Agent Zero/Pi all hit compaction/context/provider issues.
pm_current_coverage: PM Prompt Pipeline owns skill bundling and compaction algorithms.
pm_gap_or_delta: Need explicit skill/tool/catalog listing budgets and omission warnings in GUI.
proposal_or_recommendation: Add ContextCatalogBudget for skills, MCP tools, provider models, memories, and terminal transcript summaries.
compile_disposition: create_new_planunit
```
