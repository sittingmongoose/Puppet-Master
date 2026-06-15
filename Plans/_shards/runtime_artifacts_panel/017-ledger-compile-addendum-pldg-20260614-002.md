# Shard 017: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L600-L643

Source SHA256: `cbb25a37fe996aeefb59a9fcbc5577fc6c2d2c1c2dcfc05f94f22f501bc9d45f`

---

## Ledger Compile Addendum - pldg-20260614-002

### RAP-026 - Artifacts Index Identity And Open Resolution

```yaml
plan_unit_id: RAP-026
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  `artifacts_index:v1:{project_id}` is a versioned rebuildable index contract, not a vague lookup cache.
  Each row must carry artifact_id, artifact_kind, artifact_identity_ref, project_id, producer/runtime
  refs, run_id, attempt_id, node_id, provider_attempt_ref when available, output owner, storage ref,
  content hash or freshness marker, trust state, open target, preview capability, permission/degraded
  state, and tombstone/rebuild metadata. Open-by-artifact-identity resolves through this index and
  then dispatches to FileManager, owner-surface routes, or generated/object-backed previews without
  replacing project output ownership.
gui_related: true
gui_classification_reason: Runtime artifact panel open actions, previews, degraded state, and permissions are user-visible panel behavior.
depends_on: [RAP-019, RAP-020, CV-281]
unblocks: []
acceptance_criteria:
  - The artifacts index has a versioned row contract with identity, runtime, owner, storage, trust, open, preview, and rebuild fields.
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
preserved_exact_tokens: ["artifacts_index:v1:{project_id}", "open-by-artifact-identity", "artifact_identity_ref", "FileManager", "sole canonical index contract"]
negative_constraints:
  - Do not make the rebuildable artifacts index the sole source of artifact truth.
  - Do not let FileManager open project/runtime artifacts without artifact identity resolution.
owner_hints: [Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md, Plans/FileManager.md]
```
