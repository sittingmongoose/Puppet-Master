# Shard 025: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L1604-L1721

Source SHA256: `ba8114974270324cc723cf88c113d78278b4975fd0c6305207c45b0ad4acc42d`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models runtime artifact and diagnostic projections. It does not make Runtime Artifacts Panel the owner of routing, storage, permissions, or model precedence, and it does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### RAP-040 - Free Models Auto Apply Diagnostics And Runtime Evidence Projection

```yaml
plan_unit_id: RAP-040
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts and Advanced/Support diagnostics project Free Models Auto Apply evidence including last successful source/ref/hash, last failed check time, error class, affected provider/model ids, route impact, import diff, activation receipt, quarantine/rollback refs, and redacted copy/export with redaction summary. Normal UI remains plain and passive for successful checks, routine automatic failures, and repeated background check failures unless routing availability is affected.
gui_related: true
gui_classification_reason: Runtime Artifacts Panel and Advanced/Support diagnostics are user-visible panels/projections.
depends_on: []
unblocks: []
acceptance_criteria:
  - Successful validated Auto Apply updates appear as passive timestamps in normal settings, while details remain in Advanced/Support.
  - Quarantined or failed updates expose route impact and redacted evidence without raw secrets/tokens.
  - Repeated automatic background check failures remain passive in normal UI and move to Advanced/Support diagnostics unless routing availability is affected.
  - Diagnostics copy/export includes a redaction summary.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models diagnostics projection fixtures
  - Redacted copy/export fixtures
risk_class: diagnostics_projection_drift
reasoning_tier: high
context_scope: free_models_auto_apply_diagnostics
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: free_models_auto_apply_diagnostics_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0077, atom-0081, atom-0083, atom-0087, atom-0093, atom-0097, atom-0116, atom-0121, atom-0125, atom-0129, atom-0133, atom-0137, atom-0177, atom-0178, atom-0179, atom-0180, atom-0181, atom-0182, atom-0183, atom-0184, atom-0186, atom-0187, atom-0190, atom-0191, atom-0225, atom-0229, atom-0233, atom-0237, atom-0241, atom-0245, atom-0249, atom-0252, atom-0253, atom-0256, atom-0260, atom-0264, atom-0287, atom-0288, atom-0291, atom-0292]
preserved_exact_tokens:
  - "Advanced/Support diagnostics"
  - "last successful source/ref/hash"
  - "last failed check time"
  - "error class"
  - "affected provider/model IDs"
  - "route impact"
  - "redacted copy/export"
  - "redaction summary"
  - "The user can’t fix this"
negative_constraints:
  - Do not expose secrets or tokens in Advanced/Support diagnostics.
  - Do not create normal UI noise for repeated automatic Free Models check failures unless routing availability is affected.
  - Do not export raw secrets or tokens in diagnostics copy/export.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

### RAP-041 - Free Models Route Provenance And Usage Receipt Projection

```yaml
plan_unit_id: RAP-041
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects Free Models route provenance by showing friendly `Free Models` model/provider names normally while preserving underlying provider/model/account/source identity, exact snapshot ids, source hashes, upstream refs, alias/rename/provider-move lineage, attempted models, skipped entries, final result, and plain switch reasons in expanded details or Advanced/Support. Raw provider payloads remain Advanced/Support-only and redacted according to policy.
gui_related: true
gui_classification_reason: Runtime Artifacts and expanded Usage provenance are user-visible diagnostic panels.
depends_on: []
unblocks: []
acceptance_criteria:
  - Request-time friendly names stay stable in normal Usage even after upstream rename/provider move.
  - Expanded details and Advanced/Support preserve exact snapshot ids, source hashes, upstream refs, and alias/rename/provider-move lineage.
  - Every attempted/skipped entry and final selected/stopped result remains traceable.
  - Raw provider error payloads stay out of normal expanded rows.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models route provenance projection fixtures
  - Usage receipt expanded detail fixtures
risk_class: route_provenance_projection_drift
reasoning_tier: high
context_scope: free_models_runtime_provenance
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: free_models_route_provenance_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0107, atom-0111, atom-0212, atom-0216, atom-0220, atom-0224, atom-0242, atom-0246, atom-0250, atom-0254, atom-0258, atom-0262, atom-0276, atom-0284, atom-0286]
preserved_exact_tokens:
  - "friendly model/provider names"
  - "exact snapshot IDs"
  - "source hashes"
  - "upstream refs"
  - "alias/rename/provider-move"
  - "Show in Usage"
  - "Show in Ledger"
  - "attempted model"
  - "skipped entries"
negative_constraints:
  - Do not show snapshot IDs, source hashes, or upstream refs as primary normal Usage receipt content.
  - Do not rewrite normal Usage receipt names after upstream rename/provider move.
  - Do not expose raw provider error payloads in normal expanded availability rows.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - Plans/Models_System.md
```
