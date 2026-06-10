# Shard 030: Platform-Specific Capabilities & Extensions

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L5533-L5575

Source SHA256: `989e16bf4f9fd579e5261d478721a3e5199742e4cba06fc0b8860f6b55d231cb`

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

**Gemini CLI**
- separate CLI-backed provider entry.
- may expose routing behavior that differs from the originally requested model.

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
