# Shard 030: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/FileSafe.md`

Source lines: L13466-L13540

Source SHA256: `89becad1a1bce7ab45ca2d49609e6364167aa8470ed0165926afcbd64e400f2c`

---

## Ledger Compile Addendum - pldg-20260614-002

### F2-188 - Shared Mutation Session Guard Inputs

```yaml
plan_unit_id: F2-188
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: Shared mutation sessions retain every existing actor/source/file/target/version/dirty/watch/trust/conflict/result/rollback
  field and add a discriminated application-or-Project scope. App mutation binds null project_id, actual thread/run/Computer/Host/Environment,
  working root and recorded absolute file identity; Project work retains exact Project/package/seam/lane/worktree
  when present. Admission snapshots and pre-write safe points are required before mutation; conversion never
  relabels an old session or override as destination authority.
gui_related: false
gui_classification_reason: FileSafe mutation guard inputs are filesystem/runtime safety contracts, not visual
  presentation.
depends_on:
- CV-281
- F2-213
unblocks: []
acceptance_criteria:
- User, agent, preview, and FileManager edits share one mutation-session guard model.
- Mutation sessions capture mutation_id, operation type, base and resulting version/digest, trust, degraded,
  offline/cache, watcher, LSP/index, permission, conflict, artifact/evidence, and rollback inputs.
- FileManager actions cannot bypass FileSafe guard inputs.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: mutation_safety_boundary_drift
reasoning_tier: high
context_scope: filesafe_shared_mutation_session
implementation_surfaces:
- Plans/FileSafe.md
- Plans/FileManager.md
- Plans/GitHub_Integration.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: filesafe_mutation_session_guard
  create_worknodes: false
source_lineage:
- pldg-20260614-002-part-3-fable-cleanup:atom-0082
- pldg-20260614-002-part-3-fable-cleanup:atom-0083
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards N6/N25
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "Plan mode and scheduled
  tasks are also available in no project. It''s only planning wizard/prd builder/orchestrator that isn''t."'
preserved_exact_tokens:
- FileSafe-adjacent mutation seams
- versioned mutation session contract
- user/agent/preview edits
- mutation_id
- actor/runtime_identity
- source_surface
- file identity/path
- base version/digest
- operation type
- preview/trust mode
- remote/offline/cache/LSP/watch state
- conflict policy
- resulting version/digest
- artifact/evidence refs
- rollback/recovery path
- remote cache/offline/LSP degraded states
- watcher behavior
- preview trust/fallback
negative_constraints:
- Do not let FileManager mutation actions bypass FileSafe mutation-session guard inputs.
- Do not treat preview edits or agent edits as separate safety models.
- Do not omit artifact/evidence refs or resulting version/digest from mutation-session guard outcomes.
owner_hints:
- Plans/FileSafe.md
- Plans/FileManager.md
- Plans/FinalGUISpec.md
- Plans/GitHub_Integration.md
```
