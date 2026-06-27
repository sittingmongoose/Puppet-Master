# Shard 012: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Planning_Wizard.md`

Source lines: L1184-L1334

Source SHA256: `87dab21b491a7760cffba73c44215e5d9a5515cfffc7d67de71bbd76f6d8481a`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PWIZ-016 - Planning Wizard Historical Plan Pack Records

```yaml
plan_unit_id: PWIZ-016
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: Planning Wizard Plan artifacts, Final Plan Packs, ApprovedPlanPacks, and related exports must write
  immutable project-scoped history records that Orchestrator History can browse, compare, export, reopen, and send
  forward subject to currentness and authority checks. Final/approved plan outputs are retained forever by default;
  retained drafts, intermediate outputs, previous versions, archive state, package identity, source-lineage metadata,
  source ledger atom lineage where applicable, and manifest identity remain available for deep compare and filtered
  history.
gui_related: false
gui_classification_reason: Defines Planning Wizard output/history record obligations; GUI presentation is owned
  by Orchestrator History.
depends_on:
- SP-219
unblocks:
- OP-026
- POA-051
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: planning_history_lineage_loss
reasoning_tier: standard
context_scope: planning_wizard_history_records
implementation_surfaces:
- Plans/Planning_Wizard.md
- future Planning Wizard output records
node_compile_hint:
  mode: planning_history_record_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0008
- pldg-20260626-001-feature-name:atom-0015
- pldg-20260626-001-feature-name:atom-0016
- pldg-20260626-001-feature-name:atom-0024
- pldg-20260626-001-feature-name:atom-0025
- pldg-20260626-001-feature-name:atom-0034
- pldg-20260626-001-feature-name:atom-0035
- pldg-20260626-001-feature-name:atom-0047
- pldg-20260626-001-feature-name:atom-0052
- pldg-20260626-001-feature-name:atom-0066
- chat:misc-history-scope
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-source-index-answer
- chat:history-projection-lifecycle-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0008
- atom-0015
- atom-0016
- atom-0024
- atom-0025
- atom-0034
- atom-0035
- atom-0047
- atom-0052
- atom-0066
decision_refs:
- dec-0002
- dec-0003
- dec-0004
- dec-0005
- dec-0008
- dec-0009
- dec-0011
- dec-0012
preserved_exact_tokens:
- see historical documents that are made
- by documents I mean the plans and PRD docs that are created by the wizard
- plans and PRD docs
- created by the wizard
- By default it should show only final/approved outputs
- final/approved outputs
- it can be exapnded by the user to show everything
- show everything
- retained forever by default
- 'yes'
- retention/archive rules
- deeper is mvp
- Compare versions
- rendered document diff
- package/source-lineage metadata
- ledger-atom diff
- immutable historical records
- project-scoped unified History index/projection
- source-of-truth shape
- wizard save/approval
- run lifecycle
- artifact/evidence write
- archive/unarchive
- lineage/manifest events
- Before compile
- pressure-test
- remaining underspecified History surfaces
negative_constraints:
- Do not collapse PRD Builder outputs, Planning Wizard outputs, Plan packs, and runtime artifacts into an anonymous
  flat document list.
- Do not treat mutable draft projections as the same thing as immutable approved packs or historical snapshots.
- Do not show every draft/intermediate artifact in the default Documents view.
- Do not hide final/approved artifacts inside raw ledger or export-only views.
- Do not make expanded history indistinguishable from approved/final history.
- Do not omit authority labels such as draft, approved, final, superseded, exported, or generated when showing everything.
- Do not apply ordinary draft/intermediate retention cleanup to final/approved outputs by default.
- Do not silently remove final/approved outputs from History.
- Do not promise draft/intermediate rows remain visible forever by default.
- Do not make archived/hidden all-history rows indistinguishable from deleted records.
- Do not ship compare versions as rendered-text-only in MVP.
- Do not hide source-lineage or package identity changes when comparing historical wizard documents.
- Do not compare by path or title alone when canonical document/package IDs exist.
- Do not let comparison mutate or merge historical records.
- Do not implement the History surface as fragile cross-subsystem ad hoc scans at view time.
- Do not make the History read model global or cross-project by default.
- Do not rely on view-time scanning as the primary way to discover normal History changes.
- Do not omit archive/unarchive or lineage/manifest updates from the projection lifecycle.
- Do not treat this pressure-test as permission to write canonical Plans.
- Do not create Plans/.plan_index, WorkNodes, NodeSeeds, executable queues, Spec_Lock, shards, evidence, plan_graph,
  or auto_decisions.
- Do not compile without a future explicit compile request.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```
