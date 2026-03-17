## 7. Views Specification

### 7.1 Orchestrator
Orchestrator is the operational surface for rewrite-era execution.

Rules:
- Orchestrator remains tab-first with `Progress`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- only `Progress` is widget-composed
- `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native views

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Widget_System.md, ContractName:Plans/Crosswalk.md

### 7.2 Source Control
Source Control is a narrow, compact, worktree-first panel.

Rules:
- rows are concrete worktrees/branches/paths
- package, lane, and run context appear as metadata rather than as the primary grouping axis
- Git-native actions remain in Source Control, not in Orchestrator

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FileManager.md

### 7.3 Shared route and open behavior
Views consume the canonical navigation/source-open primitives.

Rules:
- routed opens resolve through `route_target`
- source opens resolve through `OpenSubject` or `OpenFile` as appropriate
- `resume_url` is serialized transport only and must not outgrow the canonical route contract
- shell realization such as docked/floating state, widths, and local panel layout remains shell state rather than route identity

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileManager.md, ContractName:Plans/Crosswalk.md

### 7.4 Settings and inspectors
Settings and inspectors separate:
- inherited / overridden
- requested
- effective
- honored / skipped / clamped

Rules:
- detailed runtime identity inspectors must show provider/model/persona/account and worker-policy requested/effective state
- compact surfaces may show only material deltas
- historical views use frozen captured state and do not recompute from current settings

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md

### 7.5 Project and attention surfaces
Project cards and the attention center consume project-summary and project-attention projections.

Rules:
- project cards surface activity, attention, and health separately
- blocked ownership is summarized by the strongest active item when one exists
- attention rows, palette opens, and cross-surface pivots resolve through the same internal route contract

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md
