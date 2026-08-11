# Shard 030: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5169-L5175

Source SHA256: `88402dbf75591b036b5e9b242a67576bb4d2645329db848ea9b324ca3f2e8910`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime worktree rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-b3fbf73ded6ce2be14dd9c88`: `worktree_exists` validity checks path existence, `.git` link or gitdir validity, `git rev-parse --is-inside-work-tree`, expected repo id, expected branch/ref when supplied, and permission policy. Result states are `exists_valid`, `missing`, `gitdir_missing`, `wrong_repo`, `wrong_branch`, `permission_denied`, and `unknown_error`.
- Repairs `sfk-be3c6367e06fceee5d56722a`: conflict-worktree persistence uses `worktree_conflict_state.v1:{project_id}:{worktree_id}`. In-memory hints and branch-name derivations are projections only.
- Repairs `sfk-6bbb00970054c395801c3aab`: Source Control graph, AI commit batching, and conflict assistant commands are enabled only when repo identity is valid, worktree status is fresh, no protected-branch mutation is pending, and permission snapshot allows the requested command. Disabled reason codes are `repo_missing`, `status_stale`, `protected_branch`, `permission_denied`, and `operation_in_progress`.
