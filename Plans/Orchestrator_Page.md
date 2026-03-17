# Orchestrator Page -- Single-Page 6-Tab Specification

## 1. Scope and canonical model
Orchestrator is the operational surface for the rewrite-era execution model.

Canonical execution/model rules:
- node graph is the canonical execution model
- `Feature Seam` and `Work Package` are first-class graph-owned objects
- `Node` is the smallest executable unit
- tiers/phases do not remain a co-equal execution model
- package and seam completion are distinct from runtime attempt completion

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Decision_Log.md

## 2. Page layout
Orchestrator remains tab-first.

Canonical tabs, in order, are:
- `Progress`
- `Seams`
- `Node Graph`
- `Evidence`
- `History`
- `Ledger`

Rules:
- `Progress` is widget-composed
- `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native tabs, not widget canvases
- cross-tab deep linking must preserve target object, project scope, run scope, and inspector focus

ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md

## 3. Progress tab
`Progress` is the operational dashboard for the current focused run.

It must surface at minimum:
- run header and focused-run identity
- package and seam summary widgets
- blocked/attention widgets
- concern summary widgets
- lane/worktree summary widgets
- projection-state badges when freshness/health is not `current` and `healthy`

Layout persistence uses app-default with project override.

Rules:
- layout scope is project-level, not run-level
- historical/current run switching does not silently swap widget arrangement
- widget filters inherit project and focused-run context; widgets do not choose their own run identity

ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md

## 4. Seams tab
`Seams` replaces `Tiers`.

The tab must present:
- seam list and seam detail
- package availability to seam
- seam-level integration state
- weak-integration concerns
- promotion state and corroboration state when relevant

Rules:
- `Locally Complete`, `Available to Seam`, and `Seam Complete` remain distinct
- weak integration includes runtime/GUI mismatch, workflow gaps, wiring problems, state/contract mismatch, and architecture drift
- seam completion is blocked when integration quality is insufficient even if packages are locally complete

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Glossary.md

## 5. Node Graph tab
`Node Graph` is the full graph/lineage surface.

It must provide:
- zoom, pan, minimap, focus, search, and overlays
- current generation emphasis with historical generation lineage retained and clickable
- right-side detail inspector
- evidence/artifact deep links
- blocked/recovery/promotion/corroboration visibility

Inspector detail must show at minimum:
- requested/effective provider/model/effort/persona/account behavior
- usage/token/cost info
- worker policy
- retry/review/promotion state
- lane/worktree/snapshot state
- evidence links

Rules:
- graph patch creates a new graph generation
- superseded and invalidated paths remain visible and clickable by default
- historical path visibility is preserved even when a new generation becomes current
- graph usability must hold at thousands of nodes through virtualization, demand loading, and lineage focus defaults

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

## 6. Evidence tab
`Evidence` is the evidence-first review surface.

The tab uses separate panes for:
- evidence records
- artifacts

Rules:
- evidence records and artifacts are related but not the same object family
- evidence/artifact opens from graph or history must route into Evidence with the correct object preselected
- stale or degraded projections must disclose trust state before mutating actions are offered

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

## 7. History tab
`History` is the chronological story of the run and its related runtime/governance events.

Rules:
- historical run does not imply superseded run
- unrelated runs inside one project remain unrelated unless explicit lineage metadata says otherwise
- cross-family historical overlays such as `historical`, `stale_historical`, `superseded`, `revoked`, `reopened`, `archived`, and `removed` must remain semantically distinct from family-local workflow states

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Glossary.md, ContractName:Plans/Decision_Policy.md

## 8. Ledger tab
`Ledger` is the exact record-inspection surface.

Rules:
- Ledger is distinct from History
- record envelopes remain canonical structured objects
- artifacts are linked payloads, not replacements for records
- concern, promotion, corroboration, graph patch, recovery, and review records must remain inspectable as first-class records

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Contracts_V0.md

## 9. Current vs historical run behavior
Orchestrator distinguishes:
- `active_run_id`
- `focused_run_id`
- historical run mode

Rules:
- the UI must not auto-yank focus away from a historical run merely because background live activity appears elsewhere
- historical-run views are read-heavy and must gate or disable live actions that require current runtime truth
- historical runtime identity and settings displays use frozen requested/effective values captured for that run

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

## 10. Search, routing, and action policy
Orchestrator search is object-first.

Searchable object families include:
- seams
- packages
- nodes
- lanes
- worktrees
- concerns
- promotions
- reviews
- corroboration results
- graph patches
- graph generations
- recovery objects
- runs

Rules:
- search results, command-palette opens, graph pivots, and attention-center opens resolve through canonical `route_target`
- route activation restores object scope, not just surface selection
- bulk navigation and triage are allowed; bulk live runtime mutation remains narrow and strongly gated

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Decision_Policy.md

## 11. Source Control boundary
Orchestrator owns package/seam/lane operational truth. Source Control owns compact worktree-first Git operations.

Rules:
- worktree path and branch are secondary identity in Orchestrator and primary identity in Source Control
- lane identity is human-readable in Orchestrator and historical even after a live worktree is archived or removed
- cleanup posture belongs to Orchestrator; concrete archive/prune/remove actions live in Source Control

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md

## 12. Concern and notification model
Concern is first-class.

Concern lifecycle is closed to:
- `active`
- `acknowledged`
- `resolved`
- `dismissed`

Rules:
- `acknowledged` is neither `resolved` nor `dismissed`
- blocked owner and concern owner are distinct concepts
- concern lineage must support merge, split, and supersession
- escalation uses execution impact, blocked owner, persistence, and projection state rather than severity alone

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Glossary.md
