# Shard 013: Visibility examples (coordinating run → work package → node → attempt)

Source: `Plans/agent-rules-context.md`

Source lines: L215-L236

Source SHA256: `2f36d282c3795dd66d65f8fa473693d2bce1447500c2fe32d789b3faba2ab603`

---

## Visibility examples (coordinating run → work package → node → attempt)
### Coordinating run sees
- Instruction: application/project rules plus the relevant scoped instruction chain
- Work: run and work-package objectives / acceptance criteria
- Memory: bounded summaries relevant to coordination, not every child attempt journal by default

### Work-package coordinator sees
- Instruction: application/project rules plus the applicable scoped instruction chain
- Work: work-package objectives / acceptance criteria
- Memory: package-level notes and summaries, not unrelated node-attempt journals

### Node execution sees
- Instruction: top-level plus the applicable scoped instruction chain
- Work: node objectives / acceptance criteria
- Memory: node-relevant memory only; coordinating summaries remain bounded

### Attempt execution sees
- Instruction: the same applicable instruction chain for the bound node scope
- Work: this attempt's exact objective + acceptance criteria
- Memory: latest attempt journal (if enabled) + parent summary (if enabled)
- Excludes: unrelated branches, long histories, and parent full reasoning by default
---
