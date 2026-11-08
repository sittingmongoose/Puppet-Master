# Shard 019: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L706-L758

Source SHA256: `5f818cbe906cfb4b7de236e568ca21c90d852509888775bf9e3bcca5c49e3f76`

---

## Ledger Compile Addendum - pldg-20260614-002

### RAP-026 - Artifacts Index Identity And Open Resolution

```yaml
plan_unit_id: RAP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts consumes Storage's scope-aware artifact index: original
  artifacts_index.v1:{project_id}:{artifact_id} Project rows stay exact, and new app rows bind explicit
  app partition/Server/thread/artifact with project_id=null. Canonical artifact/producer identity, output
  owner, real optional run/attempt/node/lane/worktree/account refs, URI,
  provenance/integrity/trust/permission/lifecycle/open/preview/tombstone/rebuild fields remain complete.
  Open-by-identity routes to FileManager/owner/generated preview without becoming canonical artifact
  authority. N25 maps carried refs and shares same-store or copies cross-Server payloads while preserving
  independent holds and source history.
gui_related: true
gui_classification_reason: Runtime artifact panel open actions, previews, degraded state, and permissions are user-visible panel behavior.
depends_on: [RAP-019, RAP-020, CV-281]
unblocks: []
acceptance_criteria:
  - "Original Project artifact row keys/codecs remain exact and scope-aware app rows use real Server/thread/artifact identity with null Project."
  - "Every row retains complete owner, runtime, provenance, integrity, permission, open/preview and rebuild/tombstone fields with honest inapplicable refs."
  - "Conversion maps refs and preserves independently held/shared payloads; no Project focus fallback."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: artifact_identity_index_drift
reasoning_tier: high
context_scope: runtime_artifacts_index_open_by_identity
implementation_surfaces: [Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/FileManager.md, Plans/storage-plan.md]
node_compile_hint: {mode: artifacts_index_identity_contract, create_worknodes: false}
source_lineage:
  - "pldg-20260614-002-part-3-fable-cleanup:atom-0040"
  - "pldg-20260614-002-part-3-fable-cleanup:atom-0051"
  - "pldg-20260614-002-part-3-fable-cleanup:atom-0097"
  - "pldg-20260614-002-part-3-fable-cleanup:atom-0098"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens: ["artifacts_index.v1:{project_id}:{artifact_id}", "artifacts_index:v1:{project_id}", "artifact_id", "project/run/package/seam/lane/worktree/account identity", "artifact kind", "storage URI/path", "producer/runtime_identity", "provenance/evidence refs", "lifecycle status", "integrity/version data", "permissions/visibility boundary", "display/open handlers", "open-by-artifact-identity", "artifact_identity_ref", "FileManager", "FileManager open-by-artifact-identity resolution semantics", "sole canonical index contract"]
compatibility_only_notes:
  - "`artifacts_index:v1:{project_id}` is retained as source-lineage shorthand for the project-level index contract; storage owns the canonical row key family `artifacts_index.v1:{project_id}:{artifact_id}`."
negative_constraints:
  - Do not make the rebuildable artifacts index the sole source of artifact truth.
  - Do not let FileManager open project/runtime artifacts without artifact identity resolution.
  - Do not drop `artifact_id` row identity or replace the storage-owned dot/colon key family with a project-only shorthand.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/FileManager.md]
```

Amended 2026-10-31 (DL-270): `artifacts_index.v1` is a derived, rebuildable family and lives in the derived redb file, separate from the canonical file (SP-340). Each row declares a maximum value size of at most 16 KiB. Long ref lists, previews and any larger body are payload-store references (SP-337), not inline row content.
