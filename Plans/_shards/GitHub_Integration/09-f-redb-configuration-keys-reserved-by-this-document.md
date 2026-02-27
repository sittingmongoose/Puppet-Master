## F. redb Configuration Keys Reserved by This Document

All `ConfigKey` entries below MUST be registered in `Plans/storage-plan.md` before
implementation. All are stored in redb; NONE contain secrets.

ContractRef: ContractName:Plans/storage-plan.md, Invariant:INV-002, PolicyRule:no_secrets_in_storage

| Config key | Type | Default | Description |
|---|---|---|---|
| `git_panel/diff_view_mode/{project_id}` | string enum | `side_by_side` | Per-project diff view preference |
| `git_panel/pull_strategy/{project_id}` | string enum | `rebase` | Per-project pull strategy (`rebase` or `merge`) |
| `git_panel/fetch_interval_s/{project_id}` | integer | `300` | Background fetch interval in seconds (min: 60, max: 3600) |
| `git_panel/base_branch/{project_id}` | string | `main` | Default base branch for PR creation |
| `github_panel/cache_ttl_s` | integer | `60` | TTL for GitHub API panel cache (PR, Issues) |
| `github_panel/features/{project_id}` | JSON object | `{\"pr\":true,\"issues\":true}` | Per-project enable flags for PR and Issues panels |
| `github_actions/refresh_interval_s` | integer | `30` | Actions panel auto-refresh interval (min: 10, max: 300) |
| `ssh_remotes/{id}` | JSON object | *(n/a)* | Saved SSH remote record (no secrets) |

ContractRef: ConfigKey:git_panel/diff_view_mode, ConfigKey:git_panel/pull_strategy, ConfigKey:git_panel/fetch_interval_s, ConfigKey:git_panel/base_branch, ConfigKey:github_panel/cache_ttl_s, ConfigKey:github_panel/features, ConfigKey:github_actions/refresh_interval_s, ConfigKey:ssh_remotes

---

