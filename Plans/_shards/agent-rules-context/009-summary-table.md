# Shard 009: Summary Table

Source: `Plans/agent-rules-context.md`

Source lines: L112-L117

Source SHA256: `64d60448dac0a023b529346f47bff671430f35b8ba26fe20f72985f21483a43e`

---

## Summary Table

| Layer        | Scope              | Stored at              | Fed when                          |
|-------------|--------------------|------------------------|-----------------------------------|
| Application | Every agent, everywhere | redb settings: (`settings` namespace key `app.agent_rules.application_markdown`) | Every orchestrator, interview, Assistant invocation |
| Project     | Every agent on that project | Project file: `.puppet-master/project-rules.md` | Every invocation that has a current project (orchestrator run, interview for project, Assistant with project selected) |
