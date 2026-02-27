## 19. Documentation Audience (AI Overseer)

- All **documentation and plans** produced by the **Interview** (PRD, AGENTS.md, requirements, phase plans, etc.) must be written with the understanding that an **AI agent** will execute them, not a human.
- **Implications:**
  - Instructions must be **unambiguous** and **wire-explicit**: every component, config key, and feature must be explicitly wired (e.g. "wire X to Y", "ensure Z is passed to the run config").
  - **DRY Method** must be enforced in generated content (single source of truth, no duplicated logic, tag reusable items). See Plans/interview-subagent-integration.md §5.1.
  - **No partially complete components:** Generated tasks and plans must call out **completeness**: ensure components are fully implemented and wired to the GUI/config/API as intended, and that nothing is "built but not wired" or left as a stub.
- **Interview plan:** The detailed requirements for "AI as Overseer", "wire everything together", and "no incomplete components" are specified in **Plans/interview-subagent-integration.md** §5.2 (Documentation and plans for AI execution). The interview prompt templates and document generators must include these requirements so generated PRD and AGENTS.md reduce unwired or incomplete work.

---

