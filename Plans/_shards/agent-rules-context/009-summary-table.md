# Shard 009: Summary Table

Source: `Plans/agent-rules-context.md`

Source lines: L112-L117

Source SHA256: `4678a9510ad12ec8ecb86b8035f2180b66caf762f79ad23e77d2f24722ff87a0`

---

## Summary Table

| Layer        | Scope              | Stored at              | Fed when                          |
|-------------|--------------------|------------------------|-----------------------------------|
| Application | Every agent, everywhere | redb settings: (`settings` namespace key `app.agent_rules.application_markdown`) | Every orchestrator, interview, Assistant invocation |
| Project     | Every agent on that project | Project file: `.puppet-master/project-rules.md` | Every invocation that has a current project (orchestrator run, interview for project, Assistant with project selected) |
