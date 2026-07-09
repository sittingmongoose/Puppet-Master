# Shard 018: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L696-L747

Source SHA256: `490cbceee1d122f33dfe29a830ebdf41b579b3ed15a5ce3e7b6dcdf6bdd5b5f5`

---

## Ledger Compile Addendum - pldg-20260614-002

### RAP-026 - Artifacts Index Identity And Open Resolution

```yaml
plan_unit_id: RAP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  The storage-owned row key family is `artifacts_index.v1:{project_id}:{artifact_id}`; the older
  `artifacts_index:v1:{project_id}` shorthand names only the project-level contract, not row identity.
  The index is a versioned rebuildable identity contract, not a vague lookup cache. Each row is keyed by
  `artifact_id` and must carry artifact_id, artifact_kind, artifact_identity_ref, project_id, run_id,
  package/seam/lane/worktree/account identity, producer/runtime refs, attempt_id, node_id,
  provider_attempt_ref when available, output owner, storage URI/path, provenance/evidence refs,
  lifecycle status, integrity/version data, trust state, open target, display/open handlers,
  preview capability, permissions/visibility boundary, permission/degraded state, and
  tombstone/rebuild metadata. Open-by-artifact-identity resolves through this index and then dispatches
  to FileManager, owner-surface routes, or generated/object-backed previews without replacing project
  output ownership.
gui_related: true
gui_classification_reason: Runtime artifact panel open actions, previews, degraded state, and permissions are user-visible panel behavior.
depends_on: [RAP-019, RAP-020, CV-281]
unblocks: []
acceptance_criteria:
  - The live storage key family is `artifacts_index.v1:{project_id}:{artifact_id}` and preserves `artifact_id` as row identity.
  - The artifacts index has a versioned row contract with project/run/package/seam/lane/worktree/account identity, runtime, owner, storage, provenance, lifecycle, integrity/version, permissions, open, preview, and rebuild fields.
  - Open-by-artifact-identity resolves through the index before dispatching to FileManager or owner-surface routes.
  - Missing or stale index rows degrade to record-backed views rather than becoming canonical artifact truth.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: artifact_identity_index_drift
reasoning_tier: high
context_scope: runtime_artifacts_index_open_by_identity
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/FileManager.md, Plans/storage-plan.md]
node_compile_hint: {mode: artifacts_index_identity_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0040
  - pldg-20260614-002-part-3-fable-cleanup:atom-0051
  - pldg-20260614-002-part-3-fable-cleanup:atom-0097
  - pldg-20260614-002-part-3-fable-cleanup:atom-0098
preserved_exact_tokens: ["artifacts_index.v1:{project_id}:{artifact_id}", "artifacts_index:v1:{project_id}", "artifact_id", "project/run/package/seam/lane/worktree/account identity", "artifact kind", "storage URI/path", "producer/runtime_identity", "provenance/evidence refs", "lifecycle status", "integrity/version data", "permissions/visibility boundary", "display/open handlers", "open-by-artifact-identity", "artifact_identity_ref", "FileManager", "FileManager open-by-artifact-identity resolution semantics", "sole canonical index contract"]
compatibility_only_notes:
  - "`artifacts_index:v1:{project_id}` is retained as source-lineage shorthand for the project-level index contract; storage owns the canonical row key family `artifacts_index.v1:{project_id}:{artifact_id}`."
negative_constraints:
  - Do not make the rebuildable artifacts index the sole source of artifact truth.
  - Do not let FileManager open project/runtime artifacts without artifact identity resolution.
  - Do not drop `artifact_id` row identity or replace the storage-owned dot/colon key family with a project-only shorthand.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/FileManager.md]
```
