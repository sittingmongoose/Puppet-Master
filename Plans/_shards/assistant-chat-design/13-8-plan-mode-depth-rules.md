## 8. Plan Mode Depth & Rules

### 8.1 Depth setting (Shallow / Regular / Deep)

- **Setting:** In chat, Plan mode has a depth control: **Shallow**, **Regular**, or **Deep**.
- **Effect:** Controls how many clarifying questions are asked and how long the agent researches before producing the plan.
  - **Shallow:** Fewer questions, shorter research.  
  - **Regular:** Default balance.  
  - **Deep:** More questions, longer research.
- **Scope:** Applies only to the Plan-mode flow (questions → research → plan + todo).

### 8.2 Plan mode rules

- **Clarifying questions:** Not optional. The plan flow **always** includes clarifying questions after the user's prompt before research and plan creation.
- **Add to queue:** **Not** available in regular Plan mode. "Add to orchestrator queue" is available in **Interview** mode (after interview completes) or in other explicitly defined flows, not as the default outcome of a standalone Plan-mode run.
- **Parallelization:** Always try to parallelize execution when possible (e.g. independent steps, subagents). User can **disable** parallelization in settings if desired.
- **Plan panel:** A **plan panel** stays visible in the chat (or adjacent) showing:
  - The **written plan** (narrative or structured).  
  - The **todo list** (steps/tasks), similar to Cursor's plan UI.  
- **Execution:** After the user approves the plan, execution runs via the same execution engine (fresh process per step; subagent selection per step when applicable).

---

