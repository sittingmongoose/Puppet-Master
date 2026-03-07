## Testing Strategy

### Subagent File Management Tests
1. Test provider-native seed discovery/import from `.claude/agents/` (or equivalent source)
2. Test canonical Persona-store write/merge behavior, including protected-ID collision handling
3. Test optional export to platform-specific locations without changing canonical runtime selection
4. Test YAML/frontmatter parsing and malformed-file rejection

### Platform-Specific Invocation Tests
1. **Cursor:** Test `/subagent-name` syntax (expect failure in CLI)
2. **Codex:** Test MCP server tool invocation
3. **Claude Code:** Test both `--agents` flag and file-based invocation
4. **Gemini:** Test direct-provider model invocation; subagent orchestration remains internal
5. **Copilot:** Test `/fleet`, `/delegate`, and `/agent` commands

### Integration Tests
1. Test subagent invocation for each phase
2. Test fallback behavior when subagents unavailable
3. Test platform failover with subagent support
4. Measure performance impact of subagent invocations

### Interview lifecycle and artifact tests
1. Test adaptive `phase_plan` persistence/resume without re-running selector
2. Test `requirements-quality-reviewer` gating: PASS path, FAIL→attention_required path, and clarification resume path
3. Test staged artifact promotion rules for document generation + Multi-Pass `Accept | Reject | Edit`
4. Test runtime identity visibility: requested/effective Persona, provider/model, and skipped-control reasons appear in Interview chat + Agent Activity Pane
5. Test GUI-project output package includes `ui/wiring_matrix.json` and `ui/ui_command_catalog.json` only when `has_gui = true`, and omits them otherwise
6. Test `depends_on`-only plan generation (no `parallel_group`) and scheduler consumption


