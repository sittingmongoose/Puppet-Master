# Shard 001: Preamble

Source: `Plans/Tools.md`

Source lines: L1-L6

Source SHA256: `62ede04d56ef24109a9f2fb6e7c69f581a0da383eea3430a4239faac691622fd`

---

# Adding Tool Support -- Research & Plan


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Scope:** This document lives in `Plans/` only. It is the **canonical plan for tool support**: built-in tools, custom tools, **MCP** (integration with the registry and permission model), and the permission model (allow/deny/ask), aligned with [OpenCode's Tools model](https://opencode.ai/docs/tools/). Per-platform MCP config paths and framework-specific testing tools are detailed in **Plans/newtools.md** and AGENTS.md, while live MCP naming/availability/auth-state canon is owned by **Plans/MCP_Integration.md**; this doc defines the tool set, permissions, provider routing, and how MCP fits in.
