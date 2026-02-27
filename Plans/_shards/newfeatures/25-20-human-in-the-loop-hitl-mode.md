## 20. Human-in-the-Loop (HITL) Mode

**Full specification:** **Plans/human-in-the-loop.md**.

**Concept:** Optional pause at orchestrator tier boundaries (phase, task, subtask) for human validation. When enabled, the run completes all work in the current tier, then pauses until the user explicitly approves before proceeding. Three independent settings (phase / task / subtask), off by default. Useful for multi-phase work, stakeholder validation, and compliance checkpoints.

---

