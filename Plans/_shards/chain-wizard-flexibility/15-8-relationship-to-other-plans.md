## 8. Relationship to Other Plans

| Plan | Relevance |
|------|-----------|
| **REQUIREMENTS.md §5** | Start Chain steps: ingest requirements, PRD, plan, validate. This plan extends **ingest** (multiple uploads, Builder) and **how** we get to the chain (intent, project setup, fork/PR). |
| **Plans/newfeatures.md** | §4 Recovery (snapshot includes wizard step and intent). §8 Restore points (rollback to phase). §14 redb (resume interview). Intent and requirements handoff are new entry-point flexibility. |
| **Plans/assistant-chat-design.md** | Requirements Doc Builder **is** the Assistant chat with a specific handoff contract. Add subsection or reference: "Requirements Doc Builder: generate requirements and hand off to Chain/Interview." |
| **Plans/interview-subagent-integration.md** | Adaptive phases (§6) extend the interview: add "Phase selection and depth by intent and context." Subagents and phase assignments unchanged; only which phases run and depth. |
| **Plans/orchestrator-subagent-integration.md** | Config and tier config apply to runs started from any intent. No change to tier/subtask execution; only how we **enter** the flow (intent, requirements, project setup). |
| **Plans/Project_Output_Artifacts.md** | Single source of truth for required user-project artifacts under `.puppet-master/project/` (requirements, contracts, `plan.md`, sharded `plan_graph/`, acceptance manifest, and `auto_decisions.jsonl`) and canonical seglog persistence contract. |
| **Plans/agent-rules-context.md** | Application and project rules apply to Assistant (Builder), Interview, and orchestrator. Same rules pipeline for all. |
| **Plans/WorktreeGitImprovement.md** | Branch naming, PR creation, worktree lifecycle. Fork creation and "PR start/finish" are **additional** GUI and flow steps; reuse branch/PR tooling where possible. |
| **Plans/MiscPlan.md** | Git ignore, no secrets in PR body, cleanup allowlist. `.puppet-master/requirements/` (staging) and `.puppet-master/project/` (canonical outputs) must be allowlisted. |
| **Plans/usage-feature.md** | No direct change; usage tracking applies to Builder, Interview, and orchestrator runs as today. |
| **Plans/Provider_OpenCode.md** | OpenCode appears as a first-class provider in tier config. No wizard flow changes; provider selection is managed in Settings. |
| **Plans/newtools.md** | MCP and tools apply to Assistant and Interview; Builder can use same tool set. |

---

