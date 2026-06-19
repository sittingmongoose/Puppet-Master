# Shard 009: Source Control, GitHub Actions, and Docker Manager Ownership Addendum (2026-03-12)

Source: `Plans/Crosswalk.md`

Source lines: L417-L478

Source SHA256: `78a37585e81a05216af1f0ed3179f18c73a400cd1b7c006405d34e6d1643ecb0`

---

## Source Control, GitHub Actions, and Docker Manager Ownership Addendum (2026-03-12)

### SourceControlSurface

Owner: `Plans/GitHub_Integration.md` + `Plans/WorktreeGitImprovement.md`.

Rules:
- Git-local and Git-remote repo operations, history, graph, stash, conflicts, and worktree UX belong to Source Control.
- GitHub-hosted workflow/admin behavior does not belong to Source Control.
- Remote-first project-mode consequences route through the Source Control and SSH owner chain: `GitHub_Integration.md §C` owns remote git execution, reconnect budget, and SSH subprocess behavior, while FileManager, LSP, terminal, and GUI surfaces consume the remote project mode without silently substituting local files, local git, or local shells.
- Worktree lifecycle correctness remains owned by the worktree plan even when surfaced through Source Control.
- `Worktrees` remains the Source Control subview name for worktree-row-first routing; row metadata must include package/lane/run ownership and lifecycle state.
- Source Control and GitHub worktree views stay /worktree-centric while attaching package-lane and /seam/lane-aware visibility; legacy run/tier row ownership is compatibility metadata, not the shared worktree identity model. Archive and /prune/remove cleanup is gated by active-run ownership, unresolved blocked recovery, safe-point restore targeting that exact worktree/baseline, unresolved conflict inspection, and newer lineage operations depending on the lane/worktree.
- `Plans/WorktreeGitImprovement.md` owns `worktree_id`, base-branch, and worktree lifecycle semantics; canonical blocked-emitter behavior routes through Contracts and runtime owner docs instead of being inferred from Source Control rows.
- Source Control reconciles the legacy split across `FinalGUISpec`, `GitHub_Integration`, and `WorktreeGitImprovement`; `Git (GitHub)` is a migration alias only, and live `/surfaces` route through Source Control plus WorktreeGitImprovement rather than preserving a combined Git/GitHub panel.
- Direct git/diff command anchors are owned by `GitHub_Integration.md`: `cmd.git.stage`, `cmd.git.unstage`, `cmd.git.discard`, `cmd.git.diff_open`, and `cmd.git.diff_toggle_mode`. Chat rollback/recovery anchors such as `cmd.chat.rewind` and `cmd.chat.revert` remain owned by `UI_Command_Catalog.md`; Crosswalk only routes the boundary between git-native Source Control actions and chat-owned recovery commands.
- Per-project Source Control panel state, GitHub Actions panel state, richer Docker Manager state, and run receipts spanning SCM/Actions/Docker/Kubernetes are not underdefined local UI extras. They route through this Crosswalk as `/Actions/Docker/Kubernetes` ownership boundaries, then to the feature owners listed in this addendum.
- Orchestrator, Dashboard, history, and graph cards may expose cross-surface actions named exactly `Open in Source Control`, `Open in GitHub Actions`, and `Open in Docker Manager` when canonical context exists. The same actions are used by blocked cards and destination panels so requested action and effective outcome remain explainable.
- The canonical `panel-switch` navigation contract uses a shared `panel-context` envelope instead of panel-local ad hoc arguments. Every cross-surface deep link carries `project_id`; Source Control adds `repo_id`, `worktree_id`, optional `branch`, optional `commit`, optional `compare_target`, and optional `conflict_file`; GitHub Actions adds `repo_remote`, optional `workflow_id`, optional `run_id`, optional `job_id`, optional `step_id`, and optional `branch`; Docker Manager adds `runtime`, optional `context_name`, optional `compose_project`, optional `container_id`, optional `image_ref`, optional `registry_host`, optional `publish_result_id`, and optional Kubernetes context fields.
- `receipt-extension` payloads for SCM, Actions, Docker, Kubernetes, `/registry/Kubernetes/SSH`, and `/index/reference` flows extend the shared runtime `receipt` and blocked-payload packet with domain `capability` and identity refs; they do not create a second receipt, navigation, or index owner.
- Compatibility shorthands such as `/local-git` and `/worktree/push` route through `Primitive:PatchPipeline` and the Source Control owner docs. `conflict-precedence` follows this Crosswalk precedence plus the feature owner docs rather than consumer help text.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md

### GitHubActionsSurface

Owner: `Plans/GitHub_Integration.md` with auth/runtime constraints from `Plans/GitHub_API_Auth_and_Flows.md`.

