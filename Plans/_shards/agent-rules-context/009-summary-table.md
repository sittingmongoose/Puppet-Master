# Shard 009: Summary Table

Source: `Plans/agent-rules-context.md`

Source lines: L112-L117

Source SHA256: `2f36d282c3795dd66d65f8fa473693d2bce1447500c2fe32d789b3faba2ab603`

---

## Summary Table

| Layer        | Scope              | Stored at              | Fed when                          |
|-------------|--------------------|------------------------|-----------------------------------|
| Application | Every agent, everywhere | redb settings: (`settings` namespace key `app.agent_rules.application_markdown`) | Every orchestrator, interview, Assistant invocation |
| Project     | Every agent on that project | Project file: `.puppet-master/project-rules.md` | Every invocation that has a current project (orchestrator run, interview for project, Assistant with project selected) |
