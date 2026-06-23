# Shard 029: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5059-L5102

Source SHA256: `072b3bf41dc46105969f722a12a0f56c7f9d3d2408d4df2fecb7c4921fb16b1d`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### W-074 - Discovery Remote Worktree Authority And No Local Substitution

```yaml
plan_unit_id: W-074
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  WorktreeGitImprovement owns the repo, branch, worktree, SSH root, and remote project authority boundary consumed by DiscoveryService. Discovery keeps local worktrees, branches, SSH roots, requested_remote_identity, effective_remote_identity, host/root/repo/branch/worktree refs, and cache provenance separate. SSH discovery must pass for a project with no local checkout and must never substitute download-edit-upload authority or an unrelated local path for authorized remote identity/path verification.
gui_related: false
gui_classification_reason: This is repository/worktree/remote authority, not visual presentation.
depends_on: [W-017, W-072, W-073, SP-218, F2-191, PS-118]
unblocks: [ATS-011, GI-033]
acceptance_criteria:
  - Discovery receipts distinguish requested and effective local/remote identity.
  - Branch/worktree switches cannot reuse stale wrong-branch discovery indexes as fresh truth.
  - Exact verification cannot use unrelated local paths for remote or SSH-selected results.
validation_surfaces:
  - Future wrong-branch cache invalidation test.
  - Future SSH no-local-checkout discovery and verification test.
risk_class: remote_worktree_authority_drift
reasoning_tier: high
context_scope: repo_worktree_remote_identity
implementation_surfaces: [Plans/WorktreeGitImprovement.md, future DiscoveryService remote identity resolver]
node_compile_hint: {mode: worktree_remote_authority, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0054
  - pldg-20260622-001-fff:atom-0061
  - pldg-20260622-001-fff:atom-0069
  - pldg-20260622-001-fff:atom-0070
  - pldg-20260622-001-fff:atom-0079
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:state/doc_impact_matrix.json#DIM-005
source_atom_ids: [atom-0054, atom-0061, atom-0069, atom-0070, atom-0079, atom-0085, atom-0091]
preserved_exact_tokens: ["SSH roots", "requested_remote_identity", "effective_remote_identity", "no local checkout", "no download-edit-upload authority", "no silent local fallback", "branch/worktree ref"]
negative_constraints:
  - Do not collapse remote and local identities.
  - Do not verify SSH discovery results against unrelated local checkouts.
  - Do not make discovery imply implementation worktree creation or execution safe points.
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/storage-plan.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```
