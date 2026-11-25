# Shard 009: Summary Table

Source: `Plans/agent-rules-context.md`

Source lines: L112-L117

Source SHA256: `6b91d562302951c1829496351beef9881e2bdef842033d2c851c7dc913926863`

---

## Summary Table

| Layer        | Scope              | Stored at              | Fed when                          |
|-------------|--------------------|------------------------|-----------------------------------|
| Application | Every agent, everywhere | redb settings: (`settings` namespace key `app.agent_rules.application_markdown`) | Every orchestrator, interview, Assistant invocation |
| Project     | Every agent on that project | Project file: `.puppet-master/project-rules.md` | Every invocation that has a current project (orchestrator run, interview for project, Assistant with project selected) |
