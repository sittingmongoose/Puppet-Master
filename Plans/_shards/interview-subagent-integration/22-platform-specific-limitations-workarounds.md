## Platform-Specific Limitations & Workarounds
### Cursor CLI

Cursor interview execution targets `cursor-agent` and inherits the same trust and profile-isolation rules as the rest of the CLI integration.

### Codex

PM interview execution does not require a Codex CLI MCP-server runtime. Codex in PM is a direct provider with `ChatGPT` and `API key` account rows.

### Claude Code CLI

Claude Code may support file-based and runtime-scoped agent facilities. PM still treats CLI-native subagent files as compatibility or delivery details beneath the PM-native skill/instruction model.

### GitHub Copilot

GitHub Copilot is a direct provider in PM. Premium-request or billing-entity requirements are handled through the same account-row plus entitlement-context model used elsewhere.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/FinalGUISpec.md
