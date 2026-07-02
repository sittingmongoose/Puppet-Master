# Shard 012: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/PRD_Builder.md`

Source lines: L652-L793

Source SHA256: `e44f6db85194a55be60bab4c87ccdf81357caae6f14c74c446ac093af8504118`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PRDB-010 - PRD Builder Historical Document Records

```yaml
plan_unit_id: PRDB-010
unit_type: requirement
status: accepted
owner_doc: Plans/PRD_Builder.md
canonical_text: PRD Builder outputs that become wizard-created documents must emit immutable project-scoped history
  records addressable by Orchestrator History. Final/approved PRD outputs are retained forever by default and appear
  in the default approved-only view; retained drafts, intermediate outputs, previous non-final versions, superseded
  outputs, archived rows, and exports remain discoverable only through the expanded all-history controls and retention/archive
  policy. Records preserve PRD identity, status, version, created/approved times, source wizard/run refs, artifacts,
  archive state, and lifecycle event refs for projection rebuild.
gui_related: false
gui_classification_reason: Defines PRD Builder output/history record obligations; GUI presentation is owned by Orchestrator
  History.
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
risk_class: prd_history_lineage_loss
reasoning_tier: standard
context_scope: prd_builder_history_records
implementation_surfaces:
- Plans/PRD_Builder.md
- future PRD Builder output records
node_compile_hint:
  mode: prd_history_record_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0008
- pldg-20260626-001-feature-name:atom-0015
- pldg-20260626-001-feature-name:atom-0016
- pldg-20260626-001-feature-name:atom-0024
- pldg-20260626-001-feature-name:atom-0025
- pldg-20260626-001-feature-name:atom-0033
- pldg-20260626-001-feature-name:atom-0044
- pldg-20260626-001-feature-name:atom-0045
- pldg-20260626-001-feature-name:atom-0047
- pldg-20260626-001-feature-name:atom-0052
- chat:misc-history-scope
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Project_Output_Artifacts.md
- Plans/Runtime_Artifacts_Panel.md
- chat:history-defaults-answers
- chat:history-scope-retention-actions-answers
- chat:history-columns-toggle-deep-compare-answers
- chat:history-export-compare-archive-answers
- chat:history-source-index-answer
- chat:history-projection-lifecycle-answer
source_atom_ids:
- atom-0008
- atom-0015
- atom-0016
- atom-0024
- atom-0025
- atom-0033
- atom-0044
- atom-0045
- atom-0047
- atom-0052
decision_refs:
- dec-0002
- dec-0003
- dec-0004
- dec-0005
- dec-0007
- dec-0008
- dec-0009
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
- Approved only
- All history
- per-project toggle/chip
- only after include archived extra
- Include archived
- archived
- project-scoped unified History index/projection
- source-of-truth shape
- wizard save/approval
- run lifecycle
- artifact/evidence write
- archive/unarchive
- lineage/manifest events
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
- Do not make All history a hidden advanced-only affordance.
- Do not persist the control globally across unrelated projects.
- Do not show archived records inline by default in All history.
- Do not make archived records appear without an explicit additional control.
- Do not make archived records appear identical to normal retained all-history records.
- Do not implement the History surface as fragile cross-subsystem ad hoc scans at view time.
- Do not make the History read model global or cross-project by default.
- Do not rely on view-time scanning as the primary way to discover normal History changes.
- Do not omit archive/unarchive or lineage/manifest updates from the projection lifecycle.
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
```
