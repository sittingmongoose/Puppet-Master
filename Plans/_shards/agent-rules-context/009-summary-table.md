# Shard 009: Summary Table

Source: `Plans/agent-rules-context.md`

Source lines: L112-L117

Source SHA256: `df94c7947ba59736a20e715bc53730b10aad790414d462c5e8308396164b06e9`

---

## Summary Table

| Layer        | Scope              | Stored at              | Fed when                          |
|-------------|--------------------|------------------------|-----------------------------------|
| Application | Every agent, everywhere | redb settings: (`settings` namespace key `app.agent_rules.application_markdown`) | Every orchestrator, interview, Assistant invocation |
| Project     | Every agent on that project | Project file: `.puppet-master/project-rules.md` | Every invocation that has a current project (orchestrator run, interview for project, Assistant with project selected) |
