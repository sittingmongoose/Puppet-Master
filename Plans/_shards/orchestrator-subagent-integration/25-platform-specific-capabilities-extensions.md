## Platform-Specific Capabilities & Extensions

### Overview

Runtime integration is provider-first; transport varies by ProviderTransport (CLI-bridged, direct-provider, server-bridged). Platform capability work in this plan is limited to:
- native CLI features (flags, modes, output schemas)
- platform hook systems
- skills/plugins/extensions
- MCP connectivity

SDK orchestration is not an implementation target in this plan.

### Capability Surface by Platform

**Cursor**
- CLI modes (`--mode=plan|ask`), stream output, subagent/plugin/hook support where available.
- MCP usage and tool discovery via CLI-compatible paths.

**Codex**
- `codex exec` is the runtime invocation path.
- Optional `codex mcp-server` interop where it fits tool architecture.
- Hook/config behavior through CLI/config files only.

**Claude Code**
- `claude -p` and headless flags are the runtime invocation path.
- Agent files (`.claude/agents`) and hooks are consumed through CLI/runtime behavior.

**Gemini**
- Gemini is a Direct API provider; runtime invocation uses the Gemini API directly (not a CLI subprocess).
- Extension/hook surfaces are orchestrator-level only.

**GitHub Copilot**
- `copilot -p` (or `npx -y @github/copilot`) is the runtime invocation path.
- Skills/extensions and CLI flags only; no SDK invocation path.

