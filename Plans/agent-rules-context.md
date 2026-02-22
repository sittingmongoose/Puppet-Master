# Application- and Project-Level Agent Rules — Plan

## Plan Document Status

**This is a PLAN DOCUMENT ONLY** — No code changes have been made. This document contains:
- Two-tier rules model: Application (Puppet Master) level and Project level
- Where each is stored and how they are fed into every agent
- DRY: single rules pipeline consumed by orchestrator, interview, and Assistant

## Rewrite alignment (2026-02-21)

This rules model remains authoritative, and becomes more important under the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Providers, tool policy, and the agent loop should all consume the same **single rules pipeline** output
- “No API keys” is now “no API keys **except Gemini** (subscription-backed API key allowed)”
- OpenCode-style determinism means rules injection must be reproducible and represented in the unified event stream (seglog ledger) where relevant

## Executive Summary

Agents invoked by Puppet Master (orchestrator iterations, interview, Assistant) must receive **two layers of rules** so that global and project-specific policies are always applied:

1. **Application-level rules (Puppet Master)** — e.g. “Always use Context7 MCP.” Apply to **every agent, everywhere**. Stored and configured at the **application** (Puppet Master) level and injected into every agent invocation regardless of project.
2. **Project-level rules** — e.g. “Always use DRY Method.” Apply to **every agent that works on that project**. Stored at the **project** (target workspace) level and injected whenever the agent is operating in the context of that project.

Both layers are **fed into every agent** on every invocation (orchestrator iteration, interview turn, Assistant chat when attached to a project). Implementation uses a **single rules pipeline**: one place that gathers application rules + project rules (when a project is set) and returns a block to prepend or append to the prompt (or system prompt); all agent-invocation paths call that pipeline (DRY).

## Relationship to Other Plans

| Plan | Relevance |
|------|-----------|
| **Plans/orchestrator-subagent-integration.md** | Orchestrator builds iteration prompts and injects context (e.g. TierContextInjectorHook, coordination context). The **rules block** (application + project) must be included when building every iteration prompt or system prompt. Use the shared rules pipeline; do not duplicate rule content in the orchestrator. |
| **Plans/interview-subagent-integration.md** | Interview builds prompts for research, validation, and phase Q&A. Application rules always injected; project rules injected when the interview is run for a specific (target) project. Use the shared rules pipeline. |
| **Plans/assistant-chat-design.md** | Assistant chat sends context to the platform CLI. When the user is working in the context of a project, application rules + project rules must be included. When no project is selected, application rules only. Use the shared rules pipeline. |
| **AGENTS.md** | Today the Puppet Master repo’s AGENTS.md contains rules like “Always use Context7 MCP.” That content can be **one source** for default application rules (e.g. on first run or when no application rules file exists). Long term, application rules are a **configurable** list so the user can add/edit without editing AGENTS.md in the app repo. |

## Two-Tier Rules Model

### Application-Level Rules (Puppet Master)

- **Scope:** Every agent run under Puppet Master — orchestrator iterations, interview, Assistant (and any future agent-invoking flow).
- **Examples:** “Always use Context7 MCP,” “Prefer subscription auth; no API keys (explicit exception: Gemini API key may be used for subscription-backed access),” “Session ID format: PM-YYYY-MM-DD-HH-MM-SS-NNN.”
- **Purpose:** Global policies that must apply regardless of which project is selected or whether there is a project at all (e.g. Assistant in “no project” mode still gets application rules).
- **Storage:** At **application** (Puppet Master) level. Options (to be decided at implementation):
  - A dedicated **application rules** file (e.g. in app config dir or `.puppet-master/` at a well-known location used by the app), one rule per line or structured (e.g. YAML list).
  - Or a section in existing app config (e.g. `application_rules: ["Always use Context7 MCP", ...]`).
  - **Bootstrap:** If no application rules are configured, the app can seed from the Puppet Master repo’s AGENTS.md (e.g. critical-first block or a “canonical app rules” extract) so “Always use Context7 MCP” and similar are present by default.
  - **Rewrite alignment:** Application and project rules are part of **settings** in the redb schema (storage-plan.md). Implementation may store rules in redb (e.g. settings namespace or dedicated tables) and optionally export/import to files for compatibility; the rules pipeline should read from the same source the rest of the app uses for settings.
- **Editing:** Ideally configurable via GUI (e.g. Settings → Application rules: list or text area) and/or by editing the file; persisted so they survive restarts.

### Project-Level Rules

- **Scope:** Every agent that works on **that project** (target workspace). When the orchestrator runs against project P, when the interview is run for project P, or when the Assistant is used with project P selected, project P’s rules are included.
- **Examples:** “Always use DRY Method,” “Use Pydantic type hints v2.5.0,” “No blanket *.log in gitignore.”
- **Purpose:** Project-specific policies that every agent operating on that codebase must follow (style, tooling, conventions).
- **Storage:** At **project** (target workspace) level. Options (to be decided at implementation):
  - A file in the **project root** (e.g. `.puppet-master-rules.md` or `PROJECT_RULES.md`) or under the project’s `.puppet-master/` (e.g. `.puppet-master/project-rules.md` or `project_rules.yaml`). Single source of truth per project.
  - Optional: the interview or a future “project setup” flow can generate or seed this from project AGENTS.md or from user input, but the **runtime** source is this file (or equivalent) so project rules are explicit and editable.
