## Updated Considerations

1. **Subagent File Management:** 
   - Copy subagents from `.claude/agents/` to platform-specific locations
   - Maintain subagent files in project for team sharing
   - Handle platform-specific file format differences

2. **Platform Support:**
   - **Cursor:** `/subagent-name` syntax (broken in CLI as of Feb 2026, works in editor)
   - **Codex:** MCP server tools or natural language
   - **Claude Code:** `--agents` JSON flag or automatic file-based invocation
   - **Gemini:** Direct-provider model invocation (no CLI flags or local config files)
   - **GitHub Copilot:** `/fleet`, `/delegate`, or `/agent` commands

3. **Recent Changes (as of Feb 18, 2026):**
   - **Cursor 2.5 (Feb 17):** Async subagents, subagent trees, plugins marketplace
   - **Codex 0.104.0 (Feb 18):** Distinct approval IDs, thread archive notifications, websocket proxy support
   - **Claude Code 2.1.45 (Feb 17-18):** Agent Teams fixes, Sonnet 4.6 support, performance improvements
    - **Gemini:** Model catalog/capability availability may change; verify at implementation time
   - **Copilot 0.0.411 (Feb 17):** Fleets/autopilot available to all users, SDK APIs, memory improvements
   - **Note:** Versions are changing rapidly - verify latest versions before implementation

4. **Error Handling:**
   - Graceful fallback when subagents unavailable
   - Platform-specific error detection (e.g., Cursor CLI limitation)
   - Fallback to direct platform invocation without subagents

5. **Cost & Performance:**
   - Multiple subagent invocations increase token usage
   - Async subagents (Cursor 2.5) reduce latency
   - Platform-specific optimizations (e.g., Copilot fleets for parallel work)


