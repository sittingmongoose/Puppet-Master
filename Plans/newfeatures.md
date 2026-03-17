# New Features Implementation Plan

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
