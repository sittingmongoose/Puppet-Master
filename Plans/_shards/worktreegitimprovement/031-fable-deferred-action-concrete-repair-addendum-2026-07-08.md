# Shard 031: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5298-L5350

Source SHA256: `427537685ea94d57fca424de8a12cce845132918575bb37aee9cf833a3f49730`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime worktree rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-b3fbf73ded6ce2be14dd9c88`: `worktree_exists` validity checks path existence, `.git` link or gitdir validity, `git rev-parse --is-inside-work-tree`, expected repo id, expected branch/ref when supplied, and permission policy. Result states are `exists_valid`, `missing`, `gitdir_missing`, `wrong_repo`, `wrong_branch`, `permission_denied`, and `unknown_error`.
- Repairs `sfk-be3c6367e06fceee5d56722a`: conflict-worktree persistence uses `worktree_conflict_state.v1:{project_id}:{worktree_id}`. In-memory hints and branch-name derivations are projections only.
- Repairs `sfk-6bbb00970054c395801c3aab`: Source Control graph, AI commit batching, and conflict assistant commands are enabled only when repo identity is valid, worktree status is fresh, no protected-branch mutation is pending, and permission snapshot allows the requested command. Disabled reason codes are `repo_missing`, `status_stale`, `protected_branch`, `permission_denied`, and `operation_in_progress`.

### Source Control graph and AI commit batching payloads and failure results (2026-11-25)

This completes `sfk-6bbb00970054c395801c3aab` for the graph and AI commit batching surfaces (section 4.1); the conflict assistant keeps its own payload rows in `Plans/UI_Command_Catalog.md` ("Source Control review and conflict commands"). The activation rule and disabled reason codes above apply to every command here. Field types: `identity_id` and `timestamp` are the `Plans/source_control_contracts.schema.json` `$defs` of those names; `full_oid` is a full 40- or 64-hex commit object id; `repo_relative_path` is a forward-slash path under the repo root with no `..` segment. Compatibility aliases (`cmd.source_control.graph_focus`, `cmd.source_control.graph_filter`, `cmd.source_control.graph.focus/filter/layout`, `cmd.source_control.suggest_commit_groups`) normalize to the canonical id before payload validation and carry the canonical payload.

**Graph commands.** They change Project view state only, never repository state, refs, the index or files.

| Command | Payload (all fields required unless marked `?`) | Result on success |
|---|---|---|
| `cmd.source_control.graph.focus` | `project_id: identity_id`, `repo_id: identity_id`, `target_kind: "branch" \| "commit" \| "worktree" \| "run"`, `target_ref: string` (branch name, `full_oid`, `worktree_id` or `run_id`, matching `target_kind`), `projection_id?: identity_id` | `outcome: "focused"`, `projection_id: identity_id`, `node_ref: string` (the `source_graph_projection` node now selected) |
| `cmd.source_control.graph.filter` | `project_id`, `repo_id`, `branches?: string[]` (at most 64), `worktree_ids?: identity_id[]` (at most 64), `worktree_overlay: boolean`, `ownership: "any" \| "run_owned" \| "user_owned"`, `status?: ("ahead" \| "behind" \| "diverged" \| "conflicted")[]` | `outcome: "applied"`, `projection_id`, `returned_count: integer >= 0` |
| `cmd.source_control.graph.layout` | `project_id`, `repo_id`, `density: "compact" \| "expanded"` | `outcome: "applied"` |

Graph failure results are `outcome: "failed"` with one `failure_code` from this closed set:

| `failure_code` | When | Retry | How it settles |
|---|---|---|---|
| `payload_invalid` | payload fails the shape above | none | prior focus, filter and layout unchanged |
| `repo_identity_invalid` | `repo_id` does not resolve to the current durable repo identity | none | unchanged; the `repo_missing` disabled reason is shown |
| `target_not_found` | focus target absent from the repo or the current projection | none | prior focus kept; inline reason names the target |
| `projection_stale` | `source_graph_projection.currentness.state` is `stale` or past `expires_at_utc` | one automatic projection refresh, then one retry | if still stale: unchanged, stale banner with a Refresh action |
| `graph_parse_failed` | the repo graph cannot be parsed | none | graph surface degrades to branch list and history (section 4.1 disabled fallback) |

Filter and layout write Project view state only on `applied`; a failed command writes nothing.

**AI commit batching.** Suggestions are advisory and never stage, commit or change the index.

| Command | Payload | Result on success |
|---|---|---|
| `cmd.source_control.suggest_commit_batches` | `project_id`, `repo_id`, `worktree_id: identity_id`, `scope: "staged" \| "unstaged" \| "both"`, `expected_head_oid: full_oid`, `status_generation: integer >= 0`, `max_batches?: integer 1..20` (default 8). Aggressiveness, tone and cross-directory grouping come from the Settings ladder (section 4.1), not the payload. | `outcome: "suggested"` with `suggestion_set_id: identity_id`, `created_at: timestamp`, `batches: [{ batch_id: identity_id, paths: repo_relative_path[]` (at least 1), `hunk_ids?: string[]`, `draft_message: string`, `rationale: string }]` (1 to `max_batches`, no path in two batches); or `outcome: "no_changes"` with an empty `batches` when the scope has no changes |
| `cmd.source_control.accept_commit_group` | `project_id`, `repo_id`, `worktree_id`, `suggestion_set_id`, `batch_id`, `expected_head_oid: full_oid`, `status_generation: integer >= 0` | `outcome: "staged_for_review"`: exactly the batch's paths or hunks are staged through `cmd.git.stage_hunks` and FileSafe validation and its `draft_message` fills the commit box; nothing is committed |

A suggestion set lives in Project view state until accepted, discarded, or superseded by a new set or by a status change (new `HEAD` or `status_generation`), which marks it stale. Batching failure results are `outcome: "failed"` with one `failure_code` from this closed set:

| `failure_code` | Commands | When | Retry | How it settles |
|---|---|---|---|---|
| `payload_invalid` | both | payload fails the shape above | none | nothing changes |
| `status_stale` | both | `HEAD` differs from `expected_head_oid` or `status_generation` is older than current | none automatic; the user refreshes status and runs again | nothing changes; an earlier suggestion set is shown as stale |
| `permission_denied` | both | permission snapshot refuses the command | none | nothing changes; disabled reason `permission_denied` |
| `assistant_unavailable` | suggest | no assistant provider or model is configured or reachable | none automatic; user may run again | nothing changes; manual staging remains available |
| `assistant_failed` | suggest | the model call errors or times out | one automatic retry with the same inputs | if the retry fails: nothing changes, no partial batches are shown |
| `output_invalid` | suggest | model output does not parse into the result shape, names a path outside the scope's diff, or puts a path in two batches | one automatic retry with the same inputs | if the retry fails: nothing changes, no partial batches are shown |
| `suggestion_not_found` | accept | `suggestion_set_id` or `batch_id` is unknown, discarded or stale | none | nothing changes |
| `stage_failed` | accept | the stage step fails (git or FileSafe) | none (section 3.0.1 governs git retries inside the stage step) | the index is restored to its pre-accept state; the suggestion set stays selectable |

Acceptance: (1) each graph command with a valid payload returns its success result and leaves `git status --porcelain` and every ref unchanged; (2) each graph `failure_code` row is produced by its stated cause and leaves prior view state unchanged; (3) `suggest_commit_batches` on a repo with changes returns at least one batch whose paths are all in the scope's diff and the index is unchanged; (4) a forced model timeout yields one retry then `assistant_failed` with no batches shown; (5) changing `HEAD` between suggest and accept yields `status_stale` on accept with the index unchanged; (6) a stage failure during accept restores the pre-accept index.
