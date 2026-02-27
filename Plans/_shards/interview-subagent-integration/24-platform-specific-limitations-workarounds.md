## Platform-Specific Limitations & Workarounds

### Cursor CLI Limitation (Feb 2026)
**Issue:** `/subagent-name` syntax is currently broken in Cursor CLI (works in editor)
**Workaround Options:**
1. Use Cursor editor for subagent-enabled interviews
2. Fallback to direct platform invocation without subagents
3. Monitor Cursor releases for CLI fix


### Codex MCP Server Requirement
**Issue:** Codex subagents require MCP server mode
**Solution:**
- Detect if `codex mcp-server` is available
- Provide clear error message if MCP server not running
- Document MCP server setup in user guide

### Claude Code Dynamic vs File-Based
**Decision:** Support both methods
- Default to file-based (simpler, more reliable)
- Option to use `--agents` JSON flag for dynamic subagents
- Configuration option to choose method