- **Editing:** User edits the file in the project, or a GUI “Project rules” panel that reads/writes that file for the current project. No duplication: one file per project.

### Order and Combination

- When building the context sent to an agent:
  1. **Application rules** are always included first (so “always use Context7” and similar are never missed).
  2. **Project rules** are included when the current context has a **project** (workspace path). They follow application rules so project-specific overrides or additions are clear.
- No conflict resolution in the plan: both layers are additive. If a project rule contradicts an application rule, implementation can define precedence (e.g. application wins, or project wins for project-scoped topics); the plan only requires that both layers exist and are fed in.

## Feeding Rules Into Every Agent

### Single Rules Pipeline (DRY)

- **Concept:** One module or function that, given (optional) project path, returns a **single formatted block** of text: “Application rules” + “Project rules” (if project path is set and project rules exist). All callers use this block when building prompts or system prompts.
- **Signature (conceptual):** e.g. `get_agent_rules_context(application_config, project_path: Option<&Path>) -> String` or equivalent. Returns the concatenated rules block (with optional headers like “## Application rules” and “## Project rules” for clarity inside the prompt).
- **Callers:**
  - **Orchestrator:** When building the iteration prompt (or system prompt) for each phase/task/subtask/iteration, call the rules pipeline with the current workspace path; prepend or append the returned block to the prompt (or inject via existing mechanism like TierContextInjectorHook or a dedicated “rules injector” step).
  - **Interview:** When building any prompt that goes to an agent (research, validation, phase Q&A), call the rules pipeline with the interview’s target project path; include the block in the prompt.
  - **Assistant:** When the user has a project selected, call the rules pipeline with that project path and include the block in the context sent to the CLI. When no project is selected, call with `project_path: None` so only application rules are included.
- **DRY:** Rule content lives in one place per layer (application store, project file). The pipeline is the single place that assembles them; no copy-paste of “Context7” or “DRY” into multiple prompt builders.

### Where in the Prompt

- Rules can be injected as:
  - **System prompt / append-system-prompt:** If the platform supports it (e.g. `--append-system-prompt`), the rules block can be appended so the agent sees them as system-level instructions.
  - **Prepend to user prompt:** Or prepended to the main task prompt so they appear at the start of the user-visible context.
- Implementation chooses one or both; the plan only requires that **every** agent invocation receives the combined (application + project when applicable) rules block in a consistent way.

## Configuration and GUI (Planning Only)

- **Application rules:** Expose in GUI (e.g. Settings or Config → “Application rules” / “Puppet Master rules”): list or multi-line text. Save to the same store used by the rules pipeline (file or config). Tooltip or help: “These rules are fed to every agent run by Puppet Master (orchestrator, interview, Assistant).”
- **Project rules:** Expose when a project is selected (e.g. Project settings, or a “Project rules” tab/panel): multi-line text or list that reads/writes the project’s rules file. Tooltip: “These rules are fed to every agent that works on this project.”
- **Defaults:** Application rules can be seeded from Puppet Master’s AGENTS.md (or a curated subset) on first run or when the list is empty. Project rules can start empty and be filled by the user or by the interview when it generates project docs.

## Summary Table

| Layer        | Scope              | Stored at              | Fed when                          |
|-------------|--------------------|------------------------|-----------------------------------|
| Application | Every agent, everywhere | App config / app rules file | Every orchestrator, interview, Assistant invocation |
| Project     | Every agent on that project | Project file (e.g. `.puppet-master/project-rules.md`) | Every invocation that has a current project (orchestrator run, interview for project, Assistant with project selected) |

## Implementation Hooks (Planning Only)

1. **Define storage:** Choose format and path for application rules (e.g. `application_rules.yaml` in app config dir or a section in existing config). Choose format and path for project rules (e.g. `.puppet-master/project-rules.md` in target project).
2. **Rules pipeline:** Implement `get_agent_rules_context(app_config, project_path)` that loads application rules, optionally loads project rules when `project_path` is set, and returns a single formatted string. Use this in one place so all callers depend on it (DRY).
3. **Orchestrator:** When building iteration (or system) prompt, call the rules pipeline with the run’s workspace path; inject the returned block.
4. **Interview:** When building any agent prompt, call the rules pipeline with the interview’s target project path; inject the returned block.
5. **Assistant:** When building context for the chat CLI, call the rules pipeline with the current project path (or None); inject the returned block.
6. **GUI:** Add Application rules and Project rules (when project selected) to Settings/Config; persist and read via the same storage the rules pipeline uses.

---

*Document created for planning only; no code changes.*
