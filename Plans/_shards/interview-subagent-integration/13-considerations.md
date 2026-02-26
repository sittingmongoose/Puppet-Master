## Considerations

1. **Subagent Availability:** Ensure subagents are available in `.claude/agents/` or `.cursor/agents/`
2. **Platform Support:** Subagent invocation requires Cursor platform (agent command)
3. **Cost:** Multiple subagent invocations may increase token usage
4. **Latency:** Subagent invocations add latency to interview flow
5. **Error Handling:** Graceful fallback when subagents unavailable

