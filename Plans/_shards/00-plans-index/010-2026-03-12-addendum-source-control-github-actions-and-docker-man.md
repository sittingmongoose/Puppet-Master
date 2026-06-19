# Shard 010: 2026-03-12 addendum — source control, GitHub Actions, and Docker Manager

Source: `Plans/00-plans-index.md`

Source lines: L567-L583

Source SHA256: `d42bfd587c7042c3f1c95cf698bc4929a5248121a6ca38977b46c0b166e9d573`

---

## 2026-03-12 addendum — source control, GitHub Actions, and Docker Manager

- `Plans/GitHub_Integration.md` now owns two distinct operational surfaces: Git-first Source Control and GitHub Actions.
- `Plans/WorktreeGitImprovement.md` remains canonical for worktree correctness and runtime alignment, but Source Control is the primary user-facing worktree surface.
- `Plans/Containers_Registry_and_Unraid.md` is the canonical owner for Docker Manager, including Publish / Unraid and project-focused Kubernetes placement.
- `Plans/newtools.md` remains canonical for Docker/Actions doctor and result minima and must be read alongside the feature-owner docs.
- `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Permissions_System.md`, and `Plans/usage-feature.md` are required anti-drift companions for this packet.

Restart-pass by-doc owner map:
- `Plans/FinalGUISpec.md` owns the activity-bar and side-panel vocabulary for Source Control, GitHub Actions, Docker Manager, cross-surface deep links, blocked-state presentation, and mirror/owner attention behavior.
- `Plans/GitHub_Integration.md` owns the Source Control versus GitHub Actions split, including GitHub Actions `Current Branch` / `Workflows` / `Settings`, secrets, variables, `/environments`, rerun/cancel/pin, and workflow authoring help. `Git (GitHub)` is retained only as a retired migration alias.
- `Plans/WorktreeGitImprovement.md` owns worktree-native Source Control details, including worktree inventory, compare/lineage/recovery, review mode, conflict assistant, and blocked-state handoff.
- `Plans/Containers_Registry_and_Unraid.md` owns Docker Manager operational subviews, `/auth/Unraid`, Publish / Unraid, Kubernetes placement, and the retirement of `Docker Manage` as a canonical surface name.
- `Plans/Orchestrator_Page.md` owns lane/run/package truth, Orchestrator receipts, run-blocking recovery pivots, and deep links into Source Control, GitHub Actions, Docker Manager, and Kubernetes owner surfaces.
- Highest `stale-canon` replacement risk for this source-control/GitHub Actions/Docker Manager sweep remains concentrated in `Plans/rewrite-tie-in-memo.md`, `Plans/usage-feature.md`, `Plans/FinalGUISpec.md`, and `Plans/Media_Generation_and_Capabilities.md`; reconcile those consumer docs against the feature owners above before treating older wording as authoritative.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md, ContractName:Plans/storage-plan.md
