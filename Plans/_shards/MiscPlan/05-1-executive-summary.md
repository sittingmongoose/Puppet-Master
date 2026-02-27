## 1. Executive Summary

### Goals

- **Prevent clutter:** Avoid accumulation of agent-created docs, ad-hoc tests, build artifacts, and old test builds.
- **Align with REQUIREMENTS:** Implement the runner contract (`prepare_working_directory`, `cleanup_after_execution`) and "clean working directory" / "clean up temp files" behavior.
- **Keep evidence valuable:** Retain `.puppet-master/evidence/` and other state; only clean according to an explicit policy.
- **In scope:** Dedicated agent output directory; evidence retention/pruning; user-facing Cleanup UX (config toggles, "Clean workspace now," evidence retention settings).

### Non-Goals

- Deleting or ignoring `.puppet-master/evidence/` by default (evidence remains tracked).
- Changing gitignore to blanket `*.log` or ignoring `.puppet-master/`.

### Target-project DRY (interview-seeded)

Puppet Master uses the DRY method in its own codebase (AGENTS.md). **Target projects** (projects created or managed by Puppet Master) can use the same reuse-first approach: the **interview** can seed the target project's **AGENTS.md** when it generates that file at interview completion. Seeded content includes a **DRY Method** section and a **Technology & version constraints** (or "Stack conventions") section -- e.g. "always use React 18", "always use Pydantic v2" -- born from the interview (especially Architecture & Technology phase) and optionally from convention templates for well-known stacks. That gives all agents working on the target project (during orchestrator runs or later) clear guidelines: check for existing code and docs before adding new, tag reusable items, and keep a single source of truth for config and specs. **Keep generated AGENTS.md minimal:** it is loaded into agent context; long files consume context and get skimmed, so critical rules get missed. The Interview plan §5.1 specifies: critical-first block at top, size budget (~150-200 lines), linked docs for long reference, and two-tier structure. Implementation belongs in the Interview plan and in `agents_md_generator` (or equivalent); see **Plans/interview-subagent-integration.md** §5.1 (AGENTS.md content: DRY Method and minimality). That subsection also lists **gaps and improvements**: config default for `generate_initial_agents_md`, stack parameterization, preserving the DRY section when agents update AGENTS.md, projects created without the full interview, and overwrite vs. merge if AGENTS.md already exists.

---

