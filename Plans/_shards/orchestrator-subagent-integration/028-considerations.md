# Shard 028: Considerations

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3549-L3556

Source SHA256: `a5ff69d2472c5d5935bc2f9da119c526ab5bbbf3d86eeff28e50426a28d98928`

---

## Considerations

1. **Performance:** Subagent detection should be cached, not recomputed every iteration
2. **Fallbacks:** Always have fallback subagents if detection fails
3. **Multiple Subagents:** Support parallel subagent invocation when appropriate
4. **Configuration Overrides:** Allow manual overrides for edge cases
5. **Language Detection:** Handle multi-language projects (e.g., Rust + TypeScript)
6. **Subagent Availability:** Check if subagent files exist before selection
