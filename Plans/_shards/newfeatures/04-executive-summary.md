## Executive Summary

This plan captures a set of feature and architecture ideas that align with Puppet Master's goals: CLI-only orchestration, multi-platform support, tiered execution, and a native Rust desktop GUI (current implementation details may change; rewrite targets Slint per `Plans/rewrite-tie-in-memo.md`).

**Scope (§1-§22):**
- **§1-§14:** Core features -- orchestration flow, background/async agents, persistent rate limit, recovery, protocol normalization, plugins/skills, analytics, restore points, hooks, compaction, keyboard/command palette, stream visualization, bounded buffers, structured persistence.
- **§15:** Additional ideas -- branching, in-app instructions editor, @ mentions, stream timers, thinking toggle, MCP, project/session browser, mid-stream usage, multi-tab/window, virtualization, analytics framing, one-click install, IDE terminal/panes, hot reload, sound effects.
- **§16-§17:** Phasing, dependencies, and relationship to other plans (orchestrator, interview, FileSafe, usage-feature, agent-rules-context, human-in-the-loop, newtools, MiscPlan, WorktreeGitImprovement).
- **§18-§19:** Task status and technical mechanisms (single Rust process; no middle Node server -- see §17.5 and §19.1).
- **§20-§22:** HITL (full spec in human-in-the-loop.md), updating Puppet Master, cross-device sync.
- **§23:** Gaps and potential issues (architecture clarity, usage/ledger alignment, recovery/sync versioning, error handling, testing, accessibility).

**DRY:** All features must reuse single sources of truth: `platform_specs`, `docs/gui-widget-catalog.md`, the rules pipeline (agent-rules-context.md), usage state files (usage-feature.md), git/worktree/cleanup (MiscPlan, WorktreeGitImprovement), subagent registry, and MCP config (newtools §8). See §17.7.
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7


---

