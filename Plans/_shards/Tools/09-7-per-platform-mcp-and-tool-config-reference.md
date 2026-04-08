## 7. Per-platform MCP and tool config (reference)

Snapshot for implementation; re-verify with Doctor or platform docs at implementation time.

| Platform     | Project / workspace config       | User config                | Format | Tool-related CLI flags |
|-------------|-----------------------------------|----------------------------|--------|-------------------------|
| Cursor      | `.cursor/mcp.json`                | `~/.cursor/mcp.json`       | JSON   | MCP via config; non-interactive via `-p`, `--output-format` |
| Claude Code | `.mcp.json` (cwd)                 | `~/.claude.json`           | JSON   | `--allowedTools`, `--permission-mode`, `--max-turns` |
| Codex       | N/A (DirectApi; central MCP registry) | N/A                  | N/A    | (provider/tool boundary) |
| Gemini      | N/A (DirectApi; central MCP registry) | N/A                  | N/A    | (provider/tool boundary) |
| Copilot     | N/A (DirectApi; central MCP registry) | N/A                  | N/A    | (provider/tool boundary) |

- **Context7:** API key as `Authorization: Bearer <key>`; resolve via env/credential store and inject in-memory. Derived adapter config MUST contain no secrets.
- **Cited web search:** Prefer one MCP server (e.g. server slug `websearch-cited`, default tool name `websearch_cited`) registered centrally like Context7 when this historical integration path is still enabled. Derived adapters for `CliBridge` providers only. Tool results MUST normalize to the live web/provenance contracts owned by `Plans/Tools.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, and `Plans/assistant-chat-design.md` before reaching chat/interview/orchestrator consumers.

---

