# Shard 026: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3541-L3548

Source SHA256: `fc1d16eb0b97f2c3c29472b847b9c3a022dffff1beea720b645391e162d5a356`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
