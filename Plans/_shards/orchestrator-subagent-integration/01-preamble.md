# Orchestrator Subagent Integration -- Implementation Plan

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.
> **Integration policy note (2026-02-24):** Runtime integration follows the ProviderTransport taxonomy (SSOT: `Plans/Contracts_V0.md`): Cursor/Claude Code = `CliBridge`, Codex/Copilot/Gemini = `DirectApi`, OpenCode = `ServerBridge`. Any Codex/Copilot SDK references in this file are historical context only and are not implementation targets.


