# Shard 005: High-level feature themes

Source: `Plans/newfeatures.md`

Source lines: L28-L53

Source SHA256: `650c584c11b8a7d3ab51ef077daee9de9a20a8308cb5876f1a531b243a404988`

---

## High-level feature themes
### 1. Orchestration and governance
- package-local governance through `Package Overseer`
- seam-level integration governance through `Seam Overseer`
- promotion, corroboration, concern, graph-patch, and recovery records as first-class governance/runtime objects

### 2. Runtime identity and provider behavior
- requested/effective runtime identity across personas, models, accounts, and execution roles
- multi-account switching with concrete account binding and durable switch/pressure history

### 3. UI and navigation
- tab-first Orchestrator
- worktree-first Source Control
- route/open primitives shared across chat, runtime, usage, artifacts, and orchestration
- the coherent left-panel `/product` model is MVP: Source Control, GitHub Actions, Docker Manager, Assistant/Chat, Files, Artifacts/Runtime, Usage, and Settings are first-class owner surfaces, not a bag of individually listed `/underdefined` pieces

### 3A. Workbench and feature-cluster lessons
- PM preserves the strongest competitive feature clusters as product requirements: visible plans `/tasks/artifacts/approval` state, multi-surface orchestration across editor, terminal, browser/preview, docs, and review, reusable diff/review pipelines with hunk-level actions instead of one-off compare UIs, project/framework autodetection, honest `/loading/indexing` and degraded state, durable tabs `/splits/workspace` recovery, `/reconnect/offline` resilience with explicit cache `/read-only/fallback` messaging, source-canonical rich previews, virtualized lazy file trees, background indexing/search, IME correctness, and skepticism toward demo-friendly thin-wrapper UIs.
- PM may learn breadth from file-heavy systems and runtime seams from delegated-backend `/container/control-plane` products, but it must not become a monolithic request layer or delegate core `/file-manager/diff/LSP`, editor, storage, routing, or shell ownership to an upstream IDE. A strong native Rust + Slint `/workbench` keeps file-manager operations as typed services with policy/error handling, treats remote/runtime orchestration as an explicit control-plane with `/bootstrap` diagnostics, and bounds any external editor/workbench interop as a subsystem rather than the hidden owner.

### 4. Recovery and historical truth
- blocked episodes as canonical recovery anchors
- graph generations retained as visible lineage
- historical runs distinct from superseded objects unless explicit lineage says otherwise

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md
