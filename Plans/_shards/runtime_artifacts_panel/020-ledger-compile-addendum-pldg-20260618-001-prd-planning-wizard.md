# Shard 020: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L800-L857

Source SHA256: `1208fddb028eaf4ad0735414aca61dd2c67d02c502e3a8e07b2d83451234adf7`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### RAP-030 - Visible Testing And Compile Evidence Projection

```yaml
plan_unit_id: RAP-030
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: 'When a live surface cannot be embedded, expose an Open or Watch action, snapshots, screenshot sequence, video or stream where supported, structured interaction timeline, logs, console and network traces, and evidence links. Visible testing, screenshots, video, logs, console, network traces, and artifacts apply secret and sensitive-data redaction before display or persistence.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0096
- pldg-20260618-001-prd-planning-wizard:atom-0097
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0096
- atom-0097
decision_refs:
- dec-0019
correction_refs: []
preserved_exact_tokens:
- Open
- Watch
- interaction timeline
- redaction
negative_constraints:
- Do not expose credentials, tokens, personal data, or protected project content through visible testing.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Permissions_System.md
```
