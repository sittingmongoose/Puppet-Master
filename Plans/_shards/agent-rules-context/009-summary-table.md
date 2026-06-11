# Shard 009: Summary Table

Source: `Plans/agent-rules-context.md`

Source lines: L112-L118

Source SHA256: `7815be0dff378aa826fab1ec2295a7c1e1f87c5580142922ed5b3c64a58698de`

---

## Summary Table

| Layer        | Scope              | Stored at              | Fed when                          |
|-------------|--------------------|------------------------|-----------------------------------|
| Application | Every agent, everywhere | redb settings: (`settings` namespace key `app.agent_rules.application_markdown`) | Every orchestrator, interview, Assistant invocation |
| Project     | Every agent on that project | Project file: `.puppet-master/project-rules.md` | Every invocation that has a current project (orchestrator run, interview for project, Assistant with project selected) |

