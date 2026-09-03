# Shard 023: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L3434-L3537

Source SHA256: `f26aaf82474af8d25a284a9515fae5789162c320bc40129358312da00915367d`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### POA-051 - History Export Manifest Profiles

```yaml
plan_unit_id: POA-051
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: History export supports selected-row export, multi-select bundle export, and whole current filtered-view
  export with an identity-preserving manifest. Export formats include archive/zip with manifest, JSON, rendered
  Markdown, rendered HTML, and rendered PDF. Ordinary rendered exports do not silently include raw records or evidence;
  raw records/evidence require an explicit evidence/redaction profile. Manifests preserve row, document, run, artifact,
  evidence, lineage, active filter, archive, and current-project identities.
gui_related: false
gui_classification_reason: Export manifest and package identity are artifact/output contracts, not visual layout.
depends_on:
- OP-027
- CV-295
unblocks:
- ATS-012
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_export_identity_loss
reasoning_tier: standard
context_scope: history_exports
implementation_surfaces:
- Plans/Project_Output_Artifacts.md
- future History export packages
node_compile_hint:
  mode: history_export_manifest
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0038
- pldg-20260626-001-feature-name:atom-0039
- pldg-20260626-001-feature-name:atom-0041
- pldg-20260626-001-feature-name:atom-0042
- pldg-20260626-001-feature-name:atom-0062
- chat:history-export-granularity-answer
- chat:history-export-compare-archive-answers
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0038
- atom-0039
- atom-0041
- atom-0042
- atom-0062
decision_refs:
- dec-0006
- dec-0007
- dec-0011
- dec-0012
preserved_exact_tokens:
- all of thodse
- selected-row export
- multi-select bundle export
- whole filtered-view export
- manifest
- current project
- documents
- runs
- artifacts
- evidence
- lineage
- yes, and yes.
- zip+manifest
- JSON
- rendered Markdown/HTML/PDF
- raw records/evidence
- explicit evidence/redaction profile
- permissions/redaction profile details
- 'yes'
negative_constraints:
- Do not limit MVP export to selected-row-only.
- Do not make whole filtered-view export omit the active filter context.
- Do not export history in a way that strips document/run/artifact identities.
- Do not let exported bundles appear cross-project when the History surface is locked to the current project.
- Do not treat exported copies as mutable source records.
- Do not collapse export into only one opaque archive format.
- Do not omit the manifest from archive/zip exports.
- Do not silently include raw records or evidence in ordinary exports.
- Do not bypass permissions or redaction policy when exporting evidence/raw records.
- Do not export secrets, unauthorized provider/account details, or evidence outside the user's permissions.
- Do not omit a manifest of redactions/omissions when evidence export is requested.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/UI_Command_Catalog.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Project_Output_Artifacts.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
```
