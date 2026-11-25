# Shard 031: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5298-L5357

Source SHA256: `0c1b687ef18e4d7f81250416ac53304eeb219c6257bf4adb8121be4cd9fe98c8`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime worktree rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-b3fbf73ded6ce2be14dd9c88`: `worktree_exists` validity checks path existence, `.git` link or gitdir validity, `git rev-parse --is-inside-work-tree`, expected repo id, expected branch/ref when supplied, and permission policy. Result states are `exists_valid`, `missing`, `gitdir_missing`, `wrong_repo`, `wrong_branch`, `permission_denied`, and `unknown_error`.
- Repairs `sfk-be3c6367e06fceee5d56722a`: conflict-worktree persistence uses `worktree_conflict_state.v1:{project_id}:{worktree_id}`. In-memory hints and branch-name derivations are projections only.
- Repairs `sfk-6bbb00970054c395801c3aab`: Source Control graph, AI commit batching, and conflict assistant commands are enabled only when repo identity is valid, worktree status is fresh, no protected-branch mutation is pending, and permission snapshot allows the requested command. Disabled reason codes are `repo_missing`, `status_stale`, `protected_branch`, `permission_denied`, and `operation_in_progress`.

### Source Control graph and AI commit batching payloads and failure results (2026-11-25)

This completes `sfk-6bbb00970054c395801c3aab` for the graph and AI commit batching surfaces (section 4.1); the conflict assistant keeps its own payload rows in `Plans/UI_Command_Catalog.md` ("Source Control review and conflict commands"). The activation rule and disabled reason codes above apply to every command here. Field types: `identity_id` and `timestamp` are the `Plans/source_control_contracts.schema.json` `$defs` of those names; `full_oid` is a full 40- or 64-hex commit object id; `repo_relative_path` is a forward-slash path under the repo root with no `..` segment. Compatibility aliases (`cmd.source_control.graph_focus`, `cmd.source_control.graph_filter`, `cmd.source_control.graph.focus/filter/layout`, `cmd.source_control.suggest_commit_groups`) normalize to the canonical id before payload validation and carry the canonical payload.

**Wire contract.** These tables are the plain-language view of the strict schemas that `Plans/Wiring_Matrix.production.json` (rows `catalog.source_control_graph_focus_canonical`, `catalog.source_control_graph_filter_canonical`, `catalog.source_control_graph_layout`, `catalog.source_control_suggest_commit_batches`, `catalog.source_control_accept_commit_group` and their alias rows) and `Plans/projects_refresh_command_bindings.json` bind to these commands; where the two differ, the schema wins.
- Request: `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request_v2`, whose union admits one branch per canonical command: `source_graph_focus_request_v2`, `source_graph_filter_request_v2`, `source_graph_layout_request_v2`, `commit_batch_suggest_request_v2` and `commit_batch_accept_request_v2`. Each branch is `additionalProperties: false` and carries `schema_id: "pm.source_control.command_request.v2"`, `schema_version: "2.0.0"`, `command_id` (the canonical id), the payload fields in the tables below, `idempotency_key` and `return_context_ref`. These five ids are not members of the nineteen-value `source_control_command_id` enum and do not use the `legacy_exact` variant. A request that fails the schema is refused at dispatch with the wiring row's `UICommandError` and produces no result; the `payload_invalid` failure code below covers only the checks the schema cannot express (for example a `target_ref` that does not resolve for its `target_kind`, or a path in two batches).
- Result: `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result_v2` with `command_id` (canonical), `operation_id`, `status`, `owner_result_ref`, `inspection: null`, `local_config_before_sha256: null`, `local_config_after_sha256: null`, `native_result_evidence` (null except where accept records Git stage evidence), `network_effect_performed: false` and `return_context_ref`. The `outcome`, `failure_code` and per-command fields in the tables below are the owner result `source_view_command_owner_result_v1` (same schema file) that `owner_result_ref` names; batches are `commit_batch_v1`.
- `status` mapping: every success outcome (`focused`, `applied`, `suggested`, `no_changes`, `staged_for_review`) is `succeeded`; `failed` with `repo_identity_invalid`, `projection_stale`, `status_stale` or `permission_denied` is `blocked`; `failed` with `backend_unsupported` is `unsupported`; every other `failed` is `failed`; a stage step whose own result reports effect unknown makes the accept result `unknown`.
- Effect: each dispatch records its `<command id>.dispatch_receipt` no-persist receipt, and `expected_event_types` stays `[]`.

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
| `cmd.source_control.suggest_commit_batches` | `project_id`, `repo_id`, `worktree_id: identity_id`, `scope: "staged" \| "unstaged" \| "both"`, `expected_head_oid: full_oid`, `status_generation: integer >= 0`, `max_batches?: integer 1..20` (default 8). Aggressiveness, tone and cross-directory grouping come from the Settings ladder (section 4.1), not the payload. | `outcome: "suggested"` with `suggestion_set_id: identity_id`, `created_at: timestamp`, `batches: [{ batch_id: identity_id, paths: repo_relative_path[]` (whole files), `hunk_selections: [{ path: repo_relative_path, hunk_ids: string[]` (at least 1) `}]`, `draft_message: string`, `rationale: string }]` (1 to `max_batches`; each batch has at least one entry in `paths` or `hunk_selections`; a path appears once per batch and in no other batch); or `outcome: "no_changes"` with an empty `batches` when the scope has no changes |
| `cmd.source_control.accept_commit_group` | `project_id`, `repo_id`, `worktree_id`, `suggestion_set_id`, `batch_id`, `expected_head_oid: full_oid`, `status_generation: integer >= 0` | `outcome: "staged_for_review"`: exactly the batch is staged after FileSafe validation, its `draft_message` fills the commit box, and nothing is committed. Whole-file `paths` are staged by one `cmd.git.stage` request with those `paths[]` (`Plans/git_adapter_command_contracts.schema.json` `git_command_request`); each `hunk_selections` entry is staged by one `cmd.git.stage_hunks { path, hunk_ids }`. A whole-file path is never routed through a hunk command (UCC-167). The result lists one `stage_result_refs` entry per stage step. Accept is Git-only; on a Jujutsu workspace it fails with `backend_unsupported` |

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
| `stage_failed` | accept | a `cmd.git.stage` or `cmd.git.stage_hunks` step fails (git or FileSafe) | none (section 3.0.1 governs git retries inside the stage step) | the index is restored to its pre-accept state; the suggestion set stays selectable |
| `backend_unsupported` | accept | the worktree's backend is Jujutsu, so Git staging does not apply (UCC-167 forbids routing Git staging through Jujutsu) | none | nothing changes; status `unsupported` |

Acceptance: (1) each graph command with a valid payload returns its success result and leaves `git status --porcelain` and every ref unchanged; (2) each graph `failure_code` row is produced by its stated cause and leaves prior view state unchanged; (3) `suggest_commit_batches` on a repo with changes returns at least one batch whose paths are all in the scope's diff and the index is unchanged; (4) a forced model timeout yields one retry then `assistant_failed` with no batches shown; (5) changing `HEAD` between suggest and accept yields `status_stale` on accept with the index unchanged; (6) a stage failure during accept restores the pre-accept index; (7) accepting a batch with only whole-file `paths` (including an untracked and a binary file) dispatches exactly one `cmd.git.stage` and no `cmd.git.stage_hunks`, and a batch with only `hunk_selections` dispatches one `cmd.git.stage_hunks` per entry and no `cmd.git.stage`; (8) every request and result for these commands validates against `source_control_command_request_v2` and `source_control_command_result_v2`, and every `owner_result_ref` target against `source_view_command_owner_result_v1`, with `scripts/pm-new-contracts-verify.py` passing.
