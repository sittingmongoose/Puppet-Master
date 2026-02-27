## 18. BrainStorm Mode

- **Flow:** BrainStorm runs a **plan-style flow** (questions, research, debugging as needed) to form a **single plan**. Questions are **not** asked multiple times by multiple subagents; one coordinated Q&A/research phase, then the plan is formed.
- **Execution:** When the user **starts or executes** the plan, the **chat must switch to Agent mode** (execution mode), because Plan mode is read-only and execution requires write/execute permissions.
- **Who executes:** The plan can be executed by:
  - A **regular agent**,  
  - A **crew**, or  
  - **Agent + subagents**.  
  The **manager** (orchestrator) automatically decides, or the **user can request** which option.
- **Subagent collaboration:** During BrainStorm, subagents are **not** only handed the same static context. They must be able to **talk to each other** via the crew message board so they can debate, refine, and synthesize before the manager merges results.
- **Reference:** Align with Plans/orchestrator-subagent-integration.md (crews, subagent communication) and Plans/interview-subagent-integration.md where interview/plan flows are defined.

---

