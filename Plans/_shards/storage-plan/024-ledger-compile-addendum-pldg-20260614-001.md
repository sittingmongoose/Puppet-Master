# Shard 024: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/storage-plan.md`

Source lines: L14837-L14877

Source SHA256: `146be3782a1289e0ab7027b950b1f261d6a0e0802ddc6da7732b684ec53664d5`

---

## Ledger Compile Addendum - pldg-20260614-001

### SP-213 - Projection Rehydration Artifact Index And Lane Cleanup Header Recovery

```yaml
plan_unit_id: SP-213
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan top owner headers for projection fields used by startup rehydration, artifacts-index fields, lane-cleanup lineage, bridge-field
  precedence, and related owner sections hydrate from existing SP PlanUnits and body sections. Recovery must preserve durable event/projection
  ownership without inventing new storage record families.
gui_related: false
gui_classification_reason: Storage projection and durable record ownership are backend persistence contracts.
depends_on: [SP-035, SP-037, SP-038]
unblocks: []
acceptance_criteria:
  - Startup rehydration projection fields map to existing durable storage/projector ownership.
  - artifacts-index fields and lane-cleanup lineage resolve to storage and runtime owner records.
  - Bridge-field precedence is recorded as storage owner behavior or a consumer pointer, not a dangling header.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual storage owner-section review
risk_class: storage_owner_stub_loss
reasoning_tier: standard
context_scope: storage_owner_section_recovery
implementation_surfaces: [Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: storage_owner_section_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0013
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0066
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0067
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0073
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0074
preserved_exact_tokens: ["projection fields for startup rehydration", "artifacts-index fields", "lane-cleanup lineage", "bridge-field precedence", "allowed_actions[]"]
negative_constraints:
  - Do not create new storage record families solely to fill old stub headings.
  - Do not preserve allowed_actions[] as a live blocked/HITL storage contract.
owner_hints: [Plans/storage-plan.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/Orchestrator_Page.md]
```
