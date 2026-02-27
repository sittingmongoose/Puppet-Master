## 15. Plan Mode + Crew Mode

- Plan mode produces a **plan + todo list**. Execution of that plan can be:
  - **Regular agent** (single agent),  
  - **Crew** (multi-agent coordination), or  
  - **Agent + subagents** (main agent plus specialized subagents).  
- The **manager/orchestrator** can automatically decide which execution strategy to use, or the **user can request** one (e.g. "execute with a crew", "use subagents for steps 2 and 3").  
- Implementation must allow:
  - Entering Plan mode, then choosing "execute with crew" (or similar) after the plan is ready.  
  - Entering Crew mode (or "use a crew") and having the crew work from an existing plan or from a new plan created in the same flow.  
- No conflicting assumptions: e.g. plan output format should be consumable by both single-agent and crew execution paths.

---

