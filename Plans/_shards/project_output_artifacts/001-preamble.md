# Shard 001: Preamble

Source: `Plans/Project_Output_Artifacts.md`

Source lines: L1-L16

Source SHA256: `873ad4ab0fac4327e921959abc15ad6271f04bd544a04c7ca7ff4dc01ef5ac80`

---

# Puppet Master — User-Project Project Plan Package Outputs (SSOT)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


This document is the **canonical single source of truth (SSOT)** for the user-project **Project Plan Package** outputs produced by **Puppet Master** and staged under:

`.puppet-master/project/**`

It also defines:
- **seglog canonical persistence** for these artifacts (filesystem is staging/export/cache only)
- **DRY, contract-referenced plan graph** requirements (**sharded-only plan graph**; machine-runnable, headless) with an **optional, non-canonical** derived export for convenience.

> **Do not duplicate:** This file is the SSOT for artifact paths and sharding rules; other docs should link here instead of repeating them.

