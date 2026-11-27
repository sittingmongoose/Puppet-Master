# Shard 010: DRY Summary

Source: `Plans/human-in-the-loop.md`

Source lines: L256-L260

Source SHA256: `97a7e70457d42fe62cdf5fb08e993d78a1c37728a82ed8a6a9763d4669f3df0f`

---

## DRY Summary

- **Display grouping labels:** Use Plans/orchestrator-subagent-integration.md for Phase/Task/Subtask presentation and verification labels; do not let those labels redefine package/seam gate or blocked-episode identity in this plan or in code.
- **HITL settings:** One config schema and one set of three booleans; GUI and orchestrator both read from that single source.
- **Verification order:** HITL runs when the relevant package/seam gate reaches its decision point after the configured grouping's verification work is complete; no new verification concept is introduced, only a blocked-episode approval step.
