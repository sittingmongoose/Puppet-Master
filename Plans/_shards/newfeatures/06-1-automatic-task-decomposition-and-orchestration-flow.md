## 1. Automatic Task Decomposition and Orchestration Flow

### 1.1 Concept

A **session-level orchestration prompt** guides the agent through a consistent workflow: assess complexity → understand context → decompose into steps → act stepwise → verify. The behavior is injected via a system prompt (e.g. `--append-system-prompt` or equivalent per platform) so every run follows the same mental model without extra user commands.

- **Trivial tasks (1-2 steps):** Proceed directly; no planning overhead.
- **Complex tasks (3+ steps):** Explicit plan → execute → verify, with optional use of specialized "roles" (e.g. planner, implementer, reviewer).

### 1.2 Relevance to Puppet Master

We already have a four-tier hierarchy (Phase → Task → Subtask → Iteration) and verification gates. This idea complements that by:

- **Inside a single iteration:** Guiding the *agent's* internal process (plan → implement → verify) so each iteration is more likely to satisfy the gate on the first or second try.
- **Optional role hints:** Aligning with our subagent strategy (orchestrator/interview plans): the orchestration prompt could reference "planning" vs "implementation" vs "review" so the same tier can use different mental frames without changing tier structure.

### 1.3 Implementation Directions

- **Single source of orchestration text:** One canonical prompt (or a few variants: "minimal", "full", "interview") required to be maintained in the repo, referenced by the execution engine when building the CLI invocation.
- **Composition with rules pipeline:** When building the iteration or system prompt, inject content in this order: (1) **Application + project rules** from the single rules pipeline (**Plans/agent-rules-context.md**); (2) **Orchestration text** (assess → decompose → act → verify). never duplicate rule content in the orchestration prompt.

- **Platform compatibility:** Use only mechanisms each platform supports (e.g. `--append-system-prompt` where available; for others, prepend to the prompt or inject via a temp file). Keep this in `platform_specs` or a dedicated "orchestration" module. **Fallback when no append-system-prompt:** Prepend the combined block (rules + orchestration) to the user prompt, or use `--append-system-prompt-file` with a temp file if the platform supports file but not inline.
- **Configurable:** Settings (e.g. in GUI config) to enable/disable or choose "minimal" vs "full" orchestration so we can A/B test or reduce token use when not needed.
- **No new tiers:** This is about improving behavior *within* an iteration, not adding Phase/Task/Subtask/Iteration levels.

---