Rules:
- GitHub Actions uses GitHub API identity and capability, not Git transport state, for hosted workflow/admin behavior.
- Current Branch / Workflows / Settings are separate subviews of one Actions surface.
- `GitHub API` remains hidden plumbing used by GitHub-hosted features; GitHub Actions owns hosted workflow runs, dispatch, run triage, Actions admin/settings, readiness constraints inherited from `newtools.md`, and reusable doctor IDs/result payloads rather than exposing API plumbing as a user panel.
- Final GUI migration labels such as `Git (GitHub)` and separate activity-bar entries for Docker or Source Control are routing aliases, not owner changes; Crosswalk resolves them to Source Control, GitHub Actions, and Docker Manager owners before wiring commands or state.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md

### DockerManagerSurface

Owner: `Plans/Containers_Registry_and_Unraid.md` with readiness/result minima from `Plans/newtools.md`.

Rules:
- Docker Manager is the canonical umbrella for Docker, Podman, registries/Docker Hub, compose, build/bake, Publish / Unraid, and project-focused Kubernetes.
- Docker Manager is the umbrella for Docker/Podman/Kubernetes; `/Podman/Kubernetes` wording is a compatibility shorthand for alternate runtime plus project-focused Kubernetes subview ownership, not separate shell ownership.
- Unraid and Kubernetes are not required top-level shell surfaces for MVP.
- Docker Manager owns `/runtime/build/publish`, `/build/compose/registry/publish/Kubernetes`, and runtime/build/compose/registry/publish/Kubernetes project operations while reusing `newtools.md` doctor IDs and Docker publish/auth result payload shapes instead of inventing parallel IDs.
- Crosswalk routes Docker Manager persistence as global settings plus project-scoped state: subview, `/runtime/context`, and Kubernetes `/context/workload` focus are durable owner-handled state, while transient runtime observations remain projections owned by storage/runtime docs.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md

### External Reference Baselines

Additional external references beyond the user-supplied repos remain useful reconciliation inputs and should inform owner-doc wording without becoming live product owners. The baseline references are `git-scm.com/docs/git-worktree` (`/docs/git-worktree`) for worktree behavior; official VS Code Source Control / Git / Worktrees docs for graph/history/worktrees/stash/conflict, staging, `/committing`, `/fetch/pull/push`, incoming `/outgoing`, merge-conflict inline actions, 3-way merge editor, Source Control Graph, Timeline/history, and multiple SCM providers; GitHub Actions official REST/docs and extension baselines for rerun/cancel/workflow, `Current Branch`, `Workflows`, `Settings`, environments/variables/secrets, and authoring assistance; Docker Docs, Container Tools, and Docker DX for Bake, Compose profiles, Docker Hub repositories, Docker Desktop images/volumes/Kubernetes, runtime/registry/compose/container management, and authoring/debugging; Kubernetes docs for `logs`, `exec`, `port-forward`, rollout status, `/logs/exec/port-forward/Helm/workload`, and project-focused apply/logs/exec/port-forward/Helm/workload flows; and JetBrains / GitLens / GitKraken-style SCM UX references for dense history/conflict/graph behavior.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/UI_Command_Catalog.md

### Secondary-doc precedence constraints

When feature-owner docs disagree, this Crosswalk records the owner precedence and secondary-doc constraints rather than letting consumer wording decide. `newtools.md` owns Docker and Actions doctor IDs plus result payload minima; `doctor.registry.auth` is a deprecated alias only for DockerHub-specific flows and the preferred visible ID is `doctor.dockerhub.auth.capability`. `usage-feature.md` owns `cost_usage` routing and `/deep-link/usage` identity behavior to canonical Usage/Ledger surfaces. Section15 owns stable `/workspace/thread/browser/dev-session` identities, while UI_Wiring_Rules and Wiring_Matrix own command wiring `/gating`; internal built-in command namespaces remain `/internal`. `/blocked` routing is owned by Contracts_V0 and the destination feature owners, so Crosswalk only routes the boundary instead of retyping blocked-state payloads locally. Source Control and Orchestrator wording must keep `safe point` distinct from `restore point`. Legacy `allowed_actions[]` is compatibility-only; canonical blocked and recovery payloads use ordered `allowed_action_ids[]`.
- HITL approval requests may use an explicit action-list vocabulary only where Contracts_V0 owns the request shape; blocked/recovery payloads stay on canonical action-id / `allowed_action_ids[]` naming so implementers do not guess between HITL and recovery fields.
- Secondary broad-pass constraints: chat and file-tree docs remain consumers of the legacy Git/GitHub model and must be reconciled alongside the feature-owner docs; `git*` and `actions*` remain built-in chat command namespaces; Docker/registry/Kubernetes operational identity is not owned by Multi-Account unless a later owner doc explicitly moves it; `/underdefined` UI-state contracts must be resolved in the named surface owner docs rather than by adding consumer-only state; prescriptive `recovery_options` or `recovery_options[]` wording must be retired in favor of `allowed_action_ids` and `allowed_action_ids[]`.

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md
