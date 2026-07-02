# Shard 006: Executive Summary

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L62-L80

Source SHA256: `fd1623b031dd532cc48b9c2453424830fcbf423cbaa175ffadd8d37b0daeeff3`

---

## Executive Summary

This legacy Chain Wizard and Interview flow assumed a single path: **start a new project** (with an optional "existing project" toggle). Its still-valid source-lineage material informs current PRD Builder intake, Planning Wizard planning, GitHub/source-control setup, and Final GUI routing only after those current owner docs accept the behavior. The current active UX is PRD Builder intake, dynamic PlanningRun topics, live topic/plan projections, audits/final integration, Approve And Build, and Orchestrator Plan Compile.

**Scope:**

- **§1-§2:** Intent-based workflows and how they affect the flow.
- **§3:** GUI updates: intent selection, requirements step redesign, project setup.
- **§4:** Requirements: multiple uploads, merge/canonical input, storage.
- **§5:** Requirements Doc Builder: Assistant chat generates requirements and hands off to Interview; **§5.6** Multi-Pass Review (optional review agent + N subagents, user approves revised doc).
- **§6:** Adaptive interview phases: AI selects and weights phases by intent and context.
- **§7:** Project setup and GitHub: create repo (name + fields); fork (offer to create or user does it); PR flow (start and finish).
- **§8:** Relationship to other plans.
- **§9:** Gaps and potential problems (each with a concrete **Resolution**).
- **§10:** Implementation Readiness Checklist (concrete items for an implementation plan).
- **§11:** User-project output artifacts (sharded-only canonical graph).
- **Change Summary:** Update record for sharded user-project output contracts.

**DRY:** Reuse `platform_specs`, `docs/gui-widget-catalog.md`, rules pipeline (agent-rules-context.md), git/worktree (WorktreeGitImprovement.md, MiscPlan), subagent registry (orchestrator/interview plans), and Assistant/Interview UI patterns (assistant-chat-design.md, interview-subagent-integration.md).
