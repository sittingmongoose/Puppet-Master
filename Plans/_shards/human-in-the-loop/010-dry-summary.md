# Shard 010: DRY Summary

Source: `Plans/human-in-the-loop.md`

Source lines: L256-L260

Source SHA256: `9a1e98a6713f49fb21d5ee872176e6931760f952f4e30a255c4d2c8878314e2b`

---

## DRY Summary

- **Display grouping labels:** Use Plans/orchestrator-subagent-integration.md for Phase/Task/Subtask presentation and verification labels; do not let those labels redefine package/seam gate or blocked-episode identity in this plan or in code.
- **HITL settings:** One config schema and one set of three booleans; GUI and orchestrator both read from that single source.
- **Verification order:** HITL runs when the relevant package/seam gate reaches its decision point after the configured grouping's verification work is complete; no new verification concept is introduced, only a blocked-episode approval step.
