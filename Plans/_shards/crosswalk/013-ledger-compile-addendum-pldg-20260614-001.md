# Shard 013: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/Crosswalk.md`

Source lines: L3150-L3187

Source SHA256: `26055c82552be4d6c4fd366f4149878c7db0c215e6e0ae58abc863e03ce4caeb`

---

## Ledger Compile Addendum - pldg-20260614-001

### C-049 - Boundary Stub And Route Open Fallback Recovery

```yaml
plan_unit_id: C-049
unit_type: constraint
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  Crosswalk top stubs for coverage blocker, route/open fallback, package/worktree allocation, and boundary maps recover as owner pointers.
  Crosswalk may map boundaries and precedence but must not re-own Contracts route/open primitives, storage records, Executor runtime policy,
  worktree allocation, or Persona/subagent registry semantics.
gui_related: true
gui_classification_reason: Crosswalk boundary maps include GUI route/open and page destination relationships, even though Crosswalk is not a visual implementation doc.
depends_on: [C-001]
unblocks: []
acceptance_criteria:
  - Base route/open primitives landed, but missing: is retired or converted to an owner pointer.
  - coverage blocker headings point to the owner doc that actually owns the blocked behavior.
  - Crosswalk does not preserve stale boundary-map text as peer canon.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Crosswalk owner-pointer review
risk_class: crosswalk_owner_drift
reasoning_tier: standard
context_scope: cross_doc_boundary_map
implementation_surfaces: [Plans/Crosswalk.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: crosswalk_owner_pointer_recovery, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0068
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0073
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0074
preserved_exact_tokens: ["Coverage blocker", "Base route/open primitives landed, but missing:", "route/open fallback", "boundary-map owner pointers"]
negative_constraints:
  - Do not let Crosswalk become the owner for route/open primitives or worktree allocation.
owner_hints: [Plans/Crosswalk.md, Plans/Contracts_V0.md, Plans/WorktreeGitImprovement.md, Plans/Executor_Protocol.md]
```
