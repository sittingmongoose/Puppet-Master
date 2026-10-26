# Shard 032: Platform-Specific Capabilities & Extensions

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5667-L5713

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## Platform-Specific Capabilities & Extensions
### Platform capability overview

Platform capability handling is provider-first, is limited to PM-supported runtime surfaces, and uses three execution classes:
- direct providers
- CLI-bridged providers
- server-bridged providers

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Prompt_Pipeline.md

### Capability surface by platform

**Cursor CLI**
- `cursor-agent` is the execution runtime.
- PM-managed account roots and PM-derived MCP/instruction projections define the CLI boundary.

**Claude Code CLI**
- CLI-backed execution with subscriber, console/API, and SSO setup families.
- PM-native skill and MCP handling remains canonical.

**Gemini direct**
- direct API-key provider.
- runtime invocation is not a CLI subprocess.

**Antigravity CLI**
- active Google-owned CLI-runtime provider entry replacing Gemini CLI.
- may expose routing behavior that differs from the originally requested model; PM must record requested/effective model evidence from `agy` probes.

**Gemini CLI (retired/source-lineage only)**
- not an active provider entry.
- retained only to preserve stale source tokens and prevent accidental resurrection.

**Codex**
- direct provider with `ChatGPT` and `API key` account rows.
- no Codex CLI runtime requirement in this plan.

**GitHub Copilot**
- direct provider with billing/entity semantics beneath the auth-backed account row.
- no Copilot CLI runtime requirement in this plan.

**Direct coding-plan providers**
- `Alibaba coding-plan direct`, `Z.AI coding-plan direct`, and `MiniMax coding-plan direct` are day-one direct surfaces for orchestrator selection; PM consumes their requested/effective runtime and API-family facts from `Plans/Models_System.md` rather than treating them as OpenCode-only server entries.

**OpenCode**
- server-bridged provider via managed or attached server profiles.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md
