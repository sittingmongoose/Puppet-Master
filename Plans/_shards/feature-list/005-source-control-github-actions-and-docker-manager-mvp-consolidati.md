# Shard 005: Source Control, GitHub Actions, and Docker Manager MVP Consolidation Addendum (2026-03-12)

Source: `Plans/feature-list.md`

Source lines: L147-L179

Source SHA256: `c567abbd6374ff6d877069a5d884cf128670f0c146b34cc439f92ccdc03308cf`

---

## Source Control, GitHub Actions, and Docker Manager MVP Consolidation Addendum (2026-03-12)
This consolidation addendum defines the rewrite-era MVP for repository operations, CI visibility, and container/runtime management as coordinated first-class panels. Its goal is to expose lineage and operational pivots across source control, workflows, and containers without fragmenting state ownership or inventing panel-local recovery semantics.

**Key capabilities**
### GUI and views
- first-class `Source Control` side-panel surface with Changes, History, Graph, Worktrees, and Branches / Stash
- first-class `GitHub Actions` side-panel surface with Current Branch, Workflows, and Settings
- first-class `Docker Manager` side-panel surface with Containers, Images, Compose, Registries, Build / Bake, Publish / Unraid, and project-focused Kubernetes
- external `/current` reference research validates these as parity-plus feature families, not speculative extras: Source Control carries `/history/stash/merge-editor/worktree` expectations, GitHub Actions readiness is split into name/scope-based sub-capabilities, and Docker/Kubernetes scope is project-focused rather than cluster-administration.
- Source Control keeps `Worktrees` as the primary subview and `/object` list; lane-first is an overlay or filter when lane/package ownership is known, not the replacement object model.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md

### Orchestration and recovery
- run-to-repo lineage and worktree ownership surfaced across Orchestrator tabs
- `Run-to-repo lineage` remains a GUI cross-surface differentiator, not optional polish: Orchestrator run detail and history rows show `to-repo` pivots into Source Control, GitHub Actions, and Docker Manager `destination-panel` views so users can trace which worktree, branch, commits, PR, Actions runs, publish artifacts, `/deploy` outputs, and Operation receipts came from a given run or `/attempt`.
- run-to-workflow and workflow-to-diff correlation
- publish/runtime/template and Kubernetes rollout linkage surfaced in Orchestrator and Run Graph
- cross-surface `Open in Source Control`, `Open in GitHub Actions`, and `Open in Docker Manager` pivots

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md

### State and commands
- Source Control, GitHub Actions, and Docker Manager panel state persisted per project where applicable
- Run-to-repo lineage state includes lineage detail level, derived artifact category visibility, and retain-after-cleanup `/settings`; `/event/storage` receipt joins preserve SCM, Actions, publish, and Kubernetes identifiers across restarts, while partial chains remain visible with unresolved labels instead of hiding known lineage. `/disabled` fallback and `/tradeoffs` are explicit: lineage must survive cleanup and restarts without overclaiming incomplete joins.
- new canonical command families for Source Control, GitHub Actions, Docker Manager, and cross-surface pivots
- blocked-state and requested-vs-effective rules remain product-wide behavior, not panel-local polish

**Detailed spec:** `Plans/FinalGUISpec.md`, `Plans/GitHub_Integration.md`, [storage-plan](#storage-plan-ref)

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Decision_Policy.md

<a id="feature-runtime-scheduler-recovery"></a>
