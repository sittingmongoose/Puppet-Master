## Testing Strategy

### Subagent File Management Tests
1. Test subagent discovery from `.claude/agents/`
2. Test copying to all platform-specific locations
3. Test YAML frontmatter parsing
4. Test handling missing or malformed subagent files

### Platform-Specific Invocation Tests
1. **Cursor:** Test `/subagent-name` syntax (expect failure in CLI)
2. **Codex:** Test MCP server tool invocation
3. **Claude Code:** Test both `--agents` flag and file-based invocation
4. **Gemini:** Test tool-based invocation with `enableAgents: true`
5. **Copilot:** Test `/fleet`, `/delegate`, and `/agent` commands

### Integration Tests
1. Test subagent invocation for each phase
2. Test fallback behavior when subagents unavailable
3. Test platform failover with subagent support
4. Measure performance impact of subagent invocations


