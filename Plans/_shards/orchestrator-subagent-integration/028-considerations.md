# Shard 028: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3549-L3556

Source SHA256: `ba7d22d69bd91cf49e929a8d7c3e99252cf89c2ef429521f6e7205f0fc507df8`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
