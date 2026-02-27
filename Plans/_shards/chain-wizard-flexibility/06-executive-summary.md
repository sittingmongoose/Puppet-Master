## Executive Summary

The current Chain wizard and Interview flow assume a single path: **start a new project** (with an optional "existing project" toggle). That does not support users who want to **fork and evolve** a repo, **enhance/rewrite/add** to an existing project that is new to Puppet Master, or **contribute a feature and open a Pull Request**. This plan defines **intent-based workflows** so the wizard, Interview, and execution path adapt to what the user is trying to do. It also expands the requirements step (multiple uploads, Requirements Doc Builder via Assistant), makes the Interview phase set **adaptive** (AI decides what to cut or double down on), and strengthens Project setup and GitHub integration (create repo, offer to create fork or let the user do it, and guide PR start/finish for first-time contributors).

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

