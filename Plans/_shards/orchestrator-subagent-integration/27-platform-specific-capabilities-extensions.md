## Platform-Specific Capabilities & Extensions
### Platform capability overview

Platform capability handling is provider-first and uses three execution classes:
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

**OpenCode**
- server-bridged provider via managed or attached server profiles.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md
