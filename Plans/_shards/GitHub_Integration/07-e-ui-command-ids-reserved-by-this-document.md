## E. UI Command IDs Reserved by This Document

All new UICommand IDs defined by this spec MUST be added to `Plans/UI_Command_Catalog.md`
before implementation. IDs inherited from the existing catalog are marked *(existing)*.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, Invariant:INV-007, Invariant:INV-012

| Command ID | Section | Args schema (keys only) | Expected events / notes |
|---|---|---|---|
| `cmd.github.connect` | §B.1, §D.1, §D.3 | `{}` | *(existing)* device-code flow |
| `cmd.github.disconnect` | §B.1 | `{}` | *(existing)* token removal |
| `cmd.git.stage` | §A.2, §A.4 | `{ paths: string[] }` | no persisted domain event (index update) |
| `cmd.git.unstage` | §A.2, §A.4 | `{ paths: string[] }` | no persisted domain event (index update) |
| `cmd.git.discard` | §A.2 | `{ paths: string[] }` | no persisted domain event (working-tree restore) |
| `cmd.git.diff_open` | §A.3 | `{ path: string }` | no persisted domain event (UI panel open) |
| `cmd.git.diff_toggle_mode` | §A.3 | `{ mode: "side_by_side" \| "unified" }` | no persisted domain event (UI state toggle) |
| `cmd.git.commit` | §A.4 | `{ message: string, body?: string, amend?: boolean }` | `git.commit.completed` |
| `cmd.git.push` | §A.4 | `{ remote?: string, branch?: string }` | `git.push.completed` or `git.push.failed` |
| `cmd.git.pull` | §A.4 | `{ strategy?: "rebase" \| "merge" }` | `git.pull.completed` or `git.pull.failed` |
| `cmd.git.sync` | §A.4 | `{}` | pull then push events |
| `cmd.git.fetch` | §A.4 | `{}` | no persisted domain event (remote ref update) |
| `cmd.git.branch_switch` | §A.4 | `{ branch: string, stash?: boolean, discard?: boolean }` | `git.branch.switched` |
| `cmd.git.branch_create` | §A.4 | `{ name: string, from?: string }` | `git.branch.created` |
| `cmd.git.stash_push` | §A.4 | `{ message?: string }` | `git.stash.pushed` |
| `cmd.git.stash_list` | §A.4 | `{}` | no persisted domain event (UI dropdown populate) |
| `cmd.git.stash_pop` | §A.4 | `{ index: integer }` | `git.stash.popped` or `git.stash.conflict` |
| `cmd.github.pr_list` | §B.2 | `{}` | no persisted domain event (API fetch + cache) |
| `cmd.github.pr_detail` | §B.2 | `{ pr_number: integer }` | no persisted domain event (API fetch + cache) |
| `cmd.github.issue_list` | §B.2 | `{}` | no persisted domain event (API fetch + cache) |
| `cmd.github.actions_list` | §B.3 | `{}` | no persisted domain event (API fetch + cache) |
| `cmd.github.actions_run_detail` | §B.3 | `{ run_id: integer }` | no persisted domain event (API fetch) |
| `cmd.github.actions_job_expand` | §B.3 | `{ job_id: integer }` | no persisted domain event (UI expand) |
| `cmd.github.actions_view_logs` | §B.3 | `{ job_id: integer }` | no persisted domain event (log fetch) |
| `cmd.github.actions_download_log` | §B.3 | `{ run_id: integer }` | no persisted domain event (file download) |
| `cmd.ssh.remote_add` | §C.1 | `{}` | `ssh.remote.added` |
| `cmd.ssh.remote_edit` | §C.2 | `{ id: string }` | `ssh.remote.updated` |
| `cmd.ssh.remote_remove` | §C.2 | `{ id: string }` | `ssh.remote.removed` |
| `cmd.ssh.remote_test` | §C.2 | `{ id: string }` | `ssh.remote.test_result` |
| `cmd.ssh.remote_set_active` | §C.2 | `{ id: string }` | `ssh.remote.active_changed` |
| `cmd.project.add_existing` | §D.1 | `{ path?: string, ssh_remote_id?: string, ssh_path?: string }` | `project.added` |
| `cmd.project.new_local` | §D.2 | `{ name: string, parent_path: string, init_git?: boolean, preset?: string }` | `project.created` |
| `cmd.project.new_github_repo` | §D.3 | `{ name: string, description?: string, private: boolean, ... }` | `project.created`, `git.clone.completed` |
| `cmd.project.open` | §D.1, §D.2, §D.3 | `{ project_id: string }` | no persisted domain event (navigation) |
| `cmd.project.chain_wizard_open_deferred` | §D.1, §D.2, §D.3 | `{ project_id: string, wizard_id: string, default_intent: string, project_path: string, remote_repo_ref?: object, deferred_wizard_payload_ref?: string }` | `wizard.opened`, `wizard.deferred_payload.loaded` |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, Invariant:INV-007, Invariant:INV-011, Invariant:INV-012, Gate:GATE-010

---

