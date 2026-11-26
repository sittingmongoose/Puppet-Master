# Shard 001: Preamble

Source: `Plans/Tools.md`

Source lines: L1-L6

Source SHA256: `4d76adb4e7d9b71558b9e32c6338376b0e50826e314daf1bb4f40b63142cbc01`

---

# Adding Tool Support -- Research & Plan


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Scope:** This document lives in `Plans/` only. It is the **canonical plan for tool support**: built-in tools, custom tools, **MCP** (integration with the registry and permission model), and the permission model (allow/deny/ask), aligned with [OpenCode's Tools model](https://opencode.ai/docs/tools/). Per-platform MCP config paths and framework-specific testing tools are detailed in **Plans/newtools.md** and AGENTS.md, while live MCP naming/availability/auth-state canon is owned by **Plans/MCP_Integration.md**; this doc defines the tool set, permissions, provider routing, and how MCP fits in.
