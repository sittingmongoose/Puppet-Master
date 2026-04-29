# New Features Implementation Plan

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Worktree / SCM / Parallelism Impacts

#### Source target target-0612
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Worktree / SCM / Parallelism Impacts
- Exact required items represented:
  - Define lane↔worktree mapping
  - Specify contamination detection and cross-lane reuse rules
  - Define safe-point restore for lane/package context
  - Resolve [retired-token-2] vs [retired-token-1] contradiction
  - Register PM-managed worktrees in source control visibility
  - `Plans/feature-list.md`, `Plans/newfeatures.md`, `Plans/MiscPlan.md`
  - Plans/feature-list.md
  - Plans/newfeatures.md
  - Plans/MiscPlan.md
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - `Plans/newfeatures.md`
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `Plans/newfeatures.md` is also still mirroring older surface/runtime language:
  - `Plans/FinalGUISpec.md:2092` still references `restore points` through `Plans/newfeatures.md`
  - Plans/FinalGUISpec.md:2092
  - restore points
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Plan Document Status
This document remains a high-level feature summary and does not re-own orchestration canon.

## Rewrite alignment (2026-03-17)
The rewrite is aligned to these canonical decisions:
- node graph is the execution model
- `Feature Seam` and `Work Package` replace tiers as first-class orchestration objects
- runtime blocked identity replaces request-centric approval identity as canonical action scope
- shared requested/effective runtime identity spans assistant, interview, builders, overseers, and node workers
- `route_target` and `OpenSubject` are canonical navigation and identity-open primitives
- Source Control remains worktree-first while Orchestrator carries lane/package/seam operational context

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md

## Executive Summary
Puppet Master's rewrite-era feature set is organized around graph-native execution, stable runtime identity, durable lineage, and explicit cross-surface boundaries rather than around tier-era decomposition and request-centric recovery.

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

### 4. Recovery and historical truth
- blocked episodes as canonical recovery anchors
- graph generations retained as visible lineage
- historical runs distinct from superseded objects unless explicit lineage says otherwise

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

## 24. Browser preview and code-context integration

### 24.1 Built-in browser preview
The rewrite includes a built-in browser preview surface for live rendering of web content produced by the active project. This preview is part of the product's visual-debugging and UI-validation loop rather than a detached convenience viewer, so it must participate in shared navigation, evidence capture, and source-opening flows.

### 24.2 Relationship to Built-in Browser and Click-to-Context
The built-in browser preview provides live rendering of web content. Click-to-context allows users to click elements in the browser preview to navigate to the corresponding source code. This bridges the visual output and code representation by making rendered UI state, editable source, and assistant context part of the same troubleshooting and iteration loop instead of three separate tools.

Integration points:
- browser preview ↔ editor (`click-to-source`)
- browser preview ↔ chat (`screenshot-to-context`)
- browser DevTools ↔ debug mode (`DOM inspection as evidence`)

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Glossary.md

## Web tools, provider routing, and shared UI alignment addendum (2026-04-04)

The promoted rewrite feature set includes the repaired web/provider/question/planning canon rather than the earlier summarized placeholders.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Highlights:
- six canonical web operations plus native batch variants
- routing-aware provider disclosure and support-tier visibility
- shared question and TODO schemas across chat, widgets, storage, and delegated work
- distinct Mermaid and inline visualizer behavior
- four-step approval ladder and MCP owner-doc alignment
