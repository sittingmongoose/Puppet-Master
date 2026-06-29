# Shard 030: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/FileSafe.md`

Source lines: L12991-L13033

Source SHA256: `a5accb4520ca02a69950e4747c4744401bc017a0ee29be60a1e0bda5d15b1223`

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
  preview edits, and FileManager operations. A mutation session must carry mutation_id, session_id,
  actor/runtime_identity, source_surface, project/package/seam/lane/worktree scope, file identity/path,
  target refs, base version/digest, baseline hash or version, operation type, dirty-state snapshot,
  watcher snapshot, trust/degraded state, preview/trust mode, preview trust state, LSP/index availability,
  remote/offline/cache/LSP/watch state, permission result, conflict policy, resulting version/digest,
  artifact/evidence refs, and rollback/recovery or safe-point refs before mutation actions proceed.
gui_related: false
gui_classification_reason: FileSafe mutation guard inputs are filesystem/runtime safety contracts, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - User, agent, preview, and FileManager edits share one mutation-session guard model.
  - Mutation sessions capture mutation_id, operation type, base and resulting version/digest, trust, degraded, offline/cache, watcher, LSP/index, permission, conflict, artifact/evidence, and rollback inputs.
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
preserved_exact_tokens: ["FileSafe-adjacent mutation seams", "versioned mutation session contract", "user/agent/preview edits", "mutation_id", "actor/runtime_identity", "source_surface", "file identity/path", "base version/digest", "operation type", "preview/trust mode", "remote/offline/cache/LSP/watch state", "conflict policy", "resulting version/digest", "artifact/evidence refs", "rollback/recovery path", "remote cache/offline/LSP degraded states", "watcher behavior", "preview trust/fallback"]
negative_constraints:
  - Do not let FileManager mutation actions bypass FileSafe mutation-session guard inputs.
  - Do not treat preview edits or agent edits as separate safety models.
  - Do not omit artifact/evidence refs or resulting version/digest from mutation-session guard outcomes.
owner_hints: [Plans/FileSafe.md, Plans/FileManager.md, Plans/FinalGUISpec.md, Plans/GitHub_Integration.md]
```
