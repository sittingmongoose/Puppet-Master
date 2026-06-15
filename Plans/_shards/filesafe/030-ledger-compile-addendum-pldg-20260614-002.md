# Shard 030: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/FileSafe.md`

Source lines: L12991-L13031

Source SHA256: `a6b5f0771f4c81b7be36175e9a953bd7e97567c623f65ddfbedc4901084e3cd3`

---

## Ledger Compile Addendum - pldg-20260614-002

### F2-188 - Shared Mutation Session Guard Inputs

```yaml
plan_unit_id: F2-188
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: >-
  FileSafe owns the guard inputs for shared mutation sessions spanning user edits, agent edits,
  preview edits, and FileManager operations. A mutation session must carry session_id, actor/runtime_identity,
  project/package/seam/lane/worktree scope, target refs, baseline hash or version, dirty-state snapshot,
  watcher snapshot, trust/degraded state, preview trust state, LSP/index availability, remote/offline/cache
  state, permission result, conflict policy, evidence refs, and rollback/safe-point refs before mutation
  actions proceed.
gui_related: false
gui_classification_reason: FileSafe mutation guard inputs are filesystem/runtime safety contracts, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - User, agent, preview, and FileManager edits share one mutation-session guard model.
  - Mutation sessions capture trust, degraded, offline/cache, watcher, LSP/index, permission, conflict, evidence, and rollback inputs.
  - FileManager actions cannot bypass FileSafe guard inputs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: mutation_safety_boundary_drift
reasoning_tier: high
context_scope: filesafe_shared_mutation_session
implementation_surfaces: [Plans/FileSafe.md, Plans/FileManager.md, Plans/GitHub_Integration.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: filesafe_mutation_session_guard, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0082
  - pldg-20260614-002-part-3-fable-cleanup:atom-0083
preserved_exact_tokens: ["FileSafe-adjacent mutation seams", "user/agent/preview edits", "remote cache/offline/LSP degraded states", "watcher behavior", "preview trust/fallback"]
negative_constraints:
  - Do not let FileManager mutation actions bypass FileSafe mutation-session guard inputs.
  - Do not treat preview edits or agent edits as separate safety models.
owner_hints: [Plans/FileSafe.md, Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/GitHub_Integration.md]
```
