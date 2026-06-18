# Shard 008: 2026-03-07 addendum — DockerHub / Unraid GUI requirements

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L99-L118

Source SHA256: `28ffe502125883e33ded97b18f62b1a8b17abff9800c4c44fa951a19b274591a`

---

## 2026-03-07 addendum — DockerHub / Unraid GUI requirements

| Requirement | Canonical expectation | Source |
|---|---|---|
| Source Control surface | Separate first-class Source Control surface with Changes, History, Graph, Worktrees, and Branches / Stash; not merged into GitHub Actions | `Plans/GitHub_Integration.md`, `Plans/WorktreeGitImprovement.md`, `Plans/FinalGUISpec.md` |
| GitHub Actions surface | Separate first-class GitHub Actions surface with Current Branch, Workflows, Settings, rerun/cancel/pin, and secrets/variables/environments CRUD | `Plans/GitHub_Integration.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/newtools.md` |
| Docker Manager visibility | Contextual Docker Manager surface shown for Docker-related projects, with `Hide Docker Manager when not used in Project.` defaulting to enabled; the older `Hide Docker Manage when not used in Project.` key is a migration alias only | `Plans/Containers_Registry_and_Unraid.md`, `Plans/FinalGUISpec.md` |
| Docker Manager breadth | Containers, images, compose, registries, build/bake, Publish / Unraid, networks/volumes/contexts, and project-focused Kubernetes | `Plans/Containers_Registry_and_Unraid.md`, `Plans/newtools.md` |
| DockerHub auth UX | Browser login plus PAT, requested-vs-effective capability display, and disabled-with-explanation controls when capability is partial | `Plans/Containers_Registry_and_Unraid.md`, `Plans/newtools.md` |
| Repo creation safety | Missing-repo creation is explicit, non-bypassable, and distinct from image-push approval | `Plans/Containers_Registry_and_Unraid.md`, `Plans/Permissions_System.md` |
| Orchestrator pivots | Orchestrator exposes `Open in Source Control`, `Open in GitHub Actions`, and `Open in Docker Manager` with preserved context | `Plans/Orchestrator_Page.md`, `Plans/UI_Command_Catalog.md` |
| Usage/Ledger linkage | cost-bearing receipts from these surfaces deep-link into canonical Usage/Ledger, not a feature-local cost view | `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md` |
| GitHub auth boundary | Git transport auth and GitHub API auth are separate; `github_api` tokens never transfer to SSH remotes, and GitHub API auth failure is a canonical blocked/runtime condition rather than a panel-local refresh | `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/GitHub_Integration.md`, `Plans/Permissions_System.md` |
| Actions readiness | Opening `GitHub Actions > Current Branch`, dispatch forms, `GitHub Actions > Settings`, workflow-file saves, branch/worktree changes, and secrets/variables/environments CRUD re-evaluate readiness; readiness is event-driven plus bounded refresh, not timer-only or manual-only, and stale snapshots cannot authorize Actions-gated Orchestrator steps | `Plans/GitHub_Integration.md`, `Plans/storage-plan.md`, `Plans/Orchestrator_Page.md` |
| Runtime payload lineage | Runtime-analysis exports, receipts, and artifacts reuse scheduler `/attempt/safe-point/remediation` identities and canonical route `/payload` shapes rather than feature-local receipt IDs; `docker_manage_surface_state` migrates into Docker Manager state, and runtime blocked payloads use `allowed_action_ids[]` rather than legacy `recovery_options[]` | `Plans/storage-plan.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/Containers_Registry_and_Unraid.md` |
| Container-runtime ownership | Docker Manager is the canonical `container-runtime` surface for Docker, Podman, Compose, Build / Bake, Registries, Publish / Unraid, and project-focused Kubernetes; a project is `container-related` when any of those owner inputs or persisted runtime receipts exist | `Plans/Containers_Registry_and_Unraid.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md

Stale checklist proof text is not a readiness signal. Checklist consumers must use the first-class `Source Control`, `GitHub Actions`, and `Docker Manager` surfaces; `Plans/Run_Graph_View.md`, `Plans/Orchestrator_Page.md`, and `Plans/GUI_Rebuild_Requirements_Checklist.md` are runtime consumers of those owner docs rather than alternate owners. Persona-related checklist references use canonical `requested_persona` and `effective_persona` naming from runtime contracts. Older generated-actions-settings, combined Git/GitHub, `Docker Manage`, and side-panel occupant lists are migration evidence only when they conflict with the accepted IA above.
