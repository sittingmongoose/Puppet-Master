# Shard 019: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L3121-L3169

Source SHA256: `1538972357c908265e4c134ea879d3a5f91bd1436100a5bb208e3d15071dc54e`

---

## Ledger Compile Addendum - pldg-20260614-002

### POA-046 - Project Artifact Open By Identity Consumer Boundary

```yaml
plan_unit_id: POA-046
unit_type: requirement
status: accepted
owner_doc: Plans/Project_Output_Artifacts.md
canonical_text: >-
  Project output artifact opens consume the shared artifact identity/index contract without re-owning
  runtime artifact indexing. The storage-owned runtime artifact row key family remains
  `artifacts_index.v1:{project_id}:{artifact_id}`; project output artifacts may reference resolved
  artifact identity but must not redefine that index or collapse it to a project-only key. A project
  artifact open request must carry artifact identity, project owner/output family, storage ref,
  trust/freshness state, permissions/visibility boundary, lifecycle/integrity context, and desired
  open mode; FileManager handles file-backed realization only after the artifact identity boundary
  resolves whether the target is a workspace file, generated object, record-backed preview, or
  owner-surface route.
gui_related: true
gui_classification_reason: Opening project artifacts and routing to FileManager or preview surfaces is user-visible artifact behavior.
depends_on: [RAP-026]
unblocks: []
acceptance_criteria:
  - Project output artifacts do not redefine `artifacts_index.v1:{project_id}:{artifact_id}` or the older `artifacts_index:v1:{project_id}` source shorthand.
  - FileManager open actions receive resolved target type and trust/freshness state, not only a path-like string.
  - Runtime artifact identity and project output ownership remain distinct.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: project_artifact_open_boundary_drift
reasoning_tier: standard
context_scope: project_artifact_open_by_identity
implementation_surfaces: [Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/FileManager.md]
node_compile_hint: {mode: project_artifact_identity_consumer, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0040
  - pldg-20260614-002-part-3-fable-cleanup:atom-0051
  - pldg-20260614-002-part-3-fable-cleanup:atom-0097
  - pldg-20260614-002-part-3-fable-cleanup:atom-0098
preserved_exact_tokens: ["Project_Output_Artifacts.md:50", "artifacts_index.v1:{project_id}:{artifact_id}", "artifacts_index:v1:{project_id}", "open-by-artifact-identity", "FileManager", "artifact identity", "permissions/visibility boundary", "lifecycle status", "integrity/version data", "FileManager open-by-artifact-identity resolution semantics"]
compatibility_only_notes:
  - "`artifacts_index:v1:{project_id}` is source-lineage shorthand only; the storage-owned row key family remains `artifacts_index.v1:{project_id}:{artifact_id}`."
negative_constraints:
  - Do not collapse runtime artifact identity into project output ownership.
  - Do not pass unresolved artifact identity to FileManager as if it were a workspace path.
  - Do not drop artifact_id row identity or re-own runtime artifact indexing from Project_Output_Artifacts.
owner_hints: [Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/FileManager.md]
```
