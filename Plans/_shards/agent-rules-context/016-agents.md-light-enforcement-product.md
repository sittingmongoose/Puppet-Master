# Shard 016: AGENTS.md Light Enforcement (Product)

Source: `Plans/agent-rules-context.md`

Source lines: L260-L281

Source SHA256: `212cf76ee5e4a1c283b0d769c6a03a740e09169e4f0b29c03edfbf8d7c095c02`

---

## AGENTS.md Light Enforcement (Product)
### Authoring-time lint
When user edits AGENTS.md in Puppet Master:
- warn/error on:
- directory trees
- long command encyclopedias
- architecture tours
- redundant discoverable info
- enforce budgets (defaults may be decided in Plans/auto_decisions.jsonl per Plans/Decision_Policy.md):
- max bytes (e.g. 6–10KB)
- max lines (e.g. 80)
- max headings (e.g. 6)
### Runtime budget enforcement
Before a run:
- compute total instruction bytes + estimated tokens
- warn on threshold exceed
- if strict mode enabled: block run until reduced
- deterministic truncation policy:
- never truncate Work Bundle acceptance criteria
- truncate “examples/illustrative” sections first
- record truncation in run metadata and UI
---
