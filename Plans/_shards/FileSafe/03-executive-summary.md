## Executive Summary

This plan covers **two pillars**: (1) **FileSafe** -- guards that block destructive operations before execution -- and (2) **context compilation and token efficiency** that reduce coordination overhead by compiling role-specific context and related optimizations.

### Part A -- FileSafe

1. **FileSafe: Command blocklist** -- Blocks destructive CLI commands (e.g. `migrate:fresh`, `db:drop`, `TRUNCATE TABLE`, `git reset --hard`, Docker volume prune) before they run.
2. **FileSafe: Write scope** -- Restricts writes to files declared in the active plan (no writes outside plan scope).
3. **FileSafe: Security filter** -- Blocks access to sensitive files (`.env`, credentials, keys).
4. **Prompt content checking** -- Scans prompts for destructive commands before sending to the platform CLI.
5. **Verification gate integration** -- Allows legitimate destructive operations when tagged as verification-gate or interview operations.

**Why critical:** Agents with shell access can accidentally run destructive commands, touch sensitive files, or write outside scope. FileSafe provides deterministic, platform-level protection regardless of agent behavior.

### Part B -- Context Compilation & Token Efficiency

6. **Role-Specific Context Compiler** -- Builds `.context-{role}.md` per agent role (Phase/Task/Subtask/Iteration) so each agent gets only the context it needs (e.g. phase goal, filtered requirements, conventions). Cuts coordination overhead by ~40-60% at scale.
7. **Delta Context** -- Adds a "Changed Files (Delta)" section with code slices from recently modified files so agents see what just changed.
8. **Context Cache** -- Caches the compiled context index so compilation is skipped when project files are unchanged.
9. **Structured Handoff Schemas** -- Typed JSON schemas for inter-agent messages (e.g. progress, blockers, QA results) for reliable parsing.
10. **Compaction-Aware Re-Reads** -- A deterministic marker indicates when plan/context re-read is needed, avoiding redundant full re-reads every task.
11. **Skill Bundling** -- Bundles skills referenced in the plan into the compiled context once per phase instead of per task.

**Why critical:** Context compilation and these features reduce token use and improve reliability where coordination and context size matter most (large projects, many phases).

**DRY compliance:** All reusable code is tagged with `DRY:FN:`, `DRY:DATA:`, `DRY:HELPER:`. Platform data uses `platform_specs::`. Widgets reuse components from `src/widgets/`.

---

