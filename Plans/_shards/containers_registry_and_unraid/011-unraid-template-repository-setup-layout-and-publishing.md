# Shard 011: Unraid template repository setup, layout, and publishing

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L743-L858

Source SHA256: `2ff2c1c3c77b3bf336b1d850e592224678e440f82c74e59596393707ac79272b`

---

## Unraid template repository setup, layout, and publishing

### Managed template-repo identity and lifecycle contract

#### Default identity rules


When the user chooses **create new template repo**, Puppet Master defaults to:

- **repo name:** `<project_slug>-unraid-template`
- **default branch:** `main`
- **local managed working copy:** `.puppet-master/unraid-template-repos/<project_id>/`
- **template path inside repo:** `<maintainer_slug>/<project_slug>.xml`
- **maintainer profile path:** `ca_profile.xml`

The user may override repo name, branch, local path, and maintainer slug during setup.

#### Existing-repo selection validation

When the user chooses **select existing template repo**, Puppet Master MUST validate:

1. the path/repo is reachable
2. the repo root is writable locally
3. the selected branch exists or can be created explicitly
4. the repo either already matches the required layout or can be migrated with explicit user confirmation
5. the repo does not contain uncommitted unrelated changes unless the user explicitly adopts the repo in its current state

If validation fails, Puppet Master MUST keep managed publishing disabled for that project and show the exact failing condition.

#### Template-repo status enum

The template-repo status row MUST use one canonical state model:

| State | Meaning | User-visible consequence |
|---|---|---|
| `unconfigured` | Managed publishing enabled but no repo has been set up yet | Show setup CTA |
| `config_invalid` | Repo/path/branch settings exist but validation failed | Block publish follow-on push; show remediation |
| `clean` | Repo is configured and has no pending local changes | Ready for next generation/update |
| `dirty_uncommitted` | Managed files changed locally and are not yet committed | Auto-commit may run if changes are PM-owned and safe |
| `committed_local_only` | Latest managed change is committed locally but not yet pushed | Show one-click push CTA |
| `push_in_progress` | Remote push is running | Disable duplicate push actions |
| `push_failed` | Remote push failed after local commit | Preserve local commit; show retry CTA and error |
| `diverged_remote` | Remote branch changed or local branch is behind/ahead unexpectedly | Block auto-push; require review/reconcile |
| `needs_review` | Generated template/profile content is incomplete or review-blocked | Allow local inspection/editing; block auto-push |

#### Transition rules

- After successful image publish, Puppet Master generates or updates the managed XML artifacts.
- If managed publishing is enabled and validation passes, Puppet Master MAY auto-commit the change by default.
- `needs_review` is entered when required review fields are missing (`support_url`, `overview_markdown`, `icon_source`) or when existing XML cannot be mapped safely without preserving passthrough content.
- `needs_review` is cleared only when a regeneration pass or explicit user save produces a template/profile with all review-required fields present and no unmapped-field warning remains.
- When `needs_review` clears, the next state is:
  - `dirty_uncommitted` if managed files changed locally
  - `clean` if no local managed diff remains
- PM-owned paths are exactly:
  - `ca_profile.xml`
  - `<maintainer_slug>/<project_slug>.xml`
  - `assets/maintainer/**` written in the current generation pass
- Auto-commit is allowed only when the working-tree diff is fully contained within the PM-owned path set for the current generation pass.
- Any unrelated tracked or untracked file change blocks auto-commit and surfaces a `Review repo state` CTA.
- Auto-commit MUST stop and surface review instead of committing when:
  - repo status is `config_invalid`, `diverged_remote`, or `needs_review`
  - unrelated uncommitted files exist in the repo
  - required managed paths cannot be updated deterministically
- A successful local auto-commit transitions the repo to `committed_local_only`.
- One-click push transitions `committed_local_only -> push_in_progress -> clean` on success.
- A failed push transitions `push_in_progress -> push_failed` and MUST preserve the local commit for retry.
- `diverged_remote` exits only after the user resolves the branch divergence externally or through a future dedicated reconcile flow and Puppet Master re-validates the repo state.

`commit_status` enum:
- `not_attempted`
- `committed`
- `skipped_review_required`
- `skipped_unrelated_changes`
- `failed`

`push_status` enum:
- `not_attempted`
- `skipped_auto_push_disabled`
- `push_in_progress`
- `completed`
- `failed`

#### Dirty-repo safety rule

If the selected repo already contains unrelated local modifications, Puppet Master MUST NOT silently fold managed template changes into that worktree state. It MUST require one of:

- user cleans the repo first
- user explicitly adopts the dirty repo state
- user switches to a different managed repo path

This prevents the managed workflow from mutating unrelated maintainer work without review.

### Setup flow
When managed Unraid template-repo publishing is enabled and no template repo is configured yet, Puppet Master must offer both:
- creating a new template repo automatically
- selecting an existing template repo

### Default repo shape
- default: one template repo per project

### Default layout
For managed per-project template repos, use:
- root-level `ca_profile.xml`
- maintainer folder
- `project-name.xml` inside that maintainer folder

### Maintainer folder source
- default the maintainer folder name to the project’s DockerHub namespace
- allow the user to override it with a custom maintainer slug

### Commit and push behavior
- auto-commit template-repo changes by default
- auto-push remains configurable but default disabled
- expose a one-click push action in the UI after commit
- present template-repo dirty / committed / ready-to-push status in the Docker Manager surface
