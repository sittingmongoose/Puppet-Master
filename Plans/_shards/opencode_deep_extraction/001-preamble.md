# Shard 001: Preamble

Source: `Plans/OpenCode_Deep_Extraction.md`

Source lines: L1-L17

Source SHA256: `ce5ef845ef33f5e94499a41f3a92007360b822339b65f92544c51a5039e04014`

---

# OpenCode Deep Extraction (for Puppet Master)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

<!--
Purpose:
- Provide a deterministic, repeatable procedure for extracting **architecture-relevant** patterns from the OpenCode repo to inform Puppet Master plans and implementations.
- This document is not a design fork: Puppet Master remains governed by its own locked decisions; OpenCode is used as a reference implementation.
- Serves as the "known good baseline" that Puppet Master adopts, then modifies via delta hooks.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

---
